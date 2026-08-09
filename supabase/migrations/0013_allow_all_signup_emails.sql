-- Email confirmation remains configured in Supabase Auth, but signups are no
-- longer limited to a particular college domain.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url, batch)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, new.id::text), '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(coalesce(new.email, new.id::text), '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'batch'), '')
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
