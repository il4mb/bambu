import { describe, it } from "vitest";
import { Container, Register } from "../src/core";

// describe("Node", () => {
const container = new Container(new Register());
const text = container.nodeManager.createNode("text", { data: { style: {} } });
text.on("change:order", (e) => {
    // text.set("order", 0);
    console.log(e);
});
// text.on("change", (e) => {
//     console.log("this should still invoked");
// });
// container.on("node:change", () => {
//     console.log("Some Node Changed hook from global");
// });

container.on(`node:${text.id}:change`, () => {
    console.log("Spedified Node Changed hook from global");
});

// text.set("order", 1);
// text.set("order", 0);
console.log(text.id);
// });