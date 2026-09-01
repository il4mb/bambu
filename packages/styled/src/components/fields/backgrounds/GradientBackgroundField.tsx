import { Box, Typography } from "@mui/material";
import ColorStopField from "../colors/ColorStopField";
import { IColorStop } from "@/types/type";
import { useEffect, useRef } from "react";
import { GradientBackground } from "@/types/background";
import RotaryField from "@/components/fields/RotaryField";
import { UnitObject } from "@/libs/units";

type GradientBackgroundFieldProps = {
    value: GradientBackground;
    onChange?: (value: GradientBackground) => void;
};

export default function GradientBackgroundField({ value, onChange }: GradientBackgroundFieldProps) {
    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const onColorsChange = (colors: IColorStop[]) => {
        onChange?.({ ...valueRef.current, colors });
    };

    const onAngleChange = (angle: UnitObject<"deg">) => {
        onChange?.({ ...valueRef.current, angle });
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {value.type === "linear" && (
                <RotaryField value={value.angle ?? { value: 0, unit: "deg" }} onChange={onAngleChange} />
            )}

            <Typography variant="caption" color="text.secondary">
                Color Stops:
            </Typography>
            <ColorStopField value={value.colors} onChange={onColorsChange} />
        </Box>
    );
}
