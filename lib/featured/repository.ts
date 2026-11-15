import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { featuredSelectionSchema, type FeaturedSelection } from "@/lib/featured/schemas";

const ref = () => getAdminFirestore().collection("featuredContent").doc("homepage");
const empty: FeaturedSelection = { projectId: "", resourceId: "", tipIds: [] };

export async function getFeaturedSelection(): Promise<FeaturedSelection> {
  const db = getAdminFirestore(), snapshot = await ref().get();
  if (!snapshot.exists) return empty;
  const parsed = featuredSelectionSchema.safeParse(snapshot.data());
  if (!parsed.success) return empty;
  const project = parsed.data.projectId?await db.collection("projects").doc(parsed.data.projectId).get():null;
  const resource = parsed.data.resourceId ? await db.collection("resources").doc(parsed.data.resourceId).get() : null;
  const tipDocs = await Promise.all(parsed.data.tipIds.map((id) => db.collection("tips").doc(id).get()));
  return {
    projectId: project?.exists && project.data()?.status === "Published" ? project.id : "",
    resourceId: resource?.exists && resource.data()?.status === "Published" ? resource.id : "",
    tipIds: tipDocs.filter((tip) => tip.exists && tip.data()?.enabled === true).map((tip) => tip.id),
  };
}

export async function saveFeaturedSelection(input: unknown, actorUid: string) {
  const value = featuredSelectionSchema.parse(input), db = getAdminFirestore();
  await db.runTransaction(async (transaction) => {
    const projectRef = value.projectId?db.collection("projects").doc(value.projectId):null;
    const resourceRef = value.resourceId ? db.collection("resources").doc(value.resourceId) : null;
    const tipRefs = value.tipIds.map((id) => db.collection("tips").doc(id));
    const [project, resource, ...tips] = await Promise.all([
      projectRef?transaction.get(projectRef):Promise.resolve(null),
      resourceRef ? transaction.get(resourceRef) : Promise.resolve(null),
      ...tipRefs.map((tipRef) => transaction.get(tipRef)),
    ]);
    if (!project?.exists || project.data()?.status !== "Published") throw new Error("INELIGIBLE_PROJECT");
    if (resourceRef && (!resource?.exists || resource.data()?.status !== "Published")) throw new Error("INELIGIBLE_RESOURCE");
    if (tips.some((tip) => !tip.exists || tip.data()?.enabled !== true)) throw new Error("INELIGIBLE_TIP");
    transaction.set(ref(), { ...value, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorUid }, { merge: true });
  });
}

export async function getActiveFeaturedSelection() { return getFeaturedSelection(); }
