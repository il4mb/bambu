import { useMemo, Children, isValidElement } from "react";
import { ComponentProps } from "../../types/define";

export default function ListComponent({
    children,
    node,
    ref,
}: ComponentProps<"list">) {
    const items = useMemo(() => (Array.isArray(node.data.items) ? node.data.items : []), [node]);
    const childNode = useMemo<Node | null>(() => {
        const firstChild = Children.toArray(children)[0];
        if (
            isValidElement(firstChild) &&
            typeof firstChild.props === "object" &&
            firstChild.props &&
            "node" in firstChild.props
        ) {
            return firstChild.props.node as Node;
        }
        return null;
    }, [children]);

    return (
        <div ref={ref}>
            <h1>List Component</h1>
            {children}
        </div>
    );
}
