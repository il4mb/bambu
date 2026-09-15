export namespace Caret {

    export type Position = {
        offsetNode: Node | null;
        offset: number;
    };

    export type Range = {
        anchor: number;
        focus: number;
    };

    export type Rect = {
        x: number;
        y: number;
        h: number;
    };

    /**
     * Gets all span elements with data-start and data-end attributes
     */
    export const getTokenSpans = (container: HTMLElement): HTMLSpanElement[] => {
        return Array.from(container.querySelectorAll('span[data-start][data-end]'));
    };

    /**
     * Finds the nearest ancestor span with data-start/data-end attributes
     */
    const findNearestTokenSpan = (node: Node, container: HTMLElement): HTMLSpanElement | null => {
        let current: Node | null = node;

        while (current && current !== container) {
            if (current.nodeType === Node.ELEMENT_NODE) {
                const element = current as HTMLElement;
                if (element.hasAttribute('data-start') && element.hasAttribute('data-end')) {
                    return element as HTMLSpanElement;
                }
            }
            current = current.parentNode;
        }

        return null;
    };

    /**
     * Calculates the offset of a text node within its parent span with data attributes
     */
    const calculateOffsetInSpan = (textNode: Text, offset: number, span: HTMLSpanElement): number => {
        const textNodes: Text[] = [];
        const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
        let node: Node | null;

        while ((node = walker.nextNode())) {
            textNodes.push(node as Text);
        }

        let currentOffset = 0;
        for (const tn of textNodes) {
            if (tn === textNode) {
                return currentOffset + offset;
            }
            currentOffset += tn.textContent?.length || 0;
        }

        // Fallback: if text node not found, return offset relative to span start
        return offset;
    };

    /**
     * Calculates the absolute character offset from a caret position
     * Smart version that handles elements without data-start/data-end by walking up the tree
     */
    export const offsetFromNode = (position: Position, container: HTMLElement): number => {
        if (!container || !position.offsetNode) return 0;

        // If the offset node is a text node, try to find its parent span with data attributes
        let span: HTMLSpanElement | null = null;
        let targetNode: Node = position.offsetNode;
        let localOffset = position.offset;

        // If it's a text node, try to find the nearest span with data attributes
        if (targetNode.nodeType === Node.TEXT_NODE) {
            span = findNearestTokenSpan(targetNode, container);

            if (span) {
                // Calculate the offset within the span
                const offsetInSpan = calculateOffsetInSpan(
                    targetNode as Text,
                    localOffset,
                    span
                );
                const start = parseInt(span.dataset.start || '0', 10);
                return start + Math.min(offsetInSpan, span.textContent?.length || 0);
            }
        }

        // If it's an element node, check if it has data attributes directly
        if (targetNode.nodeType === Node.ELEMENT_NODE) {
            const element = targetNode as HTMLElement;
            if (element.hasAttribute('data-start') && element.hasAttribute('data-end')) {
                span = element as HTMLSpanElement;

                // If it's a span with data attributes, but we're placing caret at element level
                // Use the text content to calculate
                const text = span.textContent || '';
                const start = parseInt(span.dataset.start || '0', 10);

                // If offset is at element level, we need to find the correct text node
                if (localOffset === 0 || localOffset === text.length) {
                    return start + localOffset;
                }

                // Otherwise, try to find the text node
                const textNodes: Text[] = [];
                const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
                let node: Node | null;
                while ((node = walker.nextNode())) {
                    textNodes.push(node as Text);
                }

                let currentOffset = 0;
                for (const tn of textNodes) {
                    const len = tn.textContent?.length || 0;
                    if (localOffset <= currentOffset + len) {
                        return start + currentOffset + Math.min(localOffset - currentOffset, len);
                    }
                    currentOffset += len;
                }

                return start + Math.min(localOffset, text.length);
            }
        }

        // If we still don't have a span, try to find one by walking up from any node
        if (!span) {
            span = findNearestTokenSpan(targetNode, container);
            if (span) {
                // Calculate offset by creating a range and measuring
                try {
                    const range = document.createRange();
                    range.selectNodeContents(span);
                    range.setEnd(targetNode, localOffset);
                    const offsetInSpan = range.toString().length;
                    const start = parseInt(span.dataset.start || '0', 10);
                    return start + Math.min(offsetInSpan, span.textContent?.length || 0);
                } catch (e) {
                    // Fallback to text content
                    const text = span.textContent || '';
                    const start = parseInt(span.dataset.start || '0', 10);
                    return start + Math.min(localOffset, text.length);
                }
            }
        }

        // Ultimate fallback: find any span with data attributes and calculate based on position
        const allSpans = getTokenSpans(container);
        if (allSpans.length > 0) {
            let accumulatedOffset = 0;

            for (const s of allSpans) {
                const text = s.textContent || '';
                const start = parseInt(s.dataset.start || '0', 10);
                const end = parseInt(s.dataset.end || '0', 10);

                // Check if the node is inside this span
                if (s.contains(targetNode)) {
                    try {
                        const range = document.createRange();
                        range.selectNodeContents(s);
                        range.setEnd(targetNode, localOffset);
                        const offsetInSpan = range.toString().length;
                        return start + Math.min(offsetInSpan, text.length);
                    } catch (e) {
                        return start + Math.min(localOffset, text.length);
                    }
                }

                accumulatedOffset += text.length;
            }

            // If we get here, return the last span's end
            const lastSpan = allSpans[allSpans.length - 1];
            const lastSpanEnd = parseInt(lastSpan.dataset.end || '0', 10);
            console.debug("Fallback: returning last span end", lastSpan, lastSpanEnd);

            return lastSpanEnd;
        }

        return 0;
    };

    /**
     * Gets the offset from a mouse point
     */
    export const getOffsetFromPoint = (element: HTMLElement, mouseX: number, mouseY: number): number => {
        const position = document.caretPositionFromPoint(mouseX, mouseY);
        if (!position) return 0;
        return Caret.offsetFromNode(position, element);
    };

    /**
     * Calculates vertical offset for arrow up/down
     */
    export function getVerticalOffset(text: string, currentOffset: number, direction: -1 | 1): number {
        const lineStart = text.lastIndexOf('\n', currentOffset - 1) + 1;
        const col = currentOffset - lineStart;

        if (direction === -1) {
            if (lineStart === 0) return 0;
            const prevLineStart = text.lastIndexOf('\n', lineStart - 2) + 1;
            const prevLineEnd = lineStart - 1;
            return Math.min(prevLineStart + col, prevLineEnd);
        } else {
            const nextLineStart = text.indexOf('\n', currentOffset);
            if (nextLineStart === -1) return text.length;
            let nextLineEnd = text.indexOf('\n', nextLineStart + 1);
            if (nextLineEnd === -1) nextLineEnd = text.length;
            return Math.min(nextLineStart + 1 + col, nextLineEnd);
        }
    }

    /**
     * Gets the full text content from container with token spans
     */
    export const getFullText = (container: HTMLElement): string => {
        const spans = getTokenSpans(container);
        return spans.map(span => span.textContent || '').join('');
    };

    /**
     * Resolves an absolute index to a specific span and local offset
     * Smart version that handles boundary cases
     */
    export const resolveIndex = (container: HTMLElement, absoluteIndex: number): { span: HTMLSpanElement; offset: number } | null => {
        const spans = getTokenSpans(container);

        if (spans.length === 0) {
            // If no spans with data attributes, try to find any text content
            const text = container.textContent || '';
            const textNodes: Text[] = [];
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
            let node: Node | null;
            while ((node = walker.nextNode())) {
                textNodes.push(node as Text);
            }

            if (textNodes.length > 0) {
                // Wrap the first text node in a virtual span
                const virtualSpan = document.createElement('span');
                virtualSpan.dataset.start = '0';
                virtualSpan.dataset.end = text.length.toString();
                virtualSpan.textContent = text;
                return {
                    span: virtualSpan,
                    offset: Math.min(absoluteIndex, text.length)
                };
            }
            return null;
        }

        // Find the span containing the absolute index
        for (let i = 0; i < spans.length; i++) {
            const span = spans[i];
            const start = parseInt(span.dataset.start || '0', 10);
            const end = parseInt(span.dataset.end || '0', 10);
            const text = span.textContent || '';

            // If absolute index is within this span's range
            if (absoluteIndex >= start && absoluteIndex <= end) {
                const localOffset = Math.min(absoluteIndex - start, text.length);
                return { span, offset: localOffset };
            }

            // Handle case where absolute index is between spans (at boundaries)
            if (i < spans.length - 1) {
                const nextStart = parseInt(spans[i + 1].dataset.start || '0', 10);
                if (absoluteIndex > end && absoluteIndex < nextStart) {
                    // Index is in whitespace between spans
                    return {
                        span,
                        offset: text.length
                    };
                }
            }
        }

        // If not found, return the last span
        const lastSpan = spans[spans.length - 1];
        if (lastSpan) {
            const end = parseInt(lastSpan.dataset.end || '0', 10);
            if (absoluteIndex >= end) {
                return {
                    span: lastSpan,
                    offset: lastSpan.textContent?.length || 0
                };
            }
        }

        return null;
    };

    /**
     * Sets the selection/caret using data-start/data-end spans
     * Smart version that handles complex DOM structures
     */
    export const setSelection = (container: HTMLElement, start: number, end: number = start): void => {
        const startPos = resolveIndex(container, start);
        const endPos = resolveIndex(container, end);

        if (!startPos || !endPos) return;

        const selection = window.getSelection();
        const range = document.createRange();

        // Get text nodes within the spans
        const startTextNode = getTextNodeAtOffset(startPos.span, startPos.offset);
        const endTextNode = getTextNodeAtOffset(endPos.span, endPos.offset);

        if (!startTextNode || !endTextNode) {
            // Fallback: try to set selection at the span level
            try {
                const startRange = document.createRange();
                startRange.selectNodeContents(startPos.span);
                startRange.collapse(true);

                const endRange = document.createRange();
                endRange.selectNodeContents(endPos.span);
                endRange.collapse(true);

                range.setStart(startRange.startContainer, startRange.startOffset);
                range.setEnd(endRange.startContainer, endRange.startOffset);
            } catch (e) {
                return;
            }
        } else {
            range.setStart(startTextNode.node, startTextNode.offset);
            range.setEnd(endTextNode.node, endTextNode.offset);
        }

        selection?.removeAllRanges();
        selection?.addRange(range);
    };

    /**
     * Helper to get text node and offset within a span
     * Smart version that handles text nodes within complex structures
     */
    const getTextNodeAtOffset = (span: HTMLSpanElement, offset: number): { node: Text; offset: number } | null => {
        const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
        let currentOffset = 0;
        let node: Node | null;

        while ((node = walker.nextNode())) {
            const textNode = node as Text;
            const length = textNode.textContent?.length ?? 0;

            if (currentOffset + length >= offset) {
                return {
                    node: textNode,
                    offset: Math.min(offset - currentOffset, length)
                };
            }
            currentOffset += length;
        }

        // If offset is at the end, return the last text node
        if (currentOffset === offset) {
            const lastNode = walker.currentNode;
            if (lastNode && lastNode.nodeType === Node.TEXT_NODE) {
                const textNode = lastNode as Text;
                console.debug("Returning last text node at end of span", textNode, textNode.textContent?.length);
                return {
                    node: textNode,
                    offset: textNode.textContent?.length || 0
                };
            }
        }

        // Ultimate fallback: use the span's text content
        const textContent = span.textContent || '';
        const textNodes: Text[] = [];
        const walker2 = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
        let n: Node | null;
        while ((n = walker2.nextNode())) {
            textNodes.push(n as Text);
        }

        if (textNodes.length > 0) {
            let accumulated = 0;
            for (const tn of textNodes) {
                const len = tn.textContent?.length || 0;
                if (accumulated + len >= offset || accumulated + len === textContent.length) {
                    return {
                        node: tn,
                        offset: Math.min(offset - accumulated, len)
                    };
                }
                accumulated += len;
            }

            // Return the last node
            const last = textNodes[textNodes.length - 1];
            console.debug(last, last.textContent?.length);
            return {
                node: last,
                offset: last.textContent?.length || 0
            };
        }

        return null;
    };

    /**
     * Gets the bounding rectangle of a caret at a specific absolute position
     */
    export const getCaretRectAtOffset = (container: HTMLElement, offset: number): Rect | null => {
        const resolved = resolveIndex(container, offset);
        if (!resolved) return null;

        const containerRect = container.getBoundingClientRect();
        const textNodeInfo = getTextNodeAtOffset(resolved.span, resolved.offset);
        if (!textNodeInfo) return null;

        return getCaretRect(textNodeInfo.node, textNodeInfo.offset, containerRect);
    };

    /**
     * Gets the bounding rectangle of a specific caret location
     */
    export const getCaretRect = (textNode: Text, offset: number, containerRect: DOMRect): Rect | null => {
        const length = textNode.textContent?.length ?? 0;
        const safeOffset = Math.max(0, Math.min(offset, length));
        const range = document.createRange();

        try {
            range.setStart(textNode, safeOffset);
            range.collapse(true);

            let rect = range.getBoundingClientRect();

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
        } catch (e) {
            // Range creation failed
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
     * Gets multiple bounding rectangles for a range selection
     * Smart version that handles complex selections
     */
    export const getCaretRects = ({ anchor, focus }: Range, container: HTMLElement): Rect[] => {
        if (!container) return [];

        const containerRect = container.getBoundingClientRect();
        const spans = getTokenSpans(container);

        if (!spans.length) {
            // If no spans with data attributes, try to get text nodes directly
            const textNodes: Text[] = [];
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
            let node: Node | null;
            while ((node = walker.nextNode())) {
                textNodes.push(node as Text);
            }

            if (textNodes.length > 0) {
                const rects: Rect[] = [];
                let currentOffset = 0;
                const start = Math.min(anchor, focus);
                const end = Math.max(anchor, focus);

                for (const textNode of textNodes) {
                    const length = textNode.textContent?.length || 0;
                    const nodeStart = currentOffset;
                    const nodeEnd = nodeStart + length;

                    if (start >= nodeStart && start <= nodeEnd) {
                        const localStart = start - nodeStart;
                        const rect = getCaretRect(textNode, localStart, containerRect);
                        if (rect) rects.push(rect);
                    }

                    if (end >= nodeStart && end <= nodeEnd) {
                        const localEnd = end - nodeStart;
                        const rect = getCaretRect(textNode, localEnd, containerRect);
                        if (rect) rects.push(rect);
                        break;
                    }

                    currentOffset += length;
                }

                return rects;
            }
            return [];
        }

        const start = Math.min(anchor, focus);
        const end = Math.max(anchor, focus);
        const rects: Rect[] = [];

        for (const span of spans) {
            const spanStart = parseInt(span.dataset.start || '0', 10);
            const spanEnd = parseInt(span.dataset.end || '0', 10);

            // Skip if span is completely outside the range
            if (end < spanStart || start > spanEnd) continue;

            // Get text nodes within this span
            const textNodes: Text[] = [];
            const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
            let node: Node | null;
            while ((node = walker.nextNode())) {
                textNodes.push(node as Text);
            }

            // FIX: Handle spans with no text nodes (e.g., empty spans used for newlines)
            if (!textNodes.length) {
                if (start >= spanStart && start <= spanEnd) {
                    // Try getting a range inside the empty span
                    const range = document.createRange();
                    range.selectNodeContents(span);
                    range.collapse(true);
                    let rect = range.getBoundingClientRect();

                    // Fallback to the span's element boundaries if the range has 0 dimensions
                    if (!rect.width && !rect.height) {
                        rect = span.getBoundingClientRect();
                    }

                    if (rect.width || rect.height) {
                        rects.push({
                            x: Math.round(rect.left - containerRect.left),
                            y: Math.round(rect.top - containerRect.top),
                            h: Math.round(rect.height),
                        });
                    }
                }
                continue;
            }

            let currentOffset = 0;
            for (const textNode of textNodes) {
                const length = textNode.textContent?.length ?? 0;
                const nodeStart = spanStart + currentOffset;
                const nodeEnd = nodeStart + length;

                if (end < nodeStart) break;
                if (start > nodeEnd) {
                    currentOffset += length;
                    continue;
                }

                const localStart = Math.max(0, start - nodeStart);
                const localEnd = Math.min(length, end - nodeStart);

                // Handle collapsed selection
                if (start === end) {
                    const rect = getCaretRect(textNode, localStart, containerRect);
                    if (rect) rects.push(rect);
                    break;
                }

                // Handle start of range
                if (start >= nodeStart && start <= nodeEnd) {
                    const rect = getCaretRect(textNode, localStart, containerRect);
                    if (rect) rects.push(rect);
                }

                // Handle end of range
                if (end >= nodeStart && end <= nodeEnd) {
                    const rect = getCaretRect(textNode, localEnd, containerRect);
                    if (rect) rects.push(rect);
                    break;
                }

                currentOffset += length;
            }
        }

        return rects;
    };
}