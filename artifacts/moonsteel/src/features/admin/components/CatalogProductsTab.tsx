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
import { getCatalogProductCover, getCatalogProductImages, getCatalogProductPath } from "@/features/catalog/paths";
import { useCatalogCategories } from "@/features/admin/hooks/useCatalogCategories";
import { useCatalogProducts } from "@/features/admin/hooks/useCatalogProducts";
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

export function CatalogProductsTab() {
  const { products, isLoading, isSaving, error, create, update, remove } = useCatalogProducts();
  const { categories, isLoading: categoriesLoading } = useCatalogCategories();
  const [form, setForm] = useState(initialForm);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
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
      form.name.trim().length > 1 &&
      form.details.trim().length > 4 &&
      gallery.length > 0 &&
      selectedCategoryIds.length > 0,
    [form, gallery.length, selectedCategoryIds.length]
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

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingProduct(null);
    setSelectedCategoryIds([]);
    setGallery([]);
    setImageUrlInput("");
    setSlugTouched(false);
    setFileInputKey((key) => key + 1);
  };

  const startCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const startEdit = (product: CatalogProduct) => {
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
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      details: form.details.trim(),
      sort_order: Number(form.sort_order) || 100,
      published: form.published,
      image_urls,
      category_ids: selectedCategoryIds,
    };

    const ok = editingProduct
      ? await update(
          {
            ...payload,
            id: editingProduct.id,
            previous_image_urls: getCatalogProductImages(editingProduct),
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
            <CardTitle>Catalog Products</CardTitle>
            <Button type="button" onClick={startCreate} disabled={categoriesLoading || categories.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Individual products with SEO URLs like{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">/products/stainless-steel-table</code>.
            Create categories first, then assign one or more per product.
          </p>

          {categories.length === 0 && !categoriesLoading ? (
            <p className="mb-4 text-sm text-amber-600">Add at least one category before creating products.</p>
          ) : null}

          {isLoading ? <p className="text-sm text-muted-foreground">Loading products...</p> : null}
          {!isLoading && products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No catalog products yet.</p>
          ) : null}

          {!isLoading && products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="layer-2 flex flex-col gap-4 rounded-lg p-4 md:flex-row md:items-start"
                >
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getCatalogProductCover(product)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-base font-semibold text-foreground">{product.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.categories.map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{product.path}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" type="button" asChild>
                      <Link href={getCatalogProductPath(product.slug)} target="_blank">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => startEdit(product)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => void remove(product)}>
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
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              Name, slug, details, categories, and images. Path is computed as /products/{"{slug}"}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Product name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((current) => ({
                  ...current,
                  name,
                  slug: slugTouched ? current.slug : slugify(name),
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
              readOnly
              value={form.slug ? getCatalogProductPath(slugify(form.slug)) : "/products/..."}
              className="font-mono text-xs text-muted-foreground"
            />
            <textarea
              className="layer-1 rounded-md px-3 py-2 text-sm md:col-span-2"
              placeholder="Product details"
              rows={4}
              value={form.details}
              onChange={(e) => setForm((current) => ({ ...current, details: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Sort order"
              value={form.sort_order}
              onChange={(e) =>
                setForm((current) => ({ ...current, sort_order: Number(e.target.value) || 0 }))
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

            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-foreground">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <p className="text-sm font-medium text-foreground">Product photos</p>
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
                              className="rounded bg-background/90 p-1"
                              onClick={() => setCover(entry.id)}
                              aria-label="Set as cover"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="rounded bg-background/90 p-1"
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
                key={`catalog-files-${fileInputKey}`}
                type="file"
                accept="image/*"
                multiple
                onChange={onPickFiles}
                className="layer-1 w-full rounded-md px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
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
            </div>

            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isSaving}>
                {isSaving ? "Saving..." : editingProduct ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
