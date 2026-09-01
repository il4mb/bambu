import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import NumberDragable from "./NumberDragable";
import { convert, UnitName, UnitObject, UNITS } from "@/libs/units";

const STEPS = { px: 1, em: 0.1, rem: 0.1, "%": 1, vw: 0.1, vh: 0.1, pt: 0.2 };
type NumberFieldProps<T extends UnitName> = {
    units?: readonly UnitName[];
    value?: UnitObject<T>;
    onChange: (value: UnitObject) => void;
    fullWidth?: boolean;
};

export default function NumberField<T extends UnitName>({
    units = UNITS,
    value: externalValue,
    onChange,
    fullWidth,
}: NumberFieldProps<T>) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLElement>(null);
    const step = useMemo(() => {
        // @ts-ignore
        return STEPS[externalValue?.unit] || 1;
    }, [externalValue?.unit]);

    const toggleOpen = () => setOpen((prev) => !prev);
    const handleChangeUnit = (unit: UnitName) => {
        const coverted = convert({ value: 0, unit: "px", ...externalValue }, unit);
        console.log(convert);

        onChange({ unit, value: externalValue?.value ?? 0 });
        setOpen(false);
    };

    const handleChangeValue = (value: number) => {
        onChange({ unit: externalValue?.unit ?? "px", value: value });
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                // outline: "1px solid #8d8d8d70",
                // padding: "0px 12px",
                // borderRadius: 1,
                // textAlign: "right",
                width: fullWidth ? "100%" : "fit-content",
            }}
        >
            <NumberDragable
                step={step}
                value={externalValue?.value ?? 0}
                onChange={(value) => handleChangeValue(value)}
            />
            <Typography sx={{ fontSize: "1em" }} onClick={toggleOpen} ref={anchorRef}>
                {externalValue?.unit ?? "-"}
            </Typography>
            <Menu anchorEl={anchorRef.current} open={open} onClose={() => setOpen(false)}>
                {units.map((u: UnitName, i) => (
                    <MenuItem onClick={() => handleChangeUnit(u)} sx={{ fontSize: 12 }} key={i}>
                        {u}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
