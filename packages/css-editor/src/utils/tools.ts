export const keepNumber = (num?: string) => num?.replace(/[^-+0-9.]+/g, "") ?? "";
export const cleanTrailingZero = (num?: string) => num?.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");

