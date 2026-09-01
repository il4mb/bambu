import { SolidBackground } from "@/types/background";
import { Box, Typography } from "@mui/material";
import ColorBox from "../colors/ColorBox";
import { useMemo } from "react";
import { Color } from "@/libs/color";

type SolidBackgroundFieldProps = {
    value: SolidBackground;
    onChange?: (value: SolidBackground) => void;
};

export default function SolidBackgroundField({ value, onChange }: SolidBackgroundFieldProps) {
    const colorString = useMemo(() => Color.format(value.color), [value.color]);

    return (
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 12, fontFamily: "monospace" }}>{colorString}</Typography>
            <ColorBox color={colorString} />
        </Box>
    );
}
