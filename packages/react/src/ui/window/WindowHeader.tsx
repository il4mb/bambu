import { ReactNode } from 'react';
import { useWindowProvider } from './WindowProvider';
import { Box, Stack, Typography } from '@mui/material';
import { Minimize2, Maximize2, X } from 'lucide-react';
import ActionButton from '../ActionButton';
export type WindowHeaderProps = {
    title?: ReactNode;
};
export default function WindowHeader({ title }: WindowHeaderProps) {
    const { state, setState } = useWindowProvider();
    const toggleMaximize = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setState((prev) => ({ ...prev, isMaximized: !prev.isMaximized }));
    };

    const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        // Implement close functionality here
    };

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setState((prev) => ({
            ...prev,
            isDragging: true,
            isMaximized: false,
            dragStart: { x: e.clientX, y: e.clientY },
        }));
    };

    return (
        <Box
            onMouseDown={onMouseDown}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px",
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            }}
        >
            <Typography component="div" variant="subtitle2">
                {title}
            </Typography>
            <Stack direction="row" spacing={1}>
                <ActionButton onClick={toggleMaximize}>
                    {state.isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                </ActionButton>
                <ActionButton onClick={handleClose}>
                    <X size={12} />
                </ActionButton>
            </Stack>
        </Box>
    );
};