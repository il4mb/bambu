import { plugin, serve, redis } from "bun";
import indexHtml from "./src/index.html";
import sass from "sass";

plugin({
    name: "scss-loader",
    setup(build) {
        build.onLoad({ filter: /\.scss$/ }, (args) => {
            const result = sass.compile(args.path);
            return {
                contents: result.css,
                loader: "css",
            };
        });
    },
});

const GOOGLE_FONTS_API_URL = "https://www.googleapis.com/webfonts/v1/webfonts?key=";


const server = serve({
    port: 3000,
    routes: {
        "/": indexHtml,
        "/api/webfonts": async (req) => {
            try {
                // 1. Parse query parameters from the request URL
                const url = new URL(req.url);
                const searchQuery = url.searchParams.get("search")?.toLowerCase();
                const categoryFilter = url.searchParams.get("category")?.toLowerCase();

                let fontsData;
                const cachedFonts = await redis.get("webfonts");

                // 2. Load data from Cache or fetch from API
                if (cachedFonts) {
                    fontsData = JSON.parse(cachedFonts);
                } else {
                    if (!process.env.GOOGLE_FONT_API_KEY) {
                        return new Response("GOOGLE_FONT_API_KEY is not set", { status: 500 });
                    }

                    const response = await fetch(`${GOOGLE_FONTS_API_URL}${process.env.GOOGLE_FONT_API_KEY}`);
                    if (!response.ok) {
                        return new Response("Failed to fetch webfonts", { status: 500 });
                    }
                    fontsData = await response.json();

                    // Cache the entire payload so future requests can filter from memory
                    await redis.set("webfonts", JSON.stringify(fontsData));
                }

                // 3. Apply Search and Filters
                let filteredItems = fontsData.items || [];

                if (searchQuery) {
                    // Filter by font family name (e.g., "Open Sans")
                    filteredItems = filteredItems.filter((font: any) =>
                        font.family.toLowerCase().includes(searchQuery)
                    );
                }

                if (categoryFilter) {
                    // Filter by font category (e.g., "sans-serif", "display", "handwriting")
                    filteredItems = filteredItems.filter((font: any) =>
                        font.category === categoryFilter
                    );
                }

                // 4. Return the filtered payload
                return new Response(JSON.stringify({ items: filteredItems }), {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

            } catch (error) {
                console.error(error);
                return new Response("Error processing webfonts", { status: 500 });
            }
        }
    },

});

const shutdown = () => {
    server.stop();
    console.log("Server stopped.");
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`🚀 Bun server running at http://localhost:${server.port}`);