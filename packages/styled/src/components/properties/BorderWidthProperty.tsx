import PropertyLayout from "../PropertyLayout";
import { useProperty } from "@/hooks/useStyled";
import { CssEditor } from "@il4mb/css-editor";

export interface BorderPropertyProps {}
export default function BorderWidthProperty({}: BorderPropertyProps) {
    const [value, setValue] = useProperty("borderWidth", "0px");

    return (
        <PropertyLayout label="Border Width">
            <CssEditor content={value || ""} onChange={setValue} />
        </PropertyLayout>
    );
}
