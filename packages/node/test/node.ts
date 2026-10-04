import { Container, Register } from "../src/core";

const container = new Container(new Register());
const text = container.nodeManager.createNode("text", { data: { style: {}, text: "12346" } });


container.on("node:change", () => {
    console.log("Node Change");

    text.data.style = {
        color: "blue"
    }
});

text.on("change:data:style", () => {
    console.log("Style Change");

    text.data.style = {
        color: "orange"
    }
});

text.data.style = {
    color: "red"
}

console.log(text.data.style, text.data.get("style"));