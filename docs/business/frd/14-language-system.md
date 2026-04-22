# FRD-14: Language System

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

## Module Description

The Language System controls the language of all UI text, AI responses, financial terminology, and legal disclaimer text across the Paave app. Three languages are supported: Vietnamese (vi), Korean (ko), and English (en). Language selection is persisted to the user profile, not the device. The trilingual label "Tiền ảo / 가상 자금 / Virtual Funds" is a special case — it always shows all three languages simultaneously regardless of the active language setting. This document is self-contained; a developer reading only this file has everything needed to implement the language system.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Language System |
| Primary Actor | Authenticated user (all tiers); System (auto-detect at first launch) |
| Goal | Display all app content in the user's preferred language |
| Trigger | First app launch (auto-detect); user selection in Settings → Language |
| Supported Languages | Vietnamese (vi), Korean (ko), English (en) |

---

## 2. Functional Requirements

---

### FR-LANG-01: Language Selection

- **Actor**: System (auto-detect on first launch) + User (manual selection)
- **Description**: On first launch, the app detects the device OS language. If the device OS language is `vi` (any Vietnamese locale, e.g., `vi-VN`): set default language to Vietnamese. If `ko` (any Korean locale, e.g., `ko-KR`): set default to Korean. All other device languages: set default to English. The user can change the language at any time in Settings → Language. Language change applies immediately across the entire app without requiring a restart. Language selection is persisted to the user's profile on the server (not device-only) so it roams across devices. Three languages are supported: `vi`, `ko`, `en`. Language affects: all UI text, AI response language (FR-AI-03), financial terminology (FR-LANG-02), and legal disclaimer text. If the device OS language cannot be read: default to English.

- **Input**:
  - Device OS language (from device locale API): string (e.g., `vi-VN`, `ko`, `en-US`, `fr-FR`)
  - User's stored `language_preference` on profile (may be set from a previous session or device)
  - User's manual language selection in Settings
- **Output**:
  - Active language: `vi` | `ko` | `en`
  - All UI text rendered in active language
  - Language preference persisted to user profile on server
  - Change applied immediately (no restart)
- **Precondition**: App launches or user navigates to Settings → Language.
- **Postcondition**: Active language set and all screens updated immediately.

#### Language Resolution Priority

Priority order (highest to lowest):
1. User's stored `language_preference` on server profile (if exists)
2. Device OS locale mapped to supported language
3. English (fallback)

On first launch, if no profile preference exists yet (unauthenticated state or new user): use device locale. After login, profile preference overwrites device locale.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-LANG-01-01 | Device OS language = `vi-VN`; user has no stored preference | First launch | App defaults to Vietnamese |
| AC-LANG-01-02 | Device OS language = `ko-KR`; user has no stored preference | First launch | App defaults to Korean |
| AC-LANG-01-03 | Device OS language = `fr-FR`; user has no stored preference | First launch | App defaults to English |
| AC-LANG-01-04 | Device OS language unreadable | First launch | App defaults to English |
| AC-LANG-01-05 | User's profile has `language_preference = ko`; device is `vi-VN` | Login | App uses Korean (profile preference wins) |
| AC-LANG-01-06 | User changes language to Korean in Settings | Any time | App immediately switches to Korean across all screens; preference saved to profile |
| AC-LANG-01-07 | User changes language from Korean to Vietnamese | Settings | Immediate switch; profile updated; AI responses will be in Vietnamese (FR-AI-03) |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Profile language preference save fails (API error) | Language change still applied locally; retry silently on next network availability |
| User is offline when changing language | Change applied locally immediately; sync to profile when next online |
| App is in the middle of an AI response when language changes | In-progress response completes in old language; next response in new language |
| Profile preference exists but is an unsupported language code | Fallback to English; log as data anomaly |

- **Priority**: P0

---

### FR-LANG-02: Financial Terminology Localization

- **Actor**: System (rendering layer)
- **Description**: Financial terms are displayed using locale-appropriate Vietnamese, Korean, or English terminology — NOT generic word-for-word translation. The terminology mapping table is maintained server-side and can be updated without an app release. The mapping is downloaded on app launch and cached. Terminology applies to: Key Stats (FR-25), AI responses, Portfolio Dashboard, Discover feed, Markets module, and any other financial data display. If a term is not found in the active locale's mapping: fall back to the English term. The special trilingual label "Tiền ảo / 가상 자금 / Virtual Funds" is NOT subject to locale switching — it always displays all three languages simultaneously (see FR-LANG-02.1).

- **Input**:
  - Financial term identifier (e.g., `pe_ratio`, `market_cap`, `market_order`, `limit_order`)
  - Active language: `vi` | `ko` | `en`
  - Server-side terminology mapping (JSON, cached on device)
- **Output**:
  - Term displayed in locale-appropriate financial language
  - Fallback to English if term not in locale mapping
- **Precondition**: Terminology mapping downloaded and cached. Active language set.
- **Postcondition**: All financial terms in UI use locale-appropriate labels.

#### Terminology Mapping Table (Authoritative)

| Term ID | English (en) | Vietnamese (vi) | Korean (ko) |
|---|---|---|---|
| `pe_ratio` | P/E Ratio | Chỉ số P/E | 주가수익비율 |
| `market_cap` | Market Cap | Vốn hóa thị trường | 시가총액 |
| `volume` | Volume | Khối lượng | 거래량 |
| `open_price` | Open | Giá mở cửa | 시가 |
| `prev_close` | Prev Close | Giá đóng cửa trước | 전일 종가 |
| `day_high` | Day High | Cao nhất ngày | 당일 고가 |
| `day_low` | Day Low | Thấp nhất ngày | 당일 저가 |
| `week52_high` | 52W High | Cao nhất 52 tuần | 52주 최고 |
| `week52_low` | 52W Low | Thấp nhất 52 tuần | 52주 최저 |
| `order_matching` | Order Matching | Khớp lệnh | 주문 체결 |
| `foreign_room` | Foreign Ownership Room | Dư room nước ngoài | 외국인 보유 한도 |
| `market_order` | Market Order | Lệnh thị trường | 시장가주문 |
| `limit_order` | Limit Order | Lệnh giới hạn | 지정가주문 |
| `liquidity` | Liquidity | Thanh khoản | 유동성 |
| `kospi` | KOSPI | KOSPI | 코스피 |
| `kosdaq` | KOSDAQ | KOSDAQ | 코스닥 |
| `unrealized_pnl` | Unrealized P&L | Lãi/Lỗ chưa thực hiện | 미실현 손익 |
| `realized_pnl` | Realized P&L | Lãi/Lỗ đã thực hiện | 실현 손익 |
| `dividend_yield` | Dividend Yield | Tỷ suất cổ tức | 배당수익률 |
| `earnings_per_share` | EPS | Thu nhập trên cổ phiếu | 주당순이익 |

*This table is defined in server-side configuration at `/config/financial-terms.json`. App caches on launch. Server update takes effect on next app launch or cache refresh (max 24h).*

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-LANG-02-01 | Active language = `vi`; Key Stats renders | P/E Ratio cell | Label shows "Chỉ số P/E" |
| AC-LANG-02-02 | Active language = `ko`; Key Stats renders | Market Cap cell | Label shows "시가총액" |
| AC-LANG-02-03 | Active language = `en`; Key Stats renders | Open cell | Label shows "Open" |
| AC-LANG-02-04 | Term `foreign_room` in active language = `ko` | Mapping checked | Fallback to "Foreign Ownership Room" (EN) since KR mapping uses different term structure |
| AC-LANG-02-05 | Server updates mapping to add a new term | Next app launch | New term reflected without app update |
| AC-LANG-02-06 | Term not found in active locale mapping | Rendering | English term shown |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Terminology mapping server call fails | Use last cached mapping; if no cache → use hardcoded English fallback table |
| New term added to server config not in app's hardcoded fallback | Show term ID as label (e.g., "new_term_id") as last resort; log as missing mapping |
| Active language changes while Key Stats is visible | Labels re-render in new language on next screen refresh (immediate if binding is reactive) |

- **Priority**: P0

---

### FR-LANG-02.1: Trilingual Virtual Funds Label (Special Case)

- **Actor**: System (rendering layer)
- **Description**: The label "Tiền ảo / 가상 자금 / Virtual Funds" is a legal compliance label that must always display ALL THREE LANGUAGES simultaneously on every paper trading screen — regardless of the user's active language setting. This is a deliberate legal clarity choice: users of any language must see the full trilingual label. This label is NOT locale-switched. It is NOT three separate labels shown/hidden by language. It is ONE text element containing the full string "Tiền ảo / 가상 자금 / Virtual Funds" at all times.

- **Input**: None — this label is hardcoded in the component.
- **Output**: The string "Tiền ảo / 가상 자금 / Virtual Funds" rendered on all paper trading screens.
- **Precondition**: Any paper trading screen is rendered.
- **Postcondition**: Label always visible in full trilingual form.

#### Screens Where Trilingual Label is Mandatory (BR-18)

| Screen | Location on Screen |
|---|---|
| Home Screen — Portfolio Hero Widget | Below the portfolio value amount |
| Paper Trading Dashboard | Below total portfolio value |
| Paper Order Placement screen | Below estimated order value |
| Paper Trade Confirmation | Below order summary |
| Paper Trade History | Section header or sub-label |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-LANG-02.1-01 | User's active language = `vi` | Paper trading screen renders | Label shows full "Tiền ảo / 가상 자금 / Virtual Funds" |
| AC-LANG-02.1-02 | User's active language = `ko` | Paper trading screen renders | Label still shows full "Tiền ảo / 가상 자금 / Virtual Funds" (not just 가상 자금) |
| AC-LANG-02.1-03 | User's active language = `en` | Paper trading screen renders | Label still shows full "Tiền ảo / 가상 자금 / Virtual Funds" (not just Virtual Funds) |
| AC-LANG-02.1-04 | Portfolio hero widget renders | Any user tier (FULL_ACCESS only) | Label visible beneath portfolio value at all times |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Font does not support Korean characters | System font fallback used; label must still render all three segments |
| Label is cut off on small screens (<320px width) | Font size reduced; label wraps to 2 lines; must not be hidden |
| Developer accidentally makes label language-conditional | P0 bug; label must never be conditionally shown/hidden by language |

- **Priority**: P0 (compliance-critical)

---

### FR-LANG-03: Language Setting in Settings Screen

- **Actor**: Authenticated user
- **Description**: Settings → Language shows a list of the three supported languages with radio button selection. Currently active language has a checkmark. Selecting a new language: applies immediately to the entire app (no restart prompt); persists to server profile. The screen itself re-renders in the newly selected language immediately after selection.
- **Input**:
  - User radio selection: Vietnamese | Korean | English
- **Output**:
  - Active language changed immediately across entire app
  - Screen re-renders in selected language
  - Profile updated on server
- **Precondition**: User is authenticated. Language settings screen is open.
- **Postcondition**: Language updated everywhere.

#### Language Option Display

| Language | Display Label in Its Own Language | Language Code |
|---|---|---|
| Vietnamese | Tiếng Việt | vi |
| Korean | 한국어 | ko |
| English | English | en |

*Language names always show in their own language (not translated), so users who don't read the current language can still find their own language.*

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-LANG-03-01 | Active language = English | Language screen opens | "English" has checkmark; "Tiếng Việt" and "한국어" listed without checkmark |
| AC-LANG-03-02 | User selects "Tiếng Việt" | Tap action | Entire app immediately switches to Vietnamese; Language screen itself re-renders in Vietnamese |
| AC-LANG-03-03 | User selects current active language | Tap action | No change; no API call |

- **Priority**: P1

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-01 | VN is the primary market; language default for VN device locale (vi) is Vietnamese | Non-VN default for vi locale = bug |
| BR-18 | "Tiền ảo / 가상 자금 / Virtual Funds" must appear as full trilingual string on all paper trading screens | Missing or partial label = P0 compliance violation |
| BR-46 | Reference market data (KR/Global) carries "Reference" chip regardless of language | Chip text "Reference" rendered in user's active language: Vietnamese = "Tham khảo"; Korean = "참조"; English = "Reference" |

#### "Reference" Chip Translations

| Language | Text on Reference Chip |
|---|---|
| English | Reference |
| Vietnamese | Tham khảo |
| Korean | 참조 |

---

## 4. UI/UX Notes

- **Immediate language switch**: Use a reactive localization library (e.g., i18next for React Native) that allows runtime language switching. All text keys must be bound to the i18n system — no hardcoded strings except the trilingual label.
- **Trilingual label implementation**: Implement as a dedicated `VirtualFundsLabel` component that renders the hardcoded string with no i18n binding. This component is used exclusively on paper trading screens.
- **Font requirements**: The app must embed or rely on system fonts that support all three scripts: Latin (Vietnamese with diacritics), Hangul (Korean), and ASCII. On Android: Noto Sans family. On iOS: San Francisco + system Hangul font.
- **Right-to-left (RTL)**: None of the three supported languages are RTL. No RTL layout implementation required.
- **String externalization**: All UI strings must be in locale files (`vi.json`, `ko.json`, `en.json`). No hardcoded UI strings in components except the `VirtualFundsLabel`.
- **AI response language**: FR-AI-03 specifies that AI-generated text (market summaries, insights, nudges) is produced in the user's active language. AI prompt must include the language directive. This is the AI module's responsibility; the Language System provides the active language code.
- **Legal disclaimer localization**: Disclaimer text (FR-LEGAL-01, FR-LEGAL-02) must be available in all three languages. Missing translation → English fallback. Disclaimer must not be suppressed due to missing translation.
