import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BLOG_SELECT, type BlogPost } from "@/features/blog/types";

const BUCKET = "blog-covers";

function normalizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
}

function getStoragePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function fetchBlogs() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(BLOG_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

async function uploadCover(file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const filePath = `${crypto.randomUUID()}/${Date.now()}-${normalizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { upsert: false, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return publicData.publicUrl;
}

async function removeCoverIfStored(url: string | null | undefined) {
  if (!url) return;
  const path = getStoragePathFromUrl(url);
  if (!path) return;
  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

export type BlogWritePayload = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  published: boolean;
  published_at: string | null;
  sort_order: number;
  coverFile?: File | null;
};

export async function createBlog(payload: BlogWritePayload) {
  const supabase = createSupabaseBrowserClient();
  let coverUrl = payload.cover_image_url.trim();

  if (payload.coverFile) {
    coverUrl = await uploadCover(payload.coverFile);
  }

  const publishedAt =
    payload.published && !payload.published_at
      ? new Date().toISOString()
      : payload.published
        ? payload.published_at
        : null;

  const { data, error } = await supabase
    .from("blogs")
    .insert({
      slug: payload.slug,
      title: payload.title,
      excerpt: payload.excerpt,
      body: payload.body,
      cover_image_url: coverUrl,
      published: payload.published,
      published_at: publishedAt,
      sort_order: payload.sort_order,
    })
    .select(BLOG_SELECT)
    .single();

  if (error) {
    if (payload.coverFile && coverUrl) {
      await removeCoverIfStored(coverUrl);
    }
    throw error;
  }

  return data as BlogPost;
}

export async function updateBlog(payload: BlogWritePayload & { id: string; previous_cover_url: string }) {
  const supabase = createSupabaseBrowserClient();
  let coverUrl = payload.cover_image_url.trim();

  if (payload.coverFile) {
    coverUrl = await uploadCover(payload.coverFile);
  }

  const publishedAt =
    payload.published && !payload.published_at
      ? new Date().toISOString()
      : payload.published
        ? payload.published_at
        : null;

  const { data, error } = await supabase
    .from("blogs")
    .update({
      slug: payload.slug,
      title: payload.title,
      excerpt: payload.excerpt,
      body: payload.body,
      cover_image_url: coverUrl,
      published: payload.published,
      published_at: publishedAt,
      sort_order: payload.sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)
    .select(BLOG_SELECT)
    .single();

  if (error) {
    if (payload.coverFile && coverUrl) {
      await removeCoverIfStored(coverUrl);
    }
    throw error;
  }

  if (
    payload.coverFile &&
    payload.previous_cover_url &&
    payload.previous_cover_url !== coverUrl
  ) {
    await removeCoverIfStored(payload.previous_cover_url);
  }

  return data as BlogPost;
}

export async function deleteBlog(post: BlogPost) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("blogs").delete().eq("id", post.id);
  if (error) throw error;
  await removeCoverIfStored(post.cover_image_url);
}
