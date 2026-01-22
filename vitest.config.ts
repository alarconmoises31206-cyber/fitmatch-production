import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["domain/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      lines: 80,
      functions: 80,
      statements: 80,
      branches: 60,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
