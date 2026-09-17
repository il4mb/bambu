import { ReactNode } from 'react';

export interface VarsManagerProps {
    children?: ReactNode;
}
export default function VarsManager({ children }: VarsManagerProps) {
    return (
        <div>
            VarsManager Component
             {children}
        </div>
    );
}