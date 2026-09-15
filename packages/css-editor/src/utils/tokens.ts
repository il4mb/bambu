import TokenNode from "@/components/TokenNode";
import { createElement } from "react";

export const getRoots = (tokens: IToken[]): IToken[] => {
    const rootTokens: IToken[] = [];
    let lastEnd = -1;
    for (const token of tokens) {
        if (token[1] >= lastEnd) {
            rootTokens.push(token);
            lastEnd = token[2];
        }
    }
    return rootTokens;
}

export const getDescendants = (token: IToken, stack: IToken[]): IToken[] => {
    return stack.filter((child) => child !== token && child[1] >= token[1] && child[2] <= token[2]);
};

export const getChildren = (token: IToken, stack: IToken[]): IToken[] => {
    const children: IToken[] = [];
    for (const child of stack) {
        if (child === token || child[1] < token[1] || child[2] > token[2]) {
            continue;
        }
        // If the current token is inside an already found child,
        // it isn't a direct child.
        const parent = children.find((current) => current[1] <= child[1] && current[2] >= child[2]);
        if (!parent) {
            children.push(child);
        }
    }

    return children;
};





export const renderChildren = (tokenList: [token: IToken, descendants: IToken[]][], value?: string): React.ReactNode => {
    return tokenList?.length > 0 ? tokenList.map(([token, descendants], i) => {
        return createElement(TokenNode, { key: i, token, descendants });
    }) : value;
}