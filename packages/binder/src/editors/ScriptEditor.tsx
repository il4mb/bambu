import { useCallback, useState } from "react";
import CodeMirror, { BasicSetupOptions, ViewUpdate } from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { useIsDarkMode } from "@bambu/react";
import { Box } from "@mui/material";

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

export interface ScriptEditorProps {
    value: string;
}
export default function ScriptEditor({ value: initialValue }: ScriptEditorProps) {
    const isDarkMode = useIsDarkMode();
    const [value, setValue] = useState(initialValue);
    const onChange = useCallback((val: string, viewUpdate: ViewUpdate) => {
        setValue(val);
    }, []);

    return (
        <Box
            component={CodeMirror}
            value={value}
            width="100%"
            basicSetup={setup}
            theme={isDarkMode ? "dark" : "light"}
            extensions={[json()]}
            onChange={onChange}
            sx={{
                display: "flex",
                flex: 1,
                "& .cm-editor": {
                    backgroundColor: "transparent",
                    fontSize: 12,
                    flex: 1,
                    "&.cm-focused": {
                        outline: "none",
                    },
                },
                "& .cm-scroller": {
                    overflowX: "unset",
                    overflowY: undefined,
                },
            }}
        />
    );
}
