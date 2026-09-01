import { parseString, ColorType, transform, TransformOptions } from "@tbela99/css-parser/web";
import { Container, Node } from '@bambu/node';
import { CSSProperties } from "react";

type Selector = {
    selector: string;
    css: any
}

export class StyledController {

    protected collector: Map<string, Selector> = new Map();
    protected element: HTMLStyleElement | null = null;

    constructor(protected document: Container) {
        document.on("change:data.style", () => this.render());
        document.on("change:element", () => this.render());
        this.render();
    }

    getElement() {
        if (!this.element) {
            const doc = this.document.head.element?.ownerDocument;
            if (doc) {
                this.element = doc?.createElement("style");
                doc.head.append(this.element);
            }
        }
        return this.element;
    }

    render() {
        const element = this.getElement();
        if (!element) return;

        const collector = new Map<string, CSSProperties>();
        this.document.body.descendants.forEach(node => {
            if (node.data?.style) {
                const element = node.element as HTMLElement;
                if (element && !element.classList.contains(`st-${node.id}`)) {
                    element.classList.add(`st-${node.id}`);
                }
                collector.set(`st-${node.id}`, node.data.style);
            }
        });

        let cssCode = "* { padding: 0; margin: 0; box-sizing: border-box; }\n";
        for (const [key, css] of collector) {
            cssCode += `.${key} {`;
            for (const property of Object.keys(css)) {
                const kebabCase = property.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                cssCode += `\t${kebabCase}: ${css[property]};\n`;
            }
            cssCode += `}\n`;
        }

        element.innerHTML = cssCode;
        // this.minimize(cssCode);
    }


    async minimize(css: string) {
        const result = await transform(css, {
            beautify: true,
            inlineCssVariables: true,
            computeCalcExpression: false,
            convertColor: ColorType.RGBA
        });

        const element = this.getElement();
        if (!element) return;
        element.innerHTML = result.code;
    }

    async parse(css: string, target: Node<'text'>[]) {
        const selector = target.map(n => n.tagName).join(",");
        const result = await parseString(css, {
            beautify: true,
            convertColor: ColorType.HSLA,
            computeCalcExpression: true
        });

        target.forEach(n => {
            // n.trigger();
        })
        // this.render();
    }
}