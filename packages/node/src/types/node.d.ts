import NodeData from "../NodeData";
import { Commands } from "./define";

export type InferNodeData<T extends ModuleName> =
    NodeDataOverridable &
    (
        ModelRegistry[T] extends {
            extends: infer P extends ModuleName;
        }
        ? (ModelRegistry[T] extends { data: infer D } ? D : {}) & InferNodeData<P>
        : ModelRegistry[T] extends { data: infer D }
        ? D : {}
    );

export type InferNodeCommands<T extends ModuleName> =
    ModelRegistry[T] extends {
        extends: infer P extends ModuleName;
    }
    ? (ModelRegistry[T] extends { commands: infer C extends Commands } ? C : {}) & InferNodeCommands<P>
    : ModelRegistry[T] extends { commands: infer C extends Commands }
    ? C : {};

export type ShallowOptionalNode<T extends ModuleName = ModuleName> = Partial<Omit<NodeObject, 'data'>> & {
    type?: T;
    data?: Partial<InferNodeData<T>>;
    children?: ShallowOptionalNode[];
}



// export type ItemString = { name: string, type: "string", value: string };
// export type ItemNumber = { name: string, type: "number", value: number };
// export type ItemBoolean = { name: string, type: "boolean", value: boolean };
// export type ItemObject = { name: string, type: "object", value: object };
// export type ItemArray = { name: string, type: "array", value: any[] };
// export type ItemUnknown = { name: string, type: "unknown", value: unknown };
// export type ItemBinding = { name: string, type: "binding", target: string, path: string[] }

// export type ItemAll = ItemString | ItemNumber | ItemBoolean | ItemObject | ItemArray | ItemBinding | ItemUnknown;
// export type AllTypes = ItemAll["type"];
// export type Descriptor<T extends AllTypes = AllTypes> = Omit<ItemAll, 'type'> & {
//     type: T,
//     /** Allow Rename */
//     renameable?: boolean;
//     /** Allow Deleting */
//     deleteable?: boolean;
//     /** Allow Value Editing */
//     editable?: boolean;
// }


export type INodeData<
    T extends ModuleName = ModuleName,
    D extends InferNodeData<T> = InferNodeData<T>
> = D & NodeData<T>;
