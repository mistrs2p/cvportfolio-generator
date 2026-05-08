export const SLIDE_CONFIG = {
  padding: 32, // px
  gap: 16, // px
  canvasWidth: 800, // px
  canvasHeight: 450, // ← باید این باشه نه 169
  thumbnailWidth: 152,
  backgroundColor: "#0f172a",
  exportWidth: 1280,
  exportHeight: 720,
} as const;

export interface SlidePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  icon?: string;
}

export const SLIDE_PRESETS: SlidePreset[] = [
  { id: "ppt-widescreen", label: "PowerPoint 16:9", width: 1280, height: 720 },
  { id: "ppt-standard", label: "PowerPoint 4:3", width: 960, height: 720 },
  { id: "hd-169", label: "HD 16:9", width: 1920, height: 1080 },
  { id: "default", label: "Default (16:9)", width: 800, height: 450 },
  { id: "square", label: "Square 1:1", width: 800, height: 800 },
  { id: "a4-landscape", label: "A4 Landscape", width: 1123, height: 794 },
  { id: "a4-portrait", label: "A4 Portrait", width: 794, height: 1123 },
  { id: "instagram", label: "Instagram Post", width: 1080, height: 1080 },
  { id: "story", label: "Story 9:16", width: 720, height: 1280 },
];
