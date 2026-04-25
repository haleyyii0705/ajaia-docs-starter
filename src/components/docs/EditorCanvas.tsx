import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface EditorCanvasProps {
  /** HTML content to seed the editor with on document change */
  initialHtml: string;
  /** Fires after edits */
  onChange: (html: string) => void;
  /** Reset key — when this changes, content is re-seeded */
  resetKey: string;
  readOnly?: boolean;
  placeholder?: string;
}

export const EditorCanvas = forwardRef<HTMLDivElement, EditorCanvasProps>(
  ({ initialHtml, onChange, resetKey, readOnly, placeholder }, ref) => {
    const localRef = useRef<HTMLDivElement | null>(null);

    // Seed content when document changes (not on every keystroke)
    useEffect(() => {
      if (localRef.current && localRef.current.innerHTML !== initialHtml) {
        localRef.current.innerHTML = initialHtml;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    return (
      <div className="flex justify-center bg-workspace py-8">
        <div className="w-full max-w-3xl rounded-lg border border-border bg-canvas px-12 py-14 shadow-soft">
          <div
            ref={(node) => {
              localRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }}
            className={cn(
              "editor-canvas min-h-[60vh] text-canvas-foreground",
              "prose prose-slate max-w-none focus:outline-none",
              readOnly && "opacity-90",
            )}
            data-placeholder={placeholder ?? "Start writing your document…"}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            spellCheck
            onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
          />
        </div>
      </div>
    );
  },
);
EditorCanvas.displayName = "EditorCanvas";