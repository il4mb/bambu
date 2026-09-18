import { Button, styled } from "@mui/material";

const ActionButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
    minWidth: "1.25rem",
    height: "1.25rem",
    padding: 0,
    borderRadius: "6px",
    fontSize: "12px",
    lineHeight: 1,
    border: "1px solid",
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
    "&:hover": {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        borderColor: theme.palette.divider,
    },
    ...(selected && {
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.divider,
        color: theme.palette.primary.contrastText,
        "&:hover": {
            backgroundColor: theme.palette.primary.dark,
            borderColor: theme.palette.divider,
        },
    }),
}));

export default ActionButton;
