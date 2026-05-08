const ARBITRARY_MAP: Array<{
  pattern: RegExp;
  toCss: (val: string) => React.CSSProperties;
}> = [
  { pattern: /^p-\[(.+)\]$/, toCss: (v) => ({ padding: v }) },
  { pattern: /^px-\[(.+)\]$/, toCss: (v) => ({ paddingLeft: v, paddingRight: v }) },
  { pattern: /^py-\[(.+)\]$/, toCss: (v) => ({ paddingTop: v, paddingBottom: v }) },
  { pattern: /^pt-\[(.+)\]$/, toCss: (v) => ({ paddingTop: v }) },
  { pattern: /^pb-\[(.+)\]$/, toCss: (v) => ({ paddingBottom: v }) },
  { pattern: /^pl-\[(.+)\]$/, toCss: (v) => ({ paddingLeft: v }) },
  { pattern: /^pr-\[(.+)\]$/, toCss: (v) => ({ paddingRight: v }) },
  { pattern: /^m-\[(.+)\]$/, toCss: (v) => ({ margin: v }) },
  { pattern: /^mx-\[(.+)\]$/, toCss: (v) => ({ marginLeft: v, marginRight: v }) },
  { pattern: /^my-\[(.+)\]$/, toCss: (v) => ({ marginTop: v, marginBottom: v }) },
  { pattern: /^mt-\[(.+)\]$/, toCss: (v) => ({ marginTop: v }) },
  { pattern: /^mb-\[(.+)\]$/, toCss: (v) => ({ marginBottom: v }) },
  { pattern: /^w-\[(.+)\]$/, toCss: (v) => ({ width: v }) },
  { pattern: /^h-\[(.+)\]$/, toCss: (v) => ({ height: v }) },
  { pattern: /^min-w-\[(.+)\]$/, toCss: (v) => ({ minWidth: v }) },
  { pattern: /^min-h-\[(.+)\]$/, toCss: (v) => ({ minHeight: v }) },
  { pattern: /^max-w-\[(.+)\]$/, toCss: (v) => ({ maxWidth: v }) },
  { pattern: /^max-h-\[(.+)\]$/, toCss: (v) => ({ maxHeight: v }) },

  // ✅ رنگ متن — باید قبل از fontSize بیاد
  { pattern: /^text-\[#([0-9a-fA-F]{3,8})\]$/, toCss: (v) => ({ color: `#${v}` }) },
  { pattern: /^text-\[(rgb|rgba|hsl|hsla).+\]$/, toCss: (v) => ({ color: v }) },

  // ✅ font size — فقط وقتی مقدار واحد CSS داره (px, rem, em, %)
  { pattern: /^text-\[(\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%|ch))\]$/, toCss: (v) => ({ fontSize: v }) },

  { pattern: /^bg-\[#([0-9a-fA-F]{3,8})\]$/, toCss: (v) => ({ backgroundColor: `#${v}` }) },
  { pattern: /^bg-\[(rgb|rgba|hsl|hsla).+\]$/, toCss: (v) => ({ backgroundColor: v }) },
  { pattern: /^border-\[(.+)\]$/, toCss: (v) => ({ borderColor: v }) },
  { pattern: /^rounded-\[(.+)\]$/, toCss: (v) => ({ borderRadius: v }) },
  { pattern: /^gap-\[(.+)\]$/, toCss: (v) => ({ gap: v }) },
  { pattern: /^top-\[(.+)\]$/, toCss: (v) => ({ top: v }) },
  { pattern: /^left-\[(.+)\]$/, toCss: (v) => ({ left: v }) },
  { pattern: /^right-\[(.+)\]$/, toCss: (v) => ({ right: v }) },
  { pattern: /^bottom-\[(.+)\]$/, toCss: (v) => ({ bottom: v }) },
  { pattern: /^z-\[(.+)\]$/, toCss: (v) => ({ zIndex: v }) },
  { pattern: /^opacity-\[(.+)\]$/, toCss: (v) => ({ opacity: v }) },
  { pattern: /^grid-cols-\[(.+)\]$/, toCss: (v) => ({ gridTemplateColumns: v.replace(/_/g, " ") }) },
  { pattern: /^grid-rows-\[(.+)\]$/, toCss: (v) => ({ gridTemplateRows: v.replace(/_/g, " ") }) },
  { pattern: /^leading-\[(.+)\]$/, toCss: (v) => ({ lineHeight: v }) },
  { pattern: /^tracking-\[(.+)\]$/, toCss: (v) => ({ letterSpacing: v }) },
];

export function parseArbitraryClasses(className: string): React.CSSProperties {
  const classes = className.split(" ").filter(Boolean);
  let styles: React.CSSProperties = {};

  for (const cls of classes) {
    for (const { pattern, toCss } of ARBITRARY_MAP) {
      const match = cls.match(pattern);
      if (match) {
        styles = { ...styles, ...toCss(match[1]) };
        break;
      }
    }
  }

  return styles;
}
