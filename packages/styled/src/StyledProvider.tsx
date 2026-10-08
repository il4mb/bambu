import { createContext, ReactNode, useContext, useMemo } from "react";
import { useContainer } from "@bambu/react";
import { StyleManager } from "@bambu/node";

const Context = createContext<StyleManager | undefined>(undefined);
export const useStyleManager = () => {
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

export default function StyledProvider({
    children,
    fontsApi,
}: StyledProviderProps) {
    const container = useContainer();
    const controller = useMemo(() => container.Styles, []);

    // useEffect(() => {
    //     if (!fontsApi) return;
    //     return controller.setFontsApi(fontsApi);
    // }, [fontsApi]);

    return <Context.Provider value={controller}>{children}</Context.Provider>;
}
