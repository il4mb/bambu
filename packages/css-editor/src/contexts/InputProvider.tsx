import { AST } from "@/libs/ast";
import { Caret } from "@/libs/caret";
import { createContext, useContext, ReactNode, useCallback, useEffect } from "react";
import { useSelectionProvider } from "@/contexts/SelectionProvider";
import { useEditorContext } from "@/contexts/EditorProvider";
import { useLatest } from "@/hooks/useLatest";

interface InputProviderState {}

const InputProviderContext = createContext<InputProviderState | undefined>(undefined);

type InputProviderProps = {
    children?: ReactNode;
};
export const InputProvider = ({ children }: InputProviderProps) => {
    const { selection, setSelection } = useSelectionProvider();
    const { content, setContent, generateTokens } = useEditorContext();
    const contentRef = useLatest(content);
    const selectionRef = useLatest(selection);

    const triggerUpdate = (newContent: string, newSelection: Caret.Range) => {
        contentRef.current = newContent;
        selectionRef.current = newSelection;
        setSelection(newSelection);
        setContent(newContent);
        generateTokens(newContent);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!selectionRef.current) return;

        // Ctrl+A / Cmd+A
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
            e.preventDefault();
            const length = contentRef.current.length;
            const nextSelection: Caret.Range = {
                anchor: 0,
                focus: length,
            };
            selectionRef.current = nextSelection;
            setSelection(nextSelection);
            return;
        }

        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
            const { focus, anchor } = selectionRef.current;
            const maxLen = contentRef.current.length;
            let nextFocus = focus;
            if (e.key === "ArrowLeft") {
                if (!e.shiftKey && anchor !== focus) {
                    nextFocus = Math.min(anchor, focus);
                } else {
                    nextFocus = Math.max(0, focus - 1);
                }
            } else if (e.key === "ArrowRight") {
                if (!e.shiftKey && anchor !== focus) {
                    nextFocus = Math.max(anchor, focus);
                } else {
                    nextFocus = Math.min(maxLen, focus + 1);
                }
            } else if (e.key === "ArrowUp") {
                nextFocus = Caret.getVerticalOffset(contentRef.current, focus, -1);
            } else if (e.key === "ArrowDown") {
                nextFocus = Caret.getVerticalOffset(contentRef.current, focus, 1);
            }

            const nextSelection: Caret.Range = {
                anchor: e.shiftKey ? anchor : nextFocus,
                focus: nextFocus,
            };

            selectionRef.current = nextSelection;
            setSelection({ ...nextSelection });
            return;
        }

        // Don't handle browser/system shortcuts.
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === "Backspace") {
            e.preventDefault();
            const { selection, code } = AST.deleteRange(contentRef.current, selectionRef.current, "backward");
            triggerUpdate(code, selection);
        } else if (e.key === "Delete") {
            e.preventDefault();
            const { selection, code } = AST.deleteRange(contentRef.current, selectionRef.current, "forward");
            triggerUpdate(code, selection);
        } else if (e.key === "Enter") {
            e.preventDefault();
            const { selection, code } = AST.replaceRange(contentRef.current, selectionRef.current, "\n");
            triggerUpdate(code, selection);
        } else if (e.key.length === 1) {
            e.preventDefault();

            const { selection, code } = AST.replaceRange(contentRef.current, selectionRef.current, e.key);

            triggerUpdate(code, selection);
        }
    }, []);

    useEffect(() => {
        if (!selection) return;

        const handleCopy = (e: ClipboardEvent) => {
            if (selection.anchor === selection.focus) return;
            e.clipboardData?.setData("text/plain", AST.getTextAt(contentRef.current, selection));
            e.preventDefault();
        };

        const handleCut = (e: ClipboardEvent) => {
            if (selection.anchor === selection.focus) return;
            e.clipboardData?.setData("text/plain", AST.getTextAt(contentRef.current, selection));
            const updated = AST.deleteRange(contentRef.current, selection);
            triggerUpdate(updated.code, updated.selection);
            e.preventDefault();
        };

        const handlePaste = (e: ClipboardEvent) => {
            const text = e.clipboardData?.getData("text/plain");
            if (!text) return;
            const updated = AST.replaceRange(contentRef.current, selection, text);
            triggerUpdate(updated.code, updated.selection);
            e.preventDefault();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("copy", handleCopy);
        document.addEventListener("cut", handleCut);
        document.addEventListener("paste", handlePaste);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("cut", handleCut);
            document.removeEventListener("paste", handlePaste);
        };
    }, [selection, handleKeyDown]);

    return <InputProviderContext.Provider value={{}}>{children}</InputProviderContext.Provider>;
};

export const useInputProvider = () => {
    const context = useContext(InputProviderContext);
    if (!context) throw new Error("useInputProvider must be used within a InputProviderProvider");
    return context;
};
