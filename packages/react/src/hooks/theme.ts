import { useColorScheme } from "@mui/material";

type ColorMode = {
    mode: "dark" | "light",
    setMode: (mode: ColorMode['mode']) => void
}
export const useColorMode = (): ColorMode => {
    const { mode: schemeMode, systemMode, setMode } = useColorScheme();
    const isDark = schemeMode === "dark" || (schemeMode === "system" && systemMode === "dark");

    return { mode: isDark ? "dark" : "light", setMode }
}

