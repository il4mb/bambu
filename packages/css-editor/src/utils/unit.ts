export namespace Unit {
    export const ABSOLUTE = ["px", "cm", "mm", "in", "pc", "pt"];
    export const RELATIVE = ["em", "rem", "lh", "rlh", "ch", "ex", 'cap', 'ic'];
    export const TIMES = ['s'];
    export const ANGLE = ['deg', 'rad', 'turn'];
    export const LAYOUT = ['fr'];
    export const PERSENTAGE = ['%'];
    export const ALL = [
        ...ABSOLUTE,
        ...RELATIVE,
        ...TIMES,
        ...ANGLE,
        ...LAYOUT,
        ...PERSENTAGE
    ];

}