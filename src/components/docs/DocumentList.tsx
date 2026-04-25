import { FileText, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/docs/utils";
import type { DocumentItem } from "@/types/docs";

interface DocumentListProps {
  documents: DocumentItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  currentUserEmail: string;
  variant: "owned" | "shared";
  emptyLabel: string;
}

export function DocumentList({
  documents,
  activeId,
  onSelect,
  currentUserEmail,
  variant,
  emptyLabel,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="mx-3 flex flex-col items-start gap-1 rounded-md border border-dashed border-border bg-background/40 px-3 py-3 text-xs text-muted-foreground">
        <Inbox className="h-3.5 w-3.5 text-muted-foreground/70" />
        <p>{emptyLabel}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5 px-1">
      {documents.map((doc) => {
        const isActive = doc.id === activeId;
        const sharedFromOwner =
          variant === "shared" ? doc.ownerEmail : null;
        return (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() => onSelect(doc.id)}
              className={cn(
                "group flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors",
                "hover:bg-secondary",
                isActive && "bg-accent text-accent-foreground hover:bg-accent",
              )}
            >
              <FileText
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "truncate text-sm",
                      isActive ? "font-semibold" : "font-medium text-foreground",
                    )}
                  >
                    {doc.title || "Untitled"}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>{formatRelativeTime(doc.updatedAt)}</span>
                  {sharedFromOwner && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="truncate">
                        from {sharedFromOwner.split("@")[0]}
                      </span>
                    </>
                  )}
                  {variant === "owned" && doc.access.length > 0 && (
                    <>
                      <span aria-hidden>·</span>
                      <span>shared</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}