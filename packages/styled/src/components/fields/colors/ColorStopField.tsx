import { clamp } from "@/libs/tools";
import { IColor, IColorStop } from "@/types/type";
import { Box, SxProps } from "@mui/material";
import { nanoid } from "nanoid";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColorStopItemField } from "./ColorStopItemField";
import { isNil, omitBy } from "lodash";
import { Color } from "@/libs/color";
import chroma from "chroma-js";

type ColorStopFieldProps = {
    value?: IColorStop[];
    onChange?: (value: IColorStop[]) => void;
    slotProps?: {
        item?: {
            sx?: SxProps;
            width?: number;
            height?: number;
        };
    };
};

export default function ColorStopField({ value: externalValue, onChange, slotProps }: ColorStopFieldProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const syncRef = useRef(true);
    const [value, setValue] = useState<IColorStop[]>([
        Color.createStop("#ffffff", 0),
        Color.createStop("#000000", 100),
    ]);

    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        if (syncRef.current) {
            syncRef.current = false;
            const normalizedValues = externalValue.map((v, i) => ({
                id: nanoid(),
                stop: (i / (externalValue.length - 1)) * 100,
                color: Color.parse("#8a8a8a"),
                ...omitBy(v, isNil),
            }));
            setValue(normalizedValues);
        }
    }, [externalValue]);

    // Update handler – either calls onChange or updates internal state
    const updateValue = useCallback(
        (next: IColorStop[]) => {
            syncRef.current = false;
            setValue(next);
            onChange?.(next);
        },
        [externalValue, onChange],
    );

    // Sort stops by percentage for clean gradient rendering
    const sortedStops = useMemo(() => [...value].sort((a, b) => a.stop - b.stop), [value]);

    // Build CSS gradient string
    const boardColors = useMemo(() => sortedStops.map(Color.formatStop).join(", "), [sortedStops]);

    const handleTrackClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            // Ignore clicks on child elements (like the handles)
            if (e.target !== elementRef.current || !elementRef.current) return;

            const rect = elementRef.current.getBoundingClientRect();
            const clickPercent = clamp(Math.round(((e.clientX - rect.left) / rect.width) * 100), 0, 100);
            const stops = valueRef.current;

            let prev: IColorStop | null = null;
            let next: IColorStop | null = null;
            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i];
                if (stop.stop <= clickPercent) {
                    prev = stop;
                    continue;
                }
                next = stop;
                break;
            }

            if (prev && next) {
                const mid = Color.getMid(prev.color, next.color);
                const newStop = Color.createStop(mid, clickPercent);
                updateValue([...value, newStop]);
                return;
            }

            const newStop = Color.createStop(prev?.color ?? next?.color ?? "#808080", clickPercent);
            updateValue([...value, newStop]);
        },
        [value, updateValue],
    );

    const handleItemChange = useCallback(
        (updatedItem: IColorStop) => {
            const next = value.map((item) => (item.id === updatedItem.id ? updatedItem : item));
            updateValue(next);
        },
        [value, updateValue],
    );

    const handleDeleteStop = useCallback(
        (id: string) => {
            if (value.length <= 2) {
                // Prevent deleting last two stops
                return;
            }
            const next = value.filter((item) => item.id !== id);
            updateValue(next);
        },
        [value, updateValue],
    );

    return (
        <Fragment>
            <Box
                ref={elementRef}
                onClick={handleTrackClick}
                sx={{
                    position: "relative",
                    height: 12,
                    width: "100%",
                    borderRadius: "3px",
                    cursor: "pointer",
                    touchAction: "none",
                    background: `
          linear-gradient(to right, ${boardColors}),
          repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
          repeating-linear-gradient(45deg, #ccc 25%, #fff 25%, #fff 75%, #ccc 75%, #ccc)
        `,
                    backgroundPosition: "0 0, 0 0, 5px 5px",
                    backgroundSize: "100% 100%, 10px 10px, 10px 10px",
                }}
            >
                {value.map((item) => (
                    <ColorStopItemField
                        key={item.id}
                        containerRef={elementRef}
                        value={item}
                        width={slotProps?.item?.width ?? 12}
                        height={slotProps?.item?.height ?? 12}
                        onChange={handleItemChange}
                        onDelete={() => handleDeleteStop(item.id)}
                        sx={slotProps?.item?.sx}
                    />
                ))}
            </Box>
        </Fragment>
    );
}
