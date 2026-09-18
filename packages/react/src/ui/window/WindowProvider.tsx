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

export interface WindowState {
    rect: IRect;
    isMaximized: boolean;
    isDragging: boolean;
    isEntering: boolean;
    dragStart: Point;
    anchorRect: IRect;
}

type WindowProviderState = {
    state: WindowState;
    setState: Dispatch<SetStateAction<WindowState>>;
    container: HTMLDivElement | null;
    setContainer: Dispatch<SetStateAction<HTMLDivElement | null>>;
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
};

export const WindowProvider = ({
    children,
    anchorEl,
    edgeSpacing = { vertical: 10, horizontal: 10 },
    anchorOffset = { x: 0, y: 0 },
    anchorOrigin = { vertical: "top", horizontal: "left" },
}: WindowProviderProps) => {
    const [state, setState] = useState<WindowState>({
        rect: EMPTY_RECT,
        isMaximized: false,
        isDragging: false,
        isEntering: true,
        dragStart: { x: 0, y: 0 },
        anchorRect: EMPTY_RECT,
    });

    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    const rectsRef = useRef<{ container: IRect; anchor: IRect }>({
        container: EMPTY_RECT,
        anchor: EMPTY_RECT,
    });
    const oldRectRef = useRef<IRect>(EMPTY_RECT);

    const calculateAnchorPosition = useCallback(
        (width: number, height: number, aRect: IRect) => {
            const verticalOrigin = anchorOrigin.vertical ?? "top";
            const horizontalOrigin = anchorOrigin.horizontal ?? "left";
            const offsetX = anchorOffset.x ?? 0;
            const offsetY = anchorOffset.y ?? 0;
            const vSpacing = edgeSpacing.vertical ?? 10;
            const hSpacing = edgeSpacing.horizontal ?? 10;

            let { x, y, height: aHeight, width: aWidth } = aRect;

            // Horizontal position calculation
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

            // Vertical position calculation
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

            // Clamp right & bottom
            if (x + width + hSpacing > window.innerWidth) {
                x = window.innerWidth - width - hSpacing;
            }
            if (y + height + vSpacing > window.innerHeight) {
                y = window.innerHeight - height - vSpacing;
            }

            // Clamp top & left
            if (x < hSpacing) x = hSpacing;
            if (y < vSpacing) y = vSpacing;

            return { x, y };
        },
        [anchorOrigin, anchorOffset, edgeSpacing],
    );

    const updateRects = useCallback(() => {
        const rects = { ...rectsRef.current };

        if (anchorEl) {
            const { left, top, width, height } = anchorEl.getBoundingClientRect();
            rects.anchor = { x: left, y: top, width, height };
        }

        if (container) {
            const { width, height } = container.getBoundingClientRect();
            const { x, y } = calculateAnchorPosition(width, height, rects.anchor);
            rects.container = { x, y, width, height };
        }

        rectsRef.current = rects;
        oldRectRef.current = rects.container;

        setState((prev) => ({
            ...prev,
            anchorRect: rects.anchor,
            rect: rects.container,
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
            oldRectRef.current = state.rect;
            setState((prev) => ({
                ...prev,
                rect: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
            }));
        } else if (oldRectRef.current !== EMPTY_RECT) {
            setState((prev) => ({
                ...prev,
                rect: oldRectRef.current,
            }));
        }
    }, [state.isMaximized, state.isEntering]);

    // Sync maximized dimensions when window resizes
    useEffect(() => {
        if (!state.isMaximized) return;

        const handleResize = () => {
            setState((prev) => ({
                ...prev,
                rect: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
            }));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [state.isMaximized]);

    const value = useMemo(() => ({ state, setState, container, setContainer }), [state, container]);

    return <WindowProviderContext.Provider value={value}>{children}</WindowProviderContext.Provider>;
};

export const useWindowProvider = () => {
    const context = useContext(WindowProviderContext);
    if (!context) {
        throw new Error("useWindowProvider must be used within a WindowProvider");
    }
    return context;
};
