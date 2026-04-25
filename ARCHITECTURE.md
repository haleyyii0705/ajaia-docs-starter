# Architecture Note

## Overview

This project is a single-page React application for collaborative document editing with role-based sharing.
It uses Supabase as the backend data store and falls back to local in-memory demo data when Supabase environment variables are not configured.

## High-Level Flow

1. The UI is rendered by React pages/components under `src/pages` and `src/components/docs`.
2. Document state and save behavior are coordinated in `src/hooks/useDocuments.ts`.
3. Data access is centralized in `src/lib/docs/documentRepository.ts`.
4. Supabase connectivity is created in `src/lib/supabase/client.ts`.

## Main Modules

- `src/pages/Index.tsx`
  - Application shell and top-level orchestration of selected user and selected document.
- `src/components/docs/*`
  - Sidebar, editor, top bar, and sharing modal.
- `src/hooks/useDocuments.ts`
  - Loads documents, schedules debounced persistence, handles remote/local fallback.
- `src/lib/docs/documentRepository.ts`
  - Converts between UI `DocumentItem` and database rows, performs select/insert/update, includes backward-compatible schema handling.
- `src/lib/supabase/client.ts`
  - Validates Supabase env vars and creates a singleton Supabase client.

## Data Model

Primary table: `documents`

- `id` (uuid)
- `title` (text)
- `content` (text)
- `owner_id` (text)
- `shared_with` (text[])
- `shared_access` (jsonb, map of `{ [userId]: "edit" | "view" }`)
- `updated_at` (timestamptz)

## Permission Model

- Owner (`owner_id`) always has full edit access.
- Shared collaborators are listed in `shared_with`.
- Access level is stored in `shared_access`.
- Missing `shared_access[userId]` defaults to `edit` for backward compatibility.
- `view` users can read documents but cannot modify content.

## Deployment Notes

- Frontend is built with Vite and can be deployed to Vercel or any static host.
- Supabase connection in production requires:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- If these are missing, the app intentionally uses local demo documents.
