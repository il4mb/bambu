import { createContext, ReactNode, useContext, useMemo } from "react";
import { StyledController } from "./StyledController";
import { useContainer } from "@bambu/react";

const Context = createContext<StyledController | undefined>(undefined);
export const useStyleController = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useStyleController must with in StyleProvider");
    return ctx;
};

type StyledProviderProps = {
    children?: ReactNode;
};

export default function StyledProvider({ children }: StyledProviderProps) {
    const container = useContainer();
    const controller = useMemo(() => new StyledController(container), []);
    return <Context.Provider value={controller}>{children}</Context.Provider>;
}
