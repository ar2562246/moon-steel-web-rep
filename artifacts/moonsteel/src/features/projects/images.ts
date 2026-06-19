import type { Project } from "@/features/projects/types";

export function getProjectImages(project: Pick<Project, "image_url" | "image_urls">): string[] {
  if (project.image_urls?.length) return project.image_urls;
  if (project.image_url) return [project.image_url];
  return [];
}

export function getProjectCoverImage(project: Pick<Project, "image_url" | "image_urls">): string {
  return getProjectImages(project)[0] ?? project.image_url ?? "";
}

export function normalizeProject<T extends Pick<Project, "image_url" | "image_urls">>(project: T): T & Project {
  const image_urls = getProjectImages(project);
  return {
    ...project,
    image_urls,
    image_url: image_urls[0] ?? project.image_url,
  } as T & Project;
}

export function toAbsoluteImageUrl(url: string, siteUrl: string): string {
  return url.startsWith("http") ? url : `${siteUrl}${url}`;
}
