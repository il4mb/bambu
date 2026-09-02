import "@bambu/node";
import "@tbela99/css-parser";
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