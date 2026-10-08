import { ComponentProps } from "../../types/define";

export default function ListComponent({
    children,
    ref,
}: ComponentProps<"list">) {
    return (
        <div
            ref={ref}
            style={{
                all: "inherit",
                padding: 0,
                margin: 0,
            }}
        >
            {children}
        </div>
    );
}
