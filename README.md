# Ajaia Docs Demo

A collaborative document editor demo built with React, Vite, TipTap, and Supabase.

## Submission Documents

- `ARCHITECTURE.md` - short architecture note
- `AI_WORKFLOW.md` - AI workflow note
- `SUBMISSION.md` - submission manifest of included artifacts

## What This Project Includes

- Rich text editing (bold, italic, underline, headings, lists)
- Document ownership (`owner_id`)
- Sharing by user id list (`shared_with`)
- Per-collaborator permissions:
  - `edit`
  - `view` (view only)
- User switcher for two demo identities (no auth flow in the app)
- Supabase-backed persistence with local demo fallback

## Demo Users

- User A (Haley)
  - id: `user_haley`
  - email: `haley@ajaia.demo`
- User B (Reviewer)
  - id: `user_reviewer`
  - email: `reviewer@ajaia.demo`

## Tech Stack

- React + TypeScript
- Vite
- Tailwind + shadcn/ui
- TipTap editor
- Supabase (`@supabase/supabase-js`)
- Vitest

## Project Structure

- `src/pages/Index.tsx` - main app shell and state flow
- `src/components/docs/` - docs UI (sidebar, top bar, editor, sharing modal)
- `src/hooks/useDocuments.ts` - document loading and save orchestration
- `src/lib/docs/documentRepository.ts` - Supabase read/write adapter
- `src/lib/docs/mockData.ts` - demo users + local fallback docs
- `supabase/migrations/` - SQL migrations for the `documents` table

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If these are missing, the app falls back to local in-memory demo documents.

### 3) Run dev server

```bash
npm run dev
```

### 4) Build for production

```bash
npm run build
```

### 5) Preview production build

```bash
npm run preview
```

### 6) Run tests

```bash
npm test
```

## Supabase Setup

Run SQL migrations in this order:

1. `supabase/migrations/001_documents.sql`
2. `supabase/migrations/002_step4_owner_id_sharing.sql` (for upgrading older schemas)
3. `supabase/migrations/003_step5_shared_access.sql`

### Current Data Model

Main table columns used by app:

- `id` (uuid)
- `title` (text)
- `content` (text)
- `owner_id` (text)
- `shared_with` (text[])
- `shared_access` (jsonb, map of `{ [userId]: "edit" | "view" }`)
- `updated_at` (timestamptz)

## Sharing + Permission Behavior

- `owner_id` user is always full editor/owner.
- Shared collaborators are listed in `shared_with`.
- Collaborator permissions are stored in `shared_access`.
- Missing `shared_access[userId]` is treated as `edit` for backward compatibility.
- `view` users can open and read documents, but editor and formatting actions are disabled.

## Backward Compatibility Notes

The repository layer includes compatibility paths for older Supabase schemas:

- If `owner_id` is missing, it can still read legacy `owner_email` rows.
- If `shared_access` is missing, it falls back to empty permissions.
- Writes include `owner_email` when needed for legacy `NOT NULL owner_email` schemas and retry without it on newer schemas.

## Troubleshooting

### `null value in column "owner_email" violates not-null constraint`

Your Supabase table is still enforcing legacy `owner_email NOT NULL`.
The app now handles this automatically, but long-term you should migrate to `owner_id` and make `owner_email` nullable or remove it in dev.

### I do not see remote documents

- Check `.env` values
- Confirm migrations were applied
- Check Supabase table/policies for `documents`

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run build:dev` - dev-mode build
- `npm run preview` - preview built app
- `npm run lint` - eslint
- `npm test` - run tests once
- `npm run test:watch` - watch mode tests
