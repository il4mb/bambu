import { useEditorContext } from "@/contexts/EditorProvider";
import { Fragment, useMemo } from "react";
import TokenNode from "./TokenNode";
import { getChildren, getDescendants, getRoots } from "@/utils/tokens";

export default function TokenRender() {
    const { stack } = useEditorContext();
    const signature = useMemo(() => stack.map((token) => token.join(",")).join(","), [stack]);
    const roots = useMemo<[token: IToken, descendants: IToken[]][]>(
        () => getRoots(stack).map((token) => [token, getDescendants(token, stack)]),
        [signature],
    );

    return (
        <Fragment>
            {roots.map(([token, descendants], i) => (
                <TokenNode key={i} token={token} descendants={descendants} />
            ))}
        </Fragment>
    );
}
