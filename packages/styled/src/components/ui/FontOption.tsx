import { useWebfonts } from "@/hooks/useWebfonts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { HTMLAttributes, useEffect, useRef, useState } from "react";

export type FontOptionProps = HTMLAttributes<HTMLLIElement> & {
    option: FontItem;
};

export default function FontOption({ option, ...props }: FontOptionProps) {
    const webfonts = useWebfonts();
    const [, setVersion] = useState(0);
    const [visible, setVisible] = useState(false);
    const liRef = useRef<HTMLLIElement | null>(null);

    const fontKey = `${option.family}-regular`;

    // Track *live* visibility. The observer stays connected so we see
    // both enter and exit events.
    useEffect(() => {
        const el = liRef.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    setVisible(entry.isIntersecting);
                }
            },
            { rootMargin: "120px 0px", threshold: 0 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Acquire on visibility, release on hide/unmount. Because the
    // controller ref-counts, if another row is also loading this family
    // it keeps going; only the last release actually aborts.
    useEffect(() => {
        if (!webfonts || !visible) return;
        const lease = webfonts.acquireFont(option, "regular");
        return () => lease.release();
    }, [webfonts, visible, option]);

    // Re-render once the font is ready.
    useEffect(() => {
        if (!webfonts) return;
        if (webfonts.loadedSet.has(fontKey)) {
            setVersion((v) => v + 1);
            return;
        }
        return webfonts.on(`loaded:${fontKey}`, () => {
            setVersion((v) => v + 1);
        });
    }, [webfonts, fontKey]);

    const ready = !!webfonts?.loadedSet.has(fontKey);

    return (
        <Box
            component="li"
            {...props}
            ref={liRef}
            sx={{
                fontFamily: ready ? `"${option.family}", sans-serif` : "inherit",
                display: "flex !important",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 1,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                opacity: ready ? 1 : 0.65,
                transition: "opacity 120ms ease",
            }}
        >
            <Typography
                component="span"
                sx={{
                    fontFamily: "inherit",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {option.family}
            </Typography>

            {visible && !ready && <CircularProgress size={10} thickness={6} sx={{ flexShrink: 0 }} />}
        </Box>
    );
}
