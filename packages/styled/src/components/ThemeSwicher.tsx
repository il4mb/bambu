import { useStyleManager } from "@/StyledProvider";
import { MenuItem, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import PropertyLayout from "./PropertyLayout";

export interface ThemeSwicherProps {}
export default function ThemeSwicher({}: ThemeSwicherProps) {
    const styleManager = useStyleManager();
    const [value, setValue] = useState(styleManager.theme);

    const updateTheme = (e: ChangeEvent<HTMLInputElement>) => {
        styleManager.setTheme(e.target.value as any);
    };

    useEffect(() => {
        return styleManager.on("theme", (e) => {
            setValue(e.value);
        });
    }, []);

    return (
        <PropertyLayout label="Color Scheme">
            <TextField
                label={"Theme"}
                size="small"
                value={value}
                onChange={updateTheme}
                fullWidth
                select
            >
                <MenuItem value={"system"}>System</MenuItem>
                <MenuItem value={"light"}>Light</MenuItem>
                <MenuItem value={"dark"}>Dark</MenuItem>
            </TextField>
        </PropertyLayout>
    );
}
