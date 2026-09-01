import { TextField as MUITextField, SelectProps, styled, TextFieldProps } from "@mui/material";

export const TextField = styled((props: TextFieldProps) => <MUITextField {...props} />)({
    width: "100%",
    minHeight: "none",
    // height: "1.5em",
    fontSize: "12px",

    "& .MuiFormLabel-root": {
        fontSize: "12px",
    },
    " & input": {
        padding: "4px 6px",
    },
});
