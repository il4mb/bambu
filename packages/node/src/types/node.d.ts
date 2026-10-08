import NodeData from "../NodeData";
import { Commands } from "./define";

export type InferNodeData<T extends ModuleName> =
    NodeDataOverridable &
    (
        ModelRegistry[T] extends {
            extends: infer P extends ModuleName;
        }
        ? (ModelRegistry[T] extends { data: infer D } ? D : {}) & InferNodeData<P>
        : ModelRegistry[T] extends { data: infer D }
        ? D : {}
    );

export type InferNodeCommands<T extends ModuleName> =
    ModelRegistry[T] extends {
        extends: infer P extends ModuleName;
    }
    ? (ModelRegistry[T] extends { commands: infer C extends Commands } ? C : {}) & InferNodeCommands<P>
    : ModelRegistry[T] extends { commands: infer C extends Commands }
    ? C : {};

export type ShallowOptionalNode<T extends ModuleName = ModuleName> = Partial<Omit<NodeObject, 'data'>> & {
    type?: T;
    data?: Partial<InferNodeData<T>>;
    children?: ShallowOptionalNode[];
}


export type INodeData<
    T extends ModuleName = ModuleName,
    D extends InferNodeData<T> = InferNodeData<T>
> = D & NodeData<T>;
