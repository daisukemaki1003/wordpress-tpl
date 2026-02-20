import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "wordpress/wp-content/themes/my-theme/assets"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        style: resolve(__dirname, "src/scss/style.scss"),
        main: resolve(__dirname, "src/ts/main.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
