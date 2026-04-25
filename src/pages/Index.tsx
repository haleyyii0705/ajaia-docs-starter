import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/docs/Sidebar";
import { TopBar, type SaveStatus } from "@/components/docs/TopBar";
import { EditorToolbar } from "@/components/docs/EditorToolbar";
import { EditorCanvas } from "@/components/docs/EditorCanvas";
import { ShareModal } from "@/components/docs/ShareModal";
import { ImportModal } from "@/components/docs/ImportModal";
import { Button } from "@/components/ui/button";
import { INITIAL_DOCUMENTS, USERS } from "@/lib/docs/mockData";
import type { DocumentItem, Permission } from "@/types/docs";
import { newDocId } from "@/lib/docs/utils";

const Index = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(
    USERS[0].email,
  );
  const [activeDocId, setActiveDocId] = useState<string | null>(
    INITIAL_DOCUMENTS[0]?.id ?? null,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [shareOpen, setShareOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const saveTimer = useRef<number | null>(null);

  // Derived: docs visible to current user
  const myDocs = useMemo(
    () =>
      documents
        .filter((d) => d.ownerEmail === currentUserEmail)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [documents, currentUserEmail],
  );

  const sharedDocs = useMemo(
    () =>
      documents
        .filter(
          (d) =>
            d.ownerEmail !== currentUserEmail &&
            d.access.some((a) => a.email === currentUserEmail),
        )
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [documents, currentUserEmail],
  );

  const visibleDocs = useMemo(
    () => [...myDocs, ...sharedDocs],
    [myDocs, sharedDocs],
  );

  // If active doc isn't visible to this user, pick the first visible one (or null)
  useEffect(() => {
    if (
      activeDocId &&
      !visibleDocs.some((d) => d.id === activeDocId)
    ) {
      setActiveDocId(visibleDocs[0]?.id ?? null);
    }
    if (!activeDocId && visibleDocs.length > 0) {
      setActiveDocId(visibleDocs[0].id);
    }
  }, [visibleDocs, activeDocId]);

  const activeDoc = useMemo(
    () => documents.find((d) => d.id === activeDocId) ?? null,
    [documents, activeDocId],
  );

  const isOwner = activeDoc?.ownerEmail === currentUserEmail;
  const myPermission: Permission | null = activeDoc
    ? isOwner
      ? "edit"
      : activeDoc.access.find((a) => a.email === currentUserEmail)?.permission ??
        null
    : null;
  const isReadOnly = myPermission === "view";

  // Mock save: trigger "saving" then "saved"
  const triggerSave = () => {
    setSaveStatus("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaveStatus("saved"), 600);
  };

  const updateDoc = (id: string, patch: Partial<DocumentItem>) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d,
      ),
    );
    triggerSave();
  };

  const handleNewDocument = () => {
    const id = newDocId();
    const doc: DocumentItem = {
      id,
      title: "Untitled document",
      content: "",
      ownerEmail: currentUserEmail,
      updatedAt: Date.now(),
      access: [],
    };
    setDocuments((prev) => [doc, ...prev]);
    setActiveDocId(id);
    setSaveStatus("saved");
    toast.success("New document created");
  };

  const handleTitleChange = (title: string) => {
    if (!activeDoc) return;
    updateDoc(activeDoc.id, { title });
  };

  const handleContentChange = (content: string) => {
    if (!activeDoc) return;
    updateDoc(activeDoc.id, { content });
  };

  const handleCommand = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    // execCommand is deprecated but still works in all browsers and is appropriate for a lightweight mock.
    document.execCommand(cmd, false, value);
    if (editorRef.current && activeDoc) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  const handleAddAccess = (email: string, permission: Permission) => {
    if (!activeDoc) return;
    updateDoc(activeDoc.id, {
      access: [...activeDoc.access, { email, permission }],
    });
    toast.success(`Shared with ${email}`);
  };

  const handleUpdateAccess = (email: string, permission: Permission) => {
    if (!activeDoc) return;
    updateDoc(activeDoc.id, {
      access: activeDoc.access.map((a) =>
        a.email === email ? { ...a, permission } : a,
      ),
    });
  };

  const handleRemoveAccess = (email: string) => {
    if (!activeDoc) return;
    updateDoc(activeDoc.id, {
      access: activeDoc.access.filter((a) => a.email !== email),
    });
    toast("Access removed");
  };

  const handleImport = ({
    title,
    html,
    mode,
  }: {
    title: string;
    html: string;
    mode: "new" | "insert";
  }) => {
    if (mode === "insert" && activeDoc && !isReadOnly) {
      const merged = `${activeDoc.content}\n${html}`;
      updateDoc(activeDoc.id, { content: merged });
      toast.success("Content imported into current document");
      return;
    }
    const id = newDocId();
    const doc: DocumentItem = {
      id,
      title,
      content: html,
      ownerEmail: currentUserEmail,
      updatedAt: Date.now(),
      access: [],
    };
    setDocuments((prev) => [doc, ...prev]);
    setActiveDocId(id);
    setSaveStatus("saved");
    toast.success(`Imported “${title}”`);
  };

  const ownerLabel = activeDoc
    ? isOwner
      ? "you"
      : activeDoc.ownerEmail.split("@")[0]
    : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-workspace text-foreground">
      <Sidebar
        myDocs={myDocs}
        sharedDocs={sharedDocs}
        activeDocId={activeDocId}
        onSelect={setActiveDocId}
        onNewDocument={handleNewDocument}
        currentUserEmail={currentUserEmail}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={activeDoc?.title ?? ""}
          onTitleChange={handleTitleChange}
          saveStatus={saveStatus}
          onShareClick={() => setShareOpen(true)}
          onImportClick={() => setImportOpen(true)}
          users={USERS}
          currentUserEmail={currentUserEmail}
          onUserChange={setCurrentUserEmail}
          isReadOnly={isReadOnly}
          ownerLabel={ownerLabel}
          disabled={!activeDoc}
        />

        {activeDoc ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <EditorToolbar onCommand={handleCommand} disabled={isReadOnly} />
            <EditorCanvas
              ref={editorRef}
              initialHtml={activeDoc.content}
              onChange={handleContentChange}
              resetKey={activeDoc.id}
              readOnly={isReadOnly}
            />
          </div>
        ) : (
          <EmptyState onNewDocument={handleNewDocument} />
        )}
      </main>

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        document={activeDoc}
        isOwner={isOwner}
        onAddAccess={handleAddAccess}
        onUpdateAccess={handleUpdateAccess}
        onRemoveAccess={handleRemoveAccess}
      />

      <ImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
        canInsertIntoCurrent={!!activeDoc && !isReadOnly}
      />
    </div>
  );
};

function EmptyState({ onNewDocument }: { onNewDocument: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-workspace p-8">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">No document selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a document from the sidebar, or create a new one to get started.
        </p>
        <Button onClick={onNewDocument} className="mt-4 gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New document
        </Button>
      </div>
    </div>
  );
}

export default Index;
