-- ============================================================================
-- Paave | Migration 0002 — Insights (watchlists, notifications, search) + News
-- ============================================================================
-- Source endpoints:
--   /insights/watchlists*                /insights/notifications*
--   /insights/settings/notifications     /insights/search-history
--   /insights/search-stats/top           /news*, /news/favorites/*
-- ============================================================================

-- ---------------------------------------------------------------------------
-- WATCHLISTS
-- ---------------------------------------------------------------------------
create table public.watchlists (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  sequence    int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create unique index uq_watchlists_user_name_active
  on public.watchlists (user_id, name) where (deleted_at is null);
create index idx_watchlists_user_sequence on public.watchlists (user_id, sequence);

create trigger trg_watchlists_updated_at
before update on public.watchlists
for each row execute function public.tg_set_updated_at();

create table public.watchlist_symbols (
  watchlist_id bigint not null references public.watchlists(id) on delete cascade,
  symbol_code  text   not null,
  added_at     timestamptz not null default now(),
  primary key (watchlist_id, symbol_code)
);
create index idx_watchlist_symbols_symbol on public.watchlist_symbols (symbol_code);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
create type public.notification_channel as enum ('PUSH','EMAIL','IN_APP','SMS');
create type public.notification_category as enum (
  'PRICE_ALERT','PORTFOLIO_HEALTH','SOCIAL_FOLLOW','SOCIAL_LIKE','SOCIAL_REPLY',
  'CONTEST','LEARNING','SYSTEM','AI_COACHING'
);

create table public.notifications (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  category    public.notification_category not null,
  channel     public.notification_channel  not null default 'IN_APP',
  title       text not null,
  body        text,
  data        jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index idx_notifications_user_unread
  on public.notifications (user_id, created_at desc)
  where read_at is null;

create table public.notification_preferences (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,  -- per-category channel prefs
  updated_at  timestamptz not null default now()
);
create trigger trg_notif_prefs_updated_at
before update on public.notification_preferences
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- SEARCH HISTORY & STATS
-- ---------------------------------------------------------------------------
create table public.search_history (
  id         bigserial primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  query      text not null,
  result_symbol text,                   -- if a symbol was tapped
  created_at timestamptz not null default now()
);
create index idx_search_history_user on public.search_history (user_id, created_at desc);

-- Aggregated per-symbol popularity; refreshed by a cron/job.
create table public.search_stats_top (
  symbol_code text not null,
  window_days int  not null,             -- 1,7,30
  view_count  bigint not null,
  rank        int    not null,
  refreshed_at timestamptz not null default now(),
  primary key (symbol_code, window_days)
);

-- ---------------------------------------------------------------------------
-- NEWS (external feed cache + user favorites)
-- ---------------------------------------------------------------------------
create table public.news_items (
  id            bigint primary key,                         -- upstream news id
  source        text not null,
  title         text not null,
  body          text,
  url           text,
  image_url     text,
  symbols       text[] not null default '{}',                -- GIN-indexed
  tags          text[] not null default '{}',
  language      public.app_language not null default 'vi',
  published_at  timestamptz not null,
  fetched_at    timestamptz not null default now()
);
create index idx_news_published on public.news_items (published_at desc);
create index idx_news_symbols_gin on public.news_items using gin (symbols);
create index idx_news_tags_gin on public.news_items using gin (tags);

create table public.news_announcements (
  id            bigint primary key,
  symbol_code   text,
  type          text,
  title         text not null,
  body          text,
  url           text,
  published_at  timestamptz not null,
  fetched_at    timestamptz not null default now()
);
create index idx_news_ann_symbol on public.news_announcements (symbol_code, published_at desc);

create table public.news_notices (
  id            bigint primary key,
  title         text not null,
  body          text,
  url           text,
  category      text,
  published_at  timestamptz not null,
  fetched_at    timestamptz not null default now()
);

create table public.news_favorites (
  user_id    uuid  not null references public.profiles(id) on delete cascade,
  news_id    bigint not null references public.news_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, news_id)
);
create index idx_news_favorites_user on public.news_favorites (user_id, created_at desc);
