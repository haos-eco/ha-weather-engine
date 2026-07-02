import { defineConfig } from "vite";

export default defineConfig({
    publicDir: "public",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        lib: {
            entry: "src/ha.ts",
            formats: ["es"],
            fileName: () => "weather-scene-card.js",
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
    },
});