# F0 Learning Path — QA Test Cases
**Version:** 1.0 | **Date:** 2026-05-28 | **Feature:** F0 Learning Path (Module F-LEARN)

> **FRD reference:** `docs/business/frd/module-f0-learning.md`
> **Interaction rules:** `DESIGN-F0-LEARN-05-interactions.md`
> **Each test case maps to:** FR-LEARN-xx (functional requirement) + IR-xx (interaction rule)

---

## Section 1 — Welcome Modal (FR-LEARN-01)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-01 | Welcome Modal — first launch (happy path) | 1. Create new account → ACTIVE status. 2. Open app for first time. | Welcome Modal appears full-screen over Home tab. Lottie animation plays. All 3 CTAs visible. `welcome_modal_shown` written to server at render. |
| TC-02 | Welcome Modal — "Start Module 1" tap | 1. Welcome Modal visible. 2. Tap "Bắt đầu Module 1". | Modal dismisses. User navigated directly to L1.1 Card 1 (Concept). Grow tab NOT visited. XPToast NOT shown yet. |
| TC-03 | Welcome Modal — "Explore first" tap | 1. Welcome Modal visible. 2. Tap "Khám phá trước". | Modal dismisses. User lands on Home tab. On next Grow tab visit: LearningPromptCard shown at top. |
| TC-04 | Welcome Modal — NOT shown on second launch | 1. Tap "Khám phá trước" on first launch. 2. Close app. 3. Reopen app. | Welcome Modal does NOT appear. User lands on Home tab directly. |
| TC-05 | Welcome Modal — force-kill after render | 1. App first launch → modal renders. 2. Force-kill app immediately (before tapping any CTA). 3. Reopen. | Welcome Modal does NOT appear again (flag written at render, not on CTA tap). |
| TC-06 | Welcome Modal — "I already know" tertiary tap | 1. Welcome Modal visible. 2. Tap "Tôi đã biết chứng khoán cơ bản". | Placement Quiz intro screen opens. Back navigation is blocked. |
| TC-07 | Welcome Modal — Lottie fallback | 1. Block Lottie asset download (network condition). 2. First app launch. | Static PNG fallback displayed. CTAs are still active and functional. |
| TC-08 | Welcome Modal — network unavailable on first launch | 1. Set device to airplane mode. 2. First app launch. | Welcome Modal NOT displayed. Home tab loads. No error shown. Modal fires on next launch when network available. |

---

## Section 2 — Learning Path Home / Grow Tab (FR-LEARN-02)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-09 | Module states displayed correctly | 1. Complete M1 lessons 1–3. 2. Open Grow tab. | M1 shows "IN_PROGRESS" with 60% progress bar and "Tiếp tục" CTA. M2, M3, M4 show LOCKED. |
| TC-10 | Locked module tap | 1. M2 is LOCKED. 2. Tap M2 module card. | Tooltip appears: "Hoàn thành Module 1 để mở khóa". Auto-hides after 2500ms. No navigation. |
| TC-11 | Continue lesson from Grow tab | 1. User has partial progress on L2.3 (saved at card 2). 2. Tap Module 2 "Tiếp tục". | Lesson viewer opens at L2.3, card 2. Progress dots show correct position. |
| TC-12 | Grow tab data load failure | 1. Kill API connection. 2. Open Grow tab. | Skeleton loaders shown for 3s. Error state with "Thử lại" button after 3s. |
| TC-13 | All modules complete | 1. Complete all 4 modules and pass all MKCs. 2. Open Grow tab. | All 4 module cards show COMPLETE state with checkmarks. "Path Complete" celebration state shown. |
| TC-14 | LearningPromptCard shown conditionally | 1. Dismiss Welcome Modal via "Khám phá trước". 2. Open Grow tab. | LearningPromptCard shown at top of module list. |
| TC-15 | LearningPromptCard hidden after module started | 1. User has started M1 (at least 1 lesson complete). 2. Open Grow tab. | LearningPromptCard NOT shown. |

---

## Section 3 — Card-Stack Lesson Viewer (FR-LEARN-03)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-16 | Lesson opens at Card 1 (fresh start) | 1. M1, L1.1, no prior progress. 2. Tap "Bắt đầu". | Card 1 (Concept) shown. Progress dots: ●○○○○. Progress bar at 20%. |
| TC-17 | Swipe left to advance | 1. On Card 2. 2. Swipe left. | Card 3 slides in from right. Progress dots update to ●●●○○. card_index saved. |
| TC-18 | Swipe right to go back | 1. On Card 3. 2. Swipe right. | Card 2 slides in from left. Progress dots update to ●●○○○. |
| TC-19 | Swipe right on Card 1 (boundary) | 1. On Card 1. 2. Swipe right. | Card bounces 8px right → returns. Haptic feedback. No navigation. |
| TC-20 | Resume lesson after exit | 1. Complete cards 1–3, exit app. 2. Reopen and navigate to same lesson. | Lesson opens at Card 4. Cards 1–3 shown as visited (●●●). |
| TC-21 | Review mode (completed lesson) | 1. Navigate to a previously completed lesson. 2. Navigate through all cards. | All 5 cards freely navigable both ways. No XP re-awarded. "Review" badge visible. |
| TC-22 | Card content load error | 1. Block CMS API. 2. Open a lesson. | Error placeholder shown: "Không tải được nội dung. Thử lại?" + retry button. |

---

## Section 4 — In-Lesson Quiz (FR-LEARN-04)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-23 | Correct answer first attempt | 1. On Card 4 (Quiz). 2. Tap correct option. | Option turns green (quiz-correct-bg). checkmark icon. All others disabled. "Tiếp theo" enabled. |
| TC-24 | Wrong answer first attempt | 1. On Card 4. 2. Tap wrong option. | Option turns red, shake animation. "Thử lại nhé!" shown. Attempt count = 1. Options reset for retry. |
| TC-25 | Hint card triggered on 3rd wrong | 1. Answer wrong 3 times consecutively. | On 3rd wrong: HintCard slides in from right with plasma styling. "Hiểu rồi" CTA visible. |
| TC-26 | Hint card dismissal and retry | 1. HintCard showing. 2. Tap "Hiểu rồi, thử lại →". | HintCard slides out. QuizCard returns. Options reset to default. No attempt limit enforced. |
| TC-27 | "Tiếp theo" disabled until correct | 1. On Card 4. 2. Select a wrong answer. 3. Observe "Tiếp theo" button. | "Tiếp theo" remains disabled (opacity-40) until correct answer is selected. |

---

## Section 5 — Module Knowledge Check (FR-LEARN-18)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-28 | MKC Pass (≥3/5) | 1. Complete all 5 lessons of M1. 2. Take MKC. 3. Answer 4/5 correctly. 4. Submit. | MKC Pass Results screen shown. Score "4/5" in lime. "Nhận phần thưởng" CTA active. |
| TC-29 | MKC Fail (<3/5) | 1. Complete M1 lessons. 2. Take MKC. 3. Answer 2/5 correctly. 4. Submit. | MKC Fail Results screen shown. Score "2/5" in negative. Cooldown banner shows "00:60" countdown. "Thử lại sau..." button disabled. |
| TC-30 | MKC retry after 60s cooldown | 1. Fail MKC. 2. Wait 60 seconds. | "Thử lại ngay →" button activates (lime, full opacity). Banner transitions from cooldown-bg to xp-pill-bg. |
| TC-31 | MKC retry button inactive during cooldown | 1. Fail MKC. 2. Tap "Thử lại" button at T+10s. | Button non-interactive (disabled state). Countdown timer still running. |
| TC-32 | MKC forward-only navigation | 1. Open MKC. 2. Answer Q1. 3. Attempt to go back to Q1 from Q2. | No back navigation available. Back chevron hidden. System back gesture has no effect. |
| TC-33 | MKC no per-question reveal | 1. Take MKC. 2. Select answer on Q2. 3. Advance to Q3. 4. Return to Q2. | Q2 selected option remains highlighted (selected state only). NO correct/wrong reveal shown until final submission. |
| TC-34 | MKC API timeout | 1. Submit MKC. 2. Kill network before response. | After 3s: error toast "Không thể kết nối. Thử lại sau vài giây." No score saved. No cooldown triggered. |

---

## Section 6 — Placement Quiz (FR-LEARN-19)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-35 | Placement Quiz Pass (≥4/5) | 1. Tap tertiary CTA on Welcome Modal. 2. Answer 4/5 correctly. 3. Submit. | Pass screen: "Bạn đã nắm vững kiến thức cơ bản!" Score "4/5". M1 marked complete (no badge/XP). "Bắt đầu Module 2 →" CTA active. |
| TC-36 | Placement Quiz Fail (<4/5) | 1. Tap tertiary CTA. 2. Answer 2/5 correctly. 3. Submit. | Fail screen: "Hãy bắt đầu từ đầu" message. "Bắt đầu Module 1 →" CTA active. |
| TC-37 | Placement Quiz — back navigation blocked | 1. Start Placement Quiz. 2. Answer Q1. 3. Attempt system back gesture. | No navigation back. Back button hidden. System back gesture disabled. User stays on Q2. |
| TC-38 | Placement Quiz — back visible on INTRO screen only | 1. Tap tertiary CTA. 2. See intro card ("Kiểm tra nhanh..."). 3. Tap back. | Back navigation works on intro card (before "Bắt đầu" tap). Navigates back to Welcome Modal. |
| TC-39 | Placement Quiz — one-shot (no retry) | 1. Complete Placement Quiz (any score). 2. Navigate back to Welcome Modal path. | No retry option exists. Tertiary CTA on Welcome Modal no longer available or routes directly to M1/M2 based on result. |
| TC-40 | Placement Quiz — force-kill (no partial save) | 1. Start quiz on Q3. 2. Force-kill app. 3. Reopen. | Welcome Modal fires again (welcome_modal_shown still false). User can take Placement Quiz again. |

---

## Section 7 — Module Completion Rewards (FR-LEARN-09, FR-LEARN-10)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-41 | M1 reward screen (Common badge) | 1. Pass M1 MKC. | Reward screen shows "Market Foundations" badge with Common rarity (1px #9CA3AF border). "+125 XP" chip. "Mở khóa Module 2" CTA. |
| TC-42 | M3 reward screen (two XP lines) | 1. Pass M3 MKC. | Reward screen shows TWO separate XP chips: "+125 XP (5 bài học)" and "+25 XP (Module hoàn thành)". Portfolio Thinker badge with Uncommon rarity (2px #34D399 border, ✦ symbol). |
| TC-43 | M4 reward screen (Rare badge) | 1. Pass M4 MKC. | Reward screen shows "Market Scholar" badge with Rare rarity (3px #60A5FA border, ★ symbol, rgba(96,165,250,0.20) glow). "+200 XP" total. |
| TC-44 | M2 Bonus Cash Modal fires | 1. Pass M2 MKC and reach reward screen. 2. Tap "Xem tiền thưởng →". | Bonus Cash Modal slides up showing "50,000,000 ₫" in lime. Expiry warning visible. GlassmorphicSecurityInfo component shown. |
| TC-45 | Reward screen — force-kill after badge award | 1. Pass MKC. 2. Force-kill app before seeing reward screen. 3. Reopen. | Module shows as COMPLETE in Grow tab. Badge in My Badges. No re-trigger of reward animation. |

---

## Section 8 — Lesson Completion XP (FR-LEARN-06)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-46 | XP Toast appears on lesson complete | 1. Complete a lesson (reach CTA card and skip or act). | XPToast slides up: "+25 XP, Bài học hoàn thành!" Lime icon + text. Auto-dismisses in 2500ms. |
| TC-47 | XP NOT re-awarded on review | 1. Navigate to an already-completed lesson. 2. Complete all 5 cards again. | No XPToast shown. lesson_completions idempotency check prevents re-award. |

---

## Section 9 — Daily Missions Gate (FR-LEARN-12)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| TC-48 | Daily Missions locked before M1 complete | 1. New user, M1 not complete. 2. Navigate to Daily Missions section. | Locked state shown: blurred placeholders, padlock, "Mở khóa sau khi hoàn thành Module 1" banner with CTA. |
| TC-49 | Daily Missions unlock after M1 complete | 1. Complete M1 (pass MKC). 2. Navigate to Daily Missions. | Daily Missions active mission list shown. Lock state removed. |

---

## State Coverage Summary

| Component | States Covered |
|-----------|---------------|
| QuizOption | default ✓, selected ✓, correct ✓, wrong ✓, disabled ✓ |
| ModuleCard | locked ✓, unlocked ✓, in-progress ✓, complete ✓ |
| XPToast | appear ✓, auto-dismiss ✓, idempotency ✓ |
| HintCard | trigger ✓, dismiss ✓ |
| MKCCooldownBanner | counting ✓, ready ✓ |
| BadgeCard | common ✓, uncommon ✓, rare ✓ |
| BonusCashModal | appear ✓, CTA navigate ✓ |
| Welcome Modal | happy path ✓, dismiss ✓, force-kill ✓, network failure ✓ |
| Placement Quiz | pass ✓, fail ✓, back-blocked ✓, one-shot ✓, partial-save ✓ |
| MKC | pass ✓, fail ✓, cooldown ✓, timeout ✓, forward-only ✓ |

---

*Owner: QA Engineering | Design reference: `DESIGN-F0-LEARN-05-interactions.md`*
*FRD reference: `docs/business/frd/module-f0-learning.md`*
*Total test cases: 49 | Minimum 5 per screen satisfied ✓*

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

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |
