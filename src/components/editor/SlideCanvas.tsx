"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { ColumnContentNode, ColumnContentType, SlideNode } from "@/types/slide";
import clsx from "clsx";
import { Trash2, Plus } from "lucide-react";

export default function SlideCanvas() {
  const { nodes, selectedId, selectNode } = useEditorStore();

  return (
    <main
      className="flex-1 bg-slate-950 flex items-center justify-center p-8 overflow-auto"
      onClick={() => selectNode(null)}
    >
      <div
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full relative overflow-hidden"
        style={{ maxWidth: "800px", aspectRatio: "16/9" }}
        onClick={(e) => e.stopPropagation()}
      >
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-600 text-sm select-none">
              Add elements from the left panel
            </p>
          </div>
        )}

        <div className="absolute inset-0 p-8 flex flex-col gap-4 overflow-hidden">
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              isSelected={selectedId === node.id}
              onSelect={() => selectNode(node.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── CanvasNode ────────────────────────────────────────────────────────────────
function CanvasNode({
  node,
  isSelected,
  onSelect,
}: {
  node: SlideNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    updateNode,
    deleteNode,
    addNodeToColumn,
    deleteColumnNode,
    updateColumnNode,
    selectColumnItem,
  } = useEditorStore();

  const fontSizeMap: Record<number, string> = {
    12: "text-xs",
    14: "text-sm",
    16: "text-base",
    18: "text-lg",
    22: "text-xl",
    28: "text-2xl",
    32: "text-3xl",
    36: "text-4xl",
    40: "text-5xl",
  };

  const fontSize = node.style.fontSize ?? 16;
  const closestSize = Object.keys(fontSizeMap)
    .map(Number)
    .reduce((a, b) =>
      Math.abs(b - fontSize) < Math.abs(a - fontSize) ? b : a,
    );

  // ─── Image ──────────────────────────────────────────────────────────────────
  if (node.type === "image") {
    return (
      <div
        onClick={onSelect}
        className={clsx(
          "rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 group relative",
          isSelected
            ? "border-indigo-500"
            : "border-transparent hover:border-slate-600",
        )}
        style={{ maxHeight: "200px" }}
      >
        {node.content ? (
          <img
            src={node.content}
            alt="slide image"
            className="w-full h-full object-cover"
            style={{ maxHeight: "200px" }}
          />
        ) : (
          <div className="h-24 bg-slate-800 flex items-center justify-center rounded-xl">
            <p className="text-slate-500 text-xs">
              Click properties to add image URL
            </p>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(node.id);
          }}
          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-red-500/80 hover:bg-red-500 text-white rounded-lg p-1 transition"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // ─── Columns ─────────────────────────────────────────────────────────────────
  if (node.type === "columns") {
    return (
      <div
        onClick={onSelect}
        className={clsx(
          "rounded-xl border-2 transition p-3 shrink-0 group relative",
          isSelected
            ? "border-indigo-500"
            : "border-transparent hover:border-slate-700",
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(node.id);
          }}
          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-red-500/80 hover:bg-red-500 text-white rounded-lg p-1 transition z-10"
        >
          <Trash2 className="w-3 h-3" />
        </button>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${node.columns?.length ?? 2}, 1fr)`,
          }}
        >
          {node.columns?.map((col, colIndex) => (
            <div
              key={col.id}
              className="flex flex-col gap-2 min-h-[60px] rounded-lg border border-slate-700/50 p-2"
              onClick={(e) => {
                e.stopPropagation();
                selectColumnItem({ nodeId: node.id, colId: col.id });
              }}
            >
              <p className="text-slate-600 text-[10px] uppercase tracking-wider">
                Col {colIndex + 1}
              </p>

              {col.nodes.length === 0 ? (
                <p className="text-slate-700 text-xs italic">Empty</p>
              ) : (
                col.nodes.map((cn) => (
                  <ColumnContentNodeRenderer
                    key={cn.id}
                    node={cn}
                    nodeId={node.id}
                    colId={col.id}
                    onDelete={() => deleteColumnNode(node.id, col.id, cn.id)}
                    onUpdateContent={(content) =>
                      updateColumnNode(node.id, col.id, cn.id, { content })
                    }
                  />
                ))
              )}

              <ColumnAddButton
                onAdd={(type) => addNodeToColumn(node.id, col.id, type)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Text nodes ───────────────────────────────────────────────────────────────
  return (
    <div
      onClick={onSelect}
      className={clsx(
        "rounded-xl border-2 transition cursor-pointer px-1 py-0.5 shrink-0 group relative",
        isSelected
          ? "border-indigo-500"
          : "border-transparent hover:border-slate-700",
      )}
    >
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          updateNode(node.id, { content: e.currentTarget.textContent ?? "" })
        }
        className={clsx(
          fontSizeMap[closestSize],
          node.style.fontWeight === "bold" && "font-bold",
          node.style.fontWeight === "semibold" && "font-semibold",
          node.style.fontWeight === "medium" && "font-medium",
          node.style.italic && "italic",
          "outline-none focus:outline-none w-full",
          `text-${node.style.textAlign}`,
        )}
        style={{ color: node.style.color }}
      >
        {node.content}
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(node.id);
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500/80 hover:bg-red-500 text-white rounded-lg p-1 transition"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── ColumnContentNodeRenderer ────────────────────────────────────────────────
function ColumnContentNodeRenderer({
  node,
  nodeId,
  colId,
  onDelete,
  onUpdateContent,
}: {
  node: ColumnContentNode;
  nodeId: string;
  colId: string;
  onDelete: () => void;
  onUpdateContent: (content: string) => void;
}) {
  return (
    <div className="group/cn relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-1 -right-1 opacity-0 group-hover/cn:opacity-100 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-0.5 transition z-10"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>

      {node.type === "image" ? (
        node.content ? (
          <img
            src={node.content}
            alt=""
            className="w-full rounded-lg object-cover max-h-32"
          />
        ) : (
          <div className="h-14 bg-slate-800 rounded-lg flex items-center justify-center border border-dashed border-slate-700">
            <p className="text-slate-500 text-xs">No image URL</p>
          </div>
        )
      ) : (
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateContent(e.currentTarget.textContent ?? "")}
          style={{
            color: node.style?.color ?? "#ffffff",
            fontSize: node.style?.fontSize
              ? `${node.style.fontSize}px`
              : "14px",
          }}
          className={clsx(
            "outline-none focus:outline-none cursor-text min-h-[1em]",
            node.style?.fontWeight === "bold" && "font-bold",
            node.style?.fontWeight === "semibold" && "font-semibold",
            node.style?.italic && "italic",
          )}
        >
          {node.content}
        </p>
      )}
    </div>
  );
}

// ─── ColumnAddButton ──────────────────────────────────────────────────────────
function ColumnAddButton({
  onAdd,
}: {
  onAdd: (type: ColumnContentType) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: { type: ColumnContentType; label: string }[] = [
    { type: "title", label: "Title" },
    { type: "paragraph", label: "Paragraph" },
    { type: "section", label: "Section" },
    { type: "image", label: "Image" },
  ];

  return (
    <div className="relative mt-auto">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="w-full flex items-center justify-center gap-1 text-[10px] text-slate-600 hover:text-indigo-400 border border-dashed border-slate-700 hover:border-indigo-500/40 rounded-lg py-1 transition"
      >
        <Plus className="w-2.5 h-2.5" />
        Add
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
          {options.map((o) => (
            <button
              key={o.type}
              onClick={(e) => {
                e.stopPropagation();
                onAdd(o.type);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
