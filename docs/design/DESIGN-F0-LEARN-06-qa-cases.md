# F0 Learning Path — QA Test Cases
**Version:** 2.0 | **Date:** 2026-05-29 | **Feature:** F0 Learning Path (Module F-LEARN)
**Architecture:** Frontend-only · AsyncStorage · No rewards

> **Business requirements:** `docs/business/f0-learning/01-requirements.md`
> **Interaction rules:** `DESIGN-F0-LEARN-05-interactions.md`
> **Each test case maps to:** FR-LEARN-xx (functional requirement) + IR-xx (interaction rule)

---

## Section 1 — Welcome Modal (FR-LEARN-01)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-01 | Welcome Modal — first launch (happy path) | 1. Create new account. 2. Open app for first time. | Welcome Modal appears full-screen. Lottie plays. All 3 CTAs visible. `f0_welcome_modal_shown = true` written to AsyncStorage at render. |
| TC-02 | Welcome Modal — "Start Module 1" tap | 1. Welcome Modal visible. 2. Tap "Bắt đầu Module 1". | Modal dismisses (300ms). Navigate to L1.1 Card 1. `f0_lesson_1_1_state = IN_PROGRESS` in AsyncStorage. Grow tab NOT visited. |
| TC-03 | Welcome Modal — "Explore first" tap | 1. Welcome Modal visible. 2. Tap "Khám phá trước". | Modal dismisses. User lands on Home tab. On next Grow tab visit: LearningPromptCard shown at top. |
| TC-04 | Welcome Modal — NOT shown on second launch | 1. Tap "Khám phá trước" on first launch. 2. Close app. 3. Reopen. | Welcome Modal does NOT appear. User lands on Home tab. |
| TC-05 | Welcome Modal — force-kill after render | 1. App first launch → modal renders. 2. Force-kill immediately. 3. Reopen. | Welcome Modal does NOT appear again (flag written at render, before any CTA tap). |
| TC-06 | Welcome Modal — tertiary CTA tap | 1. Welcome Modal visible. 2. Tap "Tôi đã biết chứng khoán cơ bản". | Placement Quiz intro screen opens (slideUp). Back navigation is available on intro screen. |
| TC-07 | Welcome Modal — Lottie fallback | 1. Block Lottie asset (no network). 2. First app launch. | Static PNG fallback displayed. All 3 CTAs are active and functional. |
| TC-08 | Welcome Modal — offline first launch | 1. Set airplane mode. 2. First app launch. | Welcome Modal still shows (flag read from local AsyncStorage = false). Modal renders with Lottie fallback. |

---

## Section 2 — Learning Path Home / Grow Tab (FR-LEARN-02)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-09 | Module states displayed correctly | 1. Complete M1 lessons 1–3. 2. Open Grow tab. | M1 shows `in-progress` with 60% lesson bar and "Tiếp tục →". M2, M3, M4 show `locked`. |
| TC-10 | Locked module tap | 1. M2 is LOCKED. 2. Tap M2 ModuleCard. | Tooltip: "Hoàn thành Module 1 để mở khóa". Auto-hides after 2500ms. No navigation. |
| TC-11 | Continue lesson from Grow tab | 1. User has partial progress on L2.3 saved at card 2. 2. Tap M2 "Tiếp tục →". | Lesson viewer opens at L2.3, card index 2. Progress dots show correct position. |
| TC-12 | AsyncStorage read fallback | 1. Simulate AsyncStorage.multiGet failure. 2. Open Grow tab. | Skeleton loaders briefly, then M1 UNLOCKED shown, M2–M4 LOCKED. No error message. Pull-to-refresh retries. |
| TC-13 | All modules complete | 1. Complete all 4 modules and pass all MKCs. 2. Open Grow tab. | All 4 ModuleCards show `complete` state with checkmarks. "Học xong rồi!" celebration banner visible. |
| TC-14 | LearningPromptCard shown conditionally | 1. Dismiss Welcome Modal via "Khám phá trước". 2. Open Grow tab. | LearningPromptCard shown at top of module list. |
| TC-15 | LearningPromptCard hidden after module started | 1. User has started M1 (f0_module_1_state = IN_PROGRESS). 2. Open Grow tab. | LearningPromptCard NOT shown. |
| TC-16 | LESSONS_COMPLETE state shows MKC CTA | 1. Complete all 5 lessons of M1. 2. Open Grow tab. | M1 ModuleCard shows `lessons-complete` variant with "Làm bài kiểm tra →" lime CTA. |

---

## Section 3 — Card-Stack Lesson Viewer (FR-LEARN-03)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-17 | Lesson opens at Card 1 (fresh start) | 1. M1, L1.1, no prior progress. 2. Tap "Bắt đầu →". | Card 1 (Concept) shown. Progress dots: ●○○○○. Progress bar at 20%. |
| TC-18 | Swipe left to advance | 1. On Card 2. 2. Swipe left. | Card 3 slides in from right. Progress dots update to ●●●○○. `f0_lesson_{n}_{m}_card_index = 2` saved (debounced). |
| TC-19 | Swipe right to go back | 1. On Card 3. 2. Swipe right. | Card 2 slides in from left. Progress dots update to ●●○○○. |
| TC-20 | Swipe right on Card 1 (boundary) | 1. On Card 1. 2. Swipe right. | Card bounces 8px right → returns. Haptic feedback. No navigation. |
| TC-21 | Resume lesson after exit | 1. Complete cards 1–3, exit app. 2. Reopen and navigate to same lesson. | Lesson opens at Card 4 (or Card 3 at worst if save debounce was in-flight). |
| TC-22 | Review mode (completed lesson) | 1. Navigate to a previously completed lesson. 2. Navigate through all cards. | All 5 cards freely navigable both ways. Card 4 shows correct answer pre-highlighted. No re-evaluation. |

---

## Section 4 — In-Lesson Quiz (FR-LEARN-04)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-23 | Correct answer — local evaluation | 1. On Card 4. 2. Tap correct option. | Option turns quiz-correct-bg with check-circle. All other options disabled. "Tiếp theo →" activates. No server call. |
| TC-24 | Wrong answer (attempts 1–2) | 1. On Card 4. 2. Tap wrong option. | Option turns quiz-wrong-bg with shake. "Thử lại nhé!" message. Option resets after 300ms. |
| TC-25 | Hint triggered on 3rd wrong answer | 1. Answer wrong 3 times consecutively. | On 3rd wrong: HintCard slides in from right (plasma styling). "Hiểu rồi, thử lại →" CTA visible. |
| TC-26 | Hint dismissal and retry | 1. HintCard showing. 2. Tap "Hiểu rồi, thử lại →". | HintCard slides out. QuizCard returns. All options reset to default. No attempt limit enforced. |
| TC-27 | "Tiếp theo" disabled until correct | 1. On Card 4. 2. Select wrong answer. | "Tiếp theo →" remains disabled (opacity-40) until correct answer is selected. |
| TC-28 | Back navigation blocked on Card 4 | 1. On Card 4 (unanswered). 2. Attempt system back gesture. | No navigation. Back chevron is HIDDEN. System back gesture has no effect. |

---

## Section 5 — Module Knowledge Check (FR-LEARN-07)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-29 | MKC Pass (≥ 3/5) — local eval | 1. Complete all 5 lessons of M1. 2. Take MKC. 3. Answer 4/5 correctly. 4. Tap "Nộp bài". | Pass screen: "Module 1 Hoàn Thành!" in lime. Score "4/5". No badge/XP. "Bắt đầu Module 2 →" CTA. `f0_module_1_state = COMPLETE`, `f0_module_2_state = UNLOCKED` in AsyncStorage. |
| TC-30 | MKC Fail (< 3/5) — cooldown starts | 1. Complete M1 lessons. 2. Take MKC. 3. Answer 2/5 correctly. 4. Submit. | Fail screen: "2/5" in negative. Countdown at 00:60. "Thử lại sau..." button disabled. `f0_mkc_1_cooldown_start` written to AsyncStorage. |
| TC-31 | MKC retry after 60s cooldown | 1. Fail MKC. 2. Wait 60 seconds. | "Thử lại ngay →" activates (lime, full opacity). Banner transitions cooldown-bg → xp-pill-bg. |
| TC-32 | MKC retry button inactive during cooldown | 1. Fail MKC. 2. Tap retry button at T+10s. | Button non-interactive (disabled). Countdown timer still running. |
| TC-33 | MKC cooldown survives app kill | 1. Fail MKC (T=0s). 2. Kill app at T=30s. 3. Reopen, navigate to MKC results. | Countdown shows ~30s remaining (calculated from saved timestamp). Not reset to 60s. |
| TC-34 | MKC forward-only navigation | 1. Open MKC. 2. Answer Q1. 3. Attempt to go back from Q2. | No back navigation. Back chevron hidden. System back disabled. |
| TC-35 | MKC no per-question reveal | 1. Take MKC. 2. Select answer on Q2. 3. Advance to Q3. | Q2 selected option shows "selected" state only. NO correct/wrong reveal until full submission. |

---

## Section 6 — Placement Quiz (FR-LEARN-08)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-36 | Placement Quiz Pass (≥ 4/5) | 1. Tap tertiary CTA on Welcome Modal. 2. Answer 4/5 correctly. 3. Submit. | Pass screen (lime AmbientBackground): score "4/5". No badge/XP. `f0_module_1_state = COMPLETE`, `f0_module_2_state = UNLOCKED`. "Bắt đầu Module 2 →" active. |
| TC-37 | Placement Quiz Fail (< 4/5) | 1. Tap tertiary CTA. 2. Answer 2/5 correctly. 3. Submit. | Fail screen (plasma AmbientBackground). Score in fog. "Bắt đầu Module 1 →" CTA. `f0_module_1_state = UNLOCKED` (unchanged). |
| TC-38 | Placement Quiz back blocked on Q1–Q5 | 1. Start quiz (tap "Bắt đầu"). 2. Answer Q1. 3. Attempt back gesture. | No navigation. Back button hidden. System back disabled. |
| TC-39 | Placement Quiz back available on INTRO | 1. Tap tertiary CTA. 2. See intro card. 3. Tap back chevron. | Navigates back to Welcome Modal. Back available on intro screen only. |
| TC-40 | Placement Quiz one-shot enforcement | 1. Complete quiz (any score). 2. Navigate back to Welcome Modal path. | `f0_placement_quiz_completed = true`. No retry option exists. Tertiary CTA is no longer accessible. |
| TC-41 | Placement Quiz force-kill — no re-entry | 1. Start quiz. Progress to Q3. 2. Force-kill app. 3. Reopen. | Welcome Modal does NOT refire (`f0_welcome_modal_shown = true`). User lands on Home tab. M1 UNLOCKED in Grow tab. No placement quiz entry point. |

---

## Section 7 — Learning Path Completion & Age Gate (FR-LEARN-09, FR-LEARN-10)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-42 | M4 MKC pass → Learning Complete screen | 1. Pass M4 MKC. | "Module 4 Hoàn Thành!" pass screen. CTA "Xem kết quả học →". `f0_learning_path_complete = true` written. |
| TC-43 | Learning Complete screen appearance | 1. Tap "Xem kết quả học →" from M4 pass. | Learning Complete screen: AmbientBackground lime+plasma, "Chúc mừng! 🎓", stats "4 modules · 20 bài học · Sẵn sàng đầu tư", "Bắt đầu đầu tư →" CTA. |
| TC-44 | Post-learning — user age ≥ 18 | 1. Complete learning. 2. DOB = 8 years ago (age 20). 3. Tap "Bắt đầu đầu tư →". | Navigate to Trade tab. Tooltip: "Sẵn sàng đặt lệnh đầu tiên! 💪" (auto-dismiss 2500ms). NO AgeGateBottomSheet shown. |
| TC-45 | Post-learning — user age < 18 | 1. Complete learning. 2. DOB = 2 years ago (age 16). 3. Tap "Bắt đầu đầu tư →". | Navigate to Home tab. AgeGateBottomSheet slides up. Shows "Bạn chưa đủ tuổi giao dịch" + specific date when user turns 18. |
| TC-46 | Post-learning — DOB missing | 1. Complete learning. 2. DOB not set in profile. 3. Tap "Bắt đầu đầu tư →". | AgeGateBottomSheet shows (no-date variant). Copy: "Cập nhật ngày sinh trong Hồ sơ để mở tính năng giao dịch." No specific date shown. |
| TC-47 | AgeGateBottomSheet — "Xem thị trường" tap | 1. AgeGateBottomSheet visible. 2. Tap "Xem thị trường →". | Sheet dismisses. Navigate to Market tab. |
| TC-48 | Return to Grow tab after Learning Complete | 1. Complete all 4 modules. 2. Navigate to Grow tab. | All 4 ModuleCards show `complete` state. "Ôn lại →" ghost CTA visible on each. |
| TC-49 | Birthday edge case — exactly 18 today | 1. DOB = exactly 18 years ago today. 2. Tap "Bắt đầu đầu tư →". | Treated as ≥ 18. Navigate to Trade tab directly. AgeGateBottomSheet NOT shown. |

---

## Section 8 — Local Storage & Recovery

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-50 | App reinstall — full progress reset | 1. Complete M1, M2. 2. Reinstall app. 3. Open app. | Welcome Modal appears (f0_welcome_modal_shown = false). All modules LOCKED except M1 UNLOCKED. All lesson progress lost. |
| TC-51 | Resume from saved card index | 1. Progress to L1.3 Card 3. 2. Close app. 3. Reopen → navigate to L1.3. | Lesson opens at Card 3. Progress dots: ●●●○○. |
| TC-52 | MKC cooldown resumes after kill | 1. Fail MKC (T=0s). 2. Kill app at T=20s. 3. Reopen → navigate to MKC. | Countdown shows ~40s remaining. Not reset to 60s. Calculated from stored `f0_mkc_{n}_cooldown_start`. |
| TC-53 | AsyncStorage failure fallback | 1. Simulate AsyncStorage read error on Grow tab. 2. View Grow tab. | M1 shows UNLOCKED. M2–M4 show LOCKED. No error message. Pull-to-refresh retries. |
| TC-54 | Lesson complete idempotency | 1. Complete L1.1 (card 5 viewed). 2. Return to L1.1 and view card 5 again. | `f0_lesson_1_1_state` stays COMPLETE. No duplicate state writes. No re-trigger of L1.2 unlock logic. |

---

## State Coverage Summary

| Component | States Covered |
|-----------|---------------|
| QuizOption | default ✓, selected ✓, correct ✓, wrong ✓, disabled ✓ |
| ModuleCard | locked ✓, unlocked ✓, in-progress ✓, lessons-complete ✓, complete ✓ |
| MKCCooldownBanner | counting ✓, ready ✓, app-kill resume ✓ |
| LearningCompleteCard | default ✓, cta-loading ✓ |
| AgeGateBottomSheet | with-date ✓, no-date ✓ |
| HintCard | trigger ✓, dismiss ✓ |
| Welcome Modal | happy path ✓, dismiss ✓, force-kill ✓, offline ✓ |
| Placement Quiz | pass ✓, fail ✓, back-blocked ✓, one-shot ✓, force-kill ✓ |
| MKC | pass ✓, fail ✓, cooldown ✓, cooldown-resume ✓, forward-only ✓ |
| AsyncStorage | read-failure ✓, write-debounce ✓, cold-start ✓, reinstall-reset ✓ |

---

*Owner: QA Engineering | Design reference: `DESIGN-F0-LEARN-05-interactions.md`*
*Business requirements: `docs/business/f0-learning/01-requirements.md`*
*Total test cases: 54 | V2 changes: removed reward TCs (old 41–47); added completion/age gate section + local storage section*

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| F0 Learning Path V2 | `docs/business/f0-learning/00-index.md` |
| Functional Requirements | `docs/business/f0-learning/01-requirements.md` |
| Local Storage Data Model | `docs/business/f0-learning/03-data-model.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Design Alignment + Tokens | `docs/design/DESIGN-F0-LEARN-00-alignment.md` |
| UX Flows (Design Detail) | `docs/design/DESIGN-F0-LEARN-01-ux-flows.md` |
| Screen Wireframes | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| UI Specification | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |
| Component Specs | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |
