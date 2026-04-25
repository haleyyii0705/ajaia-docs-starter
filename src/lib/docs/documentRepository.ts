import { getSupabase } from "@/lib/supabase/client";
import type { DocumentItem, SharePermission } from "@/types/docs";
import { getUserById } from "@/lib/docs/mockData";

function supabaseErrorMessage(err: { message: string; details?: string; hint?: string; code?: string }): string {
  const parts = [err.message, err.details, err.hint].filter(Boolean);
  if (err.code) parts.push(`(code ${err.code})`);
  return parts.join(" — ");
}

type DocumentRow = {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  owner_email?: string;
  shared_with: string[] | null;
  shared_access?: Record<string, SharePermission> | null;
  updated_at: string;
};

async function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs = 12000,
): Promise<T> {
  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error("Load timed out")), timeoutMs);
  });
  try {
    return await Promise.race([Promise.resolve(promise), timeout]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

function ownerEmailForId(ownerId: string): string {
  return getUserById(ownerId)?.email ?? ownerId;
}

export function rowToDocumentItem(row: DocumentRow): DocumentItem {
  const shared = Array.isArray(row.shared_with) ? row.shared_with : [];
  const sharedAccess =
    row.shared_access && typeof row.shared_access === "object"
      ? row.shared_access
      : {};
  return {
    id: row.id,
    title: row.title,
    content: row.content ?? "",
    ownerId: row.owner_id,
    sharedWith: shared,
    sharedAccess,
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export async function fetchAllDocuments(): Promise<DocumentItem[]> {
  const supabase = getSupabase();
  const primary = withTimeout(
    supabase
      .from("documents")
      .select("id,title,content,owner_id,shared_with,shared_access,updated_at")
      .order("updated_at", { ascending: false }),
  );
  const { data, error } = await primary;

  // Backward compatibility: older schema may still use owner_email.
  if (error?.code === "42703" && error.message.includes("owner_id")) {
    const legacy = await withTimeout(
      supabase
        .from("documents")
        .select("id,title,content,owner_email,shared_with,updated_at")
        .order("updated_at", { ascending: false }),
    );
    if (legacy.error) throw new Error(supabaseErrorMessage(legacy.error));
    return (legacy.data as DocumentRow[]).map((row) =>
      rowToDocumentItem({
        ...row,
        owner_id:
          row.owner_email === "reviewer@ajaia.demo" ? "user_reviewer" : "user_xinyi",
        shared_access: {},
      }),
    );
  }

  // Backward compatibility: older schema may not have shared_access yet.
  if (error?.code === "42703" && error.message.includes("shared_access")) {
    const legacy = await withTimeout(
      supabase
        .from("documents")
        .select("id,title,content,owner_id,shared_with,updated_at")
        .order("updated_at", { ascending: false }),
    );
    if (legacy.error) throw new Error(supabaseErrorMessage(legacy.error));
    return (legacy.data as DocumentRow[]).map((row) =>
      rowToDocumentItem({ ...row, shared_access: {} }),
    );
  }

  if (error) throw new Error(supabaseErrorMessage(error));
  return (data as DocumentRow[]).map(rowToDocumentItem);
}

export async function insertDocumentRow(doc: DocumentItem): Promise<void> {
  const supabase = getSupabase();
  const payloadWithEmail = {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    owner_id: doc.ownerId,
    owner_email: ownerEmailForId(doc.ownerId),
    shared_with: doc.sharedWith,
    shared_access: doc.sharedAccess,
    updated_at: new Date(doc.updatedAt).toISOString(),
  };

  const first = await supabase.from("documents").insert(payloadWithEmail);
  if (!first.error) return;

  // Backward/forward compatibility:
  // - Some schemas still have owner_email NOT NULL (we satisfy it above).
  // - Newer schemas may not have owner_email column (retry without it).
  if (first.error.code === "42703" && first.error.message.includes("owner_email")) {
    const { owner_email: _ownerEmail, ...payload } = payloadWithEmail;
    const retry = await supabase.from("documents").insert(payload);
    if (retry.error) throw new Error(supabaseErrorMessage(retry.error));
    return;
  }

  throw new Error(supabaseErrorMessage(first.error));
}

export async function updateDocumentRow(doc: DocumentItem): Promise<void> {
  const supabase = getSupabase();
  const patchWithEmail = {
    title: doc.title,
    content: doc.content,
    owner_id: doc.ownerId,
    owner_email: ownerEmailForId(doc.ownerId),
    shared_with: doc.sharedWith,
    shared_access: doc.sharedAccess,
    updated_at: new Date(doc.updatedAt).toISOString(),
  };

  const first = await supabase
    .from("documents")
    .update(patchWithEmail)
    .eq("id", doc.id);
  if (!first.error) return;

  if (first.error.code === "42703" && first.error.message.includes("owner_email")) {
    const { owner_email: _ownerEmail, ...patch } = patchWithEmail;
    const retry = await supabase
      .from("documents")
      .update(patch)
      .eq("id", doc.id);
    if (retry.error) throw new Error(supabaseErrorMessage(retry.error));
    return;
  }

  throw new Error(supabaseErrorMessage(first.error));
}
