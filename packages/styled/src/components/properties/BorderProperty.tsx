import { Stack } from "@mui/material";
import PropertyGroup from "../PropertyGroup";
import BorderColorProperty from "./BorderColorProperty";
import BorderWidthProperty from "./BorderWidthProperty";
import BorderStyleProperty from "./BorderStyleProperty";
import BorderRadiusProperty from "./BorderRadiusProperty";

export interface BorderPropertyProps {}
export default function BorderProperty({}: BorderPropertyProps) {
    return (
        <PropertyGroup label="Border" defaultExpanded>
            <Stack direction="column" spacing={0.5} sx={{ mt: 1 }}>
                <BorderColorProperty />
                <BorderWidthProperty />
                <BorderStyleProperty />
                <BorderRadiusProperty />
            </Stack>
        </PropertyGroup>
    );
}
