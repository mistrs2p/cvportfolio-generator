"use client";

import { useRef, useState, useCallback, JSX, createElement } from "react";
import { useEditorStore } from "@/store/editorStore";
import type { SlideNode } from "@/types/slide";
import clsx from "clsx";
import { Trash2, Copy } from "lucide-react";
import { DraggableNode } from "./dnd/DraggableNode";
import { parseArbitraryClasses } from "@/lib/editor/parseArbitraryClass";

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

// ─── Drop Overlay ─────────────────────────────────────────────────────────────
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

// ─── Resize Handle ────────────────────────────────────────────────────────────
// خارج از SlideNodeRenderer تا Rules of Hooks نقض نشه
function ResizeHandle({ nodeId }: { nodeId: string }) {
  const isDragging = useRef(false);
  const startData = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentNode = useEditorStore.getState().findNodeById(nodeId);
      const styles = (currentNode?.styles ?? {}) as Record<string, string>;
      const currentW = parseFloat(styles.width) || 200;
      const currentH = parseFloat(styles.height) || 150;

      isDragging.current = true;
      startData.current = {
        x: e.clientX,
        y: e.clientY,
        w: currentW,
        h: currentH,
      };

      const { updateNodeStyle } = useEditorStore.getState();

      const onMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = ev.clientX - startData.current.x;
        const dy = ev.clientY - startData.current.y;
        const newW = Math.max(40, startData.current.w + dx);
        const newH = Math.max(40, startData.current.h + dy);

        updateNodeStyle(nodeId, {
          width: `${Math.round(newW)}px`,
          height: `${Math.round(newH)}px`,
        } as Record<string, string>);
      };

      const onUp = () => {
        isDragging.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [nodeId],
  );

  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-40 flex items-center justify-center opacity-0 group-hover/node:opacity-100"
      title="Drag to resize"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M11 1L1 11M7 1L1 7M11 5L5 11"
          stroke="#818cf8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ─── Allowed tags whitelist ───────────────────────────────────────────────────
const ALLOWED_TAGS: ReadonlySet<keyof JSX.IntrinsicElements> = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "a",
  "strong",
  "em",
  "div",
  "section",
  "article",
  "ul",
  "ol",
  "li",
  "img",
  "button",
  "hr",
  "blockquote",
]);

function getSafeTag(tag?: string): keyof JSX.IntrinsicElements {
  if (tag && ALLOWED_TAGS.has(tag as keyof JSX.IntrinsicElements)) {
    return tag as keyof JSX.IntrinsicElements;
  }
  return "div";
}

// ─── Build merged inline styles ───────────────────────────────────────────────
function buildInlineStyle(
  node: SlideNode,
  arbitraryStyles: React.CSSProperties,
): React.CSSProperties {
  return {
    ...arbitraryStyles,
    ...(node.styles as React.CSSProperties | undefined),
  };
}

// ─── Helper: safe props بدون union type explosion ────────────────────────────
// از Record<string, unknown> استفاده می‌کنه تا ts(2590) نگیریم
// و با createElement به‌جای JSX spread پاس میشه
function buildTagProps(
  node: SlideNode,
  extra: Record<string, unknown>,
): Record<string, unknown> {
  const safeAttrs = (node.attributes ?? {}) as Record<string, unknown>;
  return { ...safeAttrs, ...extra };
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CONTAINER_TAGS = ["div", "section", "ul", "ol"] as const;

// ─── Main Renderer ────────────────────────────────────────────────────────────
interface Props {
  node: SlideNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isChild?: boolean;
}

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
    addNode,
  } = useEditorStore();

  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const isContainer = (CONTAINER_TAGS as readonly string[]).includes(node.tag);

  // ── Event Handlers ────────────────────────────────────────────────────────
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
        window.getSelection?.()?.removeAllRanges();
        window.getSelection?.()?.addRange(r);
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

  // ── Shared wrapper class ──────────────────────────────────────────────────
  const wrapperClass = clsx(
    "group/node relative",
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
  const inlineStyle = buildInlineStyle(node, arbitraryStyles);

  // ─── IMG ──────────────────────────────────────────────────────────────────
  if (node.tag === "img") {
    return (
      <DraggableNode
        node={node}
        className={wrapperClass}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {isSelected && (
          <NodeToolbar
            node={node}
            onDelete={() => removeNode(node.id)}
            onDuplicate={() => duplicateNode(node.id)}
          />
        )}

        {node.content ? (
          <img
            src={node.content}
            alt={(node.attributes?.alt as string) ?? ""}
            className={node.className}
            style={inlineStyle}
            draggable={false}
          />
        ) : (
          <div
            className={clsx(
              node.className,
              "flex items-center justify-center bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg",
            )}
            style={{ ...inlineStyle, minHeight: "150px" }}
          >
            <span className="text-slate-500 text-sm">
              Click properties → set image
            </span>
          </div>
        )}

        {isSelected && <ResizeHandle nodeId={node.id} />}
      </DraggableNode>
    );
  }

  // ─── HR ───────────────────────────────────────────────────────────────────
  if (node.tag === "hr") {
    return (
      <DraggableNode node={node} className={wrapperClass} onClick={handleClick}>
        {isSelected && (
          <NodeToolbar
            node={node}
            onDelete={() => removeNode(node.id)}
            onDuplicate={() => duplicateNode(node.id)}
          />
        )}
        <hr className={node.className} style={inlineStyle} />
      </DraggableNode>
    );
  }

  // ─── Container (div / section / ul / ol) ─────────────────────────────────
  if (isContainer) {
    const Tag = getSafeTag(node.tag);

    const containerProps = buildTagProps(node, {
      className: node.className,
      style: inlineStyle,
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    });

    const containerChildren =
      node.children && node.children.length > 0
        ? node.children.map((child) => (
            <SlideNodeRenderer
              key={child.id}
              node={child}
              isSelected={selectedNodeId === child.id}
              onSelect={selectNode}
              isChild
            />
          ))
        : createElement(
            "span",
            {
              className:
                "text-slate-600 text-xs italic pointer-events-none select-none block p-2",
            },
            `<${node.tag}>`,
          );

    return (
      <DraggableNode node={node} className={wrapperClass} onClick={handleClick}>
        {isSelected && (
          <NodeToolbar
            node={node}
            onDelete={() => removeNode(node.id)}
            onDuplicate={() => duplicateNode(node.id)}
          />
        )}
        <DropOverlay active={isDragOver} />
        {createElement(Tag, containerProps, containerChildren)}
      </DraggableNode>
    );
  }

  // ─── Text / Inline elements ───────────────────────────────────────────────
  const Tag = getSafeTag(node.tag);

  const textProps = buildTagProps(node, {
    className: clsx(node.className, isEditing && "outline-none cursor-text"),
    style: inlineStyle,
    contentEditable: isEditing ? true : undefined,
    suppressContentEditableWarning: true,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    ref: contentRef,
    ...(node.tag === "a" ? { href: node.attributes?.href ?? "#" } : {}),
  });

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
      <DropOverlay active={isDragOver} />

      {/* FIX ts(2590): از createElement به‌جای JSX spread استفاده شده
          تا TypeScript union inference روی IntrinsicElements trigger نشه */}
      {createElement(Tag, textProps, node.content)}

      {isSelected && !isEditing && (
        <span className="absolute -bottom-5 left-0 text-[9px] text-indigo-400 whitespace-nowrap pointer-events-none select-none">
          Double click to edit
        </span>
      )}
    </DraggableNode>
  );
}
