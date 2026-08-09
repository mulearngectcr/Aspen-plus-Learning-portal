alter table public.profiles
  add column group_number integer not null default 0 check (group_number between 0 and 100),
  add column semester integer check (semester between 1 and 8);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url, batch, group_number, semester)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, new.id::text), '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(coalesce(new.email, new.id::text), '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'batch'), ''),
    case
      when coalesce(new.raw_user_meta_data ->> 'group', '') ~ '^[0-9]+$'
        then least((new.raw_user_meta_data ->> 'group')::integer, 100)
      else 0
    end,
    case
      when coalesce(new.raw_user_meta_data ->> 'semester', '') ~ '^[1-8]$'
        then (new.raw_user_meta_data ->> 'semester')::integer
      else null
    end
  );
  return new;
end;
$$;

drop function if exists public.get_admin_users();

create function public.get_admin_users()
returns table (
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  batch text,
  group_number integer,
  semester integer,
  is_admin boolean,
  is_banned boolean,
  created_at timestamptz,
  post_count bigint,
  comment_count bigint
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select p.id, p.full_name, p.username, p.avatar_url, p.batch, p.group_number, p.semester, p.is_admin, p.is_banned, p.created_at,
    (select count(*) from public.posts post where post.user_id = p.id),
    (select count(*) from public.comments comment where comment.user_id = p.id)
  from public.profiles p
  order by p.created_at desc;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.get_admin_users() from public, anon, authenticated;
grant execute on function public.get_admin_users() to service_role;
