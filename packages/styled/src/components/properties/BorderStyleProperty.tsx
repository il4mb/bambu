import MenuItem from "@mui/material/MenuItem";
import { SelectField } from "../fields/SelectField";
import PropertyLayout from "../PropertyLayout";
import { useProperty } from "@/hooks/useStyled";

const BORDER_STYLE_VALUES = [
    "none",
    "solid",
    "dashed",
    "dotted",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "hidden",
];

export interface BorderPropertyProps {}
export default function BorderStyleProperty({}: BorderPropertyProps) {
    const [value, setValue] = useProperty("borderStyle", "none");
    return (
        <PropertyLayout label="Border Style">
            <SelectField value={value ?? ""} onChange={(e) => setValue(e.target.value)} fullWidth>
                <MenuItem value={""}>-- Select --</MenuItem>
                {BORDER_STYLE_VALUES.map((val) => (
                    <MenuItem key={val} value={val}>
                        {val}
                    </MenuItem>
                ))}
            </SelectField>
        </PropertyLayout>
    );
}
