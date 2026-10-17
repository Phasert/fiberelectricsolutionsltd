"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Pilcrow, Redo2, Undo2 } from "lucide-react";
import type { JSONContent } from "@tiptap/react";

export function RichTextEditor({ initialContent, onChange, error }: { initialContent?: Record<string, unknown>; onChange: (value: JSONContent) => void; error?: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } })],
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: { attributes: { class: "prose-editor min-h-64 px-4 py-4 text-sm leading-7 focus:outline-none", "aria-label": "Article content" } },
    onUpdate: ({ editor: instance }) => onChange(instance.getJSON()),
  });
  if (!editor) return <div className="min-h-72 animate-pulse rounded-lg border border-black/10 bg-paper" aria-label="Loading editor"/>;
  const setLink = () => { const previous = editor.getAttributes("link").href as string | undefined; const href = window.prompt("Enter a full link URL", previous ?? "https://"); if (href === null) return; if (!href.trim()) editor.chain().focus().unsetLink().run(); else editor.chain().focus().extendMarkRange("link").setLink({ href }).run(); };
  const actions = [
    { label: "Paragraph", icon: Pilcrow, active: editor.isActive("paragraph"), run: () => editor.chain().focus().setParagraph().run() },
    { label: "Heading", icon: Heading2, active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Bold", icon: Bold, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Bullet list", icon: List, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Link", icon: Link2, active: editor.isActive("link"), run: setLink },
    { label: "Undo", icon: Undo2, active: false, disabled: !editor.can().undo(), run: () => editor.chain().focus().undo().run() },
    { label: "Redo", icon: Redo2, active: false, disabled: !editor.can().redo(), run: () => editor.chain().focus().redo().run() },
  ];
  return <div className={`overflow-hidden rounded-lg border bg-white ${error ? "border-red-400" : "border-black/15"}`}>
    <div className="flex flex-wrap gap-1 border-b border-black/10 bg-paper/55 p-2" role="toolbar" aria-label="Text formatting">{actions.map(({ label, icon: Icon, active, disabled, run }) => <button key={label} type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onClick={run} className={`grid size-9 place-items-center rounded-md disabled:opacity-30 ${active ? "bg-wine text-white" : "text-ink/65 hover:bg-white"}`}><Icon size={17}/></button>)}</div>
    <EditorContent editor={editor}/>
  </div>;
}
