"use client";

import Link from "next/link";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { CmsImage } from "@/components/ui/CmsImage";
import { getProjectCoverImage } from "@/features/projects/images";
import type { Project } from "@/features/projects/types";

type ProjectsProps = {
  initialProjects: Project[];
};

export function Projects({ initialProjects }: ProjectsProps) {
  return (
    <section id="projects" className="layer-1 py-24 border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="apple-section-title mb-6 section-title-accent">Proven Installations.</h2>
          <p className="apple-section-copy">
            Our fabrication speaks for itself. Explore recent high-performance stainless steel
            installations across various rigorous environments.
          </p>
        </div>

        <SectionReveal className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group block cursor-pointer"
            >
              <div className="layer-2 relative mb-4 aspect-[4/3] overflow-hidden rounded-xl">
                <CmsImage
                  src={getProjectCoverImage(project)}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover md:transition-transform md:duration-700 md:group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300" />
                {project.industry ? (
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                    {project.industry}
                  </span>
                ) : null}
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground">{project.scope}</p>
            </Link>
          ))}
        </SectionReveal>

        <div className="mt-12 text-center">
          <Link
            href="/projects"
            className="inline-flex min-h-10 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
          >
            View all projects
          </Link>
        </div>
      </div>
    </section>
  );
}
