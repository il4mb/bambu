import { isEqual } from "lodash";
import { CreateEventMap, InferNodeData } from "../types";
import EventEmitter, { EventDetail, SimpleEvent } from "./EventEmitter";
import Node from "./Node";

const TYPE_DATA = ["string", "number", "object", "boolean", "array", "unknown", "binding"] as const;
type TypeName = typeof TYPE_DATA[number];
type Descriptor = {
    name: string;
    value: any;
    type: TypeName;

}
type TNodeData<T extends ModuleName, O extends InferNodeData<T> = InferNodeData<T>> = {
    [K in keyof O]: Descriptor
}

export type INodeData<T extends ModuleName, D extends InferNodeData<T> = InferNodeData<T>> = {
    [K in keyof D]: D[K];
} & NodeData<T>;

export default class NodeData<
    T extends ModuleName,
    O extends Record<string, Descriptor> = TNodeData<T>
> extends EventEmitter<{ change: [SimpleEvent] } & CreateEventMap<O, 'change:'>> {

    // Allow TypeScript to recognize dynamic dot-notation properties
    [key: string]: any;

    protected state: O;

    constructor(protected node: Node<T>, initial: InferNodeData<T>) {
        super();
        this.state = Object.fromEntries(Object.entries(initial).map(([key, value]) => {
            return [key, this.createItem(key, value)];
        })) as O;

        return new Proxy(this, {
            get: (target, prop) => {
                // Check if the property exists on the class/EventTarget
                if (prop in target) {
                    const value = Reflect.get(target, prop);
                    if (typeof value === 'function') {
                        // @ts-ignore
                        return value.bind(target);
                    }
                    return value;
                }

                // Extract the actual value from the descriptor
                if (typeof prop === "string" && target.state[prop]) {
                    return target.state[prop].value;
                }

                return undefined;
            },
            set: (target, prop, value) => {
                // Do not intercept native properties or methods
                if (prop in target) {
                    return Reflect.set(target, prop, value);
                }

                if (typeof prop === "string") {
                    const existingItem = target.state[prop];
                    if (existingItem && existingItem.type === "binding") {
                        return true;
                    }

                    // Create new descriptor and push through Observable
                    const newDescriptor = target.createItem(prop, value);

                    target.set(prop, newDescriptor);

                    return true;
                }

                return false;
            }
        });
    }

    createItem(name: string, value: any): Descriptor {
        let type: TypeName = "unknown";

        // 7. Fix JS typeof quirk: typeof [] is "object"
        if (Array.isArray(value)) {
            type = "array";
        } else if (TYPE_DATA.includes(typeof value as any)) {
            type = typeof value as TypeName;
        }

        return { name, value, type };
    }


    public set<K extends keyof O>(key: K, newValue: Descriptor): void {
        const oldValue = this.state[key];
        if (isEqual(oldValue, newValue)) return;

        // @ts-ignore Apply state change
        this.state[key] = newValue;

        const eventDetail = { target: this, property: [String(key)], oldValue, newValue };
        this.fire(["change", `change:${String(key)}`], eventDetail);
    }

    public get<K extends keyof O>(key: K): Descriptor {
        return this.state[key];
    }


    public fire<K extends "change" | keyof CreateEventMap<O, "change:">, T extends object = object, V = any>(events: K | K[], detail: EventDetail<T, V>) {
        super.fire(events, detail);
        // @ts-ignore
        this.node.fire(['change', 'change:data', `change:data:${detail.property.join(":")}`], detail);
    }
}