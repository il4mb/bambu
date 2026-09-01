/**
 * **ID:** Peta event dasar yang mengidentifikasi nama event beserta tipe signature handler-nya.
 * **EN:** Base event map interface defining event names and their corresponding listener signatures.
 */
export type EventMap = Record<string, (...args: any[]) => any>;

/**
 * **ID:** Fungsi pembersih untuk mencabut/menghentikan berlangganan (unsubscribe) event listener.
 * **EN:** Cleanup function type used to unregister/unsubscribe an event listener.
 */
export type Unregister = () => void;

/**
 * **ID:** Kelas abstrak EventEmitter bertipe ketat (strongly-typed) untuk mengelola pub/sub event.
 * **EN:** Abstract strongly-typed EventEmitter class for managing generic pub/sub event mechanisms.
 *
 * @template Events - Event map shape extending `EventMap`.
 */
export default abstract class EventEmitter<Events extends EventMap = EventMap> {
    /**
     * **ID:** Map internal tempat menyimpan daftar callback untuk setiap event.
     * **EN:** Internal Map storage maintaining callback listener arrays for each event key.
     */
    private listeners = new Map<keyof Events, Array<Events[keyof Events]>>();

    /**
     * **ID:** Mendaftarkan listener baru untuk event tertentu.
     * **EN:** Registers a new callback listener for a specified event.
     *
     * @param event - **ID:** Nama event / **EN:** Event target name
     * @param callback - **ID:** Fungsi handler listener / **EN:** Listener handler function
     * @returns **ID:** Fungsi `Unregister` untuk menghapus listener / **EN:** `Unregister` cleanup function
     */
    on<K extends keyof Events>(event: K, callback: Events[K]): Unregister {
        const list = this.listeners.get(event) ?? [];
        list.push(callback);
        this.listeners.set(event, list);
        return () => this.off(event, callback);
    }

    /**
     * **ID:** Mendaftarkan listener satu kali (one-time) yang akan menghapus dirinya sendiri setelah dipicu.
     * **EN:** Registers a one-time listener that automatically unregisters itself after firing once.
     *
     * @param event - **ID:** Nama event / **EN:** Event target name
     * @param callback - **ID:** Fungsi handler listener / **EN:** Listener handler function
     * @returns **ID:** Fungsi `Unregister` untuk pembersihan manual sebelum dipicu / **EN:** `Unregister` cleanup function
     */
    once<K extends keyof Events>(event: K, callback: Events[K]): Unregister {
        const onceWrapper = ((...args: Parameters<Events[K]>) => {
            this.off(event, onceWrapper as Events[K]);
            callback(...args);
        }) as Events[K];
        return this.on(event, onceWrapper);
    }

    /**
     * **ID:** Menghapus listener tertentu dari daftar berlangganan event.
     * **EN:** Removes a specific callback listener from an event's subscriber list.
     *
     * @param event - **ID:** Nama event / **EN:** Event target name
     * @param callback - **ID:** Ref handler listener yang akan dihapus / **EN:** Specific listener handler reference to remove
     */
    off<K extends keyof Events>(event: K, callback: Events[K]): void {
        const list = this.listeners.get(event);
        if (!list) return;

        const filteredList = list.filter(cb => cb !== callback);
        if (filteredList.length > 0) {
            this.listeners.set(event, filteredList);
        } else {
            // Memory Management: Delete key entirely if no listeners remain
            this.listeners.delete(event);
        }
    }

    /**
     * **ID:** Memicu event sekuensial dan memanggil seluruh listener terdaftar dengan argumen yang diberikan.
     * **EN:** Triggers an event sequentially, executing all registered callback listeners with the given arguments.
     *
     * @param event - **ID:** Nama event yang dipicu / **EN:** Target event name to emit
     * @param args - **ID:** Argumen yang dioper ke listener / **EN:** Arguments passed to the listeners
     */
    emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
        const list = this.listeners.get(event);
        if (!list) return;

        // CRITICAL: Clone the array before iterating to handle dynamic listener removal during execution
        const listenersToCall = [...list];
        for (const callback of listenersToCall) {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event listener for "${String(event)}":`, error);
            }
        }
    }

    /**
     * **ID:** Mengekspos snapshot listener ke konteks iterasi kustom (memungkinkan alur kontrol, penghentian propagasi, atau penanganan error khusus).
     * **EN:** Exposes a listener snapshot to a custom iteration closure (enabling custom control flow, propagation stopping, or error handling).
     *
     * @param event - **ID:** Nama event yang dipicu / **EN:** Target event name
     * @param iterate - **ID:** Callback penanganan eksekusi listener / **EN:** Custom execution handler receiving listener snapshot
     */
    // emitWith(event: ChangeEvent): void
    emitWith<K extends keyof Events>(event: K, iterate?: (listeners: Events[K][]) => void): void {
        // if (event instanceof ChangeEvent) {
        //     const list = this.listeners.get(event.event);
        //     if (!list || list.length === 0) return;
        //     for (const callback of list) {
        //         callback(event);
        //         if (event.isStopPropagation) {
        //             return;
        //         }
        //     }
        //     return;
        // }

        const list = this.listeners.get(event);
        if (!list || list.length === 0) return;
        // @ts-ignore
        iterate([...list]);
    }

    /**
     * **ID:** Menghapus semua listener dari event spesifik, atau mengosongkan seluruh event jika tidak ada parameter.
     * **EN:** Removes all listeners for a specified event, or clears all registered events entirely if omitted.
     *
     * @param event - **ID:** [Opsional] Nama event spesifik yang ingin dibersihkan / **EN:** [Optional] Target event name to clear
     */
    clearListeners(event?: keyof Events): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}