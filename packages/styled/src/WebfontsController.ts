import { EventEmitter } from "@bambu/node";
import { StyledController } from "./StyledController";

type PendingEntry = {
    promise: Promise<void>;
    refCount: number;
    abort: AbortController;
};

export type FontLease = { release: () => void };

type WebfontsEventMap = {
    items: (fonts: FontItem[]) => void;
    loading: (loading: boolean) => void;
    [key: `loaded:${string}`]: (font: FontItem) => void;
};

export class WebfontsController extends EventEmitter<WebfontsEventMap> {

    protected items: FontItem[] = [];

    readonly loadedSet: Set<string> = new Set();
    private readonly pendingMap = new Map<string, PendingEntry>();

    constructor(protected api: Api, protected controller: StyledController) {
        super();
    }

    /**
     * Parses Google Font variant strings (e.g., "regular", "700italic") 
     * into valid CSS weight and style descriptors for the FontFace API.
     */
    private parseVariantDescriptor(variant: string): { weight: string, style: string } {
        const isItalic = variant.includes("italic");
        let weight = variant.replace("italic", "").replace("regular", "400");

        // If variant was just "italic" or "regular", weight becomes empty
        if (!weight) weight = "400";

        return {
            weight,
            style: isItalic ? "italic" : "normal"
        };
    }

    /**
     * Ref-counted acquire. Returns a lease; call `release()` when the
     * caller no longer needs the font. When the last lease is released
     * and the font hasn't finished loading yet, the fetch is aborted.
     *
     * If the font is already loaded, `release` is a no-op.
     */
    public acquireFont(item: FontItem): FontLease {
        const fontKey = `${item.family}-${item.version}`;

        if (this.loadedSet.has(fontKey) || this.isFontLoaded(item)) {
            this.loadedSet.add(fontKey);
            return { release: () => { } };
        }

        let entry = this.pendingMap.get(fontKey);
        if (!entry) {
            const abort = new AbortController();
            const promise = this.fetchAndLoad(item, abort.signal)
                .then(() => {
                    this.loadedSet.add(fontKey);
                    this.pendingMap.delete(fontKey);
                    this.emit(`loaded:${fontKey}`, item);
                })
                .catch((err) => {
                    this.pendingMap.delete(fontKey);
                    if (err?.name === "AbortError") return;
                    console.error(`Failed to load font ${item.family}:`, err);
                });

            entry = { promise, refCount: 0, abort };
            this.pendingMap.set(fontKey, entry);
        }

        entry.refCount++;
        let released = false;

        return {
            release: () => {
                if (released) return;
                released = true;

                const current = this.pendingMap.get(fontKey);
                if (!current || current !== entry) return;

                current.refCount--;
                if (current.refCount <= 0) {
                    current.abort.abort();
                    this.pendingMap.delete(fontKey);
                }
            },
        };
    }

    /** Fire-and-forget convenience for callers that never release. */
    public loadFont(item: FontItem): Promise<void> {
        // 1. Acquire the font (bumps refCount, starts fetch if needed)
        this.acquireFont(item);

        const fontKey = `${item.family}-${item.version}`;

        // 2. Return the pending promise if it's currently inflight. 
        // If it's not in the map, it means it was already loaded synchronously.
        return this.pendingMap.get(fontKey)?.promise || Promise.resolve();
    }


    private async fetchAndLoad(item: FontItem, signal: AbortSignal): Promise<void> {
        const idoc = this.controller.document?.body?.element?.ownerDocument;

        // Fetch and parse all variants in parallel
        const loadedFaces = await Promise.all(
            Object.entries(item.files).map(async ([variant, url]) => {
                const { weight, style } = this.parseVariantDescriptor(variant);

                // Fetch the bytes ourselves so we can abort mid-flight.
                const res = await fetch(url, { signal });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status} for ${url}`);
                }
                const buf = await res.arrayBuffer();

                if (signal.aborted) {
                    throw new DOMException("Aborted", "AbortError");
                }

                const face = new FontFace(item.family, buf, { weight, style });
                return await face.load();
            })
        );

        // `face.load()` from an ArrayBuffer is effectively instant,
        // but still check — the signal may have fired during the microtask hop.
        if (signal.aborted) {
            throw new DOMException("Aborted", "AbortError");
        }

        // Batch inject all loaded variants at once to prevent layout thrashing
        loadedFaces.forEach(face => {
            document.fonts.add(face);
            if (idoc) idoc.fonts.add(face);
        });
    }

    public isFontLoaded(item: FontItem): boolean {
        const fontKey = `${item.family}-${item.version}`;
        const idoc = this.controller.document?.body?.element?.ownerDocument;
        return this.loadedSet.has(fontKey)
            && document.fonts.check(`1em ${item.family}`)
            && (idoc ? idoc.fonts.check(`1em ${item.family}`) : true);
    }

    get fonts() {
        return this.items;
    }

    // --- Search & Filter Methods ---

    /** Executes a search for a specific font family name */
    public async searchFonts(query: string) {
        const params = new URLSearchParams();
        if (query.trim()) params.set("search", query);
        await this.fetch(params);
    }

    /** Filters fonts by a specific category (e.g., 'sans-serif', 'display') */
    public async filterByCategory(category: string) {
        const params = new URLSearchParams();
        if (category.trim()) params.set("category", category);
        await this.fetch(params);
    }

    /** Executes a combined search and category filter query */
    public async queryFonts(query?: string, category?: string) {
        const params = new URLSearchParams();
        if (query?.trim()) params.set("search", query);
        if (category?.trim()) params.set("category", category);
        await this.fetch(params);
    }

    // -------------------------------

    async fetch(params?: URLSearchParams) {
        try {
            this.emit("loading", true);
            const response = await this.api.fetch(params);

            if (Array.isArray(response.items)) {
                this.items = response.items;
                this.emit("items", this.items);
            } else {
                const data = await response.json();
                const fonts: FontItem[] = data.items || [];
                this.items = fonts;
                this.emit("items", fonts);
            }
        } catch (error) {
            console.error("Error fetching fonts:", error);
        } finally {
            this.emit("loading", false);
        }
    }


    // on<K extends keyof WebfontsEventMap>(event: K, callback: WebfontsEventMap[K]): () => void {


    //     return super.on(event, callback);
    // }
}