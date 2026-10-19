import type { ReactNode } from "react";
import type { PublicRichTextMark, PublicRichTextNode } from "@/types/content";

function renderMarks(content: ReactNode, marks: PublicRichTextMark[] = []) {
  return marks.reduce<ReactNode>((child, mark, index) => {
    if (mark.type === "bold") return <strong key={index}>{child}</strong>;
    if (mark.type === "italic") return <em key={index}>{child}</em>;
    if (mark.type === "strike") return <s key={index}>{child}</s>;
    if (mark.type === "code") return <code key={index}>{child}</code>;
    if (mark.type === "link" && mark.attrs) return <a key={index} href={mark.attrs.href} target="_blank" rel="noopener noreferrer nofollow">{child}</a>;
    return child;
  }, content);
}

function Node({ node, path }: { node: PublicRichTextNode; path: string }) {
  if (node.type === "text") return <>{renderMarks(node.text ?? "", node.marks)}</>;
  if (node.type === "hardBreak") return <br/>;
  const children = node.content?.map((child, index) => <Node key={`${path}-${index}`} node={child} path={`${path}-${index}`}/>) ?? null;
  if (node.type === "doc") return <>{children}</>;
  if (node.type === "paragraph") return <p>{children}</p>;
  if (node.type === "heading") return node.attrs?.level === 3 ? <h3>{children}</h3> : <h2>{children}</h2>;
  if (node.type === "bulletList") return <ul>{children}</ul>;
  if (node.type === "orderedList") return <ol>{children}</ol>;
  if (node.type === "listItem") return <li>{children}</li>;
  if (node.type === "blockquote") return <blockquote>{children}</blockquote>;
  return null;
}

export function RichText({ document }: { document: PublicRichTextNode }) {
  return <div className="resource-prose"><Node node={document} path="root"/></div>;
}
