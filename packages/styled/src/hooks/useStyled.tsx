import { useStyledManager } from "@/StyledManager";
import { Node } from "@bambu/node";
import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";

export const useStyled = function <T>(
    getter: (nodes: Node[]) => T | Promise<T>,
    setter: (node: Node, value: T) => void | Promise<void>,
): [T | undefined, (next: T | ((prev: T | undefined) => T)) => Promise<T>, boolean] {
    const { target } = useStyledManager();
    const [pending, setPending] = useState(false);
    const [value, setValue] = useState<T>();

    // Ref references to hold latest functions and state without stale closure traps
    const getterRef = useRef(getter);
    const setterRef = useRef(setter);
    const valueRef = useRef<T | undefined>(value);

    // Request tracker to prevent race conditions when targets change rapidly
    const requestIdRef = useRef(0);

    // Keep refs up to date synchronously on every render
    getterRef.current = getter;
    setterRef.current = setter;
    valueRef.current = value;

    // Re-evaluate value whenever target nodes update
    useEffect(() => {
        const requestId = ++requestIdRef.current;
        setPending(true);

        const updateValue = async () => {
            try {
                const result = await getterRef.current(target);
                // Race condition check: Only set state if this request is still active
                if (requestId === requestIdRef.current) {
                    setValue(result);
                    valueRef.current = result;
                }
            } catch (error) {
                console.error("Error evaluating useStyled getter:", error);
            } finally {
                if (requestId === requestIdRef.current) {
                    setPending(false);
                }
            }
        };

        updateValue();

        return () => {
            // Cancel pending async assignments when target changes or unmounts
            requestIdRef.current++;
        };
    }, [target]);

    const valueSetter = useCallback(
        async (next: T | ((prev: T | undefined) => T)): Promise<T> => {
            setPending(true);

            try {
                // Compute next value using current value ref
                const nextValue =
                    typeof next === "function" ? (next as (prev: T | undefined) => T)(valueRef.current) : next;

                // 1. Optimistically update local React state & ref
                setValue(nextValue);
                valueRef.current = nextValue;

                // 2. Run all node setters in parallel (supports both sync and async setters)
                await Promise.all(target.map((t) => Promise.resolve(setterRef.current(t, nextValue))));

                return nextValue;
            } finally {
                setPending(false);
            }
        },
        [target],
    );

    return [value, valueSetter, pending];
};

export const useProperty = function <T = string>(property: keyof CSSProperties, defaultValue = "" as T) {
    const styled = useStyled<T>(
        (nodes) => {
            const nodeArray = Array.from(nodes);
            if (nodeArray.length === 0) return defaultValue;

            const firstValue = (nodeArray[0].data.style?.[property] as T) || defaultValue;

            const allMatch = nodeArray.every(
                (node) => ((node.data.style?.[property] as T) || defaultValue) === firstValue,
            );
            return allMatch ? firstValue : defaultValue;
        },
        (node, value) => {
            node.set("data.style", (prev = {}) => {
                if (!value) {
                    const { [property]: removedProp, ...rest } = prev;
                    return rest;
                }
                return {
                    ...prev,
                    [property]: value,
                };
            });
        },
    );

    return styled;
};
