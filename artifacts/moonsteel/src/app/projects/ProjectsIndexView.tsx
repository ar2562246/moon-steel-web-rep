"use client";

import Link from "next/link";
import { CmsImage } from "@/components/ui/CmsImage";
import { getProjectCoverImage } from "@/features/projects/images";
import type { Project } from "@/features/projects/types";

type ProjectsIndexViewProps = {
  projects: Project[];
};

export function ProjectsIndexView({ projects }: ProjectsIndexViewProps) {
  return (
    <main className="layer-0 pb-12 pt-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="apple-section-title mb-6 section-title-accent">Our Projects</h1>
          <p className="apple-section-copy">
            Commercial stainless steel installations across hospitality, healthcare, food service,
            and industrial environments.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group layer-1 block overflow-hidden rounded-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <CmsImage
                  src={getProjectCoverImage(project)}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {project.industry ? (
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                    {project.industry}
                  </span>
                ) : null}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-display font-semibold text-foreground group-hover:text-primary">
                  {project.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{project.scope}</p>
                {project.location ? (
                  <p className="mt-2 text-xs text-muted-foreground">{project.location}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
