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
            slotProps={{ header: { title: "Variable" } }}
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
            <Box sx={{ p: 1.4 }}>
                <TextField
                    disabled={data.renameable === false}
                    value={data?.name}
                    onChange={(e) => updateData("name", e.target.value)}
                    fullWidth
                    label="Name"
                    variant="outlined"
                />
            </Box>
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <JsonEditor value={JSON.stringify(data.value, null, 2)} />
            </Box>
        </Window>
    );
}
