"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import {
  ElementDef,
  ElementDefinition,
  ElementGroup,
  SlideNode,
} from "@/types/slide";
import clsx from "clsx";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

// ─── تعریف گروه‌های المنت ────────────────────────────────────────────────────

const ELEMENT_GROUPS: ElementGroup[] = [
  {
    label: "🔤 Headings",
    elements: [
      {
        tag: "h1",
        label: "H1 — Heading 1",
        icon: "H1",
        defaultContent: "Heading 1",
        defaultClassName: "text-4xl font-bold text-white leading-tight",
      },
      {
        tag: "h2",
        label: "H2 — Heading 2",
        icon: "H2",
        defaultContent: "Heading 2",
        defaultClassName: "text-3xl font-bold text-white leading-tight",
      },
      {
        tag: "h3",
        label: "H3 — Heading 3",
        icon: "H3",
        defaultContent: "Heading 3",
        defaultClassName: "text-2xl font-semibold text-white",
      },
      {
        tag: "h4",
        label: "H4 — Heading 4",
        icon: "H4",
        defaultContent: "Heading 4",
        defaultClassName: "text-xl font-semibold text-slate-200",
      },
      {
        tag: "h5",
        label: "H5 — Heading 5",
        icon: "H5",
        defaultContent: "Heading 5",
        defaultClassName: "text-lg font-medium text-slate-300",
      },
      {
        tag: "h6",
        label: "H6 — Heading 6",
        icon: "H6",
        defaultContent: "Heading 6",
        defaultClassName: "text-base font-medium text-slate-400",
      },
    ],
  },
  {
    label: "📝 Text",
    elements: [
      {
        tag: "p",
        label: "Paragraph",
        icon: "P",
        defaultContent: "Write your text here...",
        defaultClassName:
          "text-base font-normal text-slate-300 leading-relaxed",
      },
      {
        tag: "span",
        label: "Span / Badge",
        icon: "S",
        defaultContent: "Badge",
        defaultClassName:
          "text-sm font-medium text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full inline-block",
      },
      {
        tag: "a",
        label: "Link",
        icon: "A",
        defaultContent: "Click here",
        defaultClassName:
          "text-base text-indigo-400 underline hover:text-indigo-300",
        attributes: { href: "#" },
      },
      {
        tag: "blockquote",
        label: "Blockquote",
        icon: "❝",
        defaultContent: "A great quote goes here.",
        defaultClassName:
          "text-lg italic text-slate-400 border-l-4 border-indigo-500 pl-4",
      },
    ],
  },
  {
    label: "🖼 Media",
    elements: [
      {
        tag: "img",
        label: "Image",
        icon: "IMG",
        defaultContent: "https://placehold.co/600x300/1e293b/94a3b8?text=Image",
        defaultClassName: "w-full rounded-lg object-cover",
        attributes: { alt: "Image" },
      },
    ],
  },
  {
    label: "📐 Layout / Lists",
    elements: [
      {
        tag: "div",
        label: "Div (Flex Row)",
        icon: "▦",
        defaultClassName: "flex flex-row items-start gap-4 w-full",
        defaultChildren: [
          {
            tag: "div",
            className:
              "flex-1 bg-slate-800 rounded-lg p-4 text-slate-300 text-sm",
            content: "Column 1",
          },
          {
            tag: "div",
            className:
              "flex-1 bg-slate-800 rounded-lg p-4 text-slate-300 text-sm",
            content: "Column 2",
          },
        ],
      },
      {
        tag: "div",
        label: "Div (Grid 2-col)",
        icon: "▤",
        defaultClassName: "grid grid-cols-2 gap-4 w-full",
        defaultChildren: [
          {
            tag: "div",
            className: "bg-slate-800 rounded-lg p-4 text-slate-300 text-sm",
            content: "Item 1",
          },
          {
            tag: "div",
            className: "bg-slate-800 rounded-lg p-4 text-slate-300 text-sm",
            content: "Item 2",
          },
        ],
      },
      {
        tag: "div",
        label: "Div (Grid 3-col)",
        icon: "▥",
        defaultClassName: "grid grid-cols-3 gap-4 w-full",
        defaultChildren: [
          {
            tag: "div",
            className: "bg-slate-800 rounded-lg p-4 text-slate-300 text-sm",
            content: "Item 1",
          },
          {
            tag: "div",
            className: "bg-slate-800 rounded-lg p-4 text-slate-300 text-sm",
            content: "Item 2",
          },
          {
            tag: "div",
            className: "bg-slate-800 rounded-lg p-4 text-slate-300 text-sm",
            content: "Item 3",
          },
        ],
      },
      {
        tag: "ul",
        label: "Unordered List",
        icon: "•",
        defaultClassName:
          "list-disc list-inside text-slate-300 text-base space-y-2",
        defaultChildren: [
          { tag: "li", className: "text-slate-300", content: "List item 1" },
          { tag: "li", className: "text-slate-300", content: "List item 2" },
          { tag: "li", className: "text-slate-300", content: "List item 3" },
        ],
      },
      {
        tag: "ol",
        label: "Ordered List",
        icon: "1.",
        defaultClassName:
          "list-decimal list-inside text-slate-300 text-base space-y-2",
        defaultChildren: [
          { tag: "li", className: "text-slate-300", content: "Step 1" },
          { tag: "li", className: "text-slate-300", content: "Step 2" },
          { tag: "li", className: "text-slate-300", content: "Step 3" },
        ],
      },
    ],
  },
  {
    label: "🔘 Interactive",
    elements: [
      {
        tag: "button",
        label: "Button",
        icon: "BTN",
        defaultContent: "Click me",
        defaultClassName:
          "bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-lg transition inline-block",
      },
    ],
  },
];

// ─── یه گروه ─────────────────────────────────────────────────────────────────

function ElementGroupPanel({ group }: { group: ElementGroup }) {
  const [open, setOpen] = useState(true);
  const { addNode } = useEditorStore();

  return (
    <div className="border-b border-slate-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-slate-500 hover:text-slate-300 transition text-xs font-medium uppercase tracking-wider"
      >
        <span>{group.label}</span>
        {open ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {open && (
        <div className="pb-2 px-2 space-y-0.5">
          {group.elements.map((item) => (
            <button
              key={item.tag + item.label}
              onClick={() => {
                console.log("Clicking element:", item); // برای debug
                addNode(item as unknown as ElementDefinition);
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("element", JSON.stringify(item));
                e.dataTransfer.effectAllowed = "copy"; // ✅ اضافه کن
              }}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition group text-left"
            >
              <span className="w-8 h-8 rounded-md bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center text-xs font-mono font-bold text-slate-400 group-hover:text-indigo-400 transition shrink-0">
                {item.icon}
              </span>
              <span className="text-xs leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Layers Panel ─────────────────────────────────────────────────────────────

function LayersPanel() {
  const { slides, currentSlideIndex, selectedNodeId, selectNode, removeNode } =
    useEditorStore();

  // اینم درسته
  // const nodes = slides[currentSlideIndex]?.nodes ?? [];
  const nodes = useEditorStore(
    (s) => s.slides[s.currentSlideIndex]?.nodes ?? [],
  );
  return (
    <div className="p-3">
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 px-1">
        Layers ({nodes.length})
      </p>
      {nodes.length === 0 && (
        <p className="text-slate-600 text-xs text-center py-4">
          هنوز المنتی نداری
        </p>
      )}
      <div className="space-y-0.5">
        {nodes.map((node, i) => (
          <div
            key={node.id}
            onClick={() => selectNode(node.id)}
            className={clsx(
              "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer group transition",
              selectedNodeId === node.id // ✅ عوض شد
                ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-300"
                : "hover:bg-slate-800 text-slate-400",
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-600 text-xs font-mono shrink-0">
                {i + 1}
              </span>
              <span className="text-xs font-mono font-bold shrink-0 text-slate-500">
                &lt;{node.tag}&gt;
              </span>
              <span className="text-xs truncate">
                {node.content?.slice(0, 18) ??
                  (node.children?.length
                    ? `${node.children.length} children`
                    : "")}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNode(node.id); // ✅ عوض شد
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition p-0.5 shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function EditorSidebar() {
  const [tab, setTab] = useState<"elements" | "layers">("elements");

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-800 shrink-0">
        {(["elements", "layers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "flex-1 py-2 text-xs font-medium capitalize transition",
              tab === t
                ? "text-white border-b-2 border-indigo-500"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {t === "elements" ? "Elements" : "Layers"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "elements" ? (
          ELEMENT_GROUPS.map((g) => (
            <ElementGroupPanel key={g.label} group={g} />
          ))
        ) : (
          <LayersPanel />
        )}
      </div>
    </aside>
  );
}
