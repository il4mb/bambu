import { Caret } from "./caret";

export namespace AST {

    export function getTextAt(code: string, selection: Caret.Range): string {
        const start = Math.min(selection.anchor, selection.focus);
        const end = Math.max(selection.anchor, selection.focus);
        if (start === end) return "";
        return code.substring(start, end);
    }

    /**
     * Replaces a range of text strictly in-place across one or multiple nodes.
     * Returns the updated selection cursor position.
     */
    export function replaceRange(code: string, selection: Caret.Range, text: string) {
        const start = Math.min(selection.anchor, selection.focus);
        const end = Math.max(selection.anchor, selection.focus);

        const newPos = start + text.length;
        const newCode = code.slice(0, start) + text + code.slice(end);
        console.debug("Replacing range", { start, end, text, newPos, newCode });
        return {
            selection: { anchor: newPos, focus: newPos },
            code: newCode
        };
    }

    /**
     * Convenience method for backspace, delete, or range deletion.
     */
    export function deleteRange(code: string, selection: Caret.Range, direction: "forward" | "backward" = "backward") {
        let start = Math.min(selection.anchor, selection.focus);
        let end = Math.max(selection.anchor, selection.focus);

        if (start === end) {
            if (direction === "backward" && start > 0) start -= 1;
            else if (direction === "forward") end += 1;
        }

        console.debug("Deleting range", { start, end, direction, selection });

        return replaceRange(code, { anchor: start, focus: end }, "");
    }
}