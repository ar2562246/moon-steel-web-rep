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
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slugify";
import { getCatalogCategoryFilterPath } from "@/features/catalog/paths";
import { useCatalogCategories } from "@/features/admin/hooks/useCatalogCategories";
import type { CatalogCategory } from "@/features/catalog/types";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  sort_order: 100,
  published: true,
};

export function CatalogCategoriesTab() {
  const { categories, isLoading, isSaving, error, create, update, remove } = useCatalogCategories();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const canSubmit = useMemo(() => form.name.trim().length > 1, [form.name]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setSlugTouched(false);
  };

  const startCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const startEdit = (category: CatalogCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      sort_order: category.sort_order,
      published: category.published,
    });
    setSlugTouched(true);
    setIsDialogOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      description: form.description.trim() || undefined,
      sort_order: Number(form.sort_order) || 100,
      published: form.published,
    };

    const ok = editingId ? await update({ ...payload, id: editingId }) : await create(payload);
    if (!ok) return;
    resetForm();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="layer-1">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Product Categories</CardTitle>
            <Button type="button" onClick={startCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Reusable categories for catalog products. Products can belong to one or more categories.
          </p>

          {isLoading ? <p className="text-sm text-muted-foreground">Loading categories...</p> : null}
          {!isLoading && categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : null}

          {!isLoading && categories.length > 0 ? (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="layer-2 flex flex-col gap-3 rounded-lg p-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">{category.name}</p>
                      {!category.published ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Draft
                        </span>
                      ) : null}
                    </div>
                    {category.description ? (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    ) : null}
                    <p className="text-xs font-mono text-muted-foreground">
                      {getCatalogCategoryFilterPath(category.slug)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => startEdit(category)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => void remove(category.id)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>Categories group catalog products and power storefront filters.</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="grid gap-4">
            <Input
              placeholder="Category name"
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
            <Input
              placeholder="URL slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((current) => ({ ...current, slug: e.target.value }));
              }}
            />
            <textarea
              className="layer-1 rounded-md px-3 py-2 text-sm"
              placeholder="Description (optional)"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isSaving}>
                {isSaving ? "Saving..." : editingId ? "Save Changes" : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
