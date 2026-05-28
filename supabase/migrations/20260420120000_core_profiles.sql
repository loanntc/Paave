-- ============================================================================
-- Paave | Migration 0000 — Core profiles, devices, linked accounts, consents
-- ============================================================================
-- Scope: Extends Supabase auth.users with Paave-specific profile data.
-- Source endpoints: /users, /users/me/*, /users/availability-checks,
--                   /auth/biometric/*, /users/me/link-accounts/*,
--                   /users/me/confirmation, /users/me/deletion, /users/me/feedbacks
-- Write path: Supabase REST (PostgREST) using JWT (own-row) + service_role (admin).
-- Compliance: PII (email, DOB, phone) — RLS own-row; audit trail in 0008.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type public.account_status as enum (
  'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DELETED', 'LOCKED'
);

create type public.app_language as enum ('vi', 'ko', 'en');

create type public.market_preference as enum ('VN', 'KR', 'BOTH');

create type public.age_gate_tier as enum (
  'UNDER_13_BLOCKED',    -- Hard block: data protection laws
  'LEARN_MODE',           -- 13-17: paper trading + learning only
  'FULL_ACCESS'           -- 18+: all features incl. future live trading
);

-- ---------------------------------------------------------------------------
-- PROFILES — 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  registered_username   text unique not null,
  username              text unique,                       -- display handle, editable
  email                 text unique not null,              -- mirror of auth.users.email
  full_name             text not null,
  bio                   text,
  avatar_url            text,
  date_of_birth         date,                              -- used for age-gate
  age_gate_tier         public.age_gate_tier not null default 'LEARN_MODE',
  preferred_language    public.app_language  not null default 'vi',
  market_preference     public.market_preference not null default 'VN',
  account_status        public.account_status not null default 'PENDING_VERIFICATION',
  phone_number          text,
  phone_verified        boolean not null default false,
  email_verified        boolean not null default false,
  two_factor_enabled    boolean not null default false,
  biometric_enabled     boolean not null default false,
  ca_cert_enabled       boolean not null default false,    -- CA certificate login (Vietnam)
  terms_accepted_at     timestamptz,
  privacy_accepted_at   timestamptz,
  investment_disclaimer_accepted_at timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);

comment on table public.profiles is 'Paave user profile. Extends auth.users.';
comment on column public.profiles.age_gate_tier is 'Feature gate derived from DOB per BRD age-gate (FR-AGE-01..04).';

create index idx_profiles_username on public.profiles (username) where deleted_at is null;
create index idx_profiles_created_at on public.profiles (created_at desc);

-- ---------------------------------------------------------------------------
-- USER DEVICES — for biometric, push notifications, device attestation
-- ---------------------------------------------------------------------------
create table public.user_devices (
  id                bigserial primary key,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  device_id         text not null,                         -- client-supplied
  device_name       text,
  platform          text check (platform in ('ios','android','web','desktop')),
  push_token        text,
  biometric_public_key text,                               -- base64 RSA public key
  biometric_registered_at timestamptz,
  last_seen_at      timestamptz,
  created_at        timestamptz not null default now(),
  unique (user_id, device_id)
);
create index idx_user_devices_user on public.user_devices (user_id);

-- ---------------------------------------------------------------------------
-- LINKED ACCOUNTS — social login + partner account linking
-- ---------------------------------------------------------------------------
create type public.linked_account_type as enum (
  'SOCIAL_GOOGLE', 'SOCIAL_APPLE', 'SOCIAL_KAKAO', 'SOCIAL_FACEBOOK',
  'PARTNER_NHSV', 'PARTNER_ORGANIZATION'
);

create table public.user_linked_accounts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  account_type      public.linked_account_type not null,
  external_id       text not null,                         -- subject id at provider
  external_username text,
  partner_id        text,                                  -- nullable; for partner types
  metadata          jsonb not null default '{}'::jsonb,
  linked_at         timestamptz not null default now(),
  unlinked_at       timestamptz,
  unique (user_id, account_type, external_id)
);
create index idx_linked_accounts_user on public.user_linked_accounts (user_id);

-- ---------------------------------------------------------------------------
-- USER CONSENTS — GDPR / Vietnam PDPA / Korea PIPA audit-grade consent log
-- ---------------------------------------------------------------------------
create table public.user_consents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  consent_type  text not null,      -- 'TERMS','PRIVACY','MARKETING','INVEST_DISCLAIMER','AI_DISCLAIMER','DATA_SHARING_PARTNER'
  version       text not null,      -- e.g. 'v2.0-2026-04-14'
  granted       boolean not null,
  granted_at    timestamptz not null default now(),
  ip_address    inet,
  user_agent    text
);
create index idx_user_consents_user on public.user_consents (user_id, consent_type, granted_at desc);

-- ---------------------------------------------------------------------------
-- USER FEEDBACK  — /users/me/feedbacks
-- ---------------------------------------------------------------------------
create table public.user_feedback (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  category    text,
  subject     text,
  message     text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- DELETION REQUESTS — supports /users/me/deletion* endpoints with grace period
-- ---------------------------------------------------------------------------
create table public.user_deletion_requests (
  key            text primary key,            -- opaque token used in URL
  user_id        uuid not null references public.profiles(id) on delete cascade,
  requested_at   timestamptz not null default now(),
  scheduled_for  timestamptz not null,        -- e.g. now()+interval '30 days'
  reason         text,
  completed_at   timestamptz,
  cancelled_at   timestamptz
);

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ---------------------------------------------------------------------------
create or replace function public.tg_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.tg_set_updated_at();
