import { defineModel } from "../helper";
import { DefineModel } from "../../types/define";
import ListComponent from "./ListComponent";

declare global {
    interface ModelRegistry {
        list: DefineModel<{
            data: {
                items: any[]
            },
        }>;
    }
}

export default defineModel<'list'>({
    component: ListComponent,
    name: "list",
    default: {
        data: {
            items: [{
                id: 1,
                text: "Hallo World"
            }]
        }
    }
});