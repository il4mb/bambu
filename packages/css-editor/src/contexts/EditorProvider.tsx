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
};

export default function EditorProvider({ content: initialContent, children, onChange }: EditorProviderProps) {
    const [stack, setStack] = useState<IToken[]>([]);
    const [content, setContent] = useState(initialContent);
    const tokensRef = useLatest(stack);

    const generateTokens = useCallback((content: string) => {
        const tokenList = tokenizer.tokenize(content ? content : "");
        if (isEqual(tokensRef.current, tokenList)) return;
        setStack(tokenList);
    }, []);

    const handleContentChange = useCallback(
        (newContent: string) => {
            setContent(newContent);
            onChange?.(newContent);
        },
        [onChange],
    );

    useEffect(() => {
        generateTokens(content);
    }, [generateTokens]);

    const values = useMemo(
        () => ({ content, setContent: handleContentChange, stack, generateTokens, setStack }),
        [content, handleContentChange, stack, generateTokens, setStack],
    );

    return <Context.Provider value={values}>{children}</Context.Provider>;
}
