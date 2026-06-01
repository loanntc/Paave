# F0 Learning Path — Virtual Capital Rewards FRD

**Version:** 1.0
**Date:** 2026-06-01
**Status:** Draft — Requires Backend API
**Linked Dev/QA Spec:** `docs/DEV-QA-SPEC-F0-Learning-Path.md`
**Author:** Business Analyst Agent

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Reward Schedule](#2-reward-schedule)
3. [Functional Requirements](#3-functional-requirements)
4. [Business Rules](#4-business-rules)
5. [Edge Cases](#5-edge-cases)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Integration with Existing Systems](#8-integration-with-existing-systems)
9. [Deprecation / Migration from V1 (AsyncStorage-only)](#9-deprecation--migration-from-v1-asyncstorage-only)

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| **Feature** | Virtual Capital Rewards for F0 Learning Path |
| **Primary Actor** | F0 Learner (authenticated Paave user enrolled in the F0 Learning Path) |
| **Secondary Actors** | Backend Scheduler (TTL enforcement, force-liquidation cron), Push Notification Service |
| **Goal** | Incentivize module completion by granting virtual cash bonuses that learners can use in the virtual trading portfolio, reinforcing the connection between learning and practice |
| **Trigger** | Backend receives a verified Module Knowledge Check (MKC) pass event for M2, M3, or M4 (score ≥ 3/5) |
| **Scope** | Virtual portfolio bonus sub-ledger creation, TTL management, force-liquidation, reward display in portfolio UI, push notifications, reward status API, idempotency enforcement, queued rewards for uninitialised accounts |
| **Out of Scope** | Real cash rewards of any kind; XP rewards (covered in FR-GAME series); badge/achievement grants (covered in FR-BADGE series); module unlock logic (covered in existing F0 FRD `01-requirements.md`); actual brokerage account credits; M1 reward (none exists by design); any modification to the base 500,000,000 VND starting balance initialization flow |

### Context: Why This Feature Exists Now

The existing FRD `01-requirements.md` explicitly marked `Bonus cash rewards` as _"Removed entirely from V2 architecture"_ because the F0 Learning Path was frontend-only (AsyncStorage). A backend is now being added to the F0 Learning Path. This document specifies the reward system that was deferred and is now implementable.

### Architecture Dependency

This feature requires:
1. A backend API layer for the F0 Learning Path (new — does not exist in V1)
2. The existing Virtual Trading Portfolio API (`/api/v1/virtual/*`)
3. A new bonus cash sub-ledger table in the virtual portfolio database
4. A scheduled job runner for TTL expiry and force-liquidation

---

## 2. Reward Schedule

| Module | Vietnamese Title | MKC Pass Condition | Cash Bonus (VND) | TTL | Notes |
|--------|-----------------|-------------------|------------------|-----|-------|
| M1 | Cổ phiếu cơ bản | MKC score ≥ 3/5 | **None** | — | M1 reward is M2 access. No cash. M1 skipped via placement quiz also yields no cash. |
| M2 | Phân tích cơ bản | MKC score ≥ 3/5 | **50,000,000** | 7 days from `awarded_at` | Core reward. Largest bonus. Signals: "You've learned to trade — here's capital to try." |
| M3 | Chiến lược đầu tư | MKC score ≥ 3/5 | **25,000,000** | 7 days from `awarded_at` | Reward for sustained commitment. Independent TTL from M2. |
| M4 | Quản lý rủi ro | MKC score ≥ 3/5 | **25,000,000** | 7 days from `awarded_at` | Final module completion bonus. Independent TTL from M2 and M3. |

**Total maximum bonus:** 100,000,000 VND (if all 3 eligible modules completed; concurrent TTLs)
**Maximum virtual capital from learning alone:** 600,000,000 VND (500,000,000 starting balance + 100,000,000 bonus)

### Bonus TTL Timeline per Module

```
awarded_at (T+0)
    │
    ├── T+6d 00:00 → Push notification: "24 hours remaining"
    ├── T+6d 23:00 → Push notification: "1 hour remaining"
    └── T+7d 00:00 → Force-liquidation job runs; status → EXPIRED
```

> **Each module bonus has its own independent TTL.** A user who earns M2 on Day 1 and M3 on Day 5 has M2 expiring on Day 8 and M3 expiring on Day 12. TTLs do not merge.

---

## 3. Functional Requirements

---

### FR-REWARD-01: Module Completion Reward Grant

**Actor:** Backend System (triggered by verified MKC pass event)

**Description:**
When the backend receives a verified MKC pass for M2, M3, or M4 (score ≥ 3/5), it creates a bonus cash ledger record for the corresponding amount and credits it to the user's virtual portfolio bonus sub-ledger. The frontend AsyncStorage flag `f0_mkc_{n}_state = PASSED` is not sufficient — the backend must independently verify completion from its own module progress store.

**Input:**
- `user_id` (UUID, required)
- `module_id` (enum: `M2` | `M3` | `M4`, required)
- `mkc_score` (integer 0–5, required)
- `mkc_attempt_id` (UUID, required — used as idempotency key)
- `completed_at` (ISO 8601 UTC timestamp, required — server-generated at time of MKC pass)

**Output:**
- New record in `bonus_cash_ledger` table:
  - `ledger_id`: UUID (generated)
  - `user_id`: matches input
  - `module_id`: matches input
  - `amount`: 50,000,000 (M2) or 25,000,000 (M3 or M4), in VND, stored as integer
  - `status`: `ACTIVE`
  - `awarded_at`: server UTC timestamp (NOT the client timestamp)
  - `expires_at`: `awarded_at + 7 days` (exact to the second)
  - `available_balance`: equal to `amount` at creation
  - `idempotency_key`: `{user_id}:{module_id}:{mkc_attempt_id}`
- HTTP response to internal event consumer: `201 Created` with ledger record JSON
- If virtual account not yet initialized: record created with `status = QUEUED` (see FR-REWARD-08)

**Preconditions:**
1. User is authenticated
2. Module is M2, M3, or M4 (M1 yields no reward — this FR does not apply to M1)
3. MKC score is ≥ 3/5
4. No existing `bonus_cash_ledger` record with `status` in (`ACTIVE`, `EXPIRED`, `QUEUED`) for the same `{user_id, module_id}` combination (idempotency guard — see FR-REWARD-07)
5. Backend module progress store has the MKC pass recorded (frontend AsyncStorage is not authoritative)

**Postconditions:**
1. `bonus_cash_ledger` record exists with `status = ACTIVE` (or `QUEUED` if account uninitialised)
2. Virtual portfolio's `available_balance` (bonus sub-ledger) is increased by the award amount
3. Module Completion Modal on frontend displays the bonus line (e.g., "50,000,000 VND tiền thưởng · còn 7 ngày")
4. `awarded_at` is immutable — it is never updated after creation

**Failed Cases:**

| Failure Scenario | Error Code | System Action | User-Facing Message |
|------------------|-----------|---------------|---------------------|
| `module_id = M1` | `REWARD_NOT_APPLICABLE` | Return 200 OK, no ledger record created | None (silent; not an error) |
| `mkc_score < 3` | `REWARD_NOT_APPLICABLE` | Return 200 OK, no ledger record created | None (silent) |
| MKC not verified in backend progress store | `REWARD_VERIFICATION_FAILED` | Return 400; log discrepancy for investigation | "Không thể cấp thưởng. Liên hệ hỗ trợ nếu vấn đề tiếp tục." |
| Duplicate ledger exists | `REWARD_ALREADY_GRANTED` | Return 200 OK, return existing ledger record | None (idempotent, not an error) |
| Virtual portfolio DB unavailable | `PORTFOLIO_SERVICE_UNAVAILABLE` | Return 503; retry 3× with 2s back-off; on final failure: enqueue for delayed processing | None shown immediately; retry in background |
| `awarded_at` cannot be generated (clock error) | `SERVER_CLOCK_ERROR` | Return 500; alert on-call; do not create record | "Lỗi hệ thống. Vui lòng thử lại." |

**Edge Cases:**
- M1 skipped via placement quiz: M1 is treated as COMPLETE; no reward is generated; FR-REWARD-01 is not triggered
- MKC retried multiple times before award processes: only the first `mkc_attempt_id` that passes creates a ledger record; subsequent passes are deduplicated via idempotency key
- Network timeout between MKC pass and award creation: the event is retried from a message queue; idempotency key prevents double-award

---

### FR-REWARD-02: Reward Ledger Display

**Actor:** F0 Learner

**Description:**
The virtual portfolio screen displays all active bonus cash rewards as a distinct, separately labelled section ("Tiền thưởng học tập") that is visually and semantically separate from the user's main virtual cash balance. Each active bonus shows its current available balance and a countdown to TTL expiry.

**Input:**
- Authenticated `user_id`
- `GET /api/v1/virtual/portfolio/{user_id}` response (existing endpoint — must be extended)
- `GET /api/v1/virtual/rewards/{user_id}` response (new endpoint — see FR-REWARD-06)

**Output:**
In the virtual portfolio UI, a section titled **"Tiền thưởng học tập"** containing:
- For each `ACTIVE` bonus ledger record:
  - Label: Module name in Vietnamese (e.g., "Phân tích cơ bản")
  - Amount: current `available_balance` in VND, formatted with commas (e.g., `50,000,000 VND`)
  - TTL countdown: `còn X ngày Y giờ` (e.g., "còn 6 ngày 4 giờ")
  - Status indicator: `ACTIVE` shown as a green pill labelled "Đang hoạt động"
- For each `EXPIRED` bonus ledger record (show for 24 hours post-expiry only):
  - Label: Module name
  - Amount: 0 VND
  - Status: grey pill labelled "Đã hết hạn"
  - Message: "Đã tất toán vào [date]"
- A summary line: **"Tổng tiền thưởng: X VND"** (sum of all ACTIVE `available_balance` values)
- If no active or recently expired bonuses: section is hidden entirely (do not show an empty section)

**Display Rules:**
- The section appears BELOW the main balance section and ABOVE the holdings/positions section
- "Tiền ảo" label is always visible per existing system — this section does NOT replace it
- The main balance figure (`available_balance` of the main ledger) must NEVER include bonus cash
- TTL countdown refreshes every 60 seconds while the portfolio screen is in the foreground
- If a bonus expires while the user has the portfolio screen open: countdown reaches 0:00, status pill changes to "Đang tất toán..." (loading state), then updates to "Đã hết hạn" when the expiry job confirms completion

**Preconditions:**
1. User is authenticated
2. User has at least one `bonus_cash_ledger` record with `status = ACTIVE` or `status = EXPIRED` with `expires_at` within the last 24 hours

**Postconditions:**
1. Portfolio screen correctly reflects current bonus balance
2. Main balance figure is unchanged and accurate
3. Countdown timer counts down correctly

**Failed Cases:**

| Failure Scenario | Error Code | System Action | User-Facing Message |
|------------------|-----------|---------------|---------------------|
| Rewards API returns 500 | `REWARDS_SERVICE_ERROR` | Hide the "Tiền thưởng học tập" section; log error | None (silent degradation; main portfolio still visible) |
| Rewards API times out (> 5s) | `REWARDS_TIMEOUT` | Show section with loading skeleton for up to 5s; on timeout, hide section | None |
| `available_balance` is negative (data error) | `INVALID_BALANCE_STATE` | Display 0 VND; log alert for data team | None |
| Clock drift causes negative TTL display | — | Display "0 ngày 0 giờ" — never show negative countdown | None |

**Edge Cases:**
- User earns M3 reward while M2 reward is still active: both show as separate rows in the section; TTLs are independent
- User has earned all 3 rewards simultaneously: three rows are shown; summary shows total (up to 100,000,000 VND)
- Reward expires during app background: on next foreground, section refreshes from API; expired row shows for 24h then disappears

---

### FR-REWARD-03: Using Reward Funds

**Actor:** F0 Learner

**Description:**
Within the 7-day TTL, the user can place virtual paper trades using bonus cash just like normal virtual cash. The trading flow (buy/sell orders on the virtual portfolio) must draw from bonus cash when the user's main `available_balance` is insufficient or when the user's order is explicitly sourced from bonus funds. Bonus funds are tracked on the sub-ledger level: each trade funded (partially or fully) by bonus cash is tagged with the `ledger_source = bonus_cash_ledger_id`.

**Input:**
- Standard virtual trade order payload (existing `POST /api/v1/virtual/orders`)
- Extended field: system automatically assigns `ledger_source` based on fund availability (user does not manually select; system applies bonus funds after main balance is depleted, or if main balance is 0)
- `bonus_cash_ledger_id` (UUID, assigned server-side based on which active bonus record funds the trade)

**Allocation Order for Buy Orders:**
1. Main `available_balance` is consumed first
2. Bonus cash `available_balance` is consumed only after main balance reaches 0
3. If multiple active bonus ledgers exist, oldest `awarded_at` bonus is consumed first (FIFO)

**Output:**
- Trade executed using normal virtual trading rules (existing system)
- `bonus_cash_ledger.available_balance` decremented by the bonus-funded portion of the trade
- Trade record tagged with `ledger_source = {bonus_cash_ledger_id}` for the bonus-funded portion
- Portfolio display updates: bonus `available_balance` decreases; main balance unchanged if main funds were sufficient

**Preconditions:**
1. User has at least one bonus ledger record with `status = ACTIVE`
2. Bonus `available_balance > 0`
3. Bonus `expires_at > now()` (not yet expired; see BR-07 — frozen funds rule)
4. Total available funds (main + bonus) cover the order value

**Postconditions:**
1. Trade is placed and recorded under `virtual_trades` table
2. `bonus_cash_ledger.available_balance` is decremented by the bonus-funded portion
3. If the entire main balance and all bonus balance are consumed, the user sees 0 VND available
4. The trade is reversible (sell order) within the normal virtual trading rules

**Failed Cases:**

| Failure Scenario | Error Code | System Action | User-Facing Message |
|------------------|-----------|---------------|---------------------|
| Insufficient total funds (main + all active bonus) | `INSUFFICIENT_FUNDS` | Reject order | "Số dư không đủ để đặt lệnh này." |
| Bonus expired between order creation and execution | `BONUS_EXPIRED_DURING_ORDER` | Reattempt using main balance only; if still insufficient, reject | "Tiền thưởng đã hết hạn. Lệnh không đủ số dư." |
| Bonus status = `FROZEN` (expired but not yet liquidated) | `BONUS_FUNDS_FROZEN` | Block use of frozen bonus; use main balance only | "Tiền thưởng đang trong quá trình tất toán và không thể sử dụng." |
| Multiple active bonuses and first is fully depleted mid-order | — | System cascades to next oldest active bonus automatically | None |

**Edge Cases:**
- User places a buy order that partially overlaps main balance and bonus cash: system splits the order funding automatically; user sees no difference in order flow
- User sells a position that was partially funded by bonus cash: proceeds from the sale credit back to the bonus ledger's `available_balance` up to the original bonus-funded amount; the remainder credits to main balance
- User tries to place an order when only frozen (post-expiry, pre-liquidation) bonus funds are available and main balance is 0: order is rejected with `BONUS_FUNDS_FROZEN` error

---

### FR-REWARD-04: TTL Expiry Notification

**Actor:** Push Notification Service (system actor) → F0 Learner (recipient)

**Description:**
The system sends push notifications to warn the user before their bonus cash expires. Two notification windows per active bonus ledger: 24 hours before expiry and 1 hour before expiry. Notifications are delivered via the existing Paave push notification infrastructure (FCM for Android, APNs for iOS).

**Notification Templates:**

**24-hour warning (`EXPIRY_24H`):**
- Title: "Tiền thưởng học tập sắp hết hạn"
- Body: "50,000,000 VND thưởng từ [Module Name] sẽ hết hạn sau 24 giờ. Dùng ngay trước khi mất!"
- Deep link: `paave://virtual-portfolio?tab=rewards`
- Badge: +1 to app badge count

**1-hour warning (`EXPIRY_1H`):**
- Title: "Còn 1 giờ! Tiền thưởng sắp hết"
- Body: "[Amount] VND thưởng từ [Module Name] sẽ hết hạn sau 1 giờ. Tất toán đang đến gần."
- Deep link: `paave://virtual-portfolio?tab=rewards`
- Badge: +1 to app badge count

**Post-expiry confirmation (`EXPIRY_COMPLETE`):**
- Title: "Tiền thưởng học tập đã hết hạn"
- Body: "Lệnh tất toán đã hoàn tất. Kết quả giao dịch của bạn đã được lưu vào danh mục."
- Deep link: `paave://virtual-portfolio?tab=history`
- Badge: +1 to app badge count

**Input:**
- Scheduled job reads `bonus_cash_ledger` records where:
  - `status = ACTIVE`
  - `expires_at BETWEEN now() + 23h55m AND now() + 24h05m` (±5 min window for 24h notification)
  - `notification_24h_sent = false`
- Similarly for 1h notification: `expires_at BETWEEN now() + 55m AND now() + 65m`, `notification_1h_sent = false`
- Post-expiry: triggered by force-liquidation job completion (FR-REWARD-05)

**Output:**
- Push notification delivered to user's registered device(s)
- `bonus_cash_ledger.notification_24h_sent = true` (or `notification_1h_sent = true`) set atomically after successful delivery
- `notification_sent_at` timestamp recorded

**Preconditions:**
1. User has opted in to push notifications (or has not explicitly opted out — follow existing Paave notification permission model)
2. The `bonus_cash_ledger` record has `status = ACTIVE`
3. The corresponding notification flag (`notification_24h_sent` or `notification_1h_sent`) is `false`

**Postconditions:**
1. Push notification is delivered (or queued if device offline; delivery handled by FCM/APNs)
2. The notification flag is set to `true` — the same notification will NOT be re-sent even if the cron job re-runs
3. If user has multiple active bonuses expiring at the same time: one notification per ledger record (not batched into one message)

**Failed Cases:**

| Failure Scenario | Error Code | System Action | User-Facing Message |
|------------------|-----------|---------------|---------------------|
| Push token not registered | `PUSH_TOKEN_MISSING` | Skip notification; log user_id; no retry | N/A |
| FCM/APNs returns error | `PUSH_DELIVERY_FAILED` | Retry up to 3× with exponential back-off (30s, 2m, 10m); after 3 failures, mark `notification_24h_sent = true` to avoid infinite retry | N/A |
| Ledger record expires before 24h notification job runs (e.g., cron missed a cycle) | — | Skip 24h notification; 1h notification still attempted | N/A |
| User uninstalls and reinstalls app (new push token) | — | New token registered by app; subsequent notifications delivered to new token | N/A |

**Edge Cases:**
- User disables push notifications at OS level: notifications are queued by FCM/APNs; delivery not guaranteed; the notification flags are still set to `true` after the send attempt to prevent repeated attempts
- User earns two bonuses within 24 hours of each other: two separate notifications may arrive close together; this is acceptable behaviour — no deduplication
- App is in foreground when notification arrives: follow existing Paave foreground notification handling (in-app banner per existing behaviour)

---

### FR-REWARD-05: Force-Liquidation at T+7

**Actor:** Backend Scheduler (cron job)

**Description:**
When a bonus cash ledger record's TTL expires (`expires_at <= now()`), a scheduled job closes all open virtual positions that were funded (fully or partially) by that bonus ledger. Liquidation uses the last available market price snapshot for each ticker. No trading fee is charged on force-liquidation sells. Net proceeds are credited to the user's main virtual portfolio `available_balance`. The bonus ledger record is marked `EXPIRED` and its `available_balance` is set to 0.

**Liquidation Process (ordered steps):**
1. Cron job runs every 5 minutes and queries `bonus_cash_ledger` WHERE `status = ACTIVE` AND `expires_at <= now()`
2. For each expired ledger record:
   a. Lock the ledger record (`status = LIQUIDATING`) to prevent concurrent jobs from re-processing
   b. Query `virtual_positions` WHERE `ledger_source = {bonus_cash_ledger_id}` AND `status = OPEN`
   c. For each open position:
      - Fetch last known price from `market_price_snapshot` table (latest snapshot before `expires_at`)
      - Calculate `proceeds = shares_held × last_known_price`
      - Create a synthetic sell order: `type = FORCE_LIQUIDATION`, `price = last_known_price`, `fee = 0`
      - Mark the position as `CLOSED`
      - Credit `proceeds` to the user's main `available_balance`
      - Record P&L: `realized_pnl = proceeds − original_bonus_cost_basis`
   d. Set bonus `available_balance = 0`
   e. Set bonus ledger `status = EXPIRED`
   f. Set `liquidated_at = now()` timestamp
   g. Emit `bonus_cash_expired` event (consumed by notification service for FR-REWARD-04 post-expiry notification)
3. If there are no open positions funded by the ledger: skip steps c–d; proceed directly to e–g

**Input:**
- `bonus_cash_ledger` records with `status = ACTIVE` and `expires_at <= now()`
- `virtual_positions` records tagged with `ledger_source = {bonus_cash_ledger_id}`
- `market_price_snapshot` table (latest available price per ticker)

**Output:**
- All bonus-funded open positions are closed
- `virtual_positions.status = CLOSED` for all affected records
- `virtual_trades` table: new row per liquidated position with `type = FORCE_LIQUIDATION`, `fee = 0`
- Main portfolio `available_balance` increased by sum of all liquidation proceeds
- `bonus_cash_ledger.status = EXPIRED`, `available_balance = 0`, `liquidated_at = now()`
- P&L records written to `virtual_portfolio_pnl` table

**Preconditions:**
1. `bonus_cash_ledger.status = ACTIVE`
2. `bonus_cash_ledger.expires_at <= now()` (server UTC)
3. No concurrent liquidation job is already processing this ledger (lock check)

**Postconditions:**
1. Zero open positions remain tagged to the expired ledger
2. User's main `available_balance` is increased by liquidation proceeds
3. Bonus `available_balance = 0`
4. Ledger `status = EXPIRED`
5. Post-expiry push notification triggered
6. User can see the realized P&L from bonus-funded trades in their portfolio history

**Failed Cases:**

| Failure Scenario | Error Code | System Action | User-Facing Message |
|------------------|-----------|---------------|---------------------|
| `market_price_snapshot` missing for a ticker | `PRICE_SNAPSHOT_MISSING` | Use last available price regardless of age; log a data quality alert; proceed with liquidation | None (system handles silently) |
| DB transaction fails mid-liquidation | `LIQUIDATION_TX_FAILED` | Rollback entire liquidation for that ledger; log for manual review; set `status = LIQUIDATION_FAILED`; retry on next cron cycle | "Tài khoản của bạn đang được xử lý. Vui lòng thử lại sau." (shown in portfolio if user opens it) |
| Position already manually closed by user before T+7 | — | Skip that position; proceed with remaining open positions | None |
| User has no positions funded by this ledger | — | Set `status = EXPIRED`, `available_balance = 0`; no position actions | None |
| Cron job misses a 5-minute cycle (job failure) | — | On next cycle, all records with `expires_at <= now()` are picked up regardless of how long they waited | None |

**Edge Cases:**
- User sells a bonus-funded position before T+7: proceeds credited back to the bonus ledger `available_balance`; if the user then buys with those proceeds, the new position is still tagged to the bonus ledger; force-liquidation at T+7 closes the new position
- User has a pending buy order (not yet filled) at T+7: cancel the pending order; return the reserved bonus funds to `available_balance = 0` (no credit back to main); mark `status = EXPIRED`
- Mixed positions: a position funded partly by main balance and partly by bonus cash — at T+7, only the bonus-funded shares are liquidated; the main-funded shares remain open; if the position is indivisible (all shares from one order), the entire position is liquidated and the main-funded portion of proceeds is credited to main balance

---

### FR-REWARD-06: Reward Status API

**Actor:** F0 Learner (via mobile client)

**Description:**
The system exposes an API endpoint that returns the complete reward history for the authenticated user: all bonus ledger records across all statuses (QUEUED, ACTIVE, FROZEN, LIQUIDATING, EXPIRED, LIQUIDATION_FAILED), enabling the frontend to render the "Tiền thưởng học tập" section (FR-REWARD-02) and any reward history screen.

**API Specification:**

```
GET /api/v1/virtual/rewards/{user_id}

Headers:
  Authorization: Bearer {jwt_token}

Path Parameters:
  user_id: UUID (must match the authenticated user's ID)

Response 200 OK:
{
  "user_id": "uuid",
  "rewards": [
    {
      "ledger_id": "uuid",
      "module_id": "M2",
      "module_name_vi": "Phân tích cơ bản",
      "amount": 50000000,
      "available_balance": 32000000,
      "status": "ACTIVE",
      "awarded_at": "2026-05-25T10:30:00Z",
      "expires_at": "2026-06-01T10:30:00Z",
      "liquidated_at": null,
      "seconds_until_expiry": 86400,
      "notification_24h_sent": true,
      "notification_1h_sent": false,
      "trades_funded": 3
    }
  ],
  "summary": {
    "total_active_balance": 32000000,
    "total_awarded_lifetime": 100000000,
    "total_expired_count": 1
  }
}

Response 200 OK (no rewards):
{
  "user_id": "uuid",
  "rewards": [],
  "summary": {
    "total_active_balance": 0,
    "total_awarded_lifetime": 0,
    "total_expired_count": 0
  }
}

Response 401 Unauthorized:
{
  "error_code": "UNAUTHORIZED",
  "message": "Token invalid or expired"
}

Response 403 Forbidden:
{
  "error_code": "FORBIDDEN",
  "message": "Cannot access rewards for another user"
}

Response 404 Not Found:
{
  "error_code": "USER_NOT_FOUND",
  "message": "User does not exist"
}
```

**Field Definitions:**

| Field | Type | Notes |
|-------|------|-------|
| `ledger_id` | UUID | Unique identifier for this bonus record |
| `module_id` | string | `M2`, `M3`, or `M4` |
| `module_name_vi` | string | Vietnamese display name; server-resolved |
| `amount` | integer | Original award amount in VND |
| `available_balance` | integer | Current unspent bonus balance in VND (0 if expired) |
| `status` | enum | `QUEUED`, `ACTIVE`, `FROZEN`, `LIQUIDATING`, `EXPIRED`, `LIQUIDATION_FAILED` |
| `awarded_at` | ISO 8601 UTC | Server timestamp when ledger was created |
| `expires_at` | ISO 8601 UTC | `awarded_at + 7 days` (exact) |
| `liquidated_at` | ISO 8601 UTC or `null` | Timestamp when liquidation completed |
| `seconds_until_expiry` | integer | Server-calculated; 0 if expired |
| `notification_24h_sent` | boolean | Whether 24h warning push was sent |
| `notification_1h_sent` | boolean | Whether 1h warning push was sent |
| `trades_funded` | integer | Count of virtual trades funded by this ledger |

**Preconditions:**
1. User is authenticated with a valid JWT
2. The `user_id` in the path must match the authenticated user (no cross-user queries)

**Postconditions:**
1. Response is read-only; calling this endpoint makes no state changes
2. The `seconds_until_expiry` is computed at request time (not cached)

**Failed Cases:**

| Failure Scenario | Error Code | HTTP Status | System Action |
|------------------|-----------|-------------|---------------|
| JWT missing or invalid | `UNAUTHORIZED` | 401 | Reject request |
| `user_id` in path differs from JWT `sub` | `FORBIDDEN` | 403 | Reject request |
| DB unavailable | `INTERNAL_ERROR` | 500 | Return error; do not return partial data |
| `user_id` does not exist | `USER_NOT_FOUND` | 404 | Return 404 |

**Edge Cases:**
- User has never earned any rewards: returns empty `rewards` array with 200 OK (not 404)
- User has a `QUEUED` reward (virtual account not yet initialised): the QUEUED record is included in the response; frontend should display a pending state if it chooses to show queued records

---

### FR-REWARD-07: Idempotency Guard

**Actor:** Backend System

**Description:**
Passing the MKC multiple times (either legitimately retrying after failing, or through event replay, double-submission, or system retry) must NEVER result in a second reward being granted for the same module for the same user. The guard is enforced at the database level (unique constraint) and at the application level (pre-check before ledger creation).

**Idempotency Key:**
```
UNIQUE INDEX ON bonus_cash_ledger (user_id, module_id)
WHERE status IN ('ACTIVE', 'QUEUED', 'FROZEN', 'LIQUIDATING', 'EXPIRED', 'LIQUIDATION_FAILED')
```

The index covers all terminal and non-terminal states. Once a reward has been awarded in any state, it cannot be re-awarded regardless of status.

**Application-Level Guard (pre-check before INSERT):**
```
SELECT ledger_id, status FROM bonus_cash_ledger
WHERE user_id = :user_id AND module_id = :module_id
LIMIT 1
```
If any row is returned: return `200 OK` with the existing ledger record. Do NOT insert a new record.

**Input:**
- `user_id`
- `module_id`

**Output:**
- If no existing record: proceed to FR-REWARD-01 (create new ledger record)
- If record exists: return existing record, no side effects

**Preconditions:**
1. An MKC pass event has been received for the given `{user_id, module_id}`

**Postconditions:**
1. Exactly 1 ledger record exists per `{user_id, module_id}` combination at all times
2. No duplicate VND credits occur regardless of how many times the event is processed

**Failed Cases:**

| Failure Scenario | Error Code | System Action | User-Facing Message |
|------------------|-----------|---------------|---------------------|
| Race condition: two concurrent requests for same `{user_id, module_id}` both pass the application-level check and attempt INSERT | `UNIQUE_CONSTRAINT_VIOLATION` | Second INSERT fails on DB unique constraint; catch error; return existing record | None (first request succeeds; second is deduplicated silently) |
| `mkc_attempt_id` differs between retries (different idempotency key) but `{user_id, module_id}` is the same | — | Application-level check on `{user_id, module_id}` catches this; `mkc_attempt_id` is NOT used as the primary guard | None |

**Edge Cases:**
- User passes M2 MKC, earns reward, reward expires (status = EXPIRED), then re-passes M2 MKC: no second reward is granted — the EXPIRED record satisfies the uniqueness constraint; one reward per module per lifetime
- M3 reward is `QUEUED` (account uninitialised); user also passes M3 MKC again from a different device: QUEUED record satisfies the guard; no second QUEUED record created

---

### FR-REWARD-08: Queued Reward for Uninitialized Account

**Actor:** Backend System

**Description:**
If a learner earns a module reward (FR-REWARD-01) but has not yet initialised their virtual trading account, the reward is stored with `status = QUEUED` instead of being applied immediately. When the user subsequently initialises their virtual account (`POST /api/v1/virtual/initialize`), all `QUEUED` rewards are automatically transitioned to `ACTIVE` and the bonus `available_balance` is credited.

**Trigger for Queued → Active Transition:**
- Event: `virtual_account_initialized` (emitted by virtual portfolio service when account creation succeeds)
- Consumer: Reward service listens for this event and processes all `QUEUED` records for `user_id`

**Queued Record Fields:**
- `status = QUEUED`
- `awarded_at = now()` (timestamp of original MKC pass — preserved even after transition to ACTIVE)
- `expires_at = awarded_at + 7 days` (TTL clock starts at `awarded_at`, NOT at account initialisation time)
- `available_balance = amount` (full amount; not yet credited to portfolio until ACTIVE)

**Input:**
- `virtual_account_initialized` event payload: `{ "user_id": "uuid", "initialized_at": "ISO8601" }`

**Output:**
- All `QUEUED` records for `user_id` are updated: `status = ACTIVE`
- Virtual portfolio `bonus_sub_ledger_balance` is credited with the sum of all QUEUED `amount` values
- If a QUEUED record's `expires_at < now()` at time of account initialisation: that record is immediately transitioned to `EXPIRED` (not to `ACTIVE`) — the user does not receive an already-expired reward
- Post-transition: user sees the reward in their portfolio (FR-REWARD-02) if status is ACTIVE

**Preconditions:**
1. User has at least one `bonus_cash_ledger` record with `status = QUEUED`
2. `virtual_account_initialized` event received for this `user_id`

**Postconditions:**
1. No `QUEUED` records remain for the user
2. Records that were still within TTL at activation time are now `ACTIVE`
3. Records that were past TTL at activation time are now `EXPIRED` with `available_balance = 0`
4. TTL countdown in UI reflects remaining time from `awarded_at` (not from activation time)

**Failed Cases:**

| Failure Scenario | Error Code | System Action | User-Facing Message |
|------------------|-----------|---------------|---------------------|
| Event received but no QUEUED records found | — | No-op; log for debugging | None |
| Transition fails (DB error) | `QUEUE_TRANSITION_FAILED` | Retry 3× with back-off; on failure, alert on-call; records remain QUEUED | None immediately; on next app open the portfolio may show a delayed reward |
| Account init event fires multiple times (retry) | — | Idempotency guard on `{user_id, module_id}` prevents double-transition | None |
| All QUEUED rewards are already past TTL by initialisation time | — | All records transition to EXPIRED; user is notified via post-expiry notification | "Tiền thưởng học tập đã hết hạn trước khi tài khoản ảo được khởi tạo." |

**Edge Cases:**
- User earns M3 while M2 is QUEUED and account still uninitialised: both M2 and M3 QUEUED records exist; on account init, both are evaluated and transitioned; if both are still within TTL, both become ACTIVE
- 7-day TTL starts from `awarded_at` (MKC pass time), not from account initialisation: a user who waits 8 days to initialise their account forfeits any rewards earned more than 7 days ago

---

## 4. Business Rules

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-01 | Each module reward is awarded **exactly once** per user per module, for the lifetime of the account, regardless of how many times the MKC is passed. | Second award attempt silently returns the existing ledger record. No error. No deduction. |
| BR-02 | Module M1 ("Cổ phiếu cơ bản") has **no cash reward**. Completing M1 (or skipping via placement quiz) does not create any ledger record. | No ledger record created. No error. |
| BR-03 | Only the **backend** is authoritative for awarding rewards. The client-side AsyncStorage flag `f0_mkc_{n}_state = PASSED` is not sufficient to trigger an award and must never be used as the sole trigger. | If frontend-only state triggers an award request, the backend verifies against its own module progress store before creating any record. |
| BR-04 | The bonus cash lives in a **separate sub-ledger** and is never added to the user's main `available_balance`. Portfolio displays must keep these amounts visually and numerically separate at all times. | Any display that shows the combined total without labelling must be treated as a bug. |
| BR-05 | The 7-day TTL clock starts at the **server `awarded_at` UTC timestamp** when the ledger record is created. The client clock, client timezone, and the time of account initialisation (for QUEUED rewards) do NOT affect the TTL calculation. | If `expires_at` is calculated incorrectly, the data team must correct it with an audit trail. Users are not to be disadvantaged by server clock drift — if drift is detected (> 60 seconds), alert on-call. |
| BR-06 | Bonus cash can be used **freely** to buy and sell virtual securities within the 7-day TTL, just like normal virtual cash. No restrictions on which stocks or order types are eligible. | No restriction enforcement needed; applies existing virtual trading rules. |
| BR-07 | Bonus cash with status `EXPIRED` but not yet liquidated (`LIQUIDATING` or `LIQUIDATION_FAILED`) is **frozen**: it cannot be used in new trades. Main balance trades are unaffected. | Any trade that would draw on a frozen bonus ledger is rejected with `BONUS_FUNDS_FROZEN` error. |
| BR-08 | **No fee** is charged on force-liquidation sells. The synthetic sell order for liquidation uses `fee = 0`. | Any force-liquidation order with `fee > 0` is a data error and must be corrected. |
| BR-09 | Force-liquidation proceeds (after-sale VND) are credited to the user's **main** `available_balance`, not back to a bonus sub-ledger. Once the bonus expires, all proceeds belong to the main ledger. | Post-liquidation proceeds must not appear under "Tiền thưởng học tập". |
| BR-10 | The **TTL is non-extendable**. No product configuration, admin action, or user request can extend the `expires_at` timestamp after a ledger record is created. | Admin tools must not expose an "extend TTL" function. |
| BR-11 | The **total maximum bonus** that can be active simultaneously is 100,000,000 VND (M2 50M + M3 25M + M4 25M). No user can ever have more than three active bonus ledger records (one per eligible module). | Enforced by the one-per-module rule (BR-01). |
| BR-12 | Bonus funds are allocated to trades using **FIFO** (First In, First Out) when multiple active bonus ledgers exist. The oldest `awarded_at` bonus is consumed first. Main balance is consumed before any bonus funds. | System must implement FIFO; if allocation order is incorrect, affected trades must be re-tagged via data correction. |
| BR-13 | **Placement quiz skip** (user passes initial placement quiz ≥ 4/5, M1 marked COMPLETE): M1 is treated as COMPLETE, M1 has no reward, and the system correctly applies zero reward. No QUEUED or ACTIVE record for M1 is ever created. | Confirmed by idempotency guard — since no award is defined for M1, no record creation is attempted. |
| BR-14 | Realized P&L from bonus-funded positions is **permanently retained** in the user's virtual portfolio P&L history after expiry, even though the bonus cash itself is gone. The user keeps their trade history and learning record. | P&L records must not be deleted when a bonus ledger record expires. |
| BR-15 | If a mixed-funding position (funded partly by main balance, partly by bonus) must be liquidated at T+7, the entire position is liquidated. Proceeds are split: up to the original bonus-funded cost basis goes to the bonus liquidation accounting (counted as proceeds); the remainder goes to main balance. Net result: main `available_balance` increases by full proceeds amount. | Split logic must be implemented; the total credit to main balance is the sum of all proceeds regardless of original funding mix. |

---

## 5. Edge Cases

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-01 | User passes M2 MKC while offline; client retries the MKC submission twice on reconnection | Idempotency key `{user_id}:M2:{mkc_attempt_id}` ensures only one ledger record is created. Second retry returns existing record. |
| EC-02 | User's virtual account is initialised 6 days after earning M2 reward (QUEUED for 6 days) | On account init, M2 QUEUED → ACTIVE; `expires_at = awarded_at + 7 days`; user has approximately 1 day left on the TTL. The T-24h notification fires approximately immediately or has already missed the window (system skips the 24h notification if `seconds_until_expiry < 86400`). |
| EC-03 | User's virtual account is initialised 8 days after earning M2 reward | On account init, M2 QUEUED → EXPIRED (TTL already passed). No credit. Post-expiry notification sent. |
| EC-04 | User earns M3 reward while M2 bonus is still ACTIVE; both bonuses overlap | Two separate ACTIVE ledger records. FIFO allocation: M2 (older) is consumed first in buy orders. Both TTL countdowns are independent and visible in the portfolio. |
| EC-05 | All three bonuses (M2, M3, M4) are ACTIVE simultaneously and user places a large buy order exceeding all bonus balances | System draws from main balance first, then M2 bonus, then M3 bonus, then M4 bonus (FIFO). If total is still insufficient, order is rejected with `INSUFFICIENT_FUNDS`. |
| EC-06 | User sells a bonus-funded position before T+7; proceeds go back to bonus `available_balance`; user then earns M3; user places a new buy order | Replenished M2 `available_balance` is available. FIFO applies: M2 (older) consumed first, then M3. |
| EC-07 | Force-liquidation cron job fails (infrastructure outage) and bonus remains in ACTIVE state past `expires_at` | On recovery, cron job processes all records with `expires_at <= now()`. User cannot trade with the expired bonus during the outage window (BR-07 frozen funds enforced by `expires_at` check, not by `status`). |
| EC-08 | User places a buy order at T+6d 23:59:59 (1 second before expiry) | Order is accepted if `expires_at > now()` at time of order placement. The position is tagged with the ledger and will be force-liquidated 1 second later. This is correct per TTL design. |
| EC-09 | A pending buy order (not yet filled) is in-flight when T+7 arrives | The pending order is cancelled. Reserved bonus funds are released back to the ledger, then set to 0 as part of expiry. No credit to main balance for unfilled orders. |
| EC-10 | User has never initialised their virtual account and earns all 3 module rewards (all QUEUED); then initialises account | All three QUEUED records are evaluated. Those still within TTL become ACTIVE. Those past TTL become EXPIRED. User may receive up to 3 active bonuses simultaneously. |
| EC-11 | User passes M2 MKC on an old app version that does not have the backend rewards feature (V1 frontend) | Backend awards the reward normally. The V1 app will not display the bonus section. When user upgrades, the reward is visible if still ACTIVE. TTL has been counting since `awarded_at`. |
| EC-12 | Market price snapshot is 30 minutes stale at T+7 (due to market closure or weekend) | Force-liquidation uses the most recent available snapshot regardless of age. No liquidation is deferred because of stale prices. The stale price is the authoritative value for the synthetic sell. |
| EC-13 | User completes M4 and M2/M3 rewards have already expired | M4 reward is granted normally (independent per-module rule). No cascading effect from expired previous rewards. |
| EC-14 | Admin manually marks a bonus ledger as EXPIRED before T+7 | System must not allow this operation via normal admin tooling (TTL is non-extendable per BR-10; by extension, early expiry must go through an explicit audit-logged admin action). Force-liquidation job is triggered on next cycle. |
| EC-15 | Two devices submit the same MKC pass simultaneously | Application-level pre-check and DB unique constraint ensure exactly one ledger record is created. The first write wins; the second returns the existing record. |

---

## 6. Acceptance Criteria

### FR-REWARD-01: Module Completion Reward Grant

```
Given a user has passed the M2 MKC with a score of 3/5 or higher
  And no bonus_cash_ledger record exists for {user_id, M2}
  And the user has an active virtual trading account
When the backend processes the MKC pass event
Then a bonus_cash_ledger record is created with:
  - module_id = M2
  - amount = 50000000
  - status = ACTIVE
  - awarded_at = server UTC timestamp at time of creation
  - expires_at = awarded_at + exactly 7 days (604800 seconds)
  - available_balance = 50000000
  And the virtual portfolio bonus sub-ledger balance increases by 50000000 VND
  And the main available_balance is unchanged

Given a user has passed the M3 MKC with a score of 3/5 or higher
When the backend processes the MKC pass event
Then a bonus_cash_ledger record is created with amount = 25000000

Given a user has passed the M4 MKC with a score of 3/5 or higher
When the backend processes the MKC pass event
Then a bonus_cash_ledger record is created with amount = 25000000

Given a user has passed the M1 MKC
When the backend processes the MKC pass event
Then no bonus_cash_ledger record is created for M1
  And no virtual balance is changed

Given a user's M2 MKC pass event is delivered twice (retry)
When the backend processes both events
Then exactly one bonus_cash_ledger record exists for {user_id, M2}
  And the virtual portfolio bonus balance has not been doubled
```

---

### FR-REWARD-02: Reward Ledger Display

```
Given a user has an ACTIVE M2 bonus with available_balance = 50000000 and expires_at = T+3 days
When the user opens the virtual portfolio screen
Then a section labelled "Tiền thưởng học tập" is visible
  And it shows "Phân tích cơ bản: 50,000,000 VND"
  And it shows a TTL countdown "còn 3 ngày X giờ" (approximately)
  And the status pill shows "Đang hoạt động"
  And the main balance section does NOT include the 50,000,000 VND

Given a user has no active or recently expired bonuses
When the user opens the virtual portfolio screen
Then the "Tiền thưởng học tập" section is not visible

Given a bonus expires while the user has the portfolio screen open
When expires_at is reached
Then the countdown shows "0 ngày 0 giờ"
  And the status pill shows "Đang tất toán..."
  And after liquidation completes, the status shows "Đã hết hạn"
  And the section is removed after 24 hours post-expiry

Given the Rewards API returns a 500 error
When the portfolio screen loads
Then the "Tiền thưởng học tập" section is hidden
  And the main portfolio content is unaffected
```

---

### FR-REWARD-03: Using Reward Funds

```
Given a user has main available_balance = 100000000 VND
  And an ACTIVE M2 bonus available_balance = 50000000 VND
  And the user places a buy order for 120000000 VND
When the order is placed
Then 100000000 VND is drawn from main balance
  And 20000000 VND is drawn from M2 bonus balance
  And the trade record has ledger_source = {M2_bonus_ledger_id}
  And the M2 bonus available_balance is now 30000000 VND

Given a user has bonus available_balance = 50000000 VND with expires_at = 2 days from now
When the user places a buy order for 30000000 VND within the TTL
Then the order is accepted and executed

Given a bonus has status = ACTIVE but expires_at <= now() (frozen, liquidation pending)
When the user attempts to place a buy order funded by that bonus
Then the order is rejected with error code BONUS_FUNDS_FROZEN
  And the error message is "Tiền thưởng đang trong quá trình tất toán và không thể sử dụng."

Given two active bonuses: M2 awarded_at Day 1, M3 awarded_at Day 5
When the user places a buy order that exceeds M2 available_balance
Then M2 bonus balance is consumed first (to zero)
  And M3 bonus balance is consumed for the remainder
```

---

### FR-REWARD-04: TTL Expiry Notification

```
Given a user has an ACTIVE M2 bonus with expires_at = T+7 days from awarded_at
  And the user has a registered push notification token
  And notification_24h_sent = false
When the system time reaches expires_at − 24 hours (±5 minutes)
Then a push notification is delivered with:
  - Title: "Tiền thưởng học tập sắp hết hạn"
  - Body: "50,000,000 VND thưởng từ Phân tích cơ bản sẽ hết hạn sau 24 giờ. Dùng ngay trước khi mất!"
  And notification_24h_sent is set to true
  And the notification is not sent again even if the cron re-runs

Given notification_24h_sent = true
When the cron job runs again within the 24h window
Then no duplicate notification is sent

Given a bonus completes force-liquidation
When the liquidation job sets status = EXPIRED
Then a post-expiry notification is sent:
  - Title: "Tiền thưởng học tập đã hết hạn"
  - Body: "Lệnh tất toán đã hoàn tất. Kết quả giao dịch của bạn đã được lưu vào danh mục."
```

---

### FR-REWARD-05: Force-Liquidation at T+7

```
Given a user has an ACTIVE M2 bonus with 2 open positions funded by it
  And expires_at <= now()
When the force-liquidation cron job runs
Then all 2 open positions tagged with the M2 ledger are closed
  And synthetic sell orders are created with type = FORCE_LIQUIDATION and fee = 0
  And proceeds (shares × last_known_price) are credited to main available_balance
  And M2 bonus available_balance is set to 0
  And M2 bonus status is set to EXPIRED
  And realized P&L records are created for each closed position
  And the post-expiry push notification is triggered

Given a user has an ACTIVE M3 bonus with no open positions
When expires_at is reached and the cron job runs
Then no sell orders are created
  And M3 bonus status is set to EXPIRED immediately
  And M3 bonus available_balance is set to 0

Given the cron job fails on the first attempt
When the cron retries on the next 5-minute cycle
Then liquidation is completed on retry
  And the ledger status is set to EXPIRED after successful completion
```

---

### FR-REWARD-06: Reward Status API

```
Given a user has one ACTIVE M2 bonus and one EXPIRED M3 bonus
When the user calls GET /api/v1/virtual/rewards/{user_id}
Then the response is 200 OK
  And the response contains 2 reward records
  And the M2 record has status = ACTIVE and available_balance > 0
  And the M3 record has status = EXPIRED and available_balance = 0
  And seconds_until_expiry is 0 for the expired record

Given a user has no reward history
When the user calls GET /api/v1/virtual/rewards/{user_id}
Then the response is 200 OK with rewards = []

Given a request with a JWT for user A but user_id in path is user B
When the request is received
Then the response is 403 Forbidden
```

---

### FR-REWARD-07: Idempotency Guard

```
Given a user has already been awarded M2 bonus (any status: ACTIVE, EXPIRED, or QUEUED)
When the backend receives another MKC pass event for {user_id, M2}
Then no new bonus_cash_ledger record is created
  And the existing record is returned
  And the virtual portfolio balance is not changed

Given two simultaneous MKC pass events for {user_id, M2} arrive at the backend
When both events are processed concurrently
Then exactly one bonus_cash_ledger record exists for {user_id, M2}
  And no duplicate VND credit occurs
```

---

### FR-REWARD-08: Queued Reward for Uninitialized Account

```
Given a user has passed M2 MKC
  And the user has not yet initialised their virtual trading account
When the backend processes the MKC pass event
Then a bonus_cash_ledger record is created with status = QUEUED
  And awarded_at = server UTC timestamp of MKC pass
  And expires_at = awarded_at + 7 days

Given the user subsequently initialises their virtual account within 7 days of awarded_at
When the virtual_account_initialized event is emitted
Then the QUEUED record transitions to ACTIVE
  And the bonus available_balance is credited to the virtual portfolio
  And the TTL countdown in the UI reflects remaining time from original awarded_at (not from activation time)

Given the user initialises their virtual account after expires_at (more than 7 days post-award)
When the virtual_account_initialized event is emitted
Then the QUEUED record transitions to EXPIRED (not ACTIVE)
  And no bonus balance is credited
  And the user receives a post-expiry notification
```

---

## 7. Non-Functional Requirements

| Attribute | Requirement |
|-----------|-------------|
| **Performance — Reward Grant** | The bonus cash ledger record must be created within 2 seconds of the MKC pass event being received by the backend (p95 under normal load). |
| **Performance — API Response** | `GET /api/v1/virtual/rewards/{user_id}` must respond within 500ms (p95) under 1,000 concurrent requests. |
| **Performance — Force-Liquidation** | The force-liquidation cron job must complete processing for all expired records within 10 minutes of `expires_at`, assuming up to 10,000 expired ledgers per cron cycle. |
| **Availability** | The reward grant, reward display, and force-liquidation systems must maintain 99.9% availability (< 8.7 hours downtime per year). Downtime during force-liquidation window is classified as a P1 incident. |
| **Consistency** | Reward grants must be transactionally consistent: a ledger record creation and a virtual portfolio balance update must succeed or fail together (ACID transaction). Partial credits are not acceptable. |
| **Idempotency** | All reward grant operations must be idempotent. Replaying the same event N times must produce identical state to replaying it once. |
| **Audit Logging** | Every ledger record state transition (QUEUED → ACTIVE, ACTIVE → LIQUIDATING, LIQUIDATING → EXPIRED) must be recorded in an immutable audit log with: `event_type`, `user_id`, `ledger_id`, `previous_status`, `new_status`, `actor` (system/admin), `timestamp`. |
| **Security — Authorization** | Reward data is accessible only to the authenticated user. Service-to-service calls use internal mTLS. No bonus ledger data is exposed via unauthenticated endpoints. |
| **Security — Amount Integrity** | Bonus amounts are hard-coded in the backend configuration (`REWARD_AMOUNT_M2 = 50000000`, `REWARD_AMOUNT_M3 = 25000000`, `REWARD_AMOUNT_M4 = 25000000`). They must not be derived from client request payloads. |
| **Data Retention** | `bonus_cash_ledger` records are retained indefinitely for audit and analytics purposes. Expired records are not deleted. |
| **Timezone** | All server timestamps use UTC. The mobile client converts to the user's local timezone for display (Vietnamese: UTC+7). TTL calculations are always performed in UTC. |
| **Regulatory** | This feature uses virtual (simulated) currency only. No real money is involved. The system must display "Tiền ảo" labels per existing virtual portfolio conventions at all times. This feature does not fall under Thông tư 27/2020 real-money transfer regulations; however, Vietnamese consumer protection law for digital services applies (user communications must be clear and accurate). |
| **Cron Job Resilience** | The force-liquidation job must be idempotent (re-running it on already-expired records is a no-op). The job must use distributed locking (e.g., Redis lock) to prevent concurrent execution on multiple instances. |
| **Monitoring** | Alert thresholds: (a) any ledger record with `status = ACTIVE` and `expires_at + 30m < now()` that has not transitioned to EXPIRED — P1 alert; (b) force-liquidation job failure rate > 1% in any 5-minute window — P2 alert; (c) reward grant latency p95 > 5s — P2 alert. |

---

## 8. Integration with Existing Systems

### 8.1 F0 Learning Path Backend (New — This Feature Requires It)

| Integration Point | Direction | Protocol | Data Exchanged |
|-------------------|-----------|----------|----------------|
| MKC pass event | F0 Backend → Reward Service | Internal async event (message queue) | `{user_id, module_id, mkc_score, mkc_attempt_id, completed_at}` |
| Module progress verification | Reward Service → F0 Backend | Synchronous REST (internal) | `GET /internal/f0/progress/{user_id}/{module_id}` → `{module_state, mkc_last_score, mkc_passed}` |

The Reward Service must perform an independent verification call to the F0 backend before creating a ledger record. This protects against replayed or spoofed events.

### 8.2 Virtual Trading Portfolio API (`/api/v1/virtual/*`)

| Integration Point | Direction | Protocol | Data Exchanged |
|-------------------|-----------|----------|----------------|
| Bonus sub-ledger creation | Reward Service → Portfolio DB | Direct DB write (shared database, separate table) or internal service call | New `bonus_cash_ledger` record |
| Virtual account init event | Portfolio Service → Reward Service | Internal async event | `{user_id, initialized_at}` |
| Buy order fund allocation | Virtual Trading Engine → Reward Service | Synchronous (order placement) | `GET /internal/rewards/available-balance/{user_id}` → active bonus balances for fund allocation |
| Force-liquidation sells | Reward Scheduler → Virtual Trading Engine | Internal REST | `POST /internal/virtual/orders` with `type = FORCE_LIQUIDATION` |
| Main balance credit (post-liquidation) | Reward Scheduler → Virtual Trading Engine | Internal REST | `POST /internal/virtual/balance/credit` with `{user_id, amount, reason = "BONUS_LIQUIDATION"}` |

### 8.3 Push Notification Service (Existing)

| Integration Point | Direction | Protocol | Data Exchanged |
|-------------------|-----------|----------|----------------|
| TTL warning notifications | Reward Scheduler → Notification Service | Internal REST or event | `{user_id, notification_type, template_vars, deep_link}` |
| Post-expiry notification | Reward Scheduler → Notification Service | Internal REST or event | Same structure as above |

The Reward Service does NOT send push notifications directly. It delegates to the existing Paave notification service with pre-defined template IDs:
- `REWARD_EXPIRY_24H`
- `REWARD_EXPIRY_1H`
- `REWARD_EXPIRY_COMPLETE`

### 8.4 Mobile Frontend (React Native)

| Integration Point | Direction | Notes |
|-------------------|-----------|-------|
| `GET /api/v1/virtual/rewards/{user_id}` | Client → Server | New endpoint; client calls on portfolio screen mount |
| Module Completion Modal bonus line display | Server-driven data → Client render | Modal renders bonus line only if `module_completion` response includes `bonus_awarded: true, bonus_amount: N` |
| Deep link from notification | Push notification → App | `paave://virtual-portfolio?tab=rewards` and `paave://virtual-portfolio?tab=history` must be handled by React Navigation |
| Portfolio screen TTL countdown | Client-side timer | `seconds_until_expiry` from API; client decrements locally every second; refreshes from API every 60 seconds |

### 8.5 AsyncStorage (Frontend — Read-Only Integration)

The frontend AsyncStorage key `f0_mkc_{n}_state` is used solely for **local UI state** (e.g., determining whether to show the MKC CTA button). It is explicitly **not** used as an input to the reward grant decision. The backend makes all reward decisions independently. This prevents:
- Offline abuse (modifying AsyncStorage to fake a pass)
- Replay attacks
- State desynchronization between devices

---

## 9. Deprecation / Migration from V1 (AsyncStorage-only)

### 9.1 What Changes

| Component | V1 Behaviour | V2 Behaviour (This FRD) |
|-----------|-------------|------------------------|
| Bonus cash rewards | "Removed entirely from V2 architecture" per `01-requirements.md` | Restored, backend-authoritative |
| MKC progress storage | AsyncStorage only (`f0_mkc_{n}_state`) | AsyncStorage retained for local UI; backend database is authoritative |
| Virtual portfolio integration | None (no reward) | New `bonus_cash_ledger` table; portfolio API extended |
| Module completion signal | Frontend event only | Frontend emits event; backend independently verifies and awards |
| Force-liquidation | N/A | Cron job on backend |

### 9.2 Migration Steps for Existing V1 Users

Existing V1 users who have already completed modules (before the backend for rewards was added) are handled as follows:

| Scenario | Handling |
|----------|----------|
| User completed M2 in V1 (no backend existed) | No retroactive reward. V1 completions are not awarded rewards. V2 rewards apply only to MKC passes processed by the new backend. This is a deliberate product decision: the backend start date is the eligibility start date. |
| User has partial progress (e.g., M1 complete, M2 in progress) in V1 | On first backend sync, the backend reads the user's server-side module progress (if backfilled) or starts fresh. The migration script determines the source of truth. |
| AsyncStorage `f0_mkc_{n}_state = PASSED` exists but backend has no record | Backend is authoritative. If the backend does not have a confirmed pass, no reward is granted. Users who wish to claim the reward must re-pass the MKC. |
| V1 virtual account exists (500M VND balance) | Existing virtual account is preserved. The bonus sub-ledger is additive; it does not reset the main balance. |

### 9.3 Data Backfill Decision

**Recommendation (for product decision):** Do NOT retroactively award bonuses for pre-V2 module completions. Rationale:
1. The TTL (7 days) would have already expired for any V1 completions
2. There is no reliable audit trail for V1 MKC pass timestamps
3. Awarding stale rewards creates accounting inconsistencies

If the product team decides to backfill (out of scope for this FRD), a separate migration FRD must be written.

### 9.4 Feature Flag Rollout

To safely roll out the backend rewards feature:

| Phase | Configuration | Coverage |
|-------|--------------|----------|
| Phase 1: Internal | `feature_flag: bonus_rewards = enabled` for internal Paave accounts only | QA validation |
| Phase 2: Beta | 10% of F0 learner cohort | Monitoring alert thresholds; cron job load testing |
| Phase 3: Full rollout | 100% of users | Full production |

The feature flag must gate:
- Backend award creation (FR-REWARD-01)
- Portfolio display section (FR-REWARD-02)
- Force-liquidation job eligibility (FR-REWARD-05)
- Push notifications (FR-REWARD-04)

If the flag is disabled for a user, MKC passes are processed normally (module unlocks, XP, badges) but no `bonus_cash_ledger` record is created.

---

*End of FRD: F0 Learning Path — Virtual Capital Rewards*
*Version 1.0 | 2026-06-01 | Status: Draft — Requires Backend API*
