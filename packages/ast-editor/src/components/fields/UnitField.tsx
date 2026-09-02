import styled from "@emotion/styled";
import Hovered from "../ui/Hovered";
import { ChevronDown } from "lucide-react";

const DropdownIcon = styled(ChevronDown)({
    position: "absolute",
    top: 0,
    left: "80%",
    pointerEvents: "none",
});
const Container = styled.span({
    position: "relative",
});
const TextArea = styled.span({
    userSelect: "none",
    fontFamily: "monospace",
    color: "blue",
    fontSize: 10,
});

type UnitFieldProps = {
    value: string;
    onChange?: (value: string) => void;
};

export default function UnitField({ value, onChange }: UnitFieldProps) {
    return (
        <Hovered as={Container} render={() => <DropdownIcon size={10} />}>
            <TextArea>{value}</TextArea>
        </Hovered>
    );
}
