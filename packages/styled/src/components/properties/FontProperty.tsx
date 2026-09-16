import PropertyGroup from "../PropertyGroup";
import FontSizeProperty from "./FontSizeProperty";
import FontFamilyProperty from "./FontFamilyProperty";
import { Stack } from "@mui/material";

export interface FontPropertyProps {}
export default function FontProperty({}: FontPropertyProps) {
    return (
        <PropertyGroup label="Font" defaultExpanded>
            <Stack direction="column" spacing={0.5}>
                <FontSizeProperty />
                <FontFamilyProperty />
            </Stack>
        </PropertyGroup>
    );
}
