"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminEditableImage } from "@/features/admin/components/AdminEditableImage";
import {
  AdminDetailSkeleton,
  AdminMasterDetail,
  AdminSidebarCard,
  AdminSidebarEmpty,
  AdminSidebarSkeleton,
  AdminSidebarThumb,
  adminSidebarBodyClass,
  adminSidebarMutedClass,
  adminSidebarTitleClass,
} from "@/features/admin/components/AdminMasterDetail";
import { useBlogs } from "@/features/admin/hooks/useBlogs";
import { formatBlogDate, getBlogPath, type BlogPost } from "@/features/blog/types";
import { slugify } from "@/lib/slugify";
import { useToast } from "@/hooks/use-toast";

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_image_url: "",
  sort_order: 100,
  published: false,
  published_at: "",
};

export function BlogsTab() {
  const { toast } = useToast();
  const { posts, isLoading, isSaving, error, create, update, remove } = useBlogs();
  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [previousCoverUrl, setPreviousCoverUrl] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : ""),
    [coverFile]
  );

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const canSubmit = useMemo(
    () => form.title.trim().length > 2 && form.slug.trim().length > 1 && form.body.trim().length > 10,
    [form]
  );

  const closeEditor = () => {
    setEditingPost(null);
    setForm(initialForm);
    setCoverFile(null);
    setPreviousCoverUrl("");
    setSlugTouched(false);
    setIsEditorOpen(false);
  };

  const startCreate = () => {
    setEditingPost(null);
    setForm(initialForm);
    setCoverFile(null);
    setPreviousCoverUrl("");
    setSlugTouched(false);
    setIsEditorOpen(true);
  };

  const startEdit = (row: BlogPost, force = false) => {
    if (!force && editingPost?.id === row.id && isEditorOpen) return;
    setEditingPost(row);
    setPreviousCoverUrl(row.cover_image_url);
    setCoverFile(null);
    setSlugTouched(true);
    setForm({
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      body: row.body,
      cover_image_url: row.cover_image_url,
      sort_order: row.sort_order,
      published: row.published,
      published_at: row.published_at ? row.published_at.slice(0, 10) : "",
    });
    setIsEditorOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug.trim()),
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      cover_image_url: form.cover_image_url.trim(),
      sort_order: Number(form.sort_order) || 100,
      published: form.published,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
      coverFile,
    };

    const saved = editingPost
      ? await update({
          id: editingPost.id,
          previous_cover_url: previousCoverUrl,
          ...payload,
        })
      : await create(payload);

    if (!saved) return;
    startEdit(saved, true);
  };

  const onDelete = async (post: BlogPost) => {
    const ok = await remove(post);
    if (!ok) return;
    if (editingPost?.id === post.id) closeEditor();
  };

  return (
    <AdminMasterDetail
      title="Blog posts"
      description={
        <>
          Published posts appear on <code className="rounded bg-muted px-1 py-0.5 text-xs">/blog</code>.
          Body supports plain text with line breaks.
        </>
      }
      addLabel="Add post"
      onAdd={startCreate}
      onBack={closeEditor}
      formId="admin-blog-form"
      canSubmit={canSubmit}
      isSaving={isSaving}
      submitLabel={editingPost ? "Save changes" : "Add post"}
      error={error}
      sidebar={
        isLoading ? (
          <AdminSidebarSkeleton withImage />
        ) : posts.length === 0 ? (
          <AdminSidebarEmpty>No blog posts yet.</AdminSidebarEmpty>
        ) : (
          posts.map((item) => {
            const selected = isEditorOpen && editingPost?.id === item.id;
            const dateLabel = formatBlogDate(item.published_at ?? item.created_at);
            return (
              <AdminSidebarCard
                key={item.id}
                selected={selected}
                compact
                onClick={() => startEdit(item)}
              >
                <AdminSidebarThumb src={item.cover_image_url} alt={item.title} />
                <div className={adminSidebarBodyClass()}>
                  <p className={adminSidebarTitleClass(selected)}>{item.title}</p>
                  {item.excerpt ? (
                    <p className={adminSidebarMutedClass(selected)}>{item.excerpt}</p>
                  ) : null}
                  <p className={adminSidebarMutedClass(selected)}>
                    {item.published ? "Published" : "Draft"}
                    {dateLabel ? ` · ${dateLabel}` : ""}
                  </p>
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={!isEditorOpen ? "Post detail" : editingPost ? "Edit blog post" : "Add blog post"}
      detailDescription={
        !isEditorOpen
          ? "Choose a post from the sidebar, or add a new one."
          : "Title, slug, excerpt, body, and optional cover image."
      }
      detailActions={
        isEditorOpen && editingPost ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" type="button" asChild>
              <a href={getBlogPath(editingPost.slug)} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                View
              </a>
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={() => void onDelete(editingPost)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        ) : null
      }
      isEditorOpen={isEditorOpen}
      skeleton={<AdminDetailSkeleton withImage />}
    >
      <form id="admin-blog-form" onSubmit={onSubmit} className="grid gap-4">
        <input
          className="layer-1 rounded-md px-3 py-2 text-sm"
          placeholder="Title"
          value={form.title}
          onChange={(e) => {
            const title = e.target.value;
            setForm((f) => ({
              ...f,
              title,
              slug: slugTouched ? f.slug : slugify(title),
            }));
          }}
        />
        <input
          className="layer-1 rounded-md px-3 py-2 font-mono text-sm"
          placeholder="slug-for-url"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setForm((f) => ({ ...f, slug: e.target.value }));
          }}
        />
        <textarea
          className="layer-1 rounded-md px-3 py-2 text-sm"
          placeholder="Short excerpt (shown on blog cards)"
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
        />
        <textarea
          className="layer-1 rounded-md px-3 py-2 text-sm"
          placeholder="Full article body"
          rows={10}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="layer-1 rounded-md px-3 py-2 text-sm"
            placeholder="Cover image URL (optional)"
            value={form.cover_image_url}
            onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
          />
          <input
            type="file"
            accept="image/*"
            className="layer-1 rounded-md px-3 py-2 text-sm"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {coverPreview || form.cover_image_url ? (
          <AdminEditableImage
            src={coverPreview || form.cover_image_url}
            file={coverFile}
            fileName={coverFile?.name || "blog-cover.jpg"}
            alt="Blog cover"
            className="aspect-[16/10] max-h-56 w-full rounded-md bg-muted"
            imgClassName="object-cover"
            onEdited={(file) => {
              setCoverFile(file);
              toast({
                title: "Cover edited",
                description: "Save the post to keep this cover image.",
              });
            }}
          />
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="number"
            className="layer-1 rounded-md px-3 py-2 text-sm"
            placeholder="Sort order"
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))}
          />
          <input
            type="date"
            className="layer-1 rounded-md px-3 py-2 text-sm"
            value={form.published_at}
            onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          Published on /blog
        </label>
      </form>
    </AdminMasterDetail>
  );
}
