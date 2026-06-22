import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: "./tests/global-setup.js",
    setupFiles: "./tests/setup.js",
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});