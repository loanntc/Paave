# Paave Design System — V2.0 "Kinetic Drop"

> Version: 2.0 | Date: 2026-04-17 | Status: V2 Production-Ready
> Figma: [Paave — V2.0 Design](https://www.figma.com/design/DIn25HJLZL42U6TAnqoh6n)

V2.0 replaces the V1 navy/electric-blue "Toss-clone" direction with a bolder, kinetic, Gen Z-native language: **deep black + lime pulse + plasma purple**, paired with Space Grotesk (display) and Manrope (body). The brand voice ("vibe", "pulse", "ledger", "kinetic", "NEW DROP") runs through copy and component naming.

---

## 1. Design Philosophy

Paave V2.0 is a **kinetic ledger** — financial, but music-festival energy. Principles:

- **Dark-first, ink-black canvas** (`#0E0E0E`) — OLED-native, battery-kind, gives signal colors room to breathe.
- **Pulse over polish** — motion and glow communicate "alive market" without breaking the single-primary-action rule.
- **Two signal colors, not a rainbow** — lime (`#CAFD00`) = growth/action, plasma (`#D277FF`) = identity/alert. Never both as primary on the same surface.
- **Bold display numerals** — `Space Grotesk` tabular-nums for every currency value. No ambiguity on money.
- **Glassmorphism only for trust moments** — security notices, locked panels. Not decorative.
- **Gen Z voice, not slang cosplay** — "Verify pulse", "Enter the ledger" stay legible to investors' parents.

Benchmarks: Toss (KR) radical simplicity · Robinhood (US) dark canvas · Rekord / Linear for the lime-on-black confidence.

---

## 2. Color Tokens

### 2.1 Ink (Background Scale)

| Token | Value | Usage |
|---|---|---|
| `ink-900` | `#0E0E0E` | App background, screen base (primary) |
| `ink-800` | `#131313` | Card surface, verification panel |
| `ink-700` | `#1A1A1A` | Raised / hover card |
| `ink-600` | `#262626` | Input background, elevated tile |
| `ink-500` | `#2E2E2E` | Input hover / focus-ready |
| `ink-400` | `#484847` | Placeholder glyph, disabled OTP dot |

### 2.2 Lime (Primary Accent)

| Token | Value | Usage |
|---|---|---|
| `lime` | `#CAFD00` | CTA fill, data-positive signal |
| `lime-soft` | `#F3FFCA` | Display headings, primary on-dark text |
| `lime-ink` | `#516700` | Text on lime CTA (WCAG AA vs `#CAFD00`) |
| `lime-glow` | `rgba(202,253,0,0.20)` | CTA drop-shadow glow |
| `lime-drop` | `linear-gradient(135deg, #F3FFCA 0%, #CAFD00 100%)` | Primary button gradient |

### 2.3 Plasma (Identity / Alert Accent)

| Token | Value | Usage |
|---|---|---|
| `plasma` | `#D277FF` | Links, "NEW DROP" badge, section titles |
| `plasma-deep` | `#7D01B1` | Security/protocol icon tile |
| `plasma-ink` | `#380052` | Text on plasma badge |
| `plasma-glow` | `rgba(210,119,255,0.20)` | Plasma-variant button glow |
| `plasma-drop` | `linear-gradient(135deg, #D277FF 0%, #7D01B1 100%)` | Secondary button gradient |

### 2.4 Fog (Text Scale on Dark)

| Token | Value | Usage |
|---|---|---|
| `fog` | `#ADAAAA` | Secondary text, captions, timestamps |
| `fog-muted` | `#7A7777` | Tertiary / inactive labels |
| `white` | `#FFFFFF` | Masked email, highlighted inline value |

### 2.5 Semantic / Financial

| Token | Value | Usage |
|---|---|---|
| `positive` | `#10B981` | Up-tick badge, P&L gains |
| `negative` | `#EF4444` | Down-tick badge, P&L losses |

(V2.0 uses `lime` for the *primary* "good" signal where the surface is hero-level; `positive` green is reserved for supporting badges and row-level indicators to preserve lime's identity weight.)

### 2.6 Border / Edge

| Token | Value | Usage |
|---|---|---|
| `edge` | `rgba(72,72,71,0.20)` | Card borders, glassmorphic outlines |
| `edge-strong` | `rgba(72,72,71,0.40)` | Focus rings, selected card borders |

### 2.7 Ambient Glow Orbs

Used as page-level background decoration to give the canvas movement:

```
.glow-orb--lime   → 320×320 · rgba(243,255,202,0.05) · blur 60px
.glow-orb--plasma → 320×320 · rgba(210,119,255,0.05) · blur 60px
```

Positioned bleeding off the viewport edges; never behind body copy.

---

## 3. Typography

### 3.1 Font Stack

```
Display: "Space Grotesk" 400/500/700  → headings, UI labels, numerics, tracked caps
Body:    "Manrope"       400/500/600  → body copy, descriptions, paragraphs
Numeric: Space Grotesk with `font-feature-settings: "tnum" 1`
```

Both are loaded via `next/font/google` for zero-layout-shift and are exposed as `--font-space-grotesk` and `--font-manrope`. Vietnamese diacritics + Latin are supported natively; Korean Hangul is planned for V2.1 via a locale-switched stack.

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|
| `display-xl` | 56–72px | 700 | 1.05 | -1.8px | Landing hero |
| `display-lg` | 44px | 700 | 1.05 | -1.5px | Portfolio total |
| `display-md` | 36px | 700 | 1.25 | -1.8px | Screen hero heading |
| `display-sm` | 24px | 700 | 1.2 | -0.5px | Card prices |
| `title-lg` | 20px | 400 | 1.4 | -1.0px | Top-nav wordmark |
| `title-md` | 18px | 400 | 1.56 | -0.45px | Section heads (Kinetic Security Protocol) |
| `caption-drop` | 14px | 400 | 1.43 | 1.4px uppercase | CTAs, button text, secondary action |
| `caption-pulse` | 12px | 400 | 1.33 | 1.2px uppercase | Tags, eyebrows, "NEW DROP", resend status |
| `body-lg` | 18px | 400 | 1.62 | 0 | Hero paragraph, subtitle |
| `body-md` | 14px | 400 | 1.62 | 0 | Security copy, helper text |

**Rule:** Anything uppercase uses Space Grotesk + tracking. Anything sentence-case body uses Manrope.

### 3.3 Numeric Formatting Rules

```
Font feature:      "tnum" 1  (enforced globally in body CSS)
Currency prefix:   ₫ (VN), ₩ (KR), $ (Global)
Decimal tone:      Full-weight integer, 70% opacity on decimals for hero prices
Large numbers:     Abbreviated per locale (triệu / 억 / M)
```

---

## 4. Spacing System (8px Grid)

Same 8px grid as V1; only the outer rhythm has shifted to support the more generous hero sections.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon internal, badge inner |
| `space-2` | 8px | Tight gaps |
| `space-3` | 12px | OTP grid gap, action tile gap |
| `space-4` | 16px | Standard card pad |
| `space-5` | 20px | CTA vertical pad |
| `space-6` | 24px | Screen margin, card pad |
| `space-8` | 32px | Card outer pad, section gap |
| `space-10` | 40px | Hero vertical pad |
| `space-12` | 48px | Hero top spacing (post-nav) |
| `space-16` | 64px | Section spacing |
| `space-24` | 96px | Screen top above first hero block |

### 4.1 Layout Grid

```
Mobile canvas:       390px (iPhone 14/15 Pro) — Figma baseline
Content max-width:   672px for forms / auth panels · 896px for dashboard
Horizontal margin:   24px (space-6)
Card border radius:  large panels → 40px (rounded-5xl), standard → 24–32px
```

### 4.2 Touch Targets

```
Minimum:       44×44px (OTP cell 80×80 exceeds)
Primary CTA:   68px total height (px-12 py-5, 18px display text)
Bottom nav:    64px + safe-area-inset-bottom
Icon buttons:  40×40 with centered 16-20px glyph
```

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | OTP cells, inline chips, resend button |
| `radius-md` | 12px | Hero icon tile, badge pill, plasma-deep icon tile |
| `radius-lg` | 16px | Inputs, mini-stat cards |
| `radius-xl` | 24px | Quick-action tiles, glassmorphic info panels |
| `radius-2xl` | 32px | Portfolio hero |
| `radius-4xl` | 40px | Verification panel — the signature container |
| `radius-full` | 9999px | Pills, avatar, eyebrow chips |

---

## 6. Elevation / Shadow System

V2.0 de-emphasizes traditional shadows in favor of **colored glows** and **glassmorphic backdrops**. Flat cards with lighting, not drop shadows.

| Token | Value | Usage |
|---|---|---|
| `shadow-card` | `0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)` | Plasma badge, small floating elements |
| `shadow-glow-lime` | `0 8px 30px rgba(202,253,0,0.20)` | Primary CTA glow |
| `shadow-glow-plasma` | `0 8px 30px rgba(210,119,255,0.25)` | Secondary CTA glow |
| `backdrop-blur-md` | `backdrop-filter: blur(12px)` | Glassmorphic info card |

---

## 7. Icon System

```
Library:       Lucide React (installed)
Stroke:        1.5px (passive) · 2.0px (active / eyebrow) · 2.5px (primary CTA adornment)
Sizes:         16px (inline), 20px (nav/action), 24px (hero-adjacent), 50px (hero tile)
Color:         inherit from parent text token
Hero icons:    Rendered inside a 128px ink-600 tile w/ 12px radius; lime-soft glyph.
Security:      plasma-deep (#7D01B1) tile, white glyph.
```

---

## 8. Signature Components

### 8.1 PaaveWordmark
- `display` font, uppercase, `-1px` tracking, color `lime-soft`.
- Sizes: `sm` (16px), `md` (20px — top nav), `lg` (30px — splash).

### 8.2 KineticButton
- Variants: `lime` (primary), `plasma` (secondary), `ghost` (inverse-outline).
- Height 68px, horizontal padding 48px, uppercase 18px display text, 12px gap to icon.
- Glow shadow by variant. `active:scale-[0.98]` press feedback.
- Only one `lime` variant per viewport.

### 8.3 OtpInput
- 2 rows × 3 columns grid, gap `space-3`.
- Each cell: 80px square · `ink-600` · 8px radius · 30px display char, tabular.
- Empty placeholder glyph: `•` at `ink-400`.
- Auto-advance on key, back-focus on Backspace, paste-spreads across cells.

### 8.4 AmbientBackground
- Lime orb top-left (`-80px` inset), plasma orb bottom-right; both with `animate-pulse-glow`.

### 8.5 Glassmorphic Security Info
- `bg-ink-600/40` + `backdrop-blur-md` + `border-edge`.
- Inner plasma-deep tile hosts shield icon. Used whenever Paave gives safety guidance.

### 8.6 Portfolio Hero (home)
- `ink-800` panel, 32px radius, lime/10 blurred orb top-right, display-lg portfolio number with 70% opacity decimals.
- Positive change: lime-soft primary + `positive/15` pill with icon.

### 8.7 ChangePill
- Rounded-full 10px tabular number, `positive/15` or `negative/15` bg.
- Always prefixes `+` for gains.

---

## 9. Motion System

### 9.1 Easing

| Name | Cubic Bezier | Usage |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `ease-decelerate` | `cubic-bezier(0.0, 0, 0.2, 1)` | Elements entering (fade-up) |
| `ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Tab switch, card press release |

### 9.2 Duration

| Token | Duration | Usage |
|---|---|---|
| `fast` | 150ms | Press feedback, focus ring |
| `standard` | 300ms | Error message fade-up, card hover |
| `pulse-glow` | 3000ms infinite | Ambient orbs |
| `countdown` | 1000ms | Resend timer tick |

### 9.3 Signature Motions

```
fade-up:        opacity 0→1, translateY 8px→0     | 300ms ease-decelerate
pulse-glow:     opacity 0.4↔0.8 (orbs)            | 3000ms ease-in-out infinite
cta-press:      scale 1→0.98                       | 150ms ease-out (active:)
otp-fill:       text color ink-400 → lime-soft     | 150ms ease-standard
```

---

## 10. Brand Voice (lexicon for copy)

| Concept | V2.0 word | Use in UI |
|---|---|---|
| OTP code | **pulse** | "Send me a pulse", "Verify pulse" |
| Portfolio | **ledger** | "Enter the ledger", "Lock your ledger" |
| Post/drop | **drop** | "NEW DROP" badge, "Resend" CTA |
| Aesthetic moment | **vibe** | "Check the vibe" hero |
| Security | **kinetic** | "Kinetic Security Protocol" |
| Change/day | **pulse** (again) | "your pulse" = today's portfolio delta |

**Rule:** Use at most two lexicon words per screen. Don't stack ("Check the kinetic vibe pulse drop"). Lead with plain-English action; add the flavor once.

---

## 11. Accessibility

```
Minimum contrast:     4.5:1 WCAG AA (verified lime-soft on ink-900 = 14.8:1, fog on ink-900 = 7.9:1)
Large text (≥18b):    3:1 minimum — lime-ink on lime CTA = 6.2:1 ✓
Touch targets:        44×44px minimum, OTP cells well above
Focus indicators:     2px lime ring, no offset
Motion:               Respect prefers-reduced-motion — disables pulse-glow and fade-up
Screen reader:        All icon-only buttons have aria-label; decorative glows use aria-hidden
```

---

## 12. Safe Area / Device Specs

```
Status bar:           44px (notch), handled via safe-area-inset-top
Bottom nav:           64px + safe-area-inset-bottom, bg-ink-900/90 + backdrop-blur-xl
Scroll bottom pad:    112px (space-28) to clear nav
Target primary:       390×852 (Figma canvas)
Also test:            360×780, 430×932
```

---

## 13. Component Reuse Workflow

**Rule: Check before you create.** Every new screen must audit existing components before introducing anything new. A component created for one screen is available to all future screens.

### 13.1 Workflow for New Screens

```
1. READ  — Review Section 8 (Signature Components) and docs/design/components.md
2. AUDIT — For each UI element on the new screen, answer:
           "Does an existing component cover this, even partially?"
3. REUSE — If yes: use the existing component. Document any prop/variant needed.
4. EXTEND — If an existing component almost fits: add a new variant to it,
             then update its entry in components.md.
5. CREATE — If nothing fits: design the new component from scratch,
             following all design-system tokens, then add it to components.md.
```

### 13.2 Rules

- **No duplicate components.** If two screens have the same UI element with identical behavior, they must share one component — not two copies.
- **Variants over new components.** A new visual treatment on an existing component shape = a new variant on that component, not a new component.
- **Document immediately.** A new component not added to `components.md` before the screen spec is submitted is treated as incomplete.
- **Name consistently.** Component names follow `PascalCase`. Variant names follow `kebab-case` (e.g., `KineticButton` › `variant: ghost-sm`).

### 13.3 When to Create a New Component

Create a new component entry in `components.md` when:
- The element appears on more than one screen, OR is likely to appear again within 2 sprints.
- The element has more than one interactive state (default, hover, pressed, disabled, error).
- The element carries a design token that doesn't exist yet in any current component.

Do **not** create a new component for:
- One-off decorative elements used on a single screen with no reuse potential.
- Pure layout wrappers with no visual identity (use spacing tokens instead).

### 13.4 Checklist — Before Submitting a Screen Spec

```
[ ] Reviewed all components in Section 8 and components.md
[ ] Every UI element is either: an existing component, an extended variant, or a new documented component
[ ] New components are added to components.md with all required fields
[ ] Extended variants are updated in the existing component's components.md entry
[ ] No design token values are hardcoded in the spec — all values reference named tokens
```

---

## Appendix A — V1 → V2 Token Migration

| V1 Token | V1 Value | V2 Token | V2 Value |
|---|---|---|---|
| `bg-primary` | `#0D1117` | `ink-900` | `#0E0E0E` |
| `bg-card` | `#1F2937` | `ink-800` | `#131313` |
| `accent-primary` | `#3B82F6` | `lime` | `#CAFD00` |
| `accent-secondary` | `#06B6D4` | `plasma` | `#D277FF` |
| `text-primary` | `#F9FAFB` | `lime-soft` | `#F3FFCA` |
| `text-secondary` | `#9CA3AF` | `fog` | `#ADAAAA` |
| `border` | `#374151` | `edge` | `rgba(72,72,71,0.20)` |
| Font: Pretendard | — | Space Grotesk + Manrope | — |

V1 semantic financial colors (`positive`/`negative`/`warning`) are preserved; they sit one rung below lime/plasma in visual hierarchy.
