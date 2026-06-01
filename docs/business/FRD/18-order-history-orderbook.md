# FRD-18: Order History and Orderbook

**Version:** 1.0
**Date:** 2026-05-30
**Author:** Business Analysis Team
**Linked BRD:** BRD.md §BO-04 (Paper Trading Core Loop)
**Linked FRD:** FRD-10 (Paper Trading Engine), FRD-20 (Order Placement V2)
**Linked SRD:** SRD-order-engine-v2.3.md
**Status:** Draft — Authoritative for FRD-18

> **Purpose:** This document is the complete, standalone specification for two companion screens to the Order Placement flow (FRD-20): the Order History screen (Part A) and the Orderbook (Depth-of-Market) component (Part B). A developer reading only this file must be able to implement every layout, rule, state, and edge case without asking a question. A QA engineer must be able to derive test cases directly from the acceptance criteria tables.

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [User Flow](#2-user-flow)
3. [UX Screen States](#3-ux-screen-states)
4. [Functional Requirements — Part A: Order History](#4-functional-requirements--part-a-order-history)
5. [Functional Requirements — Part B: Orderbook](#5-functional-requirements--part-b-orderbook)
6. [Business Rules](#6-business-rules)
7. [Acceptance Criteria](#7-acceptance-criteria)
8. [Edge Cases](#8-edge-cases)
9. [Design Requirements](#9-design-requirements)
10. [Related Documents](#10-related-documents)

---

## 1. Feature Overview

### Part A — Order History Screen

| Field | Value |
|-------|-------|
| Feature | Order History |
| Module Role | Companion screen to Paper Trading Dashboard and Order Placement |
| Primary Actors | Registered user (LEARN_MODE or FULL_ACCESS); Paave backend (read-only data source) |
| Goal | Allow users to review all virtual orders placed in their active sub-account, filter by status and date, and inspect fill details per order |
| Trigger | Tap "Lịch sử lệnh" from Portfolio screen; tap "Xem chi tiết lệnh" on Order Placement confirmation; deep link from order fill push notification |
| Data Source | `virtual_orders` table + `virtual_trades` table; active sub-account only |
| Scope | All orders for the user's active sub-account across all statuses; pre-reset orders are included with a "[Trước reset]" label |

### Part B — Orderbook (Depth-of-Market)

| Field | Value |
|-------|-------|
| Feature | Orderbook — Depth-of-Market component |
| Module Role | Embedded component rendered on Stock Detail screen and Order Placement screen |
| Primary Actors | Registered user (all tiers); Paave WebSocket feed (market hours); Paave REST API (fallback / closed market) |
| Goal | Show real-time top-3 bid and ask price levels, last traded price, and the 10 most recent matched trades for a given symbol |
| Trigger | Stock Detail screen loads; Order Placement screen loads |
| Data Source | `symbol_quote_detail` table (bids/asks JSONB, top 3 levels); `symbol_quotes_latest` (last_price, ref_price, ceiling/floor); match_history JSONB from `symbol_quote_detail`; [PENDING: WS spec] WebSocket channel for live push |
| Market Hours | Market hours = HOSE/HNX 09:00–14:45 ICT (Mon–Fri, VN holidays excluded); UPCOM 09:00–15:00 ICT |
| ATO/ATC Sessions | During ATO (09:00–09:15) and ATC (14:30–14:45), orderbook renders in "Khớp lệnh định kỳ" mode (see FR-OB-05) |
| Closed Market | Shows last-known snapshot with "Dữ liệu cuối phiên" badge (see FR-OB-06) |

---

## 2. User Flow

### 2.1 Order History Entry Points and Navigation Flow

```
Entry Point A: Portfolio Screen
  └── Tap "Lịch sử lệnh" section header or CTA button
        └── Navigates to Order History Screen (full screen)

Entry Point B: Order Placement Confirmation Screen (FRD-20)
  └── Tap "Xem lịch sử lệnh" link on confirmation success screen
        └── Navigates to Order History Screen (full screen)

Entry Point C: Push Notification (order fill / cancellation)
  └── Tap notification body
        └── Deep link opens Order History Screen with the specific order row
            pre-expanded to detail view

Entry Point D: Order History Screen back navigation
  └── Tap back button or system back gesture
        └── Returns to previous screen at same scroll position
```

**Order History Screen flow (once open):**

```
Order History Screen
  │
  ├── Default state: filter = "Tất cả" (All), date = last 30 days, sorted by placed_at DESC
  │
  ├── Filter bar (always visible, sticky at top):
  │     ├── Status chip tabs: Tất cả | Đang chờ | Đã khớp | Đã huỷ | Hết hạn
  │     └── Date range picker icon  →  opens date picker bottom sheet
  │           └── User selects from/to dates → list refreshes
  │
  ├── Symbol search field (below filter bar):
  │     └── User types ticker → list filters client-side (≥ 1 character triggers filter)
  │
  ├── Order list (infinite scroll, 20 per page):
  │     └── Tap any order row
  │           └── Row expands inline to detail view
  │                 ├── Full order details section
  │                 ├── Fill history table (from virtual_trades, empty if no fills yet)
  │                 └── Order timeline
  │
  └── Pull-to-refresh gesture → reloads current filter state from API
```

### 2.2 Orderbook Integration Flow

```
Stock Detail Screen (FRD-04)
  └── Orderbook component renders in section between Key Stats and Action Buttons
        ├── Market Open:  WebSocket subscription active → live updates every price event
        ├── Market Closed: REST snapshot load → static display with "Dữ liệu cuối phiên" badge
        ├── ATO/ATC Session: renders "Khớp lệnh định kỳ" mode (no live spread, single row)
        └── Tap "Paper Trade" button → navigates to Order Placement Screen

Order Placement Screen (FRD-20)
  └── Orderbook component renders below order type selector
        ├── Same data and states as Stock Detail rendering
        └── Tapping a price level in the Orderbook → auto-fills the price input field
              in the Order Placement form with that price value (FR-OB-07)
```

---

## 3. UX Screen States

### 3.1 Order History Screen States

| State | Trigger | UI Specification |
|-------|---------|-----------------|
| Loading | Screen first opens; pull-to-refresh; filter/search change | Skeleton rows: 5 rows, each row shows grey shimmer blocks matching the list row layout (ticker placeholder 80px wide, status chip placeholder 60px wide, 2 text line placeholders). Skeleton is shown for a minimum of 200ms to prevent flash. |
| List (data present) | Data loaded successfully | Full list rendered per FR-OH-02 layout. Filter bar sticky at top. Scroll position starts at top. |
| Empty — no orders at all | User has no orders in the active sub-account | Centered illustration + text: "Bạn chưa đặt lệnh nào." + sub-text: "Đặt lệnh đầu tiên từ màn hình chi tiết cổ phiếu." + "Khám phá cổ phiếu" button (navigates to Discover screen). |
| Empty — filter returns zero results | Active filter/search has no matching orders | Centered text: "Không tìm thấy lệnh nào." + sub-text: "Thử thay đổi bộ lọc hoặc khoảng thời gian." No illustration. Filter bar remains visible so user can change filters. |
| Order row expanded (detail) | User taps an order row | Row expands inline. Expansion animation: 200ms ease-out. All other rows remain visible above and below. Tapping the same row again collapses it (toggle). Only one row can be expanded at a time; tapping a second row collapses the first and expands the second. |
| Error — initial load fails | API call fails on first open | Full-page error: icon + "Không thể tải lịch sử lệnh." + "Thử lại" button. Retry button re-triggers the initial API call. |
| Error — pagination load fails | API call for next page fails during infinite scroll | Inline error at bottom of list: "Không thể tải thêm lệnh. Thử lại." + "Thử lại" link. Does not replace existing list content. |

### 3.2 Orderbook Component States

| State | Trigger | UI Specification |
|-------|---------|-----------------|
| Loading | Component first mounts; symbol changes | Skeleton: 7 rows total (3 ask rows, 1 price row, 3 bid rows), each showing grey shimmer blocks. Skeleton matches exact column layout of the live orderbook. Match history section also shows 3 skeleton rows. |
| Live (market open, continuous session) | WebSocket connected and receiving data | Full orderbook rendered. All prices update in-place with a 300ms highlight animation on cells that change value. No stale indicator. |
| Periodic matching (ATO/ATC session) | `session` field in `symbol_quote_detail` is `ATO` or `ATC` | Orderbook renders in "Khớp lệnh định kỳ" mode per FR-OB-05. Different layout — no spread display, single "Khớp lệnh định kỳ" row in center. |
| Closed market | Market hours have ended; `session = CLOSED` | Snapshot shown with "Dữ liệu cuối phiên" badge per FR-OB-06. No WebSocket connection. No animation on cells. |
| WebSocket reconnecting | WebSocket connection dropped | Existing data remains visible. Stale indicator: amber pill "Đang kết nối lại..." shown above the orderbook. Auto-reconnects every 3 seconds for up to 10 attempts. After 10 failed attempts: transitions to Error state. |
| Error | REST snapshot fails; or WebSocket failed after 10 reconnect attempts | Inline error within the orderbook container: "Không thể tải dữ liệu sổ lệnh." + "Thử lại" button. Other sections of the parent screen remain functional. |

---

## 4. Functional Requirements — Part A: Order History

---

### FR-OH-01 — Load Order History List

**Priority:** P0

**Actor:** Registered user (LEARN_MODE or FULL_ACCESS).

**Description:**
When the user navigates to the Order History screen, the system loads all virtual orders for the user's active sub-account, sorted by `placed_at` descending (most recent first), paginated at 20 records per page. The default filter on first open is status = All and date range = last 30 calendar days (today minus 29 days at 00:00:00 UTC+7 to today 23:59:59 UTC+7). The symbol search field is empty by default.

All orders in `virtual_orders` for the active sub-account are eligible, including orders from before a portfolio reset. Pre-reset orders are tagged with a "[Trước reset]" label in the list row.

**Input:**

| Parameter | Type | Default | Constraints |
|-----------|------|---------|-------------|
| `sub_account_id` | UUID | Active sub-account | Derived from session; not user-supplied |
| `status_filter` | enum | `ALL` | One of: `ALL`, `ACTIVE`, `FILLED`, `CANCELLED`, `EXPIRED` |
| `date_from` | date (ICT) | Today − 29 days | Must be ≤ `date_to` |
| `date_to` | date (ICT) | Today | Must be ≥ `date_from`; must not be in the future |
| `symbol_search` | string | `""` (empty) | Max 10 characters; matched against `symbol_code` prefix, case-insensitive |
| `page_cursor` | string | `null` | Opaque cursor for pagination; null = first page |
| `page_size` | integer | 20 | Fixed at 20; not user-configurable |

**Status Filter Mapping:**

| UI Label | Status filter applied to `virtual_orders.status` |
|----------|-------------------------------------------------|
| Tất cả (All) | No status filter — returns all statuses |
| Đang chờ (Active) | `status IN ('PENDING', 'ACCEPTED', 'PARTIAL')` |
| Đã khớp (Filled) | `status = 'FILLED'` |
| Đã huỷ (Cancelled) | `status IN ('CANCELLED', 'REJECTED')` |
| Hết hạn (Expired) | `status = 'EXPIRED'` |

**Output:**

| Field | Source | Notes |
|-------|--------|-------|
| `orders[]` | `virtual_orders` | Array of order summary objects (see FR-OH-02 for display fields) |
| `next_cursor` | Pagination system | `null` when no more pages |
| `total_count` | Count query | Integer; total matching orders for display "X lệnh" |

**Precondition:**
- User is authenticated with a valid session
- Active sub-account exists

**Postcondition:**
- Order list rendered; no data mutation

---

### FR-OH-02 — Order List Row Display

**Priority:** P0

**Actor:** Registered user.

**Description:**
Each order in the list renders as a single row. The row layout is fixed — no user customization. All monetary values are formatted per VND standard: period thousand separator, no decimals, dong symbol after a space (`1.250.000 ₫`). Rows are touch targets: minimum 48pt height.

**Order Row Layout (left to right, top to bottom):**

| Element | Source | Format | Notes |
|---------|--------|--------|-------|
| Ticker symbol | `symbol_code` | Bold, all-caps, 16sp | e.g., "VIC" |
| Exchange chip | `exchange` | Coloured chip, 11sp | "HOSE" (blue), "HNX" (green), "UPCOM" (orange) |
| Order type label | `order_type` | Regular, 12sp, grey | See order type label mapping below |
| "[Trước reset]" label | `parent_order_id` or metadata flag | Amber chip, 10sp | Shown only for orders placed before a portfolio reset; hidden otherwise |
| Side pill | `side` | Filled pill: "MUA" (BUY) or "BÁN" (SELL) | BUY: green pill (#4CAF50 fill, white text); SELL: red pill (#F44336 fill, white text) |
| Quantity | `quantity` | Integer, right-aligned | "100 CP" (100 shares) |
| Price | `price` | VND format, right-aligned | If `order_type = 'MP'`: display "Giá thị trường" instead of a price value |
| Status chip | `status` | Coloured chip, 11sp | See status chip color system in §9 |
| `placed_at` | `placed_at` | Relative if < 24h ago; absolute if ≥ 24h | "2 giờ trước" / "28/05/2026 09:34" — ICT timezone |
| T+2 label | `side` + order status | Small amber label | Shown only on SELL orders with `status = 'FILLED'`; text: "T+2" with tooltip: "Tiền về sau T+2 ngày giao dịch" |

**Order Type Label Mapping:**

| `order_type` value | Display label |
|-------------------|---------------|
| `LO` | Lệnh giới hạn |
| `MP` | Lệnh thị trường |
| `ATO` | Lệnh ATO |
| `ATC` | Lệnh ATC |
| `STOP_LIMIT` | Lệnh dừng-giới hạn |
| `STOP` | Lệnh dừng |

**Precondition:** Order list is loaded (FR-OH-01 complete).

**Postcondition:** No state change; read-only display.

---

### FR-OH-03 — Order History Filter: Status Tabs

**Priority:** P0

**Actor:** Registered user.

**Description:**
A horizontal scrollable chip tab bar is rendered below the screen header, above the symbol search field. The bar contains 5 chips: "Tất cả", "Đang chờ", "Đã khớp", "Đã huỷ", "Hết hạn". The active chip is visually distinguished (filled background, white text). Tapping a chip applies the corresponding status filter and reloads the list from page 1. The currently active filter chip persists until the user changes it or closes the screen.

The tab bar is horizontally scrollable if all chips do not fit on screen. On a 375pt-wide screen, all 5 chips must be visible without scrolling (chip max-width: 80pt each; horizontal padding: 8pt per chip).

**Input:** User tap on a status chip.

**Output:** List reloads with the selected status filter. `total_count` updates. Scroll position resets to top. Pagination cursor resets to null (first page).

**Precondition:** Order History screen is open.

**Postcondition:** Active filter chip shows the selected status. List reflects filtered results.

---

### FR-OH-04 — Order History Filter: Date Range Picker

**Priority:** P1

**Actor:** Registered user.

**Description:**
A calendar icon button is rendered to the right of the status tab bar. Tapping it opens a bottom sheet date range picker. The picker shows two calendar months (current and previous). The user selects a start date and an end date by tapping. The maximum selectable date range is 90 calendar days (`date_to − date_from ≤ 89`). Dates in the future cannot be selected. After both dates are selected, a "Áp dụng" (Apply) button activates. Tapping "Áp dụng" closes the sheet and reloads the list with the new date range. Tapping outside the sheet or the "X" close button discards the selection and keeps the previous date range.

The selected date range is displayed as a compact label next to the calendar icon: "28/04 – 28/05" (day/month format). If the range is the default (last 30 days), the label reads "30 ngày qua".

**Input:**

| Field | Type | Constraints |
|-------|------|-------------|
| `date_from` | date | Must be ≤ `date_to`; must not be in the future |
| `date_to` | date | Must be ≥ `date_from`; must not be in the future |

**Validation (inline in the date picker):**

| Condition | Error shown in picker |
|-----------|-----------------------|
| `date_to − date_from > 89 days` | "Khoảng thời gian tối đa là 90 ngày." shown below calendar; "Áp dụng" button disabled |
| `date_from > date_to` | "Ngày bắt đầu phải trước ngày kết thúc." shown below calendar; "Áp dụng" button disabled |
| Either date is in the future | Future dates are greyed out and not tappable; no error message needed |

**Output:** Date range label updates. List reloads from page 1 with new date filter. Pagination cursor resets to null.

**Precondition:** Order History screen is open.

**Postcondition:** Date range filter applied. Calendar icon label shows selected range.

---

### FR-OH-05 — Order History Filter: Symbol Search

**Priority:** P1

**Actor:** Registered user.

**Description:**
A text input field labelled "Tìm cổ phiếu..." is rendered below the date range row. As the user types, the list filters client-side against `symbol_code` using prefix matching, case-insensitive. Filtering is applied from the 1st character typed. If the search field is cleared (user deletes all characters or taps the "X" clear button inside the field), the full list for the current status + date filter is shown. Symbol search and status/date filters are composable: all three filters apply simultaneously.

Symbol search filters within the already-loaded pages only. If the user has scrolled and loaded multiple pages, the search filters within all loaded records. This means the user may need to load all pages before the search is comprehensive — this limitation is acceptable in V1 (document in-app as: "Tìm kiếm trong các lệnh đã tải. Kéo xuống để tải thêm.").

**Input:** Text typed in the search field (max 10 characters; excess characters are not accepted).

**Output:** List filters to show only rows where `symbol_code` starts with the typed string (case-insensitive). If no rows match: shows the "Không tìm thấy lệnh nào" empty state (§3.1).

**Precondition:** Order History screen is open with at least one page loaded.

**Postcondition:** No server call triggered by symbol search. Filter applied client-side only.

---

### FR-OH-06 — Order Detail — Expanded View

**Priority:** P0

**Actor:** Registered user.

**Description:**
Tapping an order row in the list expands the row inline to show a three-section detail panel beneath the summary row. The expansion is a smooth vertical slide animation (200ms ease-out). Only one row can be expanded at a time. Tapping the expanded row again collapses it to the summary-only display. Tapping a different row collapses the currently expanded row and expands the tapped one.

**Expanded detail panel — Section 1: Order Details**

| Field | Source | Display Format |
|-------|--------|----------------|
| Mã lệnh (Order ID) | `id` | Last 8 characters of UUID, prefixed: "#" + last 8 chars |
| Loại lệnh | `order_type` | Full Vietnamese label (see order type label mapping in FR-OH-02) |
| Phía | `side` | "Mua" / "Bán" with side pill color |
| Khối lượng đặt | `quantity` | Integer + " cổ phiếu" |
| Khối lượng khớp | `filled_quantity` | Integer + " cổ phiếu"; "0 cổ phiếu" if no fill yet |
| Giá đặt | `price` | VND format; "Giá thị trường" if `order_type = 'MP'` |
| Giá dừng | `stop_price` | VND format; row hidden if `stop_price IS NULL` |
| Giá khớp trung bình | `avg_fill_price` | VND format; "—" if `filled_quantity = 0` |
| Sàn giao dịch | `exchange` | "HOSE" / "HNX" / "UPCOM" |
| Trạng thái | `status` | Full Vietnamese status label + status chip (see §9) |
| Lý do từ chối | `reject_reason` | Shown only if `status = 'REJECTED'`; row hidden otherwise |
| T+2 note | Derived | Shown only on SELL orders with `status = 'FILLED'`: "Tiền về tài khoản sau T+2 ngày giao dịch" in amber text |

**Expanded detail panel — Section 2: Fill History**

This section is only rendered if `virtual_trades` contains records for this `order_id`. If there are no fill records, this section is hidden entirely (no empty state shown — the absence of the section communicates no fills yet).

Fill history table header: "Lịch sử khớp lệnh"

| Column | Source | Format |
|--------|--------|--------|
| Thời gian | `executed_at` | "HH:mm:ss dd/MM/yyyy" ICT |
| Khối lượng | `quantity` | Integer |
| Giá khớp | `price` | VND format |
| Phí | `fees` | VND format |
| Thuế | `tax` | VND format |

Rows sorted by `executed_at` ascending (earliest fill first). Maximum 50 fill rows shown; if more than 50: last row shows "Xem thêm ([N] khớp)" which opens a separate full-screen fill history detail (out of V1 scope; V1 cap: 50 rows).

**Expanded detail panel — Section 3: Order Timeline**

A vertical timeline with icons and timestamps, showing the lifecycle of the order.

| Event | Shown when | Timestamp source | Label |
|-------|------------|-----------------|-------|
| Đã đặt lệnh | Always | `placed_at` | "Đã đặt lệnh" |
| Sàn nhận lệnh | `status != 'REJECTED'` | `placed_at` + ≤2s (simulated) | "Sàn giao dịch đã nhận lệnh" |
| Khớp một phần | `filled_quantity > 0 AND status = 'PARTIAL'` | First `virtual_trades.executed_at` for this order | "Khớp [N] cổ phiếu tại [price] ₫" |
| Đã khớp hoàn toàn | `status = 'FILLED'` | `matched_at` | "Đã khớp đầy đủ [quantity] cổ phiếu tại [avg_fill_price] ₫" |
| Đã huỷ | `status = 'CANCELLED'` | `cancelled_at` | "Lệnh đã bị huỷ" |
| Từ chối | `status = 'REJECTED'` | `placed_at` | "Lệnh bị từ chối: [reject_reason]" |
| Hết hạn | `status = 'EXPIRED'` | `cancelled_at` | "Lệnh hết hạn" |

Timeline items are rendered top-to-bottom in chronological order. Each item shows a circle icon (filled = completed, hollow = pending). The most recent event has a colored icon matching the final status chip color.

**Precondition:** Order list is loaded; user has tapped a row.

**Postcondition:** Expanded view renders below the tapped row. Page scroll adjusts to bring the expanded row into view if it is partially off-screen.

---

### FR-OH-07 — Pull-to-Refresh

**Priority:** P1

**Actor:** Registered user.

**Description:**
The user can pull the list down from the top (overscroll gesture) to trigger a full refresh. The refresh reloads the first page of orders with the currently active filter and date range. The pull-to-refresh spinner appears during the load. Any expanded detail row collapses on refresh. The pagination cursor resets to null. Previously loaded pages beyond page 1 are discarded; the list resets to showing only the first 20 results.

**Input:** Pull-down overscroll gesture.

**Output:** List reloads from page 1. Spinner shown during load. On completion: spinner hides; list updates.

**Precondition:** Order History screen is open with the list in the default or loaded state.

**Postcondition:** List shows latest data. Any previously expanded row is collapsed.

---

### FR-OH-08 — Infinite Scroll Pagination

**Priority:** P1

**Actor:** Registered user.

**Description:**
When the user scrolls to within 3 rows of the bottom of the currently loaded list, the system automatically loads the next page (next 20 records) using the cursor-based pagination token (`next_cursor` from the previous response). A loading spinner is shown below the last row during the load. New rows are appended to the bottom of the list. The currently expanded detail row (if any) is not affected by pagination loads. When `next_cursor = null` (no more pages), the loading spinner is replaced with a footer: "Đã hiển thị tất cả [N] lệnh." (N = total_count).

**Input:** User scrolls to within 3 rows of bottom.

**Output:** Next 20 records appended. Spinner shown then hidden. Footer shown when list exhausted.

**Precondition:** `next_cursor` is not null; no in-flight pagination request is active.

**Postcondition:** List extended. `next_cursor` updated to new token or null.

---

## 5. Functional Requirements — Part B: Orderbook

---

### FR-OB-01 — Orderbook Component Layout

**Priority:** P0

**Actor:** Registered user (all tiers).

**Description:**
The Orderbook is a fixed-width, fixed-height component (100% parent container width; height = content-determined, with a maximum height of 320pt before scrolling the match history section). It renders three distinct zones stacked vertically:

**Zone 1 — Ask Side (Giá bán / Sell side) — top**
3 rows, one per ask level, ordered from lowest ask at the bottom to highest ask at the top. The row closest to the center price is ask level 1 (lowest/best ask).

**Zone 2 — Center Price Bar — middle**
A single row showing last traded price and change from reference price.

**Zone 3 — Bid Side (Giá mua / Buy side) — bottom**
3 rows, one per bid level, ordered from highest bid at the top to lowest bid at the bottom. The row closest to the center price is bid level 1 (highest/best bid).

**Zone 4 — Match History — below Zone 3**
A scrollable list of the 10 most recent matched trades.

**Column layout for Zones 1 and 3 (per row):**

| Column | Width | Content | Alignment |
|--------|-------|---------|-----------|
| Khối lượng (Volume) | 33% | `volume` from bids/asks JSONB | Right-aligned |
| Giá (Price) | 34% | `price` from bids/asks JSONB | Center-aligned |
| Khối lượng (Volume) — mirrored for asks | 33% | `volume` from asks JSONB (Zone 1 only) | Left-aligned |

Note: Bid rows show volume in the left column and price in the center. Ask rows mirror this: price in center, volume in the right column. This creates a symmetrical depth display around the center price.

**Data source:**

| Field | Source table | Source column |
|-------|-------------|---------------|
| Bid levels (top 3) | `symbol_quote_detail` | `bids` JSONB array: `bids[0]` = best bid, `bids[1]` = second, `bids[2]` = third |
| Ask levels (top 3) | `symbol_quote_detail` | `asks` JSONB array: `asks[0]` = best ask, `asks[1]` = second, `asks[2]` = third |
| Last price | `symbol_quotes_latest` | `last_price` |
| Reference price | `symbol_quotes_latest` | `ref_price` |
| Ceiling price | `symbol_quotes_latest` | `ceiling_price` |
| Floor price | `symbol_quotes_latest` | `floor_price` |
| Match history | `symbol_quote_detail` | `match_history` JSONB array, last 10 entries |

**Precondition:** Parent screen (Stock Detail or Order Placement) is loaded with a valid `symbol_code`.

**Postcondition:** Orderbook component renders; WebSocket subscription initiated if market is open.

---

### FR-OB-02 — Price Color Coding for Orderbook

**Priority:** P0

**Actor:** System (renders prices with correct color).

**Description:**
All prices displayed in the Orderbook (bid prices, ask prices, last price, match history prices) must be colored according to the Vietnamese stock exchange color standard. The color is determined by comparing each price to `ref_price` (reference price = previous session closing price) and the ceiling/floor limits.

**VN Price Color Rules:**

| Condition | Color | Hex | Semantic label |
|-----------|-------|-----|----------------|
| `price = ceiling_price` | Violet/Purple | `#AA00FF` | Trần (Ceiling) |
| `price = floor_price` | Cyan/Teal | `#00BCD4` | Sàn (Floor) |
| `price > ref_price` | Green | `#4CAF50` | Tăng (Up) |
| `price < ref_price` | Red | `#F44336` | Giảm (Down) |
| `price = ref_price` | Yellow/Amber | `#FFC107` | Tham chiếu (Reference) |

**Precedence:** Ceiling check is evaluated first; floor check second; then comparison to ref_price. A price equal to the ceiling is always violet, even if it is also above ref_price.

**Application scope:** This color rule applies to every price value rendered in the Orderbook component AND in the Match History section. It does not apply to volume figures (volume is always white/neutral).

**Precondition:** `ref_price`, `ceiling_price`, and `floor_price` are loaded from `symbol_quotes_latest`.

**Postcondition:** Every price value in the Orderbook has the correct color applied.

---

### FR-OB-03 — Real-Time Updates via WebSocket

**Priority:** P0

**Actor:** Paave WebSocket feed; Orderbook component.

**Description:**
During market hours (HOSE/HNX 09:00–14:45 ICT; UPCOM 09:00–15:00 ICT), the Orderbook component subscribes to a WebSocket channel for the active symbol. When new data is received, the component updates bid/ask levels and the match history in-place without re-mounting the component.

**Update behavior:**

| Event | Update behavior |
|-------|----------------|
| Bid/ask level price or volume changes | Cell value updates; the changed cell shows a 300ms highlight animation (background flashes to a lighter version of the cell's background color, then fades back) |
| New match trade added to match history | New row prepended at top of match history; oldest row (row 11) removed; slide-in animation 200ms |
| Last price changes | Center price bar updates; color updates per FR-OB-02 rules |

**[PENDING: WS spec]** The exact WebSocket channel name, message format (JSON schema), authentication token required for the WS connection, reconnection protocol, and heartbeat interval are not yet defined. This document marks this as `[PENDING: WS spec]`. Implementation is blocked until the WebSocket specification is delivered. The REST snapshot fallback (FR-OB-04) must be implemented first and must remain functional as a fallback when WebSocket is unavailable.

**Connection lifecycle:**

| Event | System action |
|-------|--------------|
| Screen opens during market hours | Open WebSocket connection; subscribe to `symbol_quote_detail` channel for active symbol |
| Symbol changes (user navigates to different stock detail) | Unsubscribe from previous symbol channel; subscribe to new symbol channel |
| Screen goes to background (app backgrounded) | Maintain connection for 30 seconds; disconnect after 30 seconds of backgrounding |
| App returns to foreground | If disconnected: reconnect and load REST snapshot; if connected: resume normally |
| WebSocket drops | Attempt reconnect every 3 seconds, up to 10 attempts; show "Đang kết nối lại..." indicator; after 10 failed attempts: show error state (§3.2) |

**Precondition:** Market is open. Symbol is valid. [PENDING: WS authentication mechanism defined].

**Postcondition:** Orderbook shows real-time data. Connection closed cleanly on screen exit.

---

### FR-OB-04 — REST Snapshot Fallback

**Priority:** P0

**Actor:** System; Orderbook component.

**Description:**
The Orderbook loads initial data via a REST API call to `GET /api/v1/market/orderbook/{symbol}` (or equivalent endpoint — defer to API spec). This call is always made on component mount, regardless of WebSocket availability. The REST response populates the component while the WebSocket connection is being established. After WebSocket connects, live updates override the REST snapshot data.

If the market is closed, only the REST snapshot is used (no WebSocket connection opened). The REST snapshot reflects the last state of the orderbook at market close.

**REST call parameters:**

| Parameter | Value |
|-----------|-------|
| `symbol` | Active symbol code (e.g., "VIC") |
| `exchange` | Exchange code (e.g., "HOSE") |
| `depth` | `3` (top 3 bid/ask levels only) |

**REST response fields expected:**

| Field | Type | Notes |
|-------|------|-------|
| `bids` | Array of `{price, volume}` | 3 entries maximum |
| `asks` | Array of `{price, volume}` | 3 entries maximum |
| `last_price` | integer | VND, no decimals |
| `ref_price` | integer | VND |
| `ceiling_price` | integer | VND |
| `floor_price` | integer | VND |
| `match_history` | Array of `{time, price, volume, side}` | Last 10 entries |
| `session` | string | `CONTINUOUS`, `ATO`, `ATC`, `CLOSED`, `LUNCH_BREAK` |
| `quote_time` | ISO 8601 UTC timestamp | Time of the snapshot |

**Error handling:** If the REST call returns a non-200 response or times out after 5 seconds: component shows the error state (§3.2).

**Precondition:** Symbol code is known. API is reachable.

**Postcondition:** Component populated with snapshot data. Loading state cleared.

---

### FR-OB-05 — ATO and ATC Session Mode

**Priority:** P0

**Actor:** System.

**Description:**
During the ATO session (HOSE/HNX 09:00–09:15 ICT) and ATC period (HOSE/HNX 14:30–14:45 ICT), the exchange uses periodic (auction) matching — there is no continuous bid/ask spread. The standard 3-bid / 3-ask display does not apply during these sessions.

When `session = 'ATO'` or `session = 'ATC'` (from `symbol_quote_detail.session`), the Orderbook component switches to a special layout:

**ATO/ATC mode layout:**

Zones 1 and 3 (bid/ask tables) are hidden. Zone 2 (center bar) is replaced with a single centered banner:

```
┌──────────────────────────────────────────┐
│       Khớp lệnh định kỳ                  │
│   [ATO định giá mở cửa / ATC định giá    │
│         đóng cửa]                        │
│  Giá tham chiếu: [ref_price] ₫           │
└──────────────────────────────────────────┘
```

- "Khớp lệnh định kỳ" is the heading (14sp, bold, amber color `#FFC107`)
- Sub-text for ATO: "Đang khớp lệnh định giá mở cửa (09:00–09:15)"
- Sub-text for ATC: "Đang khớp lệnh định giá đóng cửa (14:30–14:45)"
- Reference price row: "Giá tham chiếu: [ref_price] ₫" (formatted VND, amber color)

Zone 4 (Match History) remains visible and active in ATO/ATC mode.

When the session transitions from ATO to Continuous (at 09:15) or from ATC to Closed (at 14:45), the component automatically switches back to the standard 3-bid/3-ask layout (or closed state) without requiring user action.

**Precondition:** `session` field from data source equals `ATO` or `ATC`.

**Postcondition:** Orderbook renders in periodic matching mode. Bid/ask tables hidden. Session banner displayed.

---

### FR-OB-06 — Closed Market Mode

**Priority:** P0

**Actor:** System.

**Description:**
When the market is closed (`session = 'CLOSED'` or current time is outside market hours for the symbol's exchange), the Orderbook renders in closed-market mode.

**Closed market mode behavior:**

1. WebSocket connection is NOT opened.
2. REST snapshot is loaded once on component mount; no auto-refresh.
3. A "Dữ liệu cuối phiên" (End-of-session data) badge is rendered in the top-right corner of the Orderbook component. The badge is: grey background (`#616161`), white text, 10sp, pill shape.
4. All price colors still apply per FR-OB-02 rules (colors reflect the last session's closing comparison).
5. The center price bar shows: last traded price (colored per FR-OB-02) + change from ref_price in VND and percentage ("±X.XX%").
6. Match history shows the last 10 trades from the previous session.
7. No "Đang kết nối lại..." indicator is shown (closed market is not a connection error).

**Precondition:** Exchange is closed for the symbol's market. REST snapshot has been loaded.

**Postcondition:** Static display showing last-session data. "Dữ liệu cuối phiên" badge visible.

---

### FR-OB-07 — Price Level Tap to Auto-Fill (Order Placement Screen Only)

**Priority:** P1

**Actor:** Registered user.

**Description:**
When the Orderbook component is rendered on the Order Placement screen (FRD-20), each price cell in Zones 1 and 3 is a tappable touch target (minimum 44pt height, full row width). Tapping a bid or ask price row copies that price value into the limit price input field in the Order Placement form above the Orderbook.

This behavior is ONLY active on the Order Placement screen. On the Stock Detail screen, price rows are display-only and not tappable (no visual affordance for tap, no highlight on press).

**Input:** User tap on a price row in Zones 1 or 3 of the Orderbook (Order Placement context only).

**Output:**
- Limit price input field in the Order Placement form is populated with the tapped price value.
- The order type selector switches to "Lệnh giới hạn (LO)" if not already selected.
- The price input field receives keyboard focus with a scroll to bring the field into view.
- A brief haptic feedback pulse (light impact) is triggered on iOS.

**Precondition:** Orderbook is rendered on Order Placement screen. Market is open (ATO/ATC mode excluded — no price rows visible in those modes).

**Postcondition:** Limit price field shows the tapped price. User can edit the pre-filled value before submitting.

---

### FR-OB-08 — Match History Display

**Priority:** P0

**Actor:** System.

**Description:**
Below the bid/ask orderbook (Zone 4), a section labelled "Khớp lệnh gần nhất" displays the 10 most recent matched trades from `symbol_quote_detail.match_history`.

**Match history row layout:**

| Column | Source | Format | Width |
|--------|--------|--------|-------|
| Thời gian | `match_history[i].time` | "HH:mm:ss" ICT | 30% |
| Giá | `match_history[i].price` | VND format, colored per FR-OB-02 | 40% |
| Khối lượng | `match_history[i].volume` | Integer | 30% |

The `side` field from match_history (if present) is used to color the volume column: BUY side = green (`#4CAF50`); SELL side = red (`#F44336`); if `side` is absent or ambiguous = white/neutral.

Rows are ordered by time descending (most recent at top). The section is non-scrollable (exactly 10 rows shown; no "load more"). If `match_history` has fewer than 10 entries: only available entries are shown; no filler rows.

**Precondition:** `match_history` data is available from the REST snapshot or WebSocket update.

**Postcondition:** Match history section renders with up to 10 rows.

---

## 6. Business Rules

### Business Rules — Order History

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-OH-01 | Order History must display only orders belonging to the user's active sub-account. Orders from other sub-accounts are never shown, regardless of the same user ID. | If `sub_account_id` in the request does not match the authenticated user's active sub-account: return HTTP 403. Never return empty list; always validate ownership. |
| BR-OH-02 | All monetary values (price, avg_fill_price, fees, tax) are formatted as: period thousand separator, no decimals, dong symbol after a space. Example: "1.250.000 ₫". | Unformatted values or decimal values are a P2 display bug; report to QA. |
| BR-OH-03 | Status labels in the Order History are always shown in Vietnamese, regardless of the user's language setting. English and Korean labels are not used in the Order History screen. | Showing English or Korean status labels is a P2 bug. |
| BR-OH-04 | Pre-reset orders are included in the Order History list. They must carry the "[Trước reset]" amber chip label. This label cannot be dismissed or hidden. | Missing "[Trước reset]" label on a pre-reset order is a P2 bug. |
| BR-OH-05 | SELL orders with `status = 'FILLED'` must display a "T+2" label on the list row and in the detail view, with a tooltip: "Tiền về tài khoản sau T+2 ngày giao dịch". This label communicates that proceeds from a sell are not immediately available — T+2 settlement applies in VN markets. This is a display label only; it does not block any action. | Missing T+2 label on a filled SELL order is a P2 bug. |
| BR-OH-06 | The date range filter maximum is 90 calendar days. The user must not be able to select a date range exceeding 89 days (date_to − date_from ≤ 89). | Displaying orders outside the selected date range is a P1 bug. Allowing selection of > 90 days in the date picker without an error is a P2 bug. |
| BR-OH-07 | The `reject_reason` field from `virtual_orders` is shown verbatim in the order detail expanded view. If `reject_reason` is null or empty and `status = 'REJECTED'`, display: "Không có thông tin lý do từ chối." | Showing null or empty string in the reject_reason field is a P2 display bug. |
| BR-OH-08 | The Order History screen is read-only. No order modification, cancellation, or re-submission action is available from this screen. | Any interactive element that triggers an order mutation from the Order History screen is a P0 bug. |

### Business Rules — Orderbook

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-OB-01 | Price color coding (FR-OB-02) is mandatory for all prices in the Orderbook and Match History. Neutral/white pricing is not acceptable for any price value that can be compared to ref_price. | Incorrect price color is a P1 bug. Missing price color on any price cell is a P1 bug. |
| BR-OB-02 | The Orderbook shows exactly 3 bid levels and 3 ask levels during Continuous Session. If the live data has fewer than 3 levels on either side (thin book), the available levels are shown and missing rows are shown as "—" (double dash, center-aligned, grey text) in both price and volume columns. | Showing more than 3 levels on either side is a P1 bug. Showing 0 rows with an error when data has 1 or 2 levels is a P2 bug. |
| BR-OB-03 | During ATO and ATC sessions, the bid/ask table is hidden and replaced with the "Khớp lệnh định kỳ" banner. Showing bid/ask rows during an auction session is a P1 bug. | Show "Khớp lệnh định kỳ" banner as specified in FR-OB-05. |
| BR-OB-04 | The "Dữ liệu cuối phiên" badge must appear whenever the market is closed and the Orderbook is displaying last-session data. The badge is non-dismissible. Missing this badge when the market is closed is a P1 bug. | Badge must be present and visible at all times during closed-market state. |
| BR-OB-05 | The price auto-fill behavior (FR-OB-07) is only active on the Order Placement screen. It must not be active on the Stock Detail screen. Triggering a price fill from Stock Detail is a P2 bug. | No tap highlight or form fill on Stock Detail price rows. |
| BR-OB-06 | The Orderbook must not be shown for KR or Global reference-market stocks in V1. If `exchange` is not one of `HOSE`, `HNX`, `UPCOM`: the Orderbook component is not rendered; that section of the Stock Detail and Order Placement screens shows nothing (no placeholder, no "not available" message — simply absent). | Rendering the Orderbook for KR or Global stocks is a P2 bug. |
| BR-OB-07 | The Orderbook component is a shared component used in both Stock Detail and Order Placement screens. The component receives a `context` prop that controls whether tap-to-fill (FR-OB-07) is active. Allowed values: `'detail'` (no tap-to-fill) and `'order-placement'` (tap-to-fill active). | Using two separate implementations is a P2 code quality issue to resolve in the next sprint. |

---

## 7. Acceptance Criteria

### Order History Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| AC-OH-01 | User has 25 orders in active sub-account (all statuses); default date range (last 30 days) covers all 25 | Order History screen opens | Loading skeleton shown; then list renders 20 rows; "5 lệnh" pagination indicator; `next_cursor` not null |
| AC-OH-02 | User has 0 orders in active sub-account | Order History screen opens | Empty state renders: "Bạn chưa đặt lệnh nào." + "Khám phá cổ phiếu" button |
| AC-OH-03 | User has 5 BUY and 5 SELL orders with all statuses; user taps "Đã khớp" chip | Filter applied | List shows only orders with `status = 'FILLED'`; non-filled orders disappear; total_count updates |
| AC-OH-04 | User has orders for VIC and HPG; user types "V" in symbol search | Search applied | List immediately filters to VIC orders only; HPG orders not shown |
| AC-OH-05 | User taps order row for a FILLED BUY order | Row expanded | Detail panel shows all fields from FR-OH-06 Section 1; fill history table shows correct fill records from `virtual_trades`; timeline shows "Đã đặt lệnh" → "Sàn giao dịch đã nhận lệnh" → "Đã khớp hoàn toàn" events |
| AC-OH-06 | User taps order row for a REJECTED order | Row expanded | Detail panel shows `reject_reason` field with the reject text; timeline shows "Đã đặt lệnh" → "Từ chối: [reason]" |
| AC-OH-07 | User has a FILLED SELL order | Row visible in list | "T+2" amber label visible on that row; tooltip reads "Tiền về tài khoản sau T+2 ngày giao dịch" |
| AC-OH-08 | User has a pre-reset order (order placed before a portfolio reset) | Order visible in list | "[Trước reset]" amber chip displayed on that row |
| AC-OH-09 | User is on page 1 (20 rows loaded); user scrolls to row 18 | Scroll triggers | System initiates load of page 2; loading spinner appears below row 20; rows 21–40 appended |
| AC-OH-10 | User is on last page (total_count = 35; page 2 loaded) | All rows visible | Footer: "Đã hiển thị tất cả 35 lệnh." No further loading |
| AC-OH-11 | User pulls down on the list | Pull-to-refresh triggered | Spinner shown; list reloads from page 1; any expanded row collapses |
| AC-OH-12 | API returns HTTP 500 on initial load | Screen opens | Full-page error: "Không thể tải lịch sử lệnh." + "Thử lại" button |
| AC-OH-13 | User selects date range of 91 days in the date picker | "Áp dụng" button state | "Khoảng thời gian tối đa là 90 ngày." error shown; "Áp dụng" button is disabled and cannot be tapped |
| AC-OH-14 | Two rows are tapped in sequence: first row A, then row B | Row B tapped | Row A collapses; Row B expands; only one row is expanded at any time |
| AC-OH-15 | User views STOP_LIMIT order detail | Row expanded | Detail panel shows `stop_price` field with correct value; "Lệnh dừng-giới hạn" label in order type field |
| AC-OH-16 | User views an order with `order_type = 'MP'` | Row visible | Price field in list row shows "Giá thị trường"; in detail panel, Giá đặt row shows "Giá thị trường" |

### Orderbook Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| AC-OB-01 | Market is open (continuous session); VIC on HOSE | Stock Detail screen loads | Orderbook shows 3 ask rows and 3 bid rows; center bar shows last_price; match history shows up to 10 rows |
| AC-OB-02 | VIC last_price = 45,000; ref_price = 43,000; ceiling = 46,010; floor = 39,990 | Orderbook renders | last_price displayed in green (#4CAF50); if ask shows 46,010 → violet (#AA00FF); if bid shows 39,990 → cyan (#00BCD4); a price at 43,000 → amber (#FFC107) |
| AC-OB-03 | Market is open; WebSocket delivers a price update for ask level 1 | Update received | Ask level 1 cell value updates; the changed cell shows 300ms highlight animation; no full component re-mount |
| AC-OB-04 | Session transitions to ATO at 09:00 ICT | Session field changes to `ATO` | Bid/ask tables hidden; "Khớp lệnh định kỳ" banner shown with sub-text "Đang khớp lệnh định giá mở cửa (09:00–09:15)"; ref_price displayed in banner |
| AC-OB-05 | Session transitions to ATC at 14:30 ICT | Session field changes to `ATC` | Bid/ask tables hidden; "Khớp lệnh định kỳ" banner shown with sub-text "Đang khớp lệnh định giá đóng cửa (14:30–14:45)" |
| AC-OB-06 | Market is closed (session = CLOSED) | Orderbook renders | "Dữ liệu cuối phiên" grey badge visible in top-right corner; no "Đang kết nối lại..." indicator; no WebSocket connection initiated |
| AC-OB-07 | Orderbook on Order Placement screen; user taps ask level 1 row at price 45,200 | Tap on price row | Limit price input field shows "45.200"; order type switches to "Lệnh giới hạn (LO)"; price field receives focus; haptic feedback on iOS |
| AC-OB-08 | Orderbook on Stock Detail screen; user taps ask level 1 row | Tap on price row | Nothing happens; no form field is filled; no visual tap feedback |
| AC-OB-09 | Book has only 2 bid levels available (thin book); asks have 3 levels | Orderbook renders | 3 ask rows render normally; bid shows 2 data rows + 1 row with "—" in price and volume columns |
| AC-OB-10 | Exchange is KOSPI (KR market) | Stock Detail opens | Orderbook component is NOT rendered; that section is absent; no placeholder text |
| AC-OB-11 | WebSocket connection drops during continuous session | Connection lost | "Đang kết nối lại..." amber pill appears above orderbook; existing data remains visible; reconnect attempted every 3 seconds |
| AC-OB-12 | WebSocket fails to reconnect after 10 attempts | All reconnect attempts exhausted | "Đang kết nối lại..." replaced with error state: "Không thể tải dữ liệu sổ lệnh." + "Thử lại" button |
| AC-OB-13 | A new match trade occurs during continuous session | WebSocket match event received | New trade row prepended at top of match history; row 11 removed; slide-in animation 200ms |
| AC-OB-14 | REST snapshot call times out (5 seconds) | Timeout | Orderbook shows error state: "Không thể tải dữ liệu sổ lệnh." + "Thử lại" button |

---

## 8. Edge Cases

### Order History Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Order has `filled_quantity > 0` but `status = 'PARTIAL'` | List row shows "Khớp một phần" status chip; detail panel shows both `quantity` (ordered) and `filled_quantity` (matched so far); fill history table shows fill records to date; timeline shows "Khớp một phần" event |
| Order `status = 'REJECTED'` and `reject_reason` is null | Detail expanded view shows: "Lý do từ chối: Không có thông tin lý do từ chối." |
| User has only orders older than 30 days; opens Order History with default filter | List is empty (no orders in default 30-day window); show empty filter state: "Không tìm thấy lệnh nào." + "Thử thay đổi bộ lọc hoặc khoảng thời gian." — NOT the "no orders at all" empty state |
| Stop-limit order with `parent_order_id` set | Detail panel shows: stop_price field with value; if the parent order was filled (triggering the limit leg), the timeline shows the stop trigger event before the limit placement event |
| Order placed at exactly midnight ICT (00:00:00 ICT) | `placed_at` displayed as absolute date format: "00:00 dd/MM/yyyy"; not relative format (relative format only used for times < 24 hours ago) |
| User navigates from Order History directly to Order Placement (via floating "Đặt lệnh" button) | Order History screen remains in navigation stack; back from Order Placement returns to Order History at previous scroll position and expanded row state |
| Order history has more than 1000 orders matching a filter | Pagination correctly handles large sets; `total_count` shows true count; only 20 rows per page loaded; no client-side memory issue from attempting to load all records |
| User applies symbol search before all pages are loaded | Search filters within loaded records only; info label "Tìm kiếm trong các lệnh đã tải. Kéo xuống để tải thêm." shown below the search field while search is active and `next_cursor` is not null |

### Orderbook Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| All 3 bid levels and all 3 ask levels have price = ref_price | All 6 price cells colored amber (#FFC107); no other colors |
| `match_history` array is empty | Zone 4 (match history section) shows header "Khớp lệnh gần nhất" + a single row: "Chưa có khớp lệnh." Italicised grey text. |
| `match_history` has only 3 entries | Shows 3 rows only; remaining rows not shown; no filler rows |
| WebSocket delivers a bid/ask update during the ATO/ATC session mode | Bid/ask update ignored (bid/ask table hidden); if last_price or match_history updates: those update normally in the banner (last_price) and Zone 4 (match history) |
| User navigates rapidly between two stock detail screens | The WebSocket subscription from screen 1 is unsubscribed before the screen is removed from the stack; screen 2 subscribes to its symbol; no residual data from screen 1 appears in screen 2's orderbook |
| `ceiling_price` = `ref_price` (newly listed stock with special band) | Any price displayed at ceiling_price is still colored violet (#AA00FF) per the ceiling precedence rule; ref_price equality color (amber) does not override ceiling color |
| Price in bid/ask exactly equals both ceiling and floor simultaneously | Mathematically impossible (ceiling > floor always); no special handling needed |
| `symbol_quotes_latest` row is missing for a symbol | Orderbook error state: "Không thể tải dữ liệu sổ lệnh." + "Thử lại". Log the missing data as a data quality alert. |
| Midday break (HOSE 11:30–13:00 ICT) | `session = 'LUNCH_BREAK'` (or equivalent from the feed); Orderbook renders same as Closed market mode with "Dữ liệu cuối phiên" badge; WebSocket not active; REST snapshot from before 11:30 shown |

---

## 9. Design Requirements

### 9.1 Order Status Chip Color System

All status chips use the same chip component with varying background color and label text. Minimum chip height: 20pt. Text: 11sp bold, white for all filled chips.

| `virtual_orders.status` | Vietnamese Label | Chip Background | Chip Text Color |
|------------------------|-----------------|-----------------|-----------------|
| `PENDING` | Chờ khớp | Amber `#FFC107` | Black `#212121` |
| `ACCEPTED` | Đã nhận | Blue `#2196F3` | White `#FFFFFF` |
| `PARTIAL` | Khớp một phần | Orange `#FF9800` | White `#FFFFFF` |
| `FILLED` | Đã khớp | Green `#4CAF50` | White `#FFFFFF` |
| `CANCELLED` | Đã huỷ | Grey `#757575` | White `#FFFFFF` |
| `REJECTED` | Từ chối | Red `#F44336` | White `#FFFFFF` |
| `EXPIRED` | Hết hạn | Blue-grey `#607D8B` | White `#FFFFFF` |

### 9.2 Orderbook Price Color Grid (VN Standard)

| Condition | Color Name | Hex | RGB | Usage |
|-----------|-----------|-----|-----|-------|
| `price = ceiling_price` | Violet | `#AA00FF` | rgb(170, 0, 255) | Ceiling price (trần) |
| `price = floor_price` | Cyan | `#00BCD4` | rgb(0, 188, 212) | Floor price (sàn) |
| `price > ref_price` | Green | `#4CAF50` | rgb(76, 175, 80) | Price up (tăng) |
| `price < ref_price` | Red | `#F44336` | rgb(244, 67, 54) | Price down (giảm) |
| `price = ref_price` | Amber | `#FFC107` | rgb(255, 193, 7) | Reference (tham chiếu) |
| Volume figures | White/Neutral | `#FFFFFF` | rgb(255, 255, 255) | Volume is always neutral |
| Missing data ("—") | Grey | `#9E9E9E` | rgb(158, 158, 158) | Absent bid/ask levels |

All price colors must be verified at a minimum 4.5:1 contrast ratio against the cell background color for WCAG AA compliance. The cell backgrounds in the Orderbook are:

- Ask side (Zone 1) rows: very light red tint background `#FFEBEE` (light theme) / `#3E1C1C` (dark theme)
- Bid side (Zone 3) rows: very light green tint background `#E8F5E9` (light theme) / `#1C3E1C` (dark theme)
- Center bar row: neutral background `#F5F5F5` (light theme) / `#2C2C2C` (dark theme)

The volume bar overlay within each row (a horizontal fill bar indicating relative volume vs. the maximum volume in the current 3-level set) uses:

- Ask side volume bar: light red fill `#EF9A9A`, 30% opacity
- Bid side volume bar: light green fill `#A5D6A7`, 30% opacity

### 9.3 Skeleton State Specifications

**Order History skeleton (per row, 5 rows shown during loading):**

```
[Grey block 80pt wide, 16pt tall]   [Grey chip 60pt wide, 20pt tall]
[Grey block 120pt wide, 12pt tall]                [Grey block 50pt wide, 12pt tall]
```

Skeleton background: `#E0E0E0` (light) / `#424242` (dark). Shimmer animation: left-to-right, 1.5s cycle, 200ms delay between rows.

**Orderbook skeleton (7 rows total: 3 ask + 1 center + 3 bid):**

```
                        [Grey 60pt]  [Grey 70pt]  [Grey 50pt]   ← ask row 3
                        [Grey 60pt]  [Grey 70pt]  [Grey 50pt]   ← ask row 2
                        [Grey 60pt]  [Grey 70pt]  [Grey 50pt]   ← ask row 1
           [Grey 100pt, 24pt tall, full width centered]         ← center bar
[Grey 60pt]  [Grey 70pt]  [Grey 50pt]                           ← bid row 1
[Grey 60pt]  [Grey 70pt]  [Grey 50pt]                           ← bid row 2
[Grey 60pt]  [Grey 70pt]  [Grey 50pt]                           ← bid row 3
```

**Match history skeleton (3 rows):**

```
[Grey 60pt]  [Grey 70pt]  [Grey 50pt]
[Grey 60pt]  [Grey 70pt]  [Grey 50pt]
[Grey 60pt]  [Grey 70pt]  [Grey 50pt]
```

### 9.4 Side Pill Design (BUY / SELL)

Used in Order History list rows:

| Side | Pill Background | Pill Text | Text Color |
|------|----------------|-----------|------------|
| BUY (MUA) | Green `#4CAF50` | "MUA" | White `#FFFFFF` |
| SELL (BÁN) | Red `#F44336` | "BÁN" | White `#FFFFFF` |

Pill dimensions: height 20pt, horizontal padding 8pt, border-radius 10pt (fully rounded). Text: 11sp bold.

### 9.5 "Tiền ảo" Label

The non-dismissible virtual funds label (per FR-PT-06 in FRD-10) is required on the Order History screen. It must appear in the screen header, consistent with its appearance on all other paper trading screens. Implementation: use the shared `<VirtualFundsLabel />` component with no props that control visibility.

---

## 10. Related Documents

| Document | Relationship |
|----------|-------------|
| `docs/business/BRD.md` §BO-04 | Parent business objective for paper trading core loop |
| `docs/business/frd/10-paper-trading.md` (FRD-10) | Defines virtual_orders state machine (FR-PT-08), order type rules (FR-PT-07), and portfolio dashboard (FR-PT-04) |
| `docs/business/frd/20-order-placement.md` (FRD-20) | Companion screen that creates orders; Order History is accessible from FRD-20 confirmation; Orderbook is embedded in FRD-20 |
| `docs/business/frd/04-stock-detail.md` (FRD-04) | Orderbook component is embedded in the Stock Detail screen |
| `docs/business/SRD-order-engine-v2.3.md` | System-level processing rules for virtual orders; defines the DB schema for `virtual_orders` and `virtual_trades` |
| `docs/business/frd/09-age-gate.md` (FRD-09) | Age gate rules; LEARN_MODE and FULL_ACCESS affect which orders are possible but not the Order History display |
| `[PENDING: WS spec]` | WebSocket contract for real-time Orderbook updates is not yet defined. Orderbook live mode (FR-OB-03) is blocked until this spec is delivered. |
