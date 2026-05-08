---
name: architecture-patterns
description: Deep knowledge of Portfolio Studio's layered architecture. Repository Pattern, Service Layer, modular components, DRY/CLEAN/SOLID principles, and step-by-step guide to implementing any new feature end-to-end without breaking separation of concerns.
---

## Layer Map
src/types/slide.ts → shared types (start here always)
src/lib/repositories/ → DB queries (Prisma, scoped to userId)
src/lib/services/ → business logic (multi-repo or complex ops)
src/app/api/ → REST endpoints (auth + validate + delegate)
src/hooks/ → data-fetching hooks (SWR/fetch wrappers)
src/components/ → pure UI (no API calls, no Prisma)
src/store/editorStore.ts → client editor state (Zustand)
src/config/ → constants, default configs


## New Feature Checklist (never skip steps)
1. **Type First** → define/extend types in `src/types/slide.ts`
2. **Repository** → add typed query functions in `src/lib/repositories/`
3. **Service** → if business logic spans >1 repo or has rules, add `src/lib/services/`
4. **API Route** → thin layer: auth check → input validation → call service → return `{ data }`
5. **Hook** → wrap API call in `src/hooks/use[Feature].ts` for components to consume
6. **Component** → pure UI, receives data via props or hook, zero business logic
7. **Store** → only if the feature touches the canvas editor

## Code Quality Gates
- Functions: max ~20 lines — if longer, extract
- Files: max ~200 lines — if longer, split by responsibility
- DRY: if logic appears 2+ times → extract to util or service
- No `any` — use `unknown` + type guard if truly unknown
- No magic numbers → `src/config/` constants