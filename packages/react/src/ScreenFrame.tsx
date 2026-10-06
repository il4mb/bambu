import { Box } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useContainer } from "./contexts";

const PADDING = 23; // 23px visual padding around the device
const BORDER_SIZE = 16; // 8px border * 2 sides

type ScreenProps = {
    children?: ReactNode;
};

export default function ScreenFrame({ children }: ScreenProps) {
    const { Devices } = useContainer();
    const [device, setDevice] = useState(Devices.device);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        return Devices.on("change", () => {
            setDevice(Devices.device);
        });
    }, []);

    // 2. Calculate scale to fit inside the parent element
    useEffect(() => {
        const screenEl = Devices.screenRef.current;
        if (!screenEl || !screenEl.parentElement) return;

        const parent = screenEl.parentElement;

        const calculateScale = () => {
            // Fluid layouts don't need scaling, they stretch natively
            if (device?.width === "fluid" || device?.height === "fluid") {
                setScale(1);
                return;
            }

            const availableWidth = parent.clientWidth - PADDING;
            const availableHeight = parent.clientHeight - PADDING;

            const targetWidth = (device?.width || 0) + BORDER_SIZE;
            const targetHeight = (device?.height || 0) + BORDER_SIZE;

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
    }, [device?.width, device?.height, Devices.screenRef]);

    return (
        <Box
            sx={(theme) => ({
                position: "relative",
                backgroundColor: "#d4d4df",
                flex: 1,
                boxShadow: "inset 0px 0px 8px #0004",
                borderRadius: "18px",
                ...theme.applyStyles("dark", {
                    backgroundColor: "#2a2a44",
                }),
            })}
        >
            <Box
                ref={Devices.screenRef}
                sx={(theme) => ({
                    borderRadius: "24px",
                    overflow: "visible",
                    border: "8px solid #3a3a3a",
                    borderWidth: BORDER_SIZE / 2,
                    boxShadow: "0px 0px 8px #0004",

                    // content-box ensures the inner space is exactly the device width/height
                    // (otherwise the 8px border eats into the device resolution)
                    boxSizing: "content-box",
                    backgroundColor: "#ffffff",

                    width:
                        device?.width === "fluid"
                            ? "100%"
                            : `${device?.width}px`,
                    height:
                        device?.height === "fluid"
                            ? "100%"
                            : `${device?.height}px`,

                    position: "absolute",
                    top: "50%",
                    left: "50%",

                    // Combine absolute centering with the calculated scale
                    transform: `translate(-50%, -50%) scale(${scale})`,

                    // Smooth animation when changing device profiles or resizing
                    transition:
                        "width 0.3s ease, height 0.3s ease, transform 0.1s ease-out",
                    ...theme.applyStyles("dark", {
                        borderColor: "#696969",
                    }),
                })}
            >
                {children}
            </Box>
        </Box>
    );
}
