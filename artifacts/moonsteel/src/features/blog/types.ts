export const BLOG_SELECT =
  "id,slug,title,excerpt,body,cover_image_url,published,published_at,sort_order,created_at,updated_at";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function getBlogPath(slug: string) {
  return `/blog/${slug}`;
}

export function formatBlogDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
