import { create } from "zustand";
import {
  ColumnContentNode,
  ColumnContentType,
  NodeType,
  SelectedColumnItem,
  SlideNode,
} from "@/types/slide";
import { nanoid } from "nanoid";

const MAX_HISTORY = 50;

interface EditorState {
  nodes: SlideNode[];
  selectedId: string | null;
  selectedColumnItem: SelectedColumnItem | null;
  isDirty: boolean;
  isSaving: boolean;
  history: SlideNode[][];
  future: SlideNode[][];

  setNodes: (nodes: SlideNode[]) => void;
  addNode: (type: NodeType, overrides?: Partial<SlideNode>) => void;
  updateNode: (id: string, changes: Partial<SlideNode>) => void;
  deleteNode: (id: string) => void;
  reorderNodes: (nodes: SlideNode[]) => void;

  selectNode: (id: string | null) => void;
  selectColumnItem: (item: SelectedColumnItem | null) => void;

  addNodeToColumn: (
    nodeId: string,
    colId: string,
    type: ColumnContentType,
  ) => void;
  updateColumnNode: (
    nodeId: string,
    colId: string,
    cnId: string,
    changes: Partial<ColumnContentNode>,
  ) => void;
  deleteColumnNode: (nodeId: string, colId: string, cnId: string) => void;

  setIsSaving: (v: boolean) => void;
  setIsDirty: (v: boolean) => void;

  undo: () => void;
  redo: () => void;
}

function pushHistory(
  history: SlideNode[][],
  current: SlideNode[],
): SlideNode[][] {
  const next = [...history, current];
  return next.length > MAX_HISTORY
    ? next.slice(next.length - MAX_HISTORY)
    : next;
}

const defaultStyle: Record<NodeType, SlideNode["style"]> = {
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "left",
    color: "#ffffff",
  },
  paragraph: {
    fontSize: 16,
    fontWeight: "normal",
    textAlign: "left",
    color: "#94a3b8",
  },
  section: {
    fontSize: 22,
    fontWeight: "semibold",
    textAlign: "left",
    color: "#818cf8",
  },
  image: {
    fontSize: 16,
    fontWeight: "normal",
    textAlign: "center",
    color: "#ffffff",
  },
  columns: {
    fontSize: 16,
    fontWeight: "normal",
    textAlign: "left",
    color: "#ffffff",
  },
};

const defaultContent: Record<NodeType, string> = {
  title: "Slide Title",
  paragraph: "Write your paragraph here...",
  section: "Section Heading",
  image: "",
  columns: "",
};

const defaultColumnStyle: Record<
  ColumnContentType,
  ColumnContentNode["style"]
> = {
  title: { fontSize: 22, fontWeight: "bold", color: "#ffffff" },
  paragraph: { fontSize: 14, fontWeight: "normal", color: "#94a3b8" },
  section: { fontSize: 16, fontWeight: "semibold", color: "#818cf8" },
  image: { fontSize: 14, fontWeight: "normal", color: "#ffffff" },
};

export const useEditorStore = create<EditorState>((set) => ({
  nodes: [],
  selectedId: null,
  selectedColumnItem: null,
  isDirty: false,
  isSaving: false,
  history: [],
  future: [],

  setNodes: (nodes) =>
    set({
      nodes,
      isDirty: false,
      history: [],
      future: [],
      selectedId: null,
      selectedColumnItem: null,
    }),

  addNode: (type, overrides) =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: nanoid(),
          type,
          content: defaultContent[type],
          style: defaultStyle[type],
          ...(type === "columns"
            ? {
                columns: Array.from({ length: 2 }, () => ({
                  id: nanoid(),
                  nodes: [],
                })),
              }
            : {}),
          ...overrides,
        },
      ],
      history: pushHistory(state.history, state.nodes),
      future: [],
      isDirty: true,
    })),

  updateNode: (id, changes) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...changes,
              style: changes.style ? { ...n.style, ...changes.style } : n.style,
            }
          : n,
      ),
      history: pushHistory(state.history, state.nodes),
      future: [],
      isDirty: true,
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      selectedColumnItem:
        state.selectedColumnItem?.nodeId === id
          ? null
          : state.selectedColumnItem,
      history: pushHistory(state.history, state.nodes),
      future: [],
      isDirty: true,
    })),

  reorderNodes: (nodes) =>
    set((state) => ({
      nodes,
      history: pushHistory(state.history, state.nodes),
      future: [],
      isDirty: true,
    })),

  selectNode: (id) => set({ selectedId: id, selectedColumnItem: null }),

  selectColumnItem: (item) =>
    set({ selectedColumnItem: item, selectedId: item?.nodeId ?? null }),

  addNodeToColumn: (nodeId, colId, type) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              columns: n.columns?.map((col) =>
                col.id === colId
                  ? {
                      ...col,
                      nodes: [
                        ...col.nodes,
                        {
                          id: nanoid(),
                          type,
                          content: type === "image" ? "" : "Click to edit...",
                          style: defaultColumnStyle[type],
                        },
                      ],
                    }
                  : col,
              ),
            }
          : n,
      ),
      history: pushHistory(state.history, state.nodes),
      future: [],
      isDirty: true,
    })),

  updateColumnNode: (nodeId, colId, cnId, changes) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              columns: n.columns?.map((col) =>
                col.id === colId
                  ? {
                      ...col,
                      nodes: col.nodes.map((cn) =>
                        cn.id === cnId
                          ? {
                              ...cn,
                              ...changes,
                              style: changes.style
                                ? { ...cn.style, ...changes.style }
                                : cn.style,
                            }
                          : cn,
                      ),
                    }
                  : col,
              ),
            }
          : n,
      ),
      history: pushHistory(state.history, state.nodes),
      future: [],
      isDirty: true,
    })),

  deleteColumnNode: (nodeId, colId, cnId) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              columns: n.columns?.map((col) =>
                col.id === colId
                  ? {
                      ...col,
                      nodes: col.nodes.filter((cn) => cn.id !== cnId),
                    }
                  : col,
              ),
            }
          : n,
      ),
      selectedColumnItem:
        state.selectedColumnItem?.cnId === cnId
          ? null
          : state.selectedColumnItem,
      history: pushHistory(state.history, state.nodes),
      future: [],
      isDirty: true,
    })),

  setIsSaving: (v) => set({ isSaving: v }),
  setIsDirty: (v) => set({ isDirty: v }),

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        nodes: prev,
        history: state.history.slice(0, -1),
        future: [state.nodes, ...state.future],
        isDirty: true,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        nodes: next,
        history: [...state.history, state.nodes],
        future: state.future.slice(1),
        isDirty: true,
      };
    }),
}));
