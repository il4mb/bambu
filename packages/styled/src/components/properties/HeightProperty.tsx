import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "../PropertyLayout";
import { CssEditor } from "@il4mb/css-editor";

type HeightProps = {};

export default function HeightProperty({}: HeightProps) {
    const [value, setValue] = useStyled<string>(
        (nodes) => {
            const all = Array.from(nodes)
                .map((n) => n.data.style?.height ? String(n.data.style?.height) : null)
                .filter(Boolean);
            if (all.length === 0) return "initial";
            const first = all[0];
            if (all.every((f) => f === first)) {
                return first;
            }
            return "initial";
        },
        (node, value) => {
            if (!value || value === "initial") {
                node.set("data.style", (prev) => {
                    const { height, ...rest } = prev;
                    return rest;
                });
                return;
            }
            node.set("data.style", (prev) => ({
                ...prev,
                height: value,
            }));
        },
    );

    return (
        <PropertyLayout label="Height">
            <CssEditor content={value || ""} onChange={setValue} />
        </PropertyLayout>
    );
}
