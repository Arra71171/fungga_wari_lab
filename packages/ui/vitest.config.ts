import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      exclude: [
        "node_modules",
        "dist",
        "src/test/**",
        "src/**/*.stories.{ts,tsx}",
      ],
    },
  },
  resolve: {
    alias: {
      "@workspace/ui": resolve(__dirname, "./src"),
    },
  },
});
