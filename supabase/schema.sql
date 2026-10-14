-- Life App — cloud sync schema
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Design: each signed-in GitHub user gets one JSONB snapshot document.
-- The app is local-first; the cloud copy mirrors the whole reducer state so
-- offline edits are merged by last-writer-wins at the snapshot level. This is
-- deliberately simple — the app's data model is a single coherent state tree,
-- not a multi-writer relational graph.
--
-- Auth: GitHub is the ONLY enabled provider. Anonymous and email stay off, so
-- every auth.uid() below is a GitHub identity.

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

comment on table public.user_state is
  'One JSONB snapshot of a user''s Life App state, mirrored from localStorage.';

alter table public.user_state enable row level security;

-- Owners: a signed-in user can only ever see or change their own row.
drop policy if exists "Users read own state" on public.user_state;
drop policy if exists "Users write own state" on public.user_state;
create policy "Users read own state" on public.user_state
  for select to authenticated
  using (auth.uid() = user_id);
create policy "Users write own state" on public.user_state
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users update own state" on public.user_state
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No delete policy on purpose: row deletion goes through the dashboard, not
-- the client, so "sign out" can never silently erase cloud data.
