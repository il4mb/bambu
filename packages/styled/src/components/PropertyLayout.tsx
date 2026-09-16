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
                overflow: "visible",
                ...sx,
            }}
        >
            <Typography sx={{ fontSize: 10, flex: "20%" }}>{label}</Typography>
            <Box
                sx={{
                    flex: 1,
                    fontSize: 10,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexBasis: "100px",
                    overflow: "visible",
                    ...itemSx,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
