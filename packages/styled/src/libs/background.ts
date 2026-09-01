import { IColorStop } from "@/types/type";
import { Color } from "./color";
import { nanoid } from "nanoid";
import { BackgroundType, GenericBackground, Background } from "@/types/background";
import { splitCSSList } from "./tools";

export function createBackground<T extends BackgroundType>(data: Omit<GenericBackground<T>, 'id'>): GenericBackground<T> {
    return {
        ...data,
        id: nanoid(),
    } as unknown as GenericBackground<T>;
}


// --- Helper: Parse a single color stop ---
export const parseColorStop = (stopStr: string): IColorStop => {
    // "rgba(0,0,0,0.5) 50%" -> extract color and stop
    const parts = splitCSSList(stopStr, " ");
    let color = Color.parse(parts[0]);
    let stopValue: number | null = null;

    if (parts.length > 1) {
        const stopMatch = parts[1].match(/(-?\d+\.?\d*)%/);
        if (stopMatch) stopValue = parseFloat(stopMatch[1]);
    }

    return { id: nanoid(), color, stop: stopValue };
};

// --- Helper: Parse a single background layer string ---
export const parseBackgroundLayer = (layer: string): Background[] => {
    const results: Background[] = [];

    // 1. Extract Image URLs
    const urlMatch = layer.match(/url\(['"]?(.*?)['"]?\)/);
    if (urlMatch) {
        // Extract basic shorthand properties (naive approach for common cases)
        const repeatMatch = layer.match(/no-repeat|repeat-x|repeat-y|repeat/);
        const positionSizeMatch = layer.match(/(?:top|bottom|left|right|center|\d+%|\d+px)\s*(?:\/\s*(cover|contain|auto|\d+%|\d+px))?/);

        results.push({
            id: nanoid(),
            type: "image",
            source: urlMatch[0], // or urlMatch[1] if you just want the raw URL
            repeat: repeatMatch ? repeatMatch[0] : undefined,
            size: positionSizeMatch?.[1] ? positionSizeMatch[1] : undefined,
            position: positionSizeMatch ? positionSizeMatch[0].split("/")[0].trim() : undefined
        });
        layer = layer.replace(urlMatch[0], ""); // Remove so it's not parsed as color
    }

    // 2. Extract Gradients
    const gradientMatch = layer.match(/(linear|radial)-gradient\((.*)\)/);
    if (gradientMatch) {
        const type = gradientMatch[1] as "linear" | "radial";
        const content = gradientMatch[2];

        const args = splitCSSList(content, ",");
        let colorsStartIndex = 0;
        let angleOrPosition = undefined;

        // Check if the first argument is an angle or position (e.g., "90deg", "to right", "circle at center")
        if (args[0].includes("deg") || args[0].includes("to ") || args[0].includes("at ") || args[0].includes("circle")) {
            angleOrPosition = args[0];
            colorsStartIndex = 1;
        }

        const colors = args.slice(colorsStartIndex).map(parseColorStop);

        results.push({
            id: nanoid(),
            type,
            colors,
            ...(type === "linear" ? { angle: angleOrPosition } : { position: angleOrPosition })
        });

        layer = layer.replace(gradientMatch[0], "");
    }

    // 3. Extract Solid Colors
    // After removing urls and gradients, what's left in the layer is usually properties + color.
    // We look for hex, rgb(a), hsl(a), or known color words.
    const colorMatch = layer.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)/);

    // Filter out CSS keywords that aren't colors
    const nonColors = ["no-repeat", "repeat", "cover", "contain", "top", "bottom", "left", "right", "center", "auto", "fixed", "scroll", "local"];
    if (colorMatch && !nonColors.includes(colorMatch[0].toLowerCase())) {
        results.push({
            id: nanoid(),
            type: "solid",
            color: Color.parse(colorMatch[0])
        });
    }

    return results;
};

export const parseBackgrounds = async (source: Record<string, any>): Promise<Background[]> => {
    let layers: Background[] = [];

    // 1. Parse Shorthand First
    if (source["background"]) {
        const rawBackground = String(source["background"]).replace(/\s+/gi, '');

        if (rawBackground !== "none") {
            const layerStrings = splitCSSList(rawBackground, ",");
            layerStrings.forEach(str => {
                layers.push(...parseBackgroundLayer(str));
            });
        }
    }

    // 2. Parse Explicit Images/Gradients (Overrides shorthand)
    if (source["background-image"] || source["backgroundImage"]) {
        const rawBgImage = String(source["background-image"] || source["backgroundImage"]);
        if (rawBgImage !== "none") {
            const layerStrings = splitCSSList(rawBgImage, ",");
            // If background-image is explicitly set, it usually overrides the image/gradient layers of shorthand.
            // For a robust editor, you might replace them entirely, but here we'll append/replace logic.
            const newImageLayers = layerStrings.flatMap(parseBackgroundLayer);

            // Remove previous images/gradients from shorthand
            layers = layers.filter(l => l.type === "solid");
            layers.unshift(...newImageLayers);
        }
    }

    // 3. Parse Explicit Color (Overrides shorthand solid color)
    if (source["background-color"] || source["backgroundColor"]) {
        const rawColor = String(source["background-color"] || source["backgroundColor"]).replace(/\s+/gi, '');

        if (rawColor !== "none" && rawColor !== "rgba(0,0,0,0)" && rawColor !== "transparent" && rawColor !== "initial") {
            // Remove any existing solid color from shorthand
            layers = layers.filter(l => l.type !== "solid");
            layers.push({
                id: nanoid(),
                type: "solid",
                color: Color.parse(rawColor)
            });
        }
    }

    return layers;
};