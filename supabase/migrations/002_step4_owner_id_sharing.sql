-- Step 4: documents use owner_id (text) + shared_with (text[] of user ids).
-- Run in Supabase SQL Editor if you already have an older `documents` table.
--
-- Your app uses ids: user_xinyi, user_reviewer (see src/lib/docs/mockData.ts).
--
-- If the table is empty or only used in dev, the simplest path is to drop and recreate
-- in Table Editor, or:
--
-- 1) Add columns
alter table if exists public.documents
  add column if not exists owner_id text,
  add column if not exists shared_with text[] not null default '{}';

-- 2) Optional: one-time backfill if you had owner_email (uncomment and adjust):
-- update public.documents set owner_id = 'user_xinyi' where owner_email = 'haley@ajaia.demo' and (owner_id is null or owner_id = '');
-- update public.documents set owner_id = 'user_reviewer' where owner_email = 'reviewer@ajaia.demo' and (owner_id is null or owner_id = '');
-- alter table public.documents alter column owner_id set not null;

-- 3) After backfill, you can drop legacy columns in dev:
-- alter table public.documents drop column if exists owner_email;
-- alter table public.documents drop column if exists access;

-- Fresh create (use only on empty projects / if you are OK dropping data):
-- create table public.documents (
--   id uuid primary key default gen_random_uuid(),
--   title text not null default 'Untitled',
--   content text not null default '',
--   owner_id text not null,
--   shared_with text[] not null default '{}',
--   created_at timestamptz not null default now(),
--   updated_at timestamptz not null default now()
-- );
