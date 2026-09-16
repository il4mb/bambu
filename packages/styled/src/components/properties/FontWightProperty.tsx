import { useProperty } from "@/hooks/useStyled";
import { SelectField } from "@/components/fields/SelectField";
import { MenuItem } from "@mui/material";
import PropertyLayout from "../PropertyLayout";
import { useMemo } from "react";

const WEIGHT_VALUES = [
    { label: "Thin", value: "100" },
    { label: "Extra Light", value: "200" },
    { label: "Light", value: "300" },
    { label: "Normal", value: "400" },
    { label: "Medium", value: "500" },
    { label: "Semi Bold", value: "600" },
    { label: "Bold", value: "700" },
    { label: "Extra Bold", value: "800" },
    { label: "Black", value: "900" },
];
const WEIGHT_LABELS_MAP = WEIGHT_VALUES.reduce(
    (acc, { label, value }) => {
        acc[value] = label;
        return acc;
    },
    {} as Record<string, string>,
);

type FontWeightPropertyProps = {
    variants?: string[];
};
export default function FontWeightProperty({ variants = [] }: FontWeightPropertyProps) {
    const [value, setValue] = useProperty("fontWeight");
    const allVariants = useMemo(() => {
        return [...variants].map((v) => ({
            label: WEIGHT_LABELS_MAP[v] || v,
            value: v,
        }));
    }, [variants]);

    return (
        <PropertyLayout label="Font Weight">
            <SelectField value={value || ""} onChange={(e) => setValue(e.target.value)} fullWidth>
                <MenuItem value={""}>-- Select --</MenuItem>
                {allVariants.map((val) => (
                    <MenuItem key={val.value} value={val.value}>
                        {val.label}
                    </MenuItem>
                ))}
            </SelectField>
        </PropertyLayout>
    );
}
