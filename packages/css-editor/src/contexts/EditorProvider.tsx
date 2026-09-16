import { useLatest } from "@/hooks/useLatest";
import { Tokenizer, Registry } from "@il4mb/css-tokenizer";
import { isEqual } from "lodash";
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";

const registry = new Registry([
    {
        type: "newline",
        kind: "char",
        char: "\n",
        priority: 400,
    },
]);

const tokenizer = new Tokenizer(registry);

type EditorState = {
    colors?: ColorOptions;
    content: string;
    setContent: Dispatch<SetStateAction<string>>;
    stack: IToken[];
    setStack: Dispatch<SetStateAction<IToken[]>>;
    generateTokens: (content: string) => void;
};

const Context = createContext<EditorState | undefined>(undefined);
export const useEditorContext = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useEditorContext must be used within an EditorProvider");
    }
    return context;
};

type EditorProviderProps = {
    content: string;
    children?: React.ReactNode;
    onChange?: (content: string) => void;
    colors?: ColorOptions;
};

export default function EditorProvider({ content: initialContent, children, onChange, colors }: EditorProviderProps) {
    const [stack, setStack] = useState<IToken[]>([]);
    const [content, setContent] = useState(initialContent);
    const tokensRef = useLatest(stack);
    const onChangeRef = useLatest(onChange);
    const localChangedRef = useLatest(false);

    const generateTokens = useCallback((content: string) => {
        const tokenList = tokenizer.tokenize(content ? content : "");
        if (isEqual(tokensRef.current, tokenList)) return;
        setStack(tokenList);
    }, []);

    const handleContentChange = (newContent: string) => {
        localChangedRef.current = true;
        setContent(newContent);
        onChangeRef.current?.(newContent);
    };

    useEffect(() => {
        generateTokens(content);
    }, [generateTokens]);

    useEffect(() => {
        if (localChangedRef.current) {
            localChangedRef.current = false;
            return;
        }
        if (initialContent !== content) {
            setContent(initialContent);
            generateTokens(initialContent);
        }
    }, [initialContent, content, generateTokens]);

    const values = useMemo(
        () => ({ content, stack, colors, setContent: handleContentChange, generateTokens, setStack }),
        [content, stack, colors, generateTokens, setStack],
    );

    return <Context.Provider value={values}>{children}</Context.Provider>;
}
