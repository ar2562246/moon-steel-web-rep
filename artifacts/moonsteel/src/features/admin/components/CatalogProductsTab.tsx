"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, GripVertical, ImageDown, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";
import { getCatalogProductCover, getCatalogProductImages, getCatalogProductPath } from "@/features/catalog/paths";
import { AdminEditableImage } from "@/features/admin/components/AdminEditableImage";
import { AdminImageActionButton } from "@/features/admin/components/AdminImageActions";
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
import { useCatalogCategories } from "@/features/admin/hooks/useCatalogCategories";
import { useCatalogProducts } from "@/features/admin/hooks/useCatalogProducts";
import {
  optimizeImageToWeb43,
  WEB_43_MAX_HEIGHT,
  WEB_43_MAX_WIDTH,
} from "@/features/admin/lib/optimizeImageToWeb43";
import { useToast } from "@/hooks/use-toast";
import type { CatalogProduct } from "@/features/catalog/types";

const initialForm = {
  name: "",
  slug: "",
  details: "",
  sort_order: 100,
  published: true,
};

type GalleryEntry =
  | { id: string; kind: "url"; url: string }
  | { id: string; kind: "file"; file: File; preview: string };

function newId() {
  return crypto.randomUUID();
}

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
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
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
      rows={6}
      onChange={(event) => {
        onChange(event.target.value);
        requestAnimationFrame(resize);
      }}
      className="min-h-[12rem] resize-none overflow-y-auto whitespace-pre-wrap text-base leading-relaxed md:text-sm"
    />
  );
}

export function CatalogProductsTab() {
  const { toast } = useToast();
  const { products, isLoading, isSaving, error, create, update, remove } = useCatalogProducts();
  const { categories, isLoading: categoriesLoading } = useCatalogCategories();
  const [form, setForm] = useState(initialForm);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [slugTouched, setSlugTouched] = useState(false);
  const [optimizingId, setOptimizingId] = useState<string | "all" | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
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
      form.name.trim().length > 1 &&
      form.details.trim().length > 4 &&
      gallery.length > 0 &&
      selectedCategoryIds.length > 0,
    [form, gallery.length, selectedCategoryIds.length]
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

  const applyOptimizedFile = (id: string, file: File) => {
    setGallery((current) =>
      current.map((entry) => {
        if (entry.id !== id) return entry;
        if (entry.kind === "file") URL.revokeObjectURL(entry.preview);
        return { id, kind: "file" as const, file, preview: URL.createObjectURL(file) };
      })
    );
  };

  const moveGallery = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setGallery((current) => {
      const from = current.findIndex((item) => item.id === fromId);
      const to = current.findIndex((item) => item.id === toId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const moveGalleryBy = (id: string, offset: number) => {
    setGallery((current) => {
      const from = current.findIndex((item) => item.id === id);
      const to = from + offset;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const optimizeEntry = async (entry: GalleryEntry, quiet = false) => {
    const source = entry.kind === "url" ? entry.url : entry.file;
    const name = entry.kind === "file" ? entry.file.name : "product-image.jpg";
    const result = await optimizeImageToWeb43(source, name);

    if (result.status === "already-standard") {
      if (!quiet) {
        toast({
          title: "Already web-ready",
          description: `${result.width} × ${result.height} is already within ${WEB_43_MAX_WIDTH} × ${WEB_43_MAX_HEIGHT} at 4:3.`,
        });
      }
      return result;
    }

    applyOptimizedFile(entry.id, result.file);
    if (!quiet) {
      toast({
        title: "Resized to web 4:3",
        description: `${result.previousWidth} × ${result.previousHeight} → ${result.width} × ${result.height}. Save the product to apply it on the site.`,
      });
    }
    return result;
  };

  const onOptimizeImage = async (entry: GalleryEntry) => {
    setOptimizingId(entry.id);
    try {
      await optimizeEntry(entry);
    } catch (e) {
      toast({
        title: "Could not resize image",
        description: e instanceof Error ? e.message : "Try downloading and re-uploading the file.",
        variant: "destructive",
      });
    } finally {
      setOptimizingId(null);
    }
  };

  const onOptimizeAll = async () => {
    if (gallery.length === 0) return;
    setOptimizingId("all");
    let changed = 0;
    let skipped = 0;
    try {
      const next: GalleryEntry[] = [];
      for (const entry of gallery) {
        const source = entry.kind === "url" ? entry.url : entry.file;
        const name = entry.kind === "file" ? entry.file.name : "product-image.jpg";
        const result = await optimizeImageToWeb43(source, name);
        if (result.status === "already-standard") {
          skipped += 1;
          next.push(entry);
          continue;
        }
        if (entry.kind === "file") URL.revokeObjectURL(entry.preview);
        changed += 1;
        next.push({
          id: entry.id,
          kind: "file",
          file: result.file,
          preview: URL.createObjectURL(result.file),
        });
      }
      setGallery(next);
      toast({
        title: changed ? "Photos ready for web" : "Already web-ready",
        description: changed
          ? `${changed} resized to ${WEB_43_MAX_WIDTH} × ${WEB_43_MAX_HEIGHT} 4:3${skipped ? `, ${skipped} already standard` : ""}. Order is unchanged. Save the product to apply.`
          : `All photos are already within ${WEB_43_MAX_WIDTH} × ${WEB_43_MAX_HEIGHT} at 4:3.`,
      });
    } catch (e) {
      toast({
        title: "Could not resize images",
        description: e instanceof Error ? e.message : "Try again with a local file.",
        variant: "destructive",
      });
    } finally {
      setOptimizingId(null);
    }
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

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const closeEditor = () => {
    revokeGalleryFiles();
    setForm(initialForm);
    setEditingProduct(null);
    setSelectedCategoryIds([]);
    setGallery([]);
    setImageUrlInput("");
    setSlugTouched(false);
    setFileInputKey((key) => key + 1);
    setOptimizingId(null);
    setIsEditorOpen(false);
  };

  const startCreate = () => {
    revokeGalleryFiles();
    setForm(initialForm);
    setEditingProduct(null);
    setSelectedCategoryIds([]);
    setGallery([]);
    setImageUrlInput("");
    setSlugTouched(false);
    setFileInputKey((key) => key + 1);
    setOptimizingId(null);
    setIsEditorOpen(true);
  };

  const startEdit = (product: CatalogProduct, force = false) => {
    if (!force && editingProduct?.id === product.id && isEditorOpen) return;
    revokeGalleryFiles();
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      details: product.details,
      sort_order: product.sort_order,
      published: product.published,
    });
    setSelectedCategoryIds(product.categories.map((category) => category.id));
    setGallery(
      getCatalogProductImages(product).map((url) => ({
        id: newId(),
        kind: "url" as const,
        url,
      }))
    );
    setImageUrlInput("");
    setSlugTouched(true);
    setFileInputKey((key) => key + 1);
    setOptimizingId(null);
    setIsEditorOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      details: form.details.trim(),
      sort_order: Number(form.sort_order) || 100,
      published: form.published,
      category_ids: selectedCategoryIds,
    };
    const images = gallery.map((entry) =>
      entry.kind === "url" ? { kind: "url" as const, url: entry.url } : { kind: "file" as const, file: entry.file }
    );

    const saved = editingProduct
      ? await update(
          {
            ...payload,
            id: editingProduct.id,
            previous_image_urls: getCatalogProductImages(editingProduct),
          },
          images
        )
      : await create(payload, images);

    if (!saved) return;
    startEdit(saved, true);
  };

  const onDelete = async (product: CatalogProduct) => {
    const ok = await remove(product);
    if (!ok) return;
    if (editingProduct?.id === product.id) closeEditor();
  };

  return (
    <AdminMasterDetail
      title="Catalog Products"
      description={
        <>
          Select a product card to edit it on the right. SEO URLs look like{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/products/stainless-steel-table</code>.
        </>
      }
      addLabel="Add Product"
      onAdd={startCreate}
      addDisabled={categoriesLoading || categories.length === 0}
      onBack={closeEditor}
      formId="admin-catalog-product-form"
      canSubmit={canSubmit}
      isSaving={isSaving}
      submitLabel={editingProduct ? "Save Changes" : "Add Product"}
      notice={
        categories.length === 0 && !categoriesLoading ? (
          <p className="text-sm text-amber-600">Add at least one category before creating products.</p>
        ) : null
      }
      error={error}
      sidebar={
        isLoading ? (
          <AdminSidebarSkeleton withImage />
        ) : products.length === 0 ? (
          <AdminSidebarEmpty>No catalog products yet.</AdminSidebarEmpty>
        ) : (
          products.map((product) => {
            const selected = isEditorOpen && editingProduct?.id === product.id;
            return (
              <AdminSidebarCard
                key={product.id}
                selected={selected}
                compact
                onClick={() => startEdit(product)}
              >
                <AdminSidebarThumb src={getCatalogProductCover(product)} alt={product.name} />
                <div className={adminSidebarBodyClass()}>
                  <p className={adminSidebarTitleClass(selected)}>{product.name}</p>
                  {product.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.categories.map((category) => (
                        <span key={category.id} className={adminSidebarMetaClass(selected)}>
                          {category.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className={`${adminSidebarMutedClass(selected)} break-all`}>/products/{product.slug}</p>
                  {!product.published ? (
                    <p className={adminSidebarMutedClass(selected)}>Draft</p>
                  ) : null}
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={!isEditorOpen ? "Product detail" : editingProduct ? "Edit Product" : "Add Product"}
      detailDescription={
        !isEditorOpen
          ? "Choose a product from the sidebar, or add a new one."
          : "Name, slug, details, categories, and images. Path is /products/{slug}."
      }
      detailActions={
        isEditorOpen && editingProduct ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" type="button" asChild>
              <Link href={getCatalogProductPath(editingProduct.slug)} target="_blank">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                View
              </Link>
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={() => void onDelete(editingProduct)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        ) : null
      }
      isEditorOpen={isEditorOpen}
    >
              <form id="admin-catalog-product-form" onSubmit={onSubmit} className="space-y-8">
                <section className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <Field label="Name" htmlFor="product-name">
                      <Input
                        id="product-name"
                        placeholder="Hand Wash Sink"
                        value={form.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setForm((current) => ({
                            ...current,
                            name,
                            slug: slugTouched ? current.slug : slugify(name),
                          }));
                        }}
                      />
                    </Field>
                    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                      <Switch
                        id="product-published"
                        checked={form.published}
                        onCheckedChange={(published) => setForm((current) => ({ ...current, published }))}
                      />
                      <div>
                        <Label htmlFor="product-published" className="cursor-pointer">
                          {form.published ? "Published" : "Draft"}
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          {form.published ? "Visible in the catalog" : "Hidden from the site"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Field
                    label="Page URL"
                    htmlFor="product-slug"
                    hint="Used on the product page and in search results."
                  >
                    <div className="flex overflow-hidden rounded-lg border border-input focus-within:ring-1 focus-within:ring-ring">
                      <span className="flex shrink-0 items-center bg-muted px-3 font-mono text-xs text-muted-foreground">
                        /products/
                      </span>
                      <Input
                        id="product-slug"
                        placeholder="hand-wash-sink"
                        value={form.slug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          setForm((current) => ({ ...current, slug: e.target.value }));
                        }}
                        className="border-0 shadow-none focus-visible:ring-0"
                      />
                    </div>
                  </Field>

                  <Field
                    label="Sort order"
                    htmlFor="product-sort"
                    hint="Lower numbers appear first in the catalog."
                  >
                    <Input
                      id="product-sort"
                      type="number"
                      value={form.sort_order}
                      onChange={(e) =>
                        setForm((current) => ({ ...current, sort_order: Number(e.target.value) || 0 }))
                      }
                      className="max-w-[10rem]"
                    />
                  </Field>

                  <Field label="Categories">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const checked = selectedCategoryIds.includes(category.id);
                        return (
                          <label
                            key={category.id}
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
                              onChange={() => toggleCategory(category.id)}
                            />
                            {category.name}
                          </label>
                        );
                      })}
                    </div>
                  </Field>
                </section>

                <section className="space-y-3">
                  <Field
                    label="Product details"
                    htmlFor="product-details"
                    hint="This is the description on the product page. Line breaks are kept."
                  >
                    <AutoGrowTextarea
                      id="product-details"
                      value={form.details}
                      placeholder="Material, size, construction, and what this product is for."
                      onChange={(details) => setForm((current) => ({ ...current, details }))}
                    />
                  </Field>
                </section>

                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Product photos</p>
                      <p className="text-xs text-muted-foreground">
                        Oversized photos can be reduced to {WEB_43_MAX_WIDTH} × {WEB_43_MAX_HEIGHT} (4:3)
                        without changing order. Drag or use arrows to reorder. First image is the cover.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={gallery.length === 0 || optimizingId !== null}
                      onClick={() => void onOptimizeAll()}
                    >
                      <ImageDown className="mr-2 h-3.5 w-3.5" />
                      {optimizingId === "all" ? "Converting..." : "Make all web 4:3"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map((entry, index) => {
                      const src = entry.kind === "url" ? entry.url : entry.preview;
                      const isBusy = optimizingId !== null;
                      return (
                        <div
                          key={entry.id}
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const fromId = event.dataTransfer.getData("text/plain") || dragId;
                            if (fromId) moveGallery(fromId, entry.id);
                            setDragId(null);
                          }}
                          className={cn(
                            "layer-2 rounded-lg p-2",
                            dragId === entry.id && "opacity-60 ring-2 ring-primary"
                          )}
                        >
                          <AdminEditableImage
                            src={src}
                            file={entry.kind === "file" ? entry.file : null}
                            fileName={
                              entry.kind === "file" ? entry.file.name : `product-photo-${index + 1}.jpg`
                            }
                            alt={`Product photo ${index + 1}`}
                            disabled={isBusy}
                            className="aspect-[4/3] w-full rounded-md"
                            imgClassName="object-contain"
                            badge={
                              index === 0 ? (
                                <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                                  Cover
                                </span>
                              ) : null
                            }
                            extraActions={
                              <>
                                <AdminImageActionButton
                                  tone="optimize"
                                  disabled={isBusy}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void onOptimizeImage(entry);
                                  }}
                                  aria-label="Convert to web 4:3"
                                  title="Web 4:3"
                                >
                                  <ImageDown className="h-3.5 w-3.5" />
                                </AdminImageActionButton>
                                {index > 0 ? (
                                  <AdminImageActionButton
                                    tone="accent"
                                    disabled={isBusy}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setCover(entry.id);
                                    }}
                                    aria-label="Set as cover"
                                    title="Set cover"
                                  >
                                    <Star className="h-3.5 w-3.5" />
                                  </AdminImageActionButton>
                                ) : null}
                                <AdminImageActionButton
                                  tone="danger"
                                  disabled={isBusy}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeGalleryEntry(entry.id);
                                  }}
                                  aria-label="Remove image"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </AdminImageActionButton>
                              </>
                            }
                            footerActions={
                              <>
                                <AdminImageActionButton
                                  tone="grip"
                                  draggable={!isBusy}
                                  disabled={isBusy}
                                  onDragStart={(event) => {
                                    event.stopPropagation();
                                    event.dataTransfer.setData("text/plain", entry.id);
                                    event.dataTransfer.effectAllowed = "move";
                                    setDragId(entry.id);
                                  }}
                                  onDragEnd={() => setDragId(null)}
                                  className="cursor-grab active:cursor-grabbing"
                                  aria-label="Drag to reorder"
                                  title="Drag to reorder"
                                >
                                  <GripVertical className="h-3.5 w-3.5" />
                                </AdminImageActionButton>
                                <AdminImageActionButton
                                  tone="move"
                                  disabled={index === 0 || isBusy}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    moveGalleryBy(entry.id, -1);
                                  }}
                                  aria-label="Move earlier"
                                  title="Move left"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </AdminImageActionButton>
                                <AdminImageActionButton
                                  tone="move"
                                  disabled={index === gallery.length - 1 || isBusy}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    moveGalleryBy(entry.id, 1);
                                  }}
                                  aria-label="Move later"
                                  title="Move right"
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </AdminImageActionButton>
                              </>
                            }
                            onEdited={(file) => {
                              applyOptimizedFile(entry.id, file);
                              toast({
                                title: "Photo updated",
                                description: "Save the product to keep this edit on the site.",
                              });
                            }}
                          />
                          {optimizingId === entry.id || optimizingId === "all" ? (
                            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
                              Converting…
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                    <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition-[color,background-color,border-color,transform,box-shadow] duration-150 hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-sm active:scale-[0.97] active:bg-primary/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                      <input
                        key={`catalog-files-${fileInputKey}`}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onPickFiles}
                        className="sr-only"
                      />
                      <Plus className="h-8 w-8" strokeWidth={2} />
                      <span className="text-xs font-medium">Add photos</span>
                    </label>
                  </div>
                  <div className="flex min-w-0 gap-2">
                    <Input
                      placeholder="Or image URL"
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
                </section>
              </form>
    </AdminMasterDetail>
  );
}
