import { Box, Typography } from "@mui/material";
import { Fragment, MouseEvent, useEffect, useRef, useState } from "react";

type NumberDragableProps = {
    step?: number;
    value: number;
    onChange: (value: number) => void;
};

export default function NumberDragable({ value, step = 1, onChange }: NumberDragableProps) {
    const [dragging, setDragging] = useState(false);
    
    // Combine start values into a single ref. 
    // We store the INITIAL value and INITIAL mouse X on mouse down.
    const dragStartRef = useRef({ x: 0, value: 0 });

    const onMouseDown = (e: MouseEvent) => {
        dragStartRef.current = {
            x: e.clientX,
            value: value,
        };
        setDragging(true);
    };

    useEffect(() => {
        if (!dragging) return;

        const handleMouseMove = (e: globalThis.MouseEvent) => {
            // 1. Calculate the total X distance moved since mousedown
            const deltaX = e.clientX - dragStartRef.current.x;

            // 2. Apply the delta to the INITIAL value (prevents precision drift)
            const nextValue = dragStartRef.current.value + (deltaX * step);

            // 3. Number() natively strips trailing zeros and decimals without regex
            onChange(Number(nextValue.toFixed(2)));
        };

        const handleMouseUp = () => {
            setDragging(false);
        };

        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousemove", handleMouseMove);
        
        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [dragging, step, onChange]); // Included missing dependencies

    return (
        <Fragment>
            <Box
                onMouseDown={onMouseDown}
                sx={{
                    cursor: "ew-resize",
                    userSelect: "none",
                    display: "inline-block" // Prevents the Box from taking full width
                }}
            >
                <Typography component={"span"} sx={{ fontSize: "1em" }}>{value}</Typography>
            </Box>
            
            {dragging && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        cursor: "ew-resize",
                        // Note: pointerEvents: "fill" is for SVG only. 
                        // A fixed Box automatically intercepts events, no extra rule needed.
                    }}
                />
            )}
        </Fragment>
    );
}