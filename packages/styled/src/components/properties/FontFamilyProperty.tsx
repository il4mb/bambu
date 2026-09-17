import { useStyled } from "@/hooks/useStyled";
import { useFonts } from "@/hooks/useWebfonts";
import PropertyLayout from "../PropertyLayout";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import FontOption from "../ui/FontOption";
import FontInput from "../ui/FontInput";
import FontWeightProperty from "./FontWightProperty";

const POPPER_EDGE_PADDING = 106;
const POPPER_MIN_WIDTH = 200;

export default function FontFamilyProperty() {

    const [value, setValue] = useStyled<string>(
        (nodes) => {
            const all = Array.from(nodes)
                .map((n) => n.data.style?.fontFamily)
                .filter(Boolean);
            if (all.length === 0) return "system-ui";
            const first = all[0];
            if (all.every((f) => f === first)) return first;
            return "system-ui";
        },
        (node, value) => {
            if (!value) {
                const { fontFamily, ...rest } = node.data.style || {};
                node.set("data.style", rest);
                return;
            }
            node.set("data.style", (prev) => ({
                ...prev,
                fontFamily: value,
                fontWeight: "400",
            }));
        },
    );
    const [filter, setFilter] = useState<string | null>(null);
    const { fonts, loading, fetch } = useFonts();
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fonts.length === 0 && !loading && !fetchedRef.current) {
            fetchedRef.current = true;
            fetch();
            return () => {
                fetchedRef.current = false;
            };
        }
    }, [fonts, loading, fetch]);

    const options = useMemo<FontItem[]>(
        () => [...fonts].sort((a, b) => -b.category.localeCompare(a.category)),
        [fonts],
    );

    const filteredOptions = useMemo<FontItem[]>(() => {
        if (!filter) return options;
        const q = filter.trim().toLowerCase();
        if (!q) return options;
        return options.filter((f) => f.family.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
    }, [options, filter]);

    const selected = useMemo<FontItem | null>(
        () => options.find((f) => f.family.toLowerCase() === (value || "").toLowerCase()) ?? null,
        [options, value],
    );

    const commitFreeSolo = () => {
        const trimmed = (filter ?? "").trim();
        if (!trimmed) return;
        if (selected && selected.family === trimmed) return;
        setValue(trimmed);
        setFilter(null);
    };

    return (
        <Fragment>
            <PropertyLayout label="Family">
                <Autocomplete<FontItem, false, false, true>
                    freeSolo
                    options={filteredOptions}
                    // We do our own filtering; disable MUI's built-in matcher.
                    filterOptions={(x) => x}
                    groupBy={(option) => option.category}
                    getOptionLabel={(option) => (typeof option === "string" ? option : option.family)}
                    value={selected}
                    inputValue={filter ?? value ?? ""}
                    onInputChange={(_, newInput, reason) => {
                        // Only track user typing & explicit clears. Ignore MUI's
                        // "reset" / "selectOption" / "blur" so selecting an
                        // option doesn't refill the filter we just cleared.
                        if (reason === "input" || reason === "clear") {
                            setFilter(newInput);
                        }
                    }}
                    onChange={(_, newValue) => {
                        setFilter(null);
                        if (!newValue) {
                            setValue("");
                        } else if (typeof newValue === "string") {
                            setValue(newValue);
                        } else {
                            setValue(newValue.family);
                        }
                    }}
                    onBlur={commitFreeSolo}
                    // Enter with no highlighted option commits the typed value.
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.defaultPrevented) {
                            commitFreeSolo();
                        }
                    }}
                    loading={loading}
                    sx={{
                        width: "100%",
                        "& .MuiInputBase-root": {
                            height: "1.4em",
                            padding: "0px 2px",
                            paddingRight: "2px !important",
                        },
                    }}
                    renderOption={(props, option) => {
                        const { key, ...rest } = props as typeof props & {
                            key?: React.Key;
                        };
                        return <FontOption key={key ?? option.family} option={option} {...rest} />;
                    }}
                    renderInput={(params) => <FontInput {...params} selected={selected} value={value ?? ""} />}
                    slotProps={{
                        popper: {
                            sx: {
                                "& .MuiPaper-root": {
                                    // maxHeight: POPPER_MAX_HEIGHT,
                                    minWidth: POPPER_MIN_WIDTH,
                                    // overflowY: "auto",
                                },
                            },
                            modifiers: [
                                {
                                    name: "preventOverflow",
                                    enabled: true,
                                    options: {
                                        padding: POPPER_EDGE_PADDING,
                                        // Keep only vertical flipping — side
                                        // flipping looks odd on a narrow list.
                                        altAxis: false,
                                    },
                                },
                            ],
                        },
                    }}
                />
            </PropertyLayout>
            <FontWeightProperty variants={selected?.variants} />
        </Fragment>
    );
}
