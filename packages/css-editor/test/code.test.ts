import { tokenizeImpl } from "@il4mb/css-tokenizer";
import { describe, it } from "vitest";

describe("CSS Tokenizer", () => {
    it("Should nested function", () => {
        const content = "rgba(255, 0, 0, 0.5)";
        const tokens = tokenizeImpl(content);
        console.log(tokens.toTokenList(content));
    })
});