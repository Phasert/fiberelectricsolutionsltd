"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";

let configured = false;

function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing Firebase browser configuration: ${name}`);
  return value;
}

export function getFirebaseClient() {
  const config = {
    apiKey: required("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: required("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: required("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    appId: required("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  };
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);

  if (!configured) {
    void setPersistence(auth, inMemoryPersistence);
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
      connectAuthEmulator(auth, process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL || "http://127.0.0.1:9099", { disableWarnings: true });
    }
    configured = true;
  }
  return { app, auth };
}
