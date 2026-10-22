# Design Specification — Virtual Capital Rewards for F0 Learning Path
## Paave Mobile (React Native, iOS + Android)

**Document ID:** DESIGN-F0-LEARN-07  
**Document version:** 1.0  
**Date:** 2026-06-01  
**Linked Dev/QA Spec:** DEV-QA-SPEC-F0-Learning-Path v1.0  
**Design system:** Paave V2.0 "Kinetic Drop"  
**Author:** Design Spec Agent  
**Status:** Ready for Design Review

---

## 1. Alignment Summary

| Item | Decision |
|------|----------|
| Feature name | Virtual Capital Rewards for F0 Learning Path |
| Target audience | Gen Z, age 16–27, Vietnamese mobile users |
| Platform | React Native, iOS + Android |
| Baseline layout | 390×852px (iPhone 14 Pro) |
| Design system | Paave V2.0 "Kinetic Drop" |
| Reward triggers | MKC pass: M2 → +50,000,000 VND; M3 → +25,000,000 VND; M4 → +25,000,000 VND |
| TTL | 7 calendar days from server `awarded_at` timestamp |
| Sub-ledger label | "Tiền thưởng học tập" (not "Tiền ảo") |
| Force-liquidation | At T+7: all positions funded by bonus liquidated at last market price; proceeds credited to main balance |
| Reward color token | `lime` (#CAFD00) — distinct from `positive` (#10B981) to avoid P&L confusion |
| New color token | `gold` (#F59E0B) — used in `AmbientBackground` celebration variant and reward-specific warning states |
| Screens in scope | 6 screens/states (BonusCashModal, Portfolio Reward Section, Reward Detail Screen, Pre-Expiry Warning, Force-Liquidation Notification, Order Form Reward Display) |
| Existing components reused | `KineticButton`, `AmbientBackground`, `VirtualFundsLabel`, `PnLLabel`, `BottomSheet`, `Snackbar`, `SkeletonLoader` |
| New components | `BonusCashModal`, `RewardSection`, `RewardDetailRow`, `TTLCountdown`, `ExpiryBanner` |

---

## 2. Screen Count

| # | Screen / State | Entry Point | New / Modified |
|---|---------------|-------------|----------------|
| S1 | BonusCashModal | Immediately after MKC Pass screen | New |
| S2 | Portfolio Dashboard — Reward Section | Portfolio tab | Modified (new section injected) |
| S3 | LearningRewardDetailScreen | Tap on Reward Section card | New |
| S4 | Pre-Expiry Warning (push + in-app banner) | System: T-24h, T-1h | New |
| S5 | Force-Liquidation Notification (push + in-app) | System: T+7 liquidation job | New |
| S6 | PlaceOrderBottomSheet — Reward Balance Row | Place order flow | Modified (new row injected) |

---

## 3. New Design Tokens

### 3.1 New Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `gold` | `#F59E0B` | `AmbientBackground` celebration orbs (gold variant); TTL expiry warning icon; `ExpiryBanner` border; MKC celebration overlay |
| `gold-10` | `rgba(245,158,11,0.10)` | `ExpiryBanner` background fill; warning badge tint |
| `gold-20` | `rgba(245,158,11,0.20)` | `ExpiryBanner` hover/pressed state background |
| `gold-30` | `rgba(245,158,11,0.30)` | `ExpiryBanner` border when TTL < 1h |
| `reward-lime` | `#CAFD00` | Alias of `lime`; used explicitly for reward balances to distinguish from CTA usage in code |
| `reward-surface` | `rgba(202,253,0,0.07)` | `RewardSection` card background tint — lime-tinted but dark, distinct from `positive` green surfaces |
| `reward-progress-track` | `rgba(202,253,0,0.15)` | Reward usage progress bar track (unfilled portion) |

### 3.2 New Typography Tokens

| Token | Spec | Usage |
|-------|------|-------|
| `reward-amount` | Space Grotesk 24 Bold, tabular-nums | Reward balance amounts in `RewardSection` and `BonusCashModal` |
| `reward-amount-sm` | Space Grotesk 18 Bold, tabular-nums | Reward amounts in `RewardDetailRow` and order form |
| `ttl-countdown` | Space Grotesk 14 Medium, tabular-nums | `TTLCountdown` live timer display |
| `ttl-countdown-warning` | Space Grotesk 14 Bold, tabular-nums | `TTLCountdown` when TTL < 24h (red, bold) |

### 3.3 New Spacing / Layout Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `reward-section-padding` | 16px | Internal padding of `RewardSection` card |
| `reward-row-gap` | 10px | Gap between multiple active reward sub-rows |
| `reward-progress-height` | 4px | Height of reward usage progress bar |
| `reward-progress-radius` | 2px | Border-radius of progress bar ends |
| `bonus-modal-icon-size` | 80×80px | Gift icon in `BonusCashModal` |
| `bonus-modal-ambient-height` | 220px | Height of `AmbientBackground` zone in modal |

### 3.4 New Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `reward-modal-entry` | scale 0.85→1.0, opacity 0→1, spring(mass:0.8, stiffness:180, damping:18), 400ms | `BonusCashModal` entry |
| `reward-pulse-border` | border opacity 0.4→1.0→0.4, 1200ms loop | `RewardSection` pulsing red border at T-1h |
| `reward-expire-shake` | translateX [0,-3,3,-3,3,0]px, 360ms | `RewardSection` card on TTL reaching 0 |
| `expiry-banner-slide` | translateY -48→0, opacity 0→1, 300ms ease-out | `ExpiryBanner` slide-in from top |
| `bonus-amount-count-up` | Number increment from 0 to final value, 800ms, ease-out cubic | `BonusCashModal` reward amount reveal |

---

## 4. New Components

### 4.1 BonusCashModal

**Purpose:** Full-screen celebratory modal displayed immediately after MKC Pass screen when a module completion reward is issued. Announces the reward amount and directs the user to either explore the portfolio or continue learning.

**Props:**

| Prop | Type | Required | Notes |
|------|------|----------|-------|
| `moduleName` | string | Yes | e.g., `"Module 2"` |
| `rewardAmount` | number | Yes | Integer VND, e.g., `50000000` |
| `ttlDays` | number | Yes | Always `7` in current spec |
| `onExplorePorfolio` | callback | Yes | Navigates to Portfolio tab |
| `onContinueLearning` | callback | Yes | Continues to next module |

---

### 4.2 RewardSection

**Purpose:** Inline card section injected into the Portfolio Dashboard between Total Portfolio Value and Available Cash. Summarises all active reward balances with live TTL countdowns. Hidden when no active rewards exist.

**Props:**

| Prop | Type | Required | Notes |
|------|------|----------|-------|
| `rewards` | `Reward[]` | Yes | Array of active reward objects |
| `onPress` | callback | Yes | Navigates to `LearningRewardDetailScreen` |

**Reward object shape:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Ledger record ID |
| `moduleLabel` | string | e.g., `"Module 2"` |
| `originalAmount` | number | VND, e.g., `50000000` |
| `remainingAmount` | number | VND — after any trades funded by reward |
| `expiresAt` | ISO8601 string | Server-authoritative timestamp |
| `status` | `"ACTIVE" \| "EXPIRING" \| "EXPIRED" \| "LIQUIDATING"` | Drives state variant |

---

### 4.3 RewardDetailRow

**Purpose:** A single row inside `LearningRewardDetailScreen` representing one reward record. Used in both "Active" and "History" sections with different status badge variants.

**Props:**

| Prop | Type | Required | Notes |
|------|------|----------|-------|
| `reward` | `Reward` | Yes | Full reward object |
| `variant` | `"active" \| "history"` | Yes | Determines which fields are shown |

---

### 4.4 TTLCountdown

**Purpose:** A live-updating countdown timer component that displays remaining time until a reward expires. Updates every second via `setInterval`. Switches visual style when TTL < 24h. Announces expiry inline.

**Props:**

| Prop | Type | Required | Notes |
|------|------|----------|-------|
| `expiresAt` | ISO8601 string | Yes | Target expiry timestamp |
| `onExpired` | callback | No | Fires when countdown reaches 00:00:00 |
| `compact` | boolean | No | `true` → shows "N ngày" only; `false` → shows full "N ngày HH:MM:SS" |

**Timer format logic:**

| Remaining time | Display format | Token |
|----------------|----------------|-------|
| ≥ 2 days | "Hết hạn sau 3 ngày 14:22:07" | `fog` color |
| < 24h, ≥ 1h | "Hết hạn sau 04:37:15" | `gold` (#F59E0B) |
| < 1h | "Hết hạn sau 00:47:03" | `negative` (#EF4444), bold |
| Expired | "Đã hết hạn" | `fog`, italic |

---

### 4.5 ExpiryBanner

**Purpose:** A sticky warning banner rendered at the top of the Portfolio Dashboard (below the navigation header) when any active reward has TTL < 24h. Contains the remaining amount, a live countdown, and an inline CTA.

**Props:**

| Prop | Type | Required | Notes |
|------|------|----------|-------|
| `reward` | `Reward` | Yes | The soonest-expiring reward |
| `onPressCTA` | callback | Yes | Navigates to Portfolio tab / order entry |
| `onDismiss` | callback | No | If provided, shows ✕ dismiss button |

---

## 5. ASCII Wireframes

### Screen 1: BonusCashModal

```
┌─────────────────────────────────────────────────────────┐  390×852px
│  ░░░░░░░░░░░░ AmbientBackground (lime+gold orbs) ░░░░░░ │  Full bleed, behind modal
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  Modal card
│  │                                                   │  │  surface: ink-800 (#131313)
│  │  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │  │  border-radius: 24px
│  │    AmbientBackground zone (lime+gold orbs)        │  │  Ambient zone h: 220px
│  │  │  ┌─────────────────────────────────────┐  │   │  │
│  │    │        🎁  [Gift icon 80×80px]       │     │  │  lime-tinted SVG icon
│  │  └─│─────────────────────────────────────│─┘   │  │
│  │    └─────────────────────────────────────┘      │  │
│  │                                                   │  │
│  │  ┌───────────────────────────────────────────┐   │  │
│  │  │ Bạn nhận được vốn thưởng học tập!         │   │  │  Space Grotesk 28 Bold
│  │  │                                           │   │  │  lime (#CAFD00), centered
│  │  └───────────────────────────────────────────┘   │  │
│  │                                                   │  │
│  │  ┌───────────────────────────────────────────┐   │  │
│  │  │ Hoàn thành Module 2: +50,000,000 VND      │   │  │  Space Grotesk 18 Medium
│  │  └───────────────────────────────────────────┘   │  │  white (#FFFFFF), centered
│  │                                                   │  │
│  │  ┌───────────────────────────────────────────┐   │  │
│  │  │ Vốn thưởng có hiệu lực trong 7 ngày.      │   │  │  Manrope 14 Regular
│  │  │ Dùng để thực hành giao dịch ngay!         │   │  │  fog (#ADAAAA), centered
│  │  └───────────────────────────────────────────┘   │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────┐     │  │
│  │  │  ⏱  Hết hạn sau 7 ngày                  │     │  │  Plasma badge pill
│  │  └─────────────────────────────────────────┘     │  │  bg: rgba(210,119,255,0.15)
│  │         (centered, radius-pill)                  │  │  border: 1px plasma (#D277FF)
│  │                                                   │  │  Manrope 13 SemiBold, plasma
│  │                                                   │  │
│  │  ┌───────────────────────────────────────────┐   │  │
│  │  │       Khám phá danh mục →                 │   │  │  KineticButton lime
│  │  └───────────────────────────────────────────┘   │  │  h: 56px, full-width (−32px)
│  │                                                   │  │  Space Grotesk 16 Bold
│  │                                                   │  │  bg: #CAFD00, text: #0E0E0E
│  │  ┌───────────────────────────────────────────┐   │  │
│  │  │             Tiếp tục học                  │   │  │  KineticButton ghost
│  │  └───────────────────────────────────────────┘   │  │  h: 52px, full-width (−32px)
│  │                                                   │  │  border: 1px ink-700, fog text
│  │                                                   │  │  padding-bottom: 32px (safe)
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

Backdrop: canvas (#0E0E0E) at 85% opacity behind modal card
Modal card is NOT dismissible by tapping backdrop
```

---

### Screen 2: Portfolio Dashboard — Reward Section (Section 1.5)

```
┌─────────────────────────────────────────────────────────┐  390px wide
│ ←  Danh mục                               [⋯ settings] │  Header 56px, ink-900 bg
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  Section 1: Total Portfolio
│  │  Tổng giá trị danh mục                            │  │  ink-800 card, radius-card
│  │  500,000,000 VND  ▴ +2.4%                         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗  │  ── Section 1.5 (NEW) ──
│  ║  🎓 Tiền thưởng học tập                    [›]   ║  │  ink-800 card, radius-card 16px
│  ║                                                   ║  │  bg: reward-surface
│  ║  ┌─────────────────────────────────────────────┐  ║  │  (rgba(202,253,0,0.07))
│  ║  │ [Module 2 icon 20×20px]  Module 2           │  ║  │  Default state: 1px
│  ║  │ 50,000,000 VND           ⏱ Hết hạn 6 ngày  │  ║  │  lime/20% border
│  ║  │ [████████████████████░░░░] 100% còn lại     │  ║  │
│  ║  └─────────────────────────────────────────────┘  ║  │
│  ║                                                   ║  │  If multiple rewards:
│  ║  ┌─────────────────────────────────────────────┐  ║  │  each is a sub-row, 10px gap
│  ║  │ [Module 3 icon 20×20px]  Module 3           │  ║  │
│  ║  │ 20,000,000 VND           ⏱ Hết hạn 4 ngày  │  ║  │
│  ║  │ [████████░░░░░░░░░░░░░░░░░] 80% đã dùng     │  ║  │
│  ║  └─────────────────────────────────────────────┘  ║  │
│  ╚═══════════════════════════════════════════════════╝  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  Section 2: Available Cash
│  │  Tiền khả dụng                                    │  │  ink-800 card
│  │  430,000,000 VND                                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [Positions list...]                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘

── Section 1.5 Sub-row anatomy ──
┌────────────────────────────────────────────────────────┐
│ [module icon 20px]  [module label, Manrope 13 Med]     │  row top
│                     [amount, Space Grotesk 16B lime]   │  amount right-aligned
│                     [⏱ TTLCountdown, Manrope 12 fog]   │  below amount
│ [progress bar, h:4px, lime fill, reward-progress-track]│  row bottom, full width
└────────────────────────────────────────────────────────┘
Height per sub-row: 72px
Module icon: 20×20px, ink-700 circle bg, Manrope 11 text (e.g., "M2"), lime text

── Warning state: TTL < 24h ──
╔═══════════════════════════════════════════════════════╗
║  🎓 Tiền thưởng học tập                        [›]   ║
║  ┌───────────────────────────────────────────────┐   ║  border: 1px negative (#EF4444)
║  │ [M2]  Module 2                                │   ║  pulsing border animation
║  │ 50,000,000 VND       ⏱ Hết hạn 04:37:15      │   ║  TTL text: gold (#F59E0B)
║  │ [████████████████████░░░░]                    │   ║
║  └───────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════╝

── Warning state: TTL < 1h ──
Same as above but:
- TTL text: negative (#EF4444), bold
- Card border: 1px negative, pulsing (reward-pulse-border animation)
- ⚠ icon (16px, negative) appears left of TTL text

── Expired / Liquidating state ──
╔═══════════════════════════════════════════════════════╗
║  🎓 Tiền thưởng học tập                               ║
║  ┌───────────────────────────────────────────────┐   ║  border: 1px gold/40%
║  │  Vốn thưởng đã hết hạn — đang thanh lý...     │   ║  bg: gold-10
║  │  [SkeletonLoader pulse — 48px h]               │   ║  Manrope 13 fog
║  └───────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════╝
```

---

### Screen 3: LearningRewardDetailScreen

```
┌─────────────────────────────────────────────────────────┐  390px wide
│ ‹  Tiền thưởng học tập                                  │  Header 56px
│                                                         │  Manrope 17 SemiBold, white
│    ┌─────────────────────────────────────────────┐      │
│    │ 🏦 Tài khoản ảo   [VirtualFundsLabel chip]  │      │  VirtualFundsLabel chip
│    └─────────────────────────────────────────────┘      │  Mandatory, see design system
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ĐANG HOẠT ĐỘNG (2)                                     │  Manrope 11 SemiBold, fog
│  ─────────────────────────────────────────────────      │  uppercase, letter-spacing 0.8px
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  RewardDetailRow — active
│  │  ┌──────────────────────────────────────────────┐ │  │  ink-800 card, radius-card 16px
│  │  │  Module 2                                    │ │  │  padding: 16px
│  │  │  Số tiền gốc: 50,000,000 VND                 │ │  │
│  │  │  Còn lại: 50,000,000 VND                     │ │  │
│  │  │                                              │ │  │
│  │  │  [████████████████████████] 100% chưa dùng   │ │  │  progress bar h:4px
│  │  │                                              │ │  │
│  │  │  ⏱ Hết hạn sau 6 ngày 14:22:07      [ACTIVE]│ │  │  TTLCountdown + status badge
│  │  └──────────────────────────────────────────────┘ │  │  badge: bg lime/15%, text lime
│  └───────────────────────────────────────────────────┘  │  Manrope 11 Bold
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  Second active reward
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │  Module 3                                    │ │  │
│  │  │  Số tiền gốc: 25,000,000 VND                 │ │  │
│  │  │  Còn lại: 20,000,000 VND                     │ │  │
│  │  │                                              │ │  │
│  │  │  [████████░░░░░░░░░░░░░░░░] 20% đã dùng      │ │  │
│  │  │                                              │ │  │
│  │  │  ⏱ Hết hạn sau 4 ngày 08:11:44      [ACTIVE]│ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  Info tooltip card
│  │  ℹ Vốn thưởng là tiền ảo có thời hạn dùng để     │  │  ink-800 card, radius-card
│  │    luyện tập. Sau 7 ngày, vốn không dùng sẽ       │  │  bg: rgba(202,253,0,0.04)
│  │    được tất toán tự động.                         │  │  border: 1px lime/10%
│  └───────────────────────────────────────────────────┘  │  Manrope 13 Regular, fog
│                                                         │  ℹ icon: lime 16px
│  LỊCH SỬ                                               │  Manrope 11 SemiBold, fog
│  ─────────────────────────────────────────────────      │  uppercase, letter-spacing 0.8px
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  RewardDetailRow — history
│  │  ┌──────────────────────────────────────────────┐ │  │  ink-800 card, radius-card
│  │  │  Module 2 (tháng trước)            [HẾT HẠN] │ │  │  badge: bg fog/15%, text fog
│  │  │  Số tiền nhận: 50,000,000 VND                 │ │  │  Manrope 11 Bold
│  │  │  Đã dùng: 30,000,000 VND                      │ │  │
│  │  │  Thu hồi: +3,200,000 VND                      │ │  │  green if positive P&L
│  │  │  Ngày tất toán: 15/04/2026                    │ │  │  Manrope 12 fog
│  │  └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  Another history row
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │  Module 2 (lần đầu)          [ĐÃ THANH LÝ]   │ │  │  badge: bg gold/15%, text gold
│  │  │  Số tiền nhận: 50,000,000 VND                 │ │  │
│  │  │  Đã dùng: 50,000,000 VND                      │ │  │
│  │  │  Thu hồi: −1,800,000 VND                      │ │  │  negative: EF4444
│  │  │  Ngày tất toán: 22/03/2026                    │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Screen 4: Pre-Expiry Warning (Push Notification + In-App Banner)

```
── Push Notification: T-24h ──
┌───────────────────────────────────────────────────────┐
│  [Paave App Icon]                           now  ×    │
│  Vốn thưởng học tập sắp hết hạn                       │
│  Bạn còn 50,000,000 VND tiền thưởng.                  │
│  Hết hạn sau 24 giờ. Hãy dùng ngay!                   │
└───────────────────────────────────────────────────────┘
Deep-link target on tap: /portfolio/reward-detail

── Push Notification: T-1h ──
┌───────────────────────────────────────────────────────┐
│  [Paave App Icon]                           now  ×    │
│  Còn 1 giờ! Tiền thưởng học tập hết hạn               │
│  Còn 50,000,000 VND. Dùng ngay trước khi hết hạn!     │
└───────────────────────────────────────────────────────┘
Deep-link target on tap: /portfolio/reward-detail

── In-App ExpiryBanner: TTL < 24h ──
┌─────────────────────────────────────────────────────────┐  390px wide
│ ‹  Danh mục                               [⋯ settings] │  Portfolio Header 56px
│                                                         │
│ ╔═════════════════════════════════════════════════════╗ │  ExpiryBanner
│ ║ ⚠  Tiền thưởng học tập hết hạn sau 04:37:15        ║ │  h: 48px, sticky below header
│ ║    50,000,000 VND còn lại      [Dùng ngay →]       ║ │  bg: gold-10 (rgba(245,158,11,0.10))
│ ╚═════════════════════════════════════════════════════╝ │  border-bottom: 1px gold (#F59E0B)
│                                                         │  Manrope 13 Regular, gold
│  [Portfolio content below banner...]                    │  CTA: Manrope 13 Bold, lime
│                                                         │  ⚠ icon: 16px gold
│                                                         │
└─────────────────────────────────────────────────────────┘

ExpiryBanner layout detail:
┌───────────────────────────────────────────────────────────┐  h: 48px, h-padding: 16px
│  ⚠ [Manrope 13 Reg, gold] "Tiền thưởng... hết hạn sau"   │
│     [TTLCountdown, tabular-nums, gold]                    │
│                            [Dùng ngay →][lime, 13 Bold]   │  right-aligned CTA
└───────────────────────────────────────────────────────────┘

When TTL < 1h:
- Banner border changes to: 1px negative (#EF4444)
- Banner background: rgba(239,68,68,0.10)
- TTL text: negative (#EF4444), bold
- ⚠ icon color: negative (#EF4444)
```

---

### Screen 5: Force-Liquidation Notification (Push + In-App Trade History)

```
── Push Notification: Liquidation Complete ──
┌───────────────────────────────────────────────────────┐
│  [Paave App Icon]                           now  ×    │
│  Tất toán vốn thưởng hoàn tất                         │
│  50,000,000 VND vốn thưởng đã được tất toán.          │
│  3,200,000 VND đã chuyển vào số dư chính của bạn.     │
└───────────────────────────────────────────────────────┘
Deep-link on tap: /portfolio/history

── In-App: Trade History entry ──
┌─────────────────────────────────────────────────────────┐  390px wide
│ ‹  Lịch sử giao dịch                                   │  Header 56px
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Hôm nay, 01/06/2026                                    │  date divider, Manrope 11 fog
│  ─────────────────────────────────────────────────      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  Trade row — force-liquidation
│  │                                                   │  │  ink-800 card, radius-card
│  │  VNM         [Tất toán thưởng]                    │  │  padding: 14px 16px
│  │  Bán 500 cổ phiếu                        HOÀN TẤT │  │
│  │  Giá: 23,400 VND     Giá trị: 11,700,000 VND      │  │
│  │                                                   │  │
│  │  [Tất toán thưởng] badge:                         │  │  badge: bg gold/15%, text gold
│  │  Manrope 11 Bold, gold (#F59E0B)                   │  │  border: 1px gold/40%
│  │  bg: rgba(245,158,11,0.15), radius-pill            │  │  radius: radius-pill
│  │  padding: 3px 8px                                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │  Second force-liquidated position
│  │  HPG         [Tất toán thưởng]                    │  │
│  │  Bán 200 cổ phiếu                        HOÀN TẤT │  │
│  │  Giá: 27,200 VND     Giá trị: 5,440,000 VND       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [Remaining trade history entries...]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Screen 6: PlaceOrderBottomSheet — Reward Balance Display

```
┌─────────────────────────────────────────────────────────┐  390px wide
│  ─────  [drag handle 36×4px, ink-700, radius 2px] ───── │  BottomSheet
│                                                         │  bg: ink-800 (#131313)
│  Đặt lệnh mua                                           │  Space Grotesk 18 Bold, white
│  VNM  ·  Vinamilk                                       │  Manrope 13 fog
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │  Order form card
│  │                                                  │   │  ink-700, radius-card
│  │  Số lượng    [────────────────]  [+]  [−]        │   │  padding 16px
│  │  Giá         [────────────────]  Giá thị trường  │   │
│  │                                                  │   │
│  │  ──────────────────────────────────────────────  │   │  divider: 1px ink-700
│  │                                                  │   │
│  │  Tiền khả dụng                                   │   │
│  │  430,000,000 VND                    fog, 14px    │   │
│  │                                                  │   │
│  │  ┌────────────────────────────────────────────┐  │   │  ── NEW ROW (S6) ──
│  │  │ ⏱  Tiền thưởng học tập                    │  │   │  bg: rgba(202,253,0,0.06)
│  │  │    50,000,000 VND             [⏱ 6 ngày]  │  │   │  border: 1px lime/20%
│  │  └────────────────────────────────────────────┘  │   │  radius: 10px
│  │                                                  │   │  "Tiền thưởng học tập":
│  │  Tổng sức mua                                    │   │    Manrope 13 Medium, fog
│  │  480,000,000 VND                lime, 16px Bold  │   │  Amount: Space Grotesk 16B, lime
│  │  (430,000,000 + tiền thưởng)    fog, 11px        │   │  Badge [⏱ N ngày]: plasma pill
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Đặt lệnh mua                             │   │  KineticButton lime
│  └──────────────────────────────────────────────────┘   │  h: 56px, full-width
│                                                         │
│       [safe area spacer 16px]                           │
└─────────────────────────────────────────────────────────┘

── Reward row detail ──
┌───────────────────────────────────────────────────────┐  h: 44px, padding: 10px 12px
│ [clock icon 14px lime]  Tiền thưởng học tập           │  left section
│                         50,000,000 VND  [⏱ 6 ngày]   │  right section, right-aligned
└───────────────────────────────────────────────────────┘

[⏱ N ngày] badge:
- bg: rgba(210,119,255,0.15) (plasma tint)
- border: 1px plasma (#D277FF) / 50%
- text: plasma (#D277FF), Manrope 11 SemiBold
- padding: 2px 7px, radius-pill

Deduction order note (shown as helper text below order button if reward balance used):
"Tiền thưởng được dùng trước, sau đó tiền chính."
Manrope 11 Regular, fog, centered, 8px above button
```

---

## 6. Component Specs

### 6.1 BonusCashModal

| Property | Value |
|----------|-------|
| Modal container background | `ink-800` (#131313) |
| Modal border-radius | 24px |
| Modal horizontal margin | 0px (full-width, bottom sheet style) |
| Modal bottom padding | 32px (safe area) |
| Backdrop | `canvas` (#0E0E0E) at 85% opacity |
| Backdrop interaction | Non-dismissible (no touch pass-through) |
| `AmbientBackground` zone height | 220px |
| `AmbientBackground` variant | `gold-lime` — orbs use `lime` (#CAFD00) and `gold` (#F59E0B), particle count ×1.5 vs default |
| Gift icon size | 80×80px |
| Gift icon tint | `lime` (#CAFD00) |
| Gift icon position | Centered within ambient zone, vertically centered |
| Headline typography | Space Grotesk 28 Bold |
| Headline color | `lime` (#CAFD00) |
| Headline padding | 0 24px |
| Headline text-align | center |
| Subheadline typography | Space Grotesk 18 Medium |
| Subheadline color | `#FFFFFF` |
| Subheadline padding | 0 24px, top 8px |
| Subheadline text-align | center |
| Reward amount in subheadline | Rendered via `reward-amount` token (tabular-nums, formatted as `XX,XXX,XXX VND`) |
| Body text typography | Manrope 14 Regular |
| Body text color | `fog` (#ADAAAA) |
| Body text padding | 0 32px, top 12px |
| Body text text-align | center |
| TTL badge background | `rgba(210,119,255,0.15)` |
| TTL badge border | 1px `plasma` (#D277FF) |
| TTL badge border-radius | `radius-pill` (999px) |
| TTL badge padding | 6px 14px |
| TTL badge typography | Manrope 13 SemiBold |
| TTL badge color | `plasma` (#D277FF) |
| TTL badge margin-top | 16px |
| TTL badge icon | ⏱ (emoji or SVG equivalent, 14px) |
| Primary CTA (KineticButton lime) | height 56px, full-width minus 32px margin, border-radius 12px |
| Primary CTA label | "Khám phá danh mục →" |
| Primary CTA typography | Space Grotesk 16 Bold |
| Primary CTA background | `lime` (#CAFD00) |
| Primary CTA text color | `#0E0E0E` |
| Primary CTA margin | 20px 16px top, 0 16px |
| Secondary CTA (ghost) | height 52px, full-width minus 32px, border-radius 12px |
| Secondary CTA label | "Tiếp tục học" |
| Secondary CTA typography | Space Grotesk 16 Regular |
| Secondary CTA border | 1px `ink-700` (#1A1A1A) |
| Secondary CTA text color | `fog` (#ADAAAA) |
| Secondary CTA margin | 12px 16px top, 0 16px |
| Entry animation | `reward-modal-entry` token (scale 0.85→1.0, opacity 0→1, 400ms spring) |
| Amount count-up | `bonus-amount-count-up` token (0 → final, 800ms, ease-out cubic) |
| Reward amount count-up start delay | 300ms after modal entry animation begins |

---

### 6.2 RewardSection

| Property | Value |
|----------|-------|
| Container background | `reward-surface` (rgba(202,253,0,0.07)) |
| Container border-radius | 16px (`radius-card`) |
| Container border (default) | 1px `rgba(202,253,0,0.20)` |
| Container border (T-24h) | 1px `gold` (#F59E0B) |
| Container border (T-1h) | 1px `negative` (#EF4444), animated pulse |
| Container padding | 16px (`reward-section-padding`) |
| Container margin | 0 24px, 12px bottom |
| Section title typography | Manrope 14 SemiBold |
| Section title color | `#FFFFFF` |
| Section title icon | 🎓 graduation cap, 16px, preceding text, 6px gap |
| Chevron indicator | `›` 20px, `fog` color, right-aligned, tappable area 44×44px |
| Sub-row gap | 10px (`reward-row-gap`) |
| Sub-row divider | 1px `ink-700` horizontal rule between rows |
| Module badge size | 24×24px |
| Module badge background | `ink-700` (#1A1A1A) |
| Module badge border-radius | 6px |
| Module badge label typography | Manrope 10 Bold |
| Module badge label color | `lime` (#CAFD00) |
| Sub-row module label typography | Manrope 13 Medium |
| Sub-row module label color | `#FFFFFF` |
| Sub-row amount typography | Space Grotesk 16 Bold (tabular-nums) |
| Sub-row amount color | `lime` (#CAFD00) |
| Sub-row TTL typography | Manrope 12 Regular |
| Sub-row TTL color (default) | `fog` (#ADAAAA) |
| Sub-row TTL color (< 24h) | `gold` (#F59E0B) |
| Sub-row TTL color (< 1h) | `negative` (#EF4444) |
| Sub-row TTL icon (< 1h) | ⚠ 14px, same color as text |
| Progress bar height | 4px (`reward-progress-height`) |
| Progress bar radius | 2px (`reward-progress-radius`) |
| Progress bar fill color | `lime` (#CAFD00) |
| Progress bar track color | `reward-progress-track` (rgba(202,253,0,0.15)) |
| Progress bar fill width | `(remainingAmount / originalAmount) × 100%` |
| Progress bar margin-top | 8px below TTL row |
| Sub-row total height | 72px |
| Liquidating state background | `gold-10` (rgba(245,158,11,0.10)) |
| Liquidating state border | 1px `rgba(245,158,11,0.40)` |
| Liquidating text | "Vốn thưởng đã hết hạn — đang thanh lý..." |
| Liquidating text typography | Manrope 13 Regular |
| Liquidating text color | `fog` (#ADAAAA) |
| Liquidating skeleton | `SkeletonLoader` component, h:48px, within sub-row |
| Empty state | Section entirely hidden (no empty state card rendered) |
| Tap target | Entire section card; fires `onPress` |
| Ripple on tap | `ink-700` ripple, 300ms |

---

### 6.3 RewardDetailRow

#### Active variant

| Property | Value |
|----------|-------|
| Container background | `ink-800` (#131313) |
| Container border-radius | 16px |
| Container border | 1px `rgba(202,253,0,0.15)` |
| Container padding | 16px |
| Container margin-bottom | 8px |
| Module name typography | Space Grotesk 16 Bold |
| Module name color | `#FFFFFF` |
| Amount fields typography | Manrope 14 Regular |
| Amount fields color | `fog` (#ADAAAA) |
| Amount values typography | Manrope 14 Medium |
| Amount values color | `#FFFFFF` |
| Remaining amount typography | Space Grotesk 16 Bold (tabular-nums) |
| Remaining amount color | `lime` (#CAFD00) |
| Progress bar | Same spec as `RewardSection` sub-row progress bar |
| Progress bar label | "X% chưa dùng" or "X% đã dùng" — Manrope 11 fog, right of bar |
| Status badge — ACTIVE | bg: rgba(202,253,0,0.15), border: 1px lime/40%, text: lime, Manrope 11 Bold, radius-pill, padding 3px 8px |
| Status badge — EXPIRING | bg: rgba(245,158,11,0.15), border: 1px gold/40%, text: gold, same sizing |
| Status badge — EXPIRED | bg: rgba(173,170,170,0.15), border: 1px fog/40%, text: fog, same sizing |

#### History variant

| Property | Value |
|----------|-------|
| Container opacity | 0.8 (slightly dimmed vs active) |
| Container border | 1px `rgba(255,255,255,0.06)` |
| Module name color | `fog` (#ADAAAA) |
| "Số tiền nhận" label | Manrope 13 Regular, fog |
| "Số tiền nhận" value | Manrope 13 Medium, `#FFFFFF` |
| "Đã dùng" label | Manrope 13 Regular, fog |
| "Đã dùng" value | Manrope 13 Medium, `#FFFFFF` |
| "Thu hồi" (positive P&L) | Manrope 13 Medium, `positive` (#10B981) |
| "Thu hồi" (negative P&L) | Manrope 13 Medium, `negative` (#EF4444) |
| "Ngày tất toán" typography | Manrope 12 Regular, fog |
| Status badge — HẾT HẠN | bg: rgba(173,170,170,0.15), text: fog, border: 1px fog/30% |
| Status badge — ĐÃ THANH LÝ | bg: rgba(245,158,11,0.15), text: gold, border: 1px gold/40% |

---

### 6.4 TTLCountdown

| Property | Value |
|----------|-------|
| Update interval | 1000ms (`setInterval`) |
| Time format (≥ 2 days) | "Hết hạn sau N ngày HH:MM:SS" |
| Time format (< 24h, ≥ 1h) | "Hết hạn sau HH:MM:SS" |
| Time format (< 1h) | "Hết hạn sau HH:MM:SS" (red, bold) |
| Time format (expired) | "Đã hết hạn" |
| Compact format (≥ 2 days) | "N ngày" |
| Compact format (< 24h) | "< 24h" |
| Typography (default) | `ttl-countdown` token: Space Grotesk 14 Medium, tabular-nums |
| Typography (warning < 24h) | `ttl-countdown-warning` token: Space Grotesk 14 Bold, tabular-nums |
| Color (≥ 2 days) | `fog` (#ADAAAA) |
| Color (< 24h) | `gold` (#F59E0B) |
| Color (< 1h) | `negative` (#EF4444) |
| Color (expired) | `fog` (#ADAAAA), font-style italic |
| Clock icon | 14px, same color as text, 4px right of text |
| `onExpired` callback | Fires once when countdown crosses 0; parent should refresh reward data |
| App background handling | On `AppState: 'active'`, recalculate remaining time from `expiresAt` timestamp (do not persist countdown in memory — always computed from server timestamp) |
| Timezone | All times use device local timezone for display; `expiresAt` stored as UTC |

---

### 6.5 ExpiryBanner

| Property | Value |
|----------|-------|
| Height | 48px |
| Position | Sticky, immediately below Portfolio Header (z-index above scroll content) |
| Background (default warning) | `gold-10` rgba(245,158,11,0.10) |
| Background (< 1h) | rgba(239,68,68,0.10) |
| Border-bottom (default warning) | 1px `gold` (#F59E0B) |
| Border-bottom (< 1h) | 1px `negative` (#EF4444) |
| Horizontal padding | 16px |
| ⚠ icon size | 16px |
| ⚠ icon color (default) | `gold` (#F59E0B) |
| ⚠ icon color (< 1h) | `negative` (#EF4444) |
| Main text typography | Manrope 13 Regular |
| Main text color (default) | `gold` (#F59E0B) |
| Main text color (< 1h) | `negative` (#EF4444) |
| Main text content | "Tiền thưởng học tập hết hạn sau [TTLCountdown]" |
| Amount subtext | "[X VND] còn lại" — Manrope 12 Regular, same color |
| CTA text | "Dùng ngay →" |
| CTA typography | Manrope 13 Bold |
| CTA color | `lime` (#CAFD00) |
| CTA tap target | 80px wide minimum, full-height of banner |
| Entry animation | `expiry-banner-slide` token: translateY -48→0, opacity 0→1, 300ms ease-out |
| Dismiss animation | translateY 0→-48, opacity 1→0, 250ms ease-in |
| Multiple rewards | Shows only the soonest-expiring reward's data |
| Visibility rule | Rendered when any active reward has `expiresAt - now < 86400000ms` (24h) |

---

## 7. Interaction Rules

All rules follow the format: **Trigger → System Response**

| # | Trigger | System Response |
|---|---------|-----------------|
| IR-R01 | MKC Pass result screen dismisses (auto after 3s or user tap) → server event `module_completion` with `bonus_cash = true` received | `BonusCashModal` mounts with entry animation (`reward-modal-entry`, 400ms). `AmbientBackground` transitions from `plasma` confetti variant to `gold-lime` variant (crossfade 500ms). Amount count-up animation starts 300ms after modal entry begins (0 → reward amount, 800ms). |
| IR-R02 | User taps "Khám phá danh mục →" in `BonusCashModal` | Modal exits with scale 1.0→0.9 + opacity 1→0 (250ms ease-in). Navigation: push Portfolio tab with `RewardSection` scrolled into view and highlighted (lime border pulse ×2, 400ms each). |
| IR-R03 | User taps "Tiếp tục học" in `BonusCashModal` | Modal exits with same exit animation as IR-R02 (250ms). Navigation: push next module screen (the module that was just unlocked). `BonusCashModal` is added to a `shown` dismissal set: never shown again for same `ledger_id`. |
| IR-R04 | Android system back while `BonusCashModal` is visible | `BonusCashModal` does NOT dismiss. Haptic: `impactLight`. No navigation. User must tap one of the two CTAs. |
| IR-R05 | User taps `RewardSection` card on Portfolio Dashboard | Navigate to `LearningRewardDetailScreen` with standard push transition (slide left, 300ms). |
| IR-R06 | `TTLCountdown` reaches 0 for a reward with open positions | `RewardSection` sub-row transitions to LIQUIDATING state: background `gold-10`, text "Vốn thưởng đã hết hạn — đang thanh lý...", `SkeletonLoader` pulse appears. Sub-row is no longer tappable. Section title chevron hidden. |
| IR-R07 | `TTLCountdown` reaches 0 for a reward with no open positions | `RewardSection` sub-row fades out (opacity 1→0, 400ms). If no remaining active rewards, section card collapses (height animate to 0, 300ms). |
| IR-R08 | Force-liquidation API event received (server push/websocket) | 1) `RewardSection` LIQUIDATING row updates to show liquidation complete. 2) Row fades out (400ms). 3) In-app `Snackbar` appears at bottom: "Tất toán hoàn tất — [Y VND] đã chuyển vào số dư chính." Duration 4s. 4) `Snackbar` has inline "Xem →" link navigating to `LearningRewardDetailScreen`. |
| IR-R09 | Reward TTL crosses below 24h while Portfolio tab is active | `ExpiryBanner` slides down from top (300ms, `expiry-banner-slide`). Portfolio scroll content shifts down by 48px (layout reflow). |
| IR-R10 | Reward TTL crosses below 24h while Portfolio tab is NOT active | On next Portfolio tab focus: `ExpiryBanner` is already rendered (no animation, immediate). If multiple rewards < 24h, show soonest-expiring. |
| IR-R11 | Reward TTL crosses below 1h | 1) `ExpiryBanner` border transitions from `gold` to `negative` (300ms). 2) Background tint transitions from `gold-10` to negative 10% (300ms). 3) Haptic: `impactMedium`. 4) System local notification scheduled for T-0 (in case user is in-app). |
| IR-R12 | User taps "Dùng ngay →" in `ExpiryBanner` | Navigate to Portfolio tab → PlaceOrderBottomSheet opens with focus on the stock most recently traded by user (or first position in portfolio). `ExpiryBanner` remains visible behind bottom sheet. |
| IR-R13 | User opens `PlaceOrderBottomSheet` with ≥1 active reward balance | Reward row rendered below "Tiền khả dụng" row. "Tổng sức mua" row reflects sum of available cash + all active reward balances. Helper text "Tiền thưởng được dùng trước, sau đó tiền chính." shown 8px above order button. |
| IR-R14 | User places order; order value ≤ reward remaining balance | Deducted entirely from reward ledger. Reward remaining balance decrements. Progress bar in `RewardSection` updates on next poll/push. No deduction from main cash balance. |
| IR-R15 | User places order; order value > reward remaining balance | Reward remaining balance fully consumed (decremented to 0). Difference deducted from main cash balance. Both balances update in `RewardSection` and "Tiền khả dụng" rows respectively. |
| IR-R16 | App receives push notification (T-24h or T-1h) while backgrounded | Standard iOS/Android notification displayed. No in-app UI change until app foregrounded. |
| IR-R17 | User taps T-24h push notification | App opens (or foregrounds) and deep-links to `LearningRewardDetailScreen`. If Portfolio tab is not active, tab bar switches to Portfolio. `ExpiryBanner` already visible if TTL < 24h. |
| IR-R18 | `LearningRewardDetailScreen` opened | `TTLCountdown` on all active rewards begins ticking immediately. Screen header does not have a floating action button — back chevron only. Pull-to-refresh reloads all reward data. |
| IR-R19 | Pull-to-refresh on `LearningRewardDetailScreen` | Show standard RefreshControl indicator (lime tint). Re-fetch `/bonus_cash_ledger` for user. History section also refreshes. Animate in any new/updated rows. |
| IR-R20 | `RewardSection` polling interval | Client polls `/bonus_cash_ledger` every 60 seconds while Portfolio tab is active (background tab: no polling). On result: update amounts, TTL remaining, status. Do NOT re-render entire section — diff and update changed rows only. |

---

## 8. State Matrix

### Screen 1: BonusCashModal

| State | Visual | Entry condition |
|-------|--------|-----------------|
| Default | Gold-lime ambient orbs, gift icon, reward text, TTL badge, two CTAs | Server sends `bonus_cash_awarded` event with valid reward data |
| Loading (delayed modal open) | Same as default but primary CTA shows activity spinner (24px, lime, replacing label text) | MKC pass event received but server has not yet confirmed bonus_cash record (< 3s wait before modal render) |
| Error | Primary CTA shows "Thử lại" with error icon; body text: "Không thể tải thông tin thưởng. Vui lòng thử lại." | Server error on `/bonus_cash_ledger` fetch |

---

### Screen 2: RewardSection (Portfolio Dashboard)

| State | Visual |
|-------|--------|
| Default (active, ≥2 days) | Lime-tinted card, amount in lime, fog TTL text, lime progress bar |
| Warning T-24h | Gold border, TTL text turns gold, ⏱ icon preceding countdown |
| Warning T-1h | Negative (red) border with pulse animation (`reward-pulse-border`), TTL text red bold, ⚠ icon |
| Liquidating | Gold-10 background, skeleton pulse, "đang thanh lý..." text, non-interactive |
| Post-liquidation / T+0 | Sub-row fades out; if last reward, entire section collapses |
| Empty (no active rewards) | Section entirely unmounted — renders null |
| Loading (initial portfolio load) | `SkeletonLoader` block in place of section content: 2 rows, each 72px |

---

### Screen 3: LearningRewardDetailScreen

| State | Visual |
|-------|--------|
| Default (active rewards + history) | Two section groups; active rewards with live TTL; history with muted styling |
| Active rewards only (no history) | Single "ĐANG HOẠT ĐỘNG" section; history section omitted |
| History only (no active rewards) | Single "LỊCH SỬ" section; "ĐANG HOẠT ĐỘNG" section replaced by info card "Không có vốn thưởng đang hoạt động" |
| Empty (no rewards ever) | Single center-aligned empty state: 🎓 icon 48px fog, "Chưa có vốn thưởng nào" Manrope 15 fog, sub-text "Hoàn thành bài kiểm tra Module để nhận thưởng." Manrope 13 fog |
| Loading | `SkeletonLoader` for 2 active rows and 1 history row, each matching row heights |
| Active reward T-1h | `RewardDetailRow` active variant shows red border, red TTL text, status badge changes to "SẮP HẾT HẠN" in negative color |
| Liquidating | Active row shows LIQUIDATING state (gold tint, skeleton pulse, "Đang tất toán..." status badge) |

---

### Screen 4: ExpiryBanner + Push Notifications

| State | Visual | Condition |
|-------|--------|-----------|
| Hidden | Not rendered | All rewards TTL ≥ 24h |
| T-24h banner | Gold border/bg, gold text, live TTL countdown | Any reward TTL crosses 24h threshold |
| T-1h banner | Negative (red) border/bg, red text, red ⚠ icon | Any reward TTL crosses 1h threshold |
| Multiple rewards | Shows only soonest-expiring reward | ≥2 rewards both < 24h |
| Post-liquidation | Banner dismissed (section collapsed/removed) | Last expiring reward liquidated |

---

### Screen 5: Force-Liquidation Trade History Entry

| State | Visual | Condition |
|-------|--------|-----------|
| Pending | Not yet in history list | Liquidation job not yet run |
| Completed | Trade row with [Tất toán thưởng] amber badge | Liquidation completed |
| Positive P&L | "Thu hồi" amount in `positive` (#10B981) | Positions had unrealized gain at liquidation |
| Negative P&L | "Thu hồi" amount in `negative` (#EF4444), with − prefix | Positions had unrealized loss at liquidation |
| Zero proceeds | "Thu hồi: 0 VND" in fog | All positions at break-even at liquidation |

---

### Screen 6: PlaceOrderBottomSheet Reward Row

| State | Visual | Condition |
|-------|--------|-----------|
| No active rewards | Reward row not rendered | User has no active bonus balance |
| Active reward (≥ 2 days) | Lime row, "N ngày" plasma pill | Active reward with TTL ≥ 2 days |
| Active reward (< 24h) | Lime row, "< 24h" pill in negative color | Active reward in warning window |
| Multiple active rewards | Row shows aggregate total of all reward balances; "⏱ [N] thưởng" pill indicating count | ≥2 active rewards |
| Reward fully consumed | Row hidden; buying power reverts to main cash only | Remaining reward balance = 0 |
| Order placed | Row balance decrements immediately (optimistic UI); reverts if order fails | Order submission with reward funds |

---

## 9. Copy Strings

All user-facing strings in Vietnamese. Keys for engineering reference.

### BonusCashModal

| Key | Vietnamese string |
|-----|-------------------|
| `bonus_modal.headline` | Bạn nhận được vốn thưởng học tập! |
| `bonus_modal.subheadline.m2` | Hoàn thành Module 2: +50,000,000 VND |
| `bonus_modal.subheadline.m3` | Hoàn thành Module 3: +25,000,000 VND |
| `bonus_modal.subheadline.m4` | Hoàn thành Module 4: +25,000,000 VND |
| `bonus_modal.subheadline.template` | Hoàn thành {moduleName}: +{amount} VND |
| `bonus_modal.body` | Vốn thưởng có hiệu lực trong 7 ngày. Dùng để thực hành giao dịch ngay! |
| `bonus_modal.ttl_badge` | ⏱ Hết hạn sau 7 ngày |
| `bonus_modal.cta_primary` | Khám phá danh mục → |
| `bonus_modal.cta_secondary` | Tiếp tục học |
| `bonus_modal.loading_cta` | (spinner — no text) |
| `bonus_modal.error_body` | Không thể tải thông tin thưởng. Vui lòng thử lại. |
| `bonus_modal.error_cta` | Thử lại |

### RewardSection (Portfolio Dashboard)

| Key | Vietnamese string |
|-----|-------------------|
| `reward_section.title` | Tiền thưởng học tập |
| `reward_section.module_label.m2` | Module 2 |
| `reward_section.module_label.m3` | Module 3 |
| `reward_section.module_label.m4` | Module 4 |
| `reward_section.ttl_default` | Hết hạn sau {days} ngày {HH}:{MM}:{SS} |
| `reward_section.ttl_hours` | Hết hạn sau {HH}:{MM}:{SS} |
| `reward_section.ttl_warning_prefix` | ⚠ Hết hạn sau |
| `reward_section.progress_unused` | {pct}% chưa dùng |
| `reward_section.progress_used` | {pct}% đã dùng |
| `reward_section.liquidating` | Vốn thưởng đã hết hạn — đang thanh lý... |

### LearningRewardDetailScreen

| Key | Vietnamese string |
|-----|-------------------|
| `reward_detail.screen_title` | Tiền thưởng học tập |
| `reward_detail.section_active` | ĐANG HOẠT ĐỘNG |
| `reward_detail.section_history` | LỊCH SỬ |
| `reward_detail.field_original` | Số tiền gốc: |
| `reward_detail.field_remaining` | Còn lại: |
| `reward_detail.field_used` | Đã dùng: |
| `reward_detail.field_proceeds` | Thu hồi: |
| `reward_detail.field_liquidation_date` | Ngày tất toán: |
| `reward_detail.status_active` | ACTIVE |
| `reward_detail.status_expiring` | SẮP HẾT HẠN |
| `reward_detail.status_expired` | HẾT HẠN |
| `reward_detail.status_liquidated` | ĐÃ THANH LÝ |
| `reward_detail.status_liquidating` | ĐANG TẤT TOÁN |
| `reward_detail.info_tooltip` | Vốn thưởng là tiền ảo có thời hạn dùng để luyện tập. Sau 7 ngày, vốn không dùng sẽ được tất toán tự động. |
| `reward_detail.empty_title` | Chưa có vốn thưởng nào |
| `reward_detail.empty_body` | Hoàn thành bài kiểm tra Module để nhận thưởng. |
| `reward_detail.no_active` | Không có vốn thưởng đang hoạt động |
| `reward_detail.progress_unused` | {pct}% chưa dùng |

### ExpiryBanner

| Key | Vietnamese string |
|-----|-------------------|
| `expiry_banner.text` | Tiền thưởng học tập hết hạn sau |
| `expiry_banner.subtext` | {amount} VND còn lại |
| `expiry_banner.cta` | Dùng ngay → |

### Push Notifications

| Key | Title | Body |
|-----|-------|------|
| `notif.expiry_t24.title` | Vốn thưởng học tập sắp hết hạn | Bạn còn {amount} VND tiền thưởng. Hết hạn sau 24 giờ. Hãy dùng ngay! |
| `notif.expiry_t1h.title` | Còn 1 giờ! Tiền thưởng học tập hết hạn | Còn {amount} VND. Dùng ngay trước khi hết hạn! |
| `notif.liquidation_complete.title` | Tất toán vốn thưởng hoàn tất | {original_amount} VND vốn thưởng đã được tất toán. {proceeds} VND đã chuyển vào số dư chính của bạn. |

### In-App Snackbar (Force-Liquidation)

| Key | Vietnamese string |
|-----|-------------------|
| `snackbar.liquidation_complete` | Tất toán hoàn tất — {proceeds} VND đã chuyển vào số dư chính. |
| `snackbar.liquidation_view_link` | Xem → |

### PlaceOrderBottomSheet

| Key | Vietnamese string |
|-----|-------------------|
| `order.reward_row.label` | Tiền thưởng học tập |
| `order.reward_row.days_remaining` | ⏱ {N} ngày |
| `order.reward_row.hours_remaining` | ⏱ < 24h |
| `order.buying_power.total_label` | Tổng sức mua |
| `order.buying_power.composition` | ({cash} + tiền thưởng) |
| `order.deduction_order_hint` | Tiền thưởng được dùng trước, sau đó tiền chính. |

### Trade History

| Key | Vietnamese string |
|-----|-------------------|
| `trade_history.liquidation_badge` | Tất toán thưởng |
| `trade_history.liquidation_proceeds_label` | Thu hồi về số dư chính |

---

## 10. QA Test Cases

| # | Category | Scenario | Steps | Expected Result |
|---|----------|----------|-------|-----------------|
| QA-R01 | BonusCashModal trigger | Modal appears after M2 MKC pass | 1. Complete all M2 lessons. 2. Sit MKC. 3. Score ≥ 3/5. 4. Pass screen dismisses (3s auto or tap). | `BonusCashModal` appears with gold-lime ambient, gift icon, "+50,000,000 VND", "7 ngày" TTL badge. `bonus_cash_ledger` record created with `status = ACTIVE`. |
| QA-R02 | BonusCashModal module specificity | Correct amounts per module | 1. Pass M2 MKC → note modal amount. 2. Pass M3 MKC → note modal amount. 3. Pass M4 MKC → note modal amount. | M2 modal: "+50,000,000 VND". M3 modal: "+25,000,000 VND". M4 modal: "+25,000,000 VND". Each uses `bonus_modal.subheadline.template` with correct values. |
| QA-R03 | BonusCashModal back-button lock | Android back does not dismiss modal | 1. `BonusCashModal` is visible. 2. Press Android system back. | Modal remains visible. Haptic `impactLight` fires. No navigation. User must tap a CTA. |
| QA-R04 | BonusCashModal idempotency | Modal shown only once per reward | 1. Pass M2 MKC. 2. Modal appears. 3. Tap "Tiếp tục học". 4. Navigate back to Grow tab. 5. Navigate to Portfolio. | Modal does NOT re-appear. `ledger_id` logged in shown set. |
| QA-R05 | RewardSection visibility | Section hidden when no active rewards | 1. New user with no MKC passes. 2. Open Portfolio tab. | `RewardSection` is not rendered. No empty state card. Portfolio layout shows Section 1 directly above Section 2 (Available Cash). |
| QA-R06 | RewardSection multi-reward display | Multiple active rewards shown as sub-rows | 1. Complete M2 MKC (50M reward). 2. Complete M3 MKC within 7 days of M2 (25M reward). 3. Open Portfolio. | `RewardSection` shows two sub-rows. M2 row: "50,000,000 VND", correct TTL. M3 row: "25,000,000 VND", correct TTL. Section title shows 🎓 "Tiền thưởng học tập". |
| QA-R07 | TTLCountdown accuracy | Live countdown updates every second | 1. Open Portfolio tab with active reward. 2. Observe `TTLCountdown` for 5 seconds. | Timer decrements by 1 second each interval. Format matches spec (days + HH:MM:SS). No drift after 60 seconds (compare with system clock). |
| QA-R08 | TTLCountdown color transition | Color changes at 24h and 1h thresholds | 1. Active reward. 2. Advance system clock to T+6 days (reward TTL = 24h). 3. Observe text. 4. Advance to T+7 days − 1h. | At TTL = 24h: text turns gold (#F59E0B). At TTL = 1h: text turns negative (#EF4444), weight Bold, ⚠ icon appears. |
| QA-R09 | ExpiryBanner appearance | Banner slides in when TTL crosses 24h | 1. Active reward with TTL slightly above 24h. 2. Wait for TTL to cross 24h threshold (or advance clock). 3. Portfolio tab is active. | `ExpiryBanner` slides down from top (300ms animation). Portfolio scroll content shifts down 48px. Banner shows correct amount and live countdown. |
| QA-R10 | ExpiryBanner CTA navigation | "Dùng ngay →" opens order entry | 1. `ExpiryBanner` visible. 2. Tap "Dùng ngay →". | `PlaceOrderBottomSheet` opens. User's most-recently-traded stock (or first portfolio position) pre-selected. Reward row visible in order form. |
| QA-R11 | PlaceOrderBottomSheet reward row | Row appears when active reward exists | 1. Open any stock for trading. 2. Tap buy/sell to open `PlaceOrderBottomSheet`. 3. User has active reward balance. | Reward row renders below "Tiền khả dụng". Shows "Tiền thưởng học tập: X,XXX,XXX VND  [⏱ N ngày]". "Tổng sức mua" shows sum of cash + reward. |
| QA-R12 | Order deduction sequence | Reward balance deducted before main cash | 1. Active reward: 30,000,000 VND remaining. Main cash: 400,000,000 VND. 2. Place buy order for 20,000,000 VND. | After order fills: reward remaining = 10,000,000 VND. Main cash = 400,000,000 VND (unchanged). Verify via `/bonus_cash_ledger` and portfolio cash APIs. |
| QA-R13 | Order deduction — overflow to main | Order exceeds reward balance uses main cash | 1. Active reward: 10,000,000 VND. Main cash: 400,000,000 VND. 2. Place buy order for 25,000,000 VND. | After fill: reward remaining = 0 (fully consumed). Main cash = 385,000,000 VND (400M − 15M overflow). Both `RewardSection` and "Tiền khả dụng" update. |
| QA-R14 | Force-liquidation flow | T+7 liquidation runs on expired reward | 1. M2 reward active with 2 open positions. 2. Advance time to T+7 expiry. | Both positions force-liquidated at last market price. `RewardSection` shows LIQUIDATING state, then fades out. `Snackbar` appears: "Tất toán hoàn tất — {proceeds} VND đã chuyển vào số dư chính." |
| QA-R15 | Force-liquidation trade history | Trade history entries marked with amber badge | 1. Force-liquidation completes (QA-R14 setup). 2. Navigate to Trade History screen. | Each liquidated position appears as separate row. Each row has "[Tất toán thưởng]" amber badge (gold #F59E0B, bg rgba(245,158,11,0.15)). Proceeds shown as "Thu hồi" with correct P&L color. |
| QA-R16 | Push notification T-24h | Notification delivered at T-24h | 1. Active M2 reward. 2. Advance to T+6 days (24h before expiry). | Push notification received: title "Vốn thưởng học tập sắp hết hạn", body contains correct amount and "24 giờ". `notification_t24h_sent = true` on ledger record. No duplicate notification on subsequent app opens. |
| QA-R17 | Push notification T-1h | Notification delivered at T-1h | 1. Active M2 reward. 2. Advance to T+7 days − 1h. | Push notification received: title "Còn 1 giờ! Tiền thưởng học tập hết hạn", body contains correct amount. |
| QA-R18 | LearningRewardDetailScreen empty state | Empty state when no rewards ever issued | 1. New user (no MKC passes). 2. Directly navigate to `/portfolio/reward-detail`. | Screen shows 🎓 icon (48px fog), "Chưa có vốn thưởng nào" (Manrope 15 fog), "Hoàn thành bài kiểm tra Module để nhận thưởng." (Manrope 13 fog). No section headers. |
| QA-R19 | LearningRewardDetailScreen history | Expired rewards appear in history section | 1. Reward expires (naturally or via clock advance). 2. Open `LearningRewardDetailScreen`. | "ĐANG HOẠT ĐỘNG" section: empty (or hidden). "LỊCH SỬ" section: shows expired reward with module name, original amount, used amount, proceeds, liquidation date, [HẾT HẠN] or [ĐÃ THANH LÝ] badge. |
| QA-R20 | RewardSection loading skeleton | Skeleton shown during initial data fetch | 1. Open Portfolio tab with slow network (throttle to 3G). 2. Observe between tab open and data load. | `SkeletonLoader` renders in `RewardSection` slot with 2 row placeholders (each 72px h). No content flash. Skeleton replaced by actual data on API response. |
| QA-R21 | Main balance isolation | Reward balance does not contaminate main balance display | 1. M2 complete (50M reward awarded). 2. Check "Tổng giá trị danh mục" and "Tiền khả dụng" displays. | "Tiền khả dụng" does NOT increase by 50M. Reward shown ONLY in `RewardSection`. "Tổng giá trị danh mục" does NOT include unused reward balance in its calculation (reward is separate ledger). |
| QA-R22 | No reward shown outside learning path | VirtualFundsLabel mandatory on reward screens | 1. Open `LearningRewardDetailScreen`. 2. Check screen header area. | `VirtualFundsLabel` chip is always visible, per design system mandate for all virtual trading screens. Chip not dismissible. |

---

## Appendix A: Component Hierarchy

```
Portfolio Tab (PortfolioDashboard)
├── ExpiryBanner (conditional, sticky, z-index: above scroll)
├── ScrollView
│   ├── Section 1: TotalPortfolioValueCard
│   ├── Section 1.5: RewardSection (conditional, hidden if empty)
│   │   └── RewardSubRow × N (one per active reward)
│   │       └── TTLCountdown (compact=true)
│   ├── Section 2: AvailableCashCard
│   └── Section 3+: PositionList / ...
│
└── PlaceOrderBottomSheet (modal overlay)
    ├── OrderFormCard
    │   ├── AvailableCashRow
    │   ├── RewardBalanceRow (conditional, if active rewards)
    │   └── TotalBuyingPowerRow
    └── KineticButton (lime, "Đặt lệnh mua")

BonusCashModal (full-screen modal, mounted over navigation stack)
├── AmbientBackground (gold-lime variant)
├── GiftIconView (80×80px, lime tint)
├── HeadlineText (Space Grotesk 28 Bold, lime)
├── SubheadlineText (Space Grotesk 18 Medium, white)
├── BodyText (Manrope 14, fog)
├── TTLBadge (plasma pill)
├── KineticButton (lime) — "Khám phá danh mục →"
└── KineticButton (ghost) — "Tiếp tục học"

LearningRewardDetailScreen (full-screen, push navigation)
├── ScreenHeader (back chevron + title)
├── VirtualFundsLabel (chip, mandatory)
├── SectionHeader "ĐANG HOẠT ĐỘNG" (conditional)
├── RewardDetailRow × N (active variant)
│   └── TTLCountdown (compact=false, full format)
├── InfoTooltipCard (always shown)
├── SectionHeader "LỊCH SỬ" (conditional)
└── RewardDetailRow × M (history variant)
```

---

## Appendix B: Animation Timeline — BonusCashModal Entry

```
t=0ms      AmbientBackground begins crossfade from plasma→gold-lime (500ms)
t=0ms      Modal card enters: scale 0.85→1.0, opacity 0→1 (400ms spring)
t=300ms    Gift icon fades in: opacity 0→1 (250ms)
t=400ms    Headline slides up: translateY 8→0, opacity 0→1 (300ms ease-out)
t=500ms    Subheadline fades in: opacity 0→1 (250ms)
t=600ms    Body text fades in: opacity 0→1 (200ms)
t=700ms    Reward amount count-up begins: 0→50,000,000 (800ms ease-out cubic)
t=800ms    TTL badge scales in: scale 0.8→1.0 (200ms ease-out)
t=1000ms   Primary CTA button fades in + translates up: translateY 12→0, opacity 0→1 (250ms)
t=1150ms   Secondary CTA fades in: opacity 0→1 (200ms)
t=1500ms   Animation complete. All interactive. User can tap CTAs.
```

---

## Appendix C: Accessibility Notes

| Element | Requirement |
|---------|-------------|
| `TTLCountdown` | `aria-live="polite"` — announces value changes without interrupting focus. Update announcement rate: maximum once per 60 seconds (not every second tick) to avoid screen reader spam. |
| `BonusCashModal` | On mount: focus moves to modal container. `aria-modal="true"`. Background content marked `aria-hidden="true"`. |
| `ExpiryBanner` | `role="alert"` when it first appears (slides in). Subsequent TTL text updates use `aria-live="off"` (no repeated announcement). |
| `RewardSection` progress bar | `role="progressbar"`, `aria-valuenow={remainingPct}`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-label="Phần trăm vốn thưởng còn lại"` |
| Amount formatting | All VND amounts formatted with `Intl.NumberFormat('vi-VN')` for screen readers (spoken as "năm mươi triệu đồng" not raw digits). |
| Color-only states | TTL warning states use both color change AND icon/weight change (not color-only) to meet WCAG 1.4.1. |

---

*End of Design Specification — DESIGN-F0-LEARN-07 Virtual Capital Rewards for F0 Learning Path v1.0*
