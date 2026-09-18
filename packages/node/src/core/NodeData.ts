import { AllTypes,  ItemAll, NodeProperty } from "../types/node-data";

export default class NodeData<T extends ModuleName = ModuleName> {

    public readonly items: NodeProperty[] = [];
    constructor(plainData: NodeObjectData) {
        for (const [name, value] of Object.entries(plainData)) {
            this.items.push(this.createItem(name, value));
        }

        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof prop === "string") {
                    const item = target.items.find(item => item.name === prop);
                    if (item) return item.value;
                }
                return Reflect.get(target, prop);
            },
            set: (target, prop, value) => {
                if (typeof prop === "string") {
                    const item = target.items.find(item => item.name === prop);
                    if (item) {
                        item.value = value;
                    } else {
                        target.items.push(target.createItem(prop, value));
                    }
                }
                return Reflect.set(target, prop, value);
            }
        });
    }

    private createItem(name: string, value: any): NodeProperty {
        if (this.isUserDefined(value)) {
            return {
                ...value,
                renameable: true,
                deleteable: true
            }
        }
        return {
            name,
            type: this.getType(value),
            value: value,
            renameable: false,
            deleteable: false,
        };
    }

    private getType(value: any): AllTypes {
        if (typeof value === "string") return "string";
        if (typeof value === "number") return "number";
        if (typeof value === "boolean") return "boolean";
        if (Array.isArray(value)) return "array";
        if (value && typeof value === "object") return "object";
        return "unknown";
    }

    private isUserDefined(value: any): value is ItemAll {
        return typeof value === "object" && value !== null && "name" in value && "type" in value && "value" in value;
    }


    get(name: string): NodeProperty | undefined {
        return this.items.find(item => item.name === name);
    }

    set(name: string, value: any): void {
        const item = this.items.find(item => item.name === name);
        if (item) {
            item.value = value;
        } else {
            this.items.push(this.createItem(name, value));
        }
    }

    delete(name: string): void {
        const index = this.items.findIndex(item => item.name === name);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }

    map(callback: (item: NodeProperty) => NodeProperty): NodeProperty[] {
        return this.items.map(callback);
    }

    filter(callback: (item: NodeProperty) => boolean): NodeProperty[] {
        return this.items.filter(callback);
    }

    forEach(callback: (item: NodeProperty) => void): void {
        this.items.forEach(callback);
    }

    all(): NodeProperty[] {
        return this.items;
    }
}