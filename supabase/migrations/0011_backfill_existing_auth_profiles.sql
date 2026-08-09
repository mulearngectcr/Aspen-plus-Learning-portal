-- The profile trigger only runs for signups that occur after it is installed.
-- Backfill eligible accounts created before the schema was first deployed.
with candidates as (
  select
    u.id,
    coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)) as full_name,
    coalesce(nullif(trim(u.raw_user_meta_data ->> 'username'), ''), split_part(u.email, '@', 1)) as desired_username,
    nullif(trim(u.raw_user_meta_data ->> 'avatar_url'), '') as avatar_url,
    nullif(trim(u.raw_user_meta_data ->> 'batch'), '') as batch,
    u.created_at,
    count(*) over (
      partition by coalesce(nullif(trim(u.raw_user_meta_data ->> 'username'), ''), split_part(u.email, '@', 1))
    ) as same_username_count
  from auth.users u
  left join public.profiles p on p.id = u.id
  where p.id is null
    and u.email is not null
    and right(lower(u.email), length('@gectcr.ac.in')) = '@gectcr.ac.in'
)
insert into public.profiles (id, full_name, username, avatar_url, batch, created_at)
select
  c.id,
  c.full_name,
  case
    when c.same_username_count > 1
      or exists (select 1 from public.profiles p where p.username = c.desired_username)
      then c.desired_username || '-' || left(c.id::text, 8)
    else c.desired_username
  end,
  c.avatar_url,
  c.batch,
  c.created_at
from candidates c;
