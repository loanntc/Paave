# SRD — System Requirement Document
## Paave — Gen Z Fintech Investing App (V1)

**Document version:** 3.0
**Date:** 2026-04-16
**Author:** Business Analysis Team
**Status:** Approved for Development
**Linked FRD:** FRD.md v3.0
**Linked BRD:** BRD.md v3.0

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Flows](#2-system-flows)
3. [Data Handling Rules](#3-data-handling-rules)
4. [Validation Rules](#4-validation-rules)
5. [API Contracts](#5-api-contracts)
6. [Error Handling Logic](#6-error-handling-logic)
7. [Security Requirements](#7-security-requirements)
8. [Performance Requirements](#8-performance-requirements)
9. [Data Models](#9-data-models)

---

## 1. Architecture Overview

### 1.1 System Components

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| Mobile App | React Native (iOS 15+ / Android 10+) | User interface, local caching, push notification handling, on-device language detection |
| API Gateway | REST over HTTPS | Single entry point for all mobile-to-backend communication |
| Auth Service | JWT + Refresh Token | Authentication, session management, OTP generation |
| User Service | | User profile, market preferences, watchlist management |
| Market Data Service | | VN/KR real-time feed aggregation, price snapshot cache |
| Portfolio Service | | Holdings CRUD, P&L calculation |
| Paper Trading Engine | | Virtual order processing, virtual portfolio management, virtual P&L |
| Gamification Service | | XP events, Trader Score computation, leaderboard, challenges |
| AI Service | Claude API (primary) / GPT-4o (fallback) | Post-trade analysis, pre-trade insights, coaching, portfolio health |
| Social Service | | Posts, feeds, follow graph, social proof counters |
| Notification Service | FCM + APNs | Push notification delivery, alert evaluation |
| Editorial CMS | Headless CMS | Stock card content, theme tags |
| Age Gate Service | | DOB verification, parental consent, feature tier assignment |
| Language Service | | Locale management, i18n routing, AI prompt config |
| Compliance Service | | Consent logging, data deletion, audit trail |
| Database | PostgreSQL | Persistent user, portfolio, watchlist, alert, social, trading data |
| Cache | Redis | Market data cache, session cache, rate-limit counters, social proof counters |
| Vector DB | Pinecone | Financial news embeddings for AI RAG pipeline |
| Data Feed Connector | HoSE/HNX WebSocket/API + KRX API | VN and KR real-time price ingestion |
| Push Provider | Firebase Cloud Messaging + Apple Push Notification Service | Push delivery |
| Background Job Queue | (e.g., BullMQ / Sidekiq) | Async AI jobs, leaderboard refresh, social proof updates |

### 1.2 Communication Protocol

- All mobile → backend communication: HTTPS (TLS 1.2 minimum, TLS 1.3 preferred)
- All request headers must include: `Authorization: Bearer <access_token>` (except public endpoints)
- All responses: `Content-Type: application/json`
- All timestamps: ISO 8601 UTC (`2026-04-14T09:30:00Z`)
- All monetary amounts: raw numeric values (e.g., `50000.00`), currency specified in a separate field

---

## 2. System Flows

### 2.1 User Registration Flow

```
1. Mobile app: User submits registration form (name, email, password, nationality, date_of_birth)
2. API Gateway: Receives POST /api/v1/auth/register
3. Auth Service:
   a. Validates all fields against validation rules (Section 4.1)
   b. Checks if email already exists in database
      - If exists with status ACTIVE → return error E-1001
      - If exists with status PENDING_VERIFICATION → resend OTP, return success
   c. Hashes password using bcrypt (cost factor 12)
   d. Encrypts date_of_birth using AES-256 before storage (never stored in plaintext)
   e. Creates user record in DB with status = PENDING_VERIFICATION
   f. Calculates age server-side from DOB
      - Age < 13 → return error E-1009 (registration blocked)
      - Age 13–15 → initiate parental consent flow (Section 2.10); set feature_tier = PENDING_CONSENT
      - Age 16–17 → set feature_tier = LEARN_MODE
      - Age ≥ 18 → set feature_tier = FULL_ACCESS
   g. Generates 6-digit numeric OTP; stores OTP hash + expiry (now + 10 minutes) in Redis with key `otp:{userId}`
   h. Sends OTP email via email service (async, non-blocking)
4. API Gateway: Returns HTTP 201 with user ID and feature_tier
5. Mobile app: Navigates to Email Verification screen
```

### 2.2 OTP Verification Flow

```
1. Mobile app: User submits 6-digit OTP
2. API Gateway: Receives POST /api/v1/auth/verify-otp
3. Auth Service:
   a. Looks up `otp:{userId}` in Redis
      - Not found → return error E-1002 (expired)
   b. Checks attempt count `otp_attempts:{userId}` in Redis
      - Attempts ≥ 5 → return error E-1003 (max attempts exceeded)
   c. Compares submitted OTP with stored hash
      - Mismatch → increment attempt counter; return error E-1004 with remaining attempts
      - Match:
        i.  Delete `otp:{userId}` and `otp_attempts:{userId}` from Redis
        ii. Update user status to ACTIVE in DB
        iii. Generate JWT access token (1-hour expiry) and refresh token (30-day expiry)
        iv. Store refresh token hash in DB table `user_sessions`
4. API Gateway: Returns HTTP 200 with access_token, refresh_token, and feature_tier
5. Mobile app: Stores tokens securely (iOS Keychain / Android Keystore); navigates to Home
```

### 2.3 Login Flow

```
1. Mobile app: User submits email and password
2. API Gateway: Receives POST /api/v1/auth/login
3. Auth Service:
   a. Checks login attempt counter `login_attempts:{email}` in Redis
      - Counter ≥ 5 AND lockout TTL not expired → return error E-1005 (locked)
   b. Fetches user by email from DB
      - Not found → increment counter; return generic error E-1006
   c. Compares submitted password with stored bcrypt hash
      - Mismatch → increment counter; return generic error E-1006
      - Match:
        i.  Reset login attempt counter in Redis
        ii. Check user status = ACTIVE (if PENDING_VERIFICATION → error E-1007)
        iii. Decrypt DOB, recalculate age server-side
             - If user was previously LEARN_MODE and is now ≥ 18 → set feature_tier = FULL_ACCESS, queue age_upgrade_event notification
        iv. Generate access_token (1-hour expiry) and refresh_token (30-day expiry)
        v.  Store refresh token hash in `user_sessions` with device_id and created_at
4. API Gateway: Returns HTTP 200 with access_token, refresh_token, and feature_tier
5. Mobile app: Stores tokens; if age_upgrade_pending = true, display "Unlock Full Access" prompt; navigates to Home
```

### 2.4 Token Refresh Flow

```
1. Mobile app detects access token is expired (HTTP 401 received or proactive check 60 seconds before expiry)
2. Mobile app: Sends POST /api/v1/auth/refresh with refresh_token
3. Auth Service:
   a. Validates refresh_token exists in `user_sessions` and is not expired
      - Not found or expired → return error E-1008 (session expired)
   b. Generates new access_token (1-hour expiry)
   c. Optionally rotates refresh_token (sliding window; reset expiry to now + 30 days)
4. Mobile app: Replaces stored access_token; retries original request
```

### 2.5 Market Data Ingestion Flow (VN Real-Time)

```
1. Data Feed Connector: Maintains persistent WebSocket connection to HoSE/HNX feed
2. On each price tick received:
   a. Validate tick data (stock code, price > 0, timestamp not older than 60 seconds)
   b. Write to Redis hash `market:vn:prices` with key = stock_code, value = {price, change, volume, timestamp}, TTL = 15 seconds
   c. Update Redis sorted set `market:vn:gainers` (scored by daily_change_pct, top 5 maintained)
   d. Update Redis sorted set `market:vn:losers` (scored by daily_change_pct ascending, top 5 maintained)
   e. Update Redis sorted set `market:vn:volume` (scored by today_volume, top 5 maintained)
   f. Publish tick event to Paper Trading Engine subscriber (for LIMIT order evaluation)
3. Market Data Service: Exposes Redis data via REST API (no DB query for VN real-time; Redis is source of truth for current-day data)
4. If WebSocket connection drops:
   a. Attempt reconnect at intervals: 5s, 10s, 30s, 60s (exponential backoff, max 60s)
   b. After 3 failed reconnect attempts: Set cache flag `market:vn:feed_status = DEGRADED`
   c. API responses include feed_status field; mobile app shows "Live data temporarily unavailable" banner
```

### 2.6 Price Alert Evaluation Flow

```
1. Notification Service: Subscribes to VN price tick events from Market Data Service (event stream)
2. On each price tick:
   a. Query DB for active alerts matching the stock_code where:
      - condition = "above" AND tick_price >= target_price, OR
      - condition = "below" AND tick_price <= target_price
   b. For each matching alert:
      i.   Fetch user's push token from DB
      ii.  Check user's `notifications_enabled` preference
           - If false: Skip push; still mark alert as TRIGGERED
      iii. Construct notification payload (see FR-43)
      iv.  Send push notification via FCM (Android) or APNs (iOS)
      v.   Update alert status to INACTIVE in DB with triggered_at timestamp
      vi.  Insert record into `notification_inbox` for user
3. Evaluation latency target: Alert evaluated within 30 seconds of price tick; notification delivered within 60 seconds of threshold crossing (per FR-43)
```

### 2.7 Discover Feed Load Flow

```
1. Mobile app: Sends GET /api/v1/discover with query params market, theme, page, page_size
2. API Gateway → Market Data Service + Editorial CMS:
   a. Fetch editorial stock cards from CMS for given market + theme filter (cached in Redis for 5 minutes)
   b. For each card, fetch current price and social proof count from Redis (market data cache)
   c. Determine user's watchlist state for each stock (query User Service with user_id + stock_codes)
   d. Assemble response with merged data
3. Return paginated response (10 items per page)
4. If CMS data is stale (>5 minutes): Refresh from CMS; serve stale data while refreshing (stale-while-revalidate pattern)
```

### 2.8 Watchlist Toggle Flow

```
1. Mobile app: Sends optimistic UI update (FR-20)
2. Mobile app: Sends POST /api/v1/watchlist or DELETE /api/v1/watchlist/{stock_code}
3. User Service:
   a. POST (Add):
      - Check current watchlist count for user; if ≥ 100 → return error E-2001
      - Insert record into `user_watchlist` table
      - Increment Redis counter `social_proof:{stock_code}` atomically (INCR)
   b. DELETE (Remove):
      - Delete record from `user_watchlist` table
      - Decrement Redis counter `social_proof:{stock_code}` atomically (DECR, floor at 0)
4. Return HTTP 200 on success; HTTP 4xx on validation failure
5. Mobile app: Confirms optimistic update or reverts on failure
```

### 2.9 Portfolio P&L Calculation Flow

```
1. User Service receives GET /api/v1/portfolio for a user
2. For each holding in `user_holdings`:
   a. Fetch current_price from Redis market data cache (for the stock's market)
   b. Calculate:
      - current_value = shares * current_price
      - total_cost = shares * avg_buy_price
      - unrealized_pnl = current_value - total_cost
      - unrealized_pnl_pct = (unrealized_pnl / total_cost) * 100
3. Aggregate:
   - total_portfolio_value = SUM(current_value) for all holdings
   - total_unrealized_pnl = SUM(unrealized_pnl) for all holdings
4. Return full portfolio response
5. If current_price unavailable for a stock (feed outage or delisted):
   - Use last_known_price from DB (updated nightly from end-of-day prices)
   - Flag holding with price_status = "DELAYED" or "DELISTED"
```

### 2.10 Parental Consent Flow

```
1. During registration: user age is 13–15
2. Auth Service:
   a. Creates user record with status = PENDING_CONSENT, feature_tier = PENDING_CONSENT
   b. Prompts user to enter parent_email on registration screen
   c. Creates record in `parent_consent` table: user_id, parent_email, token (random 256-bit), expires_at = now + 24h
   d. Sends confirmation email to parent_email with link: https://paave.app/consent?token=<token>
3. Parent clicks confirmation link:
   a. Consent Service validates token not expired (< 24h)
   b. If valid: sets verified_at = now in `parent_consent` table; updates user feature_tier = LEARN_MODE, status = ACTIVE
   c. If expired: parent must request a new link via re-trigger endpoint
4. User tries to access app before consent:
   - API returns feature_tier = PENDING_CONSENT on all requests
   - Mobile app shows "Waiting for parent approval" screen; no app features accessible
5. Resend parental consent email: POST /api/v1/auth/resend-parental-consent — rate-limited to max 3 requests per 24 hours per user
```

### 2.11 Paper Trading Order Execution Flow

```
1. Mobile app: User submits order on Paper Trading screen
2. Paper Trading Engine receives POST /api/v1/paper-trading/orders
3. Validation:
   a. Check virtual_balances for sufficient balance (BUY orders)
   b. Check virtual_portfolio for sufficient quantity (SELL orders)
   c. Validate ticker exists in price feed
4. MARKET order:
   a. Insert order record with status = PENDING
   b. Fetch next price snapshot from Redis (TTL ≤ 15s)
   c. If snapshot available within 15s: fill order at snapshot price, set status = FILLED, fill_price = snapshot_price, fill_timestamp = now
   d. Update virtual_portfolio (adjust quantity and avg_buy_price for BUY; reduce quantity for SELL)
   e. Update virtual_balances (deduct cost for BUY; credit proceeds for SELL)
   f. Calculate and store realized_pnl for SELL orders
   g. Fire post-trade AI job (async, non-blocking)
   h. Fire XP event: TRADE_PLACED = 10 XP
5. LIMIT order:
   a. Insert order record with status = PENDING, limit_price set
   b. On LIMIT BUY order placement: reserved_cash += (quantity × limit_price)
   c. Subscribe to price events for the ticker
   d. When price crosses limit_price: fill order (same steps as MARKET d–h above); reserved_cash -= (quantity × limit_price)
   e. If order not filled after market close: status remains PENDING (Good Till Cancelled semantics)
   f. On cancel: reserved_cash -= (quantity × limit_price)
   g. Daily cron job at 00:00 UTC checks all PENDING limit orders:
      - If order age > 30 calendar days from placement → set status = EXPIRED
      - Release reserved virtual cash back to user's available balance: reserved_cash -= (quantity × limit_price)
      - Send push notification: "[TICKER] limit order expired after 30 days"
      - Insert record into notification_inbox
6. Return order response immediately after insertion (async fill for both order types)
```

### 2.12 Portfolio Reset Flow

```
1. User requests portfolio reset: POST /api/v1/paper-trading/reset
2. Paper Trading Engine:
   a. Begin DB transaction
   b. Mark all records in virtual_portfolio (user_id) with reset_at = now (soft delete; retain for analytics)
   c. Mark all open orders as CANCELLED with cancelled_at = now
   d. Restore virtual_balances: balance_vnd = 500,000,000, last_reset_at = now
   e. Insert new clean virtual_portfolio state (empty)
   f. Commit transaction
3. Historical trade records in virtual_orders remain intact, flagged with pre_reset = true
4. Return 200 OK with new balance
```

### 2.13 Gamification XP and Trader Score Flow

```
1. XP award (event-driven):
   a. Events arrive from Paper Trading Engine, Lesson Service, Auth Service (daily login), Challenge Engine
   b. Gamification Service looks up xp_events table for xp_amount by event_type
   c. Atomically increments user's total_xp in Redis and PostgreSQL
   d. Checks tier threshold table; if XP crosses tier boundary → update user tier, send push notification

2. Trader Score computation (weekly cron, every Sunday 00:00 UTC):
   a. For each active user with ≥1 trade in past 7 days:
      - Return component (40%): (weekly_portfolio_return / benchmark_return) × 40, clamped to 0–40
      - Consistency component (30%): (days_with_activity / 7) × 30, clamped to 0–30
      - Risk Discipline component (20%): 20 − (coaching_flags_this_week × 5), clamped to 0–20
      - Activity component (10%): min(trades + lessons + logins, 20) / 20 × 10, clamped to 0–10
      - Weekly Score = sum of four components (range: 0–100)
   b. Add weekly_score to user's cumulative_trader_score in `trader_scores` table
   c. Check tier thresholds: 0/500/1500/3500/7500/15000
      - If cumulative score crosses tier boundary upward → update user tier (tiers never decrease)
      - Send tier-up push notification and trigger milestone celebration event
   d. Persist weekly_score and cumulative_trader_score with computed_at timestamp
   e. Refresh leaderboard materialized views

3. Challenge evaluation:
   a. Daily cron checks challenges table for active challenges (start_date ≤ today ≤ end_date)
   b. For each challenge: evaluate user progress against metric and target
   c. On target met: award xp_reward, mark user_challenge_progress = COMPLETED, send push notification
```

### 2.14 Leaderboard Refresh Flow

```
1. Background job runs every 1 hour
2. Refresh materialized views:
   - leaderboard_vn: users with nationality = VN, ranked by trader_score DESC
   - leaderboard_kr: users with nationality = KR, ranked by trader_score DESC
   - leaderboard_global: all users, ranked by trader_score DESC
   - leaderboard_network_{network_id}: users in a specific social network, ranked by trader_score DESC
3. Each view includes: rank, user_id, display_name, trader_score, tier_name, avatar_url
4. Cache result in Redis key `leaderboard:{scope}` with TTL = 60 minutes
5. Serve GET /api/v1/leaderboard from Redis; fall back to materialized view on cache miss
```

### 2.15 AI Post-Trade Analysis Flow

```
1. Trigger: Paper Trading Engine fires event when order status = FILLED
2. Background job queue receives event (non-blocking to user)
3. AI Service:
   a. Fetch trade details: ticker, side, quantity, fill_price, fill_timestamp
   b. Fetch user's virtual portfolio state and recent trade history
   c. Run language detection to determine prompt language
   d. Query Pinecone vector DB: embed ticker + context, retrieve top-3 relevant news chunks
   e. Construct prompt using language-specific system_prompt_template; inject RAG chunks
   f. Send to Claude API (primary); on 5xx retry with exponential backoff (1s, 2s, 4s); on persistent failure fallback to GPT-4o
   g. Post-process response: append language-specific disclaimer
   h. Store in ai_requests table (prompt_hash, response_hash, language, type = POST_TRADE)
   i. Deliver analysis as push notification + in-app notification_inbox entry
```

### 2.16 AI Pre-Trade Analysis Flow

```
1. Trigger: User opens stock buy confirmation screen
2. Mobile app: Sends GET /api/v1/ai/pre-trade?ticker={ticker}
3. AI Service (must respond within 2 seconds):
   a. Check Redis cache `ai_pretrade:{ticker}:{language}` (TTL = 5 minutes); return cached if present
   b. If no cache: fetch RAG context (top-3 chunks), build prompt, call Claude API
   c. On timeout (> 2s): return HTTP 202 with status = PENDING; mobile app shows skeleton and gracefully skips
   d. On success: cache response in Redis; return analysis to mobile app
   e. Post-process: append disclaimer
4. Store request in ai_requests table (type = PRE_TRADE)
```

### 2.17 AI Behavioral Coaching Flow

```
1. Trigger: After every trade fills, Gamification/AI Service evaluates behavioral rules:
   - FOMO: buying after ≥3% single-day run-up on same ticker
   - PANIC: selling into a drop with no technical signal
   - OVERTRADE: > 5 trades in a single day
   - CONCENTRATION: single ticker > 25% of portfolio value after trade
2. If any rule fires:
   a. Check Redis key `coaching_cooldown:{user_id}` — if present (TTL = 24h): skip (max 1 coaching notification per user per day)
   b. If not in cooldown:
      - Queue coaching AI job (type = COACHING)
      - Set `coaching_cooldown:{user_id}` in Redis with TTL = 24h
      - AI generates behavioral coaching message in user's language
      - Append disclaimer; deliver as push + inbox notification
```

### 2.18 AI Portfolio Health Flow

```
1. Cron job runs every Monday 08:00 AM in user's local timezone (determined from user locale)
2. For each user with feature_tier = FULL_ACCESS or LEARN_MODE:
   a. Compute portfolio health dimensions: diversification, concentration risk, return vs benchmark, activity score
   b. Queue AI health job (type = HEALTH_CHECK)
   c. AI generates portfolio health report in user's language
   d. Post-process: append disclaimer
   e. Store report in ai_requests table
   f. Send push notification: "Your weekly portfolio health report is ready"
   g. User can retrieve report via GET /api/v1/ai/portfolio-health/latest
```

### 2.19 Social Post Submission Flow

```
1. User submits post: POST /api/v1/social/posts
2. Social Service:
   a. Validate body (length, no prohibited content patterns)
   b. Extract $cashtags from body → populate tickers[] array
   c. Classify sentiment (BULL / BEAR / NEUTRAL) based on body text (rules engine or lightweight classifier)
   d. Set status = PENDING; record trader_score_at_post from current user score
   e. Enqueue post in 60-second delay queue
3. After 60-second delay — auto-moderation step:
   a. Check for prohibited directive patterns (e.g., "mua vào ngay", "buy now" without analysis marker)
   b. If flagged: set status = HELD_FOR_REVIEW, notify moderation team
   c. If clean: set status = PUBLISHED
4. On publish: update social_proof_cache for each ticker in tickers[] (posts_24h counter +1)
5. Return 201 immediately to user after initial validation (async moderation)
```

### 2.20 Social Feed Load Flow

```
1. Mobile app: Sends GET /api/v1/social/feed?type={following|trending}
2. Social Service:
   a. Following feed:
      - Query follow table for user's followed user_ids
      - Fetch published posts from those users, ordered by created_at DESC
      - Paginate (20 per page)
   b. Trending feed:
      - Compute ticker interaction velocity in past 4 hours (posts + watchlist adds + price alert sets)
      - Rank tickers by velocity
      - Fetch published posts for top-ranked tickers, sorted by velocity-weighted score
      - Paginate (20 per page)
3. For each post: attach author's trader_score, tier badge, and social proof counters
4. Return paginated feed response
```

### 2.21 Language Detection and Routing Flow

```
1. On app launch (or language switch):
   a. Mobile app: detect device locale
   b. Mobile app: send PATCH /api/v1/user/locale with {language: "vi|ko|en", set_by: "DEVICE"}
   c. Language Service: upsert user_locale record
2. On user-initiated language switch:
   a. User selects language in Settings
   b. Mobile app: send PATCH /api/v1/user/locale with {language: "vi|ko|en", set_by: "USER"}
   c. User-set language takes priority over device-detected language
3. All subsequent AI requests:
   a. AI Service fetches user's language from user_locale table
   b. Loads language-specific system_prompt_template
   c. Routes response content to correct locale
```

### 2.22 Consent Logging Flow

```
1. On registration, terms acceptance, or privacy policy acceptance:
   a. Mobile app sends POST /api/v1/compliance/consent with consent_type and version
   b. Compliance Service inserts immutable record into consent_log table (no updates ever)
2. On marketing opt-in/opt-out: same flow with consent_type = MARKETING
3. All consent records are append-only (INSERT only, no UPDATE, no DELETE)
```

### 2.23 Data Deletion Flow

```
1. User requests account deletion: POST /api/v1/users/me/deletion-request
2. Compliance Service:
   a. Creates deletion_request record (status = PENDING, requested_at = now)
   b. Sends confirmation email to user
   c. User has 30-day cool-off period to cancel (DELETE /api/v1/users/me/deletion-request)
3. After 30-day cool-off (cron job):
   a. Anonymize user record: overwrite full_name, email, password_hash, dob_encrypted with anonymized placeholders
   b. Delete all personal data fields; set status = DELETED
   c. Retain anonymized analytics events (user_id replaced with anonymous_id)
   d. Delete all sessions, push tokens, and personal preferences
   e. Mark deletion_request status = COMPLETED
```

### 2.24 Biometric Authentication Flow

```
1. First successful login (email/password):
   a. Auth Service checks device capabilities via mobile app report (has_biometric_hardware: true/false)
   b. If has_biometric_hardware = true AND user.biometric_enabled = false:
      - Return biometric_enrollment_prompt = true in login response
   c. Mobile app shows enrollment prompt: "Enable Face ID / Fingerprint for faster login?"
   d. If user accepts:
      - Mobile app stores auth credential in device secure enclave (iOS Keychain / Android Keystore)
      - Mobile app sends PATCH /api/v1/user/biometric with {enabled: true, device_id: "<device_id>"}
      - Auth Service stores biometric_enabled = true and device_id in user_sessions table
   e. If user declines: biometric_enrollment_prompt not shown again until user opens Settings

2. Subsequent app opens (biometric auth):
   a. Mobile app checks: biometric_enabled = true AND valid refresh_token exists
   b. If both true: trigger device biometric prompt (Face ID / fingerprint)
   c. On biometric success:
      - Mobile app sends POST /api/v1/auth/biometric-login with {refresh_token, device_id, biometric_verified: true}
      - Auth Service validates refresh_token + device_id match
      - Returns new access_token (1-hour expiry)
   d. On biometric failure (attempt 1-2): re-prompt biometric
   e. On 3rd consecutive failure:
      - Mobile app redirects to email/password login
      - Toast: "Biometric failed. Please log in with your password."
      - biometric_consecutive_failures counter reset on next successful login

3. Logout:
   a. Biometric credential remains on device but session is invalidated server-side
   b. Next app open: biometric prompt still shown (if enabled) but server rejects the expired refresh_token → falls back to email/password
```

### 2.25 Milestone Celebration Flow

```
1. Trigger events (evaluated after relevant actions):
   - FIRST_TRADE: after first paper order fills (Paper Trading Engine event)
   - FIRST_PROFIT: daily cron checks if user's virtual P&L > 0 for first time
   - TIER_UP: after weekly Trader Score computation crosses tier threshold
   - PORTFOLIO_MILESTONE: after each trade fill, check if total_unrealized_pnl crosses 10M/50M/100M thresholds
   - GOAL_REACHED: after each portfolio value update, check if value >= active goal target
   - STREAK_7: after daily streak counter reaches 7
   - STREAK_30: after daily streak counter reaches 30

2. Gamification Service:
   a. On trigger event, check milestone_log table for {user_id, milestone_type}
      - If record exists → skip (milestone already achieved; no duplicate celebration)
      - If no record → proceed
   b. Insert record into milestone_log: {user_id, milestone_type, achieved_at, metadata}
   c. Generate achievement card:
      - Pre-render 9:16 PNG image server-side with: milestone name (localized), date, tier badge, % return stat
      - Store in CDN with URL; URL returned to client
   d. Send push notification: "🎉 Achievement unlocked: [milestone name]!"
   e. Return milestone event to mobile app via WebSocket or next API poll

3. Mobile app on milestone event:
   a. Queue celebration overlay (max 2 in queue)
   b. Display: confetti animation (1200ms) + haptic (medium) + achievement card
   c. User actions: dismiss (tap anywhere), share (opens native share sheet with pre-rendered card URL)
   d. If prefers-reduced-motion: skip confetti, show card with fade-in only + haptic
```

### 2.26 AI Natural Language Query Flow

```
1. Mobile app: User submits query via chat interface
2. Mobile app: Sends POST /api/v1/ai/query with {query, language}
3. AI Service (target: respond within 5 seconds):
   a. Detect query scope: extract ticker references from query text
   b. Validate scope: only VN (HOSE/HNX) and KR (KOSPI/KOSDAQ) stocks supported in V1
      - If out-of-scope ticker detected → return scope restriction message
   c. Fetch user's language from user_locale table (override input language detection)
   d. Query Pinecone vector DB: embed query, retrieve top-3 relevant context chunks
   e. Construct prompt using language-specific system_prompt_template; inject RAG chunks
   f. Call Claude API (primary); exponential backoff on 5xx (1s, 2s, 4s); fallback to GPT-4o
   g. Post-process response:
      - Filter for buy/sell recommendation language → replace with educational framing
      - Append language-specific disclaimer
      - Include source attribution citations
   h. Store in ai_requests table (type = QUERY, prompt_hash, response_hash)
   i. Return response to mobile app
4. On timeout (> 5 seconds):
   a. Return partial response if available, or
   b. Return error: "Taking longer than usual. Please try again."
5. Session: last 10 conversation turns retained in Redis (TTL = 30 minutes, keyed by user_id + session_id)
```

### 2.27 Social Login Flow (Google / Apple)

```
1. Mobile app: User taps "Continue with Google" or "Continue with Apple"
2. Mobile app: Initiates OAuth 2.0 flow
   - Google: GoogleSignIn SDK → authorization code
   - Apple: ASAuthorizationAppleIDProvider → identity token + authorization code
3. Mobile app: Sends POST /api/v1/auth/login/social with {socialToken, socialType, device_id}
4. Auth Service:
   a. Validate social token with provider (Google tokeninfo / Apple token verification)
   b. Extract email and display name from social profile
   c. Check if email exists in users table:
      - Email not found → create new user with status = PENDING_REGISTRATION
        - Return {user_id, registration_required: true, social_email, social_name}
        - Mobile app proceeds to DOB + Consent flow (same as registration but email/password pre-filled/skipped)
      - Email found, already linked to this social provider → authenticate
        - Check if 2FA enabled → if yes: send OTP, return partial_token
        - If no 2FA: generate JWT tokens, return full session
      - Email found, NOT linked to this social provider → return {link_required: true, existing_email}
        - Mobile app shows link confirmation prompt
        - User confirms → POST /api/v1/auth/login/link-accounts with {socialToken, password}
        - Auth Service validates password → links social identity → returns JWT tokens
        - User declines → return to login screen
5. For new social users (registration_required = true):
   a. Mobile app collects DOB (FR-AGE-01) and Consent (FR-LEGAL-03)
   b. Mobile app sends POST /api/v1/users/me/confirmation with {date_of_birth, consent data}
   c. Auth Service: validates DOB, sets feature_tier, activates account
   d. Returns JWT tokens
```

### 2.28 Two-Factor Authentication Flow

```
1. User initiates password login or social login
2. Auth Service: After primary auth succeeds, checks user.two_factor_enabled
   - If false → normal token issuance, login complete
   - If true → proceed to 2FA:
     a. Generate 6-digit OTP, store in Redis key `2fa_otp:{userId}` with TTL = 300s (5 min)
     b. Send OTP to user's registered email
     c. Return HTTP 200 with {partial_token, otp_id, two_factor_required: true}
     d. Partial token is JWT with limited scope (only allows OTP verification), expiry = 5 min
3. Mobile app: shows 2FA OTP screen (reuses OTP UI from FR-06)
4. User enters OTP: POST /api/v1/auth/login/2fa/verify-otp with {partial_token, otpId, otpValue}
5. Auth Service:
   a. Validate partial_token (not expired, correct scope)
   b. Check attempt counter `2fa_attempts:{userId}` in Redis
      - Attempts >= 5 → return E-1003 (lockout 15 min)
   c. Compare OTP → if match: issue full JWT tokens, clear OTP and attempts
   d. If mismatch: increment counter, return E-1004 with remaining attempts
6. Biometric login with 2FA enabled:
   - Biometric auth succeeds → 2FA bypassed → full tokens issued immediately
   - Rationale: biometric (something you are) + device (something you have) = two factors

2FA Enable Flow:
1. User opens Settings → Security → "Xac thuc hai buoc"
2. POST /api/v1/auth/stepup with {password} → returns stepup_token
3. PATCH /api/v1/users/me with {two_factor_enabled: true}, requires stepup_token
4. Auth Service sends confirmation OTP → user verifies → 2FA activated
5. Response: {two_factor_enabled: true, enabled_at: timestamp}

2FA Disable Flow:
1. Same step-up auth required (password verification)
2. PATCH /api/v1/users/me with {two_factor_enabled: false}, requires stepup_token
3. Immediate effect, no OTP needed to disable
```

### 2.29 First Trade Guided Experience Flow

```
1. Trigger: User completes onboarding (OTP verified + quiz completed)
2. Server: Create virtual portfolio (500M VND) if not exists
3. Server: Select pre-facilitated stock based on user market preference:
   - VN → VCB (most liquid banking stock)
   - KR → Samsung Electronics (005930)
   - Global → NVIDIA (NVDA)
4. Server: Calculate pre-fill quantity = floor(50,000,000 / current_price / 100) * 100
5. Mobile app: Show guided trade screen with pre-selected stock + pre-filled quantity
6. User taps "Mua ngay":
   a. If market is open: execute at last_traded_price
   b. If market is closed: queue order with previous_close_price, status = QUEUED_FOR_OPEN
7. Update virtual portfolio immediately (optimistic for closed-market orders)
8. Fire events: XP +10, milestone FIRST_TRADE, celebration overlay
9. Navigate to portfolio dashboard showing new position
```

### 2.30 Daily Challenge Flow

```
1. Content pipeline (daily, by 8:00 AM):
   a. Editorial/algorithm selects challenge question for today
   b. Store in daily_challenges table: {date, question_type, question_text, ticker, correct_answer}
   c. If selected stock is trading halted → substitute with VN-Index direction question

2. Morning notification (8:45 AM ICT, trading days):
   a. Push notification to opted-in users: market sentiment + challenge teaser
   b. Deep link to challenge screen

3. Submission phase (8:45 AM - 9:05 AM):
   a. User opens challenge → GET /api/v1/engage/daily-challenge/today
   b. User submits answer → POST /api/v1/engage/daily-challenge/submit
   c. Validate: submission_time <= 9:05 AM ICT; reject late submissions
   d. Store in challenge_responses: {user_id, challenge_id, answer, reasoning, submitted_at}

4. Result phase (14:35 PM):
   a. Cron job evaluates all responses against actual market close data
   b. For each response: is_correct = (answer matches correct_answer)
   c. Award coins: correct = 50,000, participated = 10,000
   d. Update streak (qualifying action for the day)
   e. Push notification: "Ket qua challenge: [correct/incorrect] — xem giai thich"
   f. Generate educational explanation (100-150 words) for the stock's movement
```

### 2.31 Investment Health Score Calculation Flow

```
1. Weekly cron job: Monday 6:00 AM ICT
2. For each active user (>=1 action in past 7 days):
   a. Discipline = (trades_with_reasoning / max(total_trades, 1)) x 100
   b. HHI = sum(position_weight^2); Diversification = max(0, (1 - HHI) x 100)
   c. Learning = min(100, (lessons_completed_this_week / 2) x 100)
   d. Reflection = (closed_with_reflection / max(total_closed, 1)) x 100
   e. IHS = (Discipline + Diversification + Learning + Reflection) / 4
3. Store in ihs_scores: {user_id, week_start, discipline, diversification, learning, reflection, total}
4. Check tier thresholds against cumulative IHS
5. Push notification at 8:00 AM: "IHS tuan nay: [N]/100. Diem yeu nhat: [dim]"
6. In-app insight: score breakdown + behavioral observation + recommended action
```

---

## 3. Data Handling Rules

### 3.1 Storage Rules

| Data Type | Storage Location | Retention | Notes |
|-----------|-----------------|-----------|-------|
| User accounts | PostgreSQL | Indefinite | Soft-delete only (status = DELETED) |
| User sessions (refresh tokens) | PostgreSQL | 30 days from creation | Auto-purge expired sessions nightly |
| OTPs | Redis | 10 minutes | Auto-expires via Redis TTL |
| Login attempt counters | Redis | 15 minutes | Auto-expires via Redis TTL |
| Date of birth | PostgreSQL (encrypted) | Until deletion | AES-256 encrypted; never stored in plaintext |
| VN real-time price data | Redis | TTL = 15s per tick; current trading day | Reset at market open; end-of-day persisted to PostgreSQL |
| KR real-time price data | Redis | TTL = 15s per tick; current trading day | Same pattern as VN feed |
| Historical price data | PostgreSQL | 5 years | End-of-day closing prices |
| User watchlist | PostgreSQL | Until user deletes | |
| Portfolio holdings | PostgreSQL | Until user deletes | |
| Virtual portfolio | PostgreSQL | Until reset or deletion | Pre-reset records retained for analytics |
| Virtual balance | PostgreSQL | Until deletion | |
| Virtual orders | PostgreSQL | Indefinite | Pre-reset flag for segmentation |
| Price alerts | PostgreSQL | 90 days after INACTIVE | Auto-purged after 90 days |
| Notification inbox | PostgreSQL | 30 days | Auto-deleted after 30 days per FR-47 |
| Editorial CMS content | CMS (external) + Redis cache | Cache: 5 minutes | Source of truth is CMS |
| Social proof counters | Redis (posts/watchers) | Updated every 5 minutes | Materialized cache |
| Social posts | PostgreSQL | Until removed or user deletion | Soft-delete via status = REMOVED |
| Follow graph | PostgreSQL | Until unfollow | |
| AI request log | PostgreSQL | 90 days | Prompt and response hashes only (no raw text) |
| AI response content | Delivered to user only | Not persisted beyond notification | |
| Consent log | PostgreSQL | Indefinite | Immutable; append-only |
| Deletion requests | PostgreSQL | Until completion + 1 year | |
| Trader scores | PostgreSQL | Indefinite | Historical weekly scores retained |
| Leaderboard | Redis (materialized cache) | TTL = 60 minutes | Backed by PostgreSQL materialized views |
| XP event log | PostgreSQL | Indefinite | Full audit trail |
| Push tokens | PostgreSQL | Until user logs out or token expires | Updated on each app launch |
| User locale | PostgreSQL | Until updated | |
| Parental consent | PostgreSQL | Until user deletion | |

### 3.2 Data Encoding and Format Rules

- All text data stored and transmitted as UTF-8.
- All prices stored as `DECIMAL(18, 4)` in PostgreSQL to avoid floating-point precision errors.
- All percentages stored as `DECIMAL(10, 4)` (e.g., `5.2500` = 5.25%).
- All timestamps stored as UTC in PostgreSQL (`TIMESTAMPTZ`).
- Timestamps returned to the mobile app as ISO 8601 UTC strings.
- Mobile app converts UTC timestamps to user's local timezone for display.
- Date of birth stored as AES-256-GCM encrypted blob; decrypted only on server-side for age calculation.

### 3.3 Currency Display Rules

| User's Market Preference | Display Currency | Format |
|--------------------------|-----------------|--------|
| Vietnam | VND | `50,000,000 ₫` (period as thousand separator, no decimals for VND) |
| Korea | KRW | `₩50,000,000` (comma as thousand separator) |
| Global | USD | `$1,234.56` (comma as thousand separator, 2 decimal places) |

### 3.4 Personal Data Rules

- Passwords: Stored as bcrypt hash (cost factor 12). Plaintext password never logged or stored.
- Date of birth: Stored as AES-256-GCM encrypted ciphertext. Encryption key stored in secrets manager (not in DB). Age computation happens server-side only; client-side age display uses age band only (e.g., "16–17"), never raw DOB.
- Email: Stored in plaintext; partially masked in UI display only (`lo***@gmail.com`: first 2 chars visible + `***` + `@domain`).
- Push tokens: Stored per-device, per-user. Deleted when user logs out from that device.
- User data subject to Vietnam Cybersecurity Law (Decree 13/2023/ND-CP) and Korea PIPA. No user data transmitted to servers outside permitted jurisdictions without compliance review.
- All API logs must redact passwords, OTP values, full email addresses, and DOB before writing to log storage.

---

## 4. Validation Rules

### 4.1 Registration Field Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| full_name | string | Required; 2–100 characters; only Unicode letters, spaces, hyphens, and apostrophes | "Name must be 2–100 characters and contain only letters" |
| email | string | Required; valid RFC 5322 email format; max 254 characters; unique in DB | "Please enter a valid email address" / "An account with this email already exists" |
| password | string | Required; 8–64 characters; must include ≥1 uppercase letter [A-Z], ≥1 lowercase letter [a-z], ≥1 digit [0-9], ≥1 special character [!@#$%^&*] | "Password must be 8–64 characters and include uppercase, lowercase, number, and special character" |
| nationality | enum | Required; one of: `VN`, `KR`, `OTHER` | "Please select a valid nationality" |
| date_of_birth | date | Required; valid ISO 8601 date (YYYY-MM-DD); not in the future; implies age ≥ 13 | "Please enter a valid date of birth" / "You must be at least 13 years old to register" |

### 4.2 Login Field Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| email | string | Required; valid email format | "Please enter your email address" |
| password | string | Required; non-empty | "Please enter your password" |

### 4.3 OTP Validation

| Rule | Detail |
|------|--------|
| Format | Exactly 6 digits (`[0-9]{6}`) |
| Expiry | 10 minutes from generation |
| Attempts | Maximum 5 incorrect attempts before lockout |
| Lockout duration | 15 minutes |
| Resend cooldown | 60 seconds between resend requests |

### 4.4 Price Alert Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| condition | enum | Required; one of: `above`, `below` | "Please select a condition" |
| target_price | decimal | Required; > 0; up to 2 decimal places; must not equal current_price | "Price must be a positive number" / "Price must be different from current price" |

### 4.5 Portfolio Holding Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| stock_code | string | Required; must exist in system ticker database for the given market | "Ticker not found. Please check the symbol." |
| shares | decimal | Required; > 0; max 4 decimal places; max value: 999,999,999.9999 | "Number of shares must be greater than 0" |
| avg_buy_price | decimal | Required; > 0; max 2 decimal places; max value: 999,999,999.99 | "Please enter a valid buy price" |
| purchase_date | date | Required; not in the future; not before 1990-01-01 | "Purchase date cannot be in the future" / "Please enter a valid date" |

### 4.6 Password Change Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| current_password | string | Required; must match stored hash | "Current password is incorrect" |
| new_password | string | Same rules as registration password; must differ from current_password | (Same as registration rules) |
| confirm_new_password | string | Must exactly match new_password | "Passwords do not match" |

### 4.7 Search Query Validation

| Field | Rules |
|-------|-------|
| query | Minimum 1 character after trimming whitespace; maximum 50 characters; debounced 300ms before API call |

### 4.8 Profile Edit Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| display_name | string | Required; 2–100 characters; Unicode letters, spaces, hyphens, apostrophes | "Name must be 2–100 characters" |
| market_preference | enum | Required; one of: `VN`, `KR`, `GLOBAL` | "Please select a valid market" |

### 4.9 Paper Trading Order Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| ticker | string | Required; must exist in active price feed (VN or KR) | "Ticker not found in active feed" |
| exchange | enum | Required; one of: `HOSE`, `HNX`, `KRX` | "Please select a valid exchange" |
| order_type | enum | Required; one of: `MARKET`, `LIMIT` | "Please select an order type" |
| side | enum | Required; one of: `BUY`, `SELL` | "Please select BUY or SELL" |
| quantity | integer | Required; > 0; ≤ 999,999 | "Quantity must be a positive whole number" |
| limit_price | decimal | Required if order_type = LIMIT; > 0 | "Please enter a valid limit price" |
| BUY: sufficient balance | — | quantity × current_price ≤ virtual balance | "Insufficient virtual balance" |
| SELL: sufficient quantity | — | quantity ≤ current position size for ticker | "Insufficient virtual shares to sell" |

**Note:** Limit orders auto-expire after 30 calendar days from placement.

### 4.10 Social Post Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| body | string | Required; 1–1,000 characters; no null bytes | "Post must be 1–1,000 characters" |
| sentiment | enum | Required; one of: `BULL`, `BEAR`, `NEUTRAL` | "Please select a sentiment" |

### 4.11 Parental Consent Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| parent_email | string | Required; valid RFC 5322 email; must differ from user's own email | "Please enter a valid parent email address" |

### 4.12 Locale Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| language | enum | Required; one of: `vi`, `ko`, `en` | "Please select a valid language" |
| set_by | enum | Required; one of: `DEVICE`, `USER` | "Invalid locale source" |

### 4.13 Social Login Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| socialToken | string | Required; non-empty | "Social authentication token is required" |
| socialType | enum | Required; one of: `google`, `apple` | "Invalid social provider" |

### 4.14 2FA OTP Validation

| Rule | Detail |
|------|--------|
| Format | Exactly 6 digits |
| Expiry | 5 minutes from generation |
| Attempts | Max 5 incorrect before lockout |
| Lockout | 15 minutes |
| Partial token expiry | 5 minutes |

---

## 5. API Contracts

### 5.1 Auth Endpoints

#### POST /api/v1/auth/register

**Request:**
```json
{
  "full_name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "Secure@123",
  "nationality": "VN",
  "date_of_birth": "2006-04-14"
}
```

**Response 201 Created:**
```json
{
  "user_id": "usr_01HX1234ABCD",
  "status": "PENDING_VERIFICATION",
  "feature_tier": "LEARN_MODE",
  "message": "Verification email sent"
}
```

**Response 400 Bad Request:**
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "fields": {
    "email": "Please enter a valid email address",
    "password": "Password must include an uppercase letter"
  }
}
```

**Response 400 — Age below minimum:**
```json
{
  "error_code": "E-1009",
  "message": "You must be at least 13 years old to register"
}
```

**Response 409 Conflict:**
```json
{
  "error_code": "E-1001",
  "message": "An account with this email already exists"
}
```

---

#### POST /api/v1/auth/verify-otp

**Request:**
```json
{
  "user_id": "usr_01HX1234ABCD",
  "otp": "482910"
}
```

**Response 200 OK:**
```json
{
  "access_token": "<jwt>",
  "refresh_token": "<opaque_token>",
  "expires_in": 3600,
  "feature_tier": "LEARN_MODE",
  "user": {
    "user_id": "usr_01HX1234ABCD",
    "full_name": "Nguyen Van A",
    "email_masked": "us***@example.com",
    "market_preference": "VN",
    "language": "vi"
  }
}
```

**Response 400 — Incorrect OTP:**
```json
{
  "error_code": "E-1004",
  "message": "Invalid code. 4 attempts remaining",
  "attempts_remaining": 4
}
```

**Response 400 — Expired OTP:**
```json
{
  "error_code": "E-1002",
  "message": "Code expired. Please request a new code."
}
```

**Response 429 — Max Attempts:**
```json
{
  "error_code": "E-1003",
  "message": "Too many attempts. Please try again in 15 minutes.",
  "retry_after_seconds": 900
}
```

---

#### POST /api/v1/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Secure@123"
}
```

**Response 200 OK:**
```json
{
  "access_token": "<jwt>",
  "refresh_token": "<opaque_token>",
  "expires_in": 3600,
  "feature_tier": "FULL_ACCESS",
  "age_upgrade_pending": false,
  "user": {
    "user_id": "usr_01HX1234ABCD",
    "full_name": "Nguyen Van A",
    "email_masked": "us***@example.com",
    "market_preference": "VN",
    "language": "vi"
  }
}
```

**Response 401 — Wrong credentials:**
```json
{
  "error_code": "E-1006",
  "message": "Email or password is incorrect"
}
```

**Response 429 — Account locked:**
```json
{
  "error_code": "E-1005",
  "message": "Too many failed attempts. Try again in 15 minutes.",
  "retry_after_seconds": 900
}
```

---

#### POST /api/v1/auth/refresh

**Request:**
```json
{
  "refresh_token": "<opaque_token>"
}
```

**Response 200 OK:**
```json
{
  "access_token": "<new_jwt>",
  "refresh_token": "<new_or_same_opaque_token>",
  "expires_in": 3600
}
```

**Response 401 — Expired/Invalid:**
```json
{
  "error_code": "E-1008",
  "message": "Session expired. Please log in again."
}
```

---

#### POST /api/v1/auth/logout

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "refresh_token": "<opaque_token>"
}
```

**Response 200 OK:**
```json
{
  "message": "Logged out successfully"
}
```

---

#### POST /api/v1/auth/resend-parental-consent

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "message": "Parental consent email resent",
  "parent_email_masked": "pa***@example.com"
}
```

**Response 429 — Rate limited:**
```json
{
  "error_code": "E-1010",
  "message": "Please wait before resending.",
  "retry_after_seconds": 3600
}
```

---

#### PATCH /api/v1/user/biometric

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "enabled": true,
  "device_id": "dev_iphone14_abc123"
}
```

**Response 200 OK:**
```json
{
  "biometric_enabled": true,
  "device_id": "dev_iphone14_abc123",
  "enrolled_at": "2026-04-16T12:00:00Z"
}
```

---

#### POST /api/v1/auth/biometric-login

**Request:**
```json
{
  "refresh_token": "<opaque_token>",
  "device_id": "dev_iphone14_abc123",
  "biometric_verified": true
}
```

**Response 200 OK:**
```json
{
  "access_token": "<new_jwt>",
  "expires_in": 3600,
  "feature_tier": "FULL_ACCESS"
}
```

**Response 401 — Invalid session:**
```json
{
  "error_code": "E-7002",
  "message": "Biometric session invalid. Please log in with your password."
}
```

---

#### POST /api/v1/auth/login/social

**Auth:** Public

**Request:**
```json
{
  "socialToken": "google_oauth_token_or_apple_identity_token",
  "socialType": "google|apple",
  "device_id": "dev_iphone14_abc123",
  "platform": "ios",
  "appVersion": "1.0.0"
}
```

**Response 200 — Existing user, no 2FA:**
```json
{
  "access_token": "<jwt>",
  "refresh_token": "<opaque>",
  "expires_in": 3600,
  "feature_tier": "FULL_ACCESS",
  "two_factor_required": false
}
```

**Response 200 — Existing user, 2FA enabled:**
```json
{
  "partial_token": "<jwt_limited>",
  "otp_id": "otp_2fa_abc123",
  "two_factor_required": true,
  "message": "OTP sent to registered email"
}
```

**Response 200 — New user, registration required:**
```json
{
  "user_id": "usr_01HX9999",
  "registration_required": true,
  "social_email": "user@gmail.com",
  "social_name": "Nguyen Van A",
  "social_type": "google"
}
```

**Response 200 — Link required:**
```json
{
  "link_required": true,
  "existing_email_masked": "us***@gmail.com",
  "social_type": "google"
}
```

**Response 401 — Invalid social token:**
```json
{
  "error_code": "E-1011",
  "message": "Social authentication failed. Please try again."
}
```

---

#### POST /api/v1/auth/login/2fa/verify-otp

**Note:** This endpoint already exists in the system flow (Section 2.28). Additional error code for partial token expiry:

**Response 401 — Partial token expired:**
```json
{
  "error_code": "E-1012",
  "message": "Session expired. Please log in again."
}
```

---

### 5.2 Market Data Endpoints

#### GET /api/v1/market/snapshot

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:** None (market preference inferred from user profile)

**Response 200 OK — VN Market:**
```json
{
  "market": "VN",
  "feed_status": "LIVE",
  "indices": [
    {
      "code": "VN-INDEX",
      "name": "VN-Index",
      "value": 1245.67,
      "change_points": 12.34,
      "change_pct": 1.00,
      "volume": 423000000,
      "updated_at": "2026-04-14T09:30:00Z"
    },
    {
      "code": "HNX-INDEX",
      "name": "HNX-Index",
      "value": 234.56,
      "change_points": -1.23,
      "change_pct": -0.52,
      "volume": 87000000,
      "updated_at": "2026-04-14T09:30:00Z"
    }
  ],
  "market_status": "OPEN",
  "next_close": "2026-04-14T08:00:00Z"
}
```

**feed_status values:** `LIVE` | `DEGRADED` | `UNAVAILABLE`
**market_status values:** `OPEN` | `CLOSED` | `PRE_MARKET` | `HOLIDAY`

---

#### GET /api/v1/market/vn/movers

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "market": "VN",
  "feed_status": "LIVE",
  "updated_at": "2026-04-14T09:30:00Z",
  "top_gainers": [
    {
      "stock_code": "VIC",
      "company_name": "Vingroup",
      "exchange": "HOSE",
      "price": 55000.00,
      "change_pct": 6.80,
      "volume": 2340000
    }
  ],
  "top_losers": [
    {
      "stock_code": "FPT",
      "company_name": "FPT Corporation",
      "exchange": "HOSE",
      "price": 92000.00,
      "change_pct": -4.12,
      "volume": 1230000
    }
  ],
  "most_active": [
    {
      "stock_code": "HPG",
      "company_name": "Hoa Phat Group",
      "exchange": "HOSE",
      "price": 28500.00,
      "change_pct": 1.24,
      "volume": 12340000
    }
  ]
}
```

---

#### GET /api/v1/market/stock/{stock_code}

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameter:** `stock_code` — e.g., `VIC`, `SAMSUNG`

**Response 200 OK:**
```json
{
  "stock_code": "VIC",
  "company_name": "Vingroup JSC",
  "exchange": "HOSE",
  "market": "VN",
  "currency": "VND",
  "price_data": {
    "current_price": 55000.00,
    "open": 52000.00,
    "prev_close": 51500.00,
    "day_high": 55500.00,
    "day_low": 51800.00,
    "week_52_high": 72000.00,
    "week_52_low": 38000.00,
    "volume_today": 2340000,
    "market_cap": 200000000000000.00,
    "pe_ratio": 18.50,
    "change_pct": 6.80,
    "change_points": 3500.00
  },
  "analyst_sentiment": {
    "buy_count": 8,
    "hold_count": 3,
    "sell_count": 1,
    "total_analysts": 12,
    "buy_pct": 66.67,
    "hold_pct": 25.00,
    "sell_pct": 8.33,
    "consensus": "Buy"
  },
  "social_proof": {
    "watchers_count": 2341,
    "posts_24h": 18,
    "sentiment_ratio_bull": 0.67,
    "sentiment_ratio_bear": 0.21
  },
  "feed_status": "LIVE",
  "updated_at": "2026-04-14T09:30:00Z"
}
```

**Response 404 — Not Found:**
```json
{
  "error_code": "E-3001",
  "message": "Stock not found"
}
```

---

#### GET /api/v1/market/stock/{stock_code}/chart

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `range`: `1D` | `1W` | `1M` | `3M` | `1Y` (required)

**Response 200 OK:**
```json
{
  "stock_code": "VIC",
  "range": "1D",
  "data_points": [
    {
      "timestamp": "2026-04-14T02:30:00Z",
      "price": 52000.00
    },
    {
      "timestamp": "2026-04-14T02:31:00Z",
      "price": 52150.00
    }
  ],
  "data_interval": "1m",
  "currency": "VND",
  "feed_status": "LIVE"
}
```

**Response 404 — No data for range:**
```json
{
  "error_code": "E-3002",
  "message": "Chart data not available for this period"
}
```

---

### 5.3 Discover Endpoints

#### GET /api/v1/discover

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `market`: `VN` | `KR` | `GLOBAL` (optional; defaults to user's preference)
- `theme`: `all` | `ai` | `kpop` | `vietnam_growth` | `banking` | `technology` | `energy` | `consumer` (optional; default: `all`)
- `page`: integer ≥ 1 (optional; default: `1`)
- `page_size`: integer, fixed at `10`

**Response 200 OK:**
```json
{
  "market": "VN",
  "theme": "all",
  "page": 1,
  "page_size": 10,
  "total_cards": 34,
  "has_more": true,
  "cards": [
    {
      "stock_code": "VIC",
      "company_name": "Vingroup JSC",
      "exchange": "HOSE",
      "currency": "VND",
      "current_price": 55000.00,
      "change_pct": 6.80,
      "editorial_hook": "Vingroup's new EV venture is turning heads across Southeast Asia.",
      "theme_badge": "Vietnam Growth",
      "social_proof_count": 2341,
      "user_watching": false
    }
  ]
}
```

---

### 5.4 Watchlist Endpoints

#### GET /api/v1/watchlist

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "count": 3,
  "items": [
    {
      "stock_code": "VIC",
      "company_name": "Vingroup JSC",
      "exchange": "HOSE",
      "currency": "VND",
      "current_price": 55000.00,
      "change_pct": 6.80,
      "added_at": "2026-04-10T10:30:00Z"
    }
  ]
}
```

---

#### POST /api/v1/watchlist

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "stock_code": "VIC"
}
```

**Response 201 Created:**
```json
{
  "stock_code": "VIC",
  "social_proof_count": 2342,
  "added_at": "2026-04-14T09:30:00Z"
}
```

**Response 409 — Already in watchlist:**
```json
{
  "error_code": "E-2002",
  "message": "Stock already in watchlist"
}
```

**Response 422 — Watchlist full:**
```json
{
  "error_code": "E-2001",
  "message": "Watchlist full. Remove a stock to add another.",
  "limit": 100
}
```

---

#### DELETE /api/v1/watchlist/{stock_code}

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "stock_code": "VIC",
  "social_proof_count": 2340
}
```

**Response 404 — Not in watchlist:**
```json
{
  "error_code": "E-2003",
  "message": "Stock not in watchlist"
}
```

---

### 5.5 Portfolio Endpoints

#### GET /api/v1/portfolio

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "currency": "VND",
  "total_value": 15500000.00,
  "total_unrealized_pnl": 500000.00,
  "total_unrealized_pnl_pct": 3.33,
  "holdings": [
    {
      "holding_id": "hld_01HX5678EFGH",
      "stock_code": "VIC",
      "company_name": "Vingroup JSC",
      "shares": 100.0000,
      "avg_buy_price": 50000.00,
      "current_price": 55000.00,
      "current_value": 5500000.00,
      "total_cost": 5000000.00,
      "unrealized_pnl": 500000.00,
      "unrealized_pnl_pct": 10.00,
      "price_status": "LIVE",
      "purchase_date": "2026-01-15"
    }
  ]
}
```

`price_status` values: `LIVE` | `DELAYED` | `DELISTED`

---

#### POST /api/v1/portfolio/holdings

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "stock_code": "VIC",
  "shares": 100.0000,
  "avg_buy_price": 50000.00,
  "purchase_date": "2026-01-15"
}
```

**Response 201 Created:**
```json
{
  "holding_id": "hld_01HX5678EFGH",
  "stock_code": "VIC",
  "shares": 100.0000,
  "avg_buy_price": 50000.00,
  "purchase_date": "2026-01-15",
  "created_at": "2026-04-14T09:30:00Z"
}
```

**Response 409 — Duplicate holding:**
```json
{
  "error_code": "E-4001",
  "message": "You already have a holding for VIC. Edit the existing holding to update it."
}
```

---

#### PUT /api/v1/portfolio/holdings/{holding_id}

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "shares": 150.0000,
  "avg_buy_price": 51000.00,
  "purchase_date": "2026-01-15"
}
```

**Response 200 OK:**
```json
{
  "holding_id": "hld_01HX5678EFGH",
  "stock_code": "VIC",
  "shares": 150.0000,
  "avg_buy_price": 51000.00,
  "purchase_date": "2026-01-15",
  "updated_at": "2026-04-14T09:45:00Z"
}
```

---

#### DELETE /api/v1/portfolio/holdings/{holding_id}

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "message": "Holding removed successfully"
}
```

---

### 5.6 Alert Endpoints

#### POST /api/v1/alerts

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "stock_code": "VIC",
  "condition": "above",
  "target_price": 60000.00
}
```

**Response 201 Created:**
```json
{
  "alert_id": "alr_01HX9012IJKL",
  "stock_code": "VIC",
  "condition": "above",
  "target_price": 60000.00,
  "status": "ACTIVE",
  "created_at": "2026-04-14T09:30:00Z"
}
```

**Note:** If an alert already exists for this stock_code and user, the response is 200 OK with the updated alert record (overwrites previous alert).

---

#### GET /api/v1/alerts

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "alerts": [
    {
      "alert_id": "alr_01HX9012IJKL",
      "stock_code": "VIC",
      "company_name": "Vingroup JSC",
      "condition": "above",
      "target_price": 60000.00,
      "current_price": 55000.00,
      "status": "ACTIVE",
      "created_at": "2026-04-14T09:30:00Z",
      "triggered_at": null
    }
  ]
}
```

`status` values: `ACTIVE` | `INACTIVE` (triggered) | `CANCELLED`

---

### 5.7 Notification Endpoints

#### GET /api/v1/notifications

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page`: integer ≥ 1 (default: 1)
- `page_size`: integer, max 50 (default: 20)

**Response 200 OK:**
```json
{
  "page": 1,
  "page_size": 20,
  "has_more": false,
  "items": [
    {
      "notification_id": "ntf_01HX3456MNOP",
      "type": "PRICE_ALERT",
      "title": "VIC Alert Triggered",
      "body": "Vingroup JSC is now at 60,500 (+10.09% today)",
      "read": false,
      "created_at": "2026-04-14T10:05:00Z",
      "deep_link": "/stocks/VIC"
    }
  ]
}
```

`type` values: `PRICE_ALERT` | `MARKET_OPEN` | `MARKET_CLOSE` | `WATCHLIST_MOVEMENT` | `AI_ANALYSIS` | `COACHING` | `PORTFOLIO_HEALTH` | `CHALLENGE_COMPLETE` | `TIER_UPGRADE` | `AGE_UPGRADE`

---

#### PUT /api/v1/notifications/{notification_id}/read

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "notification_id": "ntf_01HX3456MNOP",
  "read": true
}
```

---

#### GET /api/v1/notifications/preferences

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "price_alerts": true,
  "market_open": true,
  "market_close": true,
  "watchlist_movements": false,
  "ai_analysis": true,
  "coaching": true,
  "portfolio_health": true
}
```

---

#### PUT /api/v1/notifications/preferences

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "price_alerts": true,
  "market_open": false,
  "market_close": false,
  "watchlist_movements": true,
  "ai_analysis": true,
  "coaching": true,
  "portfolio_health": true
}
```

**Response 200 OK:**
```json
{
  "price_alerts": true,
  "market_open": false,
  "market_close": false,
  "watchlist_movements": true,
  "ai_analysis": true,
  "coaching": true,
  "portfolio_health": true,
  "updated_at": "2026-04-14T09:30:00Z"
}
```

---

#### POST /api/v1/notifications/push-token

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "push_token": "<fcm_or_apns_token>",
  "platform": "android"
}
```

`platform` values: `android` | `ios`

**Response 200 OK:**
```json
{
  "message": "Push token registered"
}
```

---

### 5.8 User/Profile Endpoints

#### GET /api/v1/users/me

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "user_id": "usr_01HX1234ABCD",
  "full_name": "Nguyen Van A",
  "email_masked": "us***@example.com",
  "nationality": "VN",
  "market_preference": "VN",
  "language": "vi",
  "feature_tier": "FULL_ACCESS",
  "notifications_enabled": true,
  "trader_score": 72.4,
  "tier_name": "Investor",
  "total_xp": 4250,
  "created_at": "2026-04-01T08:00:00Z"
}
```

---

#### PUT /api/v1/users/me

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "full_name": "Nguyen Van B",
  "market_preference": "KR"
}
```

**Response 200 OK:**
```json
{
  "user_id": "usr_01HX1234ABCD",
  "full_name": "Nguyen Van B",
  "market_preference": "KR",
  "updated_at": "2026-04-14T09:30:00Z"
}
```

---

#### POST /api/v1/users/me/change-password

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "current_password": "OldSecure@123",
  "new_password": "NewSecure@456",
  "confirm_new_password": "NewSecure@456"
}
```

**Response 200 OK:**
```json
{
  "message": "Password changed successfully"
}
```

**Response 400 — Wrong current password:**
```json
{
  "error_code": "E-5001",
  "message": "Current password is incorrect"
}
```

---

#### POST /api/v1/users/me/deletion-request

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "deletion_request_id": "del_01HX9999ZZZZ",
  "status": "PENDING",
  "scheduled_deletion_at": "2026-05-14T09:30:00Z",
  "message": "Your account will be deleted in 30 days. You can cancel before then."
}
```

---

#### DELETE /api/v1/users/me/deletion-request

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "message": "Account deletion cancelled successfully"
}
```

---

### 5.9 Search Endpoint

#### GET /api/v1/search/stocks

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `q`: string (min 1 char, max 50 chars, required)
- `market`: `VN` | `KR` | `GLOBAL` | `ALL` (optional; default: `ALL`)

**Response 200 OK:**
```json
{
  "query": "vin",
  "results": [
    {
      "stock_code": "VIC",
      "company_name": "Vingroup JSC",
      "exchange": "HOSE",
      "market": "VN",
      "currency": "VND",
      "current_price": 55000.00,
      "change_pct": 6.80
    },
    {
      "stock_code": "VHM",
      "company_name": "Vinhomes JSC",
      "exchange": "HOSE",
      "market": "VN",
      "currency": "VND",
      "current_price": 43000.00,
      "change_pct": -1.20
    }
  ]
}
```

**Response 200 OK — No results:**
```json
{
  "query": "XYZNOTFOUND",
  "results": []
}
```

---

### 5.10 Paper Trading Endpoints

#### POST /api/v1/paper-trading/orders

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "ticker": "FPT",
  "exchange": "HOSE",
  "order_type": "MARKET",
  "side": "BUY",
  "quantity": 100,
  "limit_price": null
}
```

**Response 201 Created:**
```json
{
  "order_id": "ord_01HX5678EFGH",
  "ticker": "FPT",
  "exchange": "HOSE",
  "order_type": "MARKET",
  "side": "BUY",
  "quantity": 100,
  "status": "PENDING",
  "created_at": "2026-04-16T09:30:00Z",
  "estimated_fill_within_seconds": 15
}
```

**Response 400 — Insufficient Balance:**
```json
{
  "error_code": "E-6001",
  "message": "Insufficient virtual balance. Available: ₫45,000,000. Required: ₫92,400,000."
}
```

**Response 400 — Insufficient Holdings:**
```json
{
  "error_code": "E-6002",
  "message": "Insufficient virtual shares. You hold 50 shares of FPT but attempted to sell 100."
}
```

**Response 400 — Ticker Not Found:**
```json
{
  "error_code": "E-6003",
  "message": "Ticker not found in active feed"
}
```

---

#### GET /api/v1/paper-trading/portfolio

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "portfolio_id": "ptf_01HX1234ABCD",
  "total_value": 523450000.00,
  "available_cash": 407050000.00,
  "reserved_cash": 0.00,
  "total_invested": 116400000.00,
  "total_unrealized_pnl": 6400000.00,
  "total_unrealized_pnl_pct": 5.50,
  "total_realized_pnl": 2100000.00,
  "virtual_label": "Tiền ảo",
  "currency": "VND",
  "last_reset_at": null,
  "holdings": [
    {
      "ticker": "FPT",
      "exchange": "HOSE",
      "quantity": 100,
      "avg_buy_price": 91000.00,
      "current_price": 92400.00,
      "current_value": 9240000.00,
      "unrealized_pnl": 140000.00,
      "unrealized_pnl_pct": 1.54,
      "price_status": "LIVE"
    }
  ],
  "open_orders": [
    {
      "order_id": "ord_01HX9999IJKL",
      "ticker": "TCB",
      "order_type": "LIMIT",
      "side": "BUY",
      "quantity": 200,
      "limit_price": 24500.00,
      "status": "PENDING",
      "created_at": "2026-04-15T10:00:00Z",
      "expires_at": "2026-05-15T10:00:00Z"
    }
  ]
}
```

---

#### POST /api/v1/paper-trading/reset

**Headers:** `Authorization: Bearer <access_token>`

**Request:** (empty body)

**Response 200 OK:**
```json
{
  "portfolio_id": "ptf_01HX1234ABCD",
  "balance_vnd": 500000000.00,
  "holdings_count": 0,
  "open_orders_count": 0,
  "reset_at": "2026-04-16T12:00:00Z",
  "message": "Portfolio reset to ₫500,000,000. Trade history retained with [Pre-Reset] labels."
}
```

---

#### GET /api/v1/paper-trading/orders

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:** `status=FILLED|PENDING|EXPIRED|CANCELLED`, `page=1`, `page_size=20`

**Response 200 OK:**
```json
{
  "orders": [
    {
      "order_id": "ord_01HX5678EFGH",
      "ticker": "FPT",
      "exchange": "HOSE",
      "order_type": "MARKET",
      "side": "BUY",
      "quantity": 100,
      "fill_price": 92400.00,
      "status": "FILLED",
      "created_at": "2026-04-16T09:30:00Z",
      "filled_at": "2026-04-16T09:30:12Z",
      "pre_reset": false
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 1,
    "has_next": false
  }
}
```

---

### 5.11 Gamification Endpoints

#### GET /api/v1/gamification/profile

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "user_id": "usr_01HX1234ABCD",
  "total_xp": 4250,
  "weekly_score": 72.4,
  "cumulative_score": 1850,
  "tier": {
    "tier_id": 3,
    "name_en": "Investor",
    "name_vi": "Nhà đầu tư",
    "name_kr": "투자자",
    "min_score": 1500,
    "max_score": 3499
  },
  "score_components": {
    "return": 18.2,
    "consistency": 22.5,
    "risk_discipline": 20.0,
    "activity": 11.7
  },
  "last_computed_at": "2026-04-14T00:00:00Z"
}
```

---

#### GET /api/v1/leaderboard

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `scope`: `VN` | `KR` | `GLOBAL` | `NETWORK` (required)
- `network_id`: string (required if scope = NETWORK)
- `page`: integer ≥ 1 (default: 1)
- `page_size`: integer, max 50 (default: 20)

**Response 200 OK:**
```json
{
  "scope": "VN",
  "updated_at": "2026-04-14T09:00:00Z",
  "user_rank": 142,
  "entries": [
    {
      "rank": 1,
      "user_id": "usr_01HXAAAABBBB",
      "display_name": "TopTrader",
      "trader_score": 98.5,
      "tier_name_en": "Legend",
      "avatar_url": "https://cdn.paave.app/avatars/usr_01HXAAAABBBB.jpg"
    }
  ]
}
```

---

#### GET /api/v1/gamification/challenges

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "active_challenges": [
    {
      "challenge_id": "chl_01HX2222BBBB",
      "title": "5-Day Streak",
      "description": "Place a trade every day for 5 consecutive days",
      "metric": "CONSECUTIVE_TRADE_DAYS",
      "target": 5,
      "user_progress": 3,
      "xp_reward": 100,
      "start_date": "2026-04-10",
      "end_date": "2026-04-20",
      "status": "IN_PROGRESS"
    }
  ]
}
```

---

### 5.12 AI Endpoints

#### GET /api/v1/ai/pre-trade

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `ticker`: string (required)

**Response 200 OK:**
```json
{
  "ticker": "VIC",
  "analysis": "Vingroup is currently trading near a key resistance level...",
  "disclaimer": "Đây là thông tin tham khảo, không phải lời khuyên đầu tư.",
  "language": "vi",
  "generated_at": "2026-04-14T09:30:00Z",
  "request_id": "req_01HX3333CCCC"
}
```

**Response 202 — Timeout (graceful skip):**
```json
{
  "status": "PENDING",
  "message": "Analysis is being prepared"
}
```

---

#### GET /api/v1/ai/portfolio-health/latest

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "report": "Your portfolio shows strong diversification across 5 sectors...",
  "disclaimer": "Đây là thông tin tham khảo, không phải lời khuyên đầu tư.",
  "language": "vi",
  "generated_at": "2026-04-14T08:00:00Z",
  "request_id": "req_01HX4444DDDD"
}
```

**Response 404 — No report yet:**
```json
{
  "error_code": "E-2503",
  "message": "No portfolio health report available yet. Check back next Monday."
}
```

---

#### POST /api/v1/ai/feedback

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "request_id": "req_01HX3333CCCC",
  "rating": 4
}
```

`rating` values: integer 1–5

**Response 200 OK:**
```json
{
  "message": "Feedback recorded. Thank you."
}
```

---

#### POST /api/v1/ai/query

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "query": "FPT có đang tốt không?",
  "session_id": "sess_01HX1234ABCD"
}
```

**Response 200 OK:**
```json
{
  "response": "FPT đang có xu hướng tích cực...",
  "sources": [
    {"title": "HOSE data as of 2026-04-16", "type": "market_data"}
  ],
  "disclaimer": "Đây là nội dung giáo dục, không phải tư vấn đầu tư.",
  "language": "vi",
  "session_id": "sess_01HX1234ABCD",
  "turn_number": 1
}
```

**Response 400 — Out of scope:**
```json
{
  "error_code": "E-2501",
  "message": "I can only answer questions about Vietnam (HOSE/HNX) and Korea (KOSPI/KOSDAQ) stocks right now."
}
```

**Response 503 — AI unavailable:**
```json
{
  "error_code": "E-2502",
  "message": "AI analysis temporarily unavailable. Please try again later.",
  "retry_after_seconds": 30
}
```

---

### 5.13 Social Endpoints

#### POST /api/v1/social/posts

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "body": "$VIC looking bullish after today's breakout. Holding long.",
  "sentiment": "BULL"
}
```

**Response 201 Created:**
```json
{
  "post_id": "pst_01HX5555EEEE",
  "status": "PENDING",
  "tickers": ["VIC"],
  "created_at": "2026-04-14T09:30:00Z",
  "message": "Post submitted. Will be published shortly."
}
```

**Response 400 — Validation failure:**
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Post must be 1–1,000 characters"
}
```

---

#### GET /api/v1/social/feed

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `type`: `following` | `trending` (required)
- `page`: integer ≥ 1 (default: 1)
- `page_size`: integer, max 20 (default: 20)

**Response 200 OK:**
```json
{
  "type": "following",
  "page": 1,
  "has_more": true,
  "posts": [
    {
      "post_id": "pst_01HX5555EEEE",
      "author": {
        "user_id": "usr_01HXAAAABBBB",
        "display_name": "TopTrader",
        "trader_score": 98.5,
        "tier_name_en": "Legend"
      },
      "body": "$VIC looking bullish after today's breakout.",
      "sentiment": "BULL",
      "tickers": ["VIC"],
      "trader_score_at_post": 98.5,
      "created_at": "2026-04-14T09:30:00Z"
    }
  ]
}
```

---

#### GET /api/v1/social/posts

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:** `ticker` (required), `page` (default 1), `page_size` (default 20)

**Response 200 OK:**
```json
{
  "ticker": "FPT",
  "posts": [
    {
      "post_id": "pst_01HX1234ABCD",
      "author": {
        "user_id": "usr_01HX5678EFGH",
        "pseudonym": "TraderMihn",
        "tier": 3,
        "tier_name_en": "Investor",
        "tier_name_vi": "Nhà đầu tư",
        "tier_name_kr": "투자자",
        "tier_at_post": 3
      },
      "body": "$FPT đang có momentum tốt sau khi công bố kết quả Q1. AI services revenue tăng 35% YoY.",
      "sentiment": "BULL",
      "tickers": ["FPT"],
      "created_at": "2026-04-16T10:30:00Z",
      "status": "PUBLISHED"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 45,
    "has_next": true
  }
}
```

**Response 400 — Missing ticker:**
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "ticker parameter is required"
}
```

---

#### POST /api/v1/social/follow

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "user_id": "usr_01HXAAAABBBB"
}
```

**Response 200 OK:**
```json
{
  "message": "Now following usr_01HXAAAABBBB",
  "following_id": "usr_01HXAAAABBBB"
}
```

---

#### DELETE /api/v1/social/follow/{user_id}

**Headers:** `Authorization: Bearer <access_token>`

**Response 200 OK:**
```json
{
  "message": "Unfollowed successfully"
}
```

---

### 5.14 Language Endpoint

#### PATCH /api/v1/user/locale

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "language": "ko",
  "set_by": "USER"
}
```

**Response 200 OK:**
```json
{
  "language": "ko",
  "set_by": "USER",
  "updated_at": "2026-04-14T09:30:00Z"
}
```

---

### 5.15 Compliance Endpoints

#### POST /api/v1/compliance/consent

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "consent_type": "TERMS",
  "version": "2.1"
}
```

`consent_type` values: `TERMS` | `PRIVACY` | `MARKETING`

**Response 201 Created:**
```json
{
  "consent_log_id": "con_01HX6666FFFF",
  "consent_type": "TERMS",
  "version": "2.1",
  "recorded_at": "2026-04-14T09:30:00Z"
}
```

### 5.16 Engagement Endpoints

#### GET /api/v1/engage/daily-challenge/today

**Headers:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{
  "challenge_id": "ch_20260416",
  "date": "2026-04-16",
  "question_type": "stock_direction",
  "question_text": "Hom nay FPT se: Tang / Giam / Di ngang?",
  "ticker": "FPT",
  "options": ["Tang", "Giam", "Di ngang"],
  "submission_deadline": "2026-04-16T02:05:00Z",
  "status": "open",
  "user_submitted": false
}
```

#### POST /api/v1/engage/daily-challenge/submit

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "challenge_id": "ch_20260416",
  "answer": "Tang",
  "reasoning": "FPT vua cong bo doanh thu Q1 tot"
}
```

**Response 200:**
```json
{
  "submitted": true,
  "submitted_at": "2026-04-16T01:50:00Z",
  "message": "Ket qua luc 14:30"
}
```

**Response 400 — Late submission:**
```json
{
  "error_code": "E-9001",
  "message": "Het gio gui du doan. Ban van co the xem ket qua luc 14:30."
}
```

#### GET /api/v1/engage/daily-challenge/result/{challengeId}

**Headers:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{
  "challenge_id": "ch_20260416",
  "correct_answer": "Tang",
  "actual_result": "+1.8%",
  "user_answer": "Tang",
  "is_correct": true,
  "coins_earned": 50000,
  "explanation": "FPT tang 1.8% nho ket qua kinh doanh Q1/2026 vuot ky vong...",
  "community_correct_pct": 62
}
```

#### GET /api/v1/engage/puzzle/today

**Headers:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{
  "puzzle_id": "pz_20260416",
  "hints": [
    {"level": 1, "text": "Cong ty hoat dong trong nganh ngan hang"},
    {"level": 2, "text": "Thanh lap nam 1963, tung la ngan hang ngoai thuong duy nhat", "unlock_after_seconds": 30},
    {"level": 3, "text": "Ticker bat dau bang V, von hoa lon nhat nganh", "unlock_after_seconds": 60}
  ],
  "options": ["VCB", "CTG", "BID", "TCB"]
}
```

#### POST /api/v1/engage/puzzle/submit

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "puzzle_id": "pz_20260416",
  "answer": "VCB",
  "hints_used": 1
}
```

**Response 200:**
```json
{
  "correct": true,
  "answer": "VCB",
  "company_name": "Ngan hang TMCP Ngoai thuong Viet Nam",
  "coins_earned": 30000,
  "facts": [
    "Von hoa lon nhat nganh ngan hang VN",
    "ROE trung binh >20% trong 5 nam",
    "Co dong chien luoc: Mizuho (15%)"
  ],
  "stock_page_link": "/stock/VCB"
}
```

### 5.17 Score Endpoints

#### GET /api/v1/score/ihs/current

**Headers:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{
  "user_id": "usr_01HX1234",
  "current_week": {
    "week_start": "2026-04-13",
    "discipline": 70,
    "diversification": 80,
    "learning": 100,
    "reflection": 75,
    "total": 81
  },
  "previous_week": {
    "total": 72
  },
  "trend": "up",
  "cumulative_score": 2450,
  "current_tier": 3,
  "history_12w": [45, 52, 58, 63, 67, 70, 68, 72, 75, 78, 80, 81]
}
```

### 5.18 DNA Card Endpoints

#### GET /api/v1/cards/dna/{month}

**Headers:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{
  "month": "2026-03",
  "style_label": "Growth Tracker",
  "stats": {
    "return_pct": 8.5,
    "vnindex_return_pct": 3.2,
    "trade_count": 15,
    "avg_hold_days": 12
  },
  "best_trade": {"ticker": "FPT", "return_pct": 22.3},
  "insight": "Ban co xu huong giu co phieu lau hon 75% community — day la dau hieu cua chien luoc dai han.",
  "rank_percentile": 23,
  "card_image_url": "https://cdn.paave.app/dna/usr_01HX1234_2026-03.png"
}
```

---

## 6. Error Handling Logic

### 6.1 Standard Error Response Format

All error responses follow this structure:

```json
{
  "error_code": "E-XXXX",
  "message": "Human-readable message",
  "details": {}
}
```

### 6.2 Error Code Registry

| Code | HTTP Status | Trigger | Mobile App Behavior |
|------|-------------|---------|---------------------|
| E-1001 | 409 | Email already registered (ACTIVE) | Show "An account with this email already exists" on email field |
| E-1002 | 400 | OTP expired | Show "Code expired. Please request a new code." |
| E-1003 | 429 | OTP max attempts exceeded | Show "Too many attempts. Try again in 15 minutes." |
| E-1004 | 400 | OTP incorrect | Show "Invalid code. X attempts remaining." |
| E-1005 | 429 | Login account locked | Show "Too many failed attempts. Try again in 15 minutes." |
| E-1006 | 401 | Wrong credentials | Show "Email or password is incorrect" |
| E-1007 | 403 | Account PENDING_VERIFICATION | Show "Please verify your email to continue" |
| E-1008 | 401 | Refresh token expired/invalid | Navigate to Login screen; show "Session expired. Please log in again." |
| E-1009 | 400 | Age below 13 at registration | Show "You must be at least 13 years old to register" |
| E-1010 | 429 | Parental consent resend rate limit | Show "Please wait before resending." |
| E-2001 | 422 | Watchlist limit exceeded (100 stocks) | Show "Watchlist full. Remove a stock to add another." |
| E-2002 | 409 | Stock already in watchlist | Silently accept (treat as success; no duplicate created) |
| E-2003 | 404 | Stock not in watchlist on remove | Silently accept (treat as success) |
| E-3001 | 404 | Stock code not found | Show "Stock not found" |
| E-3002 | 404 | Chart data unavailable for range | Show "Chart data not available for this period" in chart area |
| E-3003 | 503 | VN market feed DEGRADED | Show banner "Live data temporarily unavailable. Showing data as of [timestamp]." |
| E-4001 | 409 | Duplicate portfolio holding | Show "You already have a holding for [TICKER]. Edit the existing holding to update it." |
| E-5001 | 400 | Wrong current password on change | Show "Current password is incorrect" |
| E-6001 | 400 | Insufficient virtual balance | Show "Insufficient virtual balance" with required vs available |
| E-6002 | 400 | Insufficient virtual holdings | Show "Insufficient virtual shares" with current vs requested |
| E-6003 | 400 | Ticker not found in active feed | Show "Ticker not found in active feed" |
| E-6004 | — (async notification) | Limit order expired | Send push: "[TICKER] limit order expired after 30 days" |
| E-7001 | 400 | Biometric not available on device | Show "Biometric authentication is not available on this device" |
| E-7002 | 401 | Biometric session invalid | Redirect to email/password login |
| E-8001 | 400 | Goal must exceed current portfolio value | Show "Goal must exceed current portfolio value" |
| E-8002 | 400 | Post must include at least one $TICKER cashtag | Show "Post must include at least one $TICKER cashtag" |
| VALIDATION_ERROR | 400 | Any field validation failure | Show inline errors on specific fields |
| E-2501 | 400 | AI query out of scope (unsupported market/ticker) | Show scope restriction message |
| E-2502 | 503 | AI service unavailable | Show "AI analysis temporarily unavailable. Please try again later." |
| E-2503 | 404 | No AI portfolio health report yet | Show "No portfolio health report available yet." |
| E-8501 | 403 | Feature blocked by feature_tier | Show "This feature requires full access. You'll unlock it when you turn 18." |
| E-9000 | 500 | Unexpected server error | Show "Something went wrong. Please try again." with retry option |
| E-9001 | 400 | Challenge submission deadline passed | Daily challenge | Show "Het gio gui du doan." |
| E-9002 | 409 | Challenge already submitted | Daily challenge | Show "Ban da gui du doan hom nay." |
| E-9003 | 409 | Puzzle already answered | Daily puzzle | Show "Ban da tra loi cau do hom nay." |
| E-9004 | 404 | DNA card not available (insufficient trades) | Monthly DNA | Show "Chua du giao dich de tao the DNA." |
| E-9005 | 503 | Service temporarily unavailable | Show "Service temporarily unavailable. Please try again in a moment." |
| E-1011 | 401 | Social authentication failed | Show "Social authentication failed. Please try again." |
| E-1012 | 401 | 2FA partial token expired | Show "Session expired. Please log in again." Navigate to Login screen. |
| E-1013 | 400 | Account link declined | Return to login screen; no account linking performed |

### 6.3 Network Error Handling (Client-Side)

| Condition | Mobile App Behavior |
|-----------|---------------------|
| No internet connection | Show "No internet connection. Pull to refresh when connected." Cached data displayed if available. |
| Request timeout (> 10 seconds) | Show "Request timed out. Please check your connection and try again." |
| HTTP 5xx received | Show E-9000 or E-9005 message; offer retry button |
| HTTP 401 with valid refresh token | Silently refresh access token and retry original request (max 1 retry) |
| HTTP 401 with invalid/expired refresh token | Navigate to Login screen; clear local session |

### 6.4 Market Data Feed Failure Handling

```
If VN feed WebSocket disconnects:
  1. Attempt reconnect: 5s → 10s → 30s → 60s → 60s (repeat every 60s)
  2. After 3 failed reconnect attempts: Set feed_status = DEGRADED in Redis
  3. Continue serving cached data (last successful values)
  4. All API responses include "feed_status": "DEGRADED"
  5. Mobile app displays banner: "Live data temporarily unavailable. Showing data as of [HH:MM]."
  6. Banner auto-dismisses when feed_status returns to "LIVE"

If cached data is > 30 minutes old and feed still DEGRADED:
  1. Set feed_status = UNAVAILABLE
  2. API returns HTTP 200 with empty data arrays and feed_status = UNAVAILABLE
  3. Mobile app displays: "Market data unavailable. Please try again later."

Paper Trading Engine behavior during feed outage:
  1. MARKET orders: PENDING until feed resumes; fill at next available snapshot
  2. LIMIT orders: evaluation paused; orders remain PENDING
  3. All affected orders flagged with feed_degraded_at timestamp for audit
```

### 6.5 Price Alert Delivery Failure Handling

```
If push notification delivery fails (FCM/APNs rejection):
  1. Log delivery failure with notification_id, user_id, error code
  2. Alert status updated to INACTIVE regardless (alert has been triggered; do not re-trigger)
  3. Insert notification record into notification_inbox (user can see it in-app even without push)
  4. No retry for push delivery (FCM/APNs rejections indicate token invalid or user uninstalled)
```

### 6.6 AI Service Failure Handling

```
Primary (Claude API) failure:
  1. Retry with exponential backoff: 1s → 2s → 4s on HTTP 5xx responses
  2. After 3 retries: failover to GPT-4o (fallback)
  3. If GPT-4o also fails: mark job as FAILED; skip AI delivery for that event (no user notification)
  4. Log failure with request_id, type, error for monitoring

Pre-trade timeout:
  1. If response not received within 2 seconds: return HTTP 202 PENDING to mobile
  2. Mobile app shows skeleton and gracefully skips AI panel
  3. Background job continues; result cached in Redis if it arrives (for next user action on same ticker)

Post-trade / coaching / health failure:
  1. Mark background job as FAILED after all retries
  2. No retry after FAILED status
  3. Alert on-call if failure rate exceeds 5% in 5-minute window
```

### 6.7 Age Gate Failure Handling

```
If DOB decryption fails (key rotation or corruption):
  1. Log error with user_id (no PII in log)
  2. Default to LEARN_MODE access (conservative fallback — never grant FULL_ACCESS without verified DOB)
  3. Alert engineering; user support escalation path for manual resolution

Parental consent token expired:
  1. Token TTL = 24h; after expiry, token is invalid
  2. Parent receives "link expired" page; user must re-trigger from app
  3. Re-trigger rate-limited to max 3 requests per 24 hours per user
```

---

## 7. Security Requirements

### 7.1 Authentication and Session

| Requirement | Specification |
|-------------|---------------|
| Password hashing | bcrypt with cost factor 12 |
| Access token | JWT, signed with RS256 (RSA 2048-bit private key); 1-hour expiry |
| Refresh token | Opaque 256-bit random token; stored as SHA-256 hash in DB; 30-day expiry |
| Token storage on device | iOS: Keychain; Android: Keystore (Encrypted SharedPreferences) |
| HTTPS enforcement | TLS 1.2 minimum; TLS 1.3 preferred; HSTS header required |
| Certificate pinning | Public key pinning for the Paave API domain; implemented on mobile clients |

### 7.2 DOB and Age Gate Security

| Requirement | Specification |
|-------------|---------------|
| DOB encryption | AES-256-GCM; encryption key in secrets manager (never in DB or code) |
| DOB access | Server-side only for age calculation; never returned to client in raw form |
| DOB change | Blocked after verification; any attempt logged in `age_audit_log`; requires support escalation |
| Age calculation | Always server-side; client receives only feature_tier enum and optional age band string |
| Parental consent token | 256-bit random token; SHA-256 hash stored in DB; plaintext sent to parent email only; TTL = 24h |

### 7.3 Input Sanitization

- All string inputs must be sanitized server-side to prevent SQL injection (parameterized queries mandatory) and XSS (HTML encoding for any user-generated content displayed in UI).
- Search queries must be sanitized before being used in any database LIKE clause.
- Social post body sanitized: HTML stripped, null bytes rejected before storage.
- All file uploads (bug report screenshots) must be validated for MIME type and scanned for malware before storage.

### 7.4 Rate Limiting

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| POST /auth/register | 5 requests per IP | 1 hour |
| POST /auth/login | 5 requests per email | 15 minutes |
| POST /auth/verify-otp | 5 attempts per user | 15 minutes |
| POST /auth/resend-otp | 1 request per user | 60 seconds |
| POST /auth/resend-parental-consent | 3 requests per user | 24 hours |
| GET /market/* | 120 requests per user | 1 minute |
| POST /paper-trading/orders | 20 orders per user | 1 day (enforced also by OVERTRADE behavioral rule) |
| POST /social/posts | 10 posts per user | 1 hour |
| GET /ai/pre-trade | 30 requests per user | 1 hour |
| POST /compliance/consent | 20 requests per user | 1 hour |
| All other authenticated endpoints | 300 requests per user | 1 minute |

### 7.5 Data Privacy

- No personally identifiable information (PII) logged in application logs. Logs may contain user_id (opaque identifier) but not email, name, nationality, or DOB.
- User data deletion: personal data anonymized within 30 days of confirmed deletion request.
- Data localization: Vietnam user data stored in servers compliant with Decree 13/2023/ND-CP.
- Consent log: immutable; append-only; retained indefinitely per legal requirement.
- AI prompts: prompt content not persisted beyond delivery; only prompt_hash and response_hash stored in `ai_requests` for audit.

---

## 8. Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API response time (p95) | ≤ 3,000ms for all endpoints | Server-side APM |
| API response time (p50) | ≤ 500ms for all endpoints | Server-side APM |
| VN market data latency (exchange tick → Redis) | ≤ 15 seconds | Server-side monitoring |
| KR market data latency (KRX tick → Redis) | Best-effort; no SLA in V1. KR data sourced from web search / model knowledge per BRD. | Server-side monitoring |
| Price alert trigger latency (threshold crossed → push sent) | ≤ 60 seconds | Alert event monitoring |
| Paper trading MARKET order fill (order placed → fill) | ≤ 15 seconds (next price snapshot) | Order lifecycle monitoring |
| Pre-trade AI response latency | ≤ 2,000ms; graceful skip on timeout | AI service APM |
| Post-trade AI job (end-to-end, non-blocking) | ≤ 30 seconds background | Job queue monitoring |
| Leaderboard refresh | Every 60 minutes via materialized view | Cron job monitoring |
| Social proof counters cache update | Every 5 minutes | Background job monitoring |
| RAG index refresh (Pinecone) | Every 6 hours | Indexing job monitoring |
| AI pre-trade Redis cache TTL | 5 minutes per ticker per language | Redis TTL config |
| Home screen initial load time | ≤ 2 seconds on 4G connection | Mobile performance testing |
| Discover feed initial load (10 cards) | ≤ 3 seconds on 4G connection | Mobile performance testing |
| App crash rate | ≤ 0.5% of sessions | Crashlytics |
| API availability | ≥ 99.5% uptime | Uptime monitoring |
| Maximum concurrent users (V1 target) | 10,000 concurrent | Load testing before launch |
| Social proof counter poll interval | 30 seconds (client-side polling) | Implemented in mobile app |
| Portfolio health cron job execution | Every Monday 08:00 local time per user | Distributed scheduler monitoring |

---

## 9. Data Models

### 9.1 `users` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | VARCHAR(26) | PK | ULID format |
| full_name | VARCHAR(100) | NOT NULL | |
| email | VARCHAR(254) | NOT NULL, UNIQUE | Lowercase stored |
| password_hash | VARCHAR(72) | NOT NULL | bcrypt output |
| nationality | VARCHAR(5) | NOT NULL | `VN`, `KR`, `OTHER` |
| market_preference | VARCHAR(10) | NOT NULL | `VN`, `KR`, `GLOBAL` |
| dob_encrypted | BYTEA | NOT NULL | AES-256-GCM encrypted; never plaintext |
| feature_tier | VARCHAR(20) | NOT NULL | `PENDING_CONSENT`, `LEARN_MODE`, `FULL_ACCESS` |
| status | VARCHAR(30) | NOT NULL | `PENDING_VERIFICATION`, `ACTIVE`, `LOCKED`, `DELETED` |
| notifications_enabled | BOOLEAN | NOT NULL, DEFAULT true | Overall notification switch |
| cumulative_trader_score | INTEGER | NOT NULL, DEFAULT 0 | Cumulative trader score across all weeks |
| current_tier | INTEGER | NOT NULL, DEFAULT 1 | Current gamification tier (1-6); tiers never decrease |
| two_factor_enabled | BOOLEAN | NOT NULL, DEFAULT false | Whether 2FA is enabled for this user |
| two_factor_enabled_at | TIMESTAMPTZ | NULLABLE | Timestamp when 2FA was last enabled; null if never enabled |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.2 `user_sessions` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| session_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| refresh_token_hash | VARCHAR(64) | NOT NULL | SHA-256 of token |
| device_platform | VARCHAR(10) | | `ios`, `android` |
| push_token | TEXT | NULLABLE | FCM or APNs token |
| expires_at | TIMESTAMPTZ | NOT NULL | created_at + 30 days |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.3 `user_watchlist` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| watchlist_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| stock_code | VARCHAR(20) | NOT NULL | |
| market | VARCHAR(10) | NOT NULL | `VN`, `KR`, `GLOBAL` |
| added_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| UNIQUE(user_id, stock_code) | | | Prevents duplicates |

### 9.4 `user_holdings` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| holding_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| stock_code | VARCHAR(20) | NOT NULL | |
| market | VARCHAR(10) | NOT NULL | |
| shares | DECIMAL(18, 4) | NOT NULL, > 0 | |
| avg_buy_price | DECIMAL(18, 2) | NOT NULL, > 0 | In stock's native currency |
| purchase_date | DATE | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| UNIQUE(user_id, stock_code) | | | One holding per ticker per user |

### 9.5 `holding_transactions` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| transaction_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| holding_id | VARCHAR(26) | FK → user_holdings, NULLABLE | Null if holding was deleted |
| stock_code | VARCHAR(20) | NOT NULL | |
| action | VARCHAR(20) | NOT NULL | `ADDED`, `UPDATED`, `REMOVED` |
| shares | DECIMAL(18, 4) | NOT NULL | Value at time of action |
| price | DECIMAL(18, 2) | NOT NULL | Value at time of action |
| action_date | DATE | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.6 `price_alerts` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| alert_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| stock_code | VARCHAR(20) | NOT NULL | |
| market | VARCHAR(10) | NOT NULL | |
| condition | VARCHAR(10) | NOT NULL | `above`, `below` |
| target_price | DECIMAL(18, 2) | NOT NULL, > 0 | |
| status | VARCHAR(20) | NOT NULL | `ACTIVE`, `INACTIVE`, `CANCELLED` |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| triggered_at | TIMESTAMPTZ | NULLABLE | Set when alert fires |
| UNIQUE(user_id, stock_code) | | | One alert per stock per user |

### 9.7 `notification_inbox` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| notification_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| type | VARCHAR(30) | NOT NULL | `PRICE_ALERT`, `MARKET_OPEN`, `MARKET_CLOSE`, `WATCHLIST_MOVEMENT`, `AI_ANALYSIS`, `COACHING`, `PORTFOLIO_HEALTH`, `CHALLENGE_COMPLETE`, `TIER_UPGRADE`, `AGE_UPGRADE` |
| title | VARCHAR(255) | NOT NULL | |
| body | TEXT | NOT NULL | |
| read | BOOLEAN | NOT NULL, DEFAULT false | |
| deep_link | VARCHAR(255) | NULLABLE | In-app route (e.g., `/stocks/VIC`) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| expires_at | TIMESTAMPTZ | NOT NULL | created_at + 30 days (auto-purge) |

### 9.8 `notification_preferences` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | VARCHAR(26) | PK, FK → users | One row per user |
| price_alerts | BOOLEAN | NOT NULL, DEFAULT true | |
| market_open | BOOLEAN | NOT NULL, DEFAULT true | |
| market_close | BOOLEAN | NOT NULL, DEFAULT true | |
| watchlist_movements | BOOLEAN | NOT NULL, DEFAULT true | |
| ai_analysis | BOOLEAN | NOT NULL, DEFAULT true | |
| coaching | BOOLEAN | NOT NULL, DEFAULT true | |
| portfolio_health | BOOLEAN | NOT NULL, DEFAULT true | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.9 `parent_consent` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| consent_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users, UNIQUE | One record per user |
| parent_email | VARCHAR(254) | NOT NULL | |
| token_hash | VARCHAR(64) | NOT NULL | SHA-256 of token; sent plaintext in email |
| verified_at | TIMESTAMPTZ | NULLABLE | Set when parent clicks confirmation link |
| expires_at | TIMESTAMPTZ | NOT NULL | created_at + 24 hours |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.10 `user_feature_flags` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | VARCHAR(26) | PK, FK → users | One row per user |
| feature_tier | VARCHAR(20) | NOT NULL | `PENDING_CONSENT`, `LEARN_MODE`, `FULL_ACCESS` |
| tier_set_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| tier_set_reason | VARCHAR(50) | NOT NULL | `REGISTRATION`, `PARENTAL_CONSENT`, `AGE_UPGRADE`, `SUPPORT_OVERRIDE` |

### 9.11 `age_audit_log` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| log_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| event_type | VARCHAR(50) | NOT NULL | `DOB_SET`, `DOB_CHANGE_ATTEMPT`, `AGE_CALCULATED`, `TIER_CHANGED` |
| old_tier | VARCHAR(20) | NULLABLE | |
| new_tier | VARCHAR(20) | NULLABLE | |
| ip_address | VARCHAR(45) | NULLABLE | IPv4 or IPv6 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.12 `virtual_balances` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | VARCHAR(26) | PK, FK → users | One row per user |
| balance_vnd | DECIMAL(18, 2) | NOT NULL, DEFAULT 500000000.00 | Starting balance: 500,000,000 VND |
| reserved_cash | DECIMAL(18, 2) | NOT NULL, DEFAULT 0.00 | Cash reserved for pending limit buy orders |
| available_cash | — | Computed: balance_vnd - reserved_cash | Not a physical column; computed in queries or as a generated column |
| last_reset_at | TIMESTAMPTZ | NULLABLE | Null if never reset |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.13 `virtual_portfolio` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| position_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| ticker | VARCHAR(20) | NOT NULL | |
| exchange | VARCHAR(10) | NOT NULL | `HOSE`, `HNX`, `KRX` |
| quantity | INTEGER | NOT NULL, > 0 | |
| avg_buy_price | DECIMAL(18, 4) | NOT NULL, > 0 | |
| realized_pnl | DECIMAL(18, 2) | NOT NULL, DEFAULT 0 | Cumulative realized P&L for this position |
| reset_at | TIMESTAMPTZ | NULLABLE | Set on portfolio reset; soft-delete marker |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| UNIQUE(user_id, ticker) WHERE reset_at IS NULL | | | One active position per ticker per user |

### 9.14 `virtual_orders` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| order_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| ticker | VARCHAR(20) | NOT NULL | |
| exchange | VARCHAR(10) | NOT NULL | `HOSE`, `HNX`, `KRX` |
| order_type | VARCHAR(10) | NOT NULL | `MARKET`, `LIMIT` |
| side | VARCHAR(4) | NOT NULL | `BUY`, `SELL` |
| quantity | INTEGER | NOT NULL, > 0 | |
| limit_price | DECIMAL(18, 4) | NULLABLE | Required for LIMIT orders |
| status | VARCHAR(15) | NOT NULL | `PENDING`, `FILLED`, `CANCELLED`, `EXPIRED` |
| fill_price | DECIMAL(18, 4) | NULLABLE | Set on FILLED |
| fill_timestamp | TIMESTAMPTZ | NULLABLE | Set on FILLED |
| reasoning | VARCHAR(200) | NULLABLE | User-provided reasoning for the trade |
| pre_reset | BOOLEAN | NOT NULL, DEFAULT false | True if placed before last portfolio reset |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.15 `xp_events` Table (Reference/Config)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| event_type | VARCHAR(50) | PK | e.g., `TRADE_PLACED`, `LESSON_COMPLETED`, `DAILY_LOGIN`, `CHALLENGE_WON` |
| xp_amount | INTEGER | NOT NULL, > 0 | |
| description | VARCHAR(255) | NOT NULL | Human-readable description |
| active | BOOLEAN | NOT NULL, DEFAULT true | |

### 9.16 `user_xp_log` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| log_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| event_type | VARCHAR(50) | FK → xp_events | |
| xp_awarded | INTEGER | NOT NULL | |
| reference_id | VARCHAR(26) | NULLABLE | Optional reference to triggering entity (order_id, etc.) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.17 `trader_scores` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| score_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| trader_score | DECIMAL(6, 2) | NOT NULL | 0.00–100.00 |
| return_component | DECIMAL(6, 2) | NOT NULL | |
| consistency_component | DECIMAL(6, 2) | NOT NULL | |
| risk_discipline_component | DECIMAL(6, 2) | NOT NULL | |
| activity_component | DECIMAL(6, 2) | NOT NULL | |
| computed_at | TIMESTAMPTZ | NOT NULL | |

### 9.18 `tier_thresholds` Table (Reference/Config)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| tier_id | INTEGER | PK | |
| min_score | DECIMAL(6, 2) | NOT NULL | |
| max_score | DECIMAL(6, 2) | NOT NULL | |
| name_vn | VARCHAR(100) | NOT NULL | |
| name_kr | VARCHAR(100) | NOT NULL | |
| name_en | VARCHAR(100) | NOT NULL | |

### 9.19 `challenges` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| challenge_id | VARCHAR(26) | PK | ULID |
| title | VARCHAR(255) | NOT NULL | |
| description | TEXT | NOT NULL | |
| metric | VARCHAR(50) | NOT NULL | e.g., `CONSECUTIVE_TRADE_DAYS`, `TOTAL_TRADES`, `LESSON_COUNT` |
| target | INTEGER | NOT NULL | |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NOT NULL | |
| xp_reward | INTEGER | NOT NULL | |
| active | BOOLEAN | NOT NULL, DEFAULT true | |

### 9.20 `user_challenge_progress` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| progress_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| challenge_id | VARCHAR(26) | FK → challenges | |
| current_value | INTEGER | NOT NULL, DEFAULT 0 | |
| status | VARCHAR(20) | NOT NULL | `IN_PROGRESS`, `COMPLETED` |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| UNIQUE(user_id, challenge_id) | | | One progress record per challenge per user |

### 9.21 `ai_requests` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| request_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| type | VARCHAR(20) | NOT NULL | `POST_TRADE`, `PRE_TRADE`, `QUERY`, `HEALTH_CHECK`, `COACHING`, `SENTIMENT` |
| prompt_hash | VARCHAR(64) | NOT NULL | SHA-256 of prompt (no raw prompt stored) |
| response_hash | VARCHAR(64) | NULLABLE | SHA-256 of response; null if failed |
| language | VARCHAR(5) | NOT NULL | `vi`, `ko`, `en` |
| status | VARCHAR(15) | NOT NULL | `PENDING`, `COMPLETED`, `FAILED` |
| rating | SMALLINT | NULLABLE | 1–5 user rating |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.22 `social_posts` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| post_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| body | VARCHAR(1000) | NOT NULL | |
| sentiment | VARCHAR(10) | NOT NULL | `BULL`, `BEAR`, `NEUTRAL` |
| tickers | VARCHAR(20)[] | NOT NULL, DEFAULT '{}' | Extracted $cashtag tickers |
| trader_score_at_post | DECIMAL(6, 2) | NOT NULL | Snapshot of author's score at post time |
| status | VARCHAR(20) | NOT NULL | `PENDING`, `PUBLISHED`, `HELD_FOR_REVIEW`, `REMOVED` |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.23 `social_follows` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| follow_id | VARCHAR(26) | PK | ULID |
| follower_id | VARCHAR(26) | FK → users | |
| following_id | VARCHAR(26) | FK → users | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| UNIQUE(follower_id, following_id) | | | |
| INDEX(follower_id) | | | Fast lookup of who a user follows |
| INDEX(following_id) | | | Fast lookup of a user's followers |

### 9.24 `user_locale` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | VARCHAR(26) | PK, FK → users | One row per user |
| language | VARCHAR(5) | NOT NULL | `vi`, `ko`, `en` |
| set_by | VARCHAR(10) | NOT NULL | `DEVICE`, `USER`; USER takes priority |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.25 `consent_log` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| consent_log_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| consent_type | VARCHAR(20) | NOT NULL | `TERMS`, `PRIVACY`, `MARKETING` |
| version | VARCHAR(20) | NOT NULL | e.g., `2.1` |
| ip_address | VARCHAR(45) | NOT NULL | IPv4 or IPv6 at time of consent |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Immutable — INSERT only, no UPDATE |

### 9.26 `deletion_requests` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| deletion_request_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users, UNIQUE | One active request per user |
| status | VARCHAR(20) | NOT NULL | `PENDING`, `CANCELLED`, `COMPLETED` |
| requested_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| scheduled_deletion_at | TIMESTAMPTZ | NOT NULL | requested_at + 30 days |
| completed_at | TIMESTAMPTZ | NULLABLE | Set when anonymization completes |

### 9.27 `social_identities` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| social_type | VARCHAR(10) | NOT NULL | `google`, `apple` |
| social_id | VARCHAR(255) | NOT NULL | Provider's unique user ID |
| social_email | VARCHAR(254) | NOT NULL | Email from social provider |
| linked_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| UNIQUE(social_type, social_id) | | | One identity per provider per user |

### 9.28 `daily_challenges` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| challenge_id | VARCHAR | PK | Format: ch_YYYYMMDD |
| date | DATE | UNIQUE | One per trading day |
| question_type | ENUM('stock_direction','index_direction','top_performer') | NOT NULL | |
| question_text | TEXT | NOT NULL | Vietnamese |
| ticker | VARCHAR(10) | NULLABLE | NULL for index questions |
| options | JSONB | NOT NULL | Array of answer options |
| correct_answer | VARCHAR(50) | NULLABLE | Populated at 14:35 |
| explanation | TEXT | NULLABLE | 100-150 word educational text |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.29 `challenge_responses` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| response_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| challenge_id | VARCHAR | FK → daily_challenges | |
| answer | VARCHAR(50) | NOT NULL | |
| reasoning | VARCHAR(100) | NULLABLE | |
| is_correct | BOOLEAN | NULLABLE | Populated at evaluation |
| coins_earned | INTEGER | NOT NULL, DEFAULT 0 | |
| submitted_at | TIMESTAMPTZ | NOT NULL | Must be before deadline |
| UNIQUE(user_id, challenge_id) | | | One answer per user per day |

### 9.30 `ihs_scores` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| score_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| week_start | DATE | NOT NULL | Monday of the scored week |
| discipline | DECIMAL(5,2) | NOT NULL | 0-100 |
| diversification | DECIMAL(5,2) | NOT NULL | 0-100 |
| learning | DECIMAL(5,2) | NOT NULL | 0-100 |
| reflection | DECIMAL(5,2) | NOT NULL | 0-100 |
| total | DECIMAL(5,2) | NOT NULL | Average of 4 dimensions |
| computed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| UNIQUE(user_id, week_start) | | | |

### 9.31 `daily_puzzles` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| puzzle_id | VARCHAR | PK | Format: pz_YYYYMMDD |
| date | DATE | UNIQUE | |
| ticker | VARCHAR(10) | NOT NULL | Correct answer |
| hints | JSONB | NOT NULL | Array of {level, text} |
| options | JSONB | NOT NULL | 4-option array |
| facts | JSONB | NOT NULL | 3 company facts |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 9.32 `puzzle_responses` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| response_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| puzzle_id | VARCHAR | FK → daily_puzzles | |
| answer | VARCHAR(10) | NOT NULL | |
| hints_used | INTEGER | NOT NULL | 1, 2, or 3 |
| is_correct | BOOLEAN | NOT NULL | |
| coins_earned | INTEGER | NOT NULL | |
| answered_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| UNIQUE(user_id, puzzle_id) | | | |

### 9.33 `trade_reflections` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| reflection_id | VARCHAR(26) | PK | ULID |
| user_id | VARCHAR(26) | FK → users | |
| position_id | VARCHAR(26) | FK → virtual_portfolio | Closed position |
| ticker | VARCHAR(10) | NOT NULL | |
| pnl_pct | DECIMAL(10,4) | NOT NULL | |
| expectation_met | ENUM('yes','no','unsure') | NOT NULL | Q1 answer |
| learning_text | VARCHAR(300) | NULLABLE | Q2 answer |
| ihs_points_earned | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

---

*Document end — v3.0. Full traceability: BRD Business Objectives → FRD Functional Requirements → SRD System Flows and API Contracts.*
