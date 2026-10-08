import { Box, TextField } from "@mui/material";
import { Window } from "@bambu/react";
import { Descriptor } from "@bambu/node";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import TextEditor from "@/editors/JsonEditor";
import { ViewUpdate } from "@uiw/react-codemirror";

export interface VarWindowProps {
    open?: {
        anchorEl: HTMLElement;
        item: Descriptor;
    } | null;
    onClose: () => void;
}
export default function VarWindow({ open = null, onClose }: VarWindowProps) {
    const [data, setData] = useState<Descriptor | null>(null);
    const stringValue = useMemo(() => {
        if (!data) return "";
        if (data.type === "array" || data.type === "object") {
            return JSON.stringify(data.value, null, 2);
        }
        if (
            data.value &&
            data.type === "unknown" &&
            typeof data.value !== "string"
        ) {
            return JSON.stringify(data.value);
        }
        return String(data.value);
    }, [data]);
    const editorLang = useMemo(() => {
        if (data?.type === "array" || data?.type === "object") {
            return "json";
        }
        return "text";
    }, [data]);

    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!data) return;
        data.set("name", event.target.value);
    };
    const handleValueChange = useCallback(
        (value: string, view: ViewUpdate) => {
            if (!data) return;
            if (data.type === "object" || data.type === "array") {
                data.set("value", JSON.parse(value));
                return;
            }
            data.set("value", value);
        },
        [data],
    );

    useEffect(() => {
        if (open) setData(open.item);
        else setData(null);
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
            anchorOffset={{ x: -500, y: -50 }}
        >
            <Box sx={{ p: 1.4 }}>
                <TextField
                    disabled={data.renameable === false}
                    value={data?.name}
                    onChange={handleNameChange}
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
                <TextEditor
                    lang={editorLang}
                    value={stringValue}
                    onChange={handleValueChange}
                />
            </Box>
        </Window>
    );
}
