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

    export interface Api {
        fetch: (params?: URLSearchParams) => Promise<any>;
    }

    export interface FontItem {
        family: string
        variants: string[]
        subsets: string[]
        version: string
        lastModified: string
        files: FontFiles
        category: string
        kind: string
        menu: string
        colorCapabilities?: string[]
    }

    export interface FontFiles {
        regular?: string
        italic?: string
        "500"?: string
        "600"?: string
        "700"?: string
        "800"?: string
        "100"?: string
        "200"?: string
        "300"?: string
        "900"?: string
        "100italic"?: string
        "200italic"?: string
        "300italic"?: string
        "500italic"?: string
        "600italic"?: string
        "700italic"?: string
        "800italic"?: string
        "900italic"?: string
    }
}