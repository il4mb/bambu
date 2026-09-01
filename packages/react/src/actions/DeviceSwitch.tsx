import { useViewportController } from "@/contexts";
import { MenuItem, Select } from "@mui/material";
import { useState } from "react";

type DeviceSwitchProps = {};

export default function DeviceSwitch({}: DeviceSwitchProps) {
    const controller = useViewportController();
    const [devices, setDevices] = useState(Array.from(controller.devices));
    const [activeId, setActiveId] = useState(controller.activeId);

    const handleChange = (id: string) => {
        controller.setDevice(id);
        setActiveId(id);
    };
    return (
        <Select value={activeId} onChange={(e) => handleChange(e.target.value)} size="small">
            {devices.map(([id, device]) => (
                <MenuItem key={id} value={id}>
                    {device.label}
                </MenuItem>
            ))}
        </Select>
    );
}
