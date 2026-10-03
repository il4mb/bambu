import { isEqual } from "lodash";

export type Callback = (event: SimpleEvent) => void;
export type SimpleEvent = {
    type: string;
    change: {
        property: string;
        oldValue: any;
        newValue: any;
    };
    readonly isDefaultPrevented: boolean;
    readonly isStopPropagation: boolean;
    defaultPrevented(): void;
    stopPropagation(): void;
}
export default class EventEmitter<E extends Record<string, any[]> = Record<string, any[]>> {
    protected listeners = new Map<keyof E, Set<Callback>>();
    protected _updateDepth = 0;
    protected readonly MAX_UPDATE_DEPTH = 50;

    public on<K extends keyof E>(event: K, callback: Callback) {
        const set = this.listeners.get(event) ?? new Set();
        set.add(callback);
        this.listeners.set(event, set);
        return () => {
            set.delete(callback);
            if (set.size <= 0) {
                this.listeners.delete(event);
            } else {
                this.listeners.set(event, set);
            }
        }
    }

    public off<K extends keyof E>(event: K, callback: Callback | null = null) {
        if (this.listeners.has(event)) {
            const set = this.listeners.get(event)!;
            if (callback) {
                set.delete(callback);
            } else {
                set.clear();
            }
            if (set.size <= 0) {
                this.listeners.delete(event);
            } else {
                this.listeners.set(event, set);
            }
        }
    }

    public fire<K extends keyof E>(
        event: K,
        detail: { property: string; oldValue: any; newValue: any; },
        prevEvent?: SimpleEvent
    ): SimpleEvent | undefined {

        if (isEqual(detail.oldValue, detail.newValue)) return;
        if (this._updateDepth >= this.MAX_UPDATE_DEPTH) {
            throw new Error(
                `Infinite loop prevented! Maximum update depth (${this.MAX_UPDATE_DEPTH}) exceeded while setting "${String(event)}".`
            );
        }

        this._updateDepth++;
        try {
            let isDefaultPrevented = prevEvent?.isDefaultPrevented ?? false;
            let isStopPropagation = prevEvent?.isStopPropagation ?? false;

            const eventInstance = {
                type: event,
                change: detail,
                get isDefaultPrevented() {
                    return isDefaultPrevented;
                },
                get isStopPropagation() {
                    return isStopPropagation;
                },
                defaultPrevented() {
                    isDefaultPrevented = true;
                },
                stopPropagation() {
                    isStopPropagation = true;
                }
            } as SimpleEvent;
            this.dispatchEvent(eventInstance);
            return eventInstance;
        } finally {
            this._updateDepth--;
        }
    }

    private pendingDispatchingEvent = new Set<Callback>();
    protected dispatchEvent(event: SimpleEvent) {
        const key = event.type;
        const set = this.listeners.get(key);

        set?.forEach(callback => {
            if (!this.pendingDispatchingEvent.has(callback)) {
                try {
                    this.pendingDispatchingEvent.add(callback);
                    callback(event);
                } catch (e) {
                    console.error(e);
                } finally {
                    this.pendingDispatchingEvent.delete(callback);
                }
            }
            //  else {
            //     console.error("Skiped, Cannot invoke pending callback, to prevent infinite loop");
            // }
        });
    }
}