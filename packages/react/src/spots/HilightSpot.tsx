import { useGestureController } from "@/contexts";
import { DragingData } from "@/controllers";
import { Node } from "@bambu/node";
import { useEffect, useMemo, useState } from "react";

// 1. Moved outside the component to prevent recreation on every render.
// This also fixes the Hoisting ReferenceError (getPath was called before initialization).
const getPath = (elements: HTMLElement[]) => {
    let d = "";
    for (const element of elements) {
        const rects = element.getClientRects();
        for (let i = 0; i < rects.length; i++) {
            const { left: x, top: y, width, height } = rects[i];
            // Optimized path string construction
            d += `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z `;
        }
    }
    return d.trim();
};

type HilightSpotProps = {};

export default function HilightSpot({}: HilightSpotProps) {
    const gesture = useGestureController();

    const [hovering, setHovering] = useState<Node[]>([]);
    const [selecting, setSelecting] = useState<Node[]>([]);
    const [dragging, setDragging] = useState<DragingData | null>(null);
    const [ticker, setTicker] = useState(0);

    const draggingTargetRect = useMemo(() => {
        if (!dragging || !dragging.target) return null;

        const element = dragging.target.element as HTMLElement;
        if (!element) return null;

        const rect = element.getBoundingClientRect();

        const isBefore = dragging.position === "before";
        const isAfter = dragging.position === "after";
        const isInside = !isBefore && !isAfter;

        // The thickness of the drop indicator line
        const thickness = 4;
        // Offset so the line is perfectly centered over the calculation
        const offset = thickness / 2;

        // INSIDE: Highlight the whole element block
        if (isInside) {
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
            };
        }

        // Get the relevant sibling based on drop position
        const sibling = isBefore ? element.previousElementSibling : element.nextElementSibling;
        const sibRect = sibling ? sibling.getBoundingClientRect() : null;

        if (dragging.layout === "horizontal") {
            // Base X coordinate (falls back to element edge if no sibling)
            let lineX = isBefore ? rect.left : rect.right;

            if (sibRect) {
                // Ensure they are on the same visual row (prevents flex-wrap calculation bugs)
                const isSameRow = Math.abs(sibRect.top - rect.top) < rect.height / 2;

                if (isSameRow) {
                    if (isBefore) {
                        // Center between previous sibling's right edge and target's left edge
                        lineX = (sibRect.right + rect.left) / 2;
                    } else {
                        // Center between target's right edge and next sibling's left edge
                        lineX = (rect.right + sibRect.left) / 2;
                    }
                }
            }

            return {
                x: lineX - offset,
                y: rect.top,
                width: thickness,
                height: rect.height,
            };
        } else {
            // vertical
            // Base Y coordinate (falls back to element edge if no sibling)
            let lineY = isBefore ? rect.top : rect.bottom;

            if (sibRect) {
                // Ensure they are in the same visual column
                const isSameColumn = Math.abs(sibRect.left - rect.left) < rect.width / 2;

                if (isSameColumn) {
                    if (isBefore) {
                        // Center between previous sibling's bottom edge and target's top edge
                        lineY = (sibRect.bottom + rect.top) / 2;
                    } else {
                        // Center between target's bottom edge and next sibling's top edge
                        lineY = (rect.bottom + sibRect.top) / 2;
                    }
                }
            }

            return {
                x: rect.left,
                y: lineY - offset,
                width: rect.width,
                height: thickness,
            };
        }
    }, [dragging]);

    // 2. Hook up the gesture controller to populate the state arrays
    useEffect(() => {
        if (!gesture) return;

        let draggingTargetElement: HTMLElement;
        // Assuming your gesture controller uses standard EventEmitter patterns
        const offHover = gesture.on("hovering", (e) => setHovering(e.value));
        const offSelect = gesture.on("selecting", (e) => setSelecting(e.value));
        const onDraggingData = gesture.on("draggingData", (e) => {
            setDragging(e.value);
        });

        const onDragging = gesture.on("dragging", (e) => {
            if (!e.value) setDragging(null);
        });

        return () => {
            if (offHover) offHover();
            if (offSelect) offSelect();
            if (onDraggingData) onDraggingData();
            if (onDragging) onDragging();
        };
    }, [gesture]);

    // 3. Keep highlights attached to elements when scrolling or resizing the window
    // 3. Keep highlights attached to elements when scrolling or resizing
    useEffect(() => {
        if (hovering.length === 0 && selecting.length === 0) return;

        let frameId: number;

        // Throttled update to prevent React state thrashing during rapid scrolling
        const updateRects = () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                setTicker((t) => t + 1);
            });
        };

        // 1. Observe the ACTUAL highlighted elements, not just the body
        const resizeObserver = new ResizeObserver(() => updateRects());

        const allNodes = [...hovering, ...selecting];
        allNodes.forEach((node) => {
            if (node.element) resizeObserver.observe(node.element);
        });

        // 2. The 'resize' event lives on the Window, not the Document
        const win = gesture.document.defaultView || window;
        win.addEventListener("resize", updateRects, { passive: true });

        // Scroll can stay on the document with capture: true
        gesture.document.addEventListener("scroll", updateRects, { capture: true, passive: true });

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(frameId);
            win.removeEventListener("resize", updateRects);
            gesture.document.removeEventListener("scroll", updateRects, { capture: true });
        };
        // Note: We depend on the actual arrays now, not just .length,
        // so the observer re-binds if the specific selected elements change!
    }, [hovering, selecting, gesture]);

    // 4. Derived state: Removed the `rects` useState.
    // Calculating DOM rects directly in useMemo prevents double-rendering.
    const paths = useMemo(() => {
        const extractElements = (nodes: Node[]) =>
            nodes.map((n) => n.element).filter((el): el is HTMLElement => Boolean(el));

        return {
            hovering: getPath(extractElements(hovering)),
            selecting: getPath(extractElements(selecting)),
        };
    }, [hovering, selecting, ticker]); // Re-calculates if nodes change OR window scrolls (ticker)

    return (
        <svg
            style={{
                position: "fixed",
                inset: 0,
                width: "0px",
                height: "0px",
                pointerEvents: "none",
                overflow: "visible",
                zIndex: 9999, // Ensure outlines render above the canvas
            }}
        >
            {/* Visual distinction: Select = Blue Solid, Hover = Red Dashed */}
            {paths.selecting && <path d={paths.selecting} fill="none" stroke="#0066ff" strokeWidth={2} />}
            {paths.hovering && (
                <path d={paths.hovering} fill="none" stroke="red" strokeWidth={1} strokeDasharray="4 2" />
            )}
            {draggingTargetRect && (
                <rect
                    x={draggingTargetRect.x}
                    y={draggingTargetRect.y}
                    width={draggingTargetRect.width}
                    height={draggingTargetRect.height}
                    rx={2}
                    ry={2}
                    fill="#ff09ea7e"
                    stroke="#7c0772"
                />
            )}
        </svg>
    );
}
