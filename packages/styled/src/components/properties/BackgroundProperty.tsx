import { useState } from "react";
import PropertyGroup from "../PropertyGroup";
import { useStyled } from "@/hooks/useStyled";
import { Box, CircularProgress, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import _ from "lodash";
import { Plus, Image as ImageIcon, Paintbrush, Layers } from "lucide-react";
// import { createStopColor, parseColor } from "@/libs/color";
import BackgroundField from "../fields/backgrounds/BackgroundField";
import { parseBackgrounds, createBackground } from "@/libs/background";
import { Background } from "@/types/background";
import { formatUnit } from "@/libs/units";
import { motion, Reorder } from "motion/react";
import { Color } from "@/libs/color";

/**
 * Compiles a structured Background array into standard CSS background properties.
 * Index 0 is the TOP layer, Index N-1 is the BOTTOM layer.
 *
 * Solid layers above images/gradients are converted to uniform linear gradients
 * so CSS honors their exact stack position.
 */
export function buildBackgroundStyle(backgrounds: Background[]) {
    if (!backgrounds || backgrounds.length === 0) {
        return {
            backgroundColor: "transparent",
            backgroundImage: "none",
            backgroundSize: undefined,
            backgroundRepeat: undefined,
            backgroundPosition: undefined,
        };
    }

    const imageLayers: string[] = [];
    const sizes: string[] = [];
    const repeats: string[] = [];
    const positions: string[] = [];
    let baseBackgroundColor: string | undefined = undefined;

    backgrounds.forEach((bg, index) => {
        const isBottomLayer = index === backgrounds.length - 1;

        if (bg.type === "solid") {
            const colorStr = Color.format(bg.color);

            if (isBottomLayer) {
                baseBackgroundColor = colorStr;
            } else {
                imageLayers.push(`linear-gradient(${colorStr}, ${colorStr})`);
                sizes.push("auto");
                repeats.push("no-repeat");
                positions.push("center");
            }
        } else if (bg.type === "linear") {
            const angle = bg.angle ? formatUnit(bg.angle) : "180deg";
            const stops = [...bg.colors]
                .sort((a, b) => (a.stop || 0) - (b.stop || 0))
                .map(Color.formatStop)
                .join(", ");
            imageLayers.push(`linear-gradient(${angle}, ${stops})`);
            sizes.push("auto");
            repeats.push("no-repeat");
            positions.push("center");
        } else if (bg.type === "radial") {
            const pos = bg.position ? `at ${bg.position}` : "at center";
            const stops = bg.colors.map(Color.formatStop).join(", ");
            imageLayers.push(`radial-gradient(${pos}, ${stops})`);
            sizes.push("auto");
            repeats.push("no-repeat");
            positions.push("center");
        } else if (bg.type === "image") {
            const src = bg.source.startsWith("url(") ? bg.source : `url("${bg.source}")`;
            imageLayers.push(src);
            sizes.push(bg.size || "cover");
            repeats.push(bg.repeat || "no-repeat");
            positions.push(bg.position || "center");
        }
    });

    return {
        backgroundColor: baseBackgroundColor || "transparent",
        backgroundImage: imageLayers.length > 0 ? imageLayers.join(", ") : "none",
        backgroundSize: sizes.length > 0 ? sizes.join(", ") : undefined,
        backgroundRepeat: repeats.length > 0 ? repeats.join(", ") : undefined,
        backgroundPosition: positions.length > 0 ? positions.join(", ") : undefined,
    };
}

export default function BackgroundProperty() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const [backgrounds = [], setBackgrounds, pending] = useStyled<Background[]>(
        async (nodes) => {
            const nodeArray = Array.from(nodes);
            if (!nodeArray.length) return [];
            const allBackgrounds = await Promise.all(
                nodeArray.map(async (node) => {
                    // @ts-ignore
                    if (node.data.style?.__backgrounds) {
                        // @ts-ignore
                        return node.data.style.__backgrounds as Background[];
                    }
                    return await parseBackgrounds(node.data.style || {});
                }),
            );

            const first = allBackgrounds[0] || [];
            const allSame = allBackgrounds.every((b) => _.isEqual(first, b));
            return allSame ? first : [];
        },
        (node, newBackgrounds) => {
            const cssStyles = buildBackgroundStyle(newBackgrounds || []);
            node.set("data.style", (prev = {}) => ({
                ...prev,
                ...cssStyles,
                __backgrounds: newBackgrounds,
            }));
        },
    );

    const handleAddLayer = (type: Background["type"] | "linear" | "radial") => {
        setAnchorEl(null);
        let newLayer: Background;

        if (type === "solid") {
            newLayer = createBackground({ type: "solid", color: Color.parse("#ffffff") });
        } else if (type === "linear") {
            newLayer = createBackground({
                type: "linear",
                angle: { value: 180, unit: "deg" },
                colors: [Color.createStop("#ffffff", 0), Color.createStop("#360202", 0)],
            });
        } else if (type === "radial") {
            newLayer = createBackground({
                type: "radial",
                position: "center",
                colors: [Color.createStop("#ffffff", 0), Color.createStop("#360202", 0)],
            });
        } else {
            newLayer = createBackground({
                type: "image",
                source: "",
                size: "cover",
                repeat: "no-repeat",
                position: "center",
            });
        }

        setBackgrounds([newLayer, ...backgrounds]);
    };

    const handleChange = (updated: Background) => {
        setBackgrounds((prev) => [...prev].map((bg) => (bg.id === updated.id ? { ...bg, ...updated } : bg)));
    };

    return (
        <PropertyGroup
            label="Backgrounds"
            defaultExpanded
            actions={
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <Plus size={16} />
                </IconButton>
            }
        >
            {pending && <CircularProgress size={20} sx={{ my: 1, display: "block", mx: "auto" }} />}

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => handleAddLayer("solid")}>
                    <Paintbrush size={14} style={{ marginRight: 8 }} /> Solid Color
                </MenuItem>
                <MenuItem onClick={() => handleAddLayer("linear")}>
                    <Layers size={14} style={{ marginRight: 8 }} /> Linear Gradient
                </MenuItem>
                <MenuItem onClick={() => handleAddLayer("radial")}>
                    <Layers size={14} style={{ marginRight: 8 }} /> Radial Gradient
                </MenuItem>
                <MenuItem onClick={() => handleAddLayer("image")}>
                    <ImageIcon size={14} style={{ marginRight: 8 }} /> Image
                </MenuItem>
            </Menu>

            {backgrounds.length === 0 && (
                <Box sx={{ p: 1, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 12, fontStyle: "italic", color: "text.secondary" }}>
                        No Background Items
                    </Typography>
                </Box>
            )}
            <Reorder.Group
                as="div"
                axis="y"
                values={backgrounds}
                onReorder={setBackgrounds}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                }}
            >
                {backgrounds.map((bg) => (
                    <BackgroundField background={bg} key={bg.id} onChange={handleChange} />
                ))}
            </Reorder.Group>
        </PropertyGroup>
    );
}
