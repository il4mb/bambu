import { createElement, forwardRef, useEffect, useState } from "react";
import Node from "./Node";

const NodeRenderer = forwardRef<HTMLElement, { node: Node }>((props, ref) => {
    const { node } = props;

    const [children, setChildren] = useState(() =>
        Array.from(node.children.values()),
    );

    useEffect(() => {
        const unsubscribe = node.on("children", () => {
            setChildren(Array.from(node.children.values()));
        });

        return unsubscribe;
    }, [node]);

    const childrenElements = children.map((child) => child.render());
    const Component = node.model.component;

    // @ts-ignore
    return createElement(Component, { node, ref }, childrenElements);
});

export default NodeRenderer;
