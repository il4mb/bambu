import { useChildren } from "@/hooks/useToken";
import { renderChildren } from "@/utils/tokens";

export interface DefaultTokenProps {
    token: IToken;
    value: string;
}
export default function DefaultToken({ token, value }: DefaultTokenProps) {
    const children = useChildren(token);

    if (value === "\n") {
        return (
            <>
                <span className={token[0]} data-start={token[1]} data-end={token[2]}>
                    <span data-start={token[1]} data-end={token[1]} />
                    <br />
                    <span data-start={token[2]} data-end={token[2]} />
                </span>
            </>
        );
    }
    return (
        <span className={token[0]} data-start={token[1]} data-end={token[2]}>
            {renderChildren(children, value)}
        </span>
    );
}
