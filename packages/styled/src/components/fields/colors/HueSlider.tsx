import { Color } from "@/libs/color";
import Box from "@mui/material/Box";
import { useCallback, useMemo, useRef, useState } from "react";

export interface HueSliderProps {
    value: number; // Hue from 0 to 360
    onChange: (hue: number) => void;
}

export default function HueSlider({ value, onChange }: HueSliderProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const thumbColor = useMemo(() => Color.format({ h: value, s: 1, l: 0.5 }), [value]);

    const updateHueFromEvent = useCallback(
        (clientX: number) => {
            if (!elementRef.current) return;
            const rect = elementRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = x / rect.width;
            const newHue = Math.round(percentage * 360);
            onChange(newHue);
        },
        [onChange],
    );

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        updateHueFromEvent(e.clientX);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging) {
            updateHueFromEvent(e.clientX);
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging) {
            setIsDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    // Calculate left percentage for thumb position (0 to 360 mapped to 0% to 100%)
    const thumbPositionPercent = Math.max(0, Math.min(100, (value / 360) * 100));

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
                background:
                    "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))",
                "&:after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: `${thumbPositionPercent}%`,
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: thumbColor,
                    border: "2px solid #ffffff",
                    borderColor: Color.getContrast(thumbColor),
                    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    pointerEvents: "none",
                },
            }}
        />
    );
}
