import { Operator } from "css-tree";
import styled from "@emotion/styled";

const Component = styled("span")({
    color: "red",
    fontFamily: "monospace",
    fontSize: 10,
    paddingRight: '2px',
});

type NodeOperatorProps = {
    node: Operator;
};
export default function NodeOperator({ node }: NodeOperatorProps) {
    return <Component>{node.value}</Component>;
}
