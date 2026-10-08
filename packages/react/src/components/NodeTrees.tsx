import { useContainer } from "@/contexts";
import { Node } from "@bambu/node";
import { Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import EditableField from "./EditableField";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface NodeTreesProps {}
export default function NodeTrees({}: NodeTreesProps) {
    const rootNode = useContainer().Nodes.body;
    return (
        <Box sx={{ px: 1 }}>
            <TreeItem node={rootNode} defaultExpanded />
        </Box>
    );
}

type TreeItemProps = {
    node: Node;
    defaultExpanded?: boolean;
};
const TreeItem = ({ node, defaultExpanded = false }: TreeItemProps) => {
    const [children, setChildren] = useState(
        Array.from(node.children.values()),
    );

    const [expand, setExpand] = useState(defaultExpanded);
    const [name, setName] = useState(node.name);

    const toggleExpand = () => setExpand((p) => !p);
    const updateNodeName = (newValue: string) => {
        node.set("name", newValue);
    };

    useEffect(() => {
        const unsubscribes = [
            node.on("children", () => {
                setChildren(Array.from(node.children.values()));
            }),
            node.on("change:name", (e) => {
                setName((prev) => e.value ?? prev);
            }),
        ];

        return () => {
            unsubscribes.forEach((unsub) => unsub());
        };
    }, [node]);

    return (
        <Box>
            <Box
                sx={(theme) => ({
                    p: "2px 8px",
                    borderRadius: 1,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    "&:hover": {
                        backgroundColor: "#ccc",
                        ...theme.applyStyles("dark", {
                            backgroundColor: "#2b2b2b",
                        }),
                    },
                })}
            >
                <Box
                    sx={{
                        all: "inherit",
                        justifyContent: "flex-start",
                        gap: 1,
                        padding: 0,
                    }}
                >
                    <node.icon size={14} />
                    <EditableField value={name} onFinish={updateNodeName} />
                </Box>
                {children.length > 0 && (
                    <IconButton size="small" onClick={toggleExpand}>
                        {expand ? (
                            <ChevronDown size={12} />
                        ) : (
                            <ChevronUp size={12} />
                        )}
                    </IconButton>
                )}
            </Box>
            {children.length > 0 && expand && (
                <Box
                    sx={{
                        pl: 1,
                        mb: .5,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {children.map((child) => (
                        <TreeItem node={child} key={child.id} />
                    ))}
                </Box>
            )}
        </Box>
    );
};
