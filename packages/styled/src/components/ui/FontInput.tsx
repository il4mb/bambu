import { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

type FontInputProps = AutocompleteRenderInputParams & {
    value: string;
    selected?: FontItem | null;
};
export default function FontInput({ value, selected, ...params }: FontInputProps) {
    return (
        <TextField
            {...params}
            slotProps={{
                ...params.slotProps,
                htmlInput: {
                    ...params.slotProps.htmlInput,
                    style: {
                        fontFamily: value ? `"${value}", sans-serif` : undefined,
                        fontSize: 12,
                    },
                },
                input: {
                    ...params.slotProps.input,
                    endAdornment: null,
                },
            }}
        />
    );
}
