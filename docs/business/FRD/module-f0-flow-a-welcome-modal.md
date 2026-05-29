# Flow A — Post-Registration Welcome Modal

Version: 1.0 | Date: 2026-05-28 | FR References: FR-LEARN-01
Linked FRD: docs/business/frd/module-f0-learning.md

---

## 1. Flow Summary

| Field | Detail |
|-------|--------|
| **Actor** | New User — F0 Trader (age 16–27, zero prior trading knowledge, first app launch post-registration) |
| **Trigger** | Account status transitions to `ACTIVE`; first app launch; `welcome_modal_shown = false` on server |
| **Precondition** | User has completed registration. `welcome_modal_shown = false` for this `user_id`. Account status = `ACTIVE`. |
| **Exit States** | (A) User navigates directly to L1.1 Card 1 via "Start Module 1"; (B) User lands on Home tab via "Explore first"; (C) User enters Placement Quiz via tertiary CTA |
| **FR References** | FR-LEARN-01 (Welcome Modal), FR-LEARN-19 (Placement Quiz entry via tertiary link) |
| **Design Ref** | DESIGN-F0-LEARN-01, DESIGN-F0-LEARN-02 (Screen 1), DESIGN-F0-LEARN-04 (AmbientBackground, KineticButton, Lottie) |

---

## 2. Business Flow

```
1. System receives first app launch event for authenticated user_id
   ├── [Account status ≠ ACTIVE]
   │     → Modal suppressed; proceed to Home tab; retry on status transition
   └── [Account status = ACTIVE]
         → Check welcome_modal_shown flag via server (GET /user-onboarding-state)

2. Flag check result:
   ├── [welcome_modal_shown = true]
   │     → Skip modal; route to Home tab normally
   └── [welcome_modal_shown = false]
         → Write welcome_modal_shown = true ATOMICALLY before rendering modal
           (server-side write; precedes any user interaction)
         → Render Welcome Modal full-screen over Home tab

         [EC-01: Network unavailable at flag check]
           → Modal suppressed; Home tab loads normally; no error shown
           → Flag verification queued for retry on reconnect
           → Modal fires on next app launch once flag confirmed false

3. Welcome Modal renders with:
   - AmbientBackground (lime + plasma animated orbs)
   - Lottie asset: lottie_welcome_learning.json (3s play → hold final frame)
     [EC-07: Lottie asset fails to load → static PNG fallback: img_welcome_learning_static.png]
   - Headline: "Học chứng khoán, không cần kinh nghiệm" (display-md, lime-soft)
   - Body: Value proposition copy (max 60 words)
   - L1.1 lesson preview thumbnail: lesson icon + "Cổ phiếu là gì?"
   - Three CTAs (all active during animation — NOT gated on Lottie completion):
       [1] Primary   "Bắt đầu Module 1"          — KineticButton lime
       [2] Secondary "Khám phá trước"             — KineticButton ghost
       [3] Tertiary  "Tôi đã biết chứng khoán cơ bản" — text link, plasma color

4. User selects a CTA path:

   PATH A — Primary CTA: "Bắt đầu Module 1" (IR-01)
   ├── Modal dismisses (fade out, 300ms)
   ├── welcome_modal_shown already written (step 2); no duplicate write needed
   ├── System creates session_progress record for L1.1 (card_index = 0)
   ├── Navigate directly to L1.1 Card 1 (Concept card)
   └── [Grow tab NOT visited as intermediate step]

   PATH B — Secondary CTA: "Khám phá trước" (IR-02)
   ├── welcome_modal_shown = true (already set at render; confirmed state)
   ├── Modal dismisses (fade out, 300ms)
   ├── User lands on Home tab (no navigation change)
   └── Grow tab: LearningPromptCard shown at top on next visit (conditional render)

   PATH C — Tertiary Link: "Tôi đã biết chứng khoán cơ bản" (IR-03)
   ├── Navigate to Placement Quiz intro screen (slideUp, 400ms)
   ├── welcome_modal_shown NOT yet confirmed as true until Placement Quiz intro renders
   └── [Proceeds to Flow F — Initial Placement Quiz]

5. Post-modal state:
   - welcome_modal_shown = true persists on server indefinitely
   - Uninstall / reinstall: flag is server-side; modal never re-fires for this user_id
   - Force-kill after render: flag already written in step 2; modal not shown on relaunch (EC-06)
```

---

## 3. Acceptance Criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User has just created an account (status = `ACTIVE`) and opens the app for the first time | App reaches the Home tab render | Welcome Modal is displayed full-screen before any Home tab content is interactive; `welcome_modal_shown` = true is written to server before modal paints |
| AC-02 | Welcome Modal is visible | User taps "Bắt đầu Module 1" | Modal dismisses (300ms fade); user navigated directly to L1.1 Card 1; Grow tab is NOT an intermediate stop; session_progress for L1.1 created with card_index = 0 |
| AC-03 | Welcome Modal is visible | User taps "Khám phá trước" | Modal dismisses (300ms fade); user lands on Home tab; LearningPromptCard appears in Grow tab on next visit |
| AC-04 | User dismissed modal via "Khám phá trước" on first session | User closes and reopens the app | Welcome Modal does NOT appear; user lands on Home tab |
| AC-05 | User force-kills the app immediately after modal renders (before tapping any CTA) | User reopens the app | Welcome Modal does NOT appear again (flag written at render, not on CTA tap) |
| AC-06 | User uninstalls and reinstalls the app | User logs in to the same account | Welcome Modal NOT shown (flag persisted server-side) |
| AC-07 | Network unavailable on first launch | App opens | Welcome Modal NOT shown; app loads Home tab; no error message displayed |
| AC-08 | User taps tertiary CTA "Tôi đã biết chứng khoán cơ bản" | CTA tap fires (IR-03) | Placement Quiz intro screen opens (slideUp 400ms); back navigation to Welcome Modal remains available from intro screen only |

---

## 4. Design Analysis

### 4.1 Screens & Wireframes Involved

| Screen Name | Wireframe Ref | Purpose |
|-------------|---------------|---------|
| Welcome Modal | DESIGN-F0-LEARN-02 / Screen 1 | One-time onboarding modal fired at first launch; primary entry point into the F0 Learning Path |
| L1.1 Card 1 — Concept | DESIGN-F0-LEARN-02 / Screen 6 | Destination for Path A (Primary CTA) — first lesson, first card |
| Home Tab | DESIGN-F0-LEARN-02 / Screen 0 (base) | Destination for Path B (Secondary CTA) |
| Placement Quiz Intro | DESIGN-F0-LEARN-02 / Screen 19 | Destination for Path C (Tertiary CTA) |

### 4.2 Design Decisions & Rationale

**Decision 1: Flag written at render, not on CTA tap**

The `welcome_modal_shown` flag is written server-side atomically when the modal is rendered, not when the user taps a CTA. This is the single most important design decision in Flow A.

Why: If the flag were written only on CTA tap, a force-kill between modal render and tap would leave the flag as `false`. On relaunch the modal would fire again, creating a loop. Since the modal is one-time by design (FR-LEARN-01), the server-side atomic write at render is the only safe implementation. This pattern also handles concurrent sessions (two devices on first launch) — the server write is idempotent, so only one device ever sees `flag = false`.

**Decision 2: CTAs active during animation**

The three CTA buttons are interactive during the Lottie animation, not gated on its 3-second completion. This is intentional: F0 users are typically impatient (age 16–27), and gating action on animation completion creates friction with no business benefit. A motivated user who wants to start immediately should not be blocked by decorative animation.

**Decision 3: No close / dismiss button**

The modal has no X button or tap-outside dismiss gesture. The only exits are the three explicit CTAs. This is deliberate: the modal is the highest-priority onboarding moment in the app. Allowing passive dismissal (tap outside) would let users skip it accidentally, potentially never seeing the learning path prompt. The three CTAs ensure every user makes an explicit, intentional choice — even "Explore first" is a choice that keeps the learning path visible via the LearningPromptCard.

**Decision 4: One KineticButton lime per viewport**

Only the primary CTA ("Bắt đầu Module 1") uses the `KineticButton lime` variant. The secondary CTA uses `ghost`, and the tertiary is a plain text link. The design system rule — only one lime button per viewport — prevents visual competition and preserves the lime button's meaning as "the most important action on this screen." If both primary and secondary were lime, neither would read as primary.

**Decision 5: Tertiary CTA routed to Placement Quiz, not to a module skip**

The tertiary CTA does not simply skip M1; it routes to a Placement Quiz (FR-LEARN-19). A user who claims prior knowledge is given the chance to prove it (≥4/5 correct), and only then is M1 bypassed. This protects the learning path's pedagogical integrity — if the quiz were bypassed entirely, users might skip foundational content and fail later modules.

**Decision 6: Static PNG fallback for Lottie**

The Lottie asset (`lottie_welcome_learning.json`) requires a network load on first launch, when network quality is uncertain. The static PNG fallback (`img_welcome_learning_static.png`) ensures the modal renders instantly without a blank animation zone. The fallback is transparent to the user — the same headline and CTAs are present.

### 4.3 Component Usage

| Component | Variant / State | Trigger / Context |
|-----------|-----------------|-------------------|
| `AmbientBackground` | default | Renders automatically when Welcome Modal mounts; lime + plasma animated orbs |
| `KineticButton` | `lime` | "Bắt đầu Module 1" — primary CTA; exactly one per modal viewport |
| `KineticButton` | `ghost` | "Khám phá trước" — secondary CTA |
| Lottie asset | `lottie_welcome_learning.json` | Auto-plays for 3 seconds then holds final frame; no interaction required |
| Static PNG | `img_welcome_learning_static.png` | Fallback when Lottie fails to load (EC-07 / TC-07) |
| Text link (plasma) | — | "Tôi đã biết chứng khoán cơ bản" — tertiary CTA; plasma color signals identity/alternate path |
| L1.1 thumbnail | — | Lesson preview: icon + "Cổ phiếu là gì?" — visual anchors the learning path promise |

### 4.4 Interaction Rules Applied

| IR # | Description | Screen / Trigger |
|------|-------------|-----------------|
| IR-01 | Primary CTA tap → modal fade out 300ms → navigate to L1.1 Card 1 | Welcome Modal: "Bắt đầu Module 1" |
| IR-02 | Secondary CTA tap → modal fade out → user lands on Home tab; Grow tab queues LearningPromptCard | Welcome Modal: "Khám phá trước" |
| IR-03 | Tertiary link tap → slideUp to Placement Quiz intro (400ms); welcome_modal_shown not yet confirmed set | Welcome Modal: tertiary text link |

### 4.5 Edge Cases — UI Handling

| EC # | Description | Design Response |
|------|-------------|-----------------|
| EC-01 | Network unavailable on first launch; flag check returns timeout/error | Modal suppressed silently; Home tab loads normally; no error banner; flag retry queued; modal fires on next launch |
| EC-06 | User force-kills app after modal renders but before any CTA tap | Flag already written at render; modal not shown on relaunch; user continues normally from Home tab |
| EC-07 (TC-07) | Lottie asset fails to load (CDN or network error) | Static PNG fallback rendered instantly; CTAs remain active and functional; no visible error state |
| — | Account status = `PENDING_VERIFICATION` at first launch | Modal suppressed; shown only when account status transitions to `ACTIVE` |
| — | Concurrent sessions (two devices, same account, simultaneous first launch) | Server-side atomic write; at most one device fires the modal; second device may show modal if flag write has not propagated (acceptable; idempotent downstream) |

---

## 5. Business ↔ Design Alignment

| FR | Requirement | Screen | Component | IR | TC |
|----|-------------|--------|-----------|----|----|
| FR-LEARN-01 | Welcome Modal shown once per account on first launch | Screen 1 (Welcome Modal) | `AmbientBackground`, Lottie / PNG fallback | IR-01, IR-02, IR-03 | TC-01, TC-04, TC-05 |
| FR-LEARN-01 (flag write) | `welcome_modal_shown` written at render, not on CTA tap | Screen 1 | (server-side; no UI component) | — | TC-05 |
| FR-LEARN-01 (primary path) | "Start Module 1" → navigate to L1.1 Card 1 | Screen 1 → Screen 6 (L1.1 C1) | `KineticButton` lime | IR-01 | TC-02 |
| FR-LEARN-01 (secondary path) | "Explore first" → Home tab; LearningPromptCard shown in Grow | Screen 1 → Home | `KineticButton` ghost | IR-02 | TC-03, TC-14 |
| FR-LEARN-01 (Lottie) | Animation plays 3s, holds; fallback PNG if asset fails | Screen 1 | Lottie asset + static PNG | — | TC-07 |
| FR-LEARN-01 (CTAs active during anim) | All three CTAs interactive during Lottie playback | Screen 1 | All three CTA elements | IR-01, IR-02, IR-03 | TC-01 |
| FR-LEARN-01 (EC-01 network) | Modal suppressed on network failure; retried on reconnect | — (silent) | — | — | TC-08 |
| FR-LEARN-19 (tertiary entry) | Tertiary CTA routes to Placement Quiz | Screen 1 → Screen 19 | Text link (plasma) | IR-03 | TC-06 |

---

## 6. QA Test Cases

| TC # | Scenario | Steps | Expected Result |
|------|----------|-------|-----------------|
| TC-01 | Welcome Modal — first launch (happy path) | 1. Create new account (status = ACTIVE). 2. Open app for the first time. | Welcome Modal appears full-screen over Home tab. Lottie plays. All 3 CTAs visible and active. `welcome_modal_shown = true` written to server at modal render. |
| TC-02 | Welcome Modal — "Start Module 1" tap | 1. Welcome Modal visible. 2. Tap "Bắt đầu Module 1". | Modal dismisses (300ms fade). User navigated directly to L1.1 Card 1 (Concept). Grow tab NOT visited. session_progress created for L1.1 card_index=0. |
| TC-03 | Welcome Modal — "Explore first" tap | 1. Welcome Modal visible. 2. Tap "Khám phá trước". | Modal dismisses. User lands on Home tab. On next Grow tab visit: LearningPromptCard shown at top. |
| TC-04 | Welcome Modal — NOT shown on second launch | 1. Tap "Khám phá trước" on first launch. 2. Close app. 3. Reopen app. | Welcome Modal does NOT appear. User lands on Home tab directly. |
| TC-05 | Welcome Modal — force-kill after render | 1. App first launch → modal renders. 2. Force-kill app immediately (before tapping any CTA). 3. Reopen. | Welcome Modal does NOT appear again. Flag was written at render, not on CTA tap. |
| TC-06 | Welcome Modal — tertiary "I already know" CTA | 1. Welcome Modal visible. 2. Tap "Tôi đã biết chứng khoán cơ bản". | Placement Quiz intro screen opens (slideUp 400ms). Back navigation available on intro screen. |
| TC-07 | Welcome Modal — Lottie fallback | 1. Block Lottie asset download (network condition or mock failure). 2. First app launch. | Static PNG fallback displayed in animation zone. All 3 CTAs remain active and functional. No error message shown. |
| TC-08 | Welcome Modal — network unavailable on first launch | 1. Set device to airplane mode. 2. First app launch. | Welcome Modal NOT displayed. Home tab loads. No error banner shown. Modal fires on next launch when network available. |

---

## 7. Design Gaps / Risks

| # | Gap / Risk | Severity | Notes |
|---|------------|----------|-------|
| 1 | **Flag write race condition on slow network**: If the atomic server write of `welcome_modal_shown = true` is still in-flight when the user taps "Start Module 1" and the app is simultaneously force-killed, there is a theoretical window where the flag write fails AND the flag was never set. On relaunch the modal fires again, but the user navigates to L1.1 again. This is the acceptable idempotency fallback. Risk is low — window is milliseconds. | Low | Monitor server write error rate; implement client-side optimistic flag as a secondary guard if production error rate exceeds 0.1%. |
| 2 | **Tertiary CTA copy length**: "Tôi đã biết chứng khoán cơ bản" (27 characters) may overflow a single line on small devices (360×780). If it wraps to two lines, the modal layout shifts. Confirm with design that the text link has `max-width: 280px, text-align: center, flex-wrap: wrap`. | Medium | Test on Galaxy A55 (360×780) per platform rules in DESIGN-F0-LEARN-03 §4. |
| 3 | **No explicit "skip" for Account PENDING_VERIFICATION users**: The FRD states the modal is suppressed for `PENDING_VERIFICATION` accounts but does not specify what happens when verification is completed while the app is open. The system should re-evaluate and show the modal on the next Home tab render without requiring an app restart. This state transition handler is not explicitly designed. | Medium | Open question for engineering: does the verification status change trigger a push event to the client, or does the client need to poll on Home tab focus? |
| 4 | **LearningPromptCard conditional logic**: The FRD (FR-LEARN-02) states LearningPromptCard appears when `welcome_modal_shown = true` AND no active lesson in progress. The component spec (DESIGN-F0-LEARN-04) states it is hidden "once user starts a lesson." These two conditions are slightly different — the component spec version is stricter. Clarify: does LearningPromptCard hide after the first lesson is started (even if not completed), or only after the first lesson is completed? | Low | See also TC-15 in QA (hides after 1 lesson complete). Align component spec with FRD. |

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| FRD: F0 Learning Path | `docs/business/frd/module-f0-learning.md` |
| UX Flows (Business) | `docs/business/frd/module-f0-learning-ux-flows.md` |
| Gamification FRD | `docs/business/frd/module-c-gamification-extended.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Design Alignment + Tokens | `docs/design/DESIGN-F0-LEARN-00-alignment.md` |
| UX Flows (Design Detail) | `docs/design/DESIGN-F0-LEARN-01-ux-flows.md` |
| Screen Wireframes | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| UI Specification | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |
| Component Specs | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| QA Test Cases | `docs/design/DESIGN-F0-LEARN-06-qa-cases.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |
