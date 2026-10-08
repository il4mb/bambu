import { ChangeEvent, EventCallback, EventDetail, EventInstance, EventMap, SimpleEvent } from "../types";

export default class EventEmitter<O extends object = object, E extends EventMap = EventMap> {
    protected listeners = new Map<keyof E, Set<EventCallback<any>>>();
    private pendingDispatchingEvent = new Set<EventCallback<any>>();

    /**
     * Subscribe to an event
     */
    public on<K extends keyof E>(event: K, callback: EventCallback<E[K]>) {
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
    public off<K extends keyof E>(event: K, callback?: EventCallback<E[K]> | null) {
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


    public fire<K extends keyof E, PV = any, V = PV>(events: K | K[], detail?: EventDetail<PV, V>): EventInstance<K, O, PV, V> {
        let eventInstance = this.createEventInstance(Array.isArray(events) ? events[0] : events, detail);
        if (Array.isArray(events)) {
            for (const ev of events) {
                if (eventInstance.isStopPropagation) break;
                eventInstance.type = ev;
                this.dispatch(eventInstance);
            }
        } else {
            this.dispatch(eventInstance);
        }
        return eventInstance;
    }

    public createEventInstance<T extends keyof E, PV, V>(type: T, detail?: EventDetail<PV, V>): EventInstance<T, O, PV, V> {
        let isDefaultPrevented = false;
        let isStopPropagation = false;

        if (detail) {
            return {
                type,
                target: this as unknown as O,
                change: {
                    property: detail.property,
                    oldValue: detail.oldValue,
                    newValue: detail.newValue
                },
                value: detail.value ?? detail.newValue as unknown as V,
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
            } as ChangeEvent<T, O, PV, V>;
        }

        return {
            type,
            target: this as unknown as O,
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
        } as SimpleEvent<T, O>;
    }

    public dispatch<K extends keyof E>(event: EventInstance<K, any, any, any>) {

        const set = this.listeners.get(event.type);
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
                    // @ts-ignore
                    console.error(`Error in event listener for ${event.type}:`, e);
                } finally {
                    this.pendingDispatchingEvent.delete(callback);
                }
            }
        }
    }
}