import { ImageBackground } from "@/types/background";
import { SelectField } from "@/components/fields/SelectField";
import { Box, MenuItem } from "@mui/material";
import { TextField } from "../TextField";
import { useEffect, useRef } from "react";

type ImageBackgroundFieldProps = {
    value: ImageBackground;
    onChange?: (value: ImageBackground) => void;
};

export default function ImageBackgroundField({ value, onChange }: ImageBackgroundFieldProps) {
    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const handleOnChange = (patch: Partial<ImageBackground>) => {
        onChange?.({ ...valueRef.current, ...patch });
    };
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
                size="small"
                label="Image URL"
                variant="outlined"
                fullWidth
                value={value.source}
                onChange={(e) => handleOnChange({ source: e.target.value })}
                slotProps={{
                    input: {
                        sx: { fontSize: 12 },
                    },
                }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
                <SelectField
                    size="small"
                    fullWidth
                    value={value.size || "cover"}
                    onChange={(e) => handleOnChange({ size: e.target.value })}
                    sx={{ fontSize: 12 }}
                >
                    <MenuItem value="cover">Cover</MenuItem>
                    <MenuItem value="contain">Contain</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                </SelectField>

                <SelectField
                    size="small"
                    fullWidth
                    value={value.repeat || "no-repeat"}
                    onChange={(e) => handleOnChange({ repeat: e.target.value })}
                    sx={{ fontSize: 12 }}
                >
                    <MenuItem value="no-repeat">No Repeat</MenuItem>
                    <MenuItem value="repeat">Repeat</MenuItem>
                    <MenuItem value="repeat-x">Repeat X</MenuItem>
                    <MenuItem value="repeat-y">Repeat Y</MenuItem>
                </SelectField>
            </Box>
        </Box>
    );
}
