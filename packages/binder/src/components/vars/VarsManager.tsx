import { useSelectedNodes } from "@bambu/react";
import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { Pen } from "lucide-react";
import { Descriptor } from "@bambu/node";
import VarWindow from "./VarWindow";

type OpenState = {
    anchorEl: HTMLElement;
    item: Descriptor;
};
export interface VarsManagerProps {}

export default function VarsManager({}: VarsManagerProps) {
    const selectedNodes = useSelectedNodes();
    const vars = useMemo<Descriptor[]>(() => {
        if (selectedNodes.length != 1) return [];
        const node = selectedNodes[0];
        return node.data.all();
    }, [selectedNodes]);

    const [open, setOpen] = useState<OpenState | null>(null);

    const handleOpen = (e: React.MouseEvent<HTMLElement>, item: Descriptor) => {
        setOpen({ anchorEl: e.currentTarget, item });
    };

    const handleClose = () => {
        setOpen(null);
    };

    return (
        <Box>
            <Typography variant="h6">Vars Manager</Typography>
            <TextField label="Search" size="small" fullWidth placeholder="Search..." sx={{ mb: 1 }} />
            <Button variant="outlined" size="small" fullWidth sx={{ mb: 1 }}>
                Add Variable
            </Button>
            <Stack sx={{ gap: 0.5 }}>
                {vars.map((v) => (
                    <Box
                        key={v.name}
                        onClick={(e) => handleOpen(e, v)}
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
                        <IconButton color={"primary"} size={"small"}>
                            <Pen size={12} />
                        </IconButton>
                    </Box>
                ))}
            </Stack>

            <VarWindow open={open} onClose={handleClose} />
        </Box>
    );
}
