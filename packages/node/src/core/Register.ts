import Model from "./Model";
import { BuildinUnion } from "../models";
import { ModelObject } from "../types/define";

export default class Register {

    constructor(protected registries: Map<string, Model> = new Map()) {
        BuildinUnion.forEach(definition => {
            this.set(definition);
        });
    };

    has(name: string): boolean {
        return this.registries.has(name);
    };

    set<T extends ModuleName>(obj: ModelObject<T>) {
        this.registries.set(obj.name, new Model(this, obj));
    }

    get<T extends ModuleName>(name: string): Model<T> | null {
        return this.registries.has(name) ? this.registries.get(name) : null;
    };
}