import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { assertFails, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getBytes, ref, uploadBytes } from "firebase/storage";
import { getAdministrator } from "../../lib/admin/firebase-repository";

const projectId = "fes-local";
let environment: RulesTestEnvironment;

beforeAll(async () => {
  process.env.FIREBASE_PROJECT_ID = projectId;
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  environment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync(resolve("firestore.rules"), "utf8") },
    storage: { rules: readFileSync(resolve("storage.rules"), "utf8") },
  });
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "admins/approved"), { email: "approved@example.test", displayName: "Approved Admin", role: "admin", active: true });
    await setDoc(doc(context.firestore(), "admins/disabled"), { email: "disabled@example.test", displayName: "Disabled Admin", role: "admin", active: false });
    await setDoc(doc(context.firestore(), "adminDashboardContent/foundation"), { title: "Firebase foundation", summary: "Server-authorized read test", status: "draft", updatedAt: "2026-10-14T00:00:00.000Z" });
  });
});

afterAll(async () => environment?.cleanup());

describe("deny-by-default Firebase boundaries", () => {
  it("blocks anonymous and authenticated browser reads/writes", async () => {
    await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), "admins/approved")));
    const client = environment.authenticatedContext("approved").firestore();
    await assertFails(getDoc(doc(client, "adminDashboardContent/foundation")));
    await assertFails(setDoc(doc(client, "drafts/example"), { title: "blocked" }));
    await assertFails(setDoc(doc(client, "siteContent/homepage-v1"), { status: "Published" }));
    await assertFails(setDoc(doc(client, "services/electrical-test"), { status: "Published" }));
    await assertFails(getDoc(doc(client, "businessSettings/public-v1")));
    await assertFails(setDoc(doc(client, "businessSettings/public-v1"), { publicEmail: "blocked@example.test" }));
    await assertFails(getDoc(doc(client, "quoteRequests/private-enquiry")));
    await assertFails(setDoc(doc(client, "quoteRequests/private-enquiry"), { name: "Blocked customer" }));
  });

  it("blocks private Storage reads and writes", async () => {
    const storage = environment.authenticatedContext("approved").storage();
    const file = ref(storage, "quote-photos/private.jpg");
    await assertFails(uploadBytes(file, new Uint8Array([1, 2, 3])));
    await assertFails(getBytes(file));
    const editorial = ref(storage, "editorial/images/example/original.jpg");
    await assertFails(uploadBytes(editorial, new Uint8Array([1, 2, 3])));
    await assertFails(getBytes(editorial));
  });

  it("allows the trusted server repository and distinguishes active records", async () => {
    expect((await getAdministrator("approved"))?.active).toBe(true);
    expect((await getAdministrator("disabled"))?.active).toBe(false);
    expect(await getAdministrator("unapproved")).toBeNull();
  });
});
