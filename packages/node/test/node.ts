import { Container, Register } from "../src/core";

const container = new Container(new Register());
const text = container.nodeManager.createNode("text", { data: { style: {}, text: "12346" } });

console.log(text.data);