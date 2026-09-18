import { useCallback, useState } from "react";
import CodeMirror, { BasicSetupOptions, ViewUpdate } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

const setup: BasicSetupOptions = {
    lineNumbers: false,
    foldGutter: false,
    dropCursor: false,
    allowMultipleSelections: false,
    indentOnInput: true,
    bracketMatching: true,
    closeBrackets: true,
    autocompletion: true,
    rectangularSelection: false,
    crosshairCursor: false,
    highlightActiveLine: true,
    highlightSelectionMatches: true,
    closeBracketsKeymap: true,
    searchKeymap: true,
    foldKeymap: true,
    completionKeymap: true,
    lintKeymap: true,
    tabSize: 2,
};

export interface ScriptEditorProps {}
export default function ScriptEditor({}: ScriptEditorProps) {
    const [value, setValue] = useState("console.log('hello world!');");
    const onChange = useCallback((val: string, viewUpdate: ViewUpdate) => {
        console.log("val:", val);
        setValue(val);
    }, []);

    return (
        <CodeMirror
            value={value}
            height="auto"
            basicSetup={setup}
            extensions={[javascript({ jsx: true })]}
            onChange={onChange}
        />
    );
}
