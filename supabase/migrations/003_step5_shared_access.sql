-- Step 5: add per-user permission for `shared_with` collaborators.
-- Keeps `shared_with` as text[] of user ids; permissions live in `shared_access`.

alter table if exists public.documents
  add column if not exists shared_access jsonb not null default '{}'::jsonb;

