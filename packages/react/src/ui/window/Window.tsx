import { createPortal } from "react-dom";
import { ReactNode } from "react";
import { WindowHeaderProps } from "./WindowHeader";
import { WindowProvider } from "./WindowProvider";
import WindowContainer from "./WindowContainer";

type WindowedProps = {
    open: boolean;
    anchorEl?: HTMLElement;
    onClose?: () => void;
    children?: ReactNode;
    edgeSpacing?: { vertical?: number; horizontal?: number };
    anchorOffset?: Partial<Point>;
    anchorOrigin?: {
        vertical?: "top" | "center" | "bottom";
        horizontal?: "left" | "center" | "right";
    };
    minSize?: Size;
    maxSize?: Size;
    initialSize?: Size;

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
    maxSize,
    minSize,
    initialSize,
    slotProps = {},
}: WindowedProps) {
    if (!open) return null;

    return createPortal(
        <WindowProvider
            anchorEl={anchorEl}
            anchorOrigin={anchorOrigin}
            anchorOffset={{ x: 0, y: 0, ...anchorOffset }}
            edgeSpacing={edgeSpacing}
            onClose={onClose}
            initialSize={initialSize}
            maxSize={maxSize}
            minSize={minSize}
        >
            <WindowContainer slotProps={slotProps}>{children}</WindowContainer>
        </WindowProvider>,
        document.body,
    );
}
