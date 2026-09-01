import { Node } from "@bambu/node";
import { useEffect, useState } from "react";

export const useNodeChildren = (node: Node) => {
    const [children, setChildren] = useState(() => Array.from(node.children.values()));

    useEffect(() => {
        return node.on("children", (event) => {
            setChildren(Array.from(event.value.values()));
        });
    }, [node]);

    return children.map((n) => n.render());
};
