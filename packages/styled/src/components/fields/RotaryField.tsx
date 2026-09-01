import { UnitObject } from "@/libs/units";
import { Box, Typography } from "@mui/material";
import { clamp } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";

type RotaryFieldProps = {
    value: UnitObject<"deg">;
    onChange?: (value: UnitObject<"deg">) => void;
};

export default function RotaryField({ value, onChange }: RotaryFieldProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const numVal = clamp(value.value ?? 180, 0, 360);
    const coordinate = useMemo(() => {
        const angleRad = ((numVal - 90) * Math.PI) / 180;
        const radius = 18;
        return {
            x: radius * Math.cos(angleRad),
            y: radius * Math.sin(angleRad),
        };
    }, [numVal]);

    const getAngleFromEvent = (clientX: number, clientY: number): number => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return numVal;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        let angleRad = Math.atan2(dy, dx);
        let angleDeg = (angleRad * 180) / Math.PI + 90; // 0° at top
        angleDeg = ((angleDeg % 360) + 360) % 360;
        return Math.round(angleDeg);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        setIsDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        const newAngle = getAngleFromEvent(e.clientX, e.clientY);
        onChange?.({ value: newAngle, unit: "deg" });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const newAngle = getAngleFromEvent(e.clientX, e.clientY);
        onChange?.({ value: newAngle, unit: "deg" });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDragging) {
            setIsDragging(false);
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }
    };

    const arcDeg = numVal; // 0..360
    const conicGradient = `conic-gradient(from 0deg, rgba(255, 215, 0, 0.4) 0deg, rgba(255, 215, 0, 0.4) ${arcDeg}deg, transparent ${arcDeg}deg, transparent 360deg)`;
    const dotTransition = isDragging ? "none" : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Box
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                sx={{
                    position: "relative",
                    borderRadius: "50%",
                    width: 60,
                    height: 60,
                    outline: "4px solid #555",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    touchAction: "none",
                    userSelect: "none",
                    // Arc background (behind the dot)
                    background: conicGradient,
                    transition: "background 0.3s ease",
                    "&:hover": {
                        outlineColor: "#0084ff",
                    },
                }}
            >
                {/* Snap markers (small dots at 45° intervals) */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                    const rad = ((deg - 90) * Math.PI) / 180;
                    const r = 24; // radius for marker
                    const x = 30 + r * Math.cos(rad);
                    const y = 30 + r * Math.sin(rad);
                    return (
                        <Box
                            key={deg}
                            sx={{
                                position: "absolute",
                                top: y - 2,
                                left: x - 2,
                                width: 3,
                                height: 3,
                                borderRadius: "50%",
                                background: "#aaa",
                                transition: "all 0.2s",
                                pointerEvents: "none",
                            }}
                        />
                    );
                })}
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 12,
                        height: 12,
                        background: isDragging ? "#0059ff" : "#727272",
                        borderRadius: "50%",
                        transform: `translate(calc(-50% + ${coordinate.x}px), calc(-50% + ${coordinate.y}px))`,
                        transition: dotTransition,
                        boxShadow: isDragging ? "0 0 12px rgba(255, 215, 0, 0.8)" : "0 0 6px rgba(255, 215, 0, 0.4)",
                        pointerEvents: "none",
                        willChange: "transform",
                    }}
                />
            </Box>

            {/* Display current angle */}
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "#555" }}>
                {numVal}°
            </Typography>
        </Box>
    );
}
