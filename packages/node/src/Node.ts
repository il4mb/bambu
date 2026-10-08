import { nanoid } from "nanoid";
import Model from "./Model";
import { isNumber } from "lodash";
import { createElement, createRef, FC, JSX, ReactNode, RefObject } from "react";
import NodeData from "./NodeData";
import NodeManager from "./libs/NodeManager";
import EventEmitter from "./core/EventEmitter";
import { AddPrefixToKeys, ChangeEvent, CreateEventMap, EventDetail, Icon, InferNodeData, INodeData, SimpleEvent } from "./types";
import NodeRenderer from "./NodeRenderer";

type NodeObjectWithElement = NodeObject & {
    element: HTMLElement | null
};
type NodeEvents<T extends ModuleName> =
    {
        select: SimpleEvent<Node<T>>
    }
    & CreateEventMap<Node, { change: Node }
        & AddPrefixToKeys<'change:', NodeObjectWithElement>
        & AddPrefixToKeys<'change:data:', InferNodeData<T>>
        & { children: Node[] }
        & AddPrefixToKeys<'children:', { add: { value: Node, propValue: Node[] }, remove: { value: Node, propValue: Node[] } }>>

export default class Node<T extends ModuleName = ModuleName> extends EventEmitter<Node<T>, NodeEvents<T>> {

    readonly state: NodeObject;
    private readonly elementRef: RefObject<Element | null> = createRef();
    readonly data: INodeData<T>;

    constructor(
        public readonly owner: NodeManager,
        public readonly model: Model<T>,
        initial?: Partial<NodeObject>
    ) {

        super();
        this.state = {
            id: initial?.id || nanoid(),
            name: initial?.name || this.model.name,
            tagName: initial?.tagName || this.model.default?.tagName || "div",
            order: initial?.order && isNumber(initial.order) ? Number(initial.order) : 0,
            parent: initial?.parent || null,
            data: {
                style: {},
                ...this.model.default?.data,
                ...initial?.data
            }
        }

        this.data = new NodeData(this, this.state.data as InferNodeData<T>) as INodeData<T>;
    }

    get id(): string {
        return this.state.id;
    }

    get icon(): Icon {
        return this.model.icon ?? (() => null);
    }

    get name(): string {
        return this.state.name ?? this.model.name ?? this.tagName;
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
        return this.state.parent ? this.owner.findNode(this.state.parent) : null;
    }

    get descendants(): ReadonlyMap<string, Node> {
        return this.owner.getDescendants(this);
    }

    get children(): ReadonlyMap<string, Node> {
        return this.owner.getChildren(this);
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

        const eventDetail = { property: key, newValue, oldValue };
        // @ts-ignore
        this.fire(`change:${key}`, eventDetail);
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

    public fire<K extends keyof NodeEvents<T>, PV = any, V = PV>(events: K | K[], detail?: EventDetail<PV, V> | undefined): SimpleEvent<K, Node<T>> | ChangeEvent<K, Node<T>, PV, V> {
        const event = super.fire(events, detail);
        if (typeof events === "string" && events.startsWith("change")) {
            // @ts-ignore
            super.fire("change", detail);
        }

        if (!event.isDefaultPrevented && detail) {
            const prop = detail?.property;
            this.owner.fire(
                [
                    `node:${this.id}:change:${prop}`,
                    `node:${this.id}:change`,
                    `node:change:${prop}`,
                    "node:change"
                ]
            );
        }
        return event;
    }

    public render(): ReactNode {
        const setRef = (element: HTMLElement | null = null) => {
            if (!element || element.nodeType === 1) {
                this.set("element", element);
            } else {
                throw new Error("Ref must be RefObject of HTMLElement");
            }
        }

        // Return the reactive wrapper component!
        return createElement(NodeRenderer, {
            key: this.id,
            node: this,
            ref: (element: HTMLElement | null) => setRef(element)
        });
    }


    public clone(initial?: Partial<NodeObject>) {
        return this.owner.cloneNode(this, initial);
    }

    public delete() {
        this.owner.deleteNode(this);
    }

    public clearChildren() {
        this.children.forEach(child => child.delete());
    }
}