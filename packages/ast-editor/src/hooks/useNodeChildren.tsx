import { CssNode } from "css-tree";
import { useMemo } from "react";
import NodeRender from "../NodeRender";

export const useNodeChildren = (node: CssNode) => {
    return useMemo(
        () => {
            if (node && "children" in node && node.children) {
                const children = node.children;
                return Array.from(children).map((child, i) => <NodeRender node={child} key={i} />);
            }
            return null;
        },
        // @ts-ignore
        [node?.children],
    );
}