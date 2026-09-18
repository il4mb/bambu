import { Paper } from "@mui/material";
import { ReactNode } from "react";
import WindowedHeader, { WindowHeaderProps } from "./WindowHeader";
import { useWindowProvider } from "./WindowProvider";

export interface WindowContainerProps {
    children?: ReactNode;
    slotProps?: {
        header?: Partial<WindowHeaderProps>;
    };
}
export default function WindowContainer({ children, slotProps = {} }: WindowContainerProps) {
    const { setContainer, state: { isEntering, rect } } = useWindowProvider();
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
                transition: isEntering ? "none" : "width 0.2s, height 0.2s",
            })}
        >
            <WindowedHeader title={slotProps.header?.title || "Windowed Component"} />
            {children}
        </Paper>
    );
}
