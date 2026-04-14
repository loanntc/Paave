# Paave Design System
## Tokens, Typography, Spacing, Shadows, Animations

> Version: 1.0 | Date: 2026-04-14 | Status: V1 Production-Ready

---

## 1. Design Philosophy

Paave follows **Toss-inspired radical simplicity**:
- One primary action per screen
- Dark-mode-first (navy base)
- Large bold numerals for financial trust
- Bento grid cards for structured data density
- Pretendard font for full CJK + Latin + Vietnamese diacritic support

Benchmark: Toss (KR) — but with Paave's own electric blue/cyan accent identity.

---

## 2. Color Tokens

### 2.1 Base / Background

| Token | Dark Mode | Light Mode | Usage |
|---|---|---|---|
| `bg-primary` | `#0D1117` | `#FFFFFF` | App background, screen base |
| `bg-secondary` | `#161B22` | `#F3F4F6` | Section backgrounds, subtle separation |
| `bg-card` | `#1F2937` | `#FFFFFF` | Card surfaces, modal backgrounds |
| `bg-card-hover` | `#263244` | `#F9FAFB` | Card pressed / hover state |
| `bg-overlay` | `rgba(0,0,0,0.60)` | `rgba(0,0,0,0.40)` | Bottom sheet backdrop, modal overlay |
| `bg-skeleton` | `#1F2937` | `#E5E7EB` | Skeleton loading base |
| `bg-skeleton-shine` | `#2D3748` | `#F3F4F6` | Skeleton shimmer highlight |

### 2.2 Accent / Brand

| Token | Value | Usage |
|---|---|---|
| `accent-primary` | `#3B82F6` | Primary buttons, active tab, selected state, links |
| `accent-primary-hover` | `#2563EB` | Button pressed / hover |
| `accent-primary-subtle` | `rgba(59,130,246,0.15)` | Chip backgrounds, tag fill, subtle highlights |
| `accent-secondary` | `#06B6D4` | Chart lines, sparklines, data accent |
| `accent-secondary-subtle` | `rgba(6,182,212,0.15)` | Chart fill area |

### 2.3 Semantic / Financial

| Token | Value | Usage |
|---|---|---|
| `positive` | `#10B981` | Positive P&L, price up, gains |
| `positive-subtle` | `rgba(16,185,129,0.15)` | Positive badge background |
| `negative` | `#EF4444` | Negative P&L, price down, losses |
| `negative-subtle` | `rgba(239,68,68,0.15)` | Negative badge background |
| `neutral` | `#9CA3AF` | Zero change (0.00%), neutral states |
| `warning` | `#F59E0B` | Alert active, caution signals |
| `warning-subtle` | `rgba(245,158,11,0.15)` | Warning chip background |

### 2.4 Text

| Token | Value | Usage |
|---|---|---|
| `text-primary` | `#F9FAFB` | Headlines, primary body text |
| `text-secondary` | `#9CA3AF` | Labels, supporting info, timestamps |
| `text-tertiary` | `#6B7280` | Placeholder text, disabled labels |
| `text-inverse` | `#0D1117` | Text on light/accent backgrounds |
| `text-accent` | `#3B82F6` | Interactive text, links |
| `text-positive` | `#10B981` | Positive values inline |
| `text-negative` | `#EF4444` | Negative values inline |

### 2.5 Border / Divider

| Token | Value | Usage |
|---|---|---|
| `border` | `#374151` | Card borders, input borders, dividers |
| `border-subtle` | `#1F2937` | Very subtle section separators |
| `border-focus` | `#3B82F6` | Input focus ring |
| `border-error` | `#EF4444` | Input error ring |

### 2.6 Special Gradients

| Token | Value | Usage |
|---|---|---|
| `gradient-hero` | `linear-gradient(135deg, #0D1117 0%, #1a1f35 100%)` | Portfolio hero card |
| `gradient-card-overlay` | `linear-gradient(180deg, transparent 40%, rgba(13,17,23,0.9) 100%)` | Chart card overlay |
| `gradient-accent-glow` | `radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.2) 0%, transparent 70%)` | Screen top glow for hero sections |
| `gradient-positive` | `linear-gradient(135deg, rgba(16,185,129,0.2) 0%, transparent 100%)` | Positive P&L card tint |
| `gradient-negative` | `linear-gradient(135deg, rgba(239,68,68,0.2) 0%, transparent 100%)` | Negative P&L card tint |

---

## 3. Typography

### 3.1 Font Stack

```
Primary:  Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Numeric:  Pretendard (tabular-nums feature enabled)
Fallback: system-ui, sans-serif
```

**Pretendard** covers:
- Latin (A–Z, extended)
- Vietnamese diacritics (ắ, ộ, ữ, ề, etc.)
- Korean Hangul (가나다...)
- Common financial symbols ($, %, ₫, ₩)

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `text-display-xl` | 40px | 800 | 1.1 | -0.5px | Hero numbers (portfolio total) |
| `text-display-lg` | 32px | 700 | 1.15 | -0.3px | Stock price, large numerals |
| `text-display-md` | 24px | 700 | 1.2 | -0.2px | Section headers, card price |
| `text-title-lg` | 20px | 700 | 1.3 | -0.1px | Screen titles, bottom sheet titles |
| `text-title-md` | 18px | 600 | 1.35 | 0px | Card headlines, stock names |
| `text-title-sm` | 16px | 600 | 1.4 | 0px | Sub-section headers |
| `text-body-lg` | 16px | 400 | 1.5 | 0px | Body text, descriptions |
| `text-body-md` | 14px | 400 | 1.5 | 0px | Card body, supporting text |
| `text-body-sm` | 13px | 400 | 1.5 | 0px | Secondary labels |
| `text-caption` | 12px | 400 | 1.4 | 0.2px | Timestamps, tags, micro labels |
| `text-caption-bold` | 12px | 600 | 1.4 | 0.2px | Tags, chip labels |
| `text-label` | 11px | 500 | 1.3 | 0.5px | Nav labels, tab labels |

### 3.3 Numeric Formatting Rules

```
Font feature settings: "tnum" 1  (tabular numbers — fixed-width columns)
Currency prefix: ₫ (VN), ₩ (KR), $ (Global)
Thousand separator: . (VN: 1.234.567), , (KR/Global: 1,234,567)
Decimal: , (VN), . (KR/Global)
Large numbers: abbreviated — 1.2T = 1.2 nghìn tỷ (VN label)
```

---

## 4. Spacing System (8px Grid)

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro gaps, icon margins |
| `space-2` | 8px | Inner component padding |
| `space-3` | 12px | Component inner padding (tight) |
| `space-4` | 16px | Standard inner padding, card padding |
| `space-5` | 20px | Section padding |
| `space-6` | 24px | Card vertical padding, section gaps |
| `space-8` | 32px | Large section gaps |
| `space-10` | 40px | Hero section padding |
| `space-12` | 48px | Screen top padding (safe area + nav) |
| `space-16` | 64px | Bottom nav height |
| `space-20` | 80px | Bottom nav clearance |

### 4.1 Layout Grid

```
Screen width: 375px (iPhone SE base) — all layouts must work at 375px
Content max-width: 375px (mobile-only)
Horizontal page margin: 16px (space-4)
Card gap: 12px (space-3)
Section gap: 24px (space-6)
Bento grid column gap: 8px (space-2)
Bento grid row gap: 8px (space-2)
```

### 4.2 Touch Targets

```
Minimum touch target: 44 × 44px (Apple HIG / Material minimum)
Preferred button height: 52px (primary actions)
Tab bar icon + label height: 64px
Icon size in touch target: 24px (with 10px padding each side)
Chip/tag height: 32px
```

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | Chips, tags, small inputs |
| `radius-md` | 12px | Cards (standard) |
| `radius-lg` | 16px | Large cards, bottom sheets |
| `radius-xl` | 24px | Hero cards, modals |
| `radius-full` | 9999px | Pills, avatar circles, toggles |

---

## 6. Elevation / Shadow System

| Token | Value | Usage |
|---|---|---|
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)` | Standard card elevation |
| `shadow-card-raised` | `0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)` | Floating cards, selected state |
| `shadow-sheet` | `0 -8px 32px rgba(0,0,0,0.6)` | Bottom sheets |
| `shadow-glow-accent` | `0 0 20px rgba(59,130,246,0.3)` | Accent button glow |
| `shadow-glow-positive` | `0 0 16px rgba(16,185,129,0.25)` | Positive P&L hero highlight |

---

## 7. Icon System

```
Library: Lucide Icons (open source, consistent stroke weight)
Stroke width: 1.5px (default), 2px (active/emphasis)
Size: 20px (nav icons), 24px (action icons), 16px (inline with text)
Color: inherit from parent text token
Active nav icon: filled variant where available, else stroke + accent-primary color
```

---

## 8. Micro-Animation Specifications

### 8.1 Global Easing Curves

| Name | Cubic Bezier | Usage |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Most transitions |
| `ease-decelerate` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Elements entering screen |
| `ease-accelerate` | `cubic-bezier(0.4, 0.0, 1.0, 1)` | Elements leaving screen |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy interactions (tab switch, card press) |
| `ease-sharp` | `cubic-bezier(0.4, 0.0, 0.6, 1)` | Abrupt transitions |

### 8.2 Duration Scale

| Token | Duration | Usage |
|---|---|---|
| `duration-instant` | 80ms | Button press feedback |
| `duration-fast` | 150ms | Chip toggle, checkbox |
| `duration-standard` | 250ms | Card transitions, page enters |
| `duration-slow` | 350ms | Bottom sheet open/close |
| `duration-deliberate` | 500ms | Chart draw-in, number roll-up |
| `duration-extended` | 800ms | Onboarding transitions |

### 8.3 Specific Animation Specs

#### Splash / Onboarding
```
Logo appear:      opacity 0→1, translateY 20px→0  | 600ms | ease-decelerate
Logo to step:     scale 1→0.85, opacity 1→0       | 300ms | ease-accelerate
Step transition:  translateX 375px→0              | 350ms | ease-decelerate
Progress dot:     scale 0.6→1, color transition   | 150ms | ease-standard
```

#### Number Roll-Up (Financial Data)
```
Trigger:   On mount / data load
Type:      Count-up animation from 0 to final value
Duration:  500ms
Easing:    ease-decelerate (fast start, settle at end)
Precision: Match final display format (2 decimal places)
Scope:     Portfolio total, P&L values, price changes
```

#### Chart Line Draw-In
```
Trigger:   On chart component mount
Type:      SVG stroke-dashoffset animation (0% → 100% path length)
Duration:  600ms
Easing:    ease-decelerate
Fill area: Fade in with opacity 0→0.3 at 200ms offset
```

#### Skeleton → Content
```
Skeleton shimmer: background-position left→right | 1.5s | linear | infinite loop
Content reveal:   opacity 0→1 | 200ms | ease-standard (staggered: 50ms per item)
```

#### Card Press
```
Trigger:   touchstart / mousedown
Scale:     1→0.97 | 80ms | ease-sharp
Release:   0.97→1 | 150ms | ease-spring
```

#### Bottom Sheet Open/Close
```
Open:   translateY 100%→0  | 350ms | ease-decelerate
Close:  translateY 0→100%  | 300ms | ease-accelerate
Backdrop: opacity 0→0.6    | 350ms | ease-standard
```

#### Tab Switch (Bottom Nav)
```
Inactive→Active icon:  color transition + scale 1→1.1→1  | 150ms | ease-spring
Active tab indicator:  width slide between tabs           | 200ms | ease-standard
Screen transition:     fade 0→1, translateY 8px→0         | 250ms | ease-decelerate
```

#### Price Badge (Up/Down flash)
```
Trigger:  Price data update
Flash:    background-color to positive/negative | 300ms | ease-standard
Return:   back to default | 600ms | ease-standard
```

#### Toast / Notification
```
Enter:  translateY -100%→0, opacity 0→1 | 300ms | ease-decelerate
Exit:   translateY 0→-100%, opacity 1→0 | 250ms | ease-accelerate
Auto-dismiss: 3000ms delay before exit
```

---

## 9. Component State Tokens

### Button States

| State | Background | Text | Border | Shadow |
|---|---|---|---|---|
| Default | `accent-primary` | `#FFFFFF` | none | `shadow-glow-accent` |
| Pressed | `accent-primary-hover` | `#FFFFFF` | none | none |
| Disabled | `bg-card` | `text-tertiary` | `border` | none |
| Loading | `accent-primary` | transparent | none | none (spinner overlay) |
| Secondary | `accent-primary-subtle` | `accent-primary` | none | none |
| Destructive | `negative` | `#FFFFFF` | none | `0 0 16px rgba(239,68,68,0.3)` |

### Input States

| State | Border | Background | Label color |
|---|---|---|---|
| Default | `border` | `bg-card` | `text-secondary` |
| Focus | `border-focus` | `bg-card` | `accent-primary` |
| Filled | `border` | `bg-card` | `text-secondary` |
| Error | `border-error` | `rgba(239,68,68,0.05)` | `negative` |
| Disabled | `border-subtle` | `bg-secondary` | `text-tertiary` |

### Card States

| State | Background | Border | Shadow |
|---|---|---|---|
| Default | `bg-card` | `border` (1px) | `shadow-card` |
| Pressed | `bg-card-hover` | `border` | `shadow-card` |
| Selected | `bg-card` | `accent-primary` (2px) | `shadow-card-raised` |
| Loading | `bg-skeleton` shimmer | none | none |

---

## 10. Localization System

### 10.1 Language Routing

```
User nationality = VN → default locale: vi-VN
User nationality = KR → default locale: ko-KR
Otherwise           → default locale: en-US
In-app language toggle: Profile > Cài đặt > Ngôn ngữ
```

### 10.2 Number Formatting by Locale

| Format | VN (vi-VN) | KR (ko-KR) | Global (en-US) |
|---|---|---|---|
| Currency | ₫ suffix | ₩ prefix | $ prefix |
| Thousand sep | `.` | `,` | `,` |
| Decimal sep | `,` | `.` | `.` |
| Large (M) | "triệu" | "백만" | "M" |
| Large (B) | "tỷ" | "억" | "B" |
| Large (T) | "nghìn tỷ" | "조" | "T" |
| Date format | DD/MM/YYYY | YYYY.MM.DD | MM/DD/YYYY |
| Time format | 24h | 24h | 12h AM/PM |

### 10.3 Layout Adjustments for Locales

| Element | VN | KR | Notes |
|---|---|---|---|
| Stock name display | Latin + diacritics | Hangul | Pretendard handles both |
| Stock name truncation | 2 lines max | 2 lines max | Same rule |
| Social proof copy | "người đang xem" | "명이 보고 있어요" | Adjust string length |
| CTA button copy | "Theo dõi" | "관심 종목 추가" | KR copy longer — use smaller font (14px) |
| Number width | Slightly narrower | Standard | Tabular nums handles this |

### 10.4 Market Tab Defaults

```
VN users: Markets tab → VN tab active by default
KR users: Markets tab → KR tab active by default
Global:   Markets tab → Global tab active by default
```

---

## 11. Accessibility Specs

```
Minimum contrast ratio: 4.5:1 (WCAG AA) for normal text
Large text (≥18px bold): 3:1 minimum contrast
Touch targets: 44×44px minimum (per Apple HIG)
Focus indicators: 2px solid accent-primary, 2px offset
Motion: Respect prefers-reduced-motion — reduce all animations to opacity-only
Font scaling: Support up to 200% system font scale (no text clipping)
Screen reader: All icons have aria-label or title
```

---

## 12. Safe Area / Device Specs

```
Status bar: 44px (notch devices), 20px (non-notch) — use safe-area-inset-top
Bottom nav: 64px height + safe-area-inset-bottom (0–34px depending on device)
Scroll content: paddingBottom = 80px + safe-area-inset-bottom
Target device: iPhone 14 Pro (393×852) as primary design canvas
Also test: Samsung Galaxy S23 (360×780)
```
