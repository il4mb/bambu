import { ReactElement, ReactNode, useRef, useState } from "react";
import Menu from "../ui/Menu";
import { useLatest } from "@/hooks/useLatest";

/** Props shared by every Autocomplete, whatever the item type is. */
interface AutocompleteBaseProps<T> {
    value?: T;
    getKey: (item: T) => string;
    onChange?: (value: T) => void;
    renderInput?: (value: T, onChange: (value: T) => void) => ReactNode;
    items?: T[];
    loading?: boolean;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * T is a primitive (string | number) -> `renderItem` is optional,
 * the item itself is rendered through `getKey`.
 */
export type PrimitiveAutocompleteProps<T extends string | number = string> =
    AutocompleteBaseProps<T> & {
        renderItem?: (item: T) => ReactNode;
    };

/**
 * T is anything else (object, ...) -> `renderItem` is required,
 * there is no sensible default representation.
 */
export type ObjectAutocompleteProps<T> = AutocompleteBaseProps<T> & {
    renderItem: (item: T) => ReactNode;
};

/** Conditional props: `renderItem` is required only for non string|number types. */
export type AutocompleteProps<T> = T extends string | number
    ? PrimitiveAutocompleteProps<T>
    : ObjectAutocompleteProps<T>;

// T is a string | number: renderItem optional.
function Autocomplete<T extends string | number>(
    props: PrimitiveAutocompleteProps<T>,
): ReactElement;
// T is anything else: renderItem required.
function Autocomplete<T>(props: ObjectAutocompleteProps<T>): ReactElement;
function Autocomplete<T>(
    props: AutocompleteBaseProps<T> & { renderItem?: (item: T) => ReactNode },
): ReactElement {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const openRef = useLatest(open);

    const handleOpen = () => {
        if (props.disabled || openRef.current) return;
        setOpen(true);
    };

    const onMenuClose = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (anchorRef.current && anchorRef.current.contains(target)) {
            return;
        }
        setOpen(false);
    };

    return (
        <div style={{ overflow: "hidden" }} className={props.className}>
            <div
                ref={anchorRef}
                onClick={handleOpen}
                style={{
                    position: "relative",
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderColor: open ? "#007bff" : "#ccc",
                    cursor: "pointer",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {props.placeholder || "Autocomplete"}
            </div>
            <Menu anchorEl={anchorRef.current} open={open} onClose={onMenuClose}>
                <input
                    autoComplete="off"
                    autoFocus
                    type="text"
                    placeholder={props.placeholder || "Search..."}
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "8px",
                        border: "none",
                        outline: "none",
                    }}
                />
                <div style={{ padding: "8px", width: 200, height: 400, overflowY: "auto" }}>
                    {props.items?.map((item) => (
                        <div
                            key={props.getKey(item)}
                            onClick={() => {
                                props.onChange?.(item);
                                setOpen(false);
                            }}
                        >
                            {props.renderItem ? props.renderItem(item) : props.getKey(item)}
                        </div>
                    ))}
                </div>
            </Menu>
        </div>
    );
}

export default Autocomplete;