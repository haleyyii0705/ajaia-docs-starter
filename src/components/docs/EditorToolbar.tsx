import type { ComponentType } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EditorToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
}

export function EditorToolbar({ editor, disabled }: EditorToolbarProps) {
  const fmt = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) {
        return {
          bold: false,
          italic: false,
          underline: false,
          h1: false,
          h2: false,
          bulletList: false,
          orderedList: false,
        };
      }
      return {
        bold: ed.isActive("bold"),
        italic: ed.isActive("italic"),
        underline: ed.isActive("underline"),
        h1: ed.isActive("heading", { level: 1 }),
        h2: ed.isActive("heading", { level: 2 }),
        bulletList: ed.isActive("bulletList"),
        orderedList: ed.isActive("orderedList"),
      };
    },
  }) ?? {
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    bulletList: false,
    orderedList: false,
  };

  const Btn = ({
    label,
    icon: Icon,
    pressed,
    onClick,
  }: {
    label: string;
    icon: ComponentType<{ className?: string }>;
    pressed: boolean;
    onClick: () => void;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          aria-label={label}
          pressed={pressed}
          disabled={disabled || !editor}
          onMouseDown={(e) => {
            e.preventDefault();
            onClick();
          }}
          className="h-8 w-8 p-0"
        >
          <Icon className="h-4 w-4" />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-border bg-background/95 px-3 py-1.5 backdrop-blur">
      <Btn
        label="Bold"
        icon={Bold}
        pressed={fmt.bold}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      />
      <Btn
        label="Italic"
        icon={Italic}
        pressed={fmt.italic}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      />
      <Btn
        label="Underline"
        icon={Underline}
        pressed={fmt.underline}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn
        label="Heading 1"
        icon={Heading1}
        pressed={fmt.h1}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <Btn
        label="Heading 2"
        icon={Heading2}
        pressed={fmt.h2}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn
        label="Bullet list"
        icon={List}
        pressed={fmt.bulletList}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      />
      <Btn
        label="Numbered list"
        icon={ListOrdered}
        pressed={fmt.orderedList}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      />
    </div>
  );
}
