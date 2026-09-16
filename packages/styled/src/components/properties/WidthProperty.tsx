import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "../PropertyLayout";
import { CssEditor } from "@il4mb/css-editor";

type WidthProps = {};

export default function WidthProperty({}: WidthProps) {
    const [value, setValue] = useStyled<string>(
        (nodes) => {
            const all = Array.from(nodes)
                .map((n) => (n.data.style?.width ? String(n.data.style?.width) : null))
                .filter(Boolean);
            if (all.length === 0) return "initial";
            const first = all[0];
            if (all.every((f) => f === first)) return first;
            return "initial";
        },
        (node, value) => {
            if (!value || value === "initial") {
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
            <CssEditor content={value || ""} onChange={setValue} />
        </PropertyLayout>
    );
}
