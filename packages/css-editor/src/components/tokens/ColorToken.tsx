import { useChildren } from "@/hooks/useToken";
import { renderChildren } from "@/utils/tokens";

export interface ColorTokenProps {
    token: IToken;
    value?: string;
}
export default function ColorToken({ token, value }: ColorTokenProps) {
    const children = useChildren(token);

    return (
        <span data-start={token[1]} data-end={token[2]} style={{ position: "relative", paddingLeft: "1.2em" }}>
            <span
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "block",
                    width: "1em",
                    height: "1em",
                    background: value,
                    pointerEvents: "none",
                }}
            />
            {renderChildren(children, value)}
        </span>
    );
}
