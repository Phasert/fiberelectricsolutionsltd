import { describe, expect, it } from "vitest";
import { createFirebaseCacheNamespace } from "../../lib/firebase/cache-namespace";

describe("Firebase public cache isolation", () => {
  it("separates emulator and live cache entries for the same project", () => {
    expect(
      createFirebaseCacheNamespace({
        FIREBASE_PROJECT_ID: "fesr-c3ae1",
        FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
      }),
    ).not.toBe(createFirebaseCacheNamespace({ FIREBASE_PROJECT_ID: "fesr-c3ae1" }));
  });

  it("separates cache entries belonging to different Firebase projects", () => {
    expect(createFirebaseCacheNamespace({ FIREBASE_PROJECT_ID: "fes-local" })).not.toBe(
      createFirebaseCacheNamespace({ FIREBASE_PROJECT_ID: "fesr-c3ae1" }),
    );
  });
});
