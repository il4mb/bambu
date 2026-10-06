import NodeData from "../NodeData";
import { Observerable } from "./Observerable";
export type Type = typeof Descriptor.SUPPORTED_TYPE[number];
export type DescriptorState<T extends Type> = {
    type: T | "unknown";
    name: string;
    value: (T extends "unknown" ? any : T) | null;
}
export class Descriptor<T extends Type = "unknown"> extends Observerable<Descriptor<T>, DescriptorState<T>> {
    static SUPPORTED_TYPE = ["string", "number", "object", "boolean", "array", "unknown"] as const;

    state: DescriptorState<T> = {
        type: "unknown",
        name: "",
        value: null
    }

    constructor(protected data: NodeData, initial: Partial<DescriptorState<T>>) {
        super();
        this.state = {
            ...this.state,
            ...initial
        }

    }

    get type() {
        return this.state.type;
    }

    get value() {
        return this.state.value;
    }

    get name() {
        return this.state.name;
    }



}