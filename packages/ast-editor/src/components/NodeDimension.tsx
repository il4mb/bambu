import { Dimension } from "css-tree";
import styled from "@emotion/styled";
import { Fragment } from "react/jsx-runtime";
import NumberField from "./fields/NumberField";
import { useState } from "react";
import UnitField from "./fields/UnitField";

const Value = styled("span")({
    color: "blue",
    fontFamily: "monospace",
    fontSize: 10,
});
const Unit = styled("span")({
    color: "blue",
    fontFamily: "monospace",
    fontSize: 10,
});

type NodeDimensionProps = {
    node: Dimension;
};

export default function NodeDimension({ node }: NodeDimensionProps) {
    const [value, setValue] = useState(Number(node.value));
    return (
        <Fragment>
            <NumberField value={value} onChange={setValue} />
            <UnitField value={node.unit} />
        </Fragment>
    );
}
