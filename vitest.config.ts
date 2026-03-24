import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },
});
