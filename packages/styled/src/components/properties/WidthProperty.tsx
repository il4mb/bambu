import * as csstree from "css-tree";
import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "../PropertyLayout";
import { ASTEditor } from "@bambu/ast-editor";
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
    const [value, setValue] = useStyled<csstree.CssNode>(
        (nodes) => {
            return Array.from(nodes).reduce((prev, curr) => {
                if (curr.data.style?.width) {
                    const widthString = String(curr.data.style?.width);
                    if (widthString !== "none") {
                        return csstree.parse(widthString, { context: "value" });
                    }
                }
                return prev;
            }, {} as csstree.CssNode);
        },
        (node, value) => {
            // node.set("data.style", (prev) => ({
            //     ...prev,
            //     width: value.value + value.unit,
            // }));
        },
    );

    return (
        <PropertyLayout label="Width">
            {/* <NumberField units={UNITS} value={value} onChange={setValue} /> */}
            {/* {value} */}
            {/* {csstree.walk(value, (n) => <Typography></Typography>)} */}
            {value && <ASTEditor node={value} />}
        </PropertyLayout>
    );
}
