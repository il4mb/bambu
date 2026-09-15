import { Caret } from "@/libs/caret";
import { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from "react";

const EMPTY_SELECTION: Caret.Range = { anchor: 0, focus: 0 };
const Context = createContext<SelectionProviderContext | undefined>(undefined);

type SelectionProviderContext = {
    selection: Caret.Range | null;
    setSelection: Dispatch<SetStateAction<Caret.Range | null>>;
};
type SelectionProviderProps = {
    children?: ReactNode;
    container: HTMLElement;
};
export const SelectionProvider = ({ children, container }: SelectionProviderProps) => {
    const [selection, setSelection] = useState<Caret.Range>();

    useEffect(() => {
        console.debug("SelectionProvider: selection changed", selection);
    }, [selection]);

    useEffect(() => {
        if (!container) return;
        let isPressed = false;
        const onClickOutside = (e: PointerEvent) => {
            if (!container.contains(e.target as HTMLElement)) setSelection(null);
        };
        const onPointerDown = (e: PointerEvent) => {
            if (e.defaultPrevented) return;
            const offset = Caret.getOffsetFromPoint(container, e.clientX, e.clientY);
            setSelection({ anchor: offset, focus: offset });
            isPressed = true;
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!isPressed) return;
            const offset = Caret.getOffsetFromPoint(container, e.clientX, e.clientY);
            setSelection((prev) => ({ ...(prev ?? EMPTY_SELECTION), focus: offset }));
        };
        const onPointerUp = () => (isPressed = false);

        container.addEventListener("pointerdown", onPointerDown, true);
        container.addEventListener("pointermove", onPointerMove, true);
        container.addEventListener("pointerup", onPointerUp, true);
        container.addEventListener("pointercancel", onPointerUp, true);
        document.addEventListener("pointerdown", onClickOutside);

        return () => {
            container.removeEventListener("pointerdown", onPointerDown, true);
            container.removeEventListener("pointermove", onPointerMove, true);
            container.removeEventListener("pointerup", onPointerUp, true);
            container.removeEventListener("pointercancel", onPointerUp, true);
            document.removeEventListener("pointerdown", onClickOutside);
        };
    }, [container]);

    return <Context.Provider value={{ selection, setSelection }}>{children}</Context.Provider>;
};

export const useSelectionProvider = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useSelectionProvider must call within SelectionProvider");
    return ctx;
};

export const useSelection = () => useSelectionProvider()?.selection;
