# Paave UX Flows & Navigation Structure
## User Journeys, Navigation Architecture, Flow Validation

> Version: 2.0 | Date: 2026-04-16 | Status: V2 Production-Ready | Linked FRD: v2.1

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
├── Welcome Screen (no nav) — "Create Account" / "Log In" / Social Login (Screen 35)
├── Login Flow (no nav)
│   ├── Email + Password
│   ├── Biometric Prompt (Face ID / Fingerprint)
│   └── 2FA OTP Verification (Screen 36, per FR-07D)
├── Registration Flow (no nav, step indicator visible per FR-08)
│   ├── Step 1: Data Consent (ToS + Privacy + Marketing opt-in)
│   ├── Step 2: Nationality Detection + Market Preference
│   ├── Step 3: DOB Entry + Age Gate
│   ├── Step 4: Name + Email + Password
│   ├── Step 5: Email Verification (6-digit OTP)
│   └── Step 6: Biometric Enrollment Prompt
├── Age Gate Screens (no nav)
│   ├── Under 13 Block
│   ├── 13–15 Parental Consent (deferred V3)
│   └── Age Upgrade Modal (LEARN_MODE → FULL_ACCESS)
└── Main App (bottom nav)
    ├── Tab 1: Home Dashboard
    │   ├── Portfolio Hero Widget (paper)
    │   ├── Market Snapshot Widget
    │   ├── Trending Stocks Section
    │   ├── Weekly Challenge Card
    │   └── → Stock Detail (push, from any stock tap)
    ├── Tab 2: Discover / Trending Feed
    │   ├── → Stock Detail (push)
    │   ├── → Theme Filter (bottom sheet)
    │   └── → Market Filter (toggle)
    ├── Tab 3: Markets
    │   ├── VN Tab (default for VN users)
    │   ├── KR Tab (default for KR users)
    │   ├── Global Tab (default for non-VN/KR)
    │   └── → Stock Detail (push)
    ├── Tab 4: Portfolio (Paper Trading Dashboard)
    │   ├── Holdings List
    │   ├── P&L Summary (virtual)
    │   ├── Trade History
    │   ├── Open Orders
    │   ├── Portfolio Goal Progress Bar
    │   ├── → Stock Detail (push)
    │   ├── → Paper Order Placement (push)
    │   └── → Portfolio Settings (push) — Reset / Goal
    ├── Tab 5: Profile / Settings
    │   ├── Account Info + Trader Tier Badge + XP
    │   ├── Watchlist Management
    │   │   └── → Stock Detail (push)
    │   ├── Price Alerts List
    │   │   └── → Price Alert Setup (sheet or push)
    │   ├── Gamification Section (Streak, Challenges)
    │   ├── Language Settings
    │   ├── Notification Settings
    │   ├── Biometric Settings
    │   └── Theme Settings
    ├── Stock Detail (pushed from any tab)
    │   ├── → Paper Order Placement (push)
    │   ├── → Price Alert Setup (bottom sheet)
    │   ├── → Community Feed tab (FR-SOC-02)
    │   └── → Post Creation (bottom sheet)
    ├── AI Chat (bottom sheet or dedicated screen)
    ├── Paper Order Flow
    │   ├── Order Placement Screen
    │   ├── Pre-Trade AI Card (collapsible)
    │   ├── Order Confirmation
    │   └── Post-Trade AI Card (bottom sheet)
    └── Milestone Celebration Overlay (modal, any screen)
```

### 1.3 Modal / Sheet Flows

```
Stock Detail → [Set Alert CTA]     → Price Alert Setup (bottom sheet, full-height)
Stock Detail → [Paper Trade CTA]   → Paper Order Placement (push)
Stock Detail → [Community tab]     → Per-Ticker Community Feed (inline tab)
Stock Detail → [Create Post CTA]   → Post Creation (bottom sheet, full-height)
Discover     → [Filter icon]       → Theme Filter (bottom sheet, half-height)
Markets      → [Stock row tap]     → Stock Detail (push)
Portfolio    → [Holdings tap]      → Stock Detail (push)
Portfolio    → [Settings icon]     → Portfolio Settings (push) — Reset / Goal
Portfolio    → [Open Orders tap]   → Order Detail (push)
Order Flow   → [Buy tap]          → Pre-Trade AI Card (collapsible inline)
Order Flow   → [Confirm tap]      → Post-Trade AI Card (bottom sheet, auto-dismiss)
Home         → [Challenge card]    → Challenge Detail (bottom sheet, half-height)
Profile      → [AI Chat CTA]      → AI Chat (bottom sheet or push)
Any screen   → [Share button]      → Native share sheet (Zalo / KakaoTalk / Instagram)
Any screen   → [Milestone trigger] → Celebration Overlay (modal, full-screen)
Login        → [Biometric fail x3] → Email/Password Fallback (replace)
Login        → [2FA required]      → 2FA OTP Verification (push, per FR-07D)
Welcome      → [Social login tap]  → OAuth popup (native) → DOB / Home / Link Prompt
Social OAuth → [Email conflict]    → Account Link Prompt (bottom sheet, half-height)
Age Upgrade  → [On login at 18]    → Age Upgrade Modal (full-screen modal)
```

---

## 2. Core User Journeys

### Journey 1: First-Time User — Full Registration to First Watchlist

> **V2 Update:** Journey 1 now covers the complete registration flow per FRD v2.1, including Data Consent (FR-LEGAL-03), DOB/Age Gate (FR-AGE-01), Email/Password (FR-05), OTP Verification (FR-06), and Biometric Enrollment (FR-07B). The V1 3-step onboarding is replaced.

```
Step 1  → App open → Splash (2s logo animation, per FR-01)
            → If returning user with valid session → skip to Home (instant)
            → If expired session → Welcome screen
            → If first launch → Welcome screen (fade + scale up)

Step 2  → Welcome screen (per FR-02)
            Two CTAs: "Tao tai khoan" (Create Account) | "Dang nhap" (Log In)
            → User taps "Tao tai khoan" → slide left to Step 3

Step 3  → Registration Step 1/4: Data Consent (per FR-LEGAL-03)
            Step indicator: [1] of 4 highlighted
            Three checkboxes (none pre-checked):
              [_] "Dieu khoan su dung" (Terms of Service) — required, link opens in-app webview
              [_] "Chinh sach bao mat" (Privacy Policy) — required, link opens in-app webview
              [_] "Nhan thong tin khuyen mai" (Marketing comms) — optional
            CTA: "Tiep theo" (disabled until checkboxes 1+2 checked)
            → If only checkbox 3 checked → error hint: "Vui long dong y Dieu khoan su dung de tiep tuc"
            → If ToS webview fails → error: "Khong the tai Dieu khoan. Vui long kiem tra ket noi."
            → User checks 1+2 → CTA enabled → slide left to Step 4

Step 4  → Registration Step 2/4: Nationality + Market Preference (per FR-03, FR-04)
            Step indicator: [2] of 4 highlighted
            Nationality: auto-detected from device locale
              vi/VN → Vietnam pre-selected | ko/KR → Korea pre-selected | other → Global
            Market Preference: Vietnam (HoSE/HNX) | Korea (KRX) | Global
              Exactly one selection required; pre-populated from nationality
            CTA: "Tiep theo" (enabled when 1 market selected)
            → If no locale detected → defaults to Global
            → Slide left to Step 5

Step 5  → Registration Step 2/4 (continued): DOB Entry + Age Gate (per FR-AGE-01)
            Date picker (no free-text), future dates disabled
            CTA: "Tiep theo" (enabled when valid DOB entered)
            Age calculation: (today - DOB)
            → If age < 13 → error screen: "Paave yeu cau nguoi dung tu 13 tuoi tro len."
               Registration blocked. CTA: "Quay lai" (back to Welcome). No account created.
            → If age 13–15 → parental consent flow (FR-AGE-02, deferred V3)
               Screen: "Can su dong y cua phu huynh" — collect parent email
               Account state: PENDING_PARENTAL_CONSENT (educational content only)
            → If age 16–17 → proceed; account tier will be LEARN_MODE (per FR-AGE-03)
            → If age 18+ → proceed; account tier will be FULL_ACCESS
            → Slide left to Step 6

Step 6  → Registration Step 3/4: Account Details (per FR-05)
            Step indicator: [3] of 4 highlighted
            Fields:
              Full name: 2–100 chars, Unicode
              Email: RFC 5322 validated, max 254 chars
              Password: 8–64 chars, >=1 uppercase, >=1 lowercase, >=1 digit, >=1 special
            Live validation on each field (inline error messages)
            CTA: "Tao tai khoan" (enabled when all fields valid)
            → If duplicate email → field error: "Da ton tai tai khoan voi email nay"
            → If duplicate email but unverified → resend OTP, navigate to Step 7
            → On submit → account created PENDING_VERIFICATION, verification email sent <=30s
            → Slide left to Step 7

Step 7  → Registration Step 4/4: Email Verification (per FR-06)
            Step indicator: [4] of 4 highlighted
            6-digit OTP input (auto-advance on 6th digit)
            OTP valid 10 minutes; resend after 60s cooldown
            Hint below input: "Kiem tra hop thu den hoac thu muc spam"
            CTA: "Xac nhan" (enabled when 6 digits entered)
            → If correct OTP within 10min → account ACTIVE; fade to Step 8
            → If wrong OTP → shake animation + error: "Ma xac nhan khong dung"
            → If 5th failed attempt → lockout: "Qua nhieu lan thu. Vui long doi 15 phut."
            → If OTP expired → "Ma da het han. Gui lai ma moi." with resend button
            → Resend tapped → new OTP sent, previous invalidated, 60s cooldown restarts

Step 8  → Biometric Enrollment Prompt (per FR-07B)
            Full-screen modal: "Bat dang nhap bang sinh trac hoc?"
            Two CTAs: "Bat" (Enable) | "De sau" (Not now)
            → "Bat" → OS biometric enrollment → success → fade to Step 9
            → "De sau" → dismissed; user can enable later in Settings
            → If device has no biometric hardware → skip this step entirely

Step 9  → Notification Permission Request (per FR-42)
            Custom in-app modal explaining notification value
            Two CTAs: "Cho phep" (Allow) | "Bo qua" (Skip)
            → "Cho phep" → triggers OS notification dialog
            → "Bo qua" → notifications_enabled = false; dismisses

Step 10 → Home Dashboard (first-time state, fade replace stack)
            Virtual portfolio created (500M VND, per FR-PT-01)
            Portfolio hero shows "Bat dau giao dich thu" (Start paper trading) CTA
            "Tien ao" label visible (per FR-PT-06)
            Watchlist empty; suggested stocks shown
            Weekly challenge card visible (if Monday–Sunday, per FR-GAME-04)
            Investment disclaimer shown on first view (per FR-LEGAL-01)

Step 11 → User taps a trending stock card → Stock Detail (push, slide left)
Step 12 → User taps "Theo doi" (Add to Watchlist) → optimistic UI fill
Step 13 → Success toast: "Da them vao danh sach theo doi"
Step 14 → Back → Home; watchlist count updates
```

**Flow validation:**
- Step count increased from V1 (3 steps) to V2 (4-step indicator + DOB + biometric). This is necessary per FRD compliance (FR-AGE-01, FR-LEGAL-03). Conversion risk mitigated by: consent screen is quick (2 taps), DOB is a single date picker, biometric prompt is optional.
- Confusion risk: Step 3 checkboxes — users may not realize both ToS and Privacy are required. Mitigated by graying out CTA with explicit hint text.
- Drop-off risk: Step 7 (OTP) is the highest-friction point. Mitigated by spam folder hint, resend cooldown visible, auto-advance on 6th digit.
- Edge case: App killed mid-registration → returns to last incomplete step (per FR-01). Consent + nationality data persisted locally; email/password not persisted (security).
- Age 16–17 users see no visible difference until they encounter a FULL_ACCESS feature → contextual explanation shown (per FR-AGE-03).

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

### Journey 6: Full Registration — New User with Age Gate, DOB, Consent, and Verification

> Complete registration journey with all V2 compliance gates. This journey details every screen transition from cold start to first Home view. For the simplified step-by-step, see Journey 1.

```
Step 1  → App open → Splash screen (2s logo animation, per FR-01)
            Brand mark centered, no interactive elements
            → Fade + scale up transition to Step 2

Step 2  → Welcome screen (per FR-02)
            Hero illustration + tagline in detected language
            CTAs: "Tao tai khoan" | "Dang nhap"
            No market data fetched yet
            → User taps "Tao tai khoan" → slide left to Step 3

Step 3  → Data Consent screen (per FR-LEGAL-03, step 1/4 indicator)
            Three unchecked checkboxes:
              [_] Dieu khoan su dung (ToS) — required, tappable link → in-app webview
              [_] Chinh sach bao mat (Privacy) — required, tappable link → in-app webview
              [_] Nhan thong bao khuyen mai (Marketing) — optional
            CTA "Tiep theo" disabled until boxes 1+2 checked
            → If webview fails → "Khong the tai. Kiem tra ket noi." (registration not blocked)
            → Consent timestamp + ToS version stored on user record (per BR-22)
            → Slide left to Step 4

Step 4  → Nationality Detection (per FR-03)
            Auto-detected from device locale:
              vi/VN → Vietnam | ko/KR → Korea | else → Global
            Shown as pre-selected chip with override option
            → If no locale (custom ROM) → defaults to Global
            → Inline transition (no separate screen) to Market Preference

Step 5  → Market Preference screen (per FR-04, step 2/4 indicator)
            Options: Vietnam (HoSE/HNX) | Korea (KRX) | Global
            Exactly one selection; pre-populated from nationality detection
            CTA "Tiep theo" enabled when 1 selected
            → Slide left to Step 6

Step 6  → DOB Entry (per FR-AGE-01, still step 2/4 indicator)
            Native date picker, no free-text, future dates disabled
            System calculates age: (today - DOB)
            → If age < 13 → push to Block screen:
               "Paave yeu cau nguoi dung tu 13 tuoi tro len."
               Single CTA: "Quay lai" → back to Welcome. No account created.
            → If age 13–15 → push to Parental Consent screen (FR-AGE-02, deferred V3):
               "Can su dong y cua phu huynh"
               Collect parent email (must differ from child's email)
               Account state: PENDING_PARENTAL_CONSENT
               Max 3 consent re-sends per 24h; token expires 24h
            → If age 16–17 → proceed; tier assigned LEARN_MODE (per FR-AGE-03)
            → If age 18+ → proceed; tier assigned FULL_ACCESS
            → Slide left to Step 7

Step 7  → Account Details screen (per FR-05, step 3/4 indicator)
            Fields: Full name (2–100 chars, Unicode) | Email (RFC 5322) | Password (8–64 chars, complexity rules)
            Nationality pre-filled (read-only)
            Live inline validation on blur
            CTA "Tao tai khoan" enabled when all valid
            → If duplicate email → "Da ton tai tai khoan voi email nay"
            → If duplicate but unverified → resend OTP, skip to Step 8
            → On submit → account PENDING_VERIFICATION; email sent <=30s
            → Slide left to Step 8

Step 8  → Email Verification screen (per FR-06, step 4/4 indicator)
            6-digit OTP input with auto-advance
            Timer shows "Ma hop le trong 10 phut"
            Resend button appears after 60s cooldown
            Hint: "Kiem tra hop thu den hoac thu muc spam"
            → Correct OTP → account ACTIVE; virtual portfolio created (500M VND, per FR-PT-01)
            → Wrong OTP → shake + "Ma xac nhan khong dung" → retry
            → 5th wrong attempt → "Qua nhieu lan thu. Vui long doi 15 phut." (15min lockout)
            → OTP expired → "Ma da het han" + resend CTA (new OTP invalidates previous)
            → Fade to Step 9

Step 9  → Biometric Enrollment (per FR-07B)
            "Bat dang nhap bang sinh trac hoc?" modal
            CTAs: "Bat" | "De sau"
            → "Bat" → OS Face ID / fingerprint enrollment
            → "De sau" → skip; can enable later in Profile > Settings
            → If no biometric hardware → step skipped entirely
            → Fade to Step 10

Step 10 → Success → Home Dashboard (fade, replace navigation stack)
            First-time state: portfolio hero with "Bat dau giao dich thu" CTA
            "Tien ao" label permanently visible (per FR-PT-06)
            Investment disclaimer modal shown (per FR-LEGAL-01) → "Da hieu" to dismiss
            Suggested stocks visible; watchlist empty
```

**Flow validation:**
- Total screens: 8–10 depending on age gate path. Step indicator shows 4 steps to manage perceived complexity (consent, market, account, verify).
- Highest drop-off risk: OTP screen (Step 8). Mitigations: spam hint, auto-advance, visible countdown, resend cooldown.
- Under-13 block is a dead end by design — no account created, no data stored beyond the session.
- 13–15 parental consent is deferred to V3 but the screen exists as a stub with clear messaging.
- DOB is collected as part of step 2/4 (alongside market preference) to reduce perceived step count.
- App killed mid-registration → per FR-01, returns to last incomplete step. Consent data + nationality persisted locally; password never persisted.

---

### Journey 7: Paper Trading — Browse to Buy to Post-Trade AI

> Primary paper trading journey: user navigates to a stock, places a market buy order, receives AI analysis, and sees the new holding in their portfolio.

```
Step 1  → User on Stock Detail screen (arrived from Discover, Markets, or Home trending)
            Stock data loaded: price hero, chart (1D default), key stats, community tab
            Action buttons visible: "Theo doi" | "Canh bao gia" | "Giao dich thu"
            Investment disclaimer shown on first view per session (per FR-LEGAL-01)

Step 2  → User taps "Giao dich thu" (Paper Trade) button
            → Push transition (slide left) to Order Placement screen
            "Tien ao" label visible in header (per FR-PT-06)

Step 3  → Order Placement screen (per FR-PT-02)
            Toggle: Mua (Buy) selected (default) | Ban (Sell)
            Order type: "Lenh thi truong" (Market order) selected (default) | "Lenh gioi han" (Limit)
            Input: Quantity (numeric keypad)
            Virtual balance displayed: "So du kha dung: ₫XXX,XXX,XXX"
            Estimated total: quantity x current price x 1.001 (transaction sim fee)
            → If estimated total > virtual balance → "Khong du tien ao" error, confirm disabled
            → If quantity = 0 or empty → CTA disabled
            CTA: "Xem lai lenh" (Review Order) enabled when valid

Step 4  → Pre-Trade AI Card appears (per FR-AI-04, collapsible, expanded by default)
            Content loads within 2s:
              - Risk score: 1–10 (color-coded)
              - Suggested position size: "X% danh muc"
              - "3 dieu can biet" (3 things to know) — key context bullets
            Disclaimer appended (per FR-LEGAL-02)
            Collapse/expand toggle; dismiss logs "skip" event
            → If AI timeout > 2s → "Phan tich bo qua — tiep tuc dat lenh." (graceful degradation)
            → User taps back → order cancelled, card dismissed, return to Stock Detail
            → User proceeds → slide to Step 5

Step 5  → Order Review Summary
            Displays: Ticker, Company, Order type (Market/Buy), Quantity, Estimated price,
            Estimated total, Virtual balance after trade
            "Tien ao" label visible
            CTA: "Xac nhan lenh" (Confirm Order)
            Secondary: "Huy" (Cancel) → back to Stock Detail

Step 6  → User taps "Xac nhan lenh"
            → Loading state: "Dang khop lenh..." spinner (per FR-PT-02, fill <=15s)
            → Order fills at next price snapshot
            → Success toast: "Lenh da khop! Mua X co phieu [TICKER]" (slide up, 3s auto-dismiss)
            → XP +10 awarded → XP toast: "+10 XP" (stacked below trade toast)

Step 7  → Post-Trade AI Card auto-appears (per FR-AI-01, bottom sheet or inline card)
            Three sections:
              1. "Chuyen gi da xay ra" (What happened) — plain language price action
              2. "Tai sao" (Why) — up to 3 causal factors
              3. "Can theo doi gi" (What to watch) — 1–2 forward signals
            Disclaimer appended (per FR-LEGAL-02)
            Language matches user's active language (per FR-AI-03)
            Card shown once per trade fill; not re-shown on revisit
            → If AI service unavailable → "Phan tich tam thoi khong kha dung. Thu lai sau."
            → Dismiss: tap anywhere outside card or swipe down

Step 8  → User rates AI card: thumbs up / thumbs down (per FR-AI-01)
            → Rating stored for model quality tracking
            → Card remains visible until explicitly dismissed

Step 9  → User navigates to Portfolio tab (bottom nav tap, fade transition)
            → Portfolio Dashboard (per FR-PT-04) shows:
              New holding in Holdings List with live price + unrealized P&L
              Available virtual cash decreased by trade amount
              Trade appears in Trade History
              "Tien ao" label in header

Step 10 → If first paper trade ever → Milestone Celebration fires (per FR-GAME-06)
            Confetti animation (1200ms) + haptic (medium impact)
            Achievement card: "Giao dich dau tien!" (First Trade!)
            Share CTA → native share sheet (Zalo / KakaoTalk / Instagram Stories)
            Dismiss: tap anywhere or swipe down
            → If reduced motion → scale-up + haptic only, no particles
```

**Flow validation:**
- Pre-trade AI card (Step 4) is the key differentiator. 2s timeout ensures flow is not blocked. Skip rate tracked per user for model quality.
- Virtual balance check (Step 3) prevents overdraft. Estimated total includes 1.001x multiplier per FR-PT-02.
- Post-trade AI card (Step 7) is non-blocking — user can dismiss immediately. Shown once per fill.
- XP award (Step 6) is deduped per fill event — not per order placement (per FR-GAME-01).
- Milestone celebration (Step 10) fires once per user lifetime for "first trade" event.
- Edge case: Price snapshot unavailable at fill time → order queued; fills when feed restores; user notified via toast (per FR-PT-02).
- Edge case: User taps back during pre-trade card → order cancelled; no fill; no XP.

---

### Journey 8: Paper Trading — Limit Order Lifecycle

> Full lifecycle of a limit order from placement through monitoring to fill, expiry, or cancellation.

```
Step 1  → User on Order Placement screen (from Stock Detail > "Giao dich thu")
            Toggle: Mua (Buy) | Ban (Sell) — user selects "Mua"
            Order type: user selects "Lenh gioi han" (Limit Order, per FR-PT-03)
            Input: Quantity + Limit Price (numeric keypad)
            "Tien ao" label visible in header

Step 2  → System validates:
            → Buy limit: limit price must be < current price (otherwise user should use market order)
            → Sell limit: limit price must be > current price
            → Virtual cash reserved for pending buy limits (not available for other orders)
            → If limit price = current price → hint: "Gia gioi han nen khac gia hien tai"
            CTA: "Dat lenh gioi han" (Place Limit Order) enabled when valid

Step 3  → Pre-Trade AI Card appears (per FR-AI-04, same as Journey 7 Step 4)
            → 2s timeout; graceful skip if unavailable
            → User proceeds to confirmation

Step 4  → Order Confirmation summary
            Displays: Limit price, Quantity, Estimated total, Expiry date (30 days from now)
            CTA: "Xac nhan" (Confirm) | "Huy" (Cancel)

Step 5  → User taps "Xac nhan" → Order created with status "Cho khop" (Pending)
            → Toast: "Lenh gioi han da dat. Het han sau 30 ngay."
            → Virtual cash reserved (deducted from available balance)

Step 6  → User can monitor via Portfolio tab → "Lenh dang cho" (Open Orders) section
            Each pending order shows: Ticker, Type (Buy/Sell), Limit price, Quantity, Days remaining
            → Tap order → Order Detail with "Huy lenh" (Cancel Order) option

--- Path A: Order Fills ---
Step 7a → Market price crosses limit threshold (buy: price <= limit; sell: price >= limit)
            → Order fills automatically at limit price (per FR-PT-03)
            → Push notification: "[TICKER] lenh gioi han da khop tai ₫XX,XXX"
            → Post-Trade AI Card appears on next app open (per FR-AI-01)
            → XP +10 awarded
            → Reserved cash released; holding created
            → Order moves from "Lenh dang cho" to Trade History

--- Path B: Order Expires ---
Step 7b → 30 calendar days pass without fill
            → Order auto-expires (per FR-PT-03)
            → Push notification: "Lenh gioi han [TICKER] da het han. Tien ao da hoan lai."
            → Reserved cash returned to available balance
            → Order moves to Trade History with status "Het han" (Expired)

--- Path C: User Cancels ---
Step 7c → User taps "Huy lenh" from Open Orders detail
            → Confirmation: "Huy lenh gioi han nay?"
            → CTAs: "Huy lenh" (Cancel Order, destructive) | "Giu lai" (Keep)
            → On confirm: reserved cash returned; order removed from Open Orders
            → Toast: "Da huy lenh"
```

**Flow validation:**
- Cash reservation (Step 5) prevents users from over-committing virtual balance across multiple limit orders.
- 30-day expiry is enforced server-side; push notification ensures user awareness.
- Cancellation path includes confirmation dialog to prevent accidental cancels.
- Edge case: Stock halted while limit order is open → order remains open; fills when trading resumes (per FR-PT-03).
- Edge case: Portfolio reset (FR-PT-05) while limit order is pending → all open orders cancelled; cash returned; user notified.

---

### Journey 9: Gamification — Challenge to Tier-Up to Celebration

> Weekly gamification loop: user discovers a challenge, works toward it, receives a score update, advances a tier, and celebrates.

```
Step 1  → Monday login → Home Dashboard loads
            → Weekly Challenge card visible below market snapshot (per FR-GAME-04)
            Card shows: challenge description, timer countdown to Sunday midnight
            Example: "Loi nhuan giao dich thu cao nhat tuan nay voi co phieu cong nghe VN"
            → User is auto-entered into challenge on Monday login
            → If user did not log in during challenge week → challenge shows "Da bo lo" (Missed)

Step 2  → User engages during the week:
            → Places paper trades → XP +10 per executed trade (per FR-GAME-01)
            → Completes micro-lessons → XP +25 per lesson (per FR-GAME-01)
            → Logs in daily → XP +5 per calendar day (per FR-GAME-01)
            → Learning streak maintained (per FR-GAME-05)
            → Challenge progress updates in real-time on Home card

Step 3  → Sunday midnight UTC → Trader Score computed (per FR-GAME-03)
            Weekly score (0–100) based on:
              Return (40%) | Consistency (30%) | Risk Discipline (20%) | Activity (10%)
            Weekly score added to cumulative Trader Score
            → If behavioral coaching flags exist (FR-AI-07) → Risk Discipline reduced by 5pts per flag (max 4)

Step 4  → Challenge results determined
            → If user won challenge → +100 XP (per FR-GAME-01)
            → Winner badge shown on profile for 1 week
            → Push notification: "Chuc mung! Ban da thang thu thach tuan nay. +100 XP"

Step 5  → Next login (Monday or later) → Trader Score badge on profile updates
            → If cumulative score crossed a tier threshold (per FR-GAME-02):
              e.g., score >= 1,500 → tier upgrades from "Nguoi hoc" (Learner) to "Nha dau tu" (Investor)
            → Tier badge updates on Profile and all community feed posts

Step 6  → Tier-Up Milestone Celebration fires (per FR-GAME-06)
            Confetti animation (1200ms) + haptic feedback (medium impact)
            Achievement card (9:16 format):
              "Chuc mung! Ban da len cap Nha dau tu"
              Shows: new tier badge, date achieved, % return (anonymized per BR-SOC-01)
            Share CTA → native share sheet (Zalo / KakaoTalk / Instagram Stories)
            → If reduced motion → subtle scale-up + haptic only
            → Dismiss: tap anywhere or swipe down

Step 7  → If multiple milestones triggered simultaneously (e.g., tier-up + portfolio value milestone)
            → Queue: show most significant first (tier-up > portfolio value)
            → Max 2 queued; others logged silently (per FR-GAME-06)
            → Second celebration shown after first dismissed

Step 8  → Profile screen reflects:
            New tier badge displayed
            Updated XP total
            Challenge history shows "Da thang" (Won) for completed challenge
            Streak counter visible in gamification section
```

**Flow validation:**
- Challenge engagement is passive — user does not need to "accept" the challenge; participation is automatic on Monday login.
- Trader Score is computed entirely server-side (Sunday midnight UTC); client cannot manipulate score.
- Tier can only increase, never decrease (per BR-25). Even if weekly score is 0, cumulative score is unchanged.
- Edge case: User changes timezone mid-week → streak and daily XP evaluated in registered timezone (per FR-GAME-05).
- Edge case: User did not log in at all during the week → challenge "Missed"; minimal Trader Score computed (Activity = 0).
- Celebration queue prevents overlay stacking — max 2 sequential, rest suppressed.

---

### Journey 10: Social — Create Post to Community Feed

> User discovers community discussion on a stock, writes a post with sentiment and cashtag, publishes after the 60-second safety window.

```
Step 1  → User on Stock Detail screen → scrolls to or taps "Cong dong" (Community) tab
            → Per-Ticker Community Feed loads (per FR-SOC-02)
            Feed shows posts in reverse chronological order
            Each post: author pseudonym, Trader Tier badge, sentiment tag (Bull/Bear/Neutral),
            text, timestamp
            → If empty → "Hay la nguoi dau tien binh luan ve [TICKER]"

Step 2  → User taps "Viet bai" (Create Post) CTA
            → Bottom sheet slides up (full-height, per FR-SOC-03)

Step 3  → Post Creation screen
            Text input: max 1,000 characters, live counter "0/1,000"
            $TICKER cashtag auto-populated from current stock (e.g., $VIC)
            Additional cashtags can be added (max 5 per post)
            Sentiment selector (required): "Tang" (Bull) | "Giam" (Bear) | "Trung lap" (Neutral)
            → If text reaches 1,001 chars → input rejects; counter shows "1,000/1,000" in red
            → If no sentiment selected → "Dang" CTA disabled
            → If no $TICKER in post body → server rejects: "Bai viet can co it nhat mot $TICKER"

Step 4  → User writes text + selects sentiment + confirms cashtag(s)
            CTA: "Dang" (Publish) enabled when: text > 0 chars + sentiment selected + >=1 cashtag

Step 5  → User taps "Dang" → 60-second pending countdown begins (per FR-SOC-03)
            Countdown timer visible: "Dang trong 60s... Huy?"
            "Huy" (Cancel) button available during countdown
            → If user taps "Huy" → post discarded; bottom sheet remains open for edits
            → If user leaves screen during countdown → countdown continues server-side

Step 6  → 60 seconds pass → post published
            Toast: "Bai viet da dang!"
            → Post appears at top of Per-Ticker Community Feed
            → Post also appears in Following feed of users who follow this author (per FR-SOC-04)
            → Posts > 280 chars truncated in feed view with "Xem them" (Read more) expander

Step 7  → Content moderation check (server-side, per FR-SOC-03)
            → If post contains "mua ngay" / "ban ngay" without analysis context →
              post flagged and held for moderation review
            → If flagged → removed from feed pending review; author notified
            → If approved → remains in feed

Step 8  → Other users can view the post in the community feed
            Author pseudonym + Trader Tier badge visible (per FR-SOC-05)
            Tapping author pseudonym → author's public profile (per FR-SOC-05)
```

**Flow validation:**
- 60-second cancel window (Step 5) is a safety mechanism against impulsive posts. It is enforced for all posts, no opt-out.
- Content moderation (Step 7) catches direct buy/sell directives. This is server-side; no client bypass.
- Cashtag requirement ensures posts are always linked to a stock ticker for feed routing.
- Sentiment selection is mandatory — this feeds the aggregated sentiment ratio on stock cards (per FR-SOC-01).
- Edge case: User creates post from Discover feed stock card → bottom sheet opens with auto-populated $TICKER from that card.
- Edge case: Network error during publish → post queued locally; published on reconnect; user notified.
- Posts truncated at 280 chars in feed view. Full text visible via "Xem them" expander (per BR-23).

---

### Journey 11: AI Chat — Ask Question to Follow-Up

> User opens the AI chat, asks a question about a stock, receives a sourced response with disclaimer, and asks a follow-up.

```
Step 1  → User opens AI Chat (per FR-AI-02)
            Access from: Profile tab CTA, or Stock Detail action menu, or Home quick-action
            → Bottom sheet slides up or dedicated screen pushes (depends on entry point)
            Input field: "Hoi bat ky dieu gi ve co phieu..." (Ask anything about stocks...)
            Conversation history: last 10 turns retained in session (cleared on sheet close)

Step 2  → User types question in Vietnamese:
            Example: "VIC co dang tot khong?" (Is VIC doing well?)
            → Send button enabled when text > 0
            → User taps send

Step 3  → AI processes request
            Loading indicator: typing dots animation
            → Response appears (language matches user's app language setting per FR-AI-03, FR-LANG-01)
            Response includes:
              - Analysis of VIC's recent performance
              - Source attribution: "Dua tren du lieu HoSE ngay [date]" (per FR-AI-02)
              - Disclaimer appended (per FR-LEGAL-02):
                "Noi dung do AI tao ra chi mang tinh giao duc. Khong phai loi khuyen dau tu."
            → No buy/sell recommendation language (filtered per BR-19)
            → If AI timeout > 10s → "Mat nhieu thoi gian hon binh thuong. Vui long thu lai."
              Query retained in input field for retry.

Step 4  → User asks follow-up question:
            Example: "Chi so P/E cua VIC la bao nhieu?" (What is VIC's P/E ratio?)
            → AI uses conversation context (previous turn about VIC)
            → Response with specific P/E data + educational context
            → Disclaimer appended again (every response, per FR-LEGAL-02)

Step 5  → Scope restriction check (per FR-AI-02)
            → If user asks about Apple (NASDAQ) → scope restriction message:
              "Hien tai toi chi co the tra loi ve co phieu Viet Nam (HoSE/HNX) va Han Quoc (KOSPI/KOSDAQ)."
            → Query not processed; user can ask a new question

Step 6  → Financial terminology in responses uses locale-specific terms (per FR-LANG-02, FR-AI-03)
            VN user → "Chi so P/E", "Von hoa thi truong", "Khop lenh"
            KR user → response in Korean with "주가수익비율", "시가총액"
            EN user → standard NYSE/NASDAQ terminology

Step 7  → User closes AI Chat
            → Bottom sheet slides down or screen pops (depending on entry)
            → Conversation history cleared
            → Next open starts fresh session
```

**Flow validation:**
- Response language always matches the user's *app language setting*, not the input language (per FR-AI-02, BR-AI-03). A Korean user typing in English still gets a Korean response.
- Scope restriction (Step 5) is firm — only VN (HOSE/HNX) and KR (KOSPI/KOSDAQ) at launch. Global stock queries are rejected with a clear message.
- 10-turn conversation history is session-scoped. This prevents runaway context and keeps responses relevant.
- Edge case: AI service fully down → "Tro ly AI tam thoi khong kha dung." Chat input disabled with retry CTA.
- Edge case: User switches language mid-chat → next AI response uses new language config (per FR-AI-03).
- Disclaimer is non-negotiable: appended to *every* response, cannot be collapsed or hidden (per FR-LEGAL-02).

---

### Journey 12: Biometric Login — Returning User

> Returning user with biometric auth enabled opens the app, authenticates via Face ID / fingerprint, and reaches Home instantly. Failure path falls back to email/password.

```
Step 1  → App open → session check during splash (per FR-01, FR-07B)
            → Valid session + biometric enabled → skip splash animation
            → Biometric prompt appears immediately (Face ID on iOS, fingerprint on Android)

Step 2  → Biometric authentication attempt
            OS-native biometric dialog shown

--- Path A: Success ---
Step 3a → Biometric match → authenticated
            → Home Dashboard loaded instantly (cached data, per FR-13)
            → Portfolio hero with number roll-up animation
            → Background data refresh triggers
            → If LEARN_MODE user and DOB now indicates 18+ → Age Upgrade modal (Journey 15)

--- Path B: Failure ---
Step 3b → Biometric fails (face not recognized / fingerprint mismatch)
            → OS dialog shows "Thu lai" (Try Again) option
            → Second attempt fails → OS dialog shows "Thu lai" again
            → Third consecutive failure → biometric dismissed automatically (per FR-07B)

Step 4  → Fallback: email/password login screen (slide transition)
            Message: "Xac thuc sinh trac hoc that bai. Vui long dang nhap bang mat khau."
            Fields: Email + Password
            CTA: "Dang nhap"
            → If valid credentials → Home Dashboard; JWT refreshed
            → If invalid → "Email hoac mat khau khong dung" (generic error per FR-07)
            → If 5th consecutive password failure → 15min lockout (per BR-12)

--- Path C: Biometric not available ---
Step 5  → If device biometric hardware removed or permission revoked →
            Graceful fallback to email/password
            Toast: "Quyen truy cap sinh trac hoc da bi go. Dang nhap bang mat khau."
            → Biometric session invalidated; re-enrollment required after login

--- Path D: Logged out user ---
Step 6  → If user previously logged out → biometric session invalidated (per FR-07B)
            → Welcome screen shown → user must log in with email/password
            → After successful login → biometric re-enrollment prompt shown
```

**Flow validation:**
- Biometric auth is the fastest path to Home — zero taps if Face ID succeeds on first attempt.
- 3 failure max prevents infinite retry loops while giving reasonable chance for environmental issues (lighting, wet fingers).
- Fallback to email/password is always available — biometric is never the only auth method (per FR-07B: first login always requires email/password).
- Logout explicitly invalidates biometric session — this prevents unauthorized access if device is shared.
- Edge case: User changes device biometric data (adds new fingerprint) → biometric session invalidated; re-enrollment required (per FR-07B).
- Edge case: OS-level biometric permission revoked by user → graceful fallback with explanatory toast.

---

### Journey 13: Milestone Celebration to Share

> A milestone event triggers the celebration overlay; user views the achievement card and shares it to social platforms.

```
Step 1  → Milestone event triggers (per FR-GAME-06)
            Trigger examples:
              - First paper trade fills
              - First profitable trading day (virtual P&L > 0)
              - New Trader Tier reached
              - Portfolio value milestone (+10M / +50M / +100M VND virtual profit)
              - Portfolio goal reached (FR-GAME-07)
              - 7-day or 30-day learning streak
            Each milestone fires once per user lifetime (except portfolio goal: per goal set)

Step 2  → Confetti overlay appears (full-screen modal, on top of current screen)
            Confetti particle animation: 1200ms duration
            Haptic feedback: medium impact
            → If user has `prefers-reduced-motion` enabled →
              no confetti particles; subtle opacity fade + haptic only

Step 3  → Achievement card rendered (9:16 format, per FR-GAME-06)
            Card content:
              - Milestone name: e.g., "Giao dich dau tien!" or "Len cap Nha dau tu!"
              - Date achieved
              - Trader Tier badge
              - Anonymized portfolio stat: % return only (not absolute VND amount, per BR-SOC-01)
            Pre-rendered as shareable 9:16 image

Step 4  → User options:
            CTA 1: "Chia se" (Share) → opens native OS share sheet
              Available targets: Zalo, KakaoTalk, Instagram Stories, general share
              Share payload: pre-rendered 9:16 achievement card image
            CTA 2: Dismiss → tap anywhere outside card, or swipe down
              → Overlay dismissed; return to underlying screen

Step 5  → Share flow
            → User selects Zalo → Zalo app opens with image attached
            → User selects KakaoTalk → KakaoTalk opens with image attached
            → User selects Instagram Stories → Instagram opens with image as story draft
            → If share fails (no compatible app installed) →
              Toast: "Khong the chia se. Anh da luu vao thu vien." (Screenshot saved to gallery)

Step 6  → After dismiss or share → return to underlying app screen
            Celebration state cleared; will not re-show for same milestone
            → If user was offline when milestone triggered →
              celebration shown on next app open (per FR-GAME-06)

Step 7  → Queue handling for simultaneous milestones
            → If 2 milestones triggered at once (e.g., first trade + first profit) →
              most significant shown first (tier-up > portfolio milestone > trade milestone)
            → Second celebration shown after first dismissed
            → Max 2 queued celebrations; additional milestones logged silently
```

**Flow validation:**
- Celebration is purely positive reinforcement — no action required from user. Dismissible at any time.
- Achievement card uses % return (not VND amount) for privacy when shared publicly (per BR-SOC-01).
- Share targets are platform-appropriate: Zalo for VN users, KakaoTalk for KR users, Instagram for all.
- Queue limit (max 2) prevents overlay fatigue. Excess milestones still logged for profile history.
- Edge case: Same milestone triggered twice → celebration not shown second time (deduped per user lifetime).
- Edge case: Reduced motion users get a respectful alternative — no particle effects, just a fade.

---

### Journey 14: Portfolio Goal Setting

> User sets a virtual portfolio value target, monitors progress, and receives a celebration when the goal is reached.

```
Step 1  → User on Portfolio tab → taps settings icon (top-right)
            → Push transition to Portfolio Settings screen

Step 2  → Portfolio Settings screen
            Options: "Dat muc tieu" (Set Goal) | "Dat lai danh muc" (Reset Portfolio, per FR-PT-05)
            → User taps "Dat muc tieu" (per FR-GAME-07)

Step 3  → Goal Setting screen
            Current portfolio value displayed: "Gia tri hien tai: ₫XXX,XXX,XXX"
            Input: Target value (numeric keypad, VND)
            Optional: Target date (date picker, can be left empty for open-ended)
            → If target <= current value → error: "Muc tieu phai cao hon gia tri hien tai"
            → If target = current value → error: "Muc tieu phai cao hon gia tri danh muc hien tai"
            CTA: "Luu muc tieu" (Save Goal) enabled when target > current value

Step 4  → User enters target: e.g., ₫600,000,000 (current: ₫520,000,000)
            → Taps "Luu muc tieu"
            → Toast: "Da dat muc tieu: ₫600,000,000"
            → One active goal at a time; setting new goal replaces previous (per FR-GAME-07)
            → Back to Portfolio tab

Step 5  → Portfolio tab header now shows progress bar (per FR-GAME-07)
            Progress bar displays:
              Current value | Target value | % progress
            Example: "₫520,000,000 / ₫600,000,000 — 40%"
            Progress updates in real-time with portfolio value changes

Step 6  → User monitors over time
            → Portfolio value increases through paper trading gains
            → Progress bar updates: 40% → 55% → 72% → ...
            → If portfolio value decreases below starting value →
              progress bar shows negative territory in neutral color

--- Path A: Goal Reached ---
Step 7a → Portfolio value reaches or exceeds ₫600,000,000
            → Milestone Celebration fires (per FR-GAME-06) — see Journey 13
            → Goal marked "Da dat" (Achieved)
            → Progress bar at 100%
            → User can set a new goal from Portfolio Settings

--- Path B: Goal Cancelled ---
Step 7b → User goes to Portfolio Settings → taps "Huy muc tieu" (Cancel Goal)
            → Confirmation: "Huy muc tieu nay? Tien trinh se mat."
            → CTAs: "Huy muc tieu" (Cancel Goal, destructive) | "Giu lai" (Keep)
            → On confirm: progress bar removed; no celebration
            → Toast: "Da huy muc tieu"

--- Path C: Portfolio Reset ---
Step 7c → User resets portfolio (FR-PT-05) while goal is active
            → Goal auto-cancelled (per FR-GAME-07)
            → User notified: "Muc tieu da bi huy do dat lai danh muc."
            → Progress bar removed
```

**Flow validation:**
- One goal at a time keeps the UI simple. New goal replaces previous without confirmation (lightweight goal system).
- Progress bar is always visible on Portfolio header when a goal is active — constant motivation.
- Goal must be strictly greater than current value — prevents trivially achievable goals.
- Portfolio reset auto-cancels goal — this is necessary since balance returns to 500M VND.
- Edge case: Goal set, then large loss drops portfolio below starting value → progress bar shows negative territory in neutral color (not red) to avoid discouragement.
- Edge case: Goal value equal to current value → rejected with clear error (per FR-GAME-07).

---

### Journey 15: Age Upgrade — LEARN_MODE to FULL_ACCESS on 18th Birthday

> User with LEARN_MODE tier logs in on or after their 18th birthday and is prompted to unlock full features.

```
Step 1  → App open → session check + DOB validation (server-side, per FR-AGE-04)
            System calculates: (today - DOB) >= 18 years
            → If user's tier is LEARN_MODE and age now >= 18 → trigger upgrade prompt

Step 2  → Full-screen modal appears before Home Dashboard loads
            Title: "Chuc mung! Ban da du 18 tuoi"
            Body: "Mo khoa tat ca tinh nang cua Paave?"
            Two CTAs:
              "Mo khoa ngay" (Unlock Now) — primary, accent color
              "De sau" (Maybe Later) — secondary, text-only

--- Path A: Unlock Now ---
Step 3a → User taps "Mo khoa ngay"
            → Server-side tier upgrade: LEARN_MODE → FULL_ACCESS (immediate, per FR-AGE-04)
            → DOB re-validated server-side (client cannot self-upgrade, per BR-16)
            → Celebration overlay (confetti + haptic, per FR-GAME-06):
              Achievement card: "FULL_ACCESS da mo khoa!"
              Share CTA → native share sheet
            → Modal dismissed → Home Dashboard loads with FULL_ACCESS features visible
            → Prompt not shown on next login

--- Path B: Maybe Later ---
Step 3b → User taps "De sau"
            → Modal dismissed → Home Dashboard loads (still LEARN_MODE for this session)
            → Tier remains LEARN_MODE until user accepts upgrade
            → Prompt re-shown on next login (per FR-AGE-04)
            → No cap on decline count — prompt shown every login until accepted

Step 4  → FULL_ACCESS features now visible (if unlocked):
            → All features accessible; no "Ban se mo khoa khi du 18 tuoi" blocks
            → Future real-money features (when added) will be available
            → No visible UI difference for paper trading (already available in LEARN_MODE)

Step 5  → If user was 17 and birthday occurred between sessions:
            → Tier upgrade detected on next login (per FR-AGE-03)
            → Same modal flow triggered (Step 2)
            → DOB birthday does not need to be exact login day — any login after 18th birthday triggers it
```

**Flow validation:**
- Upgrade prompt is shown maximum once per login session (per FR-AGE-04). User is not badgered during a single session.
- Server-side DOB re-validation prevents client-side manipulation of feature tier (per BR-16).
- "Maybe Later" is a real option — no dark patterns forcing immediate upgrade. User can continue in LEARN_MODE indefinitely.
- Edge case: User declines 5+ times → prompt continues each login (no cap per FR-AGE-04). This is intentional — the upgrade is always available.
- Edge case: User's 18th birthday falls during an active session → upgrade not triggered mid-session. Triggered on next login.
- Edge case: DOB was falsified at registration → legal disclaimer covers this (ToS violation); account review possible per FR-AGE-01.
- LEARN_MODE to FULL_ACCESS transition: the only practical difference in V2 is removal of the "You'll unlock full access when you turn 18" message on restricted features (per FR-AGE-03). Paper trading is already fully available in LEARN_MODE.

---

### Journey 16: Social Login — New User

> Social login flow for a new user who authenticates via Google or Apple OAuth, completes abbreviated registration (DOB + consent), and reaches Home.

```
Step 1  → Welcome screen (per FR-02)
            Primary CTAs: "Tao tai khoan" | "Dang nhap"
            Social buttons visible below divider: "Tiep tuc voi Google" | "Tiep tuc voi Apple"
            → User taps "Tiep tuc voi Google" (or "Tiep tuc voi Apple")

Step 2  → Social button enters loading state (spinner replaces icon, text: "Dang xu ly...")
            → Google/Apple OAuth native popup appears (OS-level)
            → User authenticates with provider credentials

Step 3  → OAuth success → id_token received
            → API call: POST /auth/social { provider, id_token }
            → API checks if email already registered

--- Path A: New user (registration_required = true) ---
Step 4a → Navigate to DOB entry screen (same as registration Journey 6, Step 6)
            Date picker, no free-text, future dates disabled
            Age validation applies same rules:
              → age < 13 → Block screen (same as Journey 6)
              → age 13–15 → Parental Consent (deferred V3)
              → age 16–17 → LEARN_MODE
              → age 18+ → FULL_ACCESS

Step 5a → Navigate to Data Consent screen (per FR-LEGAL-03)
            Three checkboxes (ToS + Privacy required, Marketing optional)
            CTA: "Tiep theo" enabled when ToS + Privacy checked

Step 6a → Account activated
            Virtual portfolio created (500M VND, per FR-PT-01)
            → Navigate to Biometric Enrollment Prompt (Screen 22)
              "Bat" → enroll biometric → Home
              "De sau" → skip → Home

Step 7a → Home Dashboard (fade, replace navigation stack)
            First-time state with portfolio hero + suggested stocks

--- Path B: Existing user, same provider (registration_required = false) ---
Step 4b → Session created directly
            → Navigate to Home Dashboard (instant, same as returning login)

--- Path C: Email already exists with different auth method ---
Step 4c → API returns existing_account = true
            → Account Link Prompt bottom sheet appears (Screen 35)
            Title: "Tai khoan voi email nay da ton tai"
            Body: masked email + link prompt

Step 5c → User taps "Lien ket"
            → API links social identity to existing account
            → Session created → Navigate to Home Dashboard

Step 5c (alt) → User taps "Huy"
            → Bottom sheet dismisses → Navigate to Login screen
            → User must log in with existing credentials
```

**Error paths:**
```
OAuth cancelled:           User dismisses native popup
                           → Return to Welcome screen, buttons reset to default
                           → No error toast (user-initiated cancel)

Provider unavailable:      Google/Apple service down or unreachable
                           → Toast: "Dich vu [Provider] tam thoi khong kha dung."
                           → Buttons reset to default, user can retry or use email/password

Network error:             No connectivity during OAuth or API call
                           → Toast: "Khong co ket noi mang. Vui long thu lai."
                           → Loading state reverts to default

Email already exists:      Account Link Prompt bottom sheet
                           → User chooses to link (merge accounts) or cancel (login manually)
                           → If link fails (server error) → Toast: "Lien ket khong thanh cong. Thu lai."
                           → If cancel → Login screen

DOB validation fails:      Same rules as Journey 6
                           → Under 13: blocked, no account created
                           → 13–15: parental consent (V3 deferred)

Consent declined:          User does not check ToS/Privacy → CTA disabled
                           → User can back out to Welcome (no account created yet)
```

**Flow validation:**
- Social login reduces registration steps from 4 (consent, market, account, verify) to 2 (DOB, consent) — email/password and OTP verification are skipped since provider handles identity verification.
- Market preference is auto-detected from locale (same as Journey 1 Step 4); no manual selection screen for social login to minimize friction.
- Account linking (Path C) resolves the common case where a user registered with email/password and later tries social login with the same email.
- Biometric enrollment is still offered for social login users — biometric is independent of auth method.
- Edge case: User uses Google on registration, later tries Apple with same email → link prompt triggered.

---

### Journey 17: Login with 2FA

> Returning user with two-factor authentication enabled logs in with email/password, completes 2FA OTP verification, and reaches Home. Alternative biometric path bypasses 2FA.

```
--- Primary path: Email/Password + 2FA ---
Step 1  → Login screen (per FR-07)
            Fields: Email + Password
            CTA: "Dang nhap"
            → User enters credentials and taps "Dang nhap"

Step 2  → API call: POST /auth/login { email, password }
            → Response: { two_factor_required: true, partial_token: "..." }
            → partial_token is a short-lived token (5 minute expiry)
            → OTP sent to user's registered email

Step 3  → Navigate to 2FA OTP Verification screen (Screen 36)
            Slide left transition from Login
            Shield icon + "Xac thuc hai buoc" title
            Masked email shown: "lo***@gmail.com"
            Timer starts at 5:00 (300s)

Step 4  → OTP arrives in user's email
            → User enters 6 digits into OTP boxes
            → Auto-advance on each digit

Step 5  → 6th digit entered → Auto-submit
            → API call: POST /auth/2fa/verify { partial_token, otp }
            → Loading state: spinner replaces OTP boxes

Step 6  → Success: 2FA verified
            → Shield-check animation (300ms ease-spring)
            → "Xac thuc thanh cong!" text
            → Auto-navigate to Home Dashboard after 1200ms
            → Full session created (access_token + refresh_token)

--- Alternative path: Biometric login (2FA bypassed) ---
Step 1  → App open → biometric enabled detected (per FR-07B)
            → Biometric prompt appears immediately (Face ID / fingerprint)

Step 2  → Biometric success → authenticated directly
            → Home Dashboard loaded (2FA bypassed entirely)
            → Biometric auth is considered a strong second factor by design

--- Alternative path: 2FA + Resend OTP ---
Step 4 (alt) → User did not receive OTP or it expired in spam
            → Waits for 60s cooldown on resend
            → Taps "Gui lai ma" → new OTP sent
            → Toast: "Ma moi da duoc gui"
            → Timer resets to 5:00
            → Previous OTP invalidated server-side

--- Alternative path: 2FA Cancel ---
Step 3 (alt) → User taps "Huy dang nhap" at bottom of Screen 36
            → partial_token cleared from memory
            → Navigate to Welcome screen (not Login — full reset)
            → No confirmation dialog needed
```

**Error paths:**
```
Wrong OTP:                 Boxes flash red (border-error, 300ms)
                           Shake animation (200ms)
                           "Ma khong dung. Con {remaining} lan thu."
                           Boxes cleared, focus returns to first box
                           Attempt counter incremented

5 failed attempts:         15-minute lockout
                           "Qua nhieu lan thu. Vui long thu lai sau 15 phut."
                           OTP input disabled, all boxes greyed
                           partial_token invalidated server-side
                           15-minute countdown displayed
                           After lockout: user must restart login from Step 1

Partial token expires:     Timer reaches 0:00 or 5 minutes elapsed
(5 min)                    "Phien het han. Dang nhap lai."
                           OTP input disabled
                           Auto-navigate to Login screen after 3s delay
                           User must re-enter email/password

Resend OTP:                60s cooldown between resends
                           During cooldown: "Gui lai ma" greyed, "trong Xs" countdown
                           After cooldown: "Gui lai ma" tappable (accent-primary)
                           New OTP sent, timer reset, previous OTP invalidated

Network error on verify:   Toast: "Khong the xac nhan. Kiem tra ket noi."
                           Input re-enabled, attempt count NOT incremented
                           User can retry

Network error on resend:   Toast: "Khong the gui ma. Thu lai sau."
                           Resend button re-enabled after toast

App killed during 2FA:     partial_token expires after 5min
                           On next app open: no valid session
                           User starts login from scratch
```

**Flow validation:**
- 2FA adds exactly one screen (Screen 36) to the login flow — minimal friction for the security benefit.
- 5-minute timer (vs 10-minute for registration OTP) reflects that 2FA is a real-time verification — user should have immediate access to email.
- Biometric bypass is by design: biometric authentication (Face ID / fingerprint) is inherently a second factor (something you are), so additional OTP is redundant.
- partial_token pattern ensures that password-verified state is short-lived and cannot be reused.
- Cancel button navigates to Welcome (not Login) to prevent loop of re-entering credentials into a potentially expired flow.
- Edge case: User enables 2FA, then loses access to email → must contact support. No backup codes in V2 (future consideration).
- Edge case: Multiple active sessions — 2FA is per-login-attempt, not per-device. Each login requires fresh 2FA.

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
| Splash | Welcome | Fade + scale up | — |
| Welcome | Registration Step 1 (Consent) | Slide left | Left → Right |
| Welcome | Login | Slide left | Left → Right |
| Registration Step N | Step N+1 | Slide left | Left → Right |
| Registration (OTP verified) | Biometric Enrollment | Fade | — |
| Biometric Enrollment | Home | Fade (replace stack) | — |
| Login | Home | Fade (replace stack) | — |
| Biometric Prompt | Home (success) | Fade (instant) | — |
| Biometric Prompt (fail x3) | Login (email/pw) | Slide left | Left → Right |
| Age Gate (under 13) | Welcome | Pop (slide right) | Right → Left |
| Any Tab | Any Tab | Fade (no slide) | — |
| Home / Discover / Markets | Stock Detail | Push (slide left) | Left → Right |
| Stock Detail | Back | Pop (slide right) | Right → Left |
| Stock Detail | Paper Order Placement | Push (slide left) | Left → Right |
| Stock Detail | Price Alert Sheet | Slide up (sheet) | Bottom → Top |
| Stock Detail | Community Feed tab | Inline tab switch | — |
| Stock Detail | Post Creation | Slide up (sheet, full) | Bottom → Top |
| Order Placement | Pre-Trade AI Card | Inline expand (collapsible) | — |
| Order Placement | Order Confirmation | Push (slide left) | Left → Right |
| Order Confirmation | Post-Trade AI Card | Slide up (sheet) | Bottom → Top |
| Discover | Theme Filter Sheet | Slide up (sheet) | Bottom → Top |
| Portfolio | Portfolio Settings | Push (slide left) | Left → Right |
| Portfolio | Stock Detail | Push (slide left) | Left → Right |
| Portfolio Settings | Goal Setting | Push (slide left) | Left → Right |
| Profile | AI Chat | Slide up (sheet) or Push | Bottom → Top or Left → Right |
| Any screen | Milestone Celebration | Modal overlay (fade in) | — |
| Milestone Celebration | Dismiss | Fade out | — |
| Milestone Celebration | Share Sheet | Native share sheet | — |
| Age Upgrade Modal | Home (unlocked) | Fade (replace) | — |
| Welcome | Social OAuth popup | Native OS modal | — |
| Social OAuth (success) | DOB Entry (new user) | Slide left | Left → Right |
| Social OAuth (success) | Home (existing user) | Fade (replace stack) | — |
| Social OAuth (email conflict) | Account Link Prompt | Slide up (sheet) | Bottom → Top |
| Account Link Prompt | Home (linked) | Fade (replace stack) | — |
| Account Link Prompt | Login (cancelled) | Slide down + push | — |
| Login | 2FA OTP (Screen 36) | Slide left | Left → Right |
| 2FA OTP (success) | Home | Fade (replace stack) | — |
| 2FA OTP (cancel) | Welcome | Fade (replace stack) | — |
| 2FA OTP (expired) | Login | Fade (replace stack) | — |
| Any sheet | Dismiss | Slide down | Top → Bottom |

---

## 5. Deep Link Structure (V2)

```
paave://                          → Home
paave://discover                  → Discover tab
paave://markets                   → Markets tab
paave://markets/vn                → Markets tab, VN subtab
paave://markets/kr                → Markets tab, KR subtab
paave://portfolio                 → Portfolio tab
paave://portfolio/trade/{ticker}  → Paper Order Placement for ticker
paave://portfolio/open-orders     → Portfolio → Open Orders section
paave://portfolio/settings        → Portfolio Settings (Reset / Goal)
paave://profile                   → Profile tab
paave://stock/{ticker}            → Stock Detail for ticker
paave://stock/{ticker}/community  → Stock Detail → Community tab
paave://alert/{ticker}            → Price Alert setup for ticker
paave://ai-chat                   → AI Chat screen
paave://ai-chat?q={query}         → AI Chat with pre-filled query
paave://auth/social/{provider}    → Social Login with provider (google/apple)
paave://auth/2fa                  → 2FA OTP Verification screen
paave://health-check              → Portfolio Health Check report
paave://challenge                 → Current Weekly Challenge detail
paave://milestone/{id}            → Milestone Achievement card
```

---

## 6. Gesture Map

| Gesture | Target | Action |
|---|---|---|
| Tap | Stock card | Navigate to Stock Detail |
| Long press | Stock card | Quick actions sheet (Watch / Alert / Trade / Share) |
| Swipe left | Markets subtabs | Go to next market tab |
| Swipe right | Markets subtabs | Go to previous market tab |
| Pull down | Any scrollable screen | Refresh data |
| Swipe down | Bottom sheet | Dismiss sheet |
| Swipe down | Celebration overlay | Dismiss celebration |
| Tap outside | Celebration overlay | Dismiss celebration |
| Tap outside | Tooltip overlay | Dismiss tooltip (per FR-EDU-01) |
| Tap | Financial term label | Show inline tooltip (per FR-EDU-01) |
| Tap | Author pseudonym (community feed) | Navigate to public profile (per FR-SOC-05) |
| Tap | Pre-trade AI card collapse toggle | Collapse/expand card |
| Tap | Thumbs up/down on AI card | Submit rating |
| Back gesture (iOS) | Any pushed screen | Pop back |
| Back gesture (iOS) | Order placement (during pre-trade card) | Cancel order |
| Double tap | Chart area | Reset zoom |
| Pinch | Chart area | Zoom in/out (V2: read-only) |

---

## 7. State Persistence Rules

```
Last active tab:              Persisted across sessions
Markets last-viewed subtab:   Persisted per session
Discover filter selection:    Persisted per session (reset on app restart)
Registration completion:      Persisted permanently (skip on re-launch)
Registration mid-flow state:  Persisted locally until completion (resume on re-open per FR-01)
Consent data (ToS version):   Persisted permanently on user record (per BR-22)
Biometric enrollment:         Persisted to device secure enclave + server flag (per FR-07B)
Feature tier (LEARN/FULL):    Persisted server-side; re-evaluated each login (per BR-16)
Age upgrade prompt declined:  Not persisted — prompt re-shown each login (per FR-AGE-04)
Scroll position:              Home and Discover scroll restored on tab re-activate
Stock Detail chart range:     Reset to 1D on each open
AI chat conversation:         Persisted per session (10 turns max); cleared on sheet close
Portfolio goal:               Persisted until achieved, cancelled, or portfolio reset
Learning streak:              Persisted server-side; evaluated in user's registered timezone
Weekly challenge entry:       Auto-entered on Monday login; not persisted if user skips week
Milestone celebration state:  Persisted permanently (each fires once per lifetime)
Investment disclaimer state:  Per screen type per session (reset on new session per FR-LEGAL-01)
Post creation draft:          Not persisted — lost if sheet closed before publish
Notification preferences:     Persisted on user profile (per FR-52)
Trader Score / Tier:          Persisted server-side; tier only increases (per BR-25)
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
