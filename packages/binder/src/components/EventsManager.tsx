import { useSelectedNodes } from "@bambu/react";
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
export interface EventsManagerProps {}

export default function EventsManager({}: EventsManagerProps) {
    const selectedNodes = useSelectedNodes();
    const events = useMemo(() => {
        if (selectedNodes.length != 1) return [];
        const node = selectedNodes[0];
        return Object.entries(node.data.events || {}).map(([key, value]) => ({ key, value }));
    }, [selectedNodes]);

    return (
        <Box>
            <Typography variant="h6" sx={{ fontSize: 10, fontWeight: 600 }}>
                Events Manager
            </Typography>
            {events.map((v) => (
                <Box key={v.key} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="body1">{v.key}</Typography>
                    <Typography variant="body2">{v.value}</Typography>
                </Box>
            ))}
        </Box>
    );
}
