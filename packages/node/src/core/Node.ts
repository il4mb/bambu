import { nanoid } from "nanoid";
import Observable, { ObservableEventMap } from "./Observable";
import Container from "./Container";
import Model from "./Model";
import { isNumber } from "lodash";
import { createRef, JSX, RefObject } from "react";
import NodeData from "./NodeData";
import NodeManager from "./NodeManager";
import EventEmitter from "./EventEmitter";

type NodeObjectWithElement = NodeObject & {
    element: HTMLElement | null
};
type NodeEventMap = ObservableEventMap<NodeObjectWithElement> & {
    [K in keyof NodeObject['data'] & string as `change:data.${K}`]: [Event];
}

export default class Node<T extends ModuleName = ModuleName> extends EventEmitter<NodeEventMap> {

    protected state: NodeObject;
    private readonly elementRef: RefObject<Element | null> = createRef();
    readonly data: NodeData;

    constructor(
        public readonly owner: NodeManager,
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

        this.data = new NodeData(this.state.data);
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

        let event = undefined;
        for (const eventName of [`change:${key}`, "change"] as const) {
            event = this.fire(eventName, { property: key, newValue, oldValue }, event);
            if (event?.isDefaultPrevented) break;
        }

        if (event?.isStopPropagation === false) {
            event = null;
            for (const eventName of [`node:${this.id}:change:${key}`, `node:${this.id}:change`, `node:change:${key}`, "node:change"] as const) {
                // @ts-ignore
                event = this.owner.container.fire(eventName, { property: key, newValue, oldValue }, event);
                if (event?.isDefaultPrevented) break;
            }
        }
    }

    public typeOf(type: ModuleName): boolean {
        let current = this.model;
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
}