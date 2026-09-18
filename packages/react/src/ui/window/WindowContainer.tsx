import { Box, Paper, styled } from "@mui/material";
import { ReactNode } from "react";
import WindowedHeader, { WindowHeaderProps } from "./WindowHeader";
import { useWindowProvider } from "./WindowProvider";

const ResizeHandle = styled("div")({
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    cursor: "nwse-resize",
    touchAction: "none",
    zIndex: 1,
    background:
        "linear-gradient(135deg, transparent 0 50%, #cccccc99 50% 60%, transparent 60% 70%, #cccccc99 70% 80%, transparent 80% 100%)",
});

export interface WindowContainerProps {
    children?: ReactNode;
    /** Show the bottom-right resize handle. Default true. */
    resizable?: boolean;
    slotProps?: {
        header?: Partial<WindowHeaderProps>;
    };
}

export default function WindowContainer({ children, resizable = true, slotProps = {} }: WindowContainerProps) {
    const {
        setContainer,
        state: { isEntering, isDragging, isResizing, rect },
        startResize,
    } = useWindowProvider();

    return (
        <Paper
            component="div"
            ref={setContainer}
            elevation={3}
            sx={(theme) => ({
                position: "fixed",
                top: `${rect.y ?? 0}px`,
                left: `${rect.x ?? 0}px`,
                boxShadow: "0px 0px 1px #5555558e, 0px 0px 4px #cccccc46",
                background: theme.palette.background.paper,
                borderRadius: "4px",
                zIndex: 1300,
                width: isEntering ? "auto" : `${rect.width}px`,
                height: isEntering ? "auto" : `${rect.height}px`,
                // No easing while the user is actively moving/resizing it -
                // a transition fighting a pointer-driven update reads as lag.
                transition: isEntering || isDragging || isResizing ? "none" : "all .1s ease-in-out",
                userSelect: isDragging || isResizing ? "none" : undefined,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            })}
        >
            <WindowedHeader title={slotProps.header?.title || "Windowed Component"} />
            <Box
                sx={{ flex: 1, minHeight: 0, overflow: "auto" }}
            >
                {children}
            </Box>
            {resizable && (
                <ResizeHandle onPointerDown={(e) => startResize(e.clientX, e.clientY)} />
            )}
        </Paper>
    );
}