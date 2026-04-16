# Paave Screen Specifications
## All V2 Screens — Layout, Components, States, Dev & QA Handoff

> Version: 2.0 | Date: 2026-04-16 | Status: V2 Production-Ready
> Design canvas: 393 × 852px (iPhone 14 Pro). All values in px unless noted.
> All spacing tokens defined in design-system.md.

---

## Screen 1 — Splash Screen

### Screen Overview
```
Screen: Splash
User:   All users (new + returning)
Goal:   Brand moment; initialize app; route to onboarding (new) or home (returning)
```

### Layout
```
Background: bg-primary (#0D1117), full screen
Center:     Paave logo mark + wordmark
             Logo mark: 64×64px circle, gradient-accent-glow background
             Wordmark: "Paave" in text-display-md (24px, weight 800), text-primary
             Tagline: "Đầu tư thông minh hơn" (14px, weight 400, text-secondary)
             Logo mark → wordmark gap: 12px
             Wordmark → tagline gap: 8px
Bottom:     Version number (text-caption, text-tertiary, bottom: 32px + safe-area)
```

### Components
```
Logo mark:
  Size:             64 × 64px
  Shape:            Circle (radius-full)
  Background:       gradient-accent-glow
  Icon:             Custom "P" monogram or rising chart icon, 32px, #FFFFFF
  
Wordmark:
  Font:             Pretendard, 24px, weight 800
  Color:            text-primary (#F9FAFB)
  Letter-spacing:   -0.5px
  
Tagline:
  Font:             Pretendard, 14px, weight 400
  Color:            text-secondary (#9CA3AF)
  
Version text:
  Font:             Pretendard, 11px, weight 400
  Color:            text-tertiary (#6B7280)
```

### Interaction Rules
```
App launch   → Show splash → run logo animation → 
               Check auth state:
                 New user    → navigate to Onboarding Step 1 (after 1800ms total)
                 Returning   → navigate to Home (after 1000ms total)
```

### States
```
Default:  Logo animates in (opacity 0→1, translateY 20→0, 600ms ease-decelerate)
          Tagline fades in at 400ms offset
Loading:  Same as default (splash IS the loading state)
```

### Dev Handoff Specs
```
Screen bg:           #0D1117, fills entire screen including safe areas
Logo container:      centered horizontally + vertically (flex, justify-center, align-center)
Logo animation:      opacity: 0 → 1, transform: translateY(20px) → 0
                     duration: 600ms, easing: cubic-bezier(0.0, 0.0, 0.2, 1)
Tagline animation:   same, delay: 400ms
Total display time:  New user = 1800ms, Returning = 1000ms
Transition out:      opacity 1→0, duration 300ms ease-accelerate
Status bar:          Light content (white icons) on dark background
```

### QA Tests
```
[ ] Logo appears centered on all device sizes (SE, 14, 14 Pro Max, Galaxy S23)
[ ] Animation plays smoothly at 60fps
[ ] Routes to Onboarding for new user
[ ] Routes to Home for returning user (skips onboarding)
[ ] Splash does not flicker on fast devices
[ ] Version number visible and accurate
```

---

## Screen 2 — Onboarding (3 Steps)

> **DEPRECATED (v2.0):** This 3-step onboarding is superseded by the full registration flow in Screens 20-22. Screen 2 is retained for reference only. Developers should implement Screens 20-22 for the V1 registration experience.

### Screen Overview
```
Screen: Onboarding (Step 1, 2, 3)
User:   New user, first launch only
Goal:   Capture nationality, market preference, name in ≤60 seconds
```

### Layout (All Steps)
```
Background:  bg-primary
Top:         Progress indicator (3 dots), centered, top: 56px + safe-area
Center:      Step content (varies per step)
Bottom:      Primary CTA button, 16px from bottom nav area
             Back arrow (top-left, 44×44px touch) — hidden on step 1
```

### Progress Indicator
```
Component:  3 dots, horizontal, centered
Dot size:   8×8px (inactive), 24×8px pill shape (active), radius-full
Gap:        8px between dots
Inactive:   bg-card (#1F2937)
Active:     accent-primary (#3B82F6)
Animation:  width 8→24px, 150ms ease-spring, color transition 150ms
```

### STEP 1 — Nationality

```
Layout:
  Top area:       Back: hidden
  Question:       "Bạn đang ở đâu?" — text-title-lg (20px, weight 700), text-primary, top: 120px
  Sub-label:      "Chúng tôi sẽ cá nhân hoá trải nghiệm cho bạn"
                  text-body-md (14px, weight 400), text-secondary, mt: 8px
  Options:        3 cards stacked, mt: 32px
  CTA:            "Tiếp theo →", bottom: 40px + safe-area

Option Card:
  Width:          343px (full width - 16px margin each side)
  Height:         64px
  Background:     bg-card (#1F2937), border: border (#374151) 1px, radius-md (12px)
  Content:        Flag emoji (24px) + country name (16px, weight 600, text-primary), 16px gap, ml: 16px
  Selected:       border: accent-primary (#3B82F6) 2px, background: accent-primary-subtle
  Gap between:    12px
  Touch target:   Full card height (64px)

Options:
  "🇻🇳 Việt Nam"
  "🇰🇷 Hàn Quốc"
  "🌏 Quốc gia khác"

CTA Button (Primary):
  Width:          343px
  Height:         52px
  Radius:         radius-lg (16px)
  Background:     accent-primary (#3B82F6) when option selected
  Background:     bg-card (#1F2937) when no option selected (disabled)
  Text:           "Tiếp theo" — 16px, weight 600, #FFFFFF (enabled) / text-tertiary (disabled)
  Icon:           → arrow, 20px, right side, ml: 8px
  Shadow:         shadow-glow-accent when enabled
```

### STEP 2 — Market Preference

```
Layout:
  Back button:    Top-left, 44×44px, icon: arrow-left 20px, text-secondary
  Question:       "Bạn quan tâm thị trường nào?"
  Sub-label:      "Có thể chọn nhiều" — text-caption (12px), text-secondary, mt: 4px
  Options:        4 cards, multi-select, mt: 32px
  CTA:            "Tiếp theo →", bottom: 40px + safe-area

Options (multi-select cards):
  "🇻🇳 Thị trường Việt Nam (HOSE / HNX)"
  "🇰🇷 Thị trường Hàn Quốc (KOSPI / KOSDAQ)"
  "🇺🇸 Thị trường Mỹ (NYSE / NASDAQ)"
  "🌏 Tất cả thị trường"

Multi-select rule: "Tất cả thị trường" is mutually exclusive with others
CTA enabled: when ≥ 1 option selected
```

### STEP 3 — Name Entry

```
Layout:
  Back button:    Top-left
  Question:       "Bạn tên là gì?"
  Sub-label:      "Chúng tôi sẽ gọi bạn bằng tên này"
  Input:          Text field, mt: 32px
  Hint:           Displayed below input
  CTA:            "Bắt đầu khám phá ✦", bottom: 40px + safe-area

Text Input:
  Width:          343px
  Height:         56px
  Background:     bg-card (#1F2937)
  Border:         border (#374151) 1px, radius-md (12px)
  Focus border:   border-focus (#3B82F6) 2px
  Placeholder:    "Ví dụ: Minh, Hyun, Alex" — text-tertiary (#6B7280), 16px
  Input text:     text-primary (#F9FAFB), 16px, weight 400
  Label (float):  "Tên của bạn" — 12px, text-secondary, rises to top of field on focus
  Max chars:      40
  Keyboard:       Show immediately on screen enter

Hint text:
  "Không cần tên thật — biệt danh cũng được nhé 😊"
  12px, text-secondary, mt: 8px, text-align: center

CTA button:
  Enabled:  name.length ≥ 1
  Text:     "Bắt đầu khám phá"
  On tap:   Save user profile → navigate to Home (replace stack)
```

### Interaction Rules
```
Option tap         → Immediate selection (no delay), card border animates
Multi-select tap   → Toggle on/off (150ms transition)
Back button tap    → Slide right to previous step
CTA disabled       → Show tooltip/shake animation if tapped
CTA enabled tap    → Slide left to next step (or enter app on step 3)
Keyboard on step 3 → CTA button moves above keyboard (KeyboardAvoidingView)
```

### States
```
Default:  Step shown with animated entry from right (350ms ease-decelerate)
Loading:  (step 3 only) Brief spinner on CTA while saving profile
Error:    Input validation: name cannot be only spaces → show "Vui lòng nhập tên hợp lệ" below input
Success:  Step 3 CTA → flash success (100ms), then transition to Home
```

### Edge Cases
```
App killed mid-onboarding → Resume from last completed step
Long country/name text → truncate at 2 lines, scale font down to 14px if needed
Keyboard obscures content → scroll content up (KeyboardAvoidingView behavior: padding)
```

### Dev Handoff Specs
```
Progress dots:
  Container:     height 32px, flex-row, gap 8px, centered
  Dot default:   width 8px, height 8px, radius 999, bg #1F2937
  Dot active:    width 24px, height 8px, radius 999, bg #3B82F6
  Animation:     width interpolation 8→24, 150ms cubic-bezier(0.34, 1.56, 0.64, 1)

Option card:
  Padding:       horizontal 16px, vertical 0 (height: 64px fixed)
  Content align: flex-row, align-center
  Gap:           16px between flag and text
  Transition:    border-color + background 150ms ease-standard

CTA button:
  Margin h:      16px each side (343px = 375 - 32)
  Disabled:      opacity 0.4 on text, no shadow
  Enabled:       box-shadow 0 0 20px rgba(59,130,246,0.3)
  Press:         scale 0.97, 80ms ease-sharp → 1.0, 150ms ease-spring
```

### QA Tests
```
[ ] Step 1: CTA disabled until selection made
[ ] Step 2: Multi-select works; "All" deselects others
[ ] Step 3: CTA disabled when input empty or only whitespace
[ ] Step 3: CTA enabled after ≥ 1 non-whitespace character
[ ] Back button: returns to correct previous step
[ ] Step 1 back button: hidden
[ ] Progress dots: correctly reflect current step
[ ] Keyboard: does not obscure CTA in step 3
[ ] Onboarding skipped on return visit
[ ] Error message shown for invalid name
```

---

## Screen 3 — Home Dashboard

### Screen Overview
```
Screen: Home Dashboard
User:   Returning user (post-onboarding)
Goal:   Instant portfolio overview + entry point to trending stocks + watchlist
```

### Layout
```
Header:     Screen header, sticky
Main:       Scrollable content (sections stacked vertically)
Bottom Nav: Persistent tab bar
```

### Header
```
Height:           56px + safe-area-inset-top
Background:       bg-primary (transparent blur on scroll)
Left:             "Chào buổi sáng, {name}" — text-body-md (14px), text-secondary
                  "Paave" logo mark 24×24px, left: 16px, top: 16px
Right:            Notification bell icon, 24px, text-secondary, right: 16px
                  Touch area: 44×44px
Notification dot: 8px circle, negative (#EF4444), top-right of bell if unread
```

### Main Content (Scroll)

**Section 1 — Portfolio Hero Card**
```
Position:    mt: 16px, mx: 16px
Width:       343px
Height:      180px
Background:  gradient-hero + accent-glow at top
Border:      none
Radius:      radius-xl (24px)
Shadow:      shadow-card-raised

Content:
  Top-left:   "Tổng danh mục" — text-caption (12px, weight 500), text-secondary, opacity: 0.8
  Value:      "₫4.250.000" — text-display-xl (40px, weight 800), text-primary
              (number roll-up animation on load, 500ms ease-decelerate)
  P&L row:    Below value, mt: 8px
              "+₫125.000" — text-body-md (14px, weight 600), positive (#10B981)
              "(+3,02%)"  — text-body-sm (13px), positive (#10B981)
              Today label: "hôm nay" — text-caption (12px), text-secondary, ml: 8px
  Bottom:     Bento row (2 mini-cards):
              Left:  "VN30: 1.284,5" — text-body-sm, text-secondary + small up/down arrow
              Right: "Đang theo dõi: 8 CP" — text-body-sm, text-secondary + eye icon
```

**Section 2 — Market Snapshot (Bento 2×2)**
```
Position:    mt: 24px, mx: 16px
Section label: "Thị trường hôm nay" — text-title-sm (16px, weight 600), text-primary
               mt: 0, mb: 12px

Grid:        2 columns, gap: 8px
Card size:   (343 - 8) / 2 = 167.5px wide, height: 80px each

Card content:
  Market name: "VN30" — text-caption-bold (12px, weight 600), text-secondary
  Value:        "1.284,5" — text-title-md (18px, weight 700), text-primary (tabular-nums)
  Change:       "+0,85%" — text-body-sm (13px, weight 600), positive/negative color
  Mini arrow:   ↑ or ↓ icon 14px, matching color

Markets shown: VN30 | KOSPI | S&P 500 | NASDAQ
```

**Section 3 — Trending Picks (Horizontal Scroll)**
```
Position:    mt: 24px
Header row:  mx: 16px, flex-row, justify-between
  Left:      "Đang nổi bật" — text-title-sm (16px, weight 600), text-primary
  Right:     "Xem tất cả →" — text-body-sm (13px), text-accent (#3B82F6), touchable

Scroll:      horizontal, no scrollbar, paddingLeft: 16px, paddingRight: 16px
             gap between cards: 12px

Trending Card:
  Width:      160px
  Height:     180px
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px
  Radius:     radius-lg (16px)
  Padding:    12px

  Content:
    Top:     Company ticker "VCB" — text-caption-bold (12px, weight 600), text-secondary
             Exchange tag "HOSE" — text-caption (10px), accent-primary-subtle bg, accent-primary text, radius-sm, px: 4px, py: 2px
    Logo:    Company logo or placeholder 32×32px, radius-full, mt: 8px
    Name:    "Vietcombank" — text-body-sm (13px, weight 600), text-primary, mt: 4px, 2-line max
    Price:   "₫88.000" — text-title-md (18px, weight 700), text-primary, tabular-nums, mt: 8px
    Change:  "+2,15%" — text-body-sm (13px, weight 600), positive/negative, mt: 2px
    Social:  "12 người đang xem 👀" — text-caption (11px), text-secondary, mt: 8px
             (only show if viewers ≥ 5)
```

**Section 4 — Watchlist**
```
Position:    mt: 24px, pb: 100px (bottom nav clearance)
Header row:  mx: 16px
  Left:      "Danh sách theo dõi" — text-title-sm (16px, weight 600), text-primary
  Right:     "+ Thêm" — text-body-sm (13px), text-accent, touchable → Discover tab

Watchlist items: vertical list, mx: 16px, gap: 1px divider

Row:
  Height:     68px
  Background: bg-card, radius-md (12px)
  Padding:    horizontal 16px
  Layout:     flex-row, align-center, justify-between

  Left:
    Logo:    32×32px circle, radius-full
    Name:    "VCB" — text-title-sm (16px, weight 600), text-primary, ml: 12px
    Company: "Vietcombank" — text-body-sm (13px), text-secondary, mt: 2px

  Right:
    Price:   "₫88.000" — text-title-sm (16px, weight 700), tabular-nums, text-primary
    Change:  "+2,15%" — text-body-sm (13px), positive/negative, mt: 2px, text-right

  Swipe-left action (iOS):
    "Xóa" button, bg: negative (#EF4444), text: #FFFFFF, width: 80px
```

### Interaction Rules
```
Pull down            → Refresh all data (spinner in header, subtle)
Trending card tap    → Navigate to Stock Detail
Watchlist row tap    → Navigate to Stock Detail
"Xem tất cả" tap     → Navigate to Discover tab
"+ Thêm" tap         → Navigate to Discover tab
Notification bell    → Navigate to Price Alerts (Profile > Alerts)
Watchlist swipe-left → Reveal "Xóa" action
Scroll up 50px+      → Header background becomes bg-card with blur (sticky effect)

First view per session → Investment disclaimer modal shown (per FR-LEGAL-01). User taps "Đã hiểu" to dismiss. Not shown again in same session.
```

### States

**Default:**
- Portfolio hero loaded, prices live
- Trending section populated (≥3 cards)
- Watchlist populated

**Loading (Skeleton):**
```
Portfolio hero: skeleton card, full size, shimmer animation
Market cards:   4 skeleton cards, same grid
Trending:       3 skeleton cards, horizontal scroll
Watchlist:      4 skeleton rows, 68px each
Shimmer:        bg-skeleton-shine traverses bg-skeleton, 1.5s linear infinite
```

**Error:**
```
Hero card:      Last cached value shown, "Cập nhật lúc 09:45" timestamp below value
Market cards:   "Không thể tải" label replacing values, retry icon (redo 16px)
Trending:       "Đang gặp sự cố, thử lại sau" error chip, centered
Watchlist:      Same cached data or error per-row
```

**Empty Watchlist:**
```
Watchlist section replaces with:
  Illustration: simple line-art upward chart, 80×80px, text-secondary tint
  Title:        "Chưa theo dõi cổ phiếu nào"
  Subtitle:     "Thêm cổ phiếu để theo dõi biến động giá"
  CTA button:   "Khám phá ngay" → Discover tab, 200px wide, height 44px, accent-primary
```

**Empty Portfolio (first-time):**
```
Hero card shows:
  Value:    "₫0" (static, no animation)
  Subtitle: "Bắt đầu theo dõi danh mục của bạn"
```

**LEARN_MODE (age 16-17):**
```
Portfolio Hero Card: HIDDEN (replaced with educational banner)
Educational banner: "Tính năng này chỉ mang tính chất giáo dục và mô phỏng." (BR-DISC-04)
Background: banner-virtual-bg
Paper trading entry: still visible
All other sections: same as default
```

### Edge Cases
```
Very long name ({name} > 12 chars): truncate with ellipsis in greeting
Price flash on update: brief bg-positive-subtle or bg-negative-subtle highlight on value, 300ms
Zero change: text-secondary color (not positive/negative), "0,00%"
Watchlist full (100 stocks): "Đã đạt giới hạn 100 CP" toast when trying to add
```

### Dev Handoff Specs
```
Header:
  Height:         56px + StatusBar.currentHeight (Android) or safe-area-inset-top (iOS)
  Background:     Transparent default, #1F2937 + blur when scrolled ≥50px
  Transition:     background-color 250ms ease-standard

Portfolio hero:
  Width:          375 - 32 = 343px
  Height:         180px
  Padding:        20px
  Border-radius:  24px
  Number roll-up: react-native-reanimated counter from 0 to value, 500ms

Trending scroll:
  paddingHorizontal: 16px
  showsHorizontalScrollIndicator: false
  snapToInterval: 172px (card 160px + gap 12px)
  decelerationRate: 'fast'

Watchlist row:
  Divider: 1px bg-card line between rows (not between card edge)
  Swipe: react-native-gesture-handler Swipeable component
```

### QA Tests
```
[ ] Portfolio value animates from 0 on first load
[ ] Skeleton shows immediately, resolves within 2s
[ ] Positive P&L shows green (#10B981), negative shows red (#EF4444)
[ ] Zero change shows gray (#9CA3AF) and "0,00%" text
[ ] Trending cards scroll horizontally, no clipping
[ ] Watchlist empty state appears when no stocks watched
[ ] Pull-to-refresh triggers data reload
[ ] Notification dot appears only when alerts unread
[ ] Swipe-left delete works on watchlist rows
[ ] Long username truncated in greeting
```

---

## Screen 4 — Discover / Trending Feed

### Screen Overview
```
Screen: Discover / Trending Feed
User:   User exploring stocks to research
Goal:   Surface compelling stock ideas with editorial context; drive watchlist adds
```

### Layout
```
Header:     Sticky, search + filter
Main:       Vertical scrolling editorial feed
Bottom Nav: Persistent
```

### Header
```
Height:     56px + safe-area-inset-top
Background: bg-primary sticky
Left:       "Khám phá" — text-title-lg (20px, weight 700), text-primary
Right:      Filter icon (sliders-horizontal 24px), text-secondary, 44×44px touch
            Shows active dot (accent-primary 8px) when filter applied
Below header (sticky):
  Theme filter chips — horizontal scroll, py: 8px, px: 16px
```

### Theme Filter Chips
```
Container:  horizontal scroll, no scrollbar, height: 40px
Chip:
  Height:   32px
  Padding:  horizontal 12px
  Radius:   radius-full
  Gap:      8px between chips

Default chip:
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px
  Text:       text-body-sm (13px, weight 500), text-secondary

Active chip:
  Background: accent-primary-subtle (rgba(59,130,246,0.15))
  Border:     accent-primary (#3B82F6) 1px
  Text:       text-body-sm (13px, weight 600), accent-primary

Themes (VN-focused first):
  "Tất cả" | "Công nghệ" | "Ngân hàng" | "Bất động sản" | "Năng lượng xanh" |
  "Tiêu dùng" | "Sản xuất" | "Dược phẩm" | "Toàn cầu"
```

### Editorial Stock Card (Main Feed Item)
```
Width:          343px (full width - 32px)
Min-height:     220px
Background:     bg-card (#1F2937)
Border:         border (#374151) 1px
Radius:         radius-lg (16px)
Padding:        16px
Margin-bottom:  12px
Margin-horizontal: 16px

Content layout (top to bottom):

Row 1 — Company identity:
  Logo:        40×40px, radius-full, border: border 1px
  Right of logo:
    Ticker:    "VCB" — text-title-sm (16px, weight 700), text-primary
    Name:      "Vietcombank" — text-body-sm (13px), text-secondary, mt: 2px
  Far right:
    Watchlist toggle: bookmark icon 20px, text-secondary (not watched) / accent-primary (watched)
    Touch: 44×44px

Row 2 — Price data (mt: 12px):
  Price:       "₫88.000" — text-display-md (24px, weight 700), tabular-nums, text-primary
  Change pill: "+2,15%" — text-body-sm (13px, weight 600), positive text-color
               Background: positive-subtle, px: 8px, py: 3px, radius-full
               ml: 8px, align: center vertical

Row 3 — "Why it's hot" editorial (mt: 12px):
  Icon:        zap/flame icon 14px, warning (#F59E0B)
  Label:       "Vì sao đang hot?" — text-caption-bold (12px, weight 600), text-secondary
  Snippet:     Up to 3 lines of editorial text — text-body-sm (13px), text-primary
               "Vietcombank ghi nhận lợi nhuận quý cao nhất từ trước đến nay, 
                với ROE vượt 18%. Tín dụng tư nhân tăng mạnh trong bối cảnh 
                lãi suất hạ nhiệt."
               Line clamp: 3 lines, "...Xem thêm" link (accent-primary)

Row 4 — Metrics mini-row (mt: 12px):
  3 mini stats, flex-row, justify: space-between
  Each stat:
    Label:     "Vốn hóa" / "P/E" / "KL GD" — text-caption (11px, weight 500), text-secondary
    Value:     "123.4T₫" / "12.5" / "1.2M" — text-body-sm (13px, weight 700), tabular-nums, text-primary

Row 5 — Social proof + CTA (mt: 12px):
  Left:   "🔥 47 người đang xem" — text-caption (11px), text-secondary
          (only shown if viewers ≥ 5)
  Right:  "Theo dõi" button — 80px wide, 32px tall, radius-full
          Background: accent-primary (#3B82F6), text: #FFFFFF, 13px weight 600
          If already watching: "Đang theo dõi" — accent-primary-subtle bg, accent-primary text

Sparkline chart (between Row 2 and Row 3):
  Height:      40px
  Width:       full card width - 32px
  Type:        7-day line chart, accent-secondary (#06B6D4)
  Stroke:      1.5px
  Fill:        accent-secondary-subtle below line
  No axes labels (decorative, shows trend only)
  Animate:     Draw-in on mount, 600ms ease-decelerate
```

### Interaction Rules
```
Card tap (any area)        → Navigate to Stock Detail (full detail view)
Bookmark icon tap          → Toggle watchlist (immediate, optimistic update)
"Theo dõi" button tap      → Same as bookmark toggle
"Xem thêm" tap            → Expand editorial snippet (no navigation)
Filter chip tap            → Filter feed to theme, smooth re-render
Filter icon tap (header)   → Open Theme Filter bottom sheet
Pull down                  → Refresh feed
Scroll bottom              → Load next 10 cards (infinite scroll, skeleton at bottom)

First view per session → Investment disclaimer modal shown (per FR-LEGAL-01). User taps "Đã hiểu" to dismiss. Not shown again in same session.
```

### Theme Filter Bottom Sheet
```
Height:     50% of screen (300px approx)
Background: bg-card
Radius:     radius-xl top corners only
Handle:     4×32px pill, bg-border, centered at top, mt: 12px

Title:      "Lọc theo chủ đề" — text-title-md (18px, weight 600), text-primary, mt: 16px, ml: 16px
Close:      × icon top-right, 44×44px touch

Grid:       2-column grid, gap: 8px, mx: 16px, mt: 16px

Theme option (in sheet):
  Height:   48px
  Radius:   radius-md (12px)
  Content:  icon (16px) + label (14px, weight 500), flex-row, align-center, gap: 8px, pl: 12px
  Default:  bg-card, border: border
  Selected: bg: accent-primary-subtle, border: accent-primary, text: accent-primary

Bottom:     "Áp dụng" button — full width - 32px, height 52px, accent-primary, mt: 16px, mb: 32px
```

### States
```
Default:    Feed populated with editorial cards (≥5 cards)
Loading:    3 skeleton cards visible (shimmer), full height
Empty (filter): "Không có cổ phiếu nào trong chủ đề này"
                Small illustration + "Thử chủ đề khác" link
Error:      "Không thể tải feed" + retry button
Infinite load: Spinner at bottom of list (24px, accent-primary)
```

### Dev Handoff Specs
```
Feed list:
  FlatList with keyExtractor = ticker symbol
  initialNumToRender: 5
  onEndReachedThreshold: 0.5 (load more when 50% from bottom)
  refreshControl: PullToRefresh, accent-primary tint

Card animation:
  On mount: opacity 0→1, translateY 16→0, stagger 80ms per card
  Duration: 250ms ease-decelerate

Bookmark toggle:
  Optimistic update (instant visual) + API call
  On API fail: revert + toast "Không thể lưu, thử lại"

"Xem thêm" expansion:
  numberOfLines toggles between 3 and null
  Animation: height interpolation, 200ms ease-standard
```

### QA Tests
```
[ ] Feed loads within 2s (skeleton shown during load)
[ ] Theme filter chips scroll without clipping
[ ] Applying filter updates feed content
[ ] Bookmark tap immediately updates icon (optimistic)
[ ] "Đang theo dõi" state shown for already-watched stocks
[ ] Social proof label hidden if viewers < 5
[ ] "Xem thêm" expands snippet inline
[ ] Infinite scroll triggers load at 50% from bottom
[ ] Empty filter state shown with correct message
[ ] Chart sparkline animates on card appearance
```

---

## Screen 5 — Stock Detail

### Screen Overview
```
Screen: Stock Detail
User:   User researching a specific stock
Goal:   Deep-dive into price, chart, stats; add to watchlist or set price alert
```

### Layout
```
Header:     Navigation bar (back + ticker + action icons)
Main:       Scrollable content
Bottom:     Sticky action bar (2 CTAs)
```

### Header / Navigation Bar
```
Height:     56px + safe-area-inset-top
Background: bg-primary
Left:       Back arrow (arrow-left 20px), text-secondary, 44×44px touch, ml: 8px
Center:     Ticker "VCB" — text-title-md (18px, weight 700), text-primary
Right:      Share icon (share 20px), 44×44px touch | Bell icon (bell 20px, 44×44px)
            (bell filled + accent-primary if alert set)
```

### Main Content (Scrollable)

**Section 1 — Price Hero**
```
mx: 16px, mt: 16px

Company row:
  Logo:    48×48px, radius-full, border: border 1px
  Right:
    Name:  "Vietcombank" — text-title-lg (20px, weight 700), text-primary
    Sub:   "Ngân hàng · HOSE" — text-body-sm (13px), text-secondary, mt: 2px

Price row (mt: 16px):
  Price:    "₫88.000" — text-display-lg (32px, weight 800), tabular-nums, text-primary
  Change:   "+₫1.800 (+2,15%)" — text-body-md (14px, weight 600), positive, ml: 12px, align: bottom
  
Time:     "Cập nhật 14:32 ICT" — text-caption (12px), text-secondary, mt: 4px
```

**Section 2 — Chart**
```
mt: 16px

Time range tabs (horizontal, full width):
  Options: "1N" | "1W" | "1T" | "3T" | "6T" | "1Y" | "Tất cả"
  Default active: "1N" (1 day)
  Tab style: height 32px, text-caption-bold (12px), px: 12px
  Active: accent-primary text, border-bottom: 2px accent-primary
  Inactive: text-secondary

Chart:
  Width:      full screen (375px, edge-to-edge, no horizontal margin)
  Height:     200px
  Type:       Line chart (positive = accent-secondary #06B6D4, negative = negative #EF4444)
  Y-axis:     right side, 3-4 price labels, text-caption (11px), text-secondary
  X-axis:     bottom, time labels, text-caption (11px), text-secondary
  Crosshair:  On long-press: vertical line + price tooltip (bg-card, border, radius-sm)
              Tooltip: date/time + price value + change from open
  Fill:       Gradient below line (accent-secondary-subtle / negative-subtle)
  Animation:  Draw-in on mount and on time range change (600ms ease-decelerate)
  Padding:    left: 8px, right: 48px (y-axis labels), top: 16px, bottom: 24px
```

**Section 3 — Key Stats (Bento Grid)**
```
mt: 24px, mx: 16px

Section label: "Thông tin cổ phiếu" — text-title-sm (16px, weight 600), text-primary, mb: 12px

Grid: 2 columns × 3 rows, gap: 8px

Stat card:
  Width:     (343 - 8) / 2 = 167.5px
  Height:    72px
  Background: bg-card
  Border:    border 1px
  Radius:    radius-md (12px)
  Padding:   12px
  Label:     text-caption (11px, weight 500), text-secondary
  Value:     text-title-sm (16px, weight 700), tabular-nums, text-primary, mt: 4px

Stats shown (6 total):
  "Vốn hóa"      / "123.4 nghìn tỷ"
  "P/E"           / "12.5x"
  "EPS"           / "₫7.040"
  "KL giao dịch"  / "1.24M"
  "52T Cao nhất"  / "₫95.000"
  "52T Thấp nhất" / "₫72.000"
```

**Section 4 — About / Editorial**
```
mt: 24px, mx: 16px

Label:   "Tại sao đang hot?" — text-title-sm (16px, weight 600) + flame icon 16px, warning (#F59E0B)
Content: Full editorial paragraph, text-body-md (14px), text-primary, line-height: 1.6
         Max 5 lines collapsed, "Xem thêm" expand

Source:  "Phân tích bởi Paave · {date}" — text-caption (11px), text-secondary, mt: 8px
```

**Section 5 — Related Stocks (Horizontal Scroll)**
```
mt: 24px

Label:   "Cùng ngành" — text-title-sm (16px, weight 600), text-primary, mx: 16px, mb: 12px

Scroll:  Horizontal, paddingLeft: 16px
Cards:   Mini cards, 120×100px each, gap: 8px
Mini card:
  Logo:    28×28px
  Ticker:  text-caption-bold (12px), text-primary, mt: 6px
  Price:   text-body-sm (13px, weight 700), tabular-nums
  Change:  text-caption (11px), positive/negative
  Tap → Stock Detail (push new screen)

pb: 120px (clearance for sticky action bar)
```

### Sticky Action Bar (Bottom)
```
Position:    fixed bottom, above bottom nav
Height:      80px + safe-area-inset-bottom
Background:  bg-card with top border: border 1px
Padding:     horizontal 16px, vertical 12px

3 Buttons: Primary CTA full-width row + secondary row (2 buttons side by side)

Row 1 — "Giao dịch thử" (Paper Trade) — PRIMARY CTA:
  Width:      343px (full width - 16px margin each side)
  Height:     52px
  Radius:     radius-lg (16px)
  Background: accent-primary (#3B82F6)
  Text:       "Giao dịch thử" — 16px, weight 600, #FFFFFF
  Shadow:     shadow-glow-accent
  Icon:       chart-candlestick 20px, leading, gap: 8px

Row 2 — Secondary actions, mt: 8px, gap: 12px:

Left — "Theo dõi" (Watchlist) — Secondary Button (outline):
  Width:      (343 - 12 - 44) / 1 = flex-1
  Height:     44px
  Radius:     radius-lg (16px)
  Not watching:  Background: transparent, border: accent-primary 1px, text: accent-primary
                 Text: "Theo dõi", icon: bookmark 16px, gap: 8px
  Watching:     Background: accent-primary-subtle, border: accent-primary 1px, text: accent-primary
                Text: "Đang theo dõi", icon: bookmark-filled 16px

Right — "Cảnh báo giá" (Alert) — Icon button:
  Width:      44px
  Height:     44px
  Radius:     radius-full
  No alert:   Background: bg-card, border: border 1px
              Icon: bell 20px, text-secondary
  Alert set:  Background: warning-subtle, border: warning 1px
              Icon: bell-filled 20px, warning
```

### Interaction Rules
```
Chart time tab tap    → Load new range data, chart re-animates
Chart long-press      → Crosshair appears with tooltip (track finger)
Chart long-press end  → Crosshair fades out (300ms)
"Giao dịch thử" tap  → Navigate to Paper Order Placement (push)
"Theo dõi" tap        → Toggle watchlist (optimistic), icon animates (bookmark fill)
"Cảnh báo giá" tap    → Open Price Alert bottom sheet
Share icon tap        → Native OS share sheet (stock ticker + price)
Bell icon (header)    → Open Price Alert bottom sheet
Related stock tap     → Push new Stock Detail (same screen, new ticker)
"Xem thêm" tap       → Expand editorial, button changes to "Thu gọn"
```

### States
```
Default:    All data loaded, chart drawn
Loading:    Skeleton for price, chart skeleton (gray rectangle), bento skeleton
Error:      Price shows last-known + stale timestamp; chart shows "Không thể tải biểu đồ" + retry
Empty chart: "Không có dữ liệu cho kỳ này" with gray flat line
```

### Edge Cases
```
Stock suspended:     Price area shows "Tạm dừng giao dịch" chip (warning), no change indicator
Market closed:       Timestamp shows "Đóng cửa lúc 15:00", price in text-secondary
Long company name:   2-line max in header, font scales to 16px if needed
Unknown logo:        Fallback = colored circle with ticker initials (1-2 chars), accent-primary bg
Alert already set:   "Cài đặt cảnh báo" button shows edit state
Watchlist full:      "Theo dõi" tap → toast "Đã đạt giới hạn 100 CP"
```

### Dev Handoff Specs
```
Header back:         onPress: navigation.goBack()
Watchlist toggle:    optimisticUpdate → API call → rollback on fail
Chart library:       Victory Native or react-native-wagmi-charts (recommended)
Chart crosshair:     PanGestureHandler, track x-position → find nearest data point
Sticky bar:          position: absolute bottom: 0, paddingBottom: safe-area-inset-bottom
                     ensure ScrollView paddingBottom accounts for sticky bar height
Editorial expand:    Animated.Value height interpolation, 200ms ease-standard
Related stocks:      FlatList horizontal, keyExtractor = ticker
```

### QA Tests
```
[ ] Chart renders for all time ranges (1N through Tất cả)
[ ] Chart animates on time range change
[ ] Crosshair follows finger on long press
[ ] Crosshair dismisses on release
[ ] "Theo dõi" button state correct (watching/not watching)
[ ] "Cài đặt cảnh báo" opens bottom sheet
[ ] Alert set state reflected in button
[ ] Share triggers native share sheet
[ ] Market closed / suspended states render correctly
[ ] Related stocks scroll horizontally, tap navigates correctly
[ ] Sticky bar does not cover content (paddingBottom correct)
[ ] Logo fallback renders correctly for unknown company
```

---

## Screen 6 — Portfolio Overview

### Screen Overview
```
Screen: Portfolio Overview
User:   User tracking their investment positions
Goal:   See total portfolio value, P&L, holdings breakdown, transaction history
Note:   V1 is read-only; data is manually entered or simulated (no broker sync)
```

### Layout
```
Header:    Sticky screen title
Main:      Scrollable — Hero summary + Holdings list + Transaction history
Bottom:    Persistent nav bar
```

### Header
```
Height:    56px + safe-area-inset-top
Center:    "Danh mục" — text-title-lg (20px, weight 700), text-primary
Right:     "+" icon (plus-circle 24px), text-accent, 44×44px touch → "Thêm khoản đầu tư" sheet
```

### Main Content

**Section 1 — Portfolio Hero**
```
mx: 16px, mt: 16px

Card:
  Width:      343px
  Height:     200px
  Background: gradient-hero
  Radius:     radius-xl (24px)
  Padding:    20px

  Row 1:     "Tổng giá trị" — text-caption (12px), text-secondary, opacity: 0.8
  Row 2:     "₫4.250.000" — text-display-xl (40px, weight 800), text-primary, mt: 4px
             (number roll-up, 500ms)
  Row 3 — P&L row (mt: 8px):
             "Lãi/lỗ hôm nay:" text-caption, text-secondary
             "+₫125.000 (+3,02%)" — text-body-md (14px, weight 600), positive, ml: 4px
  Row 4 — Period selector chips (mt: 16px):
             "Hôm nay" | "1T" | "3T" | "6T" | "1N"
             Chip: height 28px, px: 10px, radius-full
             Active: accent-primary bg, #FFFFFF text
             Inactive: bg-card, text-secondary
             Switching chip: reloads P&L for period

  Mini pie chart (bottom-right of card):
    Size:    72×72px
    Type:    Donut chart, 4px stroke
    Colors:  Each holding gets distinct color from a palette
    No labels (decorative allocation indicator)
```

**Section 2 — Holdings List**
```
mt: 24px, mx: 16px

Header row: "Danh mục nắm giữ (5)" — text-title-sm (16px, weight 600), text-primary, mb: 12px

Holdings card (each stock):
  Width:      343px
  Height:     76px
  Background: bg-card
  Border:     border 1px
  Radius:     radius-md (12px)
  Padding:    horizontal 16px
  Gap between: 8px

  Content — flex-row:
    Left:
      Color indicator: 4×40px bar, radius-full, left edge of card (holding color)
      Logo:            32×32px, radius-full, ml: 12px
      Right of logo:
        Ticker:        "VCB" — text-title-sm (16px, weight 600), text-primary, ml: 12px
        "10 CP · ₫880.000" — text-body-sm (13px), text-secondary, mt: 2px
                           (quantity × avg cost)
    Right:
      Current value:   "₫930.000" — text-title-sm (16px, weight 700), tabular-nums, text-primary
      P&L:             "+₫50.000 (+5.68%)" — text-body-sm (13px), positive/negative, mt: 2px
```

**Section 3 — Allocation Breakdown (Bento)**
```
mt: 24px, mx: 16px

Label:  "Phân bổ danh mục" — text-title-sm (16px, weight 600), text-primary, mb: 12px

Row of allocation bars:
  Full-width stacked bar, height: 8px, radius-full
  Each holding = colored segment proportional to value
  Below bar: 3 legend items per row (color dot + ticker + %)
  Legend item: dot 8px + text-caption (11px) ticker + text-caption text-secondary %
```

**Section 4 — Transaction History**
```
mt: 24px, mx: 16px, pb: 100px

Label:  "Lịch sử giao dịch" — text-title-sm (16px, weight 600), text-primary, mb: 12px

Transaction row:
  Height:     60px
  Background: none (flat list, divider only)
  Divider:    border 1px, full width
  Padding:    horizontal 16px

  Left:
    Type icon:  arrow-up (buy) green / arrow-down (sell) red, 32×32px bg-subtle circle
    Right:
      "Mua VCB" — text-title-sm (16px, weight 600), text-primary
      "14/04/2026 · 09:30" — text-caption (12px), text-secondary, mt: 2px
  Right:
    "+10 CP" — text-body-sm (13px, weight 600), text-primary
    "₫880.000" — text-caption (12px), text-secondary, mt: 2px
```

### Interaction Rules
```
Period chip tap        → Reload P&L for selected period, number animates
Holdings row tap       → Navigate to Stock Detail for that stock
"+" header tap         → Open "Thêm khoản đầu tư" bottom sheet (V1: manual entry)
Allocation bar segment → Highlight holding in list below
```

### States
```
Default:   Portfolio with holdings
Loading:   Skeleton hero card + 4 skeleton holding rows
Empty:     
  Title:    "Chưa có khoản đầu tư nào"
  Subtitle: "Thêm cổ phiếu bạn đang nắm giữ để theo dõi"
  CTA:      "Thêm ngay" (44×44px min) → Add Investment sheet
Error:     "Không thể tải danh mục" + retry button
```

### Dev Handoff Specs
```
Period chip switching:
  P&L value: animate from current → new value (300ms)
  
Allocation bar:
  Animated.parallel for each segment width on mount (300ms ease-standard)
  
Holdings scroll:
  FlatList within ScrollView (use SectionList instead to avoid nesting)

Add Investment sheet (V1 minimal):
  Fields: Stock search, quantity, average buy price, buy date
  Save → append to local portfolio state (no broker API in V1)
```

### QA Tests
```
[ ] Portfolio total animates on load
[ ] Period switching updates P&L correctly
[ ] Each holding row shows correct P&L (positive green, negative red)
[ ] Tapping holding navigates to Stock Detail
[ ] Empty state shows when no holdings
[ ] Transaction history renders in chronological order
[ ] Allocation bar proportions correct
```

---

## Screen 7 — Markets

### Screen Overview
```
Screen: Markets
User:   User browsing market performance across VN, KR, Global
Goal:   Quick market health overview + discover stocks by market
```

### Layout
```
Header:    Sticky screen title + market tabs
Main:      Tab content (VN / KR / Global) — scrollable
Bottom:    Persistent nav bar
```

### Header
```
Height:    56px + safe-area-inset-top
Center:    "Thị trường" — text-title-lg (20px, weight 700), text-primary

Market tabs (below header, sticky):
  Tabs:     "🇻🇳 Việt Nam" | "🇰🇷 Hàn Quốc" | "🌏 Toàn cầu"
  Height:   44px
  Style:    Underline tabs
  Active:   text-primary, 2px border-bottom accent-primary
  Inactive: text-secondary
  Default:  VN for VN users, KR for KR users, Global otherwise
  Swipe:    Horizontal swipe switches tabs
```

### VN Tab Content

**Index Cards (Bento 2×1)**
```
mx: 16px, mt: 16px, gap: 8px

Large index card (HOSE/VN30):
  Width:      343px
  Height:     100px
  Background: bg-card
  Border:     border 1px
  Radius:     radius-lg (16px)
  Padding:    16px

  Content:
    Left:   "VN-Index" — text-caption-bold (12px), text-secondary
            "1.284,52" — text-display-md (24px, weight 700), tabular-nums, text-primary, mt: 4px
            "+10,84 (+0,85%)" — text-body-sm (13px), positive, mt: 4px
    Right:  Mini 7-day sparkline, 80×40px, accent-secondary

Small cards row (2 col):
  "HNX-Index" + "VN30" side by side
  Width: 167.5px each, height: 72px
```

**Sector Performance**
```
mt: 24px, mx: 16px

Label: "Hiệu suất ngành" — text-title-sm (16px, weight 600), mb: 12px

Sector row (each):
  Height: 44px
  Flex-row, align-center, justify-space-between
  Left:   Sector name "Ngân hàng" — text-body-md (14px, weight 500), text-primary
  Center: Horizontal bar (relative performance), height: 4px, radius-full
          Positive bar: positive (#10B981), Negative: negative (#EF4444)
          Width proportional to % change within ±5% range
  Right:  "+1.25%" — text-body-sm (13px, weight 600), positive/negative, tabular-nums

Divider: 1px border between rows
Sectors (8 shown): Ngân hàng | Bất động sản | Công nghệ | Tiêu dùng | Năng lượng | Dược phẩm | Sản xuất | Vật liệu
```

**Top Movers (Gainers / Losers toggle)**
```
mt: 24px, mx: 16px

Header row:
  Left:    "Top biến động" — text-title-sm (16px, weight 600)
  Right:   Toggle pills: "Tăng" | "Giảm"
           Active: positive/negative bg-subtle, positive/negative text
           Inactive: bg-card, text-secondary

Stock row (each):
  Height:  60px
  Content: Logo (32px) | Ticker + Name | Price | Change %
  Same design as Watchlist row (Home screen)
  Show: 5 rows each (Gainers / Losers)
  "Xem thêm" link below: loads 10 more
```

### KR Tab Content
```
Same structure as VN, adapted:
  Indices: "KOSPI" + "KOSDAQ"
  Currency: ₩ prefix
  Locale: ko-KR formatting
  Sectors: Korean market sectors (반도체/IT, 금융, 바이오 등)
  Social proof text: "명이 보고 있어요"
```

### Global Tab Content
```
Same structure, adapted:
  Indices: S&P 500 | NASDAQ | DJIA | VN30 (cross-reference)
  Currency: $ prefix
  Key stocks: Apple, TSMC, Samsung (cross-listed)
```

### Interaction Rules
```
Market tab tap / swipe   → Switch market, content animates (fade 250ms)
Sector row tap           → Filter Discover feed to that sector (navigate to Discover)
Top movers toggle        → Switch between gainers/losers
Stock row tap            → Navigate to Stock Detail
"Xem thêm" tap          → Expand list (10 more rows with skeleton)
Pull down                → Refresh market data
```

### States
```
Default:   All indices and movers loaded
Loading:   Skeleton for index cards (2 rectangles), sector bars (8 rows), movers (5 rows)
Error:     "Dữ liệu thị trường tạm thời không khả dụng" + retry
Market closed: Indices show "Đã đóng cửa" chip, last close values
```

### Dev Handoff Specs
```
Tab content:
  Animated.FlatList with lazy loading per tab
  Tab indicator: Animated.View sliding underline, 200ms ease-standard

Sector bar:
  Width calculated: Math.abs(change%) / 5 * maxBarWidth (px)
  Cap at maxBarWidth = 80px
  Animated.View width on mount, 400ms stagger 30ms per row

Market closed detection:
  Check exchange hours per market (VN: 9:00–15:00 ICT, KR: 9:00–15:30 KST, US: 9:30–16:00 ET)
  Show "Đã đóng cửa" badge on index card header
```

### QA Tests
```
[ ] Default tab correct per user nationality
[ ] Tab switching smooth (no layout shift)
[ ] Swipe gesture switches tabs
[ ] Sector bars proportional to % change
[ ] Movers toggle switches between gainers/losers
[ ] Market closed state shown outside market hours
[ ] Pull-to-refresh works
[ ] Stock row tap navigates to correct Stock Detail
```

---

## Screen 8 — Price Alert Setup

### Screen Overview
```
Screen: Price Alert Setup (Bottom Sheet)
User:   User who wants to be notified when a stock reaches a target price
Goal:   Set a price threshold alert for a specific stock (1 per stock, V1)
```

### Layout
```
Trigger:    Bottom sheet (full-height, slides up from Stock Detail)
Background: bg-card
Radius:     radius-xl (24px) top corners only
Handle:     4×32px pill, bg-border, centered, mt: 12px
```

### Sheet Content

**Header**
```
mt: 16px, mx: 16px
Title:     "Cài đặt cảnh báo giá" — text-title-lg (20px, weight 700), text-primary
Close:     × icon (24px), text-secondary, absolute top-right, touch 44×44px
```

**Stock Reference Row**
```
mt: 16px, mx: 16px, pb: 16px, border-bottom: border 1px

Logo:      40×40px, radius-full
Right:
  Ticker:  "VCB" — text-title-sm (16px, weight 700), text-primary
  Name:    "Vietcombank" — text-body-sm (13px), text-secondary
Far right:
  Current: "Giá hiện tại" — text-caption (11px), text-secondary
  Price:   "₫88.000" — text-title-sm (16px, weight 700), tabular-nums, text-primary
```

**Condition Toggle**
```
mt: 24px, mx: 16px

Label:   "Cảnh báo khi giá" — text-body-md (14px, weight 500), text-secondary, mb: 12px

Toggle row:
  2 options side by side, width: (343-8)/2 = 167.5px each, height: 48px
  Left:  "≥ Vượt ngưỡng" (above target) — icon: trending-up 16px
  Right: "≤ Xuống dưới" (below target) — icon: trending-down 16px

  Default selected: "≥ Vượt ngưỡng"
  Selected style:  accent-primary bg, #FFFFFF text, border: accent-primary
  Unselected:      bg-card, text-secondary, border: border
  Radius:          radius-md (12px)
```

**Target Price Input**
```
mt: 24px, mx: 16px

Label:    "Mức giá mục tiêu" — text-body-sm (13px, weight 500), text-secondary, mb: 8px

Input container:
  Height:   64px
  Background: bg-secondary (#161B22)
  Border:   border (#374151) 1px, radius-md (12px)
  Focus:    border-focus (#3B82F6) 2px
  Padding:  horizontal 16px

  Currency prefix: "₫" — text-title-md (18px, weight 700), text-secondary, mr: 8px
  Input:           numeric keyboard, text-display-md (24px, weight 700), tabular-nums, text-primary
  Placeholder:     "0" in text-tertiary

Preview row (below input, mt: 8px):
  "Sẽ thông báo khi VCB ≥ ₫{value}" — text-body-sm (13px), text-secondary
  Updates live as user types
  When no value: hide preview row
```

**Notification Preview**
```
mt: 24px, mx: 16px

Card:
  Background: accent-primary-subtle
  Border:     accent-primary 1px
  Radius:     radius-md (12px)
  Padding:    12px
  Height:     auto

  Left:       bell icon 20px, accent-primary
  Right:
    Title:    "Paave sẽ thông báo cho bạn" — text-body-sm (13px, weight 600), text-primary
    Subtitle: "Thông báo đẩy (Push Notification) khi điều kiện đạt" — text-caption (12px), text-secondary
```

**Action Buttons**
```
mt: 24px, mx: 16px, mb: 32px + safe-area

Primary — "Lưu cảnh báo":
  Width:      343px
  Height:     52px
  Radius:     radius-lg (16px)
  Enabled:    Background accent-primary, text #FFFFFF, shadow-glow-accent
  Disabled:   bg-card, text-tertiary, border: border
  Enabled when: target price > 0 AND different from current alert (if editing)

Secondary (only when editing existing alert) — "Xóa cảnh báo":
  Width:      343px
  Height:     44px
  Radius:     radius-lg (16px)
  Style:      text button (no bg), text: negative (#EF4444), 14px weight 500
  mt: 12px
```

### Interaction Rules
```
Condition toggle tap   → Switch above/below, preview text updates instantly
Price input type       → Preview sentence updates live
"Lưu cảnh báo" tap     → Save (API call) → success → sheet dismisses
Sheet dismiss:
  Success: Stock Detail bell icon → filled/accent, CTA button → "Đang theo dõi giá"
  Toast: "Sẽ thông báo khi VCB ≥ ₫90.000"
"Xóa cảnh báo" tap    → Confirmation bottom alert → confirm deletes
Swipe down sheet       → Dismiss without saving
```

### States
```
Default (new alert):
  Condition: "≥" selected
  Price input: empty
  Preview: hidden
  "Lưu" button: disabled

Input filled:
  Preview visible
  "Lưu" button: enabled

Editing existing alert:
  Pre-fills current threshold and condition
  "Xóa cảnh báo" button visible
  "Lưu" enabled only if value changed

Saving (loading):
  "Lưu" button: loading spinner, disabled

Success:
  Sheet dismisses
  Toast notification appears

Error:
  Toast: "Không thể lưu cảnh báo, thử lại" (3s auto-dismiss)
  Button returns to enabled state
```

### Edge Cases
```
Price = current price: Allow saving (user may want exact match trigger)
Price = 0: CTA disabled, no preview
Non-numeric input: Numeric keyboard prevents this on mobile
Alert limit (1 per stock V1): Already handled — sheet opens in edit mode if alert exists
Network error on save: Show error toast, keep sheet open
```

### Dev Handoff Specs
```
Sheet:
  Type:           BottomSheet (react-native-bottom-sheet)
  snapPoints:     ['75%'] — fixed height
  enablePanDownToClose: true
  backdropOpacity: 0.6

Price input:
  keyboardType:    'numeric'
  onChangeText:    parse to number, format with locale separator on blur
  maxLength:       10 digits

Preview update:
  Debounce: 0ms (instant, it's just string interpolation)

Save flow:
  1. Validate: price > 0
  2. Call API: POST /alerts { ticker, condition, threshold }
  3. On success: close sheet + show toast
  4. On fail: show error toast, keep sheet open

Delete confirmation:
  Platform: Alert.alert() — native OS alert dialog
  Buttons: "Hủy" (cancel) | "Xóa" (destructive)
```

### QA Tests
```
[ ] Sheet opens from Stock Detail CTA (both bell icon and CTA button)
[ ] Condition toggle switches between ≥ and ≤
[ ] Preview text updates as user types price
[ ] "Lưu" disabled when price is empty or zero
[ ] "Lưu" enabled when valid price entered
[ ] Save success: sheet closes, toast shows, bell icon updates
[ ] Save error: toast shows, sheet stays open
[ ] Edit mode: pre-fills existing alert values
[ ] Edit mode: "Xóa" button visible and triggers confirmation
[ ] Delete confirmation shown before deletion
[ ] Swipe down dismisses without saving
[ ] Numeric keyboard shown automatically
```

---

## Screen 9 — Profile / Settings

### Screen Overview
```
Screen: Profile / Settings
User:   User managing their account, preferences, and watchlist
Goal:   View/edit profile, manage alerts, configure app language and theme
```

### Layout
```
Header:     Screen title
Main:       Scrollable settings list
Bottom:     Persistent nav bar
```

### Header
```
Height:    56px + safe-area-inset-top
Center:    "Tôi" — text-title-lg (20px, weight 700), text-primary
```

### Main Content

**Section 1 — User Identity Card**
```
mx: 16px, mt: 16px
Height:     100px
Background: bg-card
Border:     border 1px
Radius:     radius-xl (24px)
Padding:    16px

Left:    Avatar circle (48×48px), bg: accent-primary, initials text
         (No photo upload in V1)
Right:
  Name:    "{name}" — text-title-lg (20px, weight 700), text-primary
  Sub:     "Nhà đầu tư Gen Z · Thành viên từ 04/2026" — text-caption (12px), text-secondary
  Stats:   "8 CP theo dõi · 1 cảnh báo" — text-body-sm (13px), text-secondary, mt: 4px
```

**Section 2 — My Watchlist**
```
mt: 24px, mx: 16px

Label:  "Danh sách theo dõi" — text-title-sm (16px, weight 600), mb: 12px

Compact stock rows (same as Home watchlist, height: 56px)
Max 5 shown, "Xem tất cả (8)" link → Full Watchlist screen (push)

If empty: 
  "Chưa theo dõi cổ phiếu nào" + "Khám phá ngay →" link
```

**Section 3 — Price Alerts**
```
mt: 24px, mx: 16px

Label:  "Cảnh báo giá" — text-title-sm (16px, weight 600), mb: 12px

Alert row (each):
  Height:    56px
  Left:      Bell icon 20px (accent-primary if active, text-secondary if paused)
  Right of icon:
    Ticker:  "VCB" — text-body-md (14px, weight 600), text-primary
    Condition: "≥ ₫90.000" — text-caption (12px), text-secondary
  Far right:
    Toggle switch: on/off (native-style), accent-primary when on

  Tap row → opens Price Alert Setup sheet in edit mode

If empty:
  "Chưa có cảnh báo nào" + "Đặt cảnh báo →" link
```

**Section 4 — App Settings (List)**
```
mt: 24px, mx: 16px

Settings group — "Cài đặt ứng dụng":
  Row items (each: height 52px, border-bottom: border-subtle 1px):
    "Ngôn ngữ"        → right: current value "Tiếng Việt" + chevron → Language picker
    "Giao diện"        → right: "Tối" + chevron → Theme picker (dark/light)
    "Thị trường mặc định" → right: "Việt Nam" + chevron → Market picker

Settings group — "Thông tin":
  mt: 24px
  "Phiên bản ứng dụng"  → right: "1.0.0" (no chevron, not tappable)
  "Điều khoản dịch vụ" → right: chevron → opens browser/webview
  "Chính sách bảo mật" → right: chevron → opens browser/webview

Row style:
  Label:   text-body-md (14px, weight 400), text-primary
  Value:   text-body-md (14px), text-secondary
  Chevron: chevron-right 16px, text-tertiary, ml: 8px
  Touch:   Full row, 52px min height
```

**Section 5 — Danger Zone**
```
mt: 32px, mx: 16px, pb: 100px

"Đặt lại thông tin cá nhân" — text-body-md (14px), negative (#EF4444), touch
  Confirmation alert → clears name + nationality, returns to onboarding
```

### Interaction Rules
```
Alert row toggle     → Enable/disable alert (API call, optimistic)
Alert row tap        → Open Price Alert Setup sheet (edit mode)
Language tap         → ActionSheet or picker (options: Tiếng Việt / 한국어 / English)
Theme tap            → ActionSheet (Tối / Sáng / Hệ thống)
TOS / Privacy tap    → Open in-app browser (SafariViewController / Chrome Tab)
"Xem tất cả" tap     → Push: Full Watchlist Management screen
Reset tap            → Native confirm alert → execute reset
```

### States
```
Default:   Profile loaded with stats and lists
Loading:   Brief skeleton for watchlist + alert rows (300ms)
Empty watchlist: Illustrated empty state
Empty alerts:    Illustrated empty state
```

### Dev Handoff Specs
```
Avatar initials:
  Extract first letter of first word + first letter of last word (if 2+ words)
  Single word: first 2 chars
  Background: deterministic color from ticker of user name hash (one of 6 palette colors)

Alert toggle:
  optimisticUpdate → PATCH /alerts/{id} { active: bool }
  On fail: revert toggle, show error toast

Language change:
  Update AsyncStorage locale key + re-render app with new i18n context
  No app restart needed
```

### QA Tests
```
[ ] User name and stats display correctly
[ ] Watchlist shows up to 5 rows, "Xem tất cả" link appears when >5
[ ] Alert toggle enables/disables alert
[ ] Alert row tap opens edit sheet
[ ] Language change reflects immediately in UI
[ ] Theme change applies immediately
[ ] TOS and Privacy open in in-app browser
[ ] Reset confirmation prevents accidental trigger
[ ] Empty states shown for empty watchlist and alerts
```

---

## Screen 10 — Paper Trading Order (Buy/Sell)

### Screen Overview
```
Screen: Paper Trading Order
User:   User placing a virtual buy or sell order
Goal:   Execute simulated market or limit order with pre-trade AI context
Trigger: "Mua" / "Bán" button from Stock Detail
```

### Layout
```
Header:     Navigation bar (back + "Lệnh mua VCB" or "Lệnh bán VCB")
Main:       Scrollable — order form
Bottom:     Sticky confirm button
```

### Header / Navigation Bar
```
Height:     56px + safe-area-inset-top
Background: bg-primary
Left:       Back arrow (arrow-left 20px), text-secondary, 44×44px touch
Center:     "Lệnh mua VCB" — text-title-md (18px, weight 700), text-primary
            Buy mode: positive (#10B981) text; Sell mode: negative (#EF4444) text
```

### Virtual Funds Banner (Mandatory — FR-PT-06)
```
Position:   Below header, full width, sticky
Height:     32px
Background: warning-subtle (rgba(245,158,11,0.15))
Border:     warning (#F59E0B) 1px bottom
Text:       "Tiền ảo / 가상 자금 / Virtual Funds" — text-caption (12px, weight 600), warning
Align:      center
Non-dismissible
```

### Main Content

**Section 1 — Stock Summary**
```
mx: 16px, mt: 16px

Row:
  Logo:     40×40px, radius-full
  Right:
    Ticker: "VCB" — text-title-sm (16px, weight 700), text-primary
    Name:   "Vietcombank" — text-body-sm (13px), text-secondary
  Far right:
    Price:  "₫88.000" — text-title-sm (16px, weight 700), tabular-nums
    Change: "+2,15%" — text-body-sm (13px), positive/negative
```

**Section 2 — Pre-Trade AI Card (FR-AI-04, collapsible)**
```
mx: 16px, mt: 16px

Card:
  Background: accent-primary-subtle
  Border:     accent-primary 1px
  Radius:     radius-md (12px)
  Padding:    16px

  Header row:
    Left:   "🤖 Phân tích AI" — text-body-sm (13px, weight 600), accent-primary
    Right:  Collapse chevron icon 16px

  Content (when expanded):
    Risk score:     "Rủi ro: 6/10" — text-body-md (14px, weight 600), warning
    Position size:  "Đề xuất: 8% danh mục" — text-body-sm (13px), text-primary
    3 bullets:      "3 điều cần biết:" — text-caption-bold (12px), text-secondary
                    • "Lợi nhuận quý vượt kỳ vọng 12%"
                    • "P/E hiện tại cao hơn trung bình ngành"
                    • "Khối lượng giao dịch tăng 40% tuần qua"
                    text-body-sm (13px), text-primary

  Footer:   Disclaimer (FR-LEGAL-02) — text-caption (11px), text-tertiary
            "Nội dung AI chỉ mang tính giáo dục. Không phải lời khuyên đầu tư."

  Loading:  Skeleton card, 2s timeout → "Phân tích bị bỏ qua — tiếp tục đặt lệnh."
```

**Section 3 — Order Type Toggle**
```
mx: 16px, mt: 24px

Label:  "Loại lệnh" — text-body-sm (13px, weight 500), text-secondary, mb: 8px

Toggle row:
  2 options, width: (343-8)/2 each, height: 44px
  Left:  "Thị trường" (Market) — selected by default
  Right: "Giới hạn" (Limit)
  Selected: accent-primary bg, #FFFFFF text, radius-md
  Unselected: bg-card, text-secondary, border: border, radius-md
```

**Section 4 — Quantity Input**
```
mx: 16px, mt: 24px

Label:    "Số lượng (CP)" — text-body-sm (13px, weight 500), text-secondary, mb: 8px

Input:
  Height:   64px
  Background: bg-secondary (#161B22)
  Border:   border 1px, radius-md (12px)
  Focus:    border-focus 2px
  Padding:  horizontal 16px
  Value:    numeric, text-display-md (24px, weight 700), tabular-nums, text-primary
  Placeholder: "0"
  Keyboard: numeric

Quick quantity chips (below input, mt: 8px):
  "10 CP" | "50 CP" | "100 CP" | "Tối đa"
  Chip: height 28px, radius-full, bg-card, border, text-body-sm
  Tap fills quantity input with value
```

**Section 5 — Limit Price (visible only when Limit order selected)**
```
mx: 16px, mt: 16px

Label:    "Giá giới hạn" — text-body-sm, text-secondary, mb: 8px

Input:
  Same style as Quantity Input
  Currency prefix: "₫"
  Placeholder: current price
```

**Section 6 — Order Summary**
```
mx: 16px, mt: 24px, pb: 120px

Card:
  Background: bg-card
  Border:     border 1px
  Radius:     radius-md (12px)
  Padding:    16px

  Rows (label: value pairs):
    "Giá thị trường"  / "₫88.000"       — text-body-sm / text-body-sm weight 600
    "Số lượng"         / "10 CP"
    "Phí giao dịch"   / "₫880" (0,1%)
    Divider: border 1px, my: 12px
    "Tổng cộng"       / "₫880.880"      — text-title-sm weight 700 / text-title-sm weight 700, text-primary

  Available balance:
    "Số dư khả dụng: ₫499.119.120" — text-caption (12px), text-secondary, mt: 8px
```

### Sticky Confirm Button (Bottom)
```
Position:   fixed bottom
Height:     80px + safe-area-inset-bottom
Background: bg-card, top border: border 1px
Padding:    horizontal 16px, vertical 14px

Button:
  Width:    343px
  Height:   52px
  Radius:   radius-lg (16px)
  Buy:      Background positive (#10B981), text #FFFFFF, "Xác nhận mua 10 VCB"
  Sell:     Background negative (#EF4444), text #FFFFFF, "Xác nhận bán 10 VCB"
  Disabled: bg-card, text-tertiary (when qty = 0 or insufficient balance)
  Shadow:   0 0 16px rgba(16,185,129,0.25) for buy / rgba(239,68,68,0.25) for sell
```

### Interaction Rules
```
Order type toggle    → Switch between market/limit, show/hide limit price field
Quantity chip tap    → Fill quantity field with value
"Tối đa" chip       → Calculate max affordable quantity from balance
Confirm tap          → Show confirmation bottom sheet → execute order
AI card collapse     → Toggle expanded/collapsed state
Back button          → Cancel order, return to Stock Detail
```

### States
```
Default:      Market order selected, quantity empty, confirm disabled
AI loading:   Skeleton AI card, 2s timeout
AI loaded:    Card expanded with risk score + bullets
Input filled: Order summary visible, confirm enabled (if balance sufficient)
Insufficient: Red text "Số dư không đủ", confirm disabled
Loading:      Confirm button shows spinner, disabled
Success:      Bottom sheet → "Lệnh đã được thực hiện!" + post-trade AI card
Error:        Toast "Không thể thực hiện lệnh, thử lại"
```

### Dev Handoff Specs
```
Virtual funds banner: Always visible, never dismissible (FR-PT-06, BR-18)
AI card timeout:      2000ms → graceful skip (FR-AI-04)
Max quantity:         Math.floor(availableBalance / (price * 1.001))
Order execution:      POST /paper-trades { ticker, side, type, quantity, limitPrice? }
Fee calculation:      0.1% of (price × quantity) — display only, deducted from virtual balance
Confirmation sheet:   BottomSheet snapPoints ['40%'], swipe to dismiss = cancel
```

### QA Tests
```
[ ] Virtual Funds banner visible and non-dismissible
[ ] AI card loads within 2s or shows skip message
[ ] AI card collapsible
[ ] Market/Limit toggle works correctly
[ ] Limit price field only visible for Limit orders
[ ] Quantity chips fill input correctly
[ ] "Tối đa" calculates max affordable quantity
[ ] Order summary updates in real-time as inputs change
[ ] Confirm disabled when quantity is 0
[ ] Confirm disabled when balance insufficient
[ ] Success: bottom sheet with confirmation
[ ] Post-trade AI explanation appears after success
[ ] Disclaimer visible on AI card
```

---

## Screen 11 — Post-Trade Explanation (Bottom Sheet)

### Screen Overview
```
Screen: Post-Trade Explanation (Bottom Sheet)
User:   User who just completed a paper trade
Goal:   Educate user on what happened, why, and what to watch next
Trigger: Auto-appears after trade fills (FR-AI-01)
```

### Layout
```
Type:       Bottom sheet (75% screen height)
Background: bg-card
Radius:     radius-xl (24px) top corners
Handle:     4×32px pill, bg-border, centered, mt: 12px
```

### Content
```
Header:
  "📊 Phân tích giao dịch" — text-title-lg (20px, weight 700), text-primary
  Close × icon top-right, 44×44px

Trade reference (mt: 16px):
  "Đã mua 10 VCB @ ₫88.000" — text-body-md (14px, weight 600), positive
  Timestamp — text-caption (12px), text-secondary

Section 1 — "Chuyện gì đã xảy ra?" (mt: 24px):
  Icon: 📈 info 16px
  Title: text-title-sm (16px, weight 600), text-primary
  Body:  text-body-md (14px), text-primary, line-height 1.6
         "VCB đang giao dịch gần mức cao nhất 52 tuần. Khối lượng giao dịch
          hôm nay tăng 35% so với trung bình 20 ngày."

Section 2 — "Vì sao?" (mt: 20px):
  Icon: 💡
  Title: text-title-sm
  Body:  "Báo cáo lợi nhuận Q1/2026 vượt kỳ vọng 12%. ROE đạt 18,5%,
          cao nhất ngành ngân hàng."

Section 3 — "Cần theo dõi gì?" (mt: 20px):
  Icon: 👀
  Title: text-title-sm
  Body:  "Theo dõi phiên họp NHNN ngày 20/04 về lãi suất. Nếu lãi suất
          giữ nguyên, cổ phiếu ngân hàng có thể tiếp tục xu hướng tăng."

Rating row (mt: 24px):
  "Phân tích này hữu ích không?" — text-body-sm (13px), text-secondary
  👍 / 👎 buttons, 44×44px each, bg-card, border, radius-full

Disclaimer (mt: 16px, mb: 32px):
  text-caption (11px), text-tertiary
  "Nội dung AI chỉ mang tính giáo dục. Không phải lời khuyên đầu tư."
```

### States
```
Default:   Sections loaded, expanded
Loading:   Skeleton text blocks (3 sections)
Error:     "Phân tích tạm thời không khả dụng. Kiểm tra lại sau."
Dismissed: Sheet closes, not shown again for this trade
```

---

## Screen 12 — Order History & Open Orders

### Screen Overview
```
Screen: Order History (Tab within Portfolio)
User:   User reviewing past trades and pending orders
Goal:   View all paper trade history and manage open limit orders
```

### Layout
```
Header:     "Lịch sử lệnh" — screen title
Tabs:       "Đã thực hiện" | "Đang chờ" (2 tabs)
Main:       Scrollable list of orders
Bottom:     Persistent nav bar
```

### Tab 1 — Executed Orders ("Đã thực hiện")
```
Order row (each):
  Height:     72px
  Background: none (divider between rows)
  Padding:    horizontal 16px

  Left:
    Type icon:  Buy = arrow-up-circle, positive bg-subtle, 36×36px
                Sell = arrow-down-circle, negative bg-subtle, 36×36px
    Right of icon (ml: 12px):
      "Mua VCB" — text-title-sm (16px, weight 600), text-primary
      "14/04/2026 · 09:30 · Thị trường" — text-caption (12px), text-secondary

  Right:
    "+10 CP" or "-10 CP" — text-body-sm (13px, weight 600), positive/negative
    "₫880.000" — text-caption (12px), text-secondary
    
  Divider: border 1px

  Pre-reset entries: "[Pre-Reset]" tag, text-caption, warning-subtle bg, warning text

Sort: Reverse chronological
Pagination: Load 20, infinite scroll
```

### Tab 2 — Open Orders ("Đang chờ")
```
Order row (each):
  Height:     80px
  Background: bg-card, radius-md
  Margin:     horizontal 16px, bottom 8px
  Padding:    16px

  Left:
    "Mua VCB" — text-title-sm (16px, weight 600), text-primary
    "Giới hạn ≤ ₫85.000" — text-body-sm (13px), text-secondary
    "Hết hạn: 14/05/2026 (28 ngày)" — text-caption (12px), text-secondary

  Right:
    "10 CP" — text-body-sm (13px, weight 600), text-primary
    "Hủy" button — text-body-sm (13px), negative, touchable, 44×44px min

  Tap "Hủy" → Confirmation alert → cancel order → remove from list
  Empty state: "Không có lệnh đang chờ"
```

### States
```
Default:   Orders loaded
Loading:   Skeleton rows (5 rows)
Empty (executed): "Chưa có giao dịch nào" + "Bắt đầu giao dịch →" CTA
Empty (open):     "Không có lệnh đang chờ"
Error:     "Không thể tải lịch sử" + retry
```

---

## Screen 13 — AI Chat Interface

### Screen Overview
```
Screen: AI Chat (Natural Language Stock Query)
User:   User asking questions about stocks in VN/KR/EN
Goal:   Get AI-powered educational answers about stocks (FR-AI-02)
Trigger: AI icon in tab bar or dedicated entry point
```

### Layout
```
Header:     "Hỏi Paave AI" — screen title + info icon
Main:       Chat message list (scrollable)
Bottom:     Text input bar (sticky)
```

### Header
```
Height:     56px + safe-area-inset-top
Left:       Back arrow or close ×
Center:     "🤖 Paave AI" — text-title-md (18px, weight 700), text-primary
Right:      Info icon (24px) → shows AI disclaimer modal
```

### Chat Messages
```
AI welcome message (first visit):
  "Xin chào! Tôi có thể giúp bạn tìm hiểu về cổ phiếu trên sàn HOSE,
   HNX (Việt Nam) và KOSPI, KOSDAQ (Hàn Quốc). Hãy hỏi bất cứ điều gì!"
  
User message bubble:
  Align:      right
  Background: accent-primary
  Text:       #FFFFFF, text-body-md (14px)
  Radius:     16px (top-left, top-right, bottom-left), 4px (bottom-right)
  Max-width:  280px
  Padding:    12px 16px

AI response bubble:
  Align:      left
  Background: bg-card (#1F2937)
  Text:       text-primary, text-body-md (14px), line-height: 1.6
  Radius:     16px (top-left, top-right, bottom-right), 4px (bottom-left)
  Max-width:  310px
  Padding:    12px 16px

  Source attribution (below bubble, mt: 4px):
    "Nguồn: Dữ liệu HOSE ngày 15/04/2026" — text-caption (11px), text-tertiary

  Disclaimer (below source):
    "AI · Giáo dục, không phải tư vấn" — text-caption (10px), text-tertiary

AI typing indicator:
  3 animated dots in bg-card bubble, bounce animation

Stock mention in response:
  "$VCB" rendered as accent-primary text, touchable → Stock Detail
```

### Input Bar
```
Position:   fixed bottom, above keyboard when active
Height:     56px + safe-area-inset-bottom
Background: bg-card, top border: border 1px
Padding:    horizontal 12px, vertical 8px

Input field:
  Height:   40px
  Background: bg-secondary
  Border:   border 1px, radius-full
  Padding:  horizontal 16px
  Placeholder: "Hỏi về cổ phiếu..." — text-tertiary, 14px
  Text:     text-primary, 14px

Send button:
  Right of input, 40×40px, radius-full
  Default: bg-card, arrow-up icon, text-tertiary (disabled when empty)
  Active:  accent-primary bg, #FFFFFF arrow icon
```

### Interaction Rules
```
Send tap / Enter     → Send message, AI typing indicator shows
AI response          → Bubble appears with typing animation
$TICKER in response  → Tappable, navigates to Stock Detail
Out-of-scope query   → "Tôi chỉ có thể trả lời về cổ phiếu VN và KR."
AI timeout (>10s)    → "Đang mất nhiều thời gian hơn bình thường. Thử lại?"
Close/back           → Conversation cleared (10-turn max in session)
```

### States
```
Default:    Welcome message + empty input
Typing:     AI typing indicator visible
Loaded:     Messages in conversation
Error:      Error bubble from AI with retry link
Empty:      Welcome state with suggested questions
```

### Suggested Questions (Empty State)
```
Below welcome message, mt: 16px

Chips (2 per row, 2 rows):
  "VCB có đáng mua không?"
  "So sánh FPT và VNM"
  "P/E của HPG là bao nhiêu?"
  "Ngành ngân hàng VN ra sao?"

Chip style: bg-card, border, radius-lg, px: 12px, py: 8px, text-body-sm
Tap → fills input and sends
```

---

## Screen 14 — Community Feed (Per-Ticker)

### Screen Overview
```
Screen: Community Feed (Tab within Stock Detail)
User:   User reading community opinions about a stock
Goal:   View Bull/Bear/Neutral posts from other users (FR-SOC-02)
```

### Layout
```
Tab:        "Cộng đồng" tab within Stock Detail (alongside Chart, Stats)
Main:       Scrollable post list
Bottom:     Floating "Viết bài" FAB button
```

### Sentiment Summary Bar
```
Height:     44px
mx: 16px, mt: 12px
Background: bg-card, radius-md
Padding:    horizontal 12px

Content:    Horizontal bar showing Bull/Bear/Neutral ratio
  Green segment (Bull %) | Red segment (Bear %) | Gray segment (Neutral %)
  Height: 6px, radius-full
  Below bar: "62% Bull · 28% Bear · 10% Neutral" — text-caption (11px), text-secondary
  Requires ≥5 posts in 24h; otherwise "Chưa đủ bài viết để hiển thị tâm lý"
```

### Post Card (Each)
```
Width:      343px
Background: bg-card
Border:     border 1px
Radius:     radius-md (12px)
Padding:    16px
Margin:     horizontal 16px, bottom 8px

Row 1 — Author:
  Avatar:   28×28px, radius-full, bg-accent with initials
  Right (ml: 8px):
    Pseudonym: "trader_minh" — text-body-sm (13px, weight 600), text-primary
    Badge:     "Lv.3 Trader" — text-caption (11px), accent-primary-subtle bg, accent-primary text, radius-sm
  Far right:
    Timestamp: "2h trước" — text-caption (11px), text-secondary

Row 2 — Sentiment tag (mt: 8px):
  Bull:    "🟢 Bull" — positive-subtle bg, positive text, radius-full, px: 8px, py: 2px
  Bear:    "🔴 Bear" — negative-subtle bg, negative text
  Neutral: "⚪ Neutral" — bg-card, border, text-secondary

Row 3 — Post text (mt: 8px):
  Max 280 characters, text-body-md (14px), text-primary, line-height: 1.5
  $TICKER cashtags rendered as accent-primary text, touchable

Row 4 — Engagement (mt: 12px):
  "👍 12" | "💬 3" — text-caption (12px), text-secondary, gap: 16px
```

### Floating Action Button
```
Position:   bottom-right, 16px from edges, above bottom bar
Size:       56×56px
Background: accent-primary
Icon:       pencil/edit 24px, #FFFFFF
Shadow:     shadow-card-raised
Radius:     radius-full
Tap → Post Creation (Screen 15)
```

### States
```
Default:    Posts loaded (newest 20)
Loading:    Skeleton post cards (3)
Empty:      "Hãy là người đầu tiên viết về $VCB" + "Viết bài →" CTA
Infinite:   Spinner at bottom, load 20 more
Error:      "Không thể tải bài viết" + retry
```

---

## Screen 15 — Post Creation

### Screen Overview
```
Screen: Post Creation (Bottom Sheet or Push Screen)
User:   User writing a community post
Goal:   Publish opinion with $TICKER tag and sentiment (FR-SOC-03)
```

### Layout
```
Type:       Full-screen push or 90% bottom sheet
Header:     "Viết bài" + Close × + character count
Main:       Text area + ticker + sentiment selector
Bottom:     Publish button
```

### Content
```
Header:
  Left:   × Close, 44×44px
  Center: "Viết bài" — text-title-md (18px, weight 700)
  Right:  "247/280" character counter — text-caption (12px), text-secondary
          Turns negative (#EF4444) at >280

Ticker tag row (mt: 16px, mx: 16px):
  Label: "Cổ phiếu" — text-body-sm (13px, weight 500), text-secondary
  Tag:   "$VCB" — accent-primary-subtle bg, accent-primary text, radius-full, px: 10px, height: 28px
  "+" button to add more tickers (max 5)
  
Sentiment selector (mt: 16px, mx: 16px):
  Label: "Quan điểm của bạn" — text-body-sm, text-secondary, mb: 8px
  3 options horizontal:
    "🟢 Bull"    — positive-subtle bg when selected, positive border 2px
    "🔴 Bear"    — negative-subtle bg when selected, negative border 2px
    "⚪ Trung lập" — bg-card when selected, border 2px
  Each: height 40px, radius-full, px: 16px
  Required before publish

Text area (mt: 16px, mx: 16px):
  Height:   200px (min), auto-expand
  Background: bg-secondary
  Border:   border 1px, radius-md
  Focus:    border-focus 2px
  Padding:  16px
  Placeholder: "Chia sẻ quan điểm của bạn về $VCB..." — text-tertiary, 14px
  Font:     text-body-md (14px), text-primary

Publish button (bottom, mx: 16px, mb: 32px + safe-area):
  Width:    343px
  Height:   52px
  Radius:   radius-lg (16px)
  Enabled:  accent-primary bg, #FFFFFF text, "Đăng bài (60s hủy)"
  Disabled: bg-card, text-tertiary (when no sentiment or no text)

Post-publish countdown:
  After tap: button changes to "Hủy đăng (58s)" with countdown
  Background: bg-card, border: border
  Text: text-primary, countdown in accent-primary
  60-second cancel window per FR-SOC-03
```

### States
```
Default:    Empty form, $TICKER pre-filled from Stock Detail
Typing:     Character count updates live
Ready:      All fields filled, Publish enabled
Publishing: 60s countdown, cancel available
Published:  Toast "Bài viết đã được đăng!" → return to Community Feed
Cancelled:  Toast "Đã hủy bài viết" → stay on creation screen
Error:      Toast "Không thể đăng, thử lại"
Flagged:    "Bài viết đang được xem xét" (moderation hold)
```

---

## Screen 16 — Social Profile

### Screen Overview
```
Screen: Social Profile (Public)
User:   Viewing own or another user's public profile
Goal:   See pseudonym, Trader Tier, post history, follow/unfollow (FR-SOC-05)
```

### Layout
```
Header:     Back + username
Main:       Scrollable — profile card + stats + post list
Bottom:     (no nav bar — push screen)
```

### Profile Card
```
mx: 16px, mt: 16px

Card:
  Background: bg-card
  Radius:     radius-xl (24px)
  Padding:    24px
  Align:      center

  Avatar:     64×64px, radius-full, accent-primary bg, initials text (24px Bold)
  Name:       "trader_minh" — text-title-lg (20px, weight 700), text-primary, mt: 12px
  Badge:      "🏆 Silver Trader · Lv.3" — text-body-sm (13px), accent-primary, mt: 4px
  Joined:     "Thành viên từ 03/2026" — text-caption (12px), text-secondary, mt: 4px

Stats row (mt: 16px):
  3 columns, equal width:
    "Bài viết" / "42"     — text-caption label / text-title-sm value
    "Người theo dõi" / "128"
    "Đang theo dõi" / "67"
  Dividers: vertical 1px between columns

Follow button (mt: 16px, visible if viewing other user):
  Not following: accent-primary bg, #FFFFFF text, "Theo dõi", width 200px, height 40px
  Following:     accent-primary-subtle bg, accent-primary text, "Đang theo dõi"
```

### Post List
```
mt: 24px
Label: "Bài viết gần đây" — text-title-sm, text-primary, mx: 16px, mb: 12px

Posts: Same design as Community Feed post cards (Screen 14)
Paginated: 20 per load, infinite scroll
```

### States
```
Default:    Profile + posts loaded
Loading:    Skeleton avatar + stats + 3 skeleton posts
No posts:   "Chưa có bài viết nào"
Error:      "Không thể tải hồ sơ" + retry
```

---

## Screen 17 — Portfolio Health Check

### Screen Overview
```
Screen: Portfolio Health Check (Weekly Report)
User:   User viewing AI-generated portfolio analysis
Goal:   See letter grade + 5-dimension radar chart + actionable insights (FR-AI-05)
Trigger: Push notification Monday 8AM or Profile → Notification History
```

### Layout
```
Header:     Back + "Kiểm tra sức khỏe danh mục"
Main:       Scrollable — grade card + radar chart + dimension cards
```

### Grade Hero Card
```
mx: 16px, mt: 16px

Card:
  Height:     160px
  Background: gradient-hero
  Radius:     radius-xl (24px)
  Padding:    24px

  Left:
    "Điểm tổng thể" — text-caption (12px), text-secondary
    Letter grade: "B+" — text-display-xl (48px, weight 800), accent-primary
    "Khá tốt — vài điểm cần cải thiện" — text-body-sm (13px), text-secondary

  Right:
    Date: "Tuần 15/04/2026" — text-caption (12px), text-secondary
```

### Radar Chart
```
mx: 16px, mt: 24px

Size:       280×280px, centered
Type:       5-axis radar/spider chart
Axes:       Đa dạng hóa | Tập trung | Biến động | Phân bổ địa lý | Thanh khoản
Fill:       accent-primary, opacity 0.2
Stroke:     accent-primary, 2px
Grid:       3 concentric pentagons, border-subtle, 1px
Labels:     text-caption (11px), text-secondary, positioned outside axes
```

### Dimension Cards (5 total)
```
mt: 24px, mx: 16px, gap: 8px

Each card:
  Height:     auto
  Background: bg-card
  Border:     border 1px
  Radius:     radius-md (12px)
  Padding:    16px

  Row 1:
    Left:  Dimension icon (16px) + name "Đa dạng hóa" — text-body-md (14px, weight 600)
    Right: Grade "A" — text-title-sm (16px, weight 700), positive/warning/negative based on grade

  Row 2 (mt: 8px):
    Explanation: "Danh mục phân bổ tốt qua 4 ngành. Không có ngành nào chiếm quá 30%."
    text-body-sm (13px), text-secondary

  Row 3 (mt: 8px):
    "Tìm hiểu thêm →" — text-body-sm (13px), accent-primary, touchable
    Tap → opens AI Chat scoped to this dimension

Grade colors:
  A/A+: positive (#10B981)
  B/B+: accent-primary (#3B82F6)
  C/C+: warning (#F59E0B)
  D/F:  negative (#EF4444)
```

### Disclaimer
```
mt: 16px, mx: 16px, mb: 32px
text-caption (11px), text-tertiary
"Nội dung AI chỉ mang tính giáo dục. Không phải lời khuyên đầu tư."
```

---

## Screen 18 — Notification Inbox

### Screen Overview
```
Screen: Notification Inbox
User:   User checking notification history
Goal:   View all past 30 days of notifications (FR-47)
Trigger: Bell icon on Home header or Profile → Thông báo
```

### Layout
```
Header:     "Thông báo" — screen title
Main:       Scrollable notification list
Bottom:     Persistent nav bar (if accessed from tab) or back button
```

### Notification Row
```
Each row:
  Height:     72px
  Padding:    horizontal 16px
  Background: bg-primary (read) / bg-card (unread)
  Border-bottom: border-subtle 1px

  Left:
    Icon circle: 36×36px
      Price alert:     bell icon, warning bg-subtle
      Market open:     sunrise icon, positive bg-subtle
      Market close:    sunset icon, accent-primary bg-subtle
      Watchlist move:  trending-up icon, positive/negative bg-subtle
      AI coaching:     brain icon, accent-primary bg-subtle
      Health check:    heart icon, accent-primary bg-subtle

  Center (ml: 12px):
    Title: "VCB Alert Triggered" — text-body-md (14px, weight 600), text-primary
           Unread: weight 700
    Body:  "Vietcombank đang ở ₫90.200 (+2,5%)" — text-body-sm (13px), text-secondary
           1 line max, truncate

  Right:
    Time: "2h" / "Hôm qua" / "15/04" — text-caption (11px), text-secondary
    Unread dot: 8px, accent-primary (only for unread)

Tap → marks read + navigates to relevant screen
```

### States
```
Default:   Notifications loaded, unread highlighted
Loading:   Skeleton rows (5)
Empty:     "Chưa có thông báo nào" illustration + subtitle
Error:     "Không thể tải thông báo" + retry
```

---

## Screen 19 — Notification Settings

### Screen Overview
```
Screen: Notification Settings
User:   User configuring which notifications to receive
Goal:   Toggle individual notification types on/off (FR-52)
Trigger: Profile → Cài đặt → Thông báo
```

### Layout
```
Header:     Back + "Cài đặt thông báo"
Main:       Settings toggle list
```

### Content
```
Section 1 — "Cảnh báo giá" (mt: 16px):
  Row: "Cảnh báo giá"
    Description: "Thông báo khi cổ phiếu đạt mức giá mục tiêu"
    Toggle: on/off, accent-primary when on

Section 2 — "Thị trường" (mt: 24px):
  Row: "Mở cửa thị trường"
    Description: "Thông báo khi sàn mở cửa giao dịch"
    Toggle: on/off

  Row: "Đóng cửa thị trường"
    Description: "Tóm tắt chỉ số cuối ngày"
    Toggle: on/off

Section 3 — "Danh sách theo dõi" (mt: 24px):
  Row: "Biến động cổ phiếu"
    Description: "Thông báo khi CP theo dõi tăng/giảm ≥5%"
    Toggle: on/off

Section 4 — "AI & Học tập" (mt: 24px):
  Row: "Kiểm tra sức khỏe danh mục"
    Description: "Báo cáo tuần vào thứ Hai 8:00 sáng"
    Toggle: on/off

  Row: "Gợi ý hành vi"
    Description: "Nhắc nhở khi phát hiện FOMO, bán hoảng loạn"
    Toggle: on/off

Row style:
  Height:     72px
  Padding:    horizontal 16px
  Label:      text-body-md (14px, weight 500), text-primary
  Description: text-caption (12px), text-secondary, mt: 2px
  Toggle:     Native switch, 51×31px, accent-primary when on
  Divider:    border-subtle 1px between rows

OS disabled state:
  All toggles grayed out
  Banner at top: "Thông báo bị tắt ở cấp hệ thống. Mở Cài đặt thiết bị để bật."
  text-body-sm (13px), warning, bg: warning-subtle, px: 16px, py: 12px, radius-md
```

---

## Screen 20 — Registration (Data Consent + DOB + Email/Password)

### Screen Overview
```
Screen: Registration (Data Consent + DOB + Account Details)
User:   New user creating an account
Goal:   Collect legally required consent, verify age via DOB, capture email + password
Refs:   FR-05, FR-AGE-01, FR-LEGAL-03, FR-08
```

### Layout
```
Header:     Progress indicator (4 steps), step 1 of 4 active
Main:       Scrollable — consent checkboxes + DOB picker + email/password form
Bottom:     Primary CTA button, sticky
Background: bg-primary (#0D1117)
```

### Progress Indicator
```
Component:  4 dots, horizontal, centered, top: 56px + safe-area
Dot size:   8x8px (inactive), 24x8px pill (active), radius-full
Gap:        8px between dots
Inactive:   bg-card (#1F2937)
Active:     accent-primary (#3B82F6)
Animation:  width 8 to 24px, 150ms ease-spring, color transition 150ms
Step labels (below dots, optional):
  "Consent" | "Market" | "Account" | "Verify"
  text-caption (11px), text-tertiary, mt: 4px
```

### Main Content

**Section 1 — Data Consent (FR-LEGAL-03)**
```
mx: 16px, mt: 24px

Title:      "Dieu khoan su dung" — text-title-lg (20px, weight 700), text-primary
Subtitle:   "Vui long doc va dong y cac dieu khoan truoc khi tiep tuc"
            text-body-sm (13px), text-secondary, mt: 4px

Checkbox group (mt: 24px):

Checkbox 1 (required):
  Height:     auto (min 52px)
  Layout:     flex-row, align-top
  Checkbox:   24x24px, radius-sm (8px), border 2px
              Unchecked: border (#374151), bg transparent
              Checked: bg accent-primary, checkmark icon #FFFFFF 14px
  Touch area: 44x44px minimum
  Label:      "Toi dong y voi Dieu khoan dich vu" — text-body-md (14px), text-primary, ml: 12px
  Link:       "Dieu khoan dich vu" underlined, text-accent (#3B82F6), opens in-app webview
  Tag:        "Bat buoc" — text-caption (11px), negative (#EF4444), ml: 4px
  Gap below:  12px

Checkbox 2 (required):
  Same style as Checkbox 1
  Label:      "Toi dong y voi Chinh sach bao mat va thu thap du lieu"
  Link:       "Chinh sach bao mat" underlined, accent-primary, opens in-app webview
  Tag:        "Bat buoc"
  Gap below:  12px

Checkbox 3 (optional):
  Same style, no "Bat buoc" tag
  Label:      "Toi dong y nhan thong bao tiep thi va khuyen mai tu Paave"
  Tag:        "Tuy chon" — text-caption (11px), text-secondary, ml: 4px
  Default:    Unchecked (FR-LEGAL-03: no pre-checked boxes)
```

**Section 2 — Date of Birth (FR-AGE-01)**
```
mx: 16px, mt: 32px

Label:      "Ngay sinh" — text-body-sm (13px, weight 500), text-secondary, mb: 8px
Sub-label:  "Ban phai tu 16 tuoi tro len de su dung Paave"
            text-caption (12px), text-secondary, mb: 12px

Date picker:
  Width:      343px
  Height:     56px
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px, radius-md (12px)
  Focus:      border-focus (#3B82F6) 2px
  Padding:    horizontal 16px
  Placeholder: "DD / MM / YYYY" — text-tertiary (#6B7280), 16px
  Value:      text-primary (#F9FAFB), 16px, weight 400
  Icon:       calendar 20px, text-secondary, right side
  Tap:        Opens native date picker (iOS wheel / Android calendar)
              Max date: today (no future dates)
              Min date: 100 years ago

Validation messages (below picker, mt: 8px):
  Age >= 18:  Hidden (no message)
  Age 16-17:  "Ban se su dung Paave o che do hoc tap (LEARN_MODE)"
              text-body-sm (13px), warning (#F59E0B), icon: info 14px
  Age 13-15:  "Can su dong y cua phu huynh. Tinh nang nay se co trong phien ban toi."
              text-body-sm (13px), warning, icon: alert-triangle 14px
  Age < 13:   "Paave yeu cau nguoi dung phai tu 13 tuoi tro len."
              text-body-sm (13px), negative (#EF4444), icon: x-circle 14px
```

**Section 3 — Email + Password (FR-05)**
```
mx: 16px, mt: 32px

Email input:
  Label:      "Email" — text-body-sm (13px, weight 500), text-secondary, mb: 8px
  Width:      343px
  Height:     56px
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px, radius-md (12px)
  Focus:      border-focus (#3B82F6) 2px
  Padding:    horizontal 16px
  Placeholder: "example@email.com" — text-tertiary, 16px
  Input:      text-primary, 16px
  Keyboard:   email-address
  Validation: RFC 5322, max 254 chars
  Error:      "Email khong hop le" — text-body-sm (13px), negative, mt: 4px
  Duplicate:  "Email da duoc su dung" — text-body-sm, negative, mt: 4px

Password input (mt: 16px):
  Label:      "Mat khau" — text-body-sm, text-secondary, mb: 8px
  Same dimensions as email input
  Placeholder: "8+ ky tu, chu hoa, so, ky tu dac biet"
  Secure:     secureTextEntry, toggle eye icon 20px (right side, 44x44px touch)
  
Password strength indicator (mt: 8px):
  4-segment bar: width 343px, height 4px, radius-full, gap 4px between segments
  Segment width: (343 - 12) / 4 = 82.75px each
  Colors:     0 rules met: all bg-card
              1 rule: 1 segment negative (#EF4444)
              2 rules: 2 segments warning (#F59E0B)
              3 rules: 3 segments accent-primary (#3B82F6)
              4 rules: 4 segments positive (#10B981)
  Rules (text below bar):
    "1 chu hoa" | "1 chu thuong" | "1 so" | "1 ky tu dac biet (!@#$%^&*)"
    text-caption (11px), text-secondary (unmet) / positive (met)
    Checkmark icon 12px before each met rule

Confirm password input (mt: 16px):
  Label:      "Xac nhan mat khau"
  Same style as password input
  Validation: Must match password field
  Error:      "Mat khau khong khop" — text-body-sm, negative, mt: 4px

  pb: 120px (clearance for sticky CTA)
```

### Sticky CTA Button (Bottom)
```
Position:   fixed bottom
Height:     80px + safe-area-inset-bottom
Background: bg-primary, top border: border 1px
Padding:    horizontal 16px, vertical 14px

Button:
  Width:    343px
  Height:   52px
  Radius:   radius-lg (16px)
  Enabled:  accent-primary bg, #FFFFFF text, "Tao tai khoan"
  Disabled: bg-card, text-tertiary, border: border
  Shadow:   shadow-glow-accent when enabled
  
  Enabled when:
    Checkbox 1 checked AND
    Checkbox 2 checked AND
    DOB valid (age >= 16) AND
    Email valid AND
    Password meets all 4 rules AND
    Confirm password matches
```

### Interaction Rules
```
Checkbox tap       -> Toggle checked state (150ms ease-fast)
ToS/Privacy link   -> Open in-app webview (SafariViewController / Chrome Custom Tab)
DOB field tap      -> Open native date picker
Eye icon tap       -> Toggle password visibility
CTA tap (enabled)  -> Validate all fields -> API call -> navigate to Email Verification
CTA tap (disabled) -> Shake animation (200ms), highlight first invalid field
Scroll             -> KeyboardAvoidingView: CTA stays above keyboard
```

### States
```
Default:     All fields empty, checkboxes unchecked, CTA disabled
Partial:     Some fields filled, CTA disabled
Valid:       All required fields valid, CTA enabled
Loading:     CTA shows spinner, all inputs disabled
Duplicate:   Email field shows error, CTA re-enabled
Age blocked: DOB field shows error, CTA permanently disabled
Success:     Navigate to Email Verification (Screen 21)
```

### Edge Cases
```
Under 13 DOB:        Registration blocked, error message, CTA stays disabled
Age 13-15 DOB:       Warning message, CTA disabled (parental consent deferred to V3)
Age 16-17 DOB:       Info message about LEARN_MODE, registration proceeds
Webview fails:       "Khong the tai dieu khoan. Kiem tra ket noi." + retry
Email already used:  Inline error on email field
Password mismatch:   Inline error on confirm field
Network error:       Toast "Khong the tao tai khoan. Thu lai." + CTA re-enabled
App killed mid-form: Resume from this step with partially filled data persisted
Very long email:     Truncate display with ellipsis, full value in state
```

### Dev Handoff Specs
```
Progress indicator:
  Container:     height 32px, flex-row, gap 8px, centered
  Dot default:   width 8px, height 8px, radius 999, bg #1F2937
  Dot active:    width 24px, height 8px, radius 999, bg #3B82F6
  Animation:     width interpolation, 150ms cubic-bezier(0.34, 1.56, 0.64, 1)

Consent checkboxes:
  Checkbox component: 24x24px, touch area 44x44px
  Checked animation:  scale 0 to 1 checkmark, 150ms ease-spring
  State:              local + persisted to API on submit
  Consent timestamp:  captured at CTA tap, sent with registration payload
  ToS version:        fetched from /legal/current-version, stored on user record

DOB date picker:
  iOS:    UIDatePicker (compact style), max: today
  Android: MaterialDatePicker, max: today
  Age calc: (today - DOB) in full years, server-side re-validated

Password strength:
  Regex rules:
    uppercase: /[A-Z]/
    lowercase: /[a-z]/
    digit:     /[0-9]/
    special:   /[!@#$%^&*]/
  Min length: 8, max: 64

Registration API:
  POST /auth/register
  Body: { fullName, email, password, nationality, dob, tosVersion, privacyVersion, 
          tosConsentAt, privacyConsentAt, marketingOptIn }
  On 201: navigate to OTP screen
  On 409: email duplicate error
  On 422: validation error (map to field)

Keyboard handling:
  KeyboardAvoidingView behavior: "padding" (iOS) / "height" (Android)
  ScrollView: keyboardShouldPersistTaps: "handled"
```

### QA Tests
```
[ ] CTA disabled until all required fields valid
[ ] Checkbox 1 and 2 required; checkbox 3 optional
[ ] No pre-checked checkboxes on load
[ ] ToS link opens webview with correct URL
[ ] Privacy link opens webview with correct URL
[ ] DOB picker does not allow future dates
[ ] Age < 13: error shown, CTA disabled
[ ] Age 13-15: warning shown, CTA disabled (V2 parental consent deferred)
[ ] Age 16-17: LEARN_MODE info shown, registration proceeds
[ ] Age 18+: no age message, registration proceeds
[ ] Email validation: rejects invalid format
[ ] Email duplicate: shows inline error
[ ] Password strength bar updates in real time
[ ] Password visibility toggle works
[ ] Confirm password mismatch shows error
[ ] CTA tap with valid form: loading state, API call, navigate to OTP
[ ] CTA tap with invalid form: shake animation, first error highlighted
[ ] Keyboard does not obscure CTA
[ ] Progress dots show step 1 of 4 active
[ ] Consent timestamps stored on user record
```

---

## Screen 21 — Email Verification (OTP Entry)

### Screen Overview
```
Screen: Email Verification (OTP Entry)
User:   New user verifying their email address
Goal:   Enter 6-digit OTP sent to email; complete account activation
Refs:   FR-06, BR-13
```

### Layout
```
Background: bg-primary (#0D1117)
Header:     Progress indicator (step 4 of 4)
Main:       Centered content — icon, instruction text, OTP input, timer, resend
Bottom:     None (no CTA button; auto-submits on 6th digit)
```

### Main Content

**Section 1 — Email Icon + Instructions**
```
Center aligned, mt: 80px + safe-area

Icon:       Mail icon, 64x64px, accent-primary, opacity: 0.8
            Contained in 96x96px circle, bg: accent-primary-subtle, radius-full

Title:      "Xac nhan email" — text-title-lg (20px, weight 700), text-primary, mt: 24px
Subtitle:   "Chung toi da gui ma xac nhan den"
            text-body-md (14px), text-secondary, mt: 8px
Email:      "lo***@gmail.com" — text-body-md (14px, weight 600), text-primary, mt: 4px
            (email masked per FR-48 pattern)
```

**Section 2 — OTP Input (6-digit)**
```
mx: 40px, mt: 32px, centered

Container:  6 individual digit boxes, flex-row, gap: 8px, centered

Each digit box:
  Width:      44px
  Height:     56px
  Background: bg-card (#1F2937)
  Border:     border (#374151) 2px, radius-md (12px)
  Focus:      border-focus (#3B82F6) 2px, bg-card
  Filled:     border accent-primary 2px
  Error:      border-error (#EF4444) 2px, bg rgba(239,68,68,0.05)
  Text:       text-display-md (24px, weight 700), text-primary, text-align: center
  Cursor:     Blinking accent-primary line, 2px wide, centered, animation blink 1s

Behavior:
  Auto-focus first box on screen mount
  Auto-advance to next box on digit entry
  Backspace moves to previous box and clears
  Paste support: 6-digit paste fills all boxes simultaneously
  Auto-submit on 6th digit entry (no manual submit button)
  Keyboard: numeric, auto-shown on mount
```

**Section 3 — Timer + Resend**
```
mt: 32px, centered

Timer row:
  "Ma het han sau " — text-body-sm (13px), text-secondary
  "9:42" — text-body-sm (13px, weight 600), accent-primary
  Timer counts down from 10:00 (600 seconds per FR-06)

Resend row (mt: 16px):
  Default (cooldown active, 60s after last send):
    "Gui lai ma" — text-body-sm (13px), text-tertiary, non-interactive
    "trong 45s" — text-caption (12px), text-tertiary

  Cooldown expired:
    "Gui lai ma" — text-body-sm (13px, weight 600), accent-primary, touchable
    Touch area: 44px min height

Spam hint (mt: 24px):
  "Khong nhan duoc? Kiem tra muc Spam hoac Quang cao."
  text-caption (12px), text-secondary, text-align: center, mx: 32px
```

### Interaction Rules
```
Digit entry         -> Auto-advance to next field
6th digit entered   -> Auto-submit (API verify call)
Backspace           -> Clear current field, move to previous
Paste 6 digits      -> Fill all fields, auto-submit
Resend tap          -> Request new OTP, reset timer to 10:00, 60s cooldown restarts
                       Toast: "Ma moi da duoc gui"
Timer hits 0:00     -> "Ma da het han. Gui lai ma moi." message replaces timer
                       OTP input disabled, all boxes show error border
Back button         -> Navigate to registration (warn: "Thoat xac nhan?")
```

### States
```
Default:      First box focused, cursor blinking, timer counting, resend greyed
Typing:       Digits fill boxes with auto-advance, timer continues
Verifying:    After 6th digit: all boxes show accent-primary border,
              loading spinner replaces OTP boxes (subtle, 300ms transition)
Success:      Check icon animation (scale 0 to 1, 300ms ease-spring),
              "Xac nhan thanh cong!" text, auto-navigate to Home after 1200ms
Error:        All boxes flash border-error (300ms), shake animation (200ms),
              "Ma khong dung. Con {remaining} lan thu." below OTP
Locked:       After 5 failed attempts: OTP input disabled,
              "Qua nhieu lan thu. Vui long thu lai sau 15 phut."
              text-body-sm, negative, 15-minute countdown shown
Expired:      Timer at 0:00, OTP input disabled, "Gui lai ma" link prominent
Resend cooldown: Resend link greyed, countdown "trong Xs" shown
```

### Edge Cases
```
OTP in spam folder:  Hint text always visible below resend link
5th failed attempt:  15-minute lockout, all inputs disabled, countdown shown
Timer expires:       Input disabled, clear all boxes, prompt to resend
New OTP invalidates old: Server-side; old OTP rejected even if timer not expired
Paste non-numeric:   Ignore; only accept digits 0-9
Paste partial:       Fill available boxes from left; focus on next empty
Network error:       Toast "Khong the xac nhan. Kiem tra ket noi." + re-enable input
App killed:          Return to this screen, re-request OTP on mount
```

### Dev Handoff Specs
```
OTP input:
  6 separate TextInput components, ref-chained for auto-advance
  keyboardType: 'number-pad'
  maxLength: 1 per input
  autoFocus: true on first input
  Paste handling: onChangeText on first input, detect length > 1,
                  distribute across all inputs, trigger submit

Auto-submit:
  When all 6 digits filled:
    POST /auth/verify-otp { email, otp: "123456" }
    On 200: set session, navigate to Home (with biometric prompt if applicable)
    On 401: increment fail count, show error, clear boxes, focus first
    On 429: show lockout message + timer

Timer:
  useEffect countdown from 600s, clearInterval on unmount
  Display: Math.floor(remaining/60) + ":" + String(remaining%60).padStart(2, "0")

Resend:
  POST /auth/resend-otp { email }
  Cooldown: 60s local timer, resend button disabled during
  On success: toast "Ma moi da duoc gui", reset 10min timer
  On 429: "Vui long cho {seconds}s truoc khi gui lai"

Animations:
  Success checkmark:  scale 0 to 1, 300ms cubic-bezier(0.34, 1.56, 0.64, 1)
  Error shake:        translateX [0, -8, 8, -6, 6, -3, 3, 0], 200ms
  Box fill:           border-color transition 150ms ease-standard
  Cursor blink:       opacity 0 to 1, 500ms, infinite alternate
```

### QA Tests
```
[ ] 6 digit boxes rendered, first auto-focused
[ ] Auto-advance works on digit entry
[ ] Backspace moves to previous box and clears digit
[ ] Paste 6-digit code fills all boxes and auto-submits
[ ] Correct OTP: success animation, navigate to Home
[ ] Incorrect OTP: shake animation, error message with remaining attempts
[ ] 5 failed attempts: 15-minute lockout with countdown
[ ] Timer counts down from 10:00 accurately
[ ] Timer expires: input disabled, prompt to resend
[ ] Resend button disabled during 60s cooldown
[ ] Resend cooldown counter shows remaining seconds
[ ] Resend tap: new OTP sent, timer resets, toast shown
[ ] Spam hint always visible
[ ] Masked email displayed correctly
[ ] Progress dots show step 4 of 4
[ ] Keyboard shown on mount (numeric)
[ ] Non-numeric paste ignored
```

---

## Screen 22 — Biometric Enrollment Prompt

### Screen Overview
```
Screen: Biometric Enrollment Prompt
User:   Returning user after first successful login
Goal:   Offer Face ID / Fingerprint enrollment for faster future logins
Refs:   FR-07B
```

### Layout
```
Type:       Full-screen modal overlay (above Home screen)
Background: bg-overlay (rgba(0,0,0,0.60)) with blur backdrop
Card:       Centered modal card
```

### Modal Card
```
Position:   centered horizontally + vertically
Width:      343px
Height:     auto (approx 360px)
Background: bg-card (#1F2937)
Border:     border (#374151) 1px
Radius:     radius-xl (24px)
Padding:    32px
Shadow:     shadow-sheet

Content (center aligned):

Biometric icon:
  Size:       80x80px
  Container:  96x96px circle, bg: accent-primary-subtle, radius-full
  iOS:        Face ID icon (custom or system), accent-primary, 48px
  Android:    Fingerprint icon (system), accent-primary, 48px
  Animation:  Scale 0.8 to 1, opacity 0 to 1, 400ms ease-decelerate on mount

Title (mt: 24px):
  iOS:    "Dang nhap bang Face ID?" — text-title-lg (20px, weight 700), text-primary
  Android: "Dang nhap bang van tay?" — text-title-lg (20px, weight 700), text-primary

Subtitle (mt: 8px):
  "Dang nhap nhanh hon va an toan hon cho nhung lan su dung tiep theo"
  text-body-md (14px), text-secondary, text-align: center, mx: 8px

Primary CTA (mt: 32px):
  Width:      279px (card width - 64px padding)
  Height:     52px
  Radius:     radius-lg (16px)
  Background: accent-primary (#3B82F6)
  Text:       "Bat dau su dung" — 16px, weight 600, #FFFFFF
  Shadow:     shadow-glow-accent
  Icon:       Shield-check 20px, #FFFFFF, left of text, gap 8px

Secondary CTA (mt: 12px):
  Width:      279px
  Height:     44px
  Radius:     radius-lg (16px)
  Background: transparent
  Text:       "De sau" — 14px, weight 500, text-secondary
  No border, no shadow
```

### Interaction Rules
```
"Bat dau su dung" tap  -> Trigger OS biometric enrollment
                          iOS: LocalAuthentication framework Face ID prompt
                          Android: BiometricPrompt API fingerprint prompt
                       -> On success: store credential in secure enclave,
                          set biometric_enabled = true on server,
                          dismiss modal with fade (300ms), toast "Da bat dau!"
                       -> On fail: toast "Khong the thiet lap. Thu lai trong Cai dat."
                          Dismiss modal.
"De sau" tap           -> Dismiss modal (fade 300ms ease-accelerate)
                       -> User can enable later in Profile > Settings
Tap outside card       -> No dismiss (intentional — user must choose)
Hardware back          -> Same as "De sau"
```

### States
```
Default:     Modal visible with biometric icon animation
OS prompt:   Native biometric dialog shown (modal stays behind)
Success:     Brief checkmark animation on icon, then dismiss
Failure:     Toast error, modal dismisses
No hardware: Modal NOT shown at all (device capability check before display)
```

### Edge Cases
```
Device has no biometric hardware:  Modal never shown; biometric option hidden in Settings
User cancels OS prompt:            Return to modal, user can tap "De sau" or retry
OS biometric not enrolled:         Show message "Chua cai dat sinh trac hoc tren thiet bi.
                                   Vui long cai dat trong Cai dat he thong."
                                   Both buttons still functional
Biometric permission denied:       Toast "Quyen truy cap sinh trac hoc bi tu choi.
                                   Kiem tra Cai dat > Quyen ung dung."
                                   Modal dismisses
```

### Dev Handoff Specs
```
Modal:
  Animated.View: opacity 0 to 1, 300ms ease-decelerate
  Card: translateY 20 to 0, opacity 0 to 1, 350ms ease-decelerate (100ms delay)

Capability check:
  iOS:    LAContext.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics)
  Android: BiometricManager.canAuthenticate(BIOMETRIC_STRONG)
  If unavailable: skip modal entirely, set biometric_enabled = false

Enrollment:
  iOS:    LAContext.evaluatePolicy with localizedReason
  Android: BiometricPrompt with CryptoObject for secure credential storage
  On success: store JWT refresh token encrypted in Keychain (iOS) / Keystore (Android)
  Server call: PATCH /users/me { biometric_enabled: true }

Dismiss animation:
  Card: translateY 0 to 20, opacity 1 to 0, 250ms ease-accelerate
  Overlay: opacity 1 to 0, 300ms ease-accelerate

One-time prompt:
  Shown once after first login; preference stored:
    AsyncStorage key: "biometric_prompt_shown" = true
  If declined, re-prompt NOT shown on next login
  User enables later via Profile > Settings > "Sinh trac hoc"
```

### QA Tests
```
[ ] Modal appears after first successful login only
[ ] Modal NOT shown on subsequent logins
[ ] Modal NOT shown if device has no biometric hardware
[ ] Face ID icon on iOS, Fingerprint icon on Android
[ ] "Bat dau su dung" triggers OS biometric prompt
[ ] Successful enrollment: biometric_enabled = true, toast shown, modal dismisses
[ ] Failed enrollment: error toast, modal dismisses
[ ] "De sau" dismisses modal without enrollment
[ ] Tapping outside card does NOT dismiss
[ ] Hardware back acts as "De sau"
[ ] Biometric login works on next app open after enrollment
[ ] 3 failed biometric attempts: fallback to email/password (FR-07B)
[ ] Logout invalidates biometric session
```

---

## Screen 23 — Paper Trading Order Placement

### Screen Overview
```
Screen: Paper Trading Order Placement
User:   User placing a virtual buy or sell order
Goal:   Execute simulated market or limit order with pre-trade AI context
Trigger: "Mua" / "Ban" button from Stock Detail action bar
Refs:   FR-PT-02, FR-PT-03, FR-AI-04, FR-PT-06
```

### Layout
```
Header:     Navigation bar (back + order title) + Virtual Funds banner
Main:       Scrollable — buy/sell toggle, order form, AI card, summary
Bottom:     Sticky confirm button
```

### Header / Navigation Bar
```
Height:     56px + safe-area-inset-top
Background: bg-primary (#0D1117)
Left:       Back arrow (arrow-left 20px), text-secondary, 44x44px touch
Center:     "Dat lenh VCB" — text-title-md (18px, weight 700), text-primary
```

### Virtual Funds Banner (Mandatory — FR-PT-06, BR-18)
```
Position:   Below header, full width, sticky (scrolls with content: NO)
Height:     32px
Background: warning-subtle (rgba(245,158,11,0.15))
Border:     warning (#F59E0B) 1px bottom
Text:       "Tien ao / Virtual Funds" — text-caption (12px, weight 600), warning
Align:      center
Non-dismissible: Cannot be hidden, swiped, or toggled off
Localized:  VN: "Tien ao" | KR: "Gasang Jageum" | EN: "Virtual Funds"
```

### Main Content

**Section 1 — Buy/Sell Toggle**
```
mx: 16px, mt: 16px

Toggle container:
  Width:      343px
  Height:     44px
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px
  Radius:     radius-md (12px)
  Padding:    2px

  2 segments, each (343-4)/2 = 169.5px wide, 40px tall:
    Buy:  "Mua" — text-body-md (14px, weight 600)
          Active: positive (#10B981) bg, #FFFFFF text, radius-sm (8px)
    Sell: "Ban" — text-body-md (14px, weight 600)
          Active: negative (#EF4444) bg, #FFFFFF text, radius-sm (8px)
    Inactive: transparent bg, text-secondary
    Animation: slide indicator 200ms ease-standard
```

**Section 2 — Stock Summary**
```
mx: 16px, mt: 16px

Row:
  Logo:     40x40px, radius-full
  Right:
    Ticker: "VCB" — text-title-sm (16px, weight 700), text-primary
    Name:   "Vietcombank" — text-body-sm (13px), text-secondary
  Far right:
    Price:  "88.000d" — text-title-sm (16px, weight 700), tabular-nums
    Change: "+2,15%" — text-body-sm (13px), positive/negative
```

**Section 3 — Order Type Selector**
```
mx: 16px, mt: 24px

Label:  "Loai lenh" — text-body-sm (13px, weight 500), text-secondary, mb: 8px

Toggle row:
  2 options, width: (343-8)/2 each, height: 44px
  Left:  "Thi truong" (Market) — default selected
  Right: "Gioi han" (Limit)
  Selected: accent-primary bg, #FFFFFF text, radius-md (12px)
  Unselected: bg-card, text-secondary, border: border, radius-md
  Touch: full area 44px min height
```

**Section 4 — Quantity Input**
```
mx: 16px, mt: 24px

Label:    "So luong (CP)" — text-body-sm (13px, weight 500), text-secondary, mb: 8px

Input:
  Width:      343px
  Height:     64px
  Background: bg-secondary (#161B22)
  Border:     border (#374151) 1px, radius-md (12px)
  Focus:      border-focus (#3B82F6) 2px
  Padding:    horizontal 16px
  Value:      text-display-md (24px, weight 700), tabular-nums, text-primary
  Placeholder: "0"
  Keyboard:   numeric

Quick quantity chips (mt: 8px):
  Row: "10 CP" | "50 CP" | "100 CP" | "Toi da"
  Chip: height 32px, px: 12px, radius-full, bg-card, border: border 1px
  Text: text-body-sm (13px), text-secondary
  Active (tapped): accent-primary-subtle bg, accent-primary text, accent-primary border
  "Toi da" calculates: Math.floor(availableBalance / (price * 1.001))

Balance row (mt: 8px):
  "So du kha dung: 499.119.120d" — text-caption (12px), text-secondary
  Insufficient: text turns negative (#EF4444)
```

**Section 5 — Limit Price Input (visible only when Limit selected)**
```
mx: 16px, mt: 16px

Label:    "Gia gioi han" — text-body-sm, text-secondary, mb: 8px

Input:
  Same dimensions and style as Quantity Input
  Currency prefix: "d" — text-title-md (18px, weight 700), text-secondary, mr: 8px
  Placeholder: current market price
  Keyboard: numeric

Helper text (mt: 4px):
  Buy limit: "Lenh khop khi gia <= gia gioi han" — text-caption (12px), text-secondary
  Sell limit: "Lenh khop khi gia >= gia gioi han" — text-caption (12px), text-secondary
```

**Section 6 — Pre-Trade AI Card (FR-AI-04, collapsible)**
```
mx: 16px, mt: 24px

Card:
  Background: accent-primary-subtle (rgba(59,130,246,0.15))
  Border:     accent-primary (#3B82F6) 1px
  Radius:     radius-md (12px)
  Padding:    16px

  Header row:
    Left:   brain icon 16px + "Phan tich AI" — text-body-sm (13px, weight 600), accent-primary
    Right:  Chevron icon 16px (up when expanded, down when collapsed), text-secondary
    Touch:  full row, 44px min height

  Content (expanded, default):
    Risk score (mt: 12px):
      "Rui ro: 6/10" — text-body-md (14px, weight 600), warning (#F59E0B)
      Visual: 10-dot row, 6 filled (warning), 4 empty (bg-card)
      Dot: 8px circle, gap 4px

    Position size (mt: 8px):
      "De xuat: 8% danh muc" — text-body-sm (13px), text-primary

    "3 dieu can biet:" (mt: 12px):
      Label: text-caption-bold (12px), text-secondary
      3 bullet points, text-body-sm (13px), text-primary, line-height: 1.5
      Bullet: 4px circle, text-secondary, mr: 8px

  Footer (mt: 12px):
    Disclaimer: text-caption (11px), text-tertiary
    "Noi dung AI chi mang tinh giao duc. Khong phai loi khuyen dau tu."

  Loading state: Skeleton card, 2s timeout
  Timeout: "Phan tich bi bo qua — tiep tuc dat lenh." text-body-sm, text-secondary
```

**Section 7 — Order Summary**
```
mx: 16px, mt: 24px, pb: 120px

Card:
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px
  Radius:     radius-md (12px)
  Padding:    16px

  Summary rows (label: value, each row height 32px):
    "Loai lenh"        / "Thi truong"       text-body-sm / text-body-sm weight 600
    "Gia"              / "88.000d"
    "So luong"         / "10 CP"
    "Phi giao dich"    / "880d (0,1%)"
    Divider: border 1px, my: 12px
    "Tong cong"        / "880.880d"         text-title-sm weight 700 / text-title-sm weight 700
```

### Sticky Confirm Button (Bottom)
```
Position:   fixed bottom
Height:     80px + safe-area-inset-bottom
Background: bg-card (#1F2937), top border: border 1px
Padding:    horizontal 16px, vertical 14px

Button:
  Width:    343px
  Height:   52px
  Radius:   radius-lg (16px)
  Buy:      Background positive (#10B981), text #FFFFFF, "Xac nhan mua 10 VCB"
  Sell:     Background negative (#EF4444), text #FFFFFF, "Xac nhan ban 10 VCB"
  Disabled: bg-card, text-tertiary (when qty = 0 or insufficient balance)
  Shadow:   shadow-glow-positive for buy / 0 0 16px rgba(239,68,68,0.25) for sell
```

### Interaction Rules
```
Buy/Sell toggle      -> Switch mode, update header color, confirm button color
Order type toggle    -> Switch market/limit, show/hide limit price field
Quantity chip tap    -> Fill quantity input with value
"Toi da" chip        -> Calculate max affordable quantity from balance
AI card chevron      -> Toggle expanded/collapsed
Confirm tap          -> Navigate to Order Confirmation (Screen 24)
Back button          -> Cancel order, return to Stock Detail
Keyboard dismiss     -> Tap outside input or scroll down
```

### States
```
Default (Buy):  Buy toggle active, Market order, quantity empty, confirm disabled
Default (Sell): Sell toggle active, Market order, quantity empty, confirm disabled
AI loading:     Skeleton AI card, 2s timeout
AI loaded:      Card expanded with analysis
AI skipped:     Timeout message shown
Input filled:   Summary visible, confirm enabled (if balance sufficient)
Insufficient:   "So du khong du" in negative, confirm disabled
Limit mode:     Limit price field visible below quantity
```

### Edge Cases
```
Zero quantity:        Confirm disabled, summary hidden
Quantity > holdings:  Sell mode: "Khong du co phieu de ban" error, negative text
Balance insufficient: "So du khong du" label, confirm disabled
Price feed outage:    Use last cached price with stale indicator timestamp
AI service timeout:   Graceful skip after 2s, order flow continues
Long ticker name:     Header truncates with ellipsis at 16 chars
Market closed:        Warning banner "Thi truong da dong cua. Lenh se duoc xu ly khi mo cua."
```

### Dev Handoff Specs
```
Virtual funds banner:
  Always rendered, z-index above scroll content
  position: sticky, top: 0 (below header)
  Per FR-PT-06: cannot be hidden by any user action

Buy/Sell toggle:
  Animated.View indicator slides between segments
  Duration: 200ms, easing: ease-standard

AI card:
  Timeout: setTimeout 2000ms, clearTimeout on response
  Collapse: Animated.View height interpolation, 200ms ease-standard
  Skip tracking: POST /analytics/ai-skip { screen: "pre-trade", ticker }

Max quantity calc:
  Math.floor(availableBalance / (currentPrice * 1.001))
  1.001 factor accounts for simulated transaction fee

Order summary:
  Updates reactively on quantity/price change
  Fee: quantity * price * 0.001

Confirm navigation:
  Passes order payload to confirmation screen:
  { ticker, side, type, quantity, price, limitPrice?, fee, total }
```

### QA Tests
```
[ ] Virtual Funds banner visible and non-dismissible
[ ] Buy/Sell toggle switches correctly with color change
[ ] Market order selected by default
[ ] Limit order: limit price field appears
[ ] Quantity chips fill input correctly
[ ] "Toi da" calculates correct max quantity
[ ] Order summary updates in real-time
[ ] Confirm disabled when quantity is 0
[ ] Confirm disabled when balance insufficient
[ ] AI card loads within 2s or shows skip message
[ ] AI card collapsible via chevron
[ ] AI disclaimer visible in card footer
[ ] Sell mode: error when quantity exceeds holdings
[ ] Balance row shows current available virtual cash
[ ] Confirm button text includes quantity and ticker
[ ] Back button returns to Stock Detail
```

---

## Screen 24 — Paper Trading Order Confirmation

### Screen Overview
```
Screen: Paper Trading Order Confirmation
User:   User confirming a virtual trade before execution
Goal:   Review order details and execute; show post-trade AI card on success
Refs:   FR-PT-02, FR-PT-06
```

### Layout
```
Type:       Bottom sheet (60% screen height) OR full-screen push
Background: bg-card (#1F2937)
Radius:     radius-xl (24px) top corners (if bottom sheet)
Handle:     4x32px pill, bg-border, centered, mt: 12px (if bottom sheet)
```

### Virtual Funds Banner
```
Same as Screen 23: mandatory, non-dismissible, full width
Height: 32px, warning-subtle bg, "Tien ao / Virtual Funds" centered
```

### Content
```
Header (mt: 16px, mx: 16px):
  Title:     "Xac nhan lenh" — text-title-lg (20px, weight 700), text-primary
  Close:     x icon (24px), text-secondary, absolute top-right, 44x44px touch

Order summary card (mt: 24px, mx: 16px):
  Background: bg-secondary (#161B22)
  Border:     border (#374151) 1px
  Radius:     radius-md (12px)
  Padding:    20px

  Center aligned:
    Action label:
      Buy:  "MUA" — text-caption-bold (12px), positive, positive-subtle bg, 
            radius-full, px: 12px, py: 4px
      Sell: "BAN" — text-caption-bold (12px), negative, negative-subtle bg,
            radius-full, px: 12px, py: 4px

    Ticker + Logo (mt: 16px):
      Logo: 48x48px, radius-full
      "VCB" — text-display-md (24px, weight 700), text-primary, mt: 8px
      "Vietcombank" — text-body-sm (13px), text-secondary, mt: 2px

  Detail rows (mt: 20px):
    Row style: flex-row, justify-between, height 36px, align-center
    Label: text-body-sm (13px), text-secondary
    Value: text-body-sm (13px, weight 600), text-primary, tabular-nums

    "Loai lenh"        / "Thi truong"
    "So luong"         / "10 CP"
    "Gia du kien"      / "88.000d"
    "Phi giao dich"    / "880d"
    Divider: border 1px, my: 8px
    "Tong gia tri"     / "880.880d" — text-title-sm (16px, weight 700)

  Note (mt: 12px):
    Market: "Gia cuoi cung co the khac do bien dong thi truong"
    Limit:  "Lenh se duoc thuc hien khi gia dat dieu kien"
    text-caption (12px), text-secondary, text-align: center

Confirm CTA (mt: 24px, mx: 16px):
  Width:    343px
  Height:   52px
  Radius:   radius-lg (16px)
  Buy:      positive bg (#10B981), #FFFFFF text, "Xac nhan mua"
  Sell:     negative bg (#EF4444), #FFFFFF text, "Xac nhan ban"
  Shadow:   shadow-glow-positive (buy) / 0 0 16px rgba(239,68,68,0.25) (sell)

Cancel link (mt: 12px, mb: 32px + safe-area):
  "Huy lenh" — text-body-sm (13px), text-secondary, text-align: center
  Touch: 44px min height
```

### Interaction Rules
```
"Xac nhan mua/ban" tap -> Execute order API call
                          Button shows loading spinner
                          On success: transition to success state (inline)
                          On failure: toast error, button re-enabled
"Huy lenh" tap          -> Dismiss sheet/pop screen, return to order placement
Close x tap             -> Same as cancel
Swipe down (sheet)      -> Same as cancel
```

### States
```
Default:     Order summary displayed, confirm button enabled
Loading:     Confirm button shows spinner, all inputs disabled
Success:     Sheet content transitions to success view:
               Checkmark animation (scale 0 to 1, 300ms ease-spring)
               "Lenh da duoc thuc hien!" — text-title-lg, positive
               "10 VCB @ 88.000d" — text-body-md, text-primary
               "Xem danh muc" button -> Portfolio tab
               Auto-triggers Post-Trade AI Card (Screen 28) after 2s delay
Error:       Toast "Khong the thuc hien lenh. Thu lai." — 3s auto-dismiss
               Confirm button re-enabled
```

### Edge Cases
```
Price changed during confirmation: Market order fills at new price; 
  "Gia du kien" note already warns about price movement
Feed outage at execution:          Order queued; toast "Lenh dang cho xu ly"
Double tap on confirm:             Disable button on first tap to prevent duplicate orders
Network timeout:                   Toast error after 10s, button re-enabled
Sheet dismissed during loading:    Order continues in background; 
                                   result shown as notification
```

### Dev Handoff Specs
```
Order execution:
  POST /paper-trades
  Body: { ticker, side: "buy"|"sell", type: "market"|"limit", 
          quantity, limitPrice? }
  On 201: { tradeId, fillPrice, fillTime, newBalance }
  On 400: validation error (insufficient funds, etc.)
  On 503: order queued (feed outage)

Success animation:
  Checkmark: Lottie animation or Animated.View
    Scale: 0 to 1.2 to 1, 400ms cubic-bezier(0.34, 1.56, 0.64, 1)
    Opacity: 0 to 1, 200ms
  Content swap: crossfade 300ms ease-standard

Post-trade AI trigger:
  setTimeout 2000ms after success, then show Post-Trade AI Card (Screen 28)
  Or navigate to Portfolio with AI card auto-displayed

Haptic feedback:
  On confirm tap: impact (medium)
  On success: notification (success)

Double-tap prevention:
  Set loading = true on first tap, disable pointer events
```

### QA Tests
```
[ ] Virtual Funds banner visible and non-dismissible
[ ] Order summary matches values from order placement screen
[ ] Buy: green confirm button; Sell: red confirm button
[ ] Confirm tap: loading spinner, API call
[ ] Success: checkmark animation, success message
[ ] Success: "Xem danh muc" navigates to Portfolio tab
[ ] Error: toast shown, confirm re-enabled
[ ] Cancel: returns to order placement
[ ] Close x: returns to order placement
[ ] Swipe down (sheet mode): returns to order placement
[ ] No double-submit on rapid taps
[ ] Post-trade AI card triggers after success
[ ] Haptic feedback on confirm and success
[ ] Price disclaimer note visible
```

---

## Screen 25 — Paper Trading Portfolio Dashboard

### Screen Overview
```
Screen: Paper Trading Portfolio Dashboard
User:   User tracking virtual investment positions
Goal:   View total virtual portfolio value, holdings, open orders, trade history,
        portfolio chart, and goal progress
Refs:   FR-PT-04, FR-PT-06, FR-GAME-07
```

### Layout
```
Header:     Sticky screen title + Virtual Funds banner
Tabs:       "Danh muc" | "Lenh cho" | "Lich su" (3 sub-tabs)
Main:       Scrollable content per tab
Bottom:     Persistent nav bar
```

### Header
```
Height:     56px + safe-area-inset-top
Center:     "Danh muc" — text-title-lg (20px, weight 700), text-primary
Right:      Settings gear icon (24px), text-secondary, 44x44px -> Portfolio settings
```

### Virtual Funds Banner
```
Same as Screen 23: mandatory, non-dismissible, full width, sticky below header
```

### Main Content — Tab 1: "Danh muc" (Holdings)

**Section 1 — Portfolio Hero Card**
```
mx: 16px, mt: 16px

Card:
  Width:      343px
  Height:     220px
  Background: gradient-hero (linear-gradient(135deg, #0D1117 0%, #1a1f35 100%))
  Radius:     radius-xl (24px)
  Padding:    20px
  Shadow:     shadow-card-raised

  Row 1: "Tong gia tri danh muc ao" — text-caption (12px, weight 500), text-secondary
  Row 2: "520.450.000d" — text-display-xl (40px, weight 800), text-primary, mt: 4px
         Number roll-up animation: 500ms ease-decelerate on mount

  Row 3 — P&L (mt: 8px):
    "+20.450.000d" — text-body-md (14px, weight 600), positive (#10B981)
    "(+4,09%)" — text-body-sm (13px), positive, ml: 4px
    "tu khi bat dau" — text-caption (12px), text-secondary, ml: 8px

  Row 4 — Available Cash (mt: 12px):
    "Tien mat kha dung:" — text-caption (12px), text-secondary
    "379.550.000d" — text-body-sm (13px, weight 600), text-primary, ml: 4px

  Row 5 — Goal Progress Bar (mt: 12px, only if goal set per FR-GAME-07):
    Label: "Muc tieu: 600.000.000d" — text-caption (11px), text-secondary
    Bar:   width 303px (card width - 40px), height 6px, radius-full
           Background: bg-card
           Fill: accent-primary, width proportional to progress %
    Progress: "86%" — text-caption-bold (11px), accent-primary, right-aligned
```

**Section 2 — Portfolio Value Chart**
```
mx: 16px, mt: 24px

Time range tabs:
  "1W" | "1T" | "3T" | "1N"
  Tab: height 32px, px: 12px, text-caption-bold (12px)
  Active: accent-primary text, border-bottom 2px accent-primary
  Inactive: text-secondary, no border

Chart:
  Width:      343px
  Height:     160px
  Type:       Area line chart, accent-secondary (#06B6D4) stroke 1.5px
  Fill:       accent-secondary-subtle below line
  Y-axis:     right, 3 price labels, text-caption (11px), text-secondary
  X-axis:     bottom, date labels, text-caption (11px), text-secondary
  Animation:  Draw-in 600ms ease-decelerate on mount and range change
  Long-press: Crosshair with tooltip (date + value)
```

**Section 3 — Holdings List**
```
mt: 24px, mx: 16px

Header: "Co phieu nam giu (3)" — text-title-sm (16px, weight 600), text-primary, mb: 12px

Holding row (each):
  Width:      343px
  Height:     76px
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px
  Radius:     radius-md (12px)
  Padding:    horizontal 16px
  Gap:        8px between rows

  Left:
    Logo:    32x32px, radius-full
    Right (ml: 12px):
      Ticker: "VCB" — text-title-sm (16px, weight 600), text-primary
      Detail: "10 CP . Gia TB: 88.000d" — text-body-sm (13px), text-secondary, mt: 2px

  Right:
    Current:  "90.200d" — text-title-sm (16px, weight 700), tabular-nums, text-primary
    P&L:      "+22.000d (+2,50%)" — text-body-sm (13px), positive/negative, mt: 2px

  Tap -> Navigate to Stock Detail
```

### Main Content — Tab 2: "Lenh cho" (Open Orders)
```
Open order row (each):
  Height:     80px
  Background: bg-card, radius-md (12px)
  Margin:     horizontal 16px, bottom 8px
  Padding:    16px

  Left:
    "Mua VCB" — text-title-sm (16px, weight 600), text-primary
    "Gioi han <= 85.000d" — text-body-sm (13px), text-secondary, mt: 2px
    "Het han: 14/05/2026 (28 ngay)" — text-caption (12px), text-secondary, mt: 2px

  Right:
    "10 CP" — text-body-sm (13px, weight 600), text-primary
    "Huy" — text-body-sm (13px), negative (#EF4444), touchable, 44x44px min
    Tap "Huy" -> Alert.confirm -> cancel order -> remove from list + return reserved cash

Empty state: "Khong co lenh dang cho" + illustration
```

### Main Content — Tab 3: "Lich su" (Trade History)
```
Trade row (each):
  Height:     72px
  Padding:    horizontal 16px
  Divider:    border 1px bottom

  Left:
    Type icon: Buy arrow-up-circle (positive-subtle bg) / Sell arrow-down-circle (negative-subtle bg)
               36x36px
    Right (ml: 12px):
      "Mua VCB" — text-title-sm (16px, weight 600), text-primary
      "14/04/2026 . 09:30 . Thi truong" — text-caption (12px), text-secondary, mt: 2px

  Right:
    "+10 CP" or "-10 CP" — text-body-sm (13px, weight 600), positive/negative
    "880.000d" — text-caption (12px), text-secondary, mt: 2px

Pre-reset entries: "[Pre-Reset]" tag, text-caption, warning-subtle bg, warning text
Sort: Reverse chronological
Pagination: 20 per load, infinite scroll
Empty state: "Chua co giao dich nao" + "Bat dau giao dich" CTA -> Stock Detail
```

### Interaction Rules
```
Tab switch           -> Content fades (250ms ease-standard)
Holdings row tap     -> Navigate to Stock Detail
Chart range tap      -> Reload chart data, re-animate
Chart long-press     -> Crosshair with value tooltip
Settings icon tap    -> Portfolio settings (reset, goal)
Open order "Huy"     -> Confirmation dialog -> cancel
Pull-to-refresh      -> Reload all data
```

### States
```
Default:     Holdings + chart loaded, virtual funds banner visible
Loading:     Skeleton hero + 3 skeleton holding rows + chart skeleton
Empty:       "Chua co danh muc. Bat dau giao dich ngay!"
             CTA: "Kham pha co phieu" -> Discover tab
Error:       "Khong the tai danh muc" + retry button
Goal set:    Progress bar visible in hero card
Goal reached: Progress bar at 100%, positive color, celebration triggered (FR-GAME-06)
```

### Edge Cases
```
Stock delisted:       Holding shows "Da huy niem yet" badge, P&L frozen
Market data outage:   Last cached prices, stale timestamp indicator
No holdings:          Empty state with CTA to Discover
100+ trade history:   Infinite scroll, 20 per batch
Portfolio reset:      All holdings cleared, history entries tagged "[Pre-Reset]"
Goal cancelled:       Progress bar removed from hero card
Virtual balance = 0:  "So du tien mat: 0d" in warning color
```

### Dev Handoff Specs
```
Hero card:
  Number roll-up: Animated.Value from 0 to value, 500ms ease-decelerate
  P&L color: positive > 0, negative < 0, neutral === 0

Chart:
  Library: Victory Native or react-native-wagmi-charts
  Data: GET /paper-portfolio/chart?range=1W|1M|3M|1Y
  Crosshair: PanGestureHandler, track x -> nearest data point

Holdings list:
  GET /paper-portfolio/holdings
  Real-time price overlay from WebSocket or 30s polling
  FlatList with keyExtractor = ticker

Open orders:
  GET /paper-portfolio/open-orders
  Cancel: DELETE /paper-orders/{orderId}

Trade history:
  GET /paper-portfolio/trades?page=N&limit=20
  Infinite scroll: onEndReachedThreshold 0.5

Goal progress:
  GET /paper-portfolio/goal
  Progress: (currentValue - startValue) / (goalValue - startValue) * 100
  Clamped to 0-100%

Sub-tabs:
  TabView (react-native-tab-view), lazy render per tab
  Animated underline indicator, 200ms ease-standard
```

### QA Tests
```
[ ] Virtual Funds banner visible on all tabs, non-dismissible
[ ] Portfolio total animates on load (number roll-up)
[ ] P&L color: positive green, negative red, zero gray
[ ] Available cash displayed correctly
[ ] Goal progress bar visible when goal set, hidden when not
[ ] Chart renders for all time ranges (1W, 1M, 3M, 1Y)
[ ] Chart crosshair works on long-press
[ ] Holdings list shows correct ticker, quantity, avg price, P&L
[ ] Tapping holding navigates to Stock Detail
[ ] Open orders tab shows pending limit orders
[ ] "Huy" cancels order after confirmation
[ ] Trade history loads in reverse chronological order
[ ] Pre-reset entries tagged with "[Pre-Reset]"
[ ] Infinite scroll works on trade history
[ ] Empty states shown correctly for each tab
[ ] Pull-to-refresh triggers data reload
[ ] Settings gear opens portfolio settings
```

---

## Screen 26 — Gamification Hub

### Screen Overview
```
Screen: Gamification Hub
User:   User viewing their progress, tier, streaks, and challenges
Goal:   Centralize XP, tier badge, streak counter, weekly challenge, and achievements
Refs:   FR-GAME-01 through FR-GAME-07
```

### Layout
```
Header:     Back + "Thanh tich cua toi"
Main:       Scrollable — tier card, XP bar, streak, challenge, achievement history
Bottom:     (no nav bar if push; or nav bar if tab)
```

### Main Content

**Section 1 — Trader Tier Hero**
```
mx: 16px, mt: 16px

Card:
  Width:      343px
  Height:     200px
  Background: gradient-hero + gradient-accent-glow overlay
  Radius:     radius-xl (24px)
  Padding:    24px
  Shadow:     shadow-card-raised
  Align:      center

  Tier badge:
    Size:       80x80px
    Shape:      Circle, radius-full
    Background: Tier-specific gradient:
      Tier 1 (Seedling):  #4ADE80 to #166534
      Tier 2 (Learner):   #60A5FA to #1E40AF
      Tier 3 (Investor):  #A78BFA to #5B21B6
      Tier 4 (Trader):    #F472B6 to #9D174D
      Tier 5 (Expert):    #FBBF24 to #92400E
      Tier 6 (Legend):    #F97316 to #9A3412
    Icon:       Tier-specific icon (seedling/book/chart/diamond/crown/trophy), 36px, #FFFFFF
    Animation:  Subtle pulse glow, 2s infinite alternate, opacity 0.6 to 1

  Tier name (mt: 12px):
    "Nha dau tu" — text-title-lg (20px, weight 700), text-primary
    "Tier 3 of 6" — text-caption (12px), text-secondary, mt: 2px

  Trader Score (mt: 8px):
    "Diem: 1.850" — text-body-md (14px, weight 600), accent-primary
```

**Section 2 — XP Progress Bar**
```
mx: 16px, mt: 24px

Card:
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px
  Radius:     radius-md (12px)
  Padding:    16px

  Row 1:
    Left: "XP den Tier tiep theo" — text-body-sm (13px), text-secondary
    Right: "1.850 / 3.500" — text-body-sm (13px, weight 600), text-primary, tabular-nums

  Progress bar (mt: 8px):
    Width:      311px (card width - 32px)
    Height:     8px
    Radius:     radius-full
    Background: bg-secondary (#161B22)
    Fill:       accent-primary (#3B82F6), width: (current/target * 100)%
    Animation:  Width fill on mount, 500ms ease-decelerate

  Row 2 (mt: 8px):
    "Con 1.650 XP nua" — text-caption (12px), text-secondary
    Right: "Trader" — text-caption-bold (12px), accent-primary (next tier name)
```

**Section 3 — Streak Counter**
```
mx: 16px, mt: 16px

Card:
  Background: bg-card
  Border:     border 1px
  Radius:     radius-md (12px)
  Padding:    16px
  Height:     auto

  Left:
    Flame icon 24px, warning (#F59E0B) (active streak) / text-tertiary (broken)
  
  Center (ml: 12px):
    "Chuoi hoc tap" — text-body-sm (13px, weight 600), text-primary
    "12 ngay lien tiep" — text-body-sm (13px), text-secondary, mt: 2px

  Right:
    Streak freeze indicator:
      Active freeze:   Shield icon 20px, accent-primary, "1 dong bang"
                       text-caption (11px), accent-primary
      Used freeze:     Shield icon 20px, text-tertiary, "Da su dung"
      No freeze:       Hidden

  Bottom row (mt: 8px, if streak active):
    7 day indicators, flex-row, gap: 4px
    Each: 8px circle
    Completed: positive (#10B981) fill
    Today (not yet done): accent-primary border, no fill
    Future: bg-card
    Frozen day: accent-primary-subtle fill with snowflake mini icon
```

**Section 4 — Weekly Challenge**
```
mx: 16px, mt: 16px

Card:
  Background: bg-card
  Border:     accent-primary (#3B82F6) 1px
  Radius:     radius-md (12px)
  Padding:    16px

  Header row:
    Left:  Trophy icon 20px, warning (#F59E0B)
    Right: "Thu thach tuan" — text-body-sm (13px, weight 600), text-primary
    Far right: Timer "3N 14h" — text-caption-bold (12px), accent-primary

  Challenge description (mt: 8px):
    "Dat loi nhuan cao nhat danh muc co phieu cong nghe VN tuan nay"
    text-body-md (14px), text-primary, line-height: 1.5

  Progress (mt: 12px):
    Bar: width full, height 6px, radius-full, bg-secondary
    Fill: positive, proportional to completion
    "Dang dung #4 / 128 nguoi tham gia" — text-caption (12px), text-secondary, mt: 4px

  Reward (mt: 8px):
    "+100 XP . Huy hieu thanh tich" — text-caption-bold (12px), accent-primary
    Star icon 12px before text
```

**Section 5 — Achievement History**
```
mx: 16px, mt: 24px, pb: 100px

Label: "Thanh tich" — text-title-sm (16px, weight 600), text-primary, mb: 12px

Achievement row (each):
  Height:     64px
  Background: none (divider between)
  Padding:    horizontal 0

  Left:
    Badge icon: 40x40px, radius-md (12px)
    Achievement-specific icon + gradient background

  Center (ml: 12px):
    "Giao dich dau tien" — text-body-md (14px, weight 600), text-primary
    "14/04/2026" — text-caption (12px), text-secondary, mt: 2px

  Right:
    "+10 XP" — text-body-sm (13px, weight 600), accent-primary

  Divider: border-subtle 1px

Scrollable, show all achievements earned
Unearned: shown as locked (opacity 0.4, lock icon overlay)
```

### Interaction Rules
```
Tier badge tap        -> Info tooltip explaining tier system
XP bar tap            -> Expand to show XP breakdown (trade, lesson, login, challenge)
Streak card tap       -> Expand to show streak calendar view
Challenge card tap    -> Navigate to challenge detail screen
Achievement row tap   -> Show achievement detail modal with share button
Pull-to-refresh       -> Reload all gamification data
```

### States
```
Default:     All sections loaded with current data
Loading:     Skeleton tier card + progress bar + 3 skeleton rows
No streak:   Flame icon grayed, "Hoan thanh 1 bai hoc de bat dau chuoi!"
No challenge: "Thu thach tuan moi bat dau vao thu Hai" placeholder card
Empty achievements: "Chua co thanh tich. Hay bat dau giao dich!"
Error:       "Khong the tai du lieu" + retry
```

### Edge Cases
```
Tier upgrade during view:  Real-time update, badge animation triggers
Week boundary (Sunday):    Score re-computed, tier may change
Streak freeze activation:  Shield icon updates immediately (optimistic)
Challenge not participated: "Chua tham gia" label, lower opacity
Max tier (Legend):          XP bar hidden, "Tier cao nhat!" label
XP event queued:           Eventually consistent; may show old value briefly
```

### Dev Handoff Specs
```
Tier badge:
  Gradient: LinearGradient (expo-linear-gradient or react-native-linear-gradient)
  Pulse animation: Animated.loop, Animated.sequence [
    opacity 0.6 to 1 (1000ms ease-standard),
    opacity 1 to 0.6 (1000ms ease-standard)
  ]

XP progress:
  GET /gamification/xp-summary
  Bar fill: Animated.View width interpolation, 500ms ease-decelerate

Streak:
  GET /gamification/streak
  Freeze: POST /gamification/streak/freeze
  Calendar dots: 7-day sliding window based on current week

Challenge:
  GET /gamification/weekly-challenge
  Timer: countdown to Sunday 23:59:59 user local timezone

Achievements:
  GET /gamification/achievements
  Earned vs locked based on "achieved_at" field (null = locked)
```

### QA Tests
```
[ ] Tier badge displays correct tier with appropriate color gradient
[ ] XP progress bar shows correct current/target values
[ ] XP bar fills proportionally on load
[ ] Streak counter shows correct consecutive day count
[ ] Streak freeze indicator shows availability
[ ] 7-day dot indicators reflect completed/current/future days
[ ] Weekly challenge card shows description and timer
[ ] Challenge timer counts down accurately
[ ] Achievement history shows earned achievements with dates
[ ] Locked achievements shown at reduced opacity
[ ] Pull-to-refresh reloads all gamification data
[ ] Tier name displays in user's active language
[ ] Score formatted with locale-appropriate thousand separators
```

---

## Screen 27 — AI Chat Interface

### Screen Overview
```
Screen: AI Chat (Natural Language Stock Query)
User:   User asking questions about stocks in VN/KR/EN
Goal:   Get AI-powered educational answers about stocks
Refs:   FR-AI-02, FR-AI-03, FR-LEGAL-02
```

### Layout
```
Header:     Screen title + info icon
Main:       Chat message list (scrollable, reverse)
Bottom:     Text input bar (sticky above keyboard)
```

### Header
```
Height:     56px + safe-area-inset-top
Background: bg-primary (#0D1117)
Left:       Back arrow or close x, 44x44px touch
Center:     Brain icon 20px + "Paave AI" — text-title-md (18px, weight 700), text-primary
Right:      Info icon (circle-info 24px), text-secondary, 44x44px
            Tap -> AI disclaimer modal (FR-LEGAL-02 full text)
```

### Chat Messages

**AI Welcome Message (first visit)**
```
Align:      left
Avatar:     24x24px, radius-full, accent-primary bg, brain icon 14px #FFFFFF
Bubble:
  Background: bg-card (#1F2937)
  Text:       text-body-md (14px), text-primary, line-height: 1.6
  Radius:     16px (top-left, top-right, bottom-right), 4px (bottom-left)
  Max-width:  310px
  Padding:    12px 16px
  Content:    "Xin chao! Toi co the giup ban tim hieu ve co phieu tren san 
               HOSE, HNX (Viet Nam) va KOSPI, KOSDAQ (Han Quoc). Hay hoi!"
```

**User Message Bubble**
```
Align:      right
Background: accent-primary (#3B82F6)
Text:       #FFFFFF, text-body-md (14px)
Radius:     16px (top-left, top-right, bottom-left), 4px (bottom-right)
Max-width:  280px
Padding:    12px 16px
Timestamp:  text-caption (10px), text-secondary, mt: 4px, right-aligned
```

**AI Response Bubble**
```
Align:      left
Avatar:     24x24px (same as welcome)
Background: bg-card (#1F2937)
Text:       text-primary, text-body-md (14px), line-height: 1.6
Radius:     16px (top-left, top-right, bottom-right), 4px (bottom-left)
Max-width:  310px
Padding:    12px 16px

Source attribution (below bubble, mt: 4px):
  "Nguon: Du lieu HOSE ngay 15/04/2026" — text-caption (11px), text-tertiary
  Icon: external-link 10px before text

Disclaimer (below source):
  "AI . Giao duc, khong phai tu van" — text-caption (10px), text-tertiary

Stock mention in response:
  "$VCB" — accent-primary text, underlined, touchable -> Stock Detail
```

**AI Typing Indicator**
```
Align:      left
Avatar:     same 24x24px
Bubble:     bg-card, radius same as AI bubble, width 60px, height 32px
Content:    3 dots, 6px each, radius-full, text-secondary
Animation:  Sequential bounce: translateY 0 to -4 to 0, 400ms each,
            stagger 100ms between dots, loop infinite
```

**Scope Restriction Message**
```
Same AI bubble style but with warning styling:
Background: warning-subtle (rgba(245,158,11,0.15))
Border:     warning (#F59E0B) 1px
Icon:       alert-triangle 16px, warning, left of text
Text:       "Toi chi co the tra loi ve co phieu VN (HOSE/HNX) va KR (KOSPI/KOSDAQ)."
            text-body-sm (13px), text-primary
```

### Suggested Questions (Empty State)
```
Below welcome message, mt: 16px

Chips (2 columns, 2 rows):
  "VCB co dang tot khong?"
  "So sanh FPT va VNM"
  "P/E cua HPG la bao nhieu?"
  "Nganh ngan hang VN ra sao?"

Chip style:
  Background: bg-card, border: border 1px, radius-lg (16px)
  Padding:    px: 12px, py: 8px
  Text:       text-body-sm (13px), text-primary
  Touch:      min height 44px
  Tap -> fills input and sends automatically
  Dismiss after first user message sent
```

### Input Bar
```
Position:   fixed bottom, above keyboard when active
Height:     56px + safe-area-inset-bottom
Background: bg-card (#1F2937), top border: border 1px
Padding:    horizontal 12px, vertical 8px

Input field:
  Height:      40px
  Background:  bg-secondary (#161B22)
  Border:      border (#374151) 1px, radius-full
  Padding:     horizontal 16px
  Placeholder: "Hoi ve co phieu..." — text-tertiary (#6B7280), 14px
  Text:        text-primary (#F9FAFB), 14px
  Max lines:   3 (auto-expand height)

Send button:
  Right of input, ml: 8px
  Size: 40x40px, radius-full
  Empty input: bg-card, arrow-up icon 20px, text-tertiary (disabled)
  Has text:    accent-primary bg, arrow-up icon 20px, #FFFFFF
  Animation:   bg color transition 150ms ease-standard
```

### Interaction Rules
```
Send tap / Enter     -> Send message, show AI typing indicator
AI response loads    -> Typing indicator replaced by response bubble
$TICKER in response  -> Tappable, navigates to Stock Detail
Out-of-scope query   -> Warning-styled restriction message
Suggested chip tap   -> Fill input + auto-send
AI timeout (>10s)    -> "Dang mat nhieu thoi gian. Thu lai?" with retry button
Close/back           -> Conversation cleared (10-turn max in session, FR-AI-02)
Input expand         -> Input bar height grows, max 3 lines before scroll
```

### States
```
Default:     Welcome message + suggested questions + empty input
Typing:      AI typing indicator visible (3 dots bounce)
Conversation: Messages listed, newest at bottom, auto-scroll
Error:       Error bubble from AI with retry link
Timeout:     "Dang mat nhieu thoi gian. Thu lai?" message
Empty:       Welcome message with suggested questions
```

### Edge Cases
```
Very long AI response:    Bubble expands, no truncation
Network error:            "Khong the ket noi. Kiem tra mang va thu lai."
10 turns reached:         "Phien hoi thoai da ket thuc. Bat dau cuoc hoi thoai moi?"
                          "Bat dau moi" button clears history
Language switch mid-chat: Next AI response in new language, history retained
Empty query:              Send button disabled
Query with only spaces:   Trimmed, treated as empty
```

### Dev Handoff Specs
```
Chat list:
  FlatList inverted: true (newest at bottom)
  contentContainerStyle: paddingBottom 80px (input bar clearance)
  keyExtractor: message UUID

Message send:
  POST /ai/chat { message, conversationId, language }
  Stream: Server-Sent Events or WebSocket for typewriter effect
  On response: replace typing indicator with bubble

Suggested questions:
  Hardcoded per language, hidden after first user message
  Tap: dispatch same flow as manual send

Typing indicator:
  Show on send, hide on response or timeout
  Timeout: 10000ms -> show retry

Conversation state:
  Max 10 turns stored in local state
  Cleared on close/back
  conversationId: UUID generated on first message

Source attribution:
  Parsed from AI response metadata field
  Rendered below bubble

Stock mention parsing:
  Regex: /\$([A-Z]{3,5})/g
  Render as TouchableOpacity with accent-primary text
  onPress: navigation.push("StockDetail", { ticker })
```

### QA Tests
```
[ ] Welcome message and avatar shown on first open
[ ] Suggested question chips visible on empty state
[ ] Tapping chip sends question and shows response
[ ] User messages right-aligned with accent-primary bg
[ ] AI messages left-aligned with bg-card bg
[ ] AI typing indicator (3 dots) shown during response
[ ] Source attribution shown below AI responses
[ ] Disclaimer shown below each AI response
[ ] $TICKER mentions tappable, navigate to Stock Detail
[ ] Out-of-scope query shows restriction message in warning style
[ ] Timeout after 10s shows retry option
[ ] Send button disabled when input empty
[ ] Input expands to 3 lines max
[ ] 10-turn limit: message shown with restart option
[ ] Close/back clears conversation
[ ] Info icon opens disclaimer modal
```

---

## Screen 28 — Post-Trade AI Card (Bottom Sheet)

### Screen Overview
```
Screen: Post-Trade AI Card (Bottom Sheet)
User:   User who just completed a paper trade
Goal:   Educate on what happened, why, and what to watch; collect feedback
Refs:   FR-AI-01, FR-LEGAL-02
```

### Layout
```
Type:       Bottom sheet (75% screen height)
Background: bg-card (#1F2937)
Radius:     radius-xl (24px) top corners
Handle:     4x32px pill, bg-border (#374151), centered, mt: 12px
Backdrop:   bg-overlay (rgba(0,0,0,0.60))
```

### Content
```
Header (mt: 16px, mx: 16px):
  Left:  Chart-bar icon 20px, accent-primary
  Title: "Phan tich giao dich" — text-title-lg (20px, weight 700), text-primary
  Right: Close x icon (24px), text-secondary, 44x44px touch

Trade reference (mt: 16px, mx: 16px):
  Background: bg-secondary (#161B22), radius-sm (8px), px: 12px, py: 8px
  "Da mua 10 VCB @ 88.000d" — text-body-md (14px, weight 600), positive
  Timestamp: "14/04/2026 09:30" — text-caption (12px), text-secondary, ml: 8px

Section 1 — "Chuyen gi da xay ra?" (mt: 24px, mx: 16px):
  Icon:  trending-up 16px, accent-secondary (#06B6D4)
  Title: text-title-sm (16px, weight 600), text-primary
  Body (mt: 8px):
    text-body-md (14px), text-primary, line-height: 1.6
    AI-generated plain-language description of recent price action

Section 2 — "Vi sao?" (mt: 20px, mx: 16px):
  Icon:  lightbulb 16px, warning (#F59E0B)
  Title: text-title-sm (16px, weight 600), text-primary
  Body (mt: 8px):
    Up to 3 bullet causal factors
    Bullet: 4px circle, text-secondary, mr: 8px
    text-body-md (14px), text-primary, line-height: 1.5

Section 3 — "Can theo doi gi?" (mt: 20px, mx: 16px):
  Icon:  eye 16px, accent-primary (#3B82F6)
  Title: text-title-sm (16px, weight 600), text-primary
  Body (mt: 8px):
    1-2 forward-looking signals
    text-body-md (14px), text-primary, line-height: 1.6

Rating row (mt: 24px, mx: 16px):
  "Phan tich nay huu ich khong?" — text-body-sm (13px), text-secondary
  Thumbs up / down buttons:
    Size: 44x44px each, gap: 12px
    Background: bg-secondary, radius-full
    Icon: thumbs-up / thumbs-down 20px, text-secondary
    Selected up: positive-subtle bg, positive icon
    Selected down: negative-subtle bg, negative icon
    Tap: POST /ai/feedback { tradeId, rating: "up"|"down" }
    Only one selectable; tapping changes selection
    Confirmation: brief checkmark overlay, 200ms

Disclaimer (mt: 16px, mx: 16px, mb: 32px + safe-area):
  text-caption (11px), text-tertiary
  "Noi dung AI chi mang tinh giao duc. Khong phai loi khuyen dau tu."
  Non-collapsible, always visible (FR-LEGAL-02)
```

### Interaction Rules
```
Close x tap          -> Dismiss sheet (300ms ease-accelerate)
Swipe down           -> Dismiss sheet
Thumbs up/down tap   -> Record rating, visual confirmation
Backdrop tap         -> Dismiss sheet
Section body scroll  -> Sheet content scrolls independently
$TICKER in body      -> Tappable, navigates to Stock Detail (dismiss sheet first)
```

### States
```
Default:     3 sections loaded, expanded, disclaimer visible
Loading:     Skeleton text blocks for 3 sections (pulsing), 
             rating row hidden until content loads
Error:       "Phan tich tam thoi khong kha dung. Kiem tra lai sau."
             Single text block replacing all 3 sections
             Disclaimer still visible
Rated:       Selected thumb highlighted, opposite dimmed
Dismissed:   Sheet closes, not shown again for this trade
```

### Edge Cases
```
AI service timeout:      Show error state after 5s
Very long AI response:   Sheet becomes scrollable, all content accessible
Multiple trades rapid:   Only show for most recent trade; queue max 1
Language mismatch:       Response always in user's app language (FR-AI-03)
Trade during error:      Card not shown; logged silently for analytics
Reduced motion:          No slide-up animation; instant appear with opacity fade
```

### Dev Handoff Specs
```
Sheet:
  react-native-bottom-sheet or @gorhom/bottom-sheet
  snapPoints: ['75%']
  enablePanDownToClose: true
  backdropOpacity: 0.6
  Open animation: translateY 100% to 0, 350ms ease-decelerate
  Close animation: translateY 0 to 100%, 300ms ease-accelerate

Content:
  GET /ai/post-trade-analysis { tradeId }
  Response: { whatHappened, why: [], whatToWatch, sources }
  Timeout: 5000ms -> error state

Rating:
  POST /ai/feedback { tradeId, rating: "up"|"down" }
  Optimistic: immediate visual, API async
  Idempotent: re-rating overwrites previous

Shown-once check:
  AsyncStorage key: "post_trade_shown_{tradeId}" = true
  Check before displaying; if true, skip

Haptic:
  On sheet open: impact (light)
  On rating tap: impact (medium)
```

### QA Tests
```
[ ] Sheet appears after trade fill (within 5s)
[ ] 3 sections rendered: What happened, Why, What to watch
[ ] Content matches user's active language
[ ] Source attribution shown
[ ] Disclaimer always visible at bottom
[ ] Thumbs up/down buttons work, only one selectable
[ ] Rating changes visual state immediately
[ ] Close x dismisses sheet
[ ] Swipe down dismisses sheet
[ ] Backdrop tap dismisses sheet
[ ] Sheet not re-shown for same trade on revisit
[ ] Error state shown if AI service unavailable
[ ] $TICKER mentions tappable, navigate to Stock Detail
[ ] Reduced motion: opacity fade instead of slide
```

---

## Screen 29 — Community Feed (Per-Ticker)

### Screen Overview
```
Screen: Community Feed (Tab within Stock Detail)
User:   User reading community opinions about a specific stock
Goal:   View Bull/Bear/Neutral posts from other users about this ticker
Refs:   FR-SOC-02, FR-SOC-01
```

### Layout
```
Tab:        "Cong dong" tab within Stock Detail screen
Main:       Scrollable post list with sentiment summary
Bottom:     Floating "Viet bai" FAB button
```

### Sentiment Summary Bar
```
Height:     44px
mx: 16px, mt: 12px
Background: bg-card (#1F2937), radius-md (12px)
Padding:    horizontal 12px, vertical 8px

Content:
  Horizontal ratio bar:
    Height: 6px, radius-full, full width
    Green segment: Bull %, positive (#10B981)
    Red segment:   Bear %, negative (#EF4444)
    Gray segment:  Neutral %, neutral (#9CA3AF)
    Animation:     Width fill on mount, 400ms ease-decelerate

  Label below bar (mt: 4px):
    "62% Bull . 28% Bear . 10% Neutral" — text-caption (11px), text-secondary
    Requires >= 5 posts in 24h to display ratio
    Below threshold: "Chua du bai viet de hien thi tam ly" — text-caption, text-tertiary
```

### Post Card (Each)
```
Width:      343px
Background: bg-card (#1F2937)
Border:     border (#374151) 1px
Radius:     radius-md (12px)
Padding:    16px
Margin:     horizontal 16px, bottom 8px

Row 1 — Author info:
  Avatar:     28x28px, radius-full, bg determined by pseudonym hash
  Right (ml: 8px):
    Pseudonym: "trader_minh" — text-body-sm (13px, weight 600), text-primary
               Touchable -> User Public Profile (Screen 31)
    Badge:     Tier badge — text-caption (11px)
               Background: tier-color-subtle, text: tier-color, radius-sm (8px)
               px: 6px, py: 2px
               e.g., "Lv.3 Nha dau tu"
  Far right:
    Timestamp: "2h truoc" — text-caption (11px), text-secondary

Row 2 — Sentiment tag (mt: 8px):
  Bull:    Green circle 8px + "Bull" — positive-subtle bg, positive text
  Bear:    Red circle 8px + "Bear" — negative-subtle bg, negative text
  Neutral: Gray circle 8px + "Trung lap" — bg-card, border, text-secondary
  Container: radius-full, px: 8px, py: 2px, height: 24px

Row 3 — Post body (mt: 8px):
  text-body-md (14px), text-primary, line-height: 1.5
  Max 280 chars visible; posts > 280 chars: "...Doc them" link (accent-primary)
  $TICKER cashtags: accent-primary text, touchable -> Stock Detail

Row 4 — Engagement (mt: 12px):
  Like count + Comment count, flex-row, gap: 16px
  Like: heart icon 16px + count — text-caption (12px), text-secondary
  Comment: message-circle icon 16px + count — text-caption (12px), text-secondary
```

### Floating Action Button
```
Position:   bottom-right, right: 16px, bottom: 80px (above bottom nav area)
Size:       56x56px
Background: accent-primary (#3B82F6)
Icon:       pencil 24px, #FFFFFF
Shadow:     shadow-card-raised
Radius:     radius-full
Tap -> Post Creation (Screen 30)
Haptic: impact (light) on tap
```

### Interaction Rules
```
Post card tap body    -> Expand post if truncated
Post author tap       -> Navigate to User Public Profile (Screen 31)
$TICKER tap           -> Navigate to Stock Detail
FAB tap               -> Navigate to Post Creation (Screen 30)
Infinite scroll       -> Load 20 more posts at 50% threshold
Pull-to-refresh       -> Reload post feed
Like icon tap         -> Toggle like (optimistic)
```

### States
```
Default:     Posts loaded (newest 20), sentiment bar visible
Loading:     Skeleton: 1 sentiment bar + 3 skeleton post cards
Empty:       Centered content:
               Icon: message-circle 48px, text-secondary
               "Hay la nguoi dau tien viet ve $VCB"
               text-body-md, text-primary, mt: 12px
               "Viet bai" CTA button, accent-primary, height 44px, mt: 16px
Infinite:    Spinner 24px, accent-primary, at bottom of list
Error:       "Khong the tai bai viet" + "Thu lai" button
Moderated:   Post hidden, placeholder "Bai viet da bi go" text-tertiary
```

### Edge Cases
```
< 5 posts in 24h:    Sentiment bar shows "Chua du bai viet" instead of ratio
Post deleted by mod:  Placeholder row, not removable by user
Very long post:       Truncated at 280 chars with "Doc them" expander
Network offline:      Cached posts shown if available; FAB disabled with tooltip
Author account deleted: Author shows "[Da xoa tai khoan]", avatar grayed
```

### Dev Handoff Specs
```
Feed list:
  GET /community/posts?ticker=VCB&page=N&limit=20
  FlatList, keyExtractor: post UUID
  onEndReachedThreshold: 0.5
  Pull-to-refresh: accent-primary tint

Sentiment data:
  GET /community/sentiment?ticker=VCB&period=24h
  Returns: { bull: 62, bear: 28, neutral: 10, totalPosts: 35 }
  Hide if totalPosts < 5

Post expansion:
  numberOfLines: toggles between null and calculated line count for 280 chars
  Animation: height interpolation, 200ms ease-standard

Like toggle:
  POST /community/posts/{id}/like (toggle)
  Optimistic update; revert on API fail

FAB:
  position: absolute, right: 16, bottom: 80 + safe-area-inset-bottom
  zIndex above feed list
```

### QA Tests
```
[ ] Sentiment bar renders correct Bull/Bear/Neutral proportions
[ ] Sentiment hidden when < 5 posts in 24h
[ ] Post cards show author pseudonym, tier badge, sentiment tag
[ ] Timestamp shown correctly (relative: "2h truoc", "Hom qua")
[ ] Posts truncated at 280 chars with "Doc them" link
[ ] $TICKER cashtags tappable, navigate to Stock Detail
[ ] Author name tappable, navigate to User Public Profile
[ ] Empty state shown with "Hay la nguoi dau tien" message
[ ] FAB visible and tappable, navigates to Post Creation
[ ] Infinite scroll loads more posts
[ ] Pull-to-refresh reloads feed
[ ] Like toggle works (optimistic update)
[ ] Moderated posts show placeholder
```

---

## Screen 30 — Post Creation

### Screen Overview
```
Screen: Post Creation
User:   User writing a community post about a stock
Goal:   Publish opinion with $TICKER tag, sentiment selection, and 60s cancel window
Refs:   FR-SOC-03, BR-23
```

### Layout
```
Type:       Full-screen push
Header:     "Viet bai" + Close x + character count
Main:       Scrollable — ticker tag, sentiment selector, text area
Bottom:     Publish button (sticky)
```

### Header
```
Height:     56px + safe-area-inset-top
Background: bg-primary (#0D1117)
Left:       x Close icon (24px), text-secondary, 44x44px touch
Center:     "Viet bai" — text-title-md (18px, weight 700), text-primary
Right:      Character counter: "247/1.000" — text-caption (12px), text-secondary
            Turns warning (#F59E0B) at 900+
            Turns negative (#EF4444) at 1,000 (max reached)
```

### Main Content

**Section 1 — Ticker Tags**
```
mx: 16px, mt: 16px

Label: "Co phieu" — text-body-sm (13px, weight 500), text-secondary, mb: 8px

Tag row (flex-row, wrap):
  Pre-filled tag: "$VCB" — accent-primary-subtle bg, accent-primary text
    Height: 28px, radius-full, px: 10px
    x remove icon 12px on right side of tag
  
  "+" Add button: bg-card, border: border, radius-full
    Height: 28px, px: 10px, text-secondary, "+ Them"
    Tap -> ticker search overlay (debounced 300ms, same as market search)
    Max 5 cashtags per post (FR-SOC-03)
    At 5 tags: "+" button hidden

Ticker search overlay:
  Height: 50% screen
  Input: auto-focus, search by ticker or company name
  Results: list of matching stocks, tap to add
```

**Section 2 — Sentiment Selector**
```
mx: 16px, mt: 16px

Label: "Quan diem cua ban" — text-body-sm (13px, weight 500), text-secondary, mb: 8px
Required indicator: "Bat buoc" — text-caption (11px), negative, ml: 4px

3 horizontal options:
  Each: height 44px, flex: 1, gap: 8px between
  Radius: radius-full

  Bull:
    Default:  bg-card, border: border, text: text-secondary
              Circle 8px positive + "Bull" text-body-sm (13px)
    Selected: positive-subtle bg, positive border 2px, positive text

  Bear:
    Default:  bg-card, border: border, text: text-secondary
              Circle 8px negative + "Bear"
    Selected: negative-subtle bg, negative border 2px, negative text

  Neutral:
    Default:  bg-card, border: border, text: text-secondary
              Circle 8px neutral + "Trung lap"
    Selected: bg-card, border 2px text-primary, text-primary text

  Animation: background + border transition, 150ms ease-standard
```

**Section 3 — Text Area**
```
mx: 16px, mt: 16px

Input:
  Width:      343px
  Min-height: 200px (auto-expand as user types)
  Background: bg-secondary (#161B22)
  Border:     border (#374151) 1px, radius-md (12px)
  Focus:      border-focus (#3B82F6) 2px
  Padding:    16px
  Placeholder: "Chia se quan diem cua ban ve $VCB..." — text-tertiary, 14px
  Text:       text-body-md (14px), text-primary, line-height: 1.5
  Max:        1,000 characters (FR-SOC-03)
  At max:     Input rejects additional characters
              Counter shows "1.000/1.000" in negative

Cashtag auto-suggestion:
  When user types "$" followed by letters:
    Dropdown below cursor: up to 5 matching tickers
    Each: ticker + company name, height 44px
    Tap -> inserts "$TICKER" into text at cursor position
    Dropdown dismisses on selection or when "$" pattern breaks
```

### Publish Button (Sticky Bottom)
```
Position:   fixed bottom
Height:     80px + safe-area-inset-bottom
Background: bg-primary, top border: border 1px
Padding:    horizontal 16px, vertical 14px

Default state (pre-publish):
  Width:    343px
  Height:   52px
  Radius:   radius-lg (16px)
  Enabled:  accent-primary bg, #FFFFFF text, "Dang bai"
  Disabled: bg-card, text-tertiary
  Enabled when: text length > 0 AND sentiment selected AND >= 1 cashtag

Countdown state (post-tap):
  Background: bg-card (#1F2937)
  Border:     border (#374151) 2px
  Text:       "Huy dang (58s)" — text-body-md (14px, weight 600), text-primary
  Countdown:  accent-primary color for seconds number
  Progress:   Circular progress indicator around button border (optional)
              or linear progress bar at bottom of button
  
  60-second countdown per FR-SOC-03
  "Huy" action available during entire countdown
  After 60s: post published, navigate back to Community Feed

Cancel during countdown:
  Tap countdown button -> post cancelled
  Toast: "Da huy bai viet"
  Return to creation screen with content preserved
```

### Interaction Rules
```
Sentiment tap        -> Select (only one at a time), 150ms transition
"+" ticker tap       -> Open ticker search overlay
Ticker x tap         -> Remove tag (min 1 required)
"$" typed            -> Show cashtag autocomplete dropdown
Publish tap          -> 60s countdown starts, button changes to cancel mode
Cancel during 60s    -> Post cancelled, content preserved
After 60s            -> Post published, toast "Bai viet da duoc dang!"
                        Navigate back to Community Feed
Close x tap          -> Confirm discard: "Huy bai viet? Noi dung se bi mat."
                        "Huy" / "Tiep tuc viet"
```

### States
```
Default:      Empty form, $TICKER pre-filled from Stock Detail context
Typing:       Character count updates live
Ready:        All required fields filled (text + sentiment + cashtag), publish enabled
Publishing:   60s countdown, cancel button shown
Published:    Toast "Bai viet da duoc dang!" + navigate to Community Feed
Cancelled:    Toast "Da huy bai viet" + content preserved on screen
Flagged:      "Bai viet dang duoc xem xet" (moderation hold per FR-SOC-03)
Error:        Toast "Khong the dang bai. Thu lai."
```

### Edge Cases
```
1,000 char limit:        Input rejects chars at 1,001; counter shows red
No cashtag in text:      Server rejects; "Bai viet can co it nhat 1 $TICKER"
Moderation flag:         Posts with "mua ngay" / "ban ngay" without context -> held
Network loss during 60s: Post queued locally; published when connection restores
Close without saving:    Confirm dialog to prevent accidental loss
5 cashtags max:          "+" button hidden when 5 tags present
Empty ticker search:     "Khong tim thay co phieu"
```

### Dev Handoff Specs
```
Character counter:
  textLength = input.length
  color: textLength < 900 ? text-secondary : textLength < 1000 ? warning : negative

Cashtag auto-suggest:
  Trigger: regex /\$([A-Z]{1,5})$/ at cursor position
  Debounce: 300ms
  API: GET /stocks/search?q={query}&limit=5
  Insert: replace "$partial" with "$TICKER " (space after)

Publish flow:
  1. Validate: text.trim().length > 0 AND sentiment !== null AND cashtags.length >= 1
  2. Start 60s countdown (local timer)
  3. After 60s OR user does not cancel:
     POST /community/posts { text, sentiment, cashtags, ticker }
  4. On 201: navigate back, refresh feed
  5. On 400: show validation error
  6. On 423: moderation hold message

Countdown timer:
  useRef + setInterval, 1000ms ticks
  Display: remaining seconds
  Clear on cancel or unmount

Discard confirmation:
  Alert.alert with "Huy bai viet?" title
  Buttons: "Huy" (destructive) | "Tiep tuc viet" (cancel)
```

### QA Tests
```
[ ] Pre-filled $TICKER tag from Stock Detail context
[ ] Character counter updates in real-time
[ ] Counter turns warning at 900, red at 1,000
[ ] Input rejects characters beyond 1,000
[ ] Sentiment selector: only one selectable at a time
[ ] Publish disabled without text, sentiment, or cashtag
[ ] Publish enabled when all required fields present
[ ] 60s countdown starts on publish tap
[ ] Cancel during countdown: post not published, content preserved
[ ] After 60s: post published, toast shown, navigate to feed
[ ] Cashtag "$" auto-suggest appears while typing
[ ] Cashtag suggestion tap inserts ticker into text
[ ] "+" button adds additional tickers (max 5)
[ ] Close x triggers discard confirmation dialog
[ ] Moderation flag shown for directive language without analysis
[ ] Network error: toast shown, content preserved
```

---

## Screen 31 — User Public Profile

### Screen Overview
```
Screen: User Public Profile
User:   Viewing own or another user's public profile
Goal:   See pseudonym, Trader Tier, score, post history, follow/unfollow
Refs:   FR-SOC-05, FR-SOC-04, FR-GAME-02
```

### Layout
```
Header:     Back arrow + pseudonym
Main:       Scrollable — profile card, stats, post list
Bottom:     (no nav bar — push screen from Community Feed or post author)
```

### Header
```
Height:     56px + safe-area-inset-top
Background: bg-primary (#0D1117)
Left:       Back arrow (arrow-left 20px), text-secondary, 44x44px touch
Center:     "@trader_minh" — text-title-md (18px, weight 700), text-primary
Right:      More icon (ellipsis-vertical 24px), text-secondary, 44x44px
            Tap -> Action sheet: "Chan nguoi dung" | "Bao cao"
```

### Profile Card
```
mx: 16px, mt: 16px

Card:
  Width:      343px
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px
  Radius:     radius-xl (24px)
  Padding:    24px
  Align:      center

  Avatar:
    Size: 64x64px, radius-full
    Background: Deterministic color from pseudonym hash
    Content: Initials (first 2 chars), text-display-md (24px, weight 700), #FFFFFF

  Pseudonym (mt: 12px):
    "trader_minh" — text-title-lg (20px, weight 700), text-primary

  Tier badge (mt: 8px):
    Container: tier-color-subtle bg, tier-color text, radius-full, px: 12px, py: 4px
    Icon: tier icon 14px + tier name
    "Nha dau tu . Lv.3" — text-body-sm (13px, weight 600)

  Trader Score (mt: 4px):
    "Diem: 1.850" — text-body-sm (13px), text-secondary

  Joined date (mt: 4px):
    "Thanh vien tu thang 03/2026" — text-caption (12px), text-secondary

Stats row (mt: 20px):
  3 columns, equal width, centered:
    "Bai viet" / "42"      — text-caption (11px) label, text-secondary
                              text-title-sm (16px, weight 700) value, text-primary
    "Nguoi theo doi" / "128"
    "Dang theo doi" / "67"
  Vertical dividers: 1px border between columns, height: 32px

Follow button (mt: 20px):
  Visible only when viewing another user's profile
  Not following:
    Width: 200px, height: 44px, radius-full
    Background: accent-primary (#3B82F6), text: #FFFFFF
    Text: "Theo doi" — text-body-md (14px, weight 600)
  Following:
    Background: accent-primary-subtle, text: accent-primary
    Text: "Dang theo doi"
    Border: accent-primary 1px
  Tap: toggle follow state (optimistic)
  Touch: 44px min height
```

### Post List
```
mt: 24px, mx: 16px, pb: 80px

Label: "Bai viet gan day" — text-title-sm (16px, weight 600), text-primary, mb: 12px

Posts: Same card design as Community Feed (Screen 29)
  Minus author row (since we are on their profile already)
  Shows: sentiment tag, post body, cashtags, timestamp, engagement
  
Pagination: 20 per load, infinite scroll
Sort: Reverse chronological
```

### Interaction Rules
```
Follow button tap     -> Toggle follow (optimistic, API async)
Post card tap         -> Expand truncated post
$TICKER in post       -> Navigate to Stock Detail
"Chan nguoi dung"     -> Confirmation -> block user -> their posts hidden from feed
"Bao cao"             -> Report form (reason: spam/harassment/misleading)
Pull-to-refresh       -> Reload profile + posts
Follower count tap    -> Navigate to follower list (future, V3)
Following count tap   -> Navigate to following list (future, V3)
```

### States
```
Default:     Profile + posts loaded
Loading:     Skeleton: avatar circle + stats row + 3 skeleton posts
No posts:    "Chua co bai viet nao" — text-body-md, text-secondary, centered
Error:       "Khong the tai ho so" + "Thu lai" button
Blocked:     Profile not accessible; "Nguoi dung da bi chan"
Own profile: Follow button hidden; "Chinh sua" link in header right instead
Deleted:     "[Da xoa tai khoan]" pseudonym, grayed avatar, posts retained
```

### Edge Cases
```
Self-follow attempt:   Prevented; "Ban khong the theo doi chinh minh"
Very long pseudonym:   Truncated at 20 chars with ellipsis
1,000 follow limit:    Toast "Da dat gioi han theo doi (1.000 nguoi)"
User deactivated:      Pseudonym replaced with "[Da xoa tai khoan]"
Block + Unblock:       Immediate; blocked user's posts hidden/restored
Network offline:       Cached profile shown if available; follow button disabled
Rapid follow/unfollow: Debounced 500ms to prevent API spam
```

### Dev Handoff Specs
```
Profile data:
  GET /users/{userId}/profile
  Returns: { pseudonym, tierLevel, tierName, score, postCount, 
             followerCount, followingCount, joinedDate, isFollowing }

Follow toggle:
  POST /users/{userId}/follow (toggle)
  Optimistic: update UI immediately, revert on 4xx/5xx
  Debounce: 500ms

Posts:
  GET /users/{userId}/posts?page=N&limit=20
  FlatList, keyExtractor: post UUID
  onEndReachedThreshold: 0.5

Block:
  POST /users/{userId}/block
  On success: navigate back, toast "Nguoi dung da bi chan"
  Blocked user's posts filtered client-side from all feeds

Report:
  POST /users/{userId}/report { reason: "spam"|"harassment"|"misleading" }
  On success: toast "Bao cao da duoc gui. Cam on ban."

Avatar color:
  Hash pseudonym string -> map to one of 6 palette colors:
  ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]
  color = palette[hash % 6]
```

### QA Tests
```
[ ] Pseudonym, tier badge, score displayed correctly
[ ] Joined date formatted as "thang MM/YYYY"
[ ] Stats (posts, followers, following) accurate
[ ] Follow button toggles state (optimistic)
[ ] Following state reflected in button text and style
[ ] Self-profile: follow button hidden, edit link shown
[ ] Post list loads in reverse chronological order
[ ] Infinite scroll loads more posts
[ ] $TICKER in posts navigates to Stock Detail
[ ] Block user: confirmation, then posts hidden
[ ] Report user: form opens, submission acknowledged
[ ] Empty post state shown when user has no posts
[ ] Back navigation returns to previous screen
[ ] Avatar renders with correct deterministic color
[ ] Tier badge matches user's current tier
```

---

## Screen 32 — Notification Settings

### Screen Overview
```
Screen: Notification Settings
User:   User configuring which notifications to receive
Goal:   Toggle individual notification types on/off
Refs:   FR-52
```

### Layout
```
Header:     Back + "Cai dat thong bao"
Main:       Settings toggle list grouped by category
Background: bg-primary (#0D1117)
```

### Header
```
Height:     56px + safe-area-inset-top
Background: bg-primary
Left:       Back arrow (arrow-left 20px), text-secondary, 44x44px
Center:     "Cai dat thong bao" — text-title-lg (20px, weight 700), text-primary
```

### OS Disabled Banner (conditional)
```
Visible only when OS-level notifications are disabled
Position: top of content, sticky below header
Height:   auto (approx 64px)
Background: warning-subtle (rgba(245,158,11,0.15))
Padding:  16px
Radius:   none (full width)

Content:
  Icon: alert-triangle 20px, warning (#F59E0B)
  Text: "Thong bao bi tat o cap he thong. Mo Cai dat thiet bi de bat."
        text-body-sm (13px), warning
  "Mo cai dat" link — text-body-sm (13px, weight 600), accent-primary
  Tap link -> Linking.openSettings() (native device settings)

When OS disabled: all toggle switches grayed, non-interactive
```

### Settings Groups

**Group 1 — "Canh bao gia" (mt: 16px)**
```
Section header: "Canh bao gia" — text-title-sm (16px, weight 600), text-primary,
                mx: 16px, mb: 8px

Row: "Canh bao gia"
  Description: "Thong bao khi co phieu dat muc gia muc tieu"
  Toggle: on/off
```

**Group 2 — "Thi truong" (mt: 24px)**
```
Section header: "Thi truong" — text-title-sm, text-primary, mx: 16px, mb: 8px

Row: "Mo cua thi truong"
  Description: "Thong bao khi san mo cua giao dich"
  Toggle: on/off

Row: "Dong cua thi truong"
  Description: "Tom tat chi so cuoi ngay"
  Toggle: on/off
```

**Group 3 — "Danh sach theo doi" (mt: 24px)**
```
Section header: "Danh sach theo doi" — text-title-sm, text-primary

Row: "Bien dong co phieu"
  Description: "Thong bao khi CP theo doi tang/giam >= 5%"
  Toggle: on/off
```

**Group 4 — "AI va Hoc tap" (mt: 24px)**
```
Section header: "AI va Hoc tap" — text-title-sm, text-primary

Row: "Kiem tra suc khoe danh muc"
  Description: "Bao cao tuan vao thu Hai 8:00 sang"
  Toggle: on/off

Row: "Goi y hanh vi"
  Description: "Nhac nho khi phat hien FOMO, ban hoang loan"
  Toggle: on/off
```

### Row Style (applies to all settings rows)
```
Height:      72px
Padding:     horizontal 16px
Background:  bg-primary (transparent)
Divider:     border-subtle (#1F2937) 1px between rows

Left:
  Label:       text-body-md (14px, weight 500), text-primary
  Description: text-caption (12px), text-secondary, mt: 2px
  Max label width: 280px (to not overlap toggle)

Right:
  Toggle switch:
    Size: 51x31px (iOS native dimensions)
    Track on: accent-primary (#3B82F6)
    Track off: bg-card (#1F2937), border: border
    Thumb: #FFFFFF, 27x27px circle
    Animation: spring 200ms
    Touch area: 44x44px minimum (padding around switch)

  OS disabled: toggle opacity 0.4, non-interactive
```

### Interaction Rules
```
Toggle tap           -> Immediate visual change (optimistic)
                        API: PATCH /users/me/notification-settings { type, enabled }
                        On fail: revert toggle, toast "Khong the luu. Thu lai."
"Mo cai dat" tap     -> Open device settings app
Section header       -> Non-interactive (label only)
Back                 -> Navigate to Profile
```

### States
```
Default:     All toggles loaded from user preferences
Loading:     Toggle rows with skeleton switches (brief, 300ms max)
OS disabled: All toggles grayed with warning banner
Toggle error: Reverted toggle + toast "Khong the luu cai dat"
```

### Edge Cases
```
OS notifications disabled:   Banner shown, all toggles non-interactive
Individual toggle fail:      Revert to previous state, error toast
Multiple rapid toggles:      Debounced 500ms per toggle, queue API calls
New notification type added: Server returns full list; unknown types hidden
All toggles off:             Allowed; no minimum required
```

### Dev Handoff Specs
```
Settings data:
  GET /users/me/notification-settings
  Returns: { priceAlerts: bool, marketOpen: bool, marketClose: bool,
             watchlistMovements: bool, portfolioHealth: bool, 
             behavioralCoaching: bool }

Toggle update:
  PATCH /users/me/notification-settings
  Body: { type: "price_alerts"|"market_open"|..., enabled: bool }
  Optimistic: immediate UI, revert on fail

OS permission check:
  React Native: Notifications.getPermissionsAsync()
  If !granted: show banner, gray all toggles

Open device settings:
  Linking.openSettings() (iOS and Android)

Toggle component:
  React Native Switch or custom Animated toggle
  trackColor: { false: '#1F2937', true: '#3B82F6' }
  thumbColor: '#FFFFFF'
  ios_backgroundColor: '#1F2937'
```

### QA Tests
```
[ ] All 6 notification toggles rendered
[ ] Each toggle reflects saved preference on load
[ ] Toggle tap: immediate visual change
[ ] Toggle revert on API failure with error toast
[ ] OS disabled: warning banner shown with link to settings
[ ] OS disabled: all toggles grayed and non-interactive
[ ] "Mo cai dat" opens device settings
[ ] Back navigation returns to Profile
[ ] Section headers displayed correctly
[ ] Description text shown below each toggle label
[ ] Touch area for toggles >= 44px
```

---

## Screen 33 — Language Settings

### Screen Overview
```
Screen: Language Settings
User:   User changing app language
Goal:   Select Vietnamese, Korean, or English with immediate app-wide switch
Refs:   FR-LANG-01
```

### Layout
```
Header:     Back + "Ngon ngu / Language"
Main:       3 language options as selection cards
Background: bg-primary (#0D1117)
```

### Header
```
Height:     56px + safe-area-inset-top
Background: bg-primary
Left:       Back arrow (arrow-left 20px), text-secondary, 44x44px
Center:     "Ngon ngu" — text-title-lg (20px, weight 700), text-primary
```

### Language Options
```
mx: 16px, mt: 24px, gap: 12px

3 selection cards, stacked vertically:

Card style:
  Width:      343px
  Height:     72px
  Background: bg-card (#1F2937)
  Border:     border (#374151) 1px
  Radius:     radius-md (12px)
  Padding:    horizontal 16px
  Touch:      full card, 72px height (exceeds 44px minimum)

  Layout: flex-row, align-center
    Left:
      Flag emoji: 28px
      ml: 0
    Center (ml: 16px):
      Primary name: "Tieng Viet" — text-body-md (14px, weight 600), text-primary
      Secondary:    "Vietnamese" — text-body-sm (13px), text-secondary, mt: 2px
    Right:
      Check icon: 20px, accent-primary — visible only on active language
      Hidden on non-active options

  Active card:
    Border: accent-primary (#3B82F6) 2px
    Background: accent-primary-subtle (rgba(59,130,246,0.15))
    Check icon visible

  Inactive card:
    Border: border (#374151) 1px
    Background: bg-card (#1F2937)
    No check icon

Options:
  Card 1: Flag "VN" + "Tieng Viet" / "Vietnamese"
  Card 2: Flag "KR" + "Tieng Han" / "Korean"
  Card 3: Flag "Globe" + "Tieng Anh" / "English"

  Animation on selection:
    Border + background transition: 200ms ease-standard
    Check icon: scale 0 to 1, 150ms ease-spring
```

### Info Note
```
mt: 24px, mx: 16px

Card:
  Background: accent-primary-subtle
  Border:     accent-primary 1px
  Radius:     radius-md (12px)
  Padding:    12px 16px

  Icon: info 16px, accent-primary
  Text: "Thay doi ngon ngu se ap dung ngay cho toan bo ung dung, 
         bao gom noi dung AI va thuat ngu tai chinh."
  text-body-sm (13px), text-primary, ml: 8px from icon
```

### Interaction Rules
```
Card tap             -> Immediate language switch (no confirm dialog needed)
                        Save to user profile (API + local)
                        All visible UI text re-renders in new language
                        Toast: "Ngon ngu da duoc thay doi" (in NEW language)
Back                 -> Navigate to Profile/Settings
```

### States
```
Default:     3 cards shown, active language highlighted
Switching:   Brief loading indicator on tapped card (100ms max)
Switched:    New language active, UI re-rendered, toast shown
Error:       Toast "Khong the thay doi ngon ngu. Thu lai." 
             Active language remains unchanged
```

### Edge Cases
```
Same language tap:     No action, no toast
Network error:         Save locally, sync to server when connected
Language not loaded:   Fallback to English until language pack downloads
AI mid-conversation:   Next AI response in new language (FR-AI-03)
RTL languages:         Not applicable (VN, KR, EN are all LTR)
Very first launch:     Language auto-detected from OS; this screen for manual override
```

### Dev Handoff Specs
```
Language data:
  GET /users/me/settings -> { language: "vi"|"ko"|"en" }

Language change:
  1. PATCH /users/me/settings { language: "ko" }
  2. AsyncStorage.setItem("language", "ko")
  3. i18n.changeLanguage("ko") — triggers React re-render
  4. Toast in NEW language

i18n library:
  react-i18next or i18next with locale files
  Locale files: /locales/vi.json, /locales/ko.json, /locales/en.json

No restart required:
  i18n context change triggers re-render of all mounted components
  Navigation state preserved (user stays on Language Settings)

Flag emojis:
  VN: "\u{1F1FB}\u{1F1F3}" (Flag VN)
  KR: "\u{1F1F0}\u{1F1F7}" (Flag KR)
  Globe: "\u{1F30F}" (Globe)
```

### QA Tests
```
[ ] 3 language options displayed with flags
[ ] Active language highlighted with accent-primary border and check icon
[ ] Tapping new language: immediate switch without restart
[ ] All UI text changes to selected language
[ ] Toast shown in newly selected language
[ ] AI responses switch to new language on next query
[ ] Financial terminology updates per FR-LANG-02
[ ] Same language tap: no action, no toast
[ ] Network error: language saved locally, synced later
[ ] Back navigation returns to Settings
[ ] Language persists across app restarts
[ ] Language persists across login/logout
```

---

## Screen 34 — Milestone Celebration Overlay

### Screen Overview
```
Screen: Milestone Celebration Overlay
User:   User who achieved a portfolio or learning milestone
Goal:   Celebrate achievement with animation, display shareable card
Refs:   FR-GAME-06
```

### Layout
```
Type:       Full-screen overlay on top of current screen
Background: bg-overlay (rgba(0,0,0,0.60)) with blur(8px) backdrop
Content:    Centered achievement card + confetti animation
Z-index:    Above all other content (including bottom nav, sheets)
```

### Confetti Animation
```
Type:       Particle system (confetti pieces falling from top)
Duration:   1200ms
Particle count: 100-150 particles
Colors:     [accent-primary, accent-secondary, positive, warning, "#A78BFA", "#F472B6"]
Shapes:     Rectangles (4x8px) and circles (6px), random rotation
Origin:     Top of screen, spread across full width
Physics:    Gravity fall + slight horizontal drift + rotation
            Duration: 1200ms from first particle to last particle settled
Stagger:    Particles spawn over first 400ms
End:        Particles fade out (opacity 1 to 0) in last 300ms

Reduced motion variant (prefers-reduced-motion):
  No confetti particles
  Achievement card: opacity 0 to 1, scale 0.95 to 1, 400ms ease-decelerate
  Haptic feedback only (medium impact)
```

### Achievement Card
```
Position:   centered horizontally + vertically
Width:      280px
Height:     auto (aspect ratio approximately 9:16 for share, but display is smaller)
Background: bg-card (#1F2937)
Border:     accent-primary (#3B82F6) 2px
Radius:     radius-xl (24px)
Padding:    32px
Shadow:     shadow-card-raised + 0 0 40px rgba(59,130,246,0.3) glow
Align:      center

Content:

  Achievement icon (top):
    Size: 64x64px
    Container: 80x80px circle, gradient bg (milestone-specific)
    Icon: milestone-specific (trophy, chart-up, flame, star, crown)
    Color: #FFFFFF
    Animation: scale 0 to 1.2 to 1, 500ms ease-spring, delay 200ms

  Title (mt: 20px):
    Milestone name — text-title-lg (20px, weight 700), text-primary, text-align: center
    e.g., "Giao dich dau tien!", "Nha dau tu Lv.3!", "Chuoi 7 ngay!"

  Subtitle (mt: 8px):
    Context line — text-body-sm (13px), text-secondary, text-align: center
    e.g., "Ban da hoan thanh giao dich dau tien tren Paave"

  Stat (mt: 16px, optional):
    Achievement-specific metric — text-display-md (24px, weight 700), accent-primary
    e.g., "+4,2% loi nhuan" (percentage, not absolute VND per BR-SOC-01)

  Tier badge (mt: 12px, if tier milestone):
    Tier badge component: 48x48px, tier gradient bg, tier icon
    New tier name below badge

  Date (mt: 16px):
    "16/04/2026" — text-caption (12px), text-secondary

  Paave branding (mt: 16px):
    "Paave" wordmark, text-caption (12px), text-tertiary

Share button (mt: 24px):
  Width:      200px
  Height:     44px
  Radius:     radius-full
  Background: accent-primary (#3B82F6)
  Text:       "Chia se" — text-body-md (14px, weight 600), #FFFFFF
  Icon:       share 16px, #FFFFFF, left of text, gap: 8px
  Tap:        Pre-render 9:16 card image -> native OS share sheet
              Share targets: Zalo, KakaoTalk, Instagram Stories, others
```

### Dismiss Behavior
```
Tap anywhere outside card:  Dismiss overlay (300ms fade-out)
Swipe down on card:         Dismiss overlay
Share button tap:           Open share sheet first, then dismiss on return
Auto-dismiss:               None (user must interact)

Dismiss animation:
  Card: scale 1 to 0.95, opacity 1 to 0, 250ms ease-accelerate
  Overlay: opacity 1 to 0, 300ms ease-accelerate
  Haptic: none on dismiss
```

### Interaction Rules
```
Card appears          -> Confetti starts, haptic (medium impact)
Share tap             -> Pre-render 9:16 image, open share sheet
Tap outside           -> Dismiss
Swipe down            -> Dismiss
Multiple milestones   -> Queue max 2; show most significant first
                         Second shown after first dismissed (300ms delay)
                         Additional milestones logged silently
```

### States
```
Default:     Overlay visible, confetti playing, card centered
Sharing:     Share sheet open, overlay stays behind
Dismissed:   Overlay fades out, underlying screen visible
Queued:      Second milestone waiting, shown after first dismisses
Reduced motion: No confetti, card fades in with scale, haptic only
Offline:     Celebration queued, shown on next app open
```

### Edge Cases
```
Multiple milestones at once:   Max 2 queued; most significant first
                               Priority: Tier up > Portfolio value > First trade > Streak
                               Additional milestones logged silently
Milestone already celebrated:  Each fires once per user lifetime (per FR-GAME-06)
                               Exception: portfolio goal (fires per goal set)
Offline when triggered:        Stored in local queue, shown on next foreground
Share fails:                   Toast "Khong the chia se. Anh chup man hinh da duoc luu."
                               Screenshot saved to device gallery
User on modal/sheet:           Celebration waits until modal/sheet dismissed
Reduced motion setting:        prefers-reduced-motion media query
                               Confetti replaced by opacity fade + haptic
Very fast dismiss:             Confetti cleanup on unmount, no memory leak
```

### Dev Handoff Specs
```
Confetti:
  Library: react-native-confetti-cannon or custom Animated particles
  Config: { count: 120, origin: { x: screenWidth/2, y: -20 },
            explosionSpeed: 400, fallSpeed: 2500,
            colors: ["#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#A78BFA", "#F472B6"] }
  Duration: 1200ms, then fadeOut: true

Achievement card render (for share):
  react-native-view-shot: capture card as 1080x1920px PNG (9:16)
  Include: achievement icon, title, stat, date, Paave branding
  Exclude: share button and dismiss UI

Share:
  Share.share({ url: imageUri, title: "Paave Achievement" })
  Platform: supports Zalo, KakaoTalk, Instagram Stories via share sheet
  Fallback: save to CameraRoll if share fails

Milestone queue:
  Array stored in Zustand/Redux: milestoneQueue[]
  On trigger: push to queue
  On display: shift from queue
  Max display: 2 per session
  Persistence: AsyncStorage for offline-triggered milestones

Haptic:
  On card appear: Haptics.impactAsync(ImpactFeedbackStyle.Medium)
  On confetti: included in card appear haptic

Reduced motion:
  Check: AccessibilityInfo.isReduceMotionEnabled() (RN) or 
         prefers-reduced-motion media query (web)
  If true: skip confetti, card opacity fade only, haptic still fires

One-time check:
  GET /gamification/milestones -> { milestoneName: { achieved: bool, achievedAt } }
  Before displaying: verify milestone not already celebrated
  After display: POST /gamification/milestones/{name}/celebrate
```

### QA Tests
```
[ ] Confetti animation plays for 1200ms
[ ] Confetti has correct colors and particle count
[ ] Achievement card centered on screen
[ ] Card icon, title, subtitle, date rendered correctly
[ ] Share button opens native share sheet
[ ] Share produces 9:16 image with correct content
[ ] Share image excludes share button UI
[ ] Tap outside card dismisses overlay
[ ] Swipe down dismisses overlay
[ ] Dismiss animation smooth (300ms)
[ ] Multiple milestones: most significant shown first, max 2
[ ] Milestone not shown twice for same achievement
[ ] Reduced motion: no confetti, opacity fade + haptic only
[ ] Haptic feedback fires on card appearance
[ ] Offline milestone: shown on next app open
[ ] Share failure: toast + screenshot saved
[ ] Card does not interfere with background screen state
[ ] Overlay z-index above all other content
```

---

## Screen 35 — Social Login Selection

### Screen Overview
```
Screen: Social Login Selection
User:   New or returning user choosing OAuth login
Goal:   Provide Google / Apple social login as alternative auth on Welcome screen
Refs:   FR-07C
```

### Layout
```
Background: bg-primary (#0D1117)
Position:   Below existing "Tao tai khoan" and "Dang nhap" CTAs on Welcome screen
Divider:    Horizontal line with "hoac" (or) label centered
Buttons:    Two vertically stacked social login buttons
```

### Components

**Divider with "hoac"**
```
mt: 24px from last primary CTA

Container: full width (343px at 375px screen), flex-row, align-center
Line left:  flex: 1, height: 1px, bg: border (#374151)
Label:      "hoac" — text-body-sm (13px, weight 400), text-secondary (#9CA3AF)
            mx: 12px
Line right: flex: 1, height: 1px, bg: border (#374151)
```

**Google Login Button**
```
mt: 24px from divider

Width:      343px (100% parent minus space-4 margins)
Height:     52px
Background: bg-card (#1F2937)
Border:     border (#374151) 1px
Radius:     radius-lg (16px)

Content row (flex-row, align-center, justify-center, gap: 12px):
  Icon:     Google "G" multicolor logo, 20x20px, left
  Text:     "Tiep tuc voi Google" — text-body-md (14px, Semi Bold / weight 600), text-primary (#F9FAFB)
```

**Apple Login Button**
```
mt: 12px from Google button

Width:      343px
Height:     52px
Background: bg-card (#1F2937)
Border:     border (#374151) 1px
Radius:     radius-lg (16px)

Content row (flex-row, align-center, justify-center, gap: 12px):
  Icon:     Apple logo (white), 20x20px, left
  Text:     "Tiep tuc voi Apple" — text-body-md (14px, Semi Bold / weight 600), text-primary (#F9FAFB)
```

### Interaction Rules
```
Google tap       -> Show loading state -> Open Google OAuth popup (native)
                    -> On success: API check user existence
                    -> registration_required = true -> DOB entry (same as registration flow)
                    -> registration_required = false -> Home Dashboard
Apple tap        -> Show loading state -> Open Apple Sign In (native)
                    -> Same routing logic as Google
OAuth cancelled  -> Return to Welcome screen, buttons reset to default
OAuth error      -> Toast: "Khong the ket noi voi [provider]. Vui long thu lai."
Email conflict   -> Account Link Prompt bottom sheet (see below)
```

### Link Prompt (Bottom Sheet)
```
Trigger:    API returns existing_account = true for OAuth email
Type:       Bottom sheet (half-sheet, see components 8.1)

Title:      "Tai khoan voi email nay da ton tai"
            text-title-md (18px, weight 600), text-primary
Body:       "Email [masked] da duoc dang ky. Ban muon lien ket voi [Provider]?"
            text-body-md (14px), text-secondary
Masked email: text-body-md (14px, weight 600), text-primary
              Pattern: lo***@gmail.com (per FR-48)

Primary CTA:   "Lien ket" — Primary Button component, full width
Secondary CTA: "Huy" — Text button, centered, text-secondary
               mt: 12px from primary CTA

Actions:
  "Lien ket" -> API link social identity -> success -> Home Dashboard
  "Huy"      -> Dismiss sheet -> navigate to Login screen
```

### States
```
Default:     Both social buttons visible with provider icons, text, border
Pressed:     bg-card-hover (#263244), border unchanged, 80ms ease-sharp feedback
Loading:     20px white spinner replaces icon, text changes to "Dang xu ly..."
             Button not tappable during loading
Disabled:    opacity 0.4, not tappable (when other button is loading)
Error:       Red flash border (border-error #EF4444, 300ms), then revert to default
             Toast error message shown simultaneously
Success:     Button shows check icon (20px, positive #10B981), 300ms
             Then navigate to next screen (DOB entry or Home)
Link prompt: Bottom sheet with account link options (see Link Prompt section above)
```

### Edge Cases
```
Provider unavailable:    Toast: "Dich vu [Provider] tam thoi khong kha dung."
                         Buttons remain enabled, user can retry or use email/password
OAuth cancelled mid-flow: Native OAuth popup dismissed by user
                         Return to Welcome screen, no error toast
                         Buttons reset to default state
Email already exists:    Account Link Prompt bottom sheet shown
                         User decides to link or cancel
                         If link: social identity attached to existing account
                         If cancel: navigate to Login screen
No Google Play Services: (Android) Toast: "Can cai dat Google Play Services."
                         Google button disabled, Apple button remains active
Apple not available:     (Android) Apple button hidden entirely
                         Only Google button shown, layout adjusts
Both providers fail:     Toast: "Khong the dang nhap bang mang xa hoi. Dung email/mat khau."
                         Buttons show error state, user falls back to email/password
Network error:           Toast: "Khong co ket noi mang. Vui long thu lai."
                         Loading state reverts to default
Rapid tap:               Debounce 500ms; second tap ignored during loading
```

### Dev Handoff Specs
```
Google OAuth:
  Library:  @react-native-google-signin/google-signin (RN) or expo-auth-session
  Config:   Web client ID from Google Cloud Console
  Scopes:   ['email', 'profile']
  Flow:     signIn() -> idToken -> POST /auth/social { provider: 'google', id_token }
  Response: { access_token, refresh_token, registration_required: bool, user? }

Apple Sign In:
  Library:  @invertase/react-native-apple-authentication (iOS) or expo-apple-authentication
  Config:   Apple Developer portal service ID
  Flow:     appleAuth.performRequest() -> identityToken -> POST /auth/social { provider: 'apple', id_token }
  Response: same schema as Google

Account Link:
  POST /auth/social/link { provider, id_token, partial_token }
  On 200: session created, navigate to Home
  On 409: "Lien ket khong thanh cong" (link failed)

Button animations:
  Press:    scale 1 to 0.97, 80ms ease-sharp
  Release:  scale 0.97 to 1, 150ms ease-spring
  Loading:  fade icon out (150ms), fade spinner in (150ms)
  Error:    border flash border-error 300ms, ease-standard
  Success:  fade spinner out (150ms), fade check in (150ms, ease-spring)

Layout:
  Social buttons section: mt: 24px from last primary CTA
  Divider: full width within 16px horizontal margins
  Buttons: 12px vertical gap between Google and Apple
```

### QA Tests
```
[ ] "hoac" divider renders between primary CTAs and social buttons
[ ] Google button shows correct icon and Vietnamese text
[ ] Apple button shows correct icon and Vietnamese text
[ ] Both buttons are 343px wide, 52px tall, radius-lg
[ ] Press state: bg-card-hover on tap
[ ] Loading state: spinner replaces icon, text changes to "Dang xu ly..."
[ ] Disabled state: opacity 0.4 on inactive button during loading
[ ] Google OAuth popup opens on tap
[ ] Apple Sign In popup opens on tap
[ ] OAuth cancel returns to Welcome with no error
[ ] Provider error shows toast and resets button
[ ] Email conflict triggers Account Link bottom sheet
[ ] Link prompt shows masked email
[ ] "Lien ket" CTA links account and navigates to Home
[ ] "Huy" CTA dismisses sheet and navigates to Login
[ ] Apple button hidden on Android (no Apple Sign In support)
[ ] Network error shows appropriate toast
[ ] Rapid tap debounced (500ms)
[ ] Touch targets meet 44px minimum
[ ] Text contrast meets WCAG AA on bg-card
```

---

## Screen 36 — 2FA OTP Verification

### Screen Overview
```
Screen: 2FA OTP Verification
User:   Returning user with 2FA enabled, after successful password login
Goal:   Enter 6-digit OTP for two-factor authentication to complete login
Refs:   FR-07D
```

### Layout
```
Background: bg-primary (#0D1117)
Header:     Shield icon in accent circle + title + subtitle
Main:       6-digit OTP input (reuses component from Screen 21)
Timer:      5-minute countdown + resend with 60s cooldown
Bottom:     "Huy dang nhap" cancel button
```

### Main Content

**Section 1 — Shield Icon + Instructions**
```
Center aligned, mt: 80px + safe-area

Icon:       Shield-check icon (Lucide: shield-check), 64x64px, accent-primary, opacity: 0.8
            Contained in 96x96px circle, bg: accent-primary-subtle, radius-full

Title:      "Xac thuc hai buoc" — text-title-lg (20px, weight 700), text-primary, mt: 24px
Subtitle:   "Nhap ma OTP da gui den email cua ban"
            text-body-md (14px), text-secondary, mt: 8px
Email:      "lo***@gmail.com" — text-body-md (14px, weight 600), text-primary, mt: 4px
            (email masked per FR-48 pattern)
```

**Section 2 — OTP Input (6-digit)**
```
mx: 40px, mt: 32px, centered

Reuses exact OTP component from Screen 21 (Email Verification):
  Container:  6 individual digit boxes, flex-row, gap: 8px, centered

  Each digit box:
    Width:      44px
    Height:     56px
    Background: bg-card (#1F2937)
    Border:     border (#374151) 2px, radius-md (12px)
    Focus:      border-focus (#3B82F6) 2px, bg-card
    Filled:     border accent-primary 2px
    Error:      border-error (#EF4444) 2px, bg rgba(239,68,68,0.05)
    Text:       text-display-md (24px, weight 700), text-primary, text-align: center
    Cursor:     Blinking accent-primary line, 2px wide, centered, animation blink 1s

  Behavior:
    Auto-focus first box on screen mount
    Auto-advance to next box on digit entry
    Backspace moves to previous box and clears
    Paste support: 6-digit paste fills all boxes simultaneously
    Auto-submit on 6th digit entry (no manual submit button)
    Keyboard: numeric, auto-shown on mount
```

**Section 3 — Timer + Resend**
```
mt: 32px, centered

Timer row:
  "Ma het han sau " — text-body-sm (13px), text-secondary
  "4:42" — text-body-sm (13px, weight 600), accent-primary
  Timer counts down from 5:00 (300 seconds — shorter than registration per FR-07D)

Resend row (mt: 16px):
  Default (cooldown active, 60s after last send):
    "Gui lai ma" — text-body-sm (13px), text-tertiary, non-interactive
    "trong 45s" — text-caption (12px), text-tertiary

  Cooldown expired:
    "Gui lai ma" — text-body-sm (13px, weight 600), accent-primary, touchable
    Touch area: 44px min height
```

**Section 4 — Cancel Button**
```
mt: 32px, centered

"Huy dang nhap" — text-body-md (14px, weight 600), text-secondary (#9CA3AF)
Touch area: 44px min height, 200px min width
Tap: navigate back to Welcome screen, clear partial_token
```

### Interaction Rules
```
Digit entry         -> Auto-advance to next field
6th digit entered   -> Auto-submit (API verify 2FA call with partial_token + OTP)
Backspace           -> Clear current field, move to previous
Paste 6 digits      -> Fill all fields, auto-submit
Resend tap          -> Request new 2FA OTP, reset timer to 5:00, 60s cooldown restarts
                       Toast: "Ma moi da duoc gui"
Timer hits 0:00     -> "Phien het han. Dang nhap lai." message
                       OTP input disabled, navigate to Login screen after 3s
Cancel tap          -> Navigate to Welcome screen, clear session
                       No confirmation dialog (low-risk action)
```

### States
```
Default:      First box focused, cursor blinking, timer counting from 5:00, resend greyed
Typing:       Digits fill boxes with auto-advance, timer continues
Verifying:    After 6th digit: all boxes show accent-primary border,
              loading spinner replaces OTP boxes (subtle, 300ms transition)
Success:      Shield-check icon animation (scale 0 to 1, 300ms ease-spring),
              "Xac thuc thanh cong!" text, auto-navigate to Home after 1200ms
Error:        All boxes flash border-error (300ms), shake animation (200ms),
              "Ma khong dung. Con {remaining} lan thu." below OTP
Locked:       After 5 failed attempts: OTP input disabled,
              "Qua nhieu lan thu. Vui long thu lai sau 15 phut."
              text-body-sm, negative, 15-minute countdown shown
              partial_token invalidated server-side
Expired:      Timer at 0:00 or partial_token expired (5 min),
              "Phien het han. Dang nhap lai."
              Auto-navigate to Login screen after 3s delay
```

### Edge Cases
```
Partial token expires:      Server returns 401 on submit
                            Message: "Phien het han. Dang nhap lai."
                            Navigate to Login screen after 3s
5th failed attempt:         15-minute lockout, all inputs disabled
                            partial_token invalidated
                            User must restart login flow after lockout
Timer expires:              Input disabled, navigate to Login screen
                            Different from registration: no resend option after expiry
New OTP invalidates old:    Server-side; old OTP rejected
Network error on submit:    Toast: "Khong the xac nhan. Kiem tra ket noi."
                            Re-enable input, do not increment attempt count
Network error on resend:    Toast: "Khong the gui ma. Thu lai sau."
                            Resend button re-enabled
App killed during 2FA:      partial_token expires after 5min
                            User must restart login on next app open
Biometric bypass:           If user has biometric enabled, 2FA is bypassed entirely
                            (biometric login goes directly to Home per FR-07B)
Cancel during verify:       If verifying API call is in-flight, cancel request
                            Navigate to Welcome screen
Paste non-numeric:          Ignore; only accept digits 0-9
```

### Dev Handoff Specs
```
OTP input:
  Reuse OTPInput component from Screen 21 (Email Verification)
  Same component API: { length: 6, onComplete: (code) => void, autoFocus: true }
  Only difference: timer duration (300s vs 600s) and API endpoint

2FA verify:
  POST /auth/2fa/verify { partial_token, otp: "123456" }
  Headers: { Authorization: "Bearer {partial_token}" }
  On 200: { access_token, refresh_token, user } -> save session, navigate to Home
  On 401 (wrong OTP): increment fail count, show error, clear boxes, focus first
  On 401 (token expired): "Phien het han. Dang nhap lai." -> Login screen
  On 429 (rate limit): show lockout message + 15min timer

2FA resend:
  POST /auth/2fa/resend { partial_token }
  Cooldown: 60s local timer
  On 200: toast "Ma moi da duoc gui", reset 5min timer
  On 429: "Vui long cho {seconds}s truoc khi gui lai"

Timer:
  useEffect countdown from 300s, clearInterval on unmount
  Display: Math.floor(remaining/60) + ":" + String(remaining%60).padStart(2, "0")
  On expiry: disable input, show expiry message, navigate after 3s delay

Cancel:
  Clear partial_token from memory
  navigation.reset({ routes: [{ name: 'Welcome' }] })

Animations:
  Success shield:  scale 0 to 1, 300ms cubic-bezier(0.34, 1.56, 0.64, 1)
  Error shake:     translateX [0, -8, 8, -6, 6, -3, 3, 0], 200ms
  Box fill:        border-color transition 150ms ease-standard
  Cursor blink:    opacity 0 to 1, 500ms, infinite alternate
```

### QA Tests
```
[ ] Shield icon renders in accent circle at top
[ ] Title shows "Xac thuc hai buoc"
[ ] Subtitle shows "Nhap ma OTP da gui den email cua ban"
[ ] Masked email displayed correctly
[ ] 6 digit boxes rendered, first auto-focused
[ ] Auto-advance works on digit entry
[ ] Backspace moves to previous box and clears digit
[ ] Paste 6-digit code fills all boxes and auto-submits
[ ] Correct OTP: success animation with shield-check, navigate to Home
[ ] Incorrect OTP: shake animation, error message with remaining attempts
[ ] 5 failed attempts: 15-minute lockout with countdown
[ ] Timer counts down from 5:00 (not 10:00)
[ ] Timer expires: "Phien het han" message, navigate to Login after 3s
[ ] Resend button disabled during 60s cooldown
[ ] Resend cooldown counter shows remaining seconds
[ ] Resend tap: new OTP sent, timer resets to 5:00, toast shown
[ ] "Huy dang nhap" button visible at bottom
[ ] Cancel navigates to Welcome screen
[ ] Partial token cleared on cancel
[ ] Keyboard shown on mount (numeric)
[ ] Non-numeric paste ignored
[ ] Network error shows toast without incrementing attempt count
[ ] Biometric login bypasses this screen entirely
```

---

## Component Library Summary (Quick Reference)

| Component | File | Variants |
|---|---|---|
| PrimaryButton | components/Button | default, disabled, loading, destructive |
| SecondaryButton | components/Button | default, disabled |
| TextButton | components/Button | default, destructive |
| SocialLoginButton | components/Button | google, apple |
| StockCard (trending) | components/StockCard | default, loading-skeleton |
| StockRow (watchlist) | components/StockRow | default, compact, loading-skeleton |
| IndexCard | components/IndexCard | large, small |
| PriceChangeBadge | components/Badge | positive, negative, neutral |
| ChipFilter | components/Chip | default, active |
| BottomSheet | components/Sheet | half, full, account-link-prompt |
| MarketTab | components/Tab | default, active |
| SettingsRow | components/SettingsRow | with-value, without-value, toggle |
| Toast | components/Toast | info, success, error |
| SkeletonCard | components/Skeleton | card, row, hero |
| EmptyState | components/EmptyState | with-cta, without-cta |
| AlertToggle | components/AlertToggle | active, inactive |
| Sparkline | components/Chart | 7-day-line |
| LineChart | components/Chart | interactive, readonly |
| DonutChart | components/Chart | portfolio-allocation |

---

*End of Screen Specifications — Paave V2 (Screens 1–36)*
