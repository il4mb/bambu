import { ActionButton, useSelectedNodes } from "@bambu/react";
import { Box, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { Pen } from "lucide-react";
import { NodeProperty } from "@bambu/node";


export interface VarsManagerProps {}

export default function VarsManager({}: VarsManagerProps) {
    const selectedNodes = useSelectedNodes();
    const vars = useMemo<NodeProperty[]>(() => {
        if (selectedNodes.length != 1) return [];
        const node = selectedNodes[0];
        return node.data.all();
    }, [selectedNodes]);

    return (
        <Box>
            <Typography variant="h6">Vars Manager</Typography>
            <Stack sx={{ gap: 0.5 }}>
                {vars.map((v) => (
                    <Box
                        key={v.name}
                        sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            padding: "2px 6px",
                            borderRadius: 0.5,
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 12,
                                maxWidth: 100,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                flex: "30%",
                            }}
                            variant="body1"
                        >
                            {v.name}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 12,
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                flex: "70%",
                            }}
                            variant="body2"
                        >
                            {JSON.stringify(v.value)}
                        </Typography>
                        <ActionButton>
                            <Pen size={12} />
                        </ActionButton>
                    </Box>
                ))}
            </Stack>

            {/* <ScriptEditor /> */}
        </Box>
    );
}
