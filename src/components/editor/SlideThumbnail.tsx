"use client";

import { SlideNode } from "@/types/slide";

interface Props {
  nodes: SlideNode[];
}

const fontSizeMap: Record<number, string> = {
  12: "0.75rem",
  14: "0.875rem",
  16: "1rem",
  18: "1.125rem",
  22: "1.375rem",
  28: "1.75rem",
  32: "2rem",
  36: "2.25rem",
  40: "2.5rem",
};

function getClosestSize(fontSize: number): string {
  const sizes = Object.keys(fontSizeMap).map(Number);
  const closest = sizes.reduce((a, b) =>
    Math.abs(b - fontSize) < Math.abs(a - fontSize) ? b : a,
  );
  return fontSizeMap[closest];
}

export default function SlideThumbnail({ nodes }: Props) {
  // عرض canvas اصلی ۸۰۰px، thumbnail 152px → scale = 0.19
  const CANVAS_W = 800;
  const THUMB_W = 152;
  const scale = THUMB_W / CANVAS_W;

  return (
    <div
      style={{
        width: THUMB_W,
        height: THUMB_W / (16 / 9),
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
        // Container داخلی با اندازه واقعی canvas، ولی scale شده
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_W / (16 / 9),
            transform: `scale(${scale})`,
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
            <ThumbnailNode key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}

function ThumbnailNode({ node }: { node: SlideNode }) {
  if (node.type === "image") {
    return node.content ? (
      <img
        src={node.content}
        alt=""
        style={{
          maxHeight: 200,
          maxWidth: "100%",
          borderRadius: 8,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    ) : (
      <div
        style={{
          height: 60,
          background: "#1e293b",
          borderRadius: 8,
          flexShrink: 0,
        }}
      />
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
        }}
      >
        {node.columns?.map((col) => (
          <div
            key={col.id}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {col.nodes.map((cn) =>
              cn.type === "image" ? (
                cn.content ? (
                  <img
                    key={cn.id}
                    src={cn.content}
                    alt=""
                    style={{
                      width: "100%",
                      borderRadius: 6,
                      objectFit: "cover",
                      maxHeight: 80,
                    }}
                  />
                ) : (
                  <div
                    key={cn.id}
                    style={{
                      height: 40,
                      background: "#1e293b",
                      borderRadius: 6,
                    }}
                  />
                )
              ) : (
                <p
                  key={cn.id}
                  style={{
                    color: cn.style?.color ? `#${cn.style.color}` : "#ffffff",
                    fontSize: cn.style?.fontSize
                      ? getClosestSize(cn.style.fontSize)
                      : "0.875rem",
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
                    lineHeight: 1.3,
                  }}
                >
                  {cn.content}
                </p>
              ),
            )}
          </div>
        ))}
      </div>
    );
  }

  // text / title / paragraph / section
  const fontSize = node.style?.fontSize ?? 16;
  return (
    <p
      style={{
        color: node.style?.color ? `#${node.style.color}` : "#ffffff",
        fontSize: getClosestSize(fontSize),
        fontWeight:
          node.style?.fontWeight === "bold"
            ? 700
            : node.style?.fontWeight === "semibold"
              ? 600
              : node.style?.fontWeight === "medium"
                ? 500
                : 400,
        fontStyle: node.style?.italic ? "italic" : "normal",
        textAlign: (node.style?.textAlign as any) ?? "left",
        margin: 0,
        lineHeight: 1.3,
        flexShrink: 0,
      }}
    >
      {node.content}
    </p>
  );
}
