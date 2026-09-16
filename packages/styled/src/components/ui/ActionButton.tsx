import { Button, styled } from "@mui/material";

const ActionButton = styled(Button)(({ theme }) => ({
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
        backgroundColor: theme.palette.action.hover,
        borderColor: theme.palette.divider,
    },
}));

export default ActionButton;