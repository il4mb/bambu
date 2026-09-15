import styled from "@emotion/styled";
import { ChevronDown } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import Menu from "@/components/ui/Menu";
import ListItem from "@/components/ui/ListItem";
import { Unit } from "@/utils/unit";
import List from "@/components/ui/List";

const Indicator = styled(ChevronDown)({
    position: "absolute",
    top: "-5px",
    left: "108%",
    background: "#ffffff5c",
    color: "#fff",
    borderRadius: "2px",
    height: "10px",
});

const TextArea = styled.span({
    position: "relative",
});

type UnitFieldProps = {
    value: string;
    onChange?: (value: string) => void;
};

export default function UnitField({ value, onChange }: UnitFieldProps) {
    
    const spanRef = useRef<HTMLSpanElement>(null);
    const [hover, setHover] = useState(false);
    const [open, setOpen] = useState(false);

    const leaveRef = useRef<ReturnType<typeof setTimeout>>(null);
    const activeItemRef = useRef<HTMLLIElement>(null);

    const onMouseEnter = () => {
        if (leaveRef.current) {
            clearTimeout(leaveRef.current);
        }
        setHover(true);
    };

    const onMouseLeave = () => {
        if (leaveRef.current) {
            clearTimeout(leaveRef.current);
        }
        leaveRef.current = setTimeout(() => {
            setHover(false);
        }, 350);
    };

    const handleChange = (newVal: string) => {
        onChange?.(newVal);
        setOpen(false);
    };

    useEffect(() => {
        if (!open) return;
        requestAnimationFrame(() => {
            activeItemRef.current?.scrollIntoView({
                block: "nearest",
                behavior: "auto",
            });
        });
    }, [open]);

    return (
        <Fragment>
            <TextArea ref={spanRef} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                {value}
                {hover && <Indicator size={12} onClick={() => setOpen(true)} />}
            </TextArea>

            <Menu
                anchorEl={spanRef.current}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                open={open}
                onClose={() => setOpen(false)}>
                <List>
                    {Unit.ALL.map((item) => {
                        const active = item === value;
                        return (
                            <ListItem
                                ref={active ? activeItemRef : null}
                                key={item}
                                active={active}
                                onClick={() => handleChange(item)}>
                                {item}
                            </ListItem>
                        );
                    })}
                </List>
            </Menu>
        </Fragment>
    );
}
