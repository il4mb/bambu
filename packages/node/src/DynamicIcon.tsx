import { memo } from "react";
import { IconProps } from "./types";
const SvgComponent = ({
    size = 14,
    color = "currentColor",
    paths,
}: IconProps & { paths: string[] }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            fill={"none"}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            {paths.map((d, i) => (
                <path d={d} key={i} />
            ))}
        </svg>
    );
};
const DynamicIcon = memo(SvgComponent);
export default DynamicIcon;
