import PropertyLayout from "../PropertyLayout";
import { useProperty } from "@/hooks/useStyled";
import { Stack, Tooltip } from "@mui/material";
import { TextAlignCenterIcon, TextAlignEndIcon, TextAlignJustifyIcon, TextAlignStartIcon } from "lucide-react";
import ActionButton from "../ui/ActionButton";

const ALIGNMENTS = [
    {
        icon: TextAlignStartIcon,
        value: "left",
    },
    {
        icon: TextAlignCenterIcon,
        value: "center",
    },
    {
        icon: TextAlignEndIcon,
        value: "right",
    },
    {
        icon: TextAlignJustifyIcon,
        value: "justify",
    },
];

export interface TextAlignPropertyProps {}
export default function TextAlignProperty({}: TextAlignPropertyProps) {
    const [value, setValue] = useProperty("textAlign", "left");
    return (
        <PropertyLayout label="Text Align">
            <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", flex: 1 }}>
                {ALIGNMENTS.map((alignment) => (
                    <Tooltip key={alignment.value} title={alignment.value} placement="top" arrow>
                        <ActionButton
                            key={alignment.value}
                            selected={value === alignment.value}
                            onClick={() => setValue(alignment.value)}
                        >
                            <alignment.icon size={12} />
                        </ActionButton>
                    </Tooltip>
                ))}
            </Stack>
        </PropertyLayout>
    );
}
