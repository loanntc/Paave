# Flow D — Module Completion & Rewards
**Version:** 1.0 | **Date:** 2026-05-28 | **FR References:** FR-LEARN-08, FR-LEARN-09, FR-LEARN-10, FR-LEARN-11
**Linked FRD:** `docs/business/frd/module-f0-learning.md`

---

## 1. Flow Summary

| Field | Detail |
|-------|--------|
| Actor | F0 Trader who has just passed a Module Knowledge Check (MKC) |
| Trigger | MKC pass event (score ≥ 3/5) — fires from Flow E |
| Precondition | All 5 lessons in the module are COMPLETE; MKC score ≥ 3/5 |
| Exit State A | User continues to next module (M2/M3/M4 unlocked) |
| Exit State B | User views M2 bonus cash (navigates to Portfolio tab) |
| Exit State C | User returns to Grow tab after viewing rewards |
| Exit State D | M4 complete → "Path Complete" state; Tier 2 community access granted |
| FR References | FR-LEARN-08, FR-LEARN-09, FR-LEARN-10, FR-LEARN-11 |
| IR References | IR-19, IR-23 |
| EC References | EC-07 |
| TC References | TC-41 through TC-45 |

---

## 2. Business Flow

```
1. MKC pass triggers server-side events (atomic, queued):
   a. module_progress status → COMPLETE
   b. Badge award queued:
      → idempotency key: {user_id}_{badge_id}
      → module-specific badge and rarity assigned
   c. XP bonus grant queued:
      → idempotency key: {user_id}_{badge_id}_XP
      → module-specific XP amount
   d. Learning Level advance condition evaluated (FR-LEARN-17)
   e. Next module unlock conditions re-evaluated

2. System navigates to Module Completion Reward Screen:
   → AmbientBackground activates (lime + plasma orbs, pulse-glow 3000ms)
   → Confetti burst: 300 particles, lime + plasma, 1500ms one-shot

3. Badge reveal animation:
   → BadgeCard scales in: 0 → 1.05 → 1.0 (300ms ease-spring)
   → Badge border color and width reflect rarity:
     M1: "Market Foundations" — Common (#9CA3AF, 1px)
     M2: "First Trader"       — Common (#9CA3AF, 1px)
     M3: "Portfolio Thinker"  — Uncommon (#34D399, 2px, ✦ symbol)
     M4: "Market Scholar"     — Rare (#60A5FA, 3px, ★ symbol)

4. XP chips appear (staggered, 150ms gap):
   → Chip 1: "+N XP (5 bài học)" — always present
   → Chip 2: "+N XP (Module hoàn thành)" — M3: +25 XP, M4: +75 XP only
   [M1 and M2 show only ONE chip; M3 and M4 show TWO chips]

5. Level-up banner (conditional):
   → Shown only if advance condition for next learning level is met
   → Slides up (400ms ease-decelerate), plasma-glow surface
   → "Level Up: [New Level Name]"

6. Module-specific CTA:
   M1: "Bắt đầu Module 2 →" → navigates to Learning Path Home
   M2: "Xem tiền thưởng →"  → opens Bonus Cash Modal (step 7)
   M3: "Tiếp tục Module 4 →"→ navigates to Learning Path Home (M4 unlocks if prerequisites met)
   M4: "Chia sẻ thành tích →" → share screen / Tier 2 community post

7. M2 BONUS CASH MODAL (fires automatically on M2 completion):
   → Bottom sheet slides up (400ms), full-height, ink-800, radius-4xl
   → Displays: 50,000,000 ₫ (display-md, lime, tabular)
   → Detail rows: 7-day expiry, force-liquidation warning (negative color), no real cash
   → GlassmorphicSecurityInfo: "Danh mục ảo 100% an toàn"
   → CTAs:
     [PRIMARY]   "Xem danh mục ảo →" → navigate to Portfolio tab; bonus cash ledger visible
     [SECONDARY] "Tiếp tục học Module 3" → dismiss sheet; return to Grow tab

8. M2 BONUS CASH LIFECYCLE (FR-LEARN-11):
   → Credit timestamp recorded (T+0)
   → T+6 (24h before expiry): push notification + expiry warning banner in Portfolio
   → T+7 (00:00 VNST): force-liquidation of ALL bonus cash positions
     → ledger balance → 0
     → positions force-closed at market open price
     → "ĐÃ THANH LÝ" label shown in Portfolio bonus cash row
   → User's regular virtual portfolio is NOT affected

9. IDEMPOTENCY GUARANTEE:
   → If reward screen is interrupted (force-kill, network error):
     → Badge is already awarded server-side (idempotent key committed)
     → XP is already granted server-side (separate idempotent key)
     → On relaunch: module shows COMPLETE; badge in My Badges; XP in profile
     → Reward animation does NOT replay
```

---

## 3. Acceptance Criteria

```
Given  user passes M1 MKC (score ≥ 3/5)
When   Module Completion Reward Screen renders
Then   "Market Foundations" badge shown with Common rarity (1px #9CA3AF border)
       AND "+125 XP (5 bài học)" chip shown (ONE chip only, no bonus XP for M1)
       AND confetti burst plays once

Given  user passes M3 MKC
When   Module Completion Reward Screen renders
Then   "Portfolio Thinker" badge shown with Uncommon rarity (2px #34D399 border, ✦ symbol)
       AND TWO XP chips shown: "+125 XP (5 bài học)" AND "+25 XP (Module hoàn thành)"

Given  user passes M4 MKC
When   Module Completion Reward Screen renders
Then   "Market Scholar" badge shown with Rare rarity (3px #60A5FA border, ★ symbol, glow)
       AND TWO XP chips: "+125 XP (5 bài học)" AND "+75 XP (Module hoàn thành)"
       AND Tier 2 community access granted server-side

Given  user passes M2 MKC and taps "Xem tiền thưởng →"
When   Bonus Cash Modal opens
Then   50,000,000 ₫ displayed in lime display-md; 7-day expiry stated;
       force-liquidation warning visible; GlassmorphicSecurityInfo shown

Given  M2 bonus cash has been credited and 7 days have elapsed (T+7)
When   T+7 timestamp (00:00 VNST) is reached
Then   All bonus cash positions force-liquidated; bonus ledger = 0;
       regular virtual portfolio unaffected

Given  user force-kills app immediately after MKC pass (before reward screen renders)
When   user relaunches and navigates to Grow tab
Then   module shows COMPLETE; badge visible in My Badges; XP applied;
       reward animation does NOT replay
```

---

## 4. Design Analysis

### 4.1 Screens & Wireframes Involved

| Screen | Wireframe Ref | Purpose |
|--------|--------------|---------|
| Module Completion Reward Screen | Screen 16 | Celebrate module completion; reveal badge + XP |
| Module 2 Bonus Cash Modal | Screen 17 | Reveal 50M VND bonus cash; explain rules |

### 4.2 Design Decisions & Rationale

**Decision 1: BadgeCard uses rarity-specific border widths and colors (not a single style)**
Rarity borders are a game design convention that F0 users will learn and associate with achievement value. Common = thin, grey; Rare = thick, blue with glow. This creates a progression arc — when users see the blue Rare border for Market Scholar (M4), it communicates that reaching M4 is significantly more valuable than M1/M2. The design makes this tangible without requiring text explanation.

**Decision 2: M3 and M4 show TWO separate XP chips, not a total**
The business requirement (OQ-06 resolved) specified separate lines. The design rationale: showing the breakdown ("125 XP from lessons" + "25 XP bonus") communicates that each source of XP is distinct and earned separately. A combined "150 XP" number is less motivating than seeing two rewards stack visually.

**Decision 3: Confetti uses lime + plasma particles (not a single color)**
Using both brand accent colors in the confetti creates a "full celebration" moment. Lime alone would feel too focused; a rainbow would break the design system. Lime + plasma covers both "growth" and "identity milestone" — both are achieved at module completion.

**Decision 4: Level-up banner uses plasma, not lime**
Level up is an identity transition (not just an action reward). Plasma (#D277FF) is the design system's identity/alert accent — used for learning level, badge identity, and personal milestone signals. Using lime here would conflate level advancement with a CTA, which is wrong. The plasma banner is visually distinct and signals a different kind of reward.

**Decision 5: Bonus Cash Modal uses GlassmorphicSecurityInfo for the safety notice**
The existing `GlassmorphicSecurityInfo` component (from auth flow) carries established trust semantics. Users who completed registration saw this component during the "Kinetic Security Protocol" step. Reusing it here for the paper trading safety notice creates an implicit association: "this is the same kind of verified, safe system."

**Decision 6: Force-liquidation warning uses `negative` color (#EF4444)**
The T+7 force-liquidation is a strict business rule — funds are lost after 7 days regardless of market conditions. Using `negative` color (the app's loss/error signal) for this warning is intentionally alarming. The design does not soften this warning because the consequence is real (within the virtual portfolio context) and the user needs to act.

**Decision 7: Reward animation does NOT replay on relaunch (idempotency at UI level)**
Even though the server events are idempotent, the UI should not re-animate if the user returns to the reward screen later. The animation is a one-time celebratory moment. On subsequent visits, the module shows COMPLETE state in the Grow tab — no second confetti, no second badge scale animation.

### 4.3 Component Usage

| Component | Source | Variant / State | Role |
|-----------|--------|----------------|------|
| `BadgeCard` | `DESIGN-F0-LEARN-04` (new) | reward (rarity-specific) | Badge reveal with rarity border + animation |
| `AmbientBackground` | `components.md` (existing) | default (enhanced) | Full-screen atmosphere for celebration |
| `KineticButton` | `components.md` (existing) | lime | Module-specific CTA (primary action) |
| `KineticButton` | `components.md` (existing) | ghost | "Quay về Grow" secondary action |
| `GlassmorphicSecurityInfo` | `components.md` (existing) | default | Bonus Cash Modal safety notice (M2 only) |
| `BonusCashModal` | `DESIGN-F0-LEARN-04` (new) | default | Bottom sheet for 50M VND bonus cash (M2 only) |
| XP Chips | Inline chip (`xp-pill-bg`) | × 1 or × 2 | XP breakdown display |
| Level-up Banner | Inline (not a standalone component) | conditional | Plasma-glow banner for level advancement |
| Confetti burst | Animation (not a component) | one-shot | Celebration particle effect |

### 4.4 Interaction Rules Applied

| Rule | Trigger | Screen |
|------|---------|--------|
| IR-19 | MKC pass → reward screen renders | Screen 16: badge scales in, confetti, chips stagger |
| IR-23 | Tap "Xem danh mục ảo →" in BonusCashModal | Sheet dismisses; navigate to Portfolio with bonus ledger |

### 4.5 Edge Cases — UI Handling

| Case | Code | UI Response |
|------|------|-------------|
| M2 bonus cash 24h before expiry | EC-07 | Push notification + expiry warning banner in Portfolio (negative bg, ⚠ icon, countdown chip) |
| Force-kill during reward screen | (idempotency) | Module shows COMPLETE on relaunch; badge/XP already applied; no re-animation |
| M4 Tier 2 grant fails server-side | (risk) | Show error toast; retry on next app launch; badge/XP still awarded separately |

---

## 5. Business ↔ Design Alignment

| FR | Requirement | Screen | Component | IR | TC |
|----|-------------|--------|-----------|----|----|
| FR-LEARN-09 | Badge award per module | Screen 16 | BadgeCard (rarity-specific) | IR-19 | TC-41, TC-43 |
| FR-LEARN-09 | M3/M4 two XP chips | Screen 16 | Two xp-pill chips | — | TC-42, TC-43 |
| FR-LEARN-09 | Market Scholar = Rare (#60A5FA, 3px, ★) | Screen 16 | BadgeCard rarity-rare | — | TC-43 |
| FR-LEARN-09 | Idempotency on reward | Screen 16 | Server idempotency keys | — | TC-45 |
| FR-LEARN-10 | 50M VND bonus cash on M2 | Screen 17 | BonusCashModal | IR-19 | TC-44 |
| FR-LEARN-10 | 7-day TTL stated | Screen 17 | Detail row (negative color) | — | TC-44 |
| FR-LEARN-10 | "View Portfolio" CTA | Screen 17 | KineticButton lime | IR-23 | TC-44 |
| FR-LEARN-11 | Force-liquidation at T+7 | Portfolio tab | Expiry banner | — | (Portfolio TC) |
| FR-LEARN-11 | T+6 expiry warning | Push + Portfolio | Notification + banner | EC-07 | — |

---

## 6. QA Test Cases

| TC | Scenario | Expected Result |
|----|----------|----------------|
| TC-41 | M1 reward screen | "Market Foundations" badge (Common, 1px #9CA3AF); ONE XP chip "+125 XP" |
| TC-42 | M3 reward screen | "Portfolio Thinker" (Uncommon, 2px #34D399, ✦); TWO chips: "+125 XP" + "+25 XP" |
| TC-43 | M4 reward screen | "Market Scholar" (Rare, 3px #60A5FA, ★, glow); TWO chips: "+125 XP" + "+75 XP" |
| TC-44 | M2 Bonus Cash Modal | "50,000,000 ₫" in lime; expiry warning in negative color; GlassmorphicSecurityInfo present |
| TC-45 | Force-kill during reward screen | Module COMPLETE on relaunch; badge in My Badges; XP applied; no re-animation |

---

## 7. Design Gaps / Risks

| # | Gap / Risk | Severity | Recommendation |
|---|-----------|----------|---------------|
| G-D-01 | The level-up banner is shown "if advance condition is met" but no design spec defines what happens if multiple level-up conditions are met simultaneously (e.g., a user completes M4 and advances two levels). | Low | Show only the highest new level banner; log intermediate levels in the background. |
| G-D-02 | The M4 "Chia sẻ thành tích" CTA routes to a "share screen" that is not designed in the F0 Learning Path spec. This is likely a V2 feature referenced without a defined screen. | High | Block the CTA in V1 with a "Sắp ra mắt" state (disabled + fog-muted); route to Grow tab instead. |
| G-D-03 | BonusCashModal does not define a loading state for the "Xem danh mục ảo" navigation. If Portfolio tab data is slow to load, the transition may feel broken. | Low | Add standard tab loading skeleton (already exists in Portfolio tab). |

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| FRD: F0 Learning Path | `docs/business/frd/module-f0-learning.md` |
| Gamification FRD (badge awards) | `docs/business/frd/module-c-gamification-extended.md` |
| Flow E — MKC | `docs/business/frd/module-f0-flow-e-mkc.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Screen Wireframes (Screens 16, 17) | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| Component Specs (BadgeCard, BonusCashModal) | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules (IR-19, IR-23, EC-07) | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| UI State Matrices (BadgeCard rarity scale) | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |
