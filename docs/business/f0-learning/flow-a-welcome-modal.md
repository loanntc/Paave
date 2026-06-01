# Flow A: Welcome Modal

**Document version:** 1.0
**Last updated:** 2026-05-29
**Author:** Loanntc
**Architecture:** Frontend-only (AsyncStorage, no backend API)

---

## 1. Flow Summary

| Field | Value |
|---|---|
| **Flow ID** | FLOW-A |
| **Feature Reference** | FR-LEARN-01 |
| **Actor** | New user, first app launch |
| **Trigger** | `f0_welcome_modal_shown` = false (or key absent) in AsyncStorage |
| **Precondition** | First app launch OR AsyncStorage cleared (e.g. app reinstall) |
| **Exit States** | (A) Modal dismissed → navigate to L1.1 Card 1 · (B) Modal dismissed → Home tab (with deferred LearningPromptCard) · (C) Modal dismissed → Placement Quiz intro screen |
| **FR References** | FR-LEARN-01 |
| **IR References** | IR-LEARN-A1 (AsyncStorage write on render), IR-LEARN-A2 (Lottie fallback) |
| **EC References** | EC-A1 (no network on first launch), EC-A2 (force-kill after render), EC-A3 (Lottie asset load failure) |
| **TC References** | TC-A-01 through TC-A-07 |

---

## 2. Business Flow

```
START: App launches
│
├── READ AsyncStorage: f0_welcome_modal_shown
│   │
│   ├── VALUE = true (or key exists)
│   │   └── Skip modal → navigate to Home tab (or last active tab) — END
│   │
│   └── VALUE = false / key absent
│       │
│       ├── CHECK: Network available?
│       │   ├── NO → Skip modal → navigate to Home tab
│       │   │        On next launch: re-check flag (flag not written, will retry)
│       │   │        END
│       │   │
│       │   └── YES → Render Welcome Modal
│       │            WRITE AsyncStorage: f0_welcome_modal_shown = true  ← idempotency write at render
│       │            │
│       │            ├── Trigger AmbientBackground (lime + plasma orbs)
│       │            ├── Start 500ms delay → Play Lottie animation
│       │            │   └── Lottie asset fails to load? → Show static PNG fallback
│       │            │       (CTAs are visible regardless of Lottie state)
│       │            │
│       │            └── Display 3 CTAs (simultaneously, no gating on Lottie):
│       │                │
│       │                ├── [PRIMARY] KineticButton lime: "Bắt đầu Module 1"
│       │                │   └── TAP → dismiss modal → navigate to L1.1 Card 1
│       │                │          WRITE f0_module_1_state = IN_PROGRESS (if currently UNLOCKED)
│       │                │          END: User at Lesson 1.1 Card 1
│       │                │
│       │                ├── [SECONDARY] KineticButton ghost: "Khám phá trước"
│       │                │   └── TAP → dismiss modal → navigate to Home tab
│       │                │          WRITE deferred flag: user_came_via_explore = true
│       │                │          On next Grow tab visit → show LearningPromptCard above M1 card
│       │                │          END: User at Home tab
│       │                │
│       │                └── [TERTIARY] Text link (plasma color): "Tôi đã biết chứng khoán cơ bản"
│       │                    └── TAP → dismiss modal → navigate to Placement Quiz intro screen
│       │                           END: User at Placement Quiz
```

---

## 3. Acceptance Criteria

**AC-A-01: Modal shown only on first launch**
- Given a user installs the app for the first time
- When the app launches and `f0_welcome_modal_shown` is absent from AsyncStorage AND network is available
- Then the Welcome Modal is displayed over the Home tab

**AC-A-02: AsyncStorage flag written at render**
- Given the Welcome Modal is rendered
- When the modal appears on screen (before any CTA is tapped)
- Then `f0_welcome_modal_shown = true` is written to AsyncStorage immediately

**AC-A-03: Modal not shown on second launch**
- Given `f0_welcome_modal_shown = true` exists in AsyncStorage
- When the app launches (any subsequent launch)
- Then the Welcome Modal is NOT displayed and the user lands on the Home tab or last active tab

**AC-A-04: Primary CTA navigates to L1.1 Card 1**
- Given the Welcome Modal is displayed
- When the user taps "Bắt đầu Module 1"
- Then the modal is dismissed and the user is navigated directly to Lesson 1.1 Card 1

**AC-A-05: Secondary CTA navigates to Home with deferred prompt**
- Given the Welcome Modal is displayed
- When the user taps "Khám phá trước"
- Then the modal is dismissed, the user lands on the Home tab, and on the next visit to the Grow tab (while M1 = UNLOCKED/not started) the LearningPromptCard is shown

**AC-A-06: Tertiary CTA navigates to Placement Quiz**
- Given the Welcome Modal is displayed
- When the user taps "Tôi đã biết chứng khoán cơ bản"
- Then the modal is dismissed and the user is navigated to the Placement Quiz intro screen

**AC-A-07: No-network first launch — modal deferred**
- Given a user launches the app for the first time with no network connection
- When the app initializes
- Then the Welcome Modal is NOT shown, the user lands on the Home tab, and `f0_welcome_modal_shown` remains unset so the modal will be shown on the next launch when network is available

**AC-A-08: Force-kill after render — modal not shown again**
- Given the Welcome Modal has been rendered (flag written to AsyncStorage)
- When the user force-kills the app and relaunches
- Then the Welcome Modal is NOT shown again (flag persists)

**AC-A-09: Lottie fallback does not block CTAs**
- Given the Lottie animation asset fails to load
- When the modal is rendered
- Then the static PNG fallback is shown and all three CTAs are visible and tappable without delay

---

## 4. Design Analysis

### 4.1 Screens & Wireframes

| Screen ID | Screen Name | Description | State Variants |
|---|---|---|---|
| SCR-A-01 | Welcome Modal | Full-screen modal overlay on first launch | Default (Lottie playing), Fallback (PNG static), No-network (not shown) |
| SCR-A-02 | Home Tab | Landing screen after "Khám phá trước" | Standard home state |
| SCR-A-03 | Lesson 1.1 Card 1 | First lesson content card | Initial (fresh start) |
| SCR-A-04 | Placement Quiz Intro | Entry screen for advanced path | Standard |

### 4.2 Design Decisions & Rationale

**1. Flag written at render, not on CTA tap**
Writing `f0_welcome_modal_shown = true` at modal render (not on button tap) prevents the modal from re-appearing if the user force-kills the app immediately after seeing it. A user who views the modal has received the onboarding information; showing it again would be repetitive and disruptive. This is an idempotency measure — the user's first experience is preserved exactly once.

**2. No close/X button**
The Welcome Modal offers three distinct paths, each valid. Allowing a dismiss-without-choice via an X button would leave the user without context about what to do next, which is the exact failure state onboarding exists to prevent. Every exit from the modal is a deliberate choice. This is directed onboarding — the user must commit to a path.

**3. CTAs visible immediately — Lottie does not gate UI**
The Lottie animation enhances the emotional quality of the moment but is not load-bearing for the user journey. Gating CTAs on animation load would create an unnecessary delay on lower-end devices or slow connections. CTAs appear immediately; animation plays when ready. This respects the user's time and avoids perceived loading friction.

**4. Tertiary CTA uses plasma, not lime**
Lime is reserved for primary progress actions (the main call-to-action hierarchy). The "Tôi đã biết chứng khoán cơ bản" path is a skip/bypass for users who self-identify as experienced. Using plasma de-emphasizes this option visually — it remains accessible but does not compete visually with the primary lime CTA. This nudges the majority of F0 users (novices) toward the intended learning path.

**5. AmbientBackground with lime + plasma orbs**
The Welcome Modal marks a meaningful milestone — the user's first encounter with the F0 Learning Path. The AmbientBackground with animated lime and plasma orbs signals energy, possibility, and the identity of the Kinetic Drop design system. It distinguishes this screen from functional/transactional screens and creates emotional resonance at first impression.

**6. 500ms Lottie start delay**
The delay gives the modal layout time to render and stabilize before animation begins. Immediate animation on a cold app launch can compete with the rendering pipeline on lower-end devices, causing jank. The brief delay ensures the animation plays smoothly after the UI has settled.

**7. Network required for initial modal display**
The Lottie animation asset is fetched from remote. Without network, the full intended modal experience cannot be delivered. Showing a degraded modal (static only, no animation, possibly missing remote content) on the most important first-impression screen is worse than deferring it. Modal is deferred to next launch when network is available.

### 4.3 Component Usage

| Component | Source | Variant | Role |
|---|---|---|---|
| `AmbientBackground` | Kinetic Drop V2.0 | lime + plasma orbs | Sets emotional tone, milestone signaling |
| `KineticButton` | Kinetic Drop V2.0 | lime / primary | Primary CTA: "Bắt đầu Module 1" |
| `KineticButton` | Kinetic Drop V2.0 | ghost / secondary | Secondary CTA: "Khám phá trước" |
| Text link | Custom | plasma (#D277FF) color | Tertiary CTA: "Tôi đã biết chứng khoán cơ bản" |
| Lottie animation | react-native-lottie | — | Hero animation (celebratory/welcoming) |
| Static PNG | Bundled asset | — | Fallback if Lottie fails to load |
| Modal overlay | React Native Modal | full-screen | Container for all modal content |

### 4.4 Interaction Rules

| Rule | Trigger | System Response |
|---|---|---|
| IR-A-01 | Modal renders | Write `f0_welcome_modal_shown = true` to AsyncStorage immediately |
| IR-A-02 | Modal renders | Start 500ms timer → begin Lottie playback |
| IR-A-03 | Lottie asset load fails | Replace Lottie player with static PNG fallback; CTAs unaffected |
| IR-A-04 | Tap "Bắt đầu Module 1" | Dismiss modal; navigate to L1.1 Card 1 |
| IR-A-05 | Tap "Khám phá trước" | Dismiss modal; navigate to Home tab; set deferred explore flag |
| IR-A-06 | Tap "Tôi đã biết chứng khoán cơ bản" | Dismiss modal; navigate to Placement Quiz intro |
| IR-A-07 | App launches, flag = true | Skip modal entirely; navigate to Home tab |
| IR-A-08 | App launches, no network, flag = false | Skip modal; navigate to Home tab; flag remains unset |

### 4.5 Edge Cases

| Case | UI Response |
|---|---|
| EC-A-01: No network on first launch | Modal not shown. User lands on Home tab. Modal shown on next launch when network is available. Flag not written. |
| EC-A-02: Force-kill after modal renders (before CTA tap) | Flag already written. Modal not shown on relaunch. User lands on Home tab. |
| EC-A-03: Lottie animation asset fails to load | Static PNG fallback displayed. All CTAs remain visible and functional. No error message shown to user. |
| EC-A-04: AsyncStorage write fails on modal render | Log error silently. Modal continues to display. On next launch, modal may show again (flag not persisted) — acceptable V1 behavior. |
| EC-A-05: User taps primary CTA before Lottie finishes | Modal dismissed immediately. Lottie animation is cancelled. Navigation proceeds. |
| EC-A-06: User has AsyncStorage cleared mid-session (app reinstall) | Modal will show again on next launch if network is available, as flag is absent. |

---

## 5. Business ↔ Design Alignment

| Business Requirement | Design Implementation | Alignment Status |
|---|---|---|
| Show modal only on first launch | Flag written at render; modal gated on flag absence | Aligned |
| Three distinct onboarding paths | Three CTAs with distinct visual hierarchy (lime / ghost / plasma text) | Aligned |
| Idempotency — modal never shown twice for same session | Flag written at render, not on CTA tap | Aligned |
| Network required for full experience | Modal deferred if no network; flag not written | Aligned |
| Directed onboarding — no escape without path choice | No X button or back gesture on modal | Aligned |
| Tertiary path visually de-emphasized | Plasma text link vs. lime/ghost buttons | Aligned |
| Animation should not block user action | Lottie starts after 500ms delay; CTAs always visible | Aligned |
| Graceful degradation if animation fails | Static PNG fallback bundled in app | Aligned |

---

## 6. QA Test Cases

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-A-01 | Modal shows on fresh install | 1. Fresh install (or clear AsyncStorage). 2. Launch app with network. | Welcome Modal displayed over Home tab. | P0 |
| TC-A-02 | Modal not shown on second launch | 1. Fresh install. 2. Launch (modal shows). 3. Force-kill. 4. Relaunch. | Modal NOT shown on second launch. User lands on Home tab. | P0 |
| TC-A-03 | Flag written at render not on tap | 1. Fresh install. 2. Launch app. 3. Observe modal render. 4. Force-kill immediately (before tapping anything). 5. Relaunch. | Modal does NOT appear on relaunch. Flag was written at render. | P0 |
| TC-A-04 | Primary CTA navigates to L1.1 | 1. Fresh install. 2. Launch app. 3. Tap "Bắt đầu Module 1". | Modal dismissed. App navigates to Lesson 1.1 Card 1. | P0 |
| TC-A-05 | Secondary CTA lands on Home + deferred prompt | 1. Fresh install. 2. Launch app. 3. Tap "Khám phá trước". 4. Navigate to Grow tab. | User lands on Home tab after tap. LearningPromptCard visible on Grow tab (M1 not yet started). | P1 |
| TC-A-06 | Tertiary CTA navigates to Placement Quiz | 1. Fresh install. 2. Launch app. 3. Tap "Tôi đã biết chứng khoán cơ bản". | Modal dismissed. App navigates to Placement Quiz intro screen. | P1 |
| TC-A-07 | No-network first launch defers modal | 1. Disable network. 2. Fresh install. 3. Launch app. | Modal NOT shown. User lands on Home tab. `f0_welcome_modal_shown` remains unset. | P1 |
| TC-A-08 | Lottie failure shows PNG fallback | 1. Simulate Lottie asset load failure (block asset URL or corrupt file). 2. Fresh install + launch. | Static PNG fallback displayed. All 3 CTAs visible and functional. | P1 |
| TC-A-09 | CTAs accessible before Lottie finishes | 1. Fresh install. 2. Launch app. 3. Tap any CTA immediately (before 500ms delay / Lottie start). | CTA responds immediately. Navigation proceeds. Lottie state does not block tap. | P2 |

---

## 7. Design Gaps / Risks

| Gap / Risk | Description | Severity | Recommendation |
|---|---|---|---|
| DG-A-01: Network detection reliability | React Native's NetInfo can report false positives/negatives briefly on launch. Modal could be incorrectly skipped or shown. | Medium | Add a 200ms grace period before evaluating network state on launch. |
| DG-A-02: Lottie asset cache | Lottie animation fetched from remote on first launch. If asset is updated server-side, users who have not cleared cache may see outdated animation. | Low | Bundle animation as a local asset in the app package. Eliminates network dependency entirely. |
| DG-A-03: AsyncStorage write race on fast CTA tap | If user taps CTA extremely fast (before AsyncStorage write completes), navigation fires before flag is confirmed written. | Low | Await AsyncStorage.setItem before triggering navigation. Adds <50ms latency. |
| DG-A-04: No analytics event on modal path choice | Without tracking which CTA was tapped, product cannot measure placement quiz adoption or "explore first" funnel drop. | Medium | Add analytics event on each CTA tap: `welcome_modal_cta_tapped: {path: 'start_m1' | 'explore' | 'placement_quiz'}`. |
| DG-A-05: Deferred LearningPromptCard persistence | The "came via explore" flag must survive app background/foreground cycles. If stored only in component state, it resets on tab remount. | High | Store deferred explore flag in AsyncStorage (e.g. `f0_explore_path_taken = true`), not component state. |

---

## 8. Related Documents

### Business Layer
- `01-requirements.md` — F0 Learning Path requirements (FR-LEARN-01)
- `flow-b-grow-tab.md` — Grow Tab / Learning Path Home (downstream of this flow)
- `flow-c-lesson-experience.md` — Lesson experience (destination of primary CTA)

### Design Layer
- Kinetic Drop V2.0 Design System — AmbientBackground, KineticButton, component specs
- Figma: F0 Learning Path screens — Welcome Modal (SCR-A-01)

### Engineering Layer
- AsyncStorage key spec: `f0_welcome_modal_shown` (boolean)
- AsyncStorage key spec: `f0_explore_path_taken` (boolean, deferred prompt flag)
- React Navigation route: `F0LessonCard` (params: moduleId=1, lessonId=1, cardIndex=0)
- React Navigation route: `PlacementQuizIntro`
