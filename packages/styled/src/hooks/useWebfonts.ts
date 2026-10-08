import { useStyleManager } from "@/StyledProvider";
import { useState, useEffect, useMemo, useCallback } from "react";

export const useFonts = function () {
    const webfonts = useWebfonts();
    const [loading, setLoading] = useState(false);
    const [fonts, setFonts] = useState<FontItem[]>([]);

    useEffect(() => {
        if (!webfonts) return;
        const listeners = [
            webfonts.on("items", (e) => {
                setFonts(e.value);
                setLoading(false);
            }),
            webfonts.on("loading", (e) => {
                setLoading(e.value);
            }),
        ];
        return () => {
            listeners.forEach((listener) => listener());
        };
    }, [webfonts]);

    const fetch = useCallback(async (params?: URLSearchParams) => {
        if (!webfonts) return;
        await webfonts.fetch(params);
    }, [webfonts]);

    return useMemo(() => ({ fonts, loading, fetch }), [fonts, loading, fetch]);
};

export const useWebfonts = function () {
    const styleManager = useStyleManager();
    return styleManager.fonts;
};
