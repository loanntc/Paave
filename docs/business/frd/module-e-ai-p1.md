## Module E: AI Insights P1 (V1.x)

> **Purpose:** Two narrow AI surfaces that deepen engagement *with the existing paper portfolio* — nothing more. **v2.1 removed** the pre-trade advisory card (FR-AI-04 in v2.0), personalized learning paths with spaced repetition (FR-AI-06 in v2.0), and echo-chamber behavioral detection.

---

#### FR-AI-04 — Portfolio Health Check *(was FR-AI-05 in v2.0)*

- **Actor:** Registered User with ≥ 1 holding in their paper portfolio
- **Description:** Weekly push notification every Monday 8AM user's local time: "Your weekly portfolio health check is ready." In-app report card with letter grade (A–F) per dimension:
  - Diversification (are holdings spread across sectors?)
  - Concentration (is any single holding >25% of portfolio?)
  - Volatility (portfolio beta vs. market)
  - Geographic Exposure (VN only / KR only / mixed)
  - Liquidity (% holdings in illiquid/low-volume stocks)
  - Radar chart visual for all 5 dimensions.
  - Tapping any dimension → opens conversational follow-up (FR-AI-02 chat mode scoped to that dimension).
- **Key Rules:**
  - Push notification togglable in FR-52 Notification Settings.
  - Report generated Sunday midnight; delivered Monday 8AM local.
  - Report retained for 30 days in Notification History (FR-47).
  - Overall grade = weighted average of 5 dimension grades.
  - Empty portfolio → health check skipped; notification not sent.
  - Health check analyzes the **paper** portfolio only. V1.x brokerage-linked real balances are never visible to Paave and are never scored.
- **Acceptance Criteria:**
  - Given user has 5 holdings with high concentration → Concentration grade "D"; overall grade below "B."
  - Given Monday 8AM → push notification delivered; tapping → in-app report card.
  - Given dimension tapped → AI chat opens scoped to that dimension.
- **Edge Cases:** User changes timezone → notification time adjusts from following Monday.
- **Priority:** P1

---

#### FR-AI-05 — Behavioral Nudges *(was FR-AI-07 in v2.0)*

- **Actor:** Registered User
- **Description:** System detects behavioral patterns and delivers non-judgmental nudges:
  - **FOMO buy**: stock up >5% in 3 days + user buys + stock was not on user's watchlist prior → nudge: "Heads up — this stock has moved fast recently. Here's what to consider."
  - **Panic sell**: stock down >4% + user places sell order → nudge: "Market drops happen. Here's a framework for thinking through sell decisions."
  - **Overtrading**: >5 paper trades in a single day → nudge: "You've been active today. Frequent trading can be costly — here's why."
  - **Concentration creep**: single holding reaches >25% of portfolio → nudge: "One stock is now a large part of your portfolio. Here's what diversification means."
- **Key Rules:**
  - Toast notification format: non-judgmental, peer-tone (BR-AI-05). Never says "don't do this."
  - Max 1 nudge per user per calendar day (user's local timezone).
  - User rates each nudge: "Helpful" / "Not helpful." Rating stored for model quality.
  - Nudge flags logged for Trader Score Risk Discipline component (FR-GAME-03).
  - Nudges delivered as in-app toast (not push notifications) — surfaced immediately on action detection.
  - Togglable in FR-52 Notification Settings.
  - Echo-chamber nudges (was in v2.0) are removed — overlap with the social-trading layer and had a high false-positive rate.
- **Acceptance Criteria:**
  - Given stock up 6% in 3 days + user buys (not on prior watchlist) → FOMO nudge toast appears within 5s.
  - Given 5 nudges possible in one day → only first one shown; rest suppressed.
  - Given "Not helpful" tapped → feedback stored; same nudge type reduced in frequency for this user.
- **Edge Cases:** Multiple behavior patterns triggered simultaneously → highest-priority behavior wins (Concentration > FOMO > Panic > Overtrading).
- **Priority:** P1

---

> **Removed in v2.1 (was in Module E v2.0):**
> - **FR-AI-04 Pre-Trade AI Card** — risked reading as advisory (conflicts with BR-AI-01); creates friction in the primary paper-trade loop.
> - **FR-AI-06 Personalized Learning Path** — Paave is not an education product in v2.1; spaced-repetition micro-lessons belong elsewhere.
> - **Echo-chamber subset of FR-AI-07** — overlaps with social-trading signals (Module F) and was high-false-positive.

---

