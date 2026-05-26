-- ============================================================================
-- Paave | Migration 0004 — Market data + Fundamentals cache (read-only mirror)
-- ============================================================================
-- These tables are populated by the ETL from the Paave upstream API
-- (/market/*, /fundamentals/*). Supabase is the cache, refreshed hourly.
-- All rows are PUBLIC-READ for authenticated users. Writes are service_role only.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- SYMBOLS — master reference for tradeable instruments
-- ---------------------------------------------------------------------------
create type public.symbol_type as enum ('STOCK','ETF','CW','FUTURE','INDEX','BOND','FUND');

create table public.symbols (
  code          text primary key,
  name          text not null,
  short_name    text,
  exchange      public.v_exchange,
  symbol_type   public.symbol_type not null default 'STOCK',
  industry      text,
  sector        text,
  isin          text,
  currency      public.v_currency default 'VND',
  listed_at     date,
  is_active     boolean not null default true,
  static_info   jsonb not null default '{}'::jsonb,     -- lot_size, tick_size_schedule, price_limits
  updated_at    timestamptz not null default now()
);
create index idx_symbols_exchange on public.symbols (exchange) where is_active;
create index idx_symbols_sector on public.symbols (sector);
create trigger trg_symbols_updated_at
before update on public.symbols
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- LATEST QUOTE per symbol (hot table; upserted frequently)
-- ---------------------------------------------------------------------------
create table public.symbol_quotes_latest (
  symbol_code   text primary key references public.symbols(code) on delete cascade,
  ref_price     numeric(20,4),
  ceiling_price numeric(20,4),
  floor_price   numeric(20,4),
  open_price    numeric(20,4),
  high_price    numeric(20,4),
  low_price     numeric(20,4),
  last_price    numeric(20,4),
  last_volume   bigint,
  total_volume  bigint,
  total_value   numeric(24,4),
  pct_change    numeric(10,4),
  bid_price     numeric(20,4),
  bid_size      bigint,
  ask_price     numeric(20,4),
  ask_size      bigint,
  foreign_buy_vol  bigint,
  foreign_sell_vol bigint,
  session       text,                                    -- 'ATO','CONT','ATC','CLOSED'
  quote_time    timestamptz not null,
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- DAILY BARS — for daily charts (candles)
-- ---------------------------------------------------------------------------
create table public.symbol_day_bars (
  symbol_code text not null references public.symbols(code) on delete cascade,
  trade_date  date not null,
  open        numeric(20,4),
  high        numeric(20,4),
  low         numeric(20,4),
  close       numeric(20,4),
  volume      bigint,
  value       numeric(24,4),
  adj_close   numeric(20,4),
  primary key (symbol_code, trade_date)
);
create index idx_day_bars_date on public.symbol_day_bars (trade_date);

-- ---------------------------------------------------------------------------
-- MINUTE BARS — for intraday charts
-- (Low-volume mode for V1. Consider native range partitioning by month later.)
-- ---------------------------------------------------------------------------
create table public.symbol_minute_bars (
  symbol_code text not null references public.symbols(code) on delete cascade,
  bar_time    timestamptz not null,
  open        numeric(20,4),
  high        numeric(20,4),
  low         numeric(20,4),
  close       numeric(20,4),
  volume      bigint,
  value       numeric(24,4),
  primary key (symbol_code, bar_time)
);
create index idx_min_bars_time on public.symbol_minute_bars (bar_time desc);

-- ---------------------------------------------------------------------------
-- TICKS (sample cache; full tick history is NOT stored in Supabase at V1)
-- ---------------------------------------------------------------------------
create table public.symbol_tick_snapshots (
  id          bigserial primary key,
  symbol_code text not null references public.symbols(code) on delete cascade,
  ticks       jsonb not null,                            -- last N ticks as JSON array
  captured_at timestamptz not null default now()
);
create index idx_tick_snap_symbol on public.symbol_tick_snapshots (symbol_code, captured_at desc);

-- ---------------------------------------------------------------------------
-- INDEX MASTER + DAILY RETURN
-- ---------------------------------------------------------------------------
create table public.indices (
  code        text primary key,                          -- 'VNINDEX','HNXINDEX','KOSPI'
  name        text not null,
  exchange    public.v_exchange,
  updated_at  timestamptz not null default now()
);

create table public.index_daily (
  index_code  text not null references public.indices(code) on delete cascade,
  trade_date  date not null,
  close       numeric(20,4),
  pct_change  numeric(10,4),
  primary key (index_code, trade_date)
);

create table public.index_stock_members (
  index_code  text not null references public.indices(code) on delete cascade,
  symbol_code text not null references public.symbols(code) on delete cascade,
  weight      numeric(10,6),
  updated_at  timestamptz not null default now(),
  primary key (index_code, symbol_code)
);

-- ---------------------------------------------------------------------------
-- MARKET SESSION STATUS (per-exchange heartbeat)
-- ---------------------------------------------------------------------------
create table public.market_session_status (
  exchange    public.v_exchange primary key,
  session     text not null,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RANKINGS (denormalized hot-lists; refreshed by ETL)
-- ---------------------------------------------------------------------------
create table public.rankings_snapshot (
  id          bigserial primary key,
  kind        text not null,             -- 'UP_DOWN','FOREIGNER','TRADE','PERIOD','TOP','LIQUIDITY'
  scope       text,                      -- optional scope (exchange, period)
  window_code text,                      -- '1D','5D','1M','3M','YTD'
  payload     jsonb not null,            -- full ranking list
  captured_at timestamptz not null default now()
);
create index idx_rank_kind_time on public.rankings_snapshot (kind, captured_at desc);

-- ---------------------------------------------------------------------------
-- DIVIDENDS / CORPORATE ACTIONS
-- ---------------------------------------------------------------------------
create table public.dividend_events (
  id            bigserial primary key,
  symbol_code   text not null references public.symbols(code) on delete cascade,
  ex_date       date,
  record_date   date,
  payment_date  date,
  event_type    text,                    -- 'CASH','STOCK','RIGHTS','SPLIT'
  ratio         numeric(20,8),
  amount        numeric(20,4),
  currency      public.v_currency,
  fetched_at    timestamptz not null default now()
);
create index idx_div_symbol on public.dividend_events (symbol_code, ex_date desc);

-- ---------------------------------------------------------------------------
-- FUNDAMENTALS (company info + financials)
-- ---------------------------------------------------------------------------
create table public.company_profiles (
  symbol_code  text primary key references public.symbols(code) on delete cascade,
  profile      jsonb not null default '{}'::jsonb,       -- description, website, CEO, HQ
  business_info jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);
create trigger trg_company_profiles_updated_at
before update on public.company_profiles
for each row execute function public.tg_set_updated_at();

create table public.company_financials (
  symbol_code   text not null references public.symbols(code) on delete cascade,
  period        text not null,                           -- 'Q1-2026','FY-2025'
  period_type   text not null check (period_type in ('QUARTER','ANNUAL','TTM')),
  statements    jsonb not null,                          -- income/balance/cashflow blobs
  ratios        jsonb not null default '{}'::jsonb,
  fetched_at    timestamptz not null default now(),
  primary key (symbol_code, period, period_type)
);

create table public.company_shareholders (
  symbol_code  text not null references public.symbols(code) on delete cascade,
  as_of_date   date not null,
  shareholders jsonb not null,                           -- [{name, pct, shares, type}]
  primary key (symbol_code, as_of_date)
);

create table public.company_insiders (
  symbol_code  text not null references public.symbols(code) on delete cascade,
  as_of_date   date not null,
  insiders     jsonb not null,
  primary key (symbol_code, as_of_date)
);

create table public.financial_ratio_ranking (
  symbol_code text not null references public.symbols(code) on delete cascade,
  metric      text not null,                             -- 'PE','PB','ROE','DEBT_TO_EQUITY'
  period      text not null,
  value       numeric(24,6),
  rank        int,
  sector      text,
  refreshed_at timestamptz not null default now(),
  primary key (symbol_code, metric, period)
);
