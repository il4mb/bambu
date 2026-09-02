import { Selection } from "@/types";
import { useMemo, useRef } from "react";
import styled from "@emotion/styled";
import { max, min } from "lodash";
import { Caret } from "@/libs/caret";

const SVG = styled("svg")({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 1200,
    pointerEvents: "none",
    overflow: "visible",
});

type SelectionHilightProps = {
    selection: Selection;
    lineHeight?: number;
};

export default function CaretHilight({ selection, lineHeight = 12 }: SelectionHilightProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    const start = min([selection.anchor, selection.focus]) ?? 0;
    const end = max([selection.anchor, selection.focus]) ?? 0;

    const rects = useMemo(() => {
        const container = svgRef.current?.parentElement;

        if (!container) return [];

        return Caret.getCaretRects(selection, container);
    }, [selection]);

    const { selectionPath, caretPath } = useMemo(() => {
        if (!rects.length) return { selectionPath: "", caretPath: "" };
        const sortedRects = [...rects].sort((a, b) => {
            if (Math.abs(a.y - b.y) > 1) return a.y - b.y;
            return a.x - b.x;
        });

        const first = sortedRects[0];
        const last = sortedRects[sortedRects.length - 1];

        // 1. Calculate Caret Focus Position
        // If selection.focus >= selection.anchor, they selected forwards (focus is at the end)
        // If selection.focus < selection.anchor, they selected backwards (focus is at the start)
        const isForward = selection.focus >= selection.anchor;
        const focusX = isForward ? last.x : first.x;
        const focusY = isForward ? last.y : first.y;
        const focusH = isForward ? last.h || lineHeight : first.h || lineHeight;

        const caret = [
            `M ${focusX - 1} ${focusY}`,
            `L ${focusX + 1} ${focusY}`,
            `L ${focusX + 1} ${focusY + focusH}`,
            `L ${focusX - 1} ${focusY + focusH}`,
            "Z",
        ].join(" ");

        let path = "";

        // 2. Calculate Background Selection Position

        // Collapsed caret.
        if (start === end) {
            path = ""; // Only show the blinking caret, no selection highlight.
        }
        // Same line.
        else if (Math.abs(first.y - last.y) < 1) {
            const x1 = Math.min(first.x, last.x);
            const x2 = Math.max(first.x, last.x);
            const y = Math.min(first.y, last.y);
            const h = Math.max(first.h || lineHeight, last.h || lineHeight, lineHeight);

            path = [`M ${x1} ${y}`, `L ${x2} ${y}`, `L ${x2} ${y + h}`, `L ${x1} ${y + h}`, "Z"].join(" ");
        }
        // Multi-line selection.
        else {
            const firstY = first.y;
            const firstH = first.h || lineHeight;
            const lastY = last.y;
            const lastH = last.h || lineHeight;

            const container = svgRef.current?.parentElement;

            if (container) {
                const width = container.clientWidth;

                const rightY = Math.max(firstY + firstH, lastY);
                const leftY = Math.min(lastY, firstY + firstH);

                const p: string[] = [];
                p.push(`M ${first.x} ${firstY}`);
                p.push(`L ${width} ${firstY}`);
                p.push(`L ${width} ${rightY}`);
                p.push(`L ${last.x} ${rightY}`);
                p.push(`L ${last.x} ${lastY + lastH}`);
                p.push(`L 0 ${lastY + lastH}`);
                p.push(`L 0 ${leftY}`);
                p.push(`L ${first.x} ${leftY}`);
                p.push("Z");

                path = p.join(" ");
            }
        }

        return { selectionPath: path, caretPath: caret };
    }, [rects, start, end, lineHeight, selection.anchor, selection.focus]);

    return (
        <SVG ref={svgRef} aria-hidden="true">
            <style>{`
                @keyframes blink-animation {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .caret-blink {
                    animation: blink-animation 1s step-end infinite;
                }
            `}</style>
            {selectionPath && <path d={selectionPath} fill="#0066ff7e" />}
            {caretPath && <path className="caret-blink" d={caretPath} fill="#000000" />}
        </SVG>
    );
}
