import styled from "@emotion/styled";
import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { createPortal } from "react-dom";

type OverlayProps = {
    cursor?: CSSProperties["cursor"];
    children?: ReactNode;
    zIndex?: number;
    open?: boolean;
} & HTMLAttributes<HTMLDivElement>;

type ContainerProps = Pick<OverlayProps, "cursor" | "zIndex">;

const Container = styled.div<ContainerProps>(({ cursor, zIndex = 9999 }) => ({
    position: "fixed",
    inset: 0,
    zIndex,
    pointerEvents: "auto",
    cursor,
}));

export default function Overlay({ cursor, zIndex = 9999, children, open, ...rest }: OverlayProps) {
    if (typeof document === "undefined" || open === false) return null;
    return createPortal(
        <Container cursor={cursor} zIndex={zIndex} {...rest}>
            {children}
        </Container>,
        document.body,
    );
}
