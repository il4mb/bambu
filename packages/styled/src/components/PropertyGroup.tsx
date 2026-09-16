import { Box, Divider, SxProps, Typography } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode, useState } from "react";
import ActionButton from "./ui/ActionButton";
import { motion, AnimatePresence } from "motion/react";

export interface PropertyProps {
    label: string;
    children?: ReactNode;
    sx?: SxProps;
    itemSx?: SxProps;
    defaultExpanded?: boolean;
    actions?: ReactNode;
}
export default function PropertyGroup({ label, children, defaultExpanded = false, actions }: PropertyProps) {
    const [expand, setExpand] = useState(defaultExpanded);
    const toggleExpand = () => setExpand((prev) => !prev);
    return (
        <Box>
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography sx={{ fontSize: 10, flex: 1, fontWeight: 800 }} component={"span"}>
                    {label}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5, alignItems: "center" }}>
                    <ActionButton onClick={toggleExpand}>
                        {expand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </ActionButton>
                    {actions}
                </Box>
            </Box>
            <AnimatePresence>
                {expand && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <Box>{children}</Box>
                        <Divider sx={{ mt: 1, mb: 1.5 }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}
