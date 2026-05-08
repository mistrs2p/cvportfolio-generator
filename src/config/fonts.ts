export const FONTS = [
  // ─── English Fonts ───────────────────────────────────────
  { id: "inter", label: "Inter", family: "Inter", lang: "en" as const },
  { id: "satoshi", label: "Satoshi", family: "Satoshi", lang: "en" as const },
  {
    id: "cabinet-grotesk",
    label: "Cabinet Grotesk",
    family: "Cabinet Grotesk",
    lang: "en" as const,
  },
  {
    id: "playfair",
    label: "Playfair Display",
    family: "Playfair Display",
    lang: "en" as const,
  },
  {
    id: "instrument-serif",
    label: "Instrument Serif",
    family: "Instrument Serif",
    lang: "en" as const,
  },

  // ─── Persian Fonts ────────────────────────────────────────
  { id: "sahel", label: "ساحل", family: "Sahel", lang: "fa" as const },
  {
    id: "vazirmatn",
    label: "وزیرمتن",
    family: "Vazirmatn",
    lang: "fa" as const,
  },
  {
    id: "iran-yekan",
    label: "ایران یکان",
    family: "IRANYekan",
    lang: "fa" as const,
  },
  { id: "dana", label: "دانا", family: "Dana", lang: "fa" as const },
  {
    id: "yekan-bakh",
    label: "یکان بخ",
    family: "YekanBakh",
    lang: "fa" as const,
  },
] as const;

export type FontId = (typeof FONTS)[number]["id"];
export type FontLang = (typeof FONTS)[number]["lang"];
