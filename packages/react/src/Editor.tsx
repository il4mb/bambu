import { ReactNode } from 'react';

export interface EditorProps {
    children?: ReactNode;
}
export default function Editor({ children }: EditorProps) {
    return (
        <div>
            Editor Component
             {children}
        </div>
    );
}