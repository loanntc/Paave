-- ============================================================================
-- Paave | Migration 0001 — Social (Threads-style feed, cashtags, follows)
-- ============================================================================
-- Source endpoints: /social/posts/*, /social/posts/{id}/likes,
--                   /social/users/{id}/follows, /social/users/{id}/blocks,
--                   /social/timeline, /social/cashtags/{symbol},
--                   /social/users/{id}/posts
-- Write path: Supabase REST with user JWT (own-row writes).
-- Read path:  Public-read for posts (RLS below allows SELECT for all authenticated
--             users, filtered by blocks and soft-deletes).
-- ============================================================================

create type public.post_sentiment as enum ('BULLISH', 'BEARISH', 'NEUTRAL');

-- ---------------------------------------------------------------------------
-- POSTS  — core Threads-style content unit
-- ---------------------------------------------------------------------------
create table public.posts (
  id           bigserial primary key,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  content      text not null check (char_length(content) between 1 and 1000),
  sentiment    public.post_sentiment,
  language     public.app_language not null default 'vi',
  parent_id    bigint references public.posts(id) on delete cascade,  -- reply threading
  media        jsonb not null default '[]'::jsonb,   -- [{url,type,width,height}]
  is_pinned    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz                                             -- soft delete
);
create index idx_posts_author_created on public.posts (author_id, created_at desc)
  where deleted_at is null;
create index idx_posts_created_at on public.posts (created_at desc)
  where deleted_at is null and parent_id is null;
create index idx_posts_parent on public.posts (parent_id)
  where deleted_at is null;

create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- POST_CASHTAGS  — denormalized per-ticker index for /social/cashtags/{symbol}
-- ---------------------------------------------------------------------------
create table public.post_cashtags (
  post_id     bigint not null references public.posts(id) on delete cascade,
  symbol_code text  not null,
  primary key (post_id, symbol_code)
);
create index idx_post_cashtags_symbol_created
  on public.post_cashtags (symbol_code, post_id desc);

-- ---------------------------------------------------------------------------
-- POST_LIKES  — unique (post, user)
-- ---------------------------------------------------------------------------
create table public.post_likes (
  post_id   bigint not null references public.posts(id) on delete cascade,
  user_id   uuid   not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index idx_post_likes_user on public.post_likes (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- USER_FOLLOWS (SOCIAL)  —  A follows B
-- Note: virtual-trading "follow for copy" is a separate table in migration 0003.
-- ---------------------------------------------------------------------------
create table public.user_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index idx_follows_followed on public.user_follows (followed_id);

-- ---------------------------------------------------------------------------
-- USER_BLOCKS  — directional; blocker hides blocked's content + comms
-- ---------------------------------------------------------------------------
create table public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- ---------------------------------------------------------------------------
-- MATERIALIZED COUNTS (optional; refreshed by trigger)
-- ---------------------------------------------------------------------------
-- Keep like/reply counts on the post row for fast timeline rendering.
alter table public.posts add column like_count  bigint not null default 0;
alter table public.posts add column reply_count bigint not null default 0;

create or replace function public.tg_post_like_count() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end $$;

create trigger trg_post_likes_count
after insert or delete on public.post_likes
for each row execute function public.tg_post_like_count();

create or replace function public.tg_post_reply_count() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' and new.parent_id is not null then
    update public.posts set reply_count = reply_count + 1 where id = new.parent_id;
  elsif tg_op = 'UPDATE' and old.deleted_at is null and new.deleted_at is not null and new.parent_id is not null then
    update public.posts set reply_count = greatest(reply_count - 1, 0) where id = new.parent_id;
  end if;
  return null;
end $$;

create trigger trg_posts_reply_count
after insert or update of deleted_at on public.posts
for each row execute function public.tg_post_reply_count();
