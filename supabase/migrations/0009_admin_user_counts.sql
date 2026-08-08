-- This function is callable only by service_role through Express; it exposes
-- real identities solely to the server-side admin workflow.
create or replace function public.get_admin_users()
returns table (
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  batch text,
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
  select p.id, p.full_name, p.username, p.avatar_url, p.batch, p.is_admin, p.is_banned, p.created_at,
    (select count(*) from public.posts post where post.user_id = p.id),
    (select count(*) from public.comments comment where comment.user_id = p.id)
  from public.profiles p
  order by p.created_at desc;
$$;

revoke all on function public.get_admin_users() from public, anon, authenticated;
grant execute on function public.get_admin_users() to service_role;
