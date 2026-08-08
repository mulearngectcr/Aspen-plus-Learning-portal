-- Badges are deliberately private: the user_badges relation is never exposed
-- to the browser, because a distinctive badge combination can deanonymize a
-- participant across otherwise anonymous posts.
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index user_badges_user_id_idx on public.user_badges(user_id);

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
create policy "deny browser access" on public.badges for all to anon, authenticated using (false) with check (false);
create policy "deny browser access" on public.user_badges for all to anon, authenticated using (false) with check (false);
revoke all on public.badges, public.user_badges from anon, authenticated;
grant all on public.badges, public.user_badges to service_role;

insert into public.badges (slug, name, description) values
  ('first-post', 'First Post', 'You made your first anonymous study update.'),
  ('seven-day-streak', '7 Day Streak', 'You showed up for seven streak days.'),
  ('thirty-day-streak', '30 Day Streak', 'You built a month of steady momentum.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

-- Existing participants receive badges they have already earned; new awards
-- continue to be made synchronously by the post streak trigger below.
insert into public.user_badges (user_id, badge_id)
select p.id, b.id
from public.profiles p
join public.badges b on (
  (b.slug = 'first-post' and exists (select 1 from public.posts post where post.user_id = p.id))
  or (b.slug = 'seven-day-streak' and p.longest_streak >= 7)
  or (b.slug = 'thirty-day-streak' and p.longest_streak >= 30)
)
on conflict do nothing;

create or replace function public.handle_post_streak()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_streak integer;
  v_has_required_miss boolean;
begin
  select * into v_profile from public.profiles where id = new.user_id for update;

  insert into public.streak_calendar (user_id, date, status)
  values (new.user_id, new.post_date, 'posted')
  on conflict (user_id, date) do update set status = 'posted';

  insert into public.user_badges (user_id, badge_id)
  select new.user_id, b.id from public.badges b where b.slug = 'first-post'
  on conflict do nothing;

  -- More than one post on a day never changes the streak twice.
  if v_profile.last_post_date is not null and new.post_date <= v_profile.last_post_date then
    return new;
  end if;

  if v_profile.last_post_date is null then
    v_streak := 1;
  else
    select exists (
      select 1
      from generate_series(v_profile.last_post_date + 1, new.post_date - 1, interval '1 day') as dates(day)
      where extract(dow from dates.day) <> 0
        and not exists (
          select 1 from public.streak_calendar sc
          where sc.user_id = new.user_id
            and sc.date = dates.day::date
            and sc.status = 'posted'
        )
    ) into v_has_required_miss;
    v_streak := case when v_has_required_miss then 1 else v_profile.current_streak + 1 end;
  end if;

  update public.profiles
  set current_streak = v_streak,
      longest_streak = greatest(longest_streak, v_streak),
      last_post_date = new.post_date
  where id = new.user_id;

  insert into public.user_badges (user_id, badge_id)
  select new.user_id, b.id
  from public.badges b
  where (b.slug = 'seven-day-streak' and v_streak >= 7)
     or (b.slug = 'thirty-day-streak' and v_streak >= 30)
  on conflict do nothing;

  if v_streak in (7, 14, 30, 60, 90) then
    insert into public.notifications (recipient_id, type, streak_days)
    values (new.user_id, 'streak_milestone', v_streak);
  end if;
  return new;
end;
$$;

-- Weekly posted-day totals reset every Monday in Asia/Kolkata. The internal
-- user id is returned only to Express (service_role), never to the client.
create or replace function public.get_weekly_leaderboard(p_viewer_id uuid, p_limit integer default 10)
returns table (user_id uuid, leaderboard_rank bigint, streak integer)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with week_bounds as (
    select date_trunc('week', now() at time zone 'Asia/Kolkata')::date as week_start,
           (now() at time zone 'Asia/Kolkata')::date as today
  ), weekly as (
    select sc.user_id, count(*)::integer as streak
    from public.streak_calendar sc, week_bounds wb
    where sc.date between wb.week_start and wb.today
      and sc.status = 'posted'
    group by sc.user_id
  ), ranked as (
    select user_id, streak, rank() over (order by streak desc) as leaderboard_rank
    from weekly
  )
  select user_id, leaderboard_rank, streak
  from ranked
  where leaderboard_rank <= greatest(1, least(p_limit, 100))
     or user_id = p_viewer_id
  order by leaderboard_rank, user_id
$$;

revoke all on function public.get_weekly_leaderboard(uuid, integer) from public, anon, authenticated;
grant execute on function public.get_weekly_leaderboard(uuid, integer) to service_role;
revoke all on function public.handle_post_streak() from public, anon, authenticated;
