"use client";

import { useEffect, useState } from "react";
import { Plus, FolderOpen, Loader2 } from "lucide-react";
import ProjectCard from "@/components/dashboard/ProjectCard";
import NewProjectModal from "@/components/dashboard/NewProjectModal";

interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: { slides: number };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();

      if (!res.ok) {
        console.error("Projects API error:", data);
        setProjects([]);
        return;
      }

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  function handleCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    setShowModal(false);
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">پروژه‌های من</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {projects.length} پروژه
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          پروژه جدید
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            هنوز پروژه‌ای ندارید
          </h3>
          <p className="text-slate-400 text-sm max-w-xs mb-6">
            اولین پروژه خود را بسازید و شروع به ایجاد اسلایدهای حرفه‌ای کنید
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            اولین پروژه را بسازید
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDeleted={(id) =>
                setProjects((prev) => prev.filter((p) => p.id !== id))
              }
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
