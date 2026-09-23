import { InferData } from "./infer";
import NodeData from "../core/NodeData";

export type ItemString = { name: string, type: "string", value: string };
export type ItemNumber = { name: string, type: "number", value: number };
export type ItemBoolean = { name: string, type: "boolean", value: boolean };
export type ItemObject = { name: string, type: "object", value: object };
export type ItemArray = { name: string, type: "array", value: any[] };
export type ItemUnknown = { name: string, type: "unknown", value: unknown };
export type ItemBinding = { name: string, type: "binding", target: string, path: string[] }

export type ItemAll = ItemString | ItemNumber | ItemBoolean | ItemObject | ItemArray | ItemBinding | ItemUnknown;
export type AllTypes = ItemAll["type"];
export type Descriptor = ItemAll & {
    /** Allow Rename */
    renameable?: boolean;
    /** Allow Deleting */
    deleteable?: boolean;
    /** Allow Value Editing */
    editable?: boolean;
}


export type INodeData<
    T extends ModuleName = ModuleName,
    D extends InferData<T> = InferData<T>
> = D & NodeData;
