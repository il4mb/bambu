// import { BaseModel, DefineModel } from "./define";

import { Commands } from "./define";

export type InferData<T extends ModuleName> =
    NodeObjectData &
    (
        ModelRegistry[T] extends {
            extends: infer P extends ModuleName;
        }
        ? (ModelRegistry[T] extends { data: infer D } ? D : {}) &
        InferData<P>
        : ModelRegistry[T] extends { data: infer D }
        ? D
        : {}
    );

export type InferCommands<T extends ModuleName> =
    ModelRegistry[T] extends {
        extends: infer P extends ModuleName;
    }
    ? (ModelRegistry[T] extends { commands: infer C extends Commands } ? C : {}) &
    InferCommands<P>
    : ModelRegistry[T] extends { commands: infer C extends Commands }
    ? C
    : {};