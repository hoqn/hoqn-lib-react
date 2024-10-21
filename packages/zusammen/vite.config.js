import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,

    lib: {
      entry: resolve(__dirname, "src/react.ts"),
      name: "@hoqn/styled-react",
      fileName: "react",
      formats: ["cjs", "es"],
    },

    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
    },
  },
});
