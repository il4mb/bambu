import { useEditorContext } from "@/contexts/EditorProvider";
import { useMemo } from "react";

export const useInsertSilent = () => {
    const { setContent, stack: tokens } = useEditorContext();

    return useMemo(
        () => (text: string, start: number, end?: number) => {
            const iend = end ?? start;
            setContent((current) => {
                const istart = Math.min(start, iend);
                const finalEnd = Math.max(start, iend);
                return current.slice(0, istart) + text + current.slice(finalEnd);
            });
            return start + text.length;
        },
        [setContent],
    );
};
