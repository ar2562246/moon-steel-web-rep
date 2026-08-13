"use client";

import { FormEvent, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slugify";
import { getCatalogCategoryFilterPath } from "@/features/catalog/paths";
import {
  AdminDetailSkeleton,
  AdminMasterDetail,
  AdminSidebarCard,
  AdminSidebarEmpty,
  AdminSidebarSkeleton,
  adminSidebarMutedClass,
  adminSidebarTitleClass,
} from "@/features/admin/components/AdminMasterDetail";
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
  const [editingCategory, setEditingCategory] = useState<CatalogCategory | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const canSubmit = useMemo(() => form.name.trim().length > 1, [form.name]);

  const closeEditor = () => {
    setForm(initialForm);
    setEditingCategory(null);
    setSlugTouched(false);
    setIsEditorOpen(false);
  };

  const startCreate = () => {
    setForm(initialForm);
    setEditingCategory(null);
    setSlugTouched(false);
    setIsEditorOpen(true);
  };

  const startEdit = (category: CatalogCategory, force = false) => {
    if (!force && editingCategory?.id === category.id && isEditorOpen) return;
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      sort_order: category.sort_order,
      published: category.published,
    });
    setSlugTouched(true);
    setIsEditorOpen(true);
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

    const saved = editingCategory
      ? await update({ ...payload, id: editingCategory.id })
      : await create(payload);
    if (!saved) return;
    startEdit(saved, true);
  };

  const onDelete = async (category: CatalogCategory) => {
    const ok = await remove(category.id);
    if (!ok) return;
    if (editingCategory?.id === category.id) closeEditor();
  };

  return (
    <AdminMasterDetail
      title="Product Categories"
      description="Reusable categories for catalog products. Products can belong to one or more categories."
      addLabel="Add Category"
      onAdd={startCreate}
      onBack={closeEditor}
      formId="admin-catalog-category-form"
      canSubmit={canSubmit}
      isSaving={isSaving}
      submitLabel={editingCategory ? "Save Changes" : "Add Category"}
      error={error}
      sidebar={
        isLoading ? (
          <AdminSidebarSkeleton />
        ) : categories.length === 0 ? (
          <AdminSidebarEmpty>No categories yet.</AdminSidebarEmpty>
        ) : (
          categories.map((category) => {
            const selected = isEditorOpen && editingCategory?.id === category.id;
            return (
              <AdminSidebarCard key={category.id} selected={selected} onClick={() => startEdit(category)}>
                <div className="space-y-1.5 p-3">
                  <p className={adminSidebarTitleClass(selected)}>{category.name}</p>
                  <p className={`${adminSidebarMutedClass(selected)} break-all`}>
                    {getCatalogCategoryFilterPath(category.slug)}
                  </p>
                  {category.description ? (
                    <p className={adminSidebarMutedClass(selected)}>{category.description}</p>
                  ) : null}
                  {!category.published ? <p className={adminSidebarMutedClass(selected)}>Draft</p> : null}
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={!isEditorOpen ? "Category detail" : editingCategory ? "Edit Category" : "Add Category"}
      detailDescription={
        !isEditorOpen
          ? "Choose a category from the sidebar, or add a new one."
          : "Categories group catalog products and power storefront filters."
      }
      detailActions={
        isEditorOpen && editingCategory ? (
          <Button variant="outline" size="sm" type="button" onClick={() => void onDelete(editingCategory)}>
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </Button>
        ) : null
      }
      isEditorOpen={isEditorOpen}
      skeleton={<AdminDetailSkeleton withImage={false} />}
    >
      <form id="admin-catalog-category-form" onSubmit={onSubmit} className="grid gap-4">
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
      </form>
    </AdminMasterDetail>
  );
}
