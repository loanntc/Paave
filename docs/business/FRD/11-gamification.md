# FRD-11: Gamification

**Version:** 2.4
**Date:** 2026-04-21
**Status:** Authoritative — v2.4 supersedes all prior versions
**Product:** Paave — Vietnam Gen Z Paper Trading & Social Investing App

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | Gamification — XP, Trader Tiers, Trader Score, Weekly Challenges, Learning Streaks |
| Primary Actors | Authenticated User (LEARN_MODE or FULL_ACCESS), System (scheduler, score engine) |
| Goal | Reward learning and disciplined trading behavior through visible progression mechanics that motivate consistent engagement without promoting reckless paper trading |
| Trigger | Various user actions: trade fill, lesson completion, daily login, challenge win, portfolio health improvement; and system jobs: weekly Sunday midnight score computation |
| Market Context | Primary: Vietnam (HOSE/HNX/UPCOM). KR/Global = reference-only with "Estimated data" label. All paper trading only — no real money |
| User Tiers | LEARN_MODE = 16–17 years old; FULL_ACCESS = 18+. Gamification applies equally to both tiers. Tier access is governed by age gate, not by Trader Tier |

---

## 2. Functional Requirements

---

### FR-GAME-01: XP System

- **Priority:** P0
- **Actor:** System (event processor), Authenticated User

**Description:**
XP (Experience Points) is a cumulative, monotonically increasing score assigned to each user. XP is earned by specific in-app actions. XP is never deducted. The XP total is displayed on the user's public profile, below the Trader Tier badge. XP feeds into Trader Tier thresholds (FR-GAME-02).

**XP Event Definitions:**

| Event | XP Awarded | Deduplication Rule |
|-------|-----------|-------------------|
| Paper trade fill | +10 | Once per `fill_event_id`; NOT per order. One order with partial fills = one XP event per fill. Deduped by `fill_event_id`. |
| Micro-lesson completed | +25 | Once per `lesson_id` per user. Repeating a lesson: no XP. |
| Daily login | +5 | Once per calendar day in user's registered timezone. First login of the day triggers XP. |
| Weekly challenge won | +100 | Once per challenge week. Awarded Sunday midnight after winner determination. |
| Portfolio health grade improved (week-over-week) | +15 | Awarded when overall portfolio health grade (FR-AI-04) improves compared to the prior week's grade (A > B → no improvement; B → A → improvement). Evaluated at same time as weekly score computation. |

**XP Award Processing:**
1. User action occurs → system emits XP event with unique `xp_event_id` and `event_type`
2. XP processor consumes event → checks deduplication table for `xp_event_id`
3. If duplicate: discard silently
4. If new: write XP record; increment `user.total_xp`
5. If XP processor fails: event queued for retry; retry is idempotent (same `xp_event_id` = no double-award)

**XP Display:**
- Profile screen: "XP: {total_xp}" displayed below Trader Tier badge
- XP does not have a visible cap or ceiling
- XP is shown as a whole number (no decimals)

**Precondition:** User is authenticated; action has occurred.

**Postcondition:** XP record written; `user.total_xp` incremented; display updated.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-GAME-01-01 | User's paper trade order is filled (one fill event) | Fill event fires | user.total_xp += 10; xp_event_id recorded as processed |
| AC-GAME-01-02 | Same fill_event_id arrives twice (duplicate) | Second event processed | No XP awarded; total_xp unchanged |
| AC-GAME-01-03 | User completes a lesson for the first time | Lesson completion recorded | user.total_xp += 25 |
| AC-GAME-01-04 | User repeats the same lesson (same lesson_id) | Lesson completed again | No XP awarded |
| AC-GAME-01-05 | User opens app for the first time today (local timezone) | Daily login event fires | user.total_xp += 5 |
| AC-GAME-01-06 | User opens app a second time today (same calendar day) | Second launch | No XP awarded; already processed for today |
| AC-GAME-01-07 | User wins weekly challenge | Sunday midnight computation completes | user.total_xp += 100 |
| AC-GAME-01-08 | Portfolio health grade improves from C to B (week-over-week) | Sunday midnight computation | user.total_xp += 15 |
| AC-GAME-01-09 | Portfolio health grade stays the same (B to B) | Sunday midnight computation | No XP for health; +0 |
| AC-GAME-01-10 | XP event processing fails (service down) | Event fire occurs | Event queued; retried; idempotent; no double-award on retry |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| XP event queue is full | Events held in dead-letter queue; processed when service recovers; eventual consistency |
| Multiple fills from one order (partial fills) | Each fill has its own fill_event_id; each earns +10 XP independently |
| User in timezone that crosses midnight mid-session | Daily XP evaluated at server-side calendar day boundary in registered timezone |
| total_xp overflows integer type | total_xp stored as 64-bit integer (BIGINT); no practical cap |
| Trade placed but fill never occurs (cancelled order) | No XP — XP only fires on fill, not on order placement |

---

### FR-GAME-02: Trader Tiers

- **Priority:** P0
- **Actor:** System (weekly evaluator), Authenticated User

**Description:**
Trader Tiers are a six-level progression system based on cumulative XP. Each tier has a localized name and a minimum XP threshold. Tiers are display-only — they do not unlock or restrict any features (feature access is governed by age-gate: LEARN_MODE vs FULL_ACCESS). Tier badge appears on the user's profile page and next to the author name on every community feed post.

**Tier Definitions:**

| Tier # | EN Name | VI Name | KR Name | Min XP (inclusive) |
|--------|---------|---------|---------|-------------------|
| 1 | Seedling | Mầm non | 새싹 | 0 |
| 2 | Apprentice | Học việc | 견습생 | 500 |
| 3 | Analyst | Chuyên viên | 분석가 | 1,500 |
| 4 | Portfolio Manager | Quản lý quỹ | 포트폴리오 매니저 | 3,500 |
| 5 | Expert | Chuyên gia | 전문가 | 7,500 |
| 6 | Legend | Huyền thoại | 레전드 | 15,000 |

**Tier Threshold Boundary Rule:** A user with exactly 500 XP is Tier 2 (boundary is inclusive).

**Tier Evaluation:**
- Re-evaluated weekly after Trader Score update (Sunday midnight UTC)
- Current tier = highest tier whose `min_xp` ≤ `user.total_xp`
- Tier can ONLY increase, never decrease (BR-25)
- If XP loss hypothetically occurred (not possible by design), tier would remain at highest attained

**Tier Badge Display:**
- Profile page: large badge with tier name localized to user's app language
- Community feed post header: small badge icon + tier name
- Badge design: distinct per tier (design spec in separate design system doc)

**Precondition:** User exists; weekly XP computation has run.

**Postcondition:** User's `current_tier` reflects highest tier their `total_xp` qualifies for.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-GAME-02-01 | User has 0 XP | Weekly evaluation runs | Tier 1 (Seedling) |
| AC-GAME-02-02 | User has exactly 500 XP | Weekly evaluation runs | Tier 2 (Apprentice) — boundary inclusive |
| AC-GAME-02-03 | User has 499 XP | Weekly evaluation runs | Tier 1 (Seedling) |
| AC-GAME-02-04 | User has 15,000 XP | Weekly evaluation runs | Tier 6 (Legend) |
| AC-GAME-02-05 | User is Tier 3 and gains enough XP to reach Tier 4 | Weekly evaluation | current_tier updated to 4 |
| AC-GAME-02-06 | User is Tier 4 | Data anomaly would cause XP to drop | current_tier remains 4 (BR-25; tiers never decrease) |
| AC-GAME-02-07 | User's app language = Vietnamese | Profile renders | Tier badge shows Vietnamese name (e.g., "Mầm non") |
| AC-GAME-02-08 | Tier 2 user posts in community feed | Post renders | Small Tier 2 badge shown next to author pseudonym |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Weekly evaluation job fails | Tier remains at last computed value; retry job on next run |
| User at Tier 6 (max) earns more XP | Tier stays at 6; XP continues to increment for leaderboard purposes |
| User's language changes mid-session | Badge label re-renders in new language on next screen load |

---

### FR-GAME-03: Trader Score

- **Priority:** P0
- **Actor:** System (weekly computation job, Sunday midnight UTC), Authenticated User (view only)

**Description:**
The Trader Score is a composite weekly performance metric. It is computed every Sunday at midnight UTC and is displayed on the user's public profile. The weekly score also contributes to cumulative XP-driven tier progression. The score reflects disciplined, consistent trading behavior — not just raw returns.

**Computation Schedule:** Sunday midnight UTC (00:00:00 UTC, start of Monday)

**Score Formula:**

| Component | Weight | Calculation Method |
|-----------|--------|-------------------|
| Return | 40% | Paper portfolio weekly return vs. Vietnam VN-Index benchmark. Formula: `(portfolio_value_end - portfolio_value_start) / portfolio_value_start * 100%` compared to benchmark. Normalized to 0–100 scale relative to peer group. |
| Consistency | 30% | Percentage of days in the week (Mon–Sun) where the user performed ≥1 "meaningful action." Meaningful actions: paper trade placed, lesson completed, portfolio health check reviewed. Daily login alone does not count as meaningful action for this metric. |
| Risk Discipline | 20% | Starts at 100 points. Each behavioral nudge flag logged by FR-AI-05 in this week reduces by 10 points. Maximum 4 flags = 0 Risk Discipline points. Minimum: 0 (cannot go negative). |
| Activity | 10% | Raw count of paper trades + lessons completed in the week. Normalized to 0–100 relative to peer group. |

**Risk Discipline Calculation Detail:**

| Flags in Week | Risk Discipline Score |
|--------------|----------------------|
| 0 | 20 (100% of 20% weight) |
| 1 | 18 (90% of 20% weight) |
| 2 | 16 (80% of 20% weight) |
| 3 | 14 (70% of 20% weight) |
| 4+ | 0 |

**KR/Global Trade Inclusion (Pending PO Decision #3):**
- Current decision: Option C — KR/Global estimated fill trades ARE included in score computation
- Displayed with "Estimated data" label on score breakdown screen
- If PO reverses decision: KR/Global trades excluded; score computed on VN trades only
- This document reflects Option C as current default

**No-Activity Week:**
- If user has zero meaningful actions for an entire week: minimal score is computed (score ≠ 0 to avoid harsh punishment; minimum score = 1)
- Tier is unaffected by a single no-activity week
- Streak (FR-GAME-05) is independently affected

**Score Display:**
- Public profile: "Trader Score: {score}" (integer, 0–100)
- Score breakdown available on profile (tap to expand): shows each component's contribution
- Weekly historical scores viewable (last 12 weeks)

**Cumulative Score vs. Weekly Score:**
- Weekly score = score for the current week's computation
- Weekly score is added to cumulative XP calculation for tier purposes (additive, not replacing)
- Trader Score displayed on profile = the most recent week's score (not cumulative average)

**Precondition:** User is registered; Sunday midnight UTC computation job runs.

**Postcondition:** `trader_score` updated; displayed on public profile.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-GAME-03-01 | User traded 5 days out of 7, 0 nudge flags, strong return | Sunday midnight | Score reflects high Consistency (100%), full Risk Discipline (20%), high Return weighting |
| AC-GAME-03-02 | User had 4 nudge flags in the week | Sunday midnight | Risk Discipline contribution = 0 |
| AC-GAME-03-03 | User had 2 nudge flags | Sunday midnight | Risk Discipline contribution = 16 points (80% of 20) |
| AC-GAME-03-04 | User did nothing all week | Sunday midnight | Minimal score (1) computed; tier unchanged |
| AC-GAME-03-05 | User has KR trades | Score computed | Included with "Estimated data" label per Option C |
| AC-GAME-03-06 | Computation job fails | Sunday midnight | Retry job on Monday; prior week score retained; no score shown as "0" due to job failure |
| AC-GAME-03-07 | User views profile | Any time | Trader Score shown = most recent completed weekly score |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| VN-Index benchmark data unavailable on Sunday midnight | Use last available benchmark value; flag score as "estimated" for that week |
| User registers mid-week | First week score computed with partial week data; proportional normalization applied |
| Two users have identical scores | Both shown at same rank on any leaderboard; no tiebreaker needed for display |
| Score normalization peer group < 5 users | Use absolute scoring thresholds instead of relative normalization |

---

### FR-GAME-04: Weekly Challenges

- **Priority:** P1
- **Actor:** System (challenge scheduler), Authenticated User

**Description:**
Every Monday, a new global challenge is made available to all users. Participation is automatic for any user who logs in on Monday. The challenge runs until Sunday midnight. Winners receive XP and a temporary profile badge. Challenges are uniform across all users (not personalized in V1).

**Challenge Lifecycle:**

| Day | Event |
|-----|-------|
| Monday 00:00 UTC | New challenge created; participation auto-enrolled for Monday logins |
| Monday onwards | User who logs in on Monday is automatically enrolled |
| Sunday 23:59 UTC | Challenge closes |
| Sunday midnight | Winner(s) determined; XP + badge awarded; challenge archived |

**Challenge Types (examples — not exhaustive list; content seeded by product team):**

| Example Challenge | Win Condition |
|------------------|---------------|
| "Top paper portfolio return in VN tech stocks this week" | Highest percentage return on VN tech stocks in virtual portfolio |
| "Complete 3 micro-lessons this week" | First user(s) to complete 3 or more lessons |
| "Most consistent trader — trade every day this week" | Users with trades on all 7 days of the week |

**Enrollment Logic:**
- User logs in on Monday → automatically enrolled in active challenge
- User does not log in on Monday → NOT enrolled; challenge shows as "Missed" in challenge history
- No manual opt-in or opt-out

**Winner Determination:**
- One winner per challenge (or tied winners if metrics are exactly equal)
- Winner receives: +100 XP (via standard XP system, FR-GAME-01) + challenge winner badge
- Badge: displayed on profile for exactly 7 days (168 hours from award time), then removed automatically
- Non-winner participants: no reward, but challenge listed as "Participated" in history
- Non-enrolled users: listed as "Missed" in challenge history

**Challenge History (on profile):**
- Reverse chronological list
- Each entry: challenge name, week, result (Won / Participated / Missed)
- Last 52 weeks retained

**V2 Note:** Personalized challenges (based on sector preferences) are scoped to V2.

**Precondition:** Monday 00:00 UTC has occurred; user is registered.

**Postcondition:** User enrolled (if logged in Monday) or marked Missed; winner state updated Sunday midnight.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-GAME-04-01 | User logs in on Monday | Login occurs | User enrolled in active challenge; challenge shown in app |
| AC-GAME-04-02 | User does not log in on Monday | Monday passes without login | Challenge marked "Missed" in user's history |
| AC-GAME-04-03 | User wins challenge | Sunday midnight computation | +100 XP awarded; winner badge visible on profile for 7 days |
| AC-GAME-04-04 | Challenge badge 7 days after award | Badge display | Badge removed from profile automatically |
| AC-GAME-04-05 | User participated but did not win | Challenge ends | "Participated" in history; no XP or badge |
| AC-GAME-04-06 | Two users tie for first | Winner determined | Both receive +100 XP and badge |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| No winner (no eligible participants) | No XP awarded; challenge archived with "No winner" |
| Challenge seeding fails (no challenge created for Monday) | Prior week's challenge extended; alert sent to product team |
| User logs in Monday then deletes account before Sunday | Challenge entry removed; excluded from winner pool |
| Winner XP award fails | Retry via XP queue (idempotent); XP awarded on retry |

---

### FR-GAME-05: Learning Streaks

- **Priority:** P1
- **Actor:** Authenticated User, System (streak evaluator)

**Description:**
A Learning Streak tracks the number of consecutive calendar days on which a user has completed at least one micro-lesson. The streak is shown on the user's profile. Streaks reset to zero if a day is missed. One Streak Freeze per week is available to protect a streak across a single missed day.

**Streak Counting:**
- A "day" is defined server-side using the user's registered timezone (set at account creation; not device timezone which may differ from registration)
- Completing ≥1 micro-lesson on a calendar day = day counts toward streak
- Day must have at least one lesson fully completed — starting a lesson does not count
- Streak increments at end of valid day (or upon first completion of the day — implementation detail, effect is the same)

**Streak Freeze:**
- Each user receives 1 Streak Freeze token per week
- Freeze tokens reset every Monday at midnight (user's registered timezone)
- Unused freeze tokens do NOT carry over to the next week (no accumulation)
- Freeze must be activated BEFORE midnight on the missed day — it is never retroactive
- When activated: the missed day is treated as if the user had completed a lesson; streak does not reset
- Each freeze protects exactly one day

**Streak Reset:**
- If user misses a day AND has not activated a freeze for that day: streak resets to 0 on the following day
- Streak reset is final; there is no recovery mechanism

**No Cap:**
- There is no maximum streak length
- Streak counter is stored as a 32-bit integer; can represent up to ~5.8 years of daily lessons without overflow

**Streak Display:**
- Profile screen: "🔥 {streak_count} day streak" (flame icon + count)
- Current freeze availability: "1 Freeze available this week" or "No freeze available (resets Monday)"

**Streak Freeze Activation:**
- User can activate freeze from the streak section of their profile
- Activation is available only on the current day if a lesson has NOT yet been completed that day
- Activation is not available after midnight has passed (it must be activated before the day ends)
- UI shows countdown to midnight when freeze is available

**Precondition:** User is authenticated; has a streak count (may be 0).

**Postcondition:** Streak accurately reflects consecutive lesson completion days; freeze state accurately reflects usage.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-GAME-05-01 | User completes a lesson today | Lesson completion recorded | Streak increments by 1 |
| AC-GAME-05-02 | User misses a day (no lesson), no freeze activated | Day passes | Streak resets to 0 |
| AC-GAME-05-03 | User misses a day, activates freeze before midnight | Freeze activated | Missed day treated as completed; streak continues |
| AC-GAME-05-04 | User tries to activate freeze retroactively (day already passed) | Freeze activation attempted | System rejects; "Freeze can only be activated before midnight." |
| AC-GAME-05-05 | User already used freeze this week, misses another day | Freeze activation attempted | No freeze available; streak resets to 0 |
| AC-GAME-05-06 | Monday arrives (new week) | Monday midnight in user's timezone | Freeze token restored to 1 regardless of prior week's usage |
| AC-GAME-05-07 | User carries 100-day streak | Week passes normally | Streak shows 100+; no cap applied |
| AC-GAME-05-08 | User in UTC+7 timezone, lesson completed at 23:50 local time | Lesson recorded | Counts for that local calendar day; streak maintained |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Server-side timezone lookup fails | Use UTC as fallback; log warning; correct on next reliable timezone resolution |
| User changes registered timezone in Settings | New timezone applied to streak evaluation from next day onwards; streak count preserved |
| Lesson completion event lost (service outage) | Event queued; streak evaluator uses lesson_completion records; eventual consistency |
| User activates freeze and also completes a lesson on the same day | Freeze activation is valid but redundant; freeze token is consumed (not returned); streak continues normally |
| Two freezes in a single week attempted | Second activation rejected: "You have used your freeze for this week." |

---

## 3. Business Rules

| ID | Rule | Scope | Violation Behavior |
|----|------|-------|--------------------|
| BR-25 | Trader Tier can only increase, never decrease. Once a tier is attained, it is permanent regardless of future XP trajectory. | FR-GAME-02 | System ignores any tier-decrease computation; current_tier remains at max attained |
| BR-GAME-01 | XP is never deducted. XP events are additive only. | FR-GAME-01 | System rejects any negative XP event |
| BR-GAME-02 | XP events must be idempotent. Retrying a failed XP event must not double-award XP. Deduplication key = xp_event_id. | FR-GAME-01 | Duplicate xp_event_id silently discarded |
| BR-GAME-03 | Daily login XP is awarded once per calendar day in the user's registered timezone. | FR-GAME-01 | Second login same day: no XP |
| BR-GAME-04 | Trade fill XP is awarded once per fill_event_id, not per order_id. | FR-GAME-01 | Multiple fills on one order = multiple XP events (one per fill) |
| BR-GAME-05 | Lesson XP (lesson_completed) is awarded once per lesson_id per user. Repeating a lesson earns no XP. | FR-GAME-01 | Repeat completion: silently ignored |
| BR-GAME-06 | Trader Score computation runs Sunday midnight UTC. If the job fails, it retries; the prior week score is retained and not zeroed. | FR-GAME-03 | Failed job: prior score held; retry queued |
| BR-GAME-07 | Risk Discipline in Trader Score cannot go below 0, even if nudge flags exceed 4. | FR-GAME-03 | Min clamped at 0 |
| BR-GAME-08 | Challenge enrollment is automatic on Monday login. There is no manual opt-in or opt-out. | FR-GAME-04 | System enrolls on Monday login unconditionally |
| BR-GAME-09 | Challenge winner badge displays for exactly 7 days (168 hours) from award time, then is auto-removed. | FR-GAME-04 | Badge removal is system-scheduled; no user action required |
| BR-GAME-10 | Streak Freeze tokens reset to 1 every Monday midnight in the user's registered timezone. Unused tokens do not accumulate. | FR-GAME-05 | Unused token from prior week discarded; new week starts with exactly 1 |
| BR-GAME-11 | Streak Freeze must be activated before the missed day's midnight in the user's registered timezone. Retroactive activation is not permitted. | FR-GAME-05 | Post-midnight activation rejected with error message |
| BR-GAME-12 | Learning Streak evaluates calendar days in the user's registered timezone (set at account creation), not the device timezone. | FR-GAME-05 | Streak uses server-side registered timezone |
| BR-20 | Maximum 1 behavioral nudge per user per calendar day (cross-FR rule originating in FR-AI-05). | FR-GAME-03 (Risk Discipline) | Second nudge suppressed even if detected |
| BR-27 | Behavioral nudge flags (from FR-AI-05) directly reduce the Risk Discipline component of the Trader Score. 1 flag = -10 points to Risk Discipline; 4 flags = 0. | FR-GAME-03 | Flags accumulated per week; applied at Sunday midnight score computation |

---

## 4. Gamification Data Model Reference

| Field | Table | Type | Notes |
|-------|-------|------|-------|
| `total_xp` | `users` | BIGINT | Cumulative XP, never decremented |
| `current_tier` | `users` | INTEGER (1–6) | Derived from total_xp; only ever increases |
| `trader_score` | `users` | INTEGER (0–100) | Most recent weekly score |
| `xp_event_id` | `xp_events` | UUID | Deduplication key; unique per XP event |
| `event_type` | `xp_events` | ENUM | trade_fill, lesson_completed, daily_login, challenge_won, health_improved |
| `streak_count` | `user_streaks` | INTEGER | Current consecutive lesson days |
| `streak_freeze_used` | `user_streaks` | BOOLEAN | Resets Monday midnight |
| `last_lesson_date` | `user_streaks` | DATE | Last date a lesson was completed (registered TZ) |
| `challenge_id` | `challenges` | UUID | One active challenge per week |
| `winner_badge_expires_at` | `user_challenges` | TIMESTAMP | 168 hours after award; NULL if not winner |
