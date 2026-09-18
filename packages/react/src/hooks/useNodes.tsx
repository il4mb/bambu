import { useGestureController } from "@/contexts/GestureProvider";
import { Node } from "@bambu/node";
import { useEffect, useRef, useState } from "react";

export const useNodeChildren = (node: Node) => {
    const [children, setChildren] = useState(() => Array.from(node.children.values()));

    useEffect(() => {
        return node.on("children", (event) => {
            setChildren(Array.from(event.value.values()));
        });
    }, [node]);

    return children.map((n) => n.render());
};

export const useSelectedNodes = () => {
    const gesture = useGestureController();
    const [nodes, setNodes] = useState<Node[]>([]);
    const selectionIdsRef = useRef(nodes.map((e) => e.id).sort());

    useEffect(() => {
        if (!gesture) return;
        return gesture.on("selecting", (e) => {
            const value = e.value as Node[];
            const ids = value.map((e) => e.id).sort();
            if (ids === selectionIdsRef.current) return;
            selectionIdsRef.current = ids;
            setNodes(value);
        });
    }, []);

    return nodes;
};
