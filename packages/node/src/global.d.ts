import { JSX } from "react/jsx-runtime";
import { CSSProperties } from "react";
import { SimpleEvent } from "./types";

declare global {
    export interface ModelRegistry { }
    export type ModuleName = keyof ModelRegistry;

    export interface NodeDataOverridable {
        style?: CSSProperties;
    }

    export type NodeObject = {
        id: string;
        tagName: keyof JSX.IntrinsicElements
        order: number;
        parent: string | null;
        data: Record<string, any>
    }
}