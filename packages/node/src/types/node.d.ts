import { ToPlain } from "../global";

export type ShallowOptionalNode<T extends ModuleName = ModuleName> = Partial<Omit<NodeObject, 'data'>> & {
    type?: T;
    data?: Partial<ModelRegistry[T]['data'] & NodeDataOverridable>;
    children?: ShallowOptionalNode[];
}