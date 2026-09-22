import { styled } from "@mui/material/styles";
import TextField, { TextFieldProps } from "@mui/material/TextField";

const SelectField = styled((props: TextFieldProps) => (
    <TextField
        {...props}
        select
        slotProps={{
            select: {
                sx: {
                    "& .MuiSelect-select": {
                        padding: "2px 6px",
                    },
                },
            },
        }}
        variant="outlined"
        size="small"
    />
))({
    width: "100%",
    minHeight: "none",
    height: "1.2rem",
    fontSize: "10px",
    border: "none",
    padding: "0px",
    "& .MuiSelect-select": {
        padding: "2px 6px",
    },
    "& .MuiSvgIcon-root": {
        right: "0px",
        width: ".75em",
        height: ".75em",
        top: "calc(50% - .37em)",
    },
});

export default SelectField;
