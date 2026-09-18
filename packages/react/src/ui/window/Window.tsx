import { createPortal } from "react-dom";
import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { styled } from "@mui/material";
import WindowedHeader, { WindowHeaderProps } from "./WindowHeader";
import { WindowProvider } from "./WindowProvider";
import WindowContainer from "./WindowContainer";

type WindowedProps = {
    open: boolean;
    anchorEl?: HTMLElement;
    onClose?: (e: React.MouseEvent<HTMLDivElement>) => void;
    children?: ReactNode;
    edgeSpacing?: { vertical?: number; horizontal?: number };
    anchorOffset?: {
        x?: number;
        y?: number;
    };
    anchorOrigin?: {
        vertical?: "top" | "center" | "bottom";
        horizontal?: "left" | "center" | "right";
    };
    slotProps?: {
        header?: Partial<WindowHeaderProps>;
    };
};

export default function Windowed({
    open,
    anchorEl,
    onClose,
    children,
    anchorOrigin = {},
    anchorOffset = {},
    edgeSpacing = { vertical: 10, horizontal: 10 },
    slotProps = {},
}: WindowedProps) {
    // const [container, setContainer] = useState<HTMLDivElement | null>(null);
    // const [cRect, setCRect] = useState<DOMRect | undefined>();
    // const [aRect, setARect] = useState<DOMRect | undefined>();

    // const updateContainerRect = useCallback(() => {
    //     if (!container) return;
    //     setCRect(container.getBoundingClientRect());
    // }, [container]);

    // const updateAnchorRect = useCallback(() => {
    //     if (!anchorEl) return;
    //     setARect(anchorEl.getBoundingClientRect());
    // }, [anchorEl]);

    // const updateRects = useCallback(() => {
    //     updateContainerRect();
    //     updateAnchorRect();
    // }, [updateAnchorRect, updateContainerRect]);

    // useLayoutEffect(() => {
    //     if (!open || !anchorEl || !container) return;
    //     updateRects();
    // }, [open, anchorEl, container, updateRects]);

    // useEffect(() => {
    //     if (!open) return;
    //     window.addEventListener("resize", updateRects);
    //     window.addEventListener("scroll", updateRects, true);
    //     return () => {
    //         window.removeEventListener("resize", updateRects);
    //         window.removeEventListener("scroll", updateRects, true);
    //     };
    // }, [updateRects, open]);

    // const anchor = useMemo(() => {
    //     if (!aRect) return { x: 0, y: 0 };
    //     const origin = { vertical: "bottom", horizontal: "left", ...anchorOrigin };
    //     const offset = { x: 0, y: 0, ...anchorOffset };

    //     let { x, y, height: aHeight, width: aWidth } = aRect;

    //     // Safely fallback to 0 if the container hasn't measured its rect yet
    //     const cWidth = cRect?.width || 0;
    //     const cHeight = cRect?.height || 0;

    //     // Calculate Horizontal Alignment
    //     switch (origin.horizontal) {
    //         case "center":
    //             x += aWidth / 2 - cWidth / 2;
    //             break;
    //         case "right":
    //             x += aWidth - cWidth;
    //             break;
    //         case "left":
    //         default:
    //             // x remains the left edge of the anchor
    //             break;
    //     }

    //     // Calculate Vertical Alignment
    //     switch (origin.vertical) {
    //         case "top":
    //             y -= cHeight;
    //             break;
    //         case "center":
    //             y += aHeight / 2 - cHeight / 2;
    //             break;
    //         case "bottom":
    //         default:
    //             y += aHeight;
    //             break;
    //     }

    //     x += offset.x;
    //     y += offset.y;

    //     if (x + cWidth + windowInset.horizontal > window.innerWidth) {
    //         x = window.innerWidth - cWidth - windowInset.horizontal;
    //     }
    //     if (y + cHeight + windowInset.vertical > window.innerHeight) {
    //         y = window.innerHeight - cHeight - windowInset.vertical;
    //     }

    //     return { x, y };
    // }, [cRect, aRect, anchorOrigin, anchorOffset]);

    // useEffect(() => {
    //     if (!open) return;
    //     const handleClickOutside = (event: MouseEvent) => {
    //         event.stopPropagation();
    //         if (container && !container.contains(event.target as Node)) {
    //             onClose?.(event as unknown as React.MouseEvent<HTMLDivElement>);
    //         }
    //     };

    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, [container, onClose, open]);

    if (!open) return null;

    return createPortal(
        <WindowProvider
            anchorEl={anchorEl}
            anchorOrigin={anchorOrigin}
            anchorOffset={anchorOffset}
            edgeSpacing={edgeSpacing}
        >
            <WindowContainer>{children}</WindowContainer>
        </WindowProvider>,
        document.body,
    );
}
