import { useTokenContext } from "@/components/TokenNode";
import { getChildren, getDescendants } from "@/utils/tokens";
import { useMemo } from "react";

export const useChildren = (token: IToken): [token: IToken, descendants: IToken[]][] => {
    const { descendants } = useTokenContext();
    return useMemo<[token: IToken, descendants: IToken[]][]>(
        () => getChildren(token, descendants || []).map((child) => [child, getDescendants(child, descendants || [])]),
        [token, descendants],
    );
};
