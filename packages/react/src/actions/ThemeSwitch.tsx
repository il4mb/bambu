import { useColorMode } from "@/hooks";
import { IconButton } from "@mui/material";
import { Moon, Sun } from "lucide-react";

export interface ThemeSwitchProps {}
export default function ThemeSwitch({}: ThemeSwitchProps) {
    const { mode, setMode } = useColorMode();
    const toggleMode = () => setMode(mode === "dark" ? "light" : "dark");
    return (
        <IconButton onClick={toggleMode} size="medium">
            {mode === "dark" ? <Sun size={12} /> : <Moon size={12} />}
        </IconButton>
    );
}
