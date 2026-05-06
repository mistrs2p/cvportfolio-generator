import { nanoid } from "nanoid";

export type NodeType = "title" | "paragraph" | "section" | "image" | "columns";
export type ColumnContentType = "title" | "paragraph" | "section" | "image";

export interface NodeStyle {
  fontSize?: number;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  italic?: boolean;
  textAlign?: "left" | "center" | "right";
  color?: string;
}

export interface ColumnContentNode {
  id: string;
  type: ColumnContentType;
  content: string;
  style?: NodeStyle;
}

export interface SlideColumn {
  id: string;
  title?: string;
  nodes: ColumnContentNode[];
}

export interface SlideNode {
  id: string;
  type: NodeType;
  content: string;
  style: NodeStyle;
  columns?: SlideColumn[];
}

export interface SelectedColumnItem {
  nodeId: string;
  colId: string;
  cnId?: string; 
}

// types/slide.ts
export type ThemeId = 'dark-pro' | 'ocean' | 'sunset' | 'forest' | 'light-clean'

export interface Theme {
  id: ThemeId
  label: string
  bg: string        // رنگ پس‌زمینه اسلاید
  title: string     // رنگ پیش‌فرض title
  paragraph: string // رنگ پیش‌فرض paragraph
  section: string   // رنگ پیش‌فرض section
  accent: string    // رنگ accent (column border, ...)
}