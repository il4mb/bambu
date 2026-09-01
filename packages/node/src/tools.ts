import _ from "lodash";
import { BaseChanged, ChangedEvent } from "./types";

export const isRawObject = (val: unknown): boolean => {
    if (typeof val !== "object" || val === null) return false;

    // Check object prototype tag (e.g., "[object Object]", "[object Array]")
    const tag = Object.prototype.toString.call(val);
    if (tag !== "[object Object]" && tag !== "[object Array]") {
        return false;
    }

    // Skip DOM Nodes and CSS objects
    if ("nodeType" in val || "style" in val || "cssText" in val) {
        return false;
    }

    // Skip frozen or non-extensible objects
    if (Object.isFrozen(val) || !Object.isExtensible(val)) {
        return false;
    }

    return true;
};

/**
 * **ID:** Struktur data yang merepresentasikan perubahan pada objek reaktif.
 * **EN:** Data structure representing a mutation change on a reactive object.
 */
export type Change = {
    /** **ID:** Rantai path properti induk / **EN:** Parent property path hierarchy */
    path: string[];
    /** **ID:** Properti yang mengalami perubahan / **EN:** Property undergoing change */
    property: string | symbol;
    /** **ID:** Nilai sebelum perubahan / **EN:** Value before mutation */
    oldValue: any;
    /** **ID:** Nilai setelah perubahan / **EN:** Value after mutation */
    value: any;
    /** **ID:** Tipe operasi mutasi / **EN:** Mutation operation type */
    type: "set" | "delete";
};

/**
 * **ID:** Membungkus objek target secara rekursif menggunakan Proxy.
 * **EN:** Wrapping target objects into Proxies with path tracking.
 *
 * @template T - Type of the current nested target object.
 * @param target - **ID:** Objek target / **EN:** Target object reference
 * @param callback - **ID:** Callback eksekusi saat terjadi perubahan / **EN:** Change listener execution callback
 * @param path - **ID:** Array path dot-notation saat ini / **EN:** Current dot-notation path hierarchy array
 * @param cache - **ID:** WeakMap penampung cache instance proxy / **EN:** WeakMap proxy instance cache
 * @returns **ID:** Objek target yang ter-proxy atau objek asli jika diabaikan / **EN:** Proxied target object or raw target if bypassed
 */
export function reactive<T extends object>(
    target: T,
    callback: (change: Change) => void,
    path: string[] = [],
    cache: WeakMap<object, any> = new WeakMap()
): T {

    // 1. Primitive check
    if (typeof target !== "object" || target === null) {
        return target;
    }

    // 2. SKIP PROXYING FOR DOM NODES, CSS STYLE OBJECTS, AND NATIVE OBJECTS
    if (
        ('nodeType' in target && typeof (target as any).nodeType === 'number') ||
        (typeof CSSStyleDeclaration !== "undefined" && target instanceof CSSStyleDeclaration) ||
        target instanceof Date ||
        target instanceof Map ||
        target instanceof Set ||
        target instanceof WeakMap ||
        target instanceof WeakSet ||
        target instanceof RegExp
    ) {
        return target;
    }

    // 3. Cache lookup
    if (cache.has(target)) {
        return cache.get(target);
    }

    const proxy = new Proxy(target, {
        get: (obj, prop, receiver) => {
            // Restore receiver so prototypal inheritance works correctly
            const value = Reflect.get(obj, prop, receiver);

            // Recursively proxy nested objects/arrays
            // No function binding needed here because we only proxy Plain Objects & Arrays
            if (isRawObject(value) && typeof prop === "string") {
                return reactive(value as object, callback, [...path, prop], cache);
            }

            return value;
        },

        set: (obj, prop, value, receiver) => {
            const oldValue = Reflect.get(obj, prop, receiver);

            // Ignore core JS symbol mutations
            if (typeof prop === "symbol") {
                return Reflect.set(obj, prop, value, receiver);
            }

            // PERFORMANCE FIX: Use Object.is for fast reference comparison 
            // instead of deep isEqual traversal
            if (Object.is(value, oldValue)) {
                return true;
            }

            // Perform actual mutation using receiver to ensure traps fire
            const success = Reflect.set(obj, prop, value, receiver);

            if (success) {
                callback({
                    path,
                    property: prop,
                    oldValue,
                    value,
                    type: "set"
                });
            }

            return success;
        },

        deleteProperty: (obj, prop) => {
            const hasKey = Reflect.has(obj, prop);
            const oldValue = Reflect.get(obj, prop);

            const success = Reflect.deleteProperty(obj, prop);

            if (success && hasKey && typeof prop !== "symbol") {
                callback({
                    path,
                    property: prop,
                    oldValue,
                    value: undefined,
                    type: "delete"
                });
            }

            return success;
        }
    });

    cache.set(target, proxy);

    return proxy;
}


export function createEvent<V, T extends BaseChanged<V>>(payload: T): ChangedEvent<T> {
    let isDefaultPrevented = false;
    let isStopPropagation = false;
    return {
        ...payload,
        get isDefaultPrevented() {
            return isDefaultPrevented;
        },
        get isStopPropagation() {
            return isStopPropagation;
        },
        preventDefault() {
            isDefaultPrevented = true;
        },
        stopPropagation() {
            isStopPropagation = true;
        }
    }
}


export type Changed = {
    path: string[];
    value: any;
    prev: any;
}
export function getChanges(original: any, updated: any, basePath: string[] = []): Changed[] {
    const obj1 = original || {};
    const obj2 = updated || {};

    const allKeys = _.union(_.keys(obj1), _.keys(obj2));

    return _.transform(allKeys, (result: Changed[], key: string) => {
        const currentPath = [...basePath, key];
        const val1 = _.get(obj1, key);
        const val2 = _.get(obj2, key);

        if (_.isEqual(val1, val2)) return;

        // 1. Record the change at the current path level
        result.push({
            path: currentPath,
            value: val2,
            prev: val1
        });

        // 2. Recurse if either side is an object (treat missing side as empty object {})
        const isObj1 = _.isObject(val1);
        const isObj2 = _.isObject(val2);

        if (isObj1 || isObj2) {
            result.push(...getChanges(
                isObj1 ? val1 : {}, 
                isObj2 ? val2 : {}, 
                currentPath
            ));
        }
    }, []);
}