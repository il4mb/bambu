import { Box } from "@mui/material";
import { createPortal } from "react-dom";
import { Fragment, ReactNode, useCallback, useEffect, useLayoutEffect, useState } from "react";
import Overlay from "./Overlay";

export interface PopupProps {
    children?: ReactNode;
    anchor?: HTMLElement | null;
    open: boolean;
    onClose?: () => void;
}

export default function Popup({ children, anchor, open, onClose }: PopupProps) {
    const [element, setElement] = useState<HTMLElement>();
    const [popupSize, setPopupSize] = useState({ width: 0, height: 0 });
    const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const updateAnchorRect = useCallback(() => {
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        setAnchorRect({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
        });
    }, [anchor]);

    // ---- Update anchor rect when open or anchor changes ----
    useLayoutEffect(() => {
        if (open && anchor) {
            updateAnchorRect();
        }
    }, [open, anchor, updateAnchorRect]);

    // ---- Listen to scroll and resize ----
    useEffect(() => {
        if (!open || !anchor) return;

        const handleUpdate = () => updateAnchorRect();

        const scrollParents: Element[] = [];
        let parent = anchor.parentElement;
        while (parent) {
            const style = window.getComputedStyle(parent);
            if (style.overflowY === "scroll" || style.overflowY === "auto") {
                scrollParents.push(parent);
                parent.addEventListener("scroll", handleUpdate);
            }
            parent = parent.parentElement;
        }

        window.addEventListener("resize", handleUpdate);
        window.addEventListener("scroll", handleUpdate, true);

        return () => {
            scrollParents.forEach((el) => el.removeEventListener("scroll", handleUpdate));
            window.removeEventListener("resize", handleUpdate);
            window.removeEventListener("scroll", handleUpdate, true);
        };
    }, [open, anchor, updateAnchorRect]);

    // ---- Observe popup size ----
    useEffect(() => {
        if (!element) return;

        const updatePopupSize = () => {
            const rect = element.getBoundingClientRect();
            setPopupSize({ width: rect.width, height: rect.height });
        };
        updatePopupSize();
        const observer = new ResizeObserver(updatePopupSize);
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);

    // ---- Calculate position with viewport clamping ----
    const getPosition = useCallback(() => {
        const margin = 4;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let top = anchorRect.y + anchorRect.height + margin;
        let left = anchorRect.x - popupSize.width - margin;

        if (left + popupSize.width > vw - margin) {
            left = vw - margin;
        }

        return { top, left };
    }, [anchorRect, popupSize]);

    if (!open || !anchor) return null;

    const { top, left } = getPosition();

    return createPortal(
        <Fragment>
            <Box
                ref={(el: HTMLElement) => setElement(el)}
                sx={{
                    position: "fixed",
                    background: "#fff",
                    p: 1,
                    borderRadius: "15px",
                    overflow: "hidden",
                    top: `${top}px`,
                    left: `${left}px`,
                    zIndex: 1800,
                    boxShadow: "-8px 8px 0px #828282,0px 0px 4px #0000001a",
                    pointerEvents: "all",
                }}
            >
                {children}
            </Box>
            <Overlay cursor="auto" onClick={onClose} zIndex={1700} open />
        </Fragment>,
        document.body,
    );
}
