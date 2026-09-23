import { defineModel } from "../helper";
import { DefineModel } from "../../types/define";
import { CSSProperties } from "react";

declare global {
    interface ModelRegistry {
        element: DefineModel<{
            data:{
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