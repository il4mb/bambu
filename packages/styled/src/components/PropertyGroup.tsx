import { Box, Fade, IconButton, SxProps, Typography } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode, useState } from "react";

export interface PropertyProps {
    label: string;
    children?: ReactNode;
    sx?: SxProps;
    itemSx?: SxProps;
    defaultExpanded?: boolean;
    actions?: ReactNode;
}
export default function PropertyGroup({
    label,
    children,
    defaultExpanded = false,
    actions,
}: PropertyProps) {
    const [expand, setExpand] = useState(defaultExpanded);
    const toggleExpand = () => setExpand((prev) => !prev);
    return (
        <Box>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12, flex: 1 }} component={"span"}>
                    {label}
                </Typography>
                <IconButton onClick={toggleExpand}>
                    {expand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </IconButton>
                {actions}
            </Box>
            <Fade in={expand}>
                <Box>{children}</Box>
            </Fade>
        </Box>
    );
}
