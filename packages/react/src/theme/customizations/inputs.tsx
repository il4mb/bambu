import { Theme, Components, alpha } from "@mui/material/styles";
import { COLOR_SCHEME } from "../themePrimitives";

export const inputsCustomizations: Components<Theme> = {
    MuiTextField: {
        styleOverrides: {
            root: {
                "& .MuiInputBase-root": {
                    fontSize: "1em",
                },
                "& .MuiInputLabel-root": {
                    fontSize: "1em",
                    transform: "translate(1em, 35%) scale(1)",
                    "&[data-shrink=true]": {
                        transform: "translate(1em, -50%) scale(.75)",
                    },
                },
                "& input, .MuiSelect-select": {
                    padding: ".5em 1em",
                },
                "& .MuiSvgIcon-root": {
                    width: ".75em",
                    height: ".75em",
                    top: "calc(50% - .4em)",
                },
            },
        },

        variants: [
            {
                props: { size: "small" },
                style: { fontSize: "10px" },
            },
            {
                props: { size: "medium" },
                style: { fontSize: "12px" },
            },
        ],
    },

    MuiSelect: {
        styleOverrides: {},
    },

    MuiIconButton: {
        styleOverrides: {
            root: ({ theme, ownerState }) => {
                return {
                    minWidth: 0,
                    minHeight: 0,
                    padding: "4px",
                    borderRadius: "4px",
                    variants: COLOR_SCHEME.map((colorName) =>
                        ["small", "medium", "large"].map((size, i) => ({
                            props: {
                                color: colorName,
                                size,
                            },
                            style: {
                                backgroundColor: alpha(theme.palette[colorName].main, 0.25),
                                color: theme.palette[colorName].main,
                                padding: `${2 + 2 * (i + 1)}px`,
                                boxShadow: `0px 0px 0px 1px ${alpha(theme.palette[colorName].main, 0.5)}`,

                                "&:hover": {
                                    backgroundColor: alpha(theme.palette[colorName].main, 0.75),
                                    color: theme.palette.getContrastText(theme.palette[colorName].main),
                                },

                                ...theme.applyStyles("dark", {
                                    color: theme.palette[colorName].light,
                                }),

                                ...(ownerState.active && {
                                    backgroundColor: alpha(theme.palette[colorName].main, 0.85),
                                    color: theme.palette.getContrastText(theme.palette[colorName].main),
                                    "&:hover": {
                                        backgroundColor: theme.palette[colorName].main,
                                        color: theme.palette.getContrastText(theme.palette[colorName].main),
                                    },
                                }),
                            },
                        })),
                    ).flat(),
                };
            },
        },
    },
};
