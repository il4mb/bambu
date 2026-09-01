import Box, { BoxProps } from "@mui/material/Box";

type ColorBoxProps = BoxProps & {
    color?: string;
    size?: number;
    borderWidth?: number;
};

export default function ColorBox({ color = "transparent", size = 15, borderWidth = 2, ...rest }: ColorBoxProps) {
    const half = size / 2;

    return (
        <Box
            {...rest}
            sx={{
                width: size,
                height: size,
                backgroundImage: `
linear-gradient(45deg,rgba(0, 0, 0, 0.12) 25%,transparent 25%,transparent 75%,rgba(0, 0, 0, 0.12) 75%),
linear-gradient(45deg,rgba(0, 0, 0, 0.12) 25%,transparent 25%,transparent 75%,rgba(0, 0, 0, 0.12) 75%)`,
                backgroundPosition: `0 0, ${half}px ${half}px`,
                backgroundSize: `${size}px ${size}px`,
                outline: `${borderWidth}px solid #525252`,
                borderRadius: 0.75,
                position: "relative",
                overflow:'hidden',
                ...rest.sx,
                "&:after": {
                    content: '""',
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: color,
                    zIndex: 1,
                },
            }}
        />
    );
}
