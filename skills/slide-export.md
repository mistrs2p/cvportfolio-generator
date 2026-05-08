---
name: slide-export
description: Expert in Portfolio Studio's slide rendering and export pipeline. Covers SlideRenderer shared component, preview page, export API route (HTML/PDF), and maintaining pixel-perfect consistency between canvas and exported output.
---

## Export Pipeline
Client request
→ POST /api/projects/[id]/slides/[slideId]/export
→ exportService.ts (orchestrates rendering)
→ SlideRenderer.tsx (shared render logic)
→ HTML string / PDF buffer
→ Response

## Key Files
- Export API: `src/app/api/projects/[id]/slides/[slideId]/export/route.ts`
- Preview: `src/app/(editor)/projects/[id]/preview/page.tsx`
- Shared renderer: `src/components/shared/SlideRenderer.tsx`

## Invariants
- `SlideRenderer.tsx` is the ONLY place that translates slide JSON → HTML
- Never duplicate rendering logic — both preview and export use the same component
- Export styles must be self-contained (inline CSS) — no Tailwind class dependency at render time
- Pixel measurements in the editor (px) must map 1:1 to export output

## Adding a New Exportable Element
1. Add rendering case in `SlideRenderer.tsx` first
2. Verify it renders identically in preview page
3. Then expose via export API