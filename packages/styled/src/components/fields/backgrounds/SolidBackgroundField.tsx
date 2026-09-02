import { SolidBackground } from "@/types/background";
import { Box, Typography } from "@mui/material";
import ColorBox from "../colors/ColorBox";
import { useMemo, useRef, useState } from "react";
import { Color } from "@/libs/color";
import ColorPickerPopup from "../colors/ColorPickerPopup";
import { IColor } from "@/types/type";
import { useLatest } from "@/hooks/useLatest";

type SolidBackgroundFieldProps = {
    value: SolidBackground;
    onChange?: (value: SolidBackground) => void;
};

export default function SolidBackgroundField({ value, onChange }: SolidBackgroundFieldProps) {
    const [open, setOpen] = useState(false);
    const colorString = useMemo(() => Color.format(value.color), [value.color]);

    const valueRef = useLatest(value);
    const anchorRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setOpen((p) => !p);

    const handleColorChange = (color: IColor) => {
        onChange?.({ ...valueRef.current, color });
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 12, fontFamily: "monospace", textTransform: "uppercase" }}>
                {colorString}
            </Typography>
            <ColorBox ref={anchorRef} color={colorString} onClick={toggleOpen} />
            <ColorPickerPopup
                anchorEl={anchorRef.current}
                open={open}
                value={value?.color}
                onChange={handleColorChange}
                onClose={toggleOpen}
            />
        </Box>
    );
}
