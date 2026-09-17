import PropertyLayout from "../PropertyLayout";
import { useStyled } from "@/hooks/useStyled";
import { Color } from "@/libs/color";
import { useMemo, useRef, useState } from "react";
import ColorBox from "../fields/colors/ColorBox";
import ColorPickerPopup from "../fields/colors/ColorPickerPopup";

const placeholder = Color.parse("#000");

export interface BorderPropertyProps {}
export default function BorderColorProperty({}: BorderPropertyProps) {
    const [value, setValue] = useStyled(
        (nodes) => {
            const nodeArray = Array.from(nodes);
            if (nodeArray.length === 0) return null;
            const firstValue = nodeArray[0].data.style?.borderColor;
            const allMatch = nodeArray.every((node) => node.data.style?.borderColor === firstValue);
            if (!firstValue && allMatch) {
                const computedColor = nodeArray[0].state.computed?.borderColor;
                const allComputedMatch = nodeArray.every((n) => n.state.computed?.borderColor === computedColor);
                if (allComputedMatch && computedColor) {
                    return Color.parse(computedColor);
                }
            } else if (firstValue && allMatch) {
                return Color.parse(firstValue);
            }
            return null;
        },
        (node, value) => {
            if (!value) {
                const { borderColor, ...rest } = node.data.style || {};
                node.set("data.style", rest);
                return;
            }
            node.set("data.style", (prev = {}) => ({
                ...prev,
                borderColor: Color.format(value),
            }));
        },
    );
    const colorPreview = useMemo(() => Color.format(value), [value]);
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLElement>(null);
    return (
        <PropertyLayout label="Border Color">
            <ColorBox color={colorPreview} ref={anchorRef} onClick={() => setOpen(true)} />
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
