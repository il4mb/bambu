import { createContext, ReactNode, useContext, useEffect, useMemo } from "react";
import { StyledController } from "./StyledController";
import { useContainer } from "@bambu/react";

const Context = createContext<StyledController | undefined>(undefined);
export const useStyleController = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useStyleController must with in StyleProvider");
    return ctx;
};

type Api = {
    fetch: (params: URLSearchParams) => Promise<any>;
};
type StyledProviderProps = {
    children?: ReactNode;
    fontsApi?: Api;
};

export default function StyledProvider({ children, fontsApi }: StyledProviderProps) {
    const container = useContainer();
    const controller = useMemo(() => new StyledController(container), []);

    useEffect(() => {
        if (!fontsApi) return;
        return controller.setFontsApi(fontsApi);
    }, [fontsApi]);

    return <Context.Provider value={controller}>{children}</Context.Provider>;
}
