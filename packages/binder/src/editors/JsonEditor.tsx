import { useMemo, useRef } from "react";
import CodeMirror, {
    ReactCodeMirrorRef,
    ViewUpdate,
} from "@uiw/react-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { useColorMode } from "@bambu/react"; // Assuming this is your custom hook
import { Box } from "@mui/material";
import { SETUP } from "./setup"; // Assuming this is your CodeMirror basicSetup config
import { linter, lintGutter } from "@codemirror/lint";

export interface TextEditorProps {
    value: string;
    onChange?: (val: string, viewUpdate: ViewUpdate) => void;
    lang?: "json" | "text" | "js";
}

export default function TextEditor({
    value: initialValue,
    onChange,
    lang = "text",
}: TextEditorProps) {
    const codeMirrorRef = useRef<ReactCodeMirrorRef | null>(null);
    const isDarkMode = useColorMode();
    const extensions = useMemo(() => {
        switch (lang) {
            case "js":
                return [javascript(), lintGutter()];
            case "json":
                return [json(), linter(jsonParseLinter()), lintGutter()];
            default:
                return [lintGutter()];
        }
    }, [lang]);

    return (
        <Box
            component={CodeMirror}
            ref={codeMirrorRef}
            value={initialValue}
            width="100%"
            basicSetup={SETUP}
            theme={isDarkMode ? "dark" : "light"}
            extensions={extensions}
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
                    overflowY: undefined, // "unset" is usually better if you want default scrolling
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
