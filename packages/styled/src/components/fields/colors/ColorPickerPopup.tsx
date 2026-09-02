import Box from "@mui/material/Box";
import { useEffect, useRef } from "react";
import AlphaSlider from "./AlphaSlider";
import HueSlider from "./HueSlider";
import SaturationZone from "./SaturationZone";
import { IColor } from "@/types/type";
import Popup from "@/components/ui/Popup";
import { Typography } from "@mui/material";
import _ from "lodash";
import { Color } from "@/libs/color";

const placeholder = Color.parse("#000");
export interface ColorPickerPopoverProps {
    anchorEl?: HTMLElement;
    value?: IColor;
    onChange?: (value: IColor) => void;
    onClose?: () => void;
    open: boolean;
}
export default function ColorPickerPopup({
    anchorEl,
    value = placeholder,
    open,
    onChange,
    onClose,
}: ColorPickerPopoverProps) {
    const valueRef = useRef({ ...placeholder, ...value });
    const handleSaturationChange = (s: number, l: number) => {
        const prev = valueRef.current ?? placeholder;
        onChange?.({ ...prev, data: { ...prev.data, s, l } });
    };

    const handleHueChange = (h: number) => {
        const prev = valueRef.current ?? placeholder;
        onChange?.({ ...prev, data: { ...prev.data, h } });
    };

    const handleAlphaChange = (a: number) => {
        const prev = valueRef.current ?? placeholder;
        onChange?.({ ...prev, alpha: a });
    };

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    return (
        <Popup anchor={anchorEl} open={open} onClose={onClose}>
            <Box
                sx={{
                    p: 1,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                }}
            >
                <SaturationZone color={value?.data} onChange={handleSaturationChange} />
                <HueSlider value={value?.data.h ?? 0} onChange={handleHueChange} />
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AlphaSlider value={value?.alpha ?? 1} color={value?.data} onChange={handleAlphaChange} />
                    <Typography sx={{ fontSize: 12, minWidth: "45px", textAlign: "right" }} component={"span"}>
                        {Math.floor((value.alpha ?? 0) * 100)}%
                    </Typography>
                </Box>
            </Box>
        </Popup>
    );
}
