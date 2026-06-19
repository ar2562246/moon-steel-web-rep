import type { MetadataRoute } from "next";
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
      url: `${siteUrl}/tesla`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/apple-design`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
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

  if (hasSupabaseServerEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const [projectRows, productRows] = await Promise.all([
        listPublishedProjectSlugs(supabase),
        listPublishedCatalogProductSlugs(supabase),
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
    } catch {
      // Keep default routes when Supabase is unavailable.
    }
  }

  return [...staticRoutes, ...catalogProductRoutes, ...projectRoutes];
}
