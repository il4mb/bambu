import { isEqual } from "lodash";

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

export type Callback<T extends object = object> = (event: SimpleEvent<T>) => void;

export default class EventEmitter<E extends Record<string, any[]> = Record<string, any[]>> {
    protected listeners = new Map<keyof E, Set<Callback<any>>>();
    private pendingDispatchingEvent = new Set<Callback<any>>();

    /**
     * Subscribe to an event
     */
    public on<K extends keyof E>(event: K, callback: Callback) {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(callback);

        // Return a cleanup function
        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event
     */
    public off<K extends keyof E>(event: K, callback?: Callback | null) {
        const set = this.listeners.get(event);
        if (!set) return;

        if (callback) {
            set.delete(callback);
        } else {
            set.clear();
        }

        if (set.size === 0) {
            this.listeners.delete(event);
        }
    }

    /**
     * Fire one or multiple events
     */
    public fire<K extends keyof E, T extends object = object, V = any>(events: K | K[], detail: EventDetail<T, V>) {

        let isDefaultPrevented = false;
        let isStopPropagation = false;

        const { target, ...change } = detail;

        const eventInstance: SimpleEvent<T, V> = {
            type: String(events),
            target,
            change,
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
        };


        if (Array.isArray(events)) {
            for (const ev of events) {
                this.dispatch(ev, eventInstance);
                if (eventInstance.isStopPropagation) break;
            }
            return;
        }

        this.dispatch(events, eventInstance);
        return;
    }

    protected dispatch<K extends keyof E>(type: K, event: SimpleEvent<any, any>) {

        const set = this.listeners.get(type);
        if (!set) return;

        // Changed to for...of loop so we can break early if propagation is stopped
        for (const callback of set) {
            // Respect stopPropagation() called by a previous listener in this set
            if (event.isStopPropagation) break;

            if (!this.pendingDispatchingEvent.has(callback)) {
                try {
                    this.pendingDispatchingEvent.add(callback);
                    callback(event);
                } catch (e) {
                    console.error(`Error in event listener for ${event.type}:`, e);
                } finally {
                    this.pendingDispatchingEvent.delete(callback);
                }
            }
        }
    }

    static isEvent(object: any): object is SimpleEvent {
        return object && typeof object == "object"
            && "target" in object
            && "type" in object
            && "change" in object
            && "isDefaultPrevented" in object
            && "isStopPropagation" in object
            && "preventDefault" in object
            && "stopPropagation" in object;
    }
}