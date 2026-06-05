"use client";

import type { SlideNode, SlideSettings } from "@/types/slide";
import { JSX } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NodeRendererProps {
  node: SlideNode;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onContentChange?: (id: string, content: string) => void;
  isEditing?: boolean;
}

interface SlideViewProps {
  nodes: SlideNode[];
  settings?: Partial<SlideSettings>;
  // editor props (preview / shared render)
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onContentChange?: (id: string, content: string) => void;
  isEditing?: boolean;
}

// ─── Allowed tags ─────────────────────────────────────────────────────────────
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

// ─── Node Renderer ────────────────────────────────────────────────────────────
export function SlideNodeRenderer({
  node,
  selectedId,
  onSelect,
  onContentChange,
  isEditing = false,
}: NodeRendererProps) {
  const isSelected = selectedId === node.id;

  const editorWrapperClass = isEditing
    ? [
        "relative group/node outline outline-2 outline-offset-1 rounded-sm transition-all cursor-pointer",
        isSelected
          ? "outline-indigo-500"
          : "outline-transparent hover:outline-slate-600",
      ].join(" ")
    : "";

  // FIX: always spread node.styles as inline style on every rendered element
  const nodeStyle = (node.styles ?? {}) as React.CSSProperties;

  // ── IMG ────────────────────────────────────────────────────────────────
  if (node.tag === "img") {
    return (
      <div
        className={editorWrapperClass}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id);
        }}
      >
        {node.content ? (
          <img
            src={node.content}
            alt={node.attributes?.alt ?? ""}
            className={node.className}
            style={nodeStyle}
          />
        ) : (
          <div
            className={clsx(
              node.className,
              "flex items-center justify-center bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg min-h-[120px]",
            )}
          >
            <span className="text-slate-500 text-sm">
              Click properties to set image URL
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── HR ─────────────────────────────────────────────────────────────────
  if (node.tag === "hr") {
    return (
      <div
        className={editorWrapperClass}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id);
        }}
      >
        <hr className={node.className} style={nodeStyle} />
      </div>
    );
  }

  // ── Container (children) ───────────────────────────────────────────────
  if (node.children !== undefined) {
    const Tag = getSafeTag(node.tag);
    return (
      <div
        className={editorWrapperClass}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id);
        }}
      >
        <Tag className={node.className} style={nodeStyle}>
          {node.children.length === 0 && isEditing ? (
            <div className="flex items-center justify-center min-h-[60px] border-2 border-dashed border-slate-700 rounded-lg">
              <span className="text-slate-600 text-xs">
                Empty &lt;{node.tag}&gt; — add children from properties
              </span>
            </div>
          ) : (
            node.children.map((child) => (
              <SlideNodeRenderer
                key={child.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
                onContentChange={onContentChange}
                isEditing={isEditing}
              />
            ))
          )}
        </Tag>
      </div>
    );
  }

  // ── Text / contentEditable canvas ──────────────────────────────────────
  const Tag = getSafeTag(node.tag);
  return (
    <div
      className={editorWrapperClass}
      onClick={
        isEditing
          ? (e) => {
              e.stopPropagation();
              onSelect?.(node.id);
            }
          : undefined
      }
    >
      <Tag
        className={node.className}
        // FIX: apply node.styles so fontFamily is visible in preview/export
        style={nodeStyle}
        contentEditable={isEditing ? true : undefined}
        suppressContentEditableWarning
        onBlur={
          isEditing
            ? (e) =>
                onContentChange?.(node.id, e.currentTarget.textContent ?? "")
            : undefined
        }
        onKeyDown={
          isEditing
            ? (e) => {
                if (e.key === "Enter" && !e.shiftKey) e.preventDefault();
              }
            : undefined
        }
        {...(node.tag === "a"
          ? {
              href: node.attributes?.href,
              ...(node.attributes?.target
                ? { target: node.attributes.target }
                : {}),
            }
          : {})}
        {...node.attributes}
      >
        {node.content}
      </Tag>
    </div>
  );
}

// ─── Slide View ───────────────────────────────────────────────────────────────
export function SlideView({
  nodes,
  settings,
  selectedId,
  onSelect,
  onContentChange,
  isEditing = false,
}: SlideViewProps) {
  const padding = settings?.padding ?? 32;
  const gap = settings?.gap ?? 16;

  const background =
    settings?.backgroundType === "gradient"
      ? `linear-gradient(${settings.gradientAngle ?? 135}deg, ${settings.gradientFrom}, ${settings.gradientTo})`
      : (settings?.backgroundColor ?? "#0f172a");

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background }}
      onClick={isEditing ? () => onSelect?.(null) : undefined}
    >
      <div
        className="relative w-full h-full flex flex-col"
        style={{ padding, gap }}
      >
        {nodes.map((node) => (
          <SlideNodeRenderer
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={onSelect}
            onContentChange={onContentChange}
            isEditing={isEditing}
          />
        ))}

        {nodes.length === 0 && isEditing && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-600 text-sm mb-1">Canvas is empty</p>
              <p className="text-slate-700 text-xs">
                Pick an element from the sidebar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper used only inside this file — avoids importing clsx for a single use
function clsx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(" ");
}
