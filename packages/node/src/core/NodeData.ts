type ItemString = { name: string, type: "string", value: string };
type ItemNumber = { name: string, type: "number", value: number };
type ItemBoolean = { name: string, type: "boolean", value: boolean };
type ItemObject = { name: string, type: "object", value: NodeData };
type ItemArray = { name: string, type: "array", value: NodeData[] };
type ItemUnknown = { name: string, type: "unknown", value: unknown };

export type ItemAll = ItemString | ItemNumber | ItemBoolean | ItemObject | ItemArray | ItemUnknown;
export type AllTypes = ItemAll["type"];
export type NodeProperty = ItemAll & {
    renameable?: boolean;
    deleteable?: boolean;
}

export class NodeData<T extends ModuleName = ModuleName> {

    private items: NodeProperty[] = [];
    constructor(plainData: NodeObjectData) {
        for (const [name, value] of Object.entries(plainData)) {
            this.items.push(this.createItem(name, value));
        }
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


}