import { defineModel } from "../helper";
import { DefineModel } from "../../types/define";
import { createElement } from "react";

declare global {
    interface ModelRegistry {
        button: DefineModel<{
            extends: "text",
            commands: {
                "click": () => void
            }
        }>
    }
}

export default defineModel<'button'>({
    name: "button",
    extends: "text",
    // component: ({ node, children, ...rest }) => {
    //     return createElement("button", { ...rest, key: node.id }, children || node.data?.text || "Button");
    // },
    default: {
        tagName: "button",
        data: {
            text: "Button"
        }
    },
    commands: {
        "click": () => { }
    }
});