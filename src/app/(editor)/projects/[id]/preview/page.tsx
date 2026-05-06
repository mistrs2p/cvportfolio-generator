"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { SlideNode } from "@/types/slide";
import {
  ArrowLeft,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Slide {
  id: string;
  title?: string;
  order: number;
  nodes: SlideNode[];
}

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${id}/slides`);
      const data = await res.json();
      setSlides(data);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight")
        setCurrent((p) => Math.min(p + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setCurrent((p) => Math.max(p - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  async function handleExport() {
    if (!exportRef.current) return;
    setExporting(true);

    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const { default: jsPDF } = await import("jspdf");

      const slideEls =
        exportRef.current.querySelectorAll<HTMLElement>(".export-slide");

      if (slideEls.length === 0) {
        console.warn("No slides found");
        setExporting(false);
        return;
      }

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1280, 720],
        hotfixes: ["px_scaling"],
      });

      for (let i = 0; i < slideEls.length; i++) {
        const canvas = await html2canvas(slideEls[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#0f172a",
          allowTaint: true,
          logging: false,
          width: slideEls[i].offsetWidth,
          height: slideEls[i].offsetHeight,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`presentation-${id}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const slide = slides[current] ?? null;

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <Link
          href={`/projects/${id}`}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to project
        </Link>

        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span>
            {slides.length > 0 ? `${current + 1} / ${slides.length}` : "0 / 0"}
          </span>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || slides.length === 0}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        {slides.length === 0 || !slide ? (
          <p className="text-slate-500 text-sm">No slides in this project</p>
        ) : (
          <div
            className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden w-full"
            style={{ maxWidth: "960px", aspectRatio: "16/9" }}
          >
            <SlidePreview slide={slide} />

            {current > 0 && (
              <button
                onClick={() => setCurrent((p) => p - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {current < slides.length - 1 && (
              <button
                onClick={() => setCurrent((p) => p + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-4 shrink-0">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "bg-indigo-400 w-4"
                  : "bg-slate-600 hover:bg-slate-400 w-2"
              }`}
            />
          ))}
        </div>
      )}

      <div
        ref={exportRef}
        className="fixed -left-[9999px] top-0 pointer-events-none"
        aria-hidden="true"
      >
        {slides.map((s) => (
          <div
            key={s.id}
            className="export-slide bg-slate-900"
            style={{
              width: 1280,
              height: 720,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <SlidePreview slide={s} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidePreview({ slide }: { slide: Slide }) {
  if (!slide?.nodes?.length) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-slate-600 text-sm">Empty slide</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 p-10 flex flex-col gap-4 overflow-hidden">
      {slide.nodes.map((node) => (
        <SlideNodeRenderer key={node.id} node={node} />
      ))}
    </div>
  );
}

function SlideNodeRenderer({ node }: { node: SlideNode }) {
  const fontSizeMap: Record<number, string> = {
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

  const fontSize = node.style?.fontSize ?? 16;
  const closestSize = Object.keys(fontSizeMap)
    .map(Number)
    .reduce((a, b) =>
      Math.abs(b - fontSize) < Math.abs(a - fontSize) ? b : a,
    );

  if (node.type === "image") {
    return node.content ? (
      <div className="shrink-0" style={{ maxHeight: "200px" }}>
        <img
          src={node.content}
          alt=""
          className="rounded-xl object-cover w-full"
          style={{ maxHeight: "200px", maxWidth: "100%" }}
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
              col.nodes.map((cn) => {
                if (cn.type === "image") {
                  return cn.content ? (
                    <img
                      key={cn.id}
                      src={cn.content}
                      alt=""
                      className="w-full rounded-lg object-cover max-h-32"
                    />
                  ) : (
                    <div
                      key={cn.id}
                      className="h-12 bg-slate-800/50 rounded-lg flex items-center justify-center"
                    >
                      <p className="text-slate-500 text-xs">No image</p>
                    </div>
                  );
                }

                return (
                  <p
                    key={cn.id}
                    style={{
                      color: cn.style?.color ?? "#ffffff",
                      fontSize: cn.style?.fontSize
                        ? `${cn.style.fontSize}px`
                        : "14px",
                      fontWeight: cn.style?.fontWeight ?? "normal",
                      fontStyle: cn.style?.italic ? "italic" : "normal",
                    }}
                  >
                    {cn.content}
                  </p>
                );
              })
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <p
      className={[
        "shrink-0 leading-snug",
        fontSizeMap[closestSize],
        `text-${node.style?.textAlign ?? "left"}`,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        color: node.style?.color ?? "#ffffff",
        fontWeight: node.style?.fontWeight ?? "normal",
        fontStyle: node.style?.italic ? "italic" : "normal",
      }}
    >
      {node.content}
    </p>
  );
}
