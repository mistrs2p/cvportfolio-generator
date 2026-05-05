"use client";

import { useEditorStore } from "@/store/editorStore";
import { SlideNode } from "@/types/slide";
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic } from "lucide-react";
import clsx from "clsx";

const fontSizes = [12, 14, 16, 18, 22, 28, 32, 36, 40];
const fontWeights = [
  "normal",
  "medium",
  "semibold",
  "bold",
] as SlideNode["style"]["fontWeight"][];
const colors = [
  "#ffffff",
  "#94a3b8",
  "#818cf8",
  "#34d399",
  "#f472b6",
  "#fb923c",
  "#facc15",
  "#f87171",
];

export default function PropertiesPanel() {
  const {
    nodes,
    selectedId,
    selectedColumnItem,
    updateNode,
    updateColumnNode,
  } = useEditorStore();

  // ─── حالت ۱: المان داخل ستون انتخاب شده ────────────────────────────────────
  if (selectedColumnItem) {
    const { nodeId, colId, cnId } = selectedColumnItem;
    const parentNode = nodes.find((n) => n.id === nodeId);
    const col = parentNode?.columns?.find((c) => c.id === colId);
    const cn = col?.nodes.find((c) => c.id === cnId);

    if (!cn) return <EmptyPanel />;

    const updateCn = (changes: Parameters<typeof updateColumnNode>[3]) =>
      updateColumnNode(nodeId, colId, cnId, changes);

    return (
      <aside className="w-56 bg-slate-900 border-l border-slate-800 overflow-y-auto shrink-0">
        <div className="p-4 space-y-5">
          {/* برچسب نوع */}
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
              Column Element
            </p>
            <span className="text-indigo-400 text-xs font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {cn.type}
            </span>
          </div>

          {/* Image URL */}
          {cn.type === "image" && (
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Image URL
              </label>
              <input
                type="text"
                value={cn.content ?? ""}
                onChange={(e) => updateCn({ content: e.target.value })}
                placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder-text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}

          {/* Font Size */}
          {cn.type !== "image" && (
            <>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        updateCn({ style: { ...cn.style, fontSize: size } })
                      }
                      className={clsx(
                        "py-1.5 rounded-lg text-xs transition",
                        cn.style?.fontSize === size
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Weight
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {fontWeights.map((w) => (
                    <button
                      key={w}
                      onClick={() =>
                        updateCn({ style: { ...cn.style, fontWeight: w } })
                      }
                      className={clsx(
                        "py-1.5 rounded-lg text-xs capitalize transition",
                        cn.style?.fontWeight === w
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Align */}
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Alignment
                </label>
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((align) => {
                    const Icon =
                      align === "left"
                        ? AlignLeft
                        : align === "center"
                          ? AlignCenter
                          : AlignRight;
                    return (
                      <button
                        key={align}
                        onClick={() =>
                          updateCn({ style: { ...cn.style, textAlign: align } })
                        }
                        className={clsx(
                          "flex-1 flex items-center justify-center py-2 rounded-lg transition",
                          cn.style?.textAlign === align
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Italic */}
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Style
                </label>
                <button
                  onClick={() =>
                    updateCn({
                      style: { ...cn.style, italic: !cn.style?.italic },
                    })
                  }
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition w-full",
                    cn.style?.italic
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                  )}
                >
                  <Italic className="w-3.5 h-3.5" />
                  Italic
                </button>
              </div>

              {/* Color */}
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        updateCn({ style: { ...cn.style, color } })
                      }
                      className={clsx(
                        "w-full aspect-square rounded-lg border-2 transition",
                        cn.style?.color === color
                          ? "border-indigo-400 scale-110"
                          : "border-transparent hover:border-slate-500",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {/* Custom color */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={cn.style?.color ?? "#ffffff"}
                    onChange={(e) =>
                      updateCn({
                        style: { ...cn.style, color: e.target.value },
                      })
                    }
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-slate-500 text-xs">Custom color</span>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    );
  }

  // ─── حالت ۲: node اصلی انتخاب شده ───────────────────────────────────────────
  const node = nodes.find((n) => n.id === selectedId);
  if (!node) return <EmptyPanel />;

  return (
    <aside className="w-56 bg-slate-900 border-l border-slate-800 overflow-y-auto shrink-0">
      <div className="p-4 space-y-5">
        <div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Properties
          </p>
          <span className="text-indigo-400 text-xs font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
            {node.type}
          </span>
        </div>

        {/* Image URL */}
        {node.type === "image" && (
          <div>
            <label className="block text-slate-400 text-xs mb-1.5">
              Image URL
            </label>
            <input
              type="text"
              value={node.content ?? ""}
              onChange={(e) => updateNode(node.id, { content: e.target.value })}
              placeholder="https://..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder-text-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        )}

        {/* columns فقط راهنما نشون میده */}
        {node.type === "columns" && (
          <p className="text-slate-500 text-xs">
            Click on an element inside a column to edit its properties.
          </p>
        )}

        {/* Font Size */}
        {node.type !== "image" && node.type !== "columns" && (
          <>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Font Size
              </label>
              <div className="grid grid-cols-3 gap-1">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      updateNode(node.id, { style: { fontSize: size } })
                    }
                    className={clsx(
                      "py-1.5 rounded-lg text-xs transition",
                      node.style.fontSize === size
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Weight
              </label>
              <div className="grid grid-cols-2 gap-1">
                {fontWeights.map((w) => (
                  <button
                    key={w}
                    onClick={() =>
                      updateNode(node.id, { style: { fontWeight: w } })
                    }
                    className={clsx(
                      "py-1.5 rounded-lg text-xs capitalize transition",
                      node.style.fontWeight === w
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Alignment
              </label>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((align) => {
                  const Icon =
                    align === "left"
                      ? AlignLeft
                      : align === "center"
                        ? AlignCenter
                        : AlignRight;
                  return (
                    <button
                      key={align}
                      onClick={() =>
                        updateNode(node.id, { style: { textAlign: align } })
                      }
                      className={clsx(
                        "flex-1 flex items-center justify-center py-2 rounded-lg transition",
                        node.style.textAlign === align
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Style
              </label>
              <button
                onClick={() =>
                  updateNode(node.id, { style: { italic: !node.style.italic } })
                }
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition w-full",
                  node.style.italic
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                )}
              >
                <Italic className="w-3.5 h-3.5" />
                Italic
              </button>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Color
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateNode(node.id, { style: { color } })}
                    className={clsx(
                      "w-full aspect-square rounded-lg border-2 transition",
                      node.style.color === color
                        ? "border-indigo-400 scale-110"
                        : "border-transparent hover:border-slate-500",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={node.style.color ?? "#ffffff"}
                  onChange={(e) =>
                    updateNode(node.id, { style: { color: e.target.value } })
                  }
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-slate-500 text-xs">Custom color</span>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function EmptyPanel() {
  return (
    <aside className="w-56 bg-slate-900 border-l border-slate-800 flex items-center justify-center shrink-0">
      <p className="text-slate-600 text-xs text-center px-4">
        Select an element to edit its properties
      </p>
    </aside>
  );
}
