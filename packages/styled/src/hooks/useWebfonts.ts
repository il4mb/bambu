import { useStyleController } from "@/StyledProvider";
import { WebfontsController } from "@/WebfontsController";
import { useState, useEffect, useMemo, useCallback } from "react";

export const useFonts = function () {
    const webfonts = useWebfonts();
    const [loading, setLoading] = useState(false);
    const [fonts, setFonts] = useState<FontItem[]>([]);

    useEffect(() => {
        if (!webfonts) return;
        const listeners = [
            webfonts.on("items", (fonts) => {
                setFonts(fonts);
                setLoading(false);
            }),
            webfonts.on("loading", (loading) => {
                setLoading(loading);
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
    const controller = useStyleController();
    const [webfonts, setWebfonts] = useState<WebfontsController | null>(null);

    useEffect(() => {
        if (!controller) return;
        return controller.on("webfonts", (webfontsController) => {
            setWebfonts(webfontsController);
        });
    }, [controller]);

    return webfonts;
};
