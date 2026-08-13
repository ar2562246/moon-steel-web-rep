"use client";

import {
  FormEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminEditableImage } from "@/features/admin/components/AdminEditableImage";
import { AdminImageActionButton } from "@/features/admin/components/AdminImageActions";
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
import { useCatalogProducts } from "@/features/admin/hooks/useCatalogProducts";
import { formatBlogDate, getBlogCoverImageUrl, getBlogPath, type BlogPost } from "@/features/blog/types";
import { slugify } from "@/lib/slugify";
import { FileDropzone, filterFilesByAccept } from "@/components/ui/FileDropzone";
import { useToast } from "@/hooks/use-toast";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function AutoGrowTextarea({
  id,
  value,
  onChange,
  placeholder,
  minRows = 6,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const max = Math.round(window.innerHeight * 0.55);
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  };

  useLayoutEffect(() => {
    resize();
  }, [value]);

  return (
    <Textarea
      id={id}
      ref={ref}
      value={value}
      placeholder={placeholder}
      rows={minRows}
      onChange={(event) => {
        onChange(event.target.value);
        requestAnimationFrame(resize);
      }}
      className="min-h-[12rem] resize-none overflow-y-auto whitespace-pre-wrap text-base leading-relaxed md:text-sm"
    />
  );
}

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_image_url: "",
  product_ids: [] as string[],
  sort_order: 100,
  published: false,
  published_at: "",
};

export function BlogsTab() {
  const { toast } = useToast();
  const { posts, isLoading, isSaving, error, create, update, remove } = useBlogs();
  const { products } = useCatalogProducts();
  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [previousCoverUrl, setPreviousCoverUrl] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : ""),
    [coverFile]
  );
  const coverSrc = coverPreview || form.cover_image_url;

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
    setCoverUrlInput("");
    setPreviousCoverUrl("");
    setSlugTouched(false);
    setIsEditorOpen(false);
  };

  const startCreate = () => {
    setEditingPost(null);
    setForm(initialForm);
    setCoverFile(null);
    setCoverUrlInput("");
    setPreviousCoverUrl("");
    setSlugTouched(false);
    setIsEditorOpen(true);
  };

  const startEdit = (row: BlogPost, force = false) => {
    if (!force && editingPost?.id === row.id && isEditorOpen) return;
    setEditingPost(row);
    setPreviousCoverUrl(row.cover_image_url);
    setCoverFile(null);
    setCoverUrlInput("");
    setSlugTouched(true);
    setForm({
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      body: row.body,
      cover_image_url: row.cover_image_url,
      product_ids: row.product_ids ?? [],
      sort_order: row.sort_order,
      published: row.published,
      published_at: row.published_at ? row.published_at.slice(0, 10) : "",
    });
    setIsEditorOpen(true);
  };

  const toggleProduct = (productId: string) => {
    setForm((f) => {
      const selected = f.product_ids.includes(productId);
      return {
        ...f,
        product_ids: selected
          ? f.product_ids.filter((id) => id !== productId)
          : [...f.product_ids, productId],
      };
    });
  };

  const clearCover = () => {
    setCoverFile(null);
    setForm((f) => ({ ...f, cover_image_url: "" }));
    setCoverUrlInput("");
    setFileInputKey((key) => key + 1);
  };

  const setCoverFromFiles = (files: File[]) => {
    const [file] = filterFilesByAccept(files, "image/*");
    if (!file) return;
    setCoverFile(file);
    setForm((f) => ({ ...f, cover_image_url: "" }));
    setFileInputKey((key) => key + 1);
  };

  const addCoverUrl = () => {
    const url = coverUrlInput.trim();
    if (!url) return;
    setCoverFile(null);
    setForm((f) => ({ ...f, cover_image_url: url }));
    setCoverUrlInput("");
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
      product_ids: form.product_ids,
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
                <AdminSidebarThumb src={getBlogCoverImageUrl(item)} alt={item.title} />
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
          : "Title, slug, excerpt, body, cover, and linked products. Path is /blog/{slug}."
      }
      detailActions={
        isEditorOpen && editingPost ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" type="button" asChild>
              <Link href={getBlogPath(editingPost.slug)} target="_blank">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                View
              </Link>
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
      <form id="admin-blog-form" onSubmit={onSubmit} className="space-y-8">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Field label="Title" htmlFor="blog-title">
              <Input
                id="blog-title"
                placeholder="Kitchen sink fabrication guide"
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
            </Field>
            <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
              <Switch
                id="blog-published"
                checked={form.published}
                onCheckedChange={(published) => setForm((f) => ({ ...f, published }))}
              />
              <div>
                <Label htmlFor="blog-published" className="cursor-pointer">
                  {form.published ? "Published" : "Draft"}
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {form.published ? "Visible on /blog" : "Hidden from the site"}
                </p>
              </div>
            </div>
          </div>

          <Field label="Page URL" htmlFor="blog-slug" hint="Used on the article page and in search results.">
            <div className="flex overflow-hidden rounded-lg border border-input focus-within:ring-1 focus-within:ring-ring">
              <span className="flex shrink-0 items-center bg-muted px-3 font-mono text-xs text-muted-foreground">
                /blog/
              </span>
              <Input
                id="blog-slug"
                placeholder="kitchen-sink-guide"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
                className="border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sort order" htmlFor="blog-sort" hint="Lower numbers appear first on the blog index.">
              <Input
                id="blog-sort"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))}
                className="max-w-[10rem]"
              />
            </Field>
            <Field label="Published date" htmlFor="blog-published-at" hint="Shown on the article. Leave blank to use save time.">
              <Input
                id="blog-published-at"
                type="date"
                value={form.published_at}
                onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
              />
            </Field>
          </div>

          <Field
            label="Linked products"
            hint="Optional. Selected products appear as related links on the public post."
          >
            <div className="flex flex-wrap gap-2">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">No catalog products yet.</p>
              ) : (
                products.map((product) => {
                  const checked = form.product_ids.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        checked
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleProduct(product.id)}
                      />
                      {product.name}
                      {product.published ? "" : " (draft)"}
                    </label>
                  );
                })
              )}
            </div>
          </Field>
        </section>

        <section className="space-y-3">
          <Field
            label="Excerpt"
            htmlFor="blog-excerpt"
            hint="Short summary shown on blog listing cards."
          >
            <Textarea
              id="blog-excerpt"
              rows={2}
              placeholder="One or two sentences that appear on the blog index."
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
          </Field>

          <Field
            label="Article body"
            htmlFor="blog-body"
            hint="This is the full post content. Line breaks are kept."
          >
            <AutoGrowTextarea
              id="blog-body"
              value={form.body}
              placeholder="Write the full article…"
              onChange={(body) => setForm((f) => ({ ...f, body }))}
            />
          </Field>
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Cover photo</p>
            <p className="text-xs text-muted-foreground">
              Optional image shown at the top of the article and on listing cards.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:items-start">
            {coverSrc ? (
              <div className="layer-2 rounded-lg p-2">
                <AdminEditableImage
                  src={coverSrc}
                  file={coverFile}
                  fileName={coverFile?.name || "blog-cover.jpg"}
                  alt="Blog cover"
                  className="aspect-[16/10] w-full rounded-md bg-muted"
                  imgClassName="object-cover"
                  onEdited={(file) => {
                    setCoverFile(file);
                    toast({
                      title: "Cover edited",
                      description: "Save the post to keep this cover image.",
                    });
                  }}
                  extraActions={
                    <AdminImageActionButton
                      tone="danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearCover();
                      }}
                      aria-label="Remove cover"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </AdminImageActionButton>
                  }
                />
              </div>
            ) : (
              <FileDropzone
                accept="image/*"
                multiple
                inputKey={`blog-cover-${fileInputKey}`}
                className="aspect-[16/10] rounded-lg"
                label="Drop a cover photo or click"
                hint="If you drop several files, the first image is used"
                onFiles={setCoverFromFiles}
              />
            )}

            <div className="space-y-3">
              {!coverSrc ? null : (
                <FileDropzone
                  accept="image/*"
                  multiple
                  inputKey={`blog-cover-replace-${fileInputKey}`}
                  className="py-4"
                  label="Drop a replacement cover or click"
                  hint="First image replaces the current cover"
                  onFiles={setCoverFromFiles}
                />
              )}
              <div className="flex min-w-0 gap-2">
                <Input
                  placeholder="Or image URL"
                  value={coverUrlInput}
                  onChange={(e) => setCoverUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCoverUrl();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCoverUrl}>
                  Add URL
                </Button>
              </div>
            </div>
          </div>
        </section>
      </form>
    </AdminMasterDetail>
  );
}
