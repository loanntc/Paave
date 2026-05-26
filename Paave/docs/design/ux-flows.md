# Paave UX Flows & Navigation Structure
## User Journeys, Navigation Architecture, Flow Validation

> Version: 1.0 | Date: 2026-04-14 | Status: V1 Production-Ready

---

## 1. Navigation Architecture

### 1.1 Bottom Tab Bar (Always Visible Post-Onboarding)

```
Tab 1: Home       — Icon: house        — Label: "Trang chủ" / "홈" / "Home"
Tab 2: Discover   — Icon: compass      — Label: "Khám phá" / "탐색" / "Discover"
Tab 3: Markets    — Icon: bar-chart-2  — Label: "Thị trường" / "시장" / "Markets"
Tab 4: Portfolio  — Icon: briefcase    — Label: "Danh mục" / "포트폴리오" / "Portfolio"
Tab 5: Profile    — Icon: user         — Label: "Tôi" / "내 정보" / "Profile"
```

**Rules:**
- Bottom nav hidden during Splash and all Onboarding steps
- Active tab: `accent-primary` icon color + filled variant + label in `text-primary`
- Inactive tab: `text-tertiary` icon + label
- Tab bar background: `bg-card` with top border `border` 1px
- Height: 64px + `safe-area-inset-bottom`

### 1.2 Screen Hierarchy

```
App Root
├── Splash Screen (no nav)
├── Onboarding Flow (no nav)
│   ├── Step 1: Nationality
│   ├── Step 2: Market Preference
│   └── Step 3: Name Entry
└── Main App (bottom nav)
    ├── Tab 1: Home Dashboard
    │   └── → Stock Detail (push, from any stock tap)
    ├── Tab 2: Discover / Trending Feed
    │   ├── → Stock Detail (push)
    │   └── → Theme Filter (bottom sheet)
    ├── Tab 3: Markets
    │   ├── VN Tab (default for VN users)
    │   ├── KR Tab (default for KR users)
    │   ├── Global Tab (default for non-VN/KR)
    │   └── → Stock Detail (push)
    ├── Tab 4: Portfolio
    │   ├── Holdings List
    │   ├── P&L Summary
    │   ├── Transaction History
    │   └── → Stock Detail (push)
    └── Tab 5: Profile / Settings
        ├── Account Info
        ├── Watchlist Management
        │   └── → Stock Detail (push)
        ├── Price Alerts List
        │   └── → Price Alert Setup (sheet or push)
        ├── Language Settings
        └── Theme Settings
```

### 1.3 Modal / Sheet Flows

```
Stock Detail → [Set Alert CTA]  → Price Alert Setup (bottom sheet, full-height)
Discover     → [Filter icon]    → Theme Filter (bottom sheet, half-height)
Markets      → [Stock row tap]  → Stock Detail (push)
Portfolio    → [Holdings tap]   → Stock Detail (push)
Any screen   → [Share button]   → Native share sheet
```

---

## 2. Core User Journeys

### Journey 1: First-Time User — Onboarding to First Watchlist

```
Step 1  → App open → Splash (2s logo animation)
Step 2  → Onboarding Step 1: "Bạn ở đâu?" (Nationality selector)
            Options: Vietnam | Korea | Other
            CTA: "Tiếp theo" (enabled when selection made)
Step 3  → Onboarding Step 2: "Bạn quan tâm thị trường nào?" (Market preference)
            Options: VN (HOSE/HNX) | KR (KOSPI/KOSDAQ) | US / Global | All
            Multi-select allowed
            CTA: "Tiếp theo" (enabled when ≥1 selected)
Step 4  → Onboarding Step 3: "Bạn tên là gì?" (Name entry)
            Text input, max 40 chars
            CTA: "Bắt đầu khám phá" (enabled when name ≥ 1 char)
Step 5  → Home Dashboard (first-time state: watchlist empty, suggested stocks shown)
Step 6  → User taps a trending stock card
Step 7  → Stock Detail
Step 8  → User taps "Theo dõi" (Add to Watchlist)
Step 9  → Success toast: "Đã thêm vào danh sách theo dõi"
Step 10 → Watchlist count updates on Home
```

**Flow validation:**
- Can steps be reduced? Onboarding is already minimal at 3 steps. Cannot be reduced further without losing personalization data needed for market defaults.
- Confusion risk: Step 2 multi-select may confuse — add "(Có thể chọn nhiều)" hint text.

---

### Journey 2: Returning User — Check Portfolio & Trending

```
Step 1  → App open → Skip splash → Home Dashboard (instant load from cache)
Step 2  → Hero card shows portfolio total with number roll-up animation
Step 3  → Scroll down → "Đang trending" section
Step 4  → Tap stock card → Stock Detail
Step 5  → View chart, stats
Step 6  → Back → Home
Step 7  → Tap Portfolio tab
Step 8  → View P&L, holdings
Step 9  → Tap a holding → Stock Detail
Step 10 → Tap "Cài đặt cảnh báo giá"
Step 11 → Price Alert setup sheet
Step 12 → Set target price → "Lưu cảnh báo"
Step 13 → Success: "Sẽ thông báo khi giá đạt ₫X"
```

---

### Journey 3: Discovery — Explore Trending Stocks

```
Step 1  → Tap Discover tab (bottom nav)
Step 2  → Trending feed loads (skeleton → content)
Step 3  → Editorial cards visible with "why it's hot" snippet
Step 4  → Tap filter icon → Theme filter sheet
Step 5  → Select theme: "Công nghệ" / "Ngân hàng" / "Năng lượng xanh"
Step 6  → Feed filters, smooth transition
Step 7  → Tap stock card → Stock Detail
Step 8  → Read analysis, view chart
Step 9  → "Theo dõi" CTA → added to watchlist
Step 10 → Back to Discover feed
```

---

### Journey 4: Price Alert Setup

```
Step 1  → From Stock Detail, tap "Cài đặt cảnh báo giá"
Step 2  → Bottom sheet slides up: Price Alert Setup
Step 3  → Current price shown as reference
Step 4  → User enters target price (numeric input, ₫ prefix)
Step 5  → System shows: "Sẽ thông báo khi giá ≥/≤ ₫X" (above/below toggle)
Step 6  → "Lưu" button enabled when valid price entered
Step 7  → Tap "Lưu" → success state
Step 8  → Sheet dismisses → Stock Detail CTA changes to "Đang theo dõi giá" (disabled)
Step 9  → Edit: user can tap "Đang theo dõi giá" → sheet re-opens in edit mode
```

**Edge case:** Alert already exists → sheet opens in edit mode by default, shows current threshold, "Xóa cảnh báo" destructive option.

---

### Journey 5: Markets Tab — Switch Market Views

```
Step 1  → Tap Markets tab
Step 2  → Default tab active (per user nationality preference)
Step 3  → VN Tab: shows HOSE index, top movers, sector performance
Step 4  → User swipes horizontally → KR tab
Step 5  → KR Tab: shows KOSPI/KOSDAQ, top movers in Korean markets
Step 6  → Swipe again → Global tab
Step 7  → Global: US markets, major indices (S&P, NASDAQ, VN30 etc.)
Step 8  → Tap any stock row → Stock Detail
Step 9  → Back arrow → Markets (preserves tab position)
```

---

## 3. Error / Offline Flows

### Offline State Flow

```
App detects no network →
  → Show "Đang offline" sticky banner (top, below status bar, bg-warning-subtle)
  → Load cached data where available
  → Prices show with "Cập nhật lúc HH:MM" timestamp
  → Disabled: price alerts (grayed), fresh chart data (static last-known)
  → CTA "Thử lại" in banner → triggers re-fetch
```

### API Error Flow

```
Data fetch fails →
  → Skeleton resolves to error state
  → Error chip: "Không thể tải dữ liệu" with retry icon
  → Last-known data shown with stale indicator
  → "Thử lại" text button below error chip
```

### Empty State Flows

```
Empty Watchlist (Home / Portfolio) →
  → Illustrated empty state (simple line art, no emoji)
  → Title: "Chưa có gì ở đây"
  → Subtitle: "Khám phá cổ phiếu và thêm vào danh sách theo dõi"
  → CTA: "Khám phá ngay" → navigate to Discover tab

Empty Portfolio →
  → Title: "Bắt đầu theo dõi danh mục"
  → Subtitle: "Thêm cổ phiếu bạn đang nắm giữ"
  → CTA: "Thêm khoản đầu tư" → navigate to search / Discover

Empty Alerts (Profile > Alerts) →
  → Title: "Chưa có cảnh báo giá nào"
  → Subtitle: "Vào trang chi tiết cổ phiếu để đặt cảnh báo"
  → CTA: "Khám phá cổ phiếu" → navigate to Discover
```

---

## 4. Navigation Transition Matrix

| From | To | Transition | Direction |
|---|---|---|---|
| Splash | Onboarding Step 1 | Fade + scale up | — |
| Onboarding Step N | Step N+1 | Slide left | Left → Right |
| Onboarding Step 3 | Home | Fade (replace stack) | — |
| Any Tab | Any Tab | Fade (no slide) | — |
| Home / Discover / Markets | Stock Detail | Push (slide left) | Left → Right |
| Stock Detail | Back | Pop (slide right) | Right → Left |
| Stock Detail | Price Alert Sheet | Slide up (sheet) | Bottom → Top |
| Discover | Theme Filter Sheet | Slide up (sheet) | Bottom → Top |
| Any sheet | Dismiss | Slide down | Top → Bottom |

---

## 5. Deep Link Structure (V1 Planning)

```
paave://                    → Home
paave://discover            → Discover tab
paave://markets             → Markets tab
paave://markets/vn          → Markets tab, VN subtab
paave://markets/kr          → Markets tab, KR subtab
paave://portfolio           → Portfolio tab
paave://profile             → Profile tab
paave://stock/{ticker}      → Stock Detail for ticker
paave://alert/{ticker}      → Price Alert setup for ticker
```

---

## 6. Gesture Map

| Gesture | Target | Action |
|---|---|---|
| Tap | Stock card | Navigate to Stock Detail |
| Long press | Stock card | Quick actions sheet (Watch / Alert / Share) |
| Swipe left | Markets subtabs | Go to next market tab |
| Swipe right | Markets subtabs | Go to previous market tab |
| Pull down | Any scrollable screen | Refresh data |
| Swipe down | Bottom sheet | Dismiss sheet |
| Back gesture (iOS) | Any pushed screen | Pop back |
| Double tap | Chart area | Reset zoom |
| Pinch | Chart area | Zoom in/out (V1: disable or read-only) |

---

## 7. State Persistence Rules

```
Last active tab:            Persisted across sessions
Markets last-viewed subtab: Persisted per session
Discover filter selection:  Persisted per session (reset on app restart)
Onboarding completion:      Persisted permanently (skip on re-launch)
Scroll position:            Home and Discover scroll restored on tab re-activate
Stock Detail chart range:   Reset to 1D on each open
```

---

## 8. Loading Priority / Performance UX

```
Home Dashboard:
  Priority 1 (instant):  Portfolio hero (cached)
  Priority 2 (< 500ms): Watchlist prices
  Priority 3 (< 1s):    Trending picks
  Priority 4 (< 2s):    Market snapshot

Stock Detail:
  Priority 1 (instant):  Price + basic info (cached)
  Priority 2 (< 500ms): 1D chart
  Priority 3 (< 1s):    Stats, P/E, volume
  Priority 4 (< 2s):    Related news / editorial

All skeleton durations match expected load, then reveal with stagger:
  Item 1: 0ms offset
  Item 2: 50ms offset
  Item 3: 100ms offset
  (cap at 200ms max stagger)
```
