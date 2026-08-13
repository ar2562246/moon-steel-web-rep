"use client";

import { FormEvent, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminDetailSkeleton,
  AdminMasterDetail,
  AdminSidebarCard,
  AdminSidebarEmpty,
  AdminSidebarSkeleton,
  adminSidebarMutedClass,
  adminSidebarTitleClass,
} from "@/features/admin/components/AdminMasterDetail";
import { useProductCategories } from "@/features/admin/hooks/useProductCategories";
import type { ProductCategory } from "@/features/admin/types";

const initialForm = {
  title: "",
  specs: "",
  description: "",
  uses: "",
  sort_order: 100,
};

export function ProductCategoriesTab() {
  const { categories, isLoading, isSaving, error, create, update, remove } = useProductCategories();
  const [form, setForm] = useState(initialForm);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const canSubmit = useMemo(
    () =>
      form.title.trim().length > 1 &&
      form.specs.trim().length > 1 &&
      form.description.trim().length > 4 &&
      form.uses.trim().length > 1,
    [form]
  );

  const closeEditor = () => {
    setEditingCategory(null);
    setForm(initialForm);
    setIsEditorOpen(false);
  };

  const startCreate = () => {
    setEditingCategory(null);
    setForm(initialForm);
    setIsEditorOpen(true);
  };

  const startEdit = (row: ProductCategory, force = false) => {
    if (!force && editingCategory?.id === row.id && isEditorOpen) return;
    setEditingCategory(row);
    setForm({
      title: row.title,
      specs: row.specs,
      description: row.description,
      uses: row.uses,
      sort_order: row.sort_order,
    });
    setIsEditorOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      title: form.title.trim(),
      specs: form.specs.trim(),
      description: form.description.trim(),
      uses: form.uses.trim(),
      sort_order: Number(form.sort_order) || 100,
    };

    const saved = editingCategory
      ? await update({ id: editingCategory.id, ...payload })
      : await create(payload);
    if (!saved) return;
    startEdit(saved, true);
  };

  const onDelete = async (category: ProductCategory) => {
    const ok = await remove(category.id);
    if (!ok) return;
    if (editingCategory?.id === category.id) closeEditor();
  };

  return (
    <AdminMasterDetail
      title="Product Lines"
      description="Manage product line details shown on the landing page."
      addLabel="Add Category"
      onAdd={startCreate}
      onBack={closeEditor}
      formId="admin-product-line-form"
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
                  <p className={adminSidebarTitleClass(selected)}>{category.title}</p>
                  {category.specs ? (
                    <p className={adminSidebarMutedClass(selected)}>{category.specs}</p>
                  ) : null}
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={!isEditorOpen ? "Line detail" : editingCategory ? "Edit Product Line" : "Add Product Line"}
      detailDescription={
        !isEditorOpen
          ? "Choose a product line from the sidebar, or add a new one."
          : "Title, specs, description, and uses shown on the homepage."
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
      <form id="admin-product-line-form" onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          className="layer-1 rounded-md px-3 py-2 text-sm"
          placeholder="Category title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <input
          className="layer-1 rounded-md px-3 py-2 text-sm"
          placeholder="Specs"
          value={form.specs}
          onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))}
        />
        <textarea
          className="layer-1 rounded-md px-3 py-2 text-sm md:col-span-2"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <input
          className="layer-1 rounded-md px-3 py-2 text-sm md:col-span-2"
          placeholder="Uses (comma-separated)"
          value={form.uses}
          onChange={(e) => setForm((f) => ({ ...f, uses: e.target.value }))}
        />
        <input
          type="number"
          className="layer-1 rounded-md px-3 py-2 text-sm"
          placeholder="Sort order"
          value={form.sort_order}
          onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))}
        />
      </form>
    </AdminMasterDetail>
  );
}
