import { create } from "zustand";
import {
  ColumnContentNode,
  ColumnContentType,
  NodeType,
  SelectedColumnItem,
  SlideNode,
} from "@/types/slide";
import { nanoid } from "nanoid";

// ─── State Interface ──────────────────────────────────────────────────────────
interface EditorState {
  nodes: SlideNode[];
  selectedId: string | null;
  selectedColumnItem: SelectedColumnItem | null;
  isDirty: boolean;
  isSaving: boolean;

  // Node actions
  setNodes: (nodes: SlideNode[]) => void;
  addNode: (type: NodeType, overrides?: Partial<SlideNode>) => void;
  updateNode: (id: string, changes: Partial<SlideNode>) => void;
  deleteNode: (id: string) => void;
  reorderNodes: (nodes: SlideNode[]) => void;

  // Selection
  selectNode: (id: string | null) => void;
  selectColumnItem: (item: SelectedColumnItem | null) => void;

  // Column node actions
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

  // Save state
  setIsSaving: (v: boolean) => void;
  setIsDirty: (v: boolean) => void;
}

// ─── Default Styles ───────────────────────────────────────────────────────────
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

// ─── Store ────────────────────────────────────────────────────────────────────
export const useEditorStore = create<EditorState>((set) => ({
  nodes: [],
  selectedId: null,
  selectedColumnItem: null,
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
      isDirty: true,
    })),

  updateNode: (id, changes) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id
          ? { ...n, ...changes, style: { ...n.style, ...changes.style } }
          : n,
      ),
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
      isDirty: true,
    })),

  reorderNodes: (nodes) => set({ nodes, isDirty: true }),

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
                              style: { ...cn.style, ...changes.style },
                            }
                          : cn,
                      ),
                    }
                  : col,
              ),
            }
          : n,
      ),
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
                  ? { ...col, nodes: col.nodes.filter((cn) => cn.id !== cnId) }
                  : col,
              ),
            }
          : n,
      ),
      selectedColumnItem:
        state.selectedColumnItem?.cnId === cnId
          ? null
          : state.selectedColumnItem,
      isDirty: true,
    })),

  setIsSaving: (v) => set({ isSaving: v }),
  setIsDirty: (v) => set({ isDirty: v }),
}));
