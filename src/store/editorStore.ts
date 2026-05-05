import { create } from "zustand";
import { SlideNode } from "@/types/slide";
import { nanoid } from "nanoid";

interface EditorState {
  nodes: SlideNode[];
  selectedId: string | null;
  isDirty: boolean;
  isSaving: boolean;

  setNodes: (nodes: SlideNode[]) => void;
  addNode: (type: SlideNode["type"], overrides?: Partial<SlideNode>) => void;
  updateNode: (id: string, changes: Partial<SlideNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  reorderNodes: (nodes: SlideNode[]) => void;
  setIsSaving: (v: boolean) => void;
  setIsDirty: (v: boolean) => void;
}

const defaultStyle = {
  title: {
    fontSize: 36,
    fontWeight: "bold" as const,
    textAlign: "left" as const,
    color: "#ffffff",
  },
  paragraph: {
    fontSize: 16,
    fontWeight: "normal" as const,
    textAlign: "left" as const,
    color: "#94a3b8",
  },
  section: {
    fontSize: 22,
    fontWeight: "semibold" as const,
    textAlign: "left" as const,
    color: "#818cf8",
  },
  image: {
    fontSize: 16,
    fontWeight: "normal" as const,
    textAlign: "center" as const,
    color: "#ffffff",
  },
  columns: {
    fontSize: 16,
    fontWeight: "normal" as const,
    textAlign: "left" as const,
    color: "#ffffff",
  },
};
const defaultContent = {
  title: "Slide Title",
  paragraph: "Write your paragraph here...",
  section: "Section Heading",
  image: "",
  columns: "",
};
export const useEditorStore = create<EditorState>((set) => ({
  nodes: [],
  selectedId: null,
  isDirty: false,
  isSaving: false,

  setNodes: (nodes) => set({ nodes, isDirty: false }),

  addNode: (type, overrides) =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: nanoid(),
          type,
          content: defaultContent[type],
          style: defaultStyle[type],
          ...overrides,
        },
      ],
      isDirty: true,
    })),

  updateNode: (id, changes) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...changes,
              style: { ...n.style, ...(changes.style ?? {}) },
            }
          : n,
      ),
      isDirty: true,
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      isDirty: true,
    })),

  selectNode: (id) => set({ selectedId: id }),
  reorderNodes: (nodes) => set({ nodes, isDirty: true }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsDirty: (isDirty) => set({ isDirty }),
}));
