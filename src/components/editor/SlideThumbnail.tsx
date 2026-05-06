"use client";
import { SlideNode } from "@/types/slide";
import { SLIDE_CONFIG } from "@/config/slideConfig";
import { SlideNodeRenderer } from "@/components/shared/SlideRenderer";
import { useEditorStore } from "@/store/editorStore";

interface Props {
  nodes: SlideNode[];
}

export default function SlideThumbnail({ nodes }: Props) {
  const slideSettings = useEditorStore((s) => s.slideSettings);

  // مقادیر نهایی: از slideSettings بگیر، fallback به SLIDE_CONFIG
  const canvasWidth = slideSettings.canvasWidth ?? SLIDE_CONFIG.canvasWidth;
  const canvasHeight = Math.round((canvasWidth * 9) / 16);
  const padding = slideSettings.padding ?? SLIDE_CONFIG.padding;
  const gap = slideSettings.gap ?? SLIDE_CONFIG.gap;
  const backgroundColor =
    slideSettings.backgroundColor ?? SLIDE_CONFIG.backgroundColor;

  // thumbnailWidth همیشه ثابته (اندازه‌ی جعبه‌ی کنار)
  const thumbnailWidth = SLIDE_CONFIG.thumbnailWidth;
  const thumbnailHeight = Math.round((thumbnailWidth * 9) / 16);
  const thumbnailScale = thumbnailWidth / canvasWidth;

  return (
    <div
      style={{
        width: thumbnailWidth,
        height: thumbnailHeight,
        overflow: "hidden",
        position: "relative",
        borderRadius: 6,
        background: `#${backgroundColor}`,
      }}
    >
      {nodes.length === 0 && (
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
      )}
      {/* scale canvas */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: canvasWidth,
          height: canvasHeight,
          transform: `scale(${thumbnailScale})`,
          transformOrigin: "top left",
          padding,
          display: "flex",
          flexDirection: "column",
          gap,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {nodes.map((node) => (
          <SlideNodeRenderer key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
