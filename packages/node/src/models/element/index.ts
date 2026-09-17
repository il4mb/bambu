import { defineModel } from "../helper";
import { DefineModel } from "../../types/define";
import { createElement } from "react";

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
    // component: ({ ref, node, children, ...rest }) => {
    //    return createElement(node.tagName || "div", { ...rest, key: node.id }, children);
    // },
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