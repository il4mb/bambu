import { AllTypes, Descriptor, ItemBinding, ItemArray, ItemBoolean, ItemNumber, ItemObject, ItemString, ItemUnknown, ItemAll } from "../types/node-data";
import Node from "./Node";


const KNOWN_TYPE = [
    "string", "number", "object", "array", "boolean", "binding", "unknown"
];
/**
 * Manages and formats structured data items for node properties.
 *
 * `NodeData` converts a key-value object into an array of typed `NodeProperty` items.
 * It uses a JavaScript `Proxy` to support direct property reads and writes, seamlessly
 * syncing object property access with the underlying `items` collection.
 *
 * @example
 * ```ts
 * const data = new NodeData({ title: "My Node", count: 5 });
 *
 * // Property-style dynamic access via Proxy
 * console.log(data.title); // "My Node"
 * data.count = 10;         // Updates existing property
 * data.newItem = "Value";  // Adds a new property
 *
 * // Standard method interface
 * data.get("title");       // Returns NodeProperty object
 * data.delete("title");    // Removes item from internal array
 * ```
 */
export default class NodeData {
    /** Array storing all node property descriptors. */
    public readonly descriptors: Descriptor[] = [];
    private bindValues: Map<string, any> = new Map();

    /**
     * Initializes a new `NodeData` instance and sets up the Proxy wrapper.
     *
     * @param plainData - Plain object containing initial key-value pairs or `ItemAll` objects.
     */
    constructor(readonly node: Node, plainData: NodeObjectData) {
        for (const [name, value] of Object.entries(plainData)) {
            this.descriptors.push(this.createItem(name, value));
        }

        console.log(this.descriptors)

        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof prop === "string") {
                    const item = target.descriptors.find(item => item.name === prop);
                    if (item) {
                        if (item?.type === "binding") {
                            return target.bindValues.get(item.name);
                        }
                        return item.value;
                    }
                }
                return Reflect.get(target, prop);
            },
            set: (target, prop, value) => {
                console.log("Set Prop", prop, value)
                if (typeof prop === "string") {
                    const item = target.descriptors.find(item => item.name === prop);
                    if (item) {
                        if (item.type !== "binding") {
                            item.value = value;
                        }
                    } else {
                        target.descriptors.push(target.createItem(prop, value));
                    }
                }
                return Reflect.set(target, prop, value);
            }
        });
    }

    /**
     * Constructs a `NodeProperty` object from a name and value.
     */
    private createItem(name: string, value: any): Descriptor {

        if (NodeData.isUserDefined(value)) {
            return {
                // @ts-ignore
                name: name,
                renameable: false,
                deleteable: false,
                editable: value.type !== "binding",
                ...value,
            };
        }
        return {
            name,
            type: NodeData.getType(value),
            value: value,
            renameable: false,
            deleteable: false,
            editable: true
        } as Descriptor;
    }

    /**
     * Infers the `AllTypes` identifier string for a given value.
     */
    static getType(value: any): AllTypes {
        if (NodeData.isBinding(value)) return "binding";
        if (typeof value === "string") return "string";
        if (typeof value === "number") return "number";
        if (typeof value === "boolean") return "boolean";
        if (Array.isArray(value)) return "array";
        if (value && typeof value === "object") return "object";
        return "unknown";
    }

    /**
     * Type guard verifying whether a value matches the predefined `ItemAll` shape.
     */
    static isUserDefined(value: any): value is ItemAll {
        return typeof value === "object" && value !== null && "type" in value && KNOWN_TYPE.includes(String(value.type));
    }

    static isBinding(value: any): value is ItemBinding {
        return typeof value === "object"
            && value !== null
            && "target" in value
            && "path" in value
            && Array.isArray(value.path)
            && value.path.every((e: any) => typeof e === "string")
            && "type" in value && value.type === "binding";
    }



    /**
     * Retrieves the full `NodeProperty` descriptor by property name.
     *
     * @param name - The property key to search for.
     * @returns The matching property descriptor, or `undefined` if non-existent.
     */
    get(name: string): Descriptor | undefined {
        return this.descriptors.find(item => item.name === name);
    }

    /**
     * Sets or updates a property value by name.
     *
     * @param name - The property key to assign.
     * @param value - The value to store.
     */
    set(name: string, value: any): void {
        const item = this.descriptors.find(item => item.name === name);
        if (item) {
            if (item.type === "binding") {
                console.warn("Binding does't has value");
            } else {
                item.value = value;
            }
        } else {
            this.descriptors.push(this.createItem(name, value));
        }
    }

    /**
     * Removes a property item matching the specified name.
     *
     * @param name - The key of the item to delete.
     */
    delete(name: string): void {
        const index = this.descriptors.findIndex(item => item.name === name);
        if (index !== -1) {
            this.descriptors.splice(index, 1);
        }
    }

    /**
     * Creates a new array populated with the results of calling a provided function on every item.
     *
     * @param callback - Function executing on each `NodeProperty`.
     */
    map(callback: (item: Descriptor) => Descriptor): Descriptor[] {
        return this.descriptors.map(callback);
    }

    /**
     * Filters items based on a predicate test.
     *
     * @param callback - Predicate function returning `true` to keep the item, or `false` otherwise.
     */
    filter(callback: (item: Descriptor) => boolean): Descriptor[] {
        return this.descriptors.filter(callback);
    }

    /**
     * Executes a provided callback once for each property item.
     *
     * @param callback - Function to execute for each item.
     */
    forEach(callback: (item: Descriptor) => void): void {
        this.descriptors.forEach(callback);
    }

    /**
     * Returns all registered `NodeProperty` items.
     */
    all(): Descriptor[] {
        return this.descriptors;
    }
}