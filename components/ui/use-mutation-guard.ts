"use client";

import { useCallback, useRef } from "react";

/** Prevents duplicate async actions synchronously, before React can render a disabled state. */
export function useMutationGuard() {
  const active = useRef(new Set<string>());
  const run = useCallback(async <T,>(key: string, action: () => Promise<T>): Promise<T | undefined> => {
    if (active.current.has(key)) return undefined;
    active.current.add(key);
    try { return await action(); }
    finally { active.current.delete(key); }
  }, []);
  const isActive = useCallback((key: string) => active.current.has(key), []);
  return { run, isActive };
}
