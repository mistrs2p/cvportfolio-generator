"use client";

import { useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useEditorHistory, useEditorStore } from "@/store/editorStore";
import EditorSidebar from "@/components/editor/EditorSidebar";
import SlideCanvas from "@/components/editor/SlideCanvas";
import PropertiesPanel from "@/components/editor/PropertiesPanel";
import EditorHeader from "@/components/editor/EditorHeader";
import SlideListPanel from "@/components/editor/SlideListPanel";

export default function SlideEditorPage() {
  const { id, slideId } = useParams() as { id: string; slideId: string };
  const { nodes, isDirty, setIsSaving, setIsDirty, loadSlideData, isSaving } =
    useEditorStore();

  const { undo, redo } = useEditorHistory();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${id}/slides/${slideId}`);
        if (!res.ok) throw new Error("Failed to load slide");
        const data = await res.json();
        loadSlideData({ id: data.id, nodes: data.nodes ?? [] });
      } catch (err) {
        console.error("Load error:", err);
      }
    }
    load();
  }, [id, slideId]); // ✅ هر دو dependency هستند

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // Save function
  // ✅ فیکس — nodes رو از store لحظه save بگیر
  const save = useCallback(async () => {
    const currentSlide = useEditorStore.getState().getCurrentSlide();
    //                   ^^^ این pattern مشکل stale closure رو حل می‌کنه
    if (!currentSlide) return;

    setIsSaving(true);
    try {
      await fetch(`/api/projects/${id}/slides/${slideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: currentSlide.nodes }),
      });
      setIsDirty(false);
    } catch (err) {
      console.error("[SAVE]", err);
    } finally {
      setIsSaving(false);
    }
  }, [id, slideId, setIsSaving, setIsDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(save, 1500);
    return () => clearTimeout(timer);
  }, [isDirty, save]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <EditorHeader
        projectId={id}
        slideId={slideId}
        onSave={save}
        isSaving={isSaving}
        isDirty={isDirty}
      />
      <div className="flex flex-1 overflow-hidden">
        <SlideListPanel />
        <EditorSidebar />
        <SlideCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
