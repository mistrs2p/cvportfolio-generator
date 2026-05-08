// src/hooks/useSaveSlide.ts
"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";

const DEBOUNCE_MS = 1500; // 1.5 ثانیه بعد از آخرین تغییر

export function useSaveSlide(projectId: string, slideId: string) {
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const setIsDirty = useEditorStore((s) => s.setIsDirty);
  const setIsSaving = useEditorStore((s) => s.setIsSaving);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const slideSettings = useEditorStore((s) => s.slideSettings);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    // clear timer قبلی
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const currentSlide = getCurrentSlide();
      if (!currentSlide) return;

      setIsSaving(true);
      try {
        await fetch(`/api/projects/${projectId}/slides/${slideId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodes: currentSlide.nodes,
            slideSettings,
          }),
        });
        setIsDirty(false);
      } catch (err) {
        console.error("[AUTO_SAVE]", err);
      } finally {
        setIsSaving(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    isDirty,
    projectId,
    slideId,
    getCurrentSlide,
    slideSettings,
    setIsDirty,
    setIsSaving,
  ]);

  return { isSaving, isDirty };
}
