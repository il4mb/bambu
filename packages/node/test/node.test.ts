import { describe, it } from "vitest";
import { Container, Register } from "../src/core";

describe("Node", () => {
    const container = new Container(new Register(), []);

    const text = container.createNode("text", { data: { style: {}, test: { type: "binding", path: ["style"] } } });

    console.log("Style", text.data.style);
    text.data.style = {
        ...text.data.style,
        color: "red"
    }

    console.log(text.data.get("style"));
});