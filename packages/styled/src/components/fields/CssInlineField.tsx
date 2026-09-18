import { ReactNode } from 'react';

export interface CssInlineFieldProps {
    children?: ReactNode;
}
export default function CssInlineField({ children }: CssInlineFieldProps) {
    return (
        <div>
            CssInlineField Component
             {children}
        </div>
    );
}