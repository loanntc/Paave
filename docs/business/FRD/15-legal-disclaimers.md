# FRD-15: Legal Disclaimers

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

## Module Description

The Legal Disclaimers module defines all mandatory disclosures in the Paave app: the investment disclaimer shown on first view of market data screens per session, the AI-generated content disclaimer appended to every AI output, data consent at registration, and the brokerage partner disclaimer. These are compliance-critical requirements — any deviation from the specified behavior is a P0 violation. This document is self-contained; a developer and QA reading only this file have everything needed to implement and verify all disclaimer behavior.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Legal Disclaimers |
| Primary Actor | System (mandatory rendering) + User (acknowledgment) |
| Goal | Ensure regulatory compliance; protect Paave from liability; inform users of risk |
| Trigger | Screen load (investment disclaimer); AI response (AI disclaimer); registration (data consent); brokerage CTA tap (partner disclaimer) |
| Compliance Failure Consequence | P0 production bug; must be hotfixed within 24 hours |

---

## 2. Functional Requirements

---

### FR-LEGAL-01: Investment Disclaimer Display

- **Actor**: System + Authenticated user
- **Description**: A full-screen modal disclaimer is shown on the FIRST view of each qualifying screen TYPE per session. Qualifying screen types: Stock Detail, Portfolio Dashboard (Paper Trading), and Markets tab. "First view per screen type" means: if the user visits Stock Detail for VIC, the disclaimer fires. If they then visit Stock Detail for VHM, the disclaimer does NOT fire again (same screen type, same session). A new session begins when the user logs out, the app is closed and reopened, or the access token expires and a new session is established. The session state does NOT reset on app backgrounding if the access token is still valid.

  The disclaimer modal must: block access to market data behind it (opaque overlay, no see-through); require explicit "Got it" acknowledgment before the modal closes; display disclaimer text in the user's active language; use English fallback if the user's language translation is unavailable. The "Got it" button closes the modal and proceeds to the screen. There is NO "Cancel" or "Back" option on the disclaimer — the user must acknowledge to proceed.

- **Input**:
  - User's session state: which screen types have been acknowledged this session
  - User's active language
  - Screen type being loaded (Stock Detail | Portfolio Dashboard | Markets)
- **Output**:
  - Modal displayed (first view per type per session)
  - "Got it" tapped → modal dismissed → screen content revealed
  - Acknowledgment stored in session state (in-memory; not persisted to server)
  - Modal NOT shown on subsequent views of same screen type within same session
- **Precondition**: User is authenticated. Navigating to a qualifying screen type.
- **Postcondition**: Disclaimer shown and acknowledged. Screen content accessible. Disclaimer not reshown this session for same type.

#### Disclaimer Text (Authoritative English)

> "This app is for educational purposes only. It does not constitute financial advice. Past performance does not guarantee future results. Virtual trading does not reflect real market conditions."

#### Disclaimer Translations

| Language | Translated Text |
|---|---|
| Vietnamese (vi) | "Ứng dụng này chỉ dành cho mục đích giáo dục. Nó không cấu thành lời khuyên tài chính. Hiệu suất trong quá khứ không đảm bảo kết quả trong tương lai. Giao dịch ảo không phản ánh điều kiện thị trường thực tế." |
| Korean (ko) | "이 앱은 교육 목적으로만 제공됩니다. 금융 투자 조언을 구성하지 않습니다. 과거 성과는 미래 결과를 보장하지 않습니다. 가상 거래는 실제 시장 상황을 반영하지 않습니다." |
| English (en) | (English text above) |

#### Session Definition (for Disclaimer Tracking)

| Event | Session Behavior |
|---|---|
| App close + reopen | New session; all disclaimer acknowledgments reset |
| Log out + log in | New session; all disclaimer acknowledgments reset |
| Access token expires (silent refresh succeeds) | Same session continues; acknowledgments preserved |
| Access token expires (silent refresh fails → re-login) | New session; acknowledgments reset |
| App backgrounded and foregrounded | Same session; acknowledgments preserved |

#### Qualifying Screens

| Screen Type | Disclaimer ID | When Shown |
|---|---|---|
| Stock Detail | DISC-STOCK | First Stock Detail visit per session (any ticker) |
| Portfolio Dashboard (Paper Trading) | DISC-PORTFOLIO | First Portfolio tab visit per session |
| Markets tab | DISC-MARKETS | First Markets tab visit per session |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-LEGAL-01-01 | Fresh session; user navigates to Stock Detail (VIC) | First visit | Disclaimer modal shown; market data blocked behind opaque overlay |
| AC-LEGAL-01-02 | User taps "Got it" | On disclaimer | Modal dismissed; Stock Detail content visible |
| AC-LEGAL-01-03 | User navigates to another Stock Detail (VHM) same session | Same session | Disclaimer NOT shown (same screen type already acknowledged) |
| AC-LEGAL-01-04 | User navigates to Markets tab (same session) | First Markets visit | Disclaimer shown again (different screen type; DISC-MARKETS not yet acknowledged) |
| AC-LEGAL-01-05 | App closed and reopened | New session | All acknowledgments reset; disclaimer shown on next qualifying screen visit |
| AC-LEGAL-01-06 | User's language = Korean; disclaimer text not yet translated | Modal shows | English fallback shown; "Got it" still functional |
| AC-LEGAL-01-07 | Disclaimer modal is open | User attempts to tap content behind modal | No interaction behind modal possible; opaque overlay captures all taps |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Disclaimer text fails to load from server | Show hardcoded English fallback text (hardcoded in app binary); NEVER skip the disclaimer |
| User rapidly navigates to three qualifying screens before first disclaimer is dismissed | Only one disclaimer is shown at a time; queue the next ones; after "Got it" on the first, check if next screen type needs its disclaimer |
| Deep link from push notification to Stock Detail | Disclaimer shown first; after "Got it", target screen renders |
| User with hearing impairment (accessibility) | "Got it" button must be keyboard/switch-accessible; modal title announces via screen reader |

- **Priority**: P0 (compliance-critical)

---

### FR-LEGAL-02: AI Disclaimer on Every AI Response

- **Actor**: System (AI response rendering layer)
- **Description**: Every AI-generated output in the app must have a disclaimer appended. This applies to all AI features: market summaries (FR-AI-01), stock explanations (FR-AI-02), portfolio health check (FR-AI-04), behavioral nudges (FR-AI-05), and any future AI feature. The disclaimer is rendered server-side as part of the AI response — the client MUST NOT strip or filter it. The disclaimer is NOT collapsible, NOT hideable, NOT behind a "Show more" toggle. It appears immediately below the AI content in every response, every time. If the language file fails to load for the disclaimer translation: show English fallback. Never suppress the disclaimer.

- **Input**:
  - AI-generated content (any type)
  - User's active language
- **Output**:
  - AI content displayed
  - Disclaimer rendered immediately below content, same view, always visible
- **Precondition**: Any AI response is generated and about to be displayed.
- **Postcondition**: Disclaimer visible on screen below AI content.

#### AI Disclaimer Text (Authoritative English)

> "AI-generated content is for educational purposes only. Not financial advice. Do not make investment decisions based solely on this content."

#### AI Disclaimer Translations

| Language | Translated Text |
|---|---|
| Vietnamese (vi) | "Nội dung do AI tạo ra chỉ dành cho mục đích giáo dục. Không phải lời khuyên tài chính. Không đưa ra quyết định đầu tư chỉ dựa trên nội dung này." |
| Korean (ko) | "AI가 생성한 콘텐츠는 교육 목적으로만 제공됩니다. 금융 투자 조언이 아닙니다. 이 콘텐츠만을 근거로 투자 결정을 내리지 마세요." |
| English (en) | (English text above) |

#### AI Features Covered (Exhaustive List)

| Feature ID | Feature Name | Disclaimer Required |
|---|---|---|
| FR-AI-01 | Market Summary AI | Yes |
| FR-AI-02 | Stock Explanation AI | Yes |
| FR-AI-04 | Portfolio Health Check | Yes |
| FR-AI-05 | Behavioral Nudges | Yes |
| All future AI features | Any | Yes — no exceptions |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-LEGAL-02-01 | AI market summary renders | Any time | Disclaimer text shown immediately below summary; same scroll view |
| AC-LEGAL-02-02 | AI behavioral nudge push notification | Notification received | Disclaimer included in notification body or, if truncated in notification, shown in full on notification detail tap |
| AC-LEGAL-02-03 | User's language = Vietnamese | AI response renders | Disclaimer in Vietnamese |
| AC-LEGAL-02-04 | Vietnamese translation unavailable | AI response renders | English disclaimer shown; AI content still rendered |
| AC-LEGAL-02-05 | Client attempts to filter disclaimer | Any action | Server renders disclaimer as part of response body; client cannot strip it |
| AC-LEGAL-02-06 | User scrolls past AI content | Scroll action | Disclaimer remains in DOM below content; it scrolls with content but is always BELOW content (not floating) |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| AI response is very long (e.g., 2000-word portfolio analysis) | Disclaimer appears at end of the full response; user must scroll to see it — this is acceptable |
| AI response contains multiple paragraphs | Disclaimer is added ONCE at the end; not between each paragraph |
| AI response is empty or returns error | No disclaimer needed (no AI content generated) |
| Push notification body truncated (OS character limit) | Include abbreviated disclaimer: "AI content — not financial advice."; full disclaimer on notification tap |

- **Priority**: P0 (compliance-critical per BR-21)

---

### FR-LEGAL-03: Data Consent at Registration

- **Actor**: Unauthenticated user (registering)
- **Description**: Data consent is shown as a required step during registration. Placement differs by auth method: (1) Email/Password registration: shown as step 1 of email onboarding. (2) Social OAuth registration (Google, Apple, Zalo): shown as step 6 of social onboarding, after identity is established. Three checkboxes are shown: (1) Terms of Service — required to proceed; (2) Privacy Policy including data collection scope — required to proceed; (3) Marketing communications — optional; user can uncheck without blocking registration. No checkboxes are pre-checked (BR-22). Items 1 and 2 are required — registration is blocked if either is unchecked. Item 3 is optional — its value is stored as `marketing_opt_in = true/false`. Each checkbox must be explicitly tapped by the user — no auto-proceed, no swipe-to-accept. Terms of Service and Privacy Policy links open in an in-app webview showing the current document. Consent timestamp, ToS version, and Privacy Policy version are stored on the user record at the moment of submission.

- **Input**:
  - Checkbox state: ToS (bool), Privacy Policy (bool), Marketing (bool)
  - User tap on "Register" / "Continue" CTA
  - ToS version identifier (current)
  - Privacy Policy version identifier (current)
- **Output**:
  - If ToS and Privacy Policy both checked: registration proceeds; `marketing_opt_in` stored; consent timestamp + version IDs stored on user record
  - If ToS or Privacy Policy unchecked: registration blocked; inline error "Please accept the Terms of Service and Privacy Policy to continue."
  - Marketing unchecked: `marketing_opt_in = false`; registration proceeds
- **Precondition**: User is on consent step of registration flow.
- **Postcondition**: Consent recorded. Registration continues (if valid). Consent timestamp and version logged immutably.

#### Checkbox Specification

| # | Label | Required | Default State | `marketing_opt_in` |
|---|---|---|---|---|
| 1 | "I agree to the Terms of Service" | Yes | Unchecked | N/A |
| 2 | "I agree to the Privacy Policy, including data collection as described" | Yes | Unchecked | N/A |
| 3 | "I'd like to receive marketing communications from Paave (optional)" | No | Unchecked | Stored as bool |

#### Consent Record (Stored on User Row)

| Field | Value |
|---|---|
| `tos_accepted_at` | UTC timestamp of submission |
| `tos_version` | ToS document version ID at time of acceptance |
| `privacy_accepted_at` | UTC timestamp of submission |
| `privacy_version` | Privacy Policy document version ID |
| `marketing_opt_in` | true / false |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-LEGAL-03-01 | Consent step renders | Any registration flow | All 3 checkboxes unchecked by default; no pre-checking |
| AC-LEGAL-03-02 | User checks 1 and 2; leaves 3 unchecked | Taps "Continue" | Registration proceeds; `marketing_opt_in = false`; consent record stored |
| AC-LEGAL-03-03 | User checks all 3 | Taps "Continue" | Registration proceeds; `marketing_opt_in = true` |
| AC-LEGAL-03-04 | User leaves checkbox 1 (ToS) unchecked | Taps "Continue" | Blocked; error "Please accept the Terms of Service and Privacy Policy to continue." |
| AC-LEGAL-03-05 | User leaves checkbox 2 (Privacy) unchecked | Taps "Continue" | Blocked; same error message |
| AC-LEGAL-03-06 | User taps "Terms of Service" link | Tap | In-app webview opens with current ToS document |
| AC-LEGAL-03-07 | User taps "Privacy Policy" link | Tap | In-app webview opens with current Privacy Policy document |
| AC-LEGAL-03-08 | ToS webview fails to load | Webview error | Error in webview: "Unable to load document. Try again."; "Continue without reading" option shown with explicit warning "By continuing, you confirm you agree to our Terms of Service." |
| AC-LEGAL-03-09 | Consent submitted | Database write | Timestamp, ToS version, Privacy version, `marketing_opt_in` stored atomically |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| User unselects a required checkbox after selecting it | Allowed; "Continue" will block if unchecked at submission |
| ToS or Privacy Policy version changes between user viewing it and submitting | Store the version current at time of submission button tap (not time of webview open) |
| Registration API fails after consent stored locally | Retry entire registration step including consent re-storage; consent is idempotent on (user_id, version) |
| User attempts to register without tapping any checkbox (swipe-to-submit gesture) | No swipe-to-submit exists; only explicit button tap triggers validation |

- **Priority**: P0 (compliance-critical per BR-22)

---

### FR-LEGAL-04: Brokerage Partner Disclaimer (BR-DISC-05)

- **Actor**: System + Authenticated FULL_ACCESS user (Tier 3+, ≥30 trades)
- **Description**: The brokerage partner disclaimer (BR-DISC-05) must appear at the top of every brokerage partner context: Partner Directory screen, individual partner card, brokerage CTA confirmation sheet, and Account-Link Handoff screen. The disclaimer is never shown to LEARN_MODE users or users not meeting eligibility (because the brokerage module is not rendered for them). The disclaimer text substitutes `[Partner]` with the specific partner's legal name and `[License Number]` with the partner's verified license number. These values come from the partner record in the Partner Directory.
- **Input**:
  - Partner's legal name and license number (from partner record)
  - User's active language
- **Output**:
  - Disclaimer rendered at top of every brokerage-related screen
  - Partner-specific values substituted
  - Text in user's active language

#### Brokerage Disclaimer Template (English)

> "[Partner Legal Name] (License: [License Number]) is a licensed brokerage partner. Paave does not execute real-money trades. Paave is not responsible for trades executed through [Partner Legal Name]. Past virtual performance does not predict real trading results."

#### Disclaimer Translations

| Language | Template |
|---|---|
| Vietnamese (vi) | "[Partner Legal Name] (Giấy phép: [License Number]) là đối tác môi giới được cấp phép. Paave không thực hiện giao dịch tiền thật. Paave không chịu trách nhiệm về các giao dịch được thực hiện qua [Partner Legal Name]. Hiệu suất giao dịch ảo trong quá khứ không dự đoán kết quả giao dịch thực tế." |
| Korean (ko) | "[Partner Legal Name] (면허: [License Number])는 인가된 중개 파트너입니다. Paave는 실제 거래를 실행하지 않습니다. Paave는 [Partner Legal Name]을 통해 실행된 거래에 대해 책임을 지지 않습니다. 과거 가상 성과는 실제 거래 결과를 예측하지 않습니다." |
| English (en) | (English template above) |

#### Screens Where BR-DISC-05 Disclaimer is Required

| Screen | Placement |
|---|---|
| Partner Directory | Sticky at top of screen, above partner list |
| Individual Partner Card detail | Top of detail view |
| Brokerage CTA confirmation sheet | First element in sheet, before CTA button |
| Account-Link Handoff (in-app webview) | Pinned to bottom of webview chrome |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-LEGAL-04-01 | User views Partner Directory | Screen opens | BR-DISC-05 disclaimer at top with actual partner legal name and license number (if one partner shown) |
| AC-LEGAL-04-02 | User taps brokerage CTA | Confirmation sheet opens | Disclaimer is first element in sheet; above "Continue to [Partner]" button |
| AC-LEGAL-04-03 | User proceeds to in-app webview handoff | Webview open | Disclaimer pinned to bottom of webview chrome; scrollable content above; disclaimer does not scroll away |
| AC-LEGAL-04-04 | User's language = Korean | Any brokerage screen | Disclaimer in Korean with `[Partner]` and `[License Number]` substituted |
| AC-LEGAL-04-05 | LEARN_MODE user | Any screen | Brokerage module not rendered; disclaimer never shown (not applicable) |

- **Priority**: P1 (V1.x deferred module; disclaimer spec defined for when V1.x ships)

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-21 | AI disclaimer mandatory on every AI output; not collapsible; not hideable | Missing disclaimer on any AI output = P0 compliance violation; hotfix required |
| BR-22 | No pre-checked boxes on consent forms | Pre-checked checkbox = P0 compliance violation; registration flow must be blocked pending fix |
| BR-26 | Investment disclaimer shown on first view of qualifying screen types per session | Market data displayed without disclaimer = P0 compliance violation |
| BR-DISC-05 | Brokerage partner disclaimer (FR-LEGAL-04) required at every brokerage CTA moment; substitutes partner's legal name and license number | Missing disclaimer at CTA = brokerage feature disabled for that partner until fixed |

---

## 4. UI/UX Notes

### Investment Disclaimer Modal (FR-LEGAL-01)

- **Modal type**: Full-screen overlay; not a bottom sheet; not dismissible by tapping outside or pressing back.
- **Background**: Solid color (dark, matches app theme); zero transparency — content must not be visible behind it.
- **Title**: "Important Notice" (in active language)
- **Body**: Disclaimer text (see FR-LEGAL-01 translations)
- **CTA**: Single button "Got it" centered at bottom; minimum touch target 48px height; Neo Lumen primary button style.
- **Accessibility**: Modal is announced as "Alert, Important Notice" by screen reader. "Got it" must be reachable by keyboard navigation.
- **No dismiss gesture**: Back button (Android), swipe-down, and background tap all do nothing — user must tap "Got it."

### AI Disclaimer (FR-LEGAL-02)

- **Typography**: Smaller font than AI content (e.g., 12px vs 14px); gray color (#9E9E9E); italic style optional.
- **Separation**: Thin horizontal rule above the disclaimer; 8px top margin.
- **Not in a "collapsed" state**: Disclaimer is always fully visible without user interaction.
- **Positioning**: Always at the bottom of the AI response block; never floating; never above AI content.

### Data Consent (FR-LEGAL-03)

- **Checkbox design**: Standard checkbox with clear checked/unchecked visual states. Minimum 44×44px touch target.
- **Link styling**: ToS and Privacy Policy links underlined; tapping opens in-app webview with loading indicator.
- **Error state**: Red border on unchecked required checkboxes + red inline error text below them.
- **"Continue without reading"**: Only shown when webview fails; styled as secondary text link (not a button) to minimize accidental taps; requires explicit tap.

### Brokerage Partner Disclaimer (FR-LEGAL-04)

- **Sticky positioning**: On Partner Directory, sticky to top of scroll container. In handoff webview, sticky to bottom of chrome frame.
- **Not dismissible**: No close button, no collapse, no swipe away.
- **Font**: Small (12px) but readable; background color slightly different from main surface for visual distinction.
