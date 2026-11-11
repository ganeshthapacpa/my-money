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
  ym         text not null,
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

-- 5. Limits that stop anyone from abusing storage (each row is capped in size, months must be real).
alter table public.user_data  drop constraint if exists user_data_size;
alter table public.user_data  add  constraint user_data_size  check (pg_column_size(settings) < 1000000 and jsonb_typeof(settings) = 'object');
alter table public.month_data drop constraint if exists month_data_size;
alter table public.month_data add  constraint month_data_size check (pg_column_size(txs) < 2000000 and jsonb_typeof(txs) = 'array');
alter table public.month_data drop constraint if exists month_data_ym;
alter table public.month_data add  constraint month_data_ym   check (ym ~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])$');

-- 6. Users can't change who owns a row.
create or replace function public.lock_user_id()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.user_id <> old.user_id then raise exception 'user_id cannot change'; end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists lock_user_id on public.user_data;
create trigger lock_user_id before update on public.user_data  for each row execute function public.lock_user_id();
drop trigger if exists lock_user_id on public.month_data;
create trigger lock_user_id before update on public.month_data for each row execute function public.lock_user_id();
