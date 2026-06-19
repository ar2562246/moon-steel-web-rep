"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slugify";
import { getProjectCoverImage, getProjectImages } from "@/features/projects/images";
import { useProjects } from "@/features/admin/hooks/useProjects";
import type { Project } from "@/features/projects/types";

const initialForm = {
  title: "",
  slug: "",
  scope: "",
  industry: "",
  location: "",
  materials: "",
  description: "",
  specs: "",
  sort_order: 100,
  published: true,
};

type GalleryEntry =
  | { id: string; kind: "url"; url: string }
  | { id: string; kind: "file"; file: File; preview: string };

function newId() {
  return crypto.randomUUID();
}

export function ProjectsTab() {
  const { projects, isLoading, isSaving, error, create, update, remove } = useProjects();
  const [form, setForm] = useState(initialForm);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    const fileEntries = gallery.filter((entry): entry is Extract<GalleryEntry, { kind: "file" }> => entry.kind === "file");
    return () => {
      fileEntries.forEach((entry) => URL.revokeObjectURL(entry.preview));
    };
  }, [gallery]);

  const canSubmit = useMemo(
    () =>
      form.title.trim().length > 1 &&
      form.scope.trim().length > 1 &&
      form.industry.trim().length > 1 &&
      gallery.length > 0,
    [form, gallery.length]
  );

  const onPickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;

    setGallery((current) => [
      ...current,
      ...files.map((file) => ({
        id: newId(),
        kind: "file" as const,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    setFileInputKey((key) => key + 1);
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setGallery((current) => [...current, { id: newId(), kind: "url", url }]);
    setImageUrlInput("");
  };

  const removeGalleryEntry = (id: string) => {
    setGallery((current) => {
      const entry = current.find((item) => item.id === id);
      if (entry?.kind === "file") URL.revokeObjectURL(entry.preview);
      return current.filter((item) => item.id !== id);
    });
  };

  const setCover = (id: string) => {
    setGallery((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index <= 0) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingProject(null);
    setGallery([]);
    setImageUrlInput("");
    setSlugTouched(false);
    setFileInputKey((key) => key + 1);
  };

  const startCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const startEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      slug: project.slug,
      scope: project.scope,
      industry: project.industry,
      location: project.location ?? "",
      materials: project.materials ?? "",
      description: project.description ?? "",
      specs: project.specs ?? "",
      sort_order: project.sort_order,
      published: project.published,
    });
    setGallery(
      getProjectImages(project).map((url) => ({
        id: newId(),
        kind: "url" as const,
        url,
      }))
    );
    setImageUrlInput("");
    setSlugTouched(true);
    setFileInputKey((key) => key + 1);
    setIsDialogOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const image_urls: string[] = [];
    const files: File[] = [];
    for (const entry of gallery) {
      if (entry.kind === "url") image_urls.push(entry.url);
      else files.push(entry.file);
    }

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      scope: form.scope.trim(),
      industry: form.industry.trim(),
      location: form.location.trim() || undefined,
      materials: form.materials.trim() || undefined,
      description: form.description.trim() || undefined,
      specs: form.specs.trim() || undefined,
      sort_order: Number(form.sort_order) || 100,
      published: form.published,
      image_urls,
    };

    const ok = editingProject
      ? await update(
          {
            ...payload,
            id: editingProject.id,
            previous_image_urls: getProjectImages(editingProject),
          },
          files
        )
      : await create(payload, files);

    if (!ok) return;
    resetForm();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="layer-1">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Installation Projects</CardTitle>
            <Button type="button" onClick={startCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Manage homepage project cards and detail pages at{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">/projects/[slug]</code>. The first
            image is used as the homepage cover.
          </p>

          {isLoading ? <p className="text-sm text-muted-foreground">Loading projects...</p> : null}
          {!isLoading && projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : null}

          {!isLoading && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="layer-2 flex flex-col gap-4 rounded-lg p-4 md:flex-row md:items-start"
                >
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getProjectCoverImage(project)}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">{project.title}</p>
                      {project.industry ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {project.industry}
                        </span>
                      ) : null}
                      {getProjectImages(project).length > 1 ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {getProjectImages(project).length} photos
                        </span>
                      ) : null}
                      {!project.published ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Draft
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{project.scope}</p>
                    <p className="text-xs font-mono text-muted-foreground">/{project.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" type="button" asChild>
                      <Link href={`/projects/${project.slug}`} target="_blank">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => startEdit(project)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => void remove(project)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Add Project"}</DialogTitle>
            <DialogDescription>
              Add multiple photos for the project detail gallery. The first image is the homepage cover
              and social preview.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((current) => ({
                  ...current,
                  title,
                  slug: slugTouched ? current.slug : slugify(title),
                }));
              }}
              className="md:col-span-2"
            />
            <Input
              placeholder="URL slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((current) => ({ ...current, slug: e.target.value }));
              }}
            />
            <Input
              placeholder="Industry tag"
              value={form.industry}
              onChange={(e) => setForm((current) => ({ ...current, industry: e.target.value }))}
            />
            <Input
              placeholder="Scope (homepage subtitle)"
              value={form.scope}
              onChange={(e) => setForm((current) => ({ ...current, scope: e.target.value }))}
              className="md:col-span-2"
            />
            <Input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
            />
            <Input
              placeholder="Materials used"
              value={form.materials}
              onChange={(e) => setForm((current) => ({ ...current, materials: e.target.value }))}
            />
            <textarea
              className="layer-1 rounded-md px-3 py-2 text-sm md:col-span-2"
              placeholder="Description (detail page)"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
            />
            <textarea
              className="layer-1 rounded-md px-3 py-2 text-sm md:col-span-2"
              placeholder="Specs (detail page)"
              rows={2}
              value={form.specs}
              onChange={(e) => setForm((current) => ({ ...current, specs: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Sort order"
              value={form.sort_order}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  sort_order: Number(e.target.value) || 0,
                }))
              }
            />
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((current) => ({ ...current, published: e.target.checked }))
                }
              />
              Published on site
            </label>

            <div className="space-y-3 md:col-span-2">
              <p className="text-sm font-medium text-foreground">Project photos</p>

              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((entry, index) => {
                    const src = entry.kind === "url" ? entry.url : entry.preview;
                    return (
                      <div key={entry.id} className="layer-2 relative overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                        {index === 0 ? (
                          <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                            Cover
                          </span>
                        ) : null}
                        <div className="absolute right-2 top-2 flex gap-1">
                          {index > 0 ? (
                            <button
                              type="button"
                              className="rounded bg-background/90 p-1 text-foreground backdrop-blur-sm"
                              onClick={() => setCover(entry.id)}
                              aria-label="Set as cover"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="rounded bg-background/90 p-1 text-foreground backdrop-blur-sm"
                            onClick={() => removeGalleryEntry(entry.id)}
                            aria-label="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Add at least one photo.</p>
              )}

              <input
                key={`project-files-${fileInputKey}`}
                type="file"
                accept="image/*"
                multiple
                onChange={onPickFiles}
                className="layer-1 w-full rounded-md px-3 py-2 text-sm"
              />

              <div className="flex gap-2">
                <Input
                  placeholder="Or image URL (e.g. /images/projects/example.png)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addImageUrl}>
                  Add URL
                </Button>
              </div>
            </div>

            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isSaving}>
                {isSaving ? "Saving..." : editingProject ? "Save Changes" : "Add Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
