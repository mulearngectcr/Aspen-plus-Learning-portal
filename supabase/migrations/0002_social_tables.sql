-- Content ownership remains server-side. UUID defaults permit Express inserts
-- without generating identifiers itself.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  content text not null check (char_length(content) <= 3000),
  image_url_1 text,
  image_url_2 text,
  created_at timestamptz not null default now(),
  post_date date generated always as ((created_at at time zone 'Asia/Kolkata')::date) stored,
  is_deleted boolean not null default false
);

create index posts_user_id_created_at_idx on public.posts (user_id, created_at desc);
create index posts_post_date_created_at_idx on public.posts (post_date desc, created_at desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  parent_comment_id uuid references public.comments(id) on delete restrict,
  content text not null check (char_length(content) <= 1000),
  created_at timestamptz not null default now(),
  is_deleted boolean not null default false
);

create index comments_post_id_idx on public.comments (post_id);
create index comments_post_id_parent_comment_id_idx
  on public.comments (post_id, parent_comment_id);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create index likes_target_type_target_id_idx on public.likes (target_type, target_id);

create table public.streak_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  date date not null,
  status text not null check (status in ('posted', 'missed', 'sunday_free_pass')),
  unique (user_id, date)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  type text not null check (type in (
    'comment_on_post', 'reply_to_comment', 'like_post', 'like_comment', 'streak_milestone'
  )),
  target_type text,
  target_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  check (target_type is null or target_type in ('post', 'comment')),
  check ((target_type is null) = (target_id is null))
  -- Intentionally no actor_id: recipient-facing notification data cannot reveal it.
);

create index notifications_recipient_id_is_read_created_at_idx
  on public.notifications (recipient_id, is_read, created_at desc);

create table public.moderation_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  reason text,
  created_at timestamptz not null default now()
);
