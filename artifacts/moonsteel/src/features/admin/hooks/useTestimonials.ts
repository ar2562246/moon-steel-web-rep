"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonials,
  updateTestimonial,
} from "@/features/admin/services/testimonials";
import type { Testimonial } from "@/features/testimonials/types";

type CreateInput = {
  quote: string;
  author_name: string;
  author_role: string;
  company?: string | null;
  sort_order: number;
  published: boolean;
};

type UpdateInput = CreateInput & {
  id: string;
};

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const rows = await fetchTestimonials();
      setTestimonials(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load testimonials.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: CreateInput) => {
    setError(null);
    setIsSaving(true);
    try {
      const created = await createTestimonial(input);
      setTestimonials((prev) =>
        [...prev, created].sort((a, b) => a.sort_order - b.sort_order),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create testimonial.");
    } finally {
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(
    async (id: string) => {
      setError(null);
      const prev = testimonials;
      setTestimonials((current) => current.filter((item) => item.id !== id));
      try {
        await deleteTestimonial(id);
      } catch (e) {
        setTestimonials(prev);
        setError(e instanceof Error ? e.message : "Failed to delete testimonial.");
      }
    },
    [testimonials],
  );

  const update = useCallback(async (input: UpdateInput) => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateTestimonial(input);
      setTestimonials((prev) =>
        prev
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.sort_order - b.sort_order),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update testimonial.");
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    testimonials,
    isLoading,
    isSaving,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
