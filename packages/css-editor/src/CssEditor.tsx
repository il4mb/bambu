import { useState } from "react";
import styled from "@emotion/styled";
import CaretHilight from "@/components/CaretHilight";
import EditorProvider from "@/contexts/EditorProvider";
import { SelectionProvider } from "@/contexts/SelectionProvider";
import { InputProvider } from "@/contexts/InputProvider";
import TokenRender from "./components/TokenRender";

const Container = styled("div")({
    position: "relative",
    fontSize: 10,
    padding: 4,
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    fontFamily: "monospace",
});
const EditorContainer = styled("div")({
    position: "relative",
    userSelect: "none",
    whiteSpace: "pre",
    fontFamily: "monospace",
    width: "100%",
    height: "100%",
});

type ASTEditorProps = {
    content: string;
    onChange?: (content: string) => void;
};

export default function CssEditor({ content: externalContent, onChange }: ASTEditorProps) {
    const [container, setContainer] = useState<HTMLElement>();

    return (
        <EditorProvider content={externalContent} onChange={onChange}>
            <SelectionProvider container={container}>
                <InputProvider>
                    <Container>
                        <EditorContainer ref={setContainer}>
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
