import { SimpleEvent } from "../core/EventEmitter";

export type CreateEventMap<O extends Record<string, any>, PREFIX extends string = ""> = {
    [K in keyof O & string as `${PREFIX}${K}`]: [SimpleEvent];
}

export type EventMap<O extends Record<string, any> = Record<string, any>> = CreateEventMap<O>;