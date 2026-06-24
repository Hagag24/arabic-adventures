import { defineConfig, defaultExclude } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/__tests__/setup.ts"],
    exclude: [...defaultExclude, "e2e/**"],
    testTimeout: 20000,
    alias: {
      "server-only": path.resolve(__dirname, "src/__tests__/mocks/server-only.ts"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
