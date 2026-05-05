"use client";

import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCheck } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

import { Eye } from "lucide-react";

interface Props {
  projectId: string;
  slideId: string;
  onSave: () => void;
}

export default function EditorHeader({ projectId, onSave }: Props) {
  const { isSaving, isDirty } = useEditorStore();

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <Link
          href={`/projects/${projectId}`}
          className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-white font-medium text-sm">Slide Editor</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs">
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              <span className="text-slate-400">Saving...</span>
            </>
          ) : isDirty ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400">Unsaved changes</span>
            </>
          ) : (
            <>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Saved</span>
            </>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
        <Link
          href={`/projects/${projectId}/preview`}
          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </Link>
      </div>
    </header>
  );
}
