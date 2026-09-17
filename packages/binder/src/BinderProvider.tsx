import { createContext, useContext, useState, ReactNode } from 'react';

interface BinderProviderState {

}

const BinderProviderContext = createContext<BinderProviderState | undefined>(undefined);

type BinderProviderProps = {
    children?: ReactNode;
}
export const BinderProvider = ({ children }: BinderProviderProps) => {
    const [state, setState] = useState<any>();

    return (
        <BinderProviderContext.Provider value={{ state, setState }}>
            {children}
        </BinderProviderContext.Provider>
    );
};

export const useBinderProvider = () => {
    const context = useContext(BinderProviderContext);
    if (!context) throw new Error('useBinderProvider must be used within a BinderProviderProvider');
    return context;
};