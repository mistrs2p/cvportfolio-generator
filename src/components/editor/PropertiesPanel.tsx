"use client";

import { FlipHorizontal, FlipVertical, Crop } from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import clsx from "clsx";
import { RotateCcw } from "lucide-react";
import { SLIDE_PRESETS } from "@/config/slideConfig";
import { FontSection } from "./FontSection";
import { ImageSourceInput } from "./ImageSourceInput";
// ─── Constants ────────────────────────────────────────────────────────────────

const ALIGN_CLASSES = [
  "text-left",
  "text-center",
  "text-right",
  "text-justify",
] as const;
type AlignClass = (typeof ALIGN_CLASSES)[number];
const DEFAULT_ALIGN: AlignClass = "text-left";

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useNodeActions(id: string) {
  const toggleTailwindClass = useEditorStore((s) => s.toggleTailwindClass);
  const replaceClassName = useEditorStore((s) => s.replaceClassName);
  const setTailwindClass = useEditorStore((s) => s.setTailwindClass);
  const node = useEditorStore((s) => s.findNodeById(id));

  function toggle(cls: string) {
    toggleTailwindClass(id, cls);
  }

  function has(cls: string): boolean {
    return !!node?.className?.split(" ").includes(cls);
  }

  /**
   * Removes ALL align classes first, then applies the chosen one.
   * If the user clicks the already-active align → revert to DEFAULT_ALIGN.
   */
  function setAlign(cls: AlignClass) {
    const currentAlign = ALIGN_CLASSES.find((a) => has(a)) ?? DEFAULT_ALIGN;
    const next: AlignClass = currentAlign === cls ? DEFAULT_ALIGN : cls;

    // Build new className: strip all align classes, then inject `next`
    const stripped = (node?.className ?? "")
      .split(" ")
      .filter(Boolean)
      .filter((c) => !(ALIGN_CLASSES as readonly string[]).includes(c));

    const newClassName = [...stripped, next].join(" ");
    replaceClassName(id, newClassName);
  }

  return { toggle, has, setAlign, className: node?.className ?? "", node };
}

// ─── Group ────────────────────────────────────────────────────────────────────

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-slate-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-slate-500 hover:text-slate-300 transition text-xs font-medium uppercase tracking-wider"
      >
        {label}
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

// ─── ToggleRow ─────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: { label: string; value: string }[];
  active: string | undefined;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-slate-500 text-xs mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className={clsx(
              "px-2 py-1 rounded text-xs transition font-mono",
              active === o.value
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AlignRow (dedicated, bug-free) ───────────────────────────────────────────

function AlignRow({ id }: { id: string }) {
  const { has, setAlign } = useNodeActions(id);

  // Compute the single active align — default to 'text-left' when none is set
  const activeAlign: AlignClass =
    ALIGN_CLASSES.find((a) => has(a)) ?? DEFAULT_ALIGN;

  const options: { label: string; value: AlignClass }[] = [
    { label: "L", value: "text-left" },
    { label: "C", value: "text-center" },
    { label: "R", value: "text-right" },
    { label: "J", value: "text-justify" },
  ];

  return (
    <div>
      <p className="text-slate-500 text-xs mb-1.5">Text Align</p>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => setAlign(o.value)}
            className={clsx(
              "px-2 py-1 rounded text-xs transition font-mono",
              activeAlign === o.value
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Color Presets ─────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  { label: "white", tw: "text-white" },
  { label: "slate-300", tw: "text-slate-300" },
  { label: "slate-400", tw: "text-slate-400" },
  { label: "indigo-400", tw: "text-indigo-400" },
  { label: "teal-400", tw: "text-teal-400" },
  { label: "green-400", tw: "text-green-400" },
  { label: "amber-400", tw: "text-amber-400" },
  { label: "red-400", tw: "text-red-400" },
  { label: "pink-400", tw: "text-pink-400" },
];

const PRESET_BG = [
  { label: "transparent", tw: "bg-transparent" },
  { label: "slate-800", tw: "bg-slate-800" },
  { label: "slate-700", tw: "bg-slate-700" },
  { label: "indigo-500/20", tw: "bg-indigo-500/20" },
  { label: "teal-500/20", tw: "bg-teal-500/20" },
  { label: "green-500/20", tw: "bg-green-500/20" },
  { label: "amber-500/20", tw: "bg-amber-500/20" },
  { label: "red-500/20", tw: "bg-red-500/20" },
];

// ─── ArbitraryInput ────────────────────────────────────────────────────────────

function ArbitraryInput({
  id,
  label,
  placeholder,
}: {
  id: string;
  label: string;
  placeholder: string;
}) {
  const { toggle } = useNodeActions(id);
  const [value, setValue] = useState("");

  function apply() {
    const trimmed = value.trim();
    if (!trimmed) return;
    trimmed.split(" ").forEach((cls) => toggle(cls));
    setValue("");
  }

  return (
    <div>
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <div className="flex gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder={placeholder}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
        />
        <button
          onClick={apply}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2 rounded-lg transition font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Typography Section ────────────────────────────────────────────────────────

function TypographySection({ id }: { id: string }) {
  const { toggle, has } = useNodeActions(id);

  const sizes = [
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
  ];
  const weights = [
    "font-light",
    "font-normal",
    "font-medium",
    "font-semibold",
    "font-bold",
    "font-black",
  ];
  const leadings = [
    "leading-none",
    "leading-tight",
    "leading-normal",
    "leading-relaxed",
    "leading-loose",
  ];
  const trackings = [
    "tracking-tighter",
    "tracking-tight",
    "tracking-normal",
    "tracking-wide",
    "tracking-wider",
    "tracking-widest",
  ];
  const transforms = [
    { label: "AA", value: "normal-case" },
    { label: "Aa", value: "capitalize" },
    { label: "AA", value: "uppercase" },
    { label: "aa", value: "lowercase" },
  ];

  const activeSize = sizes.find(has);
  const activeWeight = weights.find(has);
  const activeLeading = leadings.find(has);
  const activeTracking = trackings.find(has);
  const activeTransform = [
    "uppercase",
    "lowercase",
    "capitalize",
    "normal-case",
  ].find(has);
  const activeColor = PRESET_COLORS.find((c) => has(c.tw))?.tw;

  return (
    <>
      <ToggleRow
        label="Font Size"
        options={sizes.map((s) => ({
          label: s.replace("text-", ""),
          value: s,
        }))}
        active={activeSize}
        onSelect={toggle}
      />
      <ToggleRow
        label="Font Weight"
        options={weights.map((w) => ({
          label: w.replace("font-", ""),
          value: w,
        }))}
        active={activeWeight}
        onSelect={toggle}
      />

      {/* ✅ Dedicated AlignRow — no bugs */}
      <AlignRow id={id} />

      <ToggleRow
        label="Text Transform"
        options={transforms}
        active={activeTransform}
        onSelect={toggle}
      />

      {/* Text Color */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Text Color</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.tw}
              onClick={() => toggle(c.tw)}
              title={c.label}
              className={clsx(
                "w-6 h-6 rounded border-2 transition",
                has(c.tw)
                  ? "border-indigo-400 scale-110"
                  : "border-transparent hover:border-slate-500",
              )}
              style={{
                backgroundColor: c.label === "white" ? "#fff" : undefined,
              }}
            >
              <span
                className={clsx(
                  "block w-full h-full rounded text-xs",
                  c.tw,
                  c.label === "white" ? "" : "",
                )}
              >
                A
              </span>
            </button>
          ))}
        </div>
      </div>

      <FontSection id={id} />

      <ArbitraryInput
        id={id}
        label="Custom Class"
        placeholder="e.g. text-[#ff6600] text-red-100"
      />

      <ToggleRow
        label="Line Height"
        options={leadings.map((l) => ({
          label: l.replace("leading-", ""),
          value: l,
        }))}
        active={activeLeading}
        onSelect={toggle}
      />
      <ToggleRow
        label="Letter Spacing"
        options={trackings.map((t) => ({
          label: t.replace("tracking-", ""),
          value: t,
        }))}
        active={activeTracking}
        onSelect={toggle}
      />

      {/* Decoration */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Decoration</p>
        <div className="flex gap-1">
          {[
            { label: "I", value: "italic" },
            { label: "U", value: "underline" },
            { label: "S", value: "line-through" },
          ].map((d) => (
            <button
              key={d.value}
              onClick={() => toggle(d.value)}
              className={clsx(
                "px-3 py-1 rounded text-xs font-mono transition",
                has(d.value)
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Layout Section ────────────────────────────────────────────────────────────

function LayoutSection({ id }: { id: string }) {
  const { toggle, has, node } = useNodeActions(id);

  const displays = [
    "block",
    "flex",
    "grid",
    "inline",
    "inline-block",
    "inline-flex",
    "hidden",
  ];
  const flexDirs = [
    "flex-row",
    "flex-col",
    "flex-row-reverse",
    "flex-col-reverse",
  ];
  const aligns = ["items-start", "items-center", "items-end", "items-stretch"];
  const justifys = [
    "justify-start",
    "justify-center",
    "justify-end",
    "justify-between",
    "justify-around",
  ];
  const cols = [
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "grid-cols-6",
  ];
  const gaps = [
    "gap-0",
    "gap-1",
    "gap-2",
    "gap-3",
    "gap-4",
    "gap-6",
    "gap-8",
    "gap-10",
    "gap-12",
  ];
  const paddings = [
    "p-0",
    "p-1",
    "p-2",
    "p-3",
    "p-4",
    "p-5",
    "p-6",
    "p-8",
    "p-10",
    "p-12",
    "p-16",
  ];
  const margins = ["m-0", "m-1", "m-2", "m-3", "m-4", "m-6", "m-8"];
  const widths = [
    "w-auto",
    "w-full",
    "w-1/2",
    "w-1/3",
    "w-2/3",
    "w-1/4",
    "w-3/4",
  ];
  const heights = [
    "h-auto",
    "h-full",
    "h-8",
    "h-12",
    "h-16",
    "h-24",
    "h-32",
    "h-48",
    "h-64",
  ];
  const roundeds = [
    "rounded-none",
    "rounded",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",
    "rounded-2xl",
    "rounded-full",
  ];
  const borders = ["border-0", "border", "border-2", "border-4"];
  const borderColors = [
    "border-slate-600",
    "border-indigo-500",
    "border-white/20",
    "border-transparent",
  ];
  const shadows = [
    "shadow-none",
    "shadow-sm",
    "shadow",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
  ];
  const overflows = [
    "overflow-hidden",
    "overflow-auto",
    "overflow-visible",
    "overflow-scroll",
  ];

  const isContainer = ["div", "section", "ul", "ol"].includes(node?.tag ?? "");

  const activeDisplay = displays.find(has);
  const activeFlex = flexDirs.find(has);
  const activeAlign = aligns.find(has);
  const activeJustify = justifys.find(has);
  const activeCols = cols.find(has);
  const activeGap = gaps.find(has);
  const activePad = paddings.find(has);
  const activeMargin = margins.find(has);
  const activeW = widths.find(has);
  const activeH = heights.find(has);
  const activeRound = roundeds.find(has);
  const activeBorder = borders.find(has);
  const activeBorderColor = borderColors.find(has);
  const activeShadow = shadows.find(has);
  const activeOverflow = overflows.find(has);
  const activeBg = PRESET_BG.find((c) => has(c.tw))?.tw;

  return (
    <>
      {isContainer && (
        <>
          <ToggleRow
            label="Display"
            options={displays.map((d) => ({ label: d, value: d }))}
            active={activeDisplay}
            onSelect={toggle}
          />
          {activeDisplay === "flex" && (
            <>
              <ToggleRow
                label="Flex Direction"
                options={flexDirs.map((d) => ({
                  label: d.replace("flex-", ""),
                  value: d,
                }))}
                active={activeFlex}
                onSelect={toggle}
              />
              <ToggleRow
                label="Align Items"
                options={aligns.map((a) => ({
                  label: a.replace("items-", ""),
                  value: a,
                }))}
                active={activeAlign}
                onSelect={toggle}
              />
              <ToggleRow
                label="Justify Content"
                options={justifys.map((j) => ({
                  label: j.replace("justify-", ""),
                  value: j,
                }))}
                active={activeJustify}
                onSelect={toggle}
              />
            </>
          )}
          {activeDisplay === "grid" && (
            <>
              <ToggleRow
                label="Grid Columns"
                options={cols.map((c) => ({
                  label: c.replace("grid-cols-", ""),
                  value: c,
                }))}
                active={activeCols}
                onSelect={toggle}
              />
              <ArbitraryInput
                id={id}
                label="Custom Columns"
                placeholder="e.g. grid-cols-[2fr_1fr]"
              />
            </>
          )}
          <ToggleRow
            label="Gap"
            options={gaps.map((g) => ({
              label: g.replace("gap-", ""),
              value: g,
            }))}
            active={activeGap}
            onSelect={toggle}
          />
        </>
      )}

      <ToggleRow
        label="Padding"
        options={paddings.map((p) => ({
          label: p.replace("p-", ""),
          value: p,
        }))}
        active={activePad}
        onSelect={toggle}
      />
      <ToggleRow
        label="Margin"
        options={margins.map((m) => ({ label: m.replace("m-", ""), value: m }))}
        active={activeMargin}
        onSelect={toggle}
      />
      <ToggleRow
        label="Width"
        options={widths.map((w) => ({ label: w.replace("w-", ""), value: w }))}
        active={activeW}
        onSelect={toggle}
      />
      <ToggleRow
        label="Height"
        options={heights.map((h) => ({ label: h.replace("h-", ""), value: h }))}
        active={activeH}
        onSelect={toggle}
      />
      <ToggleRow
        label="Border Radius"
        options={roundeds.map((r) => ({
          label: r.replace("rounded", "").replace("-", "") || "sm",
          value: r,
        }))}
        active={activeRound}
        onSelect={toggle}
      />
      <ToggleRow
        label="Border Width"
        options={borders.map((b) => ({
          label: b.replace("border-", "") || "1",
          value: b,
        }))}
        active={activeBorder}
        onSelect={toggle}
      />
      {activeBorder !== "border-0" && (
        <ToggleRow
          label="Border Color"
          options={borderColors.map((b) => ({
            label: b.replace("border-", ""),
            value: b,
          }))}
          active={activeBorderColor}
          onSelect={toggle}
        />
      )}
      <ToggleRow
        label="Shadow"
        options={shadows.map((s) => ({
          label: s.replace("shadow", "").replace("-", "") || "md",
          value: s,
        }))}
        active={activeShadow}
        onSelect={toggle}
      />
      <ToggleRow
        label="Overflow"
        options={overflows.map((o) => ({
          label: o.replace("overflow-", ""),
          value: o,
        }))}
        active={activeOverflow}
        onSelect={toggle}
      />

      {/* Background Color */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Background</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_BG.map((c) => (
            <button
              key={c.tw}
              onClick={() => toggle(c.tw)}
              title={c.label}
              className={clsx(
                "px-2 py-1 rounded text-xs font-mono transition border",
                has(c.tw)
                  ? "bg-indigo-600 text-white border-indigo-400"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ArbitraryInput
        id={id}
        label="Custom Class"
        placeholder="e.g. bg-[#1a1a2e] bg-red-100"
      />
    </>
  );
}

// ─── Direction Section ─────────────────────────────────────────────────────────

function DirectionSection({ id }: { id: string }) {
  const updateNodeAttribute = useEditorStore((s) => s.updateNodeAttribute);
  const node = useEditorStore((s) => s.findNodeById(id));
  if (!node) return null;
  const currentDir = (node.attributes?.dir as string) ?? "";
  return (
    <ToggleRow
      label="Text Direction"
      options={[
        { label: "LTR", value: "ltr" },
        { label: "RTL", value: "rtl" },
        { label: "Auto", value: "auto" },
      ]}
      active={currentDir}
      onSelect={(v) => updateNodeAttribute(id, "dir", v)}
    />
  );
}

// ─── Image Section ─────────────────────────────────────────────────────────────

// جایگزین با:
function ImageSection({ id }: { id: string }) {
  const updateNodeContent = useEditorStore((s) => s.updateNodeContent);
  const updateNodeStyles = useEditorStore((s) => s.updateNodeStyles);
  const updateNodeAttribute = useEditorStore((s) => s.updateNodeAttribute);
  const toggleTailwindClass = useEditorStore((s) => s.toggleTailwindClass);
  const node = useEditorStore((s) => s.findNodeById(id));
  const projectId = useEditorStore((s) => s.projectId);

  if (!node || !projectId) return null;

  const styles = (node.styles as Record<string, string>) ?? {};
  const currentW = styles.width ?? "";
  const currentH = styles.height ?? "";
  const currentOpacity = styles.opacity ?? "1";
  const currentRadius = styles.borderRadius ?? "";
  const currentFit = styles.objectFit ?? "cover";

  // Fit presets
  const fitOptions = ["cover", "contain", "fill", "none", "scale-down"];

  // Filter presets
  const filterOptions = [
    { label: "None", value: "" },
    { label: "Grayscale", value: "grayscale(100%)" },
    { label: "Sepia", value: "sepia(80%)" },
    { label: "Blur", value: "blur(4px)" },
    { label: "Bright", value: "brightness(1.3)" },
    { label: "Contrast", value: "contrast(1.4)" },
    { label: "Invert", value: "invert(100%)" },
  ];
  const currentFilter = styles.filter ?? "";

  return (
    <div className="space-y-3">
      {/* Image Source */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Image Source</p>
        <ImageSourceInput
          value={node.content ?? ""}
          onChange={(url) => updateNodeContent(id, url)}
          projectId={projectId}
        />
      </div>

      {/* Alt Text */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Alt Text</p>
        <input
          type="text"
          value={(node.attributes?.alt as string) ?? ""}
          onChange={(e) => updateNodeAttribute(id, "alt", e.target.value)}
          placeholder="Describe the image..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Size */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Size (px)</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="grid grid-cols-2 gap-2">
              {/* W */}
              <div>
                <p className="text-slate-600 text-xs mb-1">W</p>
                <input
                  type="number"
                  min={20}
                  value={parseInt(currentW) || 200}
                  onChange={(e) =>
                    updateNodeStyles(id, { width: `${e.target.value}px` })
                  }
                  placeholder="auto"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500 transition"
                />
              </div>
              {/* H */}
              <div>
                <p className="text-slate-600 text-xs mb-1">H</p>
                <input
                  type="number"
                  min={20}
                  value={parseInt(currentH) || 150}
                  onChange={(e) =>
                    updateNodeStyles(id, { height: `${e.target.value}px` })
                  }
                  placeholder="auto"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-slate-600 text-xs mb-1">H</p>
            <input
              type="number"
              min={20}
              value={parseInt(currentH) || ""}
              onChange={(e) =>
                updateNodeStyles(id, { height: `${e.target.value}px` })
              }
              placeholder="auto"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Object Fit */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Object Fit</p>
        <div className="flex flex-wrap gap-1">
          {fitOptions.map((fit) => (
            <button
              key={fit}
              onClick={() => updateNodeStyles(id, { objectFit: fit })}
              className={clsx(
                "px-2 py-1 rounded text-xs transition",
                currentFit === fit
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700",
              )}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Border Radius</p>
        <div className="flex gap-1 flex-wrap">
          {[
            { label: "None", value: "0px" },
            { label: "SM", value: "6px" },
            { label: "MD", value: "12px" },
            { label: "LG", value: "20px" },
            { label: "Full", value: "9999px" },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => updateNodeStyles(id, { borderRadius: r.value })}
              className={clsx(
                "px-2 py-1 rounded text-xs transition",
                currentRadius === r.value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">
          Opacity — {Math.round(parseFloat(currentOpacity) * 100)}%
        </p>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={parseFloat(currentOpacity)}
          onChange={(e) => updateNodeStyles(id, { opacity: e.target.value })}
          className="w-full accent-indigo-500"
        />
      </div>

      {/* Filter */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Filter</p>
        <div className="flex flex-wrap gap-1">
          {filterOptions.map((f) => (
            <button
              key={f.label}
              onClick={() => updateNodeStyles(id, { filter: f.value })}
              className={clsx(
                "px-2 py-1 rounded text-xs transition",
                currentFilter === f.value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flip */}
      <div>
        <p className="text-slate-500 text-xs mb-1.5">Flip</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const cur = styles.transform ?? "";
              const hasFlipX = cur.includes("scaleX(-1)");
              updateNodeStyles(id, {
                transform: hasFlipX
                  ? cur.replace("scaleX(-1)", "").trim()
                  : `${cur} scaleX(-1)`.trim(),
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <FlipHorizontal className="w-3 h-3" />
            Horizontal
          </button>
          <button
            onClick={() => {
              const cur = styles.transform ?? "";
              const hasFlipY = cur.includes("scaleY(-1)");
              updateNodeStyles(id, {
                transform: hasFlipY
                  ? cur.replace("scaleY(-1)", "").trim()
                  : `${cur} scaleY(-1)`.trim(),
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <FlipVertical className="w-3 h-3" />
            Vertical
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Active Classes ────────────────────────────────────────────────────────────

function ActiveClasses({ id }: { id: string }) {
  const { toggle } = useNodeActions(id);
  const node = useEditorStore((s) => s.findNodeById(id));
  const classes = node?.className?.split(" ").filter(Boolean) ?? [];
  if (classes.length === 0) return null;
  return (
    <div>
      <p className="text-slate-500 text-xs mb-1.5">Active Classes</p>
      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
        {classes.map((cls) => (
          <button
            key={cls}
            onClick={() => toggle(cls)}
            title="Click to remove"
            className="group flex items-center gap-0.5 bg-slate-800 hover:bg-red-900/40 border border-slate-700 hover:border-red-600/50 text-slate-300 hover:text-red-300 text-[10px] font-mono px-1.5 py-0.5 rounded transition"
          >
            {cls}
            <span className="opacity-0 group-hover:opacity-100 text-red-400 text-[10px] transition leading-none">
              ✕
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Raw Class Editor ──────────────────────────────────────────────────────────

function RawClassEditor({ id }: { id: string }) {
  const replaceClassName = useEditorStore((s) => s.replaceClassName);
  const node = useEditorStore((s) => s.findNodeById(id));
  if (!node) return null;
  return (
    <div className="px-3 py-2 border-t border-slate-800">
      <p className="text-slate-500 text-xs mb-1.5">Raw Tailwind Classes</p>
      <textarea
        value={node.className}
        onChange={(e) => replaceClassName(id, e.target.value)}
        rows={3}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono outline-none focus:border-indigo-500 transition resize-none placeholder:text-white font-bold"
      />
    </div>
  );
}

// ─── Slide Settings Panel ──────────────────────────────────────────────────────

function SlideSettingsPanel() {
  const { slideSettings, updateSlideSettings, resetSlideSettings } =
    useEditorStore();
  const { canvasWidth, canvasHeight } = slideSettings;
  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 overflow-y-auto shrink-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          Slide Settings
        </p>
        <button
          onClick={resetSlideSettings}
          title="Reset"
          className="text-slate-600 hover:text-slate-400 transition"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
      <div className="p-3 space-y-3">
        <div>
          <p className="text-slate-500 text-xs mb-1.5">Preset Sizes</p>
          <div className="grid grid-cols-1 gap-1">
            {SLIDE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() =>
                  updateSlideSettings({
                    canvasWidth: preset.width,
                    canvasHeight: preset.height,
                  })
                }
                className={clsx(
                  "flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition",
                  canvasWidth === preset.width && canvasHeight === preset.height
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                )}
              >
                <span>{preset.label}</span>
                <span className="font-mono text-[10px] opacity-60">
                  {preset.width}×{preset.height}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-slate-500 text-xs mb-1">Width</p>
            <input
              type="number"
              min={400}
              max={3840}
              step={10}
              value={canvasWidth}
              onChange={(e) =>
                updateSlideSettings({ canvasWidth: Number(e.target.value) })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Height</p>
            <input
              type="number"
              min={200}
              max={3840}
              step={10}
              value={canvasHeight}
              onChange={(e) =>
                updateSlideSettings({ canvasHeight: Number(e.target.value) })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>
        <p className="text-slate-600 text-xs">
          Ratio: {(canvasWidth / canvasHeight).toFixed(2)}:1
        </p>
      </div>
    </aside>
  );
}

function EmptyPanel() {
  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 flex items-center justify-center shrink-0">
      <p className="text-slate-600 text-xs text-center px-4">
        Select an element to see its properties
      </p>
    </aside>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function PropertiesPanel() {
  const selectedId = useEditorStore((s) => s.selectedNodeId);
  const findNodeById = useEditorStore((s) => s.findNodeById);

  if (!selectedId) return <SlideSettingsPanel />;

  const node = findNodeById(selectedId);
  if (!node) return <EmptyPanel />;

  const isTextTag = !["img", "div", "section", "ul", "ol"].includes(node.tag);
  const isImgTag = node.tag === "img";

  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 shrink-0">
        <span className="text-xs font-mono font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
          &lt;{node.tag}&gt;
        </span>
        <span className="text-slate-400 text-xs truncate">
          {node.content?.slice(0, 20) ?? ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isImgTag && (
          <Group label="Image">
            <ImageSection id={selectedId} />
          </Group>
        )}
        {isTextTag && (
          <Group label="Typography">
            <TypographySection id={selectedId} />
          </Group>
        )}
        <Group label="Layout & Spacing">
          <LayoutSection id={selectedId} />
        </Group>
        <Group label="Direction (RTL)">
          <DirectionSection id={selectedId} />
        </Group>
        <Group label="Active Classes">
          <ActiveClasses id={selectedId} />
        </Group>
      </div>

      <RawClassEditor id={selectedId} />
    </aside>
  );
}
