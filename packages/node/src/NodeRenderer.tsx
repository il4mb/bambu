import { createElement, forwardRef, useEffect, useState } from "react";
import Node from "./Node";

// This functional component handles the React lifecycle and re-rendering
const NodeRenderer = forwardRef<HTMLElement, { node: Node }>((props, ref) => {
    const { node } = props;

    // 1. Put the children in React State
    const [children, setChildren] = useState(() =>
        Array.from(node.children.values()),
    );

    // 2. Listen to changes and update state to trigger a re-render
    useEffect(() => {
        const unsubscribe = node.on("children", () => {
            setChildren(Array.from(node.children.values()));
        });

        return unsubscribe; // Cleanup on unmount
    }, [node]);

    // 3. Render the updated children
    const childrenElements = children.map((child) => child.render());
    const Component = node.model.component;

    // @ts-ignore
    return createElement(Component, { node, ref }, childrenElements);
});

export default NodeRenderer;
