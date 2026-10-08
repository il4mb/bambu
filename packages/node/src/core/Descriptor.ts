import NodeData from "../NodeData";
import { ChangeEvent, CreateEventMap, EventDetail, EventInstance, SimpleEvent } from "../types";
import { Observerable } from "./Observerable";
export type Type = typeof Descriptor.SUPPORTED_TYPE[number];
export type DescriptorState<T extends Type> = {
    type: T;
    name: string;
    value: (T extends "unknown" ? any : T) | null;
    renameable: boolean;
    editable: boolean
}
export class Descriptor<
    T extends Type = Type,
    S extends DescriptorState<T> = DescriptorState<T>
> extends Observerable<Descriptor<T>, S> {
    static SUPPORTED_TYPE = ["string", "number", "object", "boolean", "array", "unknown"] as const;

    state: S = {
        type: "unknown" as T,
        name: "",
        value: null,
        renameable: true,
        editable: true
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


    get renameable() {
        return this.state.renameable;
    }

    get editable() {
        return this.state.editable;
    }

    public fire<K extends keyof CreateEventMap<Descriptor<T, DescriptorState<T>>, S>, PV = any, V = PV>(events: K | K[], detail?: EventDetail<PV, V> | undefined): SimpleEvent<Descriptor<T, DescriptorState<T>>> | ChangeEvent<Descriptor<T, DescriptorState<T>>, PV, V> {
        const event = super.fire(events, detail);

        if (!event.isDefaultPrevented) {
            this.data.fire([this.name, `${this.name}:${detail.property.join(":")}`], detail);
        }
        return event;
    }
}