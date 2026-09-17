import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "../PropertyLayout";
import { CssEditor } from "@il4mb/css-editor";

type FontSizeProps = {};

export default function FontSizeProperty({}: FontSizeProps) {
    const [value, setValue] = useStyled<string>(
        (nodes) => {
            const allValues = nodes.map((node) => node.data.style?.fontSize).filter(Boolean) as string[];
            const firstValue = allValues[0];
            if (firstValue && allValues.every((v) => v === firstValue)) {
                return firstValue;
            }

            const allComputedValues = nodes.map((node) => node.state.computed?.fontSize).filter(Boolean) as string[];
            const firstComputedValue = allComputedValues[0];
            if (firstComputedValue && allComputedValues.every((v) => v === firstComputedValue)) {
                return firstComputedValue;
            }
            return undefined;
        },
        (node, value) => {
            if (value === undefined) {
                const { fontSize, ...rest } = node.data.style || {};
                node.set("data.style", { ...rest });
                return;
            }
            node.set("data.style.fontSize", value);
        },
    );

    return (
        <PropertyLayout label="Size">
            <CssEditor content={value || ""} onChange={setValue} />
        </PropertyLayout>
    );
}
