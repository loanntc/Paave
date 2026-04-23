## 4. Traceability Matrix

This matrix links each functional requirement to the BRD v2.2 business objectives it supports.

| BRD Objective | Description | Linked FRs |
|---------------|-------------|------------|
| BO-01 | Acquire 50K Vietnamese Gen Z MAU through a low-barrier, mobile-first onboarding | FR-01, FR-02, FR-03, FR-04.1, FR-05, FR-05.1, FR-05.2, FR-05.3, FR-05.4, FR-05.5, FR-06, FR-07, FR-08, FR-08.1, FR-08.2, FR-AGE-01, FR-AGE-03, FR-LEGAL-03, FR-LANG-01 |
| BO-02..05 | D7 retention, watchlist adoption, discover engagement, VN-primary concentration (≥ 90% VN MAU, 0 KR campaigns) | FR-09..FR-47, FR-36..FR-41 (VN primary / KR+Global reference only), FR-AGE-*, FR-LANG-* |
| BO-06 | VN data latency ≤ 15s (VN is only SLA-backed market in V1) | FR-37 (VN real-time), FR-38/39 (KR/Global reference-only, no SLA), BR-46 |
| BO-07 | Onboarding completion ≥ 75% (including new industrial-pref + goal steps) | FR-04.1, FR-05..FR-05.5, FR-08, FR-08.1, FR-08.2, BR-43, BR-44 |
| **BO-08** (primary) | **Establish paper trading as the primary loop** (≥ 70% activation, ≥ 3 trades/user/week) | **Module B (FR-PT-01..06)**, FR-35, FR-AI-01 (post-trade insight reward), FR-GAME-01, FR-23..29 Stock Detail |
| **BO-09** | **Social-trading engagement ≥ 35% + follow adoption ≥ 20%** | **Module F (FR-SOC-01..05)**, FR-16, FR-23..29 Stock Detail |
| BO-10 | Gamification Tier 2 ≥ 40% | Module C (FR-GAME-01..05), FR-08.2 (goal seeds challenge difficulty via BR-ONBOARD-05) |
| BO-11 | AI insight card read-through ≥ 55% (supporting, not headline) | Module D (FR-AI-01..03), Module E (FR-AI-04..05), BR-29 |
| BO-12 | Age 16–17 segment with zero violations | FR-AGE-01..04, FR-05.4 (post-OAuth DOB), FR-LEGAL-01..03, FR-PT-06, BR-28, BR-31, BR-37 |
| **BO-13** (V1.x) | **Brokerage bridge initiation ≥ 20% of eligible users** | **Module I (FR-BRK-01..06)**, BR-30..34, FR-LEGAL (BR-DISC-05) |
| **BO-14** (v2.2) | **Multi-method signup (≥ 60% social, Zalo ≥ 25% VN)** | **FR-04.1, FR-05, FR-05.1, FR-05.2, FR-05.3, FR-05.4, FR-05.5**, FR-07, FR-48, FR-49.1, BR-35..42 |
| **BO-15** (v2.2) | **Onboarding personalization capture ≥ 90%** | **FR-08.1 (industrial preferences), FR-08.2 (investment goal)**, FR-49, BR-43, BR-44 |
| **BO-16** (v2.2) | **Preference-driven retention lift ≥ 8pp** | FR-08.1, FR-08.2, FR-15..17 (Discover using preferences), FR-GAME-04 (weekly challenge seeded by goal), BR-45 |

---

*Document end. Proceed to SRD for system logic and API contracts. Module I (Brokerage Partner Integration) requires an SRD appendix covering partner-auth, callback idempotency, attribution schema, and payload whitelisting. v2.2 additions require SRD appendices for (a) OAuth client configuration and callback handling for Google / Apple / Zalo, (b) account-linking state machine covering email conflict + Apple private-relay + Zalo-no-email paths, (c) `industrial_prefs` and `investment_goal` schema with Discover-ranker and challenge-seeder integration contracts.*
