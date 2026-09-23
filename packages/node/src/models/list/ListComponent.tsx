import { ReactNode } from 'react';

export interface ListComponentProps {
    children?: ReactNode;
}
export default function ListComponent({ children }: ListComponentProps) {
    return (
        <div>
            ListComponent Component
             {children}
        </div>
    );
}