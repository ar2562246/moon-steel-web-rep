"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slugify";
import { AdminImagePreview } from "@/features/admin/components/AdminImagePreview";
import {
  AdminMasterDetail,
  AdminSidebarCard,
  AdminSidebarEmpty,
  AdminSidebarSkeleton,
  AdminSidebarThumb,
  adminSidebarBodyClass,
  adminSidebarMetaClass,
  adminSidebarMutedClass,
  adminSidebarTitleClass,
} from "@/features/admin/components/AdminMasterDetail";
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
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [slugTouched, setSlugTouched] = useState(false);
  const galleryRef = useRef(gallery);
  galleryRef.current = gallery;

  useEffect(() => {
    return () => {
      galleryRef.current.forEach((entry) => {
        if (entry.kind === "file") URL.revokeObjectURL(entry.preview);
      });
    };
  }, []);

  const canSubmit = useMemo(
    () =>
      form.title.trim().length > 1 &&
      form.scope.trim().length > 1 &&
      form.industry.trim().length > 1 &&
      gallery.length > 0,
    [form, gallery.length]
  );

  const revokeGalleryFiles = () => {
    galleryRef.current.forEach((entry) => {
      if (entry.kind === "file") URL.revokeObjectURL(entry.preview);
    });
  };

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

  const closeEditor = () => {
    revokeGalleryFiles();
    setForm(initialForm);
    setEditingProject(null);
    setGallery([]);
    setImageUrlInput("");
    setSlugTouched(false);
    setFileInputKey((key) => key + 1);
    setIsEditorOpen(false);
  };

  const startCreate = () => {
    revokeGalleryFiles();
    setForm(initialForm);
    setEditingProject(null);
    setGallery([]);
    setImageUrlInput("");
    setSlugTouched(false);
    setFileInputKey((key) => key + 1);
    setIsEditorOpen(true);
  };

  const startEdit = (project: Project, force = false) => {
    if (!force && editingProject?.id === project.id && isEditorOpen) return;
    revokeGalleryFiles();
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
    setIsEditorOpen(true);
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

    const saved = editingProject
      ? await update(
          {
            ...payload,
            id: editingProject.id,
            previous_image_urls: getProjectImages(editingProject),
          },
          files
        )
      : await create(payload, files);

    if (!saved) return;
    startEdit(saved, true);
  };

  const onDelete = async (project: Project) => {
    const ok = await remove(project);
    if (!ok) return;
    if (editingProject?.id === project.id) closeEditor();
  };

  return (
    <AdminMasterDetail
      title="Installation Projects"
      description={
        <>
          Manage homepage project cards and detail pages at{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/projects/[slug]</code>. The first
          image is the homepage cover.
        </>
      }
      addLabel="Add Project"
      onAdd={startCreate}
      onBack={closeEditor}
      formId="admin-project-form"
      canSubmit={canSubmit}
      isSaving={isSaving}
      submitLabel={editingProject ? "Save Changes" : "Add Project"}
      error={error}
      sidebar={
        isLoading ? (
          <AdminSidebarSkeleton withImage />
        ) : projects.length === 0 ? (
          <AdminSidebarEmpty>No projects yet.</AdminSidebarEmpty>
        ) : (
          projects.map((project) => {
            const selected = isEditorOpen && editingProject?.id === project.id;
            const photoCount = getProjectImages(project).length;
            return (
              <AdminSidebarCard
                key={project.id}
                selected={selected}
                compact
                onClick={() => startEdit(project)}
              >
                <AdminSidebarThumb src={getProjectCoverImage(project)} alt={project.title} />
                <div className={adminSidebarBodyClass()}>
                  <p className={adminSidebarTitleClass(selected)}>{project.title}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.industry ? (
                      <span className={adminSidebarMetaClass(selected)}>{project.industry}</span>
                    ) : null}
                    {project.location ? (
                      <span className={adminSidebarMetaClass(selected)}>{project.location}</span>
                    ) : null}
                  </div>
                  <p className={adminSidebarMutedClass(selected)}>
                    {photoCount} {photoCount === 1 ? "photo" : "photos"}
                    {project.scope ? ` · ${project.scope}` : ""}
                  </p>
                  {!project.published ? <p className={adminSidebarMutedClass(selected)}>Draft</p> : null}
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={!isEditorOpen ? "Project detail" : editingProject ? "Edit Project" : "Add Project"}
      detailDescription={
        !isEditorOpen
          ? "Choose a project from the sidebar, or add a new one."
          : "Add photos for the project gallery. The first image is the homepage cover."
      }
      detailActions={
        isEditorOpen && editingProject ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" type="button" asChild>
              <Link href={`/projects/${editingProject.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                View
              </Link>
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={() => void onDelete(editingProject)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        ) : null
      }
      isEditorOpen={isEditorOpen}
    >
      <form id="admin-project-form" onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
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
            onChange={(e) => setForm((current) => ({ ...current, published: e.target.checked }))}
          />
          Published on site
        </label>

        <div className="space-y-3 md:col-span-2">
          <p className="text-sm font-medium text-foreground">Project photos</p>
          <p className="text-xs text-muted-foreground">
            Preview pixel size before saving. First image is the cover used on the site.
          </p>
          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((entry, index) => {
                const src = entry.kind === "url" ? entry.url : entry.preview;
                return (
                  <div key={entry.id} className="layer-2 relative overflow-hidden rounded-lg">
                    <AdminImagePreview
                      src={src}
                      file={entry.kind === "file" ? entry.file : null}
                      className="aspect-[4/3] w-full"
                      imgClassName="object-cover"
                    />
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
      </form>
    </AdminMasterDetail>
  );
}
