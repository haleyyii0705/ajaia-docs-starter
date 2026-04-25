export type Permission = "view" | "edit";

export interface User {
  email: string;
  name: string;
  initials: string;
  color: string; // tailwind bg color class for avatar
}

export interface AccessEntry {
  email: string;
  permission: Permission;
}

export interface DocumentItem {
  id: string;
  title: string;
  /** HTML content of the document */
  content: string;
  ownerEmail: string;
  updatedAt: number; // ms
  access: AccessEntry[];
}