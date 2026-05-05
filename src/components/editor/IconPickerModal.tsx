"use client";

import { useState } from "react";
import { X, Search, Check } from "lucide-react";
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

  function handleSelect(slug: string, defaultLabel: string) {
    setSelected(slug);
    setLabel(defaultLabel);
  }

  function handleConfirm() {
    if (!selected) return;
    onSelect(selected, label || selected);
    onClose();
  }

  // بستن با کلیک روی backdrop
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-[540px] max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <div>
            <h3 className="text-white font-semibold text-sm">Choose an Icon</h3>
            <p className="text-slate-500 text-xs mt-0.5">
              {filtered.length} icons available
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 transition p-1.5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search technologies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-slate-500 hover:text-white transition shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-slate-500 text-sm">No icons found</p>
              <p className="text-slate-600 text-xs mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {filtered.map((icon) => {
                const isSelected = selected === icon.slug;
                return (
                  <button
                    key={icon.slug}
                    onClick={() => handleSelect(icon.slug, icon.label)}
                    title={icon.label}
                    className={`
                      relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all
                      ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-transparent hover:border-slate-600 hover:bg-slate-800"
                      }
                    `}
                  >
                    {/* تیک انتخاب */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <img
                      src={getIconUrl(icon.slug)}
                      alt={icon.label}
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        // اگه آیکون لود نشد، hide کن
                        (e.currentTarget as HTMLImageElement).style.opacity =
                          "0.2";
                      }}
                    />
                    <span className="text-[10px] text-slate-400 truncate w-full text-center leading-tight">
                      {icon.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — label input + confirm */}
        <div className="px-5 py-4 border-t border-slate-700 shrink-0">
          {selected ? (
            <div className="flex items-center gap-3">
              {/* پیش‌نمایش آیکون انتخابی */}
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                <img
                  src={getIconUrl(selected)}
                  alt={selected}
                  className="w-6 h-6 object-contain"
                />
              </div>

              {/* Label */}
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Display label..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              />

              <button
                onClick={handleConfirm}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition shrink-0"
              >
                Add
              </button>
            </div>
          ) : (
            <p className="text-slate-600 text-xs text-center">
              Select an icon to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
