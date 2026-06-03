export type HTMLTag =
  | "div"
  | "section"
  | "article"
  | "header"
  | "footer"
  | "main"
  | "aside"
  | "nav"
  | "span"
  | "p"
  | "a"
  | "strong"
  | "em"
  | "small"
  | "blockquote"
  | "code"
  | "pre"
  | "ul"
  | "ol"
  | "li"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "img"
  | "button"
  | "hr";

export type ExportFormat = "html" | "react" | "css" | "pdf";

export type SlideNodeType =
  | "container"
  | "text"
  | "heading"
  | "image"
  | "shape"
  | "icon"
  | "divider"
  | "button"
  | "list"
  | "chart"
  | "code"
  | "badge"
  | "quote";

export type SlideBackgroundType = "color" | "gradient" | "solid";
export type TextAlign = "left" | "center" | "right" | "justify";
export type FontWeight = "normal" | "medium" | "semibold" | "bold" | number;

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface SlideBackground {
  type: SlideBackgroundType;
  value: string;
  from?: string;
  to?: string;
  angle?: number;
}

export interface SlideSettings {
  backgroundType: "solid" | "gradient" | "color";
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
  gap: number;
}

export const DEFAULT_SLIDE_SETTINGS: SlideSettings = {
  backgroundType: "solid",
  backgroundColor: "#0f172a",
  gradientFrom: "#0f172a",
  gradientTo: "#1e293b",
  gradientAngle: 135,
  canvasWidth: 800,
  canvasHeight: 450,
  padding: 32,
  gap: 16,
};

export interface SlideNodeStyles {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string | number;
  fontSize?: string | number;
  fontWeight?: FontWeight;
  fontFamily?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textAlign?: TextAlign;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  padding?: string | number;
  margin?: string | number;
  gap?: string | number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  opacity?: string | number;
  zIndex?: string | number;
  display?: string;
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  justifyContent?: string;
  alignItems?: string;
  objectFit?: string;
  boxShadow?: string;
  transform?: string;
  [key: string]: string | number | undefined;
}

export interface SlideNodeData {
  src?: string;
  alt?: string;
  href?: string;
  icon?: string;
  label?: string;
  chartType?: string;
  chartData?: unknown;
  codeLanguage?: string;
  [key: string]: unknown;
}

export interface SlideNode {
  id: string;
  type: SlideNodeType;
  tag: HTMLTag;
  content?: string;
  className: string;
  styles: SlideNodeStyles;
  children?: SlideNode[];
  attributes?: Record<string, string>;
  isEditing?: boolean;
  position?: Position;
  size?: Size;
  name?: string;
  locked?: boolean;
  hidden?: boolean;
  data?: SlideNodeData;
}

export type PartialSlideNode = Partial<Omit<SlideNode, "id">> & {
  tag: HTMLTag;
  children?: PartialSlideNode[];
};

export interface ElementDefinition {
  type?: SlideNodeType;
  tag: HTMLTag;
  label: string;
  icon?: string;
  description?: string;
  defaultContent?: string;
  defaultClassName?: string;
  defaultStyles?: SlideNodeStyles;
  defaultChildren?: PartialSlideNode[];
  attributes?: Record<string, string>;
  allowChildren?: boolean;
}

export type ElementDef = ElementDefinition;

export interface ElementGroup {
  label: string;
  elements: ElementDefinition[];
}

export interface Slide {
  id: string;
  name: string;
  nodes: SlideNode[];
  background: SlideBackground;
  thumbnail?: string;
}

export interface SlideDocument {
  projectId?: string;
  slides: Slide[];
  slideSettings: SlideSettings;
  version: number;
}

export interface ExportSlidePayload {
  format: ExportFormat;
  slideSettings: SlideSettings;
}

export interface UpdateSlidePayload {
  title?: string;
  nodes?: SlideNode[];
}

export interface ReorderSlideInput {
  id: string;
  order: number;
}
