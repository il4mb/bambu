import { nanoid } from "nanoid";
import Model from "./Model";
import { isNumber } from "lodash";
import { createRef, JSX, RefObject } from "react";
import NodeData from "./NodeData";
import NodeManager from "./core/NodeManager";
import EventEmitter from "./core/EventEmitter";
import { AddPrefix, CreateEventMap, EventDetail, InferNodeData, INodeData } from "./types";

type NodeObjectWithElement = NodeObject & {
    element: HTMLElement | null
};
type Events<T extends ModuleName> = CreateEventMap<
    'change'
    | AddPrefix<'change:', keyof NodeObjectWithElement>
    | AddPrefix<'change:data:', keyof InferNodeData<T> & string>
>;

export default class Node<T extends ModuleName = ModuleName> extends EventEmitter<Events<T>> {

    readonly state: NodeObject;
    private readonly elementRef: RefObject<Element | null> = createRef();
    readonly data: INodeData<T>;

    constructor(
        public readonly manage: NodeManager,
        public readonly model: Model<T>,
        initial?: Partial<NodeObject>
    ) {

        super();
        this.state = {
            id: initial?.id || nanoid(),
            tagName: initial?.tagName || this.model.default?.tagName || "div",
            order: initial?.order && isNumber(initial.order) ? Number(initial.order) : 0,
            parent: initial?.parent || null,
            data: {
                ...this.model.default?.data,
                ...initial?.data
            }
        }

        this.data = new NodeData(this, this.state.data as InferNodeData<T>) as INodeData<T>;
    }

    get id(): string {
        return this.state.id;
    }

    get tagName(): keyof JSX.IntrinsicElements {
        return this.state.tagName;
    }

    get element(): Element | null {
        return this.elementRef.current || null;
    }

    get order() {
        return this.state.order;
    }

    get parent(): Node | null {
        return this.state.parent ? this.manage.findNode(this.state.parent) : null;
    }

    get descendants(): ReadonlyMap<string, Node> {
        return this.manage.getDescendants(this);
    }

    get children(): ReadonlyMap<string, Node> {
        return this.manage.getChildren(this);
    }

    public set<K extends keyof NodeObjectWithElement>(key: K, newValue: NodeObjectWithElement[K]): void {
        if (key === "data") {
            throw new Error("Can't set data propery is readonly");
        }

        let oldValue = null;
        if (key === "element") {
            oldValue = this.elementRef.current;
            this.elementRef.current = newValue as HTMLElement;
        } else {
            // @ts-ignore
            oldValue = this.state[key];
            // @ts-ignore
            this.state[key] = newValue;
        }

        const eventDetail = { target: this, property: [key], newValue, oldValue };
        // @ts-ignore
        this.fire([`change:${key}`, "change"], eventDetail);
    }

    public typeOf(type: ModuleName): boolean {
        let current = this.model as Model;
        while (current) {
            if (current.name === type) return true;
            if (!current.extends) break;
            current = current.extends;
        }
        return false;
    }

    public isDroppable(target: Node): boolean {
        return this.model.isDroppable(this, target);
    }

    public isAcceptable(target: Node): boolean {
        return this.model.isAcceptable(this, target);
    }

    public fire<K extends keyof Events<T>, O extends object = object, V = any>(events: K | K[], detail: EventDetail<O, V>): void {
        super.fire(events, detail);

        const prop = detail.property.join(":");
        this.manage.fire(
            // @ts-ignore
            [
                `node:${this.id}:change:${prop}`,
                `node:${this.id}:change`,
                `node:change:${prop}`,
                "node:change"
            ],
            detail
        );
    }
}
