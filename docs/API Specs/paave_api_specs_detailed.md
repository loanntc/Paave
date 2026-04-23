# Paave API — Detailed Endpoint Reference

**Version:** 1.5.0  
**Base URL:** `https://api.paave.io`  
**Total Endpoints:** 452

---

## Table of Contents

1. [Registration & OTP](#1-registration--otp)
2. [Authentication — Login](#2-authentication--login)
3. [Token Management](#3-token-management)
4. [Biometric Authentication](#4-biometric-authentication)
5. [CA Certificate Authentication (NHSV)](#5-ca-certificate-authentication-nhsv)
6. [Password Reset](#6-password-reset)
7. [Users — Profile Management](#7-users--profile-management)
8. [Users — Password Management](#8-users--password-management)
9. [Users — Account Linking](#9-users--account-linking)
10. [Users — Account Deletion](#10-users--account-deletion)
11. [News](#11-news)
12. [Fundamentals](#12-fundamentals)
13. [Market Data](#13-market-data)
14. [Social](#14-social)
15. [Insights — Watchlists](#15-insights--watchlists)
16. [Insights — Notifications](#16-insights--notifications)
17. [Insights — Search History](#17-insights--search-history)
18. [Virtual Trading — Accounts & Portfolios](#18-virtual-trading--accounts--portfolios)
19. [Virtual Trading — Equity Orders](#19-virtual-trading--equity-orders)
20. [Virtual Trading — P&L & Analytics](#20-virtual-trading--pl--analytics)
21. [Virtual Trading — Contests](#21-virtual-trading--contests)
22. [Live Trading — Contests & Leaderboards](#22-live-trading--contests--leaderboards)
23. [NHSV Equity — Account Information](#23-nhsv-equity--account-information)
24. [NHSV Equity — Orders](#24-nhsv-equity--orders)
25. [NHSV Equity — Transfers & Loans](#25-nhsv-equity--transfers--loans)
26. [NHSV Derivatives — Account Information](#26-nhsv-derivatives--account-information)
27. [NHSV Derivatives — Orders & Stop Orders](#27-nhsv-derivatives--orders--stop-orders)
28. [NHSV Derivatives — Transfers](#28-nhsv-derivatives--transfers)
29. [App Configuration](#29-app-configuration)
30. [Administration](#30-administration)

---

## Conventions

### Authentication
- **Public** — No token required.
- **Bearer Token required** — Include `Authorization: Bearer <accessToken>` in the request header.

### Response Envelope
All successful responses use this wrapper:
```json
{
  "data": { /* payload */ },
  "meta": { "requestId": "req_abc123" }
}
```

### Error Format
```json
{
  "type": "https://api.paave.io/errors/error-type",
  "status": 400,
  "title": "Error Title",
  "detail": "Human-readable error description",
  "code": "ERROR_CODE",
  "timestamp": "2026-03-30T04:00:00Z"
}
```

### Common HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 204 | Success, no response body |
| 400 | Bad request — missing or invalid input |
| 401 | Unauthorized — missing or expired JWT |
| 403 | Forbidden — insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict — resource already exists |
| 422 | Business rule violation |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 502 | Bad gateway (upstream NHSV error) |

### Field notation in tables
- **bold** = required field

---

## 1. Registration & OTP

> **New user flow:** Check availability → Send OTP → Verify OTP → Register account

---

### 1.1 Check Username / Email Availability

**POST** `/api/v1/users/availability-checks`  
**Auth:** Bearer Token required  
**Purpose:** Before starting registration, verify that the intended username or email address is not already taken. Returns `available: true` when the value is free to use.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **type** | string | Yes | Check type. Values: `EMAIL`, `USERNAME` |
| **value** | string | Yes | The email or username to check |

**Example Request**
```json
{
  "type": "EMAIL",
  "value": "user@example.com"
}
```

**Response 200**
```json
{
  "data": {
    "available": true
  },
  "meta": { "requestId": "req_abc123" }
}
```

| Field | Type | Description |
|-------|------|-------------|
| available | boolean | `true` if the value is available; `false` if already taken |

**Notes**
- Check before presenting the registration form to give immediate feedback.
- Returns `available: false` (not an error) when the email/username is already registered.

---

### 1.2 Send OTP

**POST** `/api/v1/auth/otp`  
**Auth:** Public  
**Purpose:** Send a one-time password (OTP) to the user's phone or email. Required before completing registration, password reset, email update, or profile changes that require verification. Returns an `otpId` that must be included in the verification call.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **id** | string | Yes | Phone number or email address to receive the OTP |
| **idType** | string | Yes | Identifier type. Values: `PHONE`, `EMAIL` |
| **txType** | string | Yes | The operation this OTP is for. Values: `REGISTER`, `RESET_PASSWORD`, `UPDATE_PROFILE`, `UPDATE_EMAIL` |

**Example Request**
```json
{
  "id": "09XXXXXXXX",
  "idType": "PHONE",
  "txType": "REGISTER"
}
```

**Response 200**
```json
{
  "data": {
    "otpId": "otp_EXAMPLE_001",
    "message": "OTP sent successfully"
  },
  "meta": { "requestId": "req_abc123" }
}
```

| Field | Type | Description |
|-------|------|-------------|
| otpId | string | OTP session identifier. Pass this to `/auth/otp/verify` |
| message | string | Human-readable status message |

**Notes**
- The OTP expires after a short time window (typically 5 minutes). Call verify promptly.
- **Rate limited** — returns `429` if too many OTP requests are made in a short period.
- Each `txType` should match the operation being performed. Mixing transaction types will cause verification errors.

---

### 1.3 Verify OTP

**POST** `/api/v1/auth/otp/verify`  
**Auth:** Public  
**Purpose:** Verify the OTP code entered by the user. On success, returns an `otpKey` (a short-lived verification token) that proves the phone/email was verified. This `otpKey` is required for registration, password reset, and other OTP-gated operations.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **otpId** | string | Yes | The `otpId` returned by the Send OTP step |
| **otpValue** | string | Yes | The 6-digit OTP code entered by the user |

**Example Request**
```json
{
  "otpId": "otp_EXAMPLE_001",
  "otpValue": "123456"
}
```

**Response 200**
```json
{
  "data": {
    "otpKey": "otpkey_EXAMPLE_001",
    "verified": true
  },
  "meta": { "requestId": "req_abc123" }
}
```

| Field | Type | Description |
|-------|------|-------------|
| otpKey | string | Short-lived verification token — pass this to the subsequent operation (registration, password reset, etc.) |
| verified | boolean | Always `true` when the call succeeds |

**Notes**
- `otpKey` is consumed once. Do not call verify twice with the same `otpId`.
- Returns `401` if the OTP value is wrong; `429` if too many failed attempts.

---

### 1.4 Register New Account

**POST** `/api/v1/users`  
**Auth:** Public  
**Purpose:** Create a new Paave user account. The caller must have a valid `otpKey` from the OTP verification step (proving phone/email ownership). On success, the account is created and JWT tokens are returned so the user is immediately logged in.

**Pre-condition:** Complete Send OTP → Verify OTP to obtain an `otpKey`.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **registeredUsername** | string | Yes | Username or email address used for login |
| **email** | string | Yes | Email address for notifications and verification |
| **password** | string | Yes | Initial account password |
| **fullname** | string | Yes | Display name shown on the user's profile |
| **otpKey** | string | Yes | Verified OTP key from `/auth/otp/verify` |
| deviceId | string | No | Client device identifier |

**Example Request**
```json
{
  "registeredUsername": "user@example.com",
  "email": "user@example.com",
  "password": "P@ssw0rd!",
  "fullname": "User A",
  "otpKey": "otpkey_EXAMPLE_001"
}
```

**Response 201**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  },
  "meta": { "requestId": "req_abc123" }
}
```

| Field | Type | Description |
|-------|------|-------------|
| accessToken | string | JWT access token for API calls. Include as `Authorization: Bearer <token>` |
| refreshToken | string | Long-lived token used to obtain new access tokens without re-logging in |
| tokenType | string | Always `Bearer` |
| expiresIn | integer | Access token lifetime in seconds (typically 3600 = 1 hour) |

**Notes**
- Returns `422` if the username/email is already registered.
- The password must meet complexity requirements; invalid passwords return `400`.
- An `otpKey` that was already used or has expired returns `400`.

---

## 2. Authentication — Login

---

### 2.1 Login with Username & Password

**POST** `/api/v1/auth/login/password`  
**Auth:** Public  
**Purpose:** Authenticate with a registered username/email and password. The most common login method for users with a Paave account. Returns JWT tokens on success.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **username** | string | Yes | Username or email address |
| **password** | string | Yes | Account password |
| device_id | string | No | Client device identifier — used for session tracking and biometric login binding |

**Example Request**
```json
{
  "username": "user@example.com",
  "password": "P@ssw0rd!",
  "device_id": "device_EXAMPLE_001"
}
```

**Response 200**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  },
  "meta": { "requestId": "req_abc123" }
}
```

**Notes**
- Returns `401` for wrong credentials. Does NOT reveal whether the username exists (security best practice).
- Returns `429` after repeated failed attempts.

---

### 2.2 Unified Login

**POST** `/api/v1/auth/login`  
**Auth:** Public  
**Purpose:** Single login endpoint that routes to the correct login flow based on the `grant_type` field. Use the specific endpoints (2.1, 2.3, 2.5, etc.) where possible; this unified endpoint is useful for clients that handle multiple login methods through one integration point.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **grant_type** | string | Yes | Login method. Values: `password`, `social_login`, `client_credentials`, `demo` |
| username | string | Conditional | Required when `grant_type=password` |
| password | string | Conditional | Required when `grant_type=password` |
| socialToken | string | Conditional | Required when `grant_type=social_login` |
| socialType | string | Conditional | Required when `grant_type=social_login`. Values: `GOOGLE`, `FACEBOOK`, `APPLE` |
| client_id | string | Conditional | Required when `grant_type=client_credentials` or `demo` |
| client_secret | string | Conditional | Required when `grant_type=client_credentials` or `demo` |
| device_id | string | No | Client device identifier (used for `password` and `social_login`) |
| platform | string | No | Client platform (used for `demo`). Values: `ios`, `android`, `web` |
| appVersion | string | No | App version string (used for `demo`) |

**Example Request**
```json
{
  "grant_type": "password",
  "username": "user@example.com",
  "password": "P@ssw0rd!",
  "device_id": "device_EXAMPLE_001"
}
```

**Response 200** — same structure as 2.1.

---

### 2.3 Two-Factor Authentication (2FA) Login — Step 1

**POST** `/api/v1/auth/login/2fa`  
**Auth:** Public  
**Purpose:** First step of 2FA login. Submit credentials; if the account has 2FA enabled, an OTP is sent to the registered phone/email and a `partialToken` is returned. The user must complete login using the verify-OTP step (2.4).

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **username** | string | Yes | Username or email |
| **password** | string | Yes | Account password |
| device_id | string | No | Client device identifier |

**Example Request**
```json
{
  "username": "user@example.com",
  "password": "P@ssw0rd!",
  "device_id": "device_EXAMPLE_001"
}
```

**Response 200**
```json
{
  "data": {
    "partialToken": "eyJhbGciOiJSUzI1NiJ9...",
    "otpId": "otp_EXAMPLE_001",
    "twoFaRequired": true
  },
  "meta": { "requestId": "req_abc123" }
}
```

| Field | Type | Description |
|-------|------|-------------|
| partialToken | string | Intermediate token to include in the verify-OTP step. Not usable for API calls |
| otpId | string | OTP session identifier. Pass to the verify-OTP step |
| twoFaRequired | boolean | `true` when 2FA is required and OTP was sent |

**Notes**
- If `twoFaRequired=false`, 2FA is not configured on the account and full tokens are returned immediately.
- The `partialToken` expires after a short window. Users must complete the OTP step promptly.

---

### 2.4 Two-Factor Authentication (2FA) Login — Step 2: Verify OTP

**POST** `/api/v1/auth/login/2fa/verify-otp`  
**Auth:** Public  
**Purpose:** Complete 2FA login by submitting the OTP received in step 1 along with the `partial_token`. Returns full JWT tokens on success.

**Pre-condition:** Must have completed step 1 (`/auth/login/2fa`) to receive `partialToken` and `otpId`.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **otp_id** | string | Yes | OTP session ID from the 2FA step-1 response |
| **otp_value** | string | Yes | The OTP code entered by the user |
| **partial_token** | string | Yes | The `partialToken` from the 2FA step-1 response |
| mobile_otp | string | No | Mobile OTP override for supported client flows |
| macAddress | string | No | Client MAC address for device fingerprinting |
| platform | string | No | Client platform. Values: `ios`, `android`, `web` |
| osVersion | string | No | Client OS version |
| appVersion | string | No | Client app version |
| sourceIp | string | No | Source IP captured by the client |

**Example Request**
```json
{
  "otp_id": "otp_EXAMPLE_001",
  "otp_value": "123456",
  "partial_token": "eyJhbGciOiJSUzI1NiJ9..."
}
```

**Response 200** — full JWT tokens, same structure as 2.1.

**Notes**
- Returns `401` if OTP is wrong or expired.
- Returns `429` after too many wrong OTP attempts.

---

### 2.5 Social Login

**POST** `/api/v1/auth/login/social`  
**Auth:** Public  
**Purpose:** Authenticate using a social provider (Google, Facebook, or Apple). If a Paave account linked to the social identity already exists, the user is logged in. If not, a new account is automatically created. Returns JWT tokens.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **socialToken** | string | Yes | Provider-issued access token or ID token |
| **socialType** | string | Yes | Social provider. Values: `GOOGLE`, `FACEBOOK`, `APPLE` |
| device_id | string | No | Client device identifier |

**Example Request**
```json
{
  "socialToken": "ya29.EXAMPLE_GOOGLE_TOKEN",
  "socialType": "GOOGLE",
  "device_id": "device_EXAMPLE_001"
}
```

**Response 200** — JWT tokens, same structure as 2.1.

---

### 2.6 Social Login in Organization Context

**POST** `/api/v1/auth/login/social/organization`  
**Auth:** Public  
**Purpose:** Like social login (2.5), but scoped to a specific organization. Creates or retrieves an org-scoped account linked to the social identity. Used for white-label or enterprise deployments.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **socialToken** | string | Yes | Provider-issued access token or ID token |
| **socialType** | string | Yes | Social provider. Values: `GOOGLE`, `FACEBOOK`, `APPLE` |
| **organization** | string | Yes | Organization identifier |
| device_id | string | No | Client device identifier |

**Example Request**
```json
{
  "socialToken": "ya29.EXAMPLE_GOOGLE_TOKEN",
  "socialType": "GOOGLE",
  "organization": "org_EXAMPLE_001",
  "device_id": "device_EXAMPLE_001"
}
```

**Response 200** — JWT tokens scoped to the organization.

---

### 2.7 Partner-Linked Account Login

**POST** `/api/v1/auth/login/link-accounts`  
**Auth:** Bearer Token required  
**Purpose:** Switch context to a partner-linked account (e.g., switch from a Paave identity to a linked NHSV broker account). Returns tokens scoped to the partner account. Requires an active session.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **partnerId** | string | Yes | The partner account identifier to switch into |

**Response 200** — partner-scoped JWT tokens, same structure as 2.1.

**Notes**
- The resulting token is scoped to the partner account. Use it for NHSV operations.
- The original Paave token remains valid.

---

### 2.8 Organization Login

**POST** `/api/v1/auth/login/organization`  
**Auth:** Public  
**Purpose:** Authenticate on behalf of an organization. Returns organization-scoped tokens. Used in white-label or multi-tenant scenarios.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **organizationId** | string | Yes | Target organization identifier |
| registeredUsername | string | Conditional | Required when authenticating with username/password |
| password | string | Conditional | Required when authenticating with username/password |
| orgLoginToken | string | Conditional | Alternative single-use org login token (provided by admin) |

**Example Request**
```json
{
  "organizationId": "org_EXAMPLE_001",
  "registeredUsername": "user@example.com",
  "password": "P@ssw0rd!"
}
```

**Response 200** — organization-scoped JWT tokens.

---

### 2.9 Biometric Login

**POST** `/api/v1/auth/login/biometric`  
**Auth:** Public  
**Purpose:** Authenticate using a registered biometric credential (fingerprint or Face ID). The device signs a payload with the private key stored in the secure enclave; the server verifies the signature against the registered public key. See [Section 4](#4-biometric-authentication) for how to register biometric credentials.

**Pre-condition:** Biometric credential must be registered via `/auth/biometric/register`.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **username** | string | Yes | Username or email bound to the biometric credential |
| **signature** | string | Yes | Base64-encoded RSA signature over the login payload |
| **deviceId** | string | Yes | Device identifier bound to the credential at registration time |
| **timestamp** | integer | Yes | Current epoch timestamp in milliseconds — prevents replay attacks |
| platform | string | No | Client platform. Values: `ios`, `android` |
| osVersion | string | No | Client OS version |
| appVersion | string | No | Client app version |
| sourceIp | string | No | Source IP captured by the client |

**Example Request**
```json
{
  "username": "user@example.com",
  "signature": "BASE64_RSA_SIGNATURE_EXAMPLE==",
  "deviceId": "device_EXAMPLE_001",
  "timestamp": 1743300000000,
  "platform": "ios"
}
```

**Response 200** — JWT tokens, same structure as 2.1.

**Notes**
- The timestamp must be within a short skew window of the server time. Stale timestamps return `401`.
- If the biometric credential is unregistered or the signature is invalid, returns `401`.

---

### 2.10 CA Certificate Login (NHSV)

**POST** `/api/v1/auth/login/ca`  
**Auth:** Public  
**Purpose:** [NHSV only] Authenticate using a CA certificate. The certificate must be pre-registered with NHSV. See [Section 5](#5-ca-certificate-authentication-nhsv) for registration. Used for institutional or regulated-access login.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **grant_type** | string | Yes | Must be `ca` |
| **client_id** | string | Yes | OAuth client identifier provided by NHSV integration |
| **client_secret** | string | Yes | OAuth client secret |
| **data** | string | Yes | Base64-encoded CA credential payload |

**Example Request**
```json
{
  "grant_type": "ca",
  "client_id": "paave-mobile",
  "client_secret": "EXAMPLE_SECRET",
  "data": "BASE64_ENCODED_CA_DATA=="
}
```

**Response 200** — JWT tokens, same structure as 2.1.

---

## 3. Token Management

---

### 3.1 Refresh Access Token

**POST** `/api/v1/auth/token/refresh`  
**Auth:** Public  
**Purpose:** Exchange a valid refresh token for a new access token without requiring the user to re-authenticate. The refresh token is not rotated — it remains valid until explicitly revoked.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **grant_type** | string | Yes | Must be `refresh_token` |
| **client_id** | string | Yes | OAuth client identifier |
| **client_secret** | string | Yes | OAuth client secret |
| **refresh_token** | string | Yes | The refresh token obtained during login or registration |

**Example Request**
```json
{
  "grant_type": "refresh_token",
  "client_id": "paave-mobile",
  "client_secret": "EXAMPLE_SECRET",
  "refresh_token": "eyJhbGciOiJSUzI1NiJ9..."
}
```

**Response 200**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  },
  "meta": { "requestId": "req_abc123" }
}
```

**Notes**
- Call this before the access token expires to maintain a seamless session.
- Returns `401` if the refresh token is invalid or has been revoked.

---

### 3.2 Revoke Refresh Token (Logout)

**POST** `/api/v1/auth/token/revoke`  
**Auth:** Public  
**Purpose:** Invalidate a refresh token, effectively ending the session. After revocation, the token cannot be used to obtain new access tokens. Use this for logout.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **refresh_token** | string | Yes | The refresh token to revoke |
| refresh_token_id | string | No | Numeric token ID, used when revoking a specific session by ID |

**Example Request**
```json
{
  "refresh_token": "eyJhbGciOiJSUzI1NiJ9..."
}
```

**Response 200**
```json
{
  "data": true,
  "meta": { "requestId": "req_abc123" }
}
```

---

## 4. Biometric Authentication

> **Registration flow:** Verify password → Register biometric (sends OTP) → Verify OTP

---

### 4.1 Verify Password Before Biometric Setup

**POST** `/api/v1/auth/biometric/verify-password`  
**Auth:** Bearer Token required  
**Purpose:** Security gate step in the biometric registration flow. Confirms the user knows their account password before allowing a new biometric credential to be added. Returns `true` on success.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **password** | string | Yes | Current account password |

**Response 200:** `"data": true`

---

### 4.2 Register Biometric Credential

**POST** `/api/v1/auth/biometric/register`  
**Auth:** Bearer Token required  
**Purpose:** Register a biometric credential for the authenticated user on a specific device. The device's RSA public key is stored by the server and used to verify signatures during biometric login. Initiates an OTP challenge to confirm the registration.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **password** | string | Yes | Current account password (second confirmation of identity) |
| **publicKey** | string | Yes | Base64-encoded RSA public key generated by the device's secure enclave |
| **deviceId** | string | Yes | Device identifier that will own this biometric credential |

**Response 200**
```json
{
  "data": {
    "otpId": "otp_EXAMPLE_001",
    "message": "OTP sent for biometric registration"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| otpId | string | Pass to `/auth/biometric/verify-otp` to complete registration |

---

### 4.3 Complete Biometric Registration (Verify OTP)

**POST** `/api/v1/auth/biometric/verify-otp`  
**Auth:** Bearer Token required  
**Purpose:** Final step in biometric registration. Submit the OTP received in step 4.2 to confirm ownership. After this call succeeds, the device can log in using biometric authentication.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **otpValue** | string | Yes | OTP code entered by the user |
| **otpId** | string | Yes | OTP session ID from the register step |
| **deviceId** | string | Yes | Device identifier being registered |

**Response 200:** `"data": true`

---

### 4.4 Check Biometric Registration Status

**GET** `/api/v1/auth/biometric/status`  
**Auth:** Bearer Token required  
**Purpose:** Check whether biometric authentication is registered for the current user on a given device.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deviceId | string | No | Filter by device identifier |

**Response 200**
```json
{
  "data": {
    "registered": true,
    "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| registered | boolean | `true` if biometric is registered for this device |
| publicKey | string | The stored public key, present only when `registered=true` |

---

### 4.5 Unregister Biometric Credential

**POST** `/api/v1/auth/biometric/unregister`  
**Auth:** Bearer Token required  
**Purpose:** Remove a biometric credential from the account for a specific device. After this call, biometric login is disabled for that device and the user must re-register to re-enable it.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **deviceId** | string | Yes | Device identifier whose biometric credential should be removed |

**Response 200:** `"data": true`

---

## 5. CA Certificate Authentication (NHSV)

---

### 5.1 Register CA Certificate

**POST** `/api/v1/auth/ca/register`  
**Auth:** Bearer Token required  
**Purpose:** [NHSV] Register a CA (certificate authority) credential with the identity service. After registration, the certificate can be used for CA-based login. The certificate must be Base64-encoded.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **data** | string | Yes | Base64-encoded CA certificate payload |

**Response 200:** `"data": {}`

---

### 5.2 Update CA Certificate

**PUT** `/api/v1/auth/ca/update`  
**Auth:** Bearer Token required  
**Purpose:** [NHSV] Replace the existing CA certificate with new Base64-encoded data. Use when the certificate is renewed or expires.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **data** | string | Yes | New Base64-encoded CA certificate payload |

**Response 200:** `"data": {}`

---

### 5.3 Unregister CA Certificate

**POST** `/api/v1/auth/ca/unregister`  
**Auth:** Bearer Token required  
**Purpose:** [NHSV] Remove the registered CA certificate from the account. After unregistering, CA-based login is disabled.

**Request Body:** None  
**Response 200:** `"data": {}`

---

## 6. Password Reset

---

### 6.1 Reset Password

**POST** `/api/v1/auth/password/reset`  
**Auth:** Public  
**Purpose:** Reset an account password using a verified OTP key. The caller must first send an OTP via `/auth/otp` with `txType=RESET_PASSWORD`, verify it via `/auth/otp/verify`, and then submit the resulting `otpKey` here along with the new password.

**Pre-condition:** Complete Send OTP (txType=RESET_PASSWORD) → Verify OTP flow to obtain an `otpKey`.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **username** | string | Yes | Username or email of the account being reset |
| **newPassword** | string | Yes | New password to set after OTP verification |
| **otpKey** | string | Yes | Verified OTP key from `/auth/otp/verify` |

**Example Request**
```json
{
  "username": "user@example.com",
  "newPassword": "NewP@ssw0rd!",
  "otpKey": "otpkey_EXAMPLE_001"
}
```

**Response 200:** `"data": true`

---

## 7. Users — Profile Management

---

### 7.1 Get My Profile

**GET** `/api/v1/users/me`  
**Auth:** Bearer Token required  
**Purpose:** Retrieve the authenticated user's full account profile, including personal information, linked accounts, and account status.

**Response 200**
```json
{
  "data": {
    "userId": "usr_01HXYZ",
    "username": "user@example.com",
    "fullName": "User A",
    "email": "user@example.com",
    "bio": "Individual investor",
    "accountLinked": false
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| userId | string | Unique user identifier |
| username | string | Login username or email |
| fullName | string | Display name |
| email | string | Registered email address |
| bio | string | Profile biography |
| accountLinked | boolean | Whether the account has any linked partner accounts |

---

### 7.2 Search Users

**GET** `/api/v1/users`  
**Auth:** Bearer Token required  
**Purpose:** Search for users by username or name. When `username` is provided, performs an exact lookup. Otherwise performs a paginated search by name.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | No | Exact username to look up |
| name | string | No | Partial name search term |
| pageNumber | integer | No | Zero-based page number (default 0) |
| pageSize | integer | No | Results per page, 1–100 (default 20) |

**Response 200**
```json
{
  "data": {
    "content": [
      {
        "userId": "usr_01HXYZ",
        "username": "user@example.com",
        "fullName": "User A"
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

### 7.3 Update Biography

**PUT** `/api/v1/users/me/bio`  
**Auth:** Bearer Token required  
**Purpose:** Update the biography text shown on the user's public profile.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **bio** | string | Yes | New biography text |

**Response 200:** `"data": true`

---

### 7.4 Update Full Name

**PUT** `/api/v1/users/me/full-name`  
**Auth:** Bearer Token required  
**Purpose:** Update the display name shown on the user's profile.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **fullname** | string | Yes | New full name to display |

**Response 200:** `"data": true`

---

### 7.5 Update Email

**PUT** `/api/v1/users/me/email`  
**Auth:** Bearer Token required  
**Purpose:** Update the account's registered email address. Requires OTP verification to confirm ownership of the new address.

**Pre-condition:** Send OTP (txType=UPDATE_EMAIL) to the new email, then verify it to obtain an `otpKey`.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **email** | string | Yes | New email address |
| **otpKey** | string | Yes | Verified OTP key proving ownership of the new email |

**Response 200:** `"data": true`

**Notes**
- Returns `422` if the new email is already registered to another account.

---

### 7.6 Update Username

**PUT** `/api/v1/users/me/username`  
**Auth:** Bearer Token required  
**Purpose:** Update the account's username. Returns `422` if the new username is already taken.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **username** | string | Yes | New username |

**Response 200:** `"data": true`

---

### 7.7 Update Account Status

**PUT** `/api/v1/users/me/status`  
**Auth:** Bearer Token required  
**Purpose:** Disable or suspend the account. Used to put the account in an inactive state without permanently deleting it.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **status** | string | Yes | Target account status. Values: `DISABLED`, `SUSPENDED` |

**Response 200:** `"data": true`

---

### 7.8 Confirm Account (Email Verification)

**POST** `/api/v1/users/me/confirmation`  
**Auth:** Bearer Token required  
**Purpose:** Confirm the account's email address using a verification link or token sent by email. Marks the account as email-verified.

**Response 200:** `"data": true`

---

### 7.9 Submit Feedback

**POST** `/api/v1/users/me/feedbacks`  
**Auth:** Bearer Token required  
**Purpose:** Submit a feedback or support request from within the app.

**Response 200:** Feedback submitted confirmation.

---

## 8. Users — Password Management

---

### 8.1 Change Password

**POST** `/api/v1/users/me/password`  
**Auth:** Bearer Token required  
**Purpose:** Change the account password. Requires the current password for verification.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **currentPassword** | string | Yes | Existing account password for verification |
| **newPassword** | string | Yes | New password to set |

**Response 200:** `"data": true`

---

### 8.2 Set Initial Password

**POST** `/api/v1/users/me/password/initial`  
**Auth:** Bearer Token required  
**Purpose:** Set the initial password for accounts created through social login that have never had a password set. Once set, the account can also log in via username/password.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **password** | string | Yes | Initial password to set |

**Response 200:** `"data": true`

---

### 8.3 Add Password to Social Account

**POST** `/api/v1/users/me/password/social`  
**Auth:** Bearer Token required  
**Purpose:** Add a password to a social-only account. After this call, the user can log in with either the social provider or username/password.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **password** | string | Yes | Password to associate with the account |

**Response 200:** `"data": true`

---

### 8.4 Check Password Availability

**GET** `/api/v1/users/me/password/availability`  
**Auth:** Bearer Token required  
**Purpose:** Check whether the authenticated account has a password set. Useful for social accounts to determine whether to prompt for password setup.

**Response 200**
```json
{
  "data": {
    "hasPassword": false
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| hasPassword | boolean | `true` if a password is set on the account |

---

## 9. Users — Account Linking

Account linking connects a Paave identity to a partner broker account (e.g., NHSV). The linked partner account provides access to live trading.

---

### 9.1 Initiate Account Linking

**POST** `/api/v1/users/me/link-accounts/init`  
**Auth:** Bearer Token required  
**Purpose:** Start the account linking workflow to connect the Paave account to a partner (broker) account. Returns a linking session token or instructions for the user.

**Response 200:** Linking session token/instructions.

---

### 9.2 Create Account Link

**POST** `/api/v1/users/me/link-accounts`  
**Auth:** Bearer Token required  
**Purpose:** Create a link between the Paave account and a partner account.

**Response 201:** Link created confirmation.

---

### 9.3 List Linked Accounts

**GET** `/api/v1/users/me/link-accounts`  
**Auth:** Bearer Token required  
**Purpose:** Retrieve all partner/broker accounts currently linked to the authenticated user.

**Response 200:** Array of linked account objects including partnerId, status, and account details.

---

### 9.4 Confirm Account Link

**POST** `/api/v1/users/me/link-accounts/confirmation`  
**Auth:** Bearer Token required  
**Purpose:** Confirm a pending account link request (typically triggered by a verification step or partner callback).

---

### 9.5 Approve Account Link

**POST** `/api/v1/users/me/link-accounts/approval`  
**Auth:** Bearer Token required  
**Purpose:** Approve an incoming link request from a partner system.

---

### 9.6 Link Social Provider

**POST** `/api/v1/users/me/link-accounts/social`  
**Auth:** Bearer Token required  
**Purpose:** Add a social provider (Google, Facebook, Apple) to the account so the user can log in via that provider in future.

---

### 9.7 Remove Linked Account

**DELETE** `/api/v1/users/me/link-accounts/{accountId}`  
**Auth:** Bearer Token required  
**Purpose:** Remove a specific linked account from the user's profile.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **accountId** | string | Yes | The linked account identifier to remove |

---

### 9.8 Remove Partner Link

**DELETE** `/api/v1/users/me/link-accounts/partner/{partnerId}`  
**Auth:** Bearer Token required  
**Purpose:** Remove the link to a specific partner from the user's account.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **partnerId** | string | Yes | The partner identifier |

---

### 9.9 Unlink Social Account

**DELETE** `/api/v1/users/me/link-accounts/social/{socialType}`  
**Auth:** Bearer Token required  
**Purpose:** Remove a social provider from the account.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **socialType** | string | Yes | Social provider to unlink. Values: `GOOGLE`, `FACEBOOK`, `APPLE` |

**Notes**
- Cannot unlink a social provider if it is the only login method and no password is set. Set a password first.

---

## 10. Users — Account Deletion

> **Deletion flow:** Initiate deletion → Resend confirmation if needed → Confirm deletion

---

### 10.1 Initiate Account Deletion

**POST** `/api/v1/users/me/deletion/init`  
**Auth:** Bearer Token required  
**Purpose:** Start the account deletion process. Sends a confirmation code to the user's registered email or phone.

**Response 200:** Confirmation sent.

---

### 10.2 Resend Deletion Confirmation

**POST** `/api/v1/users/me/deletion/resend`  
**Auth:** Bearer Token required  
**Purpose:** Resend the deletion confirmation code if the user did not receive it.

**Response 200:** Confirmation resent.

---

### 10.3 Confirm Account Deletion

**POST** `/api/v1/users/me/deletion`  
**Auth:** Bearer Token required  
**Purpose:** Permanently delete the account after the user confirms with the code sent in the initiation step. This action is irreversible.

**Response 200:** Account deleted.

**Notes**
- All user data, watchlists, social content, and virtual trading history will be permanently removed.
- Active live trading accounts must be closed before deletion.

---

## 11. News

All News endpoints are **public** (no authentication required).

---

### 11.1 List News Articles

**GET** `/api/v1/news`  
**Purpose:** Retrieve paginated news articles with optional filters.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| language | string | No | Filter by language. Values: `vi`, `en` |
| pinned | boolean | No | `true` to return only pinned articles |
| keyword | string | No | Search keyword |
| category | string | No | News category filter |
| symbol | string | No | Filter by stock symbol (cashtag) |
| page | integer | No | Page number (zero-based, default 0) |
| size | integer | No | Results per page (default 20) |

**Response 200**

Array of news articles:

| Field | Type | Description |
|-------|------|-------------|
| newsId | integer | Unique news article identifier |
| publishDate | string | Publication timestamp (ISO 8601) |
| title | string | Article title |
| content | string | Article body or summary |
| url | string | Link to the full article |
| imgUrl | string | Article thumbnail image URL |
| pinned | boolean | Whether the article is pinned to top |
| hashtags | array | Associated stock symbols or topic tags |

---

### 11.2 Get News by ID

**GET** `/api/v1/news/{newsId}`  
**Purpose:** Retrieve a single news article by its numeric ID.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **newsId** | integer | Yes | Unique news article ID |

**Response 200:** Single news article object (same fields as 11.1).

---

### 11.3 Get Latest News by Symbols

**GET** `/api/v1/news/latest-by-symbols`  
**Purpose:** Get the most recent news articles for a specified list of stock symbols.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **symbols** | string | Yes | Comma-separated list of stock symbols, max 20 (e.g., `VCB,VIC,TCB`) |
| page | integer | No | Page number |
| size | integer | No | Results per page |

---

### 11.4 Filter News

**GET** `/api/v1/news/filter`  
**Purpose:** Filtered news query with date range support.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | No | Stock symbol filter |
| category | string | No | Category filter |
| fromDate | string | No | Start date (ISO 8601 or YYYY-MM-DD) |
| toDate | string | No | End date (ISO 8601 or YYYY-MM-DD) |
| language | string | No | `vi` or `en` |
| page | integer | No | Page number |
| size | integer | No | Results per page |

---

### 11.5 Get System Announcements

**GET** `/api/v1/news/announcement`  
**Purpose:** Retrieve exchange and regulatory announcements.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fromDate | string | No | Start date (YYYY-MM-DD or ISO 8601) |
| toDate | string | No | End date |
| page | integer | No | Page number |
| size | integer | No | Results per page |

**Response 200:** Array with `noticeId`, `title`, `content`.

---

### 11.6 Get Notices

**GET** `/api/v1/news/notices`  
**Purpose:** Retrieve regulatory notices and announcements.

**Query Parameters** — `fromDate`, `toDate` (YYYY-MM-DD), `page`, `size` (all optional)

**Response 200:** Array with `noticeId`, `title`, `content`, `source`, `publishedAt`.

---

### 11.7 Get Notice by ID

**GET** `/api/v1/news/notices/{noticeId}`  

**Path Parameters:** `noticeId` (integer, required)

---

### 11.8 Add News to Favorites

**POST** `/api/v1/news/favorites`  
**Auth:** Public  
**Purpose:** Add a news article to the current user's saved favorites.

**Response 201:** `newsId`, `userId`, `createdAt`

---

### 11.9 Get Favorite News

**GET** `/api/v1/news/favorites`  
**Auth:** Public  
**Purpose:** Get all news articles saved to favorites.

**Query Parameters:** `page`, `size` (optional)

---

### 11.10 Remove from Favorites

**DELETE** `/api/v1/news/favorites`  

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **newsIds** | string | Yes | Comma-separated news IDs to remove |

---

### 11.11 Check if Article is Favorited

**GET** `/api/v1/news/favorites/{newsId}`  

**Path Parameters:** `newsId` (integer, required)  
**Response 200:** `newsId`, `userId`, `createdAt` if favorited.

---

## 12. Fundamentals

All Fundamentals endpoints are **public**.

---

### 12.1 Company Profile

**GET** `/api/v1/fundamentals/profile`  
**Purpose:** Get the company profile for a listed stock — name, sector, listing date, charter capital, and contact info.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **symbol** | string | Yes | Stock symbol (e.g., `VCB`) |

---

### 12.2 Business Information

**GET** `/api/v1/fundamentals/business-info`  
**Purpose:** Get annual business information records for a company.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **symbol** | string | Yes | Stock symbol |
| year | integer | No | Reporting year (defaults to most recent) |

---

### 12.3 Financial Metrics

**GET** `/api/v1/fundamentals/financials`  
**Purpose:** Get consolidated financial data — market cap, P/E, P/B, ROE, EPS, dividend yield.

**Query Parameters:** `symbol` (required)

---

### 12.4 Financial Statements

**GET** `/api/v1/fundamentals/statements`  
**Purpose:** Get financial statements (income statement, balance sheet, cash flow).

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **symbol** | string | Yes | Stock symbol |
| type | string | No | Statement type. Values: `INCOME_STATEMENT`, `BALANCE_SHEET`, `CASH_FLOW` |
| page | integer | No | Page number |
| size | integer | No | Results per page |

---

### 12.5 Shareholders

**GET** `/api/v1/fundamentals/shareholders`  
**Purpose:** Get the latest major shareholder snapshot for a company.

**Query Parameters:** `symbol` (required)

---

### 12.6 Insider Transactions

**GET** `/api/v1/fundamentals/insiders`  
**Purpose:** Get insider transaction history with pagination.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **symbol** | string | Yes | Stock symbol |
| page | integer | No | Page number |
| size | integer | No | Results per page |

---

### 12.7 Financial Ratio Rankings

**GET** `/api/v1/fundamentals/financial-ratio/ranking`  
**Purpose:** Get top stocks ranked by a specific financial ratio.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| market | string | No | Exchange filter. Values: `HOSE`, `HNX`, `UPCOM` |
| financialRatio | string | No | Ratio to rank by. Values: `PE`, `ROE`, `EPS` |
| sortAsc | boolean | No | `true` for ascending, `false` for descending |
| pageNumber | integer | No | Page number |
| pageSize | integer | No | Results per page |

**Response 200:** `total`, `pageNumber`, `pageSize`, `items` array with `symbol`, `pe` (and other ratio fields).

---

### 12.8 Stock Sector Company Overview

**GET** `/api/v1/fundamentals/stock-sector/company-overview`  
**Purpose:** Get company overview — sector, sub-sector, business description, and key stats.

**Query Parameters:** `symbol` (required)

---

## 13. Market Data

All Market Data endpoints are **public**.

---

### 13.1 Get Symbol List

**GET** `/api/v1/market/symbol`  
**Purpose:** Get static information for one or more listed stock symbols — exchange, sector, lot size, and listing status.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbolList | string | No | Comma-separated symbols. Omit to return all active symbols |

**Response 200:** Array with `symbol`, `companyName`, `exchange` (`HOSE`/`HNX`/`UPCOM`), `sector`, `lotSize`.

---

### 13.2 Latest Quotes

**GET** `/api/v1/market/symbol/latest`  
**Purpose:** Get the latest normal-lot quote data for active symbols — reference price, last price, change, and volume.

**Query Parameters:** `symbolList` (comma-separated, optional)

**Response 200:** Array with `symbol`, `referencePrice`, `lastPrice`, `change`, `pctChange`.

---

### 13.3 Odd-Lot Latest Quotes

**GET** `/api/v1/market/symbol/oddlot-latest`  
**Purpose:** Get the latest odd-lot market quote data.

**Query Parameters:** `symbolList` (optional)

**Response 200:** Array with `symbol`, `oddLotPrice`, `oddLotVolume`.

---

### 13.4 Symbol Static Info

**GET** `/api/v1/market/symbol/static-info`  
**Purpose:** Get static reference data (full lot, par value, traded currency) for symbols.

**Query Parameters:** `symbolList` (optional)

---

### 13.5 Tick Size Configuration

**GET** `/api/v1/market/symbol/tick-size-match`  
**Purpose:** Get tick size and price matching configuration for a symbol. Useful for validating order prices before submission.

**Query Parameters:** `symbol` (required)

**Response 200:** `symbol`, `tickSize`, `matchedPrice`.

---

### 13.6 Real-Time Quote

**GET** `/api/v1/market/symbol/{symbol}/quote`  
**Purpose:** Get the current real-time quote for a symbol including bid/ask, last price, volume, and order book depth.

**Path Parameters:** `symbol` (required)

**Response 200:** `symbol`, `lastPrice`, `bidPrice`, `askPrice`, `totalVolume`.

---

### 13.7 Tick Data (Intraday)

**GET** `/api/v1/market/symbol/{symbol}/ticks`  
**Purpose:** Get intraday tick-level trade history for a symbol.

**Path Parameters:** `symbol` (required)

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **tickUnit** | integer | Yes | Number of ticks per data point |
| fromSequence | integer | No | Start sequence number |
| toSequence | integer | No | End sequence number |
| fetchCount | integer | No | Number of records to fetch |

---

### 13.8 Minute Data

**GET** `/api/v1/market/symbol/{symbol}/minutes`  
**Purpose:** Get minute-by-minute OHLCV data for the current or a specified trading session.

**Path Parameters:** `symbol` (required)

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **minuteUnit** | integer | Yes | Aggregation interval in minutes |
| fromTime | string | No | Start time (format: `yyyyMMddHHmmss`) |
| toTime | string | No | End time (format: `yyyyMMddHHmmss`) |
| fetchCount | integer | No | Number of records to return |

---

### 13.9 Periodic OHLCV Data

**GET** `/api/v1/market/symbol/{symbol}/period/{periodType}`  
**Purpose:** Get aggregated OHLCV candle data for a specified period type — for charting.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **symbol** | string | Yes | Stock symbol |
| **periodType** | string | Yes | Aggregation period. Values: `DAILY`, `WEEKLY`, `MONTHLY`, `SIX_MONTH` |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| baseDate | string | No | Reference date (YYYY-MM-DD). Defaults to today |
| fetchCount | integer | No | Number of candles to return |

---

### 13.10 OHLCV Candles

**GET** `/api/v1/market/candles`  
**Purpose:** Get OHLCV candle data for charting with flexible time range.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **symbol** | string | Yes | Stock symbol |
| **timeframe** | string | Yes | Candle interval. Example: `1d` (1 day) |
| fromDate | string | No | Start date (YYYY-MM-DD) |
| toDate | string | No | End date (YYYY-MM-DD) |
| limit | integer | No | Max number of candles |

---

### 13.11 Price Board

**GET** `/api/v1/market/price-board`  
**Purpose:** Get a full price board snapshot for a given market or symbol list — ceiling/floor prices, reference price, last price, bid/ask.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **category** | string | Yes | Market category |
| **symbolList** | string | Yes | Comma-separated symbol list |

**Response 200:** Array with `symbol`, `exchange`, `referencePrice`, `ceilingPrice`, `floorPrice`, `lastPrice`.

---

### 13.12 Foreigner Flow Summary

**GET** `/api/v1/market/symbol/foreigner-summary`  
**Purpose:** Get a summary of foreign investor buy/sell positions across all symbols.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| marketType | string | No | Values: `HOSE`, `HNX`, `UPCOM` |
| sortType | string | No | Sort order. Values: `CODE`, `NET_VALUE`, `NET_VOLUME` |
| offset | integer | No | Pagination offset |
| fetchCount | integer | No | Number of records |

---

### 13.13 Foreigner Flow by Symbol

**GET** `/api/v1/market/symbol/{symbolCode}/foreigner`  
**Purpose:** Get daily foreign investor trading data (buy/sell volume and value) for a specific symbol.

**Path Parameters:** `symbolCode` (required)

**Query Parameters:** `fromDate`, `toDate` (YYYY-MM-DD, optional)

---

### 13.14 Index List

**GET** `/api/v1/market/index/list`  
**Purpose:** Get the list of all available market indices.

**Query Parameters:** `market` (HOSE/HNX/UPCOM, optional)

**Response 200:** Array with `indexCode`, `name`, `exchange`.

---

### 13.15 Index Constituent Stocks

**GET** `/api/v1/market/index-stock-list/{indexCode}`  
**Purpose:** Get the list of stocks in a specific index and their weights.

**Path Parameters:** `indexCode` (required)

**Response 200:** Array with `symbol`, `weight`, `exchange`.

---

### 13.16 Put-Through Advertised Orders

**GET** `/api/v1/market/putthrough/advertise`  
**Purpose:** Get the current list of put-through (negotiated deal) advertised orders.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| marketType | string | No | Values: `ALL`, `HOSE`, `HNX`, `UPCOM` |
| sellBuyType | string | No | Filter by side. Values: `B` (buy), `S` (sell) |
| offset | integer | No | Pagination offset |
| fetchCount | integer | No | Number of records |

---

### 13.17 Put-Through Completed Deals

**GET** `/api/v1/market/putthrough/deal`  
**Purpose:** Get completed put-through deal history.

**Query Parameters:** `marketType`, `offset`, `fetchCount` (optional)

---

### 13.18 Stock Rankings

**GET** `/api/v1/market/ranking/up-down`  
**Purpose:** Get stocks ranked by upward or downward price movement.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| marketType | string | No | `ALL`, `HOSE`, `HNX`, `UPCOM` |
| upDownType | string | No | `UP` or `DOWN` |
| offset | integer | No | Pagination offset |
| fetchCount | integer | No | Number of records |

---

### 13.19 Top Stocks by Volume / Value

**GET** `/api/v1/market/ranking/{symbolType}/trade`  
**Purpose:** Get trading volume or value rankings.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **symbolType** | string | Yes | Values: `STOCK`, `ETF`, `BOND`, `FUTURES` |

**Query Parameters:** `marketType`, `sortType`, `offset`, `fetchCount` (optional)

---

### 13.20 Foreign Investor Rankings

**GET** `/api/v1/market/ranking/foreigner`  
**Purpose:** Get stocks ranked by net foreign buy/sell activity.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **type** | string | Yes | Ranking type |
| market | string | No | `HOSE`, `HNX`, `UPCOM` |

---

### 13.21 Market Session Status

**GET** `/api/v1/market/session-status`  
**Purpose:** Get the current trading session status for all exchanges.

**Query Parameters:** `market`, `type` (optional)

**Response 200:** Session status per exchange (`HOSE`, `HNX`, `UPCOM`) — values: `OPEN`, `CLOSED`, `ATO`, `ATC`, `PRE_OPEN`.

---

### 13.22 Last Trading Date

**GET** `/api/v1/market/last-trading-date`  
**Purpose:** Get the most recent trading date for each exchange.

**Response 200:** Dates for `HOSE`, `HNX`, `UPCOM`.

---

### 13.23 ETF NAV

**GET** `/api/v1/market/etf/{symbolCode}/nav/daily`  
**Purpose:** Get daily NAV (Net Asset Value) history for an ETF.

**Path Parameters:** `symbolCode` (required)

**Query Parameters:** `baseDate` (YYYY-MM-DD), `fetchCount` (optional)

---

### 13.24 Top AI-Rated Stocks

**GET** `/api/v1/market/top-ai-rating`  
**Purpose:** Get stocks with the highest AI-generated buy ratings.

**Query Parameters:** `fetchCount`, `lastOverAll`, `lastCode` (optional)

---

### 13.25 Top Foreign Trading Stocks

**GET** `/api/v1/market/top-foreigner-trading`  
**Purpose:** Get top stocks by foreign investor net trading activity.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| marketType | string | No | `HOSE`, `HNX`, `UPCOM` |
| upDownType | string | No | `UP` (net buy) or `DOWN` (net sell) |
| offset | integer | No | Pagination offset |
| fetchCount | integer | No | Number of records |

---

## 14. Social

---

### 14.1 Create Post

**POST** `/api/v1/social/posts`  
**Auth:** Public (login recommended for post attribution)  
**Purpose:** Create a new social post. Posts can include text, cashtag mentions (`$VCB`), and media references.

**Response 201**

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Post ID |
| authorId | integer | ID of the post author |
| body | string | Post text content |
| sourceType | string | Always `USER` for user-created posts |
| likeCount | integer | Number of likes (starts at 0) |
| cashtags | array | Stock symbols mentioned with `$` prefix |
| createdAt | string | Creation timestamp |
| updatedAt | string | Last update timestamp |

---

### 14.2 Get Post

**GET** `/api/v1/social/posts/{id}`  
**Auth:** Public  
**Purpose:** Retrieve a single post by ID.

**Path Parameters:** `id` (integer, required)

---

### 14.3 Update Post

**PUT** `/api/v1/social/posts/{id}`  
**Auth:** Public (must be post owner)  
**Purpose:** Edit an existing post.

**Path Parameters:** `id` (integer, required)

---

### 14.4 Delete Post

**DELETE** `/api/v1/social/posts/{id}`  
**Auth:** Public (must be post owner)  

**Path Parameters:** `id` (integer, required)

---

### 14.5 Like Post

**POST** `/api/v1/social/posts/{id}/likes`  
**Auth:** Public  

**Path Parameters:** `id` (integer, required)

---

### 14.6 Unlike Post

**DELETE** `/api/v1/social/posts/{id}/likes`  
**Auth:** Public  

**Path Parameters:** `id` (integer, required)

---

### 14.7 Follow User

**POST** `/api/v1/social/users/{id}/follows`  
**Auth:** Public  

**Path Parameters:** `id` (integer, required — target user ID)

---

### 14.8 Unfollow User

**DELETE** `/api/v1/social/users/{id}/follows`  

**Path Parameters:** `id` (integer, required)

---

### 14.9 Get Followers

**GET** `/api/v1/social/users/{id}/followers`  
**Purpose:** Get users following a specific user. Uses cursor-based pagination.

**Path Parameters:** `id` (integer, required)

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cursor | string | No | Pagination cursor from previous response |
| limit | integer | No | Results per page (default 20) |

**Response 200:** `users` array with `userId`, `createdAt`; `nextCursor` for pagination.

---

### 14.10 Get Following

**GET** `/api/v1/social/users/{id}/following`  
**Purpose:** Get users that a specific user follows.

**Path Parameters:** `id` (integer, required)

**Query Parameters:** `cursor`, `limit` (optional)

---

### 14.11 Block User

**POST** `/api/v1/social/users/{id}/blocks`  
**Auth:** Public (must be logged in)  
**Purpose:** Block a user — they will no longer appear in the timeline or be able to interact with the blocker's content.

**Path Parameters:** `id` (integer, required — user to block)

---

### 14.12 Unblock User

**DELETE** `/api/v1/social/users/{id}/blocks`  

**Path Parameters:** `id` (integer, required)

---

### 14.13 Get User's Posts

**GET** `/api/v1/social/users/{id}/posts`  
**Purpose:** Get all posts by a specific user.

**Path Parameters:** `id` (integer, required)

**Query Parameters:** `cursor`, `pageSize` (default 20, optional)

---

### 14.14 Get Timeline Feed

**GET** `/api/v1/social/timeline`  
**Auth:** Public (login for personalized feed)  
**Purpose:** Retrieve the social timeline — a mix of posts from followed users and news. Supports cursor-based pagination.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filter | string | No | Filter by content type. Values: `ALL`, `USER`, `NEWS` |
| cursor | string | No | Pagination cursor (ISO date) from previous response |
| pageSize | integer | No | Results per page, 1–50 (default 20) |

---

### 14.15 Cashtag Feed

**GET** `/api/v1/social/cashtags/{symbol}`  
**Purpose:** Get all social posts that mention a specific stock cashtag.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **symbol** | string | Yes | Stock symbol without the `$` prefix (e.g., `VCB`) |

**Query Parameters:** `cursor`, `pageSize` (optional)

---

## 15. Insights — Watchlists

All Insights endpoints require **Bearer Token**.

---

### 15.1 Create Watchlist

**POST** `/api/v1/insights/watchlists`  
**Purpose:** Create a new named watchlist for organizing tracked stocks.

**Request Body:** Watchlist name and optional configuration.

**Response 201:** Watchlist created with ID.

---

### 15.2 Get Watchlists

**GET** `/api/v1/insights/watchlists`  
**Purpose:** Get all watchlists for the authenticated user.

**Response 200:** Array of watchlists with IDs, names, and symbol counts.

---

### 15.3 Edit Watchlist

**PUT** `/api/v1/insights/watchlists`  
**Purpose:** Rename an existing watchlist.

---

### 15.4 Delete Watchlist

**DELETE** `/api/v1/insights/watchlists/{watchlistId}`  
**Path Parameters:** `watchlistId` (string, required)

---

### 15.5 Reorder Watchlists

**PUT** `/api/v1/insights/watchlists/sequence`  
**Purpose:** Update the display order of the user's watchlists.

---

### 15.6 Add Symbol to Watchlist

**POST** `/api/v1/insights/watchlists/symbol`  
**Purpose:** Add a stock symbol to a watchlist.

**Request Body:** `watchlistId`, `symbol`.

---

### 15.7 Get Watchlist Symbols

**GET** `/api/v1/insights/watchlists/symbol`  
**Purpose:** Get all symbols in a specific watchlist with their latest market data.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **watchlistId** | integer | Yes | Watchlist identifier |

---

### 15.8 Remove Symbol from Watchlist

**DELETE** `/api/v1/insights/watchlists/symbol`

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **watchlistId** | string | Yes | Watchlist identifier |
| **symbol** | string | Yes | Symbol to remove |

---

### 15.9 Check Symbol in Watchlists

**GET** `/api/v1/insights/watchlists/symbol/include`  
**Purpose:** Check whether a symbol is present in any of the user's watchlists.

**Query Parameters:** `symbol` (required)

**Response 200:** Boolean and which watchlists contain the symbol.

---

## 16. Insights — Notifications

---

### 16.1 Get Market Alert Notifications

**GET** `/api/v1/insights/notifications`  
**Auth:** Bearer Token required  
**Purpose:** Get market alert notifications (price alerts, technical signals) for the user.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | Notification type filter (default `ALL`) |
| keyword | string | No | Search keyword |
| fromDate | string | No | Start date (YYYYMMDD) |
| toDate | string | No | End date (YYYYMMDD) |
| pageSize | integer | No | Results per page (default 20) |
| pageNumber | integer | No | Page number (default 0) |

---

### 16.2 Delete Notifications

**DELETE** `/api/v1/insights/notifications`  
**Auth:** Bearer Token required  
**Purpose:** Soft-delete notifications for the user.

---

### 16.3 Get Notification Inbox

**GET** `/api/v1/insights/notifications/inbox`  
**Auth:** Bearer Token required  
**Purpose:** Get in-app notification inbox items — system alerts, trading updates, social interactions.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pageNumber | integer | No | 1-based page number (default 1) |
| pageSize | integer | No | Results per page, max 100 (default 20) |
| type | string | No | Notification type filter |

---

### 16.4 Mark Notifications as Read

**POST** `/api/v1/insights/notifications/reads`  
**Auth:** Bearer Token required  
**Purpose:** Mark one or more notifications as read.

---

### 16.5 Get Unread Notification Count

**GET** `/api/v1/insights/notifications/unread-count`  
**Auth:** Bearer Token required  
**Purpose:** Get the count of unread notifications for the user.

**Response 200:** `count` integer.

---

### 16.6 Save Notification Preferences

**PUT** `/api/v1/insights/settings/notification-preferences`  
**Auth:** Bearer Token required  
**Purpose:** Update per-type notification preferences (push, email, etc.).

---

### 16.7 Get Notification Settings

**GET** `/api/v1/insights/settings/notifications`  
**Auth:** Bearer Token required  
**Purpose:** Get news and market notification settings for the user.

---

### 16.8 Update Notification Settings

**PATCH** `/api/v1/insights/settings/notifications`  
**Auth:** Bearer Token required  
**Purpose:** Partially update notification settings.

---

## 17. Insights — Search History

---

### 17.1 Record Search

**POST** `/api/v1/insights/search-history`  
**Auth:** Bearer Token required  
**Purpose:** Record a stock symbol search to the user's search history for quick access later.

---

### 17.2 Get Search History

**GET** `/api/v1/insights/search-history`  
**Auth:** Bearer Token required  
**Purpose:** Get the user's recent symbol search history.

---

### 17.3 Delete Search History

**DELETE** `/api/v1/insights/search-history`  
**Auth:** Bearer Token required  
**Purpose:** Delete search history entries.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | No | Symbol to delete. Omit to clear all history |

---

### 17.4 Top Searched Symbols

**GET** `/api/v1/insights/search-stats/top`  
**Auth:** Bearer Token required  
**Purpose:** Get globally most-searched symbols — useful for a trending/popular stocks feature.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Number of results, max 50 (default 10) |

---

## 18. Virtual Trading — Accounts & Portfolios

All Virtual Trading endpoints require **Bearer Token**.

---

### 18.1 Initialize Virtual Account

**POST** `/api/v1/virtual/accounts`  
**Purpose:** Initialize the virtual trading account for the authenticated user. Must be called before any virtual orders can be placed.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subAccount | string | No | Sub-account identifier |
| name | string | No | Portfolio display name |
| quota | number | No | Starting virtual cash amount |

**Response 201:** `subAccount`, `name`, `quota`.

---

### 18.2 Get 1-Month Normalized NAV

**GET** `/api/v1/virtual/accounts/one-month-normalized-nav`  
**Purpose:** Get the 1-month normalized NAV (Net Asset Value) performance chart for the virtual account.

**Response 200:** `subAccount`, `normalizedNav`, `chartData` (time series).

---

### 18.3 List Sub-Accounts

**GET** `/api/v1/virtual/sub-accounts`  
**Purpose:** List all active virtual trading sub-accounts for the user.

**Response 200:** Array of sub-accounts with `subAccount`, `name`.

---

### 18.4 Create Portfolio

**POST** `/api/v1/virtual/portfolios`  
**Purpose:** Create a new named portfolio within the virtual trading account. Users can run multiple virtual portfolios with different strategies.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subAccount | string | No | Sub-account identifier |
| name | string | No | Portfolio name |
| quota | number | No | Virtual cash allocation |

**Response 201:** `subAccount`, `name`, `quota`.

---

### 18.5 Update Portfolio

**PUT** `/api/v1/virtual/portfolios/{portfolioId}`  
**Path Parameters:** `portfolioId` (string, required)

---

### 18.6 Follow Virtual Account

**POST** `/api/v1/virtual/accounts/follows`  
**Purpose:** Follow another user's virtual trading account to track their performance and see their trades.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| followedId | integer | No | User ID of the account to follow |
| type | string | No | Follow type (MUTED to follow without notifications) |

**Response 201:** `followId`, `followedId`.

---

### 18.7 Update Follow

**PUT** `/api/v1/virtual/accounts/follows/{followId}`  
**Path Parameters:** `followId` (integer, required)

**Response 200:** `followId`, `status` (e.g., `MUTED`).

---

### 18.8 Unfollow Virtual Account

**DELETE** `/api/v1/virtual/accounts/follows/{followedId}`  
**Path Parameters:** `followedId` (integer, required)

---

### 18.9 Get Followers

**GET** `/api/v1/virtual/accounts/followers`  

**Query Parameters:** `page` (zero-based), `size` (1–100, default 20, optional)

---

### 18.10 Get Following Accounts

**GET** `/api/v1/virtual/accounts/following-accounts`  

**Query Parameters:** `page`, `size` (optional)

---

## 19. Virtual Trading — Equity Orders

---

### 19.1 Place Equity Order

**POST** `/api/v1/virtual/equity/orders`  
**Auth:** Bearer Token required  
**Purpose:** Place a buy or sell limit order on the virtual trading account. Orders are simulated against real market prices.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subAccount | string | No | Sub-account to place the order in |
| code | string | No | Stock symbol (e.g., `VCB`) |
| quantity | integer | No | Number of shares (must be a multiple of lot size) |
| price | number | No | Limit price |
| orderCommand | string | No | Order type (e.g., `LO` for limit order) |
| action | string | No | `BUY` or `SELL` |

**Response 201:** `orderId`, `code`, `quantity`, `price`, `status` (`PENDING`).

---

### 19.2 Modify Equity Order

**PUT** `/api/v1/virtual/equity/orders/{orderId}`  
**Purpose:** Modify a pending order's price or quantity. Only orders in `PENDING` status can be modified.

**Path Parameters:** `orderId` (integer, required)

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| newPrice | number | No | New limit price |
| newQuantity | integer | No | New quantity |

---

### 19.3 Cancel Equity Order

**DELETE** `/api/v1/virtual/equity/orders/{orderId}`  
**Path Parameters:** `orderId` (integer, required)

---

### 19.4 Cancel Multiple Orders

**POST** `/api/v1/virtual/equity/orders/cancellations`  
**Purpose:** Cancel multiple pending orders in a single request.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderIds | array of integers | No | List of order IDs to cancel |

**Response 200:** `cancelledCount`.

---

### 19.5 Order History

**GET** `/api/v1/virtual/equity/orders/history`  
**Purpose:** Get the complete order history for the virtual trading account.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| subAccount | string | No | Filter by sub-account |
| fromDate | string | No | Start date (YYYY-MM-DD) |
| toDate | string | No | End date (YYYY-MM-DD) |
| page | integer | No | 1-based page number (default 1) |
| size | integer | No | Results per page, max 100 (default 20) |

---

### 19.6 Place Stop-Limit Order

**POST** `/api/v1/virtual/equity/orders/stop-limit`  
**Purpose:** Place a stop-limit order — a limit order that is automatically submitted when the stop price is reached.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subAccount | string | No | Sub-account identifier |
| stockCode | string | No | Stock symbol |
| sellBuyType | string | No | `B` (buy) or `S` (sell) |
| stopPrice | number | No | Trigger price — order is submitted when market reaches this price |
| limitPrice | number | No | Limit price of the submitted order |
| orderQuantity | integer | No | Number of shares |
| fromDate | string | No | Order validity start (YYYY-MM-DD) |
| toDate | string | No | Order validity end (YYYY-MM-DD) |

---

### 19.7 Modify / Cancel Stop-Limit Order

**PUT** `/api/v1/virtual/equity/orders/stop-limit` — modify  
**DELETE** `/api/v1/virtual/equity/orders/stop-limit/{orderId}` — cancel  

---

### 19.8 Place Stop Order

**POST** `/api/v1/virtual/equity/stop-orders`  
**Purpose:** Place a stop (market) order — a market order submitted when the stop price is reached.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subAccount | string | No | Sub-account identifier |
| stockCode | string | No | Stock symbol |
| sellBuyType | string | No | `B` (buy) or `S` (sell) |
| stopPrice | number | No | Trigger price |
| orderType | string | No | Order type |
| fromDate | string | No | Validity start |
| toDate | string | No | Validity end |

---

### 19.9 Most Bought Stocks

**GET** `/api/v1/virtual/equity/orders/most-bought-stock`  
**Purpose:** Get the stocks most frequently bought by virtual traders. Useful for social/trending features.

**Query Parameters:** `fromDate`, `toDate`, `limit` (optional)

**Response 200:** `items` array with `code`, `boughtCount`.

---

### 19.10 Most Sold Stocks

**GET** `/api/v1/virtual/equity/orders/most-sold-stock`  

**Query Parameters:** `fromDate`, `toDate`, `limit` (optional)

---

## 20. Virtual Trading — P&L & Analytics

---

### 20.1 Total Profit/Loss

**GET** `/api/v1/virtual/equity/account/profit-loss`  
**Auth:** Bearer Token required  
**Purpose:** Get total (unrealized + realized) profit/loss for the virtual account.

**Response 200:** P&L summary including open position gains and closed trade returns.

---

### 20.2 Daily Profit/Loss

**GET** `/api/v1/virtual/equity/account/daily-profit-loss`  
**Purpose:** Get daily P&L breakdown for performance tracking.

---

### 20.3 Cumulative Profit/Loss

**GET** `/api/v1/virtual/equity/account/accumulative-profit-loss`  
**Purpose:** Get cumulative P&L over time — useful for charting portfolio performance.

---

### 20.4 Realized Profit/Loss

**GET** `/api/v1/virtual/equity/account/realized-profit-loss`  
**Purpose:** Get realized (closed trade) profit/loss.

---

### 20.5 Realized P&L History

**GET** `/api/v1/virtual/equity/account/realized-profit-loss/history`  
**Purpose:** Get historical realized P&L per trade.

---

### 20.6 Buyable Symbols

**GET** `/api/v1/virtual/equity/account/buyable`  
**Purpose:** Get the list of symbols that can currently be bought with available virtual cash.

---

### 20.7 Sellable Symbols

**GET** `/api/v1/virtual/equity/account/sellable`  
**Purpose:** Get positions that can currently be sold.

---

### 20.8 Following Account P&L

**GET** `/api/v1/virtual/equity/account/following-profit-loss`  
**Purpose:** Get P&L data for a followed user's virtual trading account.

---

## 21. Virtual Trading — Contests

---

### 21.1–21.n Virtual Contest Endpoints

Virtual trading contests allow users to compete in paper-trading competitions.

Key operations:
- **List contests** — `GET /api/v1/virtual/contests`
- **Join contest** — `POST /api/v1/virtual/contests/{contestId}/join`
- **Leave contest** — `DELETE /api/v1/virtual/contests/{contestId}/join`
- **Get leaderboard** — `GET /api/v1/virtual/contests/{contestId}/leaderboard`
- **Get contest P&L** — `GET /api/v1/virtual/contests/{contestId}/profit-loss`

---

## 22. Live Trading — Contests & Leaderboards

---

### 22.1 List Live Contests

**GET** `/api/v1/live/contests`  
**Auth:** Bearer Token required  
**Purpose:** List available live trading contests.

---

### 22.2 Book a Contest

**POST** `/api/v1/live/contests/{contestId}/bookings`  
**Path Parameters:** `contestId` (string, required)

---

### 22.3 Join a Contest

**POST** `/api/v1/live/contests/{contestId}/join`  
**Path Parameters:** `contestId` (string, required)

---

### 22.4 Contest Leaderboard

**GET** `/api/v1/live/contests/{contestId}/leaderboard`  
**Path Parameters:** `contestId` (string, required)

---

### 22.5 Contest Profit/Loss

**GET** `/api/v1/live/contests/{contestId}/profit-loss`  

---

### 22.6 Global Leaderboards

**GET** `/api/v1/live/leaderboards`  
**Purpose:** Get global live trading leaderboard rankings.

---

## 23. NHSV Equity — Account Information

All NHSV endpoints require **Bearer Token**. Most require an `accountNumber` parameter.

**Important:** NHSV endpoints interact with the real NHSV brokerage backend. Errors may include `502 Bad Gateway` if the NHSV system is unavailable.

---

### 23.1 Account Profile

**GET** `/api/v1/live/nhsv/equity/account/profile`  
**Purpose:** Get the NHSV brokerage account profile — registered name, email, phone, address, KYC status.

**Response 200:** `accountNumber`, `email`, `phone`, `address`, `fullName`, `nationalId`, `accountStatus`, `accountType`, `openDate`.

---

### 23.2 Asset Summary

**GET** `/api/v1/live/nhsv/equity/account/asset-info`  
**Purpose:** Get total asset breakdown — cash, securities value, unrealized gain/loss.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **accountNumber** | string | Yes | NHSV brokerage account number |
| subNumber | string | No | Sub-account number |

**Response 200:** `totalAsset`, `cash`, `securities`, `unrealizedGain`, `currency`, `asOfDate`.

---

### 23.3 Cash Balance

**GET** `/api/v1/live/nhsv/equity/account/cash-balance`  
**Purpose:** Get detailed cash balance — available cash, margin, and deposit breakdown.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **accountNumber** | string | Yes | NHSV account number |
| subNumber | string | No | Sub-account number |
| bankAccount | string | No | Linked bank account filter |
| bankCode | string | No | Bank code filter |

**Response 200:** `cashBalance`, `availableCash`, `margin`, `deposits`, `currency`, `lastUpdated`.

---

### 23.4 Stock Holdings

**GET** `/api/v1/live/nhsv/equity/account/stock-balance`  
**Purpose:** Get current stock holdings with cost basis and unrealized P&L.

**Query Parameters:** `accountNumber` (required), `subNumber` (optional)

**Response 200:** `holdings` array with `symbol`, `quantity`, `costPrice`, `currentPrice`, `totalValue`, `gainLoss`; `totalHoldingsValue`.

---

### 23.5 Sellable Positions

**GET** `/api/v1/live/nhsv/equity/account/sellable`  
**Purpose:** Get sellable stock positions — shows T+0, T+1, T+2 settlement availability to prevent over-selling.

**Query Parameters:** `accountNumber` (required), `subNumber`, `stockCode` (optional)

**Response 200:** `positions` array with `stockCode`, `balanceQuantity`, `sellableQuantity`, `t1Buy`, `t2Buy`, `t1Sell`, `t2Sell`, `todayBuy`, `todaySell`.

---

### 23.6 Buyable Quantity

**GET** `/api/v1/live/nhsv/equity/account/buyable`  
**Purpose:** Get maximum buyable quantity and purchasing power for a specific symbol at a given price.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **accountNumber** | string | Yes | NHSV account number |
| **stockCode** | string | Yes | Stock symbol to buy |
| **orderPrice** | number | Yes | Intended order price — used to calculate max quantity |
| subNumber | string | No | Sub-account number |
| securitiesType | string | No | Securities type |
| marketType | string | No | Market type |

**Response 200:** `buyableQuantity`, `buyingPower`, `depositAmount`, `lackAmount`, `marginLimitation`.

---

### 23.7 Linked Banks

**GET** `/api/v1/live/nhsv/equity/account/banks`  
**Purpose:** List all bank accounts linked to the NHSV account for fund transfers.

**Query Parameters:** `accountNumber` (required)

**Response 200:** `linkedBanks` array with `bankId`, `bankName`, `accountNumber`, `accountHolder`, `status`, `linkedDate`.

---

### 23.8 Margin Ratio

**GET** `/api/v1/live/nhsv/equity/account/margin`  
**Purpose:** Get margin ratio for a symbol — maximum loan percentage for margin trading.

**Query Parameters:** `symbol` (optional)

**Response 200:** `symbol`, `marginRatio`, `marginType`, `maxLoanAmount`, `effectiveDate`.

---

### 23.9 Daily Profit/Loss

**GET** `/api/v1/live/nhsv/equity/account/daily-profit`  
**Purpose:** Get today's realized and unrealized P&L for the account.

**Query Parameters:** `accountNumber` (required), `subNumber` (optional)

**Response 200:** `dailyProfit`, `dailyLoss`, `netDailyPnL`, `openingBalance`, `closingBalance`, `tradingDate`.

---

### 23.10 Transaction History

**GET** `/api/v1/live/nhsv/equity/account/transaction-history`  
**Purpose:** Get buy/sell transaction history.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **accountNumber** | string | Yes | NHSV account number |
| subNumber | string | No | Sub-account number |
| fromDate | string | No | Start date (YYYY-MM-DD) |
| toDate | string | No | End date (YYYY-MM-DD) |

**Response 200:** `transactions` array with `transactionId`, `date`, `type` (BUY/SELL), `symbol`, `quantity`, `price`, `amount`, `fee`, `status`.

---

### 23.11 Loan History

**GET** `/api/v1/live/nhsv/equity/account/loan-history`  
**Purpose:** Get margin loan history.

**Query Parameters:** `accountNumber` (required), `fromDate`, `toDate` (optional)

**Response 200:** `loanHistory` with `loanId`, `loanDate`, `loanAmount`, `interestRate`, `dueDate`, `remainingBalance`.

---

### 23.12 Realized P&L History

**GET** `/api/v1/live/nhsv/equity/account/profit-loss/history`  
**Purpose:** Get historical realized P&L per trade.

**Query Parameters:** `accountNumber` (required), `subNumber`, `fromDate`, `toDate` (optional)

---

### 23.13 Trading Summary

**GET** `/api/v1/live/nhsv/equity/account/trading-summary`  
**Purpose:** Get aggregated trading statistics — total buy/sell volume, fees, win rate.

**Query Parameters:** `accountNumber` (required), `fromDate`, `toDate` (optional)

**Response 200:** `buyTransactions`, `sellTransactions`, `totalBuyValue`, `totalSellValue`, `totalFees`, `netProfit`, `winRate`, `averageTradeSize`.

---

## 24. NHSV Equity — Orders

**Important:** Order endpoints require:
- `Authorization: Bearer <token>`
- `X-Idempotency-Key` header — a unique client-generated key per request to prevent duplicate orders on retry
- `X-OTP` header — for new order placement (2FA OTP)

---

### 24.1 Confirm Order

**POST** `/api/v1/live/nhsv/equity/order/confirm`  
**Purpose:** Submit an order for confirmation (pre-trade confirmation step).

**Headers:** `X-Idempotency-Key` (required)

**Response 200:** `orderNumber`, `confirmationStatus`, `confirmTime`.

---

### 24.2 Get Pending Confirmations

**GET** `/api/v1/live/nhsv/equity/order/confirm`  
**Purpose:** List orders that require user confirmation before execution.

**Query Parameters:** `accountNumber` (required), `subNumber` (optional)

---

### 24.3 Place Advance Order

**POST** `/api/v1/live/nhsv/equity/order/advance`  
**Purpose:** Place an advance (pre-scheduled) order to execute on a future date.

**Headers:** `X-Idempotency-Key` (required), `X-OTP` (required)

**Response 200:** `orderId`, `stockCode`, `orderType`, `advanceOrderDate`, `status`.

---

### 24.4 Cancel Advance Order

**PUT** `/api/v1/live/nhsv/equity/order/advance/cancel`  
**Headers:** `X-Idempotency-Key` (required)

---

### 24.5 Advance Order History

**GET** `/api/v1/live/nhsv/equity/order/advance/history`  

**Query Parameters:** `accountNumber` (required), `fromDate`, `toDate` (optional)

---

### 24.6 Cancel Order

**PUT** `/api/v1/live/nhsv/equity/order/cancel`  
**Purpose:** Cancel a specific pending live equity order.

**Headers:** `X-Idempotency-Key` (required)

**Response 200:** `orderNumber`, `orderStatus` (`CANCELLED`), `cancelTime`.

---

### 24.7 Cancel All Orders

**PUT** `/api/v1/live/nhsv/equity/order/cancel/all`  
**Purpose:** Cancel all pending live equity orders for the account.

**Headers:** `X-Idempotency-Key` (required)

**Response 200:** `cancelledOrders` count and array of cancelled order numbers.

---

### 24.8 Modify Order

**PUT** `/api/v1/live/nhsv/equity/order/modify`  
**Purpose:** Modify price or quantity of a pending live order.

**Headers:** `X-Idempotency-Key` (required)

**Response 200:** `orderNumber`, `newOrderPrice`, `newOrderQuantity`, `modifyTime`.

---

### 24.9 Modify All Orders

**PUT** `/api/v1/live/nhsv/equity/order/modify/all`  
**Purpose:** Apply bulk modification to all pending orders.

**Headers:** `X-Idempotency-Key` (required)

---

### 24.10 Change Trading Password

**PUT** `/api/v1/live/nhsv/equity/account/change-password`  
**Purpose:** Change the NHSV HTS (Home Trading System) password.

---

### 24.11 Change HTS Password

**PUT** `/api/v1/live/nhsv/equity/account/change-htspassword`  
**Purpose:** Change the NHSV HTS password (alternate endpoint, equivalent to 24.10).

---

### 24.12 Change Order PIN

**PUT** `/api/v1/live/nhsv/equity/account/change-pin`  
**Purpose:** Change the NHSV order confirmation PIN.

---

## 25. NHSV Equity — Transfers & Loans

---

### 25.1 Deposit Funds

**POST** `/api/v1/live/nhsv/equity/transfers/deposit`  
**Auth:** Bearer Token required  
**Purpose:** Initiate a fund deposit from a linked bank account to the trading account.

---

### 25.2 Withdraw Funds

**POST** `/api/v1/live/nhsv/equity/transfers/withdraw`  
**Purpose:** Initiate a withdrawal from the trading account to a linked bank account.

---

### 25.3 Transfer History

**GET** `/api/v1/live/nhsv/equity/transfers/history`  
**Purpose:** Get history of deposits and withdrawals.

---

### 25.4 Loan Information

**GET** `/api/v1/live/nhsv/equity/loans`  
**Purpose:** Get current margin loan details.

---

### 25.5 Repay Loan

**POST** `/api/v1/live/nhsv/equity/loans/repay`  
**Purpose:** Initiate a margin loan repayment.

---

### 25.6 Stock Rights

**GET** `/api/v1/live/nhsv/equity/rights`  
**Purpose:** Get pending stock rights and corporate actions for the account.

---

## 26. NHSV Derivatives — Account Information

---

### 26.1 Account Balance

**GET** `/api/v1/live/nhsv/derivatives/account/balance`  
**Auth:** Bearer Token required  
**Purpose:** Get the derivatives account's total balance, maintenance margin, and available balance.

**Query Parameters:** `accountNumber` (required)

**Response 200:** `balance`, `maintenanceMargin`, `availableBalance`, `currency`, `lastUpdateTime`.

---

### 26.2 Account Equity

**GET** `/api/v1/live/nhsv/derivatives/account/equity`  
**Purpose:** Get equity breakdown — total equity, cash, margin used/available.

**Query Parameters:** `accountNumber` (required)

---

### 26.3 Account Summary

**GET** `/api/v1/live/nhsv/derivatives/account/summary`  
**Purpose:** Comprehensive account snapshot — equity, margin, open position count, P&L, risk level.

**Query Parameters:** `accountNumber` (required)

**Response 200:** `totalEquity`, `cashBalance`, `marginUsed`, `marginAvailable`, `openPositionCount`, `unrealizedPL`, `totalPL`, `riskLevel`.

---

### 26.4 Trading Limits

**GET** `/api/v1/live/nhsv/derivatives/account/trading-limit`  
**Purpose:** Get daily buy/sell limits, position size limits, and max leverage.

**Query Parameters:** `accountNumber` (required)

**Response 200:** `dailyBuyingLimit`, `dailyBuyingRemaining`, `maxPositionLimit`, `currentPositionSize`, `maxLeverageAllowed`, `currentLeverage`.

---

### 26.5 Open Positions

**GET** `/api/v1/live/nhsv/derivatives/account/open-position`  
**Purpose:** List all open futures positions.

**Query Parameters:** `accountNumber` (required)

**Response 200:** `openPositions` array with `symbol`, `quantity`, `entryPrice`, `currentPrice`, `unrealizedPL`, `positionType` (LONG/SHORT), `openDate`.

---

### 26.6 Profit/Loss

**GET** `/api/v1/live/nhsv/derivatives/account/profit-loss`  
**Purpose:** Get realized and unrealized P&L, trade count, win rate.

**Query Parameters:** `accountNumber` (required), `tradingDate` (optional)

---

### 26.7 Cumulative P&L

**GET** `/api/v1/live/nhsv/derivatives/account/profit-loss/cumulative`  
**Purpose:** Get cumulative P&L over a date range.

**Query Parameters:** `accountNumber` (required), `fromDate`, `toDate` (optional)

---

### 26.8 Risk Ratio

**GET** `/api/v1/live/nhsv/derivatives/account/risk-ratio`  
**Purpose:** Get risk metrics — risk ratio, leverage ratio, margin ratio, drawdown ratio.

**Query Parameters:** `accountNumber` (required)

**Response 200:** `riskRatio`, `leverageRatio`, `marginRatio`, `drawdownRatio`, `riskLevel`.

---

### 26.9 Available Quantity

**GET** `/api/v1/live/nhsv/derivatives/order/available`  
**Purpose:** Get available quantity for a derivatives contract — max buy/sell quantities given current positions and margin.

**Query Parameters:** `accountNumber` (required), `symbol` (optional)

**Response 200:** `contractCode`, `availableQuantity`, `openPosition`, `maxBuyQuantity`, `maxSellQuantity`.

---

### 26.10 Closed Position History

**GET** `/api/v1/live/nhsv/derivatives/history/closed-position`  
**Purpose:** Get history of all closed derivatives positions.

**Query Parameters:** `accountNumber` (required), `fromDate`, `toDate` (optional)

**Response 200:** `closedPositions` array with `symbol`, `quantity`, `entryPrice`, `exitPrice`, `realizedPL`, `positionType`, `openDate`, `closeDate`.

---

### 26.11 Position History

**GET** `/api/v1/live/nhsv/derivatives/history/position`  
**Purpose:** Get historical position data including daily snapshots.

**Query Parameters:** `accountNumber` (required), `fromDate`, `toDate` (optional)

---

### 26.12 Trade History

**GET** `/api/v1/live/nhsv/derivatives/history/trade`  
**Purpose:** Get all executed trade records.

**Query Parameters:** `accountNumber` (required), `fromDate`, `toDate` (optional)

**Response 200:** `tradeDate`, `orderNumber`, `contractCode`, `tradePrice`, `tradeQuantity`, `side` (BUY/SELL), `commission`.

---

### 26.13 Settlement History

**GET** `/api/v1/live/nhsv/derivatives/history/settlement`  
**Purpose:** Get daily settlement history — settlement price and daily P&L per contract.

**Query Parameters:** `accountNumber` (required), `fromDate`, `toDate` (optional)

---

### 26.14 Margin Call History

**GET** `/api/v1/live/nhsv/derivatives/history/margin-call`  
**Purpose:** Get margin call events — critical for risk monitoring.

**Query Parameters:** `accountNumber` (required), `fromDate`, `toDate` (optional)

**Response 200:** `marginCallDate`, `marginCallAmount`, `marginCallLevel` (e.g., `LEVEL_1`), `status`, `dueDate`.

---

## 27. NHSV Derivatives — Orders & Stop Orders

**Important:** Order endpoints require `Authorization: Bearer <token>`, `X-Idempotency-Key`, and `X-OTP` (for new orders).

---

### 27.1 Place Derivatives Order

**POST** `/api/v1/live/nhsv/derivatives/order`  
**Headers:** `X-Idempotency-Key` (required), `X-OTP` (required)

**Response 200:** `orderNumber`, `code`, `orderStatus` (`ACCEPTED`), `orderQuantity`, `orderPrice`, `timestamp`.

---

### 27.2 Cancel Derivatives Order

**PUT** `/api/v1/live/nhsv/derivatives/order/cancel`  
**Headers:** `X-Idempotency-Key` (required)

**Response 200:** `orderNumber`, `cancelStatus` (`ACCEPTED`), `cancelTime`, `cancelledQuantity`.

---

### 27.3 Cancel All Derivatives Orders

**PUT** `/api/v1/live/nhsv/derivatives/order/cancel/all`  
**Headers:** `X-Idempotency-Key` (required)

**Response 200:** `cancelledOrderCount`, `cancelStatus`, `cancelTime`, `cancelledOrders` array.

---

### 27.4 Modify Derivatives Order

**PUT** `/api/v1/live/nhsv/derivatives/order/modify`  
**Headers:** `X-Idempotency-Key` (required)

**Response 200:** `orderNumber`, `newPrice`, `newQuantity`, `modifyStatus` (`ACCEPTED`), `modifyTime`.

---

### 27.5 Modify All Derivatives Orders

**PUT** `/api/v1/live/nhsv/derivatives/order/modify/all`

---

### 27.6 Place Stop Order (Derivatives)

**POST** `/api/v1/live/nhsv/derivatives/order/stop`  
**Headers:** `X-Idempotency-Key` (required), `X-OTP` (required)  
**Purpose:** Place a stop order on a derivatives contract.

**Response 200:** `stopOrderNumber`, `code`, `stopPrice`, `orderPrice`, `orderQuantity`, `sellBuyType`, `status` (`ACTIVE`), `validFrom`, `validTo`.

---

### 27.7 Cancel Stop Order (Derivatives)

**PUT** `/api/v1/live/nhsv/derivatives/order/stop/cancel`  
**Response 200:** `stopOrderNumber`, `status` (`CANCELLED`), `cancellationTime`.

---

### 27.8 Cancel All Stop Orders

**PUT** `/api/v1/live/nhsv/derivatives/order/stop/cancel/all`  
**Response 200:** `cancelledCount`, `failedCount`, `cancelledOrders` array.

---

### 27.9 Modify Stop Order (Derivatives)

**PUT** `/api/v1/live/nhsv/derivatives/order/stop/modify`  
**Response 200:** `stopOrderNumber`, `newStopPrice`, `newOrderPrice`, `newOrderQuantity`, `status` (`MODIFIED`), `modificationTime`.

---

## 28. NHSV Derivatives — Transfers

---

### 28.1 Initial Margin Transfer

**POST** `/api/v1/live/nhsv/derivatives/transfers/im-transfer`  
**Auth:** Bearer Token required  
**Purpose:** Transfer funds to/from the initial margin (IM) account for derivatives trading.

---

### 28.2 Cash Transfer

**POST** `/api/v1/live/nhsv/derivatives/transfers/cash-transfer`  
**Purpose:** Transfer cash between the derivatives account and linked bank accounts.

---

## 29. App Configuration

All App endpoints are **public** — no authentication required. Intended for pre-login app initialization.

---

### 29.1 Get Locale Resources

**GET** `/api/v1/app/locale`  
**Purpose:** Fetch locale/translation resource file URLs for the app. Clients download these files to display the UI in the user's language.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| msNames | array | No | List of microservice names to fetch locale for |

**Response 200**
```json
{
  "data": [
    {
      "msName": "auth-service",
      "latestVersion": "1.2.3",
      "lang": "vi",
      "files": [
        {
          "namespace": "common",
          "url": "https://cdn.paave.io/locales/auth/vi/common.json"
        }
      ]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| msName | string | Microservice name |
| latestVersion | string | Latest locale version — use to detect updates |
| lang | string | Language code (`vi` or `en`) |
| files[].namespace | string | Locale namespace/category |
| files[].url | string | CDN URL to download the translation file |

---

### 29.2 Get Trading Holidays

**GET** `/api/v1/app/holidays`  
**Purpose:** Get the list of all trading holidays. Use to disable the trading interface on non-trading days.

**Response 200**
```json
{
  "data": [
    {
      "date": "2026-04-30",
      "name": "Liberation Day",
      "nameVi": "Ngày Giải Phóng Miền Nam"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| date | string | Holiday date (YYYY-MM-DD) |
| name | string | Holiday name in English |
| nameVi | string | Holiday name in Vietnamese |

---

### 29.3 Get FAQ

**GET** `/api/v1/app/faq/{msName}`  
**Purpose:** Get grouped FAQ entries for a specific service module. The response language is controlled by the `Accept-Language` request header.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **msName** | string | Yes | Service module name (e.g., `trading`, `account`) |

**Response 200**
```json
{
  "data": [
    {
      "name": "Account Setup",
      "msName": "account",
      "lang": "vi",
      "faqs": [
        {
          "question": "How do I reset my password?",
          "answer": "..."
        }
      ]
    }
  ]
}
```

---

### 29.4 Get Registered Services

**GET** `/api/v1/app/services`  
**Purpose:** Get the list of all registered services available in the app. Used for service discovery and displaying partner integrations.

**Response 200**
```json
{
  "data": [
    {
      "serviceName": "NHSV Brokerage",
      "serviceCode": "NHSV",
      "supportPhone": "1900XXXX",
      "supportEmail": "support@nhsv.vn",
      "logoUrl": "https://cdn.paave.io/logos/nhsv.png"
    }
  ]
}
```

---

## 30. Administration

All Administration endpoints require **Bearer Token** with admin-level permissions.

---

### 30.1 Organization Management

**POST** `/api/v1/admin/organizations` — Create organization  
**PUT** `/api/v1/admin/organizations` — Update organization  
**DELETE** `/api/v1/admin/organizations` — Delete organization

Used to manage white-label or enterprise organization tenants.

---

### 30.2 Partner Management

**POST** `/api/v1/admin/partners` — Create partner  
**PUT** `/api/v1/admin/partners/{id}` — Update partner  
**DELETE** `/api/v1/admin/partners/{id}` — Delete partner

**Path Parameters:** `id` (string, required for PUT/DELETE)

Partners represent brokerage or third-party integrations (e.g., NHSV).

---

### 30.3 OAuth Client Management

**POST** `/api/v1/admin/clients` — Create OAuth client  
**GET** `/api/v1/admin/clients` — List OAuth clients  
**GET** `/api/v1/admin/clients/{id}` — Get client by ID  
**PUT** `/api/v1/admin/clients/{id}` — Update client  
**DELETE** `/api/v1/admin/clients/{id}` — Delete (disable) client  
**PUT** `/api/v1/admin/clients/{id}/secret` — Rotate client secret

**GET `/api/v1/admin/clients` Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| domain | string | No | Filter by client domain |
| fetchCount | integer | No | Number of results |
| lastSequence | integer | No | Pagination cursor |
| isFullData | boolean | No | Include full details |

**Client Object Fields**

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Client ID |
| clientId | string | OAuth client identifier |
| description | string | Client description |
| status | integer | `1` = active, `0` = disabled |
| domain | string | Allowed domain |
| appVersion | string | Target app version |
| loginMethods | array | Allowed login grant types |

---

### 30.4 Login Method Management

**POST** `/api/v1/admin/login-methods` — Create login method  
**GET** `/api/v1/admin/login-methods` — List login methods  
**GET** `/api/v1/admin/login-methods/{id}` — Get by ID  
**PUT** `/api/v1/admin/login-methods/{id}` — Update  
**DELETE** `/api/v1/admin/login-methods/{id}` — Delete

Login methods define which grant types and token TTLs apply to specific clients.

**Login Method Fields**

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Login method ID |
| serviceCode | string | Service code |
| grantType | string | OAuth grant type |
| msName | string | Microservice name |
| msUri | string | Microservice URI |
| isDefault | boolean | Whether this is the default method |
| accessTokenTtl | integer | Access token TTL in seconds |
| refreshTokenTtl | integer | Refresh token TTL in seconds |
| scopeGroupIds | array | Associated scope groups |

---

### 30.5 Feature Flags

**POST** `/api/v1/admin/feature-flags` — Set flag  
**GET** `/api/v1/admin/feature-flags` — Get flag  
**PUT** `/api/v1/admin/feature-flags` — Update flag  
**GET** `/api/v1/admin/feature-flags/all` — List all flags

Feature flags control the availability of features in the app without deployments.

**GET `/api/v1/admin/feature-flags` Query Parameters:** `key` (string, required)

**Flag Object Fields**

| Field | Type | Description |
|-------|------|-------------|
| key | string | Flag key identifier |
| value | string | Flag value |
| valueType | string | Value data type |
| enabled | boolean | Whether the flag is currently enabled |

---

### 30.6 Pre-Signed S3 URL

**GET** `/api/v1/admin/aws`  
**Purpose:** Get a pre-signed URL for uploading files to object storage (S3/Minio).

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **key** | string | Yes | Object storage key path (e.g., `uploads/profile/img.jpg`) |
| serviceName | string | No | Bucket scoping for service-specific storage |

**Response 200:** `data` — pre-signed upload URL (string).

---

### 30.7 Interest Rate Information

**GET** `/api/v1/admin/interest-info`  
**Purpose:** Get current interest rate information (e.g., for margin loans).

**Response 200:** Array with `type`, `rate`, `minAmount`, `maxAmount`.

---

### 30.8 Template Resources

**GET** `/api/v1/admin/template`  
**Purpose:** Get template resources (email templates, document templates) for services.

**Query Parameters:** `msNames` (array, optional)

---

### 30.9 Locale Resources (Internal)

**GET** `/api/v1/admin/locale/internal`  
**Purpose:** Fetch full locale resources including embedded file content (not just CDN URLs). Used for internal tooling and admin panels.

**Query Parameters:** `msNames` (array, optional)

---

### 30.10 FAQ Feedback

**GET** `/api/v1/admin/faq/{faqId}/review/{isUseful}`  
**Purpose:** Record user feedback on a FAQ entry.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **faqId** | integer | Yes | FAQ entry ID |
| **isUseful** | boolean | Yes | `true` if the user found it helpful |

---

### 30.11 Scope Management

**POST** `/api/v1/admin/scopes` — Create scope  
**PUT** `/api/v1/admin/scopes/{id}` — Update scope  
**DELETE** `/api/v1/admin/scopes/{id}` — Delete scope

Scopes define fine-grained API access permissions for OAuth clients.

---

### 30.12 Scope Group Management

**POST** `/api/v1/admin/scope-groups` — Create group  
**PUT** `/api/v1/admin/scope-groups/{id}` — Update group  
**DELETE** `/api/v1/admin/scope-groups/{id}` — Delete group

Scope groups bundle multiple scopes for easier assignment to login methods.

---

### 30.13 Event Management

**POST** `/api/v1/admin/events` — Create event  
**GET** `/api/v1/admin/events` — List events  
**PUT** `/api/v1/admin/events/{id}` — Update event  
**DELETE** `/api/v1/admin/events/{id}` — Delete event

Events track platform-level activities and announcements.

---

### 30.14 Menu Management

**POST** `/api/v1/admin/menus` — Create menu  
**GET** `/api/v1/admin/menus` — List menus  
**PUT** `/api/v1/admin/menus/{id}` — Update menu  
**DELETE** `/api/v1/admin/menus/{id}` — Delete menu

Menus control navigation structure in the app.

---

### 30.15 Limited Stock Management

**POST** `/api/v1/admin/limited-stocks` — Set limited stock  
**GET** `/api/v1/admin/limited-stocks` — List limited stocks

Manage stocks under trading restrictions or special conditions.

---

### 30.16 Data Views

**POST** `/api/v1/admin/dataviews` — Create data view  
**GET** `/api/v1/admin/dataviews` — List data views

Data views define customizable market data display configurations.

---

### 30.17 Virtual Settlement

**POST** `/api/v1/admin/virtual-settlement` — Run settlement  
**GET** `/api/v1/admin/virtual-settlement/status` — Check settlement status

Perform or monitor virtual trading account settlement operations.

---

*Document generated from Paave API OpenAPI Specification v1.5.0*
