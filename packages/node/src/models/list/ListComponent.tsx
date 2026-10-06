import { ComponentProps } from "../../types/define";

export default function ListComponent({ children, ref,}: ComponentProps<"list">) {
   
    return (
        <div ref={ref}>
            <h1>List Component</h1>
            {children}
        </div>
    );
}
