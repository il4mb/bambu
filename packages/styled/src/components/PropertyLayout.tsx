import { Box, SxProps, Typography } from "@mui/material";
import { ReactNode } from "react";

export interface PropertyProps {
    label: string;
    children?: ReactNode;
    sx?: SxProps;
    itemSx?: SxProps;
}
export default function PropertyLayout({ label, children, sx, itemSx }: PropertyProps) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
                ...sx,
            }}
        >
            <Typography sx={{ fontSize: 12, flex: "50%" }}>{label}</Typography>
            <Box
                sx={{
                    flex: 1,
                    fontSize: 12,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexBasis: "100px",
                    ...itemSx,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
