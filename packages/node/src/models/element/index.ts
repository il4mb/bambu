import { createIcon, defineModel } from "../helper";
import { DefineModel } from "../../types/define";
import { CSSProperties } from "react";

declare global {
    interface ModelRegistry {
        element: DefineModel<{
            data: {
                style: CSSProperties;
            }
            actions: ["select-parent"],
            commands: {
                "select-parent": () => void;
                "delete": () => void
            }
        }>
    }
}

export default defineModel({
    name: "element",
    icon: createIcon("m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"),
    actions: {
        "select-parent": {
            title: "select parent"
        }
    },
    commands: {
        "select-parent": () => {
        },
        "delete": () => {
        }
    }
});