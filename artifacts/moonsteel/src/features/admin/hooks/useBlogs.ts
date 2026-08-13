"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createBlog,
  deleteBlog,
  fetchBlogs,
  updateBlog,
  type BlogWritePayload,
} from "@/features/admin/services/blogs";
import type { BlogPost } from "@/features/blog/types";

type UpdateInput = BlogWritePayload & {
  id: string;
  previous_cover_url: string;
};

export function useBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const rows = await fetchBlogs();
      setPosts(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: BlogWritePayload) => {
    setError(null);
    setIsSaving(true);
    try {
      const created = await createBlog(input);
      setPosts((prev) =>
        [...prev, created].sort((a, b) => a.sort_order - b.sort_order),
      );
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create blog post.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (input: UpdateInput) => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateBlog(input);
      setPosts((prev) =>
        prev
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.sort_order - b.sort_order),
      );
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update blog post.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(
    async (post: BlogPost) => {
      setError(null);
      const prev = posts;
      setPosts((current) => current.filter((item) => item.id !== post.id));
      try {
        await deleteBlog(post);
        return true;
      } catch (e) {
        setPosts(prev);
        setError(e instanceof Error ? e.message : "Failed to delete blog post.");
        return false;
      }
    },
    [posts],
  );

  return {
    posts,
    isLoading,
    isSaving,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
