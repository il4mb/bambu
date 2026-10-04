export type EventDetail<T extends object = object, V = any> = {
    target: T;
    property: (keyof T)[];
    oldValue: V;
    newValue: V;
}

export interface SimpleEvent<T extends object = object, V = any> {
    type: string;
    target: T;
    change: Omit<EventDetail<T, V>, 'target'>;
    readonly isDefaultPrevented: boolean;
    readonly isStopPropagation: boolean;
    preventDefault(): void;
    stopPropagation(): void;
}

export type EventCallback<T extends object = object> = (event: SimpleEvent<T>) => void;

export type CreateEventMap<Keys> = {
    [K in Keys & string]: [SimpleEvent];
}
export type EventMap<O extends Record<string, any> = Record<string, any>> = CreateEventMap<keyof O>;