## 3. Business Rules

| Rule ID | Description |
|---------|-------------|
| BR-01 | All users default to Vietnam (VN) as their market preference. Market preference is not user-configurable in V1/V2. |
| BR-02 | A user can add a maximum of 100 stocks to their watchlist. Attempting to add a 101st stock shows an error: "Watchlist full. Remove a stock to add another." |
| BR-03 | A user can set a maximum of 1 price alert per stock. Setting a new alert for a stock with an existing alert overwrites the previous alert. |
| BR-04 | Price alert notifications are one-time triggers. Once triggered and notification sent, the alert is automatically deactivated. |
| BR-05 | A stock must have editorial content (a "why it's hot" hook and theme badge) to appear in the Discover feed. Stocks without editorial content are excluded from the Discover feed. |
| BR-06 | The "X users watching" social proof counter reflects the real-time count of users who have that stock in their watchlist. Updated server-side every 5 minutes. |
| BR-07 | Analyst sentiment consensus labels: Buy% ≥ 70% → "Strong Buy"; Buy% 50–69% → "Buy"; Buy% 40–49% AND Sell% ≤ 30% → "Neutral"; Sell% 50–69% → "Sell"; Sell% ≥ 70% → "Strong Sell." |
| BR-08 | Paper portfolio P&L calculations use virtual prices from the real-time feed. The app does not connect to brokerage accounts. |
| BR-09 | Market data for VN (HoSE/HNX) sourced from real-time exchange data feed. KR and Global data from web search / model knowledge; carries disclaimer for potential delay up to 24 hours. |
| BR-10 | The app does not execute real buy or sell orders. All trades are simulated with virtual funds. |
| BR-11 | Watchlist movement notifications capped at 3 per user per day. Top 3 selected by highest absolute daily change percentage. |
| BR-12 | Login locked for 15 minutes after 5 consecutive failed attempts. Timer resets after successful login. |
| BR-13 | Email OTP valid for 10 minutes, single-use. New OTP request immediately invalidates existing OTP. |
| BR-14 | All monetary values displayed in VND. Virtual portfolio balance denominated in VND. |
| BR-15 | Discover feed must display minimum 10 cards before scroll. Fewer than 10 available → show all without infinite scroll. |
| BR-16 | Feature tier (LEARN_MODE / FULL_ACCESS) evaluated server-side on every session init. Client cannot self-upgrade feature tier. |
| BR-17 | Paper portfolio starting balance: VND 500,000,000. Reset restores to exactly this amount. |
| BR-18 | "Tiền ảo / 가상 자금 / Virtual Funds" label is mandatory on all paper trading screens. Cannot be dismissed or hidden. |
| BR-19 | AI responses must never contain buy/sell recommendations, price targets, or suggested position sizes. Language patterns matching "buy X", "sell X", "you should invest in X" are filtered server-side. |
| BR-20 | Max 1 AI behavioral nudge per user per calendar day (user's local timezone). |
| BR-21 | All AI content must append the educational disclaimer defined in FR-LEGAL-02 in the user's active language. |
| BR-22 | Data consent (FR-LEGAL-03) checkboxes must not be pre-checked. Consent timestamp and ToS version stored on user record. |
| BR-23 | Social-trading posts require minimum 1 $TICKER cashtag and 1 sentiment selection before publish. 60-second cancel window enforced. |
| BR-24 | Real name never shown on public social profile unless user explicitly opts in via Settings. Default is pseudonym only. |
| BR-25 | Trader Tier can only increase, never decrease, regardless of score changes. |
| BR-26 | Investment disclaimer (FR-LEGAL-01) shown on first view of each screen type per session. Cannot be permanently dismissed. |
| BR-27 | Behavioral nudge flags (FR-AI-05) are logged to the user's Risk Discipline score component for the weekly Trader Score. |
| BR-28 | Age verified at registration via DOB. Minimum age to register: 16 (or 13 with parental consent, deferred to V3). Under 13: registration blocked entirely. |
| BR-29 | **AI never stands alone.** No top-level AI-only tab, no standalone chat launcher outside a ticker or portfolio context. (Mirrors BRD BR-AI-07.) |
| BR-30 | **Paave never executes a real-money securities order.** All real-money execution is performed by the licensed brokerage partner in Module I under the partner's own license. (Mirrors BRD BR-BRK-01.) |
| BR-31 | **Brokerage CTA eligibility gate:** partner CTAs render only for users 18+, Trader Tier 3+, with ≥ 30 paper trades. Ineligible users never receive the CTA in any surface, including markup. (Mirrors BRD BR-BRK-02.) |
| BR-32 | **Brokerage handoff payload is whitelisted:** `{ paave_user_id, market, optional ticker_context }`. Any additional field (DOB, email, paper balance, order details) is stripped before send and logged as a P0 compliance violation. (Mirrors BRD BR-BRK-03.) |
| BR-33 | **Brokerage disclaimer (BR-DISC-05 / FR-LEGAL):** every partner surface renders the partner-handoff disclaimer in the user's language with partner legal name and license number substituted in. Non-dismissible at the CTA moment. |
| BR-34 | **Anonymous attribution only:** the paper-to-real attribution pipeline stores ticker + timestamp bucket only; never real-money amounts, never partner-side user IDs. (Mirrors BRD BR-BRK-07.) |
| BR-35 | **Multi-method signup mandatory (v2.2):** V1 ships with four signup methods at launch — email/password, Google, Apple, Zalo. Removing any method in V1 is a P0 release blocker. Zalo may ship dark if provider approval is delayed (RISK-17). (Mirrors BRD BR-SIGNUP-01.) |
| BR-36 | **Apple parity on iOS (v2.2):** on iOS, "Sign in with Apple" must be rendered with equal prominence whenever Google or Zalo is rendered (App Store Guideline 4.8). Any iOS build without Apple parity is a launch blocker. (Mirrors BRD BR-SIGNUP-02.) |
| BR-37 | **Post-handshake DOB is non-skippable (v2.2):** social-OAuth accounts are pinned in `PENDING_DOB` state until FR-05.4 is completed. Force-quit-and-reopen returns to FR-05.4. No app surface outside the DOB screen is reachable in `PENDING_DOB`. (Mirrors BRD BR-SIGNUP-03 + BR-AGE-01.) |
| BR-38 | **No duplicate account on conflict (v2.2):** if a social-OAuth email matches an existing Paave account, Paave does NOT create a second row; FR-05.5 account-linking runs instead. Apple private-relay linking keys on Apple Sub ID. (Mirrors BRD BR-SIGNUP-04 + BR-SIGNUP-05.) |
| BR-39 | **OAuth provider failure isolation (v2.2):** if a single provider is unreachable, only that provider's button is disabled; other methods remain usable. No silent retry loops; status checked every 60s server-side. (Mirrors BRD BR-SIGNUP-06.) |
| BR-40 | **OAuth tokens never logged, never displayed (v2.2):** OAuth access and refresh tokens are encrypted at rest and never emitted to application logs, analytics, crash reports, or user-facing surfaces. (Mirrors BRD BR-SIGNUP-07 + BR-PRIV-01.) |
| BR-41 | **Social-only accounts have no password (v2.2):** FR-07 login rejects password attempts on social-only accounts with a "Sign in with [provider]" redirect — never a password prompt, never a reset link. FR-50 Change Password is hidden for such accounts. (Mirrors BRD BR-SIGNUP-08.) |
| BR-42 | **Minimal OAuth scope (v2.2):** only email/profile (Google), name/email (Apple), id/name/avatar (Zalo) are requested. No phone, friends list, address, gender, or birthday scope is requested on any provider. Scope review is quarterly. (Mirrors BRD BR-SIGNUP-09.) |
| BR-43 | **Industrial preferences: enum, multi-select, max 10 (v2.2):** `industrial_prefs` is an array of approved sector enum values (Banking, Real Estate, Tech, Consumer, Energy, Healthcare, Industrials, Materials, Utilities, Retail). No freeform. Min 0 (explicit "Skip" only), max 10. Localized labels via i18n; DB stores canonical English slug. (Mirrors BRD BR-ONBOARD-01 + BR-ONBOARD-03.) |
| BR-44 | **Investment goal: enum, single-choice, required (v2.2):** `investment_goal` is a non-null enum from `{learn_explore, grow_savings, beat_inflation, high_returns, long_term_wealth, just_for_fun}`. Onboarding cannot complete without it. `onboarded_at` is only set when all required fields (DOB, language, industrial_prefs array, investment_goal, consent) are persisted. (Mirrors BRD BR-ONBOARD-02 + BR-ONBOARD-07.) |
| BR-45 | **Discover ranking honors preferences (v2.2):** Discover ranker boosts cards matching the user's `industrial_prefs` by a configurable weight. Empty-preference (Skip) path falls back to VN trending (primary), KR/Global as "Reference"-chipped cards further down. (Mirrors BRD BR-ONBOARD-04 + BR-ONBOARD-08.) |
| BR-46 | **KR + Global are reference-only data in V1 (v2.2):** every KR or Global card/detail page renders a persistent "Reference" chip. Paper trades on KR/Global tickers use best-available price with "Estimated price" label. No SLA. VN is the sole SLA-backed market (BO-06). (Mirrors BRD §5.1.8.) |

---

