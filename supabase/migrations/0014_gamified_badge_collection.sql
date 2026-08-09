-- Private badge collection. Definitions are served only through Express /api/me.
insert into public.badges (slug, name, description) values
  ('first-post', 'First Signal', 'Published your first study check-in.'),
  ('first-comment', 'Conversation Starter', 'Joined the community with your first comment.'),
  ('ten-post-likes', 'High Five', 'Your posts received 10 likes in total.'),
  ('five-day-streak', 'Warm Up', 'Kept a five-day streak alive.'),
  ('ten-day-streak', 'On a Roll', 'Built ten days of steady momentum.'),
  ('twenty-day-streak', 'Momentum', 'Held your focus for twenty days.'),
  ('thirty-day-streak', 'Monthly Mastery', 'Completed a full month of showing up.'),
  ('sixty-day-streak', 'Deep Work', 'Maintained a sixty-day practice.'),
  ('ninety-day-streak', 'Unstoppable', 'Reached ninety days of progress.'),
  ('one-twenty-day-streak', 'Habit Architect', 'Designed a 120-day learning habit.'),
  ('one-fifty-day-streak', 'Iron Will', 'Sustained 150 days of commitment.'),
  ('one-eighty-day-streak', 'Legendary', 'Reached an extraordinary 180-day streak.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

-- Backfill milestones already earned before this collection was introduced.
insert into public.user_badges (user_id, badge_id)
select p.id, b.id
from public.profiles p
cross join public.badges b
where (b.slug = 'first-post' and exists (select 1 from public.posts post where post.user_id = p.id))
   or (b.slug = 'first-comment' and exists (select 1 from public.comments comment where comment.user_id = p.id))
   or (b.slug = 'ten-post-likes' and (select count(*) from public.likes like_row join public.posts post on post.id = like_row.target_id where like_row.target_type = 'post' and post.user_id = p.id) >= 10)
   or (b.slug = 'five-day-streak' and p.longest_streak >= 5)
   or (b.slug = 'ten-day-streak' and p.longest_streak >= 10)
   or (b.slug = 'twenty-day-streak' and p.longest_streak >= 20)
   or (b.slug = 'thirty-day-streak' and p.longest_streak >= 30)
   or (b.slug = 'sixty-day-streak' and p.longest_streak >= 60)
   or (b.slug = 'ninety-day-streak' and p.longest_streak >= 90)
   or (b.slug = 'one-twenty-day-streak' and p.longest_streak >= 120)
   or (b.slug = 'one-fifty-day-streak' and p.longest_streak >= 150)
   or (b.slug = 'one-eighty-day-streak' and p.longest_streak >= 180)
on conflict do nothing;

create or replace function public.handle_post_streak()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_profile public.profiles%rowtype;
  v_streak integer;
  v_has_required_miss boolean;
begin
  select * into v_profile from public.profiles where id = new.user_id for update;
  insert into public.streak_calendar (user_id, date, status) values (new.user_id, new.post_date, 'posted')
  on conflict (user_id, date) do update set status = 'posted';
  insert into public.user_badges (user_id, badge_id)
  select new.user_id, b.id from public.badges b where b.slug = 'first-post' on conflict do nothing;
  if v_profile.last_post_date is not null and new.post_date <= v_profile.last_post_date then return new; end if;
  if v_profile.last_post_date is null then
    v_streak := 1;
  else
    select exists (select 1 from generate_series(v_profile.last_post_date + 1, new.post_date - 1, interval '1 day') as dates(day) where extract(dow from dates.day) <> 0 and not exists (select 1 from public.streak_calendar sc where sc.user_id = new.user_id and sc.date = dates.day::date and sc.status = 'posted')) into v_has_required_miss;
    v_streak := case when v_has_required_miss then 1 else v_profile.current_streak + 1 end;
  end if;
  update public.profiles set current_streak = v_streak, longest_streak = greatest(longest_streak, v_streak), last_post_date = new.post_date where id = new.user_id;
  insert into public.user_badges (user_id, badge_id)
  select new.user_id, b.id from public.badges b
  where (b.slug = 'five-day-streak' and v_streak >= 5)
     or (b.slug = 'ten-day-streak' and v_streak >= 10)
     or (b.slug = 'twenty-day-streak' and v_streak >= 20)
     or (b.slug = 'thirty-day-streak' and v_streak >= 30)
     or (b.slug = 'sixty-day-streak' and v_streak >= 60)
     or (b.slug = 'ninety-day-streak' and v_streak >= 90)
     or (b.slug = 'one-twenty-day-streak' and v_streak >= 120)
     or (b.slug = 'one-fifty-day-streak' and v_streak >= 150)
     or (b.slug = 'one-eighty-day-streak' and v_streak >= 180)
  on conflict do nothing;
  if v_streak in (7, 14, 30, 60, 90) then insert into public.notifications (recipient_id, type, streak_days) values (new.user_id, 'streak_milestone', v_streak); end if;
  return new;
end;
$$;

create or replace function public.award_first_comment_badge()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_badges (user_id, badge_id)
  select new.user_id, b.id from public.badges b where b.slug = 'first-comment' on conflict do nothing;
  return new;
end;
$$;

create or replace function public.award_ten_post_likes_badge()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_post_owner_id uuid; v_like_count integer;
begin
  if new.target_type <> 'post' then return new; end if;
  select user_id into v_post_owner_id from public.posts where id = new.target_id;
  if v_post_owner_id is null then return new; end if;
  select count(*) into v_like_count from public.likes where target_type = 'post' and target_id = new.target_id;
  if v_like_count >= 10 then
    insert into public.user_badges (user_id, badge_id)
    select v_post_owner_id, b.id from public.badges b where b.slug = 'ten-post-likes' on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists award_first_comment_badge_on_insert on public.comments;
create trigger award_first_comment_badge_on_insert after insert on public.comments for each row execute function public.award_first_comment_badge();
drop trigger if exists award_ten_post_likes_badge_on_insert on public.likes;
create trigger award_ten_post_likes_badge_on_insert after insert on public.likes for each row execute function public.award_ten_post_likes_badge();

revoke all on function public.handle_post_streak() from public, anon, authenticated;
revoke all on function public.award_first_comment_badge() from public, anon, authenticated;
revoke all on function public.award_ten_post_likes_badge() from public, anon, authenticated;
