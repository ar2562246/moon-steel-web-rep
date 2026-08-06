"use client";

import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { useBlogs } from "@/features/admin/hooks/useBlogs";
import { formatBlogDate, getBlogPath } from "@/features/blog/types";
import { slugify } from "@/lib/slugify";

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
  const { posts, isLoading, isSaving, error, create, update, remove } = useBlogs();
  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previousCoverUrl, setPreviousCoverUrl] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canSubmit = useMemo(
    () => form.title.trim().length > 2 && form.slug.trim().length > 1 && form.body.trim().length > 10,
    [form],
  );

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

    try {
      if (editingId) {
        await update({
          id: editingId,
          previous_cover_url: previousCoverUrl,
          ...payload,
        });
      } else {
        await create(payload);
      }

      setEditingId(null);
      setForm(initialForm);
      setCoverFile(null);
      setPreviousCoverUrl("");
      setSlugTouched(false);
      setIsDialogOpen(false);
    } catch {
      // Error surfaced via hook state.
    }
  };

  const startEdit = (id: string) => {
    const row = posts.find((x) => x.id === id);
    if (!row) return;
    setEditingId(id);
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
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setCoverFile(null);
    setPreviousCoverUrl("");
    setSlugTouched(false);
  };

  return (
    <div className="space-y-6">
      <Card className="layer-1">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Blog posts</CardTitle>
            <Button
              type="button"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading posts...</p> : null}
          {!isLoading && posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blog posts yet.</p>
          ) : null}
          {!isLoading && posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((item) => {
                const dateLabel = formatBlogDate(item.published_at ?? item.created_at);
                return (
                  <div
                    key={item.id}
                    className="layer-2 flex flex-col gap-3 rounded-lg p-4 md:flex-row md:items-start md:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-base font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs font-mono text-muted-foreground">{getBlogPath(item.slug)}</p>
                      {item.excerpt ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        Sort {item.sort_order} · {item.published ? "Published" : "Draft"}
                        {dateLabel ? ` · ${dateLabel}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" type="button" asChild>
                        <a href={getBlogPath(item.slug)} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" type="button" onClick={() => startEdit(item.id)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => void remove(item)}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
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
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit blog post" : "Add blog post"}</DialogTitle>
            <DialogDescription>
              Published posts appear on <code className="text-xs">/blog</code>. Body supports plain
              text with line breaks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="grid gap-4">
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
            {(coverFile || form.cover_image_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverFile ? URL.createObjectURL(coverFile) : form.cover_image_url}
                alt=""
                className="aspect-[16/10] max-h-40 w-full rounded-md object-cover"
              />
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                className="layer-1 rounded-md px-3 py-2 text-sm"
                placeholder="Sort order"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))
                }
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isSaving}>
                {isSaving ? "Saving..." : editingId ? "Save changes" : "Add post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
