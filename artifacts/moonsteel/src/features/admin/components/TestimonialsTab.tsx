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
import { useTestimonials } from "@/features/admin/hooks/useTestimonials";
import type { Testimonial } from "@/features/testimonials/types";

const initialForm = {
  quote: "",
  author_name: "",
  author_role: "",
  company: "",
  sort_order: 100,
  published: true,
};

export function TestimonialsTab() {
  const { testimonials, isLoading, isSaving, error, create, update, remove } = useTestimonials();
  const [form, setForm] = useState(initialForm);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const canSubmit = useMemo(
    () =>
      form.quote.trim().length > 10 &&
      form.author_name.trim().length > 1 &&
      form.author_role.trim().length > 1,
    [form]
  );

  const closeEditor = () => {
    setEditingItem(null);
    setForm(initialForm);
    setIsEditorOpen(false);
  };

  const startCreate = () => {
    setEditingItem(null);
    setForm(initialForm);
    setIsEditorOpen(true);
  };

  const startEdit = (row: Testimonial, force = false) => {
    if (!force && editingItem?.id === row.id && isEditorOpen) return;
    setEditingItem(row);
    setForm({
      quote: row.quote,
      author_name: row.author_name,
      author_role: row.author_role,
      company: row.company ?? "",
      sort_order: row.sort_order,
      published: row.published,
    });
    setIsEditorOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      quote: form.quote.trim(),
      author_name: form.author_name.trim(),
      author_role: form.author_role.trim(),
      company: form.company.trim() || null,
      sort_order: Number(form.sort_order) || 100,
      published: form.published,
    };

    const saved = editingItem
      ? await update({ id: editingItem.id, ...payload })
      : await create(payload);
    if (!saved) return;
    startEdit(saved, true);
  };

  const onDelete = async (item: Testimonial) => {
    const ok = await remove(item.id);
    if (!ok) return;
    if (editingItem?.id === item.id) closeEditor();
  };

  return (
    <AdminMasterDetail
      title="Testimonials"
      description="Manage client quotes shown on the homepage testimonials section."
      addLabel="Add Testimonial"
      onAdd={startCreate}
      onBack={closeEditor}
      formId="admin-testimonial-form"
      canSubmit={canSubmit}
      isSaving={isSaving}
      submitLabel={editingItem ? "Save Changes" : "Add Testimonial"}
      error={error}
      sidebar={
        isLoading ? (
          <AdminSidebarSkeleton />
        ) : testimonials.length === 0 ? (
          <AdminSidebarEmpty>No testimonials yet.</AdminSidebarEmpty>
        ) : (
          testimonials.map((item) => {
            const selected = isEditorOpen && editingItem?.id === item.id;
            return (
              <AdminSidebarCard key={item.id} selected={selected} onClick={() => startEdit(item)}>
                <div className="space-y-1.5 p-3">
                  <p className={adminSidebarTitleClass(selected)}>{item.author_name}</p>
                  {(item.author_role || item.company) ? (
                    <p className={adminSidebarMutedClass(selected)}>
                      {[item.author_role, item.company].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                  <p className={adminSidebarMutedClass(selected)}>“{item.quote}”</p>
                  {!item.published ? <p className={adminSidebarMutedClass(selected)}>Draft</p> : null}
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={!isEditorOpen ? "Testimonial detail" : editingItem ? "Edit Testimonial" : "Add Testimonial"}
      detailDescription={
        !isEditorOpen
          ? "Choose a testimonial from the sidebar, or add a new one."
          : "Quote, author, and company shown on the homepage."
      }
      detailActions={
        isEditorOpen && editingItem ? (
          <Button variant="outline" size="sm" type="button" onClick={() => void onDelete(editingItem)}>
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </Button>
        ) : null
      }
      isEditorOpen={isEditorOpen}
      skeleton={<AdminDetailSkeleton withImage={false} />}
    >
      <form id="admin-testimonial-form" onSubmit={onSubmit} className="grid gap-4">
        <textarea
          className="layer-1 rounded-md px-3 py-2 text-sm"
          placeholder="Quote"
          rows={4}
          value={form.quote}
          onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="layer-1 rounded-md px-3 py-2 text-sm"
            placeholder="Author name"
            value={form.author_name}
            onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
          />
          <input
            className="layer-1 rounded-md px-3 py-2 text-sm"
            placeholder="Author role / title"
            value={form.author_role}
            onChange={(e) => setForm((f) => ({ ...f, author_role: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="layer-1 rounded-md px-3 py-2 text-sm"
            placeholder="Company / location (optional)"
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
          />
          <input
            type="number"
            className="layer-1 rounded-md px-3 py-2 text-sm"
            placeholder="Sort order"
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          Published on homepage
        </label>
      </form>
    </AdminMasterDetail>
  );
}
