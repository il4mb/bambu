import Container from "../Container";
import { Observerable } from "../core";
import Node from "../Node";
import { ChangeEvent, EventDetail, SimpleEvent } from "../types";
import NodeManager from "./NodeManager";

export type Pointer = { x: number, y: number }
export type DropPosition = "after" | "before" | "inside";
export type WrapperLayout = "horizontal" | "vertical";
export type DragingData = {
    target: Node;
    position: DropPosition;
    nodes: Node[];
    layout: WrapperLayout;
}
export type GestureState = {
    pressed: boolean;
    dragging: boolean;
    pointer: Pointer;
    pressPointer: Pointer;
    hovering: Node[];
    selecting: Node[];
    draggingData: DragingData | null;
}

export class GestureManager extends Observerable<GestureManager, GestureState> {

    public readonly state: GestureState = {
        pressed: false,
        dragging: false,
        pointer: { x: 0, y: 0 },
        pressPointer: { x: 0, y: 0 },
        hovering: [],
        selecting: [],
        draggingData: null
    }
    protected nm: NodeManager;

    constructor(protected container: Container) {

        super();
        this.nm = container.Nodes;

        const onMouseLeave = (e: MouseEvent) => this.onMouseLeave(e);
        const onMouseDown = (e: MouseEvent) => this.onMouseDown(e);
        const onMouseUp = (e: MouseEvent) => this.onMouseUp(e);
        const onMouseMove = (e: MouseEvent) => this.onMouseMove(e);

        let bodyElement = this.nm.body.element as HTMLElement | null;
        const applyListeners = () => {
            bodyElement?.addEventListener("mouseleave", onMouseLeave);
            bodyElement?.addEventListener("mousedown", onMouseDown, true);
            bodyElement?.addEventListener("mouseup", onMouseUp, true);
            bodyElement?.addEventListener("mousemove", onMouseMove, true);
        }
        const removeListener = () => {
            bodyElement?.removeEventListener("mouseleave", onMouseLeave);
            bodyElement?.removeEventListener("mousedown", onMouseDown, true);
            bodyElement?.removeEventListener("mouseup", onMouseUp, true);
            bodyElement?.removeEventListener("mousemove", onMouseMove, true);
        }

        applyListeners();
        this.nm.body.on("change:element", ({ value }) => {
            removeListener();
            if (value) {
                bodyElement = value;
                applyListeners();
            }
        });
    }

    get document() {
        return this.nm.body.element?.ownerDocument;
    }
    get isPressed() {
        return this.state.pressed;
    }
    get isDragging() {
        return this.state.dragging;
    }
    get selectedNodes() {
        return this.state.selecting;
    }
    get hoveredNodes() {
        return this.state.hovering;
    }


    protected onMouseLeave(e: MouseEvent) {
        this.state.hovering = [];
        this.state.dragging = false;
        this.state.draggingData = null;
    }

    protected onMouseDown(e: MouseEvent) {
        this.state.pressed = true;
        this.state.pressPointer = {
            x: e.clientX,
            y: e.clientY
        }

        const target = e.target as HTMLElement;
        const node = this.findAncestorNode(target);
        if (!node) {
            if (!e.ctrlKey && !e.metaKey) {
                this.set("selecting", []);
            }
            return;
        }

        const multiSelect = e.ctrlKey || e.metaKey;
        if (!multiSelect) {
            this.set("selecting", [node]);
            return;
        }

        const exists = this.state.selecting.some(
            n => n.id === node.id
        );
        if (exists) {
            this.set("selecting", this.getRootAncestors(
                this.state.selecting.filter(
                    n => n.id !== node.id
                )
            ));
        } else {
            this.set("selecting", this.getRootAncestors([
                ...this.state.selecting,
                node
            ]));
        }
    }

    protected onMouseUp(e: MouseEvent) {
        if (this.isDragging) {
            console.log("Cleanup Dragging");
        }
        this.set({ pressed: false, dragging: false });
    }

    protected onMouseMove(e: MouseEvent) {
        this.set("pointer", { x: e.clientX, y: e.clientY });

        if (!this.isPressed) {
            let focus = this.document?.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
            let focusNode = null;

            while (focus && focus !== this.document?.body) {
                focusNode = this.findByElement(focus);
                if (focusNode) break;
                focus = focus.parentElement;
            }

            this.set("hovering", focusNode && !this.state.selecting.includes(focusNode) ? [focusNode] : []);
            return;
        }

        this.set("hovering", []);
        const dx = e.clientX - this.state.pressPointer.x;
        const dy = e.clientY - this.state.pressPointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!this.isDragging && distance > 4) {
            this.set("dragging", true);
            this.clearTextSelection();
        }

        if (this.isDragging) {
            let focus = this.document?.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
            let focusNode: any = null;

            while (focus && focus !== this.document?.body) {
                focusNode = this.findByElement(focus);
                if (focusNode) break;
                focus = focus.parentElement;
            }

            if (focusNode) {
                let focusNodeElement = focusNode.element as HTMLElement;

                if (focusNodeElement) {
                    if (focusNodeElement.children.length > 0) {
                        let closestChildNode = null;
                        let closestChildEl: HTMLElement | null = null;
                        let minDistance = Infinity;

                        const children = Array.from(focusNodeElement.children) as HTMLElement[];

                        for (const childEl of children) {
                            const childNode = this.findByElement(childEl);
                            if (!childNode) continue;

                            const rect = childEl.getBoundingClientRect();
                            const childDx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
                            const childDy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);

                            const distSquared = childDx * childDx + childDy * childDy;

                            if (distSquared < minDistance) {
                                minDistance = distSquared;
                                closestChildNode = childNode;
                                closestChildEl = childEl;
                            }
                        }

                        if (closestChildNode && closestChildEl && minDistance < 2500) {
                            focusNode = closestChildNode;
                            focusNodeElement = closestChildEl;
                        }
                    }

                    const filtered = Array.from(this.state.selecting).filter((node: any) =>
                        node.id !== focusNode.id && node.element && !node.element.contains(focusNodeElement)
                    );

                    if (filtered.length > 0) {
                        const targetRect = focusNodeElement.getBoundingClientRect();
                        const layout = this.getLayoutDirection(focusNodeElement);
                        let position: DropPosition = "inside";

                        const edgeThreshold = 0.25;

                        if (layout === "horizontal") {
                            const offsetX = e.clientX - targetRect.left;
                            if (offsetX < targetRect.width * edgeThreshold) position = "before";
                            else if (offsetX > targetRect.width * (1 - edgeThreshold)) position = "after";
                        } else {
                            const offsetY = e.clientY - targetRect.top;
                            if (offsetY < targetRect.height * edgeThreshold) position = "before";
                            else if (offsetY > targetRect.height * (1 - edgeThreshold)) position = "after";
                        }

                        const isVoidElement = ["IMG", "INPUT", "HR", "BR"].includes(focusNodeElement.tagName);
                        if (isVoidElement && position === "inside") {
                            if (layout === "horizontal") {
                                position = (e.clientX - targetRect.left) < (targetRect.width / 2) ? "before" : "after";
                            } else {
                                position = (e.clientY - targetRect.top) < (targetRect.height / 2) ? "before" : "after";
                            }
                        }

                        // --- TRUE LOGICAL SIBLING DETECTION ---
                        // Skip over drop-lines, ghost nodes, and unregistered elements
                        let logicalPrevNode: any = null;
                        let prevEl = focusNodeElement.previousElementSibling;
                        while (prevEl) {
                            logicalPrevNode = this.findByElement(prevEl as HTMLElement);
                            if (logicalPrevNode) break;
                            prevEl = prevEl.previousElementSibling;
                        }

                        let logicalNextNode: any = null;
                        let nextEl = focusNodeElement.nextElementSibling;
                        while (nextEl) {
                            logicalNextNode = this.findByElement(nextEl as HTMLElement);
                            if (logicalNextNode) break;
                            nextEl = nextEl.nextElementSibling;
                        }

                        const dropContainer = position === "inside" ? focusNode : focusNode.parent;
                        if (!dropContainer) return;

                        const finalNodes = filtered.filter((node: any) => {
                            // 1. Reject if attempting to drop before the target, and node is ALREADY the logical previous sibling
                            if (position === "before" && logicalPrevNode && logicalPrevNode.id === node.id) {
                                return false;
                            }

                            // 2. Reject if attempting to drop after the target, and node is ALREADY the logical next sibling
                            if (position === "after" && logicalNextNode && logicalNextNode.id === node.id) {
                                return false;
                            }

                            // 3. Ensure target is droppable and acceptable
                            return node.isDroppable(dropContainer) && dropContainer.isAcceptable(node);
                        });

                        if (finalNodes.length > 0) {
                            this.set("draggingData", {
                                target: focusNode,
                                nodes: finalNodes,
                                position: position,
                                layout: layout
                            });
                        } else {
                            this.set("draggingData", null) // Clears the UI highlight if no nodes are valid
                        }
                    }
                }
            }
        }
    }

    protected getRootAncestors(array: Node[]) {
        return array.filter(node => {
            return !array.some(other => {
                if (other === node) return false;
                return Array
                    .from(other.descendants.values())
                    .includes(node);
            });
        });
    }

    /**
     * Clear Window Text Selection
     */
    public clearTextSelection() {
        const win = this.document?.defaultView;
        if (!win) return;
        const selection = win.getSelection();
        if (selection) {
            selection.removeAllRanges();
        }
    }

    public findAncestorNode(element: Element) {
        let current: Element | null = element;
        while (current) {
            const node = this.findByElement(current);
            if (node) return node;
            current = current.parentElement;
        }
        return null;
    }

    public findByElement(element: Element) {
        const arrayNodes = Array.from(this.nm.nodes.values());
        return arrayNodes.find(n => n.element === element);;
    }

    getLayoutDirection(element: HTMLElement): WrapperLayout {
        let layout = "vertical";

        const prevSibling = element.previousElementSibling;
        const nextSibling = element.nextElementSibling;

        // Try to use the next sibling, fallback to previous if it's the last child
        const sibling = nextSibling || prevSibling;

        if (sibling) {
            const nodeRect = element.getBoundingClientRect();
            const sibRect = sibling.getBoundingClientRect();

            const xDiff = Math.abs(nodeRect.left - sibRect.left);
            const yDiff = Math.abs(nodeRect.top - sibRect.top);

            // If the horizontal distance is greater than vertical, it's a row
            layout = xDiff > yDiff ? "horizontal" : "vertical";
        }
        return layout as WrapperLayout;
    }

    public fire<K extends keyof GestureState, PV = any, V = PV>(events: K | K[], detail?: EventDetail<PV, V> | undefined): SimpleEvent<K, GestureManager> | ChangeEvent<K, GestureManager, PV, V> {
        const event = super.fire(events, detail);
        if (!event.isDefaultPrevented && detail) {
            this.container.fire(`gesture:${detail.property}`, detail);
        }
        return event;
    }
}