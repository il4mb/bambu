import { CSSProperties } from "react";
import Container from "../Container";
import Node from "../Node";
import { EventEmitter } from "../core";
import { FontsManager } from "./FontsManager";
import { CreateEventMap } from "../types";

const THEME_NAME = ['dark', 'light', 'system'] as const;
type ThemeName = typeof THEME_NAME[number];
type StyleManagerState = {
    theme: ThemeName;
}

type StyleManagerEvents = CreateEventMap<StyleManager, StyleManagerState>;

export default class StyleManager extends EventEmitter<StyleManagerEvents> {

    private styleEl: HTMLStyleElement | null = null;
    protected head: Node;
    readonly fonts: FontsManager;

    protected state: StyleManagerState = {
        theme: "system"
    }

    constructor(readonly container: Container) {
        super();
        this.fonts = new FontsManager(this);
        this.head = this.container.Nodes.head;
        this.head.on("change:element", () => this.render());
        this.container.Nodes.on("node:change", () => this.render());
    }

    get theme() {
        return this.state.theme;
    }

    get element() {
        const headEl = this.head.element;
        if (!this.styleEl) {
            if (!headEl) return;
            this.styleEl = headEl.ownerDocument.createElement("style");
            headEl.append(this.styleEl);
        }
        return this.styleEl;
    }

    setTheme(theme: ThemeName) {
        if (!THEME_NAME.includes(theme)) {
            console.error(`Invalid theme passed, supported values only within ${THEME_NAME.join(", ")}.`)
            return;
        }
        const prev = this.state.theme;
        if (prev === theme) return;
        this.state.theme = theme;
        this.fire("theme", { target: this, property: ["theme"], oldValue: prev, newValue: theme })
    }

    private render() {
        if (this.element) {
            const collector = new Map<string, CSSProperties>();
            [this.container.Nodes.body, ...Array.from(this.container.Nodes.body.descendants.values())].forEach(node => {
                if (node.data?.style) {
                    const element = node.element as HTMLElement;
                    if (element && !element.classList.contains(`st-${node.id}`)) {
                        element.classList.add(`st-${node.id}`);
                    }
                    collector.set(`st-${node.id}`, node.data.style);
                }
            });

            let cssCode = "* { padding: 0; margin: 0; box-sizing: border-box; font-family: system-ui; }\n";
            for (const [key, css] of collector) {
                cssCode += `.${key} {`;
                for (const property of Object.keys(css)) {
                    const kebabCase = property.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                    // @ts-ignore
                    cssCode += `\t${kebabCase}: ${css[property]};\n`;
                }
                cssCode += `}\n`;
            }

            this.element.innerHTML = cssCode;
        }
    }


}