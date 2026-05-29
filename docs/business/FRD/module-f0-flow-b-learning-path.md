# Flow B — Learning Path Navigation (Grow Tab)
**Version:** 1.0 | **Date:** 2026-05-28 | **FR References:** FR-LEARN-02, FR-LEARN-08, FR-LEARN-12
**Linked FRD:** `docs/business/frd/module-f0-learning.md`

---

## 1. Flow Summary

| Field | Detail |
|-------|--------|
| Actor | F0 Trader (new or returning) |
| Trigger | User taps Tab 2 (Grow) → Learning Path sub-nav pill |
| Precondition | User is authenticated; account status = ACTIVE |
| Exit State A | User enters a lesson (taps unlocked module card) → Lesson Viewer (Flow C) |
| Exit State B | User taps locked module → tooltip shown; no navigation |
| Exit State C | User taps "Bắt đầu Module 1" from Daily Missions locked banner |
| Exit State D | All 4 modules complete → "Path Complete" celebration state |
| FR References | FR-LEARN-02, FR-LEARN-08, FR-LEARN-12 |
| IR References | IR-16, IR-20, EC-05 |
| TC References | TC-09 through TC-15, TC-48, TC-49 |

---

## 2. Business Flow

```
1. User taps Tab 2 (Grow) → sub-nav pill 1 (Learning Path)
   → System fires GET /module-progress?userId=X
   → Skeleton loaders shown (3 card shapes) while fetching

   ├── [API returns within 3s]   → render module cards (step 2)
   ├── [API times out / errors]  → error state + "Thử lại" retry button
   └── [Retry tapped]            → re-fire API call

2. System evaluates module states IN REAL-TIME on every tab load:

   Module 1: always UNLOCKED (auto-unlocked at registration)
   Module 2: LOCKED unless M1 status = COMPLETE
   Module 3: LOCKED unless M2 status = COMPLETE AND user.paper_trades_count ≥ 3
   Module 4: LOCKED unless M3 status = COMPLETE
              AND user.distinct_trading_days ≥ 5
              (trading day = DATE(placed_at AT TIME ZONE 'Asia/Ho_Chi_Minh'))

3. Conditional: if welcome_modal was dismissed via "Explore first"
   → LearningPromptCard rendered at top of module list

4. User views module list (M1 → M4). Each card shows its current state:

   UNLOCKED (not started):
   ├── Full-color card, "MODULE N" eyebrow, lime-soft title
   ├── "Bắt đầu →" KineticButton lime
   └── Tap → navigate to L{n}.1 Card 1

   IN_PROGRESS:
   ├── Lime 1.5px left-accent border, progress bar (N/5 lessons)
   ├── "Tiếp tục →" KineticButton lime
   └── Tap → resume at last saved card_index of last incomplete lesson

   COMPLETE:
   ├── Positive border, 100% progress bar, "✓ Hoàn thành" state badge
   ├── "Ôn lại" KineticButton ghost
   └── Tap → lesson list in read-only review mode

   LOCKED:
   ├── locked-surface overlay (ink-800 + opacity-40), padlock icon, fog-muted text
   ├── No CTA button rendered
   └── Tap → tooltip: "Hoàn thành [Module N-1] để mở khóa" (2500ms auto-hide)

5. Daily Missions section (below module list):
   ├── [M1 not complete] → LOCKED state (blurred placeholders, unlock banner)
   │     Banner CTA: "Bắt đầu Module 1 →" → navigates to M1 first lesson
   └── [M1 complete]     → Active mission list shown

6. Real-time unlock event (EC-05):
   → If user places ≥3 paper trades while on this screen
   → M3 card transitions LOCKED → UNLOCKED
   → Border pulses lime once (600ms), micro-toast: "MODULE 3 MỞ KHÓA!"

7. All 4 modules complete:
   → "Path Complete" celebration state rendered
   → Confetti burst (lime + plasma, 1500ms one-shot)
   → All cards show COMPLETE with checkmarks
```

---

## 3. Acceptance Criteria

```
Given  user opens Grow tab while M1 is in progress (3/5 lessons done)
When   Learning Path screen loads
Then   M1 card shows IN_PROGRESS state with 60% progress bar
       AND M2, M3, M4 cards show LOCKED state

Given  user taps a LOCKED module card
When   tap event fires
Then   tooltip shows prerequisite message; auto-hides after 2500ms
       AND no navigation occurs

Given  API fails to return module data within 3 seconds
When   skeleton loader is still visible
Then   error state shown with "Thử lại" retry button
       AND no partial data is displayed

Given  user has completed all 5 lessons in M1 but has NOT passed M1 MKC
When   Learning Path screen loads
Then   M1 shows IN_PROGRESS (COMPLETE only after MKC pass)
       AND M2 remains LOCKED

Given  user completes all 4 modules
When   Learning Path screen loads
Then   "Path Complete" state shown; confetti burst plays once; all modules show COMPLETE

Given  Daily Missions section is visible and M1 is not complete
When   user views the section
Then   missions are blurred/locked; unlock banner shown with "Bắt đầu Module 1 →" CTA

Given  user taps sub-nav pill other than "Learning Path"
When   tap fires
Then   content area transitions to selected section; active pill shows lime underline
```

---

## 4. Design Analysis

### 4.1 Screens & Wireframes Involved

| Screen | Wireframe Ref | Purpose |
|--------|--------------|---------|
| Learning Path Home (Grow Tab) | `DESIGN-F0-LEARN-02` Screen 5 | Central hub — 4 module cards, sub-nav, XP display |
| Daily Missions — Locked State | `DESIGN-F0-LEARN-02` Screen 18 | Motivation trigger to complete M1; locked gate visualization |

### 4.2 Design Decisions & Rationale

**Decision 1: Real-time unlock evaluation (not event-based)**
Module unlock state is evaluated fresh every time the Learning Path screen loads, not only when a prerequisite event fires. This means a user who completed 3 paper trades yesterday, then opens the app today, will see M3 unlocked without any explicit notification or manual refresh. The design supports this with no cached state — the API call in step 1 always returns current state.

**Decision 2: Only ONE KineticButton lime per viewport**
The design system rule (`components.md`) limits one `lime` variant button per viewport. On the Learning Path screen with 4 module cards, this creates a visual hierarchy challenge. The solution: only the topmost eligible module (the one the user should act on next) renders a `lime` CTA; lower modules use `ghost` variant. This funnels attention to the next action.

**Decision 3: Locked card tap shows tooltip, not bottom sheet**
A bottom sheet for locked module info would feel heavy and suggest content is available. A 2500ms auto-hide tooltip conveys the prereq message without creating false affordance. The tooltip anchors to the card center so the spatial relationship between "this locked card" and "why it's locked" is clear.

**Decision 4: Daily Missions unlock banner uses lime border (not greyed like locked modules)**
The Daily Missions locked state is designed to motivate, not discourage. Unlike locked module cards (greyed overlay + padlock), the unlock banner uses a `lime` border and a full-color "Bắt đầu Module 1 →" CTA. The visual language signals "this is achievable and close" rather than "this is blocked."

**Decision 5: LearningPromptCard is conditional on welcome modal dismissal**
The card is shown only when `welcome_modal_shown = true` AND the user entered via "Khám phá trước" (not via "Start Module 1" which takes them directly to L1.1). It persists until the user starts a lesson. This prevents double-prompting users who are already in the learning flow.

**Decision 6: Module card IN_PROGRESS uses left-accent border (not full border)**
A full `lime` border would compete with the UNLOCKED card's standard border. A 1.5px left-accent border is a directional affordance — it visually "pulls" the card to the right (toward the next action), communicates progress, and maintains hierarchy without noise.

### 4.3 Component Usage

| Component | Source | Variant / State | Role |
|-----------|--------|----------------|------|
| `ModuleCard` | `DESIGN-F0-LEARN-04` (new) | locked / unlocked / in-progress / complete | 4 instances for M1–M4 |
| `LearningPromptCard` | `DESIGN-F0-LEARN-04` (new) | default | Conditional prompt for "explored first" users |
| `KineticButton` | `components.md` (existing) | `lime` | One per viewport — topmost eligible module CTA |
| `KineticButton` | `components.md` (existing) | `ghost` | "Ôn lại" for complete modules; lower unlocked modules |
| `PaaveWordmark` | `components.md` (existing) | `sm` | Top-nav branding |
| XP Pill | Inline chip (not a component) | static | "250 XP" display in header |
| Skeleton loaders | Inline (not a component) | loading | Data fetch placeholder |

### 4.4 Interaction Rules Applied

| Rule | Trigger | System Response |
|------|---------|----------------|
| IR-16 | Tap LOCKED ModuleCard | Tooltip fades in from card center (200ms); auto-hides 2500ms; no navigation |
| IR-20 | Tap sub-nav pill | Content area cross-fades 300ms; active pill gets lime underline |
| EC-05 | ≥3 paper trades placed while screen is open | M3 card pulses lime border (600ms); micro-toast "MODULE 3 MỞ KHÓA!" 2500ms |

### 4.5 Edge Cases — UI Handling

| Case | Code | UI Response |
|------|------|-------------|
| module_progress API fails after 3s | (FC-B-01) | Error state with "Thử lại" retry button; no partial data shown |
| M3 trade prerequisite met mid-session | EC-05 | M3 card LOCKED → UNLOCKED with lime pulse; micro-toast notification |
| M3 locked but trade count met before M2 complete | (BR edge) | M3 remains LOCKED (requires BOTH conditions); no visual change until M2 also complete |
| All 4 modules complete | (FC-B-02) | "Path Complete" state; confetti burst (one-shot, not repeating on re-visits) |

---

## 5. Business ↔ Design Alignment

| FR | Requirement | Screen | Component | IR | TC |
|----|-------------|--------|-----------|----|----|
| FR-LEARN-02 | Show module cards M1–M4 with states | Screen 5 | ModuleCard (×4) | — | TC-09 |
| FR-LEARN-02 | IN_PROGRESS shows progress bar + "Continue" | Screen 5 | ModuleCard `in-progress` | — | TC-09, TC-11 |
| FR-LEARN-02 | LOCKED shows prerequisite on tap | Screen 5 | ModuleCard `locked` | IR-16 | TC-10 |
| FR-LEARN-02 | COMPLETE allows review mode re-entry | Screen 5 | ModuleCard `complete` + ghost CTA | — | TC-13 |
| FR-LEARN-02 | LearningPromptCard for dismissed-modal users | Screen 5 | LearningPromptCard | IR-02 | TC-14 |
| FR-LEARN-02 | API failure → error state + retry | Screen 5 | Error state + retry button | — | TC-12 |
| FR-LEARN-08 | Module unlock evaluated on screen load | Screen 5 | ModuleCard state evaluation | — | TC-09 |
| FR-LEARN-08 | Real-time unlock on trade count met | Screen 5 | ModuleCard LOCKED→UNLOCKED pulse | EC-05 | — |
| FR-LEARN-12 | Daily Missions locked until M1 complete | Screen 18 | Unlock banner + blurred missions | IR-24 | TC-48, TC-49 |

---

## 6. QA Test Cases

| TC | Scenario | Expected Result |
|----|----------|----------------|
| TC-09 | M1 in progress (3/5 lessons) | M1 shows 60% progress bar + "Tiếp tục"; M2/M3/M4 locked |
| TC-10 | Tap M2 (locked) | Tooltip: "Hoàn thành Module 1 để mở khóa"; auto-hides 2500ms |
| TC-11 | Resume from partial L2.3 progress | Lesson viewer opens at L2.3 at last saved card index |
| TC-12 | API fails on Grow tab open | Skeleton shown 3s; error state + "Thử lại" button |
| TC-13 | All 4 modules complete | "Path Complete" state; all cards show COMPLETE; confetti |
| TC-14 | LearningPromptCard visible after modal dismiss | Card shown at top; hidden once lesson started |
| TC-15 | LearningPromptCard hidden after module started | Card not shown when user has ≥1 lesson in progress |
| TC-48 | Daily Missions locked before M1 | Blurred placeholders; lock icon; unlock banner with CTA |
| TC-49 | Daily Missions unlocked after M1 complete | Active mission list shown; no lock banner |

---

## 7. Design Gaps / Risks

| # | Gap / Risk | Severity | Recommendation |
|---|-----------|----------|---------------|
| G-B-01 | XP Pill in header is static (no animation on XP change). If user gains XP while on this screen, the pill updates on next render only — there is no live counter. | Low | Acceptable for V1; add live XP update in V1.1 via WebSocket. |
| G-B-02 | The design defines only ONE `lime` KineticButton per viewport, but if M1 is UNLOCKED and M2 is UNLOCKED simultaneously (after Placement Quiz skip), the screen needs to render two unlocked modules. Only the topmost gets `lime`; M2 gets `ghost`. This creates visual ambiguity — user may think M2 is unavailable. | Medium | Add a "NEW" badge or `lime` pill on M2 to signal it is freshly unlocked without using a second `lime` button. |
| G-B-03 | No explicit empty state designed for a user with NO modules (edge case: account created but module_progress record missing). | Low | Use M1 UNLOCKED as the fallback render — safe assumption as M1 has no prerequisite. |

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| FRD: F0 Learning Path | `docs/business/frd/module-f0-learning.md` |
| UX Flows Overview | `docs/business/frd/module-f0-learning-ux-flows.md` |
| Flow C — Lesson Experience | `docs/business/frd/module-f0-flow-c-lesson-experience.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Screen Wireframes (Screens 5, 18) | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| Component Specs (ModuleCard, LearningPromptCard) | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules (IR-16, IR-20, EC-05) | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| UI Specification | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |
