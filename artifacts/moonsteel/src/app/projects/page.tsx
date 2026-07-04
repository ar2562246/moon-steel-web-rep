import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProjectsIndexView } from "@/app/projects/ProjectsIndexView";
import { defaultProjects } from "@/features/projects/defaultProjects";
import { listPublishedProjects } from "@/features/projects/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moonsteelfab.com";

async function resolveProjects() {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const projects = await listPublishedProjects(supabase);
      if (projects.length > 0) return projects;
    } catch {
      // Fall through to defaults.
    }
  }

  return defaultProjects;
}

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore Moon Steel commercial stainless steel fabrication projects — kitchens, hospitals, restaurants, and industrial installations.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/projects`,
    title: "Projects | Moon Steel",
    description:
      "Commercial stainless steel fabrication portfolio — proven installations across Pakistan.",
  },
};

export default async function ProjectsPage() {
  const projects = await resolveProjects();

  return (
    <>
      <ProjectsIndexView projects={projects} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
