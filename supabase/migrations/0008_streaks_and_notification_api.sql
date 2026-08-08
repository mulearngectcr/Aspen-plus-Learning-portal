create extension if not exists pg_cron;

-- Milestone notifications need a non-identifying snapshot of the milestone;
-- deriving it from the user's current streak later would be historically wrong.
alter table public.notifications
  add column if not exists streak_days integer check (streak_days is null or streak_days > 0);

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

  if v_streak in (7, 14, 30, 60, 90) then
    insert into public.notifications (recipient_id, type, streak_days)
    values (new.user_id, 'streak_milestone', v_streak);
  end if;
  return new;
end;
$$;

create trigger update_streak_after_post
  after insert on public.posts
  for each row execute procedure public.handle_post_streak();

-- Runs at 00:05 Asia/Kolkata (18:35 UTC). Sunday is a free pass; other days
-- without a post break the active streak and receive a durable calendar mark.
create or replace function public.mark_missed_streak_days()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_date date := (now() at time zone 'Asia/Kolkata')::date - 1;
  v_status text := case when extract(dow from v_date) = 0 then 'sunday_free_pass' else 'missed' end;
begin
  insert into public.streak_calendar (user_id, date, status)
  select p.id, v_date, v_status from public.profiles p
  on conflict (user_id, date) do nothing;

  if v_status = 'missed' then
    update public.profiles p
    set current_streak = 0
    where p.current_streak > 0
      and exists (
        select 1 from public.streak_calendar sc
        where sc.user_id = p.id and sc.date = v_date and sc.status = 'missed'
      );
  end if;
end;
$$;

select cron.schedule('mark-missed-streak-days', '35 18 * * *', $$select public.mark_missed_streak_days()$$);

-- Store a navigable post target for future comment/reply and comment-like
-- notifications while retaining the generic notification type.
create or replace function public.notify_on_new_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient_id uuid;
  v_type text;
begin
  if new.parent_comment_id is null then
    select p.user_id into v_recipient_id from public.posts p where p.id = new.post_id;
    v_type := 'comment_on_post';
  else
    select c.user_id into v_recipient_id from public.comments c where c.id = new.parent_comment_id;
    v_type := 'reply_to_comment';
  end if;
  if v_recipient_id is not null and v_recipient_id <> new.user_id then
    insert into public.notifications (recipient_id, type, target_type, target_id)
    values (v_recipient_id, v_type, 'post', new.post_id);
  end if;
  return new;
end;
$$;

create or replace function public.notify_on_new_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient_id uuid;
  v_type text;
  v_post_id uuid;
begin
  if new.target_type = 'post' then
    select p.user_id, p.id into v_recipient_id, v_post_id from public.posts p where p.id = new.target_id;
    v_type := 'like_post';
  else
    select c.user_id, c.post_id into v_recipient_id, v_post_id from public.comments c where c.id = new.target_id;
    v_type := 'like_comment';
  end if;
  if v_recipient_id is not null and v_recipient_id <> new.user_id then
    insert into public.notifications (recipient_id, type, target_type, target_id)
    values (v_recipient_id, v_type, 'post', v_post_id);
  end if;
  return new;
end;
$$;

revoke all on function public.handle_post_streak() from public, anon, authenticated;
revoke all on function public.mark_missed_streak_days() from public, anon, authenticated;
revoke all on function public.notify_on_new_comment() from public, anon, authenticated;
revoke all on function public.notify_on_new_like() from public, anon, authenticated;
