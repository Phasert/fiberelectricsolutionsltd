import { enquiries } from "@/data/admin-mock";
import { listAdminMedia } from "@/lib/media/repository";
import { getAdminProject, listAdminProjects } from "@/lib/projects/repository";
import { getAdminResource, listAdminResources } from "@/lib/resources/repository";
import { listAdminTips } from "@/lib/tips/repository";
import { getFeaturedSelection } from "@/lib/featured/repository";

// Phase 2B integration boundary: replace this object with a Firebase-backed
// implementation that returns the same typed shapes. UI components stay unchanged.
export const adminRepository = {
  getProjects: listAdminProjects,
  getProject: getAdminProject,
  getResources: listAdminResources,
  getResource: getAdminResource,
  getTips: listAdminTips,
  getFeaturedSelection,
  getEnquiries: async () => enquiries,
  getEnquiry: async (id:string) => enquiries.find(item => item.id === id),
  getMedia: listAdminMedia,
  getProjectMedia: async (projectId:string) => (await listAdminMedia()).filter(item => item.projectId === projectId),
};
