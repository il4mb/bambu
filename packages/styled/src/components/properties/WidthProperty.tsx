import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "../PropertyLayout";
import { CssEditor } from "@il4mb/css-editor";
import {
    ABSOLUTE_LENGTH_UNITS,
    MODERN_VIEWPORT_UNITS,
    RELATIVE_LENGTH_UNITS,
    TYPOGRAPHY_UNITS,
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

type WidthProps = {};

export default function WidthProperty({}: WidthProps) {
    const [value, setValue] = useStyled<string>(
        (nodes) => {
            return Array.from(nodes).reduce((prev, curr) => {
                if (curr.data.style?.width) {
                    return String(curr.data.style?.width);
                }
                return prev;
            }, "");
        },
        (node, value) => {
            if (!value) {
                node.set("data.style", (prev) => {
                    const { width, ...rest } = prev;
                    return rest;
                });
                return;
            }
            node.set("data.style", (prev) => ({
                ...prev,
                width: value,
            }));
        },
    );

    return (
        <PropertyLayout label="Width">
            <div>{value && <CssEditor content={value} onChange={setValue} />}</div>
        </PropertyLayout>
    );
}
