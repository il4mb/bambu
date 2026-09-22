import { Box, Grid, MenuItem, Select, TextField } from "@mui/material";
import { SelectField, Window } from "@bambu/react";
import ScriptEditor from "../ScriptEditor";
import { Descriptor } from "@bambu/node";
import { useEffect, useState } from "react";

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
        >
            <Box sx={{ padding: 1, minWidth: 300 }}>
                <Grid container spacing={1}>
                    <Grid size={6}>
                        <TextField
                            value={data?.name}
                            onChange={(e) => updateData("name", e.target.value)}
                            fullWidth
                            size="small"
                            label="Name"
                            variant="outlined"
                        />
                    </Grid>

                    <Grid size={6}>
                        <TextField
                            value={data?.type}
                            onChange={(e) => updateData("type", e.target.value)}
                            size="small"
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
                    </Grid>
                    <Grid size={12}>
                        <ScriptEditor />
                    </Grid>
                </Grid>
            </Box>
        </Window>
    );
}
