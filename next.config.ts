import type { NextConfig } from "next";

// Kept inline: the Next config loader does not resolve local TypeScript imports.
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);
const DEFAULT_AUTH_EMULATOR_URL = "http://127.0.0.1:9099";

/**
 * Returns the Firebase Auth emulator origin only for explicit local emulator mode
 * (NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true, not on Vercel) and only when it is an
 * http loopback origin. Anything else returns null so the production policy is unchanged.
 */
export function localAuthEmulatorOrigin(env: NodeJS.ProcessEnv = process.env): string | null {
  if (env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS !== "true" || env.VERCEL || env.VERCEL_ENV) return null;
  try {
    const url = new URL(env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL || DEFAULT_AUTH_EMULATOR_URL);
    if (url.protocol !== "http:" || !LOOPBACK_HOSTS.has(url.hostname) || !url.port) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function buildContentSecurityPolicy(env: NodeJS.ProcessEnv = process.env): string {
  const emulatorOrigin = localAuthEmulatorOrigin(env);
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com${emulatorOrigin ? ` ${emulatorOrigin}` : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    // The local emulator is plain http; upgrading would break its requests.
    ...(emulatorOrigin ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const contentSecurityPolicy = buildContentSecurityPolicy();

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["heic-convert"],
  experimental: {
    agentUpgrade: "security",
  },
  outputFileTracingIncludes: {
    "/api/contact": ["./public/images/fes-logo-email.png"],
    "/api/quote-requests": ["./public/images/fes-logo-email.png"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
