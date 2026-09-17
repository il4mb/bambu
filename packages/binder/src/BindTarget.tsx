import { ReactElement, ReactNode } from 'react';

export interface BindTargetProps {
    children?: ReactElement<{}>
}
export default function BindTarget({ children }: BindTargetProps) {
    return (
        <div>
            BindTarget Component
             {children}
        </div>
    );
}