import { useState } from "react";
import CaretHilight from "@/components/CaretHilight";
import EditorProvider from "@/contexts/EditorProvider";
import { SelectionProvider } from "@/contexts/SelectionProvider";
import { InputProvider } from "@/contexts/InputProvider";
import TokenRender from "./components/TokenRender";
import { styled } from "@mui/material";

const Container = styled("div")({
    position: "relative",
    fontSize: 10,
    padding: 4,
    boxSizing: "border-box",
    fontFamily: "monospace",
    overflow: "visible",
});
const EditorContainer = styled("div")({
    position: "relative",
    userSelect: "none",
    whiteSpace: "pre",
    fontFamily: "monospace",
    minWidth: '1.25em',
    minHeight: '1.25em',
    overflow: "visible",
});

type ASTEditorProps = {
    content: string;
    onChange?: (content: string) => void;
    colors?: ColorOptions;
};

export default function CssEditor({ content: externalContent, colors, onChange }: ASTEditorProps) {
    const [container, setContainer] = useState<HTMLElement>();

    return (
        <EditorProvider content={externalContent} onChange={onChange} colors={colors}>
            <SelectionProvider container={container}>
                <InputProvider>
                    <Container>
                        <EditorContainer ref={setContainer} className="editor-container">
                            <TokenRender />
                            &nbsp;
                            <CaretHilight container={container} />
                        </EditorContainer>
                    </Container>
                </InputProvider>
            </SelectionProvider>
        </EditorProvider>
    );
}
