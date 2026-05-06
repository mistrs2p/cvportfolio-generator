// src/components/editor/SlideThumbnail.tsx
"use client";

import { SlideNode, ColumnContentNode } from "@/types/slide";

interface Props {
  nodes: SlideNode[];
}

const CANVAS_W = 800;
const CANVAS_H = 450;
const THUMB_W = 152;
const SCALE = THUMB_W / CANVAS_W;

const fontSizeMap: Record<number, number> = {
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  22: 22,
  28: 28,
  32: 32,
  36: 36,
  40: 40,
};

function getClosestSize(fontSize: number): number {
  const sizes = Object.keys(fontSizeMap).map(Number);
  return sizes.reduce((a, b) =>
    Math.abs(b - fontSize) < Math.abs(a - fontSize) ? b : a,
  );
}

function MiniColumnNode({ cn }: { cn: ColumnContentNode }) {
  if (cn.type === "image") {
    return cn.content ? (
      <img
        src={cn.content}
        alt=""
        style={{
          width: "100%",
          borderRadius: 6,
          objectFit: "cover",
          maxHeight: 80,
          display: "block",
        }}
      />
    ) : (
      <div
        style={{
          height: 40,
          background: "#1e293b",
          borderRadius: 6,
          border: "1px dashed #334155",
        }}
      />
    );
  }

  const fs = getClosestSize(cn.style?.fontSize ?? 14);
  const isBold =
    cn.style?.fontWeight === "bold" || cn.style?.fontWeight === "semibold";

  return (
    <p
      style={{
        color: cn.style?.color ? `#${cn.style.color}` : "#94a3b8",
        fontSize: fs,
        fontWeight: isBold ? 700 : 400,
        fontStyle: cn.style?.italic ? "italic" : "normal",
        lineHeight: 1.3,
        margin: 0,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}
    >
      {cn.content || ""}
    </p>
  );
}

function MiniNode({ node }: { node: SlideNode }) {
  if (node.type === "image") {
    return node.content ? (
      <img
        src={node.content}
        alt=""
        style={{
          width: "100%",
          borderRadius: 10,
          objectFit: "cover",
          maxHeight: 180,
          display: "block",
          flexShrink: 0,
        }}
      />
    ) : (
      <div
        style={{
          height: 70,
          background: "#1e293b",
          borderRadius: 10,
          border: "1px dashed #334155",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#334155", fontSize: 20 }}>🖼</span>
      </div>
    );
  }

  if (node.type === "columns") {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${node.columns?.length ?? 2}, 1fr)`,
          gap: 16,
          flexShrink: 0,
          width: "100%",
        }}
      >
        {node.columns?.map((col) => (
          <div
            key={col.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: "#0f2033",
              borderRadius: 8,
              padding: "10px 12px",
              borderTop: "2px solid #4f46e5",
            }}
          >
            {col.title && (
              <p
                style={{
                  color: "#818cf8",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                  paddingBottom: 6,
                  borderBottom: "1px solid #1e293b",
                }}
              >
                {col.title}
              </p>
            )}
            {col.nodes?.length === 0 && (
              <p
                style={{
                  color: "#334155",
                  fontSize: 12,
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                Empty
              </p>
            )}
            {col.nodes?.map((cn) => (
              <MiniColumnNode key={cn.id} cn={cn} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // text nodes: title, paragraph, section
  const fs = getClosestSize(node.style?.fontSize ?? 16);
  const isBold =
    node.style?.fontWeight === "bold" || node.style?.fontWeight === "semibold";
  const align = node.style?.textAlign ?? "left";

  return (
    <p
      style={{
        color: node.style?.color ? `#${node.style.color}` : "#ffffff",
        fontSize: fs,
        fontWeight: isBold
          ? 700
          : node.style?.fontWeight === "medium"
            ? 500
            : 400,
        fontStyle: node.style?.italic ? "italic" : "normal",
        textAlign: align as "left" | "center" | "right",
        lineHeight: 1.3,
        margin: 0,
        flexShrink: 0,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: node.type === "title" ? 1 : 3,
        WebkitBoxOrient: "vertical",
      }}
    >
      {node.content || ""}
    </p>
  );
}

export default function SlideThumbnail({ nodes }: Props) {
  return (
    <div
      style={{
        width: THUMB_W,
        height: Math.round(THUMB_W * (9 / 16)),
        overflow: "hidden",
        position: "relative",
        borderRadius: 6,
        background: "#0f172a",
      }}
    >
      {nodes.length === 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#334155", fontSize: 8 }}>Empty</span>
        </div>
      ) : (
        // Canvas در سایز واقعی، scaled با transform
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {nodes.map((node) => (
            <MiniNode key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
