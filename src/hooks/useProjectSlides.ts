"use client";

import { useCallback, useEffect, useState } from "react";
import type { SlideNode } from "@/types/slide";

export interface Slide {
  id: string;
  title: string;
  order: number;
  nodes: SlideNode[];
}

export function useProjectSlides(projectId: string) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSlides = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/projects/${projectId}/slides`);
      if (!res.ok) throw new Error("Failed to load slides");
      const data: Slide[] = await res.json();
      setSlides(data);
    } catch (err) {
      console.error("[PROJECT_SLIDES_REFRESH]", err);
      setError("Failed to load slides");
    }
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/projects/${projectId}/slides`);
        if (!res.ok) throw new Error("Failed to load slides");

        const data: Slide[] = await res.json();
        if (!cancelled) setSlides(data);
      } catch (err) {
        console.error("[PROJECT_SLIDES_LOAD]", err);
        if (!cancelled) setError("Failed to load slides");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const createSlide = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/slides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Slide" }),
    });

    const newSlide = await res.json();
    await refreshSlides();
    return newSlide as Slide;
  }, [projectId, refreshSlides]);

  const duplicateSlide = useCallback(
    async (slideId: string) => {
      setDuplicatingId(slideId);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/slides/${slideId}/duplicate`,
          { method: "POST" },
        );

        const newSlide = await res.json();
        await refreshSlides();
        return newSlide as Slide;
      } finally {
        setDuplicatingId(null);
      }
    },
    [projectId, refreshSlides],
  );

  const deleteSlide = useCallback(
    async (slideId: string) => {
      await fetch(`/api/projects/${projectId}/slides/${slideId}`, {
        method: "DELETE",
      });
      await refreshSlides();
    },
    [projectId, refreshSlides],
  );

  const reorderSlides = useCallback(
    async (orderedIds: string[]) => {
      await fetch(`/api/projects/${projectId}/slides/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    },
    [projectId],
  );

  return {
    slides,
    loading,
    error,
    duplicatingId,
    refreshSlides,
    createSlide,
    duplicateSlide,
    deleteSlide,
    reorderSlides,
  };
}
