# FRD — Functional Requirement Document
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App (V2.2)

**Document version:** 2.2
**Date:** 2026-04-20
**Author:** Business Analysis Team
**Status:** Approved for Development
**Linked BRD:** BRD.md v2.2
**Supersedes:** FRD v2.1 (2026-04-20)

---


## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Functional Requirements — Core (FR-01 to FR-53)](#functional-requirements--core)
   - [FR-01 to FR-08.2: Onboarding — includes multi-method signup (FR-04.1, FR-05..FR-05.5) + industrial preferences (FR-08.1) + investment goal (FR-08.2), new in v2.2](#onboarding)
   - [FR-09 to FR-14: Home Screen](#home-screen)
   - [FR-15 to FR-22: Discover / Trending Feed](#discover--trending-feed)
   - [FR-23 to FR-29: Stock Detail](#stock-detail)
   - [FR-30 to FR-35: Portfolio Tracking](#portfolio-tracking)
   - [FR-36 to FR-41: Markets Module — VN primary, KR + Global reference-only (v2.2)](#markets-module)
   - [FR-42 to FR-47: Notifications](#notifications)
   - [FR-48 to FR-53: User Account — includes Linked Providers panel FR-49.1 (v2.2)](#user-account)
3. [Module A: Age Gate (FR-AGE-01 to FR-AGE-04)](#module-a-age-gate)
4. [Module B: Paper Trading Engine — PRIMARY PILLAR (FR-PT-01 to FR-PT-06)](#module-b-paper-trading-engine)
5. [Module C: Gamification (FR-GAME-01 to FR-GAME-05)](#module-c-gamification)
6. [Module D: AI Insights P0 (FR-AI-01 to FR-AI-03)](#module-d-ai-system-p0)
7. [Module E: AI Insights P1 (FR-AI-04 to FR-AI-05)](#module-e-ai-system-p1)
8. [Module F: Social Trading P1 (FR-SOC-01 to FR-SOC-05)](#module-f-social-features-p1)
9. [Module G: Language System (FR-LANG-01 to FR-LANG-02)](#module-g-language-system)
10. [Module H: Legal / Disclaimers (FR-LEGAL-01 to FR-LEGAL-03)](#module-h-legal--disclaimers)
11. [Module I: Brokerage Partner Integration — V1.x (FR-BRK-01 to FR-BRK-06)](#module-i-brokerage-partner-integration)
12. [Business Rules](#business-rules)
13. [Traceability Matrix](#traceability-matrix)

---

## V2.1 Scope Notes *(retained — still active)*

Three framing shifts from v2.0:

- **Paper trading is the product**, not a feature. It is the primary pillar; Module B is the spine of the FRD. All other modules exist to feed, socialize, or graduate out of paper trading.
- **Social Trading renames Social Features.** Module F is a track-record-visible social-trading layer, not a peer-learning forum. Education ceases to be a first-class module.
- **Brokerage Partner Integration** is added as Module I (V1.x). Paave remains unlicensed and handles no funds; real trading is executed by licensed securities-company partners on their own infrastructure.

Removed from scope in v2.1 (was in v2.0 Module E / elsewhere):
- Pre-trade AI risk-score card and suggested position size (FR-AI-04 in v2.0).
- Personalized learning paths, 90-second micro-lessons, spaced repetition (FR-AI-06 in v2.0).
- Echo-chamber behavioral detection (subset of FR-AI-07 in v2.0).

Still deferred to V2+: full social feed (copy trading, following feed), leaderboard v2, Morning Call AI briefing, public portfolio sharing, pre-trade AI advisory surfaces.

## V2.2 Scope Notes *(new in v2.2 — additive on top of v2.1)*

Three additive deltas in v2.2:

- **Vietnam Gen Z is the sole PRIMARY persona.** All scope, copy, marketing, personalization defaults, and success metrics are Vietnam-first. KR and US/Global market data remain in V1 **for reference only** — labeled "Reference" in every surface, no SLA, no primary-persona product decisions driven by KR/US needs. KR localization, KR social community, and KR marketing campaigns are deferred to V2+.
- **Multi-method signup is core V1 scope.** V1 ships with four signup methods on day one: email + password, Google OAuth, Apple OAuth, and Zalo OAuth (BR-SIGNUP-01). New FRs: FR-04.1 Signup Method Selection, FR-05 Email/Password Signup, FR-05.1 Google OAuth, FR-05.2 Apple OAuth, FR-05.3 Zalo OAuth, FR-05.4 Post-Handshake DOB Prompt, FR-05.5 Account Linking. Updates: FR-07 Login routes to the method used at registration; no password is ever set for social-only accounts.
- **Onboarding collects industrial preferences + investment goal.** Two new steps (FR-08.1 Industrial Preferences multi-select; FR-08.2 Investment Goal single-choice) are inserted between the age-gate routing and the consent screen. These fields seed Discover personalization (BR-ONBOARD-04), weekly challenge difficulty (BR-ONBOARD-05), and home widgets. `onboarded_at` flag flips only when both fields (or explicit "Skip" on preferences) plus goal are persisted.

Deferred to V2+ from v2.2 scope:
- Additional social providers (Facebook, KakaoTalk, Line, Naver).
- KR-localized marketing and KR-localized social communities.
- Document-based KYC at signup (V1.x partner-path only; V2+ for Paave itself).

---

## 1. Feature Overview

| Feature | Pillar | Actor | Goal |
|---------|-------|-------|------|
| **Paper Trading Engine** | **PRIMARY** | LEARN_MODE / FULL_ACCESS User | Simulate market and limit orders on HOSE/HNX (VN primary, real-time), KOSPI/KOSDAQ (reference), and global tickers (reference) with virtual funds |
| **Social Trading** | PRIMARY | Registered User | Follow traders, view per-ticker feeds, share trade receipts, size conviction from community signal |
| **Multi-Method Signup (v2.2)** | PRIMARY | New User | Register via email/password, Google, Apple, or Zalo; provider verifies identity and Paave auto-creates account using provider display name |
| **Onboarding Personalization (v2.2)** | PRIMARY | New User | Capture industrial preferences (multi-select) + investment goal (single-choice) to seed Discover personalization and challenge difficulty |
| Home Screen | Supporting | Registered User | Surface paper portfolio, followed traders, market snapshot, trending stocks |
| Discover / Trending Feed | Supporting | Registered User | Browse curated stock cards with editorial context, social proof, and preference-weighted ranking |
| Stock Detail | Supporting | Registered User | View price data, key stats, community feed, and place paper trades |
| Portfolio Tracking (Paper) | Supporting | Registered User | Track virtual holdings, P&L, and trade history |
| Markets Module | Supporting | Registered User | Browse VN market data (primary, real-time); KR + Global as **reference only** in V1 |
| **Brokerage Partner Integration (V1.x)** | PRIMARY (V1.x) | FULL_ACCESS User, Tier 3+, ≥ 30 paper trades | Open a real account at a licensed partner broker; hand off paper strategies into real markets |
| Notifications | Supporting | Registered User | Receive price alerts, nudges, portfolio health updates |
| User Account | Supporting | Registered User | Manage profile, language, preferences, linked providers, and security settings |
| Age Gate | Supporting | New User | Enforce age-appropriate feature access and brokerage eligibility based on verified DOB (post-OAuth mandatory screen for social signups) |
| Gamification | Supporting | Registered User | Earn XP, advance Trader Tiers, complete weekly challenges |
| AI Insights P0 | Supporting | Registered User | Post-trade insight cards and natural-language stock queries (ticker/portfolio-scoped) |
| AI Insights P1 (V1.x) | Supporting | Registered User | Weekly portfolio health check and behavioral nudges |
| Language System | Supporting | Registered User | VN/KR/EN language selection with locale-appropriate financial terminology (VN is default for VN users) |
| Legal / Disclaimers | Supporting | Registered User | Investment, AI, paper-trading, minor, and brokerage-partner disclaimers; data consent |

---
