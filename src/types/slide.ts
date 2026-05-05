// types/slide.ts

// ─── Theme ──────────────────────────────────────────────────────────────────

export type ThemeId =
  | "dark-pro"
  | "clean-light"
  | "minimal-resume"
  | "warm-paper"
  | "custom";

export interface ThemeConfig {
  id: ThemeId;
  fontDisplay?: string;
  fontBody?: string;
  colorBg?: string;
  colorText?: string;
  colorAccent?: string;
  colorSurface?: string;
}

// ─── Layout Settings ─────────────────────────────────────────────────────────

export interface LayoutSettings {
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  padding?: "none" | "sm" | "md" | "lg";
}

// ─── Text Node ───────────────────────────────────────────────────────────────

export interface TextNode {
  id: string;
  type: "text";
  variant: "title" | "subtitle" | "paragraph" | "caption" | "quote";
  content: string;
  align?: "left" | "center" | "right";
}

// ─── Heading Node ────────────────────────────────────────────────────────────

export interface HeadingNode {
  id: string;
  type: "heading";
  level: 1 | 2 | 3;
  content: string;
  align?: "left" | "center" | "right";
}

// ─── Image Node ──────────────────────────────────────────────────────────────

export interface ImageNode {
  id: string;
  type: "image";
  src: string;
  alt?: string;
  caption?: string;
  fit?: "cover" | "contain";
  align?: "left" | "center" | "right";
  maxWidth?: string; // e.g. "400px", "100%"
}

// ─── List Node ───────────────────────────────────────────────────────────────

export interface ListNode {
  id: string;
  type: "list";
  style: "bullet" | "numbered";
  items: string[];
}

// ─── Divider Node ────────────────────────────────────────────────────────────

export interface DividerNode {
  id: string;
  type: "divider";
  style?: "solid" | "dashed" | "dotted";
}

// ─── Feature List Node ───────────────────────────────────────────────────────

export interface FeatureItem {
  icon?: string;
  title: string;
  description?: string;
}

export interface FeatureListNode {
  id: string;
  type: "featureList";
  items: FeatureItem[];
  columns?: 1 | 2 | 3;
}

// ─── Comparison Node ─────────────────────────────────────────────────────────

export interface ComparisonSide {
  label: string;
  items: string[];
  color?: string;
}

export interface ComparisonNode {
  id: string;
  type: "comparison";
  left: ComparisonSide;
  right: ComparisonSide;
}

// ─── Badge Node ──────────────────────────────────────────────────────────────

export interface BadgeNode {
  id: string;
  type: "badge";
  items: string[]; // e.g. ["TypeScript", "Node.js", "React"]
  color?: "default" | "primary" | "success" | "warning";
}

// ─── Column Node ─────────────────────────────────────────────────────────────

export interface ColumnNode {
  id: string;
  type: "column";
  width?: string; // e.g. "1fr", "2fr", "300px"
  nodes: ContentNode[];
}

// ─── Row Node (Layout) ───────────────────────────────────────────────────────

export interface RowNode {
  id: string;
  type: "row";
  columns: ColumnNode[];
  settings?: LayoutSettings;
}

// ─── Group Node ──────────────────────────────────────────────────────────────

export interface GroupNode {
  id: string;
  type: "group";
  label?: string;
  nodes: ContentNode[];
  settings?: LayoutSettings;
}

// ─── Union Types ─────────────────────────────────────────────────────────────

// content nodes = any leaf node
export type ContentNode =
  | TextNode
  | HeadingNode
  | ImageNode
  | ListNode
  | DividerNode
  | FeatureListNode
  | ComparisonNode
  | BadgeNode;

// all nodes = layout + content
// export type SlideNode = RowNode | GroupNode | ContentNode;

// ─── Slide ───────────────────────────────────────────────────────────────────

export interface Slide {
  id: string;
  projectId: string;
  title?: string;
  order: number;
  nodes: SlideNode[];
  createdAt: string;
  updatedAt: string;
}

// ─── Project ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  tags: string[];
  slug?: string;
  isPublic: boolean;
  themeConfig: ThemeConfig;
  slides?: Slide[];
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export type NodeType = "title" | "paragraph" | "section" | "image" | "columns";
export type SlideNodeType =
  | "title"
  | "paragraph"
  | "section"
  | "image"
  | "columns" // ← جدید

export interface SlideNode {
  id: string;
  type: SlideNodeType;
  content?: string;
  columns?: ColumnNode[];
  style: {
    fontSize?: number;
    fontWeight?: "normal" | "medium" | "semibold" | "bold";
    textAlign?: "left" | "center" | "right";
    color?: string;
    italic?: boolean;
  };
}

export interface SkillItem {
  icon: string; // نام آیکون در Simple Icons (مثلا "react", "mongodb")
  label: string; // متن زیر آیکون
}

export interface ColumnNode {
  id: string;
  title: string;
  items: SkillItem[];
}
