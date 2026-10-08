import { Box, SxProps, Typography } from "@mui/material";
import {
    ChangeEvent,
    MouseEvent,
    KeyboardEvent,
    useRef,
    useState,
} from "react";

export interface EditableFieldProps {
    value: string;
    onFinish?: (newValue: string) => void;
    onEditing?: () => void;
    sx?: SxProps;
}

export default function EditableField({
    value,
    onFinish,
    onEditing,
    sx,
}: EditableFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [state, setState] = useState({
        editing: false,
        value,
    });

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        setState((prev) => ({ ...prev, value: e.target.value }));
    };

    const startEditing = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setState({ editing: true, value });
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
        onEditing?.(); // notify
    };

    const commitChanges = () => {
        onFinish?.(state.value);
        setState({ editing: false, value });
    };

    // 2. Add the keydown handler
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // Blurring the input automatically triggers the onBlur event,
            // safely running commitChanges() without double-firing it.
            inputRef.current?.blur();
        }
    };

    return (
        <Box
            component={"span"}
            sx={{ userSelect: "none", fontSize: 12, ...sx }}
            onDoubleClick={startEditing}
            onClick={(e) => {
                if (state.editing) {
                    e.stopPropagation();
                }
            }}
        >
            {state.editing ? (
                <Box
                    component={"input"}
                    ref={inputRef}
                    value={state.value}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown} // 3. Attach the handler here
                    sx={{ all: "inherit" }}
                    onBlur={commitChanges}
                />
            ) : (
                <Typography component={"span"} sx={{ all: "inherit" }}>
                    {value}
                </Typography>
            )}
        </Box>
    );
}
