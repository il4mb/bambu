import { Node } from "@bambu/node";
import { useEffect, useMemo, useState } from "react";
import { useGestureController } from "../contexts/GestureProvider";

export interface Props {}

export default function HoveringSpot({}: Props) {
    const gesture = useGestureController();
    const [nodes, setNodes] = useState<Node[]>([]);
    const rects = useMemo<DOMRectList[]>(() => {
        const elements = nodes
            .map((node) => node.element)
            .filter((element): element is HTMLElement => Boolean(element));

        return elements.reduce<DOMRectList[]>((prev, element) => {
            prev.push(element.getClientRects());
            return prev;
        }, []);
    }, [nodes]);

    const path = useMemo(() => {
        let d = "";

        for (const rectList of rects) {
            for (let i = 0; i < rectList.length; i++) {
                const rect = rectList[i];

                const x = rect.left;
                const y = rect.top;
                const width = rect.width;
                const height = rect.height;

                d += [
                    `M ${x} ${y}`,
                    `L ${x + width} ${y}`,
                    `L ${x + width} ${y + height}`,
                    `L ${x} ${y + height}`,
                    "Z",
                ].join(" ");
            }
        }

        return d;
    }, [rects]);

    useEffect(() => {
        return gesture.on("hovering", (e) => {
            if (Array.isArray(e.value) && e.value.every((e) => e instanceof Node)) {
                setNodes(e.value);
            }
        });
    }, [gesture]);

    return (
        <svg
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none",
                overflow: "visible",
            }}
        >
            <path d={path} fill="none" stroke="red" strokeWidth={1} />
        </svg>
    );
}
