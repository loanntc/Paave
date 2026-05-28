-- ============================================================================
-- Paave | Migration 0007 — Row-Level Security policies
-- ============================================================================
-- Principles:
--  1. Every public.* table has RLS enabled. NO exceptions.
--  2. Own-row policy for user-private data (profiles, devices, watchlists,
--     orders, trades, holdings, notifications, search history, favorites).
--  3. Public-read for social content (posts), market cache, news, app metadata.
--  4. Admin-only for admin_* + feature flags + limited_stocks.
--  5. Service-role bypasses RLS automatically (used by ETL worker).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- HELPER: is_admin()  — uses a JWT claim. Set claim 'role'='admin' on the
-- user's Supabase JWT (via custom_access_token_hook or an admins table).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ============================================================================
-- 1) PROFILES & IDENTITY
-- ============================================================================
alter table public.profiles enable row level security;
create policy "profiles_select_authed" on public.profiles
  for select using (
    auth.uid() is not null
    and (id = auth.uid() or deleted_at is null)
  );
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.user_devices enable row level security;
create policy "devices_own" on public.user_devices
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.user_linked_accounts enable row level security;
create policy "linked_own" on public.user_linked_accounts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.user_consents enable row level security;
create policy "consents_select_own" on public.user_consents
  for select using (user_id = auth.uid() or public.is_admin());
create policy "consents_insert_self" on public.user_consents
  for insert with check (user_id = auth.uid());

alter table public.user_feedback enable row level security;
create policy "feedback_own_insert" on public.user_feedback
  for insert with check (user_id = auth.uid());
create policy "feedback_own_select" on public.user_feedback
  for select using (user_id = auth.uid() or public.is_admin());

alter table public.user_deletion_requests enable row level security;
create policy "deletion_own" on public.user_deletion_requests
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ============================================================================
-- 2) SOCIAL
-- ============================================================================
alter table public.posts enable row level security;

-- Read: anyone authenticated can read non-deleted posts, unless they've been
-- blocked by the author, or they've blocked the author.
create policy "posts_read_authed" on public.posts
  for select using (
    auth.uid() is not null
    and deleted_at is null
    and not exists (
      select 1 from public.user_blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = author_id)
         or (b.blocker_id = author_id  and b.blocked_id = auth.uid())
    )
  );

create policy "posts_insert_own" on public.posts
  for insert with check (author_id = auth.uid());
create policy "posts_update_own" on public.posts
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "posts_delete_own" on public.posts
  for delete using (author_id = auth.uid());

alter table public.post_cashtags enable row level security;
create policy "cashtags_read_authed" on public.post_cashtags
  for select using (auth.uid() is not null);
-- Writes only via trigger or service_role; no user-facing insert policy.

alter table public.post_likes enable row level security;
create policy "likes_read_authed" on public.post_likes
  for select using (auth.uid() is not null);
create policy "likes_insert_own" on public.post_likes
  for insert with check (user_id = auth.uid());
create policy "likes_delete_own" on public.post_likes
  for delete using (user_id = auth.uid());

alter table public.user_follows enable row level security;
create policy "follows_read_authed" on public.user_follows
  for select using (auth.uid() is not null);
create policy "follows_insert_own" on public.user_follows
  for insert with check (follower_id = auth.uid());
create policy "follows_delete_own" on public.user_follows
  for delete using (follower_id = auth.uid());

alter table public.user_blocks enable row level security;
create policy "blocks_own" on public.user_blocks
  for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- ============================================================================
-- 3) INSIGHTS + NEWS
-- ============================================================================
alter table public.watchlists enable row level security;
create policy "watchlists_own" on public.watchlists
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.watchlist_symbols enable row level security;
create policy "watchlist_symbols_own" on public.watchlist_symbols
  for all using (
    exists (select 1 from public.watchlists w
            where w.id = watchlist_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.watchlists w
            where w.id = watchlist_id and w.user_id = auth.uid())
  );

alter table public.notifications enable row level security;
create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.notification_preferences enable row level security;
create policy "notif_prefs_own" on public.notification_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.search_history enable row level security;
create policy "search_hist_own" on public.search_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.search_stats_top enable row level security;
create policy "search_stats_read_authed" on public.search_stats_top
  for select using (auth.uid() is not null);

alter table public.news_items enable row level security;
create policy "news_read_authed" on public.news_items
  for select using (auth.uid() is not null);

alter table public.news_announcements enable row level security;
create policy "news_ann_read_authed" on public.news_announcements
  for select using (auth.uid() is not null);

alter table public.news_notices enable row level security;
create policy "news_notices_read_authed" on public.news_notices
  for select using (auth.uid() is not null);

alter table public.news_favorites enable row level security;
create policy "news_fav_own" on public.news_favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- 4) VIRTUAL TRADING
-- ============================================================================
alter table public.virtual_sub_accounts enable row level security;
-- Owner full access; followers can SELECT non-sensitive columns only via a
-- dedicated view (see public.v_public_sub_account below). Raw table is own-only.
create policy "vsub_own" on public.virtual_sub_accounts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.virtual_portfolios enable row level security;
create policy "vportf_own" on public.virtual_portfolios
  for all using (
    exists (select 1 from public.virtual_sub_accounts s
            where s.id = sub_account_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.virtual_sub_accounts s
            where s.id = sub_account_id and s.user_id = auth.uid())
  );

alter table public.virtual_orders enable row level security;
create policy "vord_own" on public.virtual_orders
  for all using (
    exists (select 1 from public.virtual_sub_accounts s
            where s.id = sub_account_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.virtual_sub_accounts s
            where s.id = sub_account_id and s.user_id = auth.uid())
  );

alter table public.virtual_trades enable row level security;
create policy "vtrade_own_select" on public.virtual_trades
  for select using (
    exists (select 1 from public.virtual_sub_accounts s
            where s.id = sub_account_id and s.user_id = auth.uid())
  );
-- Inserts/updates via matching engine service_role only.

alter table public.virtual_holdings enable row level security;
create policy "vhold_own_select" on public.virtual_holdings
  for select using (
    exists (select 1 from public.virtual_sub_accounts s
            where s.id = sub_account_id and s.user_id = auth.uid())
  );

alter table public.virtual_pl_daily enable row level security;
create policy "vpl_own_select" on public.virtual_pl_daily
  for select using (
    exists (select 1 from public.virtual_sub_accounts s
            where s.id = sub_account_id and s.user_id = auth.uid())
  );

alter table public.virtual_follows enable row level security;
create policy "vfollow_read_authed" on public.virtual_follows
  for select using (auth.uid() is not null);
create policy "vfollow_insert_own" on public.virtual_follows
  for insert with check (follower_user_id = auth.uid());
create policy "vfollow_delete_own" on public.virtual_follows
  for delete using (follower_user_id = auth.uid());

alter table public.virtual_contests enable row level security;
create policy "contest_read_authed" on public.virtual_contests
  for select using (auth.uid() is not null);
create policy "contest_admin_write" on public.virtual_contests
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.virtual_contest_registrations enable row level security;
create policy "contest_reg_own" on public.virtual_contest_registrations
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

alter table public.virtual_contest_rankings enable row level security;
create policy "contest_rank_read_authed" on public.virtual_contest_rankings
  for select using (auth.uid() is not null);

alter table public.virtual_limited_stocks enable row level security;
create policy "limited_stocks_read_authed" on public.virtual_limited_stocks
  for select using (auth.uid() is not null);
create policy "limited_stocks_admin_write" on public.virtual_limited_stocks
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.virtual_recommended_accounts enable row level security;
create policy "rec_accts_read_authed" on public.virtual_recommended_accounts
  for select using (auth.uid() is not null);
create policy "rec_accts_admin_write" on public.virtual_recommended_accounts
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.virtual_search_history enable row level security;
create policy "vsearch_own" on public.virtual_search_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.virtual_account_view_counts enable row level security;
create policy "view_counts_read_authed" on public.virtual_account_view_counts
  for select using (auth.uid() is not null);

-- ============================================================================
-- 5) MARKET + FUNDAMENTALS (public read; service-role writes only)
-- ============================================================================
do $$
declare t text;
begin
  for t in select unnest(array[
    'symbols','symbol_quotes_latest','symbol_day_bars','symbol_minute_bars',
    'symbol_tick_snapshots','indices','index_daily','index_stock_members',
    'market_session_status','rankings_snapshot','dividend_events',
    'company_profiles','company_financials','company_shareholders',
    'company_insiders','financial_ratio_ranking'
  ]) loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($q$
      create policy "%s_read_authed" on public.%I
      for select using (auth.uid() is not null);
    $q$, t, t);
  end loop;
end $$;

-- ============================================================================
-- 6) APP + ADMIN
-- ============================================================================
-- Read-public tables
do $$
declare t text;
begin
  for t in select unnest(array[
    'app_faq','app_holidays','app_services','app_locale_namespaces',
    'app_locale_keys','app_locale_translations'
  ]) loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($q$
      create policy "%s_read_authed" on public.%I
      for select using (auth.uid() is not null);
    $q$, t, t);
    execute format($q$
      create policy "%s_admin_write" on public.%I
      for all using (public.is_admin()) with check (public.is_admin());
    $q$, t, t);
  end loop;
end $$;

-- Admin-only tables
do $$
declare t text;
begin
  for t in select unnest(array[
    'feature_flags','admin_clients','admin_scopes','admin_scope_groups',
    'admin_scope_group_scopes','admin_client_scope_groups','admin_partners',
    'admin_organizations','admin_login_methods','admin_open_api_docs'
  ]) loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($q$
      create policy "%s_admin_only" on public.%I
      for all using (public.is_admin()) with check (public.is_admin());
    $q$, t, t);
  end loop;
end $$;

-- ============================================================================
-- 7) AUDIT + ETL
-- ============================================================================
alter table public.audit_log enable row level security;
create policy "audit_admin_read" on public.audit_log
  for select using (public.is_admin());
-- Audit inserts happen via SECURITY DEFINER trigger, not user policy.

alter table public.etl_sync_runs enable row level security;
create policy "etl_admin_read" on public.etl_sync_runs
  for select using (public.is_admin());

alter table public.etl_dead_letter enable row level security;
create policy "dlq_admin_read" on public.etl_dead_letter
  for select using (public.is_admin());

-- ============================================================================
-- PUBLIC VIEW for follower-visible sub-account stats (no balances leaked)
-- ============================================================================
create or replace view public.v_public_sub_account as
select
  s.id                    as sub_account_id,
  s.user_id,
  p.username,
  p.avatar_url,
  coalesce(pd.total_equity / nullif(s.starting_balance, 0), 1) as nav_multiple,
  coalesce(pd.normalized_nav, 1) as normalized_nav,
  pd.trade_date           as last_snapshot_date
from public.virtual_sub_accounts s
join public.profiles p on p.id = s.user_id
left join lateral (
  select * from public.virtual_pl_daily d
  where d.sub_account_id = s.id
  order by d.trade_date desc limit 1
) pd on true
where s.status = 'ACTIVE' and p.deleted_at is null;

comment on view public.v_public_sub_account is
  'Public leaderboard-safe view: exposes NAV multiple but never cash balance.';
