"use client";

import { useEditorStore } from "@/store/editorStore";
import { FONTS } from "@/config/fonts";

interface FontSectionProps {
  id: string;
}

/**
 * Injects a Google Fonts <link> into <head> if not already loaded.
 * Safe to call multiple times — checks by data-font-id attribute.
 */
function ensureFontLoaded(fontId: string, googleUrl: string | null) {
  if (!googleUrl) return;
  if (document.querySelector(`link[data-font-id="${fontId}"]`)) return;

  // Preconnects (idempotent)
  const origins = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];
  origins.forEach((origin, i) => {
    if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      if (i === 1) link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  });

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = googleUrl;
  link.setAttribute("data-font-id", fontId);
  document.head.appendChild(link);
}

export function FontSection({ id }: FontSectionProps) {
  const updateNodeStyle = useEditorStore((s) => s.updateNodeStyle);
  const node = useEditorStore((s) => s.getSelectedNode());

  const currentFamily = node?.styles?.fontFamily ?? "";

  function applyFont(fontId: string, family: string, googleUrl: string | null) {
    ensureFontLoaded(fontId, googleUrl);
    if (fontId === "default") {
      updateNodeStyle(id, { fontFamily: "" });
    } else {
      updateNodeStyle(id, { fontFamily: family });
    }
  }

  const englishFonts = FONTS.filter((f) => f.lang === "en");
  const persianFonts = FONTS.filter((f) => f.lang === "fa");

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
        Font
      </p>

      {/* Default */}
      <button
        onClick={() => applyFont("default", "", null)}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition font-medium ${
          !currentFamily
            ? "bg-indigo-600 text-white"
            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
        }`}
      >
        Default (inherit)
      </button>

      {/* English Fonts */}
      <p className="text-xs text-slate-500">English Fonts</p>
      <div className="grid grid-cols-2 gap-1.5">
        {englishFonts.map((font) => (
          <button
            key={font.id}
            onClick={() => applyFont(font.id, font.family, font.googleUrl)}
            style={{ fontFamily: font.family }}
            className={`text-left px-3 py-2 rounded-lg text-sm transition ${
              currentFamily === font.family
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {font.label}
          </button>
        ))}
      </div>

      {/* Persian Fonts */}
      {persianFonts.length > 0 && (
        <>
          <p className="text-xs text-slate-500">فونت‌های فارسی</p>
          <div className="grid grid-cols-2 gap-1.5 direction-rtl">
            {persianFonts.map((font) => (
              <button
                key={font.id}
                onClick={() => applyFont(font.id, font.family, font.googleUrl)}
                style={{ fontFamily: font.family }}
                dir="rtl"
                className={`text-left px-3 py-2 rounded-lg text-sm transition ${
                  currentFamily === font.family
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {font.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
