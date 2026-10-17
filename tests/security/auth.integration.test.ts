import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, inMemoryPersistence, setPersistence, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getAdminAuth, getAdminFirestore } from "../../lib/firebase/admin";
import { POST as createSession } from "../../app/api/auth/session/route";
import { POST as logout } from "../../app/api/auth/logout/route";
import { verifyAdminSession } from "../../lib/auth/session";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import { getAuthorizedAdminDashboardContent } from "../../lib/content/admin-dashboard-repository";

const origin = "http://localhost:3000";
const password = "Local-test-password-42";
const clientApp = initializeApp({ apiKey: "demo-key", projectId: "fes-local" }, "auth-tests");
const clientAuth = getAuth(clientApp);

beforeAll(async () => {
  connectAuthEmulator(clientAuth, "http://127.0.0.1:9099", { disableWarnings: true });
  await setPersistence(clientAuth, inMemoryPersistence);
  const adminAuth = getAdminAuth();
  for (const user of [
    { uid: "approved", email: "approved@example.test", disabled: false },
    { uid: "unapproved", email: "unapproved@example.test", disabled: false },
    { uid: "disabled-auth", email: "disabled-auth@example.test", disabled: true },
  ]) {
    await adminAuth.createUser({ ...user, password }).catch(async () => adminAuth.updateUser(user.uid, { email: user.email, password, disabled: user.disabled }));
  }
  await getAdminFirestore().collection("admins").doc("approved").set({ email: "approved@example.test", displayName: "Approved Admin", role: "admin", active: true });
  await getAdminFirestore().collection("adminDashboardContent").doc("foundation").set({ title: "Firebase foundation", summary: "Server-authorized read test", status: "draft", updatedAt: "2026-10-15T00:00:00.000Z" });
});

afterAll(async () => { await signOut(clientAuth); });

async function tokenFor(email: string) {
  const credential = await signInWithEmailAndPassword(clientAuth, email, password);
  return credential.user.getIdToken();
}

describe("administrator authentication", () => {
  it("allows an approved administrator and server-verifies the cookie", async () => {
    const response = await createSession(new Request(`${origin}/api/auth/session`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ idToken: await tokenFor("approved@example.test") }) }));
    expect(response.status).toBe(200);
    const cookie = response.cookies.get("__session")?.value;
    expect(cookie).toBeTruthy();
    expect((await verifyAdminSession(cookie))?.uid).toBe("approved");
    expect((await getAuthorizedAdminDashboardContent(cookie))[0]?.id).toBe("foundation");
  });

  it("rejects an authenticated but unapproved account", async () => {
    const response = await createSession(new Request(`${origin}/api/auth/session`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ idToken: await tokenFor("unapproved@example.test") }) }));
    expect(response.status).toBe(403);
  });

  it("rejects disabled accounts", async () => {
    await expect(tokenFor("disabled-auth@example.test")).rejects.toBeTruthy();
  });

  it("rejects missing and invalid protected sessions", async () => {
    expect(await verifyAdminSession("invalid-cookie")).toBeNull();
    await expect(getAuthorizedAdminDashboardContent("invalid-cookie")).rejects.toThrow("authorization required");
    const response = proxy(new NextRequest(`${origin}/admin`));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/admin/login");
  });

  it("logout clears and revokes the issued session", async () => {
    const login = await createSession(new Request(`${origin}/api/auth/session`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ idToken: await tokenFor("approved@example.test") }) }));
    const cookie = login.cookies.get("__session")!.value;
    const response = await logout(new Request(`${origin}/api/auth/logout`, { method: "POST", headers: { origin, cookie: `__session=${encodeURIComponent(cookie)}` } }));
    expect(response.cookies.get("__session")?.value).toBe("");
    expect(response.cookies.get("__session")?.maxAge).toBe(0);
  });
});
