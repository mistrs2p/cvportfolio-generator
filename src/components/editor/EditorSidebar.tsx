"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { NodeType, SlideNode } from "@/types/slide";
import { Type, AlignLeft, Heading2, Image, Trash2, Columns2 } from "lucide-react";
import clsx from "clsx";
import { nanoid } from "nanoid";
import IconPickerModal from "@/components/editor/IconPickerModal";

const nodeTypes: {
  type: NodeType;
  label: string;
  icon: React.ElementType;
  desc: string;
}[] = [
  { type: "title",     label: "Title",     icon: Type,     desc: "Main slide heading" },
  { type: "section",   label: "Section",   icon: Heading2, desc: "Sub-section heading" },
  { type: "paragraph", label: "Paragraph", icon: AlignLeft,desc: "Body text block" },
  { type: "image",     label: "Image",     icon: Image,    desc: "Image via URL" },
];

export default function EditorSidebar() {
  const { nodes, addNode, selectNode, selectedId, deleteNode, updateNode } =
    useEditorStore();

  // کدوم ستون داره icon picker رو نشون میده
  const [pickerTarget, setPickerTarget] = useState<{
    nodeId: string;
    colId: string;
  } | null>(null);

  function addColumnsNode(count: 2 | 3) {
    const id = nanoid();
    addNode("columns", {
      id,
      type: "columns",
      style: {},
      columns: Array.from({ length: count }, (_, i) => ({
        id: nanoid(),
        title: `Column ${i + 1}`,
        items: [],
      })),
    });
  }

  function handleIconSelected(icon: string, label: string) {
    if (!pickerTarget) return;
    const { nodeId, colId } = pickerTarget;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node?.columns) return;

    const updatedColumns = node.columns.map((col) =>
      col.id === colId
        ? { ...col, items: [...col.items, { icon, label }] }
        : col
    );
    updateNode(nodeId, { columns: updatedColumns });
    setPickerTarget(null);
  }

  // پیدا کردن columns nodes برای نمایش در لایه‌ها
  const selectedNode = nodes.find((n) => n.id === selectedId);

  return (
    <>
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
        {/* Add Elements */}
        <div className="p-3 border-b border-slate-800">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 px-1">
            Add Element
          </p>
          <div className="space-y-1">
            {nodeTypes.map(({ type, label, icon: Icon, desc }) => (
              <button
                key={type}
                onClick={() => addNode(type)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center shrink-0 transition">
                  <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
                </div>
                <div>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-slate-600 text-xs">{desc}</p>
                </div>
              </button>
            ))}

            {/* ─── Columns ─── */}
            <div className="pt-1 border-t border-slate-800 mt-1">
              <p className="text-slate-600 text-xs px-1 mb-1">Layouts</p>
              <button
                onClick={() => addColumnsNode(2)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-violet-500/20 flex items-center justify-center shrink-0 transition">
                  <Columns2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400 transition" />
                </div>
                <div>
                  <p className="text-xs font-medium">2 Columns</p>
                  <p className="text-slate-600 text-xs">Side by side layout</p>
                </div>
              </button>
              <button
                onClick={() => addColumnsNode(3)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-violet-500/20 flex items-center justify-center shrink-0 transition">
                  <Columns2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400 transition" />
                </div>
                <div>
                  <p className="text-xs font-medium">3 Columns</p>
                  <p className="text-slate-600 text-xs">Three column layout</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* اگه columns node انتخاب شده — مدیریت ستون‌ها */}
        {selectedNode?.type === "columns" && (
          <div className="p-3 border-b border-slate-800">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 px-1">
              Columns
            </p>
            <div className="space-y-3">
              {selectedNode.columns?.map((col) => (
                <div key={col.id} className="bg-slate-800 rounded-xl p-2.5">
                  {/* عنوان ستون */}
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => {
                      const updated = selectedNode.columns!.map((c) =>
                        c.id === col.id ? { ...c, title: e.target.value } : c
                      );
                      updateNode(selectedNode.id, { columns: updated });
                    }}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs mb-2 outline-none focus:border-indigo-500 transition"
                    placeholder="Column title..."
                  />

                  {/* آیتم‌ها */}
                  <div className="space-y-1 mb-2">
                    {col.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-slate-700 rounded-lg px-2 py-1"
                      >
                        <img
                          src={`https://cdn.simpleicons.org/${item.icon}/ffffff`}
                          alt={item.label}
                          className="w-3.5 h-3.5 shrink-0"
                        />
                        <span className="text-slate-300 text-xs flex-1 truncate">
                          {item.label}
                        </span>
                        <button
                          onClick={() => {
                            const updated = selectedNode.columns!.map((c) =>
                              c.id === col.id
                                ? {
                                    ...c,
                                    items: c.items.filter((_, i) => i !== idx),
                                  }
                                : c
                            );
                            updateNode(selectedNode.id, { columns: updated });
                          }}
                          className="text-slate-600 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* دکمه افزودن skill */}
                  <button
                    onClick={() =>
                      setPickerTarget({
                        nodeId: selectedNode.id,
                        colId: col.id,
                      })
                    }
                    className="w-full text-xs text-indigo-400 hover:text-indigo-300 border border-dashed border-indigo-500/30 hover:border-indigo-400/50 rounded-lg py-1.5 transition"
                  >
                    + Add Skill
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layers */}
        <div className="p-3 flex-1">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 px-1">
            Layers ({nodes.length})
          </p>
          {nodes.length === 0 && (
            <p className="text-slate-600 text-xs text-center py-6">
              No elements yet
            </p>
          )}
          <div className="space-y-1">
            {nodes.map((node, index) => (
              <div
                key={node.id}
                onClick={() => selectNode(node.id)}
                className={clsx(
                  "flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition group",
                  selectedId === node.id
                    ? "bg-indigo-600/20 border border-indigo-500/30"
                    : "hover:bg-slate-800 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-600 text-xs font-mono shrink-0">
                    {index + 1}
                  </span>
                  <span
                    className={clsx(
                      "text-xs font-medium truncate",
                      selectedId === node.id
                        ? "text-indigo-300"
                        : "text-slate-300"
                    )}
                  >
                    {node.type === "image"
                      ? "Image"
                      : node.type === "columns"
                      ? `Columns (${node.columns?.length ?? 0})`
                      : node.content?.slice(0, 20) || node.type}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition p-0.5 rounded shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Icon Picker Modal */}
      {pickerTarget && (
        <IconPickerModal
          onSelect={handleIconSelected}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </>
  );
}