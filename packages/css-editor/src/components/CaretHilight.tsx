import { useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { max, min } from "lodash";
import { Caret } from "@/libs/caret";
import { useSelection } from "@/contexts/SelectionProvider";
import { useEditorContext } from "@/contexts/EditorProvider";

const SVG = styled("svg")({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 1200,
    pointerEvents: "none",
    overflow: "hidden",
});

type SelectionHilightProps = {
    lineHeight?: number;
    container: HTMLElement;
};

export default function CaretHilight({ lineHeight = 14, container }: SelectionHilightProps) {
    const { stack: tokens } = useEditorContext();
    const selection = useSelection();
    const svgRef = useRef<SVGSVGElement>(null);
    const [rects, setRects] = useState<Caret.Rect[]>([]);

    const start = min([selection?.anchor, selection?.focus]) ?? 0;
    const end = max([selection?.anchor, selection?.focus]) ?? 0;

    useLayoutEffect(() => {
        if (!container || !selection) {
            setRects([]);
            return;
        }

        setRects(Caret.getCaretRects(selection, container));
    }, [selection, container, tokens]);

    const { selectionPath, caretPath } = useMemo(() => {
        if (!rects.length || !selection) return { selectionPath: "", caretPath: "" };
        const sortedRects = [...rects].sort((a, b) => {
            if (Math.abs(a.y - b.y) > 1) return a.y - b.y;
            return a.x - b.x;
        });

        const first = sortedRects[0];
        const last = sortedRects[sortedRects.length - 1];

        // Setup bounds to prevent math from exceeding container dimensions
        const maxWidth = container ? container.clientWidth : 99999;
        const clampX = (val: number) => Math.min(Math.max(val, 0), maxWidth);

        // 1. Calculate Caret Focus Position
        const isForward = selection.focus >= selection.anchor;
        let focusX = isForward ? last.x : first.x;
        let focusY = isForward ? last.y : first.y;
        let focusH = isForward ? last.h || lineHeight : first.h || lineHeight;

        // Clamp the caret X position strictly inside the container
        const safeFocusX = Math.min(Math.max(focusX, 1), maxWidth - 1);
        const safeFocusY = Math.max(focusY, 0);

        const caret = [
            `M ${safeFocusX - 1} ${safeFocusY}`,
            `L ${safeFocusX + 1} ${safeFocusY}`,
            `L ${safeFocusX + 1} ${safeFocusY + focusH}`,
            `L ${safeFocusX - 1} ${safeFocusY + focusH}`,
            "Z",
        ].join(" ");

        let path = "";

        // 2. Calculate Background Selection Position
        if (start === end) {
            path = "";
        } else if (Math.abs(first.y - last.y) < 1) {
            // Clamp horizontal single-line selection to container bounds
            const x1 = clampX(Math.min(first.x, last.x));
            const x2 = clampX(Math.max(first.x, last.x));
            const y = Math.max(Math.min(first.y, last.y), 0);
            const h = Math.max(first.h || lineHeight, last.h || lineHeight, lineHeight);

            path = [`M ${x1} ${y}`, `L ${x2} ${y}`, `L ${x2} ${y + h}`, `L ${x1} ${y + h}`, "Z"].join(" ");
        } else {
            // Multi-line selection
            const firstY = Math.max(first.y, 0);
            const firstH = first.h || lineHeight;
            const lastY = Math.max(last.y, 0);
            const lastH = last.h || lineHeight;

            const rightY = Math.max(firstY + firstH, lastY);
            const leftY = Math.min(lastY, firstY + firstH);

            const safeFirstX = clampX(first.x);
            const safeLastX = clampX(last.x);

            const p: string[] = [];
            p.push(`M ${safeFirstX} ${firstY}`);
            p.push(`L ${maxWidth} ${firstY}`);
            p.push(`L ${maxWidth} ${rightY}`);
            p.push(`L ${safeLastX} ${rightY}`);
            p.push(`L ${safeLastX} ${lastY + lastH}`);
            p.push(`L 0 ${lastY + lastH}`);
            p.push(`L 0 ${leftY}`);
            p.push(`L ${safeFirstX} ${leftY}`);
            p.push("Z");

            path = p.join(" ");
        }
        return { selectionPath: path, caretPath: caret };
    }, [rects, start, end, lineHeight, selection, container]);

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
            {caretPath && <path className="caret-blink" d={caretPath} fill="#f39200" />}
        </SVG>
    );
}
