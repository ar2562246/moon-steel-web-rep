"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteContactInquiry,
  fetchContactInquiries,
  updateContactInquiryStatus,
} from "@/features/admin/services/contactInquiries";
import type { ContactInquiry, ContactInquiryStatus } from "@/features/admin/types";

export function useContactInquiries() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const rows = await fetchContactInquiries();
      setInquiries(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inquiries.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateStatus = useCallback(async (id: string, status: ContactInquiryStatus) => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateContactInquiryStatus(id, status);
      setInquiries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update inquiry.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(
    async (id: string) => {
      setError(null);
      const prev = inquiries;
      setInquiries((current) => current.filter((item) => item.id !== id));
      try {
        await deleteContactInquiry(id);
        return true;
      } catch (e) {
        setInquiries(prev);
        setError(e instanceof Error ? e.message : "Failed to delete inquiry.");
        return false;
      }
    },
    [inquiries]
  );

  return {
    inquiries,
    isLoading,
    isSaving,
    error,
    refresh,
    updateStatus,
    remove,
  };
}
