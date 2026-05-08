"use client";

import { useRef, useState, useCallback, JSX } from "react";
import { useEditorStore } from "@/store/editorStore";
import { SlideNode } from "@/types/slide";
import clsx from "clsx";
import { Trash2, Copy } from "lucide-react";
import { DraggableNode } from "./dnd/DraggableNode";

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function NodeToolbar({
  node,
  onDelete,
  onDuplicate,
}: {
  node: SlideNode;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div
      className="absolute -top-7 left-0 flex items-center gap-1 z-30 pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="bg-indigo-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
        &lt;{node.tag}&gt;
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="bg-slate-700 hover:bg-slate-500 text-slate-200 text-[10px] px-1.5 py-0.5 rounded transition flex items-center gap-0.5"
      >
        <Copy className="w-2.5 h-2.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="bg-red-600/80 hover:bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded transition flex items-center gap-0.5"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

// ─── Drop Overlay — نشانگر بصری وقتی drag وارد container میشه ──────────────

function DropOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 border-2 border-dashed border-indigo-400 bg-indigo-500/10 rounded pointer-events-none z-20 flex items-center justify-center">
      <span className="text-indigo-300 text-xs font-medium bg-slate-900/80 px-2 py-1 rounded">
        Drop here
      </span>
    </div>
  );
}

// ─── SlideNodeRenderer ────────────────────────────────────────────────────────

interface Props {
  node: SlideNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isChild?: boolean;
}
import { parseArbitraryClasses } from "@/lib/editor/parseArbitraryClass";

export function SlideNodeRenderer({
  node,
  isSelected,
  onSelect,
  isChild = false,
}: Props) {
  const {
    updateNodeContent,
    removeNode,
    duplicateNode,
    selectedNodeId,
    selectNode,
    addNode, // ← این رو اضافه کن
  } = useEditorStore();
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const CONTAINER_TAGS = ["div", "section", "ul", "ol"];
  const isContainer = CONTAINER_TAGS.includes(node.tag);
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(node.id);
    },
    [node.id, onSelect],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const nonEditable = ["img", "div", "section", "ul", "ol"];
      if (nonEditable.includes(node.tag)) return;
      setIsEditing(true);
      setTimeout(() => {
        const el = contentRef.current;
        if (!el) return;
        el.focus();
        const r = document.createRange();
        r.selectNodeContents(el);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(r);
      }, 0);
    },
    [node.tag],
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const text = contentRef.current?.innerText ?? "";
    updateNodeContent(node.id, text);
  }, [node.id, updateNodeContent]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        contentRef.current?.blur();
      }
      const singleLine = [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "span",
        "a",
        "li",
        "button",
      ];
      if (e.key === "Enter" && singleLine.includes(node.tag)) {
        e.preventDefault();
        contentRef.current?.blur();
      }
    },
    [node.tag],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!isContainer) return;
      e.stopPropagation();
      dragCounter.current++;
      setIsDragOver(true);
    },
    [isContainer],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isContainer) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
    },
    [isContainer],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!isContainer) return;
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragOver(false);
      }
    },
    [isContainer],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!isContainer) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragOver(false);
      const raw = e.dataTransfer.getData("element");
      if (!raw) return;
      try {
        addNode(JSON.parse(raw), node.id);
      } catch {
        console.error("Drop parse error");
      }
    },
    [isContainer, node.id, addNode],
  );

  // ─── کلاس مشترک wrapper ─────────────────────────────────────────────────────
  const wrapperClass = clsx(
    "group/node", // ← relative رو DraggableNode داره
    !isChild && "w-full",
    isSelected &&
      !isEditing &&
      "outline outline-2 outline-indigo-500 outline-offset-1",
    !isSelected &&
      !isEditing &&
      (isChild
        ? "hover:outline hover:outline-1 hover:outline-slate-600 hover:outline-offset-0 rounded"
        : "hover:outline hover:outline-1 hover:outline-slate-500 hover:outline-offset-1"),
  );
  const arbitraryStyles = parseArbitraryClasses(node.className ?? "");

  // ── IMG ──────────────────────────────────────────────────────────────────────
  if (node.tag === "img") {
    return (
      <DraggableNode node={node} className={wrapperClass} onClick={handleClick}>
        {isSelected && (
          <NodeToolbar
            node={node}
            onDelete={() => removeNode(node.id)}
            onDuplicate={() => duplicateNode(node.id)}
          />
        )}
        <img
          src={
            node.content ||
            "https://placehold.co/600x300/1e293b/94a3b8?text=Image"
          }
          alt={node.attributes?.alt ?? ""}
          className={node.className}
          draggable={false} // ← مهم: img خودش draggable نباشه
        />
      </DraggableNode>
    );
  }

  // ── Container (div, section, ul, ol) ─────────────────────────────────────────
  const containerTags = ["div", "section", "ul", "ol"];
  // Container (div, section, ul, ol)
  if (containerTags.includes(node.tag)) {
    const Tag = node.tag as keyof JSX.IntrinsicElements;
    return (
      <DraggableNode node={node} className={wrapperClass} onClick={handleClick}>
        {isSelected && (
          <NodeToolbar
            node={node}
            onDelete={() => removeNode(node.id)}
            onDuplicate={() => duplicateNode(node.id)}
          />
        )}
        {isDragOver && (
          <div className="absolute inset-0 border-2 border-dashed border-indigo-400 bg-indigo-500/10 rounded pointer-events-none z-20 flex items-center justify-center">
            <span className="text-indigo-300 text-xs font-medium bg-slate-900/80 px-2 py-1 rounded">
              Drop here
            </span>
          </div>
        )}
        {/* ← دیگه onDragEnter/Over/Leave/Drop اینجا نیست */}
        <Tag
          className={node.className}
          dir={node.attributes?.dir as string | undefined}
          style={{ ...arbitraryStyles, ...node.styles }}
          {...node.attributes}
        >
          {node.children && node.children.length > 0 ? (
            node.children.map((child) => (
              <SlideNodeRenderer
                key={child.id}
                node={child}
                isSelected={selectedNodeId === child.id}
                onSelect={selectNode}
                isChild
              />
            ))
          ) : (
            <span className="text-slate-600 text-xs italic pointer-events-none select-none block p-2">
              &lt;{node.tag}&gt;
            </span>
          )}
        </Tag>
      </DraggableNode>
    );
  }

  // ── Text Elements ─────────────────────────────────────────────────────────────
  const Tag = node.tag as React.ElementType;
  return (
    <DraggableNode
      node={node}
      className={wrapperClass}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isSelected && !isEditing && (
        <NodeToolbar
          node={node}
          onDelete={() => removeNode(node.id)}
          onDuplicate={() => duplicateNode(node.id)}
        />
      )}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-indigo-400 bg-indigo-500/10 rounded pointer-events-none z-20 flex items-center justify-center">
          <span className="text-indigo-300 text-xs font-medium bg-slate-900/80 px-2 py-1 rounded">
            Drop here
          </span>
        </div>
      )}
      <Tag
        ref={contentRef}
        dir={node.attributes?.dir as string | undefined}
        {...node.attributes}
        onDragEnter={handleDragEnter} // ← جدید
        onDragOver={handleDragOver} // ← جدید
        onDragLeave={handleDragLeave} // ← جدید
        onDrop={handleDrop}
        className={clsx(
          node.className,
          isEditing && "outline-none cursor-text",
        )}
        style={{ ...arbitraryStyles, ...node.styles }}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...(node.tag === "a" ? { href: node.attributes?.href ?? "#" } : {})}
      >
        {node.content}
      </Tag>
      {isSelected && !isEditing && (
        <span className="absolute -bottom-5 left-0 text-[9px] text-indigo-400 whitespace-nowrap pointer-events-none select-none">
          Double click to edit
        </span>
      )}
    </DraggableNode>
  );
}
