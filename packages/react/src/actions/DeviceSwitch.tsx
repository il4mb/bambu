import { useContainer, useViewportController } from "@/contexts";
import { MenuItem, Select } from "@mui/material";
import { useState } from "react";

type DeviceSwitchProps = {};

export default function DeviceSwitch({}: DeviceSwitchProps) {
    const { Devices } = useContainer();
    const [devices, setDevices] = useState(Devices.all());
    const [activeId, setActiveId] = useState(Devices.activeId);

    const handleChange = (id: string) => {
        Devices.setDevice(id);
        setActiveId(id);
    };
    return (
        <Select
            value={activeId}
            onChange={(e) => handleChange(String(e.target.value))}
            size="small"
        >
            {devices.map(([id, device]) => (
                <MenuItem key={id} value={id}>
                    {device.label}
                </MenuItem>
            ))}
        </Select>
    );
}
