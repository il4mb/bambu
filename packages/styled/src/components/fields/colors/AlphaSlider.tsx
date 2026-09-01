import { Color } from "@/libs/color";
import { IColor, IColorHSL } from "@/types/type";
import Box from "@mui/material/Box";
import { clamp } from "lodash";
import { PointerEvent, useMemo, useRef } from "react";

type AlphaSliderProps = {
    color: IColorHSL;
    value: number; // expected to be between 0 and 1
    onChange: (alpha: number) => void;
};

export default function AlphaSlider({ value, color = { h: 0, s: 0, l: 0 }, onChange }: AlphaSliderProps) {
    const elementRef = useRef<HTMLElement>(null);
    const colorString = useMemo(() => Color.format(color), [color]);

    const updateAlpha = (clientX: number) => {
        if (!elementRef.current) return;
        const rect = elementRef.current.getBoundingClientRect();

        // Calculate the pointer position relative to the slider width
        const x = clientX - rect.left;
        let percent = x / rect.width;

        // Clamp the value strictly between 0 and 1
        percent = Math.max(0, Math.min(1, percent));

        onChange(percent);
    };

    const handlePointerDown = (e: PointerEvent) => {
        if (!elementRef.current) return;
        // Capture the pointer so dragging continues even if the mouse leaves the slider area
        elementRef.current.setPointerCapture(e.pointerId);
        updateAlpha(e.clientX);
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (!elementRef.current) return;
        // Only update if we are actively dragging (pointer is captured)
        if (elementRef.current.hasPointerCapture(e.pointerId)) {
            updateAlpha(e.clientX);
        }
    };

    const handlePointerUp = (e: PointerEvent) => {
        if (!elementRef.current) return;
        elementRef.current.releasePointerCapture(e.pointerId);
    };

    // Fixed: Your original code used Math.max(value * 100, 100) which would always return 100.
    const thumbPositionPercent = Math.max(0, Math.min(value * 100, 100));

    return (
        <Box
            ref={elementRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            sx={{
                position: "relative",
                height: 10,
                width: "100%",
                borderRadius: "5px",
                cursor: "pointer",
                touchAction: "none",
                // Added a checkerboard pattern underneath the gradient so transparency is visible
                background: `
                    linear-gradient(to right, transparent, ${colorString}),
                    repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
                    repeating-linear-gradient(45deg, #ccc 25%, #fff 25%, #fff 75%, #ccc 75%, #ccc)
                `,
                backgroundPosition: "0 0, 0 0, 5px 5px",
                backgroundSize: "100% 100%, 10px 10px, 10px 10px",
                "&:after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: `${thumbPositionPercent}%`,
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #ffffff",
                    background: Color.format({ ...color, alpha: clamp(value, 0.2, 1) }),
                    borderColor: Color.getContrast(color, { ...color, a: value }),
                    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    pointerEvents: "none",
                },
            }}
        />
    );
}
