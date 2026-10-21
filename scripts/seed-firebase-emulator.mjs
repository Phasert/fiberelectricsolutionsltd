import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST || !process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("Refusing to seed: Firebase Auth and Firestore emulator hosts are required.");
}

const app = initializeApp({ projectId: process.env.GCLOUD_PROJECT || "fes-local" }, "browser-seed");
const auth = getAuth(app);
const firestore = getFirestore(app);
const password = "Local-test-password-42";
const users = [
  { uid: "browser-approved", email: "approved@example.test", disabled: false },
  { uid: "browser-unapproved", email: "unapproved@example.test", disabled: false },
  { uid: "browser-disabled", email: "disabled@example.test", disabled: true },
];
const requestedEmail=process.env.FES_QA_ADMIN_EMAIL?.trim();
const requestedPassword=process.env.FES_QA_ADMIN_PASSWORD;
if(requestedEmail&&requestedPassword)users.push({uid:"browser-owner-approved",email:requestedEmail,disabled:false,password:requestedPassword});

for (const user of users) {
  const userPassword="password" in user?user.password:password;
  await auth.createUser({ uid:user.uid,email:user.email,disabled:user.disabled,password:userPassword }).catch(() => auth.updateUser(user.uid, { email: user.email, password:userPassword, disabled: user.disabled }));
}
await firestore.collection("admins").doc("browser-approved").set({ email: "approved@example.test", displayName: "Browser Test Admin", role: "admin", active: true });
await firestore.collection("admins").doc("browser-disabled").set({ email: "disabled@example.test", displayName: "Disabled Browser Admin", role: "admin", active: true });
if(requestedEmail)await firestore.collection("admins").doc("browser-owner-approved").set({email:requestedEmail,displayName:"Owner-approved QA Admin",role:"admin",active:true});
await firestore.collection("adminDashboardContent").doc("browser-foundation").set({ title: "Firebase emulator connected", summary: "Read-only dashboard content loaded through the authorized server repository.", status: "draft", updatedAt: "2026-10-15T00:00:00.000Z" });
console.log("Seeded emulator-only approved, unapproved, and disabled accounts.");
