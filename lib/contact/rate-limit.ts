import "server-only";
import { createHash } from "node:crypto";

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();
const WINDOW_MS = 15 * 60 * 1000, LIMIT = 5;

export function enforceContactRateLimit(identifier: string, now = Date.now()) {
  const key = createHash("sha256").update(identifier).digest("hex");
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + WINDOW_MS }); return; }
  if (current.count >= LIMIT) throw new Error("CONTACT_RATE_LIMITED");
  current.count += 1;
  if (buckets.size > 1_000) for (const [bucket, value] of buckets) if (value.resetAt <= now) buckets.delete(bucket);
}

export function resetContactRateLimitsForTesting() { buckets.clear(); }
