import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,

    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@hoqn/motioned-react",
      fileName: "index",
      formats: ["cjs", "es"],
    },

    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
    },
  },
});
