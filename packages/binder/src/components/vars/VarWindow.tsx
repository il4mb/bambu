import { Box, MenuItem, Stack, TextField } from "@mui/material";
import { Window } from "@bambu/react";
import { Descriptor } from "@bambu/node";
import { useEffect, useState } from "react";
import JsonEditor from "@/editors/JsonEditor";

export interface VarWindowProps {
    open?: {
        anchorEl: HTMLElement;
        item: Descriptor;
    } | null;
    onClose: () => void;
}
export default function VarWindow({ open = null, onClose }: VarWindowProps) {
    const [data, setData] = useState<Descriptor | null>(null);

    const updateData = (key: string, value: any) => {
        if (!data) return;
        setData({ ...data, [key]: value });
    };

    useEffect(() => {
        if (open) {
            setData(open.item);
            console.log(open.item);
        } else {
            setData(null);
        }
    }, [open]);

    if (!open || !data) return null;

    return (
        <Window
            slotProps={{ header: { title: "Edit Variable" } }}
            anchorEl={open?.anchorEl}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            open={open !== null}
            onClose={onClose}
            minSize={{ width: 550, height: 350 }}
            initialSize={{ width: 550, height: 350 }}
            anchorOffset={{
                x: -500,
                y: -50,
            }}
        >
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Stack
                    sx={{
                        flexDirection: "row",
                        gap: 1,
                        flexWrap: "wrap",
                        flex: 1,
                        overflow: "hidden",
                        alignItems: "flex-start",
                    }}
                >
                    <Stack sx={{ gap: 1.5, maxWidth: 195, pt: "10px", pl: 1 }}>
                        <TextField
                            disabled={data.renameable === false}
                            value={data?.name}
                            onChange={(e) => updateData("name", e.target.value)}
                            fullWidth
                            label="Name"
                            variant="outlined"
                        />
                        <TextField
                            disabled={data.changeable === false}
                            value={data?.type}
                            onChange={(e) => updateData("type", e.target.value)}
                            select
                            variant="outlined"
                            fullWidth
                            label="Type"
                        >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="string">String</MenuItem>
                            <MenuItem value="number">Number</MenuItem>
                            <MenuItem value="boolean">Boolean</MenuItem>
                            <MenuItem value="object">Object</MenuItem>
                            <MenuItem value="array">Array</MenuItem>
                        </TextField>
                    </Stack>
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 300,
                            overflow: "auto",
                            display: "flex",
                            maxHeight: "100%",
                            alignSelf: "stretch",
                        }}
                    >
                        <JsonEditor value={JSON.stringify(data.value, null, 2)} />
                    </Box>
                </Stack>
            </Box>
        </Window>
    );
}
