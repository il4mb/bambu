// ============================================================
// 1. Unit definitions (as provided)
// ============================================================

export const ABSOLUTE_LENGTH_UNITS = [
    "px", "cm", "mm", "in", "pt", "pc"
] as const;

export const RELATIVE_LENGTH_UNITS = [
    "em", "rem", "ex", "ch"
] as const;

export const VIEWPORT_UNITS = [
    "vw", "vh", "vmin", "vmax"
] as const;

export const MODERN_VIEWPORT_UNITS = [
    "dvw", "dvh", "lvw", "lvh", "svw", "svh"
] as const;

export const PERCENTAGE_UNITS = [
    "%"
] as const;

export const GRID_UNITS = [
    "fr"
] as const;

export const ANGLE_UNITS = [
    "deg", "rad", "grad", "turn"
] as const;

export const TIME_UNITS = [
    "s", "ms"
] as const;

export const TYPOGRAPHY_UNITS = [
    "px", "em", "rem", "%", "vw", "vh", "pt"
] as const;

export const UNITS = [
    ...ABSOLUTE_LENGTH_UNITS,
    ...RELATIVE_LENGTH_UNITS,
    ...VIEWPORT_UNITS,
    ...MODERN_VIEWPORT_UNITS,
    ...PERCENTAGE_UNITS,
    ...GRID_UNITS,
    ...ANGLE_UNITS,
    ...TIME_UNITS,
] as const;

// ============================================================
// 2. Types
// ============================================================

export type UnitName = typeof UNITS[number];

export interface UnitObject<T extends UnitName = UnitName> {
    value: number;
    unit?: T;
}

// ============================================================
// 3. Unit families & conversion factors
// ============================================================

type UnitFamily = 'absolute-length' | 'angle' | 'time';

/**
 * Map each unit to its family.
 * Only units with fixed conversion factors are assigned a family;
 * others are left as 'unknown'.
 */
const unitFamilyMap: Record<UnitName, UnitFamily | 'unknown'> = {
    // Absolute length
    px: 'absolute-length',
    cm: 'absolute-length',
    mm: 'absolute-length',
    in: 'absolute-length',
    pt: 'absolute-length',
    pc: 'absolute-length',
    // Angle
    deg: 'angle',
    rad: 'angle',
    grad: 'angle',
    turn: 'angle',
    // Time
    s: 'time',
    ms: 'time',
    // All others are context‑dependent
    em: 'unknown',
    rem: 'unknown',
    ex: 'unknown',
    ch: 'unknown',
    vw: 'unknown',
    vh: 'unknown',
    vmin: 'unknown',
    vmax: 'unknown',
    dvw: 'unknown',
    dvh: 'unknown',
    lvw: 'unknown',
    lvh: 'unknown',
    svw: 'unknown',
    svh: 'unknown',
    '%': 'unknown',
    fr: 'unknown',
};

/**
 * Conversion factors relative to a base unit for each family.
 * Base units: px (length), deg (angle), s (time).
 */
const conversionFactors: Record<UnitFamily, Record<UnitName, number>> = {
    'absolute-length': {
        px: 1,
        cm: 1 / 96 * 2.54,   // 1cm = 96/2.54 px
        mm: 1 / 96 * 25.4,   // 1mm = 96/25.4 px
        in: 96,              // 1in = 96px
        pt: 96 / 72,         // 1pt = 1/72in = 96/72 px
        pc: 96 / 6,          // 1pc = 12pt = 12/72in = 1/6in = 96/6 px
        // Other units are not in this family, but we keep the record complete.
        // We'll never look them up because they belong to other families.
    } as any,
    angle: {
        deg: 1,
        rad: 180 / Math.PI,   // 1 rad = 180/π deg
        grad: 0.9,            // 1 grad = 0.9 deg (100 grad = 90 deg)
        turn: 360,            // 1 turn = 360 deg
    } as any,
    time: {
        s: 1,
        ms: 0.001,            // 1ms = 0.001s
    } as any,
};

// Fill the factor records for all units (to satisfy TypeScript)
// but we only use the ones relevant to the family.
for (const family of ['absolute-length', 'angle', 'time'] as UnitFamily[]) {
    const record = conversionFactors[family];
    for (const unit of UNITS) {
        if (!(unit in record)) {
            (record as any)[unit] = 0; // dummy, never used
        }
    }
}

// ============================================================
// 4. Core conversion logic
// ============================================================

/**
 * Get the family of a unit. Throws if the unit is not recognised.
 */
export function getUnitFamily(unit: UnitName): UnitFamily | 'unknown' {
    if (!(unit in unitFamilyMap)) {
        throw new Error(`Unknown unit: "${unit}"`);
    }
    return unitFamilyMap[unit];
}

/**
 * Check if two units can be converted without additional context.
 */
export function isConvertible(from: UnitName, to: UnitName): boolean {
    const familyFrom = getUnitFamily(from);
    const familyTo = getUnitFamily(to);
    if (familyFrom === 'unknown' || familyTo === 'unknown') return false;
    return familyFrom === familyTo;
}

/**
 * Get the conversion factor from a unit to its family base.
 * Throws if the unit is not in a fixed‑conversion family.
 */
export function getConversionFactor(unit: UnitName): number {
    const family = getUnitFamily(unit);
    if (family === 'unknown') {
        throw new Error(`Unit "${unit}" does not have a fixed conversion factor (needs context).`);
    }
    const factor = (conversionFactors[family] as any)[unit];
    if (factor === undefined || factor === 0) {
        throw new Error(`No conversion factor defined for "${unit}" in family "${family}".`);
    }
    return factor;
}

/**
 * Convert a UnitObject from its current unit to a target unit.
 * Throws if the conversion is not possible (different families or context‑dependent).
 */
export function convert<T extends UnitName>(value: UnitObject, target: T): UnitObject<T> {
    const fromUnit = value.unit;
    const toUnit = target;

    // Quick return if same unit
    if (fromUnit === toUnit) {
        return { value: value.value, unit: toUnit };
    }

    // Check compatibility
    if (!isConvertible(fromUnit, toUnit)) {
        return { value: value.value, unit: toUnit };
    }

    // Convert to base unit of the family, then to target
    const fromFactor = getConversionFactor(fromUnit);
    const toFactor = getConversionFactor(toUnit);

    const baseValue = value.value * fromFactor; // value expressed in base unit
    const resultValue = baseValue / toFactor;

    // Avoid floating point noise
    const rounded = Number(resultValue.toPrecision(15));

    return { value: rounded, unit: toUnit };
}

// ============================================================
// 5. Additional utilities: parsing, formatting
// ============================================================

/**
 * Parse a string (e.g., "10px", "10") or a number into a UnitObject.
 * Throws if the unit is not recognised or the format is invalid.
 */
export function parseUnit(input: string | number, fallbackUnit?: UnitName): UnitObject {
    // 1. Direct number support
    if (typeof input === "number") {
        return { value: input, unit: fallbackUnit };
    }

    const trimmed = input.trim();

    // 2. Changed `+` to `*` at the end to make the unit suffix optional
    const match = trimmed.match(/^([+-]?\d*\.?\d+)([a-zA-Z%]*)$/);

    if (!match) {
        throw new Error(`Invalid unit input: "${input}" - expected a number optionally followed by a unit.`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2] as UnitName;

    // 3. If there is no unit in the string, or it's not a valid unit, use the fallback
    if (!unit || !UNITS.includes(unit)) {
        return { value, unit: fallbackUnit };
    }

    return { value, unit };
}

/**
 * Format a UnitObject as a string.
 */
export function formatUnit(obj: UnitObject,): string {
    return `${obj.value ?? 0}${obj.unit ?? ''}`.trim();
}
