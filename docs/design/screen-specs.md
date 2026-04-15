# Paave Screen Specifications
## All V1 Screens — Layout, Components, States, Dev & QA Handoff

> Version: 1.0 | Date: 2026-04-14 | Status: V1 Production-Ready
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

### Edge Cases
```
Very long name ({name} > 12 chars): truncate with ellipsis in greeting
Price flash on update: brief bg-positive-subtle or bg-negative-subtle highlight on value, 300ms
Zero change: text-secondary color (not positive/negative), "0,00%"
Watchlist full (50 stocks): "Đã đạt giới hạn 50 CP" toast when trying to add
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

2 Buttons side by side, gap: 12px:

Left — "Theo dõi" (Watchlist):
  Width:      (343 - 12) / 2 = 165.5px
  Height:     52px
  Radius:     radius-lg (16px)
  Not watching:  Background: accent-primary-subtle, border: accent-primary 1px, text: accent-primary
                 Text: "Theo dõi", icon: bookmark 16px, gap: 8px
  Watching:     Background: accent-primary, text: #FFFFFF
                Text: "Đang theo dõi", icon: bookmark-filled 16px

Right — "Cài đặt cảnh báo" (Alert):
  Width:      same as left
  Height:     52px
  Radius:     radius-lg (16px)
  No alert:   Background: bg-card, border: border 1px, text: text-primary
              Text: "Cài đặt cảnh báo", icon: bell 16px
  Alert set:  Background: warning-subtle, border: warning 1px, text: warning
              Text: "Đang theo dõi giá", icon: bell-filled 16px
```

### Interaction Rules
```
Chart time tab tap    → Load new range data, chart re-animates
Chart long-press      → Crosshair appears with tooltip (track finger)
Chart long-press end  → Crosshair fades out (300ms)
"Theo dõi" tap        → Toggle watchlist (optimistic), icon animates (bookmark fill)
"Cài đặt cảnh báo"   → Open Price Alert bottom sheet
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
Watchlist full:      "Theo dõi" tap → toast "Đã đạt giới hạn 50 CP"
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

## Component Library Summary (Quick Reference)

| Component | File | Variants |
|---|---|---|
| PrimaryButton | components/Button | default, disabled, loading, destructive |
| SecondaryButton | components/Button | default, disabled |
| TextButton | components/Button | default, destructive |
| StockCard (trending) | components/StockCard | default, loading-skeleton |
| StockRow (watchlist) | components/StockRow | default, compact, loading-skeleton |
| IndexCard | components/IndexCard | large, small |
| PriceChangeBadge | components/Badge | positive, negative, neutral |
| ChipFilter | components/Chip | default, active |
| BottomSheet | components/Sheet | half, full |
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

*End of Screen Specifications — Paave V1*
