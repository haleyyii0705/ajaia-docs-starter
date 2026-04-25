import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { INITIAL_DOCUMENTS } from "@/lib/docs/mockData";
import {
  fetchAllDocuments,
  insertDocumentRow,
  updateDocumentRow,
} from "@/lib/docs/documentRepository";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { DocumentItem } from "@/types/docs";
import { newDocId } from "@/lib/docs/utils";

const PERSIST_DEBOUNCE_MS = 750;

function formatSaveError(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const m = String((e as { message: string }).message);
    if (m) return m;
  }
  return "Request failed";
}

function createUuid(): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto && typeof webCrypto.randomUUID === "function") {
    return webCrypto.randomUUID();
  }
  // RFC4122-ish fallback for older/incomplete runtimes.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type UseDocumentsOptions = {
  /** Called right after a new doc is added locally (before remote insert finishes). */
  onInserted?: (id: string) => void;
};

export function useDocuments(options: UseDocumentsOptions = {}) {
  const { onInserted } = options;
  const remote = isSupabaseConfigured();
  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    remote ? [] : INITIAL_DOCUMENTS,
  );
  const [loading, setLoading] = useState(() => remote);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const documentsRef = useRef<DocumentItem[]>([]);
  documentsRef.current = documents;

  const persistTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!remote) {
      setLoadError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await fetchAllDocuments();
        if (!cancelled) {
          setDocuments(rows);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load documents";
          // Keep app usable even when Supabase is temporarily unavailable.
          setDocuments(INITIAL_DOCUMENTS);
          setLoadError(null);
          toast.error(`${msg}. Falling back to local demo documents.`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [remote, refreshKey]);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(persistTimers.current).forEach((id) =>
        window.clearTimeout(id),
      );
      persistTimers.current = {};
    };
  }, []);

  const schedulePersist = useCallback(
    (id: string) => {
      if (!remote) return;
      window.clearTimeout(persistTimers.current[id]);
      persistTimers.current[id] = window.setTimeout(async () => {
        const doc = documentsRef.current.find((d) => d.id === id);
        if (!doc) return;
        try {
          await updateDocumentRow(doc);
        } catch (e) {
          toast.error(formatSaveError(e));
        }
      }, PERSIST_DEBOUNCE_MS);
    },
    [remote],
  );

  const updateDoc = useCallback(
    (id: string, patch: Partial<DocumentItem>) => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d,
        ),
      );
      schedulePersist(id);
    },
    [schedulePersist],
  );

  const insertDocument = useCallback(
    async (doc: DocumentItem): Promise<boolean> => {
      if (!remote) {
        flushSync(() => {
          setDocuments((prev) => [doc, ...prev]);
        });
        onInserted?.(doc.id);
        return true;
      }
      try {
        flushSync(() => {
          setDocuments((prev) => [doc, ...prev]);
        });
        onInserted?.(doc.id);
        await insertDocumentRow(doc);
        return true;
      } catch (e) {
        flushSync(() => {
          setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
        });
        const msg = formatSaveError(e);
        toast.error(`Could not create document: ${msg}`);
        console.error("[documents] insert failed", e);
        return false;
      }
    },
    [remote, onInserted],
  );

  const newDocumentId = useCallback(() => {
    return remote ? createUuid() : newDocId();
  }, [remote]);

  return {
    documents,
    loading,
    loadError,
    isRemote: remote,
    updateDoc,
    insertDocument,
    newDocumentId,
    refetch,
  };
}
