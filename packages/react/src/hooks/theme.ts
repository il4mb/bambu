import { useColorScheme } from "@mui/material";

export const useIsDarkMode = () => {
    const { mode, systemMode } = useColorScheme();
    return mode === "dark" || (mode === "system" && systemMode === "dark");
}