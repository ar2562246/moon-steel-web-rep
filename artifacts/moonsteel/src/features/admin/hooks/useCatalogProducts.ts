"use client";

import { useCallback, useEffect, useState } from "react";
import type { CatalogProduct } from "@/features/catalog/types";
import {
  createCatalogProduct,
  deleteCatalogProduct,
  fetchCatalogProducts,
  updateCatalogProduct,
} from "@/features/admin/services/catalogProducts";

type ProductInput = {
  name: string;
  slug: string;
  details: string;
  sort_order: number;
  published: boolean;
  image_urls: string[];
  category_ids: string[];
};

type UpdateInput = ProductInput & {
  id: string;
  previous_image_urls: string[];
};

export function useCatalogProducts() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      setProducts(await fetchCatalogProducts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load catalog products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: ProductInput, files: File[] = []) => {
    setError(null);
    setIsSaving(true);
    try {
      const created = await createCatalogProduct(input, files);
      setProducts((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create product.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (input: UpdateInput, files: File[] = []) => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateCatalogProduct(input, files);
      setProducts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)).sort((a, b) => a.sort_order - b.sort_order)
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update product.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(
    async (product: CatalogProduct) => {
      setError(null);
      const prev = products;
      setProducts((current) => current.filter((item) => item.id !== product.id));
      try {
        await deleteCatalogProduct(product);
      } catch (e) {
        setProducts(prev);
        setError(e instanceof Error ? e.message : "Failed to delete product.");
      }
    },
    [products]
  );

  return { products, isLoading, isSaving, error, refresh, create, update, remove };
}
