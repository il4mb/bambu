"use client";
import { Theme, Components } from "@mui/material/styles";

export const inputsCustomizations: Components<Theme> = {
    MuiTextField: {
        styleOverrides: {
            root: {
                "& .MuiInputBase-root": {
                    fontSize: "1em",
                },
                "& .MuiInputLabel-root": {
                    fontSize: "1em",
                    transform: "translate(1em, calc(60% - .5em)) scale(1)",

                    "&[data-shrink=true]": {
                        transform: "translate(calc(1em + calc(.4 * 1em)), -50%) scale(.75)",
                    },
                },
                "& input, .MuiSelect-select": {
                    padding: "4px 8px",
                },
            },
        },

        variants: [
            {
                props: {
                    size: "small",
                },
                style: {
                    fontSize: "10px",
                },
            },
            {
                props: {
                    size: "medium",
                },
                style: {
                    fontSize: "12px",
                },
            },
        ],
    },
};
