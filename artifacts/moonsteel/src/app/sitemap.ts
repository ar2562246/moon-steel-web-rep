import type { MetadataRoute } from "next";
import { listPublishedBlogSlugs } from "@/features/blog/queries";
import { getBlogPath } from "@/features/blog/types";
import { defaultCatalogProducts } from "@/features/catalog/defaultCatalog";
import { getCatalogProductPath } from "@/features/catalog/paths";
import { listPublishedCatalogProductSlugs } from "@/features/catalog/queries";
import { defaultProjects } from "@/features/projects/defaultProjects";
import { listPublishedProjectSlugs } from "@/features/projects/queries";
import { absoluteUrl } from "@/lib/site";
import { createSupabasePublicClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/products"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/materials"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/process"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/grease-traps"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/projects"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/clients"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/data-deletion"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/collaboration/food-fusion"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  let projectRoutes: MetadataRoute.Sitemap = defaultProjects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  let catalogProductRoutes: MetadataRoute.Sitemap = defaultCatalogProducts.map((product) => ({
    url: absoluteUrl(getCatalogProductPath(product.slug)),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  let blogRoutes: MetadataRoute.Sitemap = [];

  if (hasSupabaseServerEnv()) {
    try {
      const supabase = createSupabasePublicClient();
      const [projectRows, productRows, blogRows] = await Promise.all([
        listPublishedProjectSlugs(supabase),
        listPublishedCatalogProductSlugs(supabase),
        listPublishedBlogSlugs(supabase),
      ]);

      if (projectRows.length > 0) {
        projectRoutes = projectRows.map((row) => ({
          url: absoluteUrl(`/projects/${row.slug}`),
          lastModified: new Date(row.updated_at),
          changeFrequency: "monthly",
          priority: 0.7,
        }));
      }

      if (productRows.length > 0) {
        catalogProductRoutes = productRows.map((row) => ({
          url: absoluteUrl(getCatalogProductPath(row.slug)),
          lastModified: new Date(row.updated_at),
          changeFrequency: "monthly",
          priority: 0.8,
        }));
      }

      blogRoutes = blogRows.map((row) => ({
        url: absoluteUrl(getBlogPath(row.slug)),
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
