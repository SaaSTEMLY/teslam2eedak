type Dir = "ltr" | "rtl";

const textNode = (t: string, format: number = 0) => ({
  detail: 0,
  format,
  mode: "normal" as const,
  style: "",
  text: t,
  type: "text" as const,
  version: 1,
});

const paragraphNode = (
  children: object[],
  textFormat: number = 0,
  format: string = "",
  dir: Dir = "ltr",
) => ({
  children,
  direction: dir,
  format,
  indent: 0,
  type: "paragraph" as const,
  version: 1,
  textFormat,
  textStyle: "",
});

const headingNode = (
  text: string,
  tag: "h1" | "h2" | "h3" | "h4" = "h2",
  dir: Dir = "ltr",
) => ({
  children: [textNode(text, 1)],
  direction: dir,
  format: "" as const,
  indent: 0,
  type: "heading" as const,
  version: 1,
  tag,
});

const listItemNode = (text: string, dir: Dir = "ltr") => ({
  children: [textNode(text)],
  direction: dir,
  format: "" as const,
  indent: 0,
  type: "listitem" as const,
  version: 1,
  value: 1,
});

const listNode = (
  items: string[],
  tag: "ul" | "ol" = "ul",
  dir: Dir = "ltr",
) => ({
  children: items.map((item) => listItemNode(item, dir)),
  direction: dir,
  format: "" as const,
  indent: 0,
  type: "list" as const,
  version: 1,
  listType: tag === "ol" ? ("number" as const) : ("bullet" as const),
  start: 1,
  tag,
});

const cellNode = (
  content: string,
  bold = false,
  headerState: number = 0,
  width: number = 100,
  dir: Dir = "ltr",
) => ({
  children: [
    paragraphNode([textNode(content, bold ? 1 : 0)], bold ? 1 : 0, "left", dir),
  ],
  direction: dir,
  format: "" as const,
  indent: 0,
  type: "tablecell" as const,
  version: 1,
  textFormat: bold ? 1 : 0,
  backgroundColor: null,
  colSpan: 1,
  headerState,
  rowSpan: 1,
  width,
});

const rowNode = (cells: object[]) => ({
  children: cells,
  direction: "ltr" as const,
  format: "center" as const,
  indent: 0,
  type: "tablerow" as const,
  version: 1,
});

let codeBlockCounter = 0;

const codeBlockNode = (code: string, language: string = "typescript") => ({
  type: "block" as const,
  version: 2,
  format: "" as const,
  fields: {
    id: `codeblock-${String(++codeBlockCounter).padStart(4, "0")}`,
    blockName: "",
    blockType: "Code" as const,
    language,
    code,
  },
});

const richText = (
  children: { type: string; version: number; [k: string]: unknown }[],
  dir: Dir = "ltr",
) => ({
  root: {
    children,
    direction: dir,
    format: "" as const,
    indent: 0,
    type: "root" as const,
    version: 1,
  },
});

export type { Dir };
export {
  cellNode,
  codeBlockNode,
  headingNode,
  listNode,
  paragraphNode,
  richText,
  rowNode,
  textNode,
};
