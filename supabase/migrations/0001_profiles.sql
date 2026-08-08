-- Identity data. The API may expose only the authenticated user's own row.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text not null unique,
  avatar_url text,
  batch text,
  is_admin boolean not null default false,
  is_banned boolean not null default false,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_post_date date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "authenticated users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Profiles are created only by the auth trigger; users cannot self-assign roles
-- or alter identity fields through the Data API.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
revoke all on public.profiles from public;
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
