import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStyleController } from "./StyledProvider";
import { useGestureController } from "@bambu/react";
import ColorProperty from "./components/properties/ColorProperty";
import { Node } from "@bambu/node";
import { Box } from "@mui/material";
import FontSizeProperty from "./components/properties/FontSizeProperty";
import DisplayProperty from "./components/properties/DisplayProperty";
import FontWightProperty from "./components/properties/FontWightProperty";
import PaddingProperty from "./components/properties/PaddingProperty";
import MarginProperty from "./components/properties/MarginProperty";
import BackgroundProperty from "./components/properties/BackgroundProperty";

type StyledManagerContext = {
    target: Node[];
};
const Context = createContext<StyledManagerContext | undefined>(undefined);
export const useStyledManager = () => useContext(Context);

type StyleManagerProps = {};

export default function StyledManager({}: StyleManagerProps) {
    const gesture = useGestureController();
    const styled = useStyleController();
    const [nodes, setNodes] = useState([]);
    const selectionIdsRef = useRef(nodes.map((e) => e.id).sort());

    const getComputedStyle = (node: Node) => {
        const element = node.element as HTMLElement;
        const win = node.owner.body.element?.ownerDocument?.defaultView;
        if (element && win) {
            const computed = win.getComputedStyle(element);
            node.state.computed = computed;
        }
    };

    useEffect(() => {
        return gesture.on("selecting", (e) => {
            // @ts-ignore
            const value = e.value as Node[];
            const ids = value.map((e) => e.id).sort();
            if (ids === selectionIdsRef.current) return;
            value.forEach((n) => getComputedStyle(n));
            setNodes(value);
        });
    }, [gesture]);

    return (
        <Context.Provider value={{ target: nodes }}>
            <h1>StyleManager</h1>
            <Box sx={{ px: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <DisplayProperty />
                <FontSizeProperty />
                <FontWightProperty />
                <ColorProperty />
                <PaddingProperty />
                <MarginProperty />
                <BackgroundProperty />
            </Box>
        </Context.Provider>
    );
}
