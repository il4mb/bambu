import { useProperty } from "@/hooks/useStyled";
import { SelectField } from "@/components/fields/SelectField";
import { MenuItem } from "@mui/material";
import PropertyLayout from "../PropertyLayout";

const WEIGHT_VALUES = [
    { label: "Thin (100)", value: "100" },
    { label: "Extra Light (200)", value: "200" },
    { label: "Light (300)", value: "300" },
    { label: "Normal (400)", value: "400" },
    { label: "Medium (500)", value: "500" },
    { label: "Semi Bold (600)", value: "600" },
    { label: "Bold (700)", value: "700" },
    { label: "Extra Bold (800)", value: "800" },
    { label: "Black (900)", value: "900" },
];

export default function FontWeightProperty() {
    const [value, setValue] = useProperty("fontWeight");

    return (
        <PropertyLayout label="Font Weight">
            {/* Added a fallback to "" to prevent React uncontrolled/controlled component warnings if value is initially undefined */}
            <SelectField value={value || ""} onChange={(e) => setValue(e.target.value)} fullWidth>
                <MenuItem value={""}>-- Select --</MenuItem>
                {WEIGHT_VALUES.map((val) => (
                    <MenuItem key={val.value} value={val.value}>
                        {val.label}
                    </MenuItem>
                ))}
            </SelectField>
        </PropertyLayout>
    );
}