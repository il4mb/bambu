import { Typography, Box, IconButton } from "@mui/material";
import SolidBackgroundField from "./SolidBackgroundField";
import ImageBackgroundField from "./ImageBackgroundField";
import GradientBackgroundField from "./GradientBackgroundField";
import { Background } from "@/types/background";
import { PointerEvent, useMemo, useRef, useState } from "react";
import { motion, Reorder, useDragControls } from "motion/react";
import BackgroundPreview from "./BackgroundPreview";
import { GripVertical } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import _ from "lodash";

type BackgroundFieldProps = {
    background: Background;
    onChange?: (background: Background) => void;
};

export default function BackgroundField({ background, onChange }: BackgroundFieldProps) {
    const controls = useDragControls();
    const [expanded, setExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isMouseIn, setIsMouseIn] = useState(false);
    const dragInProgress = useRef(false);

    const typeLabel = useMemo(() => {
        switch (background.type) {
            case "image":
                return "Image Fill";
            case "solid":
                return "Solid Color";
            case "linear":
            case "radial":
                return _.capitalize(`${background.type} Gradient`);
            default:
                return "Unknown";
        }
    }, [background.type]);

    const handlePointerDown = (e: PointerEvent) => {
        controls.start(e);
    };

    const handleToggle = () => {
        if (dragInProgress.current) return;
        setExpanded((prev) => !prev);
    };

    const handleMouseEnter = () => !dragInProgress.current && setIsMouseIn((prev) => (prev === false ? true : prev));
    const handleMouseLeave = () => !dragInProgress.current && setIsMouseIn(false);

    return (
        <>
            <Reorder.Item
                as="div"
                value={background}
                style={{ flexShrink: 0 }}
                dragListener={false}
                dragControls={controls}
                onDragStart={() => {
                    dragInProgress.current = true;
                    setIsDragging(true);
                }}
                onDragEnd={() => {
                    dragInProgress.current = false;
                    setIsDragging(false);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseEnter}
            >
                <Box
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box
                        onClick={handleToggle}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            userSelect: "none",
                        }}
                    >
                        {(isMouseIn || isDragging) && (
                            <IconButton
                                component={motion.button}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                size="small"
                                onPointerDown={handlePointerDown}
                                sx={{
                                    cursor: "grab",
                                    touchAction: "none",
                                    minWidth: 0,
                                    minHeight: 0,
                                    width: 15,
                                    height: 15,
                                    padding: 0,
                                }}
                            >
                                <GripVertical size={12} />
                            </IconButton>
                        )}
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: "bold",
                                textTransform: "capitalize",
                                flex: 1,
                                ml: 1,
                            }}
                        >
                            {typeLabel}
                        </Typography>

                        <BackgroundPreview background={background} width={45} height={20} />
                    </Box>

                    <Box
                        component={motion.div}
                        sx={{ overflow: "hidden" }}
                        initial={false}
                        animate={{ maxHeight: expanded ? 1000 : 0, opacity: expanded ? 1 : 0, y: expanded ? 0 : -10 }}
                    >
                        <Box sx={{ p: 2 }}>
                            {background.type === "solid" ? (
                                <SolidBackgroundField value={background} onChange={onChange} />
                            ) : background.type === "image" ? (
                                <ImageBackgroundField value={background} onChange={onChange} />
                            ) : background.type === "linear" || background.type === "radial" ? (
                                <GradientBackgroundField value={background} onChange={onChange} />
                            ) : null}
                        </Box>
                    </Box>
                </Box>
            </Reorder.Item>
            <Overlay cursor="grabbing" open={isDragging} />
        </>
    );
}
