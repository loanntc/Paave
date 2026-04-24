# FRD-12: AI Insights

**Version:** 2.4
**Date:** 2026-04-21
**Status:** Authoritative — v2.4 supersedes all prior versions
**Product:** Paave — Vietnam Gen Z Paper Trading & Social Investing App

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | AI Insights — Post-Trade Explanation, Natural Language Stock Query, Multilingual Routing, Portfolio Health Check, Behavioral Nudges |
| Primary Actors | Authenticated User (LEARN_MODE or FULL_ACCESS), System (AI service, scheduler, pattern detector) |
| Goal | Provide contextual, educational AI commentary on trades and portfolio behavior. Never issue buy/sell recommendations. Serve as a learning companion, not a financial advisor. |
| Trigger | Varies per feature: paper trade fill (FR-AI-01), user query (FR-AI-02), Sunday midnight (FR-AI-04 generation), trade event detection (FR-AI-05) |
| Compliance Anchor | FR-LEGAL-02 disclaimer must appear on every AI-generated output. "This is not financial advice." |
| Market Scope | VN (HOSE/HNX/UPCOM) primary. KR (KOSPI/KOSDAQ) at launch. Global = not in scope for AI responses. |
| AI Provider | Claude API (Anthropic). Prompt configs are per-language (vi, ko, en). |

---

## 2. Functional Requirements

---

### FR-AI-01: Post-Trade Explanation

- **Priority:** P0 — v2.4 amendment (AI card now visible to BOTH tiers; content differs by tier)
- **Actor:** System (AI card generator), Authenticated User (both LEARN_MODE and FULL_ACCESS)

**Description:**
After every paper trade fill event, the system generates and displays an AI-powered explanation card in a bottom sheet. The card is non-blocking (user can dismiss it), appears once per fill event, and is never re-shown when revisiting the trade history. The content varies based on the user's age-gate tier.

**Trigger:** Paper trade fill event (fill event ID from order engine). One card per fill event.

**Card Structure — Three Fixed Sections:**

| Section | Content Description |
|---------|---------------------|
| 1. What happened | Plain-language description of the price action. Example: "VIC dropped 2.3% in the hour before your fill, driven by broad market selling." |
| 2. Why | Top 1–2 causal factors identified from market data. Example: "Rising interest rate concerns pulled real estate stocks lower across the board." |
| 3. What to watch | One forward-looking signal relevant to the stock or sector. Example: "Watch for VIC's next earnings report on May 15 — historical pattern shows volatility ±3% around reporting dates." |

**Content Variants by User Tier (v2.4 amendment):**

| Tier | Content Rules | Example |
|------|--------------|---------|
| FULL_ACCESS (18+) | Balanced educational framing + P&L language allowed. Shows gain/loss in VND and percentage. | "You gained 1,250,000 VND (+2.5%) on this trade." |
| LEARN_MODE (16–17) | Educational framing ONLY. Order type mechanics explained. No mention of money gained or lost. No VND figures. No percentage gain/loss. | "A market order means your trade executed at the best available price at that moment." |

**API Prompt Requirements:**
- Prompt to Claude API includes `feature_tier: 'FULL_ACCESS'` or `feature_tier: 'LEARN_MODE'`
- Model instructed: if LEARN_MODE, omit all P&L language; focus on mechanics and market concepts
- Language context: user's active app language setting (vi, ko, en) included in prompt
- Claude API system prompt updated per-language with financial terminology localization

**Card Display Properties:**
- Rendered as: bottom sheet
- Dismissible: yes (swipe down or tap X)
- Blocking: no (user can interact with the app behind the sheet if dismissal is not triggered)
- Shown: once per fill event only; will NOT re-appear on revisiting trade history
- AI service unavailable: card shows "Analysis temporarily unavailable." with FR-LEGAL-02 disclaimer still present

**Disclaimer (FR-LEGAL-02):**
- Text: "This content is for educational purposes only and does not constitute financial advice."
- Displayed at the bottom of every AI card, regardless of content
- Displayed even when AI service is unavailable (disclaimer always shown)

**Quality Feedback:**
- Thumbs up (👍) / thumbs down (👎) buttons on each card
- Rating stored against the `fill_event_id` and `prompt_version`
- Used for model quality monitoring; not shown to other users

**Language:**
- Card language matches user's active app language setting (vi, ko, or en)
- If app language is Korean but stock is VN: card generated in Korean with VN market context

**Prohibited Content (applies regardless of tier):**
- No "buy this," "sell this," "this stock will go up/down" language
- No price targets
- Recommendation language filtered server-side before response is delivered to client

**Precondition:** Paper trade fill event has occurred; user is authenticated.

**Postcondition:** AI explanation card shown once. Rating (if given) stored. Card not re-shown.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AI-01-01 | FULL_ACCESS user, trade filled | Fill event fires | Bottom sheet appears with 3 sections; P&L in VND + percentage shown |
| AC-AI-01-02 | LEARN_MODE user, trade filled | Fill event fires | Bottom sheet appears with 3 sections; NO VND/percentage figures; order mechanics explained |
| AC-AI-01-03 | Either tier, card shown | User taps thumbs up | Rating stored; no UI change beyond visual feedback |
| AC-AI-01-04 | User dismisses card | Swipe down or X | Card dismissed; not re-shown on trade history revisit |
| AC-AI-01-05 | AI service unavailable | Fill event fires | Card shows "Analysis temporarily unavailable." + FR-LEGAL-02 disclaimer |
| AC-AI-01-06 | User's app language = Vietnamese | Card rendered | Card content in Vietnamese |
| AC-AI-01-07 | Card shown once | User revisits trade in history | No card shown again |
| AC-AI-01-08 | Any AI card rendered | Any tier, any language | FR-LEGAL-02 disclaimer visible at bottom of card |
| AC-AI-01-09 | LEARN_MODE, AI returns P&L language in response | Server receives AI response | Server-side filter strips P&L language before delivering to client |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Fill event fires but AI response takes >10s | Show loading state; after 10s show "Analysis temporarily unavailable." with disclaimer |
| User upgrades tier mid-session (16→18 birthday) | Next trade fill after tier update uses new tier prompt; existing cards not regenerated |
| Two fills on same order (partial fills) | Two separate AI cards generated (one per fill_event_id); each dismissed independently |
| Claude API returns recommendation language | Server-side content filter strips offending sentences; remainder of response delivered; flag for review |
| AI card generation fails silently | Next fill event creates a new card; failed card not retried (each fill = one card attempt) |

---

### FR-AI-02: Natural Language Stock Query

- **Priority:** P1
- **Actor:** Authenticated User (both tiers)

**Description:**
A chat interface allowing users to ask questions about stocks in natural language. The AI responds in the same language the user typed. Responses are scoped to VN (HOSE/HNX) and KR (KOSPI/KOSDAQ) stocks. The interface does not issue buy/sell recommendations.

**Access Points:**
- Bottom sheet launched from Stock Detail screen, OR
- Dedicated full-screen chat screen (exact placement determined by UX)

**Language Detection:**
- Language detected from the user's input text (not from the app language setting)
- Vietnamese input → Vietnamese response
- Korean input → Korean response
- English input → English response
- Mixed input → respond in the language of the majority of the message; fallback to Vietnamese if ambiguous

**Scope:**
- In scope: VN stocks (HOSE, HNX, UPCOM), KR stocks (KOSPI, KOSDAQ)
- Out of scope: US stocks, global indices, crypto, commodities, FX
- Out-of-scope query: respond with "I can only answer questions about Vietnam and Korea stocks right now."

**Financial Terminology:**
- Vietnamese: use standard Vietnamese financial terms (e.g., "cổ phiếu," "chỉ số P/E," "lợi suất cổ tức")
- Korean: use standard Korean financial terms (e.g., "주식," "PER," "배당수익률")
- English: standard financial English
- Financial terminology is locale-specific, not generic translation (FR-LANG-02 compliance)

**Conversation History:**
- Last 10 turns (10 user messages + 10 AI responses = 20 messages total) retained per session
- On session close (bottom sheet dismissed or screen exited): conversation history cleared
- History is in-memory only; not persisted to the server after session close

**Response Requirements (every response must include):**
1. Answer to the user's question (within scope)
2. Source attribution: "Source: [data provider name] / [date of data]"
3. FR-LEGAL-02 disclaimer: "This is for educational purposes only and does not constitute financial advice."

**Prohibited in Responses:**
- "Buy [stock]" or "Sell [stock]" language
- Price targets ("this stock will reach X")
- "This stock is a good/bad investment"
- These are filtered server-side before delivering response to client

**Timeout Handling:**
- If AI response takes >10 seconds: show "Taking longer than usual. Please try again."
- User's query is retained in the input field (not cleared)
- User may resubmit the same query

**Precondition:** User is authenticated; on Stock Detail screen or in AI chat screen.

**Postcondition:** AI response shown with disclaimer; history updated with this turn (max 10 turns retained).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AI-02-01 | User types Vietnamese question about VIC (VN stock) | Query submitted | AI responds in Vietnamese; VN financial terminology used |
| AC-AI-02-02 | User types Korean question about Samsung | Query submitted | AI responds in Korean; KR financial terminology used |
| AC-AI-02-03 | User asks about Apple Inc. (US stock) | Query submitted | Response: "I can only answer questions about Vietnam and Korea stocks right now." |
| AC-AI-02-04 | Every AI response | Any response delivered | Source attribution + FR-LEGAL-02 disclaimer present |
| AC-AI-02-05 | AI response includes "buy VIC" | Response delivered | "buy" recommendation filtered; remainder of response delivered |
| AC-AI-02-06 | AI response >10s | Timeout | "Taking longer than usual. Please try again." User's query retained. |
| AC-AI-02-07 | 11th turn in session | User sends message | Oldest turn (turn 1) dropped; last 10 turns retained |
| AC-AI-02-08 | User closes bottom sheet | Session closes | Conversation history cleared; next open = fresh session |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| User sends empty message | Submit button disabled (no submission possible) |
| User sends >2000 characters | Client-side: character limit enforced; excess characters cannot be typed |
| AI service unavailable | Response: "AI assistant is temporarily unavailable. Please try again later." + disclaimer |
| Language detection fails (indeterminate input) | Default to Vietnamese |
| User asks a question about a stock that is suspended/delisted | AI responds with available last-known information + note that the stock may be suspended |

---

### FR-AI-03: Multilingual AI Routing

- **Priority:** P1
- **Actor:** System (AI request router)

**Description:**
All AI requests (FR-AI-01, FR-AI-02, FR-AI-04, FR-AI-05 summaries) are routed through a server-side language router. The router selects the appropriate prompt configuration (system prompt + financial terminology glossary) based on the detected or declared language. This ensures AI responses use locale-appropriate financial terminology rather than generic machine translation.

**Language Routing Logic:**

| Source | How Language is Determined |
|--------|---------------------------|
| FR-AI-01 (Post-Trade Card) | User's active app language setting |
| FR-AI-02 (Stock Query) | Language auto-detected from user's input text |
| FR-AI-04 (Portfolio Health) | User's active app language setting |
| FR-AI-05 (Nudge text) | User's active app language setting |

**Prompt Configurations:**

| Language Code | Config Used | Notes |
|--------------|-------------|-------|
| `vi` | Vietnamese financial prompt config | VN market terminology; peer-tone for Gen Z users |
| `ko` | Korean financial prompt config | KR market terminology |
| `en` | English financial prompt config | International English; used as fallback |
| Any other | English (fallback) | With note in response: "Response generated in English." |

**Financial Terminology (not exhaustive):**

| Concept | Vietnamese | Korean | English |
|---------|-----------|--------|---------|
| Stock | Cổ phiếu | 주식 | Stock |
| P/E Ratio | Chỉ số P/E | PER (주가수익비율) | P/E Ratio |
| Dividend yield | Lợi suất cổ tức | 배당수익률 | Dividend yield |
| Market cap | Vốn hóa thị trường | 시가총액 | Market cap |
| Volume | Khối lượng giao dịch | 거래량 | Volume |
| Bull/Bear market | Thị trường tăng/giảm | 강세장/약세장 | Bull/Bear market |

**Language Change Mid-Session:**
- FR-AI-01, FR-AI-04, FR-AI-05: language setting read at request time; if user changes app language, next AI request uses new config
- FR-AI-02: language detected from input at query time; changing app language setting does not affect ongoing chat session

**Routing Failure:**
- If routing service fails or language config not found: fallback to English prompt config
- Response includes note: "Response generated in English. You can update your language in Settings."

**Precondition:** AI request prepared; language determined.

**Postcondition:** Correct prompt config used; response in correct language with locale-appropriate terminology.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AI-03-01 | User's app language = Vietnamese | AI request sent | Vietnamese prompt config used; VN financial terms in response |
| AC-AI-03-02 | User's app language = Korean | AI request sent | Korean prompt config used; KR financial terms in response |
| AC-AI-03-03 | Unknown language detected | AI request sent | English fallback used; note included in response |
| AC-AI-03-04 | User changes app language from VI to EN | Next AI request | English config used for new request |
| AC-AI-03-05 | Routing service unavailable | AI request | English fallback used; error logged |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Language config file missing for `vi` | Fallback to English; alert to engineering team |
| Language detected as `ja` (Japanese, not supported) | English fallback |
| Language config corrupted | English fallback; error logged; config reload attempted |

---

### FR-AI-04: Portfolio Health Check

- **Priority:** P1 — V1.x feature
- **Actor:** System (Sunday midnight generator, Monday 8AM push delivery), Authenticated User

**Description:**
Every week, the system generates a Portfolio Health report card for each active user with a non-empty virtual portfolio. The report card grades the portfolio across five dimensions and delivers it via push notification on Monday morning. The user can view the full report in-app.

**Generation and Delivery Schedule:**

| Time | Event |
|------|-------|
| Sunday midnight (server-side) | Report generated for each eligible user |
| Monday 08:00 (user's local time) | Push notification sent: "Your weekly portfolio health report is ready" |
| Monday onwards | Report viewable in Notification History for 30 days |

**Eligibility:**
- Portfolio must be non-empty (at least 1 holding)
- If portfolio is empty: no report generated; no push notification sent

**Five Graded Dimensions:**

| Dimension | Grade A | Grade D or F Trigger | Description |
|-----------|---------|---------------------|-------------|
| Diversification | ≥5 different sectors represented | <2 sectors | Measures sector spread across holdings |
| Concentration | No single holding >25% of portfolio | Any single holding >25% | Grade automatically D if any holding breaches 25% threshold |
| Volatility | Portfolio beta < 1.0 vs VN-Index | Portfolio beta > 1.5 | Measures portfolio beta relative to VN-Index benchmark |
| Geographic Exposure | VN holdings represent 70–100% | >30% in non-VN holdings | For VN primary users; KR/Global exposure flagged |
| Liquidity | <10% in stocks with avg daily volume < 100,000 shares | >30% illiquid | Measures proportion of portfolio in illiquid securities |

**Grade Scale:**
- A = Excellent
- B = Good
- C = Average
- D = Needs attention
- F = Critical issue
- Each dimension graded independently on this scale

**Overall Grade:**
- Weighted average of the five dimension grades
- Grade letters converted to numeric: A=4, B=3, C=2, D=1, F=0
- Overall numeric average converted back to letter grade
- Rounding: 2.5+ = B; 1.5+ = C; 0.5+ = D; <0.5 = F

**Radar Chart Visual:**
- Five-axis radar chart displayed in the report card
- Each axis represents one dimension
- Chart values plotted from center (worst) to edge (best)

**Drill-Down Interaction:**
- Tapping any dimension on the report card → opens FR-AI-02 (Natural Language Stock Query) chat
- Chat is pre-scoped to that dimension: system prompt pre-loads context about the specific dimension issue
- Example: tapping "Concentration" with VIC at 35% → opens AI chat with context "User's portfolio has VIC at 35%, above the 25% concentration guideline. Help them understand concentration risk."

**Retention:**
- Report retained in Notification History for exactly 30 days from generation date
- After 30 days: report expired and removed from Notification History
- Only the most recent report is "active"; prior reports accessible from history

**Portfolio Scope:**
- ONLY paper (virtual) portfolio evaluated
- Brokerage real-money balance (if ever integrated in future) is never included — this is strictly paper portfolio

**Precondition:** User has non-empty virtual portfolio; Sunday midnight computation job runs.

**Postcondition:** Report generated and stored; push notification scheduled for Monday 08:00 local time.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AI-04-01 | User has 3 holdings in virtual portfolio | Sunday midnight | Report generated; push notification sent Monday 8AM local time |
| AC-AI-04-02 | User has empty virtual portfolio | Sunday midnight | No report generated; no push notification sent |
| AC-AI-04-03 | Single holding >25% of portfolio | Report generated | Concentration dimension graded D automatically |
| AC-AI-04-04 | User taps "Concentration" dimension | Tapped on report | FR-AI-02 opens with concentration context pre-loaded |
| AC-AI-04-05 | Report generated 31 days ago | User opens Notification History | Report no longer visible (expired after 30 days) |
| AC-AI-04-06 | Two reports exist (last 2 weeks) | User views history | Both accessible; most recent marked as current |
| AC-AI-04-07 | Overall: A(4) + B(3) + C(2) + B(3) + D(1) = avg 2.6 | Overall grade computed | Grade = B (2.5+ threshold) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| VN-Index benchmark unavailable for volatility calc | Use last available benchmark; flag dimension as "estimated" |
| Push notification delivery fails | Report still generated and accessible in Notification History; push retry once after 30 min |
| User disables push notifications | Report still generated; accessible in Notification History only |
| Portfolio has KR stocks | Geographic Exposure dimension reflects KR exposure; included in calculation |
| Grade computation tie (e.g., exactly 2.5) | Round up (2.5+ = B); documented rounding rule applied consistently |

---

### FR-AI-05: Behavioral Nudges

- **Priority:** P1 — V1.x feature
- **Actor:** System (pattern detector, runs on trade event), Authenticated User (receives toast)

**Description:**
The system detects four categories of potentially impulsive trading behavior in paper trades. When a pattern is detected, a single non-judgmental, peer-toned in-app toast notification is shown. The intent is educational — helping users recognize patterns — not to shame or block their trades.

**Detection Patterns:**

| Pattern | Detection Logic | Trigger Condition |
|---------|----------------|-------------------|
| FOMO Buy | Stock has risen >5% in the past 3 calendar days AND user places a paper buy order AND the stock was NOT on the user's watchlist prior to the 3-day run | All three conditions must be true simultaneously |
| Panic Sell | Stock has declined >4% in the past 1 calendar day AND user places a paper sell order | Both conditions must be true |
| Overtrading | User has executed >5 paper trade fills in the current calendar day | Checked after each fill; triggers on the 6th fill of the day |
| Concentration Creep | After executing the trade, a single holding would represent >25% of the total virtual portfolio value | Checked after fill is confirmed |

**Pattern Priority (when multiple patterns detected simultaneously — max 1 nudge/day):**
1. Concentration (highest priority — shown first)
2. FOMO
3. Panic
4. Overtrading (lowest priority)

**Toast Format:**
- Peer-toned, non-judgmental, never prescriptive
- Never use language like "You shouldn't have done this" or "This was a bad decision"
- Examples:
  - FOMO Buy: "Heads up — you just bought after a 5%+ run. Some traders check if the momentum is still there before jumping in. Just something to think about 🤔"
  - Panic Sell: "You just sold after a 4%+ drop. Selling into dips is common — worth checking if anything fundamental changed. No rush either way."
  - Overtrading: "6 trades today! Some traders find that more trades = more fees in real markets. Interesting experiment to track."
  - Concentration Creep: "VIC now makes up 28% of your portfolio. High concentration = higher ride, in both directions."

**Nudge Limits:**
- Maximum 1 nudge per user per calendar day (calendar day in user's registered timezone)
- If multiple patterns trigger on the same day: only the highest-priority pattern's nudge is shown; others are suppressed and NOT queued for later
- Suppressed nudges are still logged for Risk Discipline score purposes

**Delivery Channel:**
- In-app toast notification ONLY
- NOT a push notification (does not appear in device notification tray)
- Appears over the current screen; auto-dismisses after 6 seconds; OR user can dismiss manually

**User Rating:**
- Each toast has two response buttons: "Helpful 👍" and "Not helpful 👎"
- Rating stored: `{user_id, nudge_type, rating, timestamp}`
- Rating is optional — user may dismiss without rating

**Flag Logging (Risk Discipline):**
- Every pattern detection logs a flag against the user for the current week
- Flag is logged regardless of whether the nudge was shown (e.g., if nudge was suppressed because 1/day limit already reached, the flag is still logged)
- Flags feed FR-GAME-03 Risk Discipline component

**Toggle:**
- Nudges can be toggled off in Settings (referenced as FR-52 in other documents)
- When toggled off: pattern detection still runs; flags still logged; nudge toast is suppressed
- Risk Discipline impact remains even when nudges are toggled off

**Precondition:** Paper trade fill has occurred or portfolio state has changed; user has not already received a nudge today.

**Postcondition:** Toast displayed (if priority and daily limit conditions met); flag logged regardless.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AI-05-01 | Stock up >5% in 3 days; user buys; not on prior watchlist | Buy fill confirmed | FOMO nudge toast shown |
| AC-AI-05-02 | Stock down >4%; user sells | Sell fill confirmed | Panic Sell nudge toast shown |
| AC-AI-05-03 | User places 6th paper trade of the day | 6th fill confirmed | Overtrading nudge shown |
| AC-AI-05-04 | After trade, one holding = 28% of portfolio | Fill confirmed | Concentration Creep nudge shown |
| AC-AI-05-05 | Both FOMO and Concentration detected on same trade | Fill confirmed | Only Concentration nudge shown (higher priority); FOMO suppressed |
| AC-AI-05-06 | User already received nudge today; new pattern detected | New fill occurs | Nudge toast suppressed; flag still logged |
| AC-AI-05-07 | User rates nudge "Helpful" | Taps rating | Rating stored; toast dismissed |
| AC-AI-05-08 | User has nudges toggled off in Settings | Pattern detected | No toast shown; flag still logged; Risk Discipline still affected |
| AC-AI-05-09 | Overtrading: user has 5 fills and nudges toggled off | 6th fill | No toast; flag logged; next week's score reflects 1 flag |
| AC-AI-05-10 | FOMO Buy: stock was already on watchlist before 3-day run | Buy triggered | No FOMO nudge (watchlist condition not met) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Pattern detector service down | No nudge shown; no flag logged; error logged to backend; system resumes on recovery |
| Trade data for "prior 3 days" unavailable (new listing) | FOMO detection skipped for that stock until 3 days of price history available |
| Portfolio value is 0 (all cash) | Concentration Creep check skipped (no holdings to calculate proportion) |
| User places and immediately cancels a trade before fill | Pattern detection only fires on FILL events; cancellation before fill = no detection |
| Multiple fills from partial order simultaneously | Each fill triggers independent check; daily nudge limit still applies (only 1 toast total) |

---

## 3. Business Rules

| ID | Rule | Scope | Violation Behavior |
|----|------|-------|--------------------|
| BR-19 | AI responses must not contain buy or sell recommendations, price targets, or investment recommendations of any kind. | All AI features | Server-side content filter strips offending language; remainder delivered; flagged for review |
| BR-20 | Maximum 1 behavioral nudge toast per user per calendar day (in user's registered timezone). | FR-AI-05 | Second pattern detected: nudge suppressed; flag still logged |
| BR-21 | FR-LEGAL-02 disclaimer ("This is for educational purposes only and does not constitute financial advice.") must appear on every AI-generated output delivered to the user. | All AI features | Disclaimer injected server-side before delivery; cannot be removed by AI response |
| BR-27 | Every behavioral nudge pattern detection event logs a flag, regardless of whether the nudge was displayed. Flags reduce Risk Discipline in Trader Score. | FR-AI-05, FR-GAME-03 | Flag logging failure: retry; unrecoverable = score computed without that flag (user benefits slightly) |
| BR-29 | AI explanations and responses must attach to a specific ticker or portfolio context. Standalone AI chat with no stock context is not permitted. | FR-AI-01, FR-AI-02 | FR-AI-02 must be launched from Stock Detail or with a ticker pre-loaded |
| BR-AI-01 | LEARN_MODE users (16–17) must receive AI post-trade cards with educational framing only. No monetary P&L figures (VND or %) may appear in LEARN_MODE AI output. | FR-AI-01 | Content filter enforced server-side; LEARN_MODE prompt config used |
| BR-AI-02 | AI card (FR-AI-01) is shown exactly once per fill event. It is never regenerated or re-shown on trade history revisit. | FR-AI-01 | `card_shown = true` flag set on fill record after delivery |
| BR-AI-03 | AI chat conversation history (FR-AI-02) is session-scoped only. History is not persisted to server after session close. Max 10 turns retained in-session. | FR-AI-02 | On session close: history cleared from client memory |
| BR-AI-04 | Portfolio Health Check (FR-AI-04) evaluates ONLY the user's paper (virtual) portfolio. Brokerage or real-money balances are never included. | FR-AI-04 | Any brokerage data in scope = critical data boundary violation |
| BR-AI-05 | Nudge flags (FR-AI-05) are logged per-week and reduce the Risk Discipline component of the weekly Trader Score (FR-GAME-03). 1 flag = -10 pts; 4 flags = 0 Risk Discipline. | FR-AI-05, FR-GAME-03 | Flags must be recorded with week identifier to allow correct weekly aggregation |
| BR-AI-06 | AI responses are restricted to VN (HOSE/HNX/UPCOM) and KR (KOSPI/KOSDAQ) stock context. Out-of-scope queries must be declined with the standard out-of-scope message. | FR-AI-02 | "I can only answer questions about Vietnam and Korea stocks right now." |
| BR-AI-07 | Behavioral nudge detection runs on fill events only. Order placement (not yet filled) does not trigger nudge detection. | FR-AI-05 | Detection logic must confirm fill_event, not order_event |

---

## 4. AI Content Policy Reference

| Prohibited Category | Example | Handling |
|--------------------|---------|---------||
| Direct recommendation | "Buy VIC", "Sell HPG now" | Server-side filter; stripped from response |
| Price target | "VIC will reach 80,000 VND by Q3" | Server-side filter; stripped |
| Performance guarantee | "This stock will definitely go up" | Server-side filter; stripped |
| LEARN_MODE P&L language | "You gained 500,000 VND" (for LEARN_MODE users) | Prompt-level instruction; server-side validation |
| Missing disclaimer | Any response without FR-LEGAL-02 | Disclaimer appended server-side unconditionally |

---

## 5. AI Service SLA Requirements

| Requirement | Target | Breach Handling |
|-------------|--------|----------------|
| FR-AI-01 card generation latency | <5s p95 | After 10s: fallback to "unavailable" message |
| FR-AI-02 query response latency | <8s p95 | After 10s: timeout message shown; query retained |
| FR-AI-04 generation (batch, Sunday midnight) | All users processed within 4 hours | Partial generation logged; missing reports generated on retry |
| FR-AI-05 nudge detection latency | <3s after fill event | Nudge skipped if detection times out; flag not logged (acceptable loss) |
| Claude API unavailability | Handled gracefully | All AI features degrade to "unavailable" message; app remains fully functional without AI |
