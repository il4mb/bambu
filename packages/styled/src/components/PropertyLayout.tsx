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
                px: 1,
                py: 0.5,
                // borderRadius: 1,
                // backgroundColor: "background.paper",
                // border: "1px solid",
                // borderColor: "divider",
                gap: 1,
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
                    ...itemSx,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
