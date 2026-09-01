import { Color } from "chroma-js";
export type IColorType = "hex" | "rgb" | "hsl";
export type IColorHSL = {
    h: number;
    s: number;
    l: number;
};
export type IColorHSV = {
    h: number;
    s: number;
    v: number;
};
export type IColor = {
    type: IColorType;
    data: IColorHSL;
    alpha: number;
};

export type IColorStop = {
    id: string;
    color: IColor;
    stop: number | null;
}