import chroma from 'chroma-js';
import { IColor, IColorHSL, IColorHSV, IColorStop, IColorType } from "@/types/type";
import { nanoid } from "nanoid";


export namespace Color {
    export const TYPES = ["hex", "rgb", "hsl"] as IColorType[];

    export const isValidType = (t: string) => TYPES.includes(t as any);
    export const toHSLObject = (array: number[]) => Object.fromEntries(['h', 's', 'l'].map((k, i) => [k, array[i] ?? 0])) as IColorHSL;
    export const toHSVObject = (array: number[] | IColorHSL): IColorHSV => {
        if (!Array.isArray(array)) {
            return toHSVObject([array.h, array.s, array.l]);
        }
        return Object.fromEntries(['h', 's', 'v'].map((k, i) => [k, array[i] ?? 0])) as IColorHSV;
    }

    export const createStop = (color: string | IColor, stop: number): IColorStop => ({
        id: nanoid(),
        color: parse(color),
        stop: Math.max(Math.min(stop, 100), 0),
    });
    export const formatStop = ({ color, stop }: IColorStop) => {
        return stop ? `${format(color)} ${stop}%` : format(color);
    }

    export const parse = (value: any): IColor => {
        if (typeof value == "object" && 'data' in value && 'alpha' in value && 'type' in value) {
            return {
                ...value,
                type: isValidType(value.type) ? value.type : 'rgb'
            }
        }

        const c = chroma(value);
        return {
            type: "rgb",
            data: toHSLObject(c.hsl()),
            alpha: c.alpha()
        };
    };

    export const format = (obj: IColor | IColorHSL): string => {
        if (!obj) return '';

        if ('h' in obj || 's' in obj || 'l' in obj) {
            return format({
                type: 'hex',
                // @ts-ignore
                data: { h: 50, s: 1, l: 0.5, ...obj },
                // @ts-ignore
                alpha: obj.a ?? obj.alpha ?? 1
            });
        }

        const { type, data, alpha } = obj;
        const color = chroma.hsl(data.h, data.s, data.l).alpha(alpha);
        const alphaChannel = Boolean(alpha < 1);

        const formatValue = (v: number): number => (v > -1 && v < 1 && v !== 0) ? Math.floor(v * 10) / 10 : Math.floor(v);
        switch (type) {
            case "hsl": {
                const rawHsla = color.hsl();
                const values = alphaChannel ? rawHsla : rawHsla.slice(0, 3);
                const hsla = values.map((value, index) => {
                    if (index === 0) {
                        return formatValue(value);
                    }
                    return `${formatValue(value * 100)}%`;
                });
                return `hsl${alphaChannel ? "a" : ""}(${hsla.join(",")})`;
            }

            case "rgb": {
                const rawRgba = alphaChannel ? color.rgba() : color.rgb();
                const rgba = rawRgba.map(formatValue);
                return `rgb${alphaChannel ? 'a' : ''}(${rgba.join(',')})`;
            }

            default:
                return color.hex();
        }
    };

    export const getContrast = (value: any, bg: any = "#ffffff") => {
        const foreground = parse(value);
        const background = parse(bg);

        const fg = chroma({
            ...foreground.data,
            a: foreground.alpha,
        });

        const bgColor = chroma({
            ...background.data,
            a: background.alpha,
        });

        // Composite foreground over background when foreground has transparency.
        const [fr, fgGreen, fb] = fg.rgb();
        const [br, bgGreen, bb] = bgColor.rgb();

        const alpha = foreground.alpha ?? 1;

        const rgb = [
            fr * alpha + br * (1 - alpha),
            fgGreen * alpha + bgGreen * (1 - alpha),
            fb * alpha + bb * (1 - alpha),
        ];

        // @ts-ignore
        const luminance = chroma(rgb).luminance();

        return luminance > 0.3
            ? "rgba(0,0,0,0.6)"
            : "rgb(255,255,255)";
    };


    export const getMid = (...value: any[]) => {
        const colors = value.map(parse).map(({ data: { h, s, l }, alpha }) => chroma.hsl(h, s, l, alpha));
        return parse(chroma.scale(colors)(0.5));
    }


}