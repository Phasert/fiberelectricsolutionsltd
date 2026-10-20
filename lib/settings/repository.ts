import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { businessSettings } from "@/data/admin-mock";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { businessSettingsInputSchema, publicBusinessSettingsSchema, type BusinessSettingsState } from "@/lib/settings/schema";
import { collectMediaIds,syncMediaReferences } from "@/lib/media/references";

const document = () => getAdminFirestore().collection("businessSettings").doc("public-v1");
const defaultSettings = publicBusinessSettingsSchema.parse(businessSettings);

export async function getAdminBusinessSettings(): Promise<BusinessSettingsState> {
  const snapshot = await document().get();
  if (!snapshot.exists) return { approvalStatus: "Draft", settings: structuredClone(defaultSettings) };
  const data = snapshot.data();
  const parsed = publicBusinessSettingsSchema.safeParse(data?.public);
  if (!parsed.success) return { approvalStatus: "Draft", settings: structuredClone(defaultSettings) };
  return { approvalStatus: data?.approvalStatus === "Approved" ? "Approved" : "Draft", settings: parsed.data };
}

export async function saveBusinessSettings(input: unknown, uid: string) {
  const value = businessSettingsInputSchema.parse(input);
  const ref = document();
  await getAdminFirestore().runTransaction(async (transaction) => {
    const current = await transaction.get(ref);
    const existing = current.data();
    await syncMediaReferences(transaction,{consumer:`businessSettings/${ref.id}:branding`,previousIds:collectMediaIds(existing?.public),nextIds:collectMediaIds(value.settings),role:"branding",uid});
    transaction.set(ref, {
      schemaVersion: 1,
      approvalStatus: value.approvalStatus,
      public: value.settings,
      createdAt: existing?.createdAt ?? FieldValue.serverTimestamp(),
      createdBy: existing?.createdBy ?? uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: uid,
      approvedAt: value.approvalStatus === "Approved" ? (existing?.approvedAt ?? FieldValue.serverTimestamp()) : (existing?.approvedAt ?? null),
      approvedBy: value.approvalStatus === "Approved" ? uid : (existing?.approvedBy ?? null),
    });
  });
}

export async function getApprovedBusinessSettings() {
  const snapshot = await document().get();
  const data = snapshot.data();
  if (data?.approvalStatus !== "Approved") return null;
  const parsed = publicBusinessSettingsSchema.safeParse(data.public);
  return parsed.success ? parsed.data : null;
}
