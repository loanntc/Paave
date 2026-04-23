# Paave Component Registry

> Version: 1.0 | Date: 2026-04-23 | Status: Living document — update on every new or extended component
> Figma: [Paave — V2.0 Design](https://www.figma.com/design/DIn25HJLZL42U6TAnqoh6n)

This file is the single source of truth for all reusable UI components.

**Before designing a new screen:** read this file top-to-bottom and check Section 8 of `design-system.md`.  
**After creating a new component:** add it here before submitting the screen spec.

See `design-system.md §13` for the full reuse workflow and rules.

---

## How to Read This File

Each component entry follows this template:

```
### ComponentName
- Figma frame:   Link or frame name
- Used on:       Screen names where this component appears
- Variants:      List of variant names and what they change
- Props:         Key configurable props (not exhaustive — see Figma for full spec)
- States:        default | hover | pressed | disabled | error | loading (mark which apply)
- Tokens used:   Named tokens from design-system.md (no raw hex values here)
- Notes:         Constraints, pairing rules, known edge cases
```

---

## Signature Components (from design-system.md §8)

These components are defined in detail in `design-system.md §8`. Entries here track usage and variants discovered after the initial spec.

---

### PaaveWordmark

- **Figma frame:** `Components / PaaveWordmark`
- **Used on:** Splash, Login, Register, OTP Verification, all Onboarding steps
- **Variants:**
  - `sm` — 16px, top-nav compact contexts
  - `md` — 20px, top nav (default)
  - `lg` — 30px, splash / hero
- **Props:** `size: sm | md | lg`
- **States:** default (no interactive states — decorative only)
- **Tokens used:** `lime-soft`, Space Grotesk 700, `-1px` tracking, uppercase
- **Notes:** Never appears alongside a competing hero heading at the same visual weight. On screens with a `display-md` heading, use `sm` or `md` variant only.

---

### KineticButton

- **Figma frame:** `Components / KineticButton`
- **Used on:** Login, Register, OTP Verification, Onboarding (all steps), Home, Trade
- **Variants:**
  - `lime` — primary CTA, lime gradient fill + glow. One per viewport max.
  - `plasma` — secondary CTA, plasma gradient fill + glow.
  - `ghost` — inverse outline, no fill. Used for tertiary or cancel actions.
- **Props:** `variant: lime | plasma | ghost`, `label: string`, `icon?: LucideIcon`, `loading?: boolean`, `disabled?: boolean`
- **States:** default | pressed (`scale-[0.98]`) | disabled (`opacity-40`, no glow) | loading (spinner replaces label)
- **Tokens used:** `lime-drop`, `plasma-drop`, `shadow-glow-lime`, `shadow-glow-plasma`, `lime-ink` (text on lime), Space Grotesk 18px uppercase, `space-5` vertical pad, `space-12` horizontal pad, `radius-full`
- **Notes:** Only one `lime` variant visible per viewport. Never stack two `lime` buttons on the same screen. Ghost variant must have sufficient contrast against the background it sits on — verify on `ink-800` surfaces.

---

### OtpInput

- **Figma frame:** `Components / OtpInput`
- **Used on:** OTP Verification
- **Variants:** (none — single layout)
- **Props:** `length: 6` (fixed), `value: string`, `onChange`, `error?: boolean`
- **States:** empty (`ink-400` placeholder dot) | filled (`lime-soft` digit) | error (cell border `negative`)
- **Tokens used:** `ink-600`, `radius-sm` (8px), 80×80px cells, `space-3` gap, Space Grotesk 30px tabular
- **Notes:** 2-row × 3-column grid. Auto-advance on key. Back-focus on Backspace. Paste spreads across all cells. Do not resize cells for different screen widths — scroll the container instead.

---

### AmbientBackground

- **Figma frame:** `Components / AmbientBackground`
- **Used on:** Login, Register, OTP Verification, all Onboarding steps
- **Variants:** (none — fixed composition)
- **Props:** (none — purely decorative)
- **States:** default (continuous `animate-pulse-glow`)
- **Tokens used:** `.glow-orb--lime` top-left at `-80px` inset, `.glow-orb--plasma` bottom-right, `pulse-glow` 3000ms infinite
- **Notes:** Rendered as `aria-hidden`. Respects `prefers-reduced-motion` — animation disabled, orbs remain as static translucent blobs. Never place body copy directly over an orb center.

---

### GlassmorphicSecurityInfo

- **Figma frame:** `Components / GlassmorphicSecurityInfo`
- **Used on:** OTP Verification, any screen delivering a trust or security message
- **Variants:** (none — single layout)
- **Props:** `icon: LucideIcon`, `title: string`, `body: string`
- **States:** default (no interactive states)
- **Tokens used:** `ink-600/40`, `backdrop-blur-md`, `edge` border, `plasma-deep` icon tile, `radius-xl` (24px), `radius-md` (12px) inner tile
- **Notes:** Use exclusively for security and trust moments. Not a general info card. Always pairs with a `plasma-deep` icon tile — do not substitute `lime` here.

---

### PortfolioHero

- **Figma frame:** `Components / PortfolioHero`
- **Used on:** Home Dashboard
- **Variants:** (none — single layout; change indicator adapts to `positive` / `negative`)
- **Props:** `totalVND: number`, `changeVND: number`, `changePct: number`, `direction: up | down | flat`
- **States:** positive (lime-soft primary number, `positive/15` pill) | negative (`negative` pill) | flat (no pill)
- **Tokens used:** `ink-800`, `radius-2xl` (32px), `lime` glow orb top-right, Space Grotesk `display-lg` tabular, 70% opacity decimals
- **Notes:** Decimals rendered at 70% opacity for legibility without visual noise. Do not use `display-xl` here — reserved for landing hero only. `totalVND` must use VND formatting rules: `1.250.000 ₫`.

---

### ChangePill

- **Figma frame:** `Components / ChangePill`
- **Used on:** Home Dashboard (PortfolioHero), Stock rows in Markets, Stock Detail
- **Variants:**
  - `positive` — `positive/15` bg, `positive` text
  - `negative` — `negative/15` bg, `negative` text
  - `flat` — `fog-muted/15` bg, `fog-muted` text
- **Props:** `value: number`, `pct: number`, `direction: up | down | flat`
- **States:** default (no interactive states — read-only indicator)
- **Tokens used:** `radius-full`, 10px tabular Space Grotesk, `positive`, `negative`, `fog-muted`
- **Notes:** Always prefixes `+` for gains. Never shows `+0.00%` — use `flat` variant for zero change. Paired with a directional arrow icon (Lucide `arrow-up` / `arrow-down`).

---

## Extended / New Components

> Add new entries below this line. Newest at the top.
> Copy the template from the "How to Read This File" section above.
> Required fields: Figma frame, Used on, Variants, Props, States, Tokens used.

---

*No additional components yet. First new component goes here.*

---

*Owner: Design System | Maintained by: UX Designer + Frontend Developer | Version: 1.0 — April 2026*
