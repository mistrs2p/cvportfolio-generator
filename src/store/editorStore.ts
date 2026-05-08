// src/store/editorStore.ts
import { create, useStore } from "zustand";
import { temporal } from "zundo";
import { nanoid } from "nanoid";
import {
  type Slide,
  type SlideNode,
  type HTMLTag,
  type ElementDefinition,
  type SlideBackground,
  type SlideSettings,
  DEFAULTSLIDESETTINGS,
} from "@/types/slide";

export const DEFAULT_SLIDE_SETTINGS: SlideSettings = {
  backgroundType: "solid",
  backgroundColor: "#0f172a",
  gradientFrom: "#6366f1",
  gradientTo: "#8b5cf6",
  gradientAngle: 135,
  canvasWidth: 800,
  canvasHeight: 450, // ← نه 169
  padding: 32,
  gap: 16,
};

// ─── Conflict Groups (جایگزین TAILWIND_CONFLICT_GROUPS و CLASS_PREFIXES) ────

const CONFLICT_GROUPS: RegExp[][] = [
  // Font Size — فقط سایز، نه رنگ
  [/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/, /^text-\[[\d.]+(?:px|rem|em)\]$/],
  
  // Font Weight — فقط weight، نه font-family
  [/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/],
  
  // Text Color — فقط رنگ
  [
    /^text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    /^text-(white|black|transparent|current)$/,
    /^text-\[#[0-9a-fA-F]+\]$/,
  ],
  
  // Background Color
  [
    /^bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    /^bg-(white|black|transparent|current)$/,
    /^bg-\[#[0-9a-fA-F]+\]$/,
  ],
  
  // Display
  [/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/],
  
  // Flex Direction
  [/^flex-(row|row-reverse|col|col-reverse)$/],
  
  // Justify Content
  [/^justify-(start|end|center|between|around|evenly)$/],
  
  // Align Items
  [/^items-(start|end|center|baseline|stretch)$/],
  
  // Padding all sides
  [/^p-(\d+(\.\d+)?|px|\[.+\])$/],
  
  // Padding X
  [/^px-(\d+(\.\d+)?|px|\[.+\])$/],
  
  // Padding Y
  [/^py-(\d+(\.\d+)?|px|\[.+\])$/],
  
  // Padding individual sides
  [/^pt-(\d+(\.\d+)?|px|\[.+\])$/],
  [/^pb-(\d+(\.\d+)?|px|\[.+\])$/],
  [/^pl-(\d+(\.\d+)?|px|\[.+\])$/],
  [/^pr-(\d+(\.\d+)?|px|\[.+\])$/],
  
  // Margin all sides
  [/^m-(\d+(\.\d+)?|px|auto|\[.+\])$/],
  
  // Margin individual sides
  [/^mx-(\d+(\.\d+)?|px|auto|\[.+\])$/],
  [/^my-(\d+(\.\d+)?|px|auto|\[.+\])$/],
  [/^mt-(\d+(\.\d+)?|px|auto|\[.+\])$/],
  [/^mb-(\d+(\.\d+)?|px|auto|\[.+\])$/],
  [/^ml-(\d+(\.\d+)?|px|auto|\[.+\])$/],
  [/^mr-(\d+(\.\d+)?|px|auto|\[.+\])$/],
  
  // Width
  [/^w-(auto|full|screen|min|max|fit|\d+\/\d+|\d+(\.\d+)?|px|\[.+\])$/],
  
  // Height
  [/^h-(auto|full|screen|min|max|fit|\d+(\.\d+)?|px|\[.+\])$/],
  
  // Min/Max Width/Height
  [/^min-w-(\S+)$/],
  [/^max-w-(\S+)$/],
  [/^min-h-(\S+)$/],
  [/^max-h-(\S+)$/],
  
  // Border Radius
  [/^rounded(-(none|sm|md|lg|xl|2xl|3xl|full))?$/],
  
  // Border Width
  [/^border(-(0|2|4|8))?$/],
  
  // Border Color
  [/^border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/],
  
  // Gap
  [/^gap-(\d+(\.\d+)?|px|\[.+\])$/],
  [/^gap-x-(\d+(\.\d+)?|px|\[.+\])$/],
  [/^gap-y-(\d+(\.\d+)?|px|\[.+\])$/],
  
  // Grid Cols
  [/^grid-cols-(\d+|none|\[.+\])$/],
  
  // Object Fit
  [/^object-(contain|cover|fill|none|scale-down)$/],
  
  // Line Height
  [/^leading-(none|tight|snug|normal|relaxed|loose|\d+)$/],
  
  // Letter Spacing
  [/^tracking-(tighter|tight|normal|wide|wider|widest|\[.+\])$/],
  
  // Opacity
  [/^opacity-(\d+|\[.+\])$/],
  
  // Shadow
  [/^shadow(-(sm|md|lg|xl|2xl|inner|none))?$/],
  
  // Position
  [/^(static|fixed|absolute|relative|sticky)$/],
  
  // Z-index
  [/^z-(\d+|auto|\[.+\])$/],
  
  // Text Transform
  [/^(uppercase|lowercase|capitalize|normal-case)$/],
  
  // Text Decoration
  [/^(underline|overline|line-through|no-underline)$/],
  
  // Font Style
  [/^(italic|not-italic)$/],
  
  // Overflow
  [/^overflow-(hidden|auto|visible|scroll|clip)$/],
  [/^overflow-x-(hidden|auto|visible|scroll|clip)$/],
  [/^overflow-y-(hidden|auto|visible|scroll|clip)$/],
  
  // Top/Right/Bottom/Left
  [/^top-(\d+(\.\d+)?|px|auto|full|\[.+\])$/],
  [/^right-(\d+(\.\d+)?|px|auto|full|\[.+\])$/],
  [/^bottom-(\d+(\.\d+)?|px|auto|full|\[.+\])$/],
  [/^left-(\d+(\.\d+)?|px|auto|full|\[.+\])$/],
];

function classesConflict(classA: string, classB: string): boolean {
  if (classA === classB) return false;
  for (const group of CONFLICT_GROUPS) {
    const aMatches = group.some((r) => r.test(classA));
    const bMatches = group.some((r) => r.test(classB));
    if (aMatches && bMatches) return true;
  }
  return false;
}

/**
 * یه کلاس جدید رو به className اضافه می‌کنه
 * و کلاس‌های conflicting قبلی رو حذف می‌کنه
 */
function mergeTailwindClass(existingClasses: string, newClass: string): string {
  const classes = existingClasses.split(" ").filter(Boolean);
  const filtered = classes.filter((cls) => !classesConflict(cls, newClass));

  // اگه کلاس قبلاً وجود داشت، toggle کن (حذفش کن)
  if (filtered.includes(newClass)) {
    return filtered.filter((c) => c !== newClass).join(" ");
  }

  return [...filtered, newClass].join(" ");
}

/**
 * چند کلاس رو یه‌جا set می‌کنه (جایگزین گروه مربوطه)
 */
function setTailwindClasses(
  existingClasses: string,
  newClasses: string[],
): string {
  let result = existingClasses;
  for (const cls of newClasses) {
    result = mergeTailwindClass(result, cls);
  }
  return result;
}

// ─── Default Slide ───────────────────────────────────────────────────────────

function createDefaultSlide(): Slide {
  return {
    id: nanoid(),
    name: "Slide 1",
    background: {
      type: "color",
      value: "bg-white",
    },
    nodes: [],
    thumbnail: undefined,
  };
}

// ─── Node Helpers ────────────────────────────────────────────────────────────

function createNodeFromDefinition(def: ElementDefinition): SlideNode {
  const node: SlideNode = {
    id: nanoid(),
    tag: def.tag,
    content: def.defaultContent,
    className: def.defaultClassName ?? "",
    attributes: def.attributes,
    children: def.defaultChildren
      ? def.defaultChildren.map((child) => ({
          ...child,
          id: nanoid(),
          children: child.children?.map((c) => ({ ...c, id: nanoid() })),
        }))
      : undefined,
  };
  return node;
}

/**
 * یه node رو در درخت node‌ها پیدا می‌کنه و تابع updater رو روش اجرا می‌کنه
 */
function updateNodeInTree(
  nodes: SlideNode[],
  nodeId: string,
  updater: (node: SlideNode) => SlideNode,
): SlideNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node);
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateNodeInTree(node.children, nodeId, updater),
      };
    }
    return node;
  });
}

/**
 * یه node رو از درخت حذف می‌کنه
 */
function removeNodeFromTree(nodes: SlideNode[], nodeId: string): SlideNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: removeNodeFromTree(node.children, nodeId),
        };
      }
      return node;
    });
}

/**
 * یه node رو در یه node پدر (با parentId) اضافه می‌کنه
 */
function addNodeToParent(
  nodes: SlideNode[],
  parentId: string,
  newNode: SlideNode,
): SlideNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: addNodeToParent(node.children, parentId, newNode),
      };
    }
    return node;
  });
}

// ─── Store Types ─────────────────────────────────────────────────────────────

interface EditorStore {
  // State
  slides: Slide[];
  currentSlideIndex: number;
  selectedNodeId: string | null;
  isDragging: boolean;
  zoom: number;
  selectedId: string | null; // ← اضافه شد

  // Slide Actions
  addSlide: () => void;
  duplicateSlide: (index: number) => void;
  deleteSlide: (index: number) => void;
  setCurrentSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  updateSlideBackground: (slideId: string, background: SlideBackground) => void;
  updateSlideThumbnail: (slideId: string, thumbnail: string) => void;

  // Node Actions
  addNode: (elementDef: ElementDefinition, parentId?: string) => void;
  addRawNode: (node: SlideNode, parentId?: string) => void;
  removeNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  duplicateNode: (nodeId: string) => void;

  // Node Style Actions (Tailwind)
  toggleTailwindClass: (nodeId: string, className: string) => void;
  setTailwindClass: (nodeId: string, classes: string[]) => void;
  replaceClassName: (nodeId: string, className: string) => void;

  // Node Content Actions
  updateNodeContent: (nodeId: string, content: string) => void;
  updateNodeAttribute: (nodeId: string, key: string, value: string) => void;
  updateNodeTag: (nodeId: string, tag: HTMLTag) => void;

  // UI Actions
  setZoom: (zoom: number) => void;
  setIsDragging: (isDragging: boolean) => void;

  // Computed Helpers
  getCurrentSlide: () => Slide | undefined;
  getSelectedNode: () => SlideNode | undefined;
  findNodeById: (nodeId: string, nodes?: SlideNode[]) => SlideNode | undefined;
  isDirty: boolean;
  isSaving: boolean;
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Convenience: nodes از current slide
  nodes: SlideNode[];
  setNodes: (nodes: SlideNode[]) => void;
  slideSettings: SlideSettings;
  setSlideSettings: (settings: Partial<SlideSettings>) => void;
  loadSlideData: (data: { id: string; nodes: SlideNode[] }) => void;

  updateSlideSettings: (settings: Partial<SlideSettings>) => void;
  resetSlideSettings: () => void;
  moveNode: (
    nodeId: string,
    targetId: string,
    position: "before" | "after" | "inside",
  ) => void;
  updateNodeStyle: (id: string, styleKey: string, value: string) => void;
}

// ─── Store Implementation ────────────────────────────────────────────────────

export const useEditorStore = create<EditorStore>()(
  temporal(
    (set, get) => ({
      // ─── Initial State ───────────────────────────────────────────
      slides: [createDefaultSlide()],
      currentSlideIndex: 0,
      selectedNodeId: null,
      isDragging: false,
      zoom: 1,
      selectedId: null, // ← اضافه شد
      // State
      isDirty: false,
      isSaving: false,

      // Actions
      setIsDirty: (dirty) => set({ isDirty: dirty }),
      setIsSaving: (saving) => set({ isSaving: saving }),

      // nodes — shortcut به current slide nodes
      get nodes() {
        const { slides, currentSlideIndex } = get();
        return slides[currentSlideIndex]?.nodes ?? [];
      },

      // ─── Legacy Compatibility Fields ─────────────────────────────────────────────
      setNodes: (nodes) =>
        set((state) => ({
          slides: state.slides.map((s, i) =>
            i === state.currentSlideIndex ? { ...s, nodes } : s,
          ),
          isDirty: true,
        })),

      // ─── Computed Helpers ────────────────────────────────────────
      getCurrentSlide: () => {
        const { slides, currentSlideIndex } = get();
        return slides[currentSlideIndex];
      },

      getSelectedNode: () => {
        const { selectedNodeId } = get();
        if (!selectedNodeId) return undefined;
        return get().findNodeById(selectedNodeId);
      },

      findNodeById: (
        nodeId: string,
        nodes?: SlideNode[],
      ): SlideNode | undefined => {
        const searchIn = nodes ?? get().getCurrentSlide()?.nodes ?? [];
        for (const node of searchIn) {
          if (node.id === nodeId) return node;
          if (node.children) {
            const found = get().findNodeById(nodeId, node.children);
            if (found) return found;
          }
        }
        return undefined;
      },

      // ─── Slide Actions ───────────────────────────────────────────
      addSlide: () =>
        set((state) => ({
          slides: [...state.slides, createDefaultSlide()],
          currentSlideIndex: state.slides.length,
          selectedNodeId: null,
        })),

      duplicateSlide: (index) =>
        set((state) => {
          const slide = state.slides[index];
          if (!slide) return state;
          const newSlide: Slide = {
            ...JSON.parse(JSON.stringify(slide)),
            id: nanoid(),
            name: `${slide.name || "Slide"} (copy)`,
          };
          const newSlides = [...state.slides];
          newSlides.splice(index + 1, 0, newSlide);
          return {
            slides: newSlides,
            currentSlideIndex: index + 1,
          };
        }),

      deleteSlide: (index) =>
        set((state) => {
          if (state.slides.length <= 1) return state;
          const newSlides = state.slides.filter((_, i) => i !== index);
          const newIndex = Math.min(index, newSlides.length - 1);
          return {
            slides: newSlides,
            currentSlideIndex: newIndex,
            selectedNodeId: null,
          };
        }),

      setCurrentSlide: (index) =>
        set({ currentSlideIndex: index, selectedNodeId: null }),

      reorderSlides: (fromIndex, toIndex) =>
        set((state) => {
          const newSlides = [...state.slides];
          const [moved] = newSlides.splice(fromIndex, 1);
          newSlides.splice(toIndex, 0, moved);
          return { slides: newSlides, currentSlideIndex: toIndex };
        }),

      updateSlideBackground: (slideId, background) =>
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === slideId ? { ...s, background } : s,
          ),
        })),

      updateSlideThumbnail: (slideId, thumbnail) =>
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === slideId ? { ...s, thumbnail } : s,
          ),
        })),

      // ─── Node Actions ────────────────────────────────────────────
      addNode: (elementDef, parentId) => {
        const newNode = createNodeFromDefinition(elementDef);
        get().addRawNode(newNode, parentId);
      },

      addRawNode: (newNode, parentId) =>
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) return state;

          let updatedNodes: SlideNode[];
          if (parentId) {
            updatedNodes = addNodeToParent(
              currentSlide.nodes,
              parentId,
              newNode,
            );
          } else {
            updatedNodes = [...currentSlide.nodes, newNode];
          }

          return {
            slides: state.slides.map((s, i) =>
              i === state.currentSlideIndex ? { ...s, nodes: updatedNodes } : s,
            ),
            selectedNodeId: newNode.id,
            isDirty: true,
          };
        }),

      removeNode: (nodeId) =>
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) return state;

          return {
            slides: state.slides.map((s, i) =>
              i === state.currentSlideIndex
                ? { ...s, nodes: removeNodeFromTree(s.nodes, nodeId) }
                : s,
            ),
            selectedNodeId:
              state.selectedNodeId === nodeId ? null : state.selectedNodeId,
            isDirty: true,
          };
        }),

      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

      duplicateNode: (nodeId) => {
        const node = get().findNodeById(nodeId);
        if (!node) return;

        const duplicate: SlideNode = {
          ...JSON.parse(JSON.stringify(node)),
          id: nanoid(),
        };

        // اگه node در root بود، اونجا اضافه کن
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) return state;

          // پیدا کن node در root هست یا نه
          const isRoot = currentSlide.nodes.some((n) => n.id === nodeId);

          if (isRoot) {
            const nodeIndex = currentSlide.nodes.findIndex(
              (n) => n.id === nodeId,
            );
            const newNodes = [...currentSlide.nodes];
            newNodes.splice(nodeIndex + 1, 0, duplicate);
            return {
              slides: state.slides.map((s, i) =>
                i === state.currentSlideIndex ? { ...s, nodes: newNodes } : s,
              ),
              selectedNodeId: duplicate.id,
              isDirty: true,
            };
          }

          // در غیر اینصورت به عنوان root node اضافه کن
          return {
            slides: state.slides.map((s, i) =>
              i === state.currentSlideIndex
                ? { ...s, nodes: [...s.nodes, duplicate] }
                : s,
            ),
            selectedNodeId: duplicate.id,
            isDirty: true,
          };
        });
      },

      // ─── Node Style Actions (Tailwind) ───────────────────────────

      /**
       * یه کلاس Tailwind رو toggle می‌کنه:
       * - اگه قبلاً وجود داشت: حذف می‌کنه
       * - اگه conflict داشت با یه کلاس دیگه: اون رو جایگزین می‌کنه
       * - اگه نبود: اضافه می‌کنه
       */
      toggleTailwindClass: (nodeId, className) =>
        set((state) => ({
          ...state,
          slides: state.slides.map((s, i) =>
            i === state.currentSlideIndex
              ? {
                  ...s,
                  nodes: updateNodeInTree(s.nodes, nodeId, (node) => ({
                    ...node,
                    styles: node.styles, // ← اضافه کن (preserve می‌کنه)
                    className: mergeTailwindClass(node.className, className),
                  })),
                }
              : s,
          ),
          isDirty: true,
        })),

      setTailwindClass: (nodeId, classes) =>
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) return state;

          return {
            slides: state.slides.map((s, i) =>
              i === state.currentSlideIndex
                ? {
                    ...s,
                    nodes: updateNodeInTree(s.nodes, nodeId, (node) => ({
                      ...node,
                      className: setTailwindClasses(node.className, classes),
                    })),
                  }
                : s,
            ),
            isDirty: true,
          };
        }),

      replaceClassName: (nodeId, className) =>
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) return state;

          return {
            slides: state.slides.map((s, i) =>
              i === state.currentSlideIndex
                ? {
                    ...s,
                    nodes: updateNodeInTree(s.nodes, nodeId, (node) => ({
                      ...node,
                      className,
                    })),
                  }
                : s,
            ),
            isDirty: true,
          };
        }),

      // ─── Node Content Actions ────────────────────────────────────
      updateNodeContent: (nodeId, content) =>
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) return state;

          return {
            slides: state.slides.map((s, i) =>
              i === state.currentSlideIndex
                ? {
                    ...s,
                    nodes: updateNodeInTree(s.nodes, nodeId, (node) => ({
                      ...node,
                      content,
                    })),
                  }
                : s,
            ),
            isDirty: true,
          };
        }),

      updateNodeAttribute: (nodeId, key, value) =>
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) return state;

          return {
            slides: state.slides.map((s, i) =>
              i === state.currentSlideIndex
                ? {
                    ...s,
                    nodes: updateNodeInTree(s.nodes, nodeId, (node) => ({
                      ...node,
                      attributes: { ...(node.attributes || {}), [key]: value },
                    })),
                  }
                : s,
            ),
            isDirty: true,
          };
        }),

      updateNodeTag: (nodeId, tag) =>
        set((state) => {
          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) return state;

          return {
            slides: state.slides.map((s, i) =>
              i === state.currentSlideIndex
                ? {
                    ...s,
                    nodes: updateNodeInTree(s.nodes, nodeId, (node) => ({
                      ...node,
                      tag,
                    })),
                  }
                : s,
            ),
            isDirty: true,
          };
        }),

      // ─── UI Actions ──────────────────────────────────────────────
      setZoom: (zoom) => set({ zoom }),
      setIsDragging: (isDragging) => set({ isDragging }),
      slideSettings: DEFAULT_SLIDE_SETTINGS,
      setSlideSettings: (settings) =>
        set((state) => ({
          slideSettings: { ...state.slideSettings, ...settings },
        })),

      loadSlideData: (data) =>
        set((state) => ({
          slides: state.slides.map((s, i) =>
            i === state.currentSlideIndex
              ? { ...s, id: data.id, nodes: data.nodes }
              : s,
          ),
          selectedNodeId: null,
          isDirty: false,
        })),

      updateSlideSettings: (settings) =>
        set((state) => ({
          slideSettings: { ...state.slideSettings, ...settings },
        })),
      resetSlideSettings: () => set({ slideSettings: DEFAULTSLIDESETTINGS }),

      moveNode: (nodeId, targetId, position) =>
        set((state) => {
          if (nodeId === targetId) return state;
          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) return state;

          const nodeToMove = get().findNodeById(nodeId);
          if (!nodeToMove) return state;

          const nodesWithout = removeNodeFromTree(currentSlide.nodes, nodeId);
          const updatedNodes = insertNodeInTree(
            nodesWithout,
            targetId,
            nodeToMove,
            position,
          );

          return {
            slides: state.slides.map((s, i) =>
              i === state.currentSlideIndex ? { ...s, nodes: updatedNodes } : s,
            ),
            isDirty: true,
          };
        }),
      updateNodeStyle: (id: string, styleKey: string, value: string) => {
        set((state) => ({
          slides: state.slides.map((slide, i) =>
            i === state.currentSlideIndex
              ? {
                  ...slide,
                  nodes: updateNodeInTree(slide.nodes, id, (node) => ({
                    ...node,
                    styles: { ...node.styles, [styleKey]: value },
                  })),
                }
              : slide,
          ),
        }));
      },
    }),

    {
      // zundo config — چه چیزایی باید در undo/redo باشن
      partialize: (state) => ({
        slides: state.slides,
        currentSlideIndex: state.currentSlideIndex,
        selectedNodeId: state.selectedNodeId,
      }),
      limit: 50, // حداکثر ۵۰ مرحله undo
    },
  ),
);

// ─── Undo / Redo Hooks ───────────────────────────────────────────────────────
// export const useEditorHistory = () => {
//   const store = useEditorStore as any;
//   return {
//     undo: () => store.temporal?.getState().undo(),
//     redo: () => store.temporal?.getState().redo(),
//     canUndo: () => store.temporal?.getState().pastStates.length > 0,
//     canRedo: () => store.temporal?.getState().futureStates.length > 0,
//   };
// };

import type { TemporalState } from "zundo";
import type { StoreApi } from "zustand";

// type TemporalStore = StoreApi<
//   TemporalState<
//     Pick<EditorStore, "slides" | "currentSlideIndex" | "selectedNodeId">
//   >
// >;

// export const useEditorHistory = () => {
//   const temporal = (useEditorStore as unknown as { temporal: TemporalStore })
//     .temporal;

//   const undo = () => temporal.getState().undo();
//   const redo = () => temporal.getState().redo();
//   const canUndo = () => temporal.getState().pastStates.length > 0;
//   const canRedo = () => temporal.getState().futureStates.length > 0;

//   return { undo, redo, canUndo, canRedo };
// };

type PartialState = Pick<
  EditorStore,
  "slides" | "currentSlideIndex" | "selectedNodeId"
>;
type TemporalStore = StoreApi<TemporalState<PartialState>>;

export const useEditorHistory = () => {
  const temporal = (useEditorStore as unknown as { temporal: TemporalStore })
    .temporal;

  const { undo, redo, pastStates, futureStates } = useStore(temporal);

  return {
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  };
};

function insertNodeInTree(
  nodes: SlideNode[],
  targetId: string,
  nodeToInsert: SlideNode,
  position: "before" | "after" | "inside",
): SlideNode[] {
  const result: SlideNode[] = [];

  for (const node of nodes) {
    if (node.id === targetId) {
      if (position === "before") {
        result.push(nodeToInsert, node);
      } else if (position === "after") {
        result.push(node, nodeToInsert);
      } else if (position === "inside") {
        result.push({
          ...node,
          children: [...(node.children ?? []), nodeToInsert],
        });
      }
    } else {
      result.push({
        ...node,
        children: node.children
          ? insertNodeInTree(node.children, targetId, nodeToInsert, position)
          : undefined,
      });
    }
  }

  return result;
}
