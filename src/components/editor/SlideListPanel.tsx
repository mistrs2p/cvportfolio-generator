"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Trash2, Loader2 } from "lucide-react";
import { SlideNode } from "@/types/slide";
import SlideThumbnail from "./SlideThumbnail";
import { useEditorStore } from "@/store/editorStore";

interface Slide {
  id: string;
  title?: string | null;
  order: number;
  nodes: SlideNode[];
}

export default function SlideListPanel() {
  const { id, slideId } = useParams<{ id: string; slideId: string }>();
  const router = useRouter();
  const { nodes: liveNodes } = useEditorStore();

  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${id}/slides`);
      const data = await res.json();
      setSlides(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleAddSlide() {
    setAdding(true);
    const res = await fetch(`/api/projects/${id}/slides`, { method: "POST" });
    const newSlide = await res.json();
    setSlides((prev) => [...prev, newSlide]);
    setAdding(false);
    router.push(`/projects/${id}/slides/${newSlide.id}`);
  }

  async function handleDelete(sid: string) {
    if (slides.length === 1) return;
    await fetch(`/api/projects/${id}/slides/${sid}`, { method: "DELETE" });
    const updated = slides.filter((s) => s.id !== sid);
    setSlides(updated);
    if (sid === slideId && updated.length > 0) {
      router.push(`/projects/${id}/slides/${updated[0].id}`);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(slides, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i,
    }));
    setSlides(reordered);

    await fetch(`/api/projects/${id}/slides/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slides: reordered.map((s) => ({ id: s.id, order: s.order })),
      }),
    });
  }

  if (loading) {
    return (
      <aside className="w-44 bg-slate-900 border-r border-slate-800 flex items-center justify-center shrink-0">
        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
      </aside>
    );
  }

  return (
    <aside className="w-44 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-slate-800 shrink-0">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          Slides
        </span>
        <span className="text-slate-600 text-xs">{slides.length}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {slides.map((slide, index) => (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                index={index}
                isActive={slide.id === slideId}
                // اسلاید فعلی → از liveNodes استفاده می‌کنیم
                nodes={slide.id === slideId ? liveNodes : slide.nodes}
                onSelect={() =>
                  router.push(`/projects/${id}/slides/${slide.id}`)
                }
                onDelete={() => handleDelete(slide.id)}
                canDelete={slides.length > 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add Slide Button */}
      <div className="p-2 border-t border-slate-800 shrink-0">
        <button
          onClick={handleAddSlide}
          disabled={adding}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl
            border border-dashed border-slate-700 hover:border-indigo-500/50
            text-slate-500 hover:text-indigo-400 text-xs transition"
        >
          {adding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          New Slide
        </button>
      </div>
    </aside>
  );
}

// ─── Sortable Item ────────────────────────────────────────
function SortableSlideItem({
  slide,
  index,
  isActive,
  nodes,
  onSelect,
  onDelete,
  canDelete,
}: {
  slide: Slide;
  index: number;
  isActive: boolean;
  nodes: SlideNode[];
  onSelect: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-1.5 rounded-xl border
        transition cursor-pointer select-none
        ${
          isActive
            ? "border-indigo-500/60 bg-indigo-600/10"
            : "border-transparent hover:bg-slate-800"
        }
        ${isDragging ? "shadow-2xl shadow-black/40" : ""}
      `}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1.5 text-slate-700 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 touch-none"
      >
        <GripVertical className="w-3 h-3" />
      </button>

      {/* Slide Thumbnail */}
      <button
        onClick={onSelect}
        className="flex-1 flex flex-col items-start py-2 pr-1 min-w-0"
      >
        <div
          className={`w-full rounded-lg mb-1.5 overflow-hidden border
            ${isActive ? "border-indigo-500/40" : "border-slate-700/50"}`}
        >
          <SlideThumbnail nodes={nodes} />
        </div>
        <span
          className={`text-xs truncate w-full text-left leading-tight
            ${isActive ? "text-indigo-300" : "text-slate-400"}`}
        >
          {slide.title || `Slide ${index + 1}`}
        </span>
      </button>

      {/* Delete */}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 mr-1 rounded-lg
            text-slate-600 hover:text-red-400 hover:bg-slate-700
            transition shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
