## Module C: Gamification

> **Purpose:** Drive engagement, learning, and retention through XP, tiers, challenges, and streaks. Does not involve real money.

---

#### FR-GAME-01 — XP System

- **Actor:** Registered User
- **Description:** Users earn XP for specific actions. XP total displayed on profile and contributes to Trader Score. XP events:
  - Trade placed (paper): +10 XP
  - Lesson completed: +25 XP
  - Daily login: +5 XP
  - Weekly challenge won: +100 XP
  - Portfolio health improved (week-over-week grade improvement): +15 XP
- **Key Rules:**
  - Daily login XP: once per calendar day (user's local timezone).
  - Trade XP: once per executed trade (not per order placed); deduped per fill event.
  - XP is never deducted.
  - XP total displayed on profile screen below tier badge.
- **Acceptance Criteria:**
  - Given user completes a micro-lesson → XP counter on profile increments by 25.
  - Given user logs in twice in one day → daily login XP awarded only once.
- **Edge Cases:** XP event fires but backend fails → event queued for retry; XP granted eventually (idempotent event ID).
- **Priority:** P1

---

#### FR-GAME-02 — Trader Tiers

- **Actor:** Registered User
- **Description:** 6 tiers determined by cumulative Trader Score (FR-GAME-03). Tier names trilingual:

  | Tier | EN | VN | KR | Min Score |
  |------|----|----|-----|-----------|
  | 1 | Seedling | Mầm non | 새싹 | 0 |
  | 2 | Apprentice | Học việc | 견습생 | 500 |
  | 3 | Analyst | Chuyên viên | 분석가 | 1,500 |
  | 4 | Portfolio Manager | Quản lý quỹ | 포트폴리오 매니저 | 3,500 |
  | 5 | Expert | Chuyên gia | 전문가 | 7,500 |
  | 6 | Legend | Huyền thoại | 레전드 | 15,000 |

- **Key Rules:**
  - Tier badge shown on user profile and alongside every post in the community feed.
  - Tier is display-only; does not unlock features (feature access governed by FR-AGE-03).
  - Tier is re-evaluated weekly after Trader Score update (FR-GAME-03).
  - Tier can only increase, never decrease.
- **Acceptance Criteria:**
  - Given user reaches 1,500 cumulative score → tier badge updates to "Analyst / Chuyên viên / 분석가."
  - Given posts in community feed → tier badge shown next to author pseudonym.
- **Edge Cases:** Score threshold boundary (exactly 500) → upgrade to Apprentice.
- **Priority:** P1

---

#### FR-GAME-03 — Trader Score

- **Actor:** Registered User
- **Description:** Composite weekly score computed on Sundays. Formula:
  - Return (40%): paper portfolio weekly return vs. benchmark
  - Consistency (30%): % of days with at least one meaningful action (trade or lesson)
  - Risk Discipline (20%): absence of flagged behaviors (FOMO, panic sell, overtrading per FR-AI-05)
  - Activity (10%): raw trade + lesson count for the week
- **Key Rules:**
  - Score computed every Sunday at midnight UTC.
  - Score displayed on public profile and leaderboard (deferred V2 feature).
  - Weekly score is additive to cumulative score for tier progression.
  - Behavioral deductions: each FR-AI-05 flag in the week reduces Risk Discipline component by 10 points (max 4 flags = 0 Risk Discipline score for that week).
- **Acceptance Criteria:**
  - Given user had 5% weekly portfolio return with consistent activity and no flags → high score computed and added to profile.
  - Given Sunday midnight passes → score badge on profile updates.
- **Edge Cases:** User had no activity in a week → minimal score computed (Activity component = 0); tier not affected.
- **Priority:** P1

---

#### FR-GAME-04 — Weekly Challenges

- **Actor:** Registered User
- **Description:** Challenge card displayed on Home screen. New challenge issued every Monday. Examples: "Top paper portfolio return in VN tech stocks this week", "Complete 3 micro-lessons this week." Timer shows time remaining. Completion reward: XP + badge.
- **Key Rules:**
  - One challenge active at a time per user; challenge is consistent for all users (not personalized in V2).
  - Participation is automatic — user is entered into the challenge on Monday login.
  - Timer counts down to Sunday midnight.
  - Winner badge shown on profile for 1 week after winning.
  - XP reward: +100 (from FR-GAME-01).
- **Acceptance Criteria:**
  - Given Monday login → challenge card shows on Home with timer and description.
  - Given user's paper return tops the VN tech challenge → badge and +100 XP awarded Sunday night.
- **Edge Cases:** User did not log in during challenge week → not entered; challenge shows as "Missed" in challenge history.
- **Priority:** P1

---

#### FR-GAME-05 — Learning Streaks

- **Actor:** Registered User
- **Description:** Consecutive days counter for completing ≥1 micro-lesson per day. Streak counter shown on profile. Missed day resets streak to 0. One "Streak Freeze" item available per week — activating it before midnight on a missed day preserves the streak.
- **Key Rules:**
  - Streak day counts in user's local calendar day (midnight reset).
  - Streak Freeze refreshes weekly (Monday midnight local time); unused freezes do not accumulate.
  - Streak Freeze must be activated by the user before the day's midnight (cannot retroactively use).
  - Streak Freeze shown as an inventory item in the gamification section of profile.
  - Maximum streak shown: unlimited (no cap).
- **Acceptance Criteria:**
  - Given user completes a lesson on 5 consecutive days → streak shows "5" on profile.
  - Given user misses day 6 without activating freeze → streak resets to 0 on day 7 login.
  - Given Streak Freeze activated before midnight on missed day → streak preserved.
- **Edge Cases:** User in timezone near midnight → streak day evaluated server-side in user's registered timezone.
- **Priority:** P1

---

