import { defineModel } from "../helper";
import { DefineModel } from "../../types/define";

declare global {
    interface ModelRegistry {
        element: DefineModel<{
            data: { id: string },
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
    },
    default: {
        data: {
            id: "123"
        }
    }
});