"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCheck, Eye } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

interface Props {
  projectId: string;
  slideId: string;
  onSave: () => void;
}

export default function EditorHeader({ projectId, slideId, onSave }: Props) {
  const { isSaving, isDirty } = useEditorStore();

  const [title, setTitle] = useState("Untitled Slide");
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // لود تایتل از API
  useEffect(() => {
    async function loadTitle() {
      const res = await fetch(`/api/projects/${projectId}/slides/${slideId}`);
      const data = await res.json();
      setTitle(data.title || "Untitled Slide");
    }
    loadTitle();
  }, [slideId, projectId]);

  // focus وقتی editing شد
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function handleTitleSave() {
    setEditing(false);
    const trimmed = title.trim() || "Untitled Slide";
    setTitle(trimmed);
    await fetch(`/api/projects/${projectId}/slides/${slideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
  }

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3 w-48">
        <Link
          href={`/projects/${projectId}`}
          className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Center — Slide Title */}
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave();
              if (e.key === "Escape") {
                setEditing(false);
              }
            }}
            className="bg-slate-800 border border-indigo-500 rounded-lg px-3 py-1
              text-white text-sm font-medium outline-none text-center
              w-56 focus:ring-1 focus:ring-indigo-500 transition"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-slate-300 hover:text-white text-sm font-medium
              px-3 py-1 rounded-lg hover:bg-slate-800 transition
              max-w-56 truncate"
            title="Click to rename"
          >
            {title}
          </button>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 w-48 justify-end">
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
              <span className="text-amber-400">Unsaved</span>
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
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500
            disabled:opacity-40 disabled:cursor-not-allowed
            text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>

        <Link
          href={`/projects/${projectId}/preview`}
          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600
            text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </Link>
      </div>
    </header>
  );
}
