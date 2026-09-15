import { cloneElement, FC, Fragment, ReactElement, ReactNode, useState } from "react";

type Hoverable = {
    hovered?: boolean;
    onMouseEnter: (e: MouseEvent) => void;
    onMouseLeave: (e: MouseEvent) => void;
};
type HoveredProps = {
    as?: FC<{ children?: ReactNode; hovered: boolean }>;
    children: ReactElement<Hoverable>;
    render?: (props: { hovered: boolean }) => ReactNode;
    keepMount?: boolean;
};

export default function Hovered({ as = Fragment, children, render: Render, keepMount = false }: HoveredProps) {
    const Component = as;
    const [hovered, setHovered] = useState(false);
    const onMouseEnter = (e: MouseEvent) => setHovered(true);
    const onMouseLeave = (e: MouseEvent) => setHovered(false);

    return (
        <Component hovered={hovered}>
            {cloneElement(children, { onMouseEnter, onMouseLeave, hovered })}
            {Render && (hovered || keepMount) && <Render hovered={hovered} />}
        </Component>
    );
}
