// components/slides/IconPickerModal.tsx
"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { TECH_ICONS, getIconUrl } from "@/lib/icons";

interface Props {
  onSelect: (icon: string, label: string) => void;
  onClose: () => void;
}

export default function IconPickerModal({ onSelect, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [label, setLabel] = useState("");

  const filtered = TECH_ICONS.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase()),
  );

  function handleConfirm() {
    if (!selected) return;
    const defaultLabel =
      TECH_ICONS.find((i) => i.slug === selected)?.label ?? selected;
    onSelect(selected, label || defaultLabel);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-130 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h3 className="text-white font-semibold text-sm">Choose an Icon</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
              autoFocus
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-3 grid grid-cols-6 gap-2">
          {filtered.map((icon) => (
            <button
              key={icon.slug}
              onClick={() => {
                setSelected(icon.slug);
                setLabel(icon.label);
              }}
              title={icon.label}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition group ${
                selected === icon.slug
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-transparent hover:border-slate-600 hover:bg-slate-800"
              }`}
            >
              <img
                src={getIconUrl(icon.slug)}
                alt={icon.label}
                className="w-7 h-7 object-contain opacity-80 group-hover:opacity-100"
              />
              <span className="text-[10px] text-slate-400 truncate w-full text-center">
                {icon.label}
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-6 text-center text-slate-500 text-sm py-8">
              No icons found
            </div>
          )}
        </div>

        {/* Label input + Confirm */}
        {selected && (
          <div className="px-5 py-4 border-t border-slate-700 flex items-center gap-3">
            <img
              src={getIconUrl(selected)}
              alt={selected}
              className="w-8 h-8 object-contain shrink-0"
            />
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (e.g. React.js)"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
            />
            <button
              onClick={handleConfirm}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition shrink-0"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
