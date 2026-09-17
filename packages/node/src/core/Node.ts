import { nanoid } from "nanoid";
import { Change, Changed, createEvent, getChanges } from "../tools";
import Container from "./Container";
import type Model from "./Model";
import { InferCommands, InferData } from "../types/infer";
import { NestedKeys, NormalizeFunction, PathValue } from "../types/tools";
import { createElement, createRef, RefObject } from "react";
import EventEmitter from "./EventEmitter";
import _ from "lodash";
import { ChangedEvent } from "../types/event";

type NodeChangeEvent<T> = ChangedEvent<{
    value: T;
    prev: T | null;
    path: string[];
    node: Node
}>

type DataEventMap = {
    [K in NestedKeys<NodeObject>]: (event: NodeChangeEvent<PathValue<NodeObject, K>>) => void
}
type EventMap = {
    element: (event: NodeChangeEvent<Element>) => void
    children: (event: NodeChangeEvent<ReadonlyMap<string, Node>>) => void
} & DataEventMap;

export default class Node<T extends ModuleName = ModuleName> extends EventEmitter<EventMap> {

    public readonly state: NodeObject;
    private readonly elementRef: RefObject<Element | null> = createRef();

    constructor(
        public readonly owner: Container,
        public readonly model: Model<T>,
        rw?: Partial<NodeObject>
    ) {
        super();
        this.state = {
            id: nanoid(),
            tagName: "div",
            order: 0,
            parent: null,
            ...this.model.default,
            ...rw,
            data: {
                ...this.model.default?.data,
                ...rw.data
            }
        };
    }

    public get id() {
        return this.state.id;
    }

    public get tagName() {
        return this.state.tagName || "div";
    }

    public get element() {
        return this.elementRef.current;
    }
    public set element(value: Element | null) {
        const prev = this.elementRef.current;
        if (prev === value) return;
        this.elementRef.current = value;

        const event = createEvent({
            node: this,
            path: ["element"],
            prev,
            value
        });
        this.emitWith("element", (listeners) => {
            for (const callback of listeners.values()) {
                callback(event);
                if (event.isStopPropagation) break;
            };
        });
        if (!event.isDefaultPrevented) {
            this.owner.emitWith("change:element", (listeners) => {
                for (const callback of listeners.values()) {
                    callback(event);
                    if (event.isStopPropagation) break;
                };
            });
        }
    }

    public get order() {
        return this.state.order || 0;
    }
    public set order(value: number) {
        this.state.order = value;
    }


    public get parent(): Node | null {
        return this.state.parent
            ? this.owner.findNode(this.state.parent) ?? null
            : null;
    }

    public set parent(parent: Node | null) {
        const prevParent = this.parent;

        // Nothing changed.
        if (prevParent?.id === parent?.id) {
            return;
        }

        // Remove from previous parent.
        if (prevParent) {
            const prevChildren = this.owner.getChildren(prevParent);
            this.state.parent = null;
            const nextChildren = this.owner.getChildren(prevParent);
            // prevParent.emitWith(
            //     new NodeChangeEvent("children", this, {
            //         value: nextChildren,
            //         prev: prevChildren,
            //     })
            // );
        }

        // Add to new parent.
        if (parent) {
            const prevChildren = this.owner.getChildren(parent);
            this.state.parent = parent.id;
            const nextChildren = this.owner.getChildren(parent);
            // parent.emitWith(
            //     new NodeChangeEvent("children", this, {
            //         value: nextChildren,
            //         prev: prevChildren,
            //     })
            // );
        }
    }

    public get descendants() {
        return this.owner.getDescendants(this);
    }

    public get children() {
        return this.owner.getChildren(this);
    }

    public get data(): InferData<T> {
        return this.state.data as InferData<T>;
    }


    public set<K extends NestedKeys<NodeObject>>(key: K, value: PathValue<NodeObject, K> | ((prev: PathValue<NodeObject, K>) => PathValue<NodeObject, K>)): void;
    public set(state: NodeObject | ((prev: NodeObject) => NodeObject)): void;
    public set(key?: string | NodeObject | ((prev: NodeObject) => NodeObject), value?: any | ((prev: any) => any)) {

        // 1. FIX: Deep clone the state. 
        // (You can also use the native structuredClone(this.state) if you prefer)
        const oldState = _.cloneDeep(this.state);

        // --- PATH UPDATE ---
        if (typeof key === "string") {
            const targetValue = _.get(this.state, key);
            const nextValue = typeof value === "function" ? value(targetValue) : value;

            // Ignore No Change
            if (_.isEqual(targetValue, nextValue)) return;

            _.set(this.state, key, nextValue);

            this.emitChanges(getChanges(oldState, this.state));
            return;
        }

        // --- FULL STATE REPLACEMENT ---
        const nextValue = typeof key === "function" ? key(this.state) : key;

        // 2. FIX: Prevent empty diffs if the new state object is identical to the old one
        if (_.isEqual(this.state, nextValue)) return;
        _.set(this, "state", nextValue);

        this.emitChanges(getChanges(oldState, this.state));
    }



    public trigger<K extends keyof InferCommands<T>>(
        name: K,
        ...args: Parameters<NormalizeFunction<InferCommands<T>[K]>>
    ): ReturnType<NormalizeFunction<InferCommands<T>[K]>> {

        const command = this.model.commands[name];
        if (typeof command === "function") {
            // Emit Before Event

            const value = command.apply(this, args);

            // Emit After

            return value;
        }

        return undefined;
    }

    public render() {
        const children = Array.from(this.children.values()).map(n => n.render());
        const component = this.model.component;

        return createElement(component, {
            ref: (element: Element) => {
                this.element = element;
            },
            key: this.id,
            node: this
        } as any, children);
    }

    public typeOf(type: ModuleName) {
        let current = this.model;
        while (current) {
            if (current.name === type) return true;
            if (!current.extends) break;
            current = current.extends;
        }
        return false;
    }


    public isDroppable(target: Node) {
        return this.model.isDroppable(this, target);
    }

    public isAcceptable(target: Node) {
        return this.model.isAcceptable(this, target);
    }

    private emitChanges(changes: Changed[]) {

        for (const change of changes.reverse()) {
            const event = createEvent({
                path: change.path,
                value: change.value,
                prev: change.prev
            });
            // @ts-ignore
            this.emitWith(event.path.join("."), (listeners) => {
                for (const callback of listeners) {
                    // @ts-ignore
                    callback(event);
                    if (event.isStopPropagation) break;
                }
            });
            if (event.isDefaultPrevented) break;

            const ownerBubleEvent = {
                ...event,
                node: this
            }
            this.owner.emitWith(`change:${ownerBubleEvent.path.join(".")}`, (listeners) => {
                for (const callback of listeners.values()) {
                    // @ts-ignore
                    callback(ownerBubleEvent);
                    if (ownerBubleEvent.isStopPropagation) break;
                };
            });
        }
    }
}