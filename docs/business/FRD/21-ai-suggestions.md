# FRD-21: AI Suggestions (Gợi ý hôm nay)
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Version:** 1.0
**Date:** 2026-06-01
**Author:** Business Analysis Team
**Linked BRD:** BRD.md §BO-03 (AI Learning Companion), §BO-02 (Safety & Regulatory Compliance)
**Linked SRD:** SRD-21 (`srd/21-ai-suggestions.md`)
**Linked FRD:** FRD-09 (Age Gate & Feature Tier), FRD-12 (AI Insights), FRD-15 (Legal Disclaimers)
**Status:** Draft — Design Confirmed from PPTX Home Screen

> **Scope:** This document specifies the AI Suggestions section ("Gợi ý hôm nay") on the Paave Home screen. Signals are pre-computed daily after market close; no LLM call occurs per user request. A developer must be able to implement the complete client-side display and navigation from this document alone. A QA engineer must be able to write complete test cases without assumptions.
>
> **Compliance anchor:** All signals are "technical analysis observations" under VN Law on Securities 54/2019/QH14. Paave does not hold an investment advisory licence. The non-dismissible disclaimer on every view is the primary legal defence. Any language change to the disclaimer requires legal review.
>
> **Out of scope for V1:** "Xem tất cả" full list screen; personalised signals based on user holdings; push notifications for signal changes; signal history; user feedback on individual signals.

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [User Flow](#2-user-flow)
3. [UX Screen States](#3-ux-screen-states)
4. [Functional Requirements](#4-functional-requirements)
5. [Business Rules](#5-business-rules)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Edge Cases](#7-edge-cases)
8. [Design Requirements](#8-design-requirements)
9. [Validation Logic Table](#9-validation-logic-table)
10. [Traceability Matrix](#10-traceability-matrix)
11. [Related Documents](#11-related-documents)

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | AI Suggestions — "Gợi ý hôm nay" section on Home screen |
| Module Role | Daily pre-computed technical analysis signals; displayed as a horizontal card row on the Home screen |
| Primary Actors | Authenticated user (LEARN_MODE or FULL_ACCESS); Paave batch pipeline (signal generator, runs at 18:45 ICT daily after HOSE close) |
| Goal | Show users 3 technically-grounded, compliance-safe observations on top-volume VN stocks; drive engagement and financial literacy without constituting investment advice |
| Entry Point | Home screen — "Gợi ý hôm nay" section visible without any user action |
| Symbol Universe | Top 20 HOSE symbols by previous trading day's total volume (server-determined; no user dependency) |
| Cards Shown | 3 cards on Home screen (subset of top 20; selection by highest confidence_pct among published signals) |
| Generation Schedule | 18:45 ICT daily on trading days (Mon–Fri, excluding VN public holidays) |
| Data Source | Supabase `ai_suggestions` table (pre-computed; zero LLM cost per page view) |
| Non-negotiable | Disclaimer must be visible at all times below the cards and must not be dismissible; price target always includes disclaimer label; LEARN_MODE users must not see price target |

### 1.1 Signal Types

| signal_type (DB value) | Display label (Vietnamese) | Colour coding |
|----------------------|---------------------------|---------------|
| `BUY_OPPORTUNITY` | "Cơ hội mua tiềm năng" | Accent green |
| `WATCH` | "Đáng quan sát" | Neutral/amber |
| `SELL_CAUTION` | "Cảnh báo bán" | Accent red |

No other signal_type values are permitted. The pipeline must not write values outside this set. The client must not render an unknown signal_type — show the WATCH fallback label and log a client error.

### 1.2 Confidence Score Display

| confidence_pct range (DB) | Display | Notes |
|--------------------------|---------|-------|
| 0–84 | Show value as `N%` | e.g., "78%" |
| 85 | Show as "85%" | Hard cap; pipeline never writes > 85 |
| > 85 | Treat as 85%, log server-side warning | Defense in depth; pipeline bug |

The confidence score is presented to the user as a numerical percentage without a label ("78%", not "Độ tin cậy: 78%"). Its meaning is implicit from position on the card per design.

### 1.3 Guardrails Summary (enforced end-to-end)

| Guardrail | Where enforced |
|-----------|---------------|
| confidence_pct ≤ 85 | DB CHECK constraint + pipeline pre-write assertion + client display cap |
| signal_type restricted to 3 values | DB CHECK constraint + pipeline enum validation |
| analysis_text ≤ 150 chars | DB CHECK constraint + pipeline trim + client truncation with "…" |
| Prohibited phrases banned from analysis_text | Pipeline content filter (see BR-AS-04) |
| Disclaimer always visible, non-dismissible | Client rendering rule (see FR-AS-06) |
| Price target labelled as AI estimate, not guarantee | Client label rule (see FR-AS-04) |
| LEARN_MODE: price target hidden | Client tier check (see FR-AS-05) |
| Kill switch: admin can unpublish any symbol | `is_published = false` in DB; client reads only published rows |

---

## 2. User Flow

```
Home Screen loads
       │
       │  Client calls GET /api/ai/suggestions
       ▼
[FR-AS-01] Section Header Renders
  "Gợi ý hôm nay"  [AI badge]  "Cập nhật [N]h trước" timestamp
       │
       ├── [HAPPY PATH] Suggestions available (is_published = true, valid_until > now())
       │         │
       │         ▼
       │   [FR-AS-02] Up to 3 suggestion cards render (highest confidence_pct first)
       │     ┌────────────────────────────────────────────────────────────┐
       │     │ [confidence_pct]%  [signal_type display label]             │
       │     │ [analysis_text]                                            │
       │     │ GIÁ HIỆN TẠI    MỤC TIÊU AI                               │
       │     │ ₫[price_current]  ₫[price_target] +[target_pct]%         │
       │     │                               (FULL_ACCESS only)           │
       │     └────────────────────────────────────────────────────────────│
       │     [Non-dismissible disclaimer text]
       │
       │         │
       │         ├── User taps card body → [FR-AS-03] Navigate to Stock Detail
       │         │
       │         └── User taps "Xem tất cả" → [FR-AS-07] Show "Coming soon" state
       │
       ├── [STALE FALLBACK] valid_until < now() AND previous day's data exists
       │         │
       │         ▼
       │   [FR-AS-08] Show previous day's cards with staleness label
       │   Timestamp shows "Cập nhật [N]h trước" (N calculated from generated_at)
       │   If N > 24h: label changes to "Cập nhật [N] ngày trước"
       │
       └── [EMPTY STATE] No published suggestions and no fallback data
                 │
                 ▼
         [FR-AS-09] Show empty state card
         "Gợi ý đang được cập nhật"
         "AI đang phân tích dữ liệu thị trường. Quay lại sau 19:00."
```

---

## 3. UX Screen States

| State ID | State Name | Condition | Display |
|----------|-----------|-----------|---------|
| S-AS-01 | LOADED | ≥ 1 published suggestion with valid_until > now() | Cards visible; timestamp shows "Cập nhật [N]h trước" |
| S-AS-02 | STALE | All published suggestions have valid_until < now() but previous day data exists | Cards visible; timestamp shows hours or days since generated_at; no error shown |
| S-AS-03 | EMPTY | No published suggestions exist (pipeline never ran or first day of service) | Empty state card shown; no error banner |
| S-AS-04 | LOADING | API call in flight | Skeleton cards (3 placeholder shapes) with shimmer animation |
| S-AS-05 | ERROR | Network error on API call and no cached data | Section hidden; no error banner within this section (Home screen error handling is separate) |

### 3.1 Timestamp Calculation

The "Cập nhật [N]h trước" label uses the `generated_at` value from the API response.

| Time elapsed since generated_at | Display |
|---------------------------------|---------|
| < 1 hour | "Cập nhật vừa xong" |
| 1 hour ≤ elapsed < 24 hours | "Cập nhật [N]h trước" where N = floor(elapsed_minutes / 60) |
| 24 hours ≤ elapsed < 48 hours | "Cập nhật 1 ngày trước" |
| ≥ 48 hours | "Cập nhật [N] ngày trước" where N = floor(elapsed_hours / 24) |

---

## 4. Functional Requirements

---

### FR-AS-01 — Section Header

**Priority:** P0

**Actor:** Authenticated user

**Description:**
The "Gợi ý hôm nay" section renders a sticky section header as the first child element of the AI Suggestions section on the Home screen.

**Header elements (left to right):**

| Element | Content | Style |
|---------|---------|-------|
| Section title | "Gợi ý hôm nay" | H3 bold; left-aligned |
| AI badge | "AI" | Small pill badge; accent colour; right of title |
| Timestamp | "Cập nhật [N]h trước" | Small secondary text; right-aligned; calculated from `generated_at` |
| "Xem tất cả" link | Text link; right-aligned | Shown only when S-AS-01 or S-AS-02; hidden in S-AS-03, S-AS-04, S-AS-05 |

**Preconditions:**
- User is authenticated
- Home screen has loaded

**Postconditions:**
- Header renders regardless of whether cards are available

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-01-01 | FULL_ACCESS user, suggestions available, generated_at = 2 hours ago | Home screen loads | Header shows "Gợi ý hôm nay" + "AI" badge + "Cập nhật 2h trước" + "Xem tất cả" link |
| AC-AS-01-02 | Any user, generated_at = 30 minutes ago | Home screen loads | Timestamp shows "Cập nhật vừa xong" |
| AC-AS-01-03 | Any user, empty state (no suggestions) | Home screen loads | Header shows title + AI badge; no timestamp; no "Xem tất cả" link |
| AC-AS-01-04 | Any user, S-AS-04 loading state | API call in flight | Timestamp element shows skeleton placeholder; "Xem tất cả" link hidden |

---

### FR-AS-02 — Suggestion Card Rendering

**Priority:** P0

**Actor:** Authenticated user

**Description:**
Up to 3 suggestion cards render horizontally (or vertically stacked on narrow screens per design) in the Home screen's AI Suggestions section. Cards are ordered by `confidence_pct` descending. All 3 cards displayed on load; no pagination within this section.

**Card structure (per design PPTX):**

| Element | Content | Source field | Notes |
|---------|---------|-------------|-------|
| Confidence score | "[confidence_pct]%" | `confidence_pct` | Displayed as integer; cap at 85 display |
| Signal label | "Cơ hội mua tiềm năng" / "Đáng quan sát" / "Cảnh báo bán" | `signal_type` mapped to display label | Colour-coded per §1.1 |
| Symbol code | "[symbol_code]" | `symbol_code` | Bold; HOSE ticker format |
| Analysis text | "[analysis_text]" | `analysis_text` | Max 150 chars; truncate with "…" if over |
| "GIÁ HIỆN TẠI" label + value | "₫[price_current]" | `price_current` | VND format `142.500 ₫`; no decimals |
| "MỤC TIÊU AI" label + value | "₫[price_target] +[target_pct]%" | `price_target`, `target_pct` | FULL_ACCESS only; hidden for LEARN_MODE; see FR-AS-04, FR-AS-05 |
| "TIN CẬY" badge | Badge shown on card | Shown when confidence_pct ≥ 70 | Design shows badge on higher-confidence cards |

**Card ordering rule:**
Select the top 3 published, non-expired records from `ai_suggestions`, ordered by `confidence_pct DESC`, then by `generated_at DESC` as tiebreaker.

**Preconditions:**
- API response contains ≥ 1 published, non-expired suggestion

**Postconditions:**
- Cards rendered in order; disclaimer visible below all cards

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-02-01 | 3 published suggestions: FPT (78%), VNM (65%), VIC (71%); all non-expired | Home loads | Cards display in order: FPT (78%) first, VIC (71%) second, VNM (65%) third |
| AC-AS-02-02 | FPT suggestion, signal_type = BUY_OPPORTUNITY | Card renders | Label "Cơ hội mua tiềm năng" shown in green accent colour |
| AC-AS-02-03 | VIC suggestion, signal_type = SELL_CAUTION | Card renders | Label "Cảnh báo bán" shown in red accent colour |
| AC-AS-02-04 | VNM suggestion, signal_type = WATCH | Card renders | Label "Đáng quan sát" shown in neutral/amber colour |
| AC-AS-02-05 | FPT suggestion, confidence_pct = 78 | Card renders | "78%" shown; no label text other than the percentage |
| AC-AS-02-06 | Any suggestion, confidence_pct ≥ 70 | Card renders | "TIN CẬY" badge shown on card |
| AC-AS-02-07 | Any suggestion, confidence_pct = 65 | Card renders | No "TIN CẬY" badge |
| AC-AS-02-08 | Suggestion, analysis_text = 155 chars | Card renders | Text truncated to 150 chars with "…" appended; total display is 151 chars including "…" |
| AC-AS-02-09 | Only 1 published suggestion exists | Home loads | 1 card renders; remaining 2 card slots show nothing (no placeholder shapes in loaded state) |
| AC-AS-02-10 | Unknown signal_type value received from API | Card renders | Client renders WATCH fallback label "Đáng quan sát"; client error logged |

---

### FR-AS-03 — Card Tap Navigation

**Priority:** P1

**Actor:** Authenticated user

**Description:**
Tapping anywhere on a suggestion card body (including confidence score, signal label, analysis text, and price rows) navigates the user to the Stock Detail screen for that symbol. The Stock Detail screen loads with the symbol code pre-populated. The AI context (signal_type, analysis_text, price_target) is passed to the Stock Detail screen via navigation params so it can be surfaced in the AI section of that screen.

**Excluded tap targets:** The "Xem tất cả" link in the header does not navigate to Stock Detail; see FR-AS-07.

**Navigation params passed:**

| Param | Value |
|-------|-------|
| `symbol_code` | e.g., "FPT" |
| `exchange` | "HOSE" |
| `ai_signal_type` | e.g., "BUY_OPPORTUNITY" |
| `ai_analysis_text` | Analysis text string |
| `ai_confidence_pct` | Integer, e.g., 78 |
| `ai_price_target` | Numeric or null |
| `ai_target_pct` | Numeric or null |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-03-01 | FPT card visible; signal_type = BUY_OPPORTUNITY; price_target = 156000 | User taps card | Stock Detail screen opens for FPT; AI signal context visible in the AI section of Stock Detail; navigation params include symbol_code = "FPT", ai_signal_type = "BUY_OPPORTUNITY" |
| AC-AS-03-02 | Any card visible | User taps card | Navigation occurs within 300ms of tap; no intermediate loading screen |
| AC-AS-03-03 | LEARN_MODE user taps card | Navigation occurs | Stock Detail opens; LEARN_MODE rules apply in Stock Detail for AI content (no price target shown in Stock Detail AI section either) |

---

### FR-AS-04 — Price Target Display (FULL_ACCESS)

**Priority:** P1

**Actor:** FULL_ACCESS user (18+)

**Description:**
For users with `tier = FULL_ACCESS`, each suggestion card shows two price rows below the analysis text:

- Row 1: Label "GIÁ HIỆN TẠI" — value `₫[price_current]` in VND format
- Row 2: Label "MỤC TIÊU AI" — value `₫[price_target] +[target_pct]%`

The `+[target_pct]%` uses a comma as the decimal separator (Vietnamese format): "+9,5%" not "+9.5%".

The price target is always labelled as "MỤC TIÊU AI" and never as a guarantee. The phrase "sẽ đạt", "đảm bảo đạt", or any equivalent guarantee phrasing must not appear anywhere in proximity to the price target on the card or in the design.

When `price_target` is null (pipeline did not generate a target for this signal), both price rows are hidden entirely for the card. The card remains valid and shows confidence score, signal label, symbol, and analysis text only.

**VND format rule:** `1.250.000 ₫` — period as thousands separator, space before dong symbol, zero decimal places.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-04-01 | FULL_ACCESS user; FPT suggestion; price_current = 142500; price_target = 156000; target_pct = 9.5 | Card renders | Row 1: "GIÁ HIỆN TẠI  ₫142.500"; Row 2: "MỤC TIÊU AI  ₫156.000 +9,5%" |
| AC-AS-04-02 | FULL_ACCESS user; suggestion with price_target = null | Card renders | Neither "GIÁ HIỆN TẠI" nor "MỤC TIÊU AI" rows are shown; card body shows confidence, signal label, symbol, analysis_text only |
| AC-AS-04-03 | FULL_ACCESS user; target_pct = 9.5 | Card renders | Displayed as "+9,5%" (comma decimal separator); not "+9.5%" |
| AC-AS-04-04 | FULL_ACCESS user; price_current = 1250000 | Card renders | Displayed as "₫1.250.000" (period thousands separator, space before dong) |
| AC-AS-04-05 | Any tier; card text anywhere | Card renders | The phrases "sẽ đạt", "đảm bảo", "bảo đảm" do not appear on the card |

---

### FR-AS-05 — Price Target Hidden for LEARN_MODE

**Priority:** P0

**Actor:** LEARN_MODE user (16–17)

**Description:**
For users with `tier = LEARN_MODE` (age 16–17), the price target section is completely hidden. Both the "GIÁ HIỆN TẠI" and "MỤC TIÊU AI" rows must not render at all, regardless of whether `price_target` is null or populated. The card instead shows a "Nâng cấp tài khoản" nudge element in the space where the price rows would appear.

**"Nâng cấp tài khoản" nudge:**
- Text: "Mở khóa mục tiêu giá khi bạn đủ 18 tuổi"
- Style: small, secondary text colour; no CTA button (no tappable element)
- Position: where the price rows would appear for FULL_ACCESS

The tier check is performed client-side using the session-stored user tier. The API always returns `price_target` and `target_pct` in the response body regardless of tier; the client is responsible for hiding or showing these values.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-05-01 | LEARN_MODE user; FPT suggestion with price_target = 156000 | Card renders | "GIÁ HIỆN TẠI" and "MỤC TIÊU AI" rows are not shown; nudge text "Mở khóa mục tiêu giá khi bạn đủ 18 tuổi" is shown in their place |
| AC-AS-05-02 | LEARN_MODE user; suggestion with price_target = null | Card renders | Neither price rows nor nudge appear (nothing in that section; price_target being null makes the point moot, but the client must still not show price_target even if somehow populated) |
| AC-AS-05-03 | LEARN_MODE user | Card renders | API response body contains price_target data; client does not render it; no console error about undefined field |
| AC-AS-05-04 | User upgrades from LEARN_MODE to FULL_ACCESS (18th birthday) during session | Session tier updates; user returns to Home | Price rows now visible on next Home load; nudge no longer shown |

---

### FR-AS-06 — Non-Dismissible Disclaimer

**Priority:** P0 (compliance-critical)

**Actor:** All authenticated users

**Description:**
A disclaimer text block must appear below all suggestion cards whenever the AI Suggestions section is visible (states S-AS-01 and S-AS-02). The disclaimer is non-dismissible: there is no close button, no swipe-away gesture, and no setting that can hide it.

**Disclaimer text (exact, immutable without legal review):**
> "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn."

**Display rules:**
- Shown below all 3 cards; not inside individual cards
- Shown in S-AS-01 and S-AS-02
- Hidden in S-AS-03 (empty state), S-AS-04 (loading), S-AS-05 (error/hidden section)
- Text style: small, secondary colour (not the same emphasis as signal labels)
- No tap target, no underline, no link

**Preconditions:**
- At least 1 suggestion card is visible

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-06-01 | S-AS-01 (suggestions loaded) | User views Home | Disclaimer text "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn." is visible below the card row |
| AC-AS-06-02 | S-AS-02 (stale suggestions) | User views Home | Disclaimer still visible |
| AC-AS-06-03 | S-AS-01, disclaimer visible | User attempts to scroll disclaimer off screen or finds a close control | No close control exists; disclaimer cannot be removed from view while cards are shown |
| AC-AS-06-04 | S-AS-03 (empty state) | No cards shown | Disclaimer is not shown (no signal content to qualify) |
| AC-AS-06-05 | Any state | Developer inspects DOM | Disclaimer text is the exact string above; no variant wording |

---

### FR-AS-07 — "Xem tất cả" Behaviour (V1 Out of Scope)

**Priority:** P2

**Actor:** Authenticated user

**Description:**
The "Xem tất cả" link in the section header is shown in S-AS-01 and S-AS-02. Tapping it in V1 shows an inline message indicating the full list is not yet available.

**On tap:**
The link opens a modal or bottom sheet with the message:
- Title: "Danh sách đầy đủ sắp ra mắt"
- Body: "Chúng tôi đang hoàn thiện tính năng này. Quay lại sớm nhé!"
- CTA: "Đóng" button (closes the modal)

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-07-01 | S-AS-01; "Xem tất cả" link visible | User taps "Xem tất cả" | Modal/sheet shows with title "Danh sách đầy đủ sắp ra mắt" and body text above; "Đóng" button visible |
| AC-AS-07-02 | Modal shown | User taps "Đóng" | Modal dismisses; Home screen state unchanged |
| AC-AS-07-03 | S-AS-03 (empty state) | User views header | "Xem tất cả" link is not shown |

---

### FR-AS-08 — Stale Suggestions Display

**Priority:** P1

**Actor:** Authenticated user

**Description:**
When the pipeline's most recent `generated_at` is before the start of the current trading day (i.e., `valid_until < now()`), but published suggestions exist from a previous run, the system displays those previous suggestions with an updated timestamp label. This is not an error state; it is the expected behaviour on weekends and holidays.

**Stale display rules:**
- Cards render with the same layout as S-AS-01
- Timestamp label uses the exact `generated_at` from the previous run; the elapsed-time calculation in §3.1 applies
- No error banner, no "stale" label beyond the timestamp itself
- Disclaimer remains visible
- If elapsed time > 72 hours: section transitions to S-AS-03 (empty state); stale data older than 72 hours is not shown

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-08-01 | Today is Saturday; last pipeline ran Friday at 18:45; valid_until = Saturday 08:30 ICT | User opens Home on Saturday afternoon | Cards show Friday's signals; timestamp shows "Cập nhật [N]h trước" where N is hours since Friday 18:45 |
| AC-AS-08-02 | Today is Monday public holiday; last pipeline ran last Friday | User opens Home | Cards show Friday's signals; timestamp shows correct elapsed time |
| AC-AS-08-03 | Last pipeline ran 73 hours ago | User opens Home | Empty state (S-AS-03) displayed; no cards from 73h-old data |
| AC-AS-08-04 | Stale suggestions displayed | Disclaimer visible | Yes; disclaimer appears below the stale cards |

---

### FR-AS-09 — Empty State

**Priority:** P1

**Actor:** Authenticated user

**Description:**
When no published suggestions exist and no fallback (stale) data is available within the 72-hour window, the section shows an empty state card instead of the suggestion cards. This applies on the first day of service (no historical data) and when the pipeline has failed for more than 72 consecutive hours.

**Empty state card content:**
- Heading: "Gợi ý đang được cập nhật"
- Body: "AI đang phân tích dữ liệu thị trường. Quay lại sau 19:00."
- No retry button (automatic re-load happens on next Home screen refresh)
- Disclaimer is NOT shown in empty state (no signal content to qualify)

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-09-01 | First day of service; no records in ai_suggestions | User opens Home | Empty state card shown with exact heading and body text above |
| AC-AS-09-02 | Pipeline has failed for 73 consecutive hours | User opens Home | Empty state shown; no stale cards |
| AC-AS-09-03 | Empty state showing | User pulls to refresh Home | API called again; if still no data, empty state remains; no error banner |
| AC-AS-09-04 | Empty state showing | User views section | No disclaimer text visible; no "Xem tất cả" link visible |

---

## 5. Business Rules

| Rule ID | Rule | Violation Behaviour |
|---------|------|---------------------|
| BR-AS-01 | confidence_pct displayed on any card must not exceed 85, regardless of the value stored in the database. If the DB value exceeds 85, the client displays 85 and logs a client warning. | Any value > 85 displayed = P0 compliance bug |
| BR-AS-02 | signal_type must be one of three values: `BUY_OPPORTUNITY`, `WATCH`, `SELL_CAUTION`. No other values are valid. If the client receives an unknown value, it must render the WATCH label and log a client error. | Unknown signal_type rendered as-is = P1 data bug |
| BR-AS-03 | analysis_text must be ≤ 150 characters as displayed. If the client receives text longer than 150 chars, it truncates to 150 chars and appends "…". | Text > 150 chars rendered without truncation = P1 UI bug |
| BR-AS-04 | The following phrases must not appear in any analysis_text shown to a user: "chắc chắn", "đảm bảo lãi", "không rủi ro", "100%", "bảo đảm", "mua đi", "bán ngay", "nên đầu tư vào", "chắc chắn tăng". These are filtered by the pipeline before writing; the client applies a secondary check and replaces any card containing a prohibited phrase with the empty state treatment for that card slot. | Prohibited phrase visible to user = P0 compliance bug |
| BR-AS-05 | The disclaimer "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn." must be visible whenever any suggestion card is on screen. No user action can hide it. No A/B test may remove it. Any change to the exact text requires legal team sign-off before deployment. | Disclaimer missing while cards visible = P0 compliance bug |
| BR-AS-06 | LEARN_MODE users (age 16–17) must not see `price_target` or `target_pct` values. The client tier check is mandatory. The API always returns these fields; the client is responsible for suppressing them. | Price target shown to LEARN_MODE user = P0 age-gate bug |
| BR-AS-07 | price_target must be labelled "MỤC TIÊU AI" and must never be accompanied by guarantee language. The phrases "sẽ đạt", "đảm bảo đạt", "bảo đảm", "chắc chắn đạt" must not appear on or near the price target display. | Guarantee language near price target = P0 compliance bug |
| BR-AS-08 | The section shows at most 3 cards. If > 3 published, non-expired suggestions exist, the top 3 by confidence_pct are shown. The client must not show a 4th card even if the API returns more than 3. | 4 cards shown = P1 UI bug |
| BR-AS-09 | Stale suggestions older than 72 hours must not be shown. If the most recent `generated_at` is > 72 hours before the current ICT time, the client must show the empty state (S-AS-03). | Data older than 72h shown = P1 data freshness bug |
| BR-AS-10 | Cards with `is_published = false` must never be shown to users. The API must filter these server-side; the client must not render any card without a confirmed `is_published = true` flag in the response. This is the kill switch mechanism for compliance incidents. | Unpublished card shown = P0 compliance bug |

---

## 6. Acceptance Criteria

This section provides complete Given/When/Then acceptance criteria for the two primary user tier paths.

### AC-SET-01: FULL_ACCESS User — Normal Load

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-FA-01 | FULL_ACCESS user; 3 published suggestions: FPT (78%, BUY_OPPORTUNITY, price_target = 156000, +9.5%); VIC (71%, SELL_CAUTION, price_target = null); VNM (65%, WATCH, price_target = 148000, +5.2%); generated_at = 2h ago | User opens Home | Section header shows "Gợi ý hôm nay" + "AI" badge + "Cập nhật 2h trước" + "Xem tất cả"; 3 cards in order FPT, VIC, VNM; FPT card shows "78%", "Cơ hội mua tiềm năng", analysis text, "GIÁ HIỆN TẠI" + "MỤC TIÊU AI ₫156.000 +9,5%"; VIC card shows "71%", "Cảnh báo bán", no price rows (price_target = null); VNM card shows "65%", "Đáng quan sát", "GIÁ HIỆN TẠI" + "MỤC TIÊU AI ₫148.000 +5,2%"; disclaimer text below all cards |
| AC-AS-FA-02 | FULL_ACCESS user; FPT card visible | User taps FPT card | Stock Detail screen opens for FPT with ai_signal_type = "BUY_OPPORTUNITY", ai_confidence_pct = 78, ai_price_target = 156000 passed as nav params |
| AC-AS-FA-03 | FULL_ACCESS user; all 3 cards visible | User reads page | "TIN CẬY" badge visible on FPT (78%) and VIC (71%) cards; not on VNM (65%) card |

### AC-SET-02: LEARN_MODE User — Normal Load

| # | Given | When | Then |
|---|-------|------|------|
| AC-AS-LM-01 | LEARN_MODE user; same 3 suggestions as AC-SET-01 | User opens Home | 3 cards render; FPT card shows "78%", "Cơ hội mua tiềm năng", analysis text, nudge "Mở khóa mục tiêu giá khi bạn đủ 18 tuổi"; NO "GIÁ HIỆN TẠI" or "MỤC TIÊU AI" rows visible; VIC and VNM cards likewise have no price rows and show nudge |
| AC-AS-LM-02 | LEARN_MODE user; VIC card visible | User taps VIC card | Stock Detail opens for VIC; price target NOT shown in Stock Detail AI section |
| AC-AS-LM-03 | LEARN_MODE user | Disclaimer visible | "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn." visible below cards |

---

## 7. Edge Cases

| Case ID | Scenario | Expected Behaviour |
|---------|----------|--------------------|
| EC-AS-01 | Pipeline ran successfully but wrote 0 published suggestions (all 20 symbols failed content filter) | API returns empty array; client shows S-AS-03 empty state with "Gợi ý đang được cập nhật" |
| EC-AS-02 | User opens Home at exactly 18:45 ICT while the pipeline job is mid-run (new data partially written) | API returns previous day's data (still valid); S-AS-02 stale state; new data appears on next pull-to-refresh after pipeline completes |
| EC-AS-03 | API returns a suggestion with confidence_pct = 87 (pipeline bug) | Client displays 85%; logs client warning "confidence_pct 87 capped to 85 for symbol [X]"; does not crash |
| EC-AS-04 | API returns a suggestion with signal_type = "STRONG_BUY" (pipeline bug) | Client renders WATCH label "Đáng quan sát"; logs client error "unknown signal_type STRONG_BUY for symbol [X]" |
| EC-AS-05 | analysis_text contains the phrase "chắc chắn" (pipeline filter bypass bug) | Client secondary check detects prohibited phrase; replaces that card slot with nothing (that card is skipped); remaining ≤ 2 cards still shown; client error logged |
| EC-AS-06 | User is offline; previous Home API response was cached ≤ 72 hours ago | Show cached suggestion cards; timestamp calculated from cached generated_at; no error banner |
| EC-AS-07 | User is offline; no cached Home API response | S-AS-05: Section hidden; no error shown in this section |
| EC-AS-08 | LEARN_MODE user turns 18 while viewing Home (session tier not yet updated) | Continue showing nudge until next session init or explicit tier refresh; do not mid-session reveal price target without confirmed tier update |
| EC-AS-09 | 5 published suggestions available in the API response | Client renders only the top 3 by confidence_pct; ignores the remaining 2; no error |
| EC-AS-10 | Admin sets is_published = false for FPT while 3 cards are already cached on client | Next API call returns 2 cards; client re-renders with 2 cards; if cached response used, FPT card still shows until cache refresh (acceptable; cache TTL = 5 minutes) |
| EC-AS-11 | price_target = 0 (data error) | Client treats price_target = 0 as null; hides price rows; does not show "₫0 +0%" |
| EC-AS-12 | target_pct is negative (e.g., -3.2 — sell caution signal with downside target) | Display as "-3,2%" with negative sign; label row still reads "MỤC TIÊU AI"; FULL_ACCESS only |

---

## 8. Design Requirements

Design confirmed from Home screen PPTX. All dimensions and exact component names to be validated against Paave Design System (Figma) before implementation.

### 8.1 Section Container

- Section lives inside the Home screen vertical scroll
- Section header (FR-AS-01) is not sticky within the home scroll; it scrolls with the content
- Cards are displayed horizontally as a horizontally scrollable row on wide screens, or vertically stacked on narrow breakpoints (confirm with UX)
- 3 cards maximum; horizontal card width is approximately 70–75% of screen width to hint at scrollability

### 8.2 Card Visual Design

- Card background: elevated surface (slightly lighter than page background)
- Confidence score: large, bold; left-aligned; accent colour matching signal type
- Signal label: medium size; below confidence score; colour-coded (green/amber/red per §1.1)
- Symbol code: bold; right of or below signal label (confirm with Figma)
- Analysis text: small; secondary text colour; 3-line max visible height before truncation
- "TIN CẬY" badge: small pill; positioned top-right of card; shown only when confidence_pct ≥ 70
- Separator line between analysis text and price rows
- "GIÁ HIỆN TẠI" label: uppercase, small, secondary colour
- price_current value: medium, primary colour
- "MỤC TIÊU AI" label: uppercase, small, accent colour
- price_target + target_pct: medium; accent colour; bold

### 8.3 Disclaimer

- Below all cards; full-width
- Text style: caption size; tertiary/secondary text colour
- No background, no border
- No tap affordance

### 8.4 Empty State

- Replaces all 3 card slots
- Centred text layout
- Icon: optional AI/sparkle icon (confirm with UX)
- No retry button

### 8.5 Loading State (S-AS-04)

- 3 skeleton card shapes with shimmer animation
- Same dimensions as real cards
- Duration: until API response received or 5 seconds (then switch to S-AS-05 or S-AS-03 based on cache)

### 8.6 Animations

| Transition | Animation |
|-----------|-----------|
| S-AS-04 → S-AS-01 | Skeleton cards fade out; real cards fade in; duration 200ms |
| S-AS-04 → S-AS-03 | Skeleton cards fade out; empty state fades in; duration 200ms |
| Card tap | Brief scale press animation (95% scale, 100ms) before navigation |

---

## 9. Validation Logic Table

Client-side validation applied before rendering any card.

| Field | Rule | Error Action | Log |
|-------|------|-------------|-----|
| `confidence_pct` | Must be integer 0–100 | If > 85: display 85; if < 0 or > 100: hide card | WARN: "confidence_pct out of range: [value] for [symbol]" |
| `signal_type` | Must be one of `BUY_OPPORTUNITY`, `WATCH`, `SELL_CAUTION` | Unknown value: render WATCH label | ERROR: "unknown signal_type [value] for [symbol]" |
| `analysis_text` | Must be present; max 150 chars displayed | Truncate to 150 + "…"; if null/empty: hide card | WARN: "analysis_text null for [symbol]" if missing |
| `analysis_text` prohibited phrases | Must not contain: "chắc chắn", "đảm bảo lãi", "không rủi ro", "100%", "bảo đảm", "mua đi", "bán ngay", "nên đầu tư vào", "chắc chắn tăng" | Skip card; do not render | ERROR: "prohibited phrase in analysis_text for [symbol]: [phrase]" |
| `price_target` | Numeric > 0 or null | If 0 or negative: treat as null; hide price rows | WARN: "invalid price_target [value] for [symbol]" |
| `is_published` | Must be true in API response | API must filter; client: if false received, skip card | ERROR: "is_published = false card received for [symbol]" |
| `valid_until` | Must be present; if < now() AND generated_at < now() - 72h: do not show | Switch to S-AS-03 | INFO: "stale data beyond 72h threshold; showing empty state" |
| `symbol_code` | Must be present and non-empty | If missing: hide card | WARN: "missing symbol_code on suggestion record [id]" |
| Card count | API response may return > 3; client renders only top 3 by confidence_pct | Ignore records beyond top 3 | None |

---

## 10. Traceability Matrix

| Objective | FR | Business Rule | SRD Logic | Test Case |
|-----------|----|--------------|-----------|-----------| 
| Show daily AI signals on Home screen | FR-AS-01, FR-AS-02 | BR-AS-08 (max 3 cards) | SRD-21 §2 Pipeline + §3 API | AC-AS-01-01, AC-AS-02-01 |
| Compliance: no investment advice | FR-AS-06 | BR-AS-05 (disclaimer), BR-AS-04 (prohibited phrases), BR-AS-07 (no guarantee language) | SRD-21 §4.2 Content filter | AC-AS-06-01..05, AC-AS-FA-01 |
| Confidence cap at 85% | FR-AS-02 | BR-AS-01 | SRD-21 §4.3 DB CHECK + pipeline cap | AC-AS-02-05, EC-AS-03 |
| Signal type restricted to 3 values | FR-AS-02 | BR-AS-02 | SRD-21 §4.2 DB CHECK | AC-AS-02-02..04, EC-AS-04 |
| Price target for FULL_ACCESS only | FR-AS-04, FR-AS-05 | BR-AS-06, BR-AS-07 | SRD-21 §3 API tier handling | AC-AS-04-01..05, AC-AS-LM-01 |
| LEARN_MODE: hide price target | FR-AS-05 | BR-AS-06 | SRD-21 §3 client-side tier check | AC-AS-05-01..04, AC-AS-LM-01 |
| Kill switch: admin unpublish | FR-AS-02 | BR-AS-10 | SRD-21 §5 is_published filter | EC-AS-10, AC-AS-02-09 |
| Graceful empty state when pipeline fails | FR-AS-09 | BR-AS-09 (72h stale limit) | SRD-21 §5 error handling | AC-AS-09-01..04, EC-AS-01 |
| Stale fallback on weekends/holidays | FR-AS-08 | BR-AS-09 | SRD-21 §5 staleness logic | AC-AS-08-01..04 |
| Navigation to Stock Detail with AI context | FR-AS-03 | — | SRD-21 §3 nav params | AC-AS-03-01..03, AC-AS-FA-02 |
| "Xem tất cả" V1 stub | FR-AS-07 | — | N/A (client only) | AC-AS-07-01..03 |

---

## 11. Related Documents

| Document | Location | Relationship |
|----------|----------|-------------|
| SRD-21: AI Suggestions System | `docs/business/srd/21-ai-suggestions.md` | System implementation spec for this FRD |
| FRD-09: Age Gate & Feature Tier | `docs/business/frd/09-age-gate.md` | LEARN_MODE vs FULL_ACCESS definitions |
| FRD-12: AI Insights | `docs/business/frd/12-ai-insights.md` | Adjacent AI feature; different trigger (post-trade vs daily batch) |
| FRD-15: Legal Disclaimers | `docs/business/frd/15-legal-disclaimers.md` | Disclaimer text governance |
| FRD-02: Home Screen | `docs/business/frd/02-home-screen.md` | Host screen for this section |
| FRD-04: Stock Detail | `docs/business/frd/04-stock-detail.md` | Navigation target from card tap |
| BRD.md | `docs/business/frd/BRD.md` | Business objectives this feature serves |

---

*End of FRD-21: AI Suggestions (Gợi ý hôm nay)*
*Version 1.0 — 2026-06-01. Authoritative for all AI Suggestions display requirements.*
