import { useEffect, useMemo, useState, ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";
import { inputsCustomizations } from "./customizations/inputs";
import { dataDisplayCustomizations } from "./customizations/dataDisplay";
import { feedbackCustomizations } from "./customizations/feedback";
import { navigationCustomizations } from "./customizations/navigation";
import { surfacesCustomizations } from "./customizations/surfaces";
import { colorSchemes, typography, shadows, shape } from "./themePrimitives";
// @ts-ignore
import FigtreeTtf from "./fonts/Figtree.ttf";
import { CssBaseline } from "@mui/material";

console.log(FigtreeTtf);

const THEME_MODE_STORAGE_KEY = "theme-mode";

interface Props {
    children: ReactNode;
    themeComponents?: ThemeOptions["components"];
}

export default function Theme({ children, themeComponents }: Props) {
    const [mounted, setMounted] = useState(false);

    const theme = useMemo(() => {
        const palette = colorSchemes["light"]?.palette ?? colorSchemes.light.palette;
        const customShadows = shadows["light"] ?? shadows.light;
        return createTheme({
            palette,
            cssVariables: {
                colorSchemeSelector: "data-color-scheme",
                cssVarPrefix: "template",
            },
            colorSchemes,
            typography,
            shadows: customShadows,
            shape,
            components: {
                ...inputsCustomizations,
                ...dataDisplayCustomizations,
                ...feedbackCustomizations,
                ...navigationCustomizations,
                ...surfacesCustomizations,
                ...themeComponents,
                MuiCssBaseline: {
                    styleOverrides: {
                        "@font-face": {
                            fontFamily: "Figtree",
                            src: `url(${FigtreeTtf}) format("truetype")`,
                            fontWeight: "100 900",
                            fontStyle: "normal",
                            fontDisplay: "swap",
                        },
                    },
                },
            },
        });
    }, [themeComponents]);

    useEffect(() => {
        let delay = setTimeout(() => {
            if (typeof window === "undefined") return;
            const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY) as "light" | "dark" | null;
            if (!savedMode) {
                localStorage.setItem(THEME_MODE_STORAGE_KEY, "dark");
            }
            setMounted(true);
        }, 100);
        return () => clearTimeout(delay);
    }, []);

    if (!mounted) return null;

    return (
        <ThemeProvider theme={theme} modeStorageKey={THEME_MODE_STORAGE_KEY} disableTransitionOnChange>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
