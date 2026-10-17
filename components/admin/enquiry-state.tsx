"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { EnquiryStatus } from "@/types/admin";

type EnquiryUpdate = { status?: EnquiryStatus; note?: string; updatedAt?: string };
type EnquiryStateValue = {
  updates: Record<string, EnquiryUpdate>;
  saveUpdate: (id: string, update: Required<Pick<EnquiryUpdate, "status" | "note">>) => void;
};

const STORAGE_KEY = "fes-admin-enquiry-preview-v1";
const STORAGE_EVENT = "fes-admin-enquiry-preview-change";
const EMPTY_UPDATES: Record<string, EnquiryUpdate> = {};
let cachedRaw: string | null | undefined;
let cachedUpdates = EMPTY_UPDATES;
const EnquiryStateContext = createContext<EnquiryStateValue | null>(null);

function readUpdates() {
  if (typeof window === "undefined") return EMPTY_UPDATES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedUpdates;
    cachedRaw = raw;
    cachedUpdates = raw ? JSON.parse(raw) as Record<string, EnquiryUpdate> : EMPTY_UPDATES;
  } catch {
    cachedRaw = null;
    cachedUpdates = EMPTY_UPDATES;
  }
  return cachedUpdates;
}

function subscribeToUpdates(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

export function EnquiryStateProvider({ children }: { children: React.ReactNode }) {
  const updates = useSyncExternalStore(subscribeToUpdates, readUpdates, () => EMPTY_UPDATES);

  const value = useMemo<EnquiryStateValue>(() => ({
    updates,
    saveUpdate: (id, update) => {
      const next = { ...readUpdates(), [id]: { ...update, updatedAt: new Date().toISOString() } };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        cachedRaw = undefined;
        window.dispatchEvent(new Event(STORAGE_EVENT));
      } catch { /* preview only */ }
    },
  }), [updates]);

  return <EnquiryStateContext.Provider value={value}>{children}</EnquiryStateContext.Provider>;
}

export function useEnquiryState() {
  const value = useContext(EnquiryStateContext);
  if (!value) throw new Error("useEnquiryState must be used within EnquiryStateProvider");
  return value;
}
