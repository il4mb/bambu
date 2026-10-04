import Register from "./Register";
import type Node from "./Node";
import StyleManager from "./StyleManager";
import EventEmitter from "./EventEmitter";
import NodeManager from "./NodeManager";
import { ShallowOptionalNode } from "../types";

type Opts = {
    initialData: ShallowOptionalNode[]
}

type NodeEventMap = {
    "change": [newNode: Node, prevNode: Node];
    "change:element": [newEl: Element | null, prevEl: Element | null];
}

type ContainerEventMap = {
    /** Listen to all nodes */
    [K in keyof NodeEventMap & string as `node:${K}`]: NodeEventMap[K];
} & {
    /** Listen to specific node (Arbitrary String ID) */
    [key: `node:${string}:change`]: NodeEventMap["change"];
    [key: `node:${string}:change:element`]: NodeEventMap["change:element"];
};


/**
 * **ID:** Kelas Container utama yang mengelola seluruh pohon node (tree structure) dan siklus hidup node dalam dokumen.
 * **EN:** Primary Container class managing the entire node tree structure and lifecycle within a document.
 */
export default class Container extends EventEmitter<ContainerEventMap> {


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
