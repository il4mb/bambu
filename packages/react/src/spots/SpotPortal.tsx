import { ReactNode } from "react";

type SpotPortalProps = {
    children: ReactNode;
};

export default function SpotPortal({ children }: SpotPortalProps) {
    return (
        <div>
            {/* SpotPortal content goes here */}
            <h1>SpotPortal</h1>
        </div>
    );
}
