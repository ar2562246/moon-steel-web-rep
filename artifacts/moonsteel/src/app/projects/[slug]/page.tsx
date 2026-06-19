import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/app/projects/[slug]/ProjectDetailView";
import { getDefaultProjectBySlug } from "@/features/projects/defaultProjects";
import { getProjectImages, normalizeProject, toAbsoluteImageUrl } from "@/features/projects/images";
import { getProjectBySlug, listPublishedProjectSlugs } from "@/features/projects/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moonsteelfab.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveProject(slug: string) {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const project = await getProjectBySlug(supabase, slug);
      if (project) return project;
    } catch {
      // Fall through to static defaults when Supabase is unavailable.
    }
  }

  const fallback = getDefaultProjectBySlug(slug);
  return fallback ? normalizeProject(fallback) : null;
}

export async function generateStaticParams() {
  if (!hasSupabaseServerEnv()) {
    const { defaultProjects } = await import("@/features/projects/defaultProjects");
    return defaultProjects.map((project) => ({ slug: project.slug }));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const rows = await listPublishedProjectSlugs(supabase);
    if (rows.length > 0) {
      return rows.map((row) => ({ slug: row.slug }));
    }
  } catch {
    // Fall back to defaults below.
  }

  const { defaultProjects } = await import("@/features/projects/defaultProjects");
  return defaultProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await resolveProject(slug);

  if (!project) {
    return {
      title: "Project Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    project.description ??
    `${project.title} — ${project.scope}. Commercial stainless steel fabrication by Moon Steel.`;

  const images = getProjectImages(project);
  const cover = images[0] ?? project.image_url;
  const ogImages = images.map((url) => ({
    url: toAbsoluteImageUrl(url, siteUrl),
    alt: project.title,
  }));

  return {
    title: project.title,
    description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      type: "article",
      url: `${siteUrl}/projects/${project.slug}`,
      title: project.title,
      description,
      images: ogImages.length > 0 ? ogImages : [{ url: toAbsoluteImageUrl(cover, siteUrl), alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [toAbsoluteImageUrl(cover, siteUrl)],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await resolveProject(slug);

  if (!project) notFound();

  const images = getProjectImages(project).map((url) => toAbsoluteImageUrl(url, siteUrl));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description ?? project.scope,
    image: images.length > 0 ? images : undefined,
    about: project.industry,
    locationCreated: project.location ?? undefined,
    material: project.materials ?? undefined,
    provider: {
      "@type": "LocalBusiness",
      name: "Moon Steel",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetailView project={project} />
    </>
  );
}
