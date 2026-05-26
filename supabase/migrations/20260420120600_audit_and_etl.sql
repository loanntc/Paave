-- ============================================================================
-- Paave | Migration 0006 — Audit trail + ETL observability
-- ============================================================================

-- ---------------------------------------------------------------------------
-- AUDIT LOG  — append-only, trigger-populated for sensitive tables
-- Compliance: VN SSC data retention (5y), PDPA data-access audit,
--             Korea PIPA record-keeping.
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id          bigserial primary key,
  table_name  text not null,
  operation   text not null check (operation in ('INSERT','UPDATE','DELETE')),
  row_pk      text not null,                             -- stringified PK
  actor_user_id uuid,                                    -- auth.uid() at time of op
  old_row     jsonb,
  new_row     jsonb,
  created_at  timestamptz not null default now()
);
create index idx_audit_table_time on public.audit_log (table_name, created_at desc);
create index idx_audit_actor_time on public.audit_log (actor_user_id, created_at desc);

create or replace function public.tg_audit_row() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_pk text;
begin
  v_pk := coalesce(
    (to_jsonb(new)->>'id'),
    (to_jsonb(old)->>'id'),
    ''
  );
  insert into public.audit_log (table_name, operation, row_pk, actor_user_id, old_row, new_row)
  values (
    tg_table_name,
    tg_op,
    v_pk,
    auth.uid(),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return null;
end $$;

-- Attach audit trigger to financially-sensitive tables
create trigger trg_audit_vsub
after insert or update or delete on public.virtual_sub_accounts
for each row execute function public.tg_audit_row();

create trigger trg_audit_vord
after insert or update or delete on public.virtual_orders
for each row execute function public.tg_audit_row();

create trigger trg_audit_vtrade
after insert or update or delete on public.virtual_trades
for each row execute function public.tg_audit_row();

create trigger trg_audit_profile
after update or delete on public.profiles
for each row execute function public.tg_audit_row();

-- ---------------------------------------------------------------------------
-- ETL SYNC LOG  — observability for the ingestion worker
-- ---------------------------------------------------------------------------
create type public.etl_sync_status as enum ('RUNNING','SUCCESS','PARTIAL','FAILED');

create table public.etl_sync_runs (
  id               bigserial primary key,
  run_group        text not null,                        -- 'hourly','nightly','manual'
  endpoint_key     text not null,                        -- e.g. 'market.symbol'
  target_table     text not null,
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  status           public.etl_sync_status not null default 'RUNNING',
  rows_fetched     bigint not null default 0,
  rows_upserted    bigint not null default 0,
  rows_failed      bigint not null default 0,
  error_message    text,
  error_details    jsonb,
  cursor_from      text,
  cursor_to        text
);
create index idx_etl_runs_endpoint_time
  on public.etl_sync_runs (endpoint_key, started_at desc);
create index idx_etl_runs_status
  on public.etl_sync_runs (status)
  where status in ('RUNNING','FAILED');

-- Dead letter queue for rows the ETL could not insert (validation/constraint fails)
create table public.etl_dead_letter (
  id            bigserial primary key,
  run_id        bigint references public.etl_sync_runs(id) on delete cascade,
  endpoint_key  text not null,
  target_table  text not null,
  payload       jsonb not null,
  error_message text not null,
  error_code    text,
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz
);
create index idx_dlq_unresolved on public.etl_dead_letter (created_at)
  where resolved_at is null;
