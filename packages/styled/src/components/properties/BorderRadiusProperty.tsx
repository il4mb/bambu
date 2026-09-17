import PropertyLayout from "../PropertyLayout";
import { useProperty } from "@/hooks/useStyled";
import { CssEditor } from "@il4mb/css-editor";

export interface BorderRadiusPropertyProps {}
export default function BorderRadiusProperty({}: BorderRadiusPropertyProps) {
    const [value, setValue] = useProperty("borderRadius", "0px");

    return (
        <PropertyLayout label="Border Radius">
            <CssEditor content={value || ""} onChange={setValue} />
        </PropertyLayout>
    );
}
