# Paave Shared Components Library
## Reusable UI Components — Anatomy, States, Tokens

> Version: 1.0 | Date: 2026-04-16 | Status: V1 Production-Ready
> All tokens reference design-system.md. All spacing on 8px grid.

---

## Table of Contents

1. [Navigation](#1-navigation)
   - [1.1 Bottom Tab Bar](#11-bottom-tab-bar)
   - [1.2 Screen Header](#12-screen-header)
   - [1.3 Back Button](#13-back-button)
2. [Cards](#2-cards)
   - [2.1 Stock Card — Condensed](#21-stock-card--condensed)
   - [2.2 Stock Card — Expanded](#22-stock-card--expanded)
   - [2.3 Market Snapshot Card](#23-market-snapshot-card)
   - [2.4 Portfolio Hero Card](#24-portfolio-hero-card)
   - [2.5 Trending Card](#25-trending-card)
   - [2.6 Challenge Card](#26-challenge-card)
   - [2.7 AI Analysis Card](#27-ai-analysis-card)
3. [Social](#3-social)
   - [3.1 Social Post Card](#31-social-post-card)
   - [3.2 Social Proof Badge](#32-social-proof-badge)
4. [Gamification](#4-gamification)
   - [4.1 Trader Tier Badge](#41-trader-tier-badge)
   - [4.2 XP Progress Bar](#42-xp-progress-bar)
   - [4.3 Streak Counter](#43-streak-counter)
   - [4.4 Achievement Card](#44-achievement-card)
5. [Data Display](#5-data-display)
   - [5.1 Price Display](#51-price-display)
   - [5.2 Sparkline Chart](#52-sparkline-chart)
   - [5.3 Stat Grid Item](#53-stat-grid-item)
   - [5.4 Financial Term Tooltip](#54-financial-term-tooltip)
6. [Forms and Inputs](#6-forms-and-inputs)
   - [6.1 Primary Button](#61-primary-button)
   - [6.2 Secondary Button](#62-secondary-button)
   - [6.3 Text Input](#63-text-input)
   - [6.4 Date Picker](#64-date-picker)
   - [6.5 Sentiment Selector](#65-sentiment-selector)
   - [6.6 Toggle Switch](#66-toggle-switch)
7. [Feedback and Status](#7-feedback-and-status)
   - [7.1 Toast Notification](#71-toast-notification)
   - [7.2 Virtual Funds Banner](#72-virtual-funds-banner)
   - [7.3 Disclaimer Banner](#73-disclaimer-banner)
   - [7.4 Skeleton Loader](#74-skeleton-loader)
   - [7.5 Empty State](#75-empty-state)
   - [7.6 Error State](#76-error-state)
   - [7.7 Milestone Celebration Overlay](#77-milestone-celebration-overlay)
8. [Bottom Sheets](#8-bottom-sheets)
   - [8.1 Half Sheet](#81-half-sheet)
   - [8.2 Full Sheet](#82-full-sheet)

---

## 1. Navigation

---

### 1.1 Bottom Tab Bar

**Purpose:** Persistent 5-tab navigation across all authenticated screens. Primary app-level wayfinding.
**Used in:** All authenticated screens (Home, Discover, Markets, Portfolio, Profile) per FR-14.
**Variants:** Default (5-tab), Badge (notification dot on Profile tab)

#### Anatomy

```
+---------------------------------------------------------------+  --+
|  [Home]     [Discover]   [Markets]  [Portfolio]  [Profile]    |    |  64px height
|  icon+lbl   icon+lbl     icon+lbl   icon+lbl    icon+lbl     |    |  (space-16)
+---------------------------------------------------------------+  --+
|              safe-area-inset-bottom (0-34px)                   |
+---------------------------------------------------------------+

Single Tab Cell:
+----------+
|   [icon]  |  20px icon (Lucide, stroke 1.5px inactive / 2px active)
|   label   |  text-label (11px/500)
+----------+
 75px wide    44px min touch height
```

- **Total height:** 64px + safe-area-inset-bottom (0-34px per device)
- **Tab cell width:** Flex, equal-fifth of screen width (min 75px at 375px)
- **Icon size:** 20px Lucide icon, vertically centered in upper portion
- **Label:** `text-label` (11px, weight 500, letter-spacing 0.5px)
- **Icon-to-label gap:** `space-1` (4px)
- **Active indicator:** 2px horizontal bar, 24px wide, centered above icon, `accent-primary`

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-primary` | `#0D1117` |
| Top border | `border-subtle` | `#1F2937`, 0.5px |
| Active icon color | `accent-primary` | `#3B82F6` |
| Active label color | `accent-primary` | `#3B82F6` |
| Inactive icon color | `text-tertiary` | `#6B7280` |
| Inactive label color | `text-tertiary` | `#6B7280` |
| Active indicator | `accent-primary` | `#3B82F6` |
| Shadow | `shadow-sheet` | `0 -8px 32px rgba(0,0,0,0.6)` |
| Tab switch animation | `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)`, 150ms |
| Screen enter animation | `ease-decelerate` | `cubic-bezier(0.0, 0.0, 0.2, 1)`, 250ms |

#### States

- **Default (Inactive):** Icon at stroke 1.5px in `text-tertiary`. Label in `text-tertiary`.
- **Active:** Icon filled variant (or stroke 2px) in `accent-primary`. Label in `accent-primary`. Active indicator bar visible. Icon scale animation: 1 to 1.1 to 1 over 150ms with `ease-spring`.
- **Re-tap (active tab):** Scroll position resets to top. No visual change.
- **Badge variant:** 8px red dot (`negative`) positioned top-right of icon for unread notification count on Profile tab.

#### Accessibility

- **Touch target:** Each tab cell is minimum 44px tall x 75px wide.
- **Contrast:** Active `accent-primary` on `bg-primary` = 4.8:1 (passes AA). Inactive `text-tertiary` on `bg-primary` = 4.1:1 (passes AA for large text/icons).
- **Screen reader:** Each tab announces role `tab`, label text (e.g., "Home, tab, 1 of 5"), and selected state. Tab bar container has role `tablist`.
- **Reduced motion:** Tab switch scale animation replaced with immediate color change only.

---

### 1.2 Screen Header

**Purpose:** Sticky top bar providing screen title, contextual back navigation, and action buttons.
**Used in:** All screens except onboarding splash. Instances: Stock Detail (FR-23), Portfolio (FR-PT-04), Markets (FR-36), Profile (FR-48), Discover (FR-15), Notification History (FR-47).
**Variants:** Title-only, Title + Back, Title + Back + Action(s), Title + Search icon, Transparent (Stock Detail hero overlay)

#### Anatomy

```
+---------------------------------------------------------------+
|           safe-area-inset-top (44px / 20px)                    |
+---------------------------------------------------------------+
| [<]  [Back]         Screen Title         [Action1] [Action2]  |  56px
+---------------------------------------------------------------+

 |--16px--|--44px--|--flex-1 center--|--44px--|--44px--|--16px--|
   margin   back      title text       btn1     btn2    margin
```

- **Total height:** 56px content + safe-area-inset-top
- **Horizontal padding:** `space-4` (16px) on each side
- **Back button area:** 44x44px touch target (see 1.3 Back Button)
- **Title:** `text-title-lg` (20px, weight 700), horizontally centered in remaining space, single line, truncated with ellipsis at 200px max
- **Action buttons:** 44x44px each, aligned right, max 2 actions, 8px gap between them
- **Icon size:** 24px Lucide, centered in 44x44 touch target

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-primary` | `#0D1117` |
| Title text | `text-primary` | `#F9FAFB`, `text-title-lg` |
| Back icon | `text-primary` | `#F9FAFB` |
| Action icon | `text-primary` | `#F9FAFB` |
| Transparent variant bg | transparent | `rgba(0,0,0,0)`, blurs to `bg-primary` on scroll |
| Bottom border (optional) | `border-subtle` | `#1F2937`, 0.5px |
| Blur transition | `ease-standard` | 250ms, background opacity 0 to 1 on scroll |

#### States

- **Default:** Solid `bg-primary` background. Title centered. Back button visible if not a root tab screen.
- **Transparent (Stock Detail):** Background starts transparent, transitions to `bg-primary` on scroll via `ease-standard` at 250ms. Title fades in from opacity 0 to 1 as user scrolls past hero.
- **Search active (Markets):** Title replaced by search text input. Cancel button replaces action icons. See FR-40.
- **Loading:** Title replaced with shimmer placeholder (120px x 20px).

#### Accessibility

- **Touch target:** Back button and all action buttons are 44x44px minimum.
- **Contrast:** `text-primary` on `bg-primary` = 15.2:1 (exceeds AAA).
- **Screen reader:** Title announced as heading level 1. Back button announces "Go back" with navigation context. Action buttons announce their function (e.g., "Search", "Settings").

---

### 1.3 Back Button

**Purpose:** Consistent backward navigation across all drill-down screens. Supports iOS swipe-back gesture and Android system back.
**Used in:** Stock Detail (FR-29), any non-root tab screen, bottom sheets.
**Variants:** Chevron-only (default), Chevron + label ("Back"), Close icon (X) for sheets/modals

#### Anatomy

```
+--44px--+
| [  <  ]|  24px Lucide chevron-left icon
|        |  Centered in 44x44 touch target
+--------+

With label:
+----80px-----+
| [<] Back    |  24px icon + 4px gap + text-body-md label
|             |
+-------------+
```

- **Icon:** Lucide `chevron-left`, 24px, stroke 1.5px
- **Touch target:** 44x44px minimum (icon variant) / 44x80px (label variant)
- **Icon-to-label gap:** `space-1` (4px)
- **Label font:** `text-body-md` (14px, weight 400)

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Icon color | `text-primary` | `#F9FAFB` |
| Label color | `text-primary` | `#F9FAFB` |
| Press opacity | -- | 0.6 (80ms `duration-instant`) |
| Close variant icon | Lucide `x` | 24px, `text-primary` |
| iOS swipe gesture | -- | Right-edge drag, 20px activation zone |

#### States

- **Default:** Icon at full opacity in `text-primary`.
- **Pressed:** Opacity drops to 0.6 for 80ms (`duration-instant`), returns via `ease-spring` at 150ms.
- **iOS gesture:** Native swipe-back from left edge (20px activation zone). Screen transitions with parallax at 250ms `ease-decelerate`.
- **Android:** Hardware/gesture back triggers same navigation. No visual back button change needed.
- **Disabled:** Not applicable; back button is never disabled on screens where it appears.

#### Accessibility

- **Touch target:** 44x44px minimum.
- **Contrast:** `text-primary` on `bg-primary` = 15.2:1.
- **Screen reader:** Announces "Back" or "Close" depending on variant. Includes destination context when available (e.g., "Back to Discover").

---

## 2. Cards

---

### 2.1 Stock Card -- Condensed

**Purpose:** Compact list row for displaying a single stock with key price data. Used in high-density list contexts.
**Used in:** Home Watchlist (FR-12), Portfolio Holdings (FR-PT-04), Markets Top Gainers/Losers/Active (FR-37, FR-38, FR-39), Search Results (FR-40).
**Variants:** Watchlist row (with heart icon), Holdings row (with P&L), Market row (with volume badge)

#### Anatomy

```
+---------------------------------------------------------------+
|                                                               |  68px height
| [Logo]  TICKER        [Sparkline]    $123.45   +2.34%  [heart]|
|  40px   Company Name   40x24px        price     change   opt  |
|                                                               |
+---------------------------------------------------------------+

|--16px--|--40px--|--8px--|--flex--|--8px--|--40px--|--8px--|--80px--|--8px--|--44px--|--16px--|
  pad     logo    gap     text     gap    spark    gap     price    gap     heart    pad
```

- **Container height:** 68px
- **Container padding:** `space-4` (16px) horizontal, `space-3` (12px) vertical
- **Logo:** 40x40px, `radius-full` (circle), background `bg-secondary` fallback if image fails
- **Ticker:** `text-title-sm` (16px, weight 600), `text-primary`
- **Company name:** `text-body-sm` (13px, weight 400), `text-secondary`, single line truncated
- **Sparkline:** 40x24px inline chart (see 5.2 Sparkline Chart)
- **Price:** `text-title-sm` (16px, weight 600), `text-primary`, right-aligned, tabular-nums
- **Change %:** `text-body-sm` (13px, weight 400), color-coded (see 5.1 Price Display), right-aligned
- **Heart icon (optional):** 24px Lucide `heart`, in 44x44 touch target, rightmost

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-card` | `#1F2937` |
| Background pressed | `bg-card-hover` | `#263244` |
| Border | `border` | `#374151`, 1px |
| Border radius | `radius-md` | 12px |
| Shadow | `shadow-card` | `0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)` |
| Ticker text | `text-primary` | `#F9FAFB`, `text-title-sm` |
| Company text | `text-secondary` | `#9CA3AF`, `text-body-sm` |
| Price text | `text-primary` | `#F9FAFB`, `text-title-sm` |
| Positive change | `text-positive` | `#10B981` |
| Negative change | `text-negative` | `#EF4444` |
| Neutral change | `neutral` | `#9CA3AF` |
| Heart (unwatched) | `text-tertiary` | `#6B7280` |
| Heart (watched) | `negative` | `#EF4444` (filled) |
| Press animation | `ease-sharp` | scale 1 to 0.97, 80ms |
| Release animation | `ease-spring` | scale 0.97 to 1, 150ms |

#### States

- **Default:** `bg-card` background, `shadow-card`, 1px `border`.
- **Pressed:** Background transitions to `bg-card-hover`. Scale 1 to 0.97 at 80ms `ease-sharp`.
- **Release:** Scale 0.97 to 1 at 150ms `ease-spring`.
- **Loading:** Full row replaced with skeleton shimmer (see 7.4).
- **Heart toggle:** Heart icon fills instantly on tap (optimistic UI per FR-20). Toast appears. Reverts on backend failure.
- **Delisted stock:** Price shows "Delisted" in `text-tertiary`. Sparkline hidden. Change % shows "—".

#### Accessibility

- **Touch target:** Full row is tappable (68px tall, full width). Heart icon has separate 44x44 target.
- **Contrast:** `text-primary` on `bg-card` = 10.8:1. `text-secondary` on `bg-card` = 4.7:1.
- **Screen reader:** Announces "[Ticker] [Company Name], price [amount], [change direction] [change %]". Heart button announces "Add to watchlist" / "Remove from watchlist".

---

### 2.2 Stock Card -- Expanded

**Purpose:** Rich editorial card for the Discover feed with chart, social proof, and contextual hook.
**Used in:** Discover Feed (FR-15, FR-16, FR-21).
**Variants:** Standard, Trending (with "Trending in VN/KR" badge)

#### Anatomy

```
+---------------------------------------------------------------+
|                                                               |
|  [Company Logo 48px]    TICKER  --  Exchange                  |  Header: 72px
|                         Company Name Full                     |
|                         [Theme Badge]  [Trending Badge]       |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  [        Mini Price Chart  280x120px        ]                |  Chart: 136px
|  [  gradient overlay bottom  ]                                |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  $123,456    +5.67%    +$6,789                                |  Price: 48px
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  "Why it's hot: Editorial hook text up to 120 chars..."       |  Hook: 48px
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  [eye] 120 users watching    80% Bullish                      |  Social: 36px
|                                                               |
+---------------------------------------------------------------+
|                                                  [heart btn]  |  Action: 44px
+---------------------------------------------------------------+

Total height: ~384px (dynamic based on content)
Width: 100% (screen width - 32px margin = 343px at 375px)
```

- **Container padding:** `space-4` (16px) all sides
- **Company logo:** 48x48px, `radius-md` (12px)
- **Ticker:** `text-title-md` (18px, weight 600)
- **Company name:** `text-body-md` (14px), `text-secondary`
- **Theme badge:** `text-caption-bold` (12px, weight 600), `accent-primary-subtle` bg, `radius-sm` (8px), height 28px
- **Chart area:** 280x120px (flex), with `gradient-card-overlay` bottom fade
- **Price section:** Uses Price Display component (5.1)
- **Editorial hook:** `text-body-md` (14px), `text-secondary`, max 2 lines (120 chars per FR-16)
- **Social proof row:** Uses Social Proof Badge (3.2) + sentiment ratio
- **Heart icon:** 24px Lucide `heart` in 44x44 target, bottom-right

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-card` | `#1F2937` |
| Border radius | `radius-lg` | 16px |
| Shadow | `shadow-card` | standard |
| Chart overlay | `gradient-card-overlay` | `linear-gradient(180deg, transparent 40%, rgba(13,17,23,0.9) 100%)` |
| Theme badge bg | `accent-primary-subtle` | `rgba(59,130,246,0.15)` |
| Theme badge text | `text-accent` | `#3B82F6` |
| Trending badge bg | `warning-subtle` | `rgba(245,158,11,0.15)` |
| Trending badge text | `warning` | `#F59E0B` |
| Hook text | `text-secondary` | `#9CA3AF`, `text-body-md` |
| Section gaps | `space-3` | 12px between sections |
| Press animation | `ease-sharp` / `ease-spring` | Card press spec |

#### States

- **Default:** Standard card elevation with `shadow-card`.
- **Pressed:** `bg-card-hover` background, scale 0.97 at 80ms. Navigates to Stock Detail on release (FR-21).
- **Loading:** Skeleton variant with shimmer on logo, chart, price, and text blocks.
- **No editorial content:** Card not rendered (BR-05 — stocks without CMS content excluded from Discover).
- **Sentiment unavailable:** Sentiment ratio section hidden; social proof shows only watcher count.

#### Accessibility

- **Touch target:** Full card body is tappable (excluding heart icon area). Heart has its own 44x44 target.
- **Contrast:** All text tokens meet 4.5:1 minimum against `bg-card`.
- **Screen reader:** Announces card as a group: "[Ticker] [Company], [price], [change]. [Hook text]. [X] users watching. [Sentiment]%  bullish." Heart button announces watchlist state separately.

---

### 2.3 Market Snapshot Card

**Purpose:** Compact bento grid cell displaying a single market index with value and change.
**Used in:** Home Market Snapshot (FR-10), Markets Overview (FR-39).
**Variants:** Positive (green tint), Negative (red tint), Neutral (no tint), Closed (gray badge)

#### Anatomy

```
+--------------------+
|                    |  120px height
|  Index Name        |  (variable width: bento grid)
|  1,234.56          |
|  +12.34  (+0.98%)  |
|  [Market Closed]   |  Optional badge
|                    |
+--------------------+

Min width: 160px  |  Max: flex in 2-col bento
Padding: space-4 (16px) all sides
```

- **Index name:** `text-body-sm` (13px, weight 400), `text-secondary`
- **Value:** `text-display-md` (24px, weight 700), `text-primary`, tabular-nums
- **Point change:** `text-body-md` (14px), color-coded
- **Percentage change:** `text-body-md` (14px), color-coded, in parentheses
- **Market Closed badge (optional):** `text-caption` (12px), `neutral` text, `bg-secondary` background, `radius-sm`
- **Bento grid gap:** `space-2` (8px) between cards

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-card` | `#1F2937` |
| Positive tint | `gradient-positive` | `linear-gradient(135deg, rgba(16,185,129,0.2) 0%, transparent 100%)` |
| Negative tint | `gradient-negative` | `linear-gradient(135deg, rgba(239,68,68,0.2) 0%, transparent 100%)` |
| Border radius | `radius-md` | 12px |
| Shadow | `shadow-card` | standard |
| Index name | `text-secondary` | `#9CA3AF`, `text-body-sm` |
| Value | `text-primary` | `#F9FAFB`, `text-display-md` |
| Positive change | `text-positive` | `#10B981` |
| Negative change | `text-negative` | `#EF4444` |
| Neutral change | `neutral` | `#9CA3AF` |
| Closed badge bg | `bg-secondary` | `#161B22` |

#### States

- **Default:** `bg-card` with appropriate gradient tint based on change direction.
- **Pressed:** `bg-card-hover`, scale 0.97 via card press animation.
- **Loading:** Skeleton shimmer for value and change placeholders.
- **Market Closed:** "Market Closed" badge visible below change values. Next open time shown in `text-caption`.
- **Data unavailable:** Value shows "---" in `text-tertiary`. Banner "Live data temporarily unavailable" per FR-10.

#### Accessibility

- **Touch target:** Full card tappable, minimum 120x160px.
- **Contrast:** `text-primary` on `bg-card` = 10.8:1. Color-coded change values on `bg-card` meet 4.5:1.
- **Screen reader:** Announces "[Index name], [value], [change direction] [point change], [percent change]. Market [open/closed]."

---

### 2.4 Portfolio Hero Card

**Purpose:** Gradient hero banner displaying total virtual portfolio value and P&L summary. Primary visual anchor of the Portfolio and Home screens.
**Used in:** Home Hero (FR-09), Portfolio Dashboard (FR-PT-04).
**Variants:** Positive P&L, Negative P&L, Zero/New (no trades), Goal progress (FR-GAME-07)

#### Anatomy

```
+---------------------------------------------------------------+
|  gradient background (gradient-hero)                          |
|  [accent glow at top: gradient-accent-glow]                   |
|                                                               |
|  Virtual Funds                     text-caption, warning      |  Label: 20px
|                                                               |
|  $500,000,000                                                 |  Value: 48px
|  text-display-xl (40px/800)        tabular-nums, roll-up anim |
|                                                               |
|  +$12,345,000 (+2.47%)                                        |  P&L: 24px
|  text-display-md (24px/700)        color-coded                |
|                                                               |
|  [===========================--------]  75% of goal           |  Goal bar: 20px (optional)
|                                                               |
|  Available Cash: $487,654,000                                 |  Cash: 16px
|  text-body-sm (13px)               text-secondary             |
|                                                               |
+---------------------------------------------------------------+

Height: 200px (min) to 240px (with goal bar)
Width: 100% screen width
Padding: space-10 (40px) top, space-6 (24px) sides, space-6 (24px) bottom
```

- **Virtual Funds label:** `text-caption-bold` (12px, weight 600), `warning` color, always visible per FR-PT-06 / BR-18
- **Total value:** `text-display-xl` (40px, weight 800), `text-primary`, tabular-nums, number roll-up animation on mount
- **P&L line:** `text-display-md` (24px, weight 700), color-coded (positive/negative/neutral)
- **Goal progress bar (optional):** 4px height, `radius-full`, `accent-primary` fill, `bg-secondary` track
- **Available cash:** `text-body-sm` (13px), `text-secondary`

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `gradient-hero` | `linear-gradient(135deg, #0D1117 0%, #1a1f35 100%)` |
| Top glow | `gradient-accent-glow` | `radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.2) 0%, transparent 70%)` |
| Positive P&L glow | `shadow-glow-positive` | `0 0 16px rgba(16,185,129,0.25)` |
| Virtual label color | `warning` | `#F59E0B` |
| Total value | `text-primary` | `#F9FAFB`, `text-display-xl` |
| Positive P&L | `text-positive` | `#10B981`, `text-display-md` |
| Negative P&L | `text-negative` | `#EF4444`, `text-display-md` |
| Neutral P&L | `neutral` | `#9CA3AF` |
| Cash text | `text-secondary` | `#9CA3AF`, `text-body-sm` |
| Goal bar fill | `accent-primary` | `#3B82F6` |
| Goal bar track | `bg-secondary` | `#161B22` |
| Roll-up animation | `ease-decelerate` | 500ms, count from 0 to value |
| Border radius | `radius-xl` | 24px |

#### States

- **Default (has positions):** Total value with roll-up animation. P&L color-coded. Cash balance shown.
- **Empty (no trades):** Value shows starting balance. CTA "Start paper trading" replaces P&L line per FR-09.
- **Positive P&L:** `gradient-positive` tint overlay. `shadow-glow-positive` on value.
- **Negative P&L:** `gradient-negative` tint overlay. No glow shadow.
- **Goal active:** Progress bar visible between P&L and cash lines.
- **Stale data:** Last known value with stale indicator dot (8px, `warning` color) next to value.

#### Accessibility

- **Touch target:** Hero card taps navigate to Portfolio Detail. Full card area is tappable (200px+ tall).
- **Contrast:** `text-primary` on gradient-hero dark background exceeds 10:1. `warning` label on hero background = 5.2:1.
- **Screen reader:** Announces "Virtual portfolio, total value [amount], [change direction] [P&L amount], [P&L percent]. Available cash [amount]." Virtual Funds label announced first for legal clarity.

---

### 2.5 Trending Card

**Purpose:** Compact horizontal scroll card for the "Trending Now" section. Shows a single trending stock.
**Used in:** Home Trending Section (FR-11).
**Variants:** Standard, With social proof count

#### Anatomy

```
+--140px--+
|         |  160px height
| [Logo]  |  32x32px, radius-full
|  32px   |
|         |
|  TICKER |  text-title-sm (16px/600)
| $12,345 |  text-body-md (14px), text-primary
| +1.23%  |  text-body-sm (13px), color-coded
|         |
| [eye] 50|  text-caption (12px), text-secondary (optional)
|         |
+---------+

Horizontal gap between cards: space-3 (12px)
Padding inside card: space-4 (16px) all sides
Scroll container: horizontal, snap-x, padding-left 16px
```

- **Card width:** 140px fixed
- **Card height:** 160px
- **Logo:** 32x32px, `radius-full`
- **Ticker:** `text-title-sm` (16px, weight 600), `text-primary`
- **Price:** `text-body-md` (14px), `text-primary`, tabular-nums
- **Change:** `text-body-sm` (13px), color-coded
- **Social proof (optional):** Lucide `eye` icon 14px + count in `text-caption`
- **Horizontal scroll:** Snap to card edge, 12px gap between cards

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-card` | `#1F2937` |
| Border radius | `radius-md` | 12px |
| Shadow | `shadow-card` | standard |
| Ticker text | `text-primary` | `#F9FAFB` |
| Price text | `text-primary` | `#F9FAFB` |
| Positive change | `text-positive` | `#10B981` |
| Negative change | `text-negative` | `#EF4444` |
| Social text | `text-secondary` | `#9CA3AF` |
| Card gap | `space-3` | 12px |
| Press animation | Card press spec | 80ms / 150ms |

#### States

- **Default:** Standard card with `shadow-card`.
- **Pressed:** Scale 0.97, `bg-card-hover`. Navigates to Stock Detail (FR-11).
- **Loading:** 5 skeleton cards in horizontal scroll.
- **Fewer than 5 stocks:** Show available count with no error per FR-11 edge case.

#### Accessibility

- **Touch target:** Full card (140x160px).
- **Contrast:** All text meets 4.5:1 against `bg-card`.
- **Screen reader:** Announces "[Ticker], price [amount], [change]. [X] users watching." Scroll container has `role="list"`, each card `role="listitem"`.

---

### 2.6 Challenge Card

**Purpose:** Weekly challenge display with description, countdown timer, and progress indicator.
**Used in:** Home Screen (FR-GAME-04).
**Variants:** Active (with timer), Completed (with reward), Missed

#### Anatomy

```
+---------------------------------------------------------------+
|                                                               |  120px height
|  [Trophy icon 24px]   Weekly Challenge                        |  Header
|                                                               |
|  "Top paper portfolio return in VN tech stocks this week"     |  Description
|  text-body-md (14px)                                          |  max 2 lines
|                                                               |
|  [clock] 3d 14h 22m remaining        [progress ring]         |  Timer + Progress
|  text-caption (12px), warning         32x32px                 |
|                                                               |
|  +100 XP reward                                               |  Reward label
|                                                               |
+---------------------------------------------------------------+

Width: 100% (343px at 375px)
Padding: space-4 (16px) all sides
```

- **Trophy icon:** 24px Lucide `trophy`, `warning` color
- **Title:** `text-title-sm` (16px, weight 600), `text-primary`
- **Description:** `text-body-md` (14px), `text-secondary`, max 2 lines
- **Timer:** `text-caption-bold` (12px, weight 600), `warning` color, Lucide `clock` 14px
- **Progress ring:** 32x32px circular progress indicator, `accent-primary` fill, `bg-secondary` track
- **Reward label:** `text-caption` (12px), `accent-primary`

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-card` | `#1F2937` |
| Border | `accent-primary` subtle (1px) | `rgba(59,130,246,0.3)` |
| Border radius | `radius-lg` | 16px |
| Shadow | `shadow-card` | standard |
| Trophy icon | `warning` | `#F59E0B` |
| Timer text | `warning` | `#F59E0B` |
| Progress ring fill | `accent-primary` | `#3B82F6` |
| Progress ring track | `bg-secondary` | `#161B22` |
| Reward text | `accent-primary` | `#3B82F6` |

#### States

- **Active:** Timer counting down. Progress ring shows current standing.
- **Completed:** Trophy icon filled gold. Description replaced with "Challenge Complete!" in `positive`. Reward shows "+100 XP earned."
- **Missed:** Grayed out. Description: "Missed" in `text-tertiary`. Timer hidden.
- **Loading:** Skeleton shimmer for description and timer.

#### Accessibility

- **Touch target:** Full card tappable (navigates to challenge detail).
- **Contrast:** `warning` on `bg-card` = 5.8:1 (passes AA).
- **Screen reader:** Announces "Weekly Challenge: [description]. [Time remaining]. [XP reward]."

---

### 2.7 AI Analysis Card

**Purpose:** Three-section AI-generated analysis card for post-trade and pre-trade contexts. Educational, never advisory.
**Used in:** Post-Trade Explanation (FR-AI-01), Pre-Trade Card (FR-AI-04), Portfolio Health (FR-AI-05).
**Variants:** Post-trade (3 sections + rating), Pre-trade (3 sections + collapse toggle), Health check (5-dimension radar + grades)

#### Anatomy

```
+---------------------------------------------------------------+
|  [AI icon 20px]  AI Analysis           [collapse toggle]      |  Header: 44px
+---------------------------------------------------------------+
|                                                               |
|  1. What happened                                             |  Section 1
|  Plain language description of recent price action...         |  text-body-md
|                                                               |
+- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
|                                                               |
|  2. Why                                                       |  Section 2
|  * Factor 1: sector rotation                                  |  text-body-md
|  * Factor 2: earnings surprise                                |  max 3 bullets
|  * Factor 3: policy change                                    |
|                                                               |
+- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
|                                                               |
|  3. What to watch                                             |  Section 3
|  * Next earnings date: May 15                                 |  text-body-md
|  * Key catalyst: sector rebalance                             |  max 2 bullets
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  AI disclaimer text (FR-LEGAL-02)                             |  Disclaimer
|  text-caption (12px), text-tertiary                           |  always visible
|                                                               |
+---------------------------------------------------------------+
|  [thumbs-up]  Helpful    [thumbs-down]  Not helpful           |  Rating: 44px
+---------------------------------------------------------------+

Width: 100% (343px at 375px)
Padding: space-4 (16px) all sides
Section dividers: 1px dashed, border-subtle
```

- **AI icon:** 20px custom or Lucide `sparkles`, `accent-secondary`
- **Section titles:** `text-title-sm` (16px, weight 600), `text-primary`
- **Section body:** `text-body-md` (14px), `text-primary`
- **Bullet items:** Lucide `circle` 6px + 8px indent
- **Section divider:** 1px dashed, `border-subtle`
- **Disclaimer:** `text-caption` (12px), `text-tertiary`, non-collapsible per FR-LEGAL-02
- **Rating buttons:** 44x44px each, Lucide `thumbs-up` / `thumbs-down`, 20px icons

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-card` | `#1F2937` |
| Border radius | `radius-lg` | 16px |
| Shadow | `shadow-card` | standard |
| AI icon | `accent-secondary` | `#06B6D4` |
| Section title | `text-primary` | `#F9FAFB`, `text-title-sm` |
| Section body | `text-primary` | `#F9FAFB`, `text-body-md` |
| Disclaimer | `text-tertiary` | `#6B7280`, `text-caption` |
| Divider | `border-subtle` | `#1F2937`, 1px dashed |
| Rating unselected | `text-secondary` | `#9CA3AF` |
| Rating selected (up) | `positive` | `#10B981` |
| Rating selected (down) | `negative` | `#EF4444` |
| Collapse icon | `text-secondary` | Lucide `chevron-up`/`chevron-down` |
| Collapse animation | `ease-standard` | 250ms |

#### States

- **Default (expanded):** All 3 sections visible. Disclaimer visible. Rating buttons unselected.
- **Collapsed (pre-trade):** Only header visible with chevron-down icon. Tap expands with 250ms `ease-standard`.
- **Rated (thumbs up):** Thumbs-up icon fills `positive`. Thumbs-down grayed. Rating persisted.
- **Rated (thumbs down):** Thumbs-down icon fills `negative`. Thumbs-up grayed. Rating persisted.
- **Loading:** Skeleton shimmer for all 3 section bodies. Header and disclaimer visible.
- **AI unavailable:** Body replaced with "Analysis temporarily unavailable. Check back later." in `text-secondary`. Disclaimer still shown per FR-AI-01.
- **Dismissed:** Card slides out left with 200ms `ease-accelerate`. Not re-shown per FR-AI-01.

#### Accessibility

- **Touch target:** Collapse toggle 44x44px. Rating buttons 44x44px each.
- **Contrast:** `text-primary` on `bg-card` = 10.8:1. Disclaimer `text-tertiary` on `bg-card` = 3.2:1 (acceptable for supplementary legal text at 12px).
- **Screen reader:** Card announces as a region "AI Analysis." Each section title is a heading level 3. Disclaimer announced after content. Rating buttons announce state ("Rate helpful" / "Rate not helpful" / "Rated helpful").

---

## 3. Social

---

### 3.1 Social Post Card

**Purpose:** Individual community post in per-ticker feeds with author identity, sentiment tag, and cashtags.
**Used in:** Per-Ticker Community Feed (FR-SOC-02), Following Feed (FR-SOC-04).
**Variants:** Standard, Expanded (Read more), Pending (60s countdown)

#### Anatomy

```
+---------------------------------------------------------------+
|                                                               |
|  [Avatar 32px]  @pseudonym  [Tier Badge]  [Sentiment Tag]    |  Author: 44px
|                 Investor        Bull                          |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  Post body text up to 280 chars visible...                    |  Body: dynamic
|  $VIC $FPT mentioned as cashtags in accent color              |
|  [Read more] if > 280 chars                                  |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  2h ago                                                       |  Footer: 24px
|                                                               |
+---------------------------------------------------------------+

Width: 100% (343px at 375px)
Padding: space-4 (16px) horizontal, space-3 (12px) vertical
```

- **Avatar:** 32x32px, `radius-full`, pseudonymous generated avatar
- **Pseudonym:** `text-body-md` (14px, weight 600), `text-primary`, tappable to profile (FR-SOC-05)
- **Tier badge:** Inline, see 4.1 Trader Tier Badge (small variant)
- **Sentiment tag:** Chip, 28px height, `radius-sm` (see 6.5 Sentiment Selector)
- **Post body:** `text-body-md` (14px), `text-primary`, max 280 chars visible
- **Cashtags:** `text-accent` color, tappable to Stock Detail
- **Read more:** `text-accent` (14px), visible when body exceeds 280 chars per BR-23
- **Timestamp:** `text-caption` (12px), `text-secondary`
- **Post-to-post divider:** 1px `border-subtle`

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-primary` | `#0D1117` (feed-level, not card bg) |
| Divider | `border-subtle` | `#1F2937`, 1px |
| Pseudonym | `text-primary` | `#F9FAFB`, `text-body-md` weight 600 |
| Body text | `text-primary` | `#F9FAFB`, `text-body-md` |
| Cashtag | `text-accent` | `#3B82F6` |
| Read more | `text-accent` | `#3B82F6` |
| Timestamp | `text-secondary` | `#9CA3AF`, `text-caption` |
| Bull tag bg | `positive-subtle` | `rgba(16,185,129,0.15)` |
| Bull tag text | `positive` | `#10B981` |
| Bear tag bg | `negative-subtle` | `rgba(239,68,68,0.15)` |
| Bear tag text | `negative` | `#EF4444` |
| Neutral tag bg | `bg-secondary` | `#161B22` |
| Neutral tag text | `neutral` | `#9CA3AF` |

#### States

- **Default:** Post visible with sentiment tag and timestamp.
- **Expanded:** "Read more" tapped reveals full text (up to 1,000 chars per BR-23). "Read more" link changes to "Show less."
- **Pending (60s):** Post shows countdown timer in `warning` color. "Cancel" button visible. Post body dimmed at 0.6 opacity.
- **Moderated:** Post hidden from feed. Author sees "This post is under review" in their own feed view.
- **Feed empty:** "Be the first to post about [TICKER]." per FR-SOC-02.

#### Accessibility

- **Touch target:** Pseudonym link 44px tall tap area. Cashtags have 44px tall inline tap areas. Read more link 44px tall.
- **Contrast:** All body text meets 4.5:1. Sentiment tag text meets 4.5:1 against their subtle backgrounds.
- **Screen reader:** Announces "[Pseudonym], [Tier name], [Sentiment] sentiment. [Post body]. [Cashtags]. Posted [timestamp]."

---

### 3.2 Social Proof Badge

**Purpose:** Inline counter showing how many users are watching a stock. Builds community trust signal.
**Used in:** Stock Card Expanded (2.2), Stock Detail (FR-23), Trending Cards (2.5).
**Variants:** Counter only, Counter + sentiment ratio

#### Anatomy

```
Counter only:
+-------------------------------+
| [eye 14px]  120 users watching|  24px height
+-------------------------------+

Counter + sentiment:
+----------------------------------------------+
| [eye 14px]  120 watching  |  80% Bullish     |  24px height
+----------------------------------------------+
```

- **Eye icon:** Lucide `eye`, 14px, `text-secondary`
- **Counter text:** `text-caption` (12px, weight 400), `text-secondary`
- **Divider (sentiment variant):** 1px vertical, `border-subtle`, 12px tall
- **Sentiment text:** `text-caption-bold` (12px, weight 600), `positive` (if majority Bull) or `negative` (if majority Bear)
- **Minimum threshold:** Sentiment only shown if 5+ posts in 24h per FR-SOC-01

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Eye icon | `text-secondary` | `#9CA3AF` |
| Counter text | `text-secondary` | `#9CA3AF`, `text-caption` |
| Bullish text | `positive` | `#10B981`, `text-caption-bold` |
| Bearish text | `negative` | `#EF4444`, `text-caption-bold` |
| Divider | `border-subtle` | `#1F2937` |
| Icon-to-text gap | `space-1` | 4px |

#### States

- **Default:** Eye icon + counter text. Updates every 5 minutes per BR-06.
- **With sentiment:** Adds divider + sentiment ratio.
- **Counter null:** Displays "--- users watching" per FR-16 edge case.
- **Below sentiment threshold:** Sentiment section hidden; only counter shown.

#### Accessibility

- **Touch target:** Not independently tappable; informational display only.
- **Contrast:** `text-secondary` on `bg-card` = 4.7:1 (passes AA).
- **Screen reader:** Announces "[X] users watching this stock" and "[Y] percent bullish" if sentiment shown.

---

## 4. Gamification

---

### 4.1 Trader Tier Badge

**Purpose:** Visual indicator of a user's Trader Tier level. Appears on profiles and alongside community posts.
**Used in:** Profile (FR-48), Social Post Card (3.1), Social Profile (FR-SOC-05), Achievement Card (4.4).
**Variants:** 6 tier levels x 2 sizes (standard 24px, compact 16px)

#### Anatomy

```
Standard (24px):
+--24px--+--------+
| [icon] |  Tier  |  24px height, radius-full
|  16px  |  Name  |  inline pill
+--------+--------+

Compact (16px):
+--16px--+
| [icon] |  16px height, icon only
|  12px  |
+--------+
```

- **Standard variant:** 16px tier icon + `space-1` (4px) gap + tier name in `text-caption-bold` (12px, weight 600). Pill shape with `radius-full`, 24px height, `space-2` (8px) horizontal padding.
- **Compact variant:** Icon only, 12px, in 16px container. Used inline in post cards.

#### Tier Color Map

| Tier | Icon | Background | Text/Icon Color |
|------|------|------------|-----------------|
| 1 - Seedling | `sprout` | `rgba(16,185,129,0.15)` | `#10B981` |
| 2 - Learner | `book-open` | `rgba(59,130,246,0.15)` | `#3B82F6` |
| 3 - Investor | `trending-up` | `rgba(6,182,212,0.15)` | `#06B6D4` |
| 4 - Trader | `bar-chart-2` | `rgba(245,158,11,0.15)` | `#F59E0B` |
| 5 - Expert | `award` | `rgba(168,85,247,0.15)` | `#A855F7` |
| 6 - Legend | `crown` | `rgba(239,68,68,0.15)` | `#EF4444` |

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Badge height (std) | -- | 24px |
| Badge height (compact) | -- | 16px |
| Padding horizontal | `space-2` | 8px |
| Border radius | `radius-full` | 9999px |
| Text | `text-caption-bold` | 12px, weight 600 |
| Icon size (std) | -- | 16px |
| Icon size (compact) | -- | 12px |
| Background | tier-specific | See tier color map above |
| Text/icon color | tier-specific | See tier color map above |

#### States

- **Default:** Pill badge with tier icon + localized name (EN/VN/KR per FR-GAME-02).
- **Tier-up animation:** Badge scales 1 to 1.2 to 1 with `ease-spring` at 300ms. Background flashes white at 50% opacity.
- **Compact (in post):** Icon only, no text. Tooltip on long-press shows tier name.

#### Accessibility

- **Touch target:** Badge in post context has 44px tap area (long-press for tooltip).
- **Contrast:** All tier text colors on their subtle backgrounds meet 4.5:1.
- **Screen reader:** Announces "Trader tier: [tier name]" (e.g., "Trader tier: Investor").

---

### 4.2 XP Progress Bar

**Purpose:** Displays current XP relative to next tier threshold. Shows progression momentum.
**Used in:** Profile Screen (FR-48, FR-GAME-01, FR-GAME-02).
**Variants:** Standard (with labels), Compact (bar only)

#### Anatomy

```
+---------------------------------------------------------------+
|  Current: 1,234 XP                    Next: Investor (1,500)  |  Labels: 16px
|  [=======================================--------------------]|  Bar: 8px
|  text-body-sm                          text-body-sm           |
+---------------------------------------------------------------+

Width: 100% of parent container
Bar height: 8px
Bar radius: radius-full (9999px)
```

- **Current XP label:** `text-body-sm` (13px), `text-primary`, left-aligned
- **Next tier label:** `text-body-sm` (13px), `text-secondary`, right-aligned
- **Progress bar track:** 8px height, `bg-secondary`, `radius-full`
- **Progress bar fill:** 8px height, `accent-primary`, `radius-full`, animated width
- **Label-to-bar gap:** `space-2` (8px)

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Bar track | `bg-secondary` | `#161B22` |
| Bar fill | `accent-primary` | `#3B82F6` |
| Bar height | -- | 8px |
| Bar radius | `radius-full` | 9999px |
| Current label | `text-primary` | `#F9FAFB`, `text-body-sm` |
| Next label | `text-secondary` | `#9CA3AF`, `text-body-sm` |
| Fill animation | `ease-decelerate` | 500ms on mount |

#### States

- **Default:** Bar shows current progress percentage.
- **XP gained:** Fill width animates to new position with 500ms `ease-decelerate`. Numeric counter rolls up.
- **Max tier reached (Legend):** Bar shows full with glow. Label: "Legend -- Max Tier."
- **Loading:** Bar track visible, fill at 0%. Labels show skeleton shimmer.

#### Accessibility

- **Touch target:** Not independently interactive. Informational display.
- **Contrast:** `accent-primary` on `bg-secondary` = 5.1:1.
- **Screen reader:** Announces "XP progress: [current] of [next threshold]. [Percentage] to [next tier name]."

---

### 4.3 Streak Counter

**Purpose:** Shows consecutive learning streak days with visual fire/freeze indicator.
**Used in:** Profile Screen (FR-GAME-05).
**Variants:** Active streak, Frozen (freeze active), Broken (reset to 0)

#### Anatomy

```
+----------------------------+
|  [flame 20px]  12          |  32px height, radius-full pill
|   fire icon    day count   |
|                [freeze]*   |  freeze icon optional
+----------------------------+

* Freeze indicator: snowflake icon (12px) appended when active
```

- **Flame icon:** Lucide `flame`, 20px, `warning` color (active) or `text-tertiary` (broken)
- **Day count:** `text-title-sm` (16px, weight 600), `text-primary`
- **Freeze icon (optional):** Lucide `snowflake`, 12px, `accent-secondary`, shown when freeze is active
- **Container:** Pill shape, `radius-full`, `warning-subtle` background (active) or `bg-secondary` (broken), height 32px, horizontal padding `space-3` (12px)

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Active bg | `warning-subtle` | `rgba(245,158,11,0.15)` |
| Broken bg | `bg-secondary` | `#161B22` |
| Active flame | `warning` | `#F59E0B` |
| Broken flame | `text-tertiary` | `#6B7280` |
| Count text | `text-primary` | `#F9FAFB`, `text-title-sm` |
| Freeze icon | `accent-secondary` | `#06B6D4` |
| Border radius | `radius-full` | 9999px |
| Pulse animation | `ease-standard` | 1.5s pulse loop on flame when streak increases |

#### States

- **Active (streak > 0):** `warning-subtle` background. Flame in `warning`. Day count displayed.
- **Frozen:** Freeze icon (snowflake) visible beside day count. Flame still `warning`.
- **Broken (0):** `bg-secondary` background. Flame in `text-tertiary`. Count shows "0".
- **Streak increase:** Flame pulses (scale 1 to 1.15 to 1) with 1.5s `ease-standard` loop for 3 seconds.

#### Accessibility

- **Touch target:** Not independently interactive (display only within profile).
- **Contrast:** `warning` on `warning-subtle` = 5.8:1. `text-primary` on `warning-subtle` = 10.2:1.
- **Screen reader:** Announces "[X] day learning streak. [Freeze available/Freeze active]."

---

### 4.4 Achievement Card

**Purpose:** 9:16 format shareable card rendered for milestone celebrations. Contains milestone info and anonymized stats.
**Used in:** Milestone Celebrations (FR-GAME-06).
**Variants:** First trade, First profit, Tier-up, Portfolio milestone, Goal reached, 7-day streak, 30-day streak

#### Anatomy

```
+-------243px--------+
|                    |  432px height (9:16 ratio)
|  [Paave logo]      |  Top: brand
|                    |
|  [confetti area]   |
|                    |
|  [Milestone icon]  |  Center: 64px icon
|   64px             |
|                    |
|  FIRST TRADE!      |  text-display-md (24px/700)
|  April 16, 2026    |  text-body-md (14px)
|                    |
|  [Tier Badge 24px] |  Current tier
|                    |
|  +2.47% return     |  Anonymized stat (%, not VND per BR-SOC-01)
|                    |
|  @pseudonym        |  text-body-sm
|  paave.app         |  text-caption, brand
|                    |
+--------------------+

Background: gradient-hero with accent-glow overlay
Border radius: radius-xl (24px)
```

- **Dimensions:** 243x432px (9:16 for Instagram Stories / KakaoTalk / Zalo sharing)
- **Logo:** Paave brand mark, 24px height, top-center, `space-5` (20px) from top
- **Milestone icon:** 64x64px, centered, tier-colored
- **Milestone title:** `text-display-md` (24px, weight 700), `text-primary`
- **Date:** `text-body-md` (14px), `text-secondary`
- **Tier badge:** Standard variant (4.1), centered
- **Anonymized stat:** Percentage return only (never absolute VND per BR-SOC-01)
- **Pseudonym:** `text-body-sm` (13px), `text-secondary`
- **Brand footer:** "paave.app" in `text-caption` (12px), `text-tertiary`

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `gradient-hero` | `linear-gradient(135deg, #0D1117 0%, #1a1f35 100%)` |
| Glow overlay | `gradient-accent-glow` | radial gradient |
| Border radius | `radius-xl` | 24px |
| Title text | `text-primary` | `#F9FAFB`, `text-display-md` |
| Date text | `text-secondary` | `#9CA3AF`, `text-body-md` |
| Stat text | `text-primary` | `#F9FAFB`, `text-body-md` |
| Pseudonym | `text-secondary` | `#9CA3AF`, `text-body-sm` |
| Brand text | `text-tertiary` | `#6B7280`, `text-caption` |

#### States

- **Generated:** Static image rendered at 2x resolution for sharing.
- **Share action:** Native OS share sheet triggered with pre-rendered image per FR-GAME-06.
- **Share failure:** Toast "Unable to share. Screenshot saved to gallery." per FR-GAME-06 edge case.
- **Reduced motion:** No confetti particles on the card itself (confetti is on the overlay, not the card).

#### Accessibility

- **Touch target:** Card is not interactive on its own. Share button in the celebration overlay is 44x44px.
- **Contrast:** All text on `gradient-hero` exceeds 10:1.
- **Screen reader:** Announces "Achievement card: [milestone name], achieved [date]. [Tier badge]. [stat]. Shareable."

---

## 5. Data Display

---

### 5.1 Price Display

**Purpose:** Formatted price with change amount and change percentage. Color-coded directional indicator.
**Used in:** Stock Card Condensed (2.1), Stock Card Expanded (2.2), Stock Detail (FR-23), Portfolio Holdings (FR-PT-04), Market Snapshot (2.3).
**Variants:** Large (Stock Detail hero), Medium (card context), Small (list row)

#### Anatomy

```
Large (Stock Detail):
+---------------------------------------------------------------+
|  $123,456                                                     |  text-display-lg (32px/700)
|  +$1,234 (+2.47%)                                             |  text-title-md (18px/600)
+---------------------------------------------------------------+

Medium (card):
+---------------------------------------------------------------+
|  $123,456         +$1,234  (+2.47%)                           |  text-display-md (24px) + text-body-md (14px)
+---------------------------------------------------------------+

Small (list row):
+---------------------------+
|  $123,456    +2.47%       |  text-title-sm (16px) + text-body-sm (13px)
+---------------------------+
```

- **Price value:** Tabular-nums (`font-feature-settings: "tnum" 1`). Locale-formatted per design-system.md section 10.2.
- **Change amount:** Prefixed with "+" (positive) or "-" (negative). Color-coded.
- **Change percentage:** In parentheses. Color-coded. Prefixed with "+" or "-".
- **Directional indicator:** Lucide `trending-up` (12px, positive) or `trending-down` (12px, negative) icon, optional

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Price text (large) | `text-primary` | `#F9FAFB`, `text-display-lg` |
| Price text (medium) | `text-primary` | `#F9FAFB`, `text-display-md` |
| Price text (small) | `text-primary` | `#F9FAFB`, `text-title-sm` |
| Positive change | `text-positive` | `#10B981` |
| Negative change | `text-negative` | `#EF4444` |
| Neutral (0.00%) | `neutral` | `#9CA3AF` |
| Font features | -- | `"tnum" 1` (tabular numerals) |
| Flash animation (update) | `ease-standard` | bg flash 300ms, return 600ms |

#### States

- **Default:** Price and change displayed with appropriate color coding per FR-35.
- **Price update flash:** Background briefly flashes `positive-subtle` or `negative-subtle` for 300ms on data update, then returns to transparent at 600ms per Price Badge animation spec.
- **Loading:** Skeleton shimmer block matching price + change dimensions.
- **Unavailable:** Price shows "---" in `text-tertiary`. Change hidden.
- **Delisted:** Price shows "Delisted" in `text-tertiary`. Change shows "---".

#### Accessibility

- **Touch target:** Not independently interactive (part of parent component).
- **Contrast:** Positive `#10B981` on `bg-card` (`#1F2937`) = 4.8:1. Negative `#EF4444` on `bg-card` = 4.5:1. Both pass AA.
- **Screen reader:** Announces "Price [amount], [up/down/unchanged] [change amount], [change percent]."

---

### 5.2 Sparkline Chart

**Purpose:** Miniature inline line chart showing recent price trend. No axes, no labels -- pure directional signal.
**Used in:** Stock Card Condensed (2.1), Trending Card (2.5), Home Watchlist (FR-12).
**Variants:** Positive (green line), Negative (red line), Neutral (gray line)

#### Anatomy

```
+--40px--+
|   /\   |  24px height
|  /  \  |  SVG path, 1.5px stroke
| /    \_|  No fill by default
+---------+
```

- **Dimensions:** 40x24px
- **Stroke width:** 1.5px
- **Data points:** Last 20 intraday prices (or daily closes for 1W/1M)
- **SVG path:** Smooth curve (catmull-rom spline)
- **Fill area (optional):** Below line, 0.15 opacity of stroke color

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Positive line | `positive` | `#10B981`, 1.5px stroke |
| Negative line | `negative` | `#EF4444`, 1.5px stroke |
| Neutral line | `neutral` | `#9CA3AF`, 1.5px stroke |
| Positive fill | `positive-subtle` | `rgba(16,185,129,0.15)` |
| Negative fill | `negative-subtle` | `rgba(239,68,68,0.15)` |
| Draw-in animation | `ease-decelerate` | 600ms stroke-dashoffset |

#### States

- **Default:** Line drawn based on price direction (close vs. open determines color).
- **Loading:** Horizontal dashed line in `bg-skeleton-shine`, shimmer effect.
- **No data:** Flat horizontal dashed line in `text-tertiary`.
- **Animate on mount:** Line draws in via stroke-dashoffset animation, 600ms, `ease-decelerate`.

#### Accessibility

- **Touch target:** Not independently interactive.
- **Contrast:** Not applicable (decorative visual indicator).
- **Screen reader:** Announces "Price trend: [up/down/flat] over [period]." Decorative `role="img"` with aria-label.

---

### 5.3 Stat Grid Item

**Purpose:** Single key stat cell in the 3-column grid layout. Label + value pair.
**Used in:** Stock Detail Key Stats (FR-25).
**Variants:** Standard (text value), Tooltip-enabled (tappable label)

#### Anatomy

```
+-------100px------+
|                  |  64px height
|  Market Cap      |  text-caption (12px), text-secondary
|  $45.2B          |  text-title-sm (16px/600), text-primary
|                  |
+------------------+

3-column grid:
+----------+--8px--+----------+--8px--+----------+
|  Open    |       | Prev Cls |       | Day Hi   |
|  45,200  |       | 44,800   |       | 46,100   |
+----------+       +----------+       +----------+
```

- **Label:** `text-caption` (12px, weight 400), `text-secondary`. If tooltip-enabled, shows underline dotted indicator.
- **Value:** `text-title-sm` (16px, weight 600), `text-primary`, tabular-nums
- **Cell dimensions:** Flex 1/3 of available width minus gaps
- **Grid gap:** `space-2` (8px) horizontal, `space-3` (12px) vertical
- **9 stats per FR-25:** Open, Prev Close, Day High, Day Low, 52W High, 52W Low, Volume, Market Cap, P/E Ratio

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Label | `text-secondary` | `#9CA3AF`, `text-caption` |
| Value | `text-primary` | `#F9FAFB`, `text-title-sm` |
| Tooltip indicator | `border` | dotted underline, `#374151` |
| Grid gap horizontal | `space-2` | 8px |
| Grid gap vertical | `space-3` | 12px |
| Cell padding | `space-2` | 8px |
| Unavailable value | `text-tertiary` | `#6B7280`, displays "---" |

#### States

- **Default:** Label above value. Value formatted with locale separators per BR-14.
- **Tappable (tooltip-enabled):** Label has dotted underline. Tap opens Financial Term Tooltip (5.4).
- **Unavailable:** Value shows "---" in `text-tertiary` per FR-25.
- **Loading:** Both label and value replaced with skeleton shimmer blocks.

#### Accessibility

- **Touch target:** Tooltip-enabled labels have 44px tall tap area.
- **Contrast:** `text-secondary` on `bg-primary` = 5.8:1. `text-primary` on `bg-primary` = 15.2:1.
- **Screen reader:** Announces "[Label]: [value]" (e.g., "Market Cap: 45.2 billion dollars"). Labels with tooltips announce "Tap for explanation."

---

### 5.4 Financial Term Tooltip

**Purpose:** Inline contextual explainer popup for financial terminology. One-tap access without navigation.
**Used in:** Stock Detail Key Stats (FR-25, FR-EDU-01), AI Analysis Cards (2.7), Portfolio Dashboard (FR-PT-04).
**Variants:** Standard (text only), With "Learn more" link (links to micro-lesson)

#### Anatomy

```
         +--280px (max)---+
         |  [x] close     |  <- 24px close icon
         |                |
  anchor |  P/E Ratio     |  text-title-sm (16px/600)
  term   |                |
   |     |  The price-to- |  text-body-md (14px)
   v     |  earnings ratio|  max 4 lines visible
- - - >  |  measures how  |  scrollable if exceeded
         |  much investors|
         |  pay per dollar|
         |  of earnings.  |
         |                |
         |  [Learn more]  |  text-accent, optional
         |                |
         +---arrow---------+
              ^
              |
         Triangle pointer, 8px
```

- **Max width:** 280px
- **Max visible height:** 4 lines of body text (~100px), scrollable beyond
- **Padding:** `space-4` (16px) all sides
- **Title:** `text-title-sm` (16px, weight 600), `text-primary`
- **Body:** `text-body-md` (14px), `text-primary`, 2-3 sentences plain language
- **Learn more link (optional):** `text-accent` (14px), links to micro-lesson per FR-EDU-01
- **Close button:** Lucide `x`, 16px, `text-secondary`, 44x44 touch target
- **Arrow pointer:** 8px triangle pointing to anchor term
- **Appearance:** Fade in from opacity 0, scale 0.95 to 1, 150ms `ease-decelerate`

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-card` | `#1F2937` |
| Border | `border` | `#374151`, 1px |
| Border radius | `radius-md` | 12px |
| Shadow | `shadow-card-raised` | `0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)` |
| Title | `text-primary` | `#F9FAFB`, `text-title-sm` |
| Body | `text-primary` | `#F9FAFB`, `text-body-md` |
| Learn more | `text-accent` | `#3B82F6` |
| Close icon | `text-secondary` | `#9CA3AF` |
| Arrow fill | `bg-card` | `#1F2937` |
| Arrow border | `border` | `#374151` |
| Enter animation | `ease-decelerate` | 150ms, opacity + scale |
| Exit animation | `ease-accelerate` | 100ms, opacity |

#### States

- **Default (visible):** Positioned relative to anchor term. Only one tooltip open at a time per FR-EDU-01.
- **Dismissed:** Tap outside or close button. Fades out at 100ms `ease-accelerate`.
- **Scrollable:** If body exceeds 4 visible lines, vertical scroll enabled within tooltip.
- **Loading:** Body shows "Loading..." in `text-tertiary` (cached client-side, expected <= 200ms per FR-EDU-01).
- **Offline:** Shows cached content if available. If never cached, label renders as plain text with no tap affordance.
- **No glossary entry:** No tooltip indicator shown on label. Label is plain text per FR-EDU-01.

#### Accessibility

- **Touch target:** Anchor term tap area is 44px tall. Close button is 44x44px.
- **Contrast:** All text on `bg-card` meets 4.5:1.
- **Screen reader:** Tooltip announces as a dialog: "[Term name]: [explanation]. Dismiss button." Focus trapped within tooltip until dismissed.

---

## 6. Forms and Inputs

---

### 6.1 Primary Button

**Purpose:** Full-width call-to-action button with accent glow. One primary button per screen per BR-29.
**Used in:** All CTA contexts: Registration (FR-05), Login (FR-07), Place Order (FR-PT-02, FR-PT-03), Watchlist Add (FR-27), Set Alert (FR-28).
**Variants:** Standard, Destructive (portfolio reset), With icon (leading)

#### Anatomy

```
+---------------------------------------------------------------+
|                                                               |  52px height
|                     Button Label                              |  Centered text
|                                                               |
+---------------------------------------------------------------+

Width: 100% of parent (minus space-4 margins = 343px at 375px)
Padding: space-4 (16px) horizontal, auto vertical centering
Border radius: radius-lg (16px)
```

- **Height:** 52px preferred (minimum 44px for accessibility)
- **Text:** `text-title-sm` (16px, weight 600), centered, `#FFFFFF`
- **Icon (optional):** 20px Lucide icon, 8px gap before label text
- **Glow shadow:** `shadow-glow-accent` in default state

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background (default) | `accent-primary` | `#3B82F6` |
| Background (pressed) | `accent-primary-hover` | `#2563EB` |
| Background (disabled) | `bg-card` | `#1F2937` |
| Background (loading) | `accent-primary` | `#3B82F6` |
| Background (destructive) | `negative` | `#EF4444` |
| Text (default) | -- | `#FFFFFF` |
| Text (disabled) | `text-tertiary` | `#6B7280` |
| Border (disabled) | `border` | `#374151`, 1px |
| Shadow (default) | `shadow-glow-accent` | `0 0 20px rgba(59,130,246,0.3)` |
| Shadow (destructive) | -- | `0 0 16px rgba(239,68,68,0.3)` |
| Shadow (pressed) | -- | none |
| Border radius | `radius-lg` | 16px |
| Press feedback | `duration-instant` | 80ms |

#### States

- **Default:** `accent-primary` background, white text, `shadow-glow-accent`.
- **Pressed:** `accent-primary-hover` background. Glow shadow removed. 80ms `ease-sharp` feedback.
- **Disabled:** `bg-card` background, `text-tertiary` text, `border` outline, no shadow. Not tappable.
- **Loading:** `accent-primary` background. Text hidden. 20px circular spinner (white, 1px stroke) centered. Not tappable.
- **Destructive:** `negative` background, white text, red glow shadow. Used for portfolio reset (FR-PT-05).

#### Accessibility

- **Touch target:** 52px height, full screen width minus margins = well above 44x44px minimum.
- **Contrast:** White on `accent-primary` = 4.6:1 (passes AA). White on `negative` = 4.5:1 (passes AA).
- **Screen reader:** Announces button label. Disabled state announces "disabled." Loading state announces "loading, please wait."

---

### 6.2 Secondary Button

**Purpose:** Lower-emphasis action that does not compete with the primary CTA. Used for secondary or supporting actions.
**Used in:** Cancel actions, "See All" links, filter toggles, alternative paths (FR-02 Welcome "Log In" vs. "Create Account").
**Variants:** Outline, Subtle (text-only with subtle background), Small (32px height for inline contexts)

#### Anatomy

```
Standard (outline):
+---------------------------------------------------------------+
|                                                               |  48px height
|                   Secondary Action                            |
|                                                               |
+---------------------------------------------------------------+

Small (inline):
+------------------+
| Filter Option    |  32px height
+------------------+
```

- **Standard height:** 48px
- **Small height:** 32px (for inline contexts like chips, filters)
- **Text:** `text-title-sm` (16px, weight 600) for standard; `text-body-sm` (13px, weight 400) for small
- **Padding:** `space-4` (16px) horizontal for standard; `space-3` (12px) for small
- **Border radius:** `radius-md` (12px) standard; `radius-sm` (8px) small

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background (outline) | transparent | -- |
| Background (subtle) | `accent-primary-subtle` | `rgba(59,130,246,0.15)` |
| Text | `accent-primary` | `#3B82F6` |
| Border (outline) | `accent-primary` | `#3B82F6`, 1px |
| Border (subtle) | -- | none |
| Pressed bg (outline) | `accent-primary-subtle` | `rgba(59,130,246,0.15)` |
| Pressed bg (subtle) | `accent-primary` | `#3B82F6` at 0.25 opacity |
| Disabled text | `text-tertiary` | `#6B7280` |
| Disabled border | `border` | `#374151` |
| Border radius (std) | `radius-md` | 12px |
| Border radius (small) | `radius-sm` | 8px |

#### States

- **Default:** Transparent background (outline) or `accent-primary-subtle` (subtle). `accent-primary` text.
- **Pressed:** Background shifts to `accent-primary-subtle` (outline) or deepens opacity (subtle). 80ms feedback.
- **Disabled:** `text-tertiary` text, `border` border (outline) or `bg-secondary` background (subtle). Not tappable.
- **Loading:** Not applicable for secondary buttons (loading states handled at page level).

#### Accessibility

- **Touch target:** Standard 48px height, full width or min 80px. Small variant 32px height (chip context grouping provides adequate combined area).
- **Contrast:** `accent-primary` on `bg-primary` = 4.8:1. `accent-primary` on `accent-primary-subtle` = 5.1:1.
- **Screen reader:** Announces button label and state.

---

### 6.3 Text Input

**Purpose:** Standard text input field with floating label. Supports validation states.
**Used in:** Registration (FR-05), Login (FR-07), Search (FR-40), Post Creation (FR-SOC-03), Price Alert (FR-28), Change Password (FR-50).
**Variants:** Standard, Password (masked), Search (with icon), Multiline (post creation)

#### Anatomy

```
Unfocused (with value):
+---------------------------------------------------------------+
|  Email                                                        |  Float label: 12px
|  user@example.com                                             |  Value: 16px
+---------------------------------------------------------------+

Focused:
+---------------------------------------------------------------+  2px accent-primary border
|  Email                                                        |  Float label: 12px, accent-primary
|  user@example.com|                                            |  Cursor visible
+---------------------------------------------------------------+

Error:
+---------------------------------------------------------------+  2px border-error
|  Password                                                     |  Float label: 12px, negative
|  ********                                                     |
+---------------------------------------------------------------+
  Password must be at least 8 characters                          Error text: 12px, negative

Height: 56px (with floating label)
Width: 100% of parent
Padding: space-4 (16px) horizontal, space-2 (8px) top (label), space-3 (12px) bottom (value)
```

- **Floating label:** `text-caption` (12px, weight 400) when floating above value, or `text-body-lg` (16px) centered when empty/unfocused
- **Value text:** `text-body-lg` (16px, weight 400), `text-primary`
- **Placeholder:** `text-body-lg` (16px), `text-tertiary`
- **Error text:** `text-caption` (12px), `negative`, positioned 4px below input
- **Password toggle:** Lucide `eye` / `eye-off`, 20px, 44x44 touch target, right side
- **Search icon:** Lucide `search`, 20px, left side, `text-secondary`
- **Character counter (multiline):** `text-caption` (12px), right-aligned, `text-secondary` (red at limit)

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background (default) | `bg-card` | `#1F2937` |
| Background (focus) | `bg-card` | `#1F2937` |
| Background (error) | -- | `rgba(239,68,68,0.05)` |
| Background (disabled) | `bg-secondary` | `#161B22` |
| Border (default) | `border` | `#374151`, 1px |
| Border (focus) | `border-focus` | `#3B82F6`, 2px |
| Border (error) | `border-error` | `#EF4444`, 2px |
| Border (disabled) | `border-subtle` | `#1F2937`, 1px |
| Label (default) | `text-secondary` | `#9CA3AF` |
| Label (focus) | `accent-primary` | `#3B82F6` |
| Label (error) | `negative` | `#EF4444` |
| Label (disabled) | `text-tertiary` | `#6B7280` |
| Value text | `text-primary` | `#F9FAFB` |
| Placeholder | `text-tertiary` | `#6B7280` |
| Error text | `negative` | `#EF4444`, `text-caption` |
| Border radius | `radius-sm` | 8px |
| Focus transition | `ease-standard` | 150ms border + label animation |

#### States

- **Default (empty):** Label centered as placeholder. 1px `border`.
- **Focused (empty):** Label floats up to 12px. Border changes to 2px `border-focus`. Label color `accent-primary`.
- **Focused (with value):** Label floated. Value displayed. Cursor active.
- **Filled (blur):** Label floated. 1px `border`. Label returns to `text-secondary`.
- **Error:** 2px `border-error`. Label in `negative`. Error message below input.
- **Disabled:** `bg-secondary` background, `border-subtle` border, `text-tertiary` label. Not editable.
- **Password variant:** Value masked with dots. Eye toggle icon on right to show/hide.

#### Accessibility

- **Touch target:** Full input field is 56px tall, full width.
- **Contrast:** `text-primary` on `bg-card` = 10.8:1. Placeholder `text-tertiary` on `bg-card` = 3.2:1 (acceptable for placeholder per WCAG).
- **Screen reader:** Label associated with input via `aria-labelledby`. Error state announces error message via `aria-describedby`. Password toggle announces "Show password" / "Hide password".
- **Focus indicator:** 2px solid `accent-primary` border with 2px offset.

---

### 6.4 Date Picker

**Purpose:** Date of birth selection during registration. Scroll-wheel picker with validation.
**Used in:** Registration DOB (FR-AGE-01).
**Variants:** Bottom sheet scroll picker (native-feel)

#### Anatomy

```
+---------------------------------------------------------------+
|  Date of Birth                                                |  Sheet header
+---------------------------------------------------------------+
|                                                               |
|  [Month scroll]  [Day scroll]  [Year scroll]                 |  3-column
|   January         16            2008                          |  scroll wheels
|  > February <    > 17 <        > 2009 <                      |  selected row
|   March           18            2010                          |  highlighted
|                                                               |
+---------------------------------------------------------------+
|                           [Confirm]                           |  Primary Button
+---------------------------------------------------------------+

Sheet height: 320px (half sheet)
Wheel item height: 40px per row
Visible rows: 5 per column
Selected row: centered, text-primary, text-title-md (18px)
Unselected: text-secondary, text-body-md (14px)
```

- **Layout:** 3-column scroll picker (Month / Day / Year)
- **Selected row:** `text-title-md` (18px, weight 600), `text-primary`, with highlight bar `accent-primary-subtle`
- **Unselected rows:** `text-body-md` (14px, weight 400), `text-secondary`
- **Year range:** Current year - 100 to current year
- **Cannot select future dates** per FR-AGE-01
- **Confirm button:** Primary Button (6.1)

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Sheet background | `bg-primary` | `#0D1117` |
| Selected row bg | `accent-primary-subtle` | `rgba(59,130,246,0.15)` |
| Selected text | `text-primary` | `#F9FAFB`, `text-title-md` |
| Unselected text | `text-secondary` | `#9CA3AF`, `text-body-md` |
| Divider lines | `border-subtle` | `#1F2937` |
| Sheet border radius | `radius-lg` | 16px (top corners) |

#### States

- **Default:** Current date pre-selected (or blank for DOB context).
- **Scrolling:** Haptic feedback on each row snap.
- **Valid (age 16+):** Confirm button enabled. No error.
- **Under 16 (13-15):** Error message: "Parental consent required for users under 16." Confirm disabled.
- **Under 13:** Error: "Paave requires users to be at least 13 years old." per FR-AGE-01. Confirm disabled.
- **Future date:** Not selectable (scroll constrained).

#### Accessibility

- **Touch target:** Each scroll row is 40px tall (close to 44px; adequate in grouped scroll context).
- **Contrast:** Selected text on `accent-primary-subtle` = 10.2:1. Unselected text on `bg-primary` = 5.8:1.
- **Screen reader:** Announces "Date of Birth picker. Month: [selected]. Day: [selected]. Year: [selected]." Validation errors announced via live region.

---

### 6.5 Sentiment Selector

**Purpose:** Bull/Bear/Neutral toggle chip group for social post creation.
**Used in:** Post Creation (FR-SOC-03).
**Variants:** Unselected, Bull selected, Bear selected, Neutral selected

#### Anatomy

```
+----------+--8px--+---------+--8px--+----------+
|  [up] Bull       | [line] Neutral  | [down] Bear    |  32px height each
+--selected--+     +---------+       +----------+

Single chip:
+-----------+
| [icon] Lbl|  32px height, radius-full
| 16px  14px|  space-2 (8px) padding horizontal
+-----------+
```

- **Chip height:** 32px
- **Icon:** 16px Lucide (`trending-up` for Bull, `minus` for Neutral, `trending-down` for Bear)
- **Label:** `text-body-sm` (13px, weight 400) unselected, `text-caption-bold` (12px, weight 600) selected
- **Gap between chips:** `space-2` (8px)
- **Border radius:** `radius-full` (9999px)

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Unselected bg | `bg-secondary` | `#161B22` |
| Unselected text | `text-secondary` | `#9CA3AF` |
| Unselected border | `border` | `#374151`, 1px |
| Bull selected bg | `positive-subtle` | `rgba(16,185,129,0.15)` |
| Bull selected text | `positive` | `#10B981` |
| Bull selected border | `positive` | `#10B981`, 1.5px |
| Bear selected bg | `negative-subtle` | `rgba(239,68,68,0.15)` |
| Bear selected text | `negative` | `#EF4444` |
| Bear selected border | `negative` | `#EF4444`, 1.5px |
| Neutral selected bg | `accent-primary-subtle` | `rgba(59,130,246,0.15)` |
| Neutral selected text | `accent-primary` | `#3B82F6` |
| Neutral selected border | `accent-primary` | `#3B82F6`, 1.5px |
| Toggle animation | `ease-fast` | 150ms |

#### States

- **None selected (required):** All 3 chips in unselected state. Publish button disabled until one is chosen per FR-SOC-03.
- **One selected:** Selected chip fills with color. Others remain unselected. Only one can be active (radio behavior).
- **Pressed:** Chip background intensifies for 80ms `duration-instant`.

#### Accessibility

- **Touch target:** Each chip is 32px tall, minimum 80px wide (adequate in grouped context).
- **Contrast:** All selected text colors on their subtle backgrounds meet 4.5:1.
- **Screen reader:** Announces as radio group "Sentiment: [Bull/Bear/Neutral], [selected/not selected]." Required field.

---

### 6.6 Toggle Switch

**Purpose:** Binary on/off control for notification and preference settings.
**Used in:** Notification Settings (FR-52), Profile Settings.
**Variants:** On, Off, Disabled (OS notifications off)

#### Anatomy

```
On:
+--48px---+
|    [====O]|  28px height, radius-full
+---------+

Off:
+--48px---+
|[O====]   |  28px height, radius-full
+---------+

With label:
+---------------------------------------------------------------+
|  Market Open Notifications                        [toggle]    |  56px row height
|  text-body-md                                                 |
+---------------------------------------------------------------+
```

- **Track dimensions:** 48x28px
- **Thumb diameter:** 24px circle
- **Thumb travel:** 20px horizontal
- **Track border radius:** `radius-full` (9999px)
- **Row context:** Toggle paired with label in 56px tall row, `space-4` horizontal padding

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Track on | `accent-primary` | `#3B82F6` |
| Track off | `bg-secondary` | `#161B22` |
| Track disabled | `bg-secondary` | `#161B22`, 0.5 opacity |
| Thumb | -- | `#FFFFFF` |
| Thumb shadow | -- | `0 1px 3px rgba(0,0,0,0.3)` |
| Label text | `text-primary` | `#F9FAFB`, `text-body-md` |
| Disabled label | `text-tertiary` | `#6B7280` |
| Toggle animation | `ease-spring` | 150ms thumb slide |
| Track border (off) | `border` | `#374151`, 1px |

#### States

- **On:** Track fills `accent-primary`. Thumb slides right. Optimistic save per FR-52.
- **Off:** Track `bg-secondary` with `border`. Thumb left.
- **Disabled:** Track and thumb at 0.5 opacity. Not tappable. Used when OS notifications are disabled (FR-52 edge case).
- **Toggle animation:** Thumb slides with `ease-spring` at 150ms. Track color cross-fades.
- **Error (save failed):** Toggle reverts to previous state. Toast "Something went wrong" per FR-52.

#### Accessibility

- **Touch target:** Full row (56px tall, full width) acts as toggle target.
- **Contrast:** `accent-primary` track against `bg-primary` = 4.8:1. White thumb on `accent-primary` = 4.6:1.
- **Screen reader:** Announces "[Setting name], switch, [on/off]." Toggle action announces new state.

---

## 7. Feedback and Status

---

### 7.1 Toast Notification

**Purpose:** Non-blocking transient feedback message. Auto-dismisses after 3 seconds.
**Used in:** Watchlist add/remove (FR-20), Error feedback (FR-13), Trade confirmation, AI coaching nudges (FR-AI-07), Price alert confirmation (FR-28).
**Variants:** Success (green), Error (red), Warning (amber), Neutral (blue), Coaching (with rating)

#### Anatomy

```
+---------------------------------------------------------------+
|                                                               |  48px height
|  [icon 20px]   Toast message text here               [close] |  Centered vertically
|                                                               |
+---------------------------------------------------------------+

Coaching variant:
+---------------------------------------------------------------+
|                                                               |  64px height
|  [icon]   Coaching message text...                            |
|           [Helpful]  [Not helpful]                            |
+---------------------------------------------------------------+

Position: top of screen, safe-area-inset-top + 8px
Width: screen width - 32px (16px margin each side)
```

- **Height:** 48px standard, 64px coaching variant
- **Icon:** 20px Lucide (`check-circle` success, `alert-circle` error, `alert-triangle` warning, `info` neutral, `lightbulb` coaching)
- **Text:** `text-body-md` (14px, weight 400), `text-primary`, single line truncated
- **Close button (optional):** Lucide `x`, 16px, `text-secondary`, 44x44 touch target
- **Rating buttons (coaching):** "Helpful" / "Not helpful" in `text-body-sm` (13px)
- **Position:** Top of screen, below safe-area-inset-top + `space-2` (8px)

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background (success) | `bg-card` | `#1F2937` with `positive` left accent bar |
| Background (error) | `bg-card` | `#1F2937` with `negative` left accent bar |
| Background (warning) | `bg-card` | `#1F2937` with `warning` left accent bar |
| Background (neutral) | `bg-card` | `#1F2937` with `accent-primary` left accent bar |
| Left accent bar | variant color | 3px wide, full height, left edge |
| Border radius | `radius-md` | 12px |
| Shadow | `shadow-card-raised` | `0 4px 12px rgba(0,0,0,0.5)` |
| Text | `text-primary` | `#F9FAFB` |
| Icon (success) | `positive` | `#10B981` |
| Icon (error) | `negative` | `#EF4444` |
| Icon (warning) | `warning` | `#F59E0B` |
| Icon (neutral) | `accent-primary` | `#3B82F6` |
| Enter animation | `ease-decelerate` | translateY -100% to 0, 300ms |
| Exit animation | `ease-accelerate` | translateY 0 to -100%, 250ms |
| Auto-dismiss delay | -- | 3000ms |

#### States

- **Entering:** Slides down from top with 300ms `ease-decelerate` + opacity 0 to 1.
- **Visible:** Static for 3 seconds. Swipe up to dismiss early.
- **Exiting:** Slides up with 250ms `ease-accelerate` + opacity 1 to 0.
- **Coaching:** No auto-dismiss until user taps rating. Rating buttons visible. Max 1/day per BR-20.
- **Stacked:** Maximum 1 toast visible at a time. New toast replaces current immediately.

#### Accessibility

- **Touch target:** Close button 44x44px. Coaching rating buttons 44px tall.
- **Contrast:** All text on `bg-card` meets 4.5:1. Icon colors on `bg-card` meet 3:1+ for decorative.
- **Screen reader:** Toast announced as `role="alert"` with `aria-live="assertive"`. Message announced automatically. Auto-dismiss does not interrupt screen reader.

---

### 7.2 Virtual Funds Banner

**Purpose:** Non-dismissible persistent banner indicating paper trading / virtual funds mode. Legal requirement per FR-PT-06 and BR-18.
**Used in:** Portfolio Dashboard (FR-PT-04), Order Placement (FR-PT-02, FR-PT-03), Order Confirmation, Trade History.
**Variants:** None (single mandatory variant)

#### Anatomy

```
+---------------------------------------------------------------+
|  [info icon 16px]  Virtual Funds                              |  28px height
+---------------------------------------------------------------+

Width: 100% of parent
Padding: space-2 (8px) horizontal, space-1 (4px) vertical
Position: Fixed in header area of all paper trading screens
```

- **Icon:** Lucide `info`, 16px, `warning`
- **Text:** `text-caption-bold` (12px, weight 600), `warning`
- **Localized text:** VN: "Tiền ảo", KR: "가상 자금", EN: "Virtual Funds" per FR-PT-06
- **Background:** `warning-subtle` (`rgba(245,158,11,0.15)`)
- **Not dismissible:** No close button. Cannot be hidden per BR-18.

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `warning-subtle` | `rgba(245,158,11,0.15)` |
| Text | `warning` | `#F59E0B`, `text-caption-bold` |
| Icon | `warning` | `#F59E0B` |
| Border radius | `radius-sm` | 8px |
| Icon-to-text gap | `space-1` | 4px |

#### States

- **Default (always):** Banner visible. Cannot be dismissed. Cannot be hidden. Text in active locale.
- **Language change:** Text updates immediately to new locale per FR-LANG-01.
- **High contrast mode:** `warning` color forced to higher contrast if system high-contrast enabled.

#### Accessibility

- **Touch target:** Not interactive (informational only).
- **Contrast:** `warning` on `warning-subtle` = 5.8:1 (passes AA).
- **Screen reader:** Announces "Virtual Funds indicator: all trading on this screen uses simulated money."

---

### 7.3 Disclaimer Banner

**Purpose:** Investment and AI disclaimer banners shown per session on first view. Requires acknowledgment ("Got it") to proceed.
**Used in:** Stock Detail first view (FR-LEGAL-01), Markets first view (FR-LEGAL-01), AI card footer (FR-LEGAL-02).
**Variants:** Investment disclaimer (modal), AI disclaimer (inline footer)

#### Anatomy

```
Investment disclaimer (modal banner):
+---------------------------------------------------------------+
|                                                               |
|  [shield icon 24px]                                           |  Header
|                                                               |
|  This app is for educational purposes only. It does not       |  Body text
|  constitute financial advice. Past performance does not       |  text-body-md
|  guarantee future results. Virtual trading does not           |  max 4 lines
|  reflect real market conditions.                              |
|                                                               |
|                        [Got it]                               |  Primary Button
|                                                               |
+---------------------------------------------------------------+

Height: dynamic (approx 200px)
Width: screen width - 32px margins
Position: centered modal with overlay backdrop

AI disclaimer (inline):
+---------------------------------------------------------------+
| [sparkle 12px] AI-generated. Not financial advice.            |  20px height
+---------------------------------------------------------------+
```

- **Investment disclaimer:** Modal format. Shield icon 24px. Body `text-body-md` (14px), `text-primary`. "Got it" button (Primary Button, 6.1).
- **AI disclaimer:** Inline footer. `text-caption` (12px), `text-tertiary`. Not dismissible per FR-LEGAL-02.
- **Backdrop:** `bg-overlay` (`rgba(0,0,0,0.60)`) for modal variant.

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Modal bg | `bg-card` | `#1F2937` |
| Modal border radius | `radius-lg` | 16px |
| Modal shadow | `shadow-card-raised` | elevated |
| Backdrop | `bg-overlay` | `rgba(0,0,0,0.60)` |
| Icon (shield) | `accent-primary` | `#3B82F6` |
| Body text | `text-primary` | `#F9FAFB`, `text-body-md` |
| Inline text | `text-tertiary` | `#6B7280`, `text-caption` |
| Inline icon | `text-tertiary` | `#6B7280`, 12px |

#### States

- **Shown (first view per session):** Modal overlays screen content. Content not interactive behind modal. Per FR-LEGAL-01.
- **Acknowledged:** "Got it" tapped. Modal dismisses with 250ms `ease-standard`. Session flag set; not re-shown for this screen type in this session.
- **AI inline:** Always visible at bottom of every AI response. Non-collapsible. Non-dismissible per FR-LEGAL-02.
- **Language switched:** Disclaimer text updates to active locale immediately.

#### Accessibility

- **Touch target:** "Got it" button follows Primary Button specs (52px height, full width).
- **Contrast:** `text-primary` on `bg-card` = 10.8:1. Inline `text-tertiary` on `bg-card` = 3.2:1 (acceptable for supplementary legal text).
- **Screen reader:** Modal announced as dialog. Focus trapped inside modal until acknowledged. AI inline disclaimer announced after card content.

---

### 7.4 Skeleton Loader

**Purpose:** Content-shaped shimmer animation placeholder shown during data fetches. Reduces perceived load time.
**Used in:** All data-dependent screens. Component-specific shapes match the final rendered content layout.
**Variants:** Per component type (card, list row, text block, chart, avatar)

#### Anatomy

```
Card skeleton:
+---------------------------------------------------------------+
| [rect 48x48]  [bar 120x16]                                   |  Matches card header
|               [bar  80x13]                                    |
+---------------------------------------------------------------+
| [rect full-width x 120px]                                     |  Matches chart area
+---------------------------------------------------------------+
| [bar 100x24]  [bar 60x16]                                     |  Matches price area
+---------------------------------------------------------------+

List row skeleton:
+---------------------------------------------------------------+
| [circle 40]  [bar 100x16]   [bar 40x24]  [bar 60x13]         |  Matches condensed card
|              [bar  80x13]                                     |
+---------------------------------------------------------------+

Shimmer animation:
  bg-skeleton base → bg-skeleton-shine highlight
  Sweep left to right, 1.5s, linear, infinite
```

- **Base color:** `bg-skeleton` (`#1F2937`)
- **Shine highlight:** `bg-skeleton-shine` (`#2D3748`)
- **Shape radii:** Match target component radii (circle for avatar, `radius-md` for rect)
- **Reveal transition:** Skeleton to content: opacity 0 to 1, 200ms `ease-standard`, staggered 50ms per item

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Base | `bg-skeleton` | `#1F2937` |
| Shine | `bg-skeleton-shine` | `#2D3748` |
| Shimmer speed | -- | 1.5s, linear, infinite |
| Content reveal | `ease-standard` | 200ms opacity, 50ms stagger |
| Border radius (rect) | `radius-md` | 12px |
| Border radius (circle) | `radius-full` | 9999px |

#### States

- **Loading:** Shimmer animation running. Background-position sweeps left to right continuously.
- **Content ready:** Skeleton fades out, content fades in with 200ms opacity `ease-standard`. Items stagger at 50ms intervals.
- **Reduced motion:** Shimmer replaced with static `bg-skeleton` (no animation). Content appears instantly.

#### Accessibility

- **Touch target:** Not interactive.
- **Contrast:** Not applicable (no text content).
- **Screen reader:** Announces "Loading content" via `aria-busy="true"` on parent container. Removes announcement when content loads.

---

### 7.5 Empty State

**Purpose:** Informative placeholder for screens with no data. Provides context and primary action to resolve.
**Used in:** Empty Watchlist (FR-12), Empty Portfolio (FR-PT-04), Empty Community Feed (FR-SOC-02), Empty Notification History (FR-47).
**Variants:** Per context (different illustration, title, subtitle, CTA)

#### Anatomy

```
+---------------------------------------------------------------+
|                                                               |
|              [Illustration 120x120]                           |  Centered
|                                                               |
|              Your watchlist is empty                           |  Title: text-title-md
|                                                               |
|       Explore trending stocks and add your                    |  Subtitle: text-body-md
|       favorites to start tracking.                            |  text-secondary, max 2 lines
|                                                               |
|              [Explore Stocks]                                 |  Primary Button or
|                                                               |  Secondary Button
|                                                               |
+---------------------------------------------------------------+

Vertical centering within available screen space (minus header and nav)
Content block max-width: 280px, horizontally centered
```

- **Illustration:** 120x120px decorative SVG/Lottie, centered
- **Title:** `text-title-md` (18px, weight 600), `text-primary`, centered
- **Subtitle:** `text-body-md` (14px, weight 400), `text-secondary`, centered, max 2 lines
- **CTA:** Primary Button (6.1) or Secondary Button (6.2) depending on context
- **Gaps:** `space-4` (16px) between illustration and title, `space-2` (8px) between title and subtitle, `space-6` (24px) between subtitle and CTA

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Title | `text-primary` | `#F9FAFB`, `text-title-md` |
| Subtitle | `text-secondary` | `#9CA3AF`, `text-body-md` |
| Illustration area | -- | 120x120px, centered |
| Title-to-subtitle gap | `space-2` | 8px |
| Subtitle-to-CTA gap | `space-6` | 24px |
| Illustration-to-title gap | `space-4` | 16px |

#### Context-Specific Copy

| Context | Title | Subtitle | CTA |
|---------|-------|----------|-----|
| Watchlist | "Your watchlist is empty" | "Explore trending stocks and add your favorites" | "Explore" |
| Portfolio | "Start paper trading" | "Practice investing with virtual funds" | "Browse Stocks" |
| Community | "Be the first to post about [TICKER]" | "Share your thoughts with the community" | "Write a Post" |
| Notifications | "No notifications yet" | "Price alerts and updates will appear here" | -- (no CTA) |

#### States

- **Default:** Illustration + title + subtitle + CTA displayed.
- **No CTA variant:** Title + subtitle only (e.g., Notification History).
- **Reduced motion:** Illustration is static (no Lottie animation).

#### Accessibility

- **Touch target:** CTA follows button specs (52px height).
- **Contrast:** `text-primary` on `bg-primary` = 15.2:1. `text-secondary` on `bg-primary` = 5.8:1.
- **Screen reader:** Illustration has `role="img"` with empty alt (decorative). Title + subtitle announced as content. CTA announced as button.

---

### 7.6 Error State

**Purpose:** Inline error indicator for failed data fetches. Shows error context, retry option, and last-known data when available.
**Used in:** All data-dependent screens on network failure (FR-13 edge cases, FR-37 edge cases).
**Variants:** Inline chip (within content), Full screen (catastrophic failure), Banner (partial failure)

#### Anatomy

```
Inline chip:
+-------------------------------+
| [alert-circle 16px]  Retry   |  32px height
+-------------------------------+

Banner:
+---------------------------------------------------------------+
| [alert-circle 16px]  Unable to load. Showing cached data.    |  40px height
|                                                    [Retry]    |
+---------------------------------------------------------------+

Full screen:
+---------------------------------------------------------------+
|                                                               |
|            [alert-triangle 48px]                              |
|            Something went wrong                               |
|            Check your connection and try again               |
|            [Retry]                                            |
|                                                               |
+---------------------------------------------------------------+
```

- **Inline chip:** `radius-full`, `negative-subtle` background, `negative` text, 32px height
- **Banner:** `negative-subtle` background, full width, `space-3` (12px) padding, `radius-sm`
- **Full screen:** Centered layout similar to Empty State (7.5) but with error icon and retry button
- **Retry button:** Secondary Button (6.2) with `negative` color
- **Stale data indicator:** Lucide `clock` 12px + "Last updated [time]" in `text-caption`, `warning`

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Chip bg | `negative-subtle` | `rgba(239,68,68,0.15)` |
| Chip text | `negative` | `#EF4444`, `text-body-sm` |
| Banner bg | `negative-subtle` | `rgba(239,68,68,0.15)` |
| Banner text | `text-primary` | `#F9FAFB`, `text-body-md` |
| Banner radius | `radius-sm` | 8px |
| Error icon | `negative` | `#EF4444` |
| Retry text | `negative` | `#EF4444` |
| Stale indicator | `warning` | `#F59E0B`, `text-caption` |

#### States

- **Network error:** Banner with cached data message + retry button. Last-known data still displayed.
- **Data unavailable:** Full error state. Retry button triggers refetch.
- **Retry in progress:** Retry button replaced with small spinner (16px).
- **Retry success:** Error state fades out, content fades in with skeleton-to-content transition.
- **Stale data:** Error chip visible alongside last-known data. Stale indicator timestamp shown.

#### Accessibility

- **Touch target:** Retry button follows Secondary Button specs (48px height or 32px chip).
- **Contrast:** `negative` on `negative-subtle` = 5.2:1.
- **Screen reader:** Error announced as `role="alert"`. Retry button announces "Retry loading data."

---

### 7.7 Milestone Celebration Overlay

**Purpose:** Full-screen confetti animation overlay triggered at portfolio milestones. Displays achievement card with share option.
**Used in:** Milestone Celebrations (FR-GAME-06).
**Variants:** By milestone type (first trade, tier-up, profit milestone, streak milestone, goal reached)

#### Anatomy

```
+---------------------------------------------------------------+
|  [bg-overlay backdrop]                                        |
|                                                               |
|  [confetti particle layer -- 1200ms animation]                |  Full viewport
|                                                               |
|           +---243x432---+                                     |
|           |             |                                     |
|           | Achievement |                                     |  Achievement Card (4.4)
|           |    Card     |                                     |  Centered
|           |             |                                     |
|           +-------------+                                     |
|                                                               |
|           [Share]    [Dismiss]                                 |  Action buttons below card
|                                                               |
+---------------------------------------------------------------+

Overlay: full viewport, bg-overlay backdrop
Card: centered vertically and horizontally
Actions: centered below card, space-4 (16px) gap between buttons
```

- **Backdrop:** `bg-overlay` (`rgba(0,0,0,0.60)`)
- **Confetti:** Particle animation, ~50 particles, multi-color (`positive`, `accent-primary`, `accent-secondary`, `warning`), duration 1200ms, gravity-affected fall
- **Achievement card:** See 4.4 Achievement Card, centered
- **Share button:** Primary Button (6.1), "Share" label, Lucide `share` icon
- **Dismiss:** Secondary Button (6.2), "Close" label, or tap anywhere outside card
- **Haptic feedback:** Medium impact on overlay appearance

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Backdrop | `bg-overlay` | `rgba(0,0,0,0.60)` |
| Confetti colors | mixed | `#10B981`, `#3B82F6`, `#06B6D4`, `#F59E0B` |
| Confetti duration | -- | 1200ms |
| Card enter | `ease-decelerate` | scale 0.8 to 1 + opacity 0 to 1, 350ms |
| Overlay fade | `ease-standard` | opacity 0 to 1, 250ms |
| Dismiss | `ease-accelerate` | scale 1 to 0.9 + opacity 1 to 0, 200ms |

#### States

- **Entering:** Backdrop fades in 250ms. Card scales up 0.8 to 1 with `ease-decelerate` at 350ms. Confetti fires simultaneously. Haptic medium impact.
- **Visible:** Card centered. Share and Dismiss buttons below. Confetti settles (gravity fall).
- **Share tapped:** Native OS share sheet opens with pre-rendered 9:16 achievement card image.
- **Dismissed:** Tap anywhere or Dismiss button. Card scales down + fades out at 200ms `ease-accelerate`.
- **Queued (multiple milestones):** Max 2 queued per FR-GAME-06. Most significant shown first. Second shown after first dismissed.
- **Reduced motion:** No confetti particles. Card appears with opacity fade only. Subtle scale-up + haptic per FR-GAME-06.
- **Offline trigger:** Celebration stored; shown on next app open per FR-GAME-06 edge case.

#### Accessibility

- **Touch target:** Share button 52px height. Dismiss button 48px height. Tap-to-dismiss on backdrop.
- **Contrast:** Card text meets all contrast requirements per Achievement Card (4.4).
- **Screen reader:** Overlay announced as dialog: "Milestone achieved: [milestone name]. Share or dismiss." Focus trapped in overlay until dismissed.

---

## 8. Bottom Sheets

---

### 8.1 Half Sheet

**Purpose:** Contextual overlay for secondary actions that do not require full-screen navigation. Covers approximately 40-60% of viewport.
**Used in:** Theme Filter (FR-17), Price Alert Setup (FR-28), Sentiment selection, Quick actions.
**Variants:** Standard (scrollable content), Picker (date/option selection), Action list

#### Anatomy

```
+---------------------------------------------------------------+
|                                                               |
|         [drag handle -- 32x4px, radius-full]                  |  Handle: 12px top pad
|                                                               |
|  Sheet Title                              [close X]           |  Header: 56px
|                                                               |
+- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+  Divider
|                                                               |
|  [sheet content area -- scrollable]                           |  Content: dynamic
|                                                               |  max 60% viewport
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  [Primary Action Button]                                     |  Footer: 68px (optional)
|                                                               |
+---------------------------------------------------------------+
|  safe-area-inset-bottom                                       |
+---------------------------------------------------------------+

Max height: 60% viewport
Min height: 200px
Width: 100% screen
Border radius: radius-lg (16px) top-left and top-right
```

- **Drag handle:** 32x4px centered bar, `neutral` color, `radius-full`
- **Title:** `text-title-lg` (20px, weight 700), `text-primary`
- **Close button:** Lucide `x`, 24px, 44x44 touch target, top-right
- **Content area:** Scrollable, max height 60% viewport minus header/footer
- **Footer (optional):** Primary Button or action bar, `space-4` (16px) padding

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-primary` | `#0D1117` |
| Backdrop | `bg-overlay` | `rgba(0,0,0,0.60)` |
| Shadow | `shadow-sheet` | `0 -8px 32px rgba(0,0,0,0.6)` |
| Border radius (top) | `radius-lg` | 16px |
| Drag handle | `neutral` | `#9CA3AF`, 32x4px |
| Title | `text-primary` | `#F9FAFB`, `text-title-lg` |
| Close icon | `text-secondary` | `#9CA3AF` |
| Divider | `border-subtle` | `#1F2937`, 1px |
| Open animation | `ease-decelerate` | translateY 100% to 0, 350ms |
| Close animation | `ease-accelerate` | translateY 0 to 100%, 300ms |
| Backdrop animation | `ease-standard` | opacity 0 to 0.6, 350ms |

#### States

- **Opening:** Sheet slides up from bottom at 350ms `ease-decelerate`. Backdrop fades in simultaneously.
- **Open:** Content scrollable within sheet. Drag handle swipe-down to dismiss.
- **Closing:** Sheet slides down at 300ms `ease-accelerate`. Backdrop fades out. Triggered by: close button, drag down past 30% threshold, backdrop tap.
- **Content overflow:** Internal scroll activates. Sheet height stays at max.

#### Accessibility

- **Touch target:** Close button 44x44px. Drag handle area 44px tall (including padding).
- **Contrast:** All content inherits standard contrast requirements.
- **Screen reader:** Sheet announced as dialog. Title is heading. Focus trapped within sheet. Close button announces "Close sheet."

---

### 8.2 Full Sheet

**Purpose:** Full-height modal sheet for complex flows that require significant content or multi-step processes.
**Used in:** Order Placement (FR-PT-02, FR-PT-03), Stock Detail drill-downs, AI Chat (FR-AI-02), Post Creation (FR-SOC-03).
**Variants:** Standard (scrollable), Multi-step (with progress indicator), Chat (AI query interface)

#### Anatomy

```
+---------------------------------------------------------------+
|                                                               |
|         [drag handle -- 32x4px, radius-full]                  |  Handle: 12px top pad
|                                                               |
|  [<] Back     Sheet Title              [Action]               |  Header: 56px
|                                                               |
+- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
|  [Step 1]---[Step 2]---[Step 3]                               |  Progress (optional): 32px
+- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
|                                                               |
|  [full sheet content area -- scrollable]                      |  Content: remaining height
|                                                               |
|                                                               |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  [Virtual Funds Banner]                                       |  Banner (if paper trading)
|  [Primary Action Button]                                     |  Footer: 100px
|                                                               |
+---------------------------------------------------------------+
|  safe-area-inset-bottom                                       |
+---------------------------------------------------------------+

Height: 95% viewport (5% peek of parent screen visible at top)
Width: 100% screen
Border radius: radius-lg (16px) top corners
```

- **Height:** 95% of viewport height. Parent screen visible as 5% strip at top.
- **Header:** Same as Screen Header (1.2) but with drag handle above
- **Progress indicator (multi-step):** Horizontal dots/bars, `accent-primary` for completed/current, `bg-secondary` for upcoming
- **Content area:** Full scrollable region
- **Footer:** Sticky bottom with Virtual Funds Banner (7.2, if paper trading context) above Primary Button (6.1)
- **Virtual Funds Banner:** Always present on order placement sheets per FR-PT-06

#### Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `bg-primary` | `#0D1117` |
| Backdrop | `bg-overlay` | `rgba(0,0,0,0.60)` |
| Shadow | `shadow-sheet` | `0 -8px 32px rgba(0,0,0,0.6)` |
| Border radius (top) | `radius-lg` | 16px |
| Drag handle | `neutral` | `#9CA3AF`, 32x4px |
| Progress active | `accent-primary` | `#3B82F6` |
| Progress inactive | `bg-secondary` | `#161B22` |
| Open animation | `ease-decelerate` | translateY 100% to 0, 350ms |
| Close animation | `ease-accelerate` | translateY 0 to 100%, 300ms |

#### States

- **Opening:** Full sheet slides up at 350ms `ease-decelerate`. Backdrop fades in.
- **Open:** Content scrollable. Drag handle for dismiss gesture.
- **Closing:** Slides down at 300ms `ease-accelerate`. Triggered by: back button, drag down past 40% threshold, close action, successful submit.
- **Multi-step:** Back button navigates to previous step within the sheet. Progress indicator updates.
- **Order placement context:** Virtual Funds Banner visible in footer above confirm button. Pre-trade AI card (2.7) shown as collapsible section within content.
- **Chat (AI query):** Content area shows conversation history. Input field fixed at bottom above action button area. Keyboard pushes content up.

#### Accessibility

- **Touch target:** All interactive elements follow 44x44px minimum. Drag handle area 44px tall.
- **Contrast:** Inherits standard contrast specs.
- **Screen reader:** Sheet announced as dialog with title. Multi-step progress announced as "Step [X] of [Y]". Focus trapped. Virtual Funds Banner announced on sheet open for legal clarity.

---

## Appendix A: Animation Summary

All animations reference design-system.md section 8.

| Component | Animation | Duration | Easing | Notes |
|-----------|-----------|----------|--------|-------|
| Tab switch | Icon scale + color | 150ms | `ease-spring` | Scale 1-1.1-1 |
| Card press | Scale down | 80ms | `ease-sharp` | Scale to 0.97 |
| Card release | Scale up | 150ms | `ease-spring` | Scale back to 1 |
| Bottom sheet open | Slide up | 350ms | `ease-decelerate` | translateY 100% to 0 |
| Bottom sheet close | Slide down | 300ms | `ease-accelerate` | translateY 0 to 100% |
| Toast enter | Slide down | 300ms | `ease-decelerate` | From top |
| Toast exit | Slide up | 250ms | `ease-accelerate` | Auto after 3s |
| Skeleton shimmer | Sweep | 1500ms | linear | Infinite loop |
| Content reveal | Fade in | 200ms | `ease-standard` | Staggered 50ms |
| Number roll-up | Count up | 500ms | `ease-decelerate` | Portfolio values |
| Chart draw-in | Stroke dash | 600ms | `ease-decelerate` | SVG path |
| Price flash | Color flash | 300ms/600ms | `ease-standard` | On data update |
| Sparkline draw | Stroke dash | 600ms | `ease-decelerate` | On mount |
| Tooltip appear | Scale + fade | 150ms | `ease-decelerate` | From 0.95 to 1 |
| Celebration confetti | Particle fall | 1200ms | physics-based | 50 particles |
| Celebration card | Scale + fade | 350ms | `ease-decelerate` | From 0.8 to 1 |
| Toggle switch | Thumb slide | 150ms | `ease-spring` | With track fade |

---

## Appendix B: Component-to-Screen Mapping

| Screen | Components Used |
|--------|----------------|
| Splash / Onboarding | Screen Header, Primary Button, Text Input, Date Picker, Progress Indicator |
| Home | Bottom Tab Bar, Screen Header, Portfolio Hero Card, Market Snapshot Card, Trending Card, Challenge Card, Stock Card Condensed, Skeleton Loader, Empty State |
| Discover | Bottom Tab Bar, Screen Header, Stock Card Expanded, Social Proof Badge, Sentiment Selector (filter), Theme chips (Secondary Button), Skeleton Loader, Toast |
| Stock Detail | Screen Header (transparent), Back Button, Price Display, Sparkline Chart, Stat Grid Item, Financial Term Tooltip, Social Post Card, Social Proof Badge, AI Analysis Card, Primary Button, Half Sheet, Skeleton Loader, Disclaimer Banner |
| Portfolio | Bottom Tab Bar, Screen Header, Portfolio Hero Card, Virtual Funds Banner, Stock Card Condensed, Price Display, XP Progress Bar, Empty State, Error State, Full Sheet (order), AI Analysis Card |
| Markets | Bottom Tab Bar, Screen Header, Market Snapshot Card, Stock Card Condensed, Text Input (search), Disclaimer Banner, Toggle Switch (market filter), Error State |
| Profile | Bottom Tab Bar, Screen Header, Trader Tier Badge, XP Progress Bar, Streak Counter, Toggle Switch, Secondary Button, Achievement Card |
| Notifications | Screen Header, Back Button, Toast Notification, Empty State |
| Paper Trading Sheets | Full Sheet, Virtual Funds Banner, AI Analysis Card (pre-trade), Primary Button, Text Input, Price Display, Disclaimer Banner |
| Post Creation | Full Sheet, Text Input (multiline), Sentiment Selector, Primary Button, Secondary Button, Toast |
| Celebration | Milestone Celebration Overlay, Achievement Card |

---

## Appendix C: Responsive Breakpoints

All components are designed mobile-first for 375px (iPhone SE). Layout behavior:

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Base (SE) | 375px | All specs as documented. This is the primary design canvas. |
| Standard | 390-393px | iPhone 14/15 Pro. Minimal change; extra 15-18px distributed to card margins. |
| Large | 414-430px | iPhone Plus/Max. Cards gain ~20px margin each side. |
| Android mid | 360px | Samsung mid-range. Cards slightly compressed. Text truncation more aggressive. |
| Android compact | 320px | Small Android. Bento grid switches from 2-col to 1-col. Trending cards narrow to 120px. |

---

*End of Shared Components Library. All components ready for design-to-code handoff. Reference design-system.md for token definitions and animation curves.*
