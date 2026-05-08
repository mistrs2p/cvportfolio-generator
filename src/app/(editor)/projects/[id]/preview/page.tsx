'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { SlideNode } from '@/types/slide';
import { ArrowLeft, Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { SlideView } from '@/components/shared/SlideRenderer';
import { useEditorStore } from '@/store/editorStore';

interface Slide {
  id: string;
  title?: string;
  order: number;
  nodes: SlideNode[];
}

// Canvas dimensions — must match SlideCanvas for pixel-perfect parity
const CANVAS_W = 800;
const CANVAS_H = Math.round(CANVAS_W * (9 / 16)); // 450

export default function PreviewPage() {
  const { id } = useParams() as { id: string };
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Get global slide settings from store (background color, etc.)
  const slideSettings = useEditorStore((s) => s.slideSettings);

  // Load all slides for this project
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${id}/slides`);
        if (!res.ok) throw new Error('Failed to load slides');
        const data = await res.json();
        setSlides(data);
      } catch (err) {
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setCurrent((p) => Math.min(p + 1, slides.length - 1));
      if (e.key === 'ArrowLeft') setCurrent((p) => Math.max(p - 1, 0));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides.length]);

  // PDF Export
  async function handleExport() {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const { default: jsPDF } = await import('jspdf');

      const slideEls = exportRef.current.querySelectorAll<HTMLElement>('.export-slide');
      if (slideEls.length === 0) {
        setExporting(false);
        return;
      }

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720],
        hotfixes: ['px_scaling'],
      });

      for (let i = 0; i < slideEls.length; i++) {
        const canvas = await html2canvas(slideEls[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: slideSettings.backgroundColor,
          allowTaint: true,
          logging: false,
          width: slideEls[i].offsetWidth,
          height: slideEls[i].offsetHeight,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      }

      pdf.save(`presentation-${id}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  // Loading state
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
      {/* Top bar */}
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
            {slides.length > 0 ? `${current + 1} / ${slides.length}` : '0'}
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
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {/* Slide viewport */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        {slides.length === 0 || !slide ? (
          <p className="text-slate-500 text-sm">No slides in this project</p>
        ) : (
          <div
            className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden"
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              maxWidth: '100%',
              flexShrink: 0,
            }}
          >
            <SlideView nodes={slide.nodes} />

            {/* Prev button */}
            {current > 0 && (
              <button
                onClick={() => setCurrent((p) => p - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Next button */}
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

      {/* Dot navigation */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-4 shrink-0">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? 'bg-indigo-400 w-4'
                  : 'bg-slate-600 hover:bg-slate-400 w-2'
              }`}
            />
          ))}
        </div>
      )}

      {/* Off-screen PDF export container */}
      <div
        ref={exportRef}
        className="fixed -left-[9999px] top-0 pointer-events-none"
        aria-hidden="true"
      >
        {slides.map((s) => (
          <div
            key={s.id}
            className="export-slide bg-slate-900"
            style={{ width: 1280, height: 720, overflow: 'hidden', position: 'relative' }}
          >
            <SlideView nodes={s.nodes} settings={slideSettings} />
          </div>
        ))}
      </div>
    </div>
  );
}