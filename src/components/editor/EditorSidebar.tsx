"use client";

import { useEditorStore } from "@/store/editorStore";
import { NodeType, SlideNode } from "@/types/slide";
import { Type, AlignLeft, Heading2, Image, Trash2 } from "lucide-react";
import clsx from "clsx";

const nodeTypes: {
  type: NodeType;
  label: string;
  icon: React.ElementType;
  desc: string;
}[] = [
  { type: "title", label: "Title", icon: Type, desc: "Main slide heading" },
  {
    type: "section",
    label: "Section",
    icon: Heading2,
    desc: "Sub-section heading",
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: AlignLeft,
    desc: "Body text block",
  },
  { type: "image", label: "Image", icon: Image, desc: "Image via URL" },
];

export default function EditorSidebar() {
  const { nodes, addNode, selectNode, selectedId, deleteNode } =
    useEditorStore();

  return (
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
        </div>
      </div>

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
                  : "hover:bg-slate-800 border border-transparent",
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
                      : "text-slate-300",
                  )}
                >
                  {node.type === "image"
                    ? "Image"
                    : node.content.slice(0, 20) || node.type}
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
  );
}
