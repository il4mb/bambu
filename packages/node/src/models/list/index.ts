import { defineModel } from "../helper";
import { DefineModel } from "../../types/define";
import ListComponent from "./ListComponent";

declare global {
    interface ModelRegistry {
        list: DefineModel<{
            data: {
                items: any[],
                map: Record<string, string>
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
                text: "Hallo World"
            }],
            map: {}
        }
    },

    onCreated(node) {

        const createDataItem = (index = 0) => {
            const mapdescriptor = node.data.get("map");
            const hasCurrentMap = Object.keys(mapdescriptor?.value || {}).length > 0;
            const initialMapping: Record<string, string> = Object.fromEntries(Object.entries(node.data.items?.[0] || {}).map(([key]) => ([key, key])));
            if (!hasCurrentMap) {
                mapdescriptor?.set("value", initialMapping);
            }

            const items = node.data.items || [];
            return Object.fromEntries(Object.entries(mapdescriptor?.value || {}).map(([from, target]) => {
                return [target, items[index][from]]
            }))
        }

        const updateList = () => {
            const mapdescriptor = node.data.get("map");
            const hasCurrentMap = Object.keys(mapdescriptor?.value || {}).length > 0;
            const initialMapping: Record<string, string> = Object.fromEntries(Object.entries(node.data.items?.[0] || {}).map(([key]) => ([key, key])));
            if (!hasCurrentMap) {
                mapdescriptor?.set("value", initialMapping);
            }
            const children = Array.from(node.children.values())[0];
            if (children) {
                node.clearChildren();
                const items = node.data.items || [];
                for (let i = 0; i < items.length; i++) {
                    children.clone({ data: createDataItem(i) });
                }
            }
        }

        node.on("change:data:items", () => updateList());
        node.on("change:data:map", () => updateList());
        node.on("children:add", () => updateList());

        updateList();
    },
});