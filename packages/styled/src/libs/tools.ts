export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const splitCSSList = (str: string, separator: string = ","): string[] => {
    const result: string[] = [];
    let current = "";
    let depth = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "(") depth++;
        else if (char === ")") depth--;
        else if (char === separator && depth === 0) {
            result.push(current.trim());
            current = "";
            continue;
        }
        current += char;
    }
    if (current) result.push(current.trim());
    return result.filter(Boolean);
};

