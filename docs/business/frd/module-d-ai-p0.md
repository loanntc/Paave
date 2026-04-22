## Module D: AI Insights P0

> **Purpose:** Supporting layer on top of paper trading — never a standalone product surface. AI attaches to a trade, a ticker, or a portfolio. Insights are contextual, never advisory, and never include price targets or position-size suggestions. See BR-AI-01, BR-AI-07.

---

#### FR-AI-01 — Post-Trade Explanation

- **Actor:** Registered User (after paper trade fills)
- **Description:** After every paper trade fills, a non-blocking AI card auto-appears in the portfolio screen or as a bottom sheet. Dismissible at any time. Three sections:
  1. **What happened** — plain language description of recent price action for this stock.
  2. **Why** — top 1–2 causal factors (e.g., "sector rotation," "earnings surprise").
  3. **What to watch** — one forward-looking signal (e.g., "next earnings date," "sector catalyst").
- **Key Rules:**
  - Card is non-blocking: user can dismiss at any time without completing read.
  - Language matches user's active language setting (FR-LANG-01).
  - Disclaimer appended to every card (FR-LEGAL-02).
  - Thumbs up / thumbs down rating buttons. Rating stored for model quality tracking.
  - AI response must not contain buy/sell recommendation language.
  - Card shown once per trade fill; not re-shown on revisit.
- **Acceptance Criteria:**
  - Given paper trade fills → AI card appears within 5 seconds with 3 sections in user's language.
  - Given user taps thumbs down → rating recorded; card remains visible until dismissed.
  - Given Vietnamese language selected → all three sections in Vietnamese.
- **Edge Cases:** AI service unavailable → card shows "Analysis temporarily unavailable. Check back later." Disclaimer still shown.
- **Priority:** P0

---

#### FR-AI-02 — Natural Language Stock Query

- **Actor:** Registered User
- **Description:** Chat interface (bottom sheet or dedicated screen) where user types questions in VN/KR/EN. AI responds in the same language. Restricted to VN (HOSE/HNX) and KR (KOSPI/KOSDAQ) stocks at launch. Every response includes: source attribution, disclaimer (FR-LEGAL-02). AI never recommends buy/sell.
- **Key Rules:**
  - AI detects input language automatically (not dependent on app language setting).
  - Scope restricted: queries about stocks outside VN/KR → "I can only answer questions about Vietnam (HOSE/HNX) and Korea (KOSPI/KOSDAQ) stocks right now."
  - Source attribution: cite data sources used (e.g., "Based on HOSE data as of [date]").
  - Buy/sell language filtered: if response would contain recommendation, it is replaced with educational framing.
  - Conversation history: last 10 turns retained in session; cleared on bottom sheet close.
  - Financial terminology locale-specific per FR-LANG-02 / FR-AI-03.
- **Acceptance Criteria:**
  - Given Vietnamese query "VIC có đang tốt không?" → response in Vietnamese about VIC's recent performance; no buy/sell recommendation; disclaimer appended.
  - Given query about Apple (NASDAQ) → scope restriction message shown.
- **Edge Cases:** AI timeout (>10s) → "Taking longer than usual. Please try again." Query retained in input field.
- **Priority:** P0

---

#### FR-AI-03 — Multilingual AI Routing

- **Actor:** System (AI routing layer)
- **Description:** System detects user's active language setting (FR-LANG-01) and routes all AI requests (FR-AI-01, FR-AI-02, FR-AI-04, FR-AI-05) to the language-appropriate prompt configuration. AI responses use locale-specific financial terminology (not generic translation). If language changes mid-session, next AI request uses the new language config.
- **Key Rules:**
  - Language routing is server-side; client sends `Accept-Language` header with active language code.
  - Prompt configs maintained per language: `vi`, `ko`, `en` (default fallback: `en`).
  - Financial terminology must be locale-specific (FR-LANG-02), not generic machine translation.
  - Routing failure → fallback to English with a note: "Response in English (your language config is loading)."
- **Acceptance Criteria:**
  - Given KR language active → all AI cards and query responses return Korean text with Korean financial terms.
  - Given language switched from VN to KR mid-session → next AI request returns Korean response.
- **Edge Cases:** Unsupported language code → default to English.
- **Priority:** P0

---

