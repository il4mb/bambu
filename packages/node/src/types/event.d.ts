export type EventDetail<PV = any, V = PV> = {
    property: string;
    oldValue: PV;
    newValue: PV;
    value?: V;
}

export type SimpleEvent<
    T,
    O extends object = object
> = {
    type: T;
    target: O;
    readonly isDefaultPrevented: boolean;
    readonly isStopPropagation: boolean;
    preventDefault(): void;
    stopPropagation(): void;
}
export type ChangeEvent<
    T,
    O extends object = object,
    PV = any, V = PV
> = SimpleEvent<T, O> & {
    change: {
        property: string;
        oldValue: PV;
        newValue: PV;
    };
    value: V;
}

export type EventInstance<
    T = any,
    O extends object = object,
    PV = any, V = PV
> = SimpleEvent<T, O> | ChangeEvent<T, O, PV, V>

export type EventCallback<E extends EventInstance<any, any>> = (event: E) => void;

/**
 * {T} Target object OR string union of event names
 * {R} Optional Record mapping Keys -> Values OR string union of event names
 */
export type CreateEventMap<T extends object = object, R = never> =
    [R] extends [string] ? {
        [K in R & string]: SimpleEvent<K, T>
    } :
    [R] extends [infer V1, infer V2] ? {
        [K in R & string]: ChangeEvent<K, T, V1, V2>
    }
    // 4. R is a Record
    : R extends Record<string, any> ? {
        [K in keyof R & string]: R[K] extends { value: infer V, propValue: infer PV } ? ChangeEvent<K, T, PV, V> : ChangeEvent<K, T, R[K]>
    }
    // 5. Fallback
    : {
        [K: string]: SimpleEvent<string, T>
    };


export type EventMap = {
    [K: string]: EventInstance
}