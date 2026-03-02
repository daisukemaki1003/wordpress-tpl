import { defineConfig, Plugin } from "vite";
import { resolve } from "path";
import fs from "fs";

const themeDistDir = resolve(__dirname, "theme/dist");
const hotFilePath = resolve(themeDistDir, "hot");

function hotFilePlugin(): Plugin {
  return {
    name: "vite-hot-file",
    configureServer() {
      fs.mkdirSync(themeDistDir, { recursive: true });
      fs.writeFileSync(hotFilePath, "http://localhost:5173");

      const cleanup = () => {
        if (fs.existsSync(hotFilePath)) fs.unlinkSync(hotFilePath);
      };
      process.on("exit", cleanup);
      process.on("SIGINT", () => process.exit());
      process.on("SIGTERM", () => process.exit());
    },
  };
}

export default defineConfig({
  plugins: [hotFilePlugin()],
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
    origin: "http://localhost:5173",
  },
  build: {
    outDir: themeDistDir,
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
