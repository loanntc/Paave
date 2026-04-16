# Missing APIs — Build Checklist

**Last Updated:** 2026-04-16
**Source:** API Audit Report (API-AUDIT.md)
**API Spec Version:** 1.5.1 (455 endpoints)
**FRD/SRD Version:** 2.2

---

## P0 — Launch Blockers (must build before V1 launch)

- [ ] **Discover Feed** — `GET /api/v1/discover?market=&theme=&page=&page_size=`
  - FRD: FR-15, FR-17, FR-18, FR-19 | SRD: Section 2.7
  - Paginated curated stock cards with editorial content, social proof, price data
  
- [ ] **Editorial CMS** — `GET /api/v1/editorial/stocks` + `POST /api/v1/admin/editorial/stocks`
  - FRD: FR-16, FR-22 | SRD: Section 2.7
  - Hook text, theme badges, CMS management

- [ ] **Price Alerts CRUD** — `POST /api/v1/alerts`, `GET /api/v1/alerts`, `DELETE /api/v1/alerts/{id}`
  - FRD: FR-28, FR-43 | SRD: Section 2.6
  - Create, read, delete alerts; server-side evaluation on price tick

- [ ] **AI Post-Trade Analysis** — `GET /api/v1/ai/post-trade/{orderId}`
  - FRD: FR-AI-01 | SRD: Section 2.15
  - 3-section card: What happened / Why / What to watch

- [ ] **AI Natural Language Query** — `POST /api/v1/ai/query`
  - FRD: FR-AI-02 | SRD: Section 2.26
  - Chat interface, RAG-powered, VN/KR stocks only, disclaimer appended

- [ ] **Financial Glossary (Tooltips)** — `GET /api/v1/glossary?lang=&term=`
  - FRD: FR-EDU-01 | SRD: N/A (needs new flow)
  - Server-side financial term definitions, trilingual, cacheable

- [ ] **Consent Logging** — `POST /api/v1/compliance/consent`
  - FRD: FR-LEGAL-03 | SRD: Section 2.22
  - Immutable consent log: ToS version, timestamp, marketing opt-in

- [ ] **DOB in Registration** — Update `POST /api/v1/users` schema
  - FRD: FR-AGE-01 | SRD: Section 2.1
  - Add `date_of_birth` and `nationality` fields to registration payload

- [ ] **Push Token Registration** — `POST /api/v1/notifications/push-token`
  - FRD: FR-42 | SRD: Section 2.6
  - Paave-native push token endpoint (not NHSV-scoped)

- [ ] **Portfolio Reset** — `POST /api/v1/paper-trading/reset`
  - FRD: FR-PT-05 | SRD: Section 2.12
  - Reset virtual balance to 500M VND, clear holdings, retain history

## P1 — Post-Launch (build for V1.1–V1.x)

- [ ] **AI Pre-Trade Card** — `GET /api/v1/ai/pre-trade?ticker=`
  - FRD: FR-AI-04 | SRD: Section 2.16 | Must respond in <2s

- [ ] **AI Portfolio Health** — `GET /api/v1/ai/portfolio-health/latest`
  - FRD: FR-AI-05 | SRD: Section 2.18 | Weekly report, 5 dimensions

- [ ] **AI Behavioral Coaching** — `POST /api/v1/ai/coaching/feedback`
  - FRD: FR-AI-07 | SRD: Section 2.17 | Nudge delivery + rating

- [ ] **AI Learning Paths** — `GET /api/v1/ai/lessons/{lessonId}`, `POST /api/v1/ai/lessons/{lessonId}/complete`
  - FRD: FR-AI-06 | SRD: N/A | Micro-lessons, spaced repetition

- [ ] **XP System** — `GET /api/v1/gamification/xp`, `POST /api/v1/gamification/xp/events`
  - FRD: FR-GAME-01 | SRD: Section 2.13

- [ ] **Trader Score** — `GET /api/v1/gamification/score`, `GET /api/v1/gamification/score/history`
  - FRD: FR-GAME-03 | SRD: Section 2.13

- [ ] **Trader Tiers** — `GET /api/v1/gamification/profile`
  - FRD: FR-GAME-02 | SRD: Section 5.11

- [ ] **Learning Streaks** — `GET /api/v1/gamification/streaks`, `POST /api/v1/gamification/streaks/freeze`
  - FRD: FR-GAME-05 | SRD: N/A

- [ ] **Milestone Celebrations** — `GET /api/v1/gamification/milestones`, `POST /api/v1/gamification/milestones/{id}/share`
  - FRD: FR-GAME-06 | SRD: Section 2.25

- [ ] **Portfolio Goal Setting** — `POST /api/v1/gamification/goals`, `GET /api/v1/gamification/goals`
  - FRD: FR-GAME-07 | SRD: N/A

- [ ] **Social Proof Aggregation** — `GET /api/v1/social/proof/{symbol}`
  - FRD: FR-SOC-01 | SRD: Section 2.8
  - Watcher count + sentiment ratio + trending badge in one call

- [ ] **Public Profile** — `GET /api/v1/social/users/{id}/profile`
  - FRD: FR-SOC-05 | SRD: N/A
  - Pseudonym, tier, score, post count, follower/following, joined date

- [ ] **Age Upgrade** — `POST /api/v1/users/me/upgrade-tier`
  - FRD: FR-AGE-04 | SRD: Section 2.3

- [ ] **KR Market Data** — dedicated KR data pipeline endpoints
  - FRD: FR-38 | V1 uses web search; real-time feed deferred to V2

- [ ] **Global Market Indices** — `GET /api/v1/market/global/indices`
  - FRD: FR-39 | S&P 500, Nasdaq, Dow, FTSE, Nikkei, DAX

- [ ] **Notification Preferences** — extend existing with new types
  - FRD: FR-44, FR-45, FR-46 | Market open/close, watchlist movement toggles

---

## Already Covered by Existing API (no build needed)

These FRD features map to existing endpoints — just need integration:

- Watchlist CRUD → `insights/watchlists/*`
- Paper trading orders → `virtual/equity/orders/*`
- Market data (VN) → `market/*`
- Social posts/feed → `social/*`
- Follow system → `social/users/{id}/follows`
- Notification inbox → `insights/notifications/*`
- User profile → `users/me`
- Password change → `users/me/password`
- Biometric auth → `auth/biometric/*`
- FAQ/Support → `app/faq/*`
- Search → `market/symbol`, `insights/search-*`

---

*Track progress by checking boxes. Update this file as APIs are built.*
