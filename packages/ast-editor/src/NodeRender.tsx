import { CssNode } from "css-tree";
import NodeOperator from "./components/NodeOperator";
import NodeDimension from "./components/NodeDimension";
import NodeFunction from "./components/NodeFunction";
import NodeChildren from "./components/NodeChildren";

type NodeRenderProps = {
    node: CssNode;
};

export default function NodeRender({ node }: NodeRenderProps) {
    if (node.type === "Operator") {
        return <NodeOperator node={node} />;
    }
    if (node.type === "Dimension") {
        return <NodeDimension node={node} />;
    }
    if (node.type === "Function") {
        return <NodeFunction node={node} />;
    }
    return <NodeChildren node={node} />;
}
