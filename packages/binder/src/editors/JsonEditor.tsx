import { useCallback, useRef, useState } from "react";
import CodeMirror, { ReactCodeMirrorRef, ViewUpdate } from "@uiw/react-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { useIsDarkMode } from "@bambu/react";
import { Box } from "@mui/material";
import { SETUP } from "./setup";
import { linter, lintGutter } from "@codemirror/lint";

export interface JsonEditorProps {
    value: string;
}

export default function JsonEditor({ value: initialValue }: JsonEditorProps) {
    const codeMirrorRef = useRef<ReactCodeMirrorRef | null>(null);
    const isDarkMode = useIsDarkMode();
    const [value, setValue] = useState(initialValue);

    const onChange = useCallback((val: string, viewUpdate: ViewUpdate) => {
        setValue(val);
    }, []);

    return (
        <Box
            component={CodeMirror}
            ref={codeMirrorRef}
            value={value}
            width="100%"
            basicSetup={SETUP}
            theme={isDarkMode ? "dark" : "light"}
            extensions={[json(), linter(jsonParseLinter()), lintGutter()]}
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
                "& .cm-gutters-before": {
                    backgroundColor: "rgba(135, 135, 135, 0.25)",
                    "& .cm-activeLineGutter": {
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                    },
                },
            }}
        />
    );
}
