
import { PathValue, NestedKeys } from "./tools";

export type BaseChanged<T> = {
    path: (string | symbol)[];
    value: T;
    prev: T | null;
}

export type ChangedEvent<T extends BaseChanged> = T & {
    readonly isDefaultPrevented: boolean;
    readonly isStopPropagation: boolean;
    preventDefault(): void;
    stopPropagation(): void;
}

export type ObjectChangeEventMap<O extends object> = {
    [K in NestedKeys<O>]:
    (event: ChangedEvent<{ path: string[], value: PathValue<O, K>, prev: PathValue<O, K> }>) => void;
};
