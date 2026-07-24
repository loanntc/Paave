# Design-QA Report — FE Prototype vs Claude Design (v1 audit)

> Date: 2026-07-24 · Auditors: Product Designer + Code Reviewer + QA (agent team)
> Compared: `app/`, `components/`, `lib/` ↔ `docs/design/design-system.md` v2.0 (Kinetic Drop) + `docs/design/screen-specs.md` v1.0 + CLAUDE.md hard rules
> Raw findings: 149 across three audits (components 75, auth screens 42, app screens 32) — deduped below.

---

## Verdict

The prototype is **visually polished but spec-divergent on three levels**: it ships an
undocumented third design system, implements 1 of 6 main screens, and violates 5 of the 8
CLAUDE.md hard rules on the screens that do exist. None of this blocks the iOS v2.0 effort —
but the iOS build must treat `tokens.json`/design docs as truth, NOT this codebase.

---

## S — Systemic findings (fix decisions before touching individual files)

### S1 · [BLOCKER] The active palette is an undocumented third system, "Neo Lumen"
- `app/globals.css:9` header literally names it: *"'Neo Lumen' / Signal Lime primary · Deep Violet secondary · Streak Peach accent"* — lime `#B5E82F`, ink-violet `#0B0A1A`, violet `#534AB7`, peach `#FF8A5B`. Matches neither V1 nor Kinetic Drop V2.0 (`lime #CAFD00`, `ink-900 #0E0E0E`, plasma `#D277FF`).
- `tailwind.config.ts:54` demotes the real spec: `/* ── V2.0 Kinetic Drop (legacy, kept for compat) ── */` — the source-of-truth relationship is inverted in code comments (also `layout.tsx:5`).
- Semantic damage: `globals.css:63` collapses `positive` into accent lime (spec keeps `#10B981` separate); `tailwind.config.ts:53` overrides `negative` to `#FF5B7A` vs spec `#EF4444` — **every loss indicator in the app renders the wrong red**, including the otherwise-compliant ChangePill.
- 11 of 16 components + the root layout are built on Neo Lumen.
- **Decision needed (owner/designer):** ratify Neo Lumen into the design system docs, or restore Kinetic Drop as active. Everything else color-related cascades from this.

### S2 · [BLOCKER] V1 font (Pretendard) is the app default
- `globals.css:1–2` CDN-imports Pretendard; `layout.tsx:53` sets `font-pretendard` on `<body>`. Appendix A of the design system explicitly migrates Pretendard → Space Grotesk + Manrope.
- Consequence: currency values on `stock-card.tsx:67`, `delta-badge.tsx:29`, `sentiment-meter.tsx` render in the wrong typeface — violating the hard rule "Space Grotesk tabular-nums for every displayed currency value".
- `globals.css` body sets no global `"tnum"` despite §3.3 requiring it; `layout.tsx:5` loads the spec fonts but without `vietnamese` subsets.

### S3 · [BLOCKER] 5 of 6 specified main screens do not exist
- Implemented: **Home only**. Missing entirely: Discover (spec :803), Stock Detail (:995), Portfolio (:1209), Markets (:1377), Profile (:1747). Forgot-Password flow (referenced by Login spec) also has no route.
- All navigation from Home is dead: BottomNav buttons have no handlers, "Discover →"/"All markets →" are `href="#"`, trending cards aren't tappable (`home-view.tsx:128–158, 222–227, 277–282, 359–384`). Interaction Rules: 0/8 implemented.
- Nav shows "Wallet" where the spec'd screen set has Portfolio.

### S4 · [BLOCKER] Zero non-default states anywhere (hard rule: every screen ships all states)
- States-coverage matrix: Home ✓default(mock)/✗loading/✗empty/✗error; all other screens unimplemented. Auth screens: no field-level error states on Register or Login; loading states don't disable inputs.
- Ironic detail: skeleton shimmer CSS is fully implemented (`globals.css:232–238`) and used nowhere.
- No stale-data affordance exists anywhere — "staleness is always visible, never silent" is unimplementable in the current component set.

### S5 · [HIGH] UI language is English; spec + product are VN-default
- Every spec'd VN string ("Tạo tài khoản", "Chào buổi sáng", "Bạn tên là gì?") is replaced with English brand-voice copy ("Join the Alpha", "Enter the Ledger", "Lock it in"). Only `welcome-view.tsx` has any Vietnamese.

### S6 · [HIGH] Auth architecture silently pivoted from the spec
- Shipped: passwordless email+OTP. Spec'd: email+password with confirm-password, terms checkbox, forgot-password, rate limiting, and Google/Apple social login — all absent. Roughly half the auth High findings cascade from this unratified pivot. Either ratify it (BA evolution-log update, FRD v2.2 actually mandates 4 signup methods) or revert.

---

## A — Hard-rule violations on financial surfaces (High unless noted)

| # | Location | Issue | Rule broken |
|---|----------|-------|-------------|
| A1 | `home-view.tsx:77–78, 242–244, 303–305` | No price anywhere carries source or timestamp | "Price/quote data always carries source + timestamp" |
| A2 | `home-view.tsx:181–192, 213–214` | Samsung ₩73,400, NVDA $962.14, KOSPI, S&P shown with no "Reference" label | "Reference-market data is labeled Reference" |
| A3 | `home-view.tsx:77–78` | Portfolio hero in **USD** ($12,480.52) on a VN-primary product; spec shows ₫ | Product definition + §3.3 |
| A4 | `app/page.tsx:78` | Landing claims KR/Global sparklines "updated in real time" — they are reference-only, delayed, no SLA | Truthfulness on data freshness |
| A5 | `home-view.tsx:330–343` | Weekly Challenge: "3 days left" countdown + "top return takes the drop" — urgency nudge + rewards raw return, incentivizing concentrated risk | Responsible engagement (gamification rewards learning, never trade frequency/urgency) |
| A6 | `sign-up-view.tsx:161` "Start Your Streak", `welcome-view.tsx:79–81` "Weekly streak rewards" | Streak-frequency framing in core CTAs | Responsible engagement (Medium — copy-level) |
| A7 | `home-view.tsx:252–264` | Zero change renders as positive green "+0.00%"; spec: neutral color | Spec edge case :758 |
| A8 | `lib/utils.ts` | No money/number formatting utility exists — every money string hand-typed per call site; `changePct` floats flow to display via `toFixed` | Money-handling discipline (Medium) |

## B — Genuine logic bugs

| # | Location | Issue |
|---|----------|-------|
| B1 | `verify-otp-view.tsx:39–45` | **OTP verification inverted**: comment says only "000000" passes; code accepts every code EXCEPT "000000". Error state unreachable in normal use |
| B2 | `sign-up-view.tsx:45–52` + `verify-otp-view.tsx:42` | Broken routing chain: register → OTP → `/home`, never reaching onboarding; `/welcome` + `/onboarding/*` orphaned (reachable only via dev links in `app/page.tsx:69,71`) |
| B3 | `sign-up-view.tsx:16–23,42` | Password gate violates FR-AUTH-01: "Abcdefgh" (no digit) passes — digit not required |
| B4 | `splash-view.tsx:9–17` | No auth check / auto-routing (spec: timed route by auth state); progress bar permanently stalls at 75% |
| B5 | `verify-otp-view.tsx:26` | Missing email param silently falls back to fake `alex@vibe.com`, displayed masked as the user's real destination |
| B6 | `welcome-view.tsx:41–48` | Hardcoded name "Minh" greets every user — before the name-collection step even runs |
| B7 | `home-view.tsx:24` | Hardcoded "Alex"; `lib/onboarding-storage.ts` collects the real name but is never read |
| B8 | `bottom-nav.tsx:26` | `safe-area-pb` class is defined nowhere (repo-wide grep) — bottom nav sits under the iPhone home indicator |

## C — Missing spec'd elements (auth)

- Register: Confirm Password field, Terms checkbox (compliance-relevant), password-requirements hint, Google/Apple buttons + "hoặc" divider, field-level errors — all absent (`sign-up-view.tsx`)
- Login: Password field, "Quên mật khẩu?", register link (**dead end for new users**), lockout/rate-limit state, social login — all absent (`sign-in-view.tsx`)
- Onboarding: Step-1 back button should be hidden (`onboarding-shell.tsx:35–49` + `nationality-view.tsx:64`); name max-length 20 vs spec 40 (`name-view.tsx:12`); "V" (1-char, valid per spec) rejected (`name-view.tsx:11`)
- Nationality options changed semantics: "Quốc gia khác" (residence) → "Global" (market) — a data-meaning change, not translation (`nationality-view.tsx:23–45`)

## D — Component-library deviations (design system §8)

| Component | Key issues |
|-----------|-----------|
| `kinetic-button.tsx` | Mostly compliant ✓. No focus ring (§11: 2px lime); no explicit 68px height; ghost is filled not outline; "one lime per viewport" unenforced |
| `otp-input.tsx` | Near-spec ✓. Cells not square (w-full ≈190px vs 80px); missing "•" placeholder glyph |
| `button.tsx` | Parallel competing button system on Neo Lumen; raw rgba inline; xs/sm sizes 32/40px break 44px touch minimum; no focus ring |
| `card.tsx` | ink-violet surfaces vs ink-800/700; 12px radius vs spec 24–32px for standard cards |
| `chip.tsx`, `delta-badge.tsx` | Wrong positive/negative colors (Neo Lumen); delta-badge doesn't enforce "+" prefix; numbers not font-display |
| `input.tsx` | Off-palette; 12px vs 16px radius; border-swap focus hack vs ring; error not aria-associated |
| `banner.tsx` | Peach + stray amber rgba (belongs to no palette); info panel ignores §8.5 glassmorphic pattern |
| `ai-card.tsx` | Inline 3-color rainbow gradient with raw hex (violates "two signal colors"); 10px AI disclaimer below scale floor + contrast risk |
| `sentiment-meter.tsx`, `sparkline.tsx`, `xp-bar.tsx`, `tier-badge.tsx` | Raw hex in inline style objects (double hard-rule violation); wrong up/down semantics; xp-bar/tier-badge are dead code |
| `stock-card.tsx` | Price 20px Pretendard vs 24px display-sm Space Grotesk; emoji as icons (not aria-hidden, spec mandates Lucide); dead `text-wrap-pretty` class |
| ChangePill (inline in `home-view.tsx:252`) | Best §8.7 implementation in repo — should be promoted to `components/ui/`; inherits wrong negative red |

## E — Accessibility (design system §11)

- `layout.tsx:38–40`: `userScalable: false` blocks pinch-zoom (WCAG 1.4.4 failure)
- Focus rings missing on kinetic-button, button, onboarding-shell links (only otp-input has the spec'd 2px lime ring)
- Sub-44px touch targets in `button.tsx` xs/sm
- `sentiment-meter` has no accessible representation; `xp-bar` progressbar unnamed; nav lacks `aria-current`; `input.tsx` errors not announced
- 10–11px text below the 12px scale floor in bottom-nav, tier-badge, ai-card disclaimer

## F — Token hygiene (hard rule: tokens only)

- Raw hex/rgba + inline style objects in 8 components (splash, ai-card, sentiment-meter, sparkline, xp-bar, tier-badge, chip, button, banner) — e.g. `splash-view.tsx:70–75`, `xp-bar.tsx:27`
- Pervasive arbitrary values (`text-[44px]`, `rounded-[32px]`, `min-w-[220px]`, `tracking-[-2px]`) — often numerically correct but token-less
- Type-scale utilities in `globals.css:178–189` diverge from §3.2 across the board; `display-sm`/`caption-drop`/`caption-pulse` missing
- Radius vars stop at 24px — the signature 40px "radius-4xl" container token missing from CSS vars
- Motion: `--duration-standard: 250ms` vs spec 300ms; off-spec 80/350/500/800ms durations
- ✓ Bright spot: `prefers-reduced-motion` handled globally (`globals.css:243–249`)

---

## Counts (deduped)

| Severity | Count |
|----------|-------|
| Blocker (systemic S1–S4) | 4 |
| High | 31 |
| Medium | 44 |
| Low | 41 |

## Recommended sequence (if the web prototype gets any further investment — it is FROZEN per v2.0 plan)

1. **Decide S1** (Neo Lumen vs Kinetic Drop) — every color fix depends on it
2. Fix B1–B8 logic bugs (an afternoon; they make demos misleading)
3. A1–A5 hard-rule violations on financial surfaces (trust + compliance surface)
4. Everything else only if the prototype outlives its freeze

## Implication for iOS v2.0 (the active initiative)

- **Build from `packages/tokens/tokens.json` (Kinetic Drop) — never port colors/fonts from this codebase.**
- The Weekly Challenge mechanic (A5) and streak copy (A6) must NOT be carried into iOS specs — flag to BA/PM for the M3 gamification design.
- The auth pivot (S6) needs a BA ruling before M1: FRD v2.2 mandates email+password AND Google/Apple/Zalo — neither the spec'd nor the shipped web flow matches FRD v2.2; iOS follows the FRD.
- ChangePill (home-view) and otp-input are the two patterns worth porting as references.
