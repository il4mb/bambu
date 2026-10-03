import { isEqual } from "lodash";

export type ObservableEventMap<T extends Record<string, any>> = {
    change: [Event];
} & {
    [K in keyof T & string as `change:${K}`]: [Event];
};

export default abstract class Observable<T extends Record<string, any>, M extends ObservableEventMap<T> = ObservableEventMap<T>> extends EventTarget {
    protected abstract state: T;

    // variables to track synchronous call depth
    protected _updateDepth = 0;
    protected readonly MAX_UPDATE_DEPTH = 50; // Threshold before terminating the loop

    public set<K extends keyof T>(key: K, newValue: T[K]): void {
        const oldValue = this.state[key];

        // Early exit: Do nothing if the value hasn't actually changed
        if (isEqual(oldValue, newValue)) {
            return;
        }

        // Loop detection: Abort if the recursion goes too deep
        if (this._updateDepth >= this.MAX_UPDATE_DEPTH) {
            console.error(
                `Infinite loop prevented! Maximum update depth (${this.MAX_UPDATE_DEPTH}) exceeded while setting "${String(key)}".`
            );
            return;
        }

        // Apply state change
        this.state[key] = newValue;

        // Wrap event firing in try/finally to ensure the depth counter always decrements
        this._updateDepth++;
        try {
            // @ts-ignore
            this.fire("change", { detail: { property: key, oldValue, newValue } });
            // @ts-ignore
            this.fire(`change:${String(key)}`, { detail: { property: key, oldValue, newValue } });
        } finally {
            this._updateDepth--;
        }
    }

    public get<K extends keyof T>(key: K): T[K] {
        return this.state[key];
    }

    public on<K extends keyof M>(event: K, callback: EventListenerOrEventListenerObject) {
        this.addEventListener(String(event), callback);
        // react effect friendly 
        return () => {
            this.removeEventListener(String(event), callback);
        }
    }

    public off<K extends keyof M>(event: K, callback: EventListenerOrEventListenerObject | null = null) {
        this.removeEventListener(String(event), callback);
    }

    public fire<K extends keyof M>(
        event: K,
        eventInitDict?: CustomEventInit<{ property: string; oldValue: any; newValue: any; }>
    ): Event {
        const eventInstance = new CustomEvent(String(event), eventInitDict);
        this.dispatchEvent(eventInstance);
        return eventInstance;
    }
}
