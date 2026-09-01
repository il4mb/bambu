import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "../PropertyLayout";
import NumberField from "../fields/NumberField";
import { parseUnit, TYPOGRAPHY_UNITS, UnitObject } from "@/libs/units";

type FontSizeProps = {};

export default function FontSizeProperty({}: FontSizeProps) {
    const [value, setValue] = useStyled<UnitObject>(
        (nodes) => {
            return Array.from(nodes).reduce(
                (prev, curr) => {
                    try {
                        return parseUnit(String(curr.data.style?.fontSize || curr.state.computed?.fontSize), "px");
                    } catch (err) {}
                    return prev;
                },
                { value: 12, unit: "px" } as UnitObject,
            );
        },
        (node, value) => {
            node.set("data.style", (prev) => ({
                ...prev,
                fontSize: value.value + value.unit,
            }));
        },
    );

    return (
        <PropertyLayout label="Font Size">
            <NumberField units={TYPOGRAPHY_UNITS} value={value} onChange={setValue} />
        </PropertyLayout>
    );
}
