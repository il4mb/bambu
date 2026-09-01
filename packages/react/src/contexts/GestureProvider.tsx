import { createContext, ReactNode, useContext, useMemo } from "react";
import { useContainer } from "./ContainerProvider";
import { GestureController } from "../controllers/GestureController";

const Context = createContext<GestureController | undefined>(undefined);
export const useGestureController = () => useContext(Context);

type GestureProviderProps = {
    children?: ReactNode;
};

export default function GestureProvider({ children }: GestureProviderProps) {
    const container = useContainer();
    const controller = useMemo(() => new GestureController(container), []);
    return <Context.Provider value={controller}>{children}</Context.Provider>;
}
