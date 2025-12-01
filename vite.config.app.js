import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import eslint from "vite-plugin-eslint2";

import { defineConfig, loadEnv } from "vite";

export default ({mode}) => {
  
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  
  return defineConfig({
    root: "src",
    build: {
      outDir: "../build",
      emptyOutDir: true,
      // No lib config - this builds a regular app
    },
    assetsInclude: ["**/*.svg", "**/*.png", "**/*.wav"],
    plugins: [
      svgr({
        svgrOptions: {
          ref: true,
        },
      }),
      react({
        include: "**/*.{jsx,tsx}",
      }),
      eslint()
    ],
    server: {
      port: 3000,
      host: true,
    },
  });
}
