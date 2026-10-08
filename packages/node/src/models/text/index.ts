import { createIcon, defineModel } from "../helper";
import { DefineModel } from "../../types/define";
import TextComponent from "./TextComponent";
import Node from "../../Node";

declare global {
    interface ModelRegistry {
        text: DefineModel<{
            extends: "element",
            actions: ["edit"],
            commands: {
                "find-root": () => any;
                "toggle-editing": () => void;
                "make-spanned": () => Node<'text'> | null;
                "format": (tagName: string, selection: {}) => void
            },
            data: {
                text: string;
                editing: boolean;
            },
        }>;
    }
}

export default defineModel<'text'>({
    component: TextComponent,
    name: "text",
    extends: "element",
    icon: createIcon("m3.9 4.8v2.7l.5-2.1h7.2V20.2H8.8v.7h6.3v-.7H12.4V5.4h7.2l.5 2.2V4.8z"),
    default: {
        tagName: "p",
        data: {
            text: "Text Model",
            editing: false
        }
    },

    actions: {
        "edit": {
            title: "Edit"
        }
    },
    commands: {

        "find-root": function () {
            // if (this.typeOf("text") && this.tagName === "p") {
            //     return this;
            // } else if (this.parent?.typeOf("text")) {
            //     return (this.parent as Node<'text'>).trigger('find-root');
            // }
            return null;
        },

        "toggle-editing": function () {
            // this.data.editing = !this.data.editing;
        },

        "make-spanned": function () {
            // const target = this.trigger("find-root");
            // if (target) {
            //     target.data.text = undefined;
            //     return this.owner.createNode("text", {
            //         tagName: "span",
            //         parent: target.id,
            //         data: {
            //             text: "This is Span Created By Text Model"
            //         }
            //     });
            // }
            console.warn("Root not found");
            return null;
        },
        "format": function (tagName, selection) {
            // if (!this.data.editing) return;
            // throw new Error("Function not implemented.");
        },
    },

    isAcceptable(target) {
        return target.typeOf("text");
    }
});