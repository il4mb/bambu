import { useStyled } from "@/hooks/useStyled";
import PropertyLayout from "../PropertyLayout";
import { formatUnit, UnitObject } from "@/libs/units";
import { Fragment } from "react/jsx-runtime";
import { Box, IconButton } from "@mui/material";
import { Square, SquareDashed } from "lucide-react";
import NumberField from "../fields/NumberField";
import { useEffect, useRef, useState } from "react";
import { useStyledManager } from "@/StyledManager";
import { Spacing, parseSpacing, SPACING_EDGE, DEFAULT_SPACING, getIsCompose } from "@/libs/spacing";
import _ from "lodash";

export default function PaddingProperty() {
    const { target } = useStyledManager();
    const shouldCheckComposingRef = useRef(false);

    const [value, setValue] = useStyled<Spacing | null>(
        (nodes) => {
            const nodeArray = Array.from(nodes);
            if (nodeArray.length === 0) return null;

            const firstValue = parseSpacing(nodeArray[0].data.style || {}, "padding");
            const allMatch = nodeArray.every((node) =>
                _.isEqual(parseSpacing(node.data.style || {}, "padding"), firstValue),
            );

            // parseSpacing always returns an object, so firstValue is never truly falsy.
            // If styles match, just return it. The underlying values might be 0.
            if (allMatch) {
                return firstValue;
            }

            // Fallback logic for computed values if styles differ
            const computedValue = parseSpacing(nodeArray[0].state.computed || {}, "padding");
            const allComputedMatch = nodeArray.every((node) =>
                _.isEqual(parseSpacing(node.state.computed || {}, "padding"), computedValue),
            );

            if (allComputedMatch) {
                return computedValue;
            }

            return null;
        },
        (node, value) => {
            node.set("data.style", (prev = {}) => {
                const { padding, paddingTop, paddingRight, paddingBottom, paddingLeft, ...rest } = prev;
                if (!value) return rest;

                const builded = Object.fromEntries(
                    SPACING_EDGE.map((edge) => {
                        const camelCaseEdge = edge.charAt(0).toUpperCase() + edge.slice(1);
                        return [`padding${camelCaseEdge}`, formatUnit({ value: 0, ...(value?.[edge] || {}) })];
                    }),
                );

                return {
                    ...rest,
                    ...builded,
                };
            });
        },
    );

    const [isComposing, setIsComposing] = useState(false);

    const changeAll = (val: UnitObject) => {
        setValue(Object.fromEntries(SPACING_EDGE.map((edge) => [edge, { value: 0, unit: "px", ...val }])) as Spacing);
    };
    const changeEdge = (key: keyof Spacing, val: UnitObject) => {
        setValue((prev) => ({
            ...(prev || DEFAULT_SPACING),
            [key]: { value: 0, unit: "px", ...val },
        }));
    };
    const toggleComposing = () => setIsComposing((prev) => !prev);

    useEffect(() => {
        setIsComposing(false);
        shouldCheckComposingRef.current = true;
    }, [target]);

    useEffect(() => {
        if (shouldCheckComposingRef.current) {
            shouldCheckComposingRef.current = false;
            setIsComposing(getIsCompose(value));
        }
    }, [value]);

    return (
        <Fragment>
            <PropertyLayout label="Padding">
                {!isComposing ? <NumberField value={value?.top} onChange={changeAll} /> : <Box sx={{ flex: 1 }} />}
                <IconButton
                    onClick={toggleComposing}
                    color="primary"
                    sx={{
                        padding: "4px", // Cleaner padding
                        width: 24, // Fixed typo "with", replaced with standard sizing
                        height: 24,
                        ml: 1,
                    }}
                >
                    {isComposing ? <SquareDashed size={16} /> : <Square size={16} />}
                </IconButton>
            </PropertyLayout>

            {/* FIXED JSX CONDITIONAL RENDER */}
            {isComposing && (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr", // Creates a perfect 2x2 grid
                        gap: 1,
                        padding: "4px 12px",
                    }}
                >
                    {/* DRY: Map over the edges instead of hardcoding 4 blocks */}
                    {SPACING_EDGE.map((edge) => (
                        <PropertyLayout
                            key={edge}
                            itemSx={{ justifyContent: "flex-end" }}
                            sx={{
                                px: 0.5,
                                py: 0.25,
                                border: "1px solid",
                                borderColor: "divider", // Uses theme divider color for a cleaner look
                                borderRadius: 1,
                            }}
                            label={edge.charAt(0).toUpperCase() + edge.slice(1)}
                        >
                            <NumberField value={value?.[edge]} onChange={(v) => changeEdge(edge, v)} />
                        </PropertyLayout>
                    ))}
                </Box>
            )}
        </Fragment>
    );
}
