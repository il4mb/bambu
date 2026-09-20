import { ActionButton, useSelectedNodes, Window } from "@bambu/react";
import { Box, Grid, Popover, Select, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import { Pen } from "lucide-react";
import { PropertyDescriptor } from "@bambu/node";
import ScriptEditor from "../ScriptEditor";

export interface VarsManagerProps {}

export default function VarsManager({}: VarsManagerProps) {
    const selectedNodes = useSelectedNodes();
    const vars = useMemo<PropertyDescriptor[]>(() => {
        if (selectedNodes.length != 1) return [];
        const node = selectedNodes[0];
        return node.data.all();
    }, [selectedNodes]);

    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchor(event.currentTarget);
    };

    const handleClose = () => {
        setAnchor(null);
    };

    return (
        <Box>
            <Typography variant="h6">Vars Manager</Typography>
            <Stack sx={{ gap: 0.5 }}>
                {vars.map((v) => (
                    <Box
                        key={v.name}
                        onClick={handleOpen}
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

            <Window
                slotProps={{ header: { title: "Edit Variable" } }}
                anchorEl={anchor}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                open={Boolean(anchor)}
                onClose={handleClose}
            >
                <Box sx={{ padding: 1, minWidth: 300 }}>
                    <Grid container spacing={1}>
                        <Grid size={6}>
                            <TextField fullWidth size="small" label="Name" variant="outlined" />
                        </Grid>

                        <Grid size={6}>
                            <Select fullWidth size="small" label="Type" variant="outlined">
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="object">Object</option>
                                <option value="array">Array</option>
                            </Select>
                        </Grid>
                        <Grid size={12}>
                            <ScriptEditor />
                        </Grid>
                    </Grid>
                </Box>
            </Window>
        </Box>
    );
}
