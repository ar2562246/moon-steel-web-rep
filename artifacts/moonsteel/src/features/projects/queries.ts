import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeProject } from "@/features/projects/images";
import { PROJECT_SELECT, type Project } from "@/features/projects/types";

function normalizeRows(rows: Project[]) {
  return rows.map((row) => normalizeProject(row));
}

export async function listPublishedProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return normalizeRows((data ?? []) as Project[]);
}

export async function listAllProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return normalizeRows((data ?? []) as Project[]);
}

export async function getProjectBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeProject(data as Project) : null;
}

export async function listPublishedProjectSlugs(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("projects")
    .select("slug,updated_at")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as { slug: string; updated_at: string }[];
}
