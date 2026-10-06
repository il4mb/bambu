import { useContainer } from "@/contexts";
import { Node } from "@bambu/node";
import { useEffect, useMemo, useState } from "react";

export interface Props {}

export default function SelectingSpot({}: Props) {
    const { Gesture } = useContainer();
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
        return Gesture.on("selecting", (e) => {
            console.log(e);
            setNodes(e.value);
        });
    }, []);

    return (
        <svg
            style={{
                position: "fixed",
                inset: 0,
                width: "0px",
                height: "0px",
                pointerEvents: "none",
                overflow: "visible",
            }}
        >
            <path d={path} fill="none" stroke="blue" strokeWidth={1} />
        </svg>
    );
}
