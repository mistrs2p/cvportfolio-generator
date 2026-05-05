"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, Trash2, Loader2, Calendar } from "lucide-react";

interface Props {
  project: {
    id: string;
    title: string;
    description?: string;
    updatedAt: string;
    _count: { slides: number };
  };
  onDeleted: (id: string) => void;
}

export default function ProjectCard({ project, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("آیا از حذف این پروژه مطمئنید؟")) return;
    setDeleting(true);
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    onDeleted(project.id);
  }

  const date = new Date(project.updatedAt).toLocaleDateString("fa-IR");

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all cursor-pointer hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5">
        {/* Icon + Delete */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition p-1 rounded-lg hover:bg-slate-800"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-sm mb-1 truncate">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-slate-400 text-xs line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
          <span className="text-slate-500 text-xs flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {project._count.slides} slides
          </span>
          <span className="text-slate-600 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
        </div>
      </div>
    </Link>
  );
}
