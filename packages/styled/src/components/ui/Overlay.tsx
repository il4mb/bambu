import Box from "@mui/material/Box";
import { CSSProperties, MouseEvent } from "react";

type BlockingOverlayProps = {
    open: boolean;
    cursor?: CSSProperties["cursor"];
    onClick?: (e: MouseEvent) => void;
    zIndex?: number;
    blocking?: boolean;
};

export default function Overlay({ open, cursor, zIndex = 9999, blocking = false, onClick }: BlockingOverlayProps) {
    if (!open) return null;
    return (
        <Box
            onClick={onClick}
            sx={{
                position: "fixed",
                inset: 0,
                zIndex,
                cursor: cursor ?? "not-allowed",
                pointerEvents: blocking ? "all" : "auto",
            }}
        />
    );
}
