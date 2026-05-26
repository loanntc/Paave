-- ============================================================================
-- Paave | Migration 0005 — Admin / Platform (feature flags, locale, scopes,
-- clients, partners, organizations, FAQ, holidays, services)
-- ============================================================================
-- Source: /admin/*, /app/*
-- All of these are admin-only for writes; public-read only where noted.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- APP METADATA (read-public for authenticated users)
-- ---------------------------------------------------------------------------
create table public.app_faq (
  id         bigserial primary key,
  ms_name    text not null,                               -- module name
  lang       public.app_language not null,
  question   text not null,
  answer     text not null,
  useful_count  int not null default 0,
  not_useful_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_faq_ms_lang on public.app_faq (ms_name, lang);
create trigger trg_faq_updated_at before update on public.app_faq
for each row execute function public.tg_set_updated_at();

create table public.app_holidays (
  holiday_date date not null,
  exchange     public.v_exchange not null,
  name         text not null,
  description  text,
  primary key (holiday_date, exchange)
);

create table public.app_services (
  name       text primary key,
  status     text not null default 'UP' check (status in ('UP','DEGRADED','DOWN','MAINT')),
  config     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger trg_services_updated_at before update on public.app_services
for each row execute function public.tg_set_updated_at();

create table public.app_locale_namespaces (
  id   bigserial primary key,
  name text unique not null
);

create table public.app_locale_keys (
  id           bigserial primary key,
  namespace_id bigint not null references public.app_locale_namespaces(id) on delete cascade,
  key          text not null,
  description  text,
  unique (namespace_id, key)
);

create table public.app_locale_translations (
  key_id   bigint not null references public.app_locale_keys(id) on delete cascade,
  lang     public.app_language not null,
  value    text not null,
  updated_at timestamptz not null default now(),
  primary key (key_id, lang)
);
create trigger trg_locale_translations_updated_at before update on public.app_locale_translations
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- FEATURE FLAGS
-- ---------------------------------------------------------------------------
create table public.feature_flags (
  key         text primary key,
  description text,
  value       jsonb not null default 'false'::jsonb,
  environment text not null default 'prod' check (environment in ('dev','staging','prod')),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles(id)
);
create trigger trg_ff_updated_at before update on public.feature_flags
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- OAUTH / CLIENTS / SCOPES
-- ---------------------------------------------------------------------------
create table public.admin_clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client_id   text unique not null,
  client_secret_hash text not null,                       -- bcrypt or argon2
  redirect_uris text[] not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.admin_scopes (
  id          bigserial primary key,
  key         text unique not null,
  description text
);

create table public.admin_scope_groups (
  id          bigserial primary key,
  name        text unique not null,
  description text
);

create table public.admin_scope_group_scopes (
  group_id bigint not null references public.admin_scope_groups(id) on delete cascade,
  scope_id bigint not null references public.admin_scopes(id) on delete cascade,
  primary key (group_id, scope_id)
);

create table public.admin_client_scope_groups (
  client_id uuid   not null references public.admin_clients(id) on delete cascade,
  group_id  bigint not null references public.admin_scope_groups(id) on delete cascade,
  primary key (client_id, group_id)
);

-- ---------------------------------------------------------------------------
-- PARTNERS / ORGANIZATIONS
-- ---------------------------------------------------------------------------
create table public.admin_partners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  partner_code text unique not null,
  metadata    jsonb not null default '{}'::jsonb,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.admin_organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  org_code    text unique not null,
  country     text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.admin_login_methods (
  id          bigserial primary key,
  method_code text unique not null,                      -- 'PASSWORD','GOOGLE','APPLE','KAKAO','BIOMETRIC','CA'
  display_name text not null,
  is_enabled  boolean not null default true,
  config      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- OPEN API DOCUMENTS (the /admin/open-api endpoints let admins manage
-- uploaded OpenAPI specs; mirror for self-service docs)
-- ---------------------------------------------------------------------------
create table public.admin_open_api_docs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  version     text,
  doc         jsonb not null,                             -- full OpenAPI blob
  file_url    text,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default now()
);
