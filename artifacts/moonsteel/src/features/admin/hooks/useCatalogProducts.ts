"use client";

import { useCallback, useEffect, useState } from "react";
import type { CatalogProduct } from "@/features/catalog/types";
import {
  createCatalogProduct,
  deleteCatalogProduct,
  fetchCatalogProducts,
  updateCatalogProduct,
  type CatalogImageSlot,
} from "@/features/admin/services/catalogProducts";

type ProductInput = {
  name: string;
  slug: string;
  details: string;
  sort_order: number;
  published: boolean;
  category_ids: string[];
  sku?: string | null;
  price?: number | null;
  currency?: string | null;
  availability?: "in_stock" | "out_of_stock" | "preorder" | "available_for_order" | null;
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

  const create = useCallback(async (input: ProductInput, images: CatalogImageSlot[] = []) => {
    setError(null);
    setIsSaving(true);
    try {
      const created = await createCatalogProduct(input, images);
      setProducts((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create product.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (input: UpdateInput, images: CatalogImageSlot[] = []) => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateCatalogProduct(input, images);
      setProducts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)).sort((a, b) => a.sort_order - b.sort_order)
      );
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update product.");
      return null;
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
        return true;
      } catch (e) {
        setProducts(prev);
        setError(e instanceof Error ? e.message : "Failed to delete product.");
        return false;
      }
    },
    [products]
  );

  return { products, isLoading, isSaving, error, refresh, create, update, remove };
}
