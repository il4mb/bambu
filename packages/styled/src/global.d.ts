import "@bambu/node";
import { CSSProperties } from "react";

declare module '@tbela99/css-parser/web' {
    export * from '@tbela99/css-parser';
}


declare global {
    interface NodeObject {
        computed?: CSSStyleDeclaration;
    }
    interface NodeObjectData {
        style: {
            [K in keyof CSSProperties]: CSSProperties[K];
        },

    }
}