import { useEffect, useRef, useState } from "react";
import { useTokenContext } from "../TokenNode";
import NumberField from "../fields/NumberField";
import UnitField from "../fields/UnitField";
import { cleanTrailingZero, keepNumber } from "@/utils/tools";

export interface DimensionTokenProps {
    token: IToken;
    value: string;
}
export default function DimensionToken({ token, value }: DimensionTokenProps) {
    const changedRef = useRef(false);
    const { setValue } = useTokenContext();
    const [number, setNumber] = useState(keepNumber(value));
    const [unit, setUnit] = useState(value.replace(/[-+]?[0-9.]/g, ""));

    const handleNumberChange = (value: string) => {
        const newNumber = cleanTrailingZero(value);
        const newValue = `${newNumber}${unit}`;

        setNumber(newNumber);
        changedRef.current = true;
        setValue(newValue);
    };

    const handleUnitChange = (newUnit: string) => {
        const newValue = `${number}${newUnit}`;
        setUnit(newUnit);
        changedRef.current = true;
        setValue(newValue);
    };

    useEffect(() => {
        if (changedRef.current) {
            changedRef.current = false;
            return;
        }
        const newNumber = keepNumber(value);
        const newUnit = value.replace(/[-+]?[0-9.]/g, "");
        setNumber(newNumber);
        setUnit(newUnit);
    }, [value]);

    return (
        <span className={token[0]} data-start={token[1]} data-end={token[2]}>
            <NumberField value={number} onChange={handleNumberChange} slotProps={{ dragable: { step: 1 } }} />
            <UnitField value={unit} onChange={handleUnitChange} />
        </span>
    );
}
