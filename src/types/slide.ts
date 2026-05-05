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
