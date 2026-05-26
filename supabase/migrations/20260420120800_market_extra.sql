-- ============================================================================
-- Paave | Migration 0008 — Additional market + fundamentals cache tables
-- ============================================================================
-- Tables for the remaining ~60 cacheable reads in the upstream API.
-- All are populated by the ETL worker (service_role). Public-read via RLS.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PER-SYMBOL TIME-SERIES EXTRAS
-- ---------------------------------------------------------------------------
create table public.symbol_daily_returns (
  symbol_code text not null references public.symbols(code) on delete cascade,
  trade_date  date not null,
  return_pct  numeric(10,4),
  volume      bigint,
  primary key (symbol_code, trade_date)
);

create table public.symbol_minute_chart (
  symbol_code text not null references public.symbols(code) on delete cascade,
  bar_time    timestamptz not null,
  open numeric(20,4), high numeric(20,4), low numeric(20,4), close numeric(20,4),
  volume bigint,
  primary key (symbol_code, bar_time)
);
create index idx_min_chart_time on public.symbol_minute_chart (bar_time desc);

create table public.symbol_statistic (
  symbol_code      text primary key references public.symbols(code) on delete cascade,
  week52_high      numeric(20,4),
  week52_low       numeric(20,4),
  avg_volume_30d   bigint,
  beta             numeric(10,4),
  market_cap       numeric(24,2),
  shares_outstanding bigint,
  free_float_pct   numeric(10,4),
  pe_ratio         numeric(12,4),
  pb_ratio         numeric(12,4),
  eps              numeric(12,4),
  dividend_yield   numeric(10,4),
  updated_at       timestamptz not null default now()
);
create trigger trg_symstat_updated_at
before update on public.symbol_statistic
for each row execute function public.tg_set_updated_at();

create table public.symbol_quote_detail (
  symbol_code text primary key references public.symbols(code) on delete cascade,
  bids jsonb not null default '[]'::jsonb,   -- top-N bid levels
  asks jsonb not null default '[]'::jsonb,
  match_history jsonb not null default '[]'::jsonb,
  session    text,
  quote_time timestamptz not null,
  updated_at timestamptz not null default now()
);
create trigger trg_qdetail_updated_at
before update on public.symbol_quote_detail
for each row execute function public.tg_set_updated_at();

create table public.symbol_foreigner_summary (
  symbol_code   text primary key references public.symbols(code) on delete cascade,
  trade_date    date not null,
  buy_volume    bigint,
  sell_volume   bigint,
  buy_value     numeric(24,4),
  sell_value    numeric(24,4),
  net_volume    bigint generated always as (coalesce(buy_volume,0) - coalesce(sell_volume,0)) stored,
  room_available bigint,
  room_pct      numeric(10,4),
  updated_at    timestamptz not null default now()
);
create trigger trg_fsum_updated_at
before update on public.symbol_foreigner_summary
for each row execute function public.tg_set_updated_at();

create table public.symbol_foreigner_daily (
  symbol_code text not null references public.symbols(code) on delete cascade,
  trade_date  date not null,
  buy_volume  bigint,
  sell_volume bigint,
  buy_value   numeric(24,4),
  sell_value  numeric(24,4),
  primary key (symbol_code, trade_date)
);

create table public.symbol_rights (
  id           bigserial primary key,
  symbol_code  text not null references public.symbols(code) on delete cascade,
  right_type   text,                          -- 'DIVIDEND','STOCK_SPLIT','ISSUE','AGM'
  ex_date      date,
  record_date  date,
  ratio        numeric(20,8),
  description  text,
  fetched_at   timestamptz not null default now()
);
create index idx_rights_symbol on public.symbol_rights (symbol_code, ex_date desc);

create table public.symbol_ticks_latest (
  symbol_code text primary key references public.symbols(code) on delete cascade,
  ticks       jsonb not null,   -- last N trades as [{ts,price,volume,side}]
  updated_at  timestamptz not null default now()
);
create trigger trg_ticklatest_updated_at
before update on public.symbol_ticks_latest
for each row execute function public.tg_set_updated_at();

create table public.symbol_oddlot_latest (
  symbol_code text primary key references public.symbols(code) on delete cascade,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
create trigger trg_oddlot_updated_at
before update on public.symbol_oddlot_latest
for each row execute function public.tg_set_updated_at();

create table public.symbol_static_info (
  symbol_code    text primary key references public.symbols(code) on delete cascade,
  lot_size       int,
  tick_size_rule jsonb,
  price_limit_pct numeric(10,4),
  margin_eligible boolean,
  updated_at     timestamptz not null default now()
);
create trigger trg_static_updated_at
before update on public.symbol_static_info
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- MARKET-WIDE SNAPSHOTS
-- ---------------------------------------------------------------------------
create table public.market_liquidity_snapshot (
  id          bigserial primary key,
  exchange    public.v_exchange,
  data        jsonb not null,
  captured_at timestamptz not null default now()
);
create index idx_liquidity_time on public.market_liquidity_snapshot (exchange, captured_at desc);

create table public.market_price_board_snapshot (
  id          bigserial primary key,
  exchange    public.v_exchange,
  data        jsonb not null,
  captured_at timestamptz not null default now()
);
create index idx_priceboard_time on public.market_price_board_snapshot (exchange, captured_at desc);

create table public.market_last_trading_date (
  exchange    public.v_exchange primary key,
  trade_date  date not null,
  updated_at  timestamptz not null default now()
);

create table public.tick_size_match (
  id          bigserial primary key,
  exchange    public.v_exchange,
  rules       jsonb not null,
  effective_from date,
  fetched_at  timestamptz not null default now()
);

create table public.vnindex_returns (
  trade_date  date primary key,
  close       numeric(20,4),
  return_1d   numeric(10,4),
  return_1w   numeric(10,4),
  return_1m   numeric(10,4),
  return_ytd  numeric(10,4),
  fetched_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PUT-THROUGH (block trades)
-- ---------------------------------------------------------------------------
create table public.putthrough_advertise (
  id          bigserial primary key,
  symbol_code text,
  side        text,
  quantity    bigint,
  price       numeric(20,4),
  broker      text,
  posted_at   timestamptz,
  captured_at timestamptz not null default now()
);
create index idx_pt_adv_symbol on public.putthrough_advertise (symbol_code, captured_at desc);

create table public.putthrough_deal (
  id          bigserial primary key,
  symbol_code text,
  quantity    bigint,
  price       numeric(20,4),
  value       numeric(24,4),
  executed_at timestamptz,
  captured_at timestamptz not null default now()
);
create index idx_pt_deal_symbol on public.putthrough_deal (symbol_code, executed_at desc);

create table public.putthrough_deal_total (
  trade_date  date primary key,
  total_qty   bigint,
  total_value numeric(24,4),
  deal_count  int,
  fetched_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TOP LISTS (curated by backend)
-- ---------------------------------------------------------------------------
create table public.top_ai_rating (
  symbol_code  text not null references public.symbols(code) on delete cascade,
  rank         int not null,
  rating       text,                       -- 'STRONG_BUY','BUY','HOLD','SELL','STRONG_SELL'
  score        numeric(10,4),
  refreshed_at timestamptz not null default now(),
  primary key (symbol_code, refreshed_at)
);

create table public.top_foreigner_trading (
  symbol_code  text not null references public.symbols(code) on delete cascade,
  rank         int not null,
  direction    text check (direction in ('NET_BUY','NET_SELL')),
  net_value    numeric(24,4),
  refreshed_at timestamptz not null default now(),
  primary key (symbol_code, direction, refreshed_at)
);

-- ---------------------------------------------------------------------------
-- INDEX / ETF EXTRAS
-- ---------------------------------------------------------------------------
create table public.etf_index_daily (
  symbol_code text not null references public.symbols(code) on delete cascade,
  trade_date  date not null,
  index_value numeric(20,6),
  return_pct  numeric(10,4),
  primary key (symbol_code, trade_date)
);

create table public.etf_nav_daily (
  symbol_code text not null references public.symbols(code) on delete cascade,
  trade_date  date not null,
  nav         numeric(20,6),
  nav_change  numeric(10,4),
  primary key (symbol_code, trade_date)
);

-- ---------------------------------------------------------------------------
-- RANKINGS — normalized per-kind tables (beyond the generic rankings_snapshot)
-- ---------------------------------------------------------------------------
create table public.rankings_foreigner (
  rank int, symbol_code text, net_value numeric(24,4), net_volume bigint,
  direction text, refreshed_at timestamptz not null default now(),
  primary key (symbol_code, refreshed_at, direction)
);

create table public.rankings_stock_trade (
  rank int, symbol_code text, trade_value numeric(24,4), volume bigint,
  refreshed_at timestamptz not null default now(),
  primary key (symbol_code, refreshed_at)
);

create table public.rankings_stock_period (
  rank int, symbol_code text, period_code text, change_pct numeric(10,4),
  refreshed_at timestamptz not null default now(),
  primary key (symbol_code, period_code, refreshed_at)
);

create table public.rankings_stock_up_down (
  rank int, symbol_code text, direction text, change_pct numeric(10,4),
  refreshed_at timestamptz not null default now(),
  primary key (symbol_code, direction, refreshed_at)
);

create table public.rankings_stock_top (
  rank int, symbol_code text, kind text, value numeric(24,4),
  refreshed_at timestamptz not null default now(),
  primary key (symbol_code, kind, refreshed_at)
);

-- ---------------------------------------------------------------------------
-- FUNDAMENTALS EXTRAS
-- ---------------------------------------------------------------------------
create table public.company_business_info (
  symbol_code  text primary key references public.symbols(code) on delete cascade,
  info         jsonb not null,
  updated_at   timestamptz not null default now()
);
create trigger trg_bizinfo_updated_at
before update on public.company_business_info
for each row execute function public.tg_set_updated_at();

create table public.company_statements (
  symbol_code  text not null references public.symbols(code) on delete cascade,
  period       text not null,
  statement    text not null check (statement in ('IS','BS','CF')),  -- Income/Balance/Cashflow
  data         jsonb not null,
  fetched_at   timestamptz not null default now(),
  primary key (symbol_code, period, statement)
);

create table public.stock_sector_overview (
  symbol_code  text primary key references public.symbols(code) on delete cascade,
  overview     jsonb not null,
  updated_at   timestamptz not null default now()
);
create trigger trg_secoverview_updated_at
before update on public.stock_sector_overview
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- APP EXTRAS
-- ---------------------------------------------------------------------------
-- /app/locale returns the locale catalog; we already have locale_* but a
-- consolidated snapshot helps clients fetch in one call.
create table public.app_locale_snapshot (
  lang        public.app_language primary key,
  catalog     jsonb not null,
  fetched_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CONSTRAINTS added to tables from earlier migrations so PostgREST upserts
-- can use on_conflict on natural keys.
-- ---------------------------------------------------------------------------
alter table public.app_faq add constraint uq_app_faq_nat
  unique (ms_name, lang, question);

-- ---------------------------------------------------------------------------
-- RLS — enable + public-authed-read + service_role writes
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  for t in select unnest(array[
    'symbol_daily_returns','symbol_minute_chart','symbol_statistic','symbol_quote_detail',
    'symbol_foreigner_summary','symbol_foreigner_daily','symbol_rights','symbol_ticks_latest',
    'symbol_oddlot_latest','symbol_static_info','market_liquidity_snapshot',
    'market_price_board_snapshot','market_last_trading_date','tick_size_match','vnindex_returns',
    'putthrough_advertise','putthrough_deal','putthrough_deal_total','top_ai_rating',
    'top_foreigner_trading','etf_index_daily','etf_nav_daily','rankings_foreigner',
    'rankings_stock_trade','rankings_stock_period','rankings_stock_up_down','rankings_stock_top',
    'company_business_info','company_statements','stock_sector_overview','app_locale_snapshot'
  ]) loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($q$
      create policy "%s_read_authed" on public.%I
      for select using (auth.uid() is not null);
    $q$, t, t);
  end loop;
end $$;
