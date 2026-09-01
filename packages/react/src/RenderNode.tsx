import { Fragment, useMemo } from "react";
import { useContainer } from "./contexts/ContainerProvider";

type RenderNodeProps = {};

export default function RenderNode({}: RenderNodeProps) {
    const { nodes, body } = useContainer();
    const rootNodes = useMemo(() => Array.from(body.children.values()), [nodes]);
    return (
        <Fragment>
            {rootNodes.map((node) => node.render())}
        </Fragment>
    );
}
