import { UnitObject } from "@/libs/units";
import type { IColor, IColorStop } from "@/types/type";

export type SolidBackground = {
    id: string;
    type: "solid";
    color: IColor;
};

export type GradientBackground = {
    id: string;
    type: "linear" | "radial";
    colors: IColorStop[];
    angle?: UnitObject<'deg'>;
    position?: string;
};

export type ImageBackground = {
    id: string;
    type: "image";
    source: string;
    size?: string;
    repeat?: string;
    position?: string;
};

export type Background = SolidBackground | GradientBackground | ImageBackground;

export type BackgroundType = Background["type"];

export type GenericBackground<T extends BackgroundType> = {
    type: T
} & (
        T extends SolidBackground['type'] ? Omit<SolidBackground, 'type'>
        : T extends GradientBackground['type'] ? Omit<GradientBackground, 'type'>
        : T extends ImageBackground['type'] ? Omit<ImageBackground, 'type'>
        : never
    )
