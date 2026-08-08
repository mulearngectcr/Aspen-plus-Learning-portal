-- Defense in depth: enable RLS on every exposed-schema table, even though
-- client roles receive no privileges on these server-owned resources.
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.streak_calendar enable row level security;
alter table public.notifications enable row level security;
alter table public.moderation_log enable row level security;

-- Explicit deny policies make future accidental grants fail closed for browser roles.
create policy "deny browser access" on public.posts for all to anon, authenticated using (false) with check (false);
create policy "deny browser access" on public.comments for all to anon, authenticated using (false) with check (false);
create policy "deny browser access" on public.likes for all to anon, authenticated using (false) with check (false);
create policy "deny browser access" on public.streak_calendar for all to anon, authenticated using (false) with check (false);
create policy "deny browser access" on public.notifications for all to anon, authenticated using (false) with check (false);
create policy "deny browser access" on public.moderation_log for all to anon, authenticated using (false) with check (false);

revoke all on public.posts, public.comments, public.likes, public.notifications, public.moderation_log
  from authenticated, anon;
revoke all on public.streak_calendar from authenticated, anon;
revoke all on public.posts, public.comments, public.likes, public.streak_calendar,
  public.notifications, public.moderation_log from public;

-- service_role is the Express-only database credential. Its BYPASSRLS role
-- attribute permits server access despite the deny policies above.
grant all on public.posts, public.comments, public.likes, public.streak_calendar,
  public.notifications, public.moderation_log to service_role;
