## Module G: Language System

> **Purpose:** Full trilingual support. Language selection drives UI text, AI content, financial terminology, and locale formatting.

---

#### FR-LANG-01 — Language Selection

- **Actor:** New User / Registered User
- **Description:** On first launch, app detects device OS language. Defaults: device `vi` → Vietnamese; device `ko` → Korean; all others → English. User can change in Settings → Language. Language change applies immediately across the entire app without restart.
- **Key Rules:**
  - Language setting persisted to user profile (not device-only).
  - Three supported languages: Vietnamese (`vi`), Korean (`ko`), English (`en`).
  - Change applies to: all UI text, all AI responses (via FR-AI-03), financial terminology (FR-LANG-02), disclaimer text (FR-LEGAL-01, FR-LEGAL-02).
  - Language change does not require logout/login.
- **Acceptance Criteria:**
  - Given device OS language is Korean → app defaults to Korean on first launch.
  - Given user changes to Vietnamese in Settings → all UI text and AI content switch to Vietnamese immediately.
- **Edge Cases:** Unsupported device language → defaults to English.
- **Priority:** P0

---

#### FR-LANG-02 — Financial Terminology Localization

- **Actor:** Registered User
- **Description:** All financial terms displayed in locale-appropriate form. Not generic translation — uses market-standard terminology per market.
  - Vietnamese: "Chỉ số P/E", "Khớp lệnh", "Dư room", "Vốn hóa thị trường"
  - Korean: "주가수익비율", "시가총액", "코스피", "유동성"
  - English: standard NYSE/NASDAQ terminology ("P/E Ratio", "Market Cap", "Liquidity")
- **Key Rules:**
  - Terminology mapping table maintained server-side; updatable without app release.
  - Applies to: Key Stats section, AI responses (FR-AI-01–FR-AI-05), Portfolio dashboard, Discover feed, Markets module.
  - "Tiền ảo / 가상 자금 / Virtual Funds" label (FR-PT-06) shows trilingual text simultaneously (not language-switched) as a deliberate legal clarity choice.
- **Acceptance Criteria:**
  - Given VN language active → Key Stats shows "Chỉ số P/E" not "P/E Ratio."
  - Given KR language active → Market Cap shows "시가총액."
  - Given AI response triggered in VN mode → AI uses "Khớp lệnh" when referring to order matching.
- **Edge Cases:** Term not found in locale mapping → fallback to English term.
- **Priority:** P0

---

