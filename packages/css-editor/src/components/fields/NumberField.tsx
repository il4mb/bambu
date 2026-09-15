import styled from "@emotion/styled";
import NumberDragable from "./NumberDragable";

const Container = styled.span({
    cursor: "ew-resize",
    userSelect: "none",
    color: "#ee9715",
});

type NumberFieldProps = {
    value: string;
    onChange?: (value: string) => void;
    slotProps?: {
        dragable?: {
            step?: number;
        };
    };
};

export default function NumberField({ value, onChange, slotProps }: NumberFieldProps) {
    const handleChange = (updated: string) => {
        onChange?.(updated);
    };

    return (
        <NumberDragable value={value} onChange={handleChange} step={slotProps?.dragable?.step}>
            <Container>{value}</Container>
        </NumberDragable>
    );
}
