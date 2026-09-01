import { buildBackgroundStyle } from "@/components/properties/BackgroundProperty";
import { Background } from "@/types/background";
import { Box } from "@mui/material";
import { useMemo } from "react";

type BackgroundPreviewProps = {
    background: Background;
    width: number;
    height: number;
};

export default function BackgroundPreview({ background, width, height }: BackgroundPreviewProps) {
    const style = useMemo(() => buildBackgroundStyle([background]), [background]);
    return <Box sx={{ ...style, width, height, borderRadius: 1 }} />;
}
