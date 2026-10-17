export type AdminRole = "admin";

export interface Administrator {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  active: boolean;
}

export interface AdminDashboardContent {
  id: string;
  title: string;
  summary: string;
  status: "draft" | "published";
  updatedAt: string;
}
