-- ============================================================================
-- Paave | Migration 0003 — Virtual (Paper) Trading Engine
-- ============================================================================
-- This is V1/V2 core: paper trading with VND 500,000,000 starting balance.
-- Source: /virtual/* (87 endpoints) — accounts, sub-accounts, portfolios,
--         orders (limit + stop-limit + stop), trades, holdings, P&L, contests,
--         follow-to-copy, search, leaderboard, recommended accounts.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type public.v_currency   as enum ('VND','KRW','USD');
create type public.v_side       as enum ('BUY','SELL');
create type public.v_order_type as enum ('LO','MP','ATO','ATC','STOP_LIMIT','STOP');
create type public.v_order_status as enum (
  'PENDING','ACCEPTED','PARTIAL','FILLED','CANCELLED','REJECTED','EXPIRED'
);
create type public.v_exchange   as enum ('HOSE','HNX','UPCOM','KOSPI','KOSDAQ');

-- ---------------------------------------------------------------------------
-- VIRTUAL SUB-ACCOUNTS (each user gets one or more sub-accounts, default 1)
-- BRD: VND 500,000,000 starting balance per sub-account
-- ---------------------------------------------------------------------------
create table public.virtual_sub_accounts (
  id               text primary key,                       -- e.g. 'PAAVE-VS-0000001'
  user_id          uuid not null references public.profiles(id) on delete cascade,
  label            text,
  currency         public.v_currency not null default 'VND',
  starting_balance numeric(20,4) not null default 500000000,
  cash_balance     numeric(20,4) not null default 500000000
                    check (cash_balance >= 0),
  status           text not null default 'ACTIVE' check (status in ('ACTIVE','FROZEN','CLOSED')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  closed_at        timestamptz
);
create index idx_vsub_user on public.virtual_sub_accounts (user_id);
create trigger trg_vsub_updated_at
before update on public.virtual_sub_accounts
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- PORTFOLIOS  — named buckets within a sub-account
-- ---------------------------------------------------------------------------
create table public.virtual_portfolios (
  id            bigserial primary key,
  sub_account_id text not null references public.virtual_sub_accounts(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 60),
  quota         numeric(20,4) not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index idx_vportf_sub on public.virtual_portfolios (sub_account_id);
create trigger trg_vportf_updated_at
before update on public.virtual_portfolios
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- ORDERS — all lifecycle (placed, cancelled, modified)
-- ---------------------------------------------------------------------------
create table public.virtual_orders (
  id              bigserial primary key,
  sub_account_id  text not null references public.virtual_sub_accounts(id) on delete restrict,
  portfolio_id    bigint references public.virtual_portfolios(id) on delete set null,
  symbol_code     text not null,
  exchange        public.v_exchange,
  side            public.v_side not null,
  order_type      public.v_order_type not null default 'LO',
  order_command   text,                                   -- e.g., 'GTD','IOC','DAY'
  price           numeric(20,4),                          -- null for MP/ATO/ATC
  stop_price      numeric(20,4),                          -- for stop orders
  quantity        bigint not null check (quantity > 0),
  filled_quantity bigint not null default 0 check (filled_quantity >= 0),
  avg_fill_price  numeric(20,4),
  status          public.v_order_status not null default 'PENDING',
  placed_at       timestamptz not null default now(),
  matched_at      timestamptz,
  cancelled_at    timestamptz,
  parent_order_id bigint references public.virtual_orders(id) on delete set null,
  reject_reason   text
);
create index idx_vord_sub_placed on public.virtual_orders (sub_account_id, placed_at desc);
create index idx_vord_symbol_placed on public.virtual_orders (symbol_code, placed_at desc);
create index idx_vord_status on public.virtual_orders (status) where status in ('PENDING','ACCEPTED','PARTIAL');

-- ---------------------------------------------------------------------------
-- TRADES  — individual fills derived from matching
-- ---------------------------------------------------------------------------
create table public.virtual_trades (
  id             bigserial primary key,
  order_id       bigint not null references public.virtual_orders(id) on delete cascade,
  sub_account_id text   not null references public.virtual_sub_accounts(id) on delete restrict,
  symbol_code    text   not null,
  side           public.v_side not null,
  quantity       bigint not null check (quantity > 0),
  price          numeric(20,4) not null,
  fees           numeric(20,4) not null default 0,
  tax            numeric(20,4) not null default 0,
  executed_at    timestamptz not null default now()
);
create index idx_vtrade_sub_exec on public.virtual_trades (sub_account_id, executed_at desc);
create index idx_vtrade_symbol on public.virtual_trades (symbol_code, executed_at desc);

-- ---------------------------------------------------------------------------
-- HOLDINGS — current position per symbol per sub-account (derived + cached)
-- ---------------------------------------------------------------------------
create table public.virtual_holdings (
  sub_account_id  text not null references public.virtual_sub_accounts(id) on delete cascade,
  symbol_code     text not null,
  quantity        bigint not null default 0 check (quantity >= 0),
  avg_cost        numeric(20,4) not null default 0,
  realized_pl     numeric(20,4) not null default 0,
  updated_at      timestamptz not null default now(),
  primary key (sub_account_id, symbol_code)
);
create index idx_vhold_symbol on public.virtual_holdings (symbol_code);

-- ---------------------------------------------------------------------------
-- DAILY P&L snapshots (NAV time-series, one row per sub-account per day)
-- ---------------------------------------------------------------------------
create table public.virtual_pl_daily (
  sub_account_id text not null references public.virtual_sub_accounts(id) on delete cascade,
  trade_date     date not null,
  cash_balance   numeric(20,4) not null,
  holdings_value numeric(20,4) not null,
  total_equity   numeric(20,4) not null,
  realized_pl    numeric(20,4) not null default 0,
  unrealized_pl  numeric(20,4) not null default 0,
  normalized_nav numeric(20,6),                           -- for leaderboard/copy-trading
  snapshot_at    timestamptz not null default now(),
  primary key (sub_account_id, trade_date)
);
create index idx_vpl_date on public.virtual_pl_daily (trade_date);

-- ---------------------------------------------------------------------------
-- COPY/FOLLOW RELATIONSHIP (virtual-trading specific, separate from social)
-- Per /virtual/accounts/follows, /virtual/accounts/following-accounts
-- ---------------------------------------------------------------------------
create table public.virtual_follows (
  id                 bigserial primary key,
  follower_user_id   uuid not null references public.profiles(id) on delete cascade,
  followed_user_id   uuid not null references public.profiles(id) on delete cascade,
  followed_sub_account_id text references public.virtual_sub_accounts(id) on delete cascade,
  copy_mode          text not null default 'OBSERVE' check (copy_mode in ('OBSERVE','COPY_SIGNAL')),
  created_at         timestamptz not null default now(),
  disabled_at        timestamptz,
  check (follower_user_id <> followed_user_id),
  unique (follower_user_id, followed_user_id)
);
create index idx_vfollow_followed on public.virtual_follows (followed_user_id);

-- ---------------------------------------------------------------------------
-- CONTESTS — organized paper-trading competitions
-- ---------------------------------------------------------------------------
create type public.contest_status as enum ('DRAFT','OPEN','ACTIVE','ENDED','CANCELLED');

create table public.virtual_contests (
  id                bigserial primary key,
  organization_id   text,
  name              text not null,
  description       text,
  status            public.contest_status not null default 'DRAFT',
  rules             jsonb not null default '{}'::jsonb,    -- allowed markets, symbols, fees, etc.
  booking_starts_at timestamptz,
  booking_ends_at   timestamptz,
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  starting_balance  numeric(20,4) not null default 500000000,
  currency          public.v_currency not null default 'VND',
  max_participants  int,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (starts_at < ends_at)
);
create index idx_contest_status_starts on public.virtual_contests (status, starts_at desc);
create trigger trg_contest_updated_at
before update on public.virtual_contests
for each row execute function public.tg_set_updated_at();

create table public.virtual_contest_registrations (
  contest_id  bigint not null references public.virtual_contests(id) on delete cascade,
  user_id     uuid   not null references public.profiles(id) on delete cascade,
  sub_account_id text references public.virtual_sub_accounts(id),
  joined_at   timestamptz not null default now(),
  primary key (contest_id, user_id)
);

create table public.virtual_contest_rankings (
  contest_id  bigint not null references public.virtual_contests(id) on delete cascade,
  user_id     uuid   not null references public.profiles(id) on delete cascade,
  rank        int,
  score       numeric(20,4),
  roi_pct     numeric(10,4),
  snapshot_at timestamptz not null default now(),
  primary key (contest_id, user_id, snapshot_at)
);
create index idx_vcontest_rank on public.virtual_contest_rankings (contest_id, rank);

-- ---------------------------------------------------------------------------
-- LIMITED STOCK (admin-curated: symbols blocked from paper trading)
-- ---------------------------------------------------------------------------
create table public.virtual_limited_stocks (
  symbol_code text primary key,
  reason      text,
  limited_by  uuid references public.profiles(id),
  limited_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RECOMMENDED ACCOUNTS (editorial curation)
-- ---------------------------------------------------------------------------
create table public.virtual_recommended_accounts (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  rank         int not null default 0,
  blurb        text,
  recommended_by uuid references public.profiles(id),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SEARCH / VIEW COUNT for virtual accounts
-- ---------------------------------------------------------------------------
create table public.virtual_search_history (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  query       text not null,
  clicked_user_id uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index idx_vsearch_user on public.virtual_search_history (user_id, created_at desc);

create table public.virtual_account_view_counts (
  sub_account_id text primary key references public.virtual_sub_accounts(id) on delete cascade,
  view_count     bigint not null default 0,
  updated_at     timestamptz not null default now()
);
