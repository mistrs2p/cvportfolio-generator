"use client";
import { SlideNode, ColumnContentNode } from "@/types/slide";
import { SLIDE_CONFIG } from "@/config/slideConfig";

// Font size map
const FONTSIZEMAP: Record<number, string> = {
  12: "text-xs",
  14: "text-sm",
  16: "text-base",
  18: "text-lg",
  20: "text-lg",
  22: "text-xl",
  24: "text-2xl",
  28: "text-2xl",
  30: "text-3xl",
  32: "text-3xl",
  36: "text-4xl",
  40: "text-5xl",
  48: "text-6xl",
};

function closestFontSize(fontSize: number): number {
  return Object.keys(FONTSIZEMAP)
    .map(Number)
    .reduce((a, b) =>
      Math.abs(b - fontSize) < Math.abs(a - fontSize) ? b : a,
    );
}

// همین export ها که قبلاً بودن (برای SlideCanvas که import می‌کنه)
export const SLIDEPADDING = SLIDE_CONFIG.padding;
export const SLIDEGAP = SLIDE_CONFIG.gap;

// Column content node
function ColumnNode({ cn }: { cn: ColumnContentNode }) {
  if (cn.type === "image") {
    return cn.content ? (
      <img
        src={cn.content}
        alt=""
        className="w-full rounded-lg object-cover"
        style={{ maxHeight: 160 }}
      />
    ) : (
      <div className="h-14 bg-slate-800/50 rounded-lg flex items-center justify-center border border-dashed border-slate-700">
        <p className="text-slate-500 text-xs">No image</p>
      </div>
    );
  }
  return (
    <p
      style={{
        color: cn.style?.color ?? "#ffffff",
        fontSize: cn.style?.fontSize ? `${cn.style.fontSize}px` : "14px",
        fontWeight:
          cn.style?.fontWeight === "bold"
            ? 700
            : cn.style?.fontWeight === "semibold"
              ? 600
              : cn.style?.fontWeight === "medium"
                ? 500
                : 400,
        fontStyle: cn.style?.italic ? "italic" : "normal",
        margin: 0,
        lineHeight: 1.4,
      }}
    >
      {cn.content}
    </p>
  );
}

// Single node renderer
export function SlideNodeRenderer({ node }: { node: SlideNode }) {
  if (node.type === "image") {
    return node.content ? (
      <div className="shrink-0" style={{ maxHeight: 200 }}>
        <img
          src={node.content}
          alt=""
          className="rounded-xl object-cover w-full"
          style={{ maxHeight: 200, maxWidth: "100%" }}
        />
      </div>
    ) : null;
  }
  if (node.type === "columns") {
    return (
      <div
        className="grid gap-6 w-full shrink-0"
        style={{
          gridTemplateColumns: `repeat(${node.columns?.length ?? 2}, 1fr)`,
        }}
      >
        {node.columns?.map((col) => (
          <div key={col.id} className="flex flex-col gap-2">
            {!col.nodes || col.nodes.length === 0 ? (
              <p className="text-slate-600 text-xs italic">Empty column</p>
            ) : (
              col.nodes.map((cn) => <ColumnNode key={cn.id} cn={cn} />)
            )}
          </div>
        ))}
      </div>
    );
  }
  const fontSize = node.style?.fontSize ?? 16;
  const closest = closestFontSize(fontSize);
  return (
    <p
      className={[
        "shrink-0 leading-snug",
        FONTSIZEMAP[closest],
        `text-${node.style?.textAlign ?? "left"}`,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        color: node.style?.color ?? "#ffffff",
        fontWeight:
          node.style?.fontWeight === "bold"
            ? 700
            : node.style?.fontWeight === "semibold"
              ? 600
              : node.style?.fontWeight === "medium"
                ? 500
                : 400,
        fontStyle: node.style?.italic ? "italic" : "normal",
      }}
    >
      {node.content}
    </p>
  );
}

// ─── SlideView ───────────────────────────────────────────────
type SlideSettings = typeof SLIDE_CONFIG;

interface SlideViewProps {
  nodes: SlideNode[];
  className?: string;
  settings?: Partial<SlideSettings>; // ← اضافه شد
}

export function SlideView({ nodes, className, settings }: SlideViewProps) {
  // مقادیر را از settings بگیر، در غیر این صورت از SLIDE_CONFIG
  const padding = settings?.padding ?? SLIDE_CONFIG.padding;
  const gap = settings?.gap ?? SLIDE_CONFIG.gap;

  if (!nodes?.length) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-slate-600 text-sm">Empty slide</p>
      </div>
    );
  }
  return (
    <div
      className={className ?? "absolute inset-0 overflow-hidden"}
      style={{
        padding,
        display: "flex",
        flexDirection: "column",
        gap,
        overflow: "hidden",
      }}
    >
      {nodes.map((node) => (
        <SlideNodeRenderer key={node.id} node={node} />
      ))}
    </div>
  );
}
