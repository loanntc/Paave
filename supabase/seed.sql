-- ============================================================================
-- Paave | seed.sql  —  demo-ready data
-- ============================================================================
-- Run with:
--   supabase db reset --linked      (applies migrations + runs this seed)
-- or standalone:
--   psql $DB_URL -f supabase/seed.sql
--
-- Contents:
--   • 10 users — incl. Lauren (admin)
--   • ~50 VN (HOSE/HNX) + KR (KOSPI/KOSDAQ) symbols with real tickers
--   • 4 indices + index members
--   • latest quotes + a few days of day bars
--   • market session status + holidays
--   • 30 social posts with cashtags, likes, replies, follows
--   • 3 virtual sub-accounts w/ portfolios, orders, trades, holdings, daily P&L
--   • 1 active contest with 3 participants + rankings
--   • watchlists + notifications + news + favorites
--
-- Seeding auth.users: Supabase Auth normally creates rows server-side via the
-- Admin API. For LOCAL development we insert directly into auth.users. For
-- production, REPLACE the auth.users block with calls to the Admin API and
-- then run ONLY the `public.*` inserts below.
-- ============================================================================

set search_path = public, extensions;

-- ============================================================================
-- 0) AUTH USERS (local dev only — delete this block when seeding prod)
-- ============================================================================
-- We use stable UUIDs so rest of seed can reference them.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values
  ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'loan.nguyen@difisoft.com', crypt('Paave!Demo#2026', gen_salt('bf')),
   now(), now(), now(), '{"role":"admin","provider":"email"}'::jsonb, '{}'::jsonb),
  ('11111111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'minh@demo.paave.app', crypt('DemoPass!01', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email"}'::jsonb, '{}'::jsonb),
  ('11111111-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'linh@demo.paave.app', crypt('DemoPass!01', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email"}'::jsonb, '{}'::jsonb),
  ('11111111-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'khanh@demo.paave.app', crypt('DemoPass!01', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email"}'::jsonb, '{}'::jsonb),
  ('11111111-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'tu@demo.paave.app', crypt('DemoPass!01', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email"}'::jsonb, '{}'::jsonb),
  ('11111111-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'jiwoo@demo.paave.app', crypt('DemoPass!01', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email"}'::jsonb, '{}'::jsonb),
  ('11111111-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'minji@demo.paave.app', crypt('DemoPass!01', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email"}'::jsonb, '{}'::jsonb),
  ('11111111-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'seojin@demo.paave.app', crypt('DemoPass!01', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email"}'::jsonb, '{}'::jsonb),
  ('11111111-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'anh@demo.paave.app', crypt('DemoPass!01', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email"}'::jsonb, '{}'::jsonb),
  ('11111111-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'huy@demo.paave.app', crypt('DemoPass!01', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email"}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;

-- ============================================================================
-- 1) PROFILES
-- ============================================================================
insert into public.profiles (
  id, registered_username, username, email, full_name, bio,
  avatar_url, date_of_birth, age_gate_tier, preferred_language, market_preference,
  account_status, email_verified, terms_accepted_at, privacy_accepted_at,
  investment_disclaimer_accepted_at
) values
  ('11111111-0000-0000-0000-000000000001', 'lauren_admin', 'lauren',
   'loan.nguyen@difisoft.com', 'Lauren Nguyen', 'Paave admin. Building the app for Gen Z.',
   'https://i.pravatar.cc/150?img=47', '1990-06-14', 'FULL_ACCESS', 'en', 'BOTH',
   'ACTIVE', true, now(), now(), now()),
  ('11111111-0000-0000-0000-000000000002', 'minh_tran', 'minh',
   'minh@demo.paave.app', 'Minh Tran', 'HOSE watcher. Long VCB. DCA since 2023.',
   'https://i.pravatar.cc/150?img=12', '2002-03-22', 'FULL_ACCESS', 'vi', 'VN',
   'ACTIVE', true, now(), now(), now()),
  ('11111111-0000-0000-0000-000000000003', 'linh_pham', 'linhp',
   'linh@demo.paave.app', 'Linh Phạm', 'Học hỏi mỗi ngày 📈',
   'https://i.pravatar.cc/150?img=23', '2005-08-11', 'LEARN_MODE', 'vi', 'VN',
   'ACTIVE', true, now(), now(), now()),
  ('11111111-0000-0000-0000-000000000004', 'khanh_le', 'khanh',
   'khanh@demo.paave.app', 'Khánh Lê', 'Value investor in training.',
   'https://i.pravatar.cc/150?img=34', '2000-11-03', 'FULL_ACCESS', 'vi', 'VN',
   'ACTIVE', true, now(), now(), now()),
  ('11111111-0000-0000-0000-000000000005', 'tu_nguyen', 'tu',
   'tu@demo.paave.app', 'Tú Nguyễn', 'ETF + index only. Boring = winning.',
   'https://i.pravatar.cc/150?img=45', '1998-02-18', 'FULL_ACCESS', 'vi', 'VN',
   'ACTIVE', true, now(), now(), now()),
  ('11111111-0000-0000-0000-000000000006', 'park_jiwoo', 'jiwoo',
   'jiwoo@demo.paave.app', 'Park Ji-woo', '반도체 애호가. 삼성전자 장기보유.',
   'https://i.pravatar.cc/150?img=56', '2001-07-09', 'FULL_ACCESS', 'ko', 'KR',
   'ACTIVE', true, now(), now(), now()),
  ('11111111-0000-0000-0000-000000000007', 'kim_minji', 'minji',
   'minji@demo.paave.app', 'Kim Min-ji', 'K-뷰티 & K-콘텐츠 종목 추적 중',
   'https://i.pravatar.cc/150?img=48', '2003-12-24', 'LEARN_MODE', 'ko', 'KR',
   'ACTIVE', true, now(), now(), now()),
  ('11111111-0000-0000-0000-000000000008', 'lee_seojin', 'seojin',
   'seojin@demo.paave.app', 'Lee Seo-jin', 'Battery + EV supply chain.',
   'https://i.pravatar.cc/150?img=57', '1999-04-30', 'FULL_ACCESS', 'ko', 'KR',
   'ACTIVE', true, now(), now(), now()),
  ('11111111-0000-0000-0000-000000000009', 'anh_vu', 'anhv',
   'anh@demo.paave.app', 'Anh Vũ', 'Swing trader. Cutting my losses weekly 😅',
   'https://i.pravatar.cc/150?img=15', '2004-09-17', 'LEARN_MODE', 'vi', 'VN',
   'ACTIVE', true, now(), now(), now()),
  ('11111111-0000-0000-0000-00000000000a', 'huy_do', 'huyd',
   'huy@demo.paave.app', 'Huy Đỗ', 'Banking + real estate.',
   'https://i.pravatar.cc/150?img=68', '1996-01-05', 'FULL_ACCESS', 'vi', 'VN',
   'ACTIVE', true, now(), now(), now())
on conflict (id) do nothing;

-- ============================================================================
-- 2) SYMBOLS  (50: 30 HOSE + 10 HNX + 10 KRX)
-- ============================================================================
insert into public.symbols (code, name, exchange, symbol_type, industry, sector, currency, listed_at, is_active) values
  -- HOSE blue chips
  ('VCB', 'Vietcombank', 'HOSE', 'STOCK', 'Banking', 'Financials', 'VND', '2009-06-30', true),
  ('BID', 'BIDV', 'HOSE', 'STOCK', 'Banking', 'Financials', 'VND', '2014-01-24', true),
  ('CTG', 'VietinBank', 'HOSE', 'STOCK', 'Banking', 'Financials', 'VND', '2009-07-16', true),
  ('TCB', 'Techcombank', 'HOSE', 'STOCK', 'Banking', 'Financials', 'VND', '2018-06-04', true),
  ('MBB', 'Military Bank', 'HOSE', 'STOCK', 'Banking', 'Financials', 'VND', '2011-11-01', true),
  ('VPB', 'VPBank', 'HOSE', 'STOCK', 'Banking', 'Financials', 'VND', '2017-08-17', true),
  ('ACB', 'Asia Commercial Bank', 'HOSE', 'STOCK', 'Banking', 'Financials', 'VND', '2020-12-09', true),
  ('VNM', 'Vinamilk', 'HOSE', 'STOCK', 'Dairy', 'Consumer Staples', 'VND', '2006-01-19', true),
  ('MSN', 'Masan Group', 'HOSE', 'STOCK', 'Conglomerate', 'Consumer Staples', 'VND', '2009-11-05', true),
  ('SAB', 'Sabeco', 'HOSE', 'STOCK', 'Beverages', 'Consumer Staples', 'VND', '2016-12-06', true),
  ('VHM', 'Vinhomes', 'HOSE', 'STOCK', 'Real Estate', 'Real Estate', 'VND', '2018-05-17', true),
  ('VIC', 'Vingroup', 'HOSE', 'STOCK', 'Conglomerate', 'Real Estate', 'VND', '2007-09-19', true),
  ('VRE', 'Vincom Retail', 'HOSE', 'STOCK', 'Retail RE', 'Real Estate', 'VND', '2017-11-06', true),
  ('NVL', 'Novaland', 'HOSE', 'STOCK', 'Real Estate', 'Real Estate', 'VND', '2016-12-28', true),
  ('KDH', 'Khang Dien House', 'HOSE', 'STOCK', 'Real Estate', 'Real Estate', 'VND', '2009-12-21', true),
  ('FPT', 'FPT Corporation', 'HOSE', 'STOCK', 'IT Services', 'Technology', 'VND', '2006-12-13', true),
  ('CMG', 'CMC Corporation', 'HOSE', 'STOCK', 'IT Services', 'Technology', 'VND', '2010-01-21', true),
  ('HPG', 'Hoa Phat Group', 'HOSE', 'STOCK', 'Steel', 'Materials', 'VND', '2007-11-15', true),
  ('HSG', 'Hoa Sen Group', 'HOSE', 'STOCK', 'Steel', 'Materials', 'VND', '2008-12-05', true),
  ('GAS', 'PV Gas', 'HOSE', 'STOCK', 'Oil & Gas', 'Energy', 'VND', '2012-05-21', true),
  ('PLX', 'Petrolimex', 'HOSE', 'STOCK', 'Oil & Gas', 'Energy', 'VND', '2017-04-21', true),
  ('POW', 'PV Power', 'HOSE', 'STOCK', 'Utilities', 'Utilities', 'VND', '2019-01-14', true),
  ('MWG', 'Mobile World', 'HOSE', 'STOCK', 'Retail', 'Consumer Discretionary', 'VND', '2014-07-14', true),
  ('PNJ', 'PNJ Jewelry', 'HOSE', 'STOCK', 'Luxury', 'Consumer Discretionary', 'VND', '2009-03-23', true),
  ('DGW', 'Digiworld', 'HOSE', 'STOCK', 'Distribution', 'Technology', 'VND', '2015-08-03', true),
  ('STB', 'Sacombank', 'HOSE', 'STOCK', 'Banking', 'Financials', 'VND', '2006-07-12', true),
  ('SSI', 'SSI Securities', 'HOSE', 'STOCK', 'Securities', 'Financials', 'VND', '2007-10-29', true),
  ('VND', 'VNDIRECT', 'HOSE', 'STOCK', 'Securities', 'Financials', 'VND', '2010-03-30', true),
  ('HCM', 'HSC', 'HOSE', 'STOCK', 'Securities', 'Financials', 'VND', '2009-05-18', true),
  ('E1VFVN30', 'VFMVN30 ETF', 'HOSE', 'ETF', 'Index', 'ETF', 'VND', '2014-10-06', true),
  -- HNX
  ('SHB', 'Saigon-Hanoi Bank', 'HNX', 'STOCK', 'Banking', 'Financials', 'VND', '2009-04-20', true),
  ('PVS', 'PTSC', 'HNX', 'STOCK', 'Oil Services', 'Energy', 'VND', '2007-09-20', true),
  ('CEO', 'CEO Group', 'HNX', 'STOCK', 'Real Estate', 'Real Estate', 'VND', '2014-12-25', true),
  ('PVI', 'PVI Holdings', 'HNX', 'STOCK', 'Insurance', 'Financials', 'VND', '2007-08-10', true),
  ('IDC', 'IDICO', 'HNX', 'STOCK', 'Industrial Park', 'Industrials', 'VND', '2017-11-27', true),
  ('TNG', 'TNG Investment', 'HNX', 'STOCK', 'Apparel', 'Consumer Discretionary', 'VND', '2007-11-22', true),
  ('MBS', 'MB Securities', 'HNX', 'STOCK', 'Securities', 'Financials', 'VND', '2010-12-14', true),
  ('CII', 'CII Infrastructure', 'HNX', 'STOCK', 'Infrastructure', 'Industrials', 'VND', '2006-05-12', true),
  ('LAS', 'Lam Thao Fertilizer', 'HNX', 'STOCK', 'Chemicals', 'Materials', 'VND', '2012-03-01', true),
  ('VGS', 'Vietnam Germany Steel', 'HNX', 'STOCK', 'Steel', 'Materials', 'VND', '2009-12-08', true),
  -- KRX (KOSPI + KOSDAQ) — Korean codes are 6-digit
  ('005930', 'Samsung Electronics', 'KOSPI', 'STOCK', 'Semiconductors', 'Technology', 'KRW', '1975-06-11', true),
  ('000660', 'SK Hynix', 'KOSPI', 'STOCK', 'Semiconductors', 'Technology', 'KRW', '1996-12-26', true),
  ('207940', 'Samsung Biologics', 'KOSPI', 'STOCK', 'Biotech', 'Health Care', 'KRW', '2016-11-10', true),
  ('373220', 'LG Energy Solution', 'KOSPI', 'STOCK', 'Batteries', 'Industrials', 'KRW', '2022-01-27', true),
  ('005380', 'Hyundai Motor', 'KOSPI', 'STOCK', 'Auto', 'Consumer Discretionary', 'KRW', '1974-06-28', true),
  ('051910', 'LG Chem', 'KOSPI', 'STOCK', 'Chemicals', 'Materials', 'KRW', '1979-02-01', true),
  ('035420', 'NAVER', 'KOSPI', 'STOCK', 'Internet', 'Communication Services', 'KRW', '2002-10-29', true),
  ('035720', 'Kakao', 'KOSPI', 'STOCK', 'Internet', 'Communication Services', 'KRW', '2017-07-10', true),
  ('352820', 'HYBE', 'KOSPI', 'STOCK', 'Entertainment', 'Communication Services', 'KRW', '2020-10-15', true),
  ('293490', 'Kakao Games', 'KOSDAQ', 'STOCK', 'Gaming', 'Communication Services', 'KRW', '2020-09-10', true)
on conflict (code) do nothing;

-- ============================================================================
-- 3) INDICES + DAY BARS
-- ============================================================================
insert into public.indices (code, name, exchange) values
  ('VNINDEX', 'VN-Index', 'HOSE'),
  ('VN30',    'VN30 Index', 'HOSE'),
  ('HNXINDEX','HNX-Index', 'HNX'),
  ('KOSPI',   'KOSPI Composite', 'KOSPI')
on conflict (code) do nothing;

insert into public.index_daily (index_code, trade_date, close, pct_change) values
  ('VNINDEX', current_date - 4, 1248.50, -0.42),
  ('VNINDEX', current_date - 3, 1253.10,  0.37),
  ('VNINDEX', current_date - 2, 1261.80,  0.69),
  ('VNINDEX', current_date - 1, 1267.20,  0.43),
  ('KOSPI',   current_date - 4, 2702.15, -0.18),
  ('KOSPI',   current_date - 3, 2711.40,  0.34),
  ('KOSPI',   current_date - 2, 2720.85,  0.35),
  ('KOSPI',   current_date - 1, 2733.62,  0.47)
on conflict do nothing;

-- ============================================================================
-- 4) LATEST QUOTES + DAY BARS for a subset (VCB, FPT, HPG, VNM, HYBE)
-- ============================================================================
insert into public.symbol_quotes_latest (symbol_code, ref_price, ceiling_price, floor_price,
  open_price, high_price, low_price, last_price, last_volume, total_volume, total_value,
  pct_change, session, quote_time)
values
  ('VCB',  92500, 98975, 86025,  92600, 93800, 92100, 93200, 1500, 2850000, 264000000000, 0.76, 'CONT', now() - interval '5 minutes'),
  ('FPT',  131500, 140700, 122300, 131800, 133500, 130900, 132800, 900, 1420000, 188000000000, 0.99, 'CONT', now() - interval '5 minutes'),
  ('HPG',  28650, 30655, 26645, 28700, 29050, 28500, 28900, 5200, 12800000, 369000000000, 0.87, 'CONT', now() - interval '5 minutes'),
  ('VNM',  66100, 70727, 61473, 66200, 66800, 65900, 66500, 1100, 1850000, 123000000000, 0.60, 'CONT', now() - interval '5 minutes'),
  ('MWG',  62300, 66661, 57939, 62400, 63500, 62100, 63200, 800, 1650000, 104000000000, 1.44, 'CONT', now() - interval '5 minutes'),
  ('005930', 78500, null, null, 78300, 78900, 77800, 78700, 450, 9500000, 746000000000, 0.77, 'CONT', now() - interval '5 minutes'),
  ('352820', 230500, null, null, 230000, 232500, 228500, 231000, 120, 180000, 41580000000, 0.87, 'CONT', now() - interval '5 minutes')
on conflict (symbol_code) do update set
  last_price = excluded.last_price,
  pct_change = excluded.pct_change,
  quote_time = excluded.quote_time,
  updated_at = now();

insert into public.symbol_day_bars (symbol_code, trade_date, open, high, low, close, volume, value) values
  ('VCB', current_date - 4, 91800, 92400, 91500, 92100, 2200000, 203000000000),
  ('VCB', current_date - 3, 92100, 92900, 91900, 92500, 2650000, 245000000000),
  ('VCB', current_date - 2, 92500, 93100, 92300, 92900, 2720000, 253000000000),
  ('VCB', current_date - 1, 92900, 93500, 92600, 93200, 2850000, 264000000000),
  ('FPT', current_date - 4, 129800, 131000, 129300, 130500, 1100000, 143000000000),
  ('FPT', current_date - 3, 130500, 132000, 130200, 131500, 1280000, 168000000000),
  ('FPT', current_date - 2, 131500, 132800, 131100, 132200, 1350000, 178000000000),
  ('FPT', current_date - 1, 132200, 133500, 131800, 132800, 1420000, 188000000000),
  ('HPG', current_date - 4, 28200, 28500, 28100, 28400, 10500000, 298000000000),
  ('HPG', current_date - 3, 28400, 28800, 28300, 28600, 11800000, 337000000000),
  ('HPG', current_date - 2, 28600, 29000, 28500, 28800, 12200000, 351000000000),
  ('HPG', current_date - 1, 28800, 29100, 28700, 28900, 12800000, 369000000000)
on conflict (symbol_code, trade_date) do nothing;

-- ============================================================================
-- 5) MARKET SESSION + HOLIDAYS
-- ============================================================================
insert into public.market_session_status (exchange, session) values
  ('HOSE',  'CONT'),
  ('HNX',   'CONT'),
  ('UPCOM', 'CONT'),
  ('KOSPI', 'CONT'),
  ('KOSDAQ','CONT')
on conflict (exchange) do update set session = excluded.session, updated_at = now();

insert into public.app_holidays (holiday_date, exchange, name) values
  ('2026-04-30', 'HOSE', 'Reunification Day'),
  ('2026-04-30', 'HNX',  'Reunification Day'),
  ('2026-05-01', 'HOSE', 'Labor Day'),
  ('2026-05-01', 'HNX',  'Labor Day'),
  ('2026-05-05', 'KOSPI','Children''s Day'),
  ('2026-05-25', 'KOSPI','Buddha''s Birthday')
on conflict (holiday_date, exchange) do nothing;

-- ============================================================================
-- 6) APP SERVICES + FEATURE FLAGS
-- ============================================================================
insert into public.app_services (name, status) values
  ('market-data', 'UP'),
  ('paper-trading','UP'),
  ('news-feed', 'UP'),
  ('social-feed','UP'),
  ('ai-coaching','DEGRADED')
on conflict (name) do update set status = excluded.status, updated_at = now();

insert into public.feature_flags (key, description, value, environment) values
  ('social.cashtag_autolink', 'Auto-parse $TICKER cashtags in posts', 'true'::jsonb, 'prod'),
  ('virtual.contest_copy_trade', 'Enable COPY_SIGNAL mode in contests', 'false'::jsonb, 'prod'),
  ('ai.post_trade_explainer', 'Show AI post-trade explanations', 'true'::jsonb, 'prod'),
  ('onboarding.age_gate_strict', 'Hard-block under-13 users globally', 'true'::jsonb, 'prod')
on conflict (key) do nothing;

-- ============================================================================
-- 7) SOCIAL — follows, posts, cashtags, likes, replies
-- ============================================================================
-- Follow graph: Lauren follows all; Minh ↔ Khanh; Jiwoo ↔ Minji; etc.
insert into public.user_follows (follower_id, followed_id) values
  ('11111111-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002'),
  ('11111111-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000003'),
  ('11111111-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000004'),
  ('11111111-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000006'),
  ('11111111-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000004'),
  ('11111111-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000002'),
  ('11111111-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000007'),
  ('11111111-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000006'),
  ('11111111-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000002'),
  ('11111111-0000-0000-0000-000000000009','11111111-0000-0000-0000-00000000000a')
on conflict do nothing;

-- 30 posts with cashtags
insert into public.posts (id, author_id, content, sentiment, language, created_at) values
  (1001,'11111111-0000-0000-0000-000000000002','$VCB breaking out of the 92–93 range on volume. Q1 earnings next week.','BULLISH','vi', now() - interval '2 hours'),
  (1002,'11111111-0000-0000-0000-000000000002','Banking sector as a whole looking strong. $BID $CTG $TCB all green today.','BULLISH','vi', now() - interval '3 hours'),
  (1003,'11111111-0000-0000-0000-000000000003','Paper-trading mới được 2 tuần, đã học được bài "không FOMO vào đỉnh" với $VIC 😅','NEUTRAL','vi', now() - interval '1 day'),
  (1004,'11111111-0000-0000-0000-000000000004','$FPT valuation is getting stretched but tech services narrative still intact. Trimming 20%.','BEARISH','en', now() - interval '5 hours'),
  (1005,'11111111-0000-0000-0000-000000000004','Added $VNM on the dip. 66k feels like a floor for a dividend name.','BULLISH','en', now() - interval '8 hours'),
  (1006,'11111111-0000-0000-0000-000000000005','Boring but effective: $E1VFVN30 + $VCB + $FPT. Not financial advice.','NEUTRAL','en', now() - interval '4 hours'),
  (1007,'11111111-0000-0000-0000-000000000006','$005930 삼성전자 오늘 돌파 시도 중. HBM 수요 좋음.','BULLISH','ko', now() - interval '6 hours'),
  (1008,'11111111-0000-0000-0000-000000000006','$000660 하이닉스 따라서 강한 흐름. 반도체 슈퍼사이클 믿는 사람 손 ✋','BULLISH','ko', now() - interval '7 hours'),
  (1009,'11111111-0000-0000-0000-000000000007','$352820 HYBE 뉴진스 이슈 계속 지켜봐야…','NEUTRAL','ko', now() - interval '10 hours'),
  (1010,'11111111-0000-0000-0000-000000000008','$373220 배터리 섹터는 과매도 국면. 조금씩 분할 매수.','BULLISH','ko', now() - interval '1 day'),
  (1011,'11111111-0000-0000-0000-000000000009','Loss number 4 this week on $HPG. Going to take a break.','BEARISH','en', now() - interval '12 hours'),
  (1012,'11111111-0000-0000-0000-00000000000a','$VHM $VRE recovering from Q1 weakness. Watching for confirmation.','NEUTRAL','en', now() - interval '5 hours'),
  (1013,'11111111-0000-0000-0000-000000000001','Welcome to Paave! Paper trade your ideas, share them, learn. No real money — yet.','NEUTRAL','en', now() - interval '30 days'),
  (1014,'11111111-0000-0000-0000-000000000002','Dividend season approaching. $VNM $GAS $PLX yields looking attractive.','BULLISH','vi', now() - interval '2 days'),
  (1015,'11111111-0000-0000-0000-000000000004','Banks trading above book value for first time in 18 months. $VCB $TCB','BULLISH','en', now() - interval '3 days'),
  (1016,'11111111-0000-0000-0000-000000000003','Đọc báo cáo của SSI về $FPT xong muốn mua luôn 😆','BULLISH','vi', now() - interval '1 day'),
  (1017,'11111111-0000-0000-0000-000000000005','VN market cap-to-GDP at 68%. Fair value territory. No need to rush.','NEUTRAL','en', now() - interval '4 days'),
  (1018,'11111111-0000-0000-0000-000000000006','KOSPI 2730 저항선 돌파가 관건. $005930 거래량 동반 중요.','NEUTRAL','ko', now() - interval '12 hours'),
  (1019,'11111111-0000-0000-0000-000000000007','$035720 카카오 저점 다진거 같은데… 아직 조심해야.','NEUTRAL','ko', now() - interval '1 day'),
  (1020,'11111111-0000-0000-0000-000000000008','$051910 LG화학 실적 발표 전 숨고르기. 기대치 낮춰서 보자.','NEUTRAL','ko', now() - interval '2 days'),
  (1021,'11111111-0000-0000-0000-000000000002','Volume chú ý: $SSI $VND $HCM đều tăng mạnh. Securities sector đang "thức dậy".','BULLISH','vi', now() - interval '1 day'),
  (1022,'11111111-0000-0000-0000-000000000004','Cut $NVL. Real estate still has legs but not this name.','BEARISH','en', now() - interval '2 days'),
  (1023,'11111111-0000-0000-0000-000000000009','$MBB test of 200-day. Either bounces or breaks — easy trade setup.','NEUTRAL','en', now() - interval '1 day'),
  (1024,'11111111-0000-0000-0000-00000000000a','$MWG retail recovery thesis playing out. Long since March.','BULLISH','en', now() - interval '3 days'),
  (1025,'11111111-0000-0000-0000-000000000005','Contest leaderboard this month is wild. Some folks up 14% in paper 👀','NEUTRAL','en', now() - interval '6 hours'),
  (1026,'11111111-0000-0000-0000-000000000006','$293490 카카오게임즈 신작 기대감. 아직은 관망.','NEUTRAL','ko', now() - interval '4 days'),
  (1027,'11111111-0000-0000-0000-000000000007','$207940 삼바 Q1 괜찮았음. 길게 들고 갈 종목.','BULLISH','ko', now() - interval '5 days'),
  (1028,'11111111-0000-0000-0000-000000000003','Mình mới biết $GAS chia cổ tức 30%. F0 có nên mua không?','NEUTRAL','vi', now() - interval '6 hours'),
  (1029,'11111111-0000-0000-0000-000000000001','Reminder: Paave is paper-trading only. No real money flows. Learn, don''t burn.','NEUTRAL','en', now() - interval '7 days'),
  (1030,'11111111-0000-0000-0000-000000000002','ETF primer cho bạn mới: $E1VFVN30 track VN30 index. Low fee. Safer hơn pick từng stock.','NEUTRAL','vi', now() - interval '2 days')
on conflict (id) do nothing;
select setval(pg_get_serial_sequence('public.posts', 'id'), 1100);

-- Cashtags (what the API's auto-parser would extract from post content)
insert into public.post_cashtags (post_id, symbol_code) values
  (1001,'VCB'),(1002,'BID'),(1002,'CTG'),(1002,'TCB'),(1003,'VIC'),
  (1004,'FPT'),(1005,'VNM'),(1006,'E1VFVN30'),(1006,'VCB'),(1006,'FPT'),
  (1007,'005930'),(1008,'000660'),(1009,'352820'),(1010,'373220'),(1011,'HPG'),
  (1012,'VHM'),(1012,'VRE'),(1014,'VNM'),(1014,'GAS'),(1014,'PLX'),
  (1015,'VCB'),(1015,'TCB'),(1016,'FPT'),(1018,'005930'),(1019,'035720'),
  (1020,'051910'),(1021,'SSI'),(1021,'VND'),(1021,'HCM'),(1022,'NVL'),
  (1023,'MBB'),(1024,'MWG'),(1026,'293490'),(1027,'207940'),(1028,'GAS'),
  (1030,'E1VFVN30')
on conflict do nothing;

-- Likes (spread across users)
insert into public.post_likes (post_id, user_id) values
  (1001,'11111111-0000-0000-0000-000000000004'),(1001,'11111111-0000-0000-0000-00000000000a'),(1001,'11111111-0000-0000-0000-000000000001'),
  (1002,'11111111-0000-0000-0000-000000000004'),(1004,'11111111-0000-0000-0000-000000000002'),(1005,'11111111-0000-0000-0000-000000000001'),
  (1007,'11111111-0000-0000-0000-000000000008'),(1007,'11111111-0000-0000-0000-000000000007'),(1008,'11111111-0000-0000-0000-000000000007'),
  (1013,'11111111-0000-0000-0000-000000000002'),(1013,'11111111-0000-0000-0000-000000000003'),(1013,'11111111-0000-0000-0000-000000000004'),
  (1013,'11111111-0000-0000-0000-000000000005'),(1029,'11111111-0000-0000-0000-000000000002'),(1029,'11111111-0000-0000-0000-000000000006')
on conflict do nothing;

-- Replies (parent_id set)
insert into public.posts (id, author_id, content, sentiment, language, parent_id, created_at) values
  (1101,'11111111-0000-0000-0000-000000000004', 'Agreed. Looking at $VCB weekly chart, clean setup.', 'BULLISH','en',1001, now() - interval '100 minutes'),
  (1102,'11111111-0000-0000-0000-00000000000a','What''s the stop? Below 92?','NEUTRAL','en',1001, now() - interval '90 minutes'),
  (1103,'11111111-0000-0000-0000-000000000003','Anh ơi em mới học, tại sao lại cắt lỗ $NVL vậy?','NEUTRAL','vi',1022, now() - interval '1 day')
on conflict (id) do nothing;

-- ============================================================================
-- 8) INSIGHTS — watchlists, notifications
-- ============================================================================
insert into public.watchlists (id, user_id, name, sequence) values
  (501,'11111111-0000-0000-0000-000000000002','Banks VN', 0),
  (502,'11111111-0000-0000-0000-000000000002','Tech VN',  1),
  (503,'11111111-0000-0000-0000-000000000004','Dividend plays', 0),
  (504,'11111111-0000-0000-0000-000000000006','Korea semis', 0),
  (505,'11111111-0000-0000-0000-000000000007','K-Culture', 0)
on conflict (id) do nothing;
select setval(pg_get_serial_sequence('public.watchlists','id'), 600);

insert into public.watchlist_symbols (watchlist_id, symbol_code) values
  (501,'VCB'),(501,'BID'),(501,'CTG'),(501,'TCB'),(501,'MBB'),(501,'ACB'),
  (502,'FPT'),(502,'CMG'),(502,'DGW'),
  (503,'VNM'),(503,'GAS'),(503,'PLX'),(503,'PNJ'),
  (504,'005930'),(504,'000660'),(504,'373220'),
  (505,'352820'),(505,'035720'),(505,'035420')
on conflict do nothing;

insert into public.notifications (user_id, category, channel, title, body, data) values
  ('11111111-0000-0000-0000-000000000002','PRICE_ALERT','IN_APP','$VCB crossed 93,000',
   '$VCB is up 0.76% today and crossed your alert level of 93,000 VND.',
   '{"symbol":"VCB","threshold":93000}'::jsonb),
  ('11111111-0000-0000-0000-000000000004','PORTFOLIO_HEALTH','IN_APP','Your paper portfolio is concentrated',
   '82% of your portfolio is in banking. Consider diversifying.',
   '{"sector":"Financials","concentration":0.82}'::jsonb),
  ('11111111-0000-0000-0000-000000000003','LEARNING','IN_APP','Daily challenge: P/E ratios',
   'Learn how P/E ratios work — earn 50 XP.',
   '{"challenge":"pe_ratio_101","xp":50}'::jsonb),
  ('11111111-0000-0000-0000-000000000006','SOCIAL_FOLLOW','IN_APP','Kim Min-ji started following you',
   'Kim Min-ji (minji) is now following you.',
   '{"follower_id":"11111111-0000-0000-0000-000000000007"}'::jsonb);

-- ============================================================================
-- 9) VIRTUAL TRADING — 3 sub-accounts w/ portfolios, orders, trades, holdings
-- ============================================================================
insert into public.virtual_sub_accounts (id, user_id, label, currency, starting_balance, cash_balance) values
  ('PAAVE-VS-0000001','11111111-0000-0000-0000-000000000002','Main', 'VND', 500000000, 128400000),
  ('PAAVE-VS-0000002','11111111-0000-0000-0000-000000000004','Main', 'VND', 500000000, 210750000),
  ('PAAVE-VS-0000003','11111111-0000-0000-0000-000000000006','Main', 'KRW', 100000000, 42800000)
on conflict (id) do nothing;

insert into public.virtual_portfolios (id, sub_account_id, name, quota) values
  (701,'PAAVE-VS-0000001','Banks stack', 200000000),
  (702,'PAAVE-VS-0000001','Tech stack',  150000000),
  (703,'PAAVE-VS-0000002','Dividend core',250000000),
  (704,'PAAVE-VS-0000003','Chips', 55000000)
on conflict (id) do nothing;
select setval(pg_get_serial_sequence('public.virtual_portfolios','id'), 800);

-- Orders — realistic mix of filled + pending
insert into public.virtual_orders (id, sub_account_id, portfolio_id, symbol_code, exchange,
  side, order_type, price, quantity, filled_quantity, avg_fill_price, status, placed_at, matched_at)
values
  (9001,'PAAVE-VS-0000001',701,'VCB','HOSE','BUY', 'LO', 90500, 2000, 2000, 90500, 'FILLED', now() - interval '20 days', now() - interval '20 days'),
  (9002,'PAAVE-VS-0000001',701,'TCB','HOSE','BUY', 'LO', 23800, 3000, 3000, 23800, 'FILLED', now() - interval '18 days', now() - interval '18 days'),
  (9003,'PAAVE-VS-0000001',702,'FPT','HOSE','BUY', 'LO', 128500, 500, 500, 128500, 'FILLED', now() - interval '15 days', now() - interval '15 days'),
  (9004,'PAAVE-VS-0000001',702,'FPT','HOSE','SELL','LO', 132000, 200, 200, 132000, 'FILLED', now() - interval '2 days',  now() - interval '2 days'),
  (9005,'PAAVE-VS-0000001',701,'MBB','HOSE','BUY', 'LO', 21500, 2000, 0, null, 'PENDING', now() - interval '30 minutes', null),
  (9006,'PAAVE-VS-0000002',703,'VNM','HOSE','BUY', 'LO', 65800, 2000, 2000, 65800, 'FILLED', now() - interval '25 days', now() - interval '25 days'),
  (9007,'PAAVE-VS-0000002',703,'GAS','HOSE','BUY', 'LO', 72500, 1500, 1500, 72500, 'FILLED', now() - interval '22 days', now() - interval '22 days'),
  (9008,'PAAVE-VS-0000002',703,'PLX','HOSE','BUY', 'LO', 38200, 2000, 2000, 38200, 'FILLED', now() - interval '20 days', now() - interval '20 days'),
  (9009,'PAAVE-VS-0000003',704,'005930','KOSPI','BUY','LO', 76800, 300, 300, 76800, 'FILLED', now() - interval '14 days', now() - interval '14 days'),
  (9010,'PAAVE-VS-0000003',704,'000660','KOSPI','BUY','LO', 168500, 100, 100, 168500, 'FILLED', now() - interval '10 days', now() - interval '10 days'),
  (9011,'PAAVE-VS-0000003',704,'005930','KOSPI','SELL','LO', 78500, 100, 100, 78500, 'FILLED', now() - interval '1 day',  now() - interval '1 day')
on conflict (id) do nothing;
select setval(pg_get_serial_sequence('public.virtual_orders','id'), 10000);

insert into public.virtual_trades (id, order_id, sub_account_id, symbol_code, side, quantity, price, fees, tax, executed_at) values
  (5001,9001,'PAAVE-VS-0000001','VCB','BUY',   2000, 90500,  271500, 0,         now() - interval '20 days'),
  (5002,9002,'PAAVE-VS-0000001','TCB','BUY',   3000, 23800,  107100, 0,         now() - interval '18 days'),
  (5003,9003,'PAAVE-VS-0000001','FPT','BUY',    500,128500,   96375, 0,         now() - interval '15 days'),
  (5004,9004,'PAAVE-VS-0000001','FPT','SELL',   200,132000,   39600, 26400,     now() - interval '2 days'),
  (5005,9006,'PAAVE-VS-0000002','VNM','BUY',   2000, 65800,  197400, 0,         now() - interval '25 days'),
  (5006,9007,'PAAVE-VS-0000002','GAS','BUY',   1500, 72500,  163125, 0,         now() - interval '22 days'),
  (5007,9008,'PAAVE-VS-0000002','PLX','BUY',   2000, 38200,  114600, 0,         now() - interval '20 days'),
  (5008,9009,'PAAVE-VS-0000003','005930','BUY', 300, 76800,       0, 0,         now() - interval '14 days'),
  (5009,9010,'PAAVE-VS-0000003','000660','BUY', 100,168500,       0, 0,         now() - interval '10 days'),
  (5010,9011,'PAAVE-VS-0000003','005930','SELL',100, 78500,       0, 23550,     now() - interval '1 day')
on conflict (id) do nothing;
select setval(pg_get_serial_sequence('public.virtual_trades','id'), 6000);

insert into public.virtual_holdings (sub_account_id, symbol_code, quantity, avg_cost, realized_pl) values
  ('PAAVE-VS-0000001','VCB', 2000,  90500,        0),
  ('PAAVE-VS-0000001','TCB', 3000,  23800,        0),
  ('PAAVE-VS-0000001','FPT',  300, 128500,   636600),     -- 200 sold @ 132000 from 128500
  ('PAAVE-VS-0000002','VNM', 2000,  65800,        0),
  ('PAAVE-VS-0000002','GAS', 1500,  72500,        0),
  ('PAAVE-VS-0000002','PLX', 2000,  38200,        0),
  ('PAAVE-VS-0000003','005930', 200, 76800,   146450),    -- 100 sold @ 78500 minus tax
  ('PAAVE-VS-0000003','000660', 100,168500,        0)
on conflict (sub_account_id, symbol_code) do nothing;

-- Daily P&L: last 7 days for each sub-account
insert into public.virtual_pl_daily (sub_account_id, trade_date, cash_balance, holdings_value, total_equity, realized_pl, unrealized_pl, normalized_nav) values
  ('PAAVE-VS-0000001', current_date - 6, 130000000, 384000000, 514000000, 0,       14000000, 1.028),
  ('PAAVE-VS-0000001', current_date - 5, 130000000, 386500000, 516500000, 0,       16500000, 1.033),
  ('PAAVE-VS-0000001', current_date - 4, 130000000, 390200000, 520200000, 0,       20200000, 1.040),
  ('PAAVE-VS-0000001', current_date - 3, 130000000, 392800000, 522800000, 0,       22800000, 1.046),
  ('PAAVE-VS-0000001', current_date - 2, 130000000, 394500000, 524500000, 0,       24500000, 1.049),
  ('PAAVE-VS-0000001', current_date - 1, 128400000, 398600000, 527000000, 636600,  26363400, 1.054),
  ('PAAVE-VS-0000002', current_date - 6, 210750000, 289400000, 500150000, 0,         150000, 1.000),
  ('PAAVE-VS-0000002', current_date - 5, 210750000, 289800000, 500550000, 0,         550000, 1.001),
  ('PAAVE-VS-0000002', current_date - 4, 210750000, 290900000, 501650000, 0,        1650000, 1.003),
  ('PAAVE-VS-0000002', current_date - 3, 210750000, 291400000, 502150000, 0,        2150000, 1.004),
  ('PAAVE-VS-0000002', current_date - 2, 210750000, 292100000, 502850000, 0,        2850000, 1.006),
  ('PAAVE-VS-0000002', current_date - 1, 210750000, 293600000, 504350000, 0,        4350000, 1.009),
  ('PAAVE-VS-0000003', current_date - 6,  42800000,  39200000,  82000000, 0,        -500000, 0.820),
  ('PAAVE-VS-0000003', current_date - 5,  42800000,  39500000,  82300000, 0,        -200000, 0.823),
  ('PAAVE-VS-0000003', current_date - 4,  42800000,  40100000,  82900000, 0,         400000, 0.829),
  ('PAAVE-VS-0000003', current_date - 3,  42800000,  40800000,  83600000, 0,        1100000, 0.836),
  ('PAAVE-VS-0000003', current_date - 2,  42800000,  41200000,  84000000, 0,        1500000, 0.840),
  ('PAAVE-VS-0000003', current_date - 1,  42800000,  41740000,  84540000, 146450,   1893550, 0.845)
on conflict (sub_account_id, trade_date) do nothing;

-- virtual follows (copy/observe)
insert into public.virtual_follows (follower_user_id, followed_user_id, followed_sub_account_id, copy_mode) values
  ('11111111-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000002','PAAVE-VS-0000001','OBSERVE'),
  ('11111111-0000-0000-0000-000000000009','11111111-0000-0000-0000-000000000004','PAAVE-VS-0000002','OBSERVE')
on conflict (follower_user_id, followed_user_id) do nothing;

-- Recommended accounts (editorial picks)
insert into public.virtual_recommended_accounts (user_id, rank, blurb, recommended_by) values
  ('11111111-0000-0000-0000-000000000002', 1, 'Disciplined bank rotation trader.', '11111111-0000-0000-0000-000000000001'),
  ('11111111-0000-0000-0000-000000000004', 2, 'Clear thesis, clean exits.',         '11111111-0000-0000-0000-000000000001'),
  ('11111111-0000-0000-0000-000000000005', 3, 'ETF-first, boring-wins style.',      '11111111-0000-0000-0000-000000000001')
on conflict (user_id) do nothing;

-- Limited stocks (admin-blocked for paper trading)
insert into public.virtual_limited_stocks (symbol_code, reason, limited_by) values
  ('NVL', 'Under investigation — temporarily restricted for paper trading',
   '11111111-0000-0000-0000-000000000001')
on conflict (symbol_code) do nothing;

-- ============================================================================
-- 10) CONTEST  — one active, 3 participants, rankings
-- ============================================================================
insert into public.virtual_contests (id, name, description, status, rules, booking_starts_at, booking_ends_at,
  starts_at, ends_at, starting_balance, currency, max_participants) values
  (301, 'April 2026 Rookie Cup',
   '30-day paper-trading challenge for LEARN_MODE and new users. Top 10 win XP + badges.',
   'ACTIVE',
   '{"allowed_exchanges":["HOSE","HNX"],"excluded_symbols":["NVL"],"max_leverage":1,"starting_balance":500000000}'::jsonb,
   now() - interval '45 days', now() - interval '15 days',
   now() - interval '14 days', now() + interval '16 days',
   500000000, 'VND', 500)
on conflict (id) do nothing;
select setval(pg_get_serial_sequence('public.virtual_contests','id'), 400);

insert into public.virtual_contest_registrations (contest_id, user_id, sub_account_id) values
  (301, '11111111-0000-0000-0000-000000000002', 'PAAVE-VS-0000001'),
  (301, '11111111-0000-0000-0000-000000000004', 'PAAVE-VS-0000002'),
  (301, '11111111-0000-0000-0000-000000000009', null)
on conflict do nothing;

insert into public.virtual_contest_rankings (contest_id, user_id, rank, score, roi_pct, snapshot_at) values
  (301, '11111111-0000-0000-0000-000000000002', 1, 527000000, 5.40, now()),
  (301, '11111111-0000-0000-0000-000000000004', 2, 504350000, 0.87, now()),
  (301, '11111111-0000-0000-0000-000000000009', 3, 488200000,-2.36, now())
on conflict do nothing;

-- ============================================================================
-- 11) NEWS  — a few items with cashtag arrays
-- ============================================================================
insert into public.news_items (id, source, title, body, url, symbols, tags, language, published_at) values
  (800001,'CafeF', 'VCB dẫn dắt thị trường, VN-Index vượt 1,267',
   'Cổ phiếu ngân hàng Vietcombank tăng 0.76% hôm nay, kéo chỉ số VN-Index vượt mốc 1,267 điểm.',
   'https://cafef.vn/vcb-dan-dat', array['VCB','VNINDEX'], array['market','banking'], 'vi', now() - interval '2 hours'),
  (800002,'Bloomberg', 'Samsung plans HBM capacity boost for 2026',
   'Samsung Electronics announced a 40% HBM capacity expansion targeting AI chip demand.',
   'https://bloomberg.com/samsung-hbm', array['005930','000660'], array['tech','semis','ai'], 'en', now() - interval '4 hours'),
  (800003,'Vietstock', 'FPT công bố lợi nhuận Q1 vượt 18%',
   'FPT ghi nhận lợi nhuận quý 1 tăng 18% so với cùng kỳ, nhờ mảng dịch vụ IT.',
   'https://vietstock.vn/fpt-q1-2026', array['FPT'], array['earnings','tech'], 'vi', now() - interval '6 hours'),
  (800004,'Chosun', '한국은행 기준금리 동결',
   '한국은행이 기준금리를 동결하며 경제 완만한 회복을 전망.',
   'https://chosun.com/bok-rate', array['KOSPI'], array['macro','korea'], 'ko', now() - interval '1 day')
on conflict (id) do nothing;

insert into public.news_favorites (user_id, news_id) values
  ('11111111-0000-0000-0000-000000000002', 800001),
  ('11111111-0000-0000-0000-000000000006', 800002),
  ('11111111-0000-0000-0000-000000000004', 800003)
on conflict do nothing;

-- ============================================================================
-- 12) SEARCH HISTORY
-- ============================================================================
insert into public.search_history (user_id, query, result_symbol) values
  ('11111111-0000-0000-0000-000000000003', 'VCB',    'VCB'),
  ('11111111-0000-0000-0000-000000000003', 'FPT',    'FPT'),
  ('11111111-0000-0000-0000-000000000003', 'vinamilk','VNM'),
  ('11111111-0000-0000-0000-000000000009', 'HPG',    'HPG'),
  ('11111111-0000-0000-0000-000000000006', 'samsung','005930');

insert into public.search_stats_top (symbol_code, window_days, view_count, rank) values
  ('VCB', 1, 1240, 1), ('FPT', 1, 980, 2), ('005930', 1, 910, 3), ('HPG', 1, 705, 4), ('VNM', 1, 688, 5),
  ('VCB', 7, 8820, 1), ('FPT', 7, 7540, 2), ('005930', 7, 6710, 3)
on conflict (symbol_code, window_days) do update set
  view_count = excluded.view_count, rank = excluded.rank, refreshed_at = now();

-- ============================================================================
-- done
-- ============================================================================
-- Summary:
--   select 'profiles' as t, count(*) from public.profiles union all
--   select 'symbols',       count(*) from public.symbols  union all
--   select 'posts',         count(*) from public.posts    union all
--   select 'virtual_orders',count(*) from public.virtual_orders union all
--   select 'virtual_trades',count(*) from public.virtual_trades;
