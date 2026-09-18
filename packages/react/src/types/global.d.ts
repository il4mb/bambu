declare global {
    type Point = {
        x: number;
        y: number;
    };
    type Size = {
        width: number;
        height: number;
    };
    type IRect = Point & Size;
}

export { };