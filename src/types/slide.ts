export type HTMLTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "a"
  | "strong"
  | "em"
  | "div"
  | "section"
  | "article"
  | "ul"
  | "ol"
  | "li"
  | "img"
  | "button"
  | "hr"
  | "blockquote";

export type ExportFormat = "html" | "react" | "css" | "pdf";
export interface SlideSettings {
  backgroundType: "color" | "gradient" | "solid";
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
  gap: number;
}

export type PartialSlideNode = Omit<SlideNode, "id"> & {
  id?: string;
  children?: PartialSlideNode[];
};

export interface ElementDef {
  tag: HTMLTag;
  label: string;
  icon?: string;
  defaultContent?: string;
  defaultClassName?: string;
  defaultChildren?: PartialSlideNode[];  
  attributes?: Record<string, string>;
}

export interface SlideNode {
  id: string;
  tag: HTMLTag;
  content?: string; 
  className: string; 
  children?: SlideNode[]; 
  attributes?: Record<string, string>; 
  isEditing?: boolean; 
}

export interface SlideBackground {
  type: "color" | "gradient" | "image";
  value: string; 
}

export interface Slide {
  id: string;
  nodes: SlideNode[];
  background: SlideBackground;
  thumbnail?: string;
  name?: string; 
}

export interface EditorState {
  slides: Slide[];
  currentSlideIndex: number;
  selectedNodeId: string | null;
  history: HistoryEntry[];
  historyIndex: number;
}

export interface HistoryEntry {
  slides: Slide[];
  description: string; 
}

export interface ElementGroup {
  label: string;
  icon?: string;
  elements: ElementDefinition[];
}
export type ElementDefinition = ElementDef;

export const ELEMENT_PALETTE: ElementGroup[] = [
  {
    label: "Headings",
    icon: "Heading",
    elements: [
      {
        tag: "h1",
        label: "Heading 1",
        icon: "H1",
        defaultContent: "Heading 1",
        defaultClassName: "text-4xl font-bold text-gray-900",
      },
      {
        tag: "h2",
        label: "Heading 2",
        icon: "H2",
        defaultContent: "Heading 2",
        defaultClassName: "text-3xl font-semibold text-gray-800",
      },
      {
        tag: "h3",
        label: "Heading 3",
        icon: "H3",
        defaultContent: "Heading 3",
        defaultClassName: "text-2xl font-semibold text-gray-700",
      },
      {
        tag: "h4",
        label: "Heading 4",
        icon: "H4",
        defaultContent: "Heading 4",
        defaultClassName: "text-xl font-medium text-gray-700",
      },
      {
        tag: "h5",
        label: "Heading 5",
        icon: "H5",
        defaultContent: "Heading 5",
        defaultClassName: "text-lg font-medium text-gray-600",
      },
      {
        tag: "h6",
        label: "Heading 6",
        icon: "H6",
        defaultContent: "Heading 6",
        defaultClassName: "text-base font-medium text-gray-600",
      },
    ],
  },
  {
    label: "Text",
    icon: "Type",
    elements: [
      {
        tag: "p",
        label: "Paragraph",
        icon: "AlignLeft",
        defaultContent: "Start typing your paragraph here...",
        defaultClassName: "text-base text-gray-700 leading-relaxed",
      },
      {
        tag: "span",
        label: "Inline Text",
        icon: "Baseline",
        defaultContent: "Inline text",
        defaultClassName: "text-base text-gray-700",
      },
      {
        tag: "blockquote",
        label: "Quote",
        icon: "Quote",
        defaultContent: "Your quote here...",
        defaultClassName:
          "border-l-4 border-blue-500 pl-4 italic text-gray-600 text-lg",
      },
      {
        tag: "strong",
        label: "Bold Text",
        icon: "Bold",
        defaultContent: "Bold text",
        defaultClassName: "font-bold text-gray-900",
      },
    ],
  },
  {
    label: "Layout",
    icon: "Layout",
    elements: [
      {
        tag: "div",
        label: "Container",
        icon: "Square",
        defaultContent: "",
        defaultClassName: "flex flex-col gap-4 p-4",
        defaultChildren: [],
      },
      {
        tag: "div",
        label: "2 Columns",
        icon: "Columns",
        defaultContent: "",
        defaultClassName: "grid grid-cols-2 gap-6 w-full",
        defaultChildren: [
          {
            id: "",
            tag: "div",
            content: "",
            className:
              "flex flex-col gap-2 p-4 bg-gray-50 rounded-lg min-h-[100px]",
            children: [],
          },
          {
            id: "",
            tag: "div",
            content: "",
            className:
              "flex flex-col gap-2 p-4 bg-gray-50 rounded-lg min-h-[100px]",
            children: [],
          },
        ],
      },
      {
        tag: "div",
        label: "3 Columns",
        icon: "Columns3",
        defaultContent: "",
        defaultClassName: "grid grid-cols-3 gap-4 w-full",
        defaultChildren: [
          {
            id: "",
            tag: "div",
            content: "",
            className:
              "flex flex-col gap-2 p-3 bg-gray-50 rounded-lg min-h-[100px]",
            children: [],
          },
          {
            id: "",
            tag: "div",
            content: "",
            className:
              "flex flex-col gap-2 p-3 bg-gray-50 rounded-lg min-h-[100px]",
            children: [],
          },
          {
            id: "",
            tag: "div",
            content: "",
            className:
              "flex flex-col gap-2 p-3 bg-gray-50 rounded-lg min-h-[100px]",
            children: [],
          },
        ],
      },
      {
        tag: "hr",
        label: "Divider",
        icon: "Minus",
        defaultContent: "",
        defaultClassName: "border-t border-gray-300 w-full my-2",
      },
    ],
  },
  {
    label: "List",
    icon: "List",
    elements: [
      {
        tag: "ul",
        label: "Bullet List",
        icon: "List",
        defaultContent: "",
        defaultClassName: "list-disc list-inside space-y-2 text-gray-700",
        defaultChildren: [
          { id: "", tag: "li", content: "List item 1", className: "text-base" },
          { id: "", tag: "li", content: "List item 2", className: "text-base" },
          { id: "", tag: "li", content: "List item 3", className: "text-base" },
        ],
      },
      {
        tag: "ol",
        label: "Numbered List",
        icon: "ListOrdered",
        defaultContent: "",
        defaultClassName: "list-decimal list-inside space-y-2 text-gray-700",
        defaultChildren: [
          { id: "", tag: "li", content: "First item", className: "text-base" },
          { id: "", tag: "li", content: "Second item", className: "text-base" },
          { id: "", tag: "li", content: "Third item", className: "text-base" },
        ],
      },
    ],
  },
  {
    label: "Media",
    icon: "Image",
    elements: [
      {
        tag: "img",
        label: "Image",
        icon: "Image",
        defaultContent: "https://placehold.co/400x300",
        defaultClassName: "w-full h-auto rounded-lg object-cover",
        defaultChildren: undefined,
      },
    ],
  },
  {
    label: "Interactive",
    icon: "MousePointer",
    elements: [
      {
        tag: "button",
        label: "Button",
        icon: "MousePointer",
        defaultContent: "Click me",
        defaultClassName:
          "px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700",
      },
      {
        tag: "a",
        label: "Link",
        icon: "Link",
        defaultContent: "Click here",
        defaultClassName: "text-blue-600 underline hover:text-blue-800",
        attributes: { href: "#" },
      },
    ],
  },
];

export const DEFAULTSLIDESETTINGS: SlideSettings = {
  backgroundType: "solid",
  backgroundColor: "#0f172a",
  gradientFrom: "#6366f1",
  gradientTo: "#8b5cf6",
  gradientAngle: 135,
  canvasWidth: 800,
  canvasHeight: 450,
  padding: 32,
  gap: 16,
};
