import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/docs/Sidebar";
import { TopBar, type SaveStatus } from "@/components/docs/TopBar";
import { EditorCanvas } from "@/components/docs/EditorCanvas";
import { ShareModal } from "@/components/docs/ShareModal";
import { ImportModal } from "@/components/docs/ImportModal";
import { Button } from "@/components/ui/button";
import {
  USERS,
  getInitialUserId,
  getUserById,
  writeStoredUserId,
} from "@/lib/docs/mockData";
import type { DocumentItem } from "@/types/docs";
import { useDocuments } from "@/hooks/useDocuments";

const Index = () => {
  const [currentUserId, setCurrentUserIdState] = useState(getInitialUserId);
  const setCurrentUserId = useCallback((id: string) => {
    setCurrentUserIdState(id);
    writeStoredUserId(id);
  }, []);

  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const handleInserted = useCallback((id: string) => {
    setActiveDocId(id);
  }, []);

  const {
    documents,
    loading,
    loadError,
    isRemote,
    updateDoc,
    insertDocument,
    newDocumentId,
    refetch,
  } = useDocuments({ onInserted: handleInserted });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [shareOpen, setShareOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const saveTimer = useRef<number | null>(null);

  const myDocs = useMemo(
    () =>
      documents
        .filter((d) => d.ownerId === currentUserId)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [documents, currentUserId],
  );

  const sharedDocs = useMemo(
    () =>
      documents
        .filter(
          (d) =>
            d.ownerId !== currentUserId &&
            d.sharedWith.includes(currentUserId),
        )
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [documents, currentUserId],
  );

  const visibleDocs = useMemo(
    () => [...myDocs, ...sharedDocs],
    [myDocs, sharedDocs],
  );

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

  const isOwner = activeDoc?.ownerId === currentUserId;
  const isReadOnly = useMemo(() => {
    if (!activeDoc) return false;
    if (activeDoc.ownerId === currentUserId) return false;
    const perm = activeDoc.sharedAccess?.[currentUserId] ?? "edit";
    return perm === "view";
  }, [activeDoc, currentUserId]);

  const triggerSave = () => {
    setSaveStatus("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaveStatus("saved"), 600);
  };

  const updateDocWithSave = (id: string, patch: Partial<DocumentItem>) => {
    updateDoc(id, patch);
    triggerSave();
  };

  const handleNewDocument = async () => {
    const id = newDocumentId();
    const doc: DocumentItem = {
      id,
      title: "Untitled document",
      content: "",
      ownerId: currentUserId,
      sharedWith: [],
      sharedAccess: {},
      updatedAt: Date.now(),
    };
    const ok = await insertDocument(doc);
    if (!ok) return;
    setSaveStatus("saved");
    toast.success("New document created");
  };

  const handleTitleChange = (title: string) => {
    if (!activeDoc) return;
    updateDocWithSave(activeDoc.id, { title });
  };

  const handleContentChange = (content: string) => {
    if (!activeDoc) return;
    updateDocWithSave(activeDoc.id, { content });
  };

  const handleAddCollaborator = (userId: string, perm: "edit" | "view" = "edit") => {
    if (!activeDoc) return;
    if (activeDoc.sharedWith.includes(userId)) return;
    updateDocWithSave(activeDoc.id, {
      sharedWith: [...activeDoc.sharedWith, userId],
      sharedAccess: { ...(activeDoc.sharedAccess ?? {}), [userId]: perm },
    });
    const u = getUserById(userId);
    toast.success(`Shared with ${u?.name ?? userId}`);
  };

  const handleChangeCollaboratorPermission = (userId: string, perm: "edit" | "view") => {
    if (!activeDoc) return;
    if (!activeDoc.sharedWith.includes(userId)) return;
    updateDocWithSave(activeDoc.id, {
      sharedAccess: { ...(activeDoc.sharedAccess ?? {}), [userId]: perm },
    });
  };

  const handleRemoveCollaborator = (userId: string) => {
    if (!activeDoc) return;
    const nextAccess = { ...(activeDoc.sharedAccess ?? {}) };
    delete nextAccess[userId];
    updateDocWithSave(activeDoc.id, {
      sharedWith: activeDoc.sharedWith.filter((x) => x !== userId),
      sharedAccess: nextAccess,
    });
    toast("Removed from shared list");
  };

  const handleImport = async ({
    title,
    html,
    mode,
  }: {
    title: string;
    html: string;
    mode: "new" | "insert";
  }) => {
    if (mode === "insert" && activeDoc) {
      const merged = `${activeDoc.content}\n${html}`;
      updateDocWithSave(activeDoc.id, { content: merged });
      toast.success("Content imported into current document");
      return;
    }
    const id = newDocumentId();
    const doc: DocumentItem = {
      id,
      title,
      content: html,
      ownerId: currentUserId,
      sharedWith: [],
      sharedAccess: {},
      updatedAt: Date.now(),
    };
    const ok = await insertDocument(doc);
    if (!ok) return;
    setSaveStatus("saved");
    toast.success(`Imported “${title}”`);
  };

  const ownerLabel = activeDoc
    ? (getUserById(activeDoc.ownerId)?.name ?? activeDoc.ownerId)
    : null;

  const showRemoteLoading =
    isRemote && loading && documents.length === 0 && !loadError;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-workspace text-foreground">
      {showRemoteLoading && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading documents…
          </div>
        </div>
      )}

      {isRemote && loadError && documents.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-workspace p-6">
          <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-soft">
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <Button className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      )}

      <Sidebar
        myDocs={myDocs}
        sharedDocs={sharedDocs}
        activeDocId={activeDocId}
        onSelect={setActiveDocId}
        onNewDocument={() => void handleNewDocument()}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={activeDoc?.title ?? ""}
          onTitleChange={handleTitleChange}
          saveStatus={saveStatus}
          onShareClick={() => setShareOpen(true)}
          onImportClick={() => setImportOpen(true)}
          users={USERS}
          currentUserId={currentUserId}
          onUserChange={setCurrentUserId}
          isReadOnly={isReadOnly}
          ownerLabel={ownerLabel}
          disabled={!activeDoc}
        />

        {activeDoc ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <EditorCanvas
              initialHtml={activeDoc.content}
              onChange={handleContentChange}
              resetKey={activeDoc.id}
              readOnly={isReadOnly}
            />
          </div>
        ) : (
          <EmptyState onNewDocument={() => void handleNewDocument()} />
        )}
      </main>

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        document={activeDoc}
        isOwner={isOwner}
        users={USERS}
        currentUserId={currentUserId}
        onAddUser={handleAddCollaborator}
        onChangeUserPermission={handleChangeCollaboratorPermission}
        onRemoveUser={handleRemoveCollaborator}
      />

      <ImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={(payload) => void handleImport(payload)}
        canInsertIntoCurrent={!!activeDoc}
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
