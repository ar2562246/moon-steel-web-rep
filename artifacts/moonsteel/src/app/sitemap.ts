import type { MetadataRoute } from "next";
import { listPublishedBlogSlugs } from "@/features/blog/queries";
import { getBlogPath } from "@/features/blog/types";
import { defaultCatalogProducts } from "@/features/catalog/defaultCatalog";
import { getCatalogProductPath } from "@/features/catalog/paths";
import { listPublishedCatalogProductSlugs } from "@/features/catalog/queries";
import { defaultProjects } from "@/features/projects/defaultProjects";
import { listPublishedProjectSlugs } from "@/features/projects/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moonsteelfab.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/materials`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/grease-traps`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/clients`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/collaboration/food-fusion`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  let projectRoutes: MetadataRoute.Sitemap = defaultProjects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  let catalogProductRoutes: MetadataRoute.Sitemap = defaultCatalogProducts.map((product) => ({
    url: `${siteUrl}${getCatalogProductPath(product.slug)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  let blogRoutes: MetadataRoute.Sitemap = [];

  if (hasSupabaseServerEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const [projectRows, productRows, blogRows] = await Promise.all([
        listPublishedProjectSlugs(supabase),
        listPublishedCatalogProductSlugs(supabase),
        listPublishedBlogSlugs(supabase),
      ]);

      if (projectRows.length > 0) {
        projectRoutes = projectRows.map((row) => ({
          url: `${siteUrl}/projects/${row.slug}`,
          lastModified: new Date(row.updated_at),
          changeFrequency: "monthly",
          priority: 0.7,
        }));
      }

      if (productRows.length > 0) {
        catalogProductRoutes = productRows.map((row) => ({
          url: `${siteUrl}${getCatalogProductPath(row.slug)}`,
          lastModified: new Date(row.updated_at),
          changeFrequency: "monthly",
          priority: 0.8,
        }));
      }

      blogRoutes = blogRows.map((row) => ({
        url: `${siteUrl}${getBlogPath(row.slug)}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: "monthly",
        priority: 0.65,
      }));
    } catch {
      // Keep default routes when Supabase is unavailable.
    }
  }

  return [...staticRoutes, ...catalogProductRoutes, ...projectRoutes, ...blogRoutes];
}
