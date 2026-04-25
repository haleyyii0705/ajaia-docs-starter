import { FileText, Plus, Users, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types/docs";
import { DocumentList } from "./DocumentList";

interface SidebarProps {
  myDocs: DocumentItem[];
  sharedDocs: DocumentItem[];
  activeDocId: string | null;
  onSelect: (id: string) => void;
  onNewDocument: () => void;
}

export function Sidebar({
  myDocs,
  sharedDocs,
  activeDocId,
  onSelect,
  onNewDocument,
}: SidebarProps) {
  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-border bg-workspace">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileText className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">Ajaia Docs</span>
          <span className="text-[11px] text-muted-foreground">Internal team workspace</span>
        </div>
      </div>

      {/* New doc */}
      <div className="px-3">
        <Button
          onClick={onNewDocument}
          className="w-full justify-start gap-2 shadow-sm"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New document
        </Button>
      </div>

      {/* Sections */}
      <div className="mt-5 flex-1 overflow-y-auto px-2 pb-4">
        <Section
          icon={<FolderOpen className="h-3.5 w-3.5" />}
          label="My Documents"
          count={myDocs.length}
        >
          <DocumentList
            documents={myDocs}
            activeId={activeDocId}
            onSelect={onSelect}
            variant="owned"
            emptyLabel="No documents yet. Create one to get started."
          />
        </Section>

        <Section
          icon={<Users className="h-3.5 w-3.5" />}
          label="Shared with me"
          count={sharedDocs.length}
        >
          <DocumentList
            documents={sharedDocs}
            activeId={activeDocId}
            onSelect={onSelect}
            variant="shared"
            emptyLabel="Nothing shared with you yet."
          />
        </Section>
      </div>
    </aside>
  );
}

function Section({
  icon,
  label,
  count,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div
        className={cn(
          "flex items-center gap-2 px-3 pb-2 pt-3",
          "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
        )}
      >
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-muted-foreground/70">{count}</span>
      </div>
      {children}
    </div>
  );
}