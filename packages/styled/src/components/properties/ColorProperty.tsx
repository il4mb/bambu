import {  useMemo, useRef, useState } from "react";
import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "@/components/PropertyLayout";
import ColorBox from "../fields/colors/ColorBox";
import { IColor } from "@/types/type";
import { Color } from "@/libs/color";
import ColorPickerPopup from "../fields/colors/ColorPickerPopup";

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

    return (
        <PropertyLayout label={"Color"}>
            <ColorBox
                color={colorPreview}
                ref={anchorRef}
                onClick={() => setOpen(true)}
            />
            <ColorPickerPopup
                value={value ?? placeholder}
                onChange={setValue}
                anchorEl={anchorRef.current}
                open={open}
                onClose={() => setOpen(false)}
            />
        </PropertyLayout>
    );
}
