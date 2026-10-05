import { Container, Register, ShallowOptionalNode } from "@bambu/node";
import { createContext, ReactNode, useContext, useMemo } from "react";

const Context = createContext<Container | undefined>(undefined);
export const useContainer = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useContainer must with in ContainerProvider");
    return ctx;
};

type ContainerProviderProps = {
    register: Register;
    children?: ReactNode;
    initialValue?: ShallowOptionalNode[];
};

export default function ContainerProvider({
    children,
    register,
    initialValue,
}: ContainerProviderProps) {
    const container = useMemo(
        () => new Container(register, { initialData: initialValue ?? [] }),
        [],
    );
    return <Context.Provider value={container}>{children}</Context.Provider>;
}
