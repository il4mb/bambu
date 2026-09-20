import { Button, styled } from "@mui/material";

const ActionButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== "selected" && prop !== "color",
})<{ selected?: boolean; color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" }>(
    ({ theme, selected, color }) => ({
        minWidth: "1.25rem",
        height: "1.25rem",
        padding: 0,
        borderRadius: "6px",
        fontSize: "12px",
        lineHeight: 1,
        border: "1px solid",
        borderColor: !color || color === "inherit" ? theme.palette.divider : theme.palette[color].main,
        color: !color || color === "inherit" ? theme.palette.text.primary : theme.palette[color].main,
        "&:hover": {
            backgroundColor: !color || color === "inherit" ? theme.palette.action.hover : theme.palette[color].main,
            color: !color || color === "inherit" ? theme.palette.text.primary : theme.palette[color].contrastText,
            borderColor: theme.palette.divider,
        },
        ...(selected && {
            backgroundColor: !color || color === "inherit" ? theme.palette.action.selected : theme.palette[color].main,
            borderColor: theme.palette.divider,
            color: !color || color === "inherit" ? theme.palette.action.selected : theme.palette[color].contrastText,
            "&:hover": {
                backgroundColor:
                    !color || color === "inherit" ? theme.palette.action.selected : theme.palette[color].dark,
                borderColor: theme.palette.divider,
            },
        }),
    }),
);

export default ActionButton;
