import type { SupabaseClient } from "@supabase/supabase-js";
import { BLOG_SELECT, normalizeBlogPost, type BlogPost, type BlogPostRow } from "@/features/blog/types";

export async function listPublishedBlogs(supabase: SupabaseClient): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blogs")
    .select(BLOG_SELECT)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as BlogPostRow[]).map(normalizeBlogPost);
}

export async function getPublishedBlogBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blogs")
    .select(BLOG_SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeBlogPost(data as BlogPostRow) : null;
}

export async function listPublishedBlogSlugs(
  supabase: SupabaseClient,
): Promise<Array<{ slug: string; updated_at: string }>> {
  const { data, error } = await supabase
    .from("blogs")
    .select("slug,updated_at")
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as Array<{ slug: string; updated_at: string }>;
}
