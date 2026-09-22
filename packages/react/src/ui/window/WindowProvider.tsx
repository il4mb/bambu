import Box from "@mui/material/Box";
import { debounce } from "lodash";
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
const DEFAULT_MIN_SIZE = { width: 300, height: 200 };
const DRAG_THRESHOLD_PX = 3;

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
    /** Begin a resize gesture (bottom-right corner) from the given pointer position. No-op while maximized or when `resizable` is false. */
    startResize: (clientX: number, clientY: number) => void;
    maximize: () => void;
    restore: () => void;
    toggleMaximize: () => void;
    close: () => void;
    /** Passthrough of the `resizable` prop, so consumers (e.g. the resize handle) don't need it re-declared. */
    resizable: boolean;
};

const WindowProviderContext = createContext<WindowProviderState | undefined>(undefined);

export type WindowProviderProps = {
    children?: ReactNode;
    anchorEl?: HTMLElement | null;
    edgeSpacing?: { vertical?: number; horizontal?: number };
    anchorOffset?: Point;
    anchorOrigin?: {
        vertical?: "top" | "center" | "bottom";
        horizontal?: "left" | "center" | "right";
    };
    /** Lower bound while resizing. Defaults to 300x200. */
    minSize?: Size;
    /** Upper bound while resizing. Defaults to the viewport size (minus edge spacing). */
    maxSize?: Size;
    /** Size to open the window at, overriding the measured content size. Still clamped to min/max size. Falls back to measuring `container` when omitted. */
    initialSize?: Size;
    /** Called when the header's close button (or `close()`) is used. The provider itself doesn't unmount anything. */
    onClose?: () => void;
    /** Whether the corner handle can drag-resize the window. Defaults to true. Doesn't affect maximize/viewport reflow. */
    resizable?: boolean;
};

export const WindowProvider = ({
    children,
    anchorEl,
    edgeSpacing = { vertical: 10, horizontal: 10 },
    anchorOffset = { x: 0, y: 0 },
    anchorOrigin = { vertical: "top", horizontal: "left" },
    minSize,
    maxSize,
    initialSize,
    onClose,
    resizable = true,
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

    const dragRef = useRef<{
        startClientX: number;
        startClientY: number;
        startRect: IRect;
        /** Rect/maximized state exactly as they were before this gesture began - restored on Escape. */
        originalRect: IRect;
        originalIsMaximized: boolean;
        wasMaximized: boolean;
        hasMoved: boolean;
    } | null>(null);
    const resizeRef = useRef<{
        startClientX: number;
        startClientY: number;
        startRect: IRect;
        originalRect: IRect;
        hasMoved: boolean;
    } | null>(null);

    const hasWindow = typeof window !== "undefined";
    const isInteracting = state.isDragging || state.isResizing;

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

    // Debounced trailing-edge flip of isEntering -> false. lodash's debounce
    // already coalesces rapid calls, so no extra "already scheduled" guard
    // is needed (a previous version carried one that was permanently dead -
    // it never actually got set, so the check was always a no-op).
    const exitEntering = useMemo(
        () =>
            debounce(() => {
                setState((prev) => (prev.isEntering ? { ...prev, isEntering: false } : prev));
            }, 0),
        [],
    );
    useEffect(() => () => exitEntering.cancel(), [exitEntering]);

    const updateRects = useCallback(() => {
        exitEntering.cancel();
        const rects = { ...rectsRef.current };

        rects.anchor =
            anchorEl && anchorEl.isConnected
                ? (() => {
                      const { left, top, width, height } = anchorEl.getBoundingClientRect();
                      return { x: left, y: top, width, height };
                  })()
                : EMPTY_RECT;

        if (container) {
            // `initialSize` overrides the measured content box; either way,
            // the result is still run through the same bounds the resize
            // gesture enforces, so the initial size can never open smaller
            // than minSize or larger than maxSize.
            let { width, height } = initialSize ?? container.getBoundingClientRect();
            const min = { ...DEFAULT_MIN_SIZE, ...minSize };
            const maxW = maxSize?.width ?? window.innerWidth - hSpacing * 2;
            const maxH = maxSize?.height ?? window.innerHeight - vSpacing * 2;
            width = Math.min(Math.max(width, min.width), maxW);
            height = Math.min(Math.max(height, min.height), maxH);
            const { x, y } = calculateAnchorPosition(width, height, rects.anchor);
            if (x + width + hSpacing > window.innerWidth) {
                width = window.innerWidth - x - hSpacing;
            }
            if (y + height + vSpacing > window.innerHeight) {
                height = window.innerHeight - y - vSpacing;
            }
            rects.container = { x, y, width, height };
        }

        rectsRef.current = rects;

        setState((prev) => ({
            ...prev,
            anchorRect: rects.anchor,
            rect: prev.isMaximized ? prev.rect : rects.container,
        }));
        exitEntering();
    }, [container, exitEntering, hSpacing, vSpacing, minSize, maxSize, initialSize, anchorEl, calculateAnchorPosition]);

    useLayoutEffect(() => {
        if (!container || !state.isEntering) return;
        updateRects();
    }, [container, state.isEntering, updateRects]);

    // Cancel any in-flight drag/resize before a maximize-state change so the
    // two mechanisms never fight over `rect` on the same tick.
    const cancelActiveGesture = useCallback(() => {
        dragRef.current = null;
        resizeRef.current = null;
    }, []);

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
            setState((prev) => {
                // If the state change was triggered by dragging, don't overwrite the dragging rect!
                if (prev.isDragging) return prev;
                return {
                    ...prev,
                    rect: savedRectRef.current as IRect,
                };
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isMaximized, state.isEntering, hasWindow]);

    // Keep dimensions in sync with the viewport while maximized, and keep a
    // normal (non-maximized) window from drifting off-screen after a resize.
    // This must run regardless of `resizable` - that flag only controls the
    // corner drag-resize gesture, not viewport reflow.
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
            dragRef.current = {
                startClientX: clientX,
                startClientY: clientY,
                startRect: baseRect,
                originalRect: state.rect,
                originalIsMaximized: state.isMaximized,
                wasMaximized: state.isMaximized,
                hasMoved: false,
            };
            setState((prev) => ({
                ...prev,
                dragStart: { x: clientX, y: clientY },
            }));
        },
        [state.isMaximized, state.rect],
    );

    // --- Resize gesture -------------------------------------------------
    const startResize = useCallback(
        (clientX: number, clientY: number) => {
            if (!resizable || state.isMaximized) return;
            resizeRef.current = {
                startClientX: clientX,
                startClientY: clientY,
                startRect: state.rect,
                originalRect: state.rect,
                hasMoved: false,
            };
            setState((prev) => ({ ...prev, isResizing: true }));
        },
        [resizable, state.isMaximized, state.rect],
    );

    useEffect(() => {
        if (!hasWindow) return;

        const endDrag = () => {
            dragRef.current = null;
            setState((prev) => (prev.isDragging ? { ...prev, isDragging: false } : prev));
        };
        const endResize = () => {
            resizeRef.current = null;
            setState((prev) => (prev.isResizing ? { ...prev, isResizing: false } : prev));
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (dragRef.current) {
                const { startClientX, startClientY, wasMaximized, hasMoved } = dragRef.current;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;

                // Enforce minimum movement threshold to ignore accidental clicks
                if (!hasMoved) {
                    if (Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;

                    dragRef.current.hasMoved = true;

                    // If we just popped out of maximized view, offset the startRect dynamically
                    // so the smaller window header stays roughly underneath the cursor.
                    if (wasMaximized) {
                        const ratioX = startClientX / window.innerWidth;
                        const newX = startClientX - dragRef.current.startRect.width * ratioX;
                        const newY = 0; // Assume header was glued to the top

                        dragRef.current.startRect = {
                            ...dragRef.current.startRect,
                            x: newX,
                            y: newY,
                        };
                    }
                }

                const { startRect } = dragRef.current;
                const { x, y } = clampToViewport(startRect.x + dx, startRect.y + dy, startRect.width, startRect.height);

                setState((prev) => ({
                    ...prev,
                    isDragging: true,
                    isMaximized: false,
                    rect: { ...prev.rect, ...startRect, x, y },
                }));
            } else if (resizeRef.current) {
                const { startClientX, startClientY, startRect, hasMoved } = resizeRef.current;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;

                if (!hasMoved) {
                    if (Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
                    resizeRef.current.hasMoved = true;
                }

                const min = { ...DEFAULT_MIN_SIZE, ...minSize };
                const maxW = maxSize?.width ?? window.innerWidth - hSpacing * 2;
                const maxH = maxSize?.height ?? window.innerHeight - vSpacing * 2;
                const width = Math.min(Math.max(startRect.width + dx, min.width), maxW);
                const height = Math.min(Math.max(startRect.height + dy, min.height), maxH);
                setState((prev) => ({ ...prev, rect: { ...prev.rect, width, height } }));
            }
            if (window.getSelection) {
                const selection = window.getSelection();
                if (selection) selection.removeAllRanges();
            }
        };

        const handlePointerUp = () => {
            if (dragRef.current) endDrag();
            if (resizeRef.current) endResize();
        };

        // Escape reverts to whatever the rect/maximized state was right
        // before the gesture started, rather than just freezing in place.
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (dragRef.current) {
                const { originalRect, originalIsMaximized } = dragRef.current;
                dragRef.current = null;
                setState((prev) => ({
                    ...prev,
                    isDragging: false,
                    isMaximized: originalIsMaximized,
                    rect: originalRect,
                }));
            }
            if (resizeRef.current) {
                const { originalRect } = resizeRef.current;
                resizeRef.current = null;
                setState((prev) => ({ ...prev, isResizing: false, rect: originalRect }));
            }
        };

        // If the tab loses focus mid-gesture (alt-tab, devtools, a native
        // dialog, etc.) pointerup may never fire. Without this the window
        // would be stuck "dragging" forever with the capture overlay stuck
        // on top of everything. Just stop tracking - not a full cancel,
        // since the user didn't ask to undo anything.
        const handleBlur = () => handlePointerUp();

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("blur", handleBlur);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("blur", handleBlur);
        };
    }, [hasWindow, clampToViewport, minSize, maxSize, hSpacing, vSpacing]);

    const maximize = useCallback(() => {
        cancelActiveGesture();
        setState((prev) => ({ ...prev, isDragging: false, isResizing: false, isMaximized: true }));
    }, [cancelActiveGesture]);

    const restore = useCallback(() => {
        cancelActiveGesture();
        setState((prev) => ({ ...prev, isDragging: false, isResizing: false, isMaximized: false }));
    }, [cancelActiveGesture]);

    const toggleMaximize = useCallback(() => {
        cancelActiveGesture();
        setState((prev) => ({ ...prev, isDragging: false, isResizing: false, isMaximized: !prev.isMaximized }));
    }, [cancelActiveGesture]);

    const close = useCallback(() => onClose?.(), [onClose]);

    const value = useMemo(
        () => ({
            state,
            setState,
            container,
            setContainer,
            startDrag,
            startResize,
            maximize,
            restore,
            toggleMaximize,
            close,
            resizable,
        }),
        [state, container, startDrag, startResize, maximize, restore, toggleMaximize, close, resizable],
    );

    return (
        <WindowProviderContext.Provider value={value}>
            {children}
            {isInteracting && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        zIndex: 9999,
                        cursor: state.isDragging ? "grabbing" : state.isResizing ? "nwse-resize" : "default",
                    }}
                />
            )}
        </WindowProviderContext.Provider>
    );
};

export const useWindowProvider = () => {
    const context = useContext(WindowProviderContext);
    if (!context) {
        throw new Error("useWindowProvider must be used within a WindowProvider");
    }
    return context;
};