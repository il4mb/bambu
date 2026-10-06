export type EventDetail<T extends object = object, PV = any, V = PV> = {
    target: T;
    property: (keyof T)[];
    oldValue: PV;
    newValue: PV;
    value?: V;
}

export interface SimpleEvent<T extends object = object, PV = any, V = PV> {
    type: string;
    target: T;
    change: Omit<EventDetail<T, PV, V>, 'target' | 'value'>;
    value: V;
    readonly isDefaultPrevented: boolean;
    readonly isStopPropagation: boolean;
    preventDefault(): void;
    stopPropagation(): void;
}

export type EventCallback<E extends SimpleEvent<any, any>> = (event: E) => void;

/**
 * {T} Target object OR string union of event names
 * {R} Optional Record mapping Keys -> Values OR string union of event names
 */
export type CreateEventMap<T extends object = object, R = never> =
    [R] extends [string] ? {
        [K in R & string]: SimpleEvent<T, any>
    } :
    [R] extends [infer V1, infer V2] ? {
        [K in R & string]: SimpleEvent<T, V1, V2>
    }
    // 4. R is a Record
    : R extends Record<string, any> ? {
        [K in keyof R & string]: R[K] extends { value: infer V, propValue: infer PV } ? SimpleEvent<T, PV, V> : SimpleEvent<T, R[K]>
    }
    // 5. Fallback
    : {
        [K: string]: SimpleEvent<any, any>
    };


export type EventMap = {
    [K: string]: SimpleEvent<any, any>
}