import { IColorHSL, IColorHSV } from "@/types/type";
import { Box } from "@mui/material";
import chroma from "chroma-js";
import { clamp } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SaturationZoneProps = {
    color: IColorHSL;
    onChange: (saturation: number, lightness: number) => void;
};

const DEFAULT_COLOR: IColorHSL = {
    h: 0,
    s: 1,
    l: 0.5,
};

function hslToHSV(color: IColorHSL): IColorHSV {
    const [h, s, v] = chroma
        .hsl(color.h || 0, clamp(color.s, 0, 1), clamp(color.l, 0, 1))
        .hsv();

    return {
        h: Number.isNaN(h) ? color.h || 0 : h,
        s: clamp(s, 0, 1),
        v: clamp(v, 0, 1),
    };
}

export default function SaturationZone({
    color = DEFAULT_COLOR,
    onChange,
}: SaturationZoneProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const onChangeRef = useRef(onChange);
    const isDraggingRef = useRef(false);

    const [isDragging, setIsDragging] = useState(false);

    const [hsv, setHSV] = useState<IColorHSV>(() => hslToHSV(color));
    const hsvRef = useRef(hsv);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (isDraggingRef.current) return;

        const nextHSV = hslToHSV(color);

        hsvRef.current = nextHSV;
        setHSV(nextHSV);
    }, [color.h, color.s, color.l]);

    const updateHSV = useCallback(
        (data: Partial<IColorHSV>) => {
            const previous = hsvRef.current;

            const next: IColorHSV = {
                ...previous,
                ...data,
            };

            next.h = next.h || 0;
            next.s = clamp(next.s, 0, 1);
            next.v = clamp(next.v, 0, 1);

            hsvRef.current = next;
            setHSV(next);

            const [, saturation, lightness] = chroma
                .hsv(next.h, next.s, next.v)
                .hsl();

            onChangeRef.current(
                clamp(saturation, 0, 1),
                clamp(lightness, 0, 1),
            );
        },
        [],
    );

    const updateColorFromEvent = useCallback(
        (clientX: number, clientY: number) => {
            const element = elementRef.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();

            if (rect.width <= 0 || rect.height <= 0) return;

            const saturation = clamp(
                (clientX - rect.left) / rect.width,
                0,
                1,
            );

            const value = clamp(
                1 - (clientY - rect.top) / rect.height,
                0,
                1,
            );

            updateHSV({
                s: saturation,
                v: value,
            });
        },
        [updateHSV],
    );

    const handlePointerDown = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            event.preventDefault();

            isDraggingRef.current = true;
            setIsDragging(true);

            event.currentTarget.setPointerCapture(event.pointerId);

            updateColorFromEvent(event.clientX, event.clientY);
        },
        [updateColorFromEvent],
    );

    const handlePointerMove = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (!isDraggingRef.current) return;

            updateColorFromEvent(event.clientX, event.clientY);
        },
        [updateColorFromEvent],
    );

    const handlePointerUp = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (!isDraggingRef.current) return;

            isDraggingRef.current = false;
            setIsDragging(false);

            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }
        },
        [],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            const step = event.shiftKey ? 0.1 : 0.01;

            let saturationDelta = 0;
            let valueDelta = 0;

            switch (event.key) {
                case "ArrowUp":
                    valueDelta = step;
                    break;
                case "ArrowDown":
                    valueDelta = -step;
                    break;
                case "ArrowLeft":
                    saturationDelta = -step;
                    break;
                case "ArrowRight":
                    saturationDelta = step;
                    break;
                default:
                    return;
            }

            event.preventDefault();

            const current = hsvRef.current;

            updateHSV({
                s: clamp(current.s + saturationDelta, 0, 1),
                v: clamp(current.v + valueDelta, 0, 1),
            });
        },
        [updateHSV],
    );

    const xPercent = hsv.s * 100;
    const yPercent = (1 - hsv.v) * 100;

    const baseHueColor = useMemo(
        () => chroma.hsl(color.h || 0, 1, 0.5).css(),
        [color.h],
    );

    const thumbColor = useMemo(
        () => chroma.hsv(hsv.h, hsv.s, hsv.v).css(),
        [hsv.h, hsv.s, hsv.v],
    );

    const thumbBorderColor = useMemo(
        () =>
            chroma(thumbColor).luminance() > 0.5
                ? "rgba(0,0,0,0.6)"
                : "rgba(255,255,255,0.8)",
        [thumbColor],
    );

    return (
        <Box
            ref={elementRef}
            tabIndex={0}
            role="slider"
            aria-label="Saturation and brightness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(hsv.s * 100)}
            aria-valuetext={`Saturation ${Math.round(
                hsv.s * 100,
            )}%, brightness ${Math.round(hsv.v * 100)}%`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
            sx={{
                position: "relative",
                width: "100%",
                minWidth: 200,
                minHeight: 150,
                borderRadius: 2,
                overflow: "visible",
                cursor: isDragging ? "grabbing" : "crosshair",
                touchAction: "none",
                userSelect: "none",
                outline: "none",
                background: `
                    linear-gradient(to top, #000000, transparent),
                    linear-gradient(to right, #ffffff, ${baseHueColor})
                `,
                "&:focus-visible": {
                    boxShadow: "0 0 0 3px #1976d2",
                },
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: `${yPercent}%`,
                    left: `${xPercent}%`,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    border: `2px solid ${thumbBorderColor}`,
                    backgroundColor: thumbColor,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    pointerEvents: "none",
                    transition: isDragging
                        ? "none"
                        : "top 0.08s ease-out, left 0.08s ease-out",
                }}
            />
        </Box>
    );
}