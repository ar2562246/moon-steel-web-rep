import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProjectsIndexView } from "@/app/projects/ProjectsIndexView";
import { defaultProjects } from "@/features/projects/defaultProjects";
import { listPublishedProjects } from "@/features/projects/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

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
  title: "Stainless Steel Fabrication Projects in Pakistan",
  description:
    "Explore Moon Steel commercial stainless steel fabrication projects — kitchens, hospitals, restaurants, and industrial installations.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/projects"),
    title: "Stainless Steel Fabrication Projects in Pakistan | Moon Steel Fabricators",
    description:
      "Commercial stainless steel fabrication portfolio — proven installations across Pakistan.",
  },
};

export default async function ProjectsPage() {
  const projects = await resolveProjects();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
        ])}
      />
      <ProjectsIndexView projects={projects} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
