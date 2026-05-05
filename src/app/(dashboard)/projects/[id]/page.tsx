"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Loader2,
  LayoutTemplate,
  ArrowLeft,
  GripVertical,
} from "lucide-react";

interface Slide {
  id: string;
  title?: string;
  order: number;
  createdAt: string;
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function fetchSlides() {
    const res = await fetch(`/api/projects/${id}/slides`);
    const data = await res.json();
    setSlides(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchSlides();
  }, [id]);

  async function handleNewSlide() {
    setCreating(true);
    const res = await fetch(`/api/projects/${id}/slides`, { method: "POST" });
    const slide = await res.json();
    setCreating(false);
    router.push(`/projects/${id}/slides/${slide.id}`);
  }

  async function handleDelete(slideId: string, e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/projects/${id}/slides/${slideId}`, { method: "DELETE" });
    setSlides((prev) => prev.filter((s) => s.id !== slideId));
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white">Project Slides</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {slides.length} slides
            </p>
          </div>
        </div>
        <button
          onClick={handleNewSlide}
          disabled={creating}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Slide
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && slides.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
            <LayoutTemplate className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            No slides yet
          </h3>
          <p className="text-slate-400 text-sm max-w-xs mb-6">
            Create your first slide to start building your portfolio
            presentation
          </p>
          <button
            onClick={handleNewSlide}
            disabled={creating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Create First Slide
          </button>
        </div>
      )}

      {/* Slides Grid */}
      {!loading && slides.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slides.map((slide, index) => (
            <Link key={slide.id} href={`/projects/${id}/slides/${slide.id}`}>
              <div className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer">
                {/* Slide Preview */}
                <div className="bg-slate-800 h-36 flex items-center justify-center relative">
                  <GripVertical className="w-5 h-5 text-slate-600 absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition" />
                  <LayoutTemplate className="w-10 h-10 text-slate-600" />
                  <span className="absolute bottom-2 right-2 text-xs text-slate-600 font-mono">
                    #{index + 1}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {slide.title || `Slide ${index + 1}`}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(slide.createdAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(slide.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
