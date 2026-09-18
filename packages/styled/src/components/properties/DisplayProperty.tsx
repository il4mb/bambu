import { useProperty } from "@/hooks/useStyled";
import PropertyLayout from "../PropertyLayout";
import { MenuItem } from "@mui/material";
import { SelectField } from "@/components/fields/SelectField";

const DISPLAY_VALUES = [
    "block",
    "inline",
    "inline-block",
    "flex",
    "inline-flex",
    "grid",
    "inline-grid",
    "contents",
    "table",
    "table-row",
    "table-cell",
    "list-item",
    "none",
    "inherit",
    "initial",
    "revert",
    "unset",
];

export default function DisplayProperty() {
    const [value, setValue] = useProperty("display", "");

    return (
        <PropertyLayout label="Display">
            <SelectField value={value ?? ""} onChange={(e) => setValue(e.target.value)} fullWidth>
                <MenuItem value={""}>-- Select --</MenuItem>
                {DISPLAY_VALUES.map((val) => (
                    <MenuItem key={val} value={val}>
                        {val}
                    </MenuItem>
                ))}
            </SelectField>
        </PropertyLayout>
    );
}
