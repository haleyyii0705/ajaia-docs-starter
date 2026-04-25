export interface User {
  /** Stable id (stored in Supabase as owner_id / in shared_with[]) */
  id: string;
  email: string;
  name: string;
  initials: string;
  color: string; // tailwind bg color class for avatar
}

export type SharePermission = "edit" | "view";

/**
 * Simplified model for Step 4: owner + `sharedWith` user ids.
 */
export interface DocumentItem {
  id: string;
  title: string;
  /** HTML content of the document */
  content: string;
  ownerId: string;
  /** User ids of collaborators (excludes owner) */
  sharedWith: string[];
  /**
   * Per-user permission for collaborators.
   * Owner is always edit; collaborators default to "edit" if missing.
   */
  sharedAccess: Record<string, SharePermission>;
  updatedAt: number; // ms
}
