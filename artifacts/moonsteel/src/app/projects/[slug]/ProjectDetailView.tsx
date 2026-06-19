"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectGallery } from "@/app/projects/[slug]/ProjectGallery";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getProjectImages } from "@/features/projects/images";
import type { Project } from "@/features/projects/types";

type ProjectDetailViewProps = {
  project: Project;
};

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const images = getProjectImages(project);

  return (
    <>
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <Link
            href="/#projects"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="space-y-6">
              <ProjectGallery images={images} title={project.title} />

              {project.description ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-display font-semibold text-foreground">Overview</h2>
                  <p className="text-base leading-relaxed text-muted-foreground">{project.description}</p>
                </div>
              ) : null}

              {project.specs ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-display font-semibold text-foreground">Specifications</h2>
                  <p className="font-mono text-sm text-foreground/90">{project.specs}</p>
                </div>
              ) : null}
            </div>

            <aside className="layer-1 space-y-6 rounded-2xl border border-border p-6">
              {project.industry ? (
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {project.industry}
                </span>
              ) : null}

              <div className="space-y-2">
                <h1 className="text-3xl font-display font-semibold text-foreground">{project.title}</h1>
                <p className="text-base text-muted-foreground">{project.scope}</p>
              </div>

              <dl className="space-y-4 text-sm">
                {project.location ? (
                  <div>
                    <dt className="mb-1 font-medium text-foreground">Location</dt>
                    <dd className="text-muted-foreground">{project.location}</dd>
                  </div>
                ) : null}
                {project.materials ? (
                  <div>
                    <dt className="mb-1 font-medium text-foreground">Materials</dt>
                    <dd className="text-muted-foreground">{project.materials}</dd>
                  </div>
                ) : null}
                {images.length > 1 ? (
                  <div>
                    <dt className="mb-1 font-medium text-foreground">Gallery</dt>
                    <dd className="text-muted-foreground">{images.length} installation photos</dd>
                  </div>
                ) : null}
              </dl>

              <Link
                href="/#contact"
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Request a similar installation
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
