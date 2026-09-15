// import { TokenList } from "./tokenList";

// export class Token {

//     public readonly children: TokenList;
//     public data: Omit<TokenPlain, 'children'>

//     constructor(plain: TokenPlain, public parent: Token | null = null) {
//         const { children, ...rest } = plain;
//         this.data = rest;
//         this.children = new TokenList(children, this);
//     }

//     get id() {
//         return this.data.id;
//     }

//     get value() {
//         return this.data.value;
//     }

//     get number() {
//         return this.data.number;
//     }

//     get unit() {
//         return this.data.unit;
//     }

//     get type() {
//         return this.data.type;
//     }

//     get loc() {
//         return {
//             start: this.data.start,
//             end: this.data.end
//         };
//     }


//     shiftOffset(offset: number) {
//         this.data.start = this.data.start + offset;
//         this.data.end = this.data.end + offset;
//         this.children.shiftOffset(offset);
//     }


//     toJSON() {
//         return this.data;
//     }

// }
