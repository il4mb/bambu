import { isEqual } from "lodash";
import { AddPrefix, CreateEventMap, EventDetail, InferNodeData, SimpleEvent } from "./types";
import EventEmitter from "./core/EventEmitter";
import Node from "./Node";
import { Descriptor, Type } from "./core/Descriptor";

const TYPE_DATA = ["string", "number", "object", "boolean", "array", "unknown", "binding"] as const;
type TNodeDataDescriptor<T extends ModuleName> = {
    [K in keyof InferNodeData<T>]: Descriptor
}

type Events<T extends ModuleName> = CreateEventMap<
    NodeData,
    'change' | AddPrefix<"change:", keyof InferNodeData<T> & string>
>;



export default class NodeData<
    T extends ModuleName = ModuleName,
    O extends Record<string, Descriptor> = TNodeDataDescriptor<T>
> extends EventEmitter<Events<T>> {

    // Allow TypeScript to recognize dynamic dot-notation properties
    [key: string]: any;

    protected descriptors: Map<string, Descriptor>;

    constructor(protected node: Node<T>, initial: InferNodeData<T>) {
        super();
        this.descriptors = new Map(Object.entries(initial).map(([key, value]) => {
            return [key, this.createItem(key, value)];
        }));

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
                if (typeof prop === "string" && target.descriptors.has(String(prop))) {
                    return target.descriptors.get(String(prop))!.value;
                }

                return undefined;
            },
            set: (target, prop, value) => {
                // Do not intercept native properties or methods
                if (prop in target) {
                    return Reflect.set(target, prop, value);
                }

                if (typeof prop === "string") {
                    // const existingItem = target.descriptors.get(String(prop));
                    // if (existingItem && existingItem.type === "binding") {
                    //     return true;
                    // }
                    const newDescriptor = target.createItem(prop, value);
                    target.set(prop, newDescriptor);
                    return true;
                }
                return false;
            }
        });
    }

    private createItem(name: string, value: any): Descriptor {
        let type: Type = "unknown";
        if (Array.isArray(value)) {
            type = "array";
        } else if (TYPE_DATA.includes(typeof value as any)) {
            type = typeof value as Type;
        }

        return new Descriptor(this, { name, type, value });
    }


    public set<K extends keyof O>(key: K, newValue: Descriptor | O[K]): void {
        const oldValue = this.descriptors.get(String(key));
        if (isEqual(oldValue, newValue)) return;

        if (newValue instanceof Descriptor) {
            // @ts-ignore Apply state change
            this.descriptors.set(key, newValue);
        } else {
            const oldDescVal = oldValue?.value;
            if (isEqual(oldDescVal, newValue)) return;
            const newDescriptor = this.createItem(String(key), newValue);
            this.descriptors.set(String(key), newDescriptor);

            const eventDetail = { target: this, property: [String(key)], oldValue, newValue: newDescriptor };
            // @ts-ignore
            this.fire(["change", `change:${String(key)}`], eventDetail);
            return;
        }

        const eventDetail = { target: this, property: [String(key)], oldValue, newValue };
        // @ts-ignore
        this.fire(["change", `change:${String(key)}`], eventDetail);
    }

    public get<K extends keyof O>(key: K): Descriptor | undefined {
        return this.descriptors.get(String(key));
    }

    public fire<K extends keyof Events<T>, O extends object = object, PV = any, V = PV>(events: K | K[], detail: EventDetail<O, PV, V>): SimpleEvent<O, PV, V> {
        const event = super.fire(events, detail);

        if (!event.isDefaultPrevented) {
            // @ts-ignore
            this.node.fire(['change', 'change:data', `change:data:${detail.property.join(":")}`], detail);
        }
        return event;
    }

    all() {
        return Array.from(this.descriptors.values());
    }

}