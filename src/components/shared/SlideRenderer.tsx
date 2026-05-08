// src/components/shared/SlideRenderer.tsx
"use client";

import { SlideNode, SlideSettings } from "@/types/slide";
import { JSX } from "react";

// ─────────────────────────────────────────────
// رندر هر node به صورت بازگشتی
// ─────────────────────────────────────────────

interface NodeRendererProps {
  node: SlideNode;
  // فقط در editor استفاده می‌شه
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onContentChange?: (id: string, content: string) => void;
  isEditing?: boolean;
}

export function SlideNodeRenderer({
  node,
  selectedId,
  onSelect,
  onContentChange,
  isEditing = false,
}: NodeRendererProps) {
  const isSelected = selectedId === node.id;
  const Tag = node.tag as keyof JSX.IntrinsicElements;

  // ── wrapper کلاس برای حالت editor ──
  const editorWrapperClass = isEditing
    ? [
        "relative group/node outline outline-2 outline-offset-1 rounded-sm transition-all cursor-pointer",
        isSelected
          ? "outline-indigo-500"
          : "outline-transparent hover:outline-slate-600",
      ].join(" ")
    : "";

  // ── img self-closing ──
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
            alt={node.attributes?.alt ?? "image"}
            className={node.className}
          />
        ) : (
          // placeholder وقتی src نداره
          <div
            className={`${node.className} flex items-center justify-center bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg min-h-[120px]`}
          >
            <span className="text-slate-500 text-sm">
              🖼 Click properties to set image URL
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── hr self-closing ──
  if (node.tag === "hr") {
    return (
      <div
        className={editorWrapperClass}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id);
        }}
      >
        <hr className={node.className} />
      </div>
    );
  }

  // ── container با children (div، ul، ol) ──
  if (node.children !== undefined) {
    return (
      <div
        className={editorWrapperClass}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id);
        }}
      >
        <Tag className={node.className}>
          {node.children.length === 0 && isEditing ? (
            // placeholder برای container خالی
            <div className="flex items-center justify-center min-h-[60px] border-2 border-dashed border-slate-700 rounded-lg">
              <span className="text-slate-600 text-xs">
                Empty {node.tag} — add children from properties
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

  // ── همه المنت‌های متنی ──
  // contentEditable برای ویرایش مستقیم روی canvas
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
        // فقط در editor قابل ویرایش مستقیم
        contentEditable={isEditing ? true : undefined}
        suppressContentEditableWarning
        onBlur={
          isEditing
            ? (e) =>
                onContentChange?.(node.id, e.currentTarget.textContent ?? "")
            : undefined
        }
        // جلوگیری از رفتن به خط جدید با Enter
        onKeyDown={
          isEditing
            ? (e) => {
                if (e.key === "Enter" && !e.shiftKey) e.preventDefault();
              }
            : undefined
        }
        // attribute‌های اختیاری
        {...(node.tag === "a" && node.attributes?.href
          ? { href: node.attributes.href }
          : {})}
        {...(node.attributes?.target ? { target: node.attributes.target } : {})}
      >
        {node.content}
      </Tag>
    </div>
  );
}

// ─────────────────────────────────────────────
// رندر کامل یه اسلاید
// ─────────────────────────────────────────────

interface SlideViewProps {
  nodes: SlideNode[];
  settings?: Partial<SlideSettings>;
  // editor props — اگه نبود، حالت preview
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onContentChange?: (id: string, content: string) => void;
  isEditing?: boolean;
}

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

  // ساخت background style
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
      {/* محتوا */}
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

        {/* وقتی canvas خالیه */}
        {nodes.length === 0 && isEditing && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-600 text-sm mb-1">Canvas is empty</p>
              <p className="text-slate-700 text-xs">
                ← Pick an element from the sidebar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
