import { createContext, ReactNode, useContext, useMemo } from "react";
import { useContainer } from "./ContainerProvider";
import { Devices, ViewportController } from "@/controllers/ViewportController";

const Context = createContext<ViewportController | undefined>(undefined);

/**
 * Hook to access the ViewportController instance.
 * Throws an error if invoked outside of a ViewportProvider.
 */
export const useViewportController = (): ViewportController => {
    const controller = useContext(Context);
    if (!controller) {
        throw new Error("useViewportController must be used within a ViewportProvider");
    }
    return controller;
};

export const DEFAULT_DEVICES: Devices = {
    desktop: {
        label: "Desktop",
        width: 1440,
        height: 900,
    },
    tablet: {
        label: "Tablet",
        width: 768,
        height: 1024,
    },
    mobile: {
        label: "Mobile",
        width: 375,
        height: 812,
    },
};

type ViewportProviderProps<D extends Devices> = {
    children?: ReactNode;
    devices?: D;
    initialDevice?: keyof D & string;
};

export default function ViewportProvider<D extends Devices = typeof DEFAULT_DEVICES>({
    children,
    devices = DEFAULT_DEVICES as D,
    initialDevice = "mobile" as keyof D & string,
}: ViewportProviderProps<D>) {
   
    const container = useContainer();
    const controller = useMemo(
        () => new ViewportController<any>(container, devices, initialDevice),
        [container, devices, initialDevice]
    );

    return <Context.Provider value={controller}>{children}</Context.Provider>;
}