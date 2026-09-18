import { JSX } from "react/jsx-runtime";
import { CSSProperties } from "react";

export type Primitive =
    | string
    | number
    | boolean
    | bigint
    | symbol
    | null
    | undefined;

export type Unsupported =
    | Element
    | Function
    | Date
    | RegExp
    | Map<any, any>
    | Set<any>
    | WeakMap<any, any>
    | WeakSet<any>;

export type ToPlain<T> =
    T extends Primitive
    ? T
    : T extends Unsupported
    ? never
    : T extends object
    ? {
        [K in keyof T as ToPlain<T[K]> extends never ? never : K]?: ToPlain<T[K]>
    }
    : never;

declare global {
    export interface ModelRegistry { }
    export type ModuleName = keyof ModelRegistry;

    export interface NodeObjectData {

    }
    export interface NodeObject {
        id: string;
        tagName: keyof JSX.IntrinsicElements
        order: number;
        parent: string | null;
        data: NodeData;
        style?: Partial<CSSProperties>;
    }

    export type PlainNode<T extends ModuleName = ModuleName> = ToPlain<NodeObject> & {
        type?: T
        children?: PlainNode[]
    }
}