-- This RPC performs feed aggregation in one cursor-indexed query. It never
-- returns a post's author ID, so Express cannot accidentally serialize it.
create or replace function public.get_feed_page(
  p_viewer_id uuid,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null,
  p_limit integer default 20
)
returns table (
  id uuid,
  content text,
  image_url_1 text,
  image_url_2 text,
  created_at timestamptz,
  post_date date,
  like_count bigint,
  comment_count bigint,
  liked_by_me boolean,
  is_mine boolean
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with page as (
    select p.id, p.user_id, p.content, p.image_url_1, p.image_url_2, p.created_at, p.post_date
    from public.posts p
    where p.is_deleted = false
      and (
        p_cursor_created_at is null
        or p.created_at < p_cursor_created_at
        or (p.created_at = p_cursor_created_at and p.id < p_cursor_id)
      )
    order by p.created_at desc, p.id desc
    limit greatest(1, least(p_limit, 50)) + 1
  )
  select
    p.id,
    p.content,
    p.image_url_1,
    p.image_url_2,
    p.created_at,
    p.post_date,
    (select count(*) from public.likes l where l.target_type = 'post' and l.target_id = p.id),
    (select count(*) from public.comments c where c.post_id = p.id and c.is_deleted = false),
    exists (select 1 from public.likes l where l.target_type = 'post' and l.target_id = p.id and l.user_id = p_viewer_id),
    p.user_id = p_viewer_id
  from page p
  order by p.created_at desc, p.id desc;
$$;

revoke all on function public.get_feed_page(uuid, timestamptz, uuid, integer) from public, anon, authenticated;
grant execute on function public.get_feed_page(uuid, timestamptz, uuid, integer) to service_role;

-- Public read is required for the anonymous feed. Object names are generated
-- by the browser with a random UUID directory, never a user ID.
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

create policy "authenticated users can upload post images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'post-images');
