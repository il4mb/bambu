import { Select, SelectProps, styled } from "@mui/material";

export const SelectField = styled((props: SelectProps<string>) => (
    <Select
        {...props}
        MenuProps={{
            disablePortal: true,
            slotProps: {
                paper: {
                    sx: {
                        "& .MuiMenuItem-root": {
                            fontSize: "12px",
                            padding: "2px 12px",
                        },
                    },
                },
            },
        }}
    />
))({
    width: "100%",
    minHeight: "none",
    height: "1.55rem",
    fontSize: "12px",
    border: "none",
    "& .MuiSelect-select": {
        padding: "2px 8px",
    },
    "& .MuiSvgIcon-root": {
        right: "0px",
        width: ".75em",
        height: ".75em",
        top: "calc(50% - .37em)",
    },
});
