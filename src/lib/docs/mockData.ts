import type { DocumentItem, SharePermission, User } from "@/types/docs";

/** User A / User B (demo, no real auth) — ids must match Supabase `owner_id` & `shared_with` values. */
export const USERS: User[] = [
  {
    id: "user_xinyi",
    email: "haley@ajaia.demo",
    name: "User A (Haley)",
    initials: "A",
    color: "bg-primary",
  },
  {
    id: "user_reviewer",
    email: "reviewer@ajaia.demo",
    name: "User B (Reviewer)",
    initials: "B",
    color: "bg-emerald-500",
  },
];

export function getUserById(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

const now = Date.now();
const minutes = (n: number) => now - n * 60_000;
const hours = (n: number) => now - n * 3_600_000;
const days = (n: number) => now - n * 86_400_000;

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-welcome",
    title: "Welcome to Ajaia Docs",
    ownerId: "user_xinyi",
    sharedWith: ["user_reviewer"],
    sharedAccess: { user_reviewer: "edit" satisfies SharePermission },
    updatedAt: minutes(4),
    content: `<h1>Welcome to Ajaia Docs</h1>
<p>Switch <b>User A / User B</b> in the top-right, then look at <b>My documents</b> vs <b>Shared with me</b>.</p>
<h2>What you can do</h2>
<ul>
  <li>Create and rename documents from the sidebar</li>
  <li>Format with <b>bold</b>, <i>italic</i>, and <u>underline</u></li>
  <li>Use <b>Share</b> to add the other demo user (simplified, no real login)</li>
</ul>
<p>Tip: “Shared with me” lists documents where your user id is in <code>shared_with</code>.</p>`,
  },
  {
    id: "doc-roadmap",
    title: "Q2 Product Roadmap",
    ownerId: "user_xinyi",
    sharedWith: [],
    sharedAccess: {},
    updatedAt: hours(3),
    content: `<h1>Q2 Product Roadmap</h1>
<p>Goals for the quarter, prioritized by impact.</p>
<ol>
  <li>Ship the new editor experience</li>
  <li>Improve sharing flows</li>
  <li>Reduce time-to-first-doc</li>
</ol>`,
  },
  {
    id: "doc-design-review",
    title: "Design Review Notes",
    ownerId: "user_reviewer",
    sharedWith: ["user_xinyi"],
    sharedAccess: { user_xinyi: "view" satisfies SharePermission },
    updatedAt: days(1),
    content: `<h1>Design Review Notes</h1>
<p>Feedback from the weekly design review session.</p>
<ul>
  <li>Refine empty states</li>
  <li>Clarify shared vs owned indicators</li>
  <li>Tighten toolbar spacing</li>
</ul>`,
  },
  {
    id: "doc-onboarding",
    title: "Team Onboarding Checklist",
    ownerId: "user_reviewer",
    sharedWith: ["user_xinyi"],
    sharedAccess: { user_xinyi: "edit" satisfies SharePermission },
    updatedAt: days(3),
    content: `<h1>Team Onboarding Checklist</h1>
<ol>
  <li>Set up workspace</li>
  <li>Read the team handbook</li>
  <li>Introduce yourself in #general</li>
</ol>`,
  },
];

const USER_STORAGE_KEY = "ajaia_current_user_id";

export function readStoredUserId(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(USER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredUserId(id: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function getInitialUserId(): string {
  const stored = readStoredUserId();
  if (stored && USERS.some((u) => u.id === stored)) {
    return stored;
  }
  return USERS[0].id;
}
