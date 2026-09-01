import { IColor, IColorStop } from "@/types/type";
import { SxProps, Box } from "@mui/material";
import { clamp } from "lodash";
import { RefObject, useState, useMemo, useCallback, PointerEvent, useRef, useEffect, memo } from "react";
import ColorPickerPopup from "./ColorPickerPopup";
import { Color } from "@/libs/color";

type ColorStopItemFieldProps = {
    value: IColorStop;
    width: number;
    height: number;
    containerRef: RefObject<HTMLElement | null>;
    onChange?: (value: IColorStop) => void;
    onDelete?: () => void;
    active?: boolean;
    sx?: SxProps;
};

export const ColorStopItemField = ({
    containerRef,
    value: { color, stop, id },
    width,
    height,
    onChange,
    onDelete,
}: ColorStopItemFieldProps) => {
    const [pickerOpen, setPickerOpen] = useState(false);
    const anchorRef = useRef<HTMLElement>(null);
    const valueRef = useRef({ color, stop, id });

    const handleColorChange = (color: IColor) => {
        onChange?.({ ...valueRef.current, color });
    };

    const handleClick = () => {
        setPickerOpen(true);
    };

    useEffect(() => {
        valueRef.current = { color, stop, id };
    }, [color, stop, id]);

    return (
        <>
            <Box
                ref={anchorRef}
                component="div"
                sx={{
                    position: "absolute",
                    left: `${clamp(stop, 0, 100)}%`,
                    top: -2.5,
                    transform: "translateX(-50%)",
                }}
            >
                <ColorStopIndicator
                    id={id}
                    stop={stop}
                    containerRef={containerRef}
                    onDelete={onDelete}
                    onChange={onChange}
                    color={color}
                    width={width}
                    height={height}
                    onClick={handleClick}
                />
            </Box>
            <ColorPickerPopup
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                anchorEl={anchorRef.current}
                value={color}
                onChange={handleColorChange}
            />
        </>
    );
};

type ColorStopIndicatorProps = {
    id: string;
    stop: number;
    width: number;
    height: number;
    color: IColor;
    containerRef: RefObject<HTMLElement | null>;
    onChange?: (value: IColorStop) => void;
    onDelete?: () => void;
    onClick?: () => void;
};
const ColorStopIndicator = memo(
    ({ id, stop, color, containerRef, onChange, onClick, onDelete, width, height }: ColorStopIndicatorProps) => {
        const colorString = useMemo(() => Color.format(color), [color]);

        // SVG geometry
        const strokeWidth = useMemo(() => 1.5, []);
        const startX = useMemo(() => strokeWidth, [strokeWidth]);
        const half = useMemo(() => width / 2 + startX / 2, [width, startX]);
        const yMost = useMemo(() => height + height * 0.4, [height]);
        const leafH = useMemo(() => height * 0.15, [height]);
        const totalHeight = useMemo(() => yMost + leafH + strokeWidth * 2, [yMost, leafH, strokeWidth]);
        const totalWidth = useMemo(() => width + strokeWidth, [width, strokeWidth]);

        const path = useMemo(() => {
            return `M ${startX},${startX} L ${width},${startX} L ${width},${yMost} L ${half},${totalHeight} L ${startX},${yMost} Z`;
        }, [width, yMost, half, totalHeight]);

        const isDraggingRef = useRef(false);
        const [dragging, setDragging] = useState(false);
        const [dragStartX, setDragStartX] = useState(0);

        // Calculate stop percentage from pointer position
        const calculateStopFromPointer = useCallback(
            (clientX: number) => {
                const container = containerRef.current;
                if (!container) return stop;
                const rect = container.getBoundingClientRect();
                const percent = ((clientX - rect.left) / rect.width) * 100;
                return clamp(Math.round(percent), 0, 100);
            },
            [containerRef, stop],
        );

        const onPointerDown = useCallback((e: PointerEvent<SVGElement>) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(false);
            setDragStartX(e.clientX);
        }, []);

        const onPointerMove = useCallback(
            (e: PointerEvent<SVGElement>) => {
                if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

                const deltaX = Math.abs(e.clientX - dragStartX);
                // Threshold of 3px to distinguish click from drag
                if (!dragging && deltaX < 3) return;

                setDragging(true);
                const newStop = calculateStopFromPointer(e.clientX);
                if (newStop !== stop) {
                    onChange?.({ id, color, stop: newStop });
                }
                isDraggingRef.current = true;
            },
            [dragging, dragStartX, calculateStopFromPointer, stop, onChange, id, color],
        );

        const onPointerUp = useCallback((e: PointerEvent<SVGElement>) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
            e.stopPropagation();
            setDragging(false);
        }, []);

        const handleContextMenu = useCallback(
            (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.();
            },
            [onDelete],
        );

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                if (e.key === "Delete" || e.key === "Backspace") {
                    e.preventDefault();
                    onDelete?.();
                }
                // Arrow keys to adjust stop
                const step = e.shiftKey ? 5 : 1;
                if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    const newStop = clamp(stop - step, 0, 100);
                    onChange?.({ id, color, stop: newStop });
                }
                if (e.key === "ArrowRight") {
                    e.preventDefault();
                    const newStop = clamp(stop + step, 0, 100);
                    onChange?.({ id, color, stop: newStop });
                }
            },
            [stop, id, color, onChange, onDelete],
        );

        const handleClick = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                return;
            }
            onClick();
        };

        return (
            <Box
                component="svg"
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="slider"
                aria-valuenow={stop}
                aria-valuemin={0}
                aria-valuemax={100}
                width={totalWidth}
                height={totalHeight}
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            >
                <path
                    d={path}
                    fill={colorString}
                    stroke={Color.getContrast(color)}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                />
            </Box>
        );
    },
);
