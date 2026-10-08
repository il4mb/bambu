import { createElement } from "react";
import type { Icon, ModelObject } from "../types/define";
import DynamicIcon from "../DynamicIcon";
export const defineModel = <T extends ModuleName>(definition: ModelObject<T>) => Object.assign({}, definition);

export const createIcon = (path: string | string[]): Icon => {
    const paths = Array.isArray(path) ? path : [path];
    return (props) => createElement(DynamicIcon, { ...props, paths });
}