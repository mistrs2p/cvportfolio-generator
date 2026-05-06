"use client";

import { useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/store/editorStore";
import EditorSidebar from "@/components/editor/EditorSidebar";
import SlideCanvas from "@/components/editor/SlideCanvas";
import PropertiesPanel from "@/components/editor/PropertiesPanel";
import EditorHeader from "@/components/editor/EditorHeader";
import SlideListPanel from "@/components/editor/SlideListPanel";

export default function SlideEditorPage() {
  const { id, slideId } = useParams<{ id: string; slideId: string }>();

  const { setNodes, nodes, isDirty, setIsSaving, setIsDirty, undo, redo } =
    useEditorStore();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${id}/slides/${slideId}`);
      const slide = await res.json();
      setNodes(slide.nodes ?? []);
    }
    load();
  }, [id, slideId, setNodes]);

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

  const save = useCallback(async () => {
    setIsSaving(true);

    try {
      await fetch(`/api/projects/${id}/slides/${slideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes }),
      });
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [id, slideId, nodes, setIsSaving, setIsDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(save, 1500);
    return () => clearTimeout(timer);
  }, [isDirty, save]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <EditorHeader projectId={id} slideId={slideId} onSave={save} />
      <div className="flex flex-1 overflow-hidden">
        <SlideListPanel />
        <EditorSidebar />
        <SlideCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
