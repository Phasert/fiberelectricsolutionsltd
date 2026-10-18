import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  // Integration files share one emulator project. Run files serially so a
  // complete-list reorder cannot race another file seeding the same collection.
  test: { testTimeout: 20_000, hookTimeout: 30_000, fileParallelism: false },
});
