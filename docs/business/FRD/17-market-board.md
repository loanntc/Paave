# FRD-17: Market Board (Bảng Giá)

**Version:** 1.0
**Date:** 2026-05-29
**Author:** BA Spec Writer — Paave Product Team
**Status:** Ready for Development
**Linked BRD:** BRD.md §BO-03 (Watchlist Engagement), §BO-06 (VN Market Data Reliability), §BO-08 (Paper Trading Primary Loop)
**Supersedes:**
- FRD-06 §FR-36 (Markets Screen Layout — Vietnam tab price board section only)
- FRD-06 §FR-37 (Vietnam Market Tab — Top 5 lists section only; index summary cards in FR-37 are NOT superseded)

> **Note on supersession scope:** This document upgrades the Vietnam price board from a "Top 5" summary list to a full scrollable price board, and adds Watchlist and Holdings tabs within the Markets screen. It does NOT replace the Korea tab (FR-38), Global tab (FR-39), Market Search (FR-40), or Market Hours (FR-41) — those remain active in FRD-06. The Korea/Global tabs remain on the Markets screen alongside the new Market Board tabs. The tab bar layout change is specified in §3.1 below.

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Actors and Preconditions](#2-actors-and-preconditions)
3. [User Flows](#3-user-flows)
4. [UX Flow — Screen States and Transitions](#4-ux-flow--screen-states-and-transitions)
5. [Functional Requirements](#5-functional-requirements)
6. [Business Rules](#6-business-rules)
7. [Acceptance Criteria](#7-acceptance-criteria)
8. [Edge Cases](#8-edge-cases)
9. [Design Requirements](#9-design-requirements)
10. [Traceability Matrix](#10-traceability-matrix)
11. [Related Documents](#11-related-documents)

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Market Board (Bảng Giá) |
| Module Role | Supporting — drives watchlist engagement (BO-03) and surface for initiating paper trades |
| Primary Actor | Authenticated user (LEARN_MODE or FULL_ACCESS) |
| Goal | Browse the full live price board for VN markets; track watchlisted stocks; monitor open paper trading positions — all from a single screen |
| Trigger | Tap "Markets" tab in bottom navigation bar |
| Default Tab (first load) | Vietnam — Price Board (HOSE exchange active) |
| Data Authority | `symbol_quotes_latest` table (ETL read-only mirror) and `market_price_board_snapshot` table |
| Real-Time Mechanism | WebSocket tick updates during market hours [PENDING: WS spec] |
| Fallback | 30-second HTTP polling when WebSocket is unavailable |
| Markets in Scope | HOSE, HNX, UPCOM (Vietnam only for this feature); Korea and Global tabs are unchanged (FRD-06) |

---

## 2. Actors and Preconditions

| Actor | Description | Precondition |
|---|---|---|
| Authenticated user (LEARN_MODE) | Age 16–17; paper trading restricted to LEARN_MODE rules | User is authenticated; age gate passed |
| Authenticated user (FULL_ACCESS) | Age 18+; full paper trading access | User is authenticated; age gate passed |
| Paave WebSocket Service | Pushes quote tick updates to connected clients | WebSocket connection established on screen mount |
| Paave ETL Service | Populates `symbol_quotes_latest` from exchange feed | Running; last ingestion ≤ 15s ago during market hours |

Both user tiers see identical Market Board UI. Holdings tab data is scoped to the user's active paper trading sub-account.

---

## 3. User Flows

### 3.1 Flow A — Browse Full Price Board

1. User taps "Markets" tab in bottom navigation.
2. Investment disclaimer modal appears if this is the first Markets visit of the current session (carried over from FR-36; behavior unchanged).
3. User taps "Got it" on disclaimer.
4. Markets screen opens. Tab bar shows: **[Price Board] [Watchlist] [Holdings] [Korea] [Global]**.
5. Price Board tab is active by default. Exchange sub-tab shows: **[HOSE] [HNX] [UPCOM]**. HOSE is active by default.
6. Full list of active HOSE stocks renders, sorted by `% change` descending (default sort), with columns: Code, Short Name, Ref Price, Last Price, Change (VND), Change (%), Volume.
7. User scrolls through the list.
8. User taps a column header to change sort order (e.g., taps "Volume" → list re-sorts by total_volume descending).
9. User taps a ticker row → navigates to Stock Detail screen for that ticker (existing FRD-04 behavior).
10. User taps back → returns to Market Board, same exchange tab and scroll position preserved.

### 3.2 Flow B — Search Within Price Board

1. User is on Price Board tab (any exchange sub-tab).
2. User taps the search field at the top of the price board list.
3. Keyboard appears; list filters in real-time as user types (client-side filter, no debounce required — filtering is on already-loaded data).
4. Matching rows remain visible; non-matching rows are hidden. Match is against `code` (ticker) OR `short_name` (case-insensitive).
5. User taps a result row → navigates to Stock Detail.
6. User clears the search field (taps X) → full list restored.

### 3.3 Flow C — Add Stock to Watchlist from Price Board

1. User is on Price Board tab, viewing a ticker row.
2. User long-presses (500ms hold) a ticker row OR taps the watchlist icon (star) visible on the row.
3. A context action appears: "Add to Watchlist" (if not already in watchlist) or "Remove from Watchlist" (if already in watchlist).
4. User taps "Add to Watchlist".
5. A `watchlist_items` record is created (via API).
6. The star icon on that row fills (solid) to confirm addition.
7. Success toast appears: "Đã thêm [CODE] vào danh sách theo dõi" ("Added [CODE] to watchlist").

### 3.4 Flow D — View Watchlist Tab

1. User is on the Markets screen.
2. User taps "Watchlist" tab.
3. If the user has watchlist items: list renders with the same columns as the Price Board. Data is live (same WebSocket feed).
4. If the user has no watchlist items: empty state is shown (see §9.4).
5. User taps "Khám phá cổ phiếu" (Explore stocks) in the empty state → returns to Price Board tab.
6. User taps a ticker row → navigates to Stock Detail.

### 3.5 Flow E — View Holdings Tab

1. User is on the Markets screen.
2. User taps "Holdings" tab.
3. System reads `virtual_holdings` for the user's active paper trading sub-account.
4. If the user has open positions: list renders with columns: Code, Last Price, Avg Cost, Unrealized P&L (VND), Unrealized P&L (%).
5. If the user has no open positions: empty state is shown (see §9.4).
6. User taps "Giao dịch ngay" (Trade now) in the empty state → navigates to Stock Detail of a suggested stock (first item in Top 5 Gainers from FRD-06 FR-37).
7. User taps a ticker row → navigates to Stock Detail screen, pre-scrolled to the trading panel.

### 3.6 Flow F — Market Closed State

1. User opens Markets screen outside of VN market hours (before 09:00 ICT or after 15:00 ICT, or on a weekend or public holiday per server-side calendar).
2. "Đã đóng cửa" badge appears on the Price Board tab header (below the exchange sub-tabs).
3. Last known prices are displayed (from `symbol_quotes_latest`); the `quote_time` timestamp is shown per-row.
4. WebSocket connection is not established (or is disconnected if market closes during session). Polling is also suspended.
5. Prices are static until market reopens.

### 3.7 Flow G — WebSocket Disconnection During Session

1. User is on Price Board tab during market hours; WebSocket connection drops.
2. Client detects disconnection (WS `onclose` event).
3. Client immediately attempts reconnect with exponential backoff: 1s → 2s → 4s → 8s → 16s → cap at 30s, up to 10 attempts.
4. During reconnect attempts: yellow banner "Dữ liệu có thể bị trễ — đang kết nối lại..." ("Data may be delayed — reconnecting...") appears below the exchange sub-tabs.
5. On successful reconnect: banner disappears; data resumes live updates.
6. After 10 failed reconnect attempts: banner changes to "Không thể kết nối — hiển thị dữ liệu lần cuối" ("Unable to connect — showing last known data"). Falls back to 30-second HTTP polling.

---

## 4. UX Flow — Screen States and Transitions

### 4.1 Screen State Diagram

```
[Markets Tab Tapped]
        |
        v
[Disclaimer Modal] (first visit this session only)
        |
  [Got it tapped]
        |
        v
[Market Board Screen]
   |          |          |          |          |
[Price Board] [Watchlist] [Holdings] [Korea]  [Global]
   |
[Exchange Sub-tabs: HOSE | HNX | UPCOM]
   |
   +--[Loading State]---------> Skeleton rows animate (200ms shimmer)
   |
   +--[Data Loaded]-----------> Full price board list renders
   |       |
   |  [WS Connected]-----------+-> Tick updates applied in-place (no full re-render)
   |  [WS Disconnected]---------> Yellow reconnect banner; fallback polling
   |  [Market Closed]-----------> "Đã đóng cửa" badge; static data; last quote_time shown
   |
   +--[Search Active]-----------> Client-side filter; matching rows remain; others hidden
   |
   +--[Sort Changed]-----------> List re-renders with new sort; header column shows active sort arrow
   |
   +--[Row Tapped]-------------> Navigate to Stock Detail (FRD-04)
   |
   +--[Star Tapped]-------------> Watchlist API call; star fills on success; toast appears
```

### 4.2 Tab Transition Behavior

- Switching tabs does NOT trigger a page reload. Data already loaded persists; only visible content changes.
- WebSocket subscription scope: when user is on Price Board (HOSE/HNX/UPCOM), WS subscribes to all symbols on that exchange. When user switches to Watchlist, WS updates subscription to watchlist symbols only. When user switches to Holdings, WS updates subscription to held symbols only.
- Korea and Global tabs behave exactly as specified in FRD-06 FR-38 and FR-39 (no change).

### 4.3 Loading States

| Context | Skeleton Behavior |
|---|---|
| Initial load of Price Board | Show 12 skeleton rows (each 48px height, same column layout as loaded state) animating with `shimmer` effect (left-to-right fade, 1.5s cycle). Show skeleton for 0ms to 3000ms max. If data not loaded in 3000ms, show error state. |
| Exchange sub-tab switch (data already cached) | No skeleton; switch is instant (<100ms from cache). |
| Exchange sub-tab switch (data not cached) | Show skeleton rows for that exchange immediately; fetch in background. |
| Watchlist tab (first open) | Show skeleton rows (count = min(watchlist_count, 8)). |
| Holdings tab (first open) | Show skeleton rows (count = min(position_count, 8)). |

### 4.4 Error States

| Error | Display |
|---|---|
| Price board data fails to load after 3000ms | Full-screen inline error: "Không tải được dữ liệu. Thử lại." ("Could not load data. Try again.") with retry button. |
| Watchlist API fails (add/remove) | Toast: "Không thể cập nhật danh sách theo dõi. Thử lại." ("Could not update watchlist. Try again.") Star icon reverts to previous state. |
| Holdings data fails to load | Inline error within Holdings tab: "Không tải được vị thế. Thử lại." ("Could not load positions. Try again.") with retry button. |

---

## 5. Functional Requirements

---

### FR-MB-01 — Market Board Tab Bar Integration

**Priority:** P0

**Actor:** Authenticated user (all tiers)

**Description:**
The Markets screen tab bar is updated from FRD-06's 3-tab layout (Vietnam | Korea | Global) to a 5-tab layout: **Price Board** | **Watchlist** | **Holdings** | **Korea** | **Global**. The Korea and Global tabs retain all behavior from FRD-06 FR-38 and FR-39 without change. The Vietnam tab from FRD-06 (FR-37) is replaced by the three new tabs (Price Board, Watchlist, Holdings). The VN-Index and HNX-Index summary cards that were part of FR-37 are relocated: they remain visible as a collapsed header row above the exchange sub-tabs on the Price Board tab (not removed).

**Input:**
- User tap on any tab label
- Current active tab state

**Output:**
- Selected tab renders its content; other tab content is hidden (not destroyed — DOM persists for instant re-switch)
- Tab bar scrolls horizontally if viewport is narrower than total tab bar width (all 5 tabs must be reachable without overflow hiding)
- Active tab indicator: underline using `lime` (`#CAFD00`) color token, 2px stroke
- Inactive tab label: `fog` (`#ADAAAA`) color token
- Active tab label: `white` (`#FFFFFF`) color token
- Korea and Global tab labels: retain "Reference" chip per FRD-06 FR-36

**Precondition:** User is authenticated; Markets screen is mounted.

**Postcondition:** Correct tab content is displayed. Disclaimer shown and acknowledged on first Markets visit this session (FR-36 behavior — unchanged).

---

### FR-MB-02 — Price Board — Full Stock List (Exchange Sub-tabs)

**Priority:** P0

**Actor:** Authenticated user (all tiers)

**Description:**
The Price Board tab displays the complete list of active stocks for the selected exchange (HOSE, HNX, or UPCOM). "Active" means: `symbols.symbol_type` is stock/equity AND the symbol has a quote record in `symbol_quotes_latest` with `session` NOT equal to 'CLOSED' or with a `quote_time` within the current trading day.

The exchange sub-tab bar shows three sub-tabs: **HOSE** | **HNX** | **UPCOM**. Default active sub-tab on first load: HOSE. The user's last selected sub-tab persists within the session (switching to Watchlist and back returns to the last active exchange sub-tab).

**Columns (left to right):**

| Column | Source Field | Width | Alignment | Format |
|---|---|---|---|---|
| Code | `symbols.code` | Fixed 56px | Left | Uppercase, `body-sm` bold, white |
| Short Name | `symbols.short_name` | Flex 1 (truncated 1 line) | Left | `body-sm`, fog |
| Ref Price | `symbol_quotes_latest.ref_price` | Fixed 72px | Right | VND integer, no suffix, no ₫ symbol in list rows |
| Last Price | `symbol_quotes_latest.last_price` | Fixed 72px | Right | VND integer; color-coded (see BR-MB-01) |
| Change | `last_price - ref_price` | Fixed 64px | Right | Signed integer (e.g., +1.200 or -800); color-coded |
| Change % | `symbol_quotes_latest.pct_change` | Fixed 64px | Right | Signed percentage to 2 decimal places (e.g., +2.15% or -1.30%); color-coded |
| Volume | `symbol_quotes_latest.total_volume` | Fixed 72px | Right | Abbreviated: ≥1,000,000 → "X,XX Tr" (triệu); ≥1,000 → "X.XXX K"; <1,000 → raw integer |

Row height: 48px minimum (touch target ≥ 44px). Divider between rows: 1px `edge` (`rgba(72,72,71,0.20)`).

A watchlist star icon (Lucide `Star`, 16px, stroke 1.5px) appears on the right edge of each row:
- Hollow star = stock not in watchlist
- Solid star (lime fill `#CAFD00`) = stock is in watchlist

**Sort behavior:**

Default sort on load: `pct_change` descending (largest % gain at top).

Tappable column headers: Code (alphabetical), Last Price, Change %, Volume. Ref Price and Short Name are not sortable.

Tapping a column header once → sort descending. Tapping again → sort ascending. Tapping a third time → return to default sort (pct_change descending). Active sort column header: shows sort arrow icon (▼ desc, ▲ asc), color `lime`.

Sorting is client-side on the already-loaded dataset; no API call.

**Input:**
- `symbol_quotes_latest` records for all symbols on selected exchange
- `symbols` table for code + short_name
- User's `watchlist_items` (to render star fill state)
- Column header tap event (sort)
- Row tap event (navigate to Stock Detail)
- Star icon tap event (add/remove watchlist)
- Exchange sub-tab tap event

**Output:**
- Scrollable list of all active stocks for selected exchange
- Color-coded price cells
- Watchlist star icons with correct fill state
- Active sort indicator on column header

**Precondition:** User is on Price Board tab. Data loaded from `symbol_quotes_latest`.

**Postcondition:** Full price board rendered; sorting and star state reflect current data and user's watchlist.

---

### FR-MB-03 — Price Board — VN Index Summary Header

**Priority:** P0

**Actor:** Authenticated user (all tiers)

**Description:**
Above the exchange sub-tab bar on the Price Board tab, a condensed horizontal strip shows the VN-Index and HNX-Index summary values. This replaces the larger index cards from FRD-06 FR-37, which are now condensed to fit above the full price board.

The strip contains two index chips side by side:
- Chip 1: "VN-Index" label + current value + daily change % (color-coded)
- Chip 2: "HNX-Index" label + current value + daily change % (color-coded)

Tapping an index chip navigates to a dedicated index detail screen (if implemented; if not yet implemented, tap is a no-op with no visual feedback). These chips are informational; they do not affect the price board list content.

When market is closed: each chip shows "Đã đóng cửa" label instead of the index value.

When feed for one index is unavailable: that chip shows "—" for the value.

**Input:**
- VN-Index and HNX-Index values from VN market data feed (same source as FRD-06 FR-37)
- Market session state (open/closed)

**Output:**
- Two index summary chips above exchange sub-tabs
- Color-coded change values
- "Đã đóng cửa" state when market is closed

**Precondition:** User is on Price Board tab.

**Postcondition:** Index summary visible at all times while on Price Board tab. Updates via same WebSocket tick as price board data.

---

### FR-MB-04 — Price Board — Inline Search

**Priority:** P1

**Actor:** Authenticated user (all tiers)

**Description:**
A search input field appears at the top of the price board list (below the index summary strip, above the first stock row). The placeholder text is "Tìm mã CK hoặc tên công ty..." ("Search ticker or company name...").

Filtering behavior: client-side, applied to the already-loaded list for the current exchange sub-tab. No API call. Filter is applied on every keystroke (no debounce — filtering is on in-memory data).

Match logic: case-insensitive substring match against `symbols.code` OR `symbols.short_name`. A row is visible if EITHER field matches.

When search field is empty: full list shown (no filtering).

When search field has text: only matching rows shown. Non-matching rows are removed from the rendered list (not grayed out — hidden). Sort order is preserved among visible rows. A "X results" count appears above the list: "Tìm thấy X mã" ("Found X tickers").

Clear behavior: tapping the X icon (Lucide `X`, 16px) in the search field clears text and restores full list.

The search scope is limited to the currently active exchange sub-tab. Switching exchange sub-tab while search is active: clears the search field and restores the full list for the new exchange.

**Input:**
- User text input (keystrokes)
- Currently loaded stock list for the active exchange

**Output:**
- Filtered list of rows matching query
- "Tìm thấy X mã" count when filter is active
- X clear button visible when text is present

**Precondition:** User is on Price Board tab; stock list is loaded.

**Postcondition:** List filtered to matching rows; restores to full list when search is cleared.

---

### FR-MB-05 — Price Board — Real-Time Updates via WebSocket

**Priority:** P0

**Actor:** Paave WebSocket Service → Authenticated user client

**Description:**
During VN market hours (09:00–15:00 ICT, Monday–Friday, excluding holidays per server-side calendar), the Price Board subscribes to a WebSocket channel for tick-by-tick quote updates.

[PENDING: WS spec] — The WebSocket protocol, message schema, channel naming, and authentication mechanism are pending finalization in the backend WebSocket specification. This requirement defines the client-side behavior; the WS contract must be completed before this FR can be fully implemented.

**Client behavior on tick receipt:**

When a tick update arrives for a symbol currently visible on screen, the client updates the following row fields in-place without re-rendering the entire list:
- `last_price` (cell background flashes for 300ms: green flash if price increased vs prior tick, red flash if decreased)
- `Change` (VND amount)
- `Change %`
- `total_volume`

If the sort criterion is currently active on a field that changed (e.g., user sorted by % change), the row DOES NOT automatically move to its new sort position during live updates — rows only re-sort when the user explicitly taps the column header. This prevents the list from reordering constantly during market hours.

Subscription scope: client subscribes only to the symbols currently visible on screen (after any active search filter). On scroll (if list is virtualized), subscription updates to include newly visible symbols. The WS subscription message must send the list of symbol codes to subscribe to.

**Fallback when WS unavailable:** 30-second HTTP polling to `symbol_quotes_latest` for all symbols on the current exchange sub-tab. Yellow banner shown per Flow G in §3.7.

**Market hours check:** The client checks market status from server (not device clock). If the server returns `session = 'CLOSED'` or all quotes have `session = 'CLOSED'`, WebSocket is not established and polling is suspended. "Đã đóng cửa" badge shown.

**Input:**
- WebSocket tick event containing: `symbol_code`, `last_price`, `pct_change`, `total_volume`, `bid_price`, `ask_price`, `session`
- Market status from server

**Output:**
- In-place cell updates on matching rows
- 300ms color flash on `last_price` cell
- Yellow reconnect banner on WS disconnection
- Fallback HTTP poll every 30s if WS unavailable

**Precondition:** User is on Price Board (or Watchlist, or Holdings) tab; market is open; WebSocket service is available.

**Postcondition:** Quote data reflects the most recent tick within the WebSocket delivery latency. During outage, data is no more than 30 seconds stale.

---

### FR-MB-06 — Watchlist Tab — Saved Stocks Price Board

**Priority:** P1

**Actor:** Authenticated user (all tiers)

**Description:**
The Watchlist tab displays a filtered price board showing only stocks the user has added to their watchlist (`watchlist_items` table, scoped to the current user).

Column layout: identical to FR-MB-02 (Code, Short Name, Ref Price, Last Price, Change, Change %, Volume). No exchange sub-tabs on the Watchlist tab — stocks from HOSE, HNX, and UPCOM are shown together in a single list. Exchange badge (HOSE / HNX / UPCOM) is added as a secondary label below the stock code to identify the exchange.

Sort: same options as Price Board (default: pct_change descending). Sort state is independent from Price Board sort state.

Add/remove watchlist from this tab: the star icon is always shown as solid (filled) on all rows (since all rows are watchlisted). Tapping the star removes the stock from the watchlist. After removal: row is removed from the Watchlist tab list with a slide-out animation (200ms). Toast: "Đã xóa [CODE] khỏi danh sách theo dõi" ("Removed [CODE] from watchlist").

Real-time updates: same WebSocket behavior as FR-MB-05. When user is on Watchlist tab, WS subscribes to watchlisted symbols only.

**Empty state:** When `watchlist_items` count is 0 for the current user. See §9.4 for exact empty state spec.

**Input:**
- `watchlist_items` for current user (list of symbol codes)
- `symbol_quotes_latest` for those symbol codes
- `symbols` for code, short_name, exchange

**Output:**
- Price board list filtered to watchlisted stocks
- Exchange badge on each row
- Solid star on every row; tap removes from watchlist
- Slide-out animation on removal
- Toast confirmation on add/remove
- Empty state when no watchlist items

**Precondition:** User is on Watchlist tab. User is authenticated.

**Postcondition:** Watchlist price board reflects current quotes and current watchlist membership.

---

### FR-MB-07 — Watchlist Management — Add from Price Board

**Priority:** P1

**Actor:** Authenticated user (all tiers)

**Description:**
Users add stocks to their watchlist from the Price Board tab (and from the Stock Detail screen — that behavior is governed by FRD-04; this FR covers the Price Board entry point only).

Two interaction entry points for adding from the Price Board:
1. **Star icon tap:** Tap the hollow star on any Price Board row → immediately calls `POST /api/v1/watchlist/items` with the symbol code. Star fills optimistically (before API confirms). On API success: star remains filled. On API failure: star reverts to hollow; toast: "Không thể cập nhật danh sách theo dõi. Thử lại."
2. **Long-press row (500ms):** A bottom sheet appears with two options: "Xem chi tiết" (View detail → Stock Detail) and "Thêm vào danh sách theo dõi" / "Xóa khỏi danh sách theo dõi" (toggle). Tapping the watchlist action calls the same API as the star tap.

If the symbol is already in the watchlist, the star is solid and tapping it calls `DELETE /api/v1/watchlist/items/{symbolCode}`. The star empties optimistically; reverts on failure.

**Watchlist capacity limit:** A user may have at most 50 watchlist items. If the user attempts to add a 51st item: API returns error; toast: "Danh sách theo dõi đã đầy (tối đa 50 mã). Xóa một mã để thêm mới." ("Watchlist is full (max 50 tickers). Remove a ticker to add a new one.") Star does not fill.

**Input:**
- User tap on star icon OR long-press on row
- `watchlist_items` count for current user

**Output:**
- `POST /api/v1/watchlist/items` or `DELETE /api/v1/watchlist/items/{symbolCode}` API call
- Optimistic UI update (star fills/empties immediately)
- Toast confirmation on success
- Toast error on failure with revert
- Capacity error toast when limit reached

**Precondition:** User is on Price Board tab. Stock list is loaded.

**Postcondition:** `watchlist_items` reflects the addition or removal. Star icon state is consistent with server-side watchlist state.

---

### FR-MB-08 — Holdings Tab — Open Paper Position Monitor

**Priority:** P1

**Actor:** Authenticated user (LEARN_MODE or FULL_ACCESS)

**Description:**
The Holdings tab displays all stocks for which the user has an open paper position (`quantity > 0`) in their active paper trading sub-account. Data source: `virtual_holdings` table, filtered by `sub_account_id` = user's currently active sub-account.

**Columns (left to right):**

| Column | Source | Width | Alignment | Format |
|---|---|---|---|---|
| Code | `virtual_holdings.symbol_code` | Fixed 56px | Left | Uppercase, bold, white |
| Short Name | `symbols.short_name` | Flex 1 (truncated 1 line) | Left | `body-sm`, fog |
| Last Price | `symbol_quotes_latest.last_price` | Fixed 72px | Right | VND integer; color-coded (BR-MB-01) |
| Avg Cost | `virtual_holdings.avg_cost` | Fixed 72px | Right | VND integer, fog color (not color-coded — this is a reference value) |
| P&L (VND) | `(last_price - avg_cost) * quantity` | Fixed 80px | Right | Signed VND, abbreviated if ≥ 1,000,000 (e.g., "+1.2 Tr" or "-800K"); color-coded (positive = green `#10B981`, negative = red `#EF4444`, zero = fog) |
| P&L (%) | `(last_price - avg_cost) / avg_cost * 100` | Fixed 64px | Right | Signed %, 2 decimal places; color-coded same as P&L VND |

Row height: 48px minimum. No exchange sub-tabs (holdings can be cross-exchange).

Tapping a row → navigates to Stock Detail, pre-scrolled to the trading panel (so user can quickly place a sell order).

Real-time updates: same WebSocket behavior as FR-MB-05. P&L values recalculate on every `last_price` tick update. Avg Cost does not change in real-time (it is historical from fill data).

Sort: default by P&L % descending (best performers at top). Tappable columns: Last Price, P&L (VND), P&L (%). Code is tappable for alphabetical sort.

"Virtual Funds" label: the text "Tiền ảo" appears as a non-dismissible caption above the holdings list, consistent with FRD-10 FR-PT-06 invariant. Color: `fog-muted`. Font: `caption-pulse` (12px uppercase, Space Grotesk).

**Empty state:** When `virtual_holdings` has no rows with `quantity > 0` for the active sub-account. See §9.4.

**Input:**
- `virtual_holdings` for active sub-account (quantity > 0)
- `symbol_quotes_latest` for held symbol codes
- `symbols` for short_name

**Output:**
- Holdings price board with P&L columns
- "Tiền ảo" label above list
- Real-time P&L recalculation on tick updates
- Tap row → Stock Detail

**Precondition:** User is on Holdings tab. User has an active paper trading sub-account.

**Postcondition:** Holdings list reflects current positions; P&L calculated using most recent `last_price`.

---

### FR-MB-09 — Market Session State Badge

**Priority:** P0

**Actor:** System (Paave server-side market status service)

**Description:**
All three new tabs (Price Board, Watchlist, Holdings) display a session state badge immediately below the exchange sub-tab bar (Price Board) or below the tab header (Watchlist, Holdings).

**Badge states:**

| Session | Badge Text | Badge Color |
|---|---|---|
| ATO (09:00–09:15 ICT) | "ATO — Khớp lệnh định kỳ mở cửa" | Amber `#F59E0B` background, `ink-900` text |
| CONT (09:15–11:30, 13:00–14:30 ICT) | "CONT — Khớp lệnh liên tục" | `lime` background (`#CAFD00`), `ink-900` text |
| ATC (14:30–14:45 ICT) | "ATC — Khớp lệnh định kỳ đóng cửa" | Amber `#F59E0B` background, `ink-900` text |
| CLOSED (outside hours / holiday) | "Đã đóng cửa" | `ink-600` background, `fog` text |

Session state is read from the `session` field of `symbol_quotes_latest` (any active symbol for the exchange). During CLOSED state, quote_time of last known data is shown as: "Cập nhật lần cuối: HH:mm DD/MM" ("Last updated: HH:mm DD/MM").

The badge height is 28px. It is non-dismissible. It appears on all three VN tabs (Price Board, Watchlist, Holdings).

**Input:**
- `session` field from `symbol_quotes_latest` (authoritative)
- `quote_time` for display in CLOSED state

**Output:**
- Session badge rendered with correct state, text, and color

**Precondition:** Price Board, Watchlist, or Holdings tab is active.

**Postcondition:** Badge reflects current market session at all times. Updates in real-time via same WebSocket tick.

---

## 6. Business Rules

| ID | Rule | Applies To | Violation Behavior |
|---|---|---|---|
| BR-MB-01 | VN price color coding: `last_price == ceiling_price` → purple `#7B2FBE`; `last_price == floor_price` → blue `#1D4ED8`; `last_price > ref_price` → green `#10B981`; `last_price == ref_price` → yellow `#EAB308`; `last_price < ref_price` → red `#EF4444`. These colors apply to: `last_price` cell, `Change` cell, `Change %` cell. | All VN price board rows (Price Board, Watchlist, Holdings) | Missing or incorrect color = P0 display bug |
| BR-MB-02 | Daily price limits: HOSE ±7% from `ref_price`; HNX ±10%; UPCOM ±15%. `ceiling_price = ref_price * (1 + limit_pct)` and `floor_price = ref_price * (1 - limit_pct)`, rounded per VN exchange tick-size rules. These values are stored in `symbol_quotes_latest` and are authoritative — the client MUST NOT compute ceiling/floor independently. | Price board color coding (BR-MB-01) | Client recomputing limits instead of reading from DB = incorrect ceiling/floor detection |
| BR-MB-03 | VND formatting in price board list rows: integer only, period (`.`) as thousand separator, NO ₫ symbol in table cells (too narrow). Example: 1.250 for 1,250 VND; 45.600 for 45,600 VND. Abbreviated for Volume column per FR-MB-02 specification. | All price cells | Using comma separator or adding ₫ = formatting bug |
| BR-MB-04 | VND formatting in full-width displays (toasts, empty states, Holdings P&L totals outside table cells): integer, period separator, ₫ after a space. Example: "1.250.000 ₫". | Toast messages, empty states | Incorrect formatting = display bug |
| BR-MB-05 | The "Tiền ảo" label must appear on the Holdings tab at all times and cannot be dismissed or hidden. This is a paper trading invariant per FRD-10 core invariant §1.1. | Holdings tab | Missing label = P0 compliance violation |
| BR-MB-06 | Watchlist capacity: maximum 50 items per user. Attempting to add a 51st item is blocked at the API layer. The client must display the capacity error message before any API call if local watchlist count is already 50. | Watchlist add action | Allowing 51+ items = data integrity bug |
| BR-MB-07 | Market hours are determined by the server-side calendar, NOT by device clock or device timezone. Client must receive market session state from the server (via WebSocket tick `session` field or dedicated market status endpoint). | All session state badges | Client computing hours from device clock = incorrect session state |
| BR-MB-08 | Korea and Global tabs on the Markets screen are unaffected by this FRD. Their behavior, data, disclaimer banners, and "Reference" chips remain exactly as specified in FRD-06 FR-38 and FR-39. | Korea/Global tabs | Any modification to Korea/Global tab behavior not in FRD-06 = out of scope regression |
| BR-MB-09 | Holdings P&L calculation uses `last_price` from `symbol_quotes_latest`, NOT any cached price. If `last_price` is unavailable for a held symbol (e.g., trading halted), P&L displays as "N/A" with `fog-muted` color. | Holdings P&L columns | Computing P&L from stale price = incorrect financial display |
| BR-MB-10 | In-place tick updates during live trading MUST NOT cause list rows to reorder automatically. Rows only reorder when user explicitly changes the sort column. | Price Board, Watchlist live tick updates | Auto-reordering during trading = UX bug (disorienting, makes rows untappable) |
| BR-MB-11 | The `ref_price` column always shows today's reference price (opening reference price from exchange), which is the prior day's closing price adjusted for corporate actions. This value does not change during the trading day. It is the baseline for color coding. | Price board Ref Price column | Displaying wrong ref price = incorrect color coding downstream |
| BR-MB-12 | Unrealized P&L in the Holdings tab is informational only. It must NOT be presented as realized gains or as real financial returns. The "Tiền ảo" label (BR-MB-05) is the mechanism for this disclosure. | Holdings P&L display | Missing disclosure label = compliance violation per FRD-10 §1.1 |

---

## 7. Acceptance Criteria

### FR-MB-01 — Market Board Tab Bar Integration

| # | Given | When | Then |
|---|---|---|---|
| AC-MB-01-01 | User is authenticated and opens Markets screen for the first time | App loads Markets screen | Tab bar shows 5 tabs in order: Price Board, Watchlist, Holdings, Korea, Global |
| AC-MB-01-02 | User is on Markets screen | User taps any tab | The tapped tab becomes active (underline indicator in `#CAFD00`); content area renders that tab's content |
| AC-MB-01-03 | User taps Korea tab | Korea tab is selected | Korea tab content is identical to FRD-06 FR-38; "Reference data" banner visible; no change in Korea tab behavior |
| AC-MB-01-04 | User taps Global tab | Global tab is selected | Global tab content is identical to FRD-06 FR-39; no change in Global tab behavior |
| AC-MB-01-05 | User switches from Holdings to Price Board and back to Holdings | Same session | Holdings tab content re-renders from persisted DOM state; no re-fetch if data is less than 30 seconds old |

### FR-MB-02 — Price Board Full Stock List

| # | Given | When | Then |
|---|---|---|---|
| AC-MB-02-01 | User opens Price Board tab | Data loaded | All active HOSE stocks are visible in a scrollable list; no "Top 5" truncation |
| AC-MB-02-02 | Price board loaded | Default state | List is sorted by pct_change descending; stock with highest % gain is first row |
| AC-MB-02-03 | User taps "Volume" column header | List is loaded | List re-sorts by total_volume descending; Volume column header shows ▼ indicator in lime |
| AC-MB-02-04 | User taps "Volume" header again | List sorted by volume descending | List re-sorts by total_volume ascending; Volume column header shows ▲ |
| AC-MB-02-05 | User taps "Volume" header a third time | List sorted by volume ascending | List returns to default sort (pct_change descending); volume header loses indicator |
| AC-MB-02-06 | User taps HNX sub-tab | Price Board is active | HNX stocks list renders; HOSE list is hidden; HOSE data remains cached |
| AC-MB-02-07 | Stock VIC has pct_change = +2.15, last_price = 45600, ref_price = 44600 | Row renders | last_price cell shows "45.600" in green (#10B981); Change shows "+1.000" in green; Change% shows "+2.24%" in green |
| AC-MB-02-08 | Stock XYZ has last_price equal to ceiling_price | Row renders | last_price, Change, Change% cells render in purple #7B2FBE |
| AC-MB-02-09 | Stock ABC has last_price equal to floor_price | Row renders | last_price, Change, Change% cells render in blue #1D4ED8 |
| AC-MB-02-10 | User taps a ticker row | Any time | Navigation to Stock Detail for that ticker symbol |
| AC-MB-02-11 | Stock is in user's watchlist | Row renders | Star icon is solid lime fill |
| AC-MB-02-12 | Stock is NOT in user's watchlist | Row renders | Star icon is hollow (outline only) |

### FR-MB-03 — VN Index Summary Header

| # | Given | When | Then |
|---|---|---|---|
| AC-MB-03-01 | User is on Price Board tab, market is open | Tab renders | VN-Index and HNX-Index chips visible above exchange sub-tabs with current values and color-coded change % |
| AC-MB-03-02 | VN market is closed | Price Board tab renders | Both index chips show "Đã đóng cửa" instead of value |
| AC-MB-03-03 | HNX-Index feed is unavailable | Tab renders | HNX-Index chip shows "—" for value; VN-Index chip unaffected |

### FR-MB-04 — Inline Search

| # | Given | When | Then |
|---|---|---|---|
| AC-MB-04-01 | User is on Price Board tab (HOSE), full list loaded | User types "VIC" in search field | Only rows where code or short_name contains "VIC" (case-insensitive) are visible; all other rows hidden |
| AC-MB-04-02 | User types "VIC" | Any results found | "Tìm thấy X mã" count appears above the list |
| AC-MB-04-03 | User types "ZZZZZ" (no match) | Filter applied | 0 rows visible; "Tìm thấy 0 mã" displayed |
| AC-MB-04-04 | User taps X to clear search | Search was active | Full list restored; "Tìm thấy X mã" label disappears |
| AC-MB-04-05 | User types "vic" (lowercase) | Filter applied | Rows matching "VIC" (case-insensitive) are visible — same result as AC-MB-04-01 |
| AC-MB-04-06 | User is searching on HOSE, switches to HNX sub-tab | Search field has "VIC" | Search field is cleared; full HNX list is shown |

### FR-MB-05 — Real-Time Updates via WebSocket

| # | Given | When | Then |
|---|---|---|---|
| AC-MB-05-01 | User is on Price Board, market is open, WS connected | Server sends tick for VIC with new last_price | VIC row updates last_price, Change, Change% in-place; 300ms green flash on last_price cell if price increased |
| AC-MB-05-02 | Tick for VIC arrives with lower price than previous tick | VIC row visible | 300ms red flash on last_price cell; Change and Change% update |
| AC-MB-05-03 | Active sort is by pct_change descending; VIC's pct_change changes | Tick received | VIC's row values update in-place; VIC does NOT move to a new sort position in the list |
| AC-MB-05-04 | WebSocket connection drops | User is on Price Board during market hours | Yellow banner "Dữ liệu có thể bị trễ — đang kết nối lại..." appears below exchange sub-tabs |
| AC-MB-05-05 | WS reconnects after disconnection | Reconnect succeeds | Yellow banner disappears; live tick updates resume |
| AC-MB-05-06 | WS fails all 10 reconnect attempts | After 10 attempts | Yellow banner text changes to "Không thể kết nối — hiển thị dữ liệu lần cuối"; 30-second HTTP polling begins |
| AC-MB-05-07 | Market is closed | User opens Price Board | WS is not established; no polling; "Đã đóng cửa" badge shown; last known prices displayed |

### FR-MB-06 — Watchlist Tab

| # | Given | When | Then |
|---|---|---|---|
| AC-MB-06-01 | User has 3 watchlist items (1 HOSE, 1 HNX, 1 UPCOM) | User opens Watchlist tab | 3 rows visible; each row shows exchange badge (HOSE / HNX / UPCOM) below the ticker code |
| AC-MB-06-02 | User opens Watchlist tab, has no watchlist items | Tab renders | Empty state is shown (see §9.4) |
| AC-MB-06-03 | User taps star on a watchlisted row | Watchlist tab is active | Row slides out (200ms); toast "Đã xóa [CODE] khỏi danh sách theo dõi" appears |
| AC-MB-06-04 | All rows removed from watchlist via Watchlist tab | Last item removed | Empty state appears |
| AC-MB-06-05 | WS delivers tick update for a watchlisted symbol | User is on Watchlist tab | That symbol's row updates in-place (same behavior as FR-MB-05) |

### FR-MB-07 — Watchlist Add from Price Board

| # | Given | When | Then |
|---|---|---|---|
| AC-MB-07-01 | VIC is not in watchlist; user taps hollow star on VIC row | Price Board tab | Star fills immediately (optimistic); API call fires in background; toast "Đã thêm VIC vào danh sách theo dõi" on success |
| AC-MB-07-02 | API call for add watchlist returns error | Star was filled optimistically | Star reverts to hollow; toast "Không thể cập nhật danh sách theo dõi. Thử lại." |
| AC-MB-07-03 | User has 50 watchlist items; taps star on a new stock | Price Board tab | Star does NOT fill; toast "Danh sách theo dõi đã đầy (tối đa 50 mã). Xóa một mã để thêm mới." |
| AC-MB-07-04 | User long-presses a row for 500ms | Price Board tab | Bottom sheet appears with "Xem chi tiết" and "Thêm vào danh sách theo dõi" (or "Xóa" if already added) |
| AC-MB-07-05 | User taps "Xem chi tiết" in bottom sheet | Bottom sheet is open | Bottom sheet dismisses; navigation to Stock Detail |

### FR-MB-08 — Holdings Tab

| # | Given | When | Then |
|---|---|---|---|
| AC-MB-08-01 | User holds 500 VIC at avg_cost 45.000; last_price is 47.000 | Holdings tab renders | P&L VND shows "+1.000.000 ₫" (or abbreviated "+1 Tr") in green; P&L % shows "+4.44%" in green |
| AC-MB-08-02 | User holds 100 HPG at avg_cost 30.000; last_price is 28.500 | Holdings tab renders | P&L VND shows negative value in red; P&L % shows negative % in red |
| AC-MB-08-03 | avg_cost equals last_price | Holdings tab renders | P&L VND shows "0" in fog color; P&L % shows "0.00%" in fog color |
| AC-MB-08-04 | Holdings tab renders | Any time | "TIỀN ẢO" label visible above the list in fog-muted color |
| AC-MB-08-05 | User has no open positions (virtual_holdings has no quantity > 0) | Holdings tab renders | Empty state is shown (see §9.4) |
| AC-MB-08-06 | User taps a row in Holdings tab | Any time | Navigates to Stock Detail for that symbol, pre-scrolled to trading panel |
| AC-MB-08-07 | last_price is unavailable for a held symbol (trading halt) | Holdings tab renders | P&L VND and P&L % show "N/A" in fog-muted color for that row; other rows unaffected |

### FR-MB-09 — Market Session State Badge

| # | Given | When | Then |
|---|---|---|---|
| AC-MB-09-01 | VN market is in CONT session | Price Board tab renders | Badge shows "CONT — Khớp lệnh liên tục" with lime background (#CAFD00) and ink-900 text |
| AC-MB-09-02 | VN market is in ATO session | Price Board tab renders | Badge shows "ATO — Khớp lệnh định kỳ mở cửa" with amber (#F59E0B) background |
| AC-MB-09-03 | VN market is in ATC session | Price Board tab renders | Badge shows "ATC — Khớp lệnh định kỳ đóng cửa" with amber (#F59E0B) background |
| AC-MB-09-04 | VN market is CLOSED | Price Board tab renders | Badge shows "Đã đóng cửa" with ink-600 background; "Cập nhật lần cuối: HH:mm DD/MM" shown |
| AC-MB-09-05 | User is on Watchlist tab | Market transitions from CONT to CLOSED | Session badge on Watchlist tab updates from CONT to CLOSED state |

---

## 8. Edge Cases

| # | Case | Expected Behavior |
|---|---|---|
| EC-01 | Exchange has 0 active stocks (e.g., UPCOM has no quotes in symbol_quotes_latest for current day) | Price Board sub-tab for that exchange shows: empty list with message "Không có dữ liệu giao dịch cho sàn này hôm nay." ("No trading data for this exchange today."). No skeleton; no error state. |
| EC-02 | Stock quantity in virtual_holdings is 0 for all held symbols (all positions sold) | Holdings tab shows empty state (same as never-held). Holdings are only shown for quantity > 0. |
| EC-03 | A watchlisted stock is delisted (removed from symbols table or symbol_type changes) | Watchlist tab shows the row with Code and last known price (if available); a "Đã hủy niêm yết" ("Delisted") badge appears on the row in fog-muted color. Star icon tap → removes from watchlist. Navigation to Stock Detail still works but shows delisted state per FRD-04. |
| EC-04 | User adds a stock to watchlist from Price Board while already on the Watchlist tab (in another browser tab / split-screen scenario) | Watchlist tab refreshes its list on next WebSocket tick or on tab focus. New item appears without requiring manual refresh. |
| EC-05 | ref_price is 0 or null for a symbol | Color coding cannot be applied (no baseline). Show last_price in `fog` (neutral) color. Change column shows "—". Change % shows "—". Log warning server-side. |
| EC-06 | last_price is 0 or null | Display "—" in last_price cell (fog color). Change and Change % are "—". P&L in Holdings shows "N/A" (BR-MB-09). |
| EC-07 | User has Holdings tab open; a paper trade executes (buy order fills) | Holdings tab must reflect the new position within the next tick cycle. If WS is active, the new position appears as a new row. If WS is disconnected and polling, the row appears on the next 30-second poll. There is no push notification on Holdings tab for this — the update is handled by the price tick subscription. |
| EC-08 | User scrolls Price Board to row 200 (of 400), then switches to Watchlist tab and back to Price Board | Price Board scroll position is preserved within the session. User returns to row 200. |
| EC-09 | WebSocket tick arrives for a symbol that is currently not visible (scrolled off) | Tick data is stored in the in-memory quote cache. When the user scrolls that row back into view, it renders with the latest cached price. No flash animation for off-screen updates. |
| EC-10 | Two simultaneous WebSocket ticks arrive for the same symbol within 16ms (single animation frame) | Only the most recent tick value is applied. The 300ms flash animation fires once. Intermediate values are discarded. |
| EC-11 | User taps star on a stock faster than API responds (double-tap) | Second tap is ignored while the first API call is in-flight (button debounced for the duration of the request, max 5 seconds). |
| EC-12 | User's watchlist has items but all of them have no `symbol_quotes_latest` data (e.g., market never opened for those symbols) | Watchlist tab shows rows with Code and Short Name; price columns show "—"; fog color. Session badge shows appropriate state. |
| EC-13 | User switches exchange sub-tab while search is active | Search field clears; full list for new exchange renders. This is spec'd in FR-MB-04 and AC-MB-04-06. |
| EC-14 | avg_cost in virtual_holdings is 0 (corrupted data) | P&L % would be a division-by-zero. Display "N/A" for P&L % in this case. P&L VND can still be computed as (last_price - 0) * quantity but this would be misleading; display "N/A" for both P&L columns and log an error. |
| EC-15 | Market is in ATO or ATC session; last_price is null (no matched orders yet) | Display ref_price value in the last_price column with yellow color (#EAB308, same as "unchanged"). Change shows "0"; Change % shows "0.00%". |

---

## 9. Design Requirements

### 9.1 Color System for VN Price Board

The following color tokens are SPECIFIC to the VN price board and override the general design system semantic colors for these cells only. No other surfaces in the app use these exact color assignments.

| Condition | Cell Background | Cell Text | Token Name (for implementation) |
|---|---|---|---|
| `last_price == ceiling_price` (trần) | Transparent | `#7B2FBE` | `price-ceiling` |
| `last_price == floor_price` (sàn) | Transparent | `#1D4ED8` | `price-floor` |
| `last_price > ref_price` (tăng) | Transparent | `#10B981` | `price-up` (= `positive` from design system) |
| `last_price == ref_price` (tham chiếu) | Transparent | `#EAB308` | `price-unchanged` |
| `last_price < ref_price` (giảm) | Transparent | `#EF4444` | `price-down` (= `negative` from design system) |
| `last_price == null` | Transparent | `#7A7777` | `fog-muted` |

Tick flash overlay (300ms, triggered on price change from WebSocket tick):
- Price increased: `rgba(16, 185, 129, 0.25)` background flash on the `last_price` cell
- Price decreased: `rgba(239, 68, 68, 0.25)` background flash on the `last_price` cell
- Flash animation: 0ms → full opacity → fade out over 300ms. CSS: `animation: priceFlash 300ms ease-out`

### 9.2 Typography Rules for Price Board

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| Ticker code | Space Grotesk, tabular | 13px | 700 | `white` (#FFFFFF) |
| Short name | Manrope | 12px | 400 | `fog` (#ADAAAA) |
| Price values (Ref, Last, Change, Vol) | Space Grotesk, `font-feature-settings: "tnum" 1` | 13px | 500 | Color-coded per §9.1 |
| Column header labels | Manrope | 11px | 600 | `fog-muted` (#7A7777) |
| Active column header (sorted) | Manrope | 11px | 600 | `lime` (#CAFD00) |
| Session badge text | Space Grotesk, uppercase | 11px | 600 | `ink-900` (on colored bg) or `fog` (on ink-600) |
| Index chip values | Space Grotesk, tabular | 14px | 600 | Color-coded |
| Index chip labels | Manrope | 11px | 400 | `fog` |
| "Tiền ảo" label | Space Grotesk, uppercase | 11px | 400 | `fog-muted` |
| Search placeholder | Manrope | 14px | 400 | `fog-muted` |
| Toast text | Manrope | 14px | 500 | `white` |

### 9.3 Responsive Behavior

The Market Board is designed for mobile canvas (390px baseline per design system). The following rules apply:

| Screen width | Behavior |
|---|---|
| < 390px | Horizontal scroll on tab bar (all 5 tabs reachable). Price board columns: Code + Last Price + Change % only (Short Name, Ref Price, Change VND, Volume hidden). User can expand hidden columns by rotating to landscape. |
| 390px–428px (standard mobile) | All columns visible as specified in FR-MB-02. |
| > 428px (large mobile / tablet) | All columns visible; row height increases to 56px; font sizes increase by 2px. |

On all screen widths: minimum touch target for any tappable element (row, star, column header) is 44×44px.

Column header scroll: the column header row is sticky (does not scroll with the list). The index summary strip and exchange sub-tabs are also sticky. The session badge is sticky. Scroll affects the stock rows only.

### 9.4 Empty States

**Watchlist Empty State:**
- Icon: Lucide `Star` (48px, `fog-muted` color)
- Heading: "Chưa có cổ phiếu theo dõi" ("No stocks in watchlist yet"), 18px, Space Grotesk 600, `fog`
- Body: "Thêm mã cổ phiếu bạn quan tâm để theo dõi giá nhanh hơn." ("Add stocks you're interested in to track prices faster."), 14px, Manrope 400, `fog-muted`
- CTA button: "Khám phá cổ phiếu" (KineticButton ghost variant) → taps to switch to Price Board tab

**Holdings Empty State:**
- Icon: Lucide `TrendingUp` (48px, `fog-muted` color)
- Heading: "Chưa có vị thế mở" ("No open positions"), 18px, Space Grotesk 600, `fog`
- Body: "Bắt đầu giao dịch để theo dõi vị thế của bạn tại đây." ("Start trading to track your positions here."), 14px, Manrope 400, `fog-muted`
- CTA button: "Giao dịch ngay" (KineticButton ghost variant) → navigates to Stock Detail of first item in Top 5 Gainers (from VN market data, FR-37)

**Price Board Error State (data load failure):**
- Icon: Lucide `WifiOff` (48px, `fog-muted` color)
- Heading: "Không tải được dữ liệu" ("Could not load data"), 18px, Space Grotesk 600, `fog`
- CTA: "Thử lại" (KineticButton ghost variant) → retries data fetch

### 9.5 Skeleton Loading State

Skeleton rows match the exact column layout of loaded rows. Skeleton implementation:

```css
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.skeleton-cell {
  background: linear-gradient(
    90deg,
    #1A1A1A 25%,   /* ink-700 */
    #262626 50%,   /* ink-600 */
    #1A1A1A 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

Skeleton row structure mirrors live row: Code column (56px wide skeleton block), Short Name (flex-1 skeleton block), then 5 fixed-width skeleton blocks for price columns. Star icon area shows hollow circle skeleton.

Maximum skeleton display duration: 3000ms. After 3000ms without data, replace skeleton with error state.

### 9.6 Animation Specifications

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| Price tick flash (up) | 300ms | `ease-out` | `last_price` cell background flashes rgba(16,185,129,0.25) → transparent |
| Price tick flash (down) | 300ms | `ease-out` | `last_price` cell background flashes rgba(239,68,68,0.25) → transparent |
| Watchlist row slide-out (remove) | 200ms | `ease-in` | Row slides left (translateX(-100%)) and fades (opacity 1→0) simultaneously |
| Star fill (add to watchlist) | 150ms | `ease-out` | Star outline morphs to filled; scale 1.0 → 1.2 → 1.0 |
| Tab switch content | 100ms | `ease-in-out` | Content fades in (opacity 0→1) |
| Bottom sheet appear | 250ms | `cubic-bezier(0.32,0.72,0,1)` | Sheet slides up from bottom edge |
| Session badge state change | 200ms | `ease-in-out` | Background color transition |

### 9.7 Accessibility Requirements

- All color-coded price cells must include a text-based indicator in addition to color (for colorblind users): positive values include "+" prefix; negative values include "-" prefix; ceiling includes "(T)" suffix; floor includes "(S)" suffix.
  - Example: "+2.15% (T)" for ceiling hit
  - Example: "-1.30% (S)" for floor hit
- Minimum contrast ratio for all text on colored backgrounds: 4.5:1 (WCAG AA).
  - Purple (`#7B2FBE`) on `ink-800` (`#131313`): verify at implementation — use `#9333EA` if contrast fails.
  - Blue (`#1D4ED8`) on `ink-800` (`#131313`): verify at implementation — use `#3B82F6` if contrast fails.
- Screen reader labels for star icon: `aria-label="Thêm [CODE] vào danh sách theo dõi"` (hollow) or `aria-label="Xóa [CODE] khỏi danh sách theo dõi"` (filled).
- The stock list must be implemented as a proper table element (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`) or use `role="grid"` + `role="row"` + `role="gridcell"` for accessibility.

---

## 10. Traceability Matrix

| Business Objective | FR | Acceptance Criterion | Test Case ID |
|---|---|---|---|
| BO-03: ≥60% of users create ≥1 watchlist entry in first session | FR-MB-07 (Add to Watchlist) | AC-MB-07-01 | TC-MB-07-01 |
| BO-03: Watchlist engagement | FR-MB-06 (Watchlist Tab) | AC-MB-06-01, AC-MB-06-03 | TC-MB-06-01, TC-MB-06-03 |
| BO-06: VN data ≤15s delay | FR-MB-05 (WebSocket updates) | AC-MB-05-01, AC-MB-05-06 | TC-MB-05-01, TC-MB-05-06 |
| BO-06: VN data reliability | FR-MB-09 (Session badge) | AC-MB-09-01 through AC-MB-09-05 | TC-MB-09-01 to TC-MB-09-05 |
| BO-08: ≥70% of users execute ≥1 paper trade within 3 sessions | FR-MB-08 (Holdings — navigate to trade) | AC-MB-08-06 | TC-MB-08-06 |
| BO-08: Paper trading primary loop | FR-MB-08 (Holdings P&L) | AC-MB-08-01 through AC-MB-08-04 | TC-MB-08-01 to TC-MB-08-04 |
| BR-MB-01 (VN color coding) | FR-MB-02, FR-MB-06, FR-MB-08 | AC-MB-02-07, AC-MB-02-08, AC-MB-02-09 | TC-MB-02-07 to TC-MB-02-09 |
| BR-MB-05 (Tiền ảo label) | FR-MB-08 | AC-MB-08-04 | TC-MB-08-04 |
| BR-MB-06 (Watchlist 50-item cap) | FR-MB-07 | AC-MB-07-03 | TC-MB-07-03 |
| BR-MB-07 (Server-side market hours) | FR-MB-05, FR-MB-09 | AC-MB-05-07, AC-MB-09-04 | TC-MB-05-07, TC-MB-09-04 |
| BR-MB-10 (No auto-reorder on ticks) | FR-MB-05 | AC-MB-05-03 | TC-MB-05-03 |
| BR-MB-12 (P&L is informational only) | FR-MB-08 | AC-MB-08-04 (Tiền ảo) | TC-MB-08-04 |
| FRD-06 FR-38/FR-39 (Korea/Global unchanged) | FR-MB-01 | AC-MB-01-03, AC-MB-01-04 | TC-MB-01-03, TC-MB-01-04 |
| FRD-10 §1.1 (Virtual label invariant) | FR-MB-08 | AC-MB-08-04 | TC-MB-08-04 |
| EC-03 (Delisted stock in watchlist) | FR-MB-06 | — | TC-MB-EC-03 |
| EC-05 (ref_price null) | FR-MB-02 | — | TC-MB-EC-05 |
| EC-14 (avg_cost = 0 division by zero) | FR-MB-08 | — | TC-MB-EC-14 |
| EC-15 (ATO/ATC with null last_price) | FR-MB-02, FR-MB-09 | — | TC-MB-EC-15 |

---

## 11. Related Documents

| Document | Path | Relationship |
|---|---|---|
| FRD-06: Markets Screen | `docs/business/frd/06-markets.md` | This FRD extends and partially supersedes FR-36 and FR-37; FR-38, FR-39, FR-40, FR-41 are unchanged |
| FRD-04: Stock Detail | `docs/business/frd/04-stock-detail.md` | Price Board rows navigate to Stock Detail; Holdings tab navigates to Stock Detail pre-scrolled to trading panel |
| FRD-10: Paper Trading Engine | `docs/business/frd/10-paper-trading.md` | Holdings tab data sourced from virtual_holdings; "Tiền ảo" label invariant defined in FRD-10 §1.1 |
| BRD v2.4 | `docs/business/BRD.md` | BO-03, BO-06, BO-08 are the driving business objectives |
| Design System V2.0 | `docs/design/design-system.md` | Color tokens, typography, spacing, animation conventions |
| SRD (main) | `docs/business/SRD.md` | System-level validation rules, API contracts for watchlist endpoints |
| API Specs | `docs/API Specs/paave_api_specs_detailed.md` | Watchlist API endpoints: `POST /api/v1/watchlist/items`, `DELETE /api/v1/watchlist/items/{symbolCode}` |

### Pending Dependencies

| Dependency | Owner | Blocking FRs | Status |
|---|---|---|---|
| WebSocket specification (protocol, message schema, channel naming, auth) | Backend team | FR-MB-05 (cannot fully implement without WS contract) | [PENDING: WS spec] |
| Stock Detail pre-scroll API / deep-link parameter (for Holdings row tap) | FRD-04 team | FR-MB-08 (Holdings row tap behavior) | Needs FRD-04 to confirm deep-link parameter name |

---

*Owner: Paave Product Team | Version: 1.0 — 2026-05-29*
