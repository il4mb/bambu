import TokenRender from "@/components/TokenRender";
import { useLatest } from "@/hooks/useLatest";
import { Token } from "@/libs/code";
import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type TokenProviderState = {
    position: {
        start: number;
        end: number;
    };
    token: Token;
    parent: TokenProviderState;
    updateValue: (value: string) => void;
    updateChild: (id: string, value: string) => void;
};
const TokenContext = createContext<TokenProviderState | undefined>(undefined);
export const useCurrentToken = () => useContext(TokenContext);

export interface TokenProviderProps {
    component: FC<{ token: Token; children?: ReactNode }>;
    token: Token;
    onChange: (token: Token) => void
}
export default function TokenProvider({ token, component: Component, onChange }: TokenProviderProps) {
    const parent = useCurrentToken();

    const position = useMemo(() => {
        const parentStart = parent?.position?.start ?? 0;
        return {
            start: parentStart + token.start,
            end: parentStart + token.end,
        };
    }, [parent?.token?.start, token.start, token.end]);

    const [children, setChildren] = useState(token.children);

    const parentRef = useLatest(parent);
    const tokenRef = useLatest(token);
    const positionRef = useLatest(position);
    const childrenRef = useLatest(children);

    // const updateChild = (id: string, value: string) => {
    //     const child = childrenRef.current.find((child) => child.id === id);
    //     if (!child) return;
    //     console.log("Updating", token, "Child", child);
    // };

    // const updateValue = useCallback((value: string) => {
    //     const { start, end } = tokenRef.current;
    //     const newEnd = start + value.length;
    //     const delta = newEnd - end;
    //     // console.log("Update", token.id, value);
    //     console.log(parentRef.current, parent)
    //     if (parentRef.current) {
    //         parentRef.current.updateChild(tokenRef.current.id, value);
    //     }
    //     // const newContent = oldValue.slice(0, start) + value + oldValue.slice(end);

    //     // console.log(start, end, positionRef.current, value);

    //     // if(parent) {

    //     // }
    //     // contentRef.current = newContent;
    //     // setContent(newContent);
    //     // setTokens((prev) =>
    //     //     prev.map((token) => {
    //     //         // Changed token
    //     //         if (token.id === id) {
    //     //             return {
    //     //                 ...token,
    //     //                 value,
    //     //                 end: newEnd,
    //     //             };
    //     //         }

    //     //         // Tokens after changed token
    //     //         if (token.start >= end) {
    //     //             return {
    //     //                 ...token,
    //     //                 start: token.start + delta,
    //     //                 end: token.end + delta,
    //     //             };
    //     //         }

    //     //         return token;
    //     //     }),
    //     // );
    // }, []);

    // const values = useMemo(
    //     () => ({
    //         position,
    //         token,
    //         parent,
    //         updateValue,
    //         updateChild,
    //     }),
    //     [position, token, parent, updateValue, updateChild],
    // );

    return (
        <TokenContext.Provider value={values}>
            <Component token={token}>{children ? <TokenRender>{children}</TokenRender> : token.value}</Component>
        </TokenContext.Provider>
    );
}
