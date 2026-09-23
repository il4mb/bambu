import { CSSProperties } from "react";
import Container from "./Container";

export default class StyleManager {

    private styleEl: HTMLStyleElement | null = null;
    constructor(readonly owner: Container) {
        this.owner.on("change:data.style", () => this.render());
        this.owner.on("change:element", () => this.render());
    }


    get element() {
        const headEl = this.owner.head.element;
        if (!this.styleEl) {
            if (!headEl) return;
            this.styleEl = headEl.ownerDocument.createElement("style");
            headEl.append(this.styleEl);
        }
        return this.styleEl;
    }


    private render() {
        if (this.element) {
            const collector = new Map<string, CSSProperties>();
            [this.owner.body, ...Array.from(this.owner.body.descendants.values())].forEach(node => {
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