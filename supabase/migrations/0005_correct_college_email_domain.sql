-- Keeps already-deployed projects aligned with the correct GEC Thrissur
-- mail domain. New installations receive the same rule from migration 0004.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null
     or right(lower(new.email), length('@gectcr.ac.in')) <> '@gectcr.ac.in' then
    raise exception 'Only @gectcr.ac.in email addresses may register'
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

revoke all on function public.handle_new_user() from public, anon, authenticated;
