import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import { getProjectImages, normalizeProject } from "@/features/projects/images";
import { listAllProjects, listPublishedProjects } from "@/features/projects/queries";
import type { Project } from "@/features/projects/types";

const BUCKET = "project-images";

function normalizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
}

function getStoragePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

function isStorageUrl(url: string) {
  return getStoragePathFromUrl(url) !== null;
}

async function removeStorageUrls(urls: string[]) {
  const supabase = createSupabaseBrowserClient();
  const paths = urls.map(getStoragePathFromUrl).filter((path): path is string => Boolean(path));
  if (paths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(paths);
}

export async function fetchProjects() {
  const supabase = createSupabaseBrowserClient();
  return listAllProjects(supabase);
}

type ProjectPayload = {
  title: string;
  slug: string;
  scope: string;
  industry: string;
  location?: string;
  materials?: string;
  description?: string;
  specs?: string;
  sort_order: number;
  published: boolean;
  image_urls: string[];
};

async function uploadProjectImages(files: File[]) {
  const supabase = createSupabaseBrowserClient();
  const uploaded: string[] = [];

  for (const file of files) {
    const filePath = `${crypto.randomUUID()}/${Date.now()}-${normalizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      await removeStorageUrls(uploaded);
      throw uploadError;
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    uploaded.push(publicData.publicUrl);
  }

  return uploaded;
}

function normalizeSlug(slug: string, title: string) {
  const next = slugify(slug || title);
  if (!next) throw new Error("A valid URL slug is required.");
  return next;
}

function buildImageUrls(existingUrls: string[], files: File[]) {
  const trimmed = existingUrls.map((url) => url.trim()).filter(Boolean);
  if (trimmed.length === 0 && files.length === 0) {
    throw new Error("At least one project image is required.");
  }
  return { trimmed, files };
}

function projectInsertPayload(payload: ProjectPayload, imageUrls: string[]) {
  return {
    title: payload.title.trim(),
    slug: normalizeSlug(payload.slug, payload.title),
    scope: payload.scope.trim(),
    industry: payload.industry.trim(),
    location: payload.location?.trim() || null,
    materials: payload.materials?.trim() || null,
    description: payload.description?.trim() || null,
    specs: payload.specs?.trim() || null,
    sort_order: payload.sort_order,
    published: payload.published,
    image_urls: imageUrls,
    image_url: imageUrls[0],
  };
}

export async function createProject(payload: ProjectPayload, files: File[] = []) {
  const supabase = createSupabaseBrowserClient();
  const { trimmed } = buildImageUrls(payload.image_urls, files);
  const uploaded = files.length > 0 ? await uploadProjectImages(files) : [];
  const imageUrls = [...trimmed, ...uploaded];

  if (imageUrls.length === 0) throw new Error("At least one project image is required.");

  const { data, error } = await supabase
    .from("projects")
    .insert(projectInsertPayload(payload, imageUrls))
    .select()
    .single();

  if (error) {
    await removeStorageUrls(uploaded);
    throw error;
  }

  return normalizeProject(data as Project);
}

type UpdatePayload = ProjectPayload & {
  id: string;
  previous_image_urls: string[];
};

export async function updateProject(payload: UpdatePayload, files: File[] = []) {
  const supabase = createSupabaseBrowserClient();
  const { trimmed } = buildImageUrls(payload.image_urls, files);
  const uploaded = files.length > 0 ? await uploadProjectImages(files) : [];
  const imageUrls = [...trimmed, ...uploaded];

  if (imageUrls.length === 0) throw new Error("At least one project image is required.");

  const removedStorageUrls = payload.previous_image_urls.filter(
    (url) => isStorageUrl(url) && !imageUrls.includes(url)
  );

  const { data, error } = await supabase
    .from("projects")
    .update(projectInsertPayload(payload, imageUrls))
    .eq("id", payload.id)
    .select()
    .single();

  if (error) {
    await removeStorageUrls(uploaded);
    throw error;
  }

  if (removedStorageUrls.length > 0) {
    await removeStorageUrls(removedStorageUrls);
  }

  return normalizeProject(data as Project);
}

export async function deleteProject(project: Project) {
  const supabase = createSupabaseBrowserClient();
  const storageUrls = getProjectImages(project).filter(isStorageUrl);
  await removeStorageUrls(storageUrls);

  const { error: dbError } = await supabase.from("projects").delete().eq("id", project.id);
  if (dbError) throw dbError;
}

export async function fetchPublishedProjects() {
  const supabase = createSupabaseBrowserClient();
  return listPublishedProjects(supabase);
}
