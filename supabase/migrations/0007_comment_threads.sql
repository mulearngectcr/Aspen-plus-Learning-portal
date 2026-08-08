-- Recursion, authorization flags, and identity removal happen in the database
-- before Express receives comment rows.
create or replace function public.get_post_comment_thread(
  p_post_id uuid,
  p_viewer_id uuid,
  p_is_admin boolean default false
)
returns table (
  id uuid,
  post_id uuid,
  parent_comment_id uuid,
  content text,
  created_at timestamptz,
  is_deleted boolean,
  depth integer,
  is_mine boolean,
  can_delete boolean
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with recursive comment_tree as (
    select c.id, c.post_id, c.parent_comment_id, c.content, c.created_at, c.is_deleted, c.user_id,
      0 as depth, array[c.id] as ancestry
    from public.comments c
    where c.post_id = p_post_id and c.parent_comment_id is null

    union all

    select c.id, c.post_id, c.parent_comment_id, c.content, c.created_at, c.is_deleted, c.user_id,
      parent.depth + 1, parent.ancestry || c.id
    from public.comments c
    join comment_tree parent on parent.id = c.parent_comment_id
    where c.post_id = p_post_id and not c.id = any(parent.ancestry)
  )
  select
    c.id,
    c.post_id,
    c.parent_comment_id,
    case when c.is_deleted then null else c.content end,
    c.created_at,
    c.is_deleted,
    c.depth,
    c.user_id = p_viewer_id,
    not c.is_deleted and (c.user_id = p_viewer_id or p.user_id = p_viewer_id or p_is_admin)
  from comment_tree c
  join public.posts p on p.id = c.post_id
  where p.is_deleted = false
  order by c.ancestry, c.created_at;
$$;

revoke all on function public.get_post_comment_thread(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.get_post_comment_thread(uuid, uuid, boolean) to service_role;
