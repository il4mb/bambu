import { CssNode } from "css-tree";
import { useNodeChildren } from "../hooks/useNodeChildren";

type NodeChildrenProps = {
    node: CssNode;
};

export default function NodeChildren({ node }: NodeChildrenProps) {
    return useNodeChildren(node);
}
