import { useRef, useState } from "react";
import { FileUp, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { markdownToHtml, plainTextToHtml } from "@/lib/docs/utils";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When user confirms import. mode 'new' creates a new doc, 'insert' appends to current. */
  onImport: (params: {
    title: string;
    html: string;
    mode: "new" | "insert";
  }) => void;
  canInsertIntoCurrent: boolean;
}

const ACCEPTED = ".txt,.md,text/plain,text/markdown";

export function ImportModal({
  open,
  onOpenChange,
  onImport,
  canInsertIntoCurrent,
}: ImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"new" | "insert">("new");
  const [dragOver, setDragOver] = useState(false);

  const reset = () => {
    setFile(null);
    setText("");
    setError(null);
    setMode("new");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (f: File) => {
    const lower = f.name.toLowerCase();
    if (!lower.endsWith(".txt") && !lower.endsWith(".md")) {
      setError("Unsupported file. Please select a .txt or .md file.");
      return;
    }
    if (f.size > 1_000_000) {
      setError("File is too large. Max 1 MB.");
      return;
    }
    setError(null);
    setFile(f);
    const content = await f.text();
    setText(content);
  };

  const handleConfirm = () => {
    if (!file) return;
    const isMd = file.name.toLowerCase().endsWith(".md");
    const html = isMd ? markdownToHtml(text) : plainTextToHtml(text);
    const title = file.name.replace(/\.(md|txt)$/i, "");
    onImport({ title, html, mode });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Import file</DialogTitle>
          <DialogDescription>
            Supported: <span className="font-medium">.txt, .md</span>
          </DialogDescription>
        </DialogHeader>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void handleFile(f);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/40 px-4 py-8 text-center transition-colors",
            dragOver && "border-primary bg-accent",
          )}
        >
          <FileUp className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm font-medium">Drop a file here</p>
          <p className="text-xs text-muted-foreground">or</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <p className="text-[11px] text-muted-foreground">
            Supported: .txt, .md (max 1 MB)
          </p>
        </div>

        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}

        {file && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="truncate font-medium">{file.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}

        {file && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Import as
            </Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as "new" | "insert")}
              className="gap-2"
            >
              <Label
                htmlFor="import-new"
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-secondary/50"
              >
                <RadioGroupItem id="import-new" value="new" className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium">New document</div>
                  <div className="text-xs text-muted-foreground">
                    Create a new document with this content.
                  </div>
                </div>
              </Label>
              <Label
                htmlFor="import-insert"
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-secondary/50",
                  !canInsertIntoCurrent && "cursor-not-allowed opacity-50",
                )}
              >
                <RadioGroupItem
                  id="import-insert"
                  value="insert"
                  className="mt-0.5"
                  disabled={!canInsertIntoCurrent}
                />
                <div>
                  <div className="text-sm font-medium">
                    Insert into current document
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Append the content at the end of the open document.
                  </div>
                </div>
              </Label>
            </RadioGroup>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!file}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}