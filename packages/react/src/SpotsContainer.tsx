import { ReactNode } from "react";
import { useContainer } from "./contexts/ContainerProvider";

export interface SpotsContainerProps {
    children?: ReactNode;
}
export default function SpotsContainer({ children }: SpotsContainerProps) {
    const container = useContainer();
   

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                zIndex: 9999,
            }}
        >
            {children}
        </div>
    );
}
