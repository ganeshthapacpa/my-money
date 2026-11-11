-- My Money: database setup for Supabase
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run.
-- Safe to run more than once.

-- 1. One row per person: their settings, accounts, categories, budgets and goals.
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  settings   jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. One row per person per month: that month's transactions.
create table if not exists public.month_data (
  user_id    uuid not null references auth.users (id) on delete cascade,
  ym         text not null check (ym ~ '^\d{4}-\d{2}$'),
  txs        jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, ym)
);

-- 3. Row Level Security: each signed-in person can only see and change their own rows.
alter table public.user_data  enable row level security;
alter table public.month_data enable row level security;

drop policy if exists "own settings" on public.user_data;
create policy "own settings" on public.user_data
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own months" on public.month_data;
create policy "own months" on public.month_data
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Nobody who is signed out can read anything.
revoke all on public.user_data, public.month_data from anon;
grant select, insert, update, delete on public.user_data, public.month_data to authenticated;

-- 4. Lets a person delete their own account (and, through the cascade above, all their data).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
