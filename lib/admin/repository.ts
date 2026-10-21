import { getAdminEnquiry, listAdminEnquiries } from "@/lib/enquiries/repository";
import { listAdminMedia } from "@/lib/media/repository";
import { getAdminProject, listAdminProjects } from "@/lib/projects/repository";
import { getAdminResource, listAdminResources } from "@/lib/resources/repository";
import { listAdminTips } from "@/lib/tips/repository";
import { getFeaturedSelection } from "@/lib/featured/repository";

// Shared Firebase-backed repository facade used by protected administrator pages.
export const adminRepository = {
  getProjects: listAdminProjects,
  getProject: getAdminProject,
  getResources: listAdminResources,
  getResource: getAdminResource,
  getTips: listAdminTips,
  getFeaturedSelection,
  getEnquiries: listAdminEnquiries,
  getEnquiry: getAdminEnquiry,
  getMedia: listAdminMedia,
  getProjectMedia: async (projectId:string) => (await listAdminMedia()).filter(item => item.projectId === projectId),
};
