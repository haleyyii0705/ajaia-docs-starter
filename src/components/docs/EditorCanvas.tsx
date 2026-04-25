import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "@/components/docs/EditorToolbar";

interface EditorCanvasProps {
  /** HTML content when the document loads (bound to `resetKey`) */
  initialHtml: string;
  onChange: (html: string) => void;
  /** When this changes, the editor is recreated with `initialHtml` */
  resetKey: string;
  readOnly?: boolean;
  placeholder?: string;
}

export function EditorCanvas({
  initialHtml,
  onChange,
  resetKey,
  readOnly,
  placeholder,
}: EditorCanvasProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing your document…",
      }),
    ],
    [placeholder],
  );

  const editor = useEditor(
    {
      extensions,
      content: initialHtml,
      editable: !readOnly,
      editorProps: {
        attributes: {
          class: cn(
            "editor-canvas tiptap",
            "min-h-[60vh] text-canvas-foreground prose prose-slate max-w-none focus:outline-none",
          ),
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    },
    [resetKey],
  );

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!readOnly);
  }, [readOnly, editor]);

  return (
    <>
      <EditorToolbar editor={editor} disabled={readOnly} />
      <div className="flex justify-center bg-workspace py-8">
        <div
          className={cn(
            "w-full max-w-3xl rounded-lg border border-border bg-canvas px-12 py-14 shadow-soft",
            readOnly && "opacity-95",
          )}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
}
