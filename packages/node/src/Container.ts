import Register from "./core/Register";
import StyleManager from "./libs/StyleManager";
import EventEmitter from "./core/EventEmitter";
import NodeManager from "./libs/NodeManager";
import { AddPrefixToKeys, CreateEventMap, ShallowOptionalNode } from "./types";
import { DeviceManager } from "./libs/DeviceManager";
import { GestureManager, GestureState } from "./libs/GestureManager";

type Opts = {
    initialData: ShallowOptionalNode[];
}

type Events = CreateEventMap<any, 'node:add' | 'node:delete' | 'node:change' | `node:${string}:change` | 'device:change'>
    & AddPrefixToKeys<"gesture:", CreateEventMap<GestureManager, GestureState>>

/**
 * **ID:** Kelas Container utama yang mengelola seluruh pohon node (tree structure) dan siklus hidup node dalam dokumen.
 * **EN:** Primary Container class managing the entire node tree structure and lifecycle within a document.
 */
export default class Container extends EventEmitter<Events> {


    readonly Devices: DeviceManager;
    readonly Nodes: NodeManager;
    readonly Styles: StyleManager;
    readonly Gesture: GestureManager;

    /**
     * @param register - **ID:** Registry penampung skema Model / **EN:** Model schema registry instance
     * @param nodes - **ID:** [Opsional] Array data mentah node untuk inisialisasi / **EN:** [Optional] Initial raw node objects array
     */
    constructor(public register: Register, opts?: Opts) {
        super();
        this.Nodes = new NodeManager(this, opts?.initialData);
        this.Styles = new StyleManager(this);
        this.Devices = new DeviceManager(this);
        this.Gesture = new GestureManager(this);
    }
}
