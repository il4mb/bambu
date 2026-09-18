import { ActionButton, useSelectedNodes } from "@bambu/react";
import { Box, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { Pen } from "lucide-react";

type StringVar = { name: string; value: string; type: "string" };
type NumberVar = { name: string; value: number; type: "number" };
type BooleanVar = { name: string; value: boolean; type: "boolean" };
type ObjectVar = { name: string; value: object; type: "object" };
type ArrayVar = { name: string; value: any[]; type: "array" };
type UnknownVar = { name: string; value: any; type: "unknown" };
type Var = StringVar | NumberVar | BooleanVar | ObjectVar | ArrayVar | UnknownVar;
type WrappedVar = Var & { deleteable: boolean; renameable?: boolean };

const isUserDefined = (value: any): value is Var =>
    typeof value === "object" && value !== null && "name" in value && "value" in value && "type" in value;

const getVarType = (value: any): Var["type"] => {
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object" && value !== null) return "object";
    return "unknown";
};

const varWrapper = (name: string, value: any): WrappedVar => {
    if (isUserDefined(value)) return { ...value, name, deleteable: true, renameable: true };
    return {
        name,
        value,
        type: getVarType(value),
        deleteable: false,
        renameable: false,
    };
};

export interface VarsManagerProps {}

export default function VarsManager({}: VarsManagerProps) {
    const selectedNodes = useSelectedNodes();
    const vars = useMemo<WrappedVar[]>(() => {
        if (selectedNodes.length != 1) return [];
        const node = selectedNodes[0];
        const data = (node.data || {}) as any;
        data.testing = {
            name: "testing",
            value: "Hello World",
            type: "string",
        };
        return Object.entries(data).map(([key, value]) => varWrapper(key, value));
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
