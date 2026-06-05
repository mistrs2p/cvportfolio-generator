// src/config/fonts.ts
export const FONTS = [
  {
    id: "default",
    label: "Default (inherit)",
    family: "",
    lang: "en",
    googleUrl: null,
  },
  {
    id: "inter",
    label: "Inter",
    family: "var(--font-inter)",
    lang: "en",
    googleUrl: null,
  },
  {
    id: "playfair",
    label: "Playfair Display",
    family: "var(--font-playfair-display)",
    lang: "en",
    googleUrl: null,
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    family: "var(--font-dm-sans)",
    lang: "en",
    googleUrl: null,
  },
  // فارسی‌ها (Vazirmatn و بقیه باید به همین شکل fix بشن اگه کار نمی‌کنن)
  {
    id: "vazirmatn",
    label: "وزیرمتن",
    family: "var(--font-vazirmatn)",
    lang: "fa",
    googleUrl: null,
  },
  {
    id: "noto-sans-arabic",
    label: "نوتو عربی",
    family: "var(--font-noto-arabic)",
    lang: "fa",
    googleUrl: null,
  },
  {
    id: "scheherazade",
    label: "شهرزاد",
    family: "var(--font-scheherazade)",
    lang: "fa",
    googleUrl: null,
  },
] as const;
