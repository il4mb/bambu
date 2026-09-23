// import type { NodeObject, NodeObjectData } from "@/registry";
import type { FC, JSX, ReactNode, RefObject } from "react";
import type { Model, Node } from "../core";
import type { NormalizeFunction } from "./tools";
import { Descriptor } from "./node-data";

// TOP TYPED DEFINE
export type Command<T extends ModuleName> = (this: Node<T>, ...args: any[]) => any;
export type Commands<T extends ModuleName> = {
    [K: string]: Command<T>;
};


export type BaseModel<T extends ModuleName> = {
    extends?: string;
    commands?: Commands<T>;
    actions?: string[];
    data?: Record<string, any>
}
export type DefineModel<T extends BaseModel> = T;


// MODEL OBJECT
export type Action = {
    title: string;
    icon?: Icon;
    active?: boolean;
    disabled?: boolean;
    visible?: boolean;
}
export type Actions = {
    [K: string]: Action | false
}

export type Icon = FC<{ size: number; color: string }>;

export type ComponentProps<T extends ModuleName> = { ref: RefObject<Element | nuull>; node: Node<T>; children?: ReactNode }
export type Component<T extends ModuleName> = FC<ComponentProps<T>>;



type DataDescriptor<T extends Record<string, any>> = {
    [K in keyof T]: T[K] | Omit<Descriptor, 'name'>
}

export type ModelObject<T extends ModuleName> = {
    name: string;
    icon?: Icon;
    label?: string;
    component?: Component<T>;
    onCreated?: (this: Model<T>, node: Node<T>) => void;
    /**
     * When some thing are dropped to this Node Model
     * @param this 
     * @param node 
     * @returns 
     */
    onDrop?: (this: Node<T>, dropped: Node) => void;

    isDroppable?: (this: Node<T>, target: Node) => boolean;

    isAcceptable?: (this: Node<T>, target: Node) => boolean;

} & (
        ModelRegistry[T] extends { extends: infer E extends string }
        ? { extends: E }
        : { extends?: string }
    ) & (
        ModelRegistry[T] extends { data: infer D extends Record<string, any> }
        ? {
            default: Partial<NodeObject> & {
                data: DataDescriptor<D & Partial<NodeObjectData>>;
            };
        }
        : {
            default?: Partial<NodeObject> & {
                data?: DataDescriptor<Partial<NodeObjectData>>
            }
        }
    ) & (
        ModelRegistry[T] extends { actions: readonly (infer K extends string)[] }
        ? {
            actions: {
                [P in K]: Action;
            };
        }
        : { actions?: Record<string, Action> }
    ) & (
        ModelRegistry[T] extends { commands: infer C extends Commands<T> }
        ? {
            commands: {
                [K in keyof C]: (this: Node<T>, ...args: Parameters<C[K]>) => ReturnType<C[K]>;
            };
        }
        : {
            commands?: Record<string, Command>
        }
    );