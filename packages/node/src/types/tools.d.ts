type Primitive = string | number | boolean | symbol | null | undefined | bigint;
type Decrement = [never, 0, 1, 2, 3, 4, 5];
type MaxDepth = 4;

export type NormalizeFunction<F> = F extends (this: any, ...args: infer Args) => infer R
    ? (...args: Args) => R
    : never;

// 1. Add `Depth extends number = MaxDepth` to the generic arguments
export type NestedKeys<T, Depth extends number = MaxDepth> =
    [Depth] extends [never]
    ? never
    : T extends Primitive
    ? never
    : T extends any[] | Function // Highly recommended to also stop at Functions
    ? never
    : T extends object
    ? {
        [K in keyof T & string]:
            T[K] extends Primitive | any[] | Function
            ? K
            : T[K] extends object
            // 2. Pass `Decrement[Depth]` to the recursive call
            ? K | `${K}.${NestedKeys<T[K], Decrement[Depth]>}`
            : K
    }[keyof T & string]
    : never;

export type PathValue<T, P extends string> =
    P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
        ? PathValue<T[K], Rest>
        : never
    : P extends keyof T
    ? T[P]
    : never;