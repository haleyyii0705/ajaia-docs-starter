import type { DocumentItem, User } from "@/types/docs";

export const USERS: User[] = [
  {
    email: "xinyi@ajaia.demo",
    name: "Xinyi Chen",
    initials: "XC",
    color: "bg-primary",
  },
  {
    email: "reviewer@ajaia.demo",
    name: "Reviewer",
    initials: "RV",
    color: "bg-emerald-500",
  },
];

const now = Date.now();
const minutes = (n: number) => now - n * 60_000;
const hours = (n: number) => now - n * 3_600_000;
const days = (n: number) => now - n * 86_400_000;

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-welcome",
    title: "Welcome to Ajaia Docs",
    ownerEmail: "xinyi@ajaia.demo",
    updatedAt: minutes(4),
    access: [{ email: "reviewer@ajaia.demo", permission: "edit" }],
    content: `<h1>Welcome to Ajaia Docs</h1>
<p>Ajaia Docs is a lightweight, collaborative document editor for internal teams. Use the toolbar above to format your text.</p>
<h2>What you can do</h2>
<ul>
  <li>Create and rename documents from the sidebar</li>
  <li>Format with <b>bold</b>, <i>italic</i>, and <u>underline</u></li>
  <li>Import <b>.txt</b> and <b>.md</b> files</li>
  <li>Share with teammates and set access</li>
</ul>
<p>Tip: switch between users in the top-right to see how sharing works.</p>`,
  },
  {
    id: "doc-roadmap",
    title: "Q2 Product Roadmap",
    ownerEmail: "xinyi@ajaia.demo",
    updatedAt: hours(3),
    access: [],
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
    ownerEmail: "reviewer@ajaia.demo",
    updatedAt: days(1),
    access: [{ email: "xinyi@ajaia.demo", permission: "edit" }],
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
    ownerEmail: "reviewer@ajaia.demo",
    updatedAt: days(3),
    access: [{ email: "xinyi@ajaia.demo", permission: "view" }],
    content: `<h1>Team Onboarding Checklist</h1>
<ol>
  <li>Set up workspace</li>
  <li>Read the team handbook</li>
  <li>Introduce yourself in #general</li>
</ol>`,
  },
];