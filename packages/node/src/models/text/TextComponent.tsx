import { Children, createElement, JSX, useEffect, useState } from "react";
import { ComponentProps } from "../../types/define";

export default function TextComponent({
    ref,
    node,
    children,
}: ComponentProps<"text">) {
    const ParentComponent = node.model.resolve((m) => {
        const comp = m.definition.component;
        return comp && comp !== TextComponent ? comp : undefined;
    });

    const [content, setContent] = useState(() =>
        Children.count(children) > 0 ? children : String(node.data?.text),
    );

    useEffect(() => {
        return node.on("change:data:text", (e) => {
            setContent(Children.count(children) > 0 ? children : e.value);
        });
    }, [node, children]);

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
