import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EditorToolbarProps {
  onCommand: (cmd: string, value?: string) => void;
  disabled?: boolean;
}

export function EditorToolbar({ onCommand, disabled }: EditorToolbarProps) {
  const Btn = ({
    label,
    icon: Icon,
    onClick,
  }: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          aria-label={label}
          disabled={disabled}
          // Use onMouseDown to preserve selection in the contenteditable
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
      <Btn label="Bold" icon={Bold} onClick={() => onCommand("bold")} />
      <Btn label="Italic" icon={Italic} onClick={() => onCommand("italic")} />
      <Btn
        label="Underline"
        icon={Underline}
        onClick={() => onCommand("underline")}
      />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn
        label="Heading 1"
        icon={Heading1}
        onClick={() => onCommand("formatBlock", "H1")}
      />
      <Btn
        label="Heading 2"
        icon={Heading2}
        onClick={() => onCommand("formatBlock", "H2")}
      />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn
        label="Bullet list"
        icon={List}
        onClick={() => onCommand("insertUnorderedList")}
      />
      <Btn
        label="Numbered list"
        icon={ListOrdered}
        onClick={() => onCommand("insertOrderedList")}
      />
    </div>
  );
}