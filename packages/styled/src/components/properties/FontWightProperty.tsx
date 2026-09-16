import { useProperty } from "@/hooks/useStyled";
import { SelectField } from "@/components/fields/SelectField";
import { MenuItem } from "@mui/material";
import PropertyLayout from "../PropertyLayout";
import { useMemo } from "react";

const WEIGHT_MAP = {
    thin: "100",
    extralight: "200",
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
};

const WEIGHT_LABELS_MAP = Object.fromEntries(
    Object.entries(WEIGHT_MAP).map(([label, value]) => [value, label]),
);

type FontWeightPropertyProps = {
    variants?: string[];
};
export default function FontWeightProperty({
    variants = ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
}: FontWeightPropertyProps) {
    const [value, setValue] = useProperty("fontWeight", "400");
    const allVariants = useMemo(() => {
        return [...variants].map((v) => {
            if (isNaN(Number(v))) {
                return {
                    label: WEIGHT_LABELS_MAP[v] || v,
                    value: WEIGHT_MAP[v] || v,
                };
            }
            return {
                label: WEIGHT_LABELS_MAP[v] || v,
                value: v,
            };
        });
    }, [variants]);

    return (
        <PropertyLayout label="Weight">
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
