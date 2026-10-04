import Register from "./core/Register";
import StyleManager from "./core/StyleManager";
import EventEmitter from "./core/EventEmitter";
import NodeManager from "./core/NodeManager";
import { CreateEventMap, ShallowOptionalNode } from "./types";

type Opts = {
    initialData: ShallowOptionalNode[];
}

type Events = CreateEventMap<
    'node:add' | 'node:delete' |
    'node:change' | `node:${string}:change`
>;

/**
 * **ID:** Kelas Container utama yang mengelola seluruh pohon node (tree structure) dan siklus hidup node dalam dokumen.
 * **EN:** Primary Container class managing the entire node tree structure and lifecycle within a document.
 */
export default class Container extends EventEmitter<Events> {


    readonly nodeManager: NodeManager;
    readonly styleManager: StyleManager;

    /**
     * @param register - **ID:** Registry penampung skema Model / **EN:** Model schema registry instance
     * @param nodes - **ID:** [Opsional] Array data mentah node untuk inisialisasi / **EN:** [Optional] Initial raw node objects array
     */
    constructor(public register: Register, opts?: Opts) {
        super();
        this.nodeManager = new NodeManager(this, opts?.initialData);
        this.styleManager = new StyleManager(this);
    }
}
