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
import { useTestimonials } from "@/features/admin/hooks/useTestimonials";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canSubmit = useMemo(
    () =>
      form.quote.trim().length > 10 &&
      form.author_name.trim().length > 1 &&
      form.author_role.trim().length > 1,
    [form],
  );

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

    if (editingId) {
      await update({ id: editingId, ...payload });
    } else {
      await create(payload);
    }

    setEditingId(null);
    setForm(initialForm);
    setIsDialogOpen(false);
  };

  const startEdit = (id: string) => {
    const row = testimonials.find((x) => x.id === id);
    if (!row) return;
    setEditingId(id);
    setForm({
      quote: row.quote,
      author_name: row.author_name,
      author_role: row.author_role,
      company: row.company ?? "",
      sort_order: row.sort_order,
      published: row.published,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <div className="space-y-6">
      <Card className="layer-1">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Testimonials</CardTitle>
            <Button type="button" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading testimonials...</p> : null}
          {!isLoading && testimonials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No testimonials yet.</p>
          ) : null}
          {!isLoading && testimonials.length > 0 ? (
            <div className="space-y-3">
              {testimonials.map((item) => (
                <div
                  key={item.id}
                  className="layer-2 flex flex-col gap-3 rounded-lg p-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">&ldquo;{item.quote}&rdquo;</p>
                    <p className="text-sm font-semibold text-foreground">{item.author_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[item.author_role, item.company].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sort {item.sort_order} · {item.published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => startEdit(item.id)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => void remove(item.id)}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            <DialogDescription>
              Manage client quotes shown on the homepage testimonials section.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="grid gap-4">
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))
                }
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isSaving}>
                {isSaving ? "Saving..." : editingId ? "Save Changes" : "Add Testimonial"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
