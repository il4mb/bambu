import { Container, EventEmitter, Node } from "@bambu/node";

export class BinderController extends EventEmitter {
    private unsubscribe: (() => void) | null = null;

    constructor(public document: Container) {
        super();
        this.document.on("change:data.events", () => this.applyEvents());
        this.document.on("change:element", () => this.applyEvents());
    }

    applyEvents() {
        // Run prior teardown before re-binding
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }

        const cleanups: Array<() => void> = [];
        this.document.nodes.forEach((node) => {
            const element = node.element as HTMLElement;
            if (!element) return;

            const events = node.data.events || {};

            Object.entries(events).forEach(([key, value]) => {
                const eventType = String(key).toLowerCase();
                const listener = (event: Event) => {
                    this.handleEvent(node, key, value, event);
                };

                element.addEventListener(eventType, listener);
                cleanups.push(() => {
                    element.removeEventListener(eventType, listener);
                });
            });
        });

        this.unsubscribe = () => {
            cleanups.forEach((cleanup) => cleanup());
        };
    }

    private handleEvent(node: Node, key: string, value: any, event: Event) {
        // Custom logic or emission when an event fires
        this.emit("node:event", { node, key, value, event });
        // console.log(`Event fired on node ${node.id}: ${key} with value: ${value}`);
        // node.element.ownerDocument.defaultView.eval(value); // Execute in the context of the document's window
    }

    public destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
}
