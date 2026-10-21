import "server-only";

interface FirebaseCacheEnvironment {
  FIREBASE_PROJECT_ID?: string;
  GCLOUD_PROJECT?: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
  FIRESTORE_EMULATOR_HOST?: string;
}

export function createFirebaseCacheNamespace(environment: FirebaseCacheEnvironment) {
  const projectId =
    environment.FIREBASE_PROJECT_ID ||
    environment.GCLOUD_PROJECT ||
    environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "missing-project";

  return `${projectId}:${environment.FIRESTORE_EMULATOR_HOST ? "emulator" : "live"}`;
}

export const FIREBASE_CACHE_NAMESPACE = createFirebaseCacheNamespace({
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST,
});
