import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ enableRouteGeneration: false }),
    viteReact(),
    tsconfigPaths(),
    devtools(),
  ],
});
