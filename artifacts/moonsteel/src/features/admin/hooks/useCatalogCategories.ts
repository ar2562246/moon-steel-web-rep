"use client";

import { useCallback, useEffect, useState } from "react";
import type { CatalogCategory } from "@/features/catalog/types";
import {
  createCatalogCategory,
  deleteCatalogCategory,
  fetchCatalogCategories,
  updateCatalogCategory,
} from "@/features/admin/services/catalogCategories";

type CategoryInput = {
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  published: boolean;
};

type UpdateInput = CategoryInput & { id: string };

export function useCatalogCategories() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      setCategories(await fetchCatalogCategories());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: CategoryInput) => {
    setError(null);
    setIsSaving(true);
    try {
      const created = await createCatalogCategory(input);
      setCategories((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create category.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (input: UpdateInput) => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateCatalogCategory(input);
      setCategories((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)).sort((a, b) => a.sort_order - b.sort_order)
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update category.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    const prev = categories;
    setCategories((current) => current.filter((item) => item.id !== id));
    try {
      await deleteCatalogCategory(id);
    } catch (e) {
      setCategories(prev);
      setError(e instanceof Error ? e.message : "Failed to delete category.");
    }
  }, [categories]);

  return { categories, isLoading, isSaving, error, refresh, create, update, remove };
}
