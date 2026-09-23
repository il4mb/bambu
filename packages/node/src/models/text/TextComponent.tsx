import { Children, createElement, JSX } from "react";
import { ComponentProps } from "../../types/define";

export default function TextComponent({ ref, node, children }: ComponentProps<"text">) {
    const ParentComponent = node.model.resolve((m) => {
        const comp = m.definition.component;
        return comp && comp !== TextComponent ? comp : undefined;
    });

    const content = Children.count(children) > 0 ? children : JSON.stringify(node.data?.text ?? "Binding");

    if (ParentComponent) {
        return (
            <ParentComponent ref={ref} node={node}>
                {content}
            </ParentComponent>
        );
    }

    const Tag = (node.tagName || "p") as keyof JSX.IntrinsicElements;
    return createElement(Tag, { ref }, content);
}
