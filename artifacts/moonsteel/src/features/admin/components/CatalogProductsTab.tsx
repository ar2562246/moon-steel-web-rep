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
import { ChevronLeft, ChevronRight, ExternalLink, GripVertical, ImageDown, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { FileDropzone, filterFilesByAccept, hasFileDrag } from "@/components/ui/FileDropzone";
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
import { ProductPlatformDistribution } from "@/features/admin/components/ProductPlatformDistribution";
import { PlatformStatusDot } from "@/features/admin/components/PlatformStatusDot";
import { SyncJobProgressDialog } from "@/features/admin/components/SyncJobProgressDialog";
import {
  createCatalogSyncJob,
  fetchCatalogSyncStatus,
  type CatalogSyncPlatform,
  type CatalogSyncState,
} from "@/features/admin/services/catalogSync";

const initialForm = {
  name: "",
  slug: "",
  details: "",
  sort_order: 100,
  published: true,
  sku: "",
  price: "",
  currency: "PKR",
  availability: "in_stock" as "in_stock" | "out_of_stock" | "preorder" | "available_for_order",
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
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [syncPlatforms, setSyncPlatforms] = useState<CatalogSyncPlatform[]>([]);
  const [syncStates, setSyncStates] = useState<CatalogSyncState[]>([]);
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState<{ productCount: number; platformCount: number; estimatedOperations: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const galleryRef = useRef(gallery);
  galleryRef.current = gallery;

  useEffect(() => {
    if (products.length === 0) return;
    void fetchCatalogSyncStatus(products.map((product) => product.id))
      .then((result) => {
        setSyncPlatforms(result.platforms);
        setSyncStates(result.states);
        setSelectedPlatformIds((current) =>
          current.length > 0
            ? current
            : result.platforms.filter((platform) => platform.connected).map((platform) => platform.id)
        );
      })
      .catch(() => undefined);
  }, [products]);

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

  const addImageFiles = (files: File[]) => {
    const images = filterFilesByAccept(files, "image/*");
    if (images.length === 0) return;
    setGallery((current) => [
      ...current,
      ...images.map((file) => ({
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
      sku: product.sku ?? "",
      price: product.price == null ? "" : String(product.price),
      currency: product.currency || "PKR",
      availability: product.availability || "in_stock",
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
      sku: form.sku.trim() || null,
      price: form.price.trim() ? Number(form.price) : null,
      currency: form.currency.trim() || "PKR",
      availability: form.availability,
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
    setConfirmDelete(false);
  };

  const startBulkSync = async (productIds: string[] | "all", confirm = false) => {
    const platformIds = selectedPlatformIds.filter((id) =>
      syncPlatforms.some((platform) => platform.id === id && platform.connected)
    );
    if (platformIds.length === 0) {
      toast({ title: "Select at least one connected platform.", variant: "destructive" });
      return;
    }
    try {
      const result = await createCatalogSyncJob({
        action: "SYNC",
        productIds,
        platformIds,
        confirmAll: confirm,
      });
      if (result.requiresConfirmation) {
        setConfirmAll({
          productCount: result.productCount ?? 0,
          platformCount: result.platformCount ?? 0,
          estimatedOperations: result.estimatedOperations ?? 0,
        });
        return;
      }
      if (result.jobId) setJobId(result.jobId);
    } catch (error) {
      toast({
        title: "Could not start sync",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
    <div className="min-h-0 flex-1 overflow-hidden">
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
      headerActions={
        <div className="hidden items-center gap-1 lg:flex">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={selectedProductIds.length === 0}
            onClick={() => void startBulkSync(selectedProductIds)}
          >
            Sync selected
          </Button>
        </div>
      }
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
            const checked = selectedProductIds.includes(product.id);
            const productStates = syncStates.filter((row) => row.productId === product.id);
            return (
              <div key={product.id} className="flex items-stretch gap-1">
                <Checkbox
                  checked={checked}
                  className="mt-4"
                  onCheckedChange={(value) => {
                    setSelectedProductIds((current) =>
                      value === true ? [...current, product.id] : current.filter((id) => id !== product.id)
                    );
                  }}
                  aria-label={`Select ${product.name}`}
                />
                <AdminSidebarCard
                  selected={selected}
                  compact
                  onClick={() => startEdit(product)}
                  className="flex-1"
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
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {syncPlatforms
                      .filter((platform) => platform.id !== "mock")
                      .map((platform) => (
                        <PlatformStatusDot
                          key={platform.id}
                          label={platform.shortLabel}
                          status={
                            platform.connected
                              ? productStates.find((row) => row.platform === platform.id)?.status
                              : "NOT_SYNCED"
                          }
                        />
                      ))}
                  </div>
                  {!product.published ? (
                    <p className={adminSidebarMutedClass(selected)}>Draft</p>
                  ) : null}
                </div>
              </AdminSidebarCard>
              </div>
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
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmDelete(true)}>
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="SKU" htmlFor="product-sku" hint="Optional. Used as the catalog identifier when set; otherwise the slug is used.">
                      <Input
                        id="product-sku"
                        value={form.sku}
                        onChange={(e) => setForm((current) => ({ ...current, sku: e.target.value }))}
                        placeholder="GT-221512"
                      />
                    </Field>
                    <Field label="Catalog price" htmlFor="product-price" hint="Required by Facebook, Instagram, WhatsApp, and Google catalogs. Leave blank if you only publish on the website.">
                      <div className="flex gap-2">
                        <Input
                          id="product-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                          placeholder="0.00"
                        />
                        <Input
                          aria-label="Currency"
                          value={form.currency}
                          onChange={(e) => setForm((current) => ({ ...current, currency: e.target.value.toUpperCase() }))}
                          className="w-24"
                        />
                      </div>
                    </Field>
                  </div>

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
                  <div
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                    onDragOver={(event) => {
                      if (!hasFileDrag(event)) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "copy";
                    }}
                    onDrop={(event) => {
                      if (!hasFileDrag(event)) return;
                      event.preventDefault();
                      addImageFiles(Array.from(event.dataTransfer.files ?? []));
                    }}
                  >
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
                            if (hasFileDrag(event)) {
                              addImageFiles(Array.from(event.dataTransfer.files ?? []));
                              return;
                            }
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
                    <FileDropzone
                      accept="image/*"
                      multiple
                      inputKey={`catalog-files-${fileInputKey}`}
                      className="aspect-[4/3] px-3 py-3"
                      label="Drop photos or click"
                      hint="Multiple images"
                      onFiles={addImageFiles}
                    />
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

                {editingProduct ? (
                  <ProductPlatformDistribution productId={editingProduct.id} productName={editingProduct.name} />
                ) : null}
              </form>
    </AdminMasterDetail>
    </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2 text-xs">
        <Button type="button" size="sm" variant="outline" onClick={() => setSelectedProductIds(products.map((product) => product.id))}>
          Select all
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setSelectedProductIds([])}>
          Clear
        </Button>
        {syncPlatforms
          .filter((platform) => platform.connected)
          .map((platform) => (
            <label key={platform.id} className="inline-flex items-center gap-1">
              <Checkbox
                checked={selectedPlatformIds.includes(platform.id)}
                onCheckedChange={(value) => {
                  setSelectedPlatformIds((current) =>
                    value === true ? [...current, platform.id] : current.filter((id) => id !== platform.id)
                  );
                }}
              />
              {platform.shortLabel}
            </label>
          ))}
        <Button
          type="button"
          size="sm"
          disabled={selectedProductIds.length === 0}
          onClick={() => void startBulkSync(selectedProductIds)}
        >
          Sync selected products
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => void startBulkSync("all")}>
          Sync all products
        </Button>
      </div>
      <SyncJobProgressDialog jobId={jobId} onClose={() => setJobId(null)} />
      <AlertDialog open={Boolean(confirmAll)} onOpenChange={(open) => !open && setConfirmAll(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync all products?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to sync {confirmAll?.productCount ?? 0} products to {confirmAll?.platformCount ?? 0}{" "}
              platforms. Estimated operations: up to {confirmAll?.estimatedOperations ?? 0}. This may take several
              minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmAll(null);
                void startBulkSync("all", true);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete from the website only?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product from Moon Steel. External catalogs are left unchanged until you unpublish them
              from Platform distribution.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (editingProduct) void onDelete(editingProduct);
              }}
            >
              Delete website product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
