import { cloneElement, Fragment, PointerEvent, ReactElement, useEffect, useRef, useState } from "react";
import Overlay from "../Overlay";

type NumberDragableProps = {
    step?: number;
    value: number;
    onChange: (value: number) => void;
    children: ReactElement<{
        onPointerDown: (e: PointerEvent) => void;
    }>;
};

export default function NumberDragable({ children, value, step = 1, onChange }: NumberDragableProps) {
    const [dragging, setDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, value: 0 });

    const onPointerDown = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragStartRef.current = {
            x: e.clientX,
            value,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
    };

    useEffect(() => {
        if (!dragging) return;
        const handlePointerMove = (e: globalThis.PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const deltaX = e.clientX - dragStartRef.current.x;
            const nextValue = dragStartRef.current.value + deltaX * step;
            onChange(Number(nextValue.toFixed(2)));
        };
        const handlePointerUp = () => setDragging(false);

        window.addEventListener("pointermove", handlePointerMove, true);
        window.addEventListener("pointerup", handlePointerUp, true);
        window.addEventListener("pointercancel", handlePointerUp, true);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove, true);
            window.removeEventListener("pointerup", handlePointerUp, true);
            window.removeEventListener("pointercancel", handlePointerUp, true);
        };
    }, [dragging, step, onChange]);

    return (
        <Fragment>
            {cloneElement(children, {
                onPointerDown,
            })}

            <Overlay open={dragging} cursor="ew-resize" />
        </Fragment>
    );
}
