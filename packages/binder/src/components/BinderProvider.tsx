import { createContext, useContext, ReactNode, useMemo, useEffect } from "react";
import { BinderController } from "../BinderController";
import { useContainer } from "@bambu/react";
import { Node } from "@bambu/node";

const BinderProviderContext = createContext<BinderController | undefined>(undefined);

type BinderProviderProps = {
    children?: ReactNode;
};
export const BinderProvider = ({ children }: BinderProviderProps) => {
    const container = useContainer();
    const controller = useMemo(() => new BinderController(container), []);

    useEffect(() => {
        return controller.on("node:event", (event: { node: Node; value: string }) => {
            const { node, value } = event;
            // Handle the event as needed
            
            console.log(`Event fired on node ${node.id}:  ${value}`);
        });
    }, [controller]);

    return <BinderProviderContext.Provider value={controller}>{children}</BinderProviderContext.Provider>;
};

export const useBinderProvider = () => {
    const context = useContext(BinderProviderContext);
    if (!context) throw new Error("useBinderProvider must be used within a BinderProviderProvider");
    return context;
};
