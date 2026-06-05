import { create, useStore } from "zustand";
import { temporal } from "zundo";
import { nanoid } from "nanoid";
import type { StoreApi } from "zustand";
import type { TemporalState } from "zundo";

import {
  DEFAULT_SLIDE_SETTINGS,
  type ElementDefinition,
  type HTMLTag,
  type PartialSlideNode,
  type Slide,
  type SlideBackground,
  type SlideNode,
  type SlideNodeStyles,
  type SlideNodeType,
  type SlideSettings,
} from "@/types/slide";

const CONFLICT_GROUPS: RegExp[] = [
  /^text-(left|center|right|justify)$/,
  /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
  /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  /^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/,
  /^flex-(row|row-reverse|col|col-reverse)$/,
  /^(uppercase|lowercase|capitalize|normal-case)$/,
  /^leading-(none|tight|snug|normal|relaxed|loose|[0-9]+)$/,
  /^tracking-(tighter|tight|normal|wide|wider|widest)$/,
  /^items-(start|end|center|baseline|stretch)$/,
  /^justify-(start|end|center|between|around|evenly)$/,
  /^content-(start|end|center|between|around|evenly)$/,
  /^self-(auto|start|end|center|stretch)$/,
  /^place-items-(start|end|center|stretch)$/,
  /^place-content-(start|end|center|between|around|evenly|stretch)$/,
  /^place-self-(auto|start|end|center|stretch)$/,
  /^bg-[^\s]+$/,
  /^text-[^\s]+$/,
  /^border-[^\s]+$/,
  /^rounded(?:-[^\s]+)?$/,
  /^shadow(?:-[^\s]+)?$/,
  /^w-[^\s]+$/,
  /^h-[^\s]+$/,
  /^min-w-[^\s]+$/,
  /^min-h-[^\s]+$/,
  /^max-w-[^\s]+$/,
  /^max-h-[^\s]+$/,
  /^p[trblxy]?-[^\s]+$/,
  /^m[trblxy]?-[^\s]+$/,
  /^gap-[^\s]+$/,
  /^grid-cols-[^\s]+$/,
  /^grid-rows-[^\s]+$/,
  /^col-span-[^\s]+$/,
  /^row-span-[^\s]+$/,
  /^(absolute|relative|fixed|sticky|static)$/,
  /^(top|left|right|bottom|inset)(-[^\s]+)?$/,
  /^opacity-[^\s]+$/,
  /^z-[^\s]+$/,
  /^overflow-[^\s]+$/,
  /^object-(contain|cover|fill|none|scale-down)$/,
];

function splitClasses(className?: string): string[] {
  return (className ?? "")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function findConflictGroup(token: string): RegExp | undefined {
  return CONFLICT_GROUPS.find((group) => group.test(token));
}

function mergeTailwindClass(current: string, incoming: string): string {
  const currentTokens = splitClasses(current);
  const incomingTokens = splitClasses(incoming);

  const nextTokens = [...currentTokens];

  incomingTokens.forEach((incomingToken) => {
    const group = findConflictGroup(incomingToken);

    if (!group) {
      if (!nextTokens.includes(incomingToken)) {
        nextTokens.push(incomingToken);
      }
      return;
    }

    const filtered = nextTokens.filter((token) => !group.test(token));
    filtered.push(incomingToken);
    nextTokens.splice(0, nextTokens.length, ...filtered);
  });

  return nextTokens.join(" ").trim();
}

function setTailwindClasses(current: string, incoming: string): string {
  return splitClasses(incoming).join(" ").trim() || current;
}

function toggleTailwindClassName(current: string, target: string): string {
  const tokens = splitClasses(current);
  const exists = tokens.includes(target);

  if (exists) {
    return tokens
      .filter((token) => token !== target)
      .join(" ")
      .trim();
  }

  return mergeTailwindClass(current, target);
}

function inferNodeType(tag: HTMLTag): SlideNodeType {
  if (tag === "img") return "image";
  if (tag === "hr") return "divider";
  if (tag === "button") return "button";
  if (tag === "blockquote") return "quote";
  if (tag === "code" || tag === "pre") return "code";
  if (["ul", "ol", "li"].includes(tag)) return "list";
  if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return "heading";
  if (
    [
      "div",
      "section",
      "article",
      "header",
      "footer",
      "main",
      "aside",
      "nav",
    ].includes(tag)
  ) {
    return "container";
  }

  return "text";
}

function normalizePartialNode(node: PartialSlideNode): SlideNode {
  return {
    id: nanoid(),
    type: node.type ?? inferNodeType(node.tag),
    tag: node.tag,
    content: node.content ?? "",
    className: node.className ?? "",
    styles: node.styles ?? {},
    attributes: node.attributes ?? {},
    isEditing: false,
    position: node.position,
    size: node.size,
    name: node.name,
    locked: node.locked ?? false,
    hidden: node.hidden ?? false,
    data: node.data,
    children: node.children?.map(normalizePartialNode),
  };
}

function createNodeFromDefinition(definition: ElementDefinition): SlideNode {
  return {
    id: nanoid(),
    type: definition.type ?? inferNodeType(definition.tag),
    tag: definition.tag,
    content: definition.defaultContent ?? "",
    className: definition.defaultClassName ?? "",
    styles: definition.defaultStyles ?? {},
    attributes: definition.attributes ?? {},
    isEditing: false,
    children: definition.defaultChildren?.map(normalizePartialNode),
  };
}

function createDefaultSlide(): Slide {
  return {
    id: nanoid(),
    name: "New Slide",
    nodes: [],
    background: {
      type: "solid",
      value: DEFAULT_SLIDE_SETTINGS.backgroundColor,
    },
  };
}

function updateNodeInTree(
  nodes: SlideNode[],
  nodeId: string,
  updater: (node: SlideNode) => SlideNode,
): SlideNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node);
    }

    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: updateNodeInTree(node.children, nodeId, updater),
    };
  });
}

function removeNodeFromTree(nodes: SlideNode[], nodeId: string): SlideNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      children: node.children
        ? removeNodeFromTree(node.children, nodeId)
        : undefined,
    }));
}

function addNodeToParent(
  nodes: SlideNode[],
  parentId: string,
  newNode: SlideNode,
): SlideNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children ?? []), newNode],
      };
    }

    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: addNodeToParent(node.children, parentId, newNode),
    };
  });
}

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
      } else {
        result.push({
          ...node,
          children: [...(node.children ?? []), nodeToInsert],
        });
      }
      continue;
    }

    result.push({
      ...node,
      children: node.children
        ? insertNodeInTree(node.children, targetId, nodeToInsert, position)
        : undefined,
    });
  }

  return result;
}

function cloneNode(node: SlideNode): SlideNode {
  return {
    ...node,
    id: nanoid(),
    children: node.children?.map(cloneNode),
  };
}

function extractNode(
  nodes: SlideNode[],
  nodeId: string,
): { nextNodes: SlideNode[]; extracted?: SlideNode } {
  let extracted: SlideNode | undefined;

  const nextNodes = nodes
    .filter((node) => {
      if (node.id === nodeId) {
        extracted = node;
        return false;
      }
      return true;
    })
    .map((node) => {
      if (!node.children?.length) {
        return node;
      }

      const childResult = extractNode(node.children, nodeId);
      if (childResult.extracted) {
        extracted = childResult.extracted;
      }

      return {
        ...node,
        children: childResult.nextNodes,
      };
    });

  return { nextNodes, extracted };
}

interface EditorState {
  projectId: string | null;
  slides: Slide[];
  currentSlideIndex: number;
  selectedNodeId: string | null;
  isDragging: boolean;
  zoom: number;
  slideSettings: SlideSettings;
  isDirty: boolean;
  isSaving: boolean;
}

interface EditorActions {
  setProjectId: (id: string | null) => void;
  setIsDirty: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  loadSlideData: (data: { id: string; nodes: SlideNode[] }) => void;
  addSlide: () => void;
  duplicateSlide: (index: number) => void;
  deleteSlide: (index: number) => void;
  setCurrentSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  updateSlideBackground: (slideId: string, background: SlideBackground) => void;
  updateSlideThumbnail: (slideId: string, thumbnail: string) => void;
  addNode: (elementDef: ElementDefinition, parentId?: string) => void;
  addRawNode: (node: SlideNode, parentId?: string) => void;
  removeNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  duplicateNode: (nodeId: string) => void;
  moveNode: (
    nodeId: string,
    targetId: string,
    position: "before" | "after" | "inside",
  ) => void;
  toggleTailwindClass: (nodeId: string, className: string) => void;
  setTailwindClass: (nodeId: string, classes: string) => void;
  replaceClassName: (nodeId: string, className: string) => void;
  updateNodeContent: (nodeId: string, content: string) => void;
  updateNodeAttribute: (nodeId: string, key: string, value: string) => void;
  updateNodeTag: (nodeId: string, tag: HTMLTag) => void;
  updateNodeStyle: (nodeId: string, styles: SlideNodeStyles) => void;
  updateNodeStyles: (nodeId: string, styles: SlideNodeStyles) => void;
  setZoom: (zoom: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  setSlideSettings: (settings: Partial<SlideSettings>) => void;
  updateSlideSettings: (settings: Partial<SlideSettings>) => void;
  resetSlideSettings: () => void;
}

interface EditorComputed {
  getCurrentSlide: () => Slide | undefined;
  getSelectedNode: () => SlideNode | undefined;
  findNodeById: (nodeId: string, nodes?: SlideNode[]) => SlideNode | undefined;
}

export type EditorStore = EditorState & EditorActions & EditorComputed;

const initialState: EditorState = {
  projectId: null,
  slides: [createDefaultSlide()],
  currentSlideIndex: 0,
  selectedNodeId: null,
  isDragging: false,
  zoom: 1,
  slideSettings: DEFAULT_SLIDE_SETTINGS,
  isDirty: false,
  isSaving: false,
};

export const useEditorStore = create<EditorStore>()(
  temporal((set, get) => ({
    ...initialState,

    setProjectId: (id) => set({ projectId: id }),
    setIsDirty: (value) => set({ isDirty: value }),
    setIsSaving: (value) => set({ isSaving: value }),

    getCurrentSlide: () => {
      const state = get();
      return state.slides[state.currentSlideIndex];
    },

    getSelectedNode: () => {
      const state = get();
      if (!state.selectedNodeId) return undefined;
      return state.findNodeById(state.selectedNodeId);
    },

    findNodeById: (nodeId, nodes) => {
      const searchIn = nodes ?? get().getCurrentSlide()?.nodes ?? [];

      for (const node of searchIn) {
        if (node.id === nodeId) {
          return node;
        }

        if (node.children?.length) {
          const found = get().findNodeById(nodeId, node.children);
          if (found) {
            return found;
          }
        }
      }

      return undefined;
    },

    loadSlideData: (data) =>
      set((state) => ({
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex
            ? {
                ...slide,
                id: data.id,
                nodes: data.nodes,
              }
            : slide,
        ),
        selectedNodeId: null,
        isDirty: false,
      })),

    addSlide: () =>
      set((state) => ({
        slides: [...state.slides, createDefaultSlide()],
        currentSlideIndex: state.slides.length,
        selectedNodeId: null,
        isDirty: true,
      })),

    duplicateSlide: (index) =>
      set((state) => {
        const slide = state.slides[index];
        if (!slide) return state;

        const newSlide: Slide = {
          ...(JSON.parse(JSON.stringify(slide)) as Slide),
          id: nanoid(),
          name: `${slide.name} Copy`,
          nodes: slide.nodes.map(cloneNode),
        };

        const slides = [...state.slides];
        slides.splice(index + 1, 0, newSlide);

        return {
          slides,
          currentSlideIndex: index + 1,
          selectedNodeId: null,
          isDirty: true,
        };
      }),

    deleteSlide: (index) =>
      set((state) => {
        if (state.slides.length <= 1) return state;

        const slides = state.slides.filter(
          (_, itemIndex) => itemIndex !== index,
        );
        const currentSlideIndex = Math.min(index, slides.length - 1);

        return {
          slides,
          currentSlideIndex,
          selectedNodeId: null,
          isDirty: true,
        };
      }),

    setCurrentSlide: (index) =>
      set({
        currentSlideIndex: index,
        selectedNodeId: null,
      }),

    reorderSlides: (fromIndex, toIndex) =>
      set((state) => {
        const slides = [...state.slides];
        const [moved] = slides.splice(fromIndex, 1);
        slides.splice(toIndex, 0, moved);

        return {
          slides,
          currentSlideIndex: toIndex,
          isDirty: true,
        };
      }),

    updateSlideBackground: (slideId, background) =>
      set((state) => ({
        slides: state.slides.map((slide) =>
          slide.id === slideId ? { ...slide, background } : slide,
        ),
        isDirty: true,
      })),

    updateSlideThumbnail: (slideId, thumbnail) =>
      set((state) => ({
        slides: state.slides.map((slide) =>
          slide.id === slideId ? { ...slide, thumbnail } : slide,
        ),
      })),

    addNode: (elementDef, parentId) => {
      const newNode = createNodeFromDefinition(elementDef);
      get().addRawNode(newNode, parentId);
    },

    addRawNode: (node, parentId) =>
      set((state) => {
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return state;

        const updatedNodes = parentId
          ? addNodeToParent(currentSlide.nodes, parentId, node)
          : [...currentSlide.nodes, node];

        return {
          slides: state.slides.map((slide, index) =>
            index === state.currentSlideIndex
              ? { ...slide, nodes: updatedNodes }
              : slide,
          ),
          selectedNodeId: node.id,
          isDirty: true,
        };
      }),

    removeNode: (nodeId) =>
      set((state) => {
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return state;

        return {
          slides: state.slides.map((slide, index) =>
            index === state.currentSlideIndex
              ? { ...slide, nodes: removeNodeFromTree(slide.nodes, nodeId) }
              : slide,
          ),
          selectedNodeId:
            state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          isDirty: true,
        };
      }),

    selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

    duplicateNode: (nodeId) =>
      set((state) => {
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return state;

        const node = get().findNodeById(nodeId, currentSlide.nodes);
        if (!node) return state;

        const duplicate = cloneNode(node);
        const nodes = insertNodeInTree(
          currentSlide.nodes,
          nodeId,
          duplicate,
          "after",
        );

        return {
          slides: state.slides.map((slide, index) =>
            index === state.currentSlideIndex ? { ...slide, nodes } : slide,
          ),
          selectedNodeId: duplicate.id,
          isDirty: true,
        };
      }),

    moveNode: (nodeId, targetId, position) =>
      set((state) => {
        if (nodeId === targetId) return state;

        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return state;

        const extracted = extractNode(currentSlide.nodes, nodeId);
        if (!extracted.extracted) return state;

        const nodes = insertNodeInTree(
          extracted.nextNodes,
          targetId,
          extracted.extracted,
          position,
        );

        return {
          slides: state.slides.map((slide, index) =>
            index === state.currentSlideIndex ? { ...slide, nodes } : slide,
          ),
          selectedNodeId: extracted.extracted.id,
          isDirty: true,
        };
      }),

    toggleTailwindClass: (nodeId, className) =>
      set((state) => ({
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex
            ? {
                ...slide,
                nodes: updateNodeInTree(slide.nodes, nodeId, (node) => ({
                  ...node,
                  className: toggleTailwindClassName(node.className, className),
                })),
              }
            : slide,
        ),
        isDirty: true,
      })),

    setTailwindClass: (nodeId, classes) =>
      set((state) => ({
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex
            ? {
                ...slide,
                nodes: updateNodeInTree(slide.nodes, nodeId, (node) => ({
                  ...node,
                  className: setTailwindClasses(node.className, classes),
                })),
              }
            : slide,
        ),
        isDirty: true,
      })),

    replaceClassName: (nodeId, className) =>
      set((state) => ({
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex
            ? {
                ...slide,
                nodes: updateNodeInTree(slide.nodes, nodeId, (node) => ({
                  ...node,
                  className,
                })),
              }
            : slide,
        ),
        isDirty: true,
      })),

    updateNodeContent: (nodeId, content) =>
      set((state) => ({
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex
            ? {
                ...slide,
                nodes: updateNodeInTree(slide.nodes, nodeId, (node) => ({
                  ...node,
                  content,
                })),
              }
            : slide,
        ),
        isDirty: true,
      })),

    updateNodeAttribute: (nodeId, key, value) =>
      set((state) => ({
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex
            ? {
                ...slide,
                nodes: updateNodeInTree(slide.nodes, nodeId, (node) => ({
                  ...node,
                  attributes: {
                    ...(node.attributes ?? {}),
                    [key]: value,
                  },
                })),
              }
            : slide,
        ),
        isDirty: true,
      })),

    updateNodeTag: (nodeId, tag) =>
      set((state) => ({
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex
            ? {
                ...slide,
                nodes: updateNodeInTree(slide.nodes, nodeId, (node) => ({
                  ...node,
                  tag,
                  type: inferNodeType(tag),
                })),
              }
            : slide,
        ),
        isDirty: true,
      })),

    updateNodeStyle: (nodeId, styles) =>
      set((state) => ({
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex
            ? {
                ...slide,
                nodes: updateNodeInTree(slide.nodes, nodeId, (node) => ({
                  ...node,
                  styles: {
                    ...node.styles,
                    ...styles,
                  },
                })),
              }
            : slide,
        ),
        isDirty: true,
      })),

    updateNodeStyles: (nodeId, styles) =>
      set((state) => ({
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex
            ? {
                ...slide,
                nodes: updateNodeInTree(slide.nodes, nodeId, (node) => ({
                  ...node,
                  styles: {
                    ...node.styles,
                    ...styles,
                  },
                })),
              }
            : slide,
        ),
        isDirty: true,
      })),

    setZoom: (zoom) => set({ zoom }),
    setIsDragging: (isDragging) => set({ isDragging }),

    setSlideSettings: (settings) =>
      set((state) => ({
        slideSettings: {
          ...state.slideSettings,
          ...settings,
        },
      })),

    updateSlideSettings: (settings) =>
      set((state) => ({
        slideSettings: {
          ...state.slideSettings,
          ...settings,
        },
      })),

    resetSlideSettings: () =>
      set({
        slideSettings: DEFAULT_SLIDE_SETTINGS,
      }),
  })),
);

type TemporalEditorState = Pick<
  EditorStore,
  "slides" | "currentSlideIndex" | "selectedNodeId"
>;
type EditorTemporalStore = StoreApi<TemporalState<TemporalEditorState>>;

export function useEditorHistory() {
  const temporalStore = (
    useEditorStore as unknown as { temporal: EditorTemporalStore }
  ).temporal;
  const { undo, redo, pastStates, futureStates } = useStore(temporalStore);

  return {
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  };
}
