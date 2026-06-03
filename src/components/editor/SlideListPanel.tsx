"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Loader2, Copy, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useProjectSlides, type Slide } from "@/hooks/useProjectSlides";
import { SlideNode } from "@/types/slide";

export default function SlideListPanel() {
  const { id, slideId } = useParams<{ id: string; slideId: string }>();
  const router = useRouter();

  const {
    slides,
    loading,
    duplicatingId,
    createSlide,
    duplicateSlide,
    deleteSlide,
    reorderSlides,
  } = useProjectSlides(id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const slideIds = useMemo(() => slides.map((s) => s.id), [slides]);

  async function handleAdd() {
    const newSlide = await createSlide();
    router.push(`/projects/${id}/slides/${newSlide.id}`);
  }

  async function handleDuplicate(e: React.MouseEvent, targetSlideId: string) {
    e.stopPropagation();
    const newSlide = await duplicateSlide(targetSlideId);
    router.push(`/projects/${id}/slides/${newSlide.id}`);
  }

  async function handleDelete(e: React.MouseEvent, targetSlideId: string) {
    e.stopPropagation();
    if (slides.length === 1) return;

    const remaining = slides.filter((s) => s.id !== targetSlideId);
    await deleteSlide(targetSlideId);

    if (targetSlideId === slideId && remaining.length > 0) {
      router.push(`/projects/${id}/slides/${remaining[0].id}`);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(slides, oldIndex, newIndex);

    await reorderSlides(reordered.map((s) => s.id));
  }

  if (loading) {
    return (
      <aside className="w-52 bg-slate-900 border-r border-slate-800 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
      </aside>
    );
  }

  return (
    <aside className="w-52 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Slides
        </span>
        <button
          onClick={handleAdd}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="Add slide"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slideIds}
            strategy={verticalListSortingStrategy}
          >
            {slides.map((slide, index) => (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                index={index}
                isActive={slide.id === slideId}
                isDuplicating={duplicatingId === slide.id}
                canDelete={slides.length > 1}
                onClick={() =>
                  router.push(`/projects/${id}/slides/${slide.id}`)
                }
                onDuplicate={(e) => handleDuplicate(e, slide.id)}
                onDelete={(e) => handleDelete(e, slide.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  );
}

function SortableSlideItem({
  slide,
  index,
  isActive,
  isDuplicating,
  canDelete,
  onClick,
  onDuplicate,
  onDelete,
}: {
  slide: Slide;
  index: number;
  isActive: boolean;
  isDuplicating: boolean;
  canDelete: boolean;
  onClick: () => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={clsx(
        "group relative rounded-xl border cursor-pointer transition overflow-hidden",
        isActive
          ? "border-indigo-500 bg-slate-800"
          : "border-slate-700/50 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800",
      )}
      onClick={onClick}
    >
      <SlideThumbnail nodes={slide.nodes} />

      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition z-20 cursor-grab active:cursor-grabbing bg-slate-800/90 rounded-full px-2 py-0.5"
        title="Drag to reorder"
      >
        <div className="flex gap-0.5">
          <span className="w-0.5 h-3 bg-slate-400 rounded-full" />
          <span className="w-0.5 h-3 bg-slate-400 rounded-full" />
          <span className="w-0.5 h-3 bg-slate-400 rounded-full" />
        </div>
      </div>

      <div className="absolute top-1.5 left-1.5 bg-slate-900/80 rounded-md px-1.5 py-0.5">
        <span className="text-slate-400 text-[10px] font-medium">
          {index + 1}
        </span>
      </div>

      <div
        className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onDuplicate}
          disabled={isDuplicating}
          className="p-1 rounded-md bg-slate-700/90 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
          title="Duplicate"
        >
          {isDuplicating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
        <button
          onClick={onDelete}
          disabled={!canDelete}
          className="p-1 rounded-md bg-slate-700/90 hover:bg-red-600 text-slate-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="px-2 py-1.5">
        <p className="text-xs text-slate-300 truncate">{slide.title}</p>
      </div>

      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500" />
      )}
    </div>
  );
}

function SlideThumbnail({ nodes }: { nodes: SlideNode[] }) {
  return (
    <div className="w-full bg-slate-950 relative overflow-hidden pointer-events-none aspect-video">
      {nodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-slate-800 text-[8px]">Empty</span>
        </div>
      ) : (
        <div className="absolute inset-0 p-1.5 flex flex-col gap-1 overflow-hidden">
          {nodes.slice(0, 6).map((node) => (
            <MiniNode key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}

function MiniNode({ node }: { node: SlideNode }) {
  if (node.type === "image") {
    return node.content ? (
      <div className="w-full rounded overflow-hidden shrink-0 max-h-6">
        <img
          src={node.content}
          alt=""
          className="w-full h-full object-cover max-h-6"
        />
      </div>
    ) : (
      <div className="w-full h-4 rounded bg-slate-800 shrink-0" />
    );
  }

  if (node.type === "container") {
    return <div className="w-full h-4 rounded bg-slate-800/60 shrink-0" />;
  }

  const isHeading = node.type === "heading";

  return (
    <div
      className={clsx(
        "rounded shrink-0 truncate",
        isHeading
          ? "h-2.5 bg-slate-500/60 w-3/4"
          : "h-1.5 bg-slate-700/80 w-full",
      )}
      style={{
        backgroundColor: node.styles?.color
          ? `${node.styles.color}40`
          : undefined,
      }}
    />
  );
}
