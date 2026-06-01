# Flow G — Learning Complete

**FR:** FR-LEARN-09, FR-LEARN-10
**Version:** 1.0
**Last updated:** 2026-05-29

---

## 1. Flow Summary

| Field | Value |
|---|---|
| Flow ID | Flow G |
| Feature References | FR-LEARN-09, FR-LEARN-10 |
| Actor | F0 trader who has just passed the M4 Module Knowledge Check |
| Trigger | M4 MKC pass — `f0_module_4_state` transitions to `COMPLETE` |
| Entry Point | M4 Pass screen → auto-transition (1,500 ms) or user taps "Xem kết quả →" CTA |
| Exit Points | Age ≥ 18: Trade tab; Age < 18: Home tab + AgeGateBottomSheet; AgeGateBottomSheet: Market tab or Home tab |
| This Flow Is New | Yes — did not exist in the previous version |
| Architecture | Frontend-only. Age calculation is client-side from stored DOB. No API calls. |
| Backend Calls | None |
| AsyncStorage Keys Written | `f0_learning_path_complete`, `f0_age_gate_shown` |

---

## 2. Business Flow

### 2.1 Numbered Steps

1. User passes M4 MKC (score ≥ 3/5). M4 Pass screen shows (see Flow E §2.2).
2. M4 Pass screen uses MIXED lime + plasma AmbientBackground orbs (distinct from M1–M3 pass screens).
3. "Module 4 Hoàn Thành!" heading displays briefly.
4. **Auto-transition:** after 1,500 ms, system navigates to Learning Complete screen.
   - Alternatively: user taps "Xem kết quả →" CTA before the 1,500 ms timer fires.
5. Learning Complete screen renders.
6. Write `f0_learning_path_complete = true` to AsyncStorage.
7. User reads completion content and taps "Bắt đầu đầu tư →" CTA.
8. System reads user DOB from local profile (stored during registration).
9. System calculates age: `Math.floor((Date.now() - DOB_timestamp) / (365.25 * 24 * 3600 * 1000))`.
10. Branch on age result:
    - **Case A — Age ≥ 18:** execute §2.2.
    - **Case B — Age < 18:** execute §2.3.
    - **Case C — DOB missing or invalid:** execute §2.4.

### 2.2 Case A — Age ≥ 18

1. Navigate to Trade tab (main trading screen).
2. Show brief snackbar/tooltip: "Sẵn sàng đặt lệnh đầu tiên! 💪" — auto-dismiss after 2,500 ms.

> **Note:** `f0_age_gate_shown` is NOT written for Case A. The key semantics are "age gate bottom sheet was shown" — for Case A, no bottom sheet is shown. Writing it here would corrupt analytics (making it impossible to distinguish "user was ≥18 and navigated to Trade" from "user saw the under-18 bottom sheet").

### 2.3 Case B — Age < 18

1. Write `f0_age_gate_shown = true`.
2. Navigate to Home tab (NOT Trade tab — avoids exposing locked/inaccessible features immediately).
3. Show AgeGateBottomSheet:
   - Header: "Bạn chưa đủ tuổi giao dịch" (title-md)
   - Body: "Theo quy định, bạn cần đủ 18 tuổi để đặt lệnh chứng khoán thật."
   - Personalized date line: "Bạn có thể bắt đầu giao dịch từ [calculated 18th birthday date in DD/MM/YYYY]"
   - Encouragement: "Trong thời gian chờ, bạn có thể theo dõi thị trường và đọc tin tức tại đây."
   - CTA Primary (KineticButton lime): "Xem thị trường" → dismiss sheet + navigate to Market tab
   - CTA Secondary (ghost button): "Về trang chủ" → dismiss sheet (stay on Home tab)

### 2.4 Case C — DOB Missing or Invalid

1. Treat identically to Case B (safe default — never accidentally grant trade access).
2. Write `f0_age_gate_shown = true`.
3. Navigate to Home tab.
4. Show AgeGateBottomSheet — same as Case B but WITHOUT the personalized birthday date line.
5. Add an additional note: "Cập nhật ngày sinh trong Hồ sơ để mở tính năng giao dịch."

### 2.5 Post-Completion State (Grow Tab)

After `f0_learning_path_complete = true`:
- All 4 modules show in `COMPLETE` state in Grow tab.
- Each ModuleCard shows an "Ôn lại" (review) CTA instead of the lesson/MKC CTA.
- Learning Complete banner appears at the top of the Grow tab: "Học xong! Tiếp tục ôn lại →" (ghost CTA — taps cycle through review mode).
- Trade tab: if age ≥ 18, trade features visible. If < 18, Trade tab shows age-gate locked state with: "Sẵn sàng khi bạn đủ 18 tuổi" and specific 18th birthday date.

### 2.6 Re-entry: Learning Complete Screen Revisited

If the user navigates back to the Learning Complete screen after already completing:
- `f0_learning_path_complete = true` detected.
- CTA label changes to "Tiến đến Trade →" (or age-gate recheck if returning under-18 user).
- Age check runs again on CTA tap (in case enough time has passed for the user to turn 18).

### 2.7 Decision Tree

```
M4 MKC Pass Screen
  │
  ├── [1500ms auto-transition]
  │   OR user taps "Xem kết quả →"
  │
  ▼
Learning Complete Screen
  ├── Write f0_learning_path_complete = true
  │
  └── User taps "Bắt đầu đầu tư →"
          │
          ▼
      Read DOB from local profile
          │
          ▼
      Calculate age
          │
          ▼
      Age ≥ 18?
      ├── YES (Case A)
      │     ├── Navigate to Trade tab
      │     └── Show snackbar (2500ms auto-dismiss)
      │
      ├── NO / Age < 18 (Case B)
      │     ├── Write age_gate_shown = true
      │     ├── Navigate to Home tab
      │     └── Show AgeGateBottomSheet
      │             ├── "Xem thị trường" → Market tab
      │             └── "Về trang chủ" → dismiss sheet
      │
      └── DOB missing / invalid (Case C)
            ├── Write age_gate_shown = true
            ├── Navigate to Home tab
            └── Show AgeGateBottomSheet (no birthday date)
                  + "Cập nhật ngày sinh trong Hồ sơ"
```

---

## 3. Acceptance Criteria

### AC-G-01: M4 Pass Screen — Mixed Orbs
**Given** the user has passed the M4 MKC
**When** the M4 Pass screen renders
**Then** the AmbientBackground shows BOTH lime and plasma orbs (distinct from M1–M3 pass screens which show lime only).

### AC-G-02: Auto-Transition to Learning Complete
**Given** the M4 Pass screen is showing
**When** 1,500 ms has elapsed without user interaction
**Then** the system navigates to the Learning Complete screen automatically.

### AC-G-03: Manual Transition via CTA
**Given** the M4 Pass screen is showing
**When** the user taps "Xem kết quả →" before 1,500 ms
**Then** the system navigates to the Learning Complete screen immediately (timer cancelled).

### AC-G-04: AsyncStorage Write on Learning Complete Screen
**Given** the Learning Complete screen renders
**When** the screen mounts
**Then** `f0_learning_path_complete = true` is written to AsyncStorage.

### AC-G-05: Learning Complete Screen Content
**Given** the Learning Complete screen renders
**When** the user views it
**Then** the following elements are present: lime AmbientBackground, "Chúc mừng! 🎓" header, "Bạn đã hoàn thành toàn bộ chương trình học!" in display-lg, stats row "4 modules • 20 bài học • Sẵn sàng đầu tư", body copy, and "Bắt đầu đầu tư →" KineticButton.

### AC-G-06: Age Gate — Case A (≥ 18) Navigation
**Given** the user taps "Bắt đầu đầu tư →" and their calculated age is ≥ 18
**When** the navigation executes
**Then** user is navigated to the Trade tab; snackbar "Sẵn sàng đặt lệnh đầu tiên! 💪" appears and auto-dismisses after 2,500 ms. `f0_age_gate_shown` is NOT written (no bottom sheet was shown).

### AC-G-07: Age Gate — Case B (< 18) Navigation
**Given** the user taps "Bắt đầu đầu tư →" and their calculated age is < 18
**When** the navigation executes
**Then** `f0_age_gate_shown = true` is written; user is navigated to the Home tab; AgeGateBottomSheet appears with personalized birthday date.

### AC-G-08: Age Gate — Case B Bottom Sheet Content
**Given** the AgeGateBottomSheet is showing for a user with valid DOB
**When** the user views it
**Then** all required elements are present: heading "Bạn chưa đủ tuổi giao dịch", regulatory note, personalized date "Bạn có thể bắt đầu giao dịch từ [date]", encouragement copy, "Xem thị trường" primary CTA, "Về trang chủ" ghost CTA.

### AC-G-09: Age Gate — Case C (DOB missing)
**Given** the user taps "Bắt đầu đầu tư →" and no valid DOB is found in local profile
**When** the navigation executes
**Then** behavior mirrors Case B (navigate to Home + show AgeGateBottomSheet) BUT without the personalized birthday date line; the additional note "Cập nhật ngày sinh trong Hồ sơ để mở tính năng giao dịch" is visible.

### AC-G-10: AgeGateBottomSheet — "Xem thị trường" CTA
**Given** the AgeGateBottomSheet is showing
**When** the user taps "Xem thị trường"
**Then** the bottom sheet dismisses and the user is navigated to the Market tab.

### AC-G-11: AgeGateBottomSheet — "Về trang chủ" CTA
**Given** the AgeGateBottomSheet is showing
**When** the user taps "Về trang chủ"
**Then** the bottom sheet dismisses and the user remains on the Home tab.

### AC-G-12: Exactly 18 On Completion Day
**Given** the user's DOB calculation results in exactly age = 18
**When** "Bắt đầu đầu tư →" is tapped
**Then** the ≥ 18 path (Case A) is taken — inclusive comparison.

### AC-G-13: Post-Completion Grow Tab State
**Given** `f0_learning_path_complete = true`
**When** the user navigates to the Grow tab
**Then** all 4 modules show COMPLETE state; each ModuleCard has an "Ôn lại" CTA; a "Học xong! Tiếp tục ôn lại →" banner appears at the top of the Grow tab.

### AC-G-14: Trade Tab — Under-18 Locked State
**Given** the user is under 18 and `f0_learning_path_complete = true`
**When** the user navigates to the Trade tab
**Then** the Trade tab shows the age-gate locked state: "Sẵn sàng khi bạn đủ 18 tuổi" with the user's specific 18th birthday date.

### AC-G-15: Re-entry Age Recheck
**Given** the user returns to the Learning Complete screen after completion
**When** the user taps the re-entry CTA
**Then** age is recalculated at tap time (in case user has since turned 18).

---

## 4. Design Analysis

### 4.1 Screens & Wireframes

#### Screen G-1: M4 Pass Screen (Flow E variant)

```
┌────────────────────────────────────┐
│  AmbientBackground:                │
│  MIXED lime + plasma orbs          │
│                                    │
│  Module 4 Hoàn Thành!              │
│  (display-md, lime #CAFD00)        │
│                                    │
│         4 / 5                      │
│     (display-lg, lime)             │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Xem kết quả →               │  │
│  │  (KineticButton lime)        │  │
│  └──────────────────────────────┘  │
│                                    │
│  [auto-transitions at 1500ms]      │
└────────────────────────────────────┘
```

#### Screen G-2: Learning Complete Screen

```
┌────────────────────────────────────┐
│  AmbientBackground: lime orbs      │
│                                    │
│  Chúc mừng! 🎓                     │
│  (header/title-lg)                 │
│                                    │
│  Bạn đã hoàn thành toàn bộ         │
│  chương trình học!                 │
│  (display-lg, white/ink-100)       │
│                                    │
│  4 modules • 20 bài học            │
│  • Sẵn sàng đầu tư                 │
│  (body-md, muted — stats row)      │
│                                    │
│  Bạn đã trang bị đủ kiến thức      │
│  nền tảng. Đã đến lúc bắt đầu     │
│  hành trình đầu tư thực sự.        │
│  (body-md)                         │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Bắt đầu đầu tư →            │  │
│  │  (KineticButton lime)        │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

#### Screen G-3: AgeGateBottomSheet (Case B — DOB valid)

```
┌────────────────────────────────────┐
│  ▄▄▄ (drag handle)                 │
│                                    │
│  Bạn chưa đủ tuổi giao dịch        │
│  (title-md)                        │
│                                    │
│  Theo quy định, bạn cần đủ 18 tuổi │
│  để đặt lệnh chứng khoán thật.     │
│  (body-md)                         │
│                                    │
│  Bạn có thể bắt đầu giao dịch      │
│  từ 15/06/2027                     │
│  (body-md, lime — personalized)    │
│                                    │
│  Trong thời gian chờ, bạn có thể   │
│  theo dõi thị trường và đọc        │
│  tin tức tại đây.                  │
│  (body-sm, muted)                  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Xem thị trường              │  │
│  │  (KineticButton lime)        │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Về trang chủ                │  │
│  │  (ghost button)              │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

#### Screen G-4: AgeGateBottomSheet (Case C — DOB missing)

Same as G-3 but the personalized date line is replaced with:
```
│  Cập nhật ngày sinh trong Hồ sơ    │
│  để mở tính năng giao dịch.        │
│  (body-sm, muted)                  │
```

#### Screen G-5: Grow Tab — Post-Completion State

```
┌────────────────────────────────────┐
│  ┌──────────────────────────────┐  │
│  │  Học xong! Tiếp tục ôn lại → │  │
│  │  (ghost CTA banner — top)    │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Module 1 Card — COMPLETE]        │
│  ✓ Cổ phiếu là gì?                 │
│  [Ôn lại]                          │
│                                    │
│  [Module 2 Card — COMPLETE]        │
│  ✓ Phân tích cơ bản                │
│  [Ôn lại]                          │
│                                    │
│  [Module 3 Card — COMPLETE]        │
│  ✓ Phân tích kỹ thuật              │
│  [Ôn lại]                          │
│                                    │
│  [Module 4 Card — COMPLETE]        │
│  ✓ Đặt lệnh và quản lý rủi ro      │
│  [Ôn lại]                          │
└────────────────────────────────────┘
```

---

### 4.2 Design Decisions & Rationale

1. **Learning Complete screen uses AmbientBackground — same treatment as auth completion and Welcome Modal.** Milestone moments in Paave get the full AmbientBackground treatment. This communicates "this is as significant as signing up." The learning path completion is a life/financial milestone, not just an in-app achievement.

2. **Mixed lime + plasma orbs on M4 Pass (not M1–M3).** Lime = growth achieved (the learning system's primary color). Plasma = identity transformation — the user has crossed from "learner" to "investor." The dual-orb treatment is exclusive to M4 to signal it is categorically different from the prior three completions.

3. **Age check computed client-side from stored DOB (no API call).** Consistent with the frontend-only architecture. DOB is available in local profile data stored at registration. This eliminates a network dependency on what is meant to be a celebratory milestone moment.

4. **Under-18 user navigates to Home tab (not Trade tab).** Landing on the Trade tab while under-18 would expose a locked, inaccessible feature as the first thing after a celebratory experience. Home tab is neutral and welcoming. The AgeGateBottomSheet then provides constructive direction (Market tab) rather than a wall.

5. **AgeGateBottomSheet provides specific 18th birthday date (personalized).** Generic copy ("when you turn 18") is forgettable. A specific date ("Bạn có thể bắt đầu giao dịch từ 15/06/2027") gives the user something concrete to look forward to. This reduces frustration by transforming a restriction into a countdown.

6. **Missing DOB defaults to under-18 (safe default).** The system must never accidentally grant access to trading features for a potentially underage user. Safe default = restrict; never grant. This aligns with regulatory and liability concerns.

7. **"Bắt đầu đầu tư →" CTA is visually optimistic regardless of age.** The CTA is not locked, greyed out, or age-conditional in its visual presentation. The age gate reveals itself only after the tap — preserving the celebratory mood on the Learning Complete screen. An upfront "age verification required" state would dampen the achievement moment unnecessarily for the majority of users who are 18+.

8. **Stats row ("4 modules • 20 bài học • Sẵn sàng đầu tư") provides sense of accomplishment without XP numbers.** XP has been removed from this version. Concrete, human-readable stats ("20 bài học") convey achievement more meaningfully than abstract point numbers for a first-time investor audience.

9. **Auto-transition at 1,500 ms from M4 Pass screen (with override CTA).** 1,500 ms is long enough to register the "Module 4 complete" moment but short enough to maintain flow momentum. The override CTA ("Xem kết quả →") respects users who read faster or want to move immediately.

10. **No social sharing / "share achievement" CTA in V1.** Social sharing without a defined destination (native share sheet vs. in-app community vs. external social) creates inconsistent UX. Deferred to V2 once social sharing destination is defined (see Design Gap G-G-01).

---

### 4.3 Component Usage

| Component | Screen | Usage |
|---|---|---|
| `AmbientBackground` | M4 Pass screen | MIXED lime + plasma orbs — dual identity moment |
| `AmbientBackground` | Learning Complete screen | Lime orbs dominant — achievement |
| `KineticButton` lime | Learning Complete screen | "Bắt đầu đầu tư →" CTA |
| `KineticButton` lime | M4 Pass screen | "Xem kết quả →" override CTA |
| `KineticButton` lime | AgeGateBottomSheet | "Xem thị trường" primary CTA |
| Ghost button | AgeGateBottomSheet | "Về trang chủ" secondary CTA |
| BottomSheet (standard) | Age gate | AgeGateBottomSheet container |
| Snackbar / tooltip | Trade tab (Case A) | "Sẵn sàng đặt lệnh đầu tiên! 💪" auto-dismiss 2,500 ms |

---

### 4.4 Interaction Rules

| Trigger | Condition | Result |
|---|---|---|
| M4 MKC pass | `f0_module_4_state` → COMPLETE | M4 Pass screen with lime + plasma orbs; 1,500 ms timer starts |
| 1,500 ms elapses | M4 Pass screen visible, no CTA tapped | Auto-navigate to Learning Complete screen |
| Tap "Xem kết quả →" | M4 Pass screen | Immediate navigation to Learning Complete screen; timer cancelled |
| Learning Complete screen mounts | First visit | Write `f0_learning_path_complete = true` |
| Tap "Bắt đầu đầu tư →" | Age ≥ 18 | Navigate to Trade tab; show snackbar 2,500 ms (no `f0_age_gate_shown` write) |
| Tap "Bắt đầu đầu tư →" | Age < 18 | Write age_gate_shown=true; navigate to Home tab; show AgeGateBottomSheet |
| Tap "Bắt đầu đầu tư →" | DOB missing/invalid | Write age_gate_shown=true; navigate to Home tab; show AgeGateBottomSheet (no date, + profile note) |
| Tap "Xem thị trường" | AgeGateBottomSheet visible | Dismiss sheet; navigate to Market tab |
| Tap "Về trang chủ" | AgeGateBottomSheet visible | Dismiss sheet; stay on Home tab |
| Navigate to Grow tab | `f0_learning_path_complete = true` | All 4 modules show COMPLETE; "Ôn lại" CTAs; completion banner at top |
| Navigate to Trade tab | User < 18 | Age-gate locked state: "Sẵn sàng khi bạn đủ 18 tuổi" + specific date |
| Re-enter Learning Complete screen | After completion | CTA = "Tiến đến Trade →"; age rechecked on tap |

---

### 4.5 Edge Cases

| ID | Scenario | Handling |
|---|---|---|
| EC-G-01 | Age exactly 18 on the day of completion | `Math.floor(age) >= 18` is inclusive; Case A applies (access to Trade) |
| EC-G-02 | Timezone edge case for 18th birthday | Use Vietnam timezone (UTC+7) for DOB birthday comparison to avoid day-boundary discrepancies |
| EC-G-03 | User returns to Learning Complete screen after completing | `f0_learning_path_complete=true` detected; CTA label = "Tiến đến Trade →"; age rechecked on tap; user may now be 18 if time has passed |
| EC-G-04 | Under-18 user who turns 18 later | No automatic notification or Trade tab unlock. User must navigate to Trade tab manually; Trade tab will recheck age on each visit (acceptable V1; V2 to add push notification — see G-G-02) |
| EC-G-05 | Trade tab visited by under-18 after completing learning | Shows "Sẵn sàng khi bạn đủ 18 tuổi" locked state with specific 18th birthday date |
| EC-G-06 | DOB stored but corrupted (unparseable string) | Treated as Case C (missing DOB); safe default = under-18 behavior |
| EC-G-07 | DOB far in the future (data anomaly — user would be negative age) | Treated as Case C; safe default = under-18 behavior |
| EC-G-08 | App force-killed during 1,500 ms auto-transition | No state written yet (write happens on Learning Complete screen mount); on relaunch from M4 Pass: user sees pass screen; timer resets; transition occurs normally |
| EC-G-09 | App reinstall after completing learning | All AsyncStorage cleared; `f0_learning_path_complete` removed; user must complete learning again; DOB from registration profile persists separately (acceptable V1 — see G-G-03) |
| EC-G-10 | User taps "Xem thị trường" on AgeGateBottomSheet | Market tab loads; bottom sheet dismissed; no age check performed (Market tab is read-only; no trading possible) |
| EC-G-11 | `f0_learning_path_complete=true` already set when Learning Complete screen mounts again | Write is idempotent; writing true over true is safe; no side effects |

---

## 5. Business ↔ Design Alignment

| Business Requirement | Design Implementation | Status |
|---|---|---|
| M4 Pass screen — mixed lime + plasma orbs | `AmbientBackground` dual-preset on M4 pass only | Aligned |
| Auto-transition 1,500 ms to Learning Complete | `setTimeout(navigate, 1500)` cancelled on CTA tap | Aligned |
| Write `f0_learning_path_complete = true` on screen mount | `useEffect` AsyncStorage write on Learning Complete mount | Aligned |
| Learning Complete: display-lg heading + stats row | Layout component per spec; stats row hardcoded "4 modules • 20 bài học" | Aligned |
| "Bắt đầu đầu tư →" CTA (optimistic, not locked) | KineticButton lime always enabled; gate revealed on tap | Aligned |
| Age ≥ 18 → Trade tab + snackbar | DOB read from local profile; calculate age; navigate + toast | Aligned |
| Age < 18 → Home tab + AgeGateBottomSheet | Navigate to Home, mount AgeGateBottomSheet | Aligned |
| AgeGateBottomSheet: personalized date | Calculate 18th birthday from DOB; format DD/MM/YYYY | Aligned |
| DOB missing → Case C (safe default) | `try/catch` DOB parse; missing/invalid → under-18 path | Aligned |
| "Xem thị trường" → Market tab | BottomSheet CTA dismiss + tab navigate | Aligned |
| "Về trang chủ" → dismiss sheet | Sheet dismiss; stay on Home tab | Aligned |
| Post-completion Grow tab: all COMPLETE + "Ôn lại" CTAs | ModuleCard renders "Ôn lại" when state=COMPLETE; completion banner at top | Aligned |
| Trade tab: under-18 locked state | Trade tab checks `f0_learning_path_complete` + age on mount | Aligned |
| No rewards (XP/badges) | No XP display on Learning Complete screen | Aligned |
| No social sharing in V1 | No share CTA present | Aligned (deferred to V2) |

---

## 6. QA Test Cases

| ID | Test Case | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| QA-G-01 | M4 MKC pass → Learning Complete screen appears | M4 MKC answered with ≥ 3/5 correct | Submit M4 MKC | M4 Pass screen with lime + plasma orbs; "Module 4 Hoàn Thành!"; auto-transitions to Learning Complete screen after 1,500 ms |
| QA-G-02 | Manual CTA overrides auto-transition | M4 Pass screen visible, < 1,500 ms elapsed | Tap "Xem kết quả →" | Immediate navigation to Learning Complete screen; `f0_learning_path_complete=true` written |
| QA-G-03 | "Bắt đầu đầu tư →" tap — age ≥ 18 | User DOB = 20 years ago; Learning Complete screen visible | Tap "Bắt đầu đầu tư →" | Trade tab opens; snackbar "Sẵn sàng đặt lệnh đầu tiên! 💪" shows and dismisses after 2,500 ms; `f0_age_gate_shown` is NOT written to AsyncStorage |
| QA-G-04 | "Bắt đầu đầu tư →" tap — age < 18 | User DOB = 16 years ago; Learning Complete screen visible | Tap "Bắt đầu đầu tư →" | `f0_age_gate_shown=true` written; Home tab active; AgeGateBottomSheet shows with personalized 18th birthday date |
| QA-G-05 | "Bắt đầu đầu tư →" tap — DOB missing | No DOB in local profile; Learning Complete screen visible | Tap "Bắt đầu đầu tư →" | Home tab active; AgeGateBottomSheet shows WITHOUT specific date; note "Cập nhật ngày sinh trong Hồ sơ" visible |
| QA-G-06 | "Xem thị trường" on AgeGateBottomSheet | AgeGateBottomSheet visible | Tap "Xem thị trường" | Bottom sheet dismisses; Market tab opens |
| QA-G-07 | "Về trang chủ" on AgeGateBottomSheet | AgeGateBottomSheet visible | Tap "Về trang chủ" | Bottom sheet dismisses; user remains on Home tab; no tab change |
| QA-G-08 | Return to Grow tab after Learning Complete | `f0_learning_path_complete=true` | Navigate to Grow tab | All 4 modules show COMPLETE state; each has "Ôn lại" CTA; "Học xong! Tiếp tục ôn lại →" banner at top |
| QA-G-09 | Age exactly 18 on day of completion | User DOB = exactly 18 years ago today (Vietnam UTC+7) | Tap "Bắt đầu đầu tư →" | Case A path taken (Trade tab, not Home + AgeGateBottomSheet) |
| QA-G-10 | Under-18 Trade tab locked state | User < 18; `f0_learning_path_complete=true` | Navigate to Trade tab | "Sẵn sàng khi bạn đủ 18 tuổi" shown with specific 18th birthday date; trading features not accessible |
| QA-G-11 | `f0_learning_path_complete=true` written exactly once | Learning Complete screen visited multiple times | Navigate away and return to Learning Complete screen twice | AsyncStorage key written on first mount; subsequent mounts are idempotent (no duplicate side effects) |
| QA-G-12 | No XP or badges on Learning Complete screen | Learning Complete screen rendered | Inspect screen | No XP number, no badge image, no confetti with XP reference present |
| QA-G-13 | M4 Pass screen orbs are distinct from M1–M3 | M1 pass screen visible; then M4 pass screen visible | Compare both pass screens | M1 shows lime-only AmbientBackground; M4 shows MIXED lime + plasma orbs |

---

## 7. Design Gaps / Risks

| ID | Severity | Description | Recommendation |
|---|---|---|---|
| G-G-01 | HIGH | No social sharing / "share achievement" CTA is defined for the Learning Complete screen. A meaningful milestone moment with no shareable output is a missed engagement opportunity. Defining it later may require a redesign of the Learning Complete screen layout. | Decide V1 intent: (a) explicitly defer to V2 with a reserved layout space, or (b) implement basic native share sheet with a pre-written text template. |
| G-G-02 | MEDIUM | Under-18 users who turn 18 receive no proactive notification that they can now trade. They must navigate to the Trade tab manually and hope the locked state has changed. | V2: add a push notification on the 18th birthday ("Hôm nay bạn đã đủ tuổi giao dịch! Đặt lệnh đầu tiên →") or a badge dot on the Trade tab icon that clears on first visit after turning 18. |
| G-G-03 | LOW | App reinstall after learning completion resets all progress. Users who have completed the learning path must go through all 4 modules + 4 MKCs again. DOB is stored in registration profile (separate from AsyncStorage), but learning progress is not account-linked. | V2: link learning progress to user account (server-side persistence). For V1: document explicitly that reinstall = full reset; consider surfacing a warning in account/profile settings. |
| G-G-04 | LOW | Age calculation uses `365.25` days/year (accounts for leap years) but does not use exact calendar date arithmetic. For users born on February 29, the calculation may differ by 1 day from exact calendar arithmetic in some years. | Use a proper date library (e.g., `date-fns differenceInYears` or `dayjs`) for the 18th birthday calculation instead of the manual formula. Low risk but worth fixing before launch. |
| G-G-05 | LOW | The 1,500 ms auto-transition from M4 Pass to Learning Complete cannot be cancelled by scrolling or other gestures — only by the CTA tap. If the user is mid-scroll when it fires, the navigation may feel disruptive. | Consider adding a subtle progress indicator (thin line at bottom of screen) for the 1,500 ms window so the transition is not surprising. |

---

## 8. Related Documents

| Document | Path |
|---|---|
| F0 Learning Path Requirements | `docs/business/f0-learning/01-requirements.md` |
| Flow A — Welcome Modal | `docs/business/f0-learning/flow-a-welcome-modal.md` |
| Flow B — Grow Tab | `docs/business/f0-learning/flow-b-grow-tab.md` |
| Flow D — Module Completion | `docs/business/f0-learning/flow-d-module-completion.md` |
| Flow E — Module Knowledge Check | `docs/business/f0-learning/flow-e-mkc.md` |
| Flow F — Placement Quiz | `docs/business/f0-learning/flow-f-placement-quiz.md` |
| Kinetic Drop V2.0 Design System | Internal Figma — Kinetic Drop V2.0 |
