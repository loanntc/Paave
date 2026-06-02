# SRD: F0 Learning Path — Virtual Capital Rewards

**Version:** 1.0
**Date:** 2026-06-01
**Linked FRD:** `docs/business/f0-learning/05-virtual-capital-rewards.md`
**Linked Dev/QA Spec:** `docs/DEV-QA-SPEC-F0-Learning-Path.md`
**Status:** Ready for Engineering Review
**Author:** Backend Systems Design

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [API Contract](#3-api-contract)
4. [Business Logic — Reward Grant Flow](#4-business-logic--reward-grant-flow)
5. [Business Logic — Force-Liquidation Flow](#5-business-logic--force-liquidation-flow)
6. [Business Logic — TTL Expiry & Notifications](#6-business-logic--ttl-expiry--notifications)
7. [Integration Points](#7-integration-points)
8. [Validation Logic](#8-validation-logic)
9. [Error Handling Matrix](#9-error-handling-matrix)
10. [Cron Job Specifications](#10-cron-job-specifications)
11. [Non-Functional Requirements](#11-non-functional-requirements)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PAAVE MOBILE CLIENT (React Native)                   │
│                                                                             │
│  AsyncStorage (local cache)  ←→  Learning Path UI  ←→  Virtual Order Form  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │  HTTPS / JWT
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REST API  (auth: JWT Bearer)                       │
│                                                                             │
│  POST /api/v1/virtual/learning-rewards/complete-module                      │
│  GET  /api/v1/virtual/learning-rewards                                      │
│  GET  /api/v1/virtual/learning-rewards/balance                              │
│  GET  /api/v1/virtual/equity/accounts/profit-loss       [MODIFIED]          │
└───────┬─────────────────────┬──────────────────────┬───────────────────────┘
        │                     │                      │
        ▼                     ▼                      ▼
┌───────────────┐   ┌──────────────────┐   ┌────────────────────┐
│  Learning     │   │  Reward          │   │  Virtual Trading   │
│  Service      │   │  Ledger Service  │   │  Service           │
│               │   │                  │   │                    │
│  learning_    │   │  learning_       │   │  virtual_          │
│  module_      │   │  rewards         │   │  portfolios        │
│  completions  │   │  learning_       │   │  virtual_orders    │
│               │   │  reward_ledger   │   │                    │
└───────┬───────┘   └────────┬─────────┘   └────────┬───────────┘
        │                    │                       │
        └────────────────────┴───────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   (Supabase)    │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
  ┌───────────────┐  ┌──────────────┐  ┌───────────────────┐
  │  Push Notif.  │  │  Cron Jobs   │  │  Audit / Logging  │
  │  Service      │  │              │  │                   │
  │               │  │  reward-     │  │  All reward       │
  │  {user_id,    │  │  expiry-     │  │  events written   │
  │   title,      │  │  notifier    │  │  to ledger        │
  │   body,       │  │  (daily)     │  │  (immutable)      │
  │   data}       │  │              │  │                   │
  │               │  │  reward-     │  │                   │
  └───────────────┘  │  force-      │  └───────────────────┘
                     │  liquidator  │
                     │  (15 min)    │
                     └──────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Reward funds live in a **separate sub-ledger**, not in `virtual_portfolios.total_cash` | Prevents balance confusion, enables clean TTL expiry without touching main balance arithmetic |
| Server-side `learning_module_completions` table is the authoritative source | Client AsyncStorage is a cache only; all reward grant logic is driven from server-verified completion |
| Double-entry ledger (`learning_reward_ledger`) for all fund movements | Full audit trail; balance at any point reconstructable from ledger entries |
| Reward grant is **idempotent by (user_id, module_id)** unique constraint | Safe for client retries, network errors, and duplicate events |
| Force-liquidation runs **every 15 minutes** (not daily) | Minimises the window in which an expired reward's open positions remain on market |

---

## 2. Database Schema

### 2.1 `learning_module_completions`

Server-side learning progress. Replaces AsyncStorage as the authoritative record of which modules a user has completed MKC for.

```sql
CREATE TABLE learning_module_completions (
    id                  BIGSERIAL           PRIMARY KEY,
    user_id             UUID                NOT NULL
                                            REFERENCES users(id) ON DELETE CASCADE,
    module_id           SMALLINT            NOT NULL
                                            CHECK (module_id BETWEEN 1 AND 4),
    completed_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    mkc_score           SMALLINT            NOT NULL
                                            CHECK (mkc_score BETWEEN 0 AND 5),
    completion_source   VARCHAR(20)         NOT NULL DEFAULT 'APP_EVENT'
                                            CHECK (completion_source IN ('APP_EVENT', 'ADMIN_GRANT')),
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_learning_module_completions_user_module
        UNIQUE (user_id, module_id)
);

-- Fast lookup: does this user have a completion for module N?
CREATE INDEX idx_lmc_user_id ON learning_module_completions (user_id);

-- Admin queries: all completions for a module
CREATE INDEX idx_lmc_module_id ON learning_module_completions (module_id);

-- Completion timeline queries
CREATE INDEX idx_lmc_completed_at ON learning_module_completions (completed_at);

COMMENT ON TABLE learning_module_completions IS
    'Server-side record of each user passing MKC for a module. '
    'One row per (user, module). Authoritative source for reward eligibility. '
    'completion_source=ADMIN_GRANT is used for support overrides only.';

COMMENT ON COLUMN learning_module_completions.mkc_score IS
    'Score at the time of the passing attempt (3-5). '
    'Previous failed attempt scores are not stored here.';
```

---

### 2.2 `learning_reward_sub_accounts`

One virtual sub-account per reward grant. Isolates reward-funded positions from the user's main virtual portfolio.

```sql
CREATE TABLE learning_reward_sub_accounts (
    sub_account_id      VARCHAR(64)         PRIMARY KEY,
                                            -- Format: 'reward-{user_id}-m{module_id}-{epoch_ms}'
    user_id             UUID                NOT NULL
                                            REFERENCES users(id) ON DELETE CASCADE,
    module_id           SMALLINT            NOT NULL
                                            CHECK (module_id BETWEEN 1 AND 4),
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_learning_reward_sub_accounts_user_module
        UNIQUE (user_id, module_id)
);

CREATE INDEX idx_lrsa_user_id ON learning_reward_sub_accounts (user_id);

COMMENT ON TABLE learning_reward_sub_accounts IS
    'Virtual sub-account namespace for reward-funded positions. '
    'Used as a foreign key in learning_rewards to identify which '
    'virtual sub-account holds the bonus positions.';
```

---

### 2.3 `learning_rewards`

One row per reward ever granted to a user for a module. The central record that tracks reward lifecycle from QUEUED through to LIQUIDATED or EXPIRED.

```sql
CREATE TYPE learning_reward_status AS ENUM (
    'QUEUED',           -- Virtual account not yet initialized; reward pending
    'ACTIVE',           -- Reward is live; user can trade with it
    'PARTIALLY_USED',   -- At least one buy order has been funded by this reward
    'EXPIRED',          -- TTL elapsed, no open positions existed at expiry time
    'LIQUIDATED'        -- TTL elapsed, open positions were force-closed; proceeds credited
);

CREATE TABLE learning_rewards (
    reward_id               BIGSERIAL               PRIMARY KEY,
    user_id                 UUID                    NOT NULL
                                                    REFERENCES users(id) ON DELETE CASCADE,
    module_id               SMALLINT                NOT NULL
                                                    CHECK (module_id BETWEEN 2 AND 4),
                                                    -- M1 has no reward
    reward_type             VARCHAR(20)             NOT NULL DEFAULT 'VIRTUAL_CASH'
                                                    CHECK (reward_type IN ('VIRTUAL_CASH')),
    amount                  BIGINT                  NOT NULL
                                                    CHECK (amount > 0),
                                                    -- In VND, integer (no decimals). M2=50000000, M3/M4=25000000
    status                  learning_reward_status  NOT NULL DEFAULT 'QUEUED',
    granted_at              TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    expires_at              TIMESTAMPTZ             NOT NULL,
                                                    -- = granted_at + INTERVAL '7 days'
                                                    -- Set by application layer, not DB default,
                                                    -- to ensure consistency with ledger
    liquidated_at           TIMESTAMPTZ             NULL,
    liquidation_proceeds    BIGINT                  NULL
                                                    CHECK (liquidation_proceeds >= 0),
                                                    -- Net VND credited to main available_balance after force-liq
    sub_account             VARCHAR(64)             NULL
                                                    REFERENCES learning_reward_sub_accounts(sub_account_id),
                                                    -- NULL while status=QUEUED (no virtual account yet)
    created_at              TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_learning_rewards_user_module
        UNIQUE (user_id, module_id),

    CONSTRAINT chk_liquidated_fields
        CHECK (
            (status NOT IN ('LIQUIDATED') AND liquidated_at IS NULL AND liquidation_proceeds IS NULL)
            OR
            (status = 'LIQUIDATED' AND liquidated_at IS NOT NULL AND liquidation_proceeds IS NOT NULL)
        ),

    CONSTRAINT chk_sub_account_required_when_active
        CHECK (
            (status = 'QUEUED' AND sub_account IS NULL)
            OR
            (status != 'QUEUED' AND sub_account IS NOT NULL)
        )
);

-- Primary lookup: user's rewards
CREATE INDEX idx_lr_user_id ON learning_rewards (user_id);

-- Cron job: find all rewards expiring soon or now
CREATE INDEX idx_lr_expires_at ON learning_rewards (expires_at)
    WHERE status IN ('ACTIVE', 'PARTIALLY_USED');

-- Cron job: find QUEUED rewards to activate when virtual account comes online
CREATE INDEX idx_lr_queued ON learning_rewards (user_id)
    WHERE status = 'QUEUED';

-- Fast status filter for active balance queries
CREATE INDEX idx_lr_user_status ON learning_rewards (user_id, status)
    WHERE status IN ('ACTIVE', 'PARTIALLY_USED');

COMMENT ON TABLE learning_rewards IS
    'One row per reward granted per user per module. '
    'Module 1 has no reward — module_id CHECK starts at 2. '
    'amount is in integer VND (e.g., 50000000 = 50,000,000 VND). '
    'The reward is NOT added to virtual_portfolios.total_cash. '
    'All spending tracked via learning_reward_ledger.';

COMMENT ON COLUMN learning_rewards.expires_at IS
    'Exact timestamp at which force-liquidation becomes eligible. '
    'Set to granted_at + 7 days (168 hours, not calendar days). '
    'The 15-minute cron job processes any reward where expires_at <= NOW().';

COMMENT ON COLUMN learning_rewards.liquidation_proceeds IS
    'Net VND amount credited to virtual_portfolios.available_balance after '
    'closing all bonus-funded positions. Equals: sum of sell proceeds '
    'from forced sells minus zero fees (educational forgiveness). '
    'May be zero if all positions closed at a loss wiping out the principal.';
```

---

### 2.4 `learning_reward_ledger`

Immutable double-entry ledger recording every movement of reward funds. Every CREDIT and DEBIT writes a row here.

```sql
CREATE TYPE ledger_movement_type AS ENUM (
    'CREDIT',
    'DEBIT'
);

CREATE TYPE ledger_reason AS ENUM (
    'AWARD',                -- Initial grant of reward funds (CREDIT)
    'BUY_ORDER',            -- Reward funds used to place a buy order (DEBIT)
    'SELL_PROCEEDS',        -- Proceeds from selling a reward-funded position (CREDIT)
    'FORCE_LIQUIDATION',    -- Proceeds credited during force-liquidation (CREDIT)
    'EXPIRY',               -- Remaining balance removed at TTL expiry (DEBIT, zero if fully invested)
    'ORDER_CANCEL',         -- Buy order cancelled; funds returned (CREDIT)
    'ORDER_EXPIRE'          -- Buy order expired unfilled; funds returned (CREDIT)
);

CREATE TABLE learning_reward_ledger (
    ledger_id       BIGSERIAL               PRIMARY KEY,
    user_id         UUID                    NOT NULL
                                            REFERENCES users(id) ON DELETE CASCADE,
    reward_id       BIGINT                  NOT NULL
                                            REFERENCES learning_rewards(reward_id),
    movement_type   ledger_movement_type    NOT NULL,
    amount          BIGINT                  NOT NULL
                                            CHECK (amount > 0),
                                            -- Always positive; direction given by movement_type
    balance_after   BIGINT                  NOT NULL
                                            CHECK (balance_after >= 0),
                                            -- Running reward balance for this reward_id after this entry
    reason          ledger_reason           NOT NULL,
    order_id        UUID                    NULL
                                            REFERENCES virtual_orders(order_id),
                                            -- Populated for BUY_ORDER, SELL_PROCEEDS, FORCE_LIQUIDATION,
                                            -- ORDER_CANCEL, ORDER_EXPIRE reasons
    metadata        JSONB                   NULL,
                                            -- Optional: symbol_code, fill_price, quantity, etc.
    created_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

-- Fast ledger reconstruction for a reward
CREATE INDEX idx_lrl_reward_id ON learning_reward_ledger (reward_id);

-- User ledger history
CREATE INDEX idx_lrl_user_id ON learning_reward_ledger (user_id);

-- Audit queries by order
CREATE INDEX idx_lrl_order_id ON learning_reward_ledger (order_id)
    WHERE order_id IS NOT NULL;

-- Chronological scan
CREATE INDEX idx_lrl_created_at ON learning_reward_ledger (created_at DESC);

COMMENT ON TABLE learning_reward_ledger IS
    'Immutable append-only ledger for all reward fund movements. '
    'Never UPDATE or DELETE rows. balance_after is the reward''s running balance '
    'after this specific entry. Reconstruct current balance with: '
    'SELECT balance_after FROM learning_reward_ledger '
    'WHERE reward_id = $1 ORDER BY ledger_id DESC LIMIT 1. '
    'Rows are ordered by ledger_id (monotonic) for correct reconstruction.';

COMMENT ON COLUMN learning_reward_ledger.amount IS
    'Always a positive integer VND amount. '
    'movement_type=CREDIT means balance increases; DEBIT means it decreases.';

COMMENT ON COLUMN learning_reward_ledger.balance_after IS
    'Snapshot of this reward''s available balance immediately after this entry. '
    'Used for fast balance lookup without summing the full ledger.';
```

---

### 2.5 Relation to Existing Tables (No Schema Changes Required)

The following existing tables are **read from** but not altered by this system:

| Table | How it's used |
|-------|---------------|
| `users` | FK target for user_id across all new tables |
| `virtual_portfolios` | Read to check account initialization status; `available_balance` is updated (not `total_cash`) when liquidation proceeds are credited |
| `virtual_orders` | FK target in `learning_reward_ledger.order_id`; queried during force-liquidation to identify open positions |

**One write to `virtual_portfolios`** does occur: when force-liquidation or expiry completes, `available_balance += liquidation_proceeds`. This is the only permitted write from this system to the existing virtual trading tables.

---

### 2.6 Complete Schema — DDL Summary

```sql
-- Apply in this order to respect foreign key dependencies:
-- 1. learning_reward_sub_accounts
-- 2. learning_rewards          (references learning_reward_sub_accounts)
-- 3. learning_module_completions
-- 4. learning_reward_ledger    (references learning_rewards, virtual_orders)
```

---

## 3. API Contract

All endpoints use:
- **Base URL:** `/api/v1/virtual`
- **Authentication:** `Authorization: jwt <token>` (existing app convention)
- **Content-Type:** `application/json`
- **Error envelope:** `{ "error": { "code": "ERR_CODE", "message": "Human-readable string", "details": {} } }`

---

### 3.1 POST `/api/v1/virtual/learning-rewards/complete-module`

Called by the mobile app when a user passes an MKC. This is the single entry point for both recording completion and granting rewards.

#### Request

```json
{
    "module_id": 2,
    "mkc_score": 4,
    "completed_at": "2026-06-01T10:32:00.000Z"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `module_id` | integer | Yes | 1, 2, 3, or 4 |
| `mkc_score` | integer | Yes | 0–5 inclusive; must be ≥ 3 to pass |
| `completed_at` | ISO 8601 string | Yes | Must be a valid datetime; must not be in the future by more than 5 minutes (clock skew tolerance); must not be more than 24 hours in the past |

#### Response — 201 Created (new completion, reward granted)

```json
{
    "data": {
        "completion": {
            "user_id": "550e8400-e29b-41d4-a716-446655440000",
            "module_id": 2,
            "completed_at": "2026-06-01T10:32:00.000Z",
            "mkc_score": 4,
            "completion_source": "APP_EVENT"
        },
        "reward": {
            "reward_id": 1001,
            "module_id": 2,
            "reward_type": "VIRTUAL_CASH",
            "amount": 50000000,
            "status": "ACTIVE",
            "granted_at": "2026-06-01T10:32:05.123Z",
            "expires_at": "2026-06-08T10:32:05.123Z",
            "ttl_remaining_seconds": 604800,
            "amount_remaining": 50000000
        }
    }
}
```

If virtual account is not yet initialized, `status` will be `"QUEUED"` and `expires_at` / `ttl_remaining_seconds` will be `null`:

```json
{
    "data": {
        "completion": { ... },
        "reward": {
            "reward_id": 1002,
            "module_id": 3,
            "reward_type": "VIRTUAL_CASH",
            "amount": 25000000,
            "status": "QUEUED",
            "granted_at": "2026-06-01T10:32:05.123Z",
            "expires_at": null,
            "ttl_remaining_seconds": null,
            "amount_remaining": 25000000
        }
    }
}
```

#### Response — 200 OK (already completed — idempotent)

```json
{
    "data": {
        "completion": {
            "user_id": "550e8400-e29b-41d4-a716-446655440000",
            "module_id": 2,
            "completed_at": "2026-05-20T08:00:00.000Z",
            "mkc_score": 3,
            "completion_source": "APP_EVENT"
        },
        "reward": { ... },
        "idempotent": true
    }
}
```

#### Response — 201 Created (M1 completion, no reward)

```json
{
    "data": {
        "completion": {
            "user_id": "550e8400-e29b-41d4-a716-446655440000",
            "module_id": 1,
            "completed_at": "2026-06-01T09:00:00.000Z",
            "mkc_score": 5,
            "completion_source": "APP_EVENT"
        },
        "reward": null
    }
}
```

#### Side Effects (in order)

1. INSERT `learning_module_completions` row (or no-op if already exists)
2. If module has reward and no existing `learning_rewards` row: INSERT `learning_rewards`
3. INSERT `learning_reward_ledger` CREDIT / AWARD entry
4. If reward status is ACTIVE: fire push notification (async, non-blocking)
5. Schedule T+6 and T+7 notification jobs (async)

---

### 3.2 GET `/api/v1/virtual/learning-rewards`

Returns all reward records for the authenticated user.

#### Request

No body. Auth token provides user context.

#### Response — 200 OK

```json
{
    "data": {
        "rewards": [
            {
                "reward_id": 1001,
                "module_id": 2,
                "reward_type": "VIRTUAL_CASH",
                "amount": 50000000,
                "status": "PARTIALLY_USED",
                "granted_at": "2026-06-01T10:32:05.123Z",
                "expires_at": "2026-06-08T10:32:05.123Z",
                "ttl_remaining_seconds": 518400,
                "amount_remaining": 32000000,
                "liquidated_at": null,
                "liquidation_proceeds": null
            },
            {
                "reward_id": 1003,
                "module_id": 3,
                "reward_type": "VIRTUAL_CASH",
                "amount": 25000000,
                "status": "ACTIVE",
                "granted_at": "2026-06-02T14:00:00.000Z",
                "expires_at": "2026-06-09T14:00:00.000Z",
                "ttl_remaining_seconds": 604200,
                "amount_remaining": 25000000,
                "liquidated_at": null,
                "liquidation_proceeds": null
            }
        ],
        "summary": {
            "total_active_rewards": 2,
            "total_spendable_balance": 57000000
        }
    }
}
```

| Field | Source | Notes |
|-------|--------|-------|
| `amount_remaining` | Latest `balance_after` from `learning_reward_ledger` for this reward_id | Reflects current unspent balance |
| `ttl_remaining_seconds` | `EXTRACT(EPOCH FROM (expires_at - NOW()))` | Integer seconds; 0 if expired but not yet processed by cron |
| `status` | `learning_rewards.status` | — |

---

### 3.3 GET `/api/v1/virtual/learning-rewards/balance`

Returns the current total spendable reward balance. Used by the order entry form to display the "Bao gồm X VND tiền thưởng học tập" line.

#### Request

No body.

#### Response — 200 OK

```json
{
    "data": {
        "spendable_balance": 57000000,
        "currency": "VND",
        "breakdown": [
            {
                "reward_id": 1001,
                "module_id": 2,
                "amount_remaining": 32000000,
                "expires_at": "2026-06-08T10:32:05.123Z",
                "ttl_remaining_seconds": 518400
            },
            {
                "reward_id": 1003,
                "module_id": 3,
                "amount_remaining": 25000000,
                "expires_at": "2026-06-09T14:00:00.000Z",
                "ttl_remaining_seconds": 604200
            }
        ],
        "soonest_expiry_at": "2026-06-08T10:32:05.123Z"
    }
}
```

`spendable_balance` = sum of `amount_remaining` for all rewards with `status IN ('ACTIVE', 'PARTIALLY_USED')`. Rewards with `status = 'QUEUED'` are excluded (no virtual account yet; funds cannot be traded).

---

### 3.4 GET `/api/v1/virtual/equity/accounts/profit-loss` (MODIFIED)

This is an existing endpoint. The following fields are **added** to the response. All existing fields remain unchanged.

#### New fields added to existing response

```json
{
    "...existing_fields...": "...",

    "learning_reward_balance": 57000000,
    "learning_reward_expires_at": "2026-06-08T10:32:05.123Z",
    "learning_reward_breakdown": [
        {
            "reward_id": 1001,
            "module_id": 2,
            "amount_remaining": 32000000,
            "expires_at": "2026-06-08T10:32:05.123Z"
        }
    ]
}
```

| New Field | Type | Description |
|-----------|------|-------------|
| `learning_reward_balance` | integer (VND) | Sum of all spendable reward balances; 0 if none active |
| `learning_reward_expires_at` | ISO 8601 or null | The soonest `expires_at` among all `ACTIVE`/`PARTIALLY_USED` rewards; null if none |
| `learning_reward_breakdown` | array | Per-reward detail; empty array `[]` if no active rewards |

**No breaking changes.** Clients that do not read the new fields are unaffected. If the user has no active rewards, `learning_reward_balance = 0`, `learning_reward_expires_at = null`, `learning_reward_breakdown = []`.

---

## 4. Business Logic — Reward Grant Flow

The following steps describe the complete server-side execution when `POST /api/v1/virtual/learning-rewards/complete-module` is called.

### 4.1 Step-by-Step

**Step 1 — JWT Validation**

- Verify `Authorization: jwt <token>` header is present and valid.
- Extract `user_id` from the token payload.
- If token is missing, expired, or invalid: return `401 UNAUTHORIZED`, error code `ERR_AUTH_INVALID_TOKEN`.

**Step 2 — Input Validation**

- Validate `module_id` is an integer in `{1, 2, 3, 4}`. If not: `400 BAD_REQUEST`, `ERR_INVALID_MODULE_ID`.
- Validate `mkc_score` is an integer in `[0, 5]`. If not: `400 BAD_REQUEST`, `ERR_INVALID_MKC_SCORE`.
- Validate `mkc_score >= 3`. If not: `422 UNPROCESSABLE_ENTITY`, `ERR_MKC_SCORE_TOO_LOW`. (The app should not call this endpoint on a failed MKC, but the server must enforce this independently.)
- Validate `completed_at` is a parseable ISO 8601 datetime.
- Validate `completed_at` is not more than 5 minutes in the future (clock skew): `422`, `ERR_COMPLETED_AT_IN_FUTURE`.
- Validate `completed_at` is not more than 24 hours in the past: `422`, `ERR_COMPLETED_AT_TOO_OLD`.

**Step 3 — Idempotency Check**

```sql
SELECT id, completed_at, mkc_score
FROM learning_module_completions
WHERE user_id = $user_id AND module_id = $module_id
LIMIT 1;
```

- If a row exists: the completion already happened. Fetch the associated `learning_rewards` row if any, build the full response, return `200 OK` with `"idempotent": true`. **Do not execute any further steps.**

**Step 4 — Begin Database Transaction**

All remaining steps execute within a single serializable transaction. On any failure, rollback and return the appropriate error.

**Step 5 — Insert Module Completion**

```sql
INSERT INTO learning_module_completions
    (user_id, module_id, completed_at, mkc_score, completion_source)
VALUES
    ($user_id, $module_id, $completed_at, $mkc_score, 'APP_EVENT');
```

**Step 6 — Reward Determination**

Determine reward amount based on module:

| module_id | reward_amount (VND) |
|-----------|---------------------|
| 1 | 0 (no reward) |
| 2 | 50,000,000 |
| 3 | 25,000,000 |
| 4 | 25,000,000 |

If `reward_amount = 0`: skip Steps 6a–6e. Set `reward_response = null`. Jump to Step 7.

**Step 6a — Check Virtual Account Initialization**

```sql
SELECT id, available_balance
FROM virtual_portfolios
WHERE user_id = $user_id
LIMIT 1;
```

- If row exists: `virtual_account_ready = true`, `reward_status = 'ACTIVE'`
- If no row: `virtual_account_ready = false`, `reward_status = 'QUEUED'`

**Step 6b — Create Sub-Account (if virtual account ready)**

If `virtual_account_ready = true`:

```sql
INSERT INTO learning_reward_sub_accounts (sub_account_id, user_id, module_id)
VALUES (
    'reward-' || $user_id || '-m' || $module_id || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
    $user_id,
    $module_id
)
ON CONFLICT (user_id, module_id) DO NOTHING
RETURNING sub_account_id;
```

If `virtual_account_ready = false`: `sub_account_id = NULL`.

**Step 6c — Insert Reward Row**

```sql
INSERT INTO learning_rewards
    (user_id, module_id, reward_type, amount, status, granted_at, expires_at, sub_account)
VALUES (
    $user_id,
    $module_id,
    'VIRTUAL_CASH',
    $reward_amount,
    $reward_status,           -- 'ACTIVE' or 'QUEUED'
    NOW(),
    CASE WHEN $reward_status = 'ACTIVE' THEN NOW() + INTERVAL '7 days' ELSE NULL END,
    $sub_account_id           -- NULL if QUEUED
)
RETURNING reward_id, granted_at, expires_at;
```

**Step 6d — Insert Ledger CREDIT Entry**

```sql
INSERT INTO learning_reward_ledger
    (user_id, reward_id, movement_type, amount, balance_after, reason, order_id, metadata)
VALUES (
    $user_id,
    $reward_id,
    'CREDIT',
    $reward_amount,
    $reward_amount,   -- Initial balance = full reward amount
    'AWARD',
    NULL,
    jsonb_build_object('module_id', $module_id, 'mkc_score', $mkc_score)
);
```

**Step 6e — Do NOT touch `virtual_portfolios.total_cash`**

The reward is on a separate sub-ledger. `virtual_portfolios.total_cash` and `virtual_portfolios.available_balance` are not modified at grant time.

**Step 7 — Commit Transaction**

**Step 8 — Fire Push Notification (Async, Non-Blocking)**

If `reward_status = 'ACTIVE'` and `reward_amount > 0`, enqueue the following notification (do not block the HTTP response on this):

```json
{
    "user_id": "<user_id>",
    "title": "Bạn nhận được tiền thưởng học tập!",
    "body": "50,000,000 VND đã được thêm vào tài khoản ảo của bạn. Còn 7 ngày để sử dụng.",
    "data": {
        "screen": "VirtualPortfolio",
        "params": { "highlight": "learning_rewards" }
    }
}
```

For M3/M4: body = "25,000,000 VND đã được thêm vào tài khoản ảo của bạn. Còn 7 ngày để sử dụng."

If `reward_status = 'QUEUED'`: do not send notification yet. Notification fires when the QUEUED reward is activated (see Section 7.3).

**Step 9 — Schedule TTL Notifications**

Enqueue two notification jobs (non-blocking):
- T+6 (24h warning): target time = `expires_at - INTERVAL '24 hours'`
- T+7 (force-liquidation): handled by the cron job (no separate scheduling needed)

**Step 10 — Return HTTP Response**

Return `201 Created` with the completion and reward objects as defined in Section 3.1.

---

### 4.2 Reward Amount Reference

| Module | module_id | Amount (VND) | TTL | Trigger |
|--------|-----------|--------------|-----|---------|
| Kiến thức nền tảng (M1) | 1 | 0 | — | — |
| Trader đầu tiên (M2) | 2 | 50,000,000 | 7 days | M2 MKC pass |
| Tư duy danh mục (M3) | 3 | 25,000,000 | 7 days | M3 MKC pass |
| Học giả thị trường (M4) | 4 | 25,000,000 | 7 days | M4 MKC pass |

---

## 5. Business Logic — Force-Liquidation Flow

The `reward-force-liquidator` cron job (runs every 15 minutes) processes all rewards whose TTL has elapsed and which still have open positions or remaining balance.

### 5.1 Target Identification

```sql
SELECT
    lr.reward_id,
    lr.user_id,
    lr.module_id,
    lr.sub_account,
    lr.amount,
    lrl_last.balance_after AS current_balance
FROM learning_rewards lr
JOIN LATERAL (
    SELECT balance_after
    FROM learning_reward_ledger
    WHERE reward_id = lr.reward_id
    ORDER BY ledger_id DESC
    LIMIT 1
) lrl_last ON true
WHERE lr.status IN ('ACTIVE', 'PARTIALLY_USED')
  AND lr.expires_at <= NOW()
ORDER BY lr.expires_at ASC;
```

Process up to 100 rewards per cron run to prevent runaway jobs. Remaining eligible rewards will be picked up on the next run 15 minutes later.

### 5.2 Per-Reward Processing (Atomic Transaction)

For each reward identified in Step 5.1, execute the following within a single database transaction:

**Step 1 — Lock the reward row**

```sql
SELECT reward_id, status
FROM learning_rewards
WHERE reward_id = $reward_id
FOR UPDATE SKIP LOCKED;
```

If `SKIP LOCKED` returns no row (another worker is processing it): skip this reward, continue to next.

**Step 2 — Verify status is still eligible**

Re-confirm `status IN ('ACTIVE', 'PARTIALLY_USED')` and `expires_at <= NOW()`. If another worker already processed this reward (status changed), skip.

**Step 3 — Identify open buy orders funded by this reward**

```sql
SELECT order_id, symbol_code, quantity, price
FROM virtual_orders
WHERE user_id = $user_id
  AND status = 'PENDING'
  AND order_source = $sub_account;  -- or equivalent linkage field
```

For each PENDING order:
- Cancel the order: `UPDATE virtual_orders SET status = 'CANCELLED' WHERE order_id = $order_id`
- Retrieve the locked funds amount from `learning_reward_ledger` for this order's DEBIT entry
- Insert a CREDIT / ORDER_CANCEL entry in `learning_reward_ledger`

**Step 4 — Identify all open positions funded by this reward**

```sql
SELECT
    symbol_code,
    SUM(quantity) AS net_quantity
FROM virtual_orders
WHERE user_id = $user_id
  AND status = 'FILLED'
  AND side = 'BUY'
  AND order_source = $sub_account
  AND symbol_code NOT IN (
      SELECT symbol_code FROM virtual_orders
      WHERE user_id = $user_id AND status = 'FILLED'
        AND side = 'SELL' AND order_source = $sub_account
      GROUP BY symbol_code
  )
GROUP BY symbol_code
HAVING SUM(quantity) > 0;
```

**Step 5 — Force-sell each open position**

For each position identified in Step 4:
- Retrieve the last known market price: `GET /internal/market/price/{symbol_code}` (internal price service call)
- If market is closed or price unavailable: use the last available close price
- Create a virtual sell order:
  ```sql
  INSERT INTO virtual_orders (
      order_id, user_id, symbol_code, side, order_type,
      quantity, price, status, fill_price, order_source
  ) VALUES (
      gen_random_uuid(), $user_id, $symbol_code, 'SELL', 'MARKET',
      $net_quantity, $market_price, 'FILLED', $market_price, $sub_account
  );
  ```
- Compute proceed amount: `$net_quantity * $market_price`
- Insert CREDIT / FORCE_LIQUIDATION entry in `learning_reward_ledger`

**Step 6 — Compute liquidation proceeds**

```
total_proceeds = SUM(net_quantity * market_price) across all force-sold positions
```

Note: No trading fee is charged on force-liquidation sells (educational forgiveness).

**Step 7 — Drain remaining reward balance**

After all positions are liquidated, check `current_balance` from the ledger:
- If `current_balance > 0` (uninvested reward funds remain):
  - Insert DEBIT / EXPIRY entry in `learning_reward_ledger` for the remaining balance
  - These funds are removed; they do NOT go to the main portfolio

**Step 8 — Credit liquidation proceeds to main portfolio**

```sql
UPDATE virtual_portfolios
SET
    available_balance = available_balance + $total_proceeds,
    updated_at        = NOW()
WHERE user_id = $user_id;
```

Only `available_balance` is updated. `total_cash` is NOT changed.

**Step 9 — Mark reward as LIQUIDATED**

```sql
UPDATE learning_rewards
SET
    status                = 'LIQUIDATED',
    liquidated_at         = NOW(),
    liquidation_proceeds  = $total_proceeds,
    updated_at            = NOW()
WHERE reward_id = $reward_id;
```

**Step 10 — Commit transaction**

**Step 11 — Send post-liquidation notification (async, non-blocking)**

```json
{
    "user_id": "<user_id>",
    "title": "Tiền thưởng học tập đã hết hạn",
    "body": "Vị thế của bạn đã được tất toán. 32,000,000 VND được ghi nhận vào tài khoản ảo chính.",
    "data": {
        "screen": "VirtualPortfolio",
        "params": { "tab": "history" }
    }
}
```

If `total_proceeds = 0`: body = "Tiền thưởng học tập đã hết hạn. Không có tiền nào được chuyển vào tài khoản chính."

### 5.3 Partial Failure Handling

If the force-sell of one position fails (e.g., price feed unavailable):
- Do NOT rollback the entire reward — only that position's sell fails
- Log the failure with `{reward_id, symbol_code, error, timestamp}` to the application error log
- Insert a DEBIT / EXPIRY entry for the failed position's current ledger value to neutralise the balance
- Mark the reward LIQUIDATED with `liquidation_proceeds` reflecting only the successfully sold positions
- Alert the operations team via the monitoring system for manual review

---

## 6. Business Logic — TTL Expiry & Notifications

### 6.1 Notification Schedule

For each reward with `status = 'ACTIVE'` or `status = 'PARTIALLY_USED'`:

| Notification | Trigger Time | Title | Body |
|---|---|---|---|
| T+6 (24h warning) | `expires_at - 24 hours` | "Tiền thưởng sắp hết hạn" | "Tiền thưởng [X VND] của bạn sẽ hết hạn trong 24 giờ. Sử dụng ngay trước khi mất!" |
| T+7 (post-liquidation) | After cron processes the reward | "Tiền thưởng học tập đã hết hạn" | See Section 5.2, Step 11 |

### 6.2 Preventing Duplicate Notifications

The `learning_rewards` table tracks notification state. Add the following columns:

```sql
ALTER TABLE learning_rewards
    ADD COLUMN notification_t24h_sent   BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notification_t24h_sent_at TIMESTAMPTZ NULL,
    ADD COLUMN notification_liq_sent    BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notification_liq_sent_at TIMESTAMPTZ NULL;
```

The `reward-expiry-notifier` cron queries:

```sql
SELECT reward_id, user_id, module_id, amount, expires_at
FROM learning_rewards
WHERE status IN ('ACTIVE', 'PARTIALLY_USED')
  AND expires_at <= NOW() + INTERVAL '24 hours'
  AND expires_at >  NOW()
  AND notification_t24h_sent = FALSE;
```

After sending, immediately mark:

```sql
UPDATE learning_rewards
SET notification_t24h_sent = TRUE, notification_t24h_sent_at = NOW()
WHERE reward_id = $reward_id;
```

### 6.3 QUEUED Reward Activation

When a user initialises their virtual portfolio (via `POST /api/v1/virtual/portfolio/initialize` or equivalent), the system must activate any QUEUED rewards:

```sql
SELECT reward_id, user_id, module_id, amount
FROM learning_rewards
WHERE user_id = $user_id
  AND status = 'QUEUED';
```

For each QUEUED reward:
1. Create a sub-account row (same as Step 6b in Section 4.1)
2. Update `learning_rewards`: set `status = 'ACTIVE'`, `expires_at = NOW() + INTERVAL '7 days'`, `sub_account = $new_sub_account_id`
3. Update the initial AWARD ledger entry's reward balance (no new ledger row; the AWARD row already exists)
4. Send the activation push notification (same as Section 4.1 Step 8)

This activation logic must be added as a post-hook to the virtual portfolio initialisation flow. It must execute within the same transaction as the portfolio creation.

---

## 7. Integration Points

### 7.1 Learning Service → Reward Service

| Event | Trigger | Data passed | Action |
|-------|---------|-------------|--------|
| MKC pass | `POST /learning-rewards/complete-module` | `user_id`, `module_id`, `mkc_score`, `completed_at` | Insert completion + grant reward |
| Admin override | Internal `POST /admin/learning/grant-completion` | Same + `completion_source = 'ADMIN_GRANT'` | Same flow, bypasses mkc_score ≥ 3 check |

### 7.2 Reward Service → Virtual Trading Service

| Interaction | Direction | Method |
|-------------|-----------|--------|
| Check virtual account exists | Reward → VT | `SELECT` on `virtual_portfolios` |
| Credit liquidation proceeds | Reward → VT | `UPDATE virtual_portfolios SET available_balance` |
| Cancel open orders on expiry | Reward → VT | `UPDATE virtual_orders SET status = 'CANCELLED'` |
| Create force-sell orders | Reward → VT | `INSERT INTO virtual_orders` |
| Identify open positions | Reward → VT | `SELECT` on `virtual_orders` |

All interactions are direct database operations within the same PostgreSQL instance. There are no inter-service HTTP calls for these operations.

### 7.3 Reward Service → Push Notification Service

The push notification service accepts:

```json
{
    "user_id": "string (UUID)",
    "title": "string",
    "body": "string",
    "data": {
        "screen": "string",
        "params": {}
    }
}
```

All pushes from this system are sent asynchronously (fire-and-forget with retry). Push failures do not affect reward grant transactions. Retry policy: exponential backoff, 3 attempts, max delay 5 minutes.

### 7.4 Order Placement — Reward Balance Deduction

When a user places a virtual buy order and the order form indicates reward balance is being used (the client passes a `funding_source: "learning_reward"` flag or the backend infers it), the backend must:

1. Verify the user has sufficient reward balance: query the latest `balance_after` from `learning_reward_ledger`
2. Deduct from the reward ledger (DEBIT / BUY_ORDER entry) **before** confirming the order
3. If reward balance is insufficient for the full order: either reject with `ERR_INSUFFICIENT_REWARD_BALANCE` or split funding between reward and main balance (product decision — default: reject; require explicit split from client)
4. On order fill: no additional ledger entry (funds already debited at order placement)
5. On order cancel/expire: INSERT CREDIT / ORDER_CANCEL or ORDER_EXPIRE entry to restore the balance

> **Open question for product:** Should partial funding (reward balance + main balance for a single order) be supported? Default spec assumes no — reward balance must cover the full order, or the order uses main balance entirely.

### 7.5 Client AsyncStorage Compatibility

The mobile app currently writes learning progress to AsyncStorage. This system does not break that behaviour. AsyncStorage remains a local cache for UI responsiveness. The server-side `learning_module_completions` table is the authoritative source for:
- Reward eligibility
- Idempotency checking
- Admin support queries

The app must call `POST /learning-rewards/complete-module` on every MKC pass, regardless of whether AsyncStorage already has the completion recorded.

---

## 8. Validation Logic

### 8.1 `POST /api/v1/virtual/learning-rewards/complete-module`

| Field | Rule | Error Code | HTTP Status | Error Message |
|-------|------|------------|-------------|---------------|
| Authorization header | Must be present | `ERR_AUTH_MISSING_TOKEN` | 401 | "Authentication required." |
| Authorization token | Must be a valid, non-expired JWT | `ERR_AUTH_INVALID_TOKEN` | 401 | "Invalid or expired authentication token." |
| `module_id` | Must be present | `ERR_MISSING_FIELD` | 400 | "module_id is required." |
| `module_id` | Must be integer | `ERR_INVALID_TYPE` | 400 | "module_id must be an integer." |
| `module_id` | Must be in {1, 2, 3, 4} | `ERR_INVALID_MODULE_ID` | 400 | "module_id must be 1, 2, 3, or 4." |
| `mkc_score` | Must be present | `ERR_MISSING_FIELD` | 400 | "mkc_score is required." |
| `mkc_score` | Must be integer | `ERR_INVALID_TYPE` | 400 | "mkc_score must be an integer." |
| `mkc_score` | Must be in [0, 5] | `ERR_INVALID_MKC_SCORE` | 400 | "mkc_score must be between 0 and 5." |
| `mkc_score` | Must be ≥ 3 (passing threshold) | `ERR_MKC_SCORE_TOO_LOW` | 422 | "MKC score does not meet the passing threshold of 3." |
| `completed_at` | Must be present | `ERR_MISSING_FIELD` | 400 | "completed_at is required." |
| `completed_at` | Must be a valid ISO 8601 datetime | `ERR_INVALID_DATETIME` | 400 | "completed_at must be a valid ISO 8601 datetime." |
| `completed_at` | Must not be more than 5 minutes in the future | `ERR_COMPLETED_AT_IN_FUTURE` | 422 | "completed_at cannot be more than 5 minutes in the future." |
| `completed_at` | Must not be more than 24 hours in the past | `ERR_COMPLETED_AT_TOO_OLD` | 422 | "completed_at is too far in the past. Use the current timestamp." |
| `user_id` (from token) | Must exist in `users` table | `ERR_USER_NOT_FOUND` | 404 | "User not found." |
| `user_id` + `module_id` | Must not have prerequisite modules incomplete (server-side ordering check) | `ERR_PREREQUISITE_NOT_MET` | 422 | "Module [N] cannot be completed before completing Module [N-1]." |

### 8.2 Prerequisite Module Ordering

Before granting a reward, the server validates that prerequisite modules are complete:

| Module being completed | Required prior completion |
|------------------------|---------------------------|
| M1 | None |
| M2 | M1 must be complete OR placement quiz skipped M1 |
| M3 | M2 must be complete |
| M4 | M3 must be complete |

```sql
-- M2 prerequisite check example:
SELECT COUNT(*) FROM learning_module_completions
WHERE user_id = $user_id AND module_id = 1;
-- Must be 1, OR check placement_quiz_m1_skipped flag in user_learning_state
```

### 8.3 Order Placement with Reward Funds

| Check | Rule | Error Code | HTTP Status | Error Message |
|-------|------|------------|-------------|---------------|
| Reward status | Must be ACTIVE or PARTIALLY_USED | `ERR_REWARD_NOT_ACTIVE` | 422 | "Learning reward is not active." |
| Reward balance | `amount_remaining >= order_total` | `ERR_INSUFFICIENT_REWARD_BALANCE` | 422 | "Insufficient learning reward balance. Available: [X] VND." |
| Reward TTL | `expires_at > NOW()` | `ERR_REWARD_EXPIRED` | 422 | "Learning reward has expired." |

---

## 9. Error Handling Matrix

| Scenario | System Action | HTTP Status | Error Code | User-Facing Message (VI) |
|----------|---------------|-------------|------------|--------------------------|
| Duplicate module completion (same user, same module) | Return existing completion record; no DB write | 200 OK | — (not an error) | — (success response with `idempotent: true`) |
| MKC score below passing threshold (< 3) | Reject; do not write completion | 422 | `ERR_MKC_SCORE_TOO_LOW` | "Điểm chưa đạt yêu cầu để hoàn thành module." |
| Virtual account not initialized at reward grant time | Insert `learning_rewards` with `status = QUEUED`; no error | 201 | — | Reward shown as queued; activated when portfolio is created |
| Virtual account not initialized at order placement | Reject order | 422 | `ERR_VIRTUAL_ACCOUNT_NOT_INITIALIZED` | "Tài khoản ảo chưa được khởi tạo. Vui lòng khởi tạo trước khi giao dịch." |
| Insufficient reward balance for order | Reject order; do not partially deduct | 422 | `ERR_INSUFFICIENT_REWARD_BALANCE` | "Số dư thưởng học tập không đủ. Có thể dùng số dư chính thay thế." |
| Reward already expired when order is attempted | Reject order; trigger expiry processing if not yet done | 422 | `ERR_REWARD_EXPIRED` | "Tiền thưởng học tập đã hết hạn." |
| Force-liquidation: price feed unavailable for one position | Neutralise ledger balance for that position; continue liquidating other positions; log error; mark reward LIQUIDATED anyway | — (cron job, no HTTP) | — | Post-liquidation push notification body notes discrepancy; ops alert triggered |
| Force-liquidation: virtual_portfolios row not found | Log critical error; mark reward LIQUIDATED; available_balance NOT updated (data integrity preserved over silent failure) | — | — | Ops alert with `{reward_id, user_id, proceeds_undelivered}` |
| Force-liquidation: concurrent cron run attempts same reward | `FOR UPDATE SKIP LOCKED` prevents double-processing; second worker skips | — | — | — |
| Invalid idempotency key format | Log warning; process as new request (no idempotency protection on that call) | — | — | — |
| DB transaction deadlock | Automatic retry (up to 3 times with exponential backoff); if still failing after 3 attempts: 503 | 503 | `ERR_SERVICE_UNAVAILABLE` | "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau." |
| Push notification service unavailable | Log; queue for retry (3 attempts, exponential backoff); reward grant transaction already committed and is NOT rolled back | — | — | Reward is granted; notification may be delayed by up to 5 minutes |
| User attempts to complete M3 without M2 complete | Reject; do not write completion | 422 | `ERR_PREREQUISITE_NOT_MET` | "Cần hoàn thành Module 2 trước khi học Module 3." |
| Admin grant bypasses mkc_score check | Allowed; `completion_source = 'ADMIN_GRANT'`; mkc_score can be any value 0–5 | 201 | — | — |
| `completed_at` more than 5 minutes in the future | Reject; possible clock skew or replay attack | 422 | `ERR_COMPLETED_AT_IN_FUTURE` | "Thời gian hoàn thành không hợp lệ. Vui lòng kiểm tra đồng hồ thiết bị." |
| `completed_at` more than 24 hours in the past | Reject; stale event (should have been queued and sent sooner) | 422 | `ERR_COMPLETED_AT_TOO_OLD` | "Sự kiện hoàn thành đã quá cũ. Vui lòng đồng bộ lại ứng dụng." |
| Reward ledger balance goes negative (invariant violation) | Database constraint `balance_after >= 0` prevents this at DB level; application layer must double-check before inserting DEBIT | 500 | `ERR_LEDGER_INVARIANT_VIOLATION` | "Đã xảy ra lỗi hệ thống. Vui lòng liên hệ hỗ trợ." |

---

## 10. Cron Job Specifications

### 10.1 `reward-expiry-notifier`

| Property | Value |
|----------|-------|
| Schedule | `0 * * * *` (every hour, on the hour) — see note |
| Timezone | Asia/Ho_Chi_Minh (UTC+7) |
| Concurrency | Single instance (cron lock via `pg_advisory_xact_lock` or equivalent) |
| Execution time budget | Max 60 seconds per run |
| Max records per run | 500 |

> Note: Running hourly (not daily) ensures 24h-warning notifications are delivered within ±1 hour of the target time, which is acceptable given the 7-day TTL. A daily run risks missing rewards that expire within the current day.

#### Algorithm

```
1. Acquire advisory lock: pg_advisory_xact_lock(hash('reward-expiry-notifier'))
2. Query eligible rewards:
   SELECT reward_id, user_id, module_id, amount, expires_at
   FROM learning_rewards
   WHERE status IN ('ACTIVE', 'PARTIALLY_USED')
     AND expires_at <= NOW() + INTERVAL '25 hours'   -- slight buffer above 24h
     AND expires_at >  NOW()
     AND notification_t24h_sent = FALSE
   ORDER BY expires_at ASC
   LIMIT 500;

3. For each reward:
   a. Compute amount_remaining (latest balance_after from learning_reward_ledger)
   b. Format notification body with amount_remaining and hours_until_expiry
   c. Call push notification service (async)
   d. UPDATE learning_rewards SET notification_t24h_sent = TRUE,
      notification_t24h_sent_at = NOW()
      WHERE reward_id = $reward_id;

4. Log: { run_at, rewards_notified, duration_ms }
5. Release advisory lock (auto-released on transaction commit)
```

#### Notification Payload

```json
{
    "user_id": "<user_id>",
    "title": "Tiền thưởng sắp hết hạn",
    "body": "Bạn còn <X VND> tiền thưởng học tập. Hết hạn trong <N> giờ!",
    "data": {
        "screen": "VirtualPortfolio",
        "params": { "highlight": "learning_rewards" }
    }
}
```

---

### 10.2 `reward-force-liquidator`

| Property | Value |
|----------|-------|
| Schedule | `*/15 * * * *` (every 15 minutes) |
| Timezone | Asia/Ho_Chi_Minh (UTC+7) |
| Concurrency | Single instance (cron lock) |
| Execution time budget | Max 10 minutes per run |
| Max records per run | 100 rewards |

#### Algorithm

```
1. Acquire advisory lock: pg_advisory_xact_lock(hash('reward-force-liquidator'))

2. Query eligible rewards:
   SELECT lr.reward_id, lr.user_id, lr.sub_account, lr.module_id,
          lrl.balance_after AS current_balance
   FROM learning_rewards lr
   JOIN LATERAL (
       SELECT balance_after FROM learning_reward_ledger
       WHERE reward_id = lr.reward_id
       ORDER BY ledger_id DESC LIMIT 1
   ) lrl ON true
   WHERE lr.status IN ('ACTIVE', 'PARTIALLY_USED')
     AND lr.expires_at <= NOW()
   ORDER BY lr.expires_at ASC
   LIMIT 100;

3. For each reward:
   BEGIN TRANSACTION;
   
   a. SELECT ... FOR UPDATE SKIP LOCKED (skip if another worker has it)
   b. Re-verify status and expires_at
   c. Cancel all PENDING orders for this sub_account
      → INSERT CREDIT/ORDER_CANCEL ledger entries for each cancelled order
   d. Identify open positions for this sub_account (net long positions from FILLED orders)
   e. For each open position:
      i.   Fetch market price (last known close if market closed)
      ii.  Create FILLED SELL virtual_order
      iii. INSERT CREDIT/FORCE_LIQUIDATION ledger entry
      iv.  If price fetch fails: INSERT DEBIT/EXPIRY for the position's current ledger value
           Log error; continue to next position
   f. Drain remaining uninvested balance:
      IF current_balance_after_liquidation > 0:
          INSERT DEBIT/EXPIRY ledger entry
   g. Compute total_proceeds = SUM of FORCE_LIQUIDATION CREDIT amounts
   h. UPDATE virtual_portfolios SET available_balance += total_proceeds
   i. UPDATE learning_rewards SET status='LIQUIDATED', liquidated_at=NOW(),
      liquidation_proceeds=total_proceeds
   j. COMMIT TRANSACTION

   k. Send post-liquidation push notification (async)

4. Log: { run_at, rewards_processed, total_positions_liquidated,
           total_proceeds_credited, errors, duration_ms }

5. If errors list is non-empty: trigger ops alert (PagerDuty / Slack #alerts)

6. Release advisory lock
```

#### Failure Modes and Recovery

| Failure | Behaviour |
|---------|-----------|
| Transaction fails on COMMIT | Rollback; reward remains ACTIVE/PARTIALLY_USED; next 15-minute run retries |
| Price feed down for all symbols | All position sells fail; positions marked with DEBIT/EXPIRY at their ledger value; ops alerted |
| `virtual_portfolios` row missing | Proceeds not credited; reward marked LIQUIDATED; critical alert to ops team |
| Cron job crashes mid-run | Partially processed rewards: those that committed are done; those that didn't are retried on next run because they still have `status IN ('ACTIVE', 'PARTIALLY_USED')` |

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Requirement | Target |
|-------------|--------|
| `POST /complete-module` response time (p95) | < 500ms including DB transaction and ledger write |
| `GET /learning-rewards` response time (p95) | < 200ms |
| `GET /learning-rewards/balance` response time (p95) | < 100ms |
| Modified `GET /profit-loss` additional latency (vs. baseline) | < 50ms (one additional JOIN query) |
| Force-liquidator: per-reward processing time | < 5 seconds including all position sells and DB writes |
| Force-liquidator: total batch (100 rewards) | < 8 minutes (within 10-minute budget) |

### 11.2 Reliability

| Requirement | Target |
|-------------|--------|
| Reward grant transaction durability | ACID; reward is either fully granted or not at all |
| Ledger correctness | `balance_after` must always be ≥ 0; enforced by DB constraint and application pre-check |
| Idempotency | `(user_id, module_id)` unique constraint in `learning_rewards` and `learning_module_completions` guarantees exactly-once grant |
| Cron job idempotency | `FOR UPDATE SKIP LOCKED` + status checks ensure no reward is processed twice |
| Push notification retries | 3 attempts, exponential backoff; failure does not affect reward grant |

### 11.3 Security

| Requirement | Enforcement |
|-------------|-------------|
| User can only see their own rewards | `WHERE user_id = (user_id from JWT)` on all queries |
| `mkc_score` must meet threshold server-side | Backend validates ≥ 3 independently of client claim |
| Module ordering enforced server-side | Prerequisite check before any completion is recorded |
| Admin grant endpoint (`completion_source = 'ADMIN_GRANT'`) | Protected by admin role JWT claim; not accessible via standard user tokens |
| Reward ledger is append-only | No `UPDATE` or `DELETE` operations on `learning_reward_ledger`; enforced via application code and optionally via PostgreSQL row-level security |
| Force-liquidation cannot be triggered by user | The liquidation path is only invoked by the cron job; no user-facing API endpoint exists for it |

### 11.4 Observability

All of the following must be logged for every reward-affecting event:

| Event | Log Fields |
|-------|-----------|
| Reward granted | `user_id`, `reward_id`, `module_id`, `amount`, `status`, `duration_ms` |
| Reward activated from QUEUED | `user_id`, `reward_id`, `module_id`, `triggered_by: 'portfolio_init'` |
| T+6 notification sent | `user_id`, `reward_id`, `notification_type: 't24h_warning'`, `amount_remaining` |
| Force-liquidation started | `reward_id`, `user_id`, `open_positions_count`, `current_balance` |
| Force-liquidation completed | `reward_id`, `user_id`, `total_proceeds`, `positions_liquidated`, `errors_count` |
| Cron job run | `job_name`, `run_at`, `rewards_processed`, `duration_ms`, `errors` |

Metrics to expose (Prometheus or equivalent):
- `learning_rewards_granted_total{module_id}` — counter
- `learning_rewards_liquidated_total{module_id}` — counter
- `learning_rewards_active_count` — gauge
- `learning_reward_liquidator_duration_seconds` — histogram
- `learning_reward_proceeds_credited_total_vnd` — counter

### 11.5 Data Integrity Constraints Summary

| Constraint | Table | Type |
|------------|-------|------|
| One completion per (user, module) | `learning_module_completions` | UNIQUE |
| One reward per (user, module) | `learning_rewards` | UNIQUE |
| One sub-account per (user, module) | `learning_reward_sub_accounts` | UNIQUE |
| Reward amount > 0 | `learning_rewards` | CHECK |
| Ledger `balance_after` ≥ 0 | `learning_reward_ledger` | CHECK |
| Ledger amount > 0 | `learning_reward_ledger` | CHECK |
| `liquidated_at` and `liquidation_proceeds` set together | `learning_rewards` | CHECK (chk_liquidated_fields) |
| `sub_account` required when status != QUEUED | `learning_rewards` | CHECK (chk_sub_account_required_when_active) |
| `module_id` 1–4 for completions | `learning_module_completions` | CHECK |
| `module_id` 2–4 for rewards (M1 has no reward) | `learning_rewards` | CHECK |

### 11.6 Migration Strategy

1. Deploy new tables (`learning_reward_sub_accounts`, `learning_rewards`, `learning_reward_ledger`, `learning_module_completions`) with no downtime — additive schema change
2. Add notification columns to `learning_rewards` as nullable with defaults — additive
3. Add `order_source` column to `virtual_orders` if not already present (used to link orders to reward sub-accounts)
4. Deploy new API endpoints (no changes to existing endpoints except the additive fields to `/profit-loss`)
5. Deploy cron jobs (initially paused; enable after smoke-test in staging)
6. Enable cron jobs in production
7. No backfill needed for historical data — system applies to completions from deploy date forward

---

*End of SRD: F0 Learning Path — Virtual Capital Rewards v1.0*
