"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductCategory } from "@/features/admin/types";
import {
  createProductCategory,
  deleteProductCategory,
  fetchProductCategories,
  updateProductCategory,
} from "@/features/admin/services/productCategories";

type CreateInput = {
  title: string;
  specs: string;
  description: string;
  uses: string;
  sort_order: number;
};

type UpdateInput = CreateInput & {
  id: string;
};

export function useProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const rows = await fetchProductCategories();
      setCategories(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories.");
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
      const created = await createProductCategory(input);
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.sort_order - b.sort_order)
      );
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create category.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(
    async (id: string) => {
      setError(null);
      const prev = categories;
      setCategories((current) => current.filter((item) => item.id !== id));
      try {
        await deleteProductCategory(id);
        return true;
      } catch (e) {
        setCategories(prev);
        setError(e instanceof Error ? e.message : "Failed to delete category.");
        return false;
      }
    },
    [categories]
  );

  const update = useCallback(async (input: UpdateInput) => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateProductCategory(input);
      setCategories((prev) =>
        prev
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.sort_order - b.sort_order)
      );
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update category.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    categories,
    isLoading,
    isSaving,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
