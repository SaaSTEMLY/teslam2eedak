import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    testTimeout: 15000,
    hookTimeout: 30000,
    fileParallelism: false, // Run test files sequentially to avoid overwhelming the dev server
    alias: {
      "@/": path.resolve(__dirname, "src") + "/",
    },
  },
});
