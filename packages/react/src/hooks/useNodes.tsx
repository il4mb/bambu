import { useContainer } from "@/contexts";
import { Node } from "@bambu/node";
import { useEffect, useRef, useState } from "react";

export const useNodeChildren = (node: Node) => {
    const [children, setChildren] = useState(() =>
        Array.from(node.children.values()),
    );

    useEffect(() => {
        // @ts-ignore
        return node.on("change:children", (event) => {
            setChildren(Array.from(event.value.values()));
        });
    }, [node]);

    return children.map((n) => n.render());
};

export const useSelectedNodes = () => {
    const { Gesture } = useContainer();
    const [nodes, setNodes] = useState<Node[]>([]);
    const selectionIdsRef = useRef(nodes.map((e) => e.id).sort());

    useEffect(() => {
        if (!Gesture) return;
        return Gesture.on("selecting", (e) => {
            const value = e.change.newValue as Node[];
            const ids = value.map((e) => e.id).sort();
            if (ids === selectionIdsRef.current) return;
            selectionIdsRef.current = ids;
            setNodes(value);
        });
    }, []);

    return nodes;
};
