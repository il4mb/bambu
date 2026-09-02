import { CssNode } from "css-tree";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import NodeRender from "./NodeRender";
import { Selection } from "./types";
import styled from "@emotion/styled";
import CaretHilight from "./components/CaretHilight";
import { Caret } from "./libs/caret";

const Container = styled("div")({
    position: "relative",
    userSelect: "none",
});

type CSSRenderProps = {
    node: CssNode;
    children?: ReactNode;
};

export default function CSSEditor({ node }: CSSRenderProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    const [selection, setSelection] = useState<Selection>({
        anchor: 0,
        focus: 0,
    });

    const getOffsetFromPoint = useCallback((mouseX: number, mouseY: number): number => {
        const element = elementRef.current;

        if (!element) return 0;

        const position = document.caretPositionFromPoint(mouseX, mouseY);

        if (!position) return 0;

        return Caret.offsetFromNode(position, element);
    }, []);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        let isPressed = false;
        const onPointerDown = (e: PointerEvent) => {
            if (e.defaultPrevented) return;
            const offset = getOffsetFromPoint(e.clientX, e.clientY);
            setSelection({ anchor: offset, focus: offset });
            isPressed = true;
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!isPressed) return;
            const offset = getOffsetFromPoint(e.clientX, e.clientY);
            setSelection((prev) => ({ ...prev, focus: offset }));
        };
        const onPointerUp = () => (isPressed = false);

        element.addEventListener("pointerdown", onPointerDown);
        element.addEventListener("pointermove", onPointerMove);
        element.addEventListener("pointerup", onPointerUp, true);
        element.addEventListener("pointercancel", onPointerUp, true);
        return () => {
            element.removeEventListener("pointerdown", onPointerDown);
            element.removeEventListener("pointermove", onPointerMove);
            element.removeEventListener("pointerup", onPointerUp, true);
            element.removeEventListener("pointercancel", onPointerUp, true);
        };
    }, [getOffsetFromPoint]);

    return (
        <Container ref={elementRef}>
            <NodeRender node={node} />
            <CaretHilight selection={selection} />
        </Container>
    );
}
