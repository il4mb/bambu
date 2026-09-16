import { Box } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useViewportController } from "./contexts";

type ScreenProps = {
    children?: ReactNode;
};

export default function ScreenFrame({ children }: ScreenProps) {
    const viewport = useViewportController();
    const [device, setDevice] = useState(viewport.device);
    const [scale, setScale] = useState(1);

    // 1. Listen for device changes from the controller
    useEffect(() => {
        return viewport.on("device", () => {
            setDevice(viewport.device);
        });
    }, [viewport]);

    // 2. Calculate scale to fit inside the parent element
    useEffect(() => {
        const screenEl = viewport.screenRef.current;
        if (!screenEl || !screenEl.parentElement) return;

        const parent = screenEl.parentElement;

        const calculateScale = () => {
            // Fluid layouts don't need scaling, they stretch natively
            if (device.width === "fluid" || device.height === "fluid") {
                setScale(1);
                return;
            }

            const PADDING = 64; // 32px visual padding around the device
            const BORDER_SIZE = 16; // 8px border * 2 sides

            const availableWidth = parent.clientWidth - PADDING;
            const availableHeight = parent.clientHeight - PADDING;

            const targetWidth = device.width + BORDER_SIZE;
            const targetHeight = device.height + BORDER_SIZE;

            const scaleX = availableWidth / targetWidth;
            const scaleY = availableHeight / targetHeight;

            // Take the smallest scale to ensure it fits both width and height.
            // The `, 1` ensures it only scales down (shrinks to fit), it won't zoom in past 100%.
            setScale(Math.min(scaleX, scaleY, 1));
        };

        // Re-calculate whenever the parent container resizes
        const resizeObserver = new ResizeObserver(calculateScale);
        resizeObserver.observe(parent);

        // Run initial calculation
        calculateScale();

        return () => resizeObserver.disconnect();
    }, [device.width, device.height, viewport.screenRef]);

    return (
        <Box
            ref={viewport.screenRef}
            sx={{
                borderRadius: '24px',
                overflow: "visible",
                border: "8px solid #ccc",
                
                // content-box ensures the inner space is exactly the device width/height
                // (otherwise the 8px border eats into the device resolution)
                boxSizing: "content-box", 
                backgroundColor: "#fff",
                
                width: device.width === "fluid" ? "100%" : `${device.width}px`,
                height: device.height === "fluid" ? "100%" : `${device.height}px`,
                
                position: "absolute",
                top: "50%",
                left: "50%",
                
                // Combine absolute centering with the calculated scale
                transform: `translate(-50%, -50%) scale(${scale})`,
                
                // Smooth animation when changing device profiles or resizing
                transition: "width 0.3s ease, height 0.3s ease, transform 0.1s ease-out",
            }}
        >
            {children}
        </Box>
    );
}