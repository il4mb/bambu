import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "../PropertyLayout";
import NumberField from "../fields/NumberField";
import {
    ABSOLUTE_LENGTH_UNITS,
    MODERN_VIEWPORT_UNITS,
    parseUnit,
    RELATIVE_LENGTH_UNITS,
    TYPOGRAPHY_UNITS,
    UnitObject,
    VIEWPORT_UNITS,
} from "@/libs/units";

const UNITS = Array.from(
    new Map(
        [
            ...ABSOLUTE_LENGTH_UNITS,
            ...RELATIVE_LENGTH_UNITS,
            ...VIEWPORT_UNITS,
            ...MODERN_VIEWPORT_UNITS,
            ...TYPOGRAPHY_UNITS,
        ].map((u) => [u, u]),
    ).values(),
);

type HeightProps = {};

export default function HeightProperty({}: HeightProps) {
    const [value, setValue] = useStyled<UnitObject>(
        (nodes) => {
            return Array.from(nodes).reduce(
                (prev, curr) => {
                    try {
                        return parseUnit(String(curr.data.style?.height || curr.state.computed?.height), "px");
                    } catch (err) {}
                    return prev;
                },
                { value: 12, unit: "px" } as UnitObject,
            );
        },
        (node, value) => {
            node.set("data.style", (prev) => ({
                ...prev,
                height: value.value + value.unit,
            }));
        },
    );

    return (
        <PropertyLayout label="Height">
            <NumberField units={UNITS} value={value} onChange={setValue} />
        </PropertyLayout>
    );
}
