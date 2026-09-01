import { Children, Fragment, MouseEvent } from "react";
import { ComponentProps } from "../../types/define";

export default function TextComponent({ ref, node, children }: ComponentProps<"text">) {
    const Component = node.model.extends.component;
    return (
        <Fragment>
            <Component ref={ref} node={node}>
                {Children.count(children) > 0 ? children : node.data.text}
            </Component>
        </Fragment>
    );
}
