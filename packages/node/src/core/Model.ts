import { ComponentProps, Icon, ModelObject } from "../types/define";
import type Container from "./Container";
import type Register from "./Register";
import Node from "./Node";
import { InferCommands } from "../types/infer";
import { createElement } from "react";

/**
 * - **ID:** Kelas pengelola skema Model yang mendefinisikan perilaku, hierarki pewarisan (inheritance), command, dan komponen visual UI.
 * - **EN:** Model schema manager class defining behavior, inheritance hierarchy, commands, and UI components.
 */
export default class Model<T extends ModuleName = ModuleName> {

    /**
     * @param register - **ID:** Instance Register pendaftaran model / **EN:** Register instance handling model registration
     * @param definition - **ID:** Objek konfigurasi skema model / **EN:** Raw model schema definition object
     */
    constructor(
        public readonly register: Register,
        public readonly definition: ModelObject<T>
    ) { }


    /**
     * - **ID:** Mengambil instance Model induk jika terdapat pewarisan (`extends`).
     * - **EN:** Retrieves the parent Model instance if inheritance (`extends`) is configured.
     */
    get extends(): Model | null {
        const parent = this.definition.extends;
        return (parent && this.register.has(parent) ? this.register.get(parent) : null);
    }


    /**
     * - **ID:** Merekonsiliasi dan mengambil komponen React terasosiasi (menelusuri hierarki pewarisan).
     * - **EN:** Resolves and retrieves the associated React component (traversing inheritance lineage).
     */
    get component() {
        return this.resolve(model => model.definition.component) ?? (({ node, children, ...rest }: ComponentProps<T>) => {
            return createElement(node.tagName || "div", { ...rest, key: node.id }, children);
        });
    }


    /**
     * - **ID:** Nama unik pengenal model.
     * - **EN:** Unique model name identifier.
     */
    get name() {
        return this.definition.name;
    }


    /**
     * - **ID:** Komponen ikon visual untuk representasi UI.
     * - **EN:** Visual icon component for UI display representation.
     */
    get icon(): Icon | undefined {
        return this.resolve(model => model.definition.icon) as any;
    }


    /**
     * - **ID:** Daftar handler command yang didefinisikan pada model ini.
     * - **EN:** List of command handlers defined on this model.
     */
    get commands(): InferCommands<T> {
        return Array.from(this.getLineage())
            .reverse()
            .reduce((commands, model) => ({
                ...commands,
                ...model.definition.commands
            }), {} as InferCommands<T>);
    }


    /**
     * - **ID:** Penggabungan seluruh aksi (actions) yang diwarisi dari seluruh hierarki induk model.
     * - **EN:** Merged action dictionary inherited across the entire parent model lineage.
     */
    get actions() {
        return Array.from(this.getLineage())
            .reverse()
            .reduce((actions, model) => ({
                ...actions,
                ...model.definition.actions
            }), {});
    }


    /**
     * - **ID:** Objek state awal default untuk node baru.
     * - **EN:** Default initial state payload object for new nodes.
     */
    get default() {
        return this.definition.default;
    }


    public isDroppable(node: Node<T>, target: Node): boolean {
        const hook = this.resolve((model) => model.definition?.isDroppable);
        if (hook) return hook.bind(node, target)();
        return true;
    }

    public isAcceptable(node: Node<T>, target: Node): boolean {
        const hook = this.resolve((model) => model.definition?.isAcceptable);
        if (hook) return hook.bind(node, target)();
        return true;
    }

    public onDrop(node: Node<T>, dropped: Node) {
        return this.resolve(m => m.definition.onDrop)?.bind(node, dropped)?.();
    }

    /**
     * - **ID:** Memicu kait siklus hidup `onCreate` sepanjang rantai pewarisan saat instance Node baru dibuat.
     * - **EN:** Triggers `onCreate` lifecycle hooks down the lineage when a new Node instance is created.
     *
     * @param node - **ID:** Instance Node yang baru dibuat / **EN:** Newly constructed Node instance
     */
    public onCreate(node: Node<T>) {
        for (const model of this.getLineage()) {
            const hook = model.definition.onCreated;
            if (hook) {
                return hook.call(model, node);
            }
        }
        return undefined;
    }


    /**
     * - **ID:** Membangun dan merangkai instance Node baru yang terdaftar di dokumen Container.
     * - **EN:** Constructs and initializes a new Node instance attached to the target Container document.
     *
     * @param owner - **ID:** Instance dokumen Container / **EN:** Container document owner instance
     * @param object - **ID:** Payload atribut mentah node / **EN:** Plain initialization payload
     * @returns **ID:** Instance Node terbuat / **EN:** Constructed Node instance
     */
    public buildNode(owner: Container, object?: Partial<NodeObject>): Node<T> {
        const node = new Node<T>(owner, this, object);
        this.onCreate(node);
        return node;
    }


    /**
     * - **ID:** Generator privat yang menyusuri rantai pewarisan model serta memproteksi dari dependensi sirkular.
     * - **EN:** Private generator walking up the model inheritance chain while guarding against circular dependencies.
     */
    public *getLineage(): IterableIterator<Model> {
        let current: Model | null = this as unknown as Model;
        const visited = new Set<string>();

        while (current) {
            if (visited.has(current.name)) {
                throw new Error(
                    `Circular model inheritance detected: ${[
                        ...visited,
                        current.name
                    ].join(" -> ")}`
                );
            }

            visited.add(current.name);
            yield current;
            current = current.extends;
        }
    }


    /**
     * - **ID:** Helper privat untuk mengambil nilai properti pertama yang valid (non-undefined) sepanjang alur pewarisan.
     * - **EN:** Private helper resolving the first defined property value along the model inheritance chain.
     */
    public resolve<TValue>(resolver: (model: Model) => TValue | undefined): TValue | undefined {
        for (const model of this.getLineage()) {
            const value = resolver(model);
            if (value !== undefined) return value;
        }
        return undefined;
    }
}