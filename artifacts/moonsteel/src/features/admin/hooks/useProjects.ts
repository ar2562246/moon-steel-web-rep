"use client";

import { useCallback, useEffect, useState } from "react";
import type { Project } from "@/features/projects/types";
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from "@/features/admin/services/projects";

type ProjectInput = {
  title: string;
  slug: string;
  scope: string;
  industry: string;
  location?: string;
  materials?: string;
  description?: string;
  specs?: string;
  sort_order: number;
  published: boolean;
  image_urls: string[];
};

type UpdateInput = ProjectInput & {
  id: string;
  previous_image_urls: string[];
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const rows = await fetchProjects();
      setProjects(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: ProjectInput, files: File[] = []) => {
    setError(null);
    setIsSaving(true);
    try {
      const created = await createProject(input, files);
      setProjects((prev) =>
        [...prev, created].sort((a, b) => a.sort_order - b.sort_order)
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create project.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (input: UpdateInput, files: File[] = []) => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateProject(input, files);
      setProjects((prev) =>
        prev
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.sort_order - b.sort_order)
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update project.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(
    async (project: Project) => {
      setError(null);
      const prev = projects;
      setProjects((current) => current.filter((item) => item.id !== project.id));
      try {
        await deleteProject(project);
      } catch (e) {
        setProjects(prev);
        setError(e instanceof Error ? e.message : "Failed to delete project.");
      }
    },
    [projects]
  );

  return {
    projects,
    isLoading,
    isSaving,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
