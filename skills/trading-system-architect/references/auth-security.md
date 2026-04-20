# Authentication & Security Reference

> These rules are MANDATORY and non-negotiable. Every auth-related design, API, schema,
> and code must strictly comply. Never simplify or skip any step without explicit user approval.

---

## 1. Authentication Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Web/Mobile)                  │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY                            │
│  - JWT validation on every request                       │
│  - Rate limiting per user/IP                             │
│  - Device fingerprint check                              │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                 AUTH SERVICE                             │
│  - SSO orchestration (OAuth2 / OIDC)                     │
│  - MFA verification                                      │
│  - Session & token management                            │
│  - Lockout enforcement                                   │
│  - Step-up auth gate                                     │
│  - Device registry                                       │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
 PostgreSQL         Redis
 (persistent)       (active sessions,
                     lockout counters,
                     refresh token store)
```

---

## 2. Supported Login Methods

### 2.1 Social / Platform SSO (OAuth2 + OIDC)

| Provider | Protocol | Status | Notes |
|---|---|---|---|
| Google | OAuth2 / OIDC | Active | Use `openid email profile` scopes |
| Apple ID | Sign in with Apple (OIDC) | Active | Requires private email relay handling |
| Meta (Facebook) | OAuth2 | Active | Use `email public_profile` permissions |
| Kakao | Kakao Login (OAuth2) | Active | Use Kakao SDK; returns `kakao_account.email` |
| VneID | OAuth2 / eKYC | Prepared (legal pending) | Design integration point; do NOT auto-use identity data until legal cleared |
| Banking App | Open Banking OAuth2 | Prepared (not decided) | Design integration point only |

**Implementation rules:**
- All OAuth2 flows must use **PKCE** (Proof Key for Code Exchange) — no implicit flow ever
- `state` parameter is mandatory on every OAuth2 initiation to prevent CSRF
- `nonce` parameter mandatory for OIDC flows
- Store provider's `sub` (subject ID) in `user_social_accounts` table — never rely solely on email as identifier (emails can change)
- On first SSO login: create account + link provider. On subsequent: match by `provider + sub`, NOT by email alone
- If email from provider is unverified → reject login, show error `AUTH_EMAIL_UNVERIFIED`

### 2.2 Email / Password (Local Auth)
- Password hashing: **bcrypt** with cost factor ≥ 12 (or **Argon2id** — preferred)
- Minimum password: 8 chars, 1 uppercase, 1 number, 1 special char
- Password history: reject last 5 passwords on reset
- Never store plaintext or reversible-encrypted passwords

---

## 3. Multi-Factor Authentication (MFA)

MFA is **mandatory for all users** on all account types. Users select their preferred method during onboarding. At least one method must be enrolled before the account is active.

### 3.1 Supported MFA Methods

| Method | Provider | Notes |
|---|---|---|
| TOTP | Google Authenticator, Kakao, Apple Passwords | RFC 6238, 30-second window, allow ±1 step drift |
| WhatsApp OTP | WhatsApp Business API | 6-digit OTP, 5-minute TTL |
| Email OTP | Internal (SMTP/SendGrid) | 6-digit OTP, 5-minute TTL |
| Face ID | Device biometric (iOS/Android native) | Server receives signed assertion — never raw biometric data |

**Rules:**
- TOTP backup codes: generate 8 single-use codes on enrollment; store hashed
- OTP (WhatsApp/Email): max 3 attempts per OTP before it invalidates; new OTP required
- OTP rate limit: max 5 OTP requests per 10 minutes per account
- Face ID: verify using platform's WebAuthn/FIDO2 assertion on server — never trust client-only biometric
- Users can enroll multiple MFA methods; any one valid method passes

### 3.2 MFA Enrollment Flow
```
1. User completes primary auth (SSO or password)
2. Auth service issues short-lived enrollment token (10 min TTL)
3. User sets up MFA method
4. Server verifies MFA setup is working (user must complete one test verification)
5. Backup codes generated and shown ONCE — user must acknowledge
6. Enrollment token exchanged for full access token + refresh token
```

---

## 4. Token Strategy

### 4.1 Access Token (JWT)
- Algorithm: **RS256** (asymmetric — private key signs, public key verifies)
- TTL: **15 minutes**
- Claims: `sub` (user_id), `device_id`, `session_id`, `scope`, `iat`, `exp`, `jti` (JWT ID for revocation)
- Never include sensitive data (password hash, full PII) in JWT payload
- Store public key in JWKS endpoint: `GET /.well-known/jwks.json`

### 4.2 Refresh Token
- Format: opaque random string (256-bit, cryptographically secure)
- TTL: **7 days** (sliding — refreshed on each use)
- Scope: **per device** — each device login generates an independent refresh token
- Storage: server-side in Redis with key pattern `refresh:{token_hash}` → `{user_id, device_id, session_id, created_at, last_used_at}`
- **Rotation**: on every use, old token is invalidated and new token issued atomically
- **Reuse detection**: if an already-used refresh token is presented → immediately revoke ALL tokens for that user across all devices + alert security

### 4.3 Token Revocation
- Access tokens: validated against `jti` blocklist in Redis (TTL = remaining token lifetime)
- Refresh tokens: deleted from Redis on logout or revocation
- Revoke single device: delete that device's refresh token only
- Revoke all devices: delete all refresh tokens for user (pattern `refresh:*` filtered by `user_id`)
- Only **admin** can view and revoke device sessions via backoffice API

---

## 5. Session Management

### 5.1 Default Rules
| Parameter | Value | Configurable? |
|---|---|---|
| Session timeout (idle) | 2 hours | Yes — user preference, min 15 min, max 8 hours |
| Max concurrent devices | Unlimited | No restriction |
| Session storage | Redis | — |
| Session key pattern | `session:{session_id}` | — |

### 5.2 Session Data (Redis)
```json
{
  "session_id": "uuid",
  "user_id": "uuid",
  "device_id": "uuid",
  "device_name": "iPhone 15 Pro",
  "device_type": "mobile",
  "ip_address": "1.2.3.4",
  "user_agent": "...",
  "created_at": "2024-01-15T09:00:00Z",
  "last_active_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-01-15T12:30:00Z",
  "mfa_verified": true,
  "auth_method": "google_sso"
}
```

### 5.3 Forced Session Termination Triggers
- Password changed → revoke all other sessions (keep current)
- MFA method changed → revoke all sessions including current → full re-auth required
- Admin revokes device → that session terminated immediately
- Suspicious activity detected (see Section 8) → flag + notify user; do NOT auto-terminate (log for review)

---

## 6. Account Lockout Policy

### 6.1 Failed Login Attempts
| Attempt | Action |
|---|---|
| 1–4 failures | Log attempt, show remaining attempts |
| 5th failure | Lock account for **30 minutes** |
| After unlock: any failure | Lock again for 30 minutes |
| 3rd lockout within 24 hours | **Hard lock** — requires password reset via email/OTP |

**Rules:**
- Lockout counter stored in Redis: key `lockout:{user_id}`, TTL auto-expires after 30 min for soft lock
- Hard lock stored in PostgreSQL `user_security_flags` table — not auto-cleared
- On lockout: send notification to user's registered email/WhatsApp
- Counter resets to 0 on successful login
- Rate limit login endpoint: **10 req/min per IP** regardless of user identity (prevent enumeration)
- Never reveal whether account exists vs wrong password in error messages — always return generic `AUTH_INVALID_CREDENTIALS`

### 6.2 Error Responses
```json
{ "error": { "code": "AUTH_INVALID_CREDENTIALS", "message": "Invalid email or password." } }
{ "error": { "code": "AUTH_ACCOUNT_LOCKED", "message": "Account locked. Try again after 30 minutes or reset your password." } }
{ "error": { "code": "AUTH_ACCOUNT_HARD_LOCKED", "message": "Account requires password reset to unlock." } }
```

---

## 7. Step-Up Authentication (Re-Authentication)

### 7.1 Sensitive Actions Requiring Re-Auth
The following actions require re-authentication regardless of current session age:

| Action | Re-Auth Method |
|---|---|
| Withdraw funds / cash out | Password **OR** Face ID (if enrolled) |
| Add / change linked bank account | Password **OR** Face ID |
| Change password | Current password (mandatory) |
| Change MFA method / enroll new device | Password + current MFA |
| Cancel / modify large order (> threshold TBD) | Password **OR** Face ID |
| Export account data / statements | Password **OR** Face ID |
| Admin: revoke user device | Admin password + admin MFA |

### 7.2 Step-Up Token
- On successful re-auth: issue a short-lived **step-up token** (TTL: 5 minutes)
- Step-up token is scoped to the specific action type — not reusable across action types
- Include `stepup_scope` and `stepup_exp` in the step-up JWT claims
- Protected endpoints check for valid step-up token in `X-StepUp-Token` header

### 7.3 Face ID Implementation
- Client authenticates using device biometric (WebAuthn / FIDO2 platform authenticator)
- Client sends signed WebAuthn assertion to server
- Server verifies assertion using stored public key credential for that device
- Raw biometric data NEVER leaves the device — server only processes cryptographic assertions
- Face ID credential stored in `user_webauthn_credentials` table (per device)

---

## 8. Device Management

### 8.1 Device Registry (admin-only)
Only admins can view and manage device sessions. Users cannot see other users' devices.

Admin API:
```
GET  /api/v1/admin/users/{user_id}/devices       → list all active devices
DELETE /api/v1/admin/users/{user_id}/devices/{device_id}  → revoke device session
```

### 8.2 Device Fingerprint
On each login, capture and store:
- `device_id` (generated on first login, stored in client secure storage)
- `user_agent`
- `ip_address`
- `platform` (iOS / Android / Web)
- `app_version`

New device login (never seen `device_id` before) → send notification to user's registered contact.

### 8.3 Device Database Schema
```sql
CREATE TABLE user_devices (
    device_id       UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(user_id),
    device_name     VARCHAR(100),
    device_type     VARCHAR(20),        -- mobile, web, desktop
    platform        VARCHAR(20),        -- ios, android, web
    user_agent      TEXT,
    first_seen_ip   INET,
    last_seen_ip    INET,
    first_login_at  TIMESTAMPTZ NOT NULL,
    last_login_at   TIMESTAMPTZ NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    revoked_at      TIMESTAMPTZ,
    revoked_by      UUID                -- admin user_id
);

CREATE INDEX idx_devices_user ON user_devices(user_id, is_active);
```

---

## 9. Auth Audit Log

Every authentication event must be logged. No exceptions.

```sql
CREATE TABLE auth_audit_log (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(50) NOT NULL,
    user_id         UUID,               -- NULL for pre-auth failures
    device_id       UUID,
    session_id      UUID,
    ip_address      INET NOT NULL,
    user_agent      TEXT,
    auth_method     VARCHAR(30),        -- google_sso, apple_sso, local, kakao_sso
    mfa_method      VARCHAR(30),        -- totp, whatsapp_otp, email_otp, face_id
    success         BOOLEAN NOT NULL,
    failure_reason  VARCHAR(100),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);
```

**Event types to log:**
`LOGIN_ATTEMPT`, `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `TOKEN_REFRESHED`, `TOKEN_REVOKED`,
`MFA_CHALLENGED`, `MFA_PASSED`, `MFA_FAILED`, `LOCKOUT_TRIGGERED`, `LOCKOUT_CLEARED`,
`PASSWORD_CHANGED`, `PASSWORD_RESET_REQUESTED`, `MFA_ENROLLED`, `MFA_REMOVED`,
`DEVICE_REGISTERED`, `DEVICE_REVOKED`, `STEPUP_REQUESTED`, `STEPUP_PASSED`, `STEPUP_FAILED`,
`SSO_INITIATED`, `SSO_CALLBACK_RECEIVED`, `SUSPICIOUS_ACTIVITY_FLAGGED`

**Retention**: Minimum **5 years** for auth logs (security audit requirement).

---

## 10. Password Reset Flow

```
1. User requests reset → POST /api/v1/auth/password-reset/request
2. If account exists: send 6-digit OTP to registered email (TTL: 15 min)
   Always respond 200 OK regardless of whether account exists (prevent enumeration)
3. User submits OTP → POST /api/v1/auth/password-reset/verify
4. On valid OTP: issue short-lived reset token (TTL: 10 min, single use)
5. User submits new password + reset token → POST /api/v1/auth/password-reset/complete
6. Validate: new password ≠ last 5 passwords
7. Hash and store new password
8. Invalidate reset token
9. Revoke all active sessions (force re-login everywhere)
10. Send confirmation notification
```

---

## 11. OAuth2 / SSO Integration Template

```
Initiation:
GET /api/v1/auth/sso/{provider}/authorize
→ Redirect to provider with: client_id, redirect_uri, scope, state (random), nonce (for OIDC), code_challenge (PKCE)

Callback:
GET /api/v1/auth/sso/{provider}/callback?code=...&state=...
1. Validate state matches stored value (CSRF check)
2. Exchange code for tokens at provider's token endpoint (with code_verifier)
3. Validate id_token signature (OIDC) or fetch userinfo
4. Verify email is present and verified by provider
5. Look up user by (provider, sub) in user_social_accounts
6. If found: proceed to MFA challenge
7. If not found + email matches existing account: link provider (require MFA first)
8. If not found + no matching email: create new account, require MFA enrollment
```

---

## 12. Pending Integration Points (Legal Review Required)

These are designed as integration stubs. Do NOT implement data consumption until legal clearance:

| Provider | Integration Point Prepared | Data Usage Status |
|---|---|---|
| VneID | OAuth2 callback + eKYC data model | ⏳ Legal pending — store raw response only |
| Banking App | OAuth2 callback + account link model | ⏳ Not decided — prepare schema only |

When these are mentioned in a request, remind the user:
> *"VneID/Banking integration point is prepared in the design. However, auto-populating KYC data from these providers requires legal clearance. The current implementation will store the raw response for future use but will not consume identity fields until you confirm legal approval."*

---

## 13. Security Headers (All API Responses)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Cache-Control: no-store                    ← on all auth endpoints
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 14. Auth Error Code Reference

| Code | HTTP | Description |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Wrong email/password (generic — do not distinguish) |
| `AUTH_ACCOUNT_LOCKED` | 423 | Soft-locked, retry after 30 min |
| `AUTH_ACCOUNT_HARD_LOCKED` | 423 | Requires password reset |
| `AUTH_MFA_REQUIRED` | 403 | Primary auth passed, MFA needed |
| `AUTH_MFA_INVALID` | 401 | Wrong MFA code |
| `AUTH_MFA_EXPIRED` | 401 | OTP expired |
| `AUTH_MFA_MAX_ATTEMPTS` | 429 | Too many MFA attempts |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT expired |
| `AUTH_TOKEN_INVALID` | 401 | JWT invalid or tampered |
| `AUTH_TOKEN_REVOKED` | 401 | Token has been revoked |
| `AUTH_STEPUP_REQUIRED` | 403 | Sensitive action requires re-authentication |
| `AUTH_STEPUP_INVALID` | 401 | Step-up token invalid or wrong scope |
| `AUTH_STEPUP_EXPIRED` | 401 | Step-up token expired (5 min window) |
| `AUTH_EMAIL_UNVERIFIED` | 403 | SSO provider returned unverified email |
| `AUTH_SSO_STATE_MISMATCH` | 400 | OAuth2 state parameter mismatch (CSRF) |
| `AUTH_SESSION_EXPIRED` | 401 | Session idle timeout reached |
| `AUTH_DEVICE_REVOKED` | 401 | Device session revoked by admin |
| `AUTH_OTP_RATE_LIMITED` | 429 | Too many OTP requests |
