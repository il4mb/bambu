import { BasicSetupOptions } from "@uiw/react-codemirror";

export const SETUP: BasicSetupOptions = {
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