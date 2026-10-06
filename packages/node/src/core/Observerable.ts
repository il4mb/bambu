import { isEqual } from "lodash";
import { CreateEventMap, EventMap } from "../types";
import EventEmitter from "./EventEmitter";

export abstract class Observerable<T extends object, O extends Record<string, any>, E extends EventMap = CreateEventMap<T, O>> extends EventEmitter<E> {
    abstract readonly state: O;

    public set(patch: Partial<O>): void;
    public set<K extends keyof O>(key: K, newValue: O[K]): void;
    public set(keyOrPatch: any, newValue?: any): void {
        if (typeof keyOrPatch === "object" && keyOrPatch !== null && typeof newValue === "undefined") {
            const patch = keyOrPatch as Partial<O>;
            const keys = Object.keys(patch) as (keyof O)[];
            keys.forEach(k => {
                this.set(k, patch[k]!);
            });
            return;
        }

        const key = keyOrPatch as keyof O;
        const prev = this.state[key];
        if (isEqual(prev, newValue)) return;

        this.state[key] = newValue;

        // @ts-ignore
        this.fire(key, {
            target: this,
            property: [key],
            oldValue: prev,
            newValue
        });
    }
}