import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useMemo,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect,
    Dispatch,
    SetStateAction,
} from "react";

const EMPTY_RECT: IRect = { x: 0, y: 0, width: 0, height: 0 };
const DEFAULT_MIN_SIZE = { width: 160, height: 90 };

export interface WindowState {
    rect: IRect;
    isMaximized: boolean;
    isDragging: boolean;
    isResizing: boolean;
    isEntering: boolean;
    dragStart: Point;
    anchorRect: IRect;
}

type WindowProviderState = {
    state: WindowState;
    setState: Dispatch<SetStateAction<WindowState>>;
    container: HTMLDivElement | null;
    setContainer: Dispatch<SetStateAction<HTMLDivElement | null>>;
    /** Begin a drag gesture from the given pointer position (viewport coords). Un-maximizes first if needed. */
    startDrag: (clientX: number, clientY: number) => void;
    /** Begin a resize gesture (bottom-right corner) from the given pointer position. No-op while maximized. */
    startResize: (clientX: number, clientY: number) => void;
    maximize: () => void;
    restore: () => void;
    toggleMaximize: () => void;
    close: () => void;
};

const WindowProviderContext = createContext<WindowProviderState | undefined>(undefined);

export type WindowProviderProps = {
    children?: ReactNode;
    anchorEl?: HTMLElement | null;
    edgeSpacing?: { vertical?: number; horizontal?: number };
    anchorOffset?: {
        x?: number;
        y?: number;
    };
    anchorOrigin?: {
        vertical?: "top" | "center" | "bottom";
        horizontal?: "left" | "center" | "right";
    };
    /** Lower bound while resizing. Defaults to 160x90. */
    minSize?: { width?: number; height?: number };
    /** Upper bound while resizing. Defaults to the viewport size (minus edge spacing). */
    maxSize?: { width?: number; height?: number };
    /** Called when the header's close button (or `close()`) is used. The provider itself doesn't unmount anything. */
    onClose?: () => void;
};

export const WindowProvider = ({
    children,
    anchorEl,
    edgeSpacing = { vertical: 10, horizontal: 10 },
    anchorOffset = { x: 0, y: 0 },
    anchorOrigin = { vertical: "top", horizontal: "left" },
    minSize,
    maxSize,
    onClose,
}: WindowProviderProps) => {
    const [state, setState] = useState<WindowState>({
        rect: EMPTY_RECT,
        isMaximized: false,
        isDragging: false,
        isResizing: false,
        isEntering: true,
        dragStart: { x: 0, y: 0 },
        anchorRect: EMPTY_RECT,
    });

    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    const rectsRef = useRef<{ container: IRect; anchor: IRect }>({
        container: EMPTY_RECT,
        anchor: EMPTY_RECT,
    });
    // Explicit flag instead of comparing against EMPTY_RECT by reference -
    // more robust against future refactors that might clone/freeze it.
    const savedRectRef = useRef<IRect | null>(null);
    const dragRef = useRef<{ startClientX: number; startClientY: number; startRect: IRect } | null>(null);
    const resizeRef = useRef<{ startClientX: number; startClientY: number; startRect: IRect } | null>(null);

    const hasWindow = typeof window !== "undefined";

    const vSpacing = edgeSpacing.vertical ?? 10;
    const hSpacing = edgeSpacing.horizontal ?? 10;

    const clampToViewport = useCallback(
        (x: number, y: number, width: number, height: number) => {
            if (!hasWindow) return { x, y };
            let nx = x;
            let ny = y;
            if (nx + width + hSpacing > window.innerWidth) nx = window.innerWidth - width - hSpacing;
            if (ny + height + vSpacing > window.innerHeight) ny = window.innerHeight - height - vSpacing;
            if (nx < hSpacing) nx = hSpacing;
            if (ny < vSpacing) ny = vSpacing;
            return { x: nx, y: ny };
        },
        [hasWindow, hSpacing, vSpacing],
    );

    const calculateAnchorPosition = useCallback(
        (width: number, height: number, aRect: IRect) => {
            const verticalOrigin = anchorOrigin.vertical ?? "top";
            const horizontalOrigin = anchorOrigin.horizontal ?? "left";
            const offsetX = anchorOffset.x ?? 0;
            const offsetY = anchorOffset.y ?? 0;

            let { x, y, height: aHeight, width: aWidth } = aRect;

            switch (horizontalOrigin) {
                case "center":
                    x += aWidth / 2 - width / 2;
                    break;
                case "right":
                    x += aWidth - width;
                    break;
                case "left":
                default:
                    break;
            }

            switch (verticalOrigin) {
                case "top":
                    y -= height;
                    break;
                case "center":
                    y += aHeight / 2 - height / 2;
                    break;
                case "bottom":
                default:
                    y += aHeight;
                    break;
            }

            x += offsetX;
            y += offsetY;

            return clampToViewport(x, y, width, height);
        },
        [anchorOrigin, anchorOffset, clampToViewport],
    );

    const updateRects = useCallback(() => {
        const rects = { ...rectsRef.current };

        rects.anchor = anchorEl && anchorEl.isConnected
            ? (() => {
                  const { left, top, width, height } = anchorEl.getBoundingClientRect();
                  return { x: left, y: top, width, height };
              })()
            : EMPTY_RECT;

        if (container) {
            const { width, height } = container.getBoundingClientRect();
            const { x, y } = calculateAnchorPosition(width, height, rects.anchor);
            rects.container = { x, y, width, height };
        }

        rectsRef.current = rects;

        setState((prev) => ({
            ...prev,
            anchorRect: rects.anchor,
            // Don't clobber an intentional fullscreen layout with the
            // anchor-derived one (e.g. anchorEl moving while maximized).
            rect: prev.isMaximized ? prev.rect : rects.container,
            isEntering: false,
        }));
    }, [container, anchorEl, calculateAnchorPosition]);

    // Calculate position once container and anchor elements are mounted
    useLayoutEffect(() => {
        if (!container || !state.isEntering) return;
        updateRects();
    }, [container, state.isEntering, updateRects]);

    // Handle window maximize and restore toggles
    useEffect(() => {
        if (state.isEntering) return;

        if (state.isMaximized) {
            savedRectRef.current = state.rect;
            if (!hasWindow) return;
            setState((prev) => ({
                ...prev,
                rect: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
            }));
        } else if (savedRectRef.current) {
            setState((prev) => ({
                ...prev,
                rect: savedRectRef.current as IRect,
            }));
            savedRectRef.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isMaximized, state.isEntering, hasWindow]);

    // Keep dimensions in sync with the viewport while maximized, and keep a
    // normal (non-maximized) window from drifting off-screen after a resize.
    useEffect(() => {
        if (!hasWindow || state.isEntering) return;

        const handleResize = () => {
            setState((prev) => {
                if (prev.isMaximized) {
                    return { ...prev, rect: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight } };
                }
                if (prev.isDragging || prev.isResizing) return prev;
                const { x, y } = clampToViewport(prev.rect.x, prev.rect.y, prev.rect.width, prev.rect.height);
                if (x === prev.rect.x && y === prev.rect.y) return prev;
                return { ...prev, rect: { ...prev.rect, x, y } };
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [hasWindow, state.isEntering, clampToViewport]);

    useEffect(() => {
        setState((prev) => ({ ...prev, isEntering: true }));
    }, [anchorEl]);

    // --- Drag gesture -------------------------------------------------
    const startDrag = useCallback(
        (clientX: number, clientY: number) => {
            const baseRect = state.isMaximized && savedRectRef.current ? savedRectRef.current : state.rect;
            dragRef.current = { startClientX: clientX, startClientY: clientY, startRect: baseRect };
            setState((prev) => ({
                ...prev,
                isMaximized: false,
                isDragging: true,
                dragStart: { x: clientX, y: clientY },
                rect: baseRect,
            }));
        },
        [state.isMaximized, state.rect],
    );

    // --- Resize gesture -------------------------------------------------
    const startResize = useCallback(
        (clientX: number, clientY: number) => {
            if (state.isMaximized) return;
            resizeRef.current = { startClientX: clientX, startClientY: clientY, startRect: state.rect };
            setState((prev) => ({ ...prev, isResizing: true }));
        },
        [state.isMaximized, state.rect],
    );

    useEffect(() => {
        if (!hasWindow) return;

        const handlePointerMove = (e: PointerEvent) => {
            if (dragRef.current) {
                const { startClientX, startClientY, startRect } = dragRef.current;
                const { x, y } = clampToViewport(
                    startRect.x + (e.clientX - startClientX),
                    startRect.y + (e.clientY - startClientY),
                    startRect.width,
                    startRect.height,
                );
                setState((prev) => ({ ...prev, rect: { ...prev.rect, x, y } }));
            } else if (resizeRef.current) {
                const { startClientX, startClientY, startRect } = resizeRef.current;
                const min = { ...DEFAULT_MIN_SIZE, ...minSize };
                const maxW = maxSize?.width ?? window.innerWidth - hSpacing * 2;
                const maxH = maxSize?.height ?? window.innerHeight - vSpacing * 2;
                const width = Math.min(Math.max(startRect.width + (e.clientX - startClientX), min.width), maxW);
                const height = Math.min(Math.max(startRect.height + (e.clientY - startClientY), min.height), maxH);
                setState((prev) => ({ ...prev, rect: { ...prev.rect, width, height } }));
            }
        };

        const handlePointerUp = () => {
            if (dragRef.current) {
                dragRef.current = null;
                setState((prev) => ({ ...prev, isDragging: false }));
            }
            if (resizeRef.current) {
                resizeRef.current = null;
                setState((prev) => ({ ...prev, isResizing: false }));
            }
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        };
    }, [hasWindow, clampToViewport, minSize, maxSize, hSpacing, vSpacing]);

    const maximize = useCallback(() => setState((prev) => ({ ...prev, isMaximized: true })), []);
    const restore = useCallback(() => setState((prev) => ({ ...prev, isMaximized: false })), []);
    const toggleMaximize = useCallback(() => setState((prev) => ({ ...prev, isMaximized: !prev.isMaximized })), []);
    const close = useCallback(() => onClose?.(), [onClose]);

    const value = useMemo(
        () => ({ state, setState, container, setContainer, startDrag, startResize, maximize, restore, toggleMaximize, close }),
        [state, container, startDrag, startResize, maximize, restore, toggleMaximize, close],
    );

    return <WindowProviderContext.Provider value={value}>{children}</WindowProviderContext.Provider>;
};

export const useWindowProvider = () => {
    const context = useContext(WindowProviderContext);
    if (!context) {
        throw new Error("useWindowProvider must be used within a WindowProvider");
    }
    return context;
};