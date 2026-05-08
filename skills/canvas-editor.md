---
name: canvas-editor
description: Expert in the Portfolio Studio Canvas Editor. Knows SlideCanvas, PropertiesPanel, SlideNodeRenderer, Zustand editorStore, element types, drag/resize logic, and how to add new HTML elements to the canvas.
---

When working on canvas editor tasks:
- Always reference `src/store/editorStore.ts` for state shape
- Element types are defined in `src/types/slide.ts`
- Rendering logic is in `src/components/editor/SlideNodeRenderer.tsx`
- Style editing always goes through `PropertiesPanel.tsx`
- New draggable elements must follow the existing node schema

---
name: api-database
description: Expert in the API and database layer. Knows Prisma schema, NextAuth session handling, REST API route patterns in src/app/api/, and data flow from client to server.
---

When working on API or database tasks:
- Use Prisma singleton from `src/lib/db/prisma.ts`
- Auth session via `src/lib/auth/auth.ts`
- API responses must follow shape: `{ data?: T, error?: string }`
- Validate all user input before DB operations
- Never expose raw Prisma errors to the client

---
name: slide-export
description: Expert in slide rendering and export functionality. Handles SlideRenderer, preview page, and the export API route that converts slides to HTML/PDF.
---

When working on export tasks:
- Export API is at `src/app/api/projects/[id]/slides/[slideId]/export/route.ts`
- Preview page is at `src/app/(editor)/projects/[id]/preview/page.tsx`
- `SlideRenderer.tsx` is the shared rendering component used in both preview and export
- Maintain pixel-perfect consistency between editor canvas and exported output

---
name: architecture-patterns
description: Deep knowledge of Portfolio Studio's layered architecture. Repository Pattern, Service Layer, modular components, DRY/CLEAN/SOLID principles, and how to implement new features end-to-end following the project's established patterns.
---

When implementing any new feature, always follow this checklist:

1. **Type First** → Add types to `src/types/slide.ts`
2. **Repository** → Add DB queries to `src/lib/repositories/`
3. **Service** (if needed) → Business logic in `src/lib/services/`
4. **API Route** → Thin orchestration layer in `src/app/api/`
5. **Hook** (if needed) → Data-fetching hook in `src/hooks/`
6. **Component** → Pure UI in `src/components/`
7. **Store** (if editor) → Zustand action in `src/store/editorStore.ts`

Never skip layers. Never mix responsibilities.