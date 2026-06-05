"use client";

import { useState, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import clsx from "clsx";
import type { SlideNode } from "@/types/slide";

const CONTAINER_TAGS = ["div", "section", "ul", "ol"];

type DropZone = "before" | "after" | "inside" | null;

interface Props {
  node: SlideNode;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  isSelected?: boolean;
}

export function DraggableNode({
  node,
  children,
  className,
  onClick,
  onDoubleClick,
}: Props) {
  const moveNode = useEditorStore((s) => s.moveNode);
  const addNode = useEditorStore((s) => s.addNode); // ← اضافه شد
  const [dropZone, setDropZone] = useState<DropZone>(null);
  const dragCounter = useRef(0);
  const isContainer = CONTAINER_TAGS.includes(node.tag);

  function handleDragStart(e: React.DragEvent) {
    e.stopPropagation();
    e.dataTransfer.setData("nodeId", node.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    if (isContainer && ratio > 0.25 && ratio < 0.75) {
      setDropZone("inside");
    } else {
      setDropZone(ratio <= 0.5 ? "before" : "after");
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    e.stopPropagation();
    dragCounter.current++;
  }

  function handleDragLeave(e: React.DragEvent) {
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDropZone(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    const zone = dropZone; // snapshot قبل از reset
    setDropZone(null);

    // ── حالت ۱: از Palette (ElementDefinition) ──
    const elementRaw = e.dataTransfer.getData("element");
    if (elementRaw) {
      try {
        const elementDef = JSON.parse(elementRaw);
        if (zone === "inside" && isContainer) {
          addNode(elementDef, node.id); // داخل این container
        } else {
          // before/after → بذار SlideCanvas هندل کنه (stopPropagation نزن)
          // ولی چون stopPropagation زدیم، خودمون addNode می‌زنیم بدون parentId
          addNode(elementDef);
        }
      } catch {
        console.error("[DraggableNode] element parse error");
      }
      return;
    }

    // ── حالت ۲: reorder بین nodeهای canvas ──
    const draggedId = e.dataTransfer.getData("nodeId");
    if (draggedId && zone && draggedId !== node.id) {
      moveNode(draggedId, node.id, zone);
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={clsx(
        className,
        "relative",
        dropZone === "before" &&
          "before:absolute before:inset-x-0 before:-top-[2px] before:h-[2px] before:bg-indigo-400 before:rounded-full before:z-50 before:content-['']",
        dropZone === "after" &&
          "after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[2px] after:bg-indigo-400 after:rounded-full after:z-50 after:content-['']",
        dropZone === "inside" && "ring-2 ring-inset ring-indigo-400",
      )}
    >
      {children}
    </div>
  );
}
