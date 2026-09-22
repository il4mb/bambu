import { PointerEvent as ReactPointerEvent, ReactNode, MouseEvent as ReactMouseEvent } from "react";
import { useWindowProvider } from "./WindowProvider";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { Minimize2, Maximize2, X } from "lucide-react";

export type WindowHeaderProps = {
    title?: ReactNode;
};

export default function WindowHeader({ title }: WindowHeaderProps) {
    const {
        state: { isMaximized },
        startDrag,
        toggleMaximize,
        close,
    } = useWindowProvider();

    const handleToggleMaximize = (e: ReactMouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        toggleMaximize();
    };

    const handleClose = (e: ReactMouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        close();
    };

    const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        // Ignore drags started on the action buttons themselves.
        if ((e.target as HTMLElement).closest("button")) return;
        e.stopPropagation();
        startDrag(e.clientX, e.clientY);
    };

    return (
        <Box
            onPointerDown={onPointerDown}
            onDoubleClick={() => toggleMaximize()}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px",
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                cursor: "grab",
                touchAction: "none",
                flex: "0 0 auto",
                "&:active": { cursor: "grabbing" },
            }}
        >
            <Typography component="div" variant="subtitle2" noWrap>
                {title}
            </Typography>
            <Stack direction="row" spacing={1}>
                <IconButton size={"small"} color="secondary" onClick={handleToggleMaximize}>
                    {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                </IconButton>
                <IconButton size={"small"} color={"error"} onClick={handleClose}>
                    <X size={12} />
                </IconButton>
            </Stack>
        </Box>
    );
}
