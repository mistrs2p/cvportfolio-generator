"use client";

import { useEditorStore } from "@/store/editorStore";
import { SlideNode } from "@/types/slide";
import clsx from "clsx";

export default function SlideCanvas() {
  const { nodes, selectedId, selectNode } = useEditorStore();

  return (
    <main
      className="flex-1 bg-slate-950 flex items-center justify-center p-8 overflow-auto"
      onClick={() => selectNode(null)}
    >
      {/* Slide */}
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

function CanvasNode({
  node,
  isSelected,
  onSelect,
}: {
  node: SlideNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { updateNode } = useEditorStore();

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

  if (node.type === "image") {
    return (
      <div
        onClick={onSelect}
        className={clsx(
          "rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0",
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
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={clsx(
        "rounded-xl border-2 transition cursor-pointer px-1 py-0.5 shrink-0",
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
    </div>
  );
}
