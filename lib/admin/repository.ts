import { adminResources, adminTips, enquiries, mediaItems } from "@/data/admin-mock";
import { getAdminProject, listAdminProjects } from "@/lib/projects/repository";

// Phase 2B integration boundary: replace this object with a Firebase-backed
// implementation that returns the same typed shapes. UI components stay unchanged.
export const adminRepository = {
  getProjects: listAdminProjects,
  getProject: getAdminProject,
  getResources: async () => adminResources,
  getResource: async (id:string) => adminResources.find(item => item.id === id),
  getTips: async () => adminTips,
  getEnquiries: async () => enquiries,
  getEnquiry: async (id:string) => enquiries.find(item => item.id === id),
  getMedia: async () => mediaItems,
  getProjectMedia: async (projectId:string) => mediaItems.filter(item => item.projectId === projectId),
};
