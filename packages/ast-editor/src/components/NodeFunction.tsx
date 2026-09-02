import { FunctionNode } from "css-tree";
import styled from "@emotion/styled";
import { useNodeChildren } from "../hooks/useNodeChildren";
import { Fragment } from "react/jsx-runtime";

const Function = styled("span")({
    color: "red",
    fontFamily: "monospace",
    fontSize: 10,
});
const Bracked = styled("span")({
    color: "#9ebee4",
    fontFamily: "monospace",
    fontSize: 10,
});

type NodeFunctionProps = {
    node: FunctionNode;
};

export default function NodeFunction({ node }: NodeFunctionProps) {
    const children = useNodeChildren(node);
    return (
        <Fragment>
            <Function>{node.name}</Function>
            <Bracked>{"("}</Bracked>
            {children}
            <Bracked>{")"}</Bracked>
        </Fragment>
    );
}
