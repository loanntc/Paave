# SRD — System Requirement Document
## Paave — Gen Z Fintech Investing App (V1)

**Document version:** 1.0
**Date:** 2026-04-14
**Author:** Business Analysis Team
**Status:** Approved for Development
**Linked FRD:** FRD.md v1.0
**Linked BRD:** BRD.md v1.0

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
| Mobile App | React Native (iOS 15+ / Android 10+) | User interface, local caching, push notification handling |
| API Gateway | REST over HTTPS | Single entry point for all mobile-to-backend communication |
| Auth Service | JWT + Refresh Token | Authentication, session management, OTP generation |
| User Service | | User profile, market preferences, watchlist management |
| Market Data Service | | VN real-time feed aggregation, KR/Global web search proxy |
| Portfolio Service | | Holdings CRUD, P&L calculation |
| Notification Service | FCM + APNs | Push notification delivery, alert evaluation |
| Editorial CMS | Headless CMS | Stock card content, theme tags |
| Database | PostgreSQL | Persistent user, portfolio, watchlist, alert data |
| Cache | Redis | Market data cache, session cache, rate-limit counters |
| Data Feed Connector | HoSE/HNX WebSocket/API | VN real-time price ingestion |
| Push Provider | Firebase Cloud Messaging + Apple Push Notification Service | Push delivery |

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
1. Mobile app: User submits registration form (name, email, password, nationality)
2. API Gateway: Receives POST /api/v1/auth/register
3. Auth Service:
   a. Validates all fields against validation rules (Section 4.1)
   b. Checks if email already exists in database
      - If exists with status ACTIVE → return error E-1001
      - If exists with status PENDING_VERIFICATION → resend OTP, return success
   c. Hashes password using bcrypt (cost factor 12)
   d. Creates user record in DB with status = PENDING_VERIFICATION
   e. Generates 6-digit numeric OTP; stores OTP hash + expiry (now + 10 minutes) in Redis with key `otp:{userId}`
   f. Sends OTP email via email service (async, non-blocking)
4. API Gateway: Returns HTTP 201 with user ID
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
4. API Gateway: Returns HTTP 200 with access_token and refresh_token
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
        iii. Generate access_token (1-hour expiry) and refresh_token (30-day expiry)
        iv. Store refresh token hash in `user_sessions` with device_id and created_at
4. API Gateway: Returns HTTP 200 with access_token and refresh_token
5. Mobile app: Stores tokens; navigates to Home
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
   b. Write to Redis hash `market:vn:prices` with key = stock_code, value = {price, change, volume, timestamp}
   c. Update Redis sorted set `market:vn:gainers` (scored by daily_change_pct, top 5 maintained)
   d. Update Redis sorted set `market:vn:losers` (scored by daily_change_pct ascending, top 5 maintained)
   e. Update Redis sorted set `market:vn:volume` (scored by today_volume, top 5 maintained)
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

---

## 3. Data Handling Rules

### 3.1 Storage Rules

| Data Type | Storage Location | Retention | Notes |
|-----------|-----------------|-----------|-------|
| User accounts | PostgreSQL | Indefinite | Soft-delete only (status = DELETED) |
| User sessions (refresh tokens) | PostgreSQL | 30 days from creation | Auto-purge expired sessions nightly |
| OTPs | Redis | 10 minutes | Auto-expires via Redis TTL |
| Login attempt counters | Redis | 15 minutes | Auto-expires via Redis TTL |
| VN real-time price data | Redis | Current trading day | Reset at market open; end-of-day persisted to PostgreSQL |
| Historical price data | PostgreSQL | 5 years | End-of-day closing prices |
| User watchlist | PostgreSQL | Until user deletes | |
| Portfolio holdings | PostgreSQL | Until user deletes | |
| Price alerts | PostgreSQL | 90 days after INACTIVE | Auto-purged after 90 days |
| Notification inbox | PostgreSQL | 30 days | Auto-deleted after 30 days per FR-47 |
| Editorial CMS content | CMS (external) + Redis cache | Cache: 5 minutes | Source of truth is CMS |
| Social proof counters | Redis | Reset daily at market open | Daily totals persisted to PostgreSQL |
| Push tokens | PostgreSQL | Until user logs out or token expires | Updated on each app launch |

### 3.2 Data Encoding and Format Rules

- All text data stored and transmitted as UTF-8.
- All prices stored as `DECIMAL(18, 4)` in PostgreSQL to avoid floating-point precision errors.
- All percentages stored as `DECIMAL(10, 4)` (e.g., `5.2500` = 5.25%).
- All timestamps stored as UTC in PostgreSQL (`TIMESTAMPTZ`).
- Timestamps returned to the mobile app as ISO 8601 UTC strings.
- Mobile app converts UTC timestamps to user's local timezone for display.

### 3.3 Currency Display Rules

| User's Market Preference | Display Currency | Format |
|--------------------------|-----------------|--------|
| Vietnam | VND | `50,000,000 ₫` (period as thousand separator, no decimals for VND) |
| Korea | KRW | `₩50,000,000` (comma as thousand separator) |
| Global | USD | `$1,234.56` (comma as thousand separator, 2 decimal places) |

### 3.4 Personal Data Rules

- Passwords: Stored as bcrypt hash (cost factor 12). Plaintext password never logged or stored.
- Email: Stored in plaintext; partially masked in UI display only (`lo***@gmail.com`: first 2 chars visible + `***` + `@domain`).
- Push tokens: Stored per-device, per-user. Deleted when user logs out from that device.
- User data subject to Vietnam Cybersecurity Law (Decree 13/2023/ND-CP) and Korea PIPA. No user data transmitted to servers outside permitted jurisdictions without compliance review.
- All API logs must redact passwords, OTP values, and full email addresses before writing to log storage.

---

## 4. Validation Rules

### 4.1 Registration Field Validation

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| full_name | string | Required; 2–100 characters; only Unicode letters, spaces, hyphens, and apostrophes | "Name must be 2–100 characters and contain only letters" |
| email | string | Required; valid RFC 5322 email format; max 254 characters; unique in DB | "Please enter a valid email address" / "An account with this email already exists" |
| password | string | Required; 8–64 characters; must include ≥1 uppercase letter [A-Z], ≥1 lowercase letter [a-z], ≥1 digit [0-9], ≥1 special character [!@#$%^&*] | "Password must be 8–64 characters and include uppercase, lowercase, number, and special character" |
| nationality | enum | Required; one of: `VN`, `KR`, `OTHER` | "Please select a valid nationality" |

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
  "nationality": "VN"
}
```

**Response 201 Created:**
```json
{
  "user_id": "usr_01HX1234ABCD",
  "status": "PENDING_VERIFICATION",
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
  "user": {
    "user_id": "usr_01HX1234ABCD",
    "full_name": "Nguyen Van A",
    "email": "us***@example.com",
    "market_preference": "VN"
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
  "user": {
    "user_id": "usr_01HX1234ABCD",
    "full_name": "Nguyen Van A",
    "email": "us***@example.com",
    "market_preference": "VN"
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

**Response 200 OK — Empty result:**
```json
{
  "market": "VN",
  "theme": "ai",
  "page": 1,
  "page_size": 10,
  "total_cards": 0,
  "has_more": false,
  "cards": []
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

`type` values: `PRICE_ALERT` | `MARKET_OPEN` | `MARKET_CLOSE` | `WATCHLIST_MOVEMENT`

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
  "watchlist_movements": false
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
  "watchlist_movements": true
}
```

**Response 200 OK:**
```json
{
  "price_alerts": true,
  "market_open": false,
  "market_close": false,
  "watchlist_movements": true,
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
  "notifications_enabled": true,
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
| E-2001 | 422 | Watchlist limit exceeded (100 stocks) | Show "Watchlist full. Remove a stock to add another." |
| E-2002 | 409 | Stock already in watchlist | Silently accept (treat as success; no duplicate created) |
| E-2003 | 404 | Stock not in watchlist on remove | Silently accept (treat as success) |
| E-3001 | 404 | Stock code not found | Show "Stock not found" |
| E-3002 | 404 | Chart data unavailable for range | Show "Chart data not available for this period" in chart area |
| E-3003 | 503 | VN market feed DEGRADED | Show banner "Live data temporarily unavailable. Showing data as of [timestamp]." |
| E-4001 | 409 | Duplicate portfolio holding | Show "You already have a holding for [TICKER]. Edit the existing holding to update it." |
| E-5001 | 400 | Wrong current password on change | Show "Current password is incorrect" |
| VALIDATION_ERROR | 400 | Any field validation failure | Show inline errors on specific fields |
| E-9000 | 500 | Unexpected server error | Show "Something went wrong. Please try again." with retry option |
| E-9001 | 503 | Service temporarily unavailable | Show "Service temporarily unavailable. Please try again in a moment." |

### 6.3 Network Error Handling (Client-Side)

| Condition | Mobile App Behavior |
|-----------|---------------------|
| No internet connection | Show "No internet connection. Pull to refresh when connected." Cached data displayed if available. |
| Request timeout (> 10 seconds) | Show "Request timed out. Please check your connection and try again." |
| HTTP 5xx received | Show E-9000 or E-9001 message; offer retry button |
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
```

### 6.5 Price Alert Delivery Failure Handling

```
If push notification delivery fails (FCM/APNs rejection):
  1. Log delivery failure with notification_id, user_id, error code
  2. Alert status updated to INACTIVE regardless (alert has been triggered; do not re-trigger)
  3. Insert notification record into notification_inbox (user can see it in-app even without push)
  4. No retry for push delivery (FCM/APNs rejections indicate token invalid or user uninstalled)
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

### 7.2 Input Sanitization

- All string inputs must be sanitized server-side to prevent SQL injection (parameterized queries mandatory) and XSS (HTML encoding for any user-generated content displayed in UI).
- Search queries must be sanitized before being used in any database LIKE clause.
- All file uploads (bug report screenshots) must be validated for MIME type and scanned for malware before storage.

### 7.3 Rate Limiting

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| POST /auth/register | 5 requests per IP | 1 hour |
| POST /auth/login | 5 requests per email | 15 minutes |
| POST /auth/verify-otp | 5 attempts per user | 15 minutes |
| POST /auth/resend-otp | 1 request per user | 60 seconds |
| GET /market/* | 120 requests per user | 1 minute |
| All other authenticated endpoints | 300 requests per user | 1 minute |

### 7.4 Data Privacy

- No personally identifiable information (PII) logged in application logs. Logs may contain user_id (opaque identifier) but not email, name, or nationality.
- User data deletion: When a user requests account deletion (not in V1 UI but must be supported via support channel), all PII fields are overwritten within 30 days per GDPR-equivalent requirements.
- Data localization: Vietnam user data stored in servers compliant with Decree 13/2023/ND-CP (data stored on Vietnam-territory or approved infrastructure).

---

## 8. Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API response time (p95) | ≤ 3,000ms for all endpoints | Server-side APM |
| API response time (p50) | ≤ 500ms for all endpoints | Server-side APM |
| VN market data latency (exchange tick → API response) | ≤ 15 seconds | Server-side monitoring |
| Price alert trigger latency (threshold crossed → push sent) | ≤ 60 seconds | Alert event monitoring |
| Home screen initial load time | ≤ 2 seconds on 4G connection | Mobile performance testing |
| Discover feed initial load (10 cards) | ≤ 3 seconds on 4G connection | Mobile performance testing |
| App crash rate | ≤ 0.5% of sessions | Crashlytics |
| API availability | ≥ 99.5% uptime | Uptime monitoring |
| Maximum concurrent users (V1 target) | 10,000 concurrent | Load testing before launch |
| Social proof counter poll interval | 30 seconds (client-side polling) | Implemented in mobile app |

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
| status | VARCHAR(30) | NOT NULL | `PENDING_VERIFICATION`, `ACTIVE`, `LOCKED`, `DELETED` |
| notifications_enabled | BOOLEAN | NOT NULL, DEFAULT true | Overall notification switch |
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
| type | VARCHAR(30) | NOT NULL | `PRICE_ALERT`, `MARKET_OPEN`, `MARKET_CLOSE`, `WATCHLIST_MOVEMENT` |
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
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

---

*Document end. Full traceability: BRD Business Objectives → FRD Functional Requirements → SRD System Flows and API Contracts.*
