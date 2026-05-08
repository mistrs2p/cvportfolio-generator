// src/components/editor/SlideCanvas.tsx
"use client";
import { useRef, useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { SlideNodeRenderer } from "./SlideNodeRenderer";
import type { ElementDefinition, SlideSettings } from "@/types/slide";
import { clsx } from "clsx";

function buildBackground(settings: SlideSettings): React.CSSProperties {
  if (!settings) return { backgroundColor: "#0f172a" };
  if (settings.backgroundType === "gradient") {
    return {
      background: `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientFrom}, ${settings.gradientTo})`,
    };
  }
  return { backgroundColor: settings.backgroundColor };
}

export default function SlideCanvas() {
  // ✅ اصلاح: selectedNodeId نه selectedId
  const {
    slides,
    currentSlideIndex,
    selectedNodeId,
    selectNode,
    slideSettings,
    addNode,
  } = useEditorStore();

  // اینم درسته
  // const nodes = slides[currentSlideIndex]?.nodes ?? [];
  const nodes = useEditorStore(
    (s) => s.slides[s.currentSlideIndex]?.nodes ?? [],
  );
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      try {
        const raw = e.dataTransfer.getData("element");
        console.log("Drop raw data:", raw);
        if (!raw) return;
        const item = JSON.parse(raw) as ElementDefinition;
        console.log("Adding node:", item);
        addNode(item);
      } catch (err) {
        console.error("Drop error:", err);
      }
    },
    [addNode],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // ✅ ضروری برای اینکه drop کار کنه
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // ✅ فقط وقتی واقعاً از canvas خارج شدیم
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const bgStyle = buildBackground(slideSettings);

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-950 overflow-auto p-8">
        <div
          ref={canvasRef}
          id="slide-canvas"
          onClick={(e) => {
            if (e.target === canvasRef.current) selectNode(null);
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            width: `${slideSettings.canvasWidth}px`,
            minHeight: `${slideSettings.canvasHeight}px`,
            padding: `${slideSettings.padding}px`,
            gap: `${slideSettings.gap}px`,
            display: "flex",
            flexDirection: "column",
            ...bgStyle,
          }}
          className={clsx(
            "relative shadow-2xl transition-all",
            isDragOver &&
              "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950",
          )}
        >
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <p className="text-slate-600 text-sm">
                drag elements here or click to add
              </p>
            </div>
          )}
          {nodes.map((node) => (
            <SlideNodeRenderer
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id} // ✅ اصلاح شد
              onSelect={selectNode}
            />
          ))}
        </div>
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
          <span className="text-xs text-slate-600 font-mono">
            {slideSettings.canvasWidth} × {slideSettings.canvasHeight}px
          </span>
        </div>
    </div>
  );
}
