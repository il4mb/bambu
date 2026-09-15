// import { isRegExp } from "lodash";
// import { nanoid } from "nanoid";
// import { TokenList } from "./tokenList";
// import { Token } from "./token";

// // ---------------------------------------------------------------------------
// // Types
// // ---------------------------------------------------------------------------

// export interface ReaderContext {
//     index: number;
//     source: string;
//     tokenizer: (source: string, offset?: number) => TokenPlain[];
// }

// export interface ReaderResult {
//     value: string;
//     nextIndex: number;
//     start?: number;
//     end?: number;
//     children?: TokenPlain[];
// }

// type Expression = string | RegExp;

// interface CharModel {
//     kind: "char";
//     char: string;
// }

// interface KeywordModel {
//     kind: "keyword";
//     exp: Expression[];
//     reader: (ctx: ReaderContext & { matched: Expression }) => ReaderResult;
// }

// interface ClassModel {
//     kind: "class";
//     regex: RegExp;
//     reader?: (ctx: ReaderContext) => ReaderResult;
// }

// export type Model = CharModel | KeywordModel | ClassModel;

// export interface ModelDefinition {
//     type: string;
//     model: Model;
//     priority?: number;
// }

// export interface TokenPosition {
//     start: number;
//     end: number;
// }
// export interface TokenLocation extends TokenPosition {
//     relative: TokenPosition;
// }

// // ---------------------------------------------------------------------------
// // Registry
// // ---------------------------------------------------------------------------

// const registry: ModelDefinition[] = [];

// export function registerModel(def: ModelDefinition): void {
//     const idx = registry.findIndex(d => d.type === def.type);
//     if (idx >= 0) registry[idx] = def;
//     else registry.push(def);
//     registry.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
// }

// // ---------------------------------------------------------------------------
// // Helpers
// // ---------------------------------------------------------------------------

// function findFunctionEnd(source: string, index: number): number {
//     let depth = 0;
//     let cursor = index;
//     let inString = false;
//     let stringChar = '';

//     while (cursor < source.length) {
//         const char = source[cursor];

//         // Handle strings
//         if (!inString && (char === '"' || char === "'")) {
//             inString = true;
//             stringChar = char;
//         } else if (inString && char === stringChar) {
//             inString = false;
//         }

//         // Only count parentheses outside of strings
//         if (!inString) {
//             if (char === '(') depth++;
//             else if (char === ')') {
//                 depth--;
//                 if (depth === 0) return cursor + 1;
//             }
//         }

//         cursor++;
//     }
//     return source.length;
// }

// function sortBySpecificity(exps: Expression[]): Expression[] {
//     return [...exps].sort((a, b) => {
//         const aIsRegex = isRegExp(a);
//         const bIsRegex = isRegExp(b);
//         if (aIsRegex !== bIsRegex) return aIsRegex ? -1 : 1;
//         if (aIsRegex && bIsRegex) return 0;
//         return (b as string).length - (a as string).length;
//     });
// }

// function readWhile(source: string, index: number, test: RegExp): ReaderResult {
//     const start = index;
//     while (index < source.length && test.test(source[index])) index++;
//     return { value: source.slice(start, index), nextIndex: index };
// }

// function createToken(type: string, value: string, start: number, end: number, children?: TokenPlain[]): TokenPlain {
//     const token: TokenPlain = { id: nanoid(), type, value, start, end };
//     if (children) token.children = children;
//     return token;
// }

// function shiftTokenPositions(tokens: TokenPlain[], offset: number): TokenPlain[] {
//     if (!offset) return tokens;
//     return tokens.map(token => ({
//         ...token,
//         start: token.start + offset,
//         end: token.end + offset,
//         children: token.children ? shiftTokenPositions(token.children, offset) : token.children
//     }));
// }

// // ---------------------------------------------------------------------------
// // Built-in Models
// // ---------------------------------------------------------------------------

// const CSS_NAMED_COLORS = [
//     "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure",
//     "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet",
//     "brown", "burlywood", "cadetblue", "chartreuse", "chocolate",
//     "coral", "cornflowerblue", "cornsilk", "crimson", "cyan",
//     "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgrey",
//     "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen",
//     "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
//     "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise",
//     "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey",
//     "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia",
//     "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey",
//     "green", "greenyellow", "honeydew", "hotpink", "indianred",
//     "indigo", "ivory", "khaki", "lavender", "lavenderblush",
//     "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
//     "lightgoldenrodyellow", "lightgray", "lightgrey", "lightgreen",
//     "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
//     "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow",
//     "lime", "limegreen", "linen", "magenta", "maroon",
//     "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
//     "mediumseagreen", "mediumslateblue", "mediumspringgreen",
//     "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream",
//     "mistyrose", "moccasin", "navajowhite", "navy", "oldlace",
//     "olive", "olivedrab", "orange", "orangered", "orchid",
//     "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
//     "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
//     "purple", "rebeccapurple", "red", "rosybrown", "royalblue",
//     "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell",
//     "sienna", "silver", "skyblue", "slateblue", "slategray",
//     "slategrey", "snow", "springgreen", "steelblue", "tan", "teal",
//     "thistle", "tomato", "turquoise", "violet", "wheat", "white",
//     "whitesmoke", "yellow", "yellowgreen", "transparent", "currentcolor",
// ];

// const COLOR_FUNCTIONS = [
//     /^rgba?\(/i, /^hsla?\(/i, /^hwb\(/i, /^lab\(/i, /^lch\(/i,
//     /^oklab\(/i, /^oklch\(/i, /^color\(/i, /^color-mix\(/i
// ];

// const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;

// registerModel({
//     type: "color",
//     priority: 20,
//     model: {
//         kind: "keyword",
//         exp: [...COLOR_FUNCTIONS, ...CSS_NAMED_COLORS, HEX_COLOR],
//         reader({ index, source, matched, tokenizer }) {
//             if (isRegExp(matched)) {
//                 const match = matched.exec(source.slice(index));
//                 if (!match) return { value: source[index], nextIndex: index + 1 };
//                 const value = match[0];
//                 if (value.endsWith('(')) {
//                     const end = findFunctionEnd(source, index);
//                     const fnName = value.slice(0, -1);
//                     const innerStart = index + value.length;
//                     const innerEnd = Math.max(innerStart, end);
//                     return {
//                         value: source.slice(index, end),
//                         nextIndex: end,
//                         children: [
//                             ...tokenizer(fnName, index),
//                             createToken("char", "(", innerStart - 1, innerStart),
//                             ...tokenizer(source.slice(innerStart, innerEnd), innerStart),
//                         ]
//                     };
//                 }
//                 return { value, nextIndex: index + value.length, children: tokenizer(value, index) };
//             }
//             return readWhile(source, index, /[a-zA-Z0-9_-]/);
//         }
//     }
// });

// registerModel({
//     type: "function",
//     priority: 30,
//     model: {
//         kind: "keyword",
//         exp: [/^[a-z][a-z_-]*\(/i],
//         reader({ index, source, tokenizer }) {
//             const end = findFunctionEnd(source, index);
//             const value = source.slice(index, end);
//             return { value, nextIndex: end, children: tokenizer(value, index) };
//         }
//     }
// });

// registerModel({
//     type: "number",
//     priority: 5,
//     model: {
//         kind: "keyword",
//         exp: [/^[+-]?[0-9]/],
//         reader({ index, source }) {
//             let end = index;
//             if (source[end] === "-" || source[end] === "+") end++;
//             while (end < source.length && /[0-9]/.test(source[end])) end++;
//             if (source[end] === "." && /[0-9]/.test(source[end + 1] ?? "")) {
//                 end++;
//                 while (end < source.length && /[0-9]/.test(source[end])) end++;
//             }
//             while (end < source.length && /[a-zA-Z%]/.test(source[end])) end++;
//             return { value: source.slice(index, end), nextIndex: end };
//         }
//     }
// });

// registerModel({
//     type: "word",
//     priority: 1,
//     model: {
//         kind: "class",
//         regex: /^[a-zA-Z_-]$/,
//         reader: ({ index, source }) => readWhile(source, index, /[a-zA-Z0-9_-]/)
//     }
// });

// // ---------------------------------------------------------------------------
// // Tokenizer
// // ---------------------------------------------------------------------------

// function finalizeNumberToken(token: TokenPlain): TokenPlain {
//     const m = /^(-?[0-9]+(?:\.[0-9]+)?)([a-zA-Z%]*)$/.exec(token.value);
//     if (m) {
//         token.number = Number(m[1]);
//         if (m[2]) token.unit = m[2];
//     }
//     return token;
// }


// function tryMatch(def: ModelDefinition, char: string, source: string, index: number, parent: Token): (() => ReaderResult) | null {
//     const { model } = def;
//     const tokenizer = (source: string, offset = 0) => {
//         const reg = registry.filter(d => d.type !== def.type);
//         const list = tokenizeImpl(source, parent, reg);
//         list.shiftOffset(offset);
//         return list;
//     }

//     if (model.kind === "char") {
//         return model.char === char ? () => ({ tokenizer, value: model.char, nextIndex: index + 1 }) : null;
//     }

//     if (model.kind === "class") {
//         if (!model.regex.test(char)) return null;
//         return model.reader
//             // @ts-ignore
//             ? () => model.reader!({ index, source, tokenizer })
//             : () => ({ value: char, nextIndex: index + 1, tokenizer });
//     }

//     // kind === "keyword"
//     const right = source.slice(index);
//     const matched = sortBySpecificity(model.exp).find(exp =>
//         isRegExp(exp) ? exp.test(right) : right.startsWith(exp)
//     );
//     // @ts-ignore
//     return matched ? () => model.reader({ index, source, matched, tokenizer }) : null;
// }

// function tokenizeImpl(code: string, parent: Token = null, reg = registry): TokenList {
//     const tokens = new TokenList([], parent);
//     let i = 0;

//     while (i < code.length) {
//         const char = code[i];

//         // Handle whitespace
//         if (char === " " || char === "\t") {
//             const start = i;
//             while (i < code.length && (code[i] === " " || code[i] === "\t")) i++;
//             tokens.push({ id: nanoid(), type: "char", value: code.slice(start, i), start, end: i });
//             continue;
//         }

//         const start = i;
//         let hit: { type: string; read: () => ReaderResult } | null = null;

//         // Find matching model (registry is priority-sorted)
//         for (const def of reg) {
//             const read = tryMatch(def, char, code, i, parent);
//             if (read) {
//                 // Check if this would match the parent exactly
//                 const result = read();
//                 hit = { type: def.type, read: () => result };
//                 break;
//             }
//         }

//         if (!hit) {
//             tokens.push({ id: nanoid(), type: "char", value: char, start, end: i + 1 });
//             i++;
//             continue;
//         }

//         const { value, nextIndex, children, ...rest } = hit.read();

//         // Guard against infinite loops
//         if (nextIndex <= i) {
//             tokens.push({
//                 id: nanoid(),
//                 type: "char",
//                 value: char, start: rest.start ?? start, end: rest.end ?? i + 1
//             });
//             i++;
//             continue;
//         }

//         const token: TokenPlain = {
//             id: nanoid(),
//             type: hit.type,
//             value,
//             start: rest.start ?? start,
//             end: rest.end ?? nextIndex,
//             children
//         };
//         if (hit.type === "number") finalizeNumberToken(token);

//         tokens.push(token);
//         i = nextIndex;
//     }

//     return tokens;
// }

// // ---------------------------------------------------------------------------
// // Exports
// // ---------------------------------------------------------------------------

// export const tokenize = tokenizeImpl;

// export namespace Code {
//     export const tokenize = tokenizeImpl;
//     export const registerModelFn = registerModel;
//     export type TokenType = string;
// }

// export default tokenizeImpl;