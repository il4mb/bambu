import type Register from "./Register";
import type Node from "./Node";
import type Model from "./Model";
import EventEmitter from "./EventEmitter";
import StyleManager from "./StyleManager";

/**
 * **ID:** Kelas Container utama yang mengelola seluruh pohon node (tree structure) dan siklus hidup node dalam dokumen.
 * **EN:** Primary Container class managing the entire node tree structure and lifecycle within a document.
 */
export default class Container extends EventEmitter {

    /** **ID:** Inkremen fraksional terkecil untuk pengurutan node / **EN:** Smallest fractional increment for node ordering */
    static ORDER_EPS = 0.001;
    /** **ID:** Offset urutan minor gaya 'before' / **EN:** Minor order offset for 'before' placement */
    static ORDER_MINOR = 0.01;
    /** **ID:** Offset urutan mayor gaya 'after' / **EN:** Major order offset for 'after' placement */
    static ORDER_MAJOR = 0.02;

    /**
     * **ID:** Penyimpanan internal seluruh node berdasarkan ID unik.
     * **EN:** Internal Map collection storing all nodes indexed by their unique ID.
     */
    private collection: Map<string, Node<any>> = new Map();

    /** **ID:** Node root elemen `<head>` / **EN:** Root `<head>` element node */
    readonly head: Node<"element">;
    /** **ID:** Node root elemen `<body>` / **EN:** Root `<body>` element node */
    readonly body: Node<"element">;

    readonly styleManager: StyleManager;

    /**
     * @param register - **ID:** Registry penampung skema Model / **EN:** Model schema registry instance
     * @param nodes - **ID:** [Opsional] Array data mentah node untuk inisialisasi / **EN:** [Optional] Initial raw node objects array
     */
    constructor(public register: Register, nodes?: PlainNode[]) {
        super();
        this.head = this.createNode("element", { tagName: "head" });
        this.body = this.createNode("element", { tagName: "body", data: { style: { minHeight: "100vh", minWidth: "100vw" } } });

        if (nodes && Array.isArray(nodes)) {
            Array.from(nodes)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                // @ts-ignore
                .forEach(raw => this.createNode(raw.type || "element", raw));
        }

        this.styleManager = new StyleManager(this);
    }

    /**
     * **ID:** Mengambil salinan map seluruh node yang terdaftar di container.
     * **EN:** Returns a shallow copy map of all registered nodes in the container.
     */
    get nodes(): Map<string, Node> {
        return new Map(this.collection);
    }

    /**
     * **ID:** Membuat instance Node baru dan mendaftarkannya ke dalam dokumen container.
     * **EN:** Creates a new Node instance and registers it within the container document.
     *
     * @template T - Model name identifier.
     * @param type - **ID:** Tipe nama model / **EN:** Model type identifier
     * @param nodeObject - **ID:** Data mentah atribut node / **EN:** Plain node initialization payload
     * @returns **ID:** Instance Node yang dibuat / **EN:** Created Node instance
     */
    public createNode<T extends ModuleName>(type: T, nodeObject?: PlainNode<T>): Node<T> {

        const typeModel = this.register.get(type) as Model<T> | undefined;
        if (!typeModel) {
            throw new Error(`Type ${type} not found in registry`);
        }
        const node = typeModel.buildNode(this, nodeObject) as Node<T>;
        this.collection.set(node.id, node);

        if (nodeObject?.parent) {
            const parent = this.findNode(nodeObject.parent);
            if (parent) {
                this.addNodeChildren(parent, node, nodeObject.order);
            } else {
                console.warn(`Cannot add children to node with id ${nodeObject.order} was not found!`);
            }
        }

        if (this.body && !node.parent) {
            console.warn(`Node ${node.id} doesn't have parent, fallback to the body`);
            this.addNodeChildren(this.body, node);
        }

        if (nodeObject?.children && Array.isArray(nodeObject.children)) {
            Array.from(nodeObject.children)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .forEach(childRaw => {
                    // @ts-ignore
                    const child = this.createNode(childRaw.type || "element", childRaw);
                    this.addNodeChildren(node, child);
                });
        }

        return node;
    }

    /**
     * **ID:** Mencari node berdasarkan ID uniknya di dalam container.
     * **EN:** Searches for a node by its unique ID within the container.
     *
     * @template T - Model name identifier.
     * @param id - **ID:** ID node yang dicari / **EN:** Target node ID
     * @returns **ID:** Node yang ditemukan atau `null` jika tidak ada / **EN:** Found Node instance or `null` if not found
     */
    public findNode<T extends ModuleName>(id: string): Node<T> | null {
        return (this.collection.get(id) as Node<T>) ?? null;
    }

    /**
     * **ID:** Menambahkan Node anak ke Node parent pada urutan indeks tertentu.
     * **EN:** Appends a child Node to a parent Node at a specified target index.
     *
     * @param parent - **ID:** Node induk / **EN:** Target parent Node
     * @param node - **ID:** Node anak yang akan disisipkan / **EN:** Child Node to insert
     * @param at - **ID:** [Opsional] Indeks urutan penyisipan / **EN:** [Optional] Target insertion index
     */
    public addNodeChildren(parent: Node<any>, node: Node<any>, at?: number) {
        this.ensureOwner(parent, node);
        const children = this.getChildren(parent); // Map<string, Node>
        const entries = Array.from(children.values()).sort((a, b) => a.order - b.order);

        if (at === undefined || at === null) {
            // Append: set order after last existing child
            node.order = entries.length > 0 ? entries[entries.length - 1].order + Container.ORDER_EPS : 0;
        } else {
            const targetIndex = Math.max(0, Math.min(Math.floor(at), entries.length));

            if (targetIndex === 0) {
                // Insert at beginning
                const firstOrder = entries.length > 0 ? entries[0].order : 0;
                node.order = firstOrder - Container.ORDER_EPS;
            } else if (targetIndex >= entries.length) {
                // Insert at end
                const lastOrder = entries.length > 0 ? entries[entries.length - 1].order : 0;
                node.order = lastOrder + Container.ORDER_EPS;
            } else {
                // Insert between two nodes
                const prevOrder = entries[targetIndex - 1].order;
                const nextOrder = entries[targetIndex].order;
                node.order = (prevOrder + nextOrder) / 2; // Fractional average
            }
        }

        node.parent = parent;
        this.normalizeChildrenOrder(parent);
    }

    /**
     * **ID:** Menghapus relasi anak dari node parent.
     * **EN:** Removes a child node relation from its parent node.
     *
     * @param parent - **ID:** Node induk / **EN:** Parent Node
     * @param child - **ID:** Node anak yang akan dihapus / **EN:** Child Node to remove
     */
    public removeChildren(parent: Node<any>, child: Node<any>) {
        this.ensureOwner(parent, child);
        if (child.parent?.id === parent.id) {
            child.parent = null;
            this.normalizeChildrenOrder(parent);
        }
    }

    /**
     * **ID:** Mengurutkan ulang daftar anak dari node parent.
     * **EN:** Reorders the child nodes under a parent node.
     *
     * @param parent - **ID:** Node induk / **EN:** Parent Node
     * @param startIndex - **ID:** [Opsional] Indeks awal pengurutan / **EN:** [Optional] Starting index for reordering
     */
    public reorderChildren(parent: Node<any>, startIndex?: number) {
        this.ensureOwner(parent);
        this.normalizeChildrenOrder(parent, false);
    }

    /**
     * **ID:** Mengambil seluruh node leluhur (ancestors) dari suatu node hingga tingkat teratas.
     * **EN:** Retrieves all ancestor nodes ascending up to the root level.
     *
     * @template T - Model name identifier.
     * @param node - **ID:** Node titik awal / **EN:** Starting node reference
     * @returns **ID:** `ReadonlyMap` berisi node-node leluhur / **EN:** `ReadonlyMap` containing ancestor nodes
     */
    public getAncestors<T extends ModuleName>(node: Node<T>): ReadonlyMap<string, Node> {
        this.ensureOwner(node);
        const result = new Map<string, Node>();
        let currentNode: Node | null = node;

        while (currentNode && currentNode.parent) {
            const parentNode: Node = currentNode.parent;
            if (!parentNode) break;

            result.set(parentNode.id, parentNode);
            currentNode = parentNode;
        }
        return this.toReadonlyMap(result);
    }

    /**
     * **ID:** Mengambil rantai node leluhur dari node awal (`start`) sampai node akhir (`end`).
     * **EN:** Retrieves the chain of ancestor nodes starting from `start` up to `end`.
     *
     * @template T - Model name identifier.
     * @param start - **ID:** Node awal penyusuran / **EN:** Starting node
     * @param end - **ID:** Node batas akhir / **EN:** Ending boundary node
     * @returns **ID:** Array rantai node dari `start` hingga sebelum `end` / **EN:** Array chain of nodes from `start` up to `end`
     */
    public getAncestorChain<T extends ModuleName>(start: Node<any>, end: Node<any>): Node<T>[] {
        this.ensureOwner(start, end);
        const chain: Node<any>[] = [];
        let current: Node<any> | null = this.findNode(start.id);
        while (current && current.id !== end.id) {
            chain.push(current);
            current = current.parent ? this.findNode(current.parent.id) : null;
        }
        return chain as Node<T>[];
    }

    /**
     * **ID:** Mengambil seluruh node keturunan (anak, cucu, dst.) dari sebuah node secara rekursif.
     * **EN:** Recursively retrieves all descendant nodes (children, grand-children, etc.) of a target node.
     *
     * @template T - Model name identifier.
     * @param node - **ID:** Node target / **EN:** Target parent node
     * @returns **ID:** `ReadonlyMap` berisi seluruh node keturunan / **EN:** `ReadonlyMap` of all descendant nodes
     */
    public getDescendants<T extends ModuleName>(node: Node<T>): ReadonlyMap<string, Node<any>> {
        this.ensureOwner(node);
        const childrenMap = new Map<string, Node<any>[]>();
        for (const child of this.collection.values()) {
            if (!child.parent) continue;
            const children = childrenMap.get(child.parent.id);
            if (children) {
                children.push(child);
            } else {
                childrenMap.set(child.parent.id, [child]);
            }
        }

        const descendants = new Map<string, Node<any>>();
        const walk = (parentId: string) => {
            for (const child of childrenMap.get(parentId) ?? []) {
                descendants.set(child.id, child);
                walk(child.id);
            }
        };
        walk(node.id);

        return this.toReadonlyMap(descendants);
    }

    /**
     * **ID:** Mengambil daftar node anak langsung dari sebuah node.
     * **EN:** Retrieves direct child nodes for a specific target node.
     *
     * @param node - **ID:** Node target / **EN:** Target node
     * @returns **ID:** `ReadonlyMap` berisi node-node anak terurut / **EN:** `ReadonlyMap` of ordered child nodes
     */
    public getChildren(node: Node<any>): ReadonlyMap<string, Node<any>> {
        this.ensureOwner(node);
        const childrenArray = Array.from(this.collection.values())
            .filter(n => n.parent?.id === node.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        return this.toReadonlyMap(new Map(childrenArray.map(n => [n.id, n])));
    }

    /**
     * **ID:** Mengambil node saudara (siblings) yang berbagi parent yang sama.
     * **EN:** Retrieves sibling nodes sharing the exact same parent node.
     *
     * @param node - **ID:** Node target / **EN:** Target node
     * @returns **ID:** `ReadonlyMap` berisi node saudara / **EN:** `ReadonlyMap` of sibling nodes
     */
    public getSiblings(node: Node<any>): ReadonlyMap<string, Node<any>> {
        this.ensureOwner(node);
        const childrenArray = Array.from(this.collection.values())
            .filter(n => n.parent?.id === node.parent?.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        return this.toReadonlyMap(new Map(childrenArray.map(n => [n.id, n])));
    }

    /**
     * **ID:** Membersihkan/menghapus node-node yatim (orphan) yang tidak terhubung ke akar pohon (root).
     * **EN:** Purges orphan nodes that are disconnected from the root tree.
     */
    public purgeOrphan() {
        const validIds = new Set<string>();
        const traverse = (id: string | null) => {
            validIds.add(id || "");
            const children = Array.from(this.collection.values()).filter((n) => n.parent?.id === id);
            children.forEach((child) => traverse(child.id));
        };
        traverse(null);

        this.collection.forEach((n, id) => {
            if (!validIds.has(id)) {
                this.collection.delete(id);
            }
        });
    }

    /**
     * **ID:** Menormalisasi ulang nilai `order` seluruh node secara rekursif dari tingkat teratas.
     * **EN:** Recursively normalizes `order` values across all nodes from top-level downwards.
     */
    public normalizeOrder() {
        const topLevelNodes = this.getTopLevelNodes();
        topLevelNodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        topLevelNodes.forEach((node, index) => {
            node.order = index;
            this.normalizeChildrenOrder(node, true);
        });
    }

    /**
     * **ID:** Menormalisasi indeks `order` node-node anak dari parent tertentu.
     * **EN:** Normalizes `order` indices for children belonging to a specific parent node.
     *
     * @param parent - **ID:** Node induk / **EN:** Parent Node
     * @param recursive - **ID:** [Opsional] Apakah menormalisasi secara rekursif ke bawah / **EN:** [Optional] Whether to normalize recursively down the subtree
     */
    public normalizeChildrenOrder(parent: Node<any>, recursive: boolean = false) {
        const children = Array.from(this.collection.values())
            .filter(node => node.parent?.id === parent.id);

        if (children.length === 0) return;
        children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        children.forEach((child, index) => {
            child.order = index;
            if (recursive) {
                this.normalizeChildrenOrder(child, true);
            }
        });
    }

    /**
     * **ID:** Mengambil daftar node tingkat teratas (top-level) yang tidak memiliki parent atau parent-nya tidak ada dalam dokumen.
     * **EN:** Retrieves top-level nodes that have no parent or whose parent does not exist in the collection.
     */
    public getTopLevelNodes(): Node<any>[] {
        return Array.from(this.collection.values())
            .filter((node) => !node.parent || !this.collection.has(node.parent.id))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    /**
     * **ID:** Helper internal untuk membungkus `Map` menjadi `ReadonlyMap` terproteksi.
     * **EN:** Internal helper to wrap a `Map` instance into a read-only dynamic Proxy map.
     *
     * @param map - **ID:** Instance map asli / **EN:** Raw target map instance
     * @returns **ID:** Proxy ReadonlyMap / **EN:** ReadonlyMap proxy
     */
    private toReadonlyMap(map: Map<string, Node<any>>): ReadonlyMap<string, Node<any>> {
        const mutatingMethods = new Set(['set', 'delete', 'clear']);
        return new Proxy(map, {
            get(target, prop: string) {
                if (mutatingMethods.has(prop)) {
                    throw new TypeError(`Method '${prop}' cannot be called on a ReadonlyMap.`);
                }
                const value = (target as any)[prop];
                return typeof value === 'function' ? value.bind(target) : value;
            }
        });
    }

    /**
     * **ID:** Memastikan seluruh node yang dioper dimiliki oleh instance Container ini.
     * **EN:** Verifies that all given node instances belong to this Container.
     *
     * @param nodes - **ID:** Daftar node yang akan diperiksa / **EN:** Node instances to validate
     */
    public ensureOwner(...nodes: Node<any>[]) {
        if (!nodes.every(e => e.owner === this)) {
            throw new Error("Cannot find ancestors node is not owned by this document");
        }
    }
}