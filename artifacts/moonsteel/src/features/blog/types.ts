import { getCatalogProductCover } from "@/features/catalog/paths";
import type { CatalogProduct } from "@/features/catalog/types";

export const BLOG_SELECT = `
  id,slug,title,excerpt,body,cover_image_url,published,published_at,sort_order,created_at,updated_at,
  blog_products (
    product_id,
    sort_order,
    catalog_products (
      image_url,
      image_urls,
      published
    )
  )
`;

export type BlogLinkedProductImages = {
  image_url: string;
  image_urls?: string[] | null;
  published: boolean;
};

export type BlogProductLink = {
  product_id: string;
  sort_order: number;
  catalog_products?: BlogLinkedProductImages | BlogLinkedProductImages[] | null;
};

export type BlogPostRow = {
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
  blog_products?: BlogProductLink[] | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  /** First linked published product image when cover_image_url is empty. */
  fallback_cover_image_url: string;
  product_ids: string[];
  published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function extractLinkedProduct(link: BlogProductLink): BlogLinkedProductImages | null {
  const raw = link.catalog_products;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

function coverFromLinkedProducts(links: BlogProductLink[]): string {
  for (const link of links) {
    const product = extractLinkedProduct(link);
    if (!product || product.published === false) continue;
    const cover = getCatalogProductCover({
      image_url: product.image_url,
      image_urls: product.image_urls ?? undefined,
    });
    if (cover) return cover;
  }
  return "";
}

export function normalizeBlogPost(row: BlogPostRow): BlogPost {
  const links = [...(row.blog_products ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const { blog_products: _links, ...rest } = row;
  return {
    ...rest,
    product_ids: links.map((link) => link.product_id),
    fallback_cover_image_url: coverFromLinkedProducts(links),
  };
}

export function getBlogCoverImageUrl(
  post: Pick<BlogPost, "cover_image_url" | "fallback_cover_image_url">,
  linkedProducts: Pick<CatalogProduct, "image_url" | "image_urls">[] = []
): string {
  const own = post.cover_image_url?.trim();
  if (own) return own;

  for (const product of linkedProducts) {
    const cover = getCatalogProductCover(product);
    if (cover) return cover;
  }

  return post.fallback_cover_image_url?.trim() || "";
}

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
