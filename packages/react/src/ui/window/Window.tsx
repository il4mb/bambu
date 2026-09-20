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

    if (!open) return null;

    return createPortal(
        <WindowProvider
            anchorEl={anchorEl}
            anchorOrigin={anchorOrigin}
            anchorOffset={anchorOffset}
            edgeSpacing={edgeSpacing}
            onClose={onClose}
        >
            <WindowContainer slotProps={slotProps}>
                {children}
            </WindowContainer>
        </WindowProvider>,
        document.body,
    );
}
