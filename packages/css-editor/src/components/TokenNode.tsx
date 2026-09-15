import { useEditorContext } from "@/contexts/EditorProvider";
import { useLatest } from "@/hooks/useLatest";
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useMemo } from "react";
import ColorToken from "./tokens/ColorToken";
import DefaultToken from "./tokens/DefaultToken";
import NumberToken from "./tokens/NumberToken";
import DimensionToken from "./tokens/DimensionToken";

type TokenContextValue = {
    token: IToken;
    value: string;
    descendants: IToken[];
    setValue: Dispatch<SetStateAction<string>>;
};

const TokenContext = createContext<TokenContextValue | undefined>(undefined);

export const useTokenContext = () => useContext(TokenContext);

export interface RenderTokenProps {
    token: IToken;
    descendants?: IToken[];
}

export default function TokenNode({ token, descendants }: RenderTokenProps) {
    const { content, setStack, setContent } = useEditorContext();

    const signature = useMemo(() => token.join(","), [token]);
    const value = useMemo(() => content.slice(token[1], token[2]), [content, signature]);

    /*
     * Keep latest values without making handleChange unstable.
     */
    const tokenRef = useLatest(token);
    const contentRef = useLatest(content);

    const setValue = useCallback(
        (newValue: string) => {
            const token = tokenRef.current;
            const content = contentRef.current;

            const [type, start, end] = token;

            const oldLength = end - start;
            const lengthDiff = newValue.length - oldLength;

            if (lengthDiff === 0 && newValue === content.slice(start, end)) {
                return;
            }

            const newContent = content.slice(0, start) + newValue + content.slice(end);

            setStack((prevStack) => {
                return prevStack.map((t) => {
                    const [type, tStart, tEnd] = t;

                    // The token being edited.
                    if (t === token) {
                        return [type, start, start + newValue.length];
                    }

                    // Token contains the edited token.
                    if (tStart <= start && tEnd >= end) {
                        return [type, tStart, tEnd + lengthDiff];
                    }

                    // Token is after the edited range.
                    if (tStart >= end) {
                        return [type, tStart + lengthDiff, tEnd + lengthDiff];
                    }

                    return t;
                });
            });

            setContent(newContent);
        },
        [tokenRef, contentRef, setStack, setContent],
    );

    const contextValue = useMemo(
        () => ({
            value,
            token,
            descendants,
            setValue,
        }),
        [signature, descendants, value, setValue],
    );

    /*
     * Pick token component.
     */
    const Component = useMemo(() => {
        switch (token[0]) {
            case "dimension":
                return DimensionToken;
            case "color":
                return ColorToken;
            case "number":
                return NumberToken;
            default:
                return DefaultToken;
        }
    }, [signature]);

    return (
        <TokenContext.Provider value={contextValue}>
            <Component token={token} value={value} />
        </TokenContext.Provider>
    );
}
