// global.d.ts

declare module "*.ttf" {
    const value: string;
    export default value;
}

declare module "@mui/material/TextField" {
    interface TextFieldPropsSizeOverrides {
        compact: true;
    }
}

declare module "@mui/material" {
    interface IconButtonOwnProps {
        active?: boolean;
    }
}

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