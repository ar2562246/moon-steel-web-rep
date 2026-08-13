"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomerLogo } from "@/features/admin/types";
import {
  deleteCustomerLogo,
  fetchCustomerLogos,
  uploadCustomerLogo,
} from "@/features/admin/services/customerLogos";

export function useCustomerLogos() {
  const [logos, setLogos] = useState<CustomerLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const rows = await fetchCustomerLogos();
      setLogos(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load logos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onUpload = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);
    try {
      const created = await uploadCustomerLogo(file);
      setLogos((prev) => [created, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const onUploadMany = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setIsUploading(true);
    try {
      const created: CustomerLogo[] = [];
      for (const file of files) {
        // Upload sequentially to keep error handling predictable.
        // If one file fails, we surface that error and keep successful uploads.
        const row = await uploadCustomerLogo(file);
        created.push(row);
      }
      if (created.length > 0) {
        setLogos((prev) => [...created.reverse(), ...prev]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk upload failed.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const onDelete = useCallback(async (logo: CustomerLogo) => {
    setError(null);
    const prev = logos;
    setLogos((current) => current.filter((x) => x.id !== logo.id));
    try {
      await deleteCustomerLogo(logo);
      return true;
    } catch (e) {
      setLogos(prev);
      setError(e instanceof Error ? e.message : "Delete failed.");
      return false;
    }
  }, [logos]);

  return {
    logos,
    isLoading,
    isUploading,
    error,
    refresh: load,
    upload: onUpload,
    uploadMany: onUploadMany,
    remove: onDelete,
  };
}
