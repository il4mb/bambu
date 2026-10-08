import { ReactNode } from 'react';

export interface PanelProps {
    children?: ReactNode;
}
export default function Panel({ children }: PanelProps) {
    return (
        <div>
            Panel Component
             {children}
        </div>
    );
}