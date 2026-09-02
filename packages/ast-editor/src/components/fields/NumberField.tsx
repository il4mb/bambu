import styled from "@emotion/styled";
import NumberDragable from "./NumberDragable";

const Container = styled.span({
    cursor: "ew-resize",
    userSelect: "none",
    fontFamily: "monospace",
    fontSize: 10,
});

type NumberFieldProps = {
    value: number;
    onChange?: (value: number) => void;
};

export default function NumberField({ value, onChange }: NumberFieldProps) {
    const handleChange = (updated: number) => {
        onChange?.(updated);
    };

    return (
        <NumberDragable value={value} onChange={handleChange}>
            <Container>{value}</Container>
        </NumberDragable>
    );
}
