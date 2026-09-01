import _ from "lodash";
import { UnitObject, parseUnit } from "./units";

export const SPACING_EDGE = ["top", "right", "bottom", "left"] as const;

export type Edge = (typeof SPACING_EDGE)[number];
export type Spacing = Record<Edge, UnitObject>;

export const parseSpacing = (container: Record<string, any>, key: string): Spacing => {
    const spacing = Object.fromEntries(SPACING_EDGE.map((edge) => [edge, { value: 0, unit: "px" }])) as Spacing;

    const shorthand = container[key];
    if (shorthand !== undefined && shorthand !== null) {
        const parts = String(shorthand)
            .trim()
            .split(/\s+/)
            .map((v) => parseUnit(v, "px"));

        if (parts.length === 1) {
            spacing.top = spacing.right = spacing.bottom = spacing.left = parts[0];
        } else if (parts.length === 2) {
            spacing.top = spacing.bottom = parts[0];
            spacing.right = spacing.left = parts[1];
        } else if (parts.length === 3) {
            spacing.top = parts[0];
            spacing.right = spacing.left = parts[1];
            spacing.bottom = parts[2];
        } else if (parts.length >= 4) {
            spacing.top = parts[0];
            spacing.right = parts[1];
            spacing.bottom = parts[2];
            spacing.left = parts[3];
        }
    }

    SPACING_EDGE.forEach((edge) => {
        const camelCaseEdge = edge.charAt(0).toUpperCase() + edge.slice(1);
        const camelKey = `${key}${camelCaseEdge}`;
        const kebabKey = `${key}-${edge}`;

        const edgeValue = container[camelKey] !== undefined ? container[camelKey] : container[kebabKey];

        if (edgeValue !== undefined && edgeValue !== null) {
            spacing[edge] = parseUnit(String(edgeValue), "px");
        }
    });

    return spacing;
};

export const getIsCompose = (spacing: Spacing) => {
    const array = Object.values(spacing || {});
    if (!array.length) return;
    return array.some((v) => !_.isEqual(v || {}, array[0] || {}));
};

export const DEFAULT_SPACING: Spacing = {
    top: { value: 0, unit: "px" },
    right: { value: 0, unit: "px" },
    bottom: { value: 0, unit: "px" },
    left: { value: 0, unit: "px" },
};