import type { Project, ProjectImage } from "@/types/content";

export function isPublishedProject(project: Project) {
  const includeDemoContent = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_DEMO_CONTENT === "true";
  return project.status === "approved" && project.publicationStatus !== "Draft" && (includeDemoContent || !project.demo);
}

export function getPublishedProjects(projects: Project[]) {
  return projects.filter(isPublishedProject);
}

export function getProjectImages(project: Project): ProjectImage[] {
  const gallery = project.gallery.map((image, index) => typeof image === "string"
    ? { src: image, alt: `${project.title} project photograph ${index + 1}` }
    : { ...image, alt: image.alt || `${project.title} project photograph ${index + 1}` });

  if (!gallery.some((image) => image.src === project.featuredImage)) {
    gallery.unshift({ src: project.featuredImage, alt: project.featuredImageAlt || `${project.title} featured photograph` });
  }

  return gallery;
}

export function categoryLabel(category: Project["category"]) {
  return category === "Fiber" ? "Fibre Optic" : category;
}
