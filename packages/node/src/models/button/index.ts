import { defineModel } from "../helper";
import { DefineModel } from "../../types/define";

declare global {
    interface ModelRegistry {
        button: DefineModel<{
            extends: "element",
            commands: {
                "click": () => void
            }
        }>
    }
}

export default defineModel<'button'>({
    name: "button",
    extends: "element",
    commands: {
        "click": () => { }
    }
});