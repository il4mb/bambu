export type CaretPosition = {
    offsetNode: Node | null;
    offset: number;
};

export type SelectionRange = {
    anchor: number;
    focus: number;
};

export type CaretRect = {
    x: number;
    y: number;
    h: number;
};

export namespace Caret {
    /**
     * Calculates the absolute character offset of a caret position relative to a root container.
     */
    export const offsetFromNode = (position: CaretPosition, container: Node): number => {
        if (!container || !position.offsetNode) return 0;

        try {
            const range = document.createRange();
            range.selectNodeContents(container);
            range.setEnd(position.offsetNode, position.offset);

            // The length of the stringified range is the exact absolute character offset.
            return range.toString().length;
        } catch (error) {
            // Fallback for invalid ranges (e.g., node is not within container)
            return 0;
        }
    };

    /**
     * Retrieves all Text nodes within a given root node.
     */
    export const getTextNodes = (root: Node): Text[] => {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            null,
        );

        const textNodes: Text[] = [];
        let node: Node | null;

        while ((node = walker.nextNode())) {
            textNodes.push(node as Text);
        }

        return textNodes;
    };

    /**
     * Finds the specific Text node and local offset for a given absolute index.
     * (NEW METHOD)
     */
    export const resolveIndex = (container: Node, absoluteIndex: number): { node: Text; offset: number } | null => {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        let currentIndex = 0;
        let node: Node | null;

        while ((node = walker.nextNode())) {
            const textNode = node as Text;
            const length = textNode.textContent?.length ?? 0;

            if (currentIndex + length >= absoluteIndex) {
                return {
                    node: textNode,
                    offset: absoluteIndex - currentIndex,
                };
            }
            currentIndex += length;
        }

        return null;
    };

    /**
     * Programmatically sets the browser's selection/caret to the given absolute bounds.
     * (NEW METHOD)
     */
    export const setSelection = (container: HTMLElement, start: number, end: number = start): void => {
        const startPos = resolveIndex(container, start);
        const endPos = resolveIndex(container, end);

        if (!startPos || !endPos) return;

        const selection = window.getSelection();
        const range = document.createRange();

        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);

        selection?.removeAllRanges();
        selection?.addRange(range);
    };

    /**
     * Gets the bounding rectangle of a specific caret location.
     */
    export const getCaretRect = (textNode: Text, offset: number, containerRect: DOMRect,): CaretRect | null => {
        const length = textNode.textContent?.length ?? 0;
        const safeOffset = Math.max(0, Math.min(offset, length));
        const range = document.createRange();

        range.setStart(textNode, safeOffset);
        range.collapse(true);

        let rect = range.getBoundingClientRect();

        // If standard collapse yields a valid rect
        if (rect.width || rect.height) {
            return {
                x: Math.round(rect.left - containerRect.left),
                y: Math.round(rect.top - containerRect.top),
                h: Math.round(rect.height),
            };
        }

        // Fallback: Look backward
        if (safeOffset > 0) {
            range.setStart(textNode, safeOffset - 1);
            range.setEnd(textNode, safeOffset);
            rect = range.getBoundingClientRect();

            if (rect.width || rect.height) {
                return {
                    x: Math.round(rect.right - containerRect.left),
                    y: Math.round(rect.top - containerRect.top),
                    h: Math.round(rect.height),
                };
            }
        }

        // Fallback: Look forward
        if (safeOffset < length) {
            range.setStart(textNode, safeOffset);
            range.setEnd(textNode, safeOffset + 1);
            rect = range.getBoundingClientRect();

            if (rect.width || rect.height) {
                return {
                    x: Math.round(rect.left - containerRect.left),
                    y: Math.round(rect.top - containerRect.top),
                    h: Math.round(rect.height),
                };
            }
        }

        // Ultimate fallback: Use parent element bounds
        const parent = textNode.parentElement;
        if (!parent) return null;

        const parentRect = parent.getBoundingClientRect();
        return {
            x: Math.round(parentRect.left - containerRect.left),
            y: Math.round(parentRect.top - containerRect.top),
            h: Math.round(parentRect.height),
        };
    };

    /**
     * Gets multiple bounding rectangles for a start/end selection inside a container.
     */
    export const getCaretRects = ({ anchor, focus }: SelectionRange, container: HTMLElement): CaretRect[] => {
        if (!container) return [];

        const containerRect = container.getBoundingClientRect();
        const textNodes = getTextNodes(container);

        if (!textNodes.length) return [];

        const start = Math.min(anchor, focus);
        const end = Math.max(anchor, focus);
        const rects: CaretRect[] = [];
        let currentOffset = 0;

        for (const textNode of textNodes) {
            const length = textNode.textContent?.length ?? 0;
            const nodeStart = currentOffset;
            const nodeEnd = nodeStart + length;

            if (end < nodeStart) break;

            if (start > nodeEnd) {
                currentOffset = nodeEnd;
                continue;
            }

            const localStart = Math.max(0, start - nodeStart);
            const localEnd = Math.min(length, end - nodeStart);

            // Handle Point / Collapsed Selection
            if (start === end) {
                const rect = getCaretRect(textNode, localStart, containerRect);
                if (rect) rects.push(rect);
                break;
            }

            // Handle start of Range
            if (start >= nodeStart && start <= nodeEnd) {
                const rect = getCaretRect(textNode, localStart, containerRect);
                if (rect) rects.push(rect);
            }

            // Handle end of Range
            if (end >= nodeStart && end <= nodeEnd) {
                const rect = getCaretRect(textNode, localEnd, containerRect);
                if (rect) rects.push(rect);
                break;
            }

            currentOffset = nodeEnd;
        }

        return rects;
    };
}