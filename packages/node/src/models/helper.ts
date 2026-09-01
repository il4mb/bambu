import type { ModelObject } from "../types/define";
export const defineModel = <T extends ModuleName>(definition: ModelObject<T>) => Object.assign({}, definition);