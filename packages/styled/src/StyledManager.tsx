import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useGestureController } from "@bambu/react";
import ColorProperty from "./components/properties/ColorProperty";
import { Node } from "@bambu/node";
import { Box } from "@mui/material";
import DisplayProperty from "./components/properties/DisplayProperty";
import PaddingProperty from "./components/properties/PaddingProperty";
import MarginProperty from "./components/properties/MarginProperty";
import BackgroundProperty from "./components/properties/BackgroundProperty";
import WidthProperty from "./components/properties/WidthProperty";
import HeightProperty from "./components/properties/HeightProperty";
import FontProperty from "./components/properties/FontProperty";
import TextAlignProperty from "./components/properties/TextAlignProperty";
import BorderProperty from "./components/properties/BorderProperty";

type StyledManagerContext = {
    target: Node[];
};
const Context = createContext<StyledManagerContext | undefined>(undefined);
export const useStyledManager = () => useContext(Context);

type StyleManagerProps = {};

export default function StyledManager({}: StyleManagerProps) {
    const gesture = useGestureController();
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
            <Box sx={{ px: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <DisplayProperty />
                <FontProperty />
                <BorderProperty />
                <TextAlignProperty />
                <ColorProperty />
                <PaddingProperty />
                <MarginProperty />
                <WidthProperty />
                <HeightProperty />
                <BackgroundProperty />
            </Box>
        </Context.Provider>
    );
}
