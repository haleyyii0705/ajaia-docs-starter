-- New installs: run in Supabase SQL Editor.
-- For existing tables (owner_email, etc.) see 002_step4_owner_id_sharing.sql

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  content text not null default '',
  owner_id text not null,
  shared_with text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_owner_id_idx on public.documents (owner_id);
create index if not exists documents_updated_at_idx on public.documents (updated_at desc);

alter table public.documents enable row level security;

create policy "documents_select_dev"
  on public.documents for select
  to anon, authenticated
  using (true);

create policy "documents_insert_dev"
  on public.documents for insert
  to anon, authenticated
  with check (true);

create policy "documents_update_dev"
  on public.documents for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "documents_delete_dev"
  on public.documents for delete
  to anon, authenticated
  using (true);
