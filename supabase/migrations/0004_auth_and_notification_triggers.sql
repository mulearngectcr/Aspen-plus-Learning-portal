-- All privileged trigger functions pin search_path and are not callable by clients.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null
     or right(lower(new.email), length('@gecthrissur.ac.in')) <> '@gecthrissur.ac.in' then
    raise exception 'Only @gecthrissur.ac.in email addresses may register'
      using errcode = '23514';
  end if;

  insert into public.profiles (id, full_name, username, avatar_url, batch)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'batch'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
    -- A reply notifies the author of the direct parent only; never expose the actor.
    select c.user_id into v_recipient_id from public.comments c where c.id = new.parent_comment_id;
    v_type := 'reply_to_comment';
  end if;

  if v_recipient_id is not null and v_recipient_id <> new.user_id then
    insert into public.notifications (recipient_id, type, target_type, target_id)
    values (v_recipient_id, v_type, 'comment', new.id);
  end if;
  return new;
end;
$$;

create trigger notify_on_new_comment
  after insert on public.comments
  for each row execute procedure public.notify_on_new_comment();

create or replace function public.notify_on_new_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient_id uuid;
  v_type text;
begin
  if new.target_type = 'post' then
    select p.user_id into v_recipient_id from public.posts p where p.id = new.target_id;
    v_type := 'like_post';
  else
    select c.user_id into v_recipient_id from public.comments c where c.id = new.target_id;
    v_type := 'like_comment';
  end if;

  if v_recipient_id is not null and v_recipient_id <> new.user_id then
    insert into public.notifications (recipient_id, type, target_type, target_id)
    values (v_recipient_id, v_type, new.target_type, new.target_id);
  end if;
  return new;
end;
$$;

create trigger notify_on_new_like
  after insert on public.likes
  for each row execute procedure public.notify_on_new_like();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.notify_on_new_comment() from public, anon, authenticated;
revoke all on function public.notify_on_new_like() from public, anon, authenticated;
