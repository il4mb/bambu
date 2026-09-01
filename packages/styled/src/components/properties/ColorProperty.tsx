import { useEffect, useMemo, useRef, useState } from "react";
import HueSlider from "../fields/colors/HueSlider";
import SaturationZone from "../fields/colors/SaturationZone";
import { Box, Popover } from "@mui/material";
import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "@/components/PropertyLayout";
import ColorBox from "../fields/colors/ColorBox";
import AlphaSlider from "../fields/colors/AlphaSlider";
import { IColor } from "@/types/type";
import { Color } from "@/libs/color";

const placeholder = Color.parse("#000");

export default function ColorProperty() {
    const [value, setValue] = useStyled<IColor | null>(
        (nodes) => {
            const nodeArray = Array.from(nodes);
            if (nodeArray.length === 0) return null;
            const firstValue = nodeArray[0].data.style?.color;
            const allMatch = nodeArray.every((node) => node.data.style?.color === firstValue);
            if (!firstValue && allMatch) {
                const computedColor = nodeArray[0].state.computed?.color;
                const allComputedMatch = nodeArray.every((n) => n.state.computed?.color === computedColor);
                if (allComputedMatch && computedColor) {
                    return Color.parse(computedColor);
                }
            } else if (firstValue && allMatch) {
                return Color.parse(firstValue);
            }
            return null;
        },
        (node, value) => {
            node.set("data.style", (prev = {}) => {
                if (!value) {
                    const { color, ...rest } = prev;
                    return rest;
                }
                return {
                    ...prev,
                    color: Color.format(value),
                };
            });
        },
    );

    const colorPreview = useMemo(() => Color.format(value), [value]);
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLElement>(null);

    // Track the timeout so we can cancel it if the mouse re-enters
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Helpers to safely mutate color
    const handleSaturationChange = (s: number, l: number) => {
        setValue((prev) => ({
            ...placeholder,
            ...prev,
            data: {
                ...placeholder.data,
                ...prev?.data,
                s,
                l,
            },
        }));
    };

    const handleHueChange = (h: number) => {
        console.log(h);
        setValue((prev) => ({
            ...placeholder,
            ...prev,
            data: {
                ...placeholder.data,
                ...prev?.data,
                h,
            },
        }));
    };

    const handleAlphaChange = (alpha: number) => {
        setValue((prev) => ({
            ...placeholder,
            ...prev,
            alpha,
        }));
    };

    // --- HOVER LOGIC ---
    const handleMouseEnter = () => {
        // If there was a pending close action, cancel it
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setOpen(true);
    };

    const handleMouseLeave = () => {
        // Add a small delay before closing to allow the mouse to travel
        // across the gap between the ColorBox and the Popover
        closeTimeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 350);
    };

    // Cleanup timeout when the component unmounts
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    return (
        <PropertyLayout label={"Color"}>
            <ColorBox
                color={colorPreview}
                ref={anchorRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
            <Popover
                anchorEl={anchorRef.current}
                hideBackdrop={true}
                disableEnforceFocus={true}
                disableScrollLock={true}
                sx={{ pointerEvents: "none" }} // Keeps the popover backdrop from blocking the UI
                open={open}
                anchorOrigin={{
                    horizontal: "right",
                    vertical: "bottom",
                }}
            >
                <Box
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{
                        p: 1,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        pointerEvents: "all", // Re-enables interaction inside the Popover
                        minWidth: 200,
                    }}
                >
                    <SaturationZone color={value?.data} onChange={handleSaturationChange} />
                    <HueSlider value={value?.data.h ?? 0} onChange={handleHueChange} />
                    <AlphaSlider value={value?.alpha ?? 1} color={value?.data} onChange={handleAlphaChange} />
                </Box>
            </Popover>
        </PropertyLayout>
    );
}
