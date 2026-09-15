import styled from "@emotion/styled";
import { FC, Fragment, HTMLAttributes, useMemo, useRef, useState } from "react";
import Menu from "@/components/ui/Menu";
import { List } from "lucide-react";
import ListItem from "@/components/ui/ListItem";

const Container = styled.span({
    position: "relative",
    userSelect: "none",
});

export type Value = string | number;
export type Item<T extends Value = Value> = {
    value: T;
    label?: string;
};

type SelectProps<T extends Value> = {
    as?: FC<{ onClick: () => void }>;
    items: Item<T>[] | T[];
    value: T;
    onChange?: (value: T) => void;
} & Omit<HTMLAttributes<HTMLSpanElement>, "onChange" | "value" | "items">;

export default function SelectField<T extends Value>({
    as,
    items: externalItems,
    value,
    onChange,
    ...rest
}: SelectProps<T>) {
    const [open, setOpen] = useState(false);
    const contanerRef = useRef<HTMLElement>(null);
    const items = useMemo<Item<T>[]>(() => {
        return externalItems.map((item: any) => (typeof item !== "object" ? { value: item, label: item } : item));
    }, [externalItems]);

    const toggleOpen = () => setOpen((o) => !o);

    const changeHandler = (item: Item<T>) => () => {
        if (onChange) {
            onChange(item.value);
            setOpen(false);
        }
    };

    return (
        <Fragment>
            <Container as={as} onClick={toggleOpen} ref={contanerRef} {...rest}>
                {value}
            </Container>
            <Menu
                anchorEl={contanerRef.current}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                open={open}
                onClose={toggleOpen}
            >
                <List>
                    {items.map((item) => (
                        <ListItem key={item.value} active={value === item.value} onClick={changeHandler(item)}>
                            {item.label ?? item.value}
                        </ListItem>
                    ))}
                </List>
            </Menu>
        </Fragment>
    );
}
