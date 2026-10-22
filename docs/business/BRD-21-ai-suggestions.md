# BRD-21: AI Suggestions (Gợi ý hôm nay)
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Document version:** 1.0
**Date:** 2026-06-01
**Author:** Business Analysis Team
**Status:** Approved for Development
**Related Master BRD:** `docs/business/BRD.md` (v2.4)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Business Objectives](#2-business-objectives)
3. [KPIs](#3-kpis)
4. [Scope](#4-scope)
5. [Stakeholders](#5-stakeholders)
6. [Business Rules (High-Level)](#6-business-rules-high-level)
7. [Assumptions](#7-assumptions)
8. [Constraints](#8-constraints)
9. [Risk Register](#9-risk-register)
10. [Approval](#10-approval)
11. [Related Documents](#11-related-documents)

---

## 1. Problem Statement

### 1.1 Situation

Paave users create paper-trading accounts and receive a starting balance of 500,000,000 VND (virtual). The core product loop requires users to decide which HOSE/HNX stocks to research and trade. Without a starting point, new users face one of two failure modes:

**Failure Mode A — Random trading.** Users place paper trades based on name recognition or noise (e.g., stocks they have heard of). Trades carry no educational intent. Users do not develop the habit of reading technical signals before acting. The paper-trading experience fails to build financial literacy, reducing its long-term retention value.

**Failure Mode B — Inaction after onboarding.** Users complete onboarding, explore the Home screen once, and do not return. Without daily relevance — a reason to open the app and evaluate something specific — retention drops steeply after Day 1. There is no hook that brings the user back on Day 2, Day 3, or Day 7.

Both failure modes are observable in the current post-onboarding funnel. The Day-7 retention baseline is not yet measured (feature is pre-launch), but the absence of a daily content signal is an identified structural gap in the Home screen.

### 1.2 Root Cause

The Home screen provides price data and a watchlist but does not tell the user what is worth looking at today. The user must already know which stocks to research — a knowledge barrier that is especially high for the F0 investor segment (first-time investors with no prior market experience). Gen Z users on Paave are in the 16–25 age range; the majority have never held a real stock position and have no existing research workflow.

### 1.3 Core Problem

Gen Z users on Paave have paper-trading access but no daily starting point for deciding what to analyze and trade. Without a curated, technically grounded daily signal, users either trade randomly (reducing educational value) or disengage (reducing retention). Neither outcome advances the product's core objective of making young Vietnamese investors capable, informed paper traders.

### 1.4 Why This Feature, Not Alternatives

A social feed (what other users are trading) is the eventual solution but requires a critical mass of active traders to produce a meaningful signal — not available at launch. A watchlist-driven notification addresses known holdings but not discovery. A "top movers" list provides raw data but no interpretive context. The AI Suggestions feature provides curated, technically grounded daily observations on the top-volume symbols, giving new users a specific starting point while teaching them to read technical signals — without requiring any prior knowledge or an existing social graph.

---

## 2. Business Objectives

The following objectives are specific to the AI Suggestions feature. Each objective maps to one or more measurable outcomes. All objectives are additive to the master BRD objectives (BRD.md §3).

| ID | Objective | Measurable Target | Measurement Window |
|----|-----------|-------------------|-------------------|
| BO-AS-01 | Increase Day-7 retention by delivering daily relevant content that gives users a reason to return | D7 retention rate of users who view AI Suggestions cards ≥ 3 times in their first 7 days is ≥ 15 percentage points higher than the control group (users who never view a card) | 90 days post-launch (first measurable cohort) |
| BO-AS-02 | Increase weekly paper trade frequency among active users | ≥ 40% of active users (defined as: opened app ≥ 3 times in 7 days) execute ≥ 1 paper trade per week on a symbol that appeared in the AI Suggestions section that week | 60 days post-launch |
| BO-AS-03 | Increase time-on-app for the Home screen session | Average Home screen session duration increases by ≥ 20% compared to the pre-feature baseline (measured as the 30-day average session duration in the week before the feature ships) | 30 days post-launch |
| BO-AS-04 | Maintain zero regulatory incidents | 0 user complaints submitted to UBCKNN (SSC Vietnam) referencing Paave's AI content as "investment advice"; 0 inquiries received from SSC Vietnam regarding Paave's AI Suggestions feature | Rolling; reviewed at 30/60/90-day post-launch checkpoints |
| BO-AS-05 | Teach users to interpret technical analysis by connecting signals to deeper research | ≥ 60% of users who tap a suggestion card also view the AI section of the Stock Detail screen they navigate to (measured as: `card_tap` event followed by `stock_detail_ai_section_view` event for the same symbol within the same session) | 60 days post-launch |

### 2.1 Relationship to Master BRD Objectives

This feature directly supports the following master BRD objectives (see BRD.md §3):

| Master BRD Objective | How AI Suggestions Contributes |
|---------------------|-------------------------------|
| BO-02 — D7 Retention ≥ 35% | Daily AI content gives users a reason to return each morning; contributes to BO-AS-01 above |
| BO-08 — Paper trading activation and ≥ 3 trades/user/week | Signal cards surface specific actionable tickers; contributing to BO-AS-02 above |
| BO-11 — AI insight card engagement ≥ 55% | AI Suggestions extends the AI touchpoint surface beyond post-trade context; pre-trade signal discovery |
| BO-12 — 16–17 segment served compliantly with zero violations | Age-differentiated display (price target hidden for LEARN_MODE) enforces compliance for the minor segment |

---

## 3. KPIs

### 3.1 Engagement KPIs

| KPI ID | KPI | Definition | Baseline | Target | Measurement Method |
|--------|-----|-----------|---------|--------|-------------------|
| KPI-AS-01 | AI Suggestions section view rate | % of Home screen sessions where the AI Suggestions section is scrolled into view | 0 (pre-launch; no feature) | ≥ 70% of Home sessions within 30 days of launch | Client-side scroll-into-view event + session count |
| KPI-AS-02 | Card tap-through rate | % of users who view ≥ 1 card and tap through to Stock Detail | 0 (pre-launch) | ≥ 35% of users who view the section | `card_tap` event / `section_view` event |
| KPI-AS-03 | Stock Detail AI section engagement after card tap | % of card-tap sessions where the user also views the Stock Detail AI section for the same symbol | 0 (pre-launch) | ≥ 60% (BO-AS-05) | `card_tap` + `stock_detail_ai_section_view` for same symbol in same session |
| KPI-AS-04 | Paper trade execution rate from AI Suggestions | % of active users who place ≥ 1 paper trade per week on a symbol that appeared in AI Suggestions that week | 0 (pre-launch) | ≥ 40% of active users (BO-AS-02) | `paper_trade_submitted` event with `source = ai_suggestion` attribution |
| KPI-AS-05 | Average Home screen session duration | Average seconds from Home screen entry to navigation away or app background | Measured in the 30 days before feature launch | ≥ 20% increase vs. baseline (BO-AS-03) | Session analytics |

### 3.2 Retention KPIs

| KPI ID | KPI | Definition | Baseline | Target | Measurement Method |
|--------|-----|-----------|---------|--------|-------------------|
| KPI-AS-06 | D7 retention: AI Suggestions viewers vs. control | D7 retention rate comparison between cohort A (viewed AI Suggestions ≥ 3 times in days 1–7) and cohort B (never viewed section) | Not available pre-launch | Cohort A D7 retention ≥ Cohort B + 15pp (BO-AS-01) | Cohort analysis in analytics platform; 90-day measurement window |
| KPI-AS-07 | Daily section load rate | % of daily active users who load the AI Suggestions section at least once per day | 0 (pre-launch) | ≥ 50% of DAU within 60 days of launch | Daily section load event / DAU |

### 3.3 Compliance KPIs

| KPI ID | KPI | Definition | Baseline | Target | Measurement Method |
|--------|-----|-----------|---------|--------|-------------------|
| KPI-AS-08 | Disclaimer display rate | % of AI Suggestions section impressions where the disclaimer text is rendered in the DOM | 0 (pre-launch) | 100% — no exceptions | Automated monitoring: daily query on analytics events for `section_view` without `disclaimer_rendered`; must return 0 rows |
| KPI-AS-09 | Price target hidden rate for LEARN_MODE | % of LEARN_MODE user card renders where price target fields are absent from the rendered DOM | 0 (pre-launch) | 100% — no exceptions | Automated test: LEARN_MODE session rendering audit; 0 price target DOM nodes permitted |
| KPI-AS-10 | Regulatory incident count | Count of SSC Vietnam inquiries or user complaints to UBCKNN citing Paave's AI content as investment advice | 0 (no feature today) | 0 (BO-AS-04) | Legal team intake log; reviewed at 30/60/90-day checkpoints |

### 3.4 Pipeline Health KPIs

| KPI ID | KPI | Definition | Baseline | Target | Measurement Method |
|--------|-----|-----------|---------|--------|-------------------|
| KPI-AS-11 | Daily pipeline success rate | % of scheduled pipeline runs that produce ≥ 3 published suggestions | N/A (pre-launch) | ≥ 95% of scheduled trading days within 60 days of launch | `pipeline_runs` table: `symbols_succeeded >= 3` / total scheduled runs |
| KPI-AS-12 | Daily pipeline cost | Estimated USD cost of Claude API calls per pipeline run | N/A (pre-launch) | ≤ $2.00 per day (hard budget ceiling) | `pipeline_runs.estimated_cost_usd`; alert fires automatically above threshold |

---

## 4. Scope

### 4.1 In Scope — V1

| # | Item | Description |
|---|------|-------------|
| 1 | Daily AI Suggestions section on Home screen | "Gợi ý hôm nay" section displaying up to 3 suggestion cards; pre-computed after market close; sourced from `ai_suggestions` table |
| 2 | Signal types | Three signal types only: BUY_OPPORTUNITY ("Cơ hội mua tiềm năng"), WATCH ("Đáng quan sát"), SELL_CAUTION ("Cảnh báo bán") |
| 3 | Confidence score display | Integer percentage 0–85%; hard cap enforced at display and database levels |
| 4 | Analysis text | Observational Vietnamese text; ≤ 150 characters; referencing real technical indicators |
| 5 | Price target (FULL_ACCESS only) | "MỤC TIÊU AI" price target and percentage upside/downside; visible only to users aged 18+ (FULL_ACCESS tier) |
| 6 | Price target hidden for LEARN_MODE | Users aged 16–17 (LEARN_MODE tier) see a "Mở khóa mục tiêu giá khi bạn đủ 18 tuổi" nudge in place of the price rows; no price data rendered |
| 7 | Non-dismissible disclaimer | "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn." displayed below all cards at all times; not dismissible |
| 8 | Card tap navigation | Tapping a card navigates to Stock Detail with AI context passed as navigation parameters |
| 9 | Stale suggestion fallback | Previous day's suggestions shown on weekends and holidays with elapsed-time timestamp; hidden after 72 hours |
| 10 | Empty state | "Gợi ý đang được cập nhật" card shown when no published suggestions exist or stale data exceeds 72 hours |
| 11 | Daily pipeline | Pre-computed batch pipeline running at 18:45 ICT on trading days (Mon–Fri, excluding VN public holidays); processes top 20 HOSE symbols by previous day's volume |
| 12 | Admin kill switch | Admin API to unpublish any individual suggestion immediately without a code deploy |
| 13 | Pipeline cost monitoring | Daily cost tracked per `pipeline_runs`; alert fires when estimated cost exceeds $2.00 USD |

### 4.2 Out of Scope — V1

| # | Item | Deferred To | Reason |
|---|------|-------------|--------|
| 1 | "Xem tất cả" full list screen | V1.x | Requires paginated list UX and full signal library design; V1 stub shows "Coming soon" |
| 2 | Personalised signals based on user holdings or watchlist | V2+ | Requires per-user signal computation; pipeline cost would scale with user base |
| 3 | Push notifications when signal changes | V1.x | Notification fatigue risk; signal is pre-computed daily, not real-time; requires notification opt-in infrastructure for this signal type |
| 4 | Signal history / archive | V2+ | Historical signal accuracy tracking; requires a dedicated history screen |
| 5 | User feedback on individual signals (thumbs up/down) | V1.x | Useful for model improvement; deferred to measure engagement patterns first |
| 6 | HNX or UPCoM symbol universe | V2+ | V1 universe restricted to HOSE top 20 by volume; HNX/UPCoM expansion deferred |
| 7 | Real-time intraday signal updates | Out of roadmap | Intraday signal generation would change the feature's compliance classification (closer to real-time advice); daily batch is the safe architecture |
| 8 | Korean or global market signals | V2+ | VN HOSE is the sole primary market in V1 (master BRD BO-05) |
| 9 | Signal accuracy tracking / backtesting dashboard | V2+ | Requires 30+ days of signal history to have meaningful accuracy data |
| 10 | LEARN_MODE users aged 16–17 viewing price targets | Never — age-gate compliance | Price target for minors is a non-negotiable exclusion; see Constraints §8 and BR-AS-06 |

---

## 5. Stakeholders

| Role | Team / Individual | Responsibility for This Feature |
|------|-------------------|--------------------------------|
| Product Owner | Paave Product Team | Approves signal type labels and Vietnamese display language; approves KPI targets and definition of "active user" for BO-AS-02; signs off on V1 scope boundary decisions |
| Legal (via Product Owner) | VN Legal Counsel | Approves disclaimer text before any change to the exact string; approves signal type labels for compliance with VN Law on Securities 54/2019/QH14; reviews any AI output language that could be interpreted as "tư vấn đầu tư chứng khoán" (investment securities advice) |
| Business Analyst / Tech Lead | BA Team | Owns pipeline specification (SRD-21), monitoring, and BRD/FRD/SRD document set; defines acceptance criteria; runs compliance self-check on analysis_text samples |
| Backend Engineers | API + Data Team | Implements pipeline scheduler, Claude API integration, Supabase writes, read API, kill switch API, cost alerting |
| Mobile Engineers | iOS + Android Teams | Implements client-side card rendering, tier-based price target display/hide logic, disclaimer rendering, navigation params |
| QA Team | QA Team | Executes compliance test cases (disclaimer presence, LEARN_MODE price target absence, prohibited phrase absence); executes pipeline integration tests; signs off before launch |
| AI / Data Science Team | ML/AI Team | Designs and tunes prompt structure; validates structured output schema; reviews analysis_text samples for observational language compliance |
| Operations Team | Ops Team | Monitors `#alerts-infra` and compliance Slack channels for pipeline alerts; responds to kill switch incidents; manages `vn_market_holidays` table accuracy |
| Users (primary) | Vietnam Gen Z, ages 16–25 | Consume the feature; LEARN_MODE (16–17) and FULL_ACCESS (18+) have differentiated experiences |
| Regulatory (indirect) | UBCKNN (SSC Vietnam) | Paave must not trigger the "tư vấn đầu tư chứng khoán" definition; signals must remain technical analysis observations; the disclaimer and prohibited phrase filter are the primary legal defences |

---

## 6. Business Rules (High-Level)

The business rules below are the governing rules for this feature at the business layer. Each rule has a corresponding enforcement point in FRD-21 and SRD-21.

> These rules are intentionally free of technical implementation detail. The "how" is in SRD-21. The "what must be true" is stated here.

| Rule ID | Rule | Legal / Business Rationale | Violation Severity |
|---------|------|---------------------------|-------------------|
| BR-AS-01 | Every AI Suggestions signal must be characterised as a "technical analysis observation" in all product copy, marketing materials, and legal documentation. The words "khuyến nghị" (recommendation), "tư vấn" (advice), or "nên mua / nên bán" (should buy / should sell) must not appear in any signal label, analysis text, or accompanying copy. | VN Law on Securities 54/2019/QH14 requires a license to provide investment advice. Paave does not hold such a license. Technical analysis observations are factual data interpretations, not advice. | P0 — blocks launch |
| BR-AS-02 | The disclaimer "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn." must be visible to the user at all times when any suggestion card is on screen. No user action, setting, A/B test, or business decision may remove or hide this text. Any change to the exact wording requires written sign-off from VN Legal Counsel before the change is deployed. | Primary legal defence against SSC classification as investment advice. The disclaimer's presence and immutability are a non-negotiable condition of launching the feature. | P0 compliance violation |
| BR-AS-03 | Users aged 16–17 (LEARN_MODE tier) must not see the price target ("MỤC TIÊU AI") or current price row ("GIÁ HIỆN TẠI") on any suggestion card. These users see a non-tappable nudge text "Mở khóa mục tiêu giá khi bạn đủ 18 tuổi" in place of the price rows. | Age gate compliance: showing price targets to minors increases the perceived specificity of the signal, raising its likelihood of being interpreted as financial advice directed at a minor. LEARN_MODE is designed to provide educational context only. | P0 age-gate violation |
| BR-AS-04 | The confidence score displayed to any user must not exceed 85%. A hard cap of 85% is enforced at the database constraint level, the pipeline pre-write assertion level, and the client display level. Expressing confidence at 90% or above would convey near-certainty about a market outcome, which constitutes an investment claim Paave cannot legally make. | Psychological anchoring: a confidence score above 85% would cause a reasonable user to treat the signal as near-certain. This would cross the line from observation to advice. The 85% cap is the legal threshold agreed with Product and Legal. | P0 compliance violation |
| BR-AS-05 | The analysis text accompanying each signal must be observational in character. It must reference verifiable technical indicators (e.g., RSI value, MACD crossover, MA level, volume percentage change). It must not contain guarantee language. The following phrases are absolutely prohibited: "chắc chắn" (certain), "đảm bảo lãi" (guaranteed profit), "không rủi ro" (no risk), "100%", "bảo đảm" (guarantee), "mua đi" (buy now), "bán ngay" (sell now), "nên đầu tư vào" (should invest in), "chắc chắn tăng" (certain to rise). | Each prohibited phrase converts an observation into an instruction or a guarantee. Any of these phrases in a published signal constitutes investment advice language under VN Law on Securities 54/2019/QH14. | P0 compliance violation |
| BR-AS-06 | Signals are drawn exclusively from the top 20 HOSE symbols by previous trading day's total volume. No user preference, watchlist content, or social signal influences which symbols appear. The universe is server-determined, objective, and based on publicly available exchange volume data. | Personalised signals based on user holdings would create a stronger inference that the signal is "for this user specifically" — closer to personal investment advice. A uniform, market-derived universe maintains the character of market observation. | P1 product integrity violation |
| BR-AS-07 | The pre-computation pipeline runs once per trading day at 18:45 ICT after HOSE market close. Signals reflect yesterday's closing data. No signal is generated or updated intraday. Intraday recalculation is not permitted. | Intraday signals would react to intraday price movements, making them appear more like real-time trading signals than daily observations. Post-close computation ensures signals are stable reference points, not reactive triggers. | P1 operational violation |
| BR-AS-08 | Stale signals (from a previous pipeline run) may be shown on weekends and public holidays with a visible elapsed-time timestamp. Signals older than 72 hours must not be shown; the section transitions to an empty state at that point. | Showing signals from more than 72 hours ago (e.g., from before a 3-day weekend) risks displaying data that is materially out of step with current market conditions, increasing the probability of user decisions based on stale information. | P1 data freshness violation |
| BR-AS-09 | The pipeline must not write any suggestion with a `price_target` derived from a source other than the real-time HOSE quote data fetched during the same pipeline run. The price target must be AI-calculated relative to a verified current price. Fabricated or interpolated price targets are a data integrity violation. | User trust. If price targets are not anchored to real market data, they constitute made-up figures that would mislead users and damage the platform's credibility. | P0 data integrity violation |
| BR-AS-10 | Any published suggestion can be immediately removed from all user sessions by an admin setting `is_published = false` via the kill switch API. The kill switch must propagate to all client responses within 60 seconds of the API call. No code deploy is required to invoke the kill switch. | Incident response: if a signal with problematic language or data error is identified post-publication, the kill switch is the primary tool for immediate remediation without a production deployment. | P0 operational capability |

---

## 7. Assumptions

The following assumptions are accepted as true for the purposes of this BRD. If any assumption is invalidated, the affected business rules, KPIs, or scope items must be re-evaluated.

| ID | Assumption | Impact if False | Owner to Validate |
|----|-----------|----------------|-------------------|
| A-AS-01 | VN Law on Securities 54/2019/QH14 does not classify pre-computed, daily, technically-grounded observations with a disclaimer as "tư vấn đầu tư chứng khoán" (investment securities advice), provided the disclaimer is present, non-dismissible, and no guaranteed-outcome language is used. | Feature cannot launch until legal classification is resolved. | VN Legal Counsel — must confirm before launch |
| A-AS-02 | The top 20 HOSE symbols by previous trading day volume provide sufficient variety and relevance to generate 3 meaningful signals on any given trading day. | If volume concentration means the top 20 is always the same 5–10 names, signal variety will be low; scope may need to expand to top 30 or diversify by sector. | AI/Data Science Team — validate over first 30 days of operation |
| A-AS-03 | Claude API (claude-haiku-4-5 and claude-sonnet-4-5) can produce structured JSON output in Vietnamese that satisfies the observational language requirement without explicit post-processing in more than 95% of pipeline runs. | If model compliance rate is below 95%, the prohibited phrase filter will discard too many symbols and the pipeline will frequently produce fewer than 3 published suggestions. | AI/Data Science Team — validate in pre-launch pipeline testing |
| A-AS-04 | The daily pipeline budget ceiling of $2.00 USD is sufficient to process 20 symbols at the two-model (Haiku screening + conditional Sonnet upgrade) architecture at published Anthropic pricing as of 2026-06-01. | If Anthropic pricing increases materially, the cost ceiling will be exceeded more frequently; model selection logic or symbol count will need adjustment. | Tech Lead — monitor monthly against Anthropic invoices |
| A-AS-05 | 90 days of OHLCV data and 7 days of news are sufficient context for the technical-indicator skills to produce a meaningful signal for HOSE-listed symbols. Newly listed symbols with fewer than 90 days of data will be excluded from the pipeline universe by the data availability check. | If data availability gaps are common across the top 20 symbols, the pipeline will skip too many symbols. | Backend Engineers — validate during pipeline build |
| A-AS-06 | The client-side tier check (reading the session-stored user tier to determine whether to show or hide the price target) is reliable within a session. A LEARN_MODE user who turns 18 during an active session will continue to see the LEARN_MODE view until their next session initialisation. This mid-session behaviour is acceptable. | If mid-session tier state becomes inconsistent (e.g., server invalidates tier mid-session), a LEARN_MODE user could see a price target before their tier is confirmed updated client-side. | Mobile Engineers + Backend — confirm session tier refresh behaviour |
| A-AS-07 | The `vn_market_holidays` table in Supabase is maintained by the Operations team with a minimum of 1 quarter advance notice for all VN public holidays. The pipeline relies on this table to determine whether to run on a given day. | If a holiday is missing from the table, the pipeline will run on a holiday, producing signals that reference a day with no trading. The signal would be valid but based on the previous trading day's data — acceptable but not ideal. | Operations Team — SLA: table populated 1 quarter in advance |
| A-AS-08 | Gen Z users in Vietnam are the primary audience for this feature and interpret Vietnamese-language technical analysis terminology (e.g., "vùng quá bán", "phân kỳ âm", "vượt MA50") at a sufficiently basic level to find the analysis text valuable rather than confusing. | If comprehension is low, the analysis text adds no educational value; the feature satisfies the compliance requirement but does not move BO-AS-05 (user views Stock Detail AI section). Would trigger a UX review of the analysis text vocabulary. | Product Owner — review after first 30 days of engagement data |

---

## 8. Constraints

The following constraints are non-negotiable. They cannot be relaxed without an explicit decision by the Product Owner and, where marked (Legal), a written sign-off from VN Legal Counsel.

| ID | Constraint | Category | Non-Negotiability |
|----|-----------|---------|-------------------|
| C-AS-01 | Paave does not hold a securities investment advisory licence under VN Law on Securities 54/2019/QH14. All AI Suggestions content must remain "technical analysis observations." No signal type, label, analysis text, or accompanying copy may use language that a Vietnamese regulator could classify as investment advice. | Legal | Absolute — Legal sign-off required to deviate |
| C-AS-02 | The disclaimer "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn." must appear verbatim on every view containing a suggestion card. The exact text is immutable without VN Legal Counsel written sign-off. | Legal | Absolute — Legal sign-off required to change even one character |
| C-AS-03 | Users aged 16–17 (LEARN_MODE tier) must never see a price target on any suggestion card. This is an age gate compliance constraint enforced at the client rendering level. The API always returns the price target data; the client is responsible for suppression. | Legal + Age Gate | Absolute — non-negotiable; cannot be A/B tested |
| C-AS-04 | confidence_pct must not exceed 85% on any displayed card under any circumstances. This constraint is enforced at the database CHECK level, the pipeline pre-write assertion level, and the client display level. The value 85% is a product-legal agreement on the maximum expressible confidence for a market observation. | Legal | Absolute — requires Product + Legal agreement to change the cap value |
| C-AS-05 | The daily pipeline cost must not exceed $2.00 USD per run. If the estimated cost for a given run exceeds $2.00, an alert is sent to the operations channel but the pipeline completes normally. If structural changes would push average daily cost above $2.00, the model selection logic or symbol universe must be adjusted before the change ships. | Operational | Product Owner can revise the budget ceiling via an explicit decision; default is $2.00 |
| C-AS-06 | Maximum 4,000 input tokens per symbol per pipeline run. This constrains the depth of technical, fundamental, and news context passed to the model. Context truncation priority is defined in SRD-21 §7. | Operational + Cost | Tech Lead can adjust; requires cost impact analysis |
| C-AS-07 | The symbol universe is restricted to HOSE symbols only in V1. No HNX, UPCoM, KOSPI, KOSDAQ, or global symbols may appear in the AI Suggestions section in V1. | Product (Master BRD BO-05) | Product Owner decision to expand; V2+ scope |
| C-AS-08 | The pipeline runs once per trading day at 18:45 ICT. Intraday signal recalculation is prohibited. Real-time or intraday signal generation is out of scope in all versions of the roadmap. | Legal + Operational | Absolute — intraday signals change the legal classification of the feature |
| C-AS-09 | All signals are displayed in Vietnamese only. The AI Suggestions section does not have a language-toggle; it is a Vietnamese-language feature. (The app's general language setting governs other screens; this section is fixed Vietnamese.) | Product | Product Owner can revise; requires copy review for any language addition |
| C-AS-10 | The analysis text for each signal must reference at least one verifiable technical indicator (e.g., RSI, MACD, Bollinger Band, Moving Average, volume) as the basis for the observation. Analysis text that does not reference a real indicator is not observational; it is opinion, which carries advisory connotations. | Legal | Enforced by prompt instruction and pipeline content review; Legal sign-off required to weaken |

---

## 9. Risk Register

| Risk ID | Risk Description | Likelihood | Impact | Mitigation |
|---------|-----------------|------------|--------|------------|
| RISK-AS-01 | AI outputs prohibited investment advice language that passes the pipeline content filter (false negative) | Medium | High (regulatory) | Three-layer defence: (1) prompt instruction prohibiting specific phrases; (2) pipeline pre-write prohibited phrase filter with exact-match list; (3) client-side secondary check that skips any card with a prohibited phrase. Compliance Slack alert fires on any prohibited phrase detection at the pipeline layer. |
| RISK-AS-02 | AI generates price target values not anchored to real HOSE quote data (hallucination of price targets) | Medium | High (user trust + legal) | Pipeline Step 4 fetches the real-time quote before the LLM call. The prompt includes `price_current`, `ref_price`, `ceiling_price`, `floor_price` from the live quote. The system prompt instructs the model to derive `price_target` only within the ceiling/floor range. If `get_stock_quote` fails, the symbol is skipped entirely — no signal is written without a verified current price. |
| RISK-AS-03 | Daily pipeline cost spikes above $2.00 due to a majority of symbols scoring > 70 confidence (triggering Sonnet upgrade for all 20) | Low | Medium (operational) | In the worst case (all 20 symbols → Sonnet): 20 Haiku screening calls + 20 Sonnet calls. At published 2026-06-01 pricing, this is approximately $1.20–$1.60 depending on input length — within budget. If pricing increases, cost alert at $2.00 fires before the next run; model selection threshold can be raised from 70 to 75 to reduce Sonnet call frequency. |
| RISK-AS-04 | Signal accuracy is too low, users lose trust and disengage within 30 days | Medium | Medium (retention) | Accuracy tracking added at the 30-day post-launch review: for each BUY_OPPORTUNITY signal, compare `price_target` to actual 5-day and 10-day price movement. If directional accuracy < 55% over 30 days, prompt engineering is revised. Accuracy data is internal only; not published to users. |
| RISK-AS-05 | On a large market decline day, the pipeline still generates BUY_OPPORTUNITY signals (based on previous day's close), which appear tone-deaf to current market conditions | Medium | High (trust + compliance) | Pipeline uses previous day's EOD data — this is by design and documented in the disclaimer. Signals reflect yesterday's close, not today's intraday movement. The timestamp "Cập nhật [N]h trước" makes the data recency explicit. The disclaimer reinforces that the user makes the final decision. No mitigation removes this inherent lag, but the architecture's transparency is the defence. |
| RISK-AS-06 | LEARN_MODE user (16–17) sees price target due to client-side tier check failure (e.g., tier deserialization bug) | Low | High (age-gate violation + legal) | Client tier check is mandatory, not optional. QA test suite includes a dedicated LEARN_MODE rendering audit that asserts zero `price_target` DOM nodes in a LEARN_MODE session. This test runs in CI on every release. Any failure blocks the release. |
| RISK-AS-07 | Pipeline produces fewer than 3 published suggestions on a given day due to multiple symbol failures (data gaps, LLM errors, prohibited phrase filters) | Medium | Low (UX degradation) | The API returns however many published suggestions exist (1, 2, or 3). The client renders only what is available. The section shows 1 or 2 cards without error — empty slots are not shown. Operations is alerted when `symbols_succeeded < 3`. The stale fallback from the previous day is not used when today's pipeline ran but produced < 3 suggestions — today's successful signals (even 1) are shown. |
| RISK-AS-08 | Admin kill switch is invoked on a high-visibility symbol during peak evening hours (19:00–21:00 ICT) when the CDN cache has millions of cached responses | Low | Medium (operational) | Kill switch propagation SLA is 60 seconds: CDN cache is invalidated immediately upon `is_published = false`. This is a hard SLA enforced by integration test (see SRD-21 §9). Operations team has a runbook for post-kill-switch communication if the symbol is a major index component. |
| RISK-AS-09 | User interprets the "MỤC TIÊU AI" price target as a guaranteed outcome and files a formal complaint with SSC Vietnam | Low | High (regulatory) | Three layers of protection: (1) the label "MỤC TIÊU AI" (not "giá chắc chắn đạt" or similar); (2) guarantee language is banned from the card; (3) the non-dismissible disclaimer explicitly states this is not investment advice. Legal has signed off on the label and disclaimer text as the compliance boundary. |
| RISK-AS-10 | User under 16 (BLOCKED tier) attempts to access the feature by circumventing the age gate | Very Low | Low (UX irrelevant) | Users under 16 are blocked at registration (BR-AGE-03); they cannot reach the Home screen. This risk is mitigated entirely by the age gate implemented in FRD-09. No additional mitigation required at the AI Suggestions layer. |
| RISK-AS-11 | `vn_market_holidays` table is not updated for an upcoming public holiday; pipeline runs on a holiday and writes signals based on no trading activity | Medium | Low (data quality) | Operations team SLA: table populated 1 quarter in advance. Pipeline fallback: if market volume data returns zero for a non-weekend date, pipeline exits with `SKIPPED_HOLIDAY` before writing. Alert fires so Operations can investigate. |

---

## 10. Approval

The following roles must approve this BRD before development begins on the AI Suggestions feature.

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| VN Legal Counsel (disclaimer text + signal type labels) | | | |
| AI / Data Science Lead | | | |
| QA Lead | | | |
| Tech Lead | | | |

**Legal sign-off scope:** VN Legal Counsel's signature covers:
1. The disclaimer exact text (BR-AS-02 / C-AS-02): "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn."
2. The three signal type labels: "Cơ hội mua tiềm năng", "Đáng quan sát", "Cảnh báo bán"
3. The price target label "MỤC TIÊU AI" and the prohibition on guarantee language near it
4. The assessment that the feature as scoped in this BRD does not constitute "tư vấn đầu tư chứng khoán" under VN Law on Securities 54/2019/QH14 (Assumption A-AS-01)

**Any change to items 1–4 after this BRD is approved requires a new written sign-off from VN Legal Counsel before the change is deployed to production.**

---

## 11. Related Documents

| Document | Location | Relationship |
|----------|----------|-------------|
| FRD-21: AI Suggestions | `docs/business/frd/21-ai-suggestions.md` | Functional requirements: card rendering, UX states, acceptance criteria, edge cases, traceability matrix |
| SRD-21: AI Suggestions Pipeline & API | `docs/business/srd/21-ai-suggestions.md` | System implementation: pipeline flow, data model, API contract, validation logic, error handling, model selection |
| FRD-09: Age Gate & Feature Tier | `docs/business/frd/09-age-gate.md` | LEARN_MODE / FULL_ACCESS tier definitions and enforcement; governs BR-AS-03 and C-AS-03 in this BRD |
| FRD-15: Legal Disclaimers | `docs/business/frd/15-legal-disclaimers.md` | Disclaimer text governance for the full app; the AI Suggestions disclaimer is a child of this module |
| FRD-02: Home Screen | `docs/business/frd/02-home-screen.md` | Host screen; placement and layout of the AI Suggestions section |
| BRD.md (Master) | `docs/business/BRD.md` | Master business requirements; this BRD extends BO-02, BO-08, BO-11, BO-12 from the master document |

---

*End of BRD-21: AI Suggestions (Gợi ý hôm nay)*
*Version 1.0 — 2026-06-01. Approved scope for V1 development.*
