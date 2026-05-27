# Gamification FRD — FR-GAME-06 through FR-GAME-10

> **Document status:** Draft v1.0 — 2026-05-27
> **Author:** Business Analysis
> **Depends on:** FR-GAME-01 (XP), FR-GAME-02 (Tiers), FR-GAME-03 (Trader Score), FR-GAME-04 (Weekly Challenge), FR-GAME-05 (Streaks), FR-LEARN-* (F0 Learning Path)
> **Audience:** Backend engineers, frontend engineers, QA, product

---

## Conventions

- All timestamps are stored in UTC; displayed in ICT (UTC+7) to the user.
- "Calendar day" = 00:00:00–23:59:59 ICT.
- "Calendar week" = Monday 00:00:00 ICT – Sunday 23:59:59 ICT.
- "NAV delta" = `(portfolio NAV at close of day D) − (portfolio NAV at open of day D)` in VND. Positive delta means the portfolio gained value during trading hours on that day.
- "Trading day" = any day the virtual exchange is open for at least one session.
- "Idempotent key" = composite natural key used to deduplicate repeated event processing.
- All XP grants follow FR-GAME-01 semantics: queued retry on failure, never deducted.
- All badge awards are one-time. Idempotency key = `(user_id, badge_id)`.

---

# MODULE: FR-GAME-06 — Achievement Badge System

## Overview

The Achievement Badge System awards permanent, non-revocable digital badges to users who meet specific behavioural or progress milestones. Badges are displayed on the user profile and on community feed posts. Rare and Epic badges generate a shareable moment card. The system contains 12 badges at launch (8 named + 4 Branch Completion badges triggered by FR-GAME-07).

## Badge Catalogue

| Badge ID | Name | Rarity | Hex Color | Award Trigger |
|---|---|---|---|---|
| `BADGE_FIRST_TRADE` | First Trade | Common | `#9CA3AF` | First paper trade placed and filled |
| `BADGE_GREEN_WEEK` | Green Week | Uncommon | `#34D399` | 7 consecutive trading days with positive portfolio NAV delta |
| `BADGE_MARKET_SCHOLAR` | Market Scholar | Common | `#9CA3AF` | All F0 Learning Module 1 lessons completed |
| `BADGE_SHARP_SHOOTER` | Sharp Shooter | Uncommon | `#34D399` | 5 price alerts triggered (condition met AND notification delivered) |
| `BADGE_WHALE_WATCHER` | Whale Watcher | Rare | `#60A5FA` | Stock on watchlist continuously for 30 calendar days before first BUY order on that stock |
| `BADGE_CHALLENGE_KING` | Challenge King | Rare | `#60A5FA` | 3 cumulative weekly challenge wins (per FR-GAME-04) |
| `BADGE_STREAK_MASTER` | Streak Master | Epic | `#F59E0B` | Learning streak reaches 30 (Streak Freeze days count per FR-GAME-05) |
| `BADGE_ZEN_TRADER` | Zen Trader | Epic | `#F59E0B` | Zero panic-sell flags for 4 consecutive calendar weeks (Mon–Sun) |
| `BADGE_BRANCH_MF` | Market Foundations Complete | Epic | `#F59E0B` | Branch A of FR-GAME-07 reaches Branch-Complete state |
| `BADGE_BRANCH_AN` | Analysis Complete | Epic | `#F59E0B` | Branch B of FR-GAME-07 reaches Branch-Complete state |
| `BADGE_BRANCH_PT` | Portfolio Thinking Complete | Epic | `#F59E0B` | Branch C of FR-GAME-07 reaches Branch-Complete state |
| `BADGE_BRANCH_TP` | Trader Psychology Complete | Epic | `#F59E0B` | Branch D of FR-GAME-07 reaches Branch-Complete state |

**Rarity colour definitions (authoritative):**

| Rarity | Hex | WCAG Contrast on `#0E0E0E` | Usage |
|---|---|---|---|
| Common | `#9CA3AF` | 5.4:1 (AA pass) | Badge border, rarity pill background |
| Uncommon | `#34D399` | 8.1:1 (AA pass) | Badge border, rarity pill background |
| Rare | `#60A5FA` | 6.2:1 (AA pass) | Badge border, rarity pill background |
| Epic | `#F59E0B` | 7.1:1 (AA pass) | Badge border, rarity pill background |
| Legendary | Reserved — not used at launch | — | — |

**Non-colour encoding (WCAG SC 1.4.1):** Each rarity is additionally encoded by border thickness (Common: 1px, Uncommon: 2px, Rare: 3px, Epic: 4px animated shimmer) and a symbol prefix on the rarity pill text (Common: ●, Uncommon: ◆, Rare: ★, Epic: ✦).

---

### FR-GAME-06-01: Badge Award — First Trade

- **Priority:** P0
- **Actor:** System (event consumer) triggered by trade fill event
- **Description:** When a user's first virtual paper trade transitions to status `FILLED`, the system checks whether the user already holds `BADGE_FIRST_TRADE`. If they do not, the badge is inserted into `badge_awards` and a push notification is dispatched. XP of 50 is granted via FR-GAME-01.
- **Input:**
  - `trade_fill_event.user_id` — integer, required
  - `trade_fill_event.order_id` — integer, required
  - `trade_fill_event.status` — string, must equal `"FILLED"`
  - `trade_fill_event.side` — string, `"BUY"` or `"SELL"` (both qualify)
- **Output:**
  - Row inserted into `badge_awards`: `{ user_id, badge_id: "BADGE_FIRST_TRADE", awarded_at: UTC timestamp, idempotency_key: "{user_id}_BADGE_FIRST_TRADE" }`
  - XP grant of 50 queued via FR-GAME-01
  - Push notification: title `"Achievement Unlocked"`, body `"You placed your first trade! You earned the First Trade badge."`, deep link to badge detail screen
- **Precondition:**
  - User account exists and is active
  - Order exists and belongs to the user
  - `badge_awards` does not contain a row with `(user_id, "BADGE_FIRST_TRADE")`
- **Postcondition:**
  - `badge_awards` contains exactly one row for `(user_id, "BADGE_FIRST_TRADE")`
  - XP grant event is enqueued
  - Badge is visible on the user's profile immediately after award

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-06-01-1 | User has zero prior trades | A BUY order transitions to `FILLED` | Badge `BADGE_FIRST_TRADE` is awarded, XP +50 queued, push notification sent |
| AC-06-01-2 | User already holds `BADGE_FIRST_TRADE` | A second trade transitions to `FILLED` | No duplicate badge row is inserted; no XP is granted again; no notification sent |
| AC-06-01-3 | User has zero prior trades | A SELL order transitions to `FILLED` | Badge is awarded (side is irrelevant; first fill wins) |
| AC-06-01-4 | Trade fill event is delivered twice (retry) | System processes duplicate event | Second processing is a no-op; `badge_awards` remains unchanged |

#### Edge Cases

| # | Scenario | Expected Behaviour |
|---|---|---|
| EC-06-01-1 | Trade fill event arrives but DB write fails on badge insert | Event is retried; idempotency key prevents double award on success after retry |
| EC-06-01-2 | User account is deleted between order placement and fill | System logs a warning; no badge awarded; event discarded |
| EC-06-01-3 | Push notification service unavailable | Badge award and XP grant proceed; notification is queued with standard retry; badge is not rolled back |

#### Business Rules

| # | Rule |
|---|---|
| BR-06-01-1 | Trigger fires only on `status = "FILLED"` transitions. `PENDING`, `CANCELLED`, and `EXPIRED` orders do not count. |
| BR-06-01-2 | Both BUY and SELL sides qualify as the "first trade". |
| BR-06-01-3 | Badge is awarded at most once per user, enforced by unique constraint on `(user_id, badge_id)` in `badge_awards`. |
| BR-06-01-4 | XP grant of 50 uses idempotency key `"{user_id}_BADGE_FIRST_TRADE_XP"` per FR-GAME-01. |

---

### FR-GAME-06-02: Badge Award — Green Week

- **Priority:** P1
- **Actor:** System (daily batch job, runs at 23:59:59 ICT)
- **Description:** At the end of each trading day, the batch evaluates each user's portfolio NAV delta for that day. The system maintains a counter `green_trading_days_streak` per user. If the NAV delta for the day is positive, the counter increments. If negative or zero, the counter resets to 0. If the counter reaches 7 and the user does not already hold `BADGE_GREEN_WEEK`, the badge is awarded.
- **Input:**
  - `user_id` — integer
  - `portfolio_nav_delta_vnd` — numeric (VND), computed as `(portfolio NAV at market close) − (portfolio NAV at market open)` for the current trading day
- **Output:**
  - `green_trading_days_streak` counter updated in `badge_progress` table
  - If counter reaches 7: row inserted into `badge_awards` for `BADGE_GREEN_WEEK`, XP +100 queued, push notification sent
- **Precondition:**
  - User has an active virtual portfolio
  - Today is a trading day (virtual exchange was open)
- **Postcondition:**
  - `badge_progress.green_trading_days_streak` reflects the updated count
  - If badge awarded: `badge_awards` contains exactly one row for `(user_id, "BADGE_GREEN_WEEK")`

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-06-02-1 | User has 6 consecutive green trading days | Day 7 closes with a positive NAV delta | Badge `BADGE_GREEN_WEEK` is awarded, XP +100 queued |
| AC-06-02-2 | User has 5 green days, then a red day | Batch runs on the red day | `green_trading_days_streak` resets to 0; badge is not awarded |
| AC-06-02-3 | User achieves 7 green days and already holds `BADGE_GREEN_WEEK` | Batch runs on day 14 of a new 7-day green streak | No duplicate badge awarded; counter continues incrementing but award is suppressed |
| AC-06-02-4 | NAV delta is exactly zero | Batch runs | Streak counter resets to 0 (zero delta is not positive) |
| AC-06-02-5 | Market was closed today (holiday) | Batch runs | Today is skipped; streak counter is not modified; streak is not broken |

#### Business Rules

| # | Rule |
|---|---|
| BR-06-02-1 | NAV delta must be strictly positive (> 0 VND) for the day to count. |
| BR-06-02-2 | Zero or negative NAV delta resets `green_trading_days_streak` to 0. |
| BR-06-02-3 | Non-trading days (exchange closed) do not affect the streak counter in either direction. |
| BR-06-02-4 | The badge is awarded once; re-evaluation after a subsequent 7-day streak is a no-op. |
| BR-06-02-5 | XP grant idempotency key: `"{user_id}_BADGE_GREEN_WEEK_XP"`. |

---

### FR-GAME-06-03: Badge Award — Market Scholar

- **Priority:** P0
- **Actor:** System (event-driven, fires on lesson completion event)
- **Description:** When a user completes a lesson in F0 Learning Module 1, the system checks whether all 5 lessons in Module 1 (L1.1, L1.2, L1.3, L1.4, L1.5) are marked complete for that user. If yes, and the user does not yet hold `BADGE_MARKET_SCHOLAR`, the badge is awarded.
- **Input:**
  - `lesson_complete_event.user_id` — integer
  - `lesson_complete_event.lesson_id` — string, must be one of `["L1.1","L1.2","L1.3","L1.4","L1.5"]` to be relevant
  - `lesson_complete_event.completed_at` — UTC timestamp
- **Output:**
  - Row inserted into `badge_awards` for `BADGE_MARKET_SCHOLAR`
  - XP +75 queued via FR-GAME-01
  - Push notification: `"You completed Module 1! Market Scholar badge earned."`

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-06-03-1 | User has completed L1.1–L1.4 | User completes L1.5 | Badge is awarded immediately |
| AC-06-03-2 | User completes lessons in non-sequential order (L1.5, L1.3, L1.1, L1.4) | User completes L1.2 (the last remaining) | Badge is awarded |
| AC-06-03-3 | User already holds `BADGE_MARKET_SCHOLAR` | A lesson completion event for L1.x fires again (replay) | No duplicate insert; no XP re-granted |

#### Business Rules

| # | Rule |
|---|---|
| BR-06-03-1 | Module 1 is defined as exactly lessons: L1.1, L1.2, L1.3, L1.4, L1.5 (5 lessons total). |
| BR-06-03-2 | All 5 lessons must have `status = "COMPLETE"` in `user_lesson_progress` to qualify. |
| BR-06-03-3 | XP grant idempotency key: `"{user_id}_BADGE_MARKET_SCHOLAR_XP"`. |

---

### FR-GAME-06-04: Badge Award — Sharp Shooter

- **Priority:** P1
- **Actor:** System (event-driven, fires on alert_triggered event)
- **Description:** The system maintains a count of alerts that have both had their price condition met AND had a push notification delivered to the user. When this cumulative count reaches 5, the badge is awarded.
- **Input:**
  - `alert_triggered_event.notification_delivered` — boolean, must be `true` to increment counter
- **Output:**
  - `badge_progress.sharp_shooter_triggered_count` incremented by 1
  - If count reaches 5 and badge not yet held: insert `BADGE_SHARP_SHOOTER`, XP +75 queued, push notification sent

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-06-04-1 | User has 4 qualifying alert triggers | 5th alert condition is met and notification is delivered | Badge awarded; XP +75 queued |
| AC-06-04-2 | Alert condition is met but push notification delivery fails permanently | Event processed | Counter is NOT incremented |

#### Business Rules

| # | Rule |
|---|---|
| BR-06-04-1 | A "qualifying trigger" requires BOTH: (a) price condition met, AND (b) push notification delivered. |
| BR-06-04-2 | Counter is cumulative and never resets. |
| BR-06-04-3 | Duplicate delivery events for the same `(rule_id, condition_met_at_minute)` are deduplicated. |
| BR-06-04-4 | XP grant idempotency key: `"{user_id}_BADGE_SHARP_SHOOTER_XP"`. |

---

### FR-GAME-06-05: Badge Award — Whale Watcher

- **Priority:** P1
- **Actor:** System (event-driven, fires on BUY order fill event)
- **Description:** When a BUY order for stock ticker X fills for user U, the system checks whether stock X has been on any of user U's watchlists continuously for at least 30 calendar days prior to the fill date without being removed.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-06-05-1 | User added VNM to watchlist on Day 1, kept it there, and places first BUY for VNM on Day 35 | BUY fills | Badge `BADGE_WHALE_WATCHER` awarded |
| AC-06-05-2 | User added VNM to watchlist on Day 1, removed it on Day 10, re-added on Day 11, places BUY on Day 35 | BUY fills | Badge NOT awarded (continuity broken on Day 10) |
| AC-06-05-3 | User added VNM to watchlist on Day 1, places BUY on Day 25 | BUY fills | Badge NOT awarded (only 25 days, < 30 required) |
| AC-06-05-4 | User places second BUY for VNM (first BUY was on Day 35 without triggering the badge) | Second BUY fills | Badge evaluation does NOT run again for the same stock |
| AC-06-05-5 | User removes stock from watchlist and re-adds after previously qualifying | New BUY event | New 30-day period must be satisfied again; prior qualified period does not carry over |

#### Edge Cases

| # | Scenario | Expected Behaviour |
|---|---|---|
| EC-06-05-1 | Stock is on multiple watchlists; removed from one but retained on another | Continuity is per-stock, not per-watchlist; as long as at least one watchlist contains the stock, continuity is maintained |
| EC-06-05-2 | Watchlist history records are purged or missing for a gap period | System treats the gap as a removal; badge is not awarded |
| EC-06-05-3 | BUY fill event and watchlist removal event arrive simultaneously (same second) | System uses the state as of 1 second before the fill; the watchlist record must exist at `filled_at − 1 second` |

#### Business Rules

| # | Rule |
|---|---|
| BR-06-05-1 | Continuity is evaluated by querying `watchlist_symbol_history` for the stock across all user watchlists. A continuous period requires no removal events for the stock between `filled_at − 30 days` and `filled_at`. |
| BR-06-05-2 | Trigger fires only on the first BUY fill for the given `stock_code`. Subsequent BUY fills on the same stock are ignored. |
| BR-06-05-3 | The 30-day period is in calendar days (not trading days). |
| BR-06-05-4 | Cross-watchlist continuity applies: if the stock is on any one of the user's watchlists at any point, it is considered "on watchlist" for that period. |
| BR-06-05-5 | XP grant: +150. Idempotency key: `"{user_id}_BADGE_WHALE_WATCHER_XP"`. |

---

### FR-GAME-06-06: Badge Award — Challenge King

- **Priority:** P1
- **Description:** Each time a user wins a weekly challenge (per FR-GAME-04), the system increments `badge_progress.challenge_wins_count`. When the count reaches 3, the badge is awarded. Wins are cumulative across all weeks.

#### Business Rules

| # | Rule |
|---|---|
| BR-06-06-1 | Wins are cumulative; they do not need to be consecutive weeks. |
| BR-06-06-2 | Idempotency key for deduplication: `(user_id, challenge_week_id)`. |
| BR-06-06-3 | Once awarded, `BADGE_CHALLENGE_KING` is never revoked, even if wins are reversed. |
| BR-06-06-4 | XP grant: +150. Idempotency key: `"{user_id}_BADGE_CHALLENGE_KING_XP"`. |

---

### FR-GAME-06-07: Badge Award — Streak Master

- **Priority:** P1
- **Description:** When FR-GAME-05 updates a user's learning streak to ≥ 30, the badge is awarded. Streak Freeze days (per FR-GAME-05) count as valid streak days.

#### Business Rules

| # | Rule |
|---|---|
| BR-06-07-1 | The streak value consumed from FR-GAME-05 is the authoritative source. |
| BR-06-07-2 | Badge is awarded the first time `current_streak >= 30`; re-achieving 30 after a break yields no award. |
| BR-06-07-3 | XP grant: +200. Idempotency key: `"{user_id}_BADGE_STREAK_MASTER_XP"`. |

---

### FR-GAME-06-08: Badge Award — Zen Trader

- **Priority:** P1
- **Description:** The Zen Trader badge rewards users who avoid panic-selling for 4 consecutive complete calendar weeks (Mon–Sun). Panic-sell condition: `(one_hour_high − current_price) / one_hour_high >= 0.03` AND SELL order placed within 15 minutes of the price first breaching −3%.

#### Panic-Sell Flag Detection — Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-06-08-1 | Stock had a 1-hour high of 50,000 VND; current price is 48,000 VND (drop = 4%) | User places SELL within 15 minutes | Panic-sell flag inserted into `behavioral_events` |
| AC-06-08-2 | Drop = 2.8% (< 3%) | User places SELL | No panic-sell flag |
| AC-06-08-3 | Drop = 4% but SELL placed 20 minutes after drop | — | No panic-sell flag (> 15-minute window) |

#### Business Rules

| # | Rule |
|---|---|
| BR-06-08-1 | Panic-sell condition: `(one_hour_high − current_price) / one_hour_high >= 0.03` AND `placed_at` is within 15 minutes of the price first crossing −3%. |
| BR-06-08-2 | "Prior 1-hour high" = max price in 60-minute window `[placed_at − 60 min, placed_at]`. |
| BR-06-08-3 | A "clean week" = Mon 00:00 ICT – Sun 23:59:59 ICT with zero `PANIC_SELL` flags. |
| BR-06-08-4 | Four consecutive clean weeks must be the 4 most recently completed calendar weeks at evaluation time. |
| BR-06-08-5 | XP grant: +250. Idempotency key: `"{user_id}_BADGE_ZEN_TRADER_XP"`. |

---

### FR-GAME-06-09: Badge Award — Branch Completion Badges (from FR-GAME-07)

- **Priority:** P0
- **Description:** When FR-GAME-07 transitions any branch to `Branch-Complete` state, the corresponding badge is awarded. Mapping: Branch A → `BADGE_BRANCH_MF`, Branch B → `BADGE_BRANCH_AN`, Branch C → `BADGE_BRANCH_PT`, Branch D → `BADGE_BRANCH_TP`.

---

### FR-GAME-06-10: Badge Display on User Profile

- **Priority:** P0
- **Description:** The user profile screen displays all earned badges in a dedicated badges section. Ordered: Epic first → Rare → Uncommon → Common; within each rarity ordered by `awarded_at DESC`.

#### Business Rules

| # | Rule |
|---|---|
| BR-06-10-1 | Badge display order: Epic > Rare > Uncommon > Common; ties broken by `awarded_at DESC`. |
| BR-06-10-2 | Badge artwork CDN URL: `https://cdn.paave.vn/badges/{badge_id}.png`. |
| BR-06-10-3 | Hexagon shape: 16px in community feed post; 20px on profile badge strip; 48px on badge detail modal. |

---

### FR-GAME-06-11: Badge Display on Community Feed Posts

- **Priority:** P1
- **Description:** Top 3 badges (by rarity, then recency) rendered as 16px hexagon icons adjacent to the username on community feed posts.

#### Business Rules

| # | Rule |
|---|---|
| BR-06-11-1 | Maximum 3 badges shown in feed context. |
| BR-06-11-2 | If user has 0 badges, badge strip is absent (no empty placeholder). |
| BR-06-11-3 | Badge data is included in feed post author object; no separate per-post API call. |

---

### FR-GAME-06-12: Duplicate Award Prevention

- **Priority:** P0
- **Description:** Before any badge insert, the system checks `badge_awards` for `(user_id, badge_id)`. If found, the insert is skipped. Enforced at both application layer and database layer (unique constraint).

---

### FR-GAME-06-13: Shareable Moment Card Generation

- **Priority:** P1
- **Description:** When a Rare or Epic badge is awarded, an async job generates two moment card variants: 1080×1920px (9:16) and 1080×1080px (1:1). Stored on CDN at `https://cdn.paave.vn/moment-cards/{user_id}/{badge_id}/{format}.png`.

#### Card Content Specification

| Element | Specification |
|---|---|
| Background | Dark gradient: `#0F172A` → `#1E293B` |
| "Achievement Unlocked" label | Centred, white, 24px |
| Badge artwork | Centred, 240×240px hexagon |
| Badge name | Below artwork, white bold, 32px |
| Rarity pill | Colour = rarity hex, white text, 12px rounded pill |
| Username | `@{username}`, grey, 18px |
| Date | `DD MMM YYYY` ICT, grey, 14px |

#### Business Rules

| # | Rule |
|---|---|
| BR-06-13-1 | Moment cards generated ONLY for Rare and Epic badges. |
| BR-06-13-2 | Card generation is asynchronous and non-blocking. |
| BR-06-13-3 | Generation is idempotent: existing CDN card is not regenerated. |

---

### FR-GAME-06-14: Badge Data Schema

#### `badge_awards` table

| Column | Type | Constraints |
|---|---|---|
| `id` | bigint | PK, auto-increment |
| `user_id` | integer | FK → users.id, NOT NULL |
| `badge_id` | varchar(64) | NOT NULL |
| `awarded_at` | timestamptz | NOT NULL, DEFAULT NOW() |
| `idempotency_key` | varchar(128) | UNIQUE NOT NULL, format: `{user_id}_{badge_id}` |

#### `badge_progress` table

| Column | Type | Description |
|---|---|---|
| `user_id` | integer | PK, FK → users.id |
| `green_trading_days_streak` | integer | DEFAULT 0 |
| `sharp_shooter_triggered_count` | integer | DEFAULT 0 |
| `challenge_wins_count` | integer | DEFAULT 0 |
| `zen_consecutive_clean_weeks` | integer | DEFAULT 0 |

#### `behavioral_events` table (Zen Trader)

| Column | Type | Constraints |
|---|---|---|
| `id` | bigint | PK, auto-increment |
| `user_id` | integer | FK → users.id, NOT NULL |
| `flag_type` | varchar(64) | NOT NULL (e.g. `"PANIC_SELL"`) |
| `order_id` | integer | nullable |
| `stock_code` | varchar(16) | nullable |
| `flagged_at` | timestamptz | NOT NULL |
| `one_hour_high` | numeric(18,2) | nullable |
| `current_price` | numeric(18,2) | nullable |
| `price_drop_pct` | numeric(6,4) | nullable |

---

## FR-GAME-06 Global Business Rules

| # | Rule |
|---|---|
| BR-06-GLOBAL-1 | All badges are awarded at most once per user. No badge can be revoked after award. |
| BR-06-GLOBAL-2 | Moment cards are generated for Rare and Epic rarity only. |
| BR-06-GLOBAL-3 | Badge evaluation is event-driven for action-based badges; score-based badges (Green Week, Zen Trader) are evaluated on daily/weekly batch. |
| BR-06-GLOBAL-4 | All XP grants from badge awards use FR-GAME-01's queued retry mechanism and are idempotent. |
| BR-06-GLOBAL-5 | The `badge_awards` table is the authoritative source of truth. Client-side state is not trusted. |

---

---

# MODULE: FR-GAME-07 — Skill Tree

## Overview

The Skill Tree is a structured learning progression system with 4 parallel branches totalling 21 nodes. All branches are available from registration. Node progression is event-driven. Branch completion awards an Epic badge (via FR-GAME-06) and an XP burst.

## Branch Definitions

| Branch ID | Name | Nodes | Badge on Complete |
|---|---|---|---|
| A | Market Foundations | 7 | `BADGE_BRANCH_MF` (Epic) |
| B | Analysis | 5 | `BADGE_BRANCH_AN` (Epic) |
| C | Portfolio Thinking | 5 | `BADGE_BRANCH_PT` (Epic) |
| D | Trader Psychology | 4 | `BADGE_BRANCH_TP` (Epic) |

## Node State Definitions

| State | Display | Description |
|---|---|---|
| `LOCKED` | Greyed-out node, lock icon | One or more prerequisites not yet satisfied |
| `AVAILABLE` | Active node, no progress indicator | All prerequisites satisfied; lesson not yet started |
| `IN_PROGRESS` | Active node with progress ring | Lesson started but not completed |
| `COMPLETE` | Filled node with checkmark | Lesson completed AND trade requirement (if any) satisfied |
| `BRANCH_COMPLETE` | Branch banner displayed | All nodes in the branch are `COMPLETE` |

## Complete Node Definition Table

| Node ID | Branch | Name | Prereq Nodes | Required Lesson ID | Required Trade Count | Required Other |
|---|---|---|---|---|---|---|
| `A1` | A | What is the Stock Market? | — | L1.1 | 0 | — |
| `A2` | A | How Stocks are Priced | `A1` | L1.2 | 0 | — |
| `A3` | A | Reading a Price Chart | `A2` | L1.3 | 0 | — |
| `A4` | A | Understanding Market Orders | `A3` | L1.4 | 1 | First trade placed (any side) |
| `A5` | A | Trading Sessions & Hours | `A4` | L1.5 | 0 | — |
| `A6` | A | Market Indices (VN-Index, HNX) | `A5` | L2.1 | 0 | — |
| `A7` | A | Reading a Company Overview | `A6` | L2.2 | 0 | — |
| `B1` | B | Introduction to Candlesticks | — | L2.3 | 0 | — |
| `B2` | B | Support & Resistance Basics | `B1` | L2.4 | 0 | — |
| `B3` | B | Moving Averages | `B2` | L2.5 | 1 | Tagged trade: `analysis_method = "SUPPORT"` |
| `B4` | B | Volume Analysis | `B3` | L3.1 | 0 | — |
| `B5` | B | Reading P/E and Basic Ratios | `B4` | L3.2 | 0 | — |
| `C1` | C | What is a Portfolio? | — | L3.3 | 0 | — |
| `C2` | C | Diversification Principles | `C1` | L3.4 | 0 | — |
| `C3` | C | Position Sizing | `C2` | L3.5 | 2 | User has ≥2 distinct stocks held simultaneously |
| `C4` | C | Risk-Reward Ratio | `C3` | L4.1 | 0 | — |
| `C5` | C | Portfolio Review Process | `C4` | L4.2 | 0 | — |
| `D1` | D | Emotion & Trading Decisions | — | L4.3 | 0 | — |
| `D2` | D | Avoiding FOMO | `D1` | L4.4 | 0 | — |
| `D3` | D | Developing a Trading Plan | `D2` | L4.5 | 1 | User has set ≥1 price alert |
| `D4` | D | Reflecting on Your Trades | `D3` | — | 3 | User has ≥3 total filled trades; no lesson required |

---

### FR-GAME-07-01: Skill Tree Node State Evaluation

- **Priority:** P0
- **Description:** After any qualifying event (lesson completed, trade filled, alert rule created, portfolio snapshot with ≥2 distinct positions), the system re-evaluates ALL 21 node states for the affected user. Results are written to `skill_tree_progress`. Re-evaluation is complete-scan (all nodes).

#### Node State Transition Rules

1. If any prerequisite node is not `COMPLETE` → state = `LOCKED`
2. Else if lesson required AND lesson status ≠ `COMPLETE`:
   - If lesson = `NOT_STARTED` → state = `AVAILABLE`
   - If lesson = `IN_PROGRESS` → state = `IN_PROGRESS`
3. Else if lesson = `COMPLETE` AND all trade/other requirements met → state = `COMPLETE`
4. After all nodes: if all nodes in a branch are `COMPLETE` and branch not previously `BRANCH_COMPLETE` → emit `branch_complete_event`

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-07-01-1 | New user registers | Registration completes | A1, B1, C1, D1 are `AVAILABLE`; all others are `LOCKED` |
| AC-07-01-2 | User completes L1.1 | `LESSON_COMPLETE` fires | A1 → `COMPLETE`; A2 → `AVAILABLE` |
| AC-07-01-3 | User completes L1.4 but has not placed a trade | Event fires | A4 is `IN_PROGRESS` |
| AC-07-01-4 | User places first trade after completing L1.4 | `TRADE_FILLED` fires | A4 → `COMPLETE`; A5 → `AVAILABLE` |
| AC-07-01-5 | User completes all 7 nodes in Branch A | A7 → `COMPLETE` | Branch A = `BRANCH_COMPLETE`; `BADGE_BRANCH_MF` awarded; XP +50 burst queued |

#### Business Rules

| # | Rule |
|---|---|
| BR-07-01-1 | Re-evaluation is a full scan of all 21 nodes on every qualifying event. |
| BR-07-01-2 | `skill_tree_progress` is server-side authoritative. |
| BR-07-01-3 | State transitions are forward-only: `LOCKED → AVAILABLE → IN_PROGRESS → COMPLETE`. |
| BR-07-01-4 | `BRANCH_COMPLETE` emits event exactly once, protected by idempotency key. |

---

### FR-GAME-07-02: Skill Tree Display — Locked Node Visibility

- **Priority:** P0
- **Description:** All 21 nodes are always visible. Locked nodes displayed at opacity 40% with lock icon. Tapping a locked node shows a bottom sheet listing unmet prerequisites.

---

### FR-GAME-07-03: XP Grants for Node Completion

#### Node XP Table

| Node ID | XP Grant |
|---|---|
| A1 | 10 |
| A2 | 10 |
| A3 | 15 |
| A4 | 20 |
| A5 | 15 |
| A6 | 20 |
| A7 | 20 |
| B1 | 15 |
| B2 | 20 |
| B3 | 25 |
| B4 | 20 |
| B5 | 25 |
| C1 | 15 |
| C2 | 20 |
| C3 | 25 |
| C4 | 20 |
| C5 | 25 |
| D1 | 15 |
| D2 | 20 |
| D3 | 25 |
| D4 | 30 |
| **Branch Completion Burst (each branch)** | **+50** |

#### Business Rules

| # | Rule |
|---|---|
| BR-07-03-1 | Node XP granted at `COMPLETE` state transition, not on lesson completion alone. |
| BR-07-03-2 | Branch completion XP burst (+50) is additional; fires independently. |
| BR-07-03-3 | Node XP idempotency key: `"{user_id}_{node_id}_NODE_COMPLETE_XP"`. |
| BR-07-03-4 | Branch XP burst idempotency key: `"{user_id}_{branch_id}_BRANCH_COMPLETE_XP"`. |

---

### FR-GAME-07-04: Skill Tree Progress Initialisation on Registration

- **Priority:** P0
- **Description:** On successful user registration, 21 rows inserted into `skill_tree_progress` and initial evaluation runs. Result: A1, B1, C1, D1 = `AVAILABLE`; all others = `LOCKED`.

---

### FR-GAME-07-05: Skill Tree Data Schema

#### `skill_tree_progress` table

| Column | Type | Constraints |
|---|---|---|
| `id` | bigint | PK |
| `user_id` | integer | FK → users.id, NOT NULL |
| `node_id` | varchar(8) | NOT NULL |
| `branch_id` | varchar(2) | NOT NULL |
| `state` | varchar(20) | NOT NULL, ENUM: `LOCKED | AVAILABLE | IN_PROGRESS | COMPLETE` |
| `lesson_completed_at` | timestamptz | nullable |
| `trade_requirement_met_at` | timestamptz | nullable |
| `other_requirement_met_at` | timestamptz | nullable |
| `completed_at` | timestamptz | nullable |
| `updated_at` | timestamptz | NOT NULL |
| | | UNIQUE `(user_id, node_id)` |

---

## FR-GAME-07 Global Business Rules

| # | Rule |
|---|---|
| BR-07-GLOBAL-1 | All 4 branches available from registration. No branch is gated behind another. |
| BR-07-GLOBAL-2 | Re-evaluation triggered by: `LESSON_COMPLETE`, `TRADE_FILLED`, `ALERT_CREATED`, `PORTFOLIO_SNAPSHOT`. |
| BR-07-GLOBAL-3 | Re-evaluation always scans all 21 nodes. |
| BR-07-GLOBAL-4 | Node states are forward-only; `COMPLETE` never reverts. |
| BR-07-GLOBAL-5 | Branch completion triggers both FR-GAME-06 badge event AND XP burst independently. |
| BR-07-GLOBAL-6 | Lesson IDs map: Module 1 = L1.1–L1.5, Module 2 = L2.1–L2.5, Module 3 = L3.1–L3.5, Module 4 = L4.1–L4.5. |

---

---

# MODULE: FR-GAME-08 — Daily Missions

## Overview

Daily Missions present 3 bite-sized tasks per day to drive habitual engagement. Each mission awards XP on completion. The full mission pool contains 12 missions; 3 are selected each day via a category-balanced rotation. Daily Missions are **locked until the user completes Module 1** (gate enforced per FR-LEARN-12).

## Mission Catalogue (12 missions)

| Mission ID | Category | Title | Completion Criterion | XP Reward |
|---|---|---|---|---|
| `MISSION_TRADE_1` | Trade | Place a trade | Place ≥1 paper trade (any side, any stock) | +10 |
| `MISSION_TRADE_2` | Trade | Buy the dip | Place a BUY order on a watchlist stock that is down ≥2% from its previous close on the same day | +15 |
| `MISSION_TRADE_3` | Trade | Review open orders | Open the active orders screen and view ≥1 pending order; or open the orders tab if no orders exist | +5 |
| `MISSION_LESSON_1` | Learn | Daily lesson | Complete ≥1 micro-lesson (any module) | +25 |
| `MISSION_LESSON_2` | Learn | Double lesson | Complete ≥2 micro-lessons within the same calendar day | +40 |
| `MISSION_LESSON_3` | Learn | Keep the streak | Complete ≥1 lesson before 21:00 ICT (streak preservation window) | +15 |
| `MISSION_RESEARCH_1` | Research | Set a price alert | Create ≥1 new price alert rule (any stock) | +10 |
| `MISSION_RESEARCH_2` | Research | Read the news | Open and spend ≥30 seconds on any news article screen | +10 |
| `MISSION_RESEARCH_3` | Research | Watchlist check | Open the watchlist screen and tap any stock to view detail | +5 |
| `MISSION_PORTFOLIO_1` | Portfolio | Portfolio check | Open the Portfolio P&L tab | +5 |
| `MISSION_PORTFOLIO_2` | Portfolio | Review your trades | Open trade history and view ≥3 trade records (or all records if < 3 exist) | +10 |
| `MISSION_PORTFOLIO_3` | Portfolio | Score booster | Portfolio NAV is positive (> yesterday's closing NAV) at end of day | +20 |

---

### FR-GAME-08-01: Daily Mission Selection & Assignment

- **Priority:** P1
- **Actor:** System (scheduled job, runs at 00:00:00 ICT daily)
- **Description:** At midnight ICT, the system selects 3 missions for each active user from the 12-mission pool. Selection algorithm distributes across categories: 1 from Trade/Learn categories (alternating daily), 1 from Research, 1 from Portfolio. No mission is repeated on consecutive days for the same user if the pool size allows.
- **Input:**
  - `user_id`
  - `module_progress.M1_status` — must be `COMPLETE` for user to receive missions
  - Previous day's mission assignments (to avoid consecutive repetition)
- **Output:**
  - 3 rows inserted into `daily_mission_assignments`: `{ user_id, mission_id, assigned_date: today_ICT, status: ASSIGNED, completed_at: null }`
- **Precondition:**
  - User account is active
  - Module 1 completion status = `COMPLETE` (gate per FR-LEARN-12)
  - User has logged in within the last 14 days (inactive users receive no assignment; this prevents stale mission backlogs)
- **Postcondition:**
  - User has exactly 3 mission assignments for today

**Daily Selection Rule:**

| Slot | Day Type | Category |
|------|----------|----------|
| 1 | Odd calendar day (day % 2 = 1) | Trade |
| 1 | Even calendar day (day % 2 = 0) | Learn |
| 2 | Every day | Research (random from R1/R2/R3) |
| 3 | Every day | Portfolio (random from P1/P2/P3) |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-08-01-1 | User has Module 1 complete and is active | Midnight ICT | 3 missions assigned; Today's Goals widget on Home shows them |
| AC-08-01-2 | User has NOT completed Module 1 | Midnight ICT | No mission assignment created; Today's Goals widget shows locked state (FR-LEARN-12) |
| AC-08-01-3 | User has not logged in for 15 days | Midnight ICT | No mission assignment created; user receives assignments from their next login day onwards |
| AC-08-01-4 | Assignment job fails for a user | — | Retry up to 3 times within 30 minutes of midnight; if still failing, user receives no missions that day (no backfill) |

#### Business Rules

| # | Rule |
|---|---|
| BR-08-01-1 | Exactly 3 missions per active user per calendar day (ICT). |
| BR-08-01-2 | Missions expire at end of the calendar day (23:59:59 ICT); incomplete missions are marked `EXPIRED`. |
| BR-08-01-3 | No mission carries over to the next day. |
| BR-08-01-4 | Module 1 completion is required; gate evaluated at assignment time (midnight batch). |
| BR-08-01-5 | Inactive users (no login in 14 days) receive no assignments; assignments resume from next login. |

---

### FR-GAME-08-02: Mission Completion Detection

- **Priority:** P1
- **Actor:** System (event-driven; fires on qualifying user actions)
- **Description:** For each user action type, the system checks whether a matching mission is assigned and not yet completed today. If a match is found, the mission is marked `COMPLETED`, XP is granted, and a toast notification is shown in-app.
- **Input:**
  - Qualifying event payload (trade placed, lesson completed, alert created, news article time-on-screen, etc.)
  - `user_id`
  - `assigned_date` = today's ICT calendar date
- **Output:**
  - `daily_mission_assignments.status` updated to `COMPLETED`, `completed_at` = NOW()
  - XP grant queued via FR-GAME-01 with idempotency key `"{user_id}_{mission_id}_{assigned_date}"`
  - In-app toast: "+{XP} XP — [Mission title] complete!"
  - Home tab Today's Goals widget updates mission row to show checkmark
- **Precondition:**
  - Mission is in `ASSIGNED` status for today
  - User has not already completed this mission today
- **Postcondition:**
  - `daily_mission_assignments.status = COMPLETED`
  - XP enqueued; Today's Goals widget reflects completion

**Completion Detection Rules per Mission:**

| Mission ID | Detection Event | Additional Check |
|---|---|---|
| `MISSION_TRADE_1` | `paper_trade_placed` | Any trade type |
| `MISSION_TRADE_2` | `paper_trade_placed` with `side = BUY` | Target stock must be in user's watchlist AND stock daily change ≤ −2% at time of placement |
| `MISSION_TRADE_3` | `orders_screen_opened` | Any screen open event for active orders tab |
| `MISSION_LESSON_1` | `lesson_completed` | Any lesson |
| `MISSION_LESSON_2` | `lesson_completed` (2nd event) | 2 completions within same ICT calendar day |
| `MISSION_LESSON_3` | `lesson_completed` | `completed_at` timestamp is before 21:00:00 ICT |
| `MISSION_RESEARCH_1` | `alert_rule_created` | New rule only; updating existing rule does not count |
| `MISSION_RESEARCH_2` | `news_article_closed` with `time_on_screen >= 30s` | 30 seconds of active screen time on a news article |
| `MISSION_RESEARCH_3` | `stock_detail_opened_from_watchlist` | Stock must be opened directly from watchlist screen |
| `MISSION_PORTFOLIO_1` | `portfolio_pnl_tab_opened` | Tab view event |
| `MISSION_PORTFOLIO_2` | `trade_history_records_viewed` with `record_count >= 3` | Or all records if user has < 3 total |
| `MISSION_PORTFOLIO_3` | Daily batch at 23:55 ICT | Portfolio NAV > previous day's closing NAV |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-08-02-1 | `MISSION_TRADE_1` assigned today | User places any paper trade | Mission marked `COMPLETED`; +10 XP toasted |
| AC-08-02-2 | `MISSION_LESSON_2` assigned today | User completes 2nd lesson of the day | Mission marked `COMPLETED`; +40 XP toasted |
| AC-08-02-3 | `MISSION_LESSON_3` assigned today | User completes a lesson at 21:30 ICT | Mission NOT completed (past 21:00 window) |
| AC-08-02-4 | Mission already `COMPLETED` | Same qualifying event fires again | No duplicate XP grant; idempotency key prevents double-processing |
| AC-08-02-5 | Midnight ICT passes with `MISSION_PORTFOLIO_3` in `ASSIGNED` status | Daily batch runs | If NAV ≤ yesterday's closing NAV → status = `EXPIRED`; no XP |

#### Business Rules

| # | Rule |
|---|---|
| BR-08-02-1 | XP idempotency key: `"{user_id}_{mission_id}_{assigned_date}"` — prevents double grant on retry. |
| BR-08-02-2 | Missions can only be completed on their assigned date (ICT). No retroactive completion. |
| BR-08-02-3 | `MISSION_PORTFOLIO_3` is evaluated by batch job at 23:55 ICT, not by real-time event. |
| BR-08-02-4 | `MISSION_TRADE_2` requires the stock to be in the user's watchlist at the time of trade placement, not just on any watchlist. Watchlist membership is evaluated at `trade_placed_at`. |

---

### FR-GAME-08-03: Today's Goals Widget (Home Screen)

- **Priority:** P1
- **Actor:** Authenticated user (viewing Home tab)
- **Description:** The Today's Goals widget appears on the Home screen. It shows 3 mission cards for the day with title, XP reward, and completion status. Completed missions show a green checkmark. Expired missions (day ended, not completed) show a grey "Missed" label. Tapping a mission card navigates to the relevant screen.
- **Input:**
  - `GET /api/v1/gamification/daily-missions/today` — returns today's 3 assignments with status
- **Output:**
  - 3 mission cards rendered in widget
  - If Module 1 not complete: locked state shown instead (FR-LEARN-12)

**Widget Visual States:**

| Mission Status | Visual |
|---|---|
| `ASSIGNED` | Mission title + XP pill + action description; tappable; leads to relevant screen |
| `COMPLETED` | Green checkmark overlay; XP shown as "earned"; still tappable (navigates to screen) |
| `EXPIRED` | Grey overlay; "Mất rồi" (Missed) label; non-tappable |

**Deep Link Mapping per Mission:**

| Mission ID | Tap Destination |
|---|---|
| `MISSION_TRADE_1` / `MISSION_TRADE_2` / `MISSION_TRADE_3` | Paper trading order placement screen |
| `MISSION_LESSON_1` / `MISSION_LESSON_2` / `MISSION_LESSON_3` | Grow tab → Learning Path |
| `MISSION_RESEARCH_1` | Stock detail → set alert bottom sheet (pre-opens last viewed stock) |
| `MISSION_RESEARCH_2` | News tab |
| `MISSION_RESEARCH_3` | Profile → Watchlist screen |
| `MISSION_PORTFOLIO_1` | Portfolio → P&L tab |
| `MISSION_PORTFOLIO_2` | Portfolio → Trade History tab |
| `MISSION_PORTFOLIO_3` | Portfolio → P&L tab |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-08-03-1 | User has 3 missions assigned and 1 completed | Home tab loads | Widget shows 1 checkmarked card and 2 active cards |
| AC-08-03-2 | User has Module 1 not complete | Home tab loads | Widget shows locked state per FR-LEARN-12; no mission cards shown |
| AC-08-03-3 | New day begins at midnight ICT | User opens Home tab | Widget refreshes with 3 new missions; previous day's missions no longer shown |
| AC-08-03-4 | Widget API returns error | Home tab loads | Widget shows skeleton loader then error state with retry; other Home screen sections unaffected |

#### Business Rules

| # | Rule |
|---|---|
| BR-08-03-1 | Widget displays only today's missions. No historical missions shown in widget. |
| BR-08-03-2 | Widget is refreshed on every Home tab foreground event; cached for max 60 seconds. |
| BR-08-03-3 | Mission completion updates widget state in real-time via in-app toast + widget re-render (no full page reload required). |

---

### FR-GAME-08-04: Daily Mission Data Schema

#### `daily_mission_assignments` table

| Column | Type | Constraints |
|---|---|---|
| `id` | bigint | PK, auto-increment |
| `user_id` | integer | FK → users.id, NOT NULL |
| `mission_id` | varchar(32) | NOT NULL |
| `assigned_date` | date | NOT NULL (ICT calendar date, stored as UTC date at ICT midnight) |
| `status` | varchar(16) | NOT NULL, ENUM: `ASSIGNED`, `COMPLETED`, `EXPIRED` |
| `completed_at` | timestamptz | NULL |
| `xp_granted` | boolean | NOT NULL, DEFAULT false |
| `xp_idempotency_key` | varchar(128) | UNIQUE, format: `{user_id}_{mission_id}_{assigned_date}` |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

**Unique constraint:** `(user_id, mission_id, assigned_date)` — one assignment per user per mission per day.

#### `mission_definitions` table (static, seed data)

| Column | Type | Constraints |
|---|---|---|
| `mission_id` | varchar(32) | PK |
| `category` | varchar(16) | NOT NULL, ENUM: `TRADE`, `LEARN`, `RESEARCH`, `PORTFOLIO` |
| `title_vi` | varchar(100) | NOT NULL |
| `description_vi` | varchar(300) | NOT NULL |
| `xp_reward` | smallint | NOT NULL |
| `completion_event_type` | varchar(64) | NOT NULL |
| `completion_threshold` | jsonb | NULL (additional params, e.g. `{count: 2}`, `{min_seconds: 30}`) |
| `deep_link_target` | varchar(100) | NOT NULL |
| `is_active` | boolean | NOT NULL, DEFAULT true |

---

---

# MODULE: FR-GAME-09 — Segmented Leaderboards

## Overview

Segmented Leaderboards rank users by weekly Trader Score (FR-GAME-03) within their tier segment. Segmentation prevents F0 learners from being discouraging ranked against experienced traders. Leaderboards update every Sunday after Trader Score computation. The leaderboard screen is accessible from the Grow tab sub-navigation.

---

### FR-GAME-09-01: Leaderboard Segments & Ranking

- **Priority:** P2
- **Actor:** Authenticated user (viewer)
- **Description:** Users are assigned to leaderboard segments based on their current Trader Tier (FR-GAME-02). Rankings within each segment are ordered by the most recent weekly Trader Score (not cumulative score). Ties broken by `trader_score_computed_at DESC` (earlier computation = lower rank for ties in the same batch).
- **Input:**
  - `user_id`
  - `user.trader_tier` — integer 1–6
  - `weekly_trader_score` — numeric (from FR-GAME-03, most recent Sunday computation)
- **Output:**
  - User's rank within their segment
  - Top-N list (N = 50) for the segment

**Segment Definitions:**

| Segment ID | Name | Trader Tiers Included |
|---|---|---|
| `SEG_BEGINNER` | Phố Thường (Common Street) | Tier 1 (Seedling), Tier 2 (Apprentice) |
| `SEG_INTERMEDIATE` | Phố Thương Mại (Trade Street) | Tier 3 (Analyst), Tier 4 (Portfolio Manager) |
| `SEG_ADVANCED` | Phố Vàng (Gold Street) | Tier 5 (Expert), Tier 6 (Legend) |

**Privacy Rules:**

| Field | Display |
|---|---|
| Name | Pseudonym only (username from profile, NOT real name) |
| Avatar | User-chosen avatar or default avatar |
| Tier | Tier badge shown |
| Score | Weekly Trader Score shown |
| Rank | Numeric rank (#1, #2, ...) |
| Real identity | Never shown |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-09-01-1 | User is Tier 2 (Apprentice) | User views leaderboard | `SEG_BEGINNER` leaderboard shown by default |
| AC-09-01-2 | User's tier advances from 2 to 3 after Sunday score update | User views leaderboard | User appears in `SEG_INTERMEDIATE` from the next Sunday refresh |
| AC-09-01-3 | User had no activity that week (score = 0 or minimal) | Sunday refresh runs | User appears at bottom of segment with their computed score (even if minimal); they are not hidden |
| AC-09-01-4 | User views another segment | User taps segment switcher | Other segment's top-50 rendered; user's own position not highlighted (user is not in that segment) |

#### Business Rules

| # | Rule |
|---|---|
| BR-09-01-1 | Segment assignment is based on `trader_tier` at the time of Sunday score computation, not at leaderboard view time. |
| BR-09-01-2 | Rankings reflect the most recent weekly Trader Score only (not cumulative). Users who had no activity appear with score = their computed minimal score from FR-GAME-03. |
| BR-09-01-3 | Top-50 list is served per segment. User's own rank is always shown below the list if they are not in the top 50 (e.g., "Your rank: #142"). |
| BR-09-01-4 | Leaderboard data is updated exactly once per week after FR-GAME-03 runs (Sunday midnight UTC + processing time, targeting available before Monday 06:00 ICT). |
| BR-09-01-5 | Users with `account_status ≠ ACTIVE` (suspended, deactivated) are excluded from leaderboard display but their scores are retained in the DB. |

---

### FR-GAME-09-02: Leaderboard Display Screen

- **Priority:** P2
- **Actor:** Authenticated user
- **Description:** The Leaderboard screen is accessible from the Grow tab via horizontal pill sub-navigation. It shows three segment tabs. Default tab = user's current segment. Each entry in the list shows: rank, avatar, pseudonym, tier badge, weekly score.
- **Input:**
  - `GET /api/v1/gamification/leaderboard?segment={segment_id}&week={iso_week}`
  - Default: `segment = user's current segment`, `week = current/latest completed week`
- **Output:**
  - `{ segment_id, week, user_rank, user_score, top_50: [ { rank, user_id, pseudonym, avatar_url, tier, weekly_score } ] }`
- **Precondition:**
  - User is authenticated
- **Postcondition:**
  - No state change; read-only

**Screen Layout Specification:**

| Element | Spec |
|---|---|
| Segment tabs | 3 horizontal pills: "Người mới" (Beginners), "Trung cấp" (Intermediate), "Nâng cao" (Advanced) |
| Top 3 | Displayed with medal icons: 🥇🥈🥉; larger avatar size (40px vs 32px for others) |
| Rank column | Right-aligned numeric rank with `#` prefix |
| User's own row | Highlighted with `accent-primary` background tint; always visible (sticky at bottom if not in top 50) |
| Score column | Weekly Trader Score (integer) |
| Empty state | "Chưa có dữ liệu cho tuần này." (No data for this week yet.) — shown before Sunday computation |

#### Business Rules

| # | Rule |
|---|---|
| BR-09-02-1 | User can view all 3 segment tabs regardless of their tier; their own rank is only highlighted in their own segment. |
| BR-09-02-2 | Previous weeks' leaderboards accessible via a week selector (current week minus up to 4 weeks). |
| BR-09-02-3 | Leaderboard API response is cached for 5 minutes; real-time updates not required. |

---

### FR-GAME-09-03: Leaderboard Data Schema

#### `leaderboard_snapshots` table

| Column | Type | Constraints |
|---|---|---|
| `id` | bigint | PK, auto-increment |
| `segment_id` | varchar(20) | NOT NULL |
| `iso_week` | varchar(8) | NOT NULL (e.g. `"2026-W22"`) |
| `user_id` | integer | FK → users.id, NOT NULL |
| `weekly_score` | numeric(10,2) | NOT NULL |
| `rank` | integer | NOT NULL |
| `trader_tier` | smallint | NOT NULL (tier at time of snapshot) |
| `created_at` | timestamptz | NOT NULL |

**Unique constraint:** `(segment_id, iso_week, user_id)`

---

---

# MODULE: FR-GAME-10 — Seasonal Events

## Overview

Seasonal Events are time-limited themed challenges (1–4 weeks) tied to the Vietnamese market calendar or product milestones. They provide additional XP rewards and community engagement beyond the weekly challenges. At most one seasonal event is active at a time. A countdown banner appears on the Home screen and Grow tab when an event is active.

---

### FR-GAME-10-01: Seasonal Event Definition & Lifecycle

- **Priority:** P2
- **Actor:** System (admin-configured); Authenticated user (participant)
- **Description:** Seasonal Events are configured by admins with: title, description, start/end datetime, challenge type, completion criterion, XP reward, and a banner image. Events are published on their start datetime. Users are automatically enrolled when they first open the app during an active event period.

**Event Lifecycle States:**

| State | Description |
|---|---|
| `SCHEDULED` | Event configured, not yet started; not visible to users |
| `ACTIVE` | Between start and end datetime; visible, joinable, trackable |
| `ENDED` | End datetime passed; no new completions accepted; historical record retained |
| `CANCELLED` | Manually cancelled by admin; no XP awarded; event removed from UI |

**Launch Event Catalogue (V1):**

| Event ID | Name | Duration | Challenge Type | Completion Criterion | XP Reward |
|---|---|---|---|---|---|
| `SE_TET_SEASON` | Tết Trading Season | 2 weeks (Jan 15–28) | Portfolio return | Achieve positive paper portfolio return during the 2-week period | +200 |
| `SE_EARNINGS_SPRINT` | Earnings Season Sprint | 4 weeks (Oct) | Learning | Complete all lessons in Module 2 or 3 that user hasn't completed yet | +150 |
| `SE_IPO_CHALLENGE` | IPO Challenge | 1 week (triggered on major VN IPO listing) | Watchlist | Add the newly listed IPO stock to watchlist within 48h of listing | +100 |
| `SE_FIRST_HUNDRED` | First 100 Users | 1 week (product launch) | Social | Share ≥1 community post with the hashtag `#PaaveStart` | +100 |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-10-01-1 | `SE_TET_SEASON` is `ACTIVE` | User opens app during Jan 15–28 | Seasonal event banner appears on Home screen; user is auto-enrolled; Grow tab shows event card |
| AC-10-01-2 | User was already enrolled and event ends | Event transitions to `ENDED` | Banner removed; event card in Grow tab shows "Kết thúc" (Ended); completion status preserved |
| AC-10-01-3 | Two seasonal events are configured with overlapping dates | Admin publishes second event | System rejects with error: "A seasonal event is already active in this period. Adjust dates before publishing." Only one event active at a time. |
| AC-10-01-4 | User completes event criterion before end date | Completion event fires | XP +{reward} awarded; completion banner shown; event card shows "Hoàn thành" (Completed) checkmark |

#### Business Rules

| # | Rule |
|---|---|
| BR-10-01-1 | Maximum 1 active seasonal event at a time. Admin UI enforces this at publish time. |
| BR-10-01-2 | Users are auto-enrolled on first app open during the active period; no opt-in required. |
| BR-10-01-3 | Users who open the app for the first time after an event ends are NOT enrolled retroactively. |
| BR-10-01-4 | Seasonal event XP is in addition to (not replacing) weekly challenge XP. |
| BR-10-01-5 | Cancelled events award no XP. Users enrolled in a cancelled event are notified via push: "Sự kiện [name] đã bị huỷ." |
| BR-10-01-6 | Event start/end datetimes are stored in UTC; displayed in ICT to users. |

---

### FR-GAME-10-02: Seasonal Event Completion Detection

- **Priority:** P2
- **Actor:** System (event-driven and/or batch)
- **Description:** Completion is evaluated when qualifying actions occur. The detection mechanism varies by challenge type.

**Completion Detection per Challenge Type:**

| Challenge Type | Detection Mechanism | Notes |
|---|---|---|
| `PORTFOLIO_RETURN` | Batch at event end datetime | Portfolio NAV at event end > Portfolio NAV at event enrollment time |
| `LEARNING` | Event-driven on `module_completion` or `lesson_completed` | Check if user completed the target module during the event period |
| `WATCHLIST` | Event-driven on `watchlist_symbol_added` | Check if added stock matches event target ticker within 48h of listing |
| `SOCIAL` | Event-driven on `community_post_created` | Check if post body contains event hashtag |

#### Business Rules

| # | Rule |
|---|---|
| BR-10-02-1 | XP idempotency key: `"{user_id}_{event_id}_COMPLETION_XP"`. |
| BR-10-02-2 | For `PORTFOLIO_RETURN` events: NAV comparison uses the user's enrollment-time NAV snapshot as baseline, not a market-start NAV. |
| BR-10-02-3 | Completions accepted only while event is `ACTIVE`. Post-event-end completions are ignored. |

---

### FR-GAME-10-03: Seasonal Event Display

- **Priority:** P2
- **Description:** When a seasonal event is `ACTIVE`, a full-width banner card is shown on the Home screen below the Portfolio Hero Widget and above the watchlist. The banner shows: event name, event description (max 60 chars), countdown timer (days:hours remaining), and XP reward pill.
- **Input:**
  - `GET /api/v1/gamification/seasonal-event/active`
  - Returns current active event (or 204 No Content if none active)
- **Output:**
  - Event banner card if active event exists
  - Nothing (no placeholder) if no active event

**Banner Specification:**

| Element | Spec |
|---|---|
| Background | Event-specific gradient image (configured by admin); fallback: Lime `#CAFD00` gradient |
| Event name | Bold, dark `#0E0E0E`, max 30 chars |
| Countdown | "Còn X ngày" (X days left) or "Còn X giờ" (X hours left) when < 24h remain |
| XP pill | Lime `#CAFD00` pill with dark text: "+{xp} XP" |
| CTA | "Tham gia" (Join) if not enrolled; "Xem chi tiết" (View details) if enrolled |

#### Business Rules

| # | Rule |
|---|---|
| BR-10-03-1 | Banner is shown only when event is `ACTIVE` and user has not dismissed it. Dismissed banner stays hidden until next session. |
| BR-10-03-2 | Banner dismissal is session-local only; it reappears on the next app launch until the user has completed the event. |
| BR-10-03-3 | Once user completes the event, banner changes to "Hoàn thành" state (checkmark + "XP earned" label) for the remainder of the event period. |

---

### FR-GAME-10-04: Seasonal Event Data Schema

#### `seasonal_events` table

| Column | Type | Constraints |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `event_id` | varchar(32) | NOT NULL, UNIQUE |
| `name_vi` | varchar(100) | NOT NULL |
| `description_vi` | varchar(300) | NOT NULL |
| `challenge_type` | varchar(20) | NOT NULL, ENUM: `PORTFOLIO_RETURN`, `LEARNING`, `WATCHLIST`, `SOCIAL` |
| `start_at` | timestamptz | NOT NULL |
| `end_at` | timestamptz | NOT NULL |
| `xp_reward` | integer | NOT NULL |
| `status` | varchar(16) | NOT NULL, ENUM: `SCHEDULED`, `ACTIVE`, `ENDED`, `CANCELLED` |
| `challenge_config` | jsonb | NOT NULL (event-specific parameters) |
| `banner_image_url` | varchar(512) | NULL |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

#### `seasonal_event_enrollments` table

| Column | Type | Constraints |
|---|---|---|
| `id` | bigint | PK |
| `event_id` | varchar(32) | FK → seasonal_events.event_id |
| `user_id` | integer | FK → users.id |
| `enrolled_at` | timestamptz | NOT NULL |
| `enrollment_nav_snapshot` | numeric(18,2) | NULL (for PORTFOLIO_RETURN events: NAV at enrollment time) |
| `status` | varchar(16) | NOT NULL, ENUM: `ENROLLED`, `COMPLETED`, `MISSED` |
| `completed_at` | timestamptz | NULL |
| `xp_granted` | boolean | NOT NULL, DEFAULT false |
| `xp_idempotency_key` | varchar(128) | UNIQUE |

**Unique constraint:** `(event_id, user_id)`

---

## FR-GAME-10 Global Business Rules

| # | Rule |
|---|---|
| BR-10-GLOBAL-1 | Seasonal events run in parallel with weekly challenges (FR-GAME-04). A user can participate in both simultaneously. |
| BR-10-GLOBAL-2 | Seasonal event XP uses FR-GAME-01 idempotent queued retry. |
| BR-10-GLOBAL-3 | At most one seasonal event is `ACTIVE` at any time. This is enforced at the DB level via a partial unique index on `status = 'ACTIVE'`. |
| BR-10-GLOBAL-4 | Seasonal events are not personalized in V1; all active users receive the same event. |
| BR-10-GLOBAL-5 | Event content (name, description, banner) is admin-configured and not generated dynamically. |
