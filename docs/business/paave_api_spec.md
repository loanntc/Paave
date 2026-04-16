# Paave API — Full Specification

**Version:** 1.5.1  
**Format:** OpenAPI 3.0.3  
**Last Updated:** April 2026  
**Status:** Reviewed & Fixed (18/18 contract tests passing)

---

## Overview

Paave API provides endpoints for authentication, market data, social features, virtual and live securities trading (equity + derivatives) via NHSV, user management, and administration.

**Base URL:** `/api/v1`

**Authentication:**
- 🔓 **Public** — No authentication required
- 🔒 **JWT** — Include `Authorization: Bearer <access_token>` header
- 🔐 **JWT + Step-Up Token** — Include both `Authorization: Bearer <access_token>` and `X-StepUp-Token: <stepup_token>` headers. Obtain step-up token via `POST /api/v1/auth/stepup`.

**Standard Response Envelope:**
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-04-14T09:00:00.000Z",
    "version": "1.0"
  }
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  },
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

---

## Table of Contents

- [Authentication](#authentication) — 26 endpoints
- [Users](#users) — 35 endpoints
- [App](#app) — 4 endpoints
- [News](#news) — 11 endpoints
- [Fundamentals](#fundamentals) — 8 endpoints
- [Market](#market) — 38 endpoints
- [Social](#social) — 15 endpoints
- [Insights](#insights) — 21 endpoints
- [Virtual Trading](#virtual-trading) — 87 endpoints
- [Live Trading](#live-trading) — 41 endpoints
- [NHSV Equity](#nhsv-equity) — 72 endpoints
- [NHSV Derivatives](#nhsv-derivatives) — 39 endpoints
- [Administration](#administration) — 58 endpoints

**Total: 455 endpoints**

---

# Authentication

> Login, OTP verification, token refresh/revoke, biometric auth, 2FA, and CA certificate login

**26 endpoints**

---

### `POST /api/v1/auth/biometric/register`

> Register a biometric credential for the authenticated user.

Initiates OTP verification. Provide the device's RSA public key; it is stored and used to verify future biometric login signatures.

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_BIOMETRIC_REGISTER`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `password` | `string` | ✓ | Current account password used to authorize registration. |
| `publicKey` | `string` | ✓ | Base64-encoded RSA public key to register. |
| `deviceId` | `string` | ✓ | Device identifier that owns the biometric key pair. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Biometric registration initiated — OTP sent |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/auth/biometric/status`

> Check whether biometric authentication is registered for the user.

Check whether biometric authentication is registered for the authenticated user on the current device. Returns registration status and the stored public key if registered.

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_BIOMETRIC_STATUS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `deviceId` | query | `string` |  | Device identifier |

**Responses:**

| Code | Description |
|---|---|
| `200` | Biometric registration status |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/biometric/unregister`

> Remove a registered biometric credential from the user's account.

Remove a registered biometric credential from the authenticated user's account for the specified device. After unregistering, biometric login is disabled for that device.

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_BIOMETRIC_UNREGISTER`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `deviceId` | `string` | ✓ | Device identifier whose biometric credential should be removed. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Biometric credential removed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/biometric/verify-otp`

> Complete biometric registration by verifying the OTP.

Complete biometric registration by verifying the OTP sent during the registration step. Returns 200 on success; biometric login is enabled for the device after this call.

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_BIOMETRIC_VERIFY_OTP`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `otpValue` | `string` | ✓ | OTP code entered by the user. |
| `otpId` | `string` | ✓ | OTP identifier returned by biometric registration. |
| `deviceId` | `string` | ✓ | Device identifier that is being enabled for biometric login. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Biometric registered successfully |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests — rate limit exceeded |
| `500` | Internal server error |

---
### `POST /api/v1/auth/biometric/verify-password`

> Verify the user's password before allowing biometric login setup.

This is a security gate step in the biometric registration flow. Returns 200 when password is valid.

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_BIOMETRIC_VERIFY_PASSWORD`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `password` | `string` | ✓ | Current account password used to authorize biometric setup. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Password verified |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/ca/register`

> Register a CA certificate for the authenticated user.

[NHSV] Register CA certificate data with the identity service. The certificate data must be Base64-encoded. Requires a valid Bearer token. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_CA_REGISTER`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `data` | `string` | ✓ | Base64-encoded CA certificate payload. |

**Responses:**

| Code | Description |
|---|---|
| `200` | CA certificate registered |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/ca/unregister`

> Unregister a previously registered CA certificate.

[NHSV] Unregister the CA certificate for the authenticated user. After unregistering, CA-based authentication is disabled for the account. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_CA_UNREGISTER`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `deviceId` | `string` |  | Device identifier of the CA certificate to unregister. |

**Responses:**

| Code | Description |
|---|---|
| `200` | CA certificate unregistered |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/auth/ca/update`

> Update a registered CA certificate.

[NHSV] Update registered CA certificate data. Replaces the existing certificate with new Base64-encoded data. Requires a valid Bearer token. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_CA_PATCH`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `data` | `string` | ✓ | Base64-encoded CA certificate payload. |

**Responses:**

| Code | Description |
|---|---|
| `200` | CA certificate updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login` `DEPRECATED`

> Unified login endpoint routing by grant_type.

[DEPRECATED] Unified login endpoint. Use specific login endpoints instead: POST /auth/login/password, /auth/login/social, /auth/login/2fa, /auth/login/biometric, /auth/login/ca, /auth/login/organization. This endpoint will be removed in v2.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_LOGIN`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | `string` |  | Required when grant_type=password. |
| `password` | `string` |  | Required when grant_type=password. |
| `socialToken` | `string` |  | Required when grant_type=social_login. |
| `socialType` | `string` |  | Required when grant_type=social_login. |
| `device_id` | `string` |  | Client device identifier for password or social login. |
| `platform` | `string` |  | Client platform for demo login. |
| `appVersion` | `string` |  | App version for demo login. |
| `grantType` | `string` | ✓ | Login grant type: password, social_login, client_credentials, or demo. |
| `clientId` | `string` |  | Required when grant_type=client_credentials or demo. |
| `clientSecret` | `string` |  | Required when grant_type=client_credentials or demo. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Login successful — returns access and refresh tokens |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login/2fa`

> Initiate two-factor authentication login.

Initiate two-factor authentication. Submit username and password; if 2FA is enabled an OTP is sent and a partial token is returned to complete login at the verify-otp step.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_LOGIN_2FA`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | `string` | ✓ | Username or email used to authenticate. |
| `password` | `string` | ✓ | Account password. |
| `device_id` | `string` |  | Client device identifier. |

**Responses:**

| Code | Description |
|---|---|
| `200` | OTP sent — returns intermediate 2FA token |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login/2fa/verify-otp`

> Complete two-factor authentication by verifying the OTP.

Complete two-factor authentication by verifying the OTP sent during the 2FA initiation step. Requires the partial token from the initiation response. Returns full JWT tokens.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_2FA_VERIFY_OTP`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `partial_token` | `string` | ✓ | Partial token returned by the 2FA login step. |
| `mobile_otp` | `string` |  | Mobile OTP override when supported by the client flow. |
| `platform` | `string` |  | Client platform such as ios or android. |
| `osVersion` | `string` |  | Client OS version. |
| `appVersion` | `string` |  | Client app version. |
| `otpId` | `string` | ✓ | OTP identifier returned by the 2FA login step. |
| `otpValue` | `string` | ✓ | OTP value entered by the user. |
| `deviceId` | `string` |  | Device identifier (generated on first login, stored in client secure storage). Replaces macAddress which is spoofable and unreliable. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Authentication completed — returns full JWT tokens |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests — rate limit exceeded |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login/biometric`

> Authenticate using a registered biometric credential.

Authenticate using a registered biometric credential via RSA signature. The timestamp field must be within ±30 seconds of server time (replay prevention window). Server validates: (1) deviceId is registered for this user, (2) signature is valid over payload, (3) timestamp is within replay window, (4) this exact payload has not been used before (nonce check). NOTE: This endpoint uses a custom RSA signature scheme. Migration to WebAuthn/FIDO2 standard is recommended for future versions to improve …

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_LOGIN_BIOMETRIC`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | `string` | ✓ | Username or email bound to the biometric credential. |
| `signature` | `string` | ✓ | Base64 RSA signature over the login payload. |
| `deviceId` | `string` | ✓ | Device identifier bound to the credential. |
| `timestamp` | `integer` | ✓ | Epoch-millisecond timestamp used to prevent replay. |
| `platform` | `string` |  | Client platform such as ios or android. |
| `osVersion` | `string` |  | Client OS version. |
| `appVersion` | `string` |  | Client app version. |
| `nonce` | `string` |  | Random nonce (UUID or 32-byte hex) to prevent replay attacks. Server must verify this nonce has not been used within the replay window. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Authentication successful — returns access and refresh tokens |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login/ca`

> Authenticate using a CA certificate credential.

[NHSV] Login using a CA (certificate authority) credential. The certificate must be pre-registered via NHSV. Returns JWT tokens on success.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_LOGIN_CA`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `data` | `string` | ✓ | Base64-encoded CA credential payload. |
| `grantType` | `string` | ✓ | Must be ca. |
| `clientId` | `string` | ✓ | OAuth client identifier. |
| `clientSecret` | `string` | ✓ | OAuth client secret. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Authentication successful — returns access and refresh tokens |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — invalid credentials or expired token |
| `403` | Forbidden — account disabled or insufficient scope |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests — rate limit exceeded |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login/link-accounts`

> Authenticate using a partner-linked account.

Used to switch between linked user accounts (e.g., from a Paave account to a linked NHSV broker account). Returns JWT tokens.

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_LINK_ACCOUNT_LOGIN`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `partnerId` | `string` | ✓ | Partner identifier to switch into. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Authentication successful — returns tokens scoped to the linked account |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login/organization`

> Authenticate on behalf of an organization.

Returns organization-scoped JWT tokens. Requires a valid organization ID and either a user password or org login token.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_LOGIN_ORGANIZATION`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | `string` | ✓ | Target organization identifier. |
| `registeredUsername` | `string` |  | Required when authenticating with username and password. |
| `password` | `string` |  | Required when authenticating with username and password. |
| `orgLoginToken` | `string` |  | Alternative one-time organization login token. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Authentication successful — returns organization-scoped tokens |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login/password`

> Authenticate with username/email and password.

Returns JWT access and refresh tokens. Requires a valid registered account with a password set.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_LOGIN_PASSWORD`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | `string` | ✓ | Username or email used to authenticate. |
| `password` | `string` | ✓ | Account password. |
| `device_id` | `string` |  | Client device identifier. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Authentication successful — returns access and refresh tokens |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login/social`

> Authenticate using a social provider token.

Authenticate using a social provider (GOOGLE, FACEBOOK, APPLE). Creates a new account if one does not already exist for the social identity. Returns JWT tokens.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_LOGIN_SOCIAL`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `socialToken` | `string` | ✓ | Provider-issued social access token or ID token. |
| `socialType` | `string` | ✓ | Social provider identifier such as GOOGLE, FACEBOOK, or APPLE. |
| `device_id` | `string` |  | Client device identifier. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Authentication successful — returns access and refresh tokens |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/login/social/organization`

> Authenticate with a social provider in an organization context.

Creates or retrieves an org-scoped account linked to the social identity. Returns organization-scoped JWT tokens.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_LOGIN_SOCIAL_ORGANIZATION`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `socialToken` | `string` | ✓ | Provider-issued social access token or ID token. |
| `socialType` | `string` | ✓ | Social provider identifier such as GOOGLE, FACEBOOK, or APPLE. |
| `organization` | `string` | ✓ | Organization identifier to authenticate within. |
| `device_id` | `string` |  | Client device identifier. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Authentication successful — returns organization-scoped tokens |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/otp`

> Send OTP to user's registered phone or email for verification.

Send a one-time password (OTP) to the user's registered email or phone number for verification. Returns 200 on success. Returns 429 if the user exceeds the rate limit.

**Auth:** 🔓 **Public**  
**Operation ID:** `OTP_SEND`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✓ | Phone number or email address to receive the OTP. |
| `idType` | `string` | ✓ | Identifier type such as PHONE or EMAIL. |
| `txType` | `string` | ✓ | OTP transaction type such as REGISTER, RESET_PASSWORD, or UPDATE_PROFILE. |

**Responses:**

| Code | Description |
|---|---|
| `200` | OTP sent successfully |
| `400` | Bad request — invalid or missing parameters |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests — rate limit exceeded |
| `500` | Internal server error |

---
### `POST /api/v1/auth/otp/verify`

> Verify a previously sent OTP code.

Verify a previously sent OTP. Returns a temporary token or confirmation on success. The OTP expires after a short time-limited window.

**Auth:** 🔓 **Public**  
**Operation ID:** `OTP_VERIFY`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `otpId` | `string` | ✓ | OTP identifier returned by the send-OTP step. |
| `otpValue` | `string` | ✓ | OTP code entered by the user. |

**Responses:**

| Code | Description |
|---|---|
| `200` | OTP verified |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests — rate limit exceeded |
| `500` | Internal server error |

---
### `POST /api/v1/auth/password/reset/complete`

> Set a new password using the verified reset token.

Step 3 of 3. Completes password reset. Invalidates the reset token, revokes all active sessions, and sends confirmation notification.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_PASSWORD_RESET_COMPLETE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `resetToken` | `string` | ✓ | Single-use reset token from verify-otp step. |
| `newPassword` | `string` | ✓ | New password. Min 8 chars, 1 uppercase, 1 number, 1 special char. Must not match last 5 passwords. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Password reset successfully. All existing sessions revoked. |
| `400` | Invalid reset token, token expired, or password does not meet requirements. |
| `409` | New password matches a recent password. |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Rate limit exceeded. |
| `500` | Internal server error. |

---
### `POST /api/v1/auth/password/reset/request`

> Initiate a password reset by sending an OTP to the registered email or phone.

Step 1 of 2. Sends an OTP to the user's registered contact. Always responds 200 OK regardless of whether the account exists (prevents enumeration).

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_PASSWORD_RESET_REQUEST`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | `string` | ✓ | Username or email of the account. |

**Responses:**

| Code | Description |
|---|---|
| `200` | OTP sent if account exists. Response is identical whether account exists or not. |
  | Field | Type | Description |
  |---|---|---|
  | `otpId` | `string` | OTP identifier to use in the verify step. |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Rate limit exceeded. |
| `500` | Internal server error. |

---
### `POST /api/v1/auth/password/reset/verify-otp`

> Verify the OTP and receive a single-use reset token.

Step 2 of 3. Verifies the OTP and returns a short-lived reset token (10 min TTL, single-use).

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_PASSWORD_RESET_VERIFY_OTP`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `otpId` | `string` | ✓ | OTP identifier from the request step. |
| `otpValue` | `string` | ✓ | OTP code entered by the user. |

**Responses:**

| Code | Description |
|---|---|
| `200` | OTP verified. Returns single-use reset token. |
  | Field | Type | Description |
  |---|---|---|
  | `resetToken` | `string` | Single-use token valid for 10 minutes to complete password reset. |
| `400` | Invalid or expired OTP. |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many attempts. |
| `500` | Internal server error. |

---
### `POST /api/v1/auth/stepup`

> Re-authenticate to obtain a step-up token for sensitive actions.

Issues a short-lived step-up token (5 min TTL) scoped to a specific action type. Required before calling any sensitive endpoint (withdraw, transfer, bank account changes). Re-authentication via password or Face ID (if enrolled).

**Auth:** 🔒 **JWT**  
**Operation ID:** `AUTH_STEPUP`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `actionType` | `string` | ✓ | The sensitive action this step-up token will authorize. Enum: `WITHDRAW`, `TRANSFER_CASH`, `TRANSFER_STOCK`, `CHANGE_BANK_ACCOUNT`, `CHANGE_PASSWORD`, `CHANGE_MFA`, `EXPORT_DATA`, `CHANGE_CLIENT_SECRET` |
| `method` | `string` | ✓ | Re-authentication method. biometric requires prior Face ID enrollment. Enum: `password`, `biometric` |
| `password` | `string` |  | Required when method=password. |
| `biometricSignature` | `string` |  | WebAuthn assertion signature. Required when method=biometric. |
| `deviceId` | `string` |  | Device identifier. Required when method=biometric. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Step-up token issued. |
  | Field | Type | Description |
  |---|---|---|
  | `stepUpToken` | `string` | Short-lived step-up token. Valid 5 minutes, scoped to actionType, single-use. |
  | `expiresAt` | `string` |  |
| `401` | Invalid credentials or biometric assertion. |
| `403` | Biometric not enrolled for this device. |
| `429` | Rate limit exceeded. |
| `500` | Internal server error. |

---
### `POST /api/v1/auth/token/refresh`

> Exchange a refresh token for a new access token.

Exchange a valid refresh token for a new access token. The refresh token is not rotated. Returns new JWT access token on success. Note: client_secret must NOT be included for public clients (mobile/web apps). Only confidential server-to-server clients use client_secret, via private channel. Public clients must use PKCE-based flow.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_TOKEN_REFRESH`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `grantType` | `string` | ✓ | Must be refresh_token. |
| `clientId` | `string` | ✓ | OAuth client identifier. Required for confidential (server-to-server) clients only. Public clients (mobile/web) should omit client_secret and use PKCE flow. |
| `refreshToken` | `string` | ✓ | Refresh token to exchange for a new access token. |

**Responses:**

| Code | Description |
|---|---|
| `200` | New access token issued |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/auth/token/revoke`

> Revoke a refresh token to invalidate the session.

Revoke a refresh token, invalidating the current session. After revocation, the token cannot be used to obtain new access tokens.

**Auth:** 🔓 **Public**  
**Operation ID:** `AUTH_TOKEN_REVOKE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `refresh_token_id` | `string` |  | Numeric token ID when revoking by ID with ownership proof. |
| `refreshToken` | `string` | ✓ | Refresh token to revoke. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Token revoked |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `429` | Too many requests |
| `500` | Internal server error |

---
# Users

> User registration, profile management, account linking, and organization endpoints

**35 endpoints**

---

### `GET /api/v1/users`

> Search for users by username or criteria.

Search for users by username or other criteria with pagination. When a username query parameter is provided, performs an exact lookup; otherwise performs a paginated search filtered by name and other criteria.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_SEARCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `username` | query | `string` |  | Exact username lookup (use alone for exact match) |
| `name` | query | `string` |  | Name search term for paginated search |
| `pageNumber` | query | `integer` |  | Zero-based page number (paginated search) |
| `pageSize` | query | `integer` |  | Page size 1–100 (paginated search, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Paginated user search results |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users`

> Register a new Paave user account.

Accepts either a full registration payload or an auto-signup grant (grant_type=auto_signup) for device-based account creation. Returns JWT tokens on success.

**Auth:** 🔓 **Public**  
**Operation ID:** `USER_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `registeredUsername` | `string` | ✓ | Username or email to register for login. |
| `email` | `string` | ✓ | Email address used for verification and notifications. |
| `password` | `string` | ✓ | Initial account password. |
| `fullname` | `string` | ✓ | Display name for the new account. |
| `otpKey` | `string` | ✓ | Verified OTP key for the registration flow. |
| `deviceId` | `string` |  | Client device identifier when available. |

**Responses:**

| Code | Description |
|---|---|
| `201` | User account created |
| `400` | Bad request — invalid or missing parameters |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/availability-checks`

> Check whether a username or email is available for registration.

Returns 200 with available=true if the value is not taken.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_CHECK_EXIST`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `string` | ✓ | Availability check type: EMAIL or USERNAME. |
| `value` | `string` | ✓ | Candidate email address or username to validate. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Availability result |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/users/me`

> Retrieve the authenticated user's full account profile.

Retrieve the authenticated user's full account profile including personal info, linked accounts, and account status. Requires a valid Bearer token.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_ACCOUNT_INFO`

**Responses:**

| Code | Description |
|---|---|
| `200` | User account information |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/users/me/bio`

> Update the authenticated user's biography.

Update the authenticated user's biography/description displayed on their public profile. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_PATCH_BIO`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `bio` | `string` | ✓ | Biography text shown on the user's profile. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Bio updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/confirmation`

> Confirm the authenticated user's account after email verification.

Confirm the authenticated user's account (e.g., after email verification). Requires the account password for identity confirmation. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_CONFIRM`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `password` | `string` | ✓ | Current account password used for confirmation. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Account confirmed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/deletion`

> Initiate account deletion with email confirmation.

Initiate account deletion. Sends a confirmation link to the user's registered email. The deletion is not completed until the confirmation link is visited.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_DELETION_INIT`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | ✓ | Registered email address that receives the deletion confirmation. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Deletion initiated — confirmation email sent |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/users/me/deletion/{key}`

> Complete account deletion using the confirmation key.

Complete account deletion using the confirmation key from the deletion email. The account and all associated data are permanently removed.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_DELETION`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `key` | path | `string` | ✓ | Deletion confirmation key from email |

**Responses:**

| Code | Description |
|---|---|
| `200` | Account deleted |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/deletion/{key}/notifications`

> Resend the account deletion confirmation email.

Resend the account deletion confirmation email when the original was not received. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_DELETION_RESEND`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `key` | path | `string` | ✓ | Deletion key to resend confirmation for |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `notificationIds` | `array[string]` |  | List of notification IDs to mark as acknowledged for deletion flow. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Confirmation email resent |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/users/me/email`

> Update the authenticated user's email address.

Sends a verification email to the new address. An OTP is required to confirm the change.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_PATCH_EMAIL`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | ✓ | New email address to verify and use on the account. |
| `otpKey` | `string` | ✓ | Verified OTP key for the email-change flow. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Email update initiated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/feedbacks`

> Submit user feedback or a support request.

Accepts a free-text message, an optional star rating, and device/app metadata for triage. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_FEEDBACK_SUBMIT`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `deviceId` | `string` | ✓ | Client device identifier for support triage. |
| `appVersion` | `string` | ✓ | App version that produced the feedback. |
| `message` | `string` |  | Free-text feedback or support message. |
| `rating` | `integer` |  | Optional star rating from the user. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Feedback submitted |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/users/me/full-name`

> Update the authenticated user's full name.

Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_PATCH_FULLNAME`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `fullname` | `string` | ✓ | New full name to display on the profile. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Full name updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/users/me/link-accounts`

> List all partner accounts linked to the authenticated user.

Returns an array of linked account records, each containing partner ID, linked username, and link status.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_LIST`

**Responses:**

| Code | Description |
|---|---|
| `200` | List of linked accounts |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/link-accounts`

> Create a new account link with a partner using a linking token.

Create a new account link with a partner using the session ID and OTP from the linking initiation flow. Returns 201 on success. Returns 409 if the account is already linked.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | `string` | ✓ | Link-account session identifier from the init step. |
| `otp` | `string` | ✓ | OTP value used to confirm the link. |

**Responses:**

| Code | Description |
|---|---|
| `201` | Account link created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `409` | Conflict — account already linked |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/link-accounts/approval`

> Approve an incoming account link request from a partner.

Partner-side counterpart to post:/api/v1/users/me/link-accounts/confirmation. The partner approves the link request initiated by the Paave user. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_APPROVE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | `string` | ✓ | Link-account session identifier to approve. |
| `partnerPassword` | `string` | ✓ | Partner account password used for approval. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Link request approved |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/link-accounts/confirmation`

> Confirm an account link request.

Finalises the linking flow initiated by the partner. Provide the session ID and partner password to confirm. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_CONFIRM`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | `string` | ✓ | Link-account session identifier to confirm. |
| `partnerPassword` | `string` | ✓ | Partner account password used for confirmation. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Link confirmed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/link-accounts/init`

> Initiate the account linking workflow with a partner.

Returns a session ID and sends an OTP to the partner account's registered phone or email.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_INIT`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `partnerId` | `string` | ✓ | Partner identifier such as nhsv. |
| `username` | `string` | ✓ | Partner account username or account code. |
| `password` | `string` | ✓ | Partner account password for link verification. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Linking initiated — returns linking token |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/users/me/link-accounts/leaderboard/settings`

> Update leaderboard visibility settings for a linked account.

Controls whether the linked partner account participates in the public leaderboard. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_LEADERBOARD_SETTINGS_PATCH`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `partnerId` | `string` | ✓ | Partner identifier whose leaderboard settings are updated. |
| `optBoard` | `boolean` | ✓ | Whether the linked account appears on the leaderboard. |
| `subAccount` | `string` |  | Sub-account identifier when the partner has multiple trading accounts. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Leaderboard settings updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/users/me/link-accounts/partner/{partnerId}`

> Unlink a partner account by partner ID.

Remove a linked partner account identified by its partner ID. Delegates to the same unlink logic as the canonical {accountId} route.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_DELETE_BY_PARTNER`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `partnerId` | path | `string` | ✓ | Partner identifier of the linked account to remove |

**Responses:**

| Code | Description |
|---|---|
| `204` | Partner account unlinked |
| `400` | Bad request — missing partner ID |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/link-accounts/social`

> Link a social provider account to the authenticated user.

Link a social provider account (GOOGLE, FACEBOOK, APPLE) to the authenticated user. An OTP security code may be required. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_SOCIAL_LINK_ACCOUNT`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `socialType` | `string` | ✓ | Social provider identifier such as GOOGLE, FACEBOOK, or APPLE. |
| `socialToken` | `string` | ✓ | Provider-issued social access token or ID token. |
| `secCode` | `string` |  | OTP or secondary security code when required by policy. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Social account linked |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/users/me/link-accounts/social/{socialType}`

> Unlink a previously linked social provider account.

Unlink a previously linked social provider account (GOOGLE, FACEBOOK, APPLE) from the authenticated user. Returns 204 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_SOCIAL_UNLINK_ACCOUNT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `socialType` | path | `string` | ✓ | Social provider type to unlink (GOOGLE, FACEBOOK, APPLE) |

**Responses:**

| Code | Description |
|---|---|
| `204` | Social account unlinked |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/link-accounts/username`

> Update the username for a linked partner account.

Update the username used for a linked partner account. Useful when the partner-side username changes and needs to be re-synced in Paave. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_CHANGE_USERNAME`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `partnerId` | `string` | ✓ | Partner identifier whose linked username should change. |
| `newUsername` | `string` | ✓ | New partner-side username or account code. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Username updated for linked account |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/users/me/link-accounts/{accountId}`

> Delete a linked partner account by account ID.

Delete a linked partner account. Removes the link between the authenticated user and the specified partner account. Returns 204 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountId` | path | `integer` | ✓ | ID of the linked account to remove |

**Responses:**

| Code | Description |
|---|---|
| `204` | Linked account removed |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/partner-otp-notifications`

> Send an OTP notification to a linked partner for cross-account authentication.

Used when a partner service needs an OTP forwarded from the Paave user context.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_NOTIFY_OTP_PARTNER`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | `string` | ✓ | Link-account session identifier awaiting OTP verification. |
| `otp` | `string` | ✓ | OTP value to forward to the partner. |

**Responses:**

| Code | Description |
|---|---|
| `200` | OTP notification sent |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/partner-otp-notifications/inbound`

> Receive an OTP notification from a partner for inbound cross-account authentication.

Inbound counterpart to post:/api/v1/users/me/partner-otp-notifications. Receives an OTP forwarded from a partner for cross-account authentication. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_NOTIFY_OTP_FROM_PARTNER`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | `string` | ✓ | Link-account session identifier awaiting OTP verification. |
| `otp` | `string` | ✓ | OTP value received from the partner. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Inbound OTP processed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/users/me/partner-users`

> Find users associated with linked partner accounts.

Find users associated with linked partner accounts for the authenticated user. Looks up Paave user records by partner name and account number.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_LINK_ACCOUNT_FIND_BY_PARTNER`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `partnerName` | query | `string` |  | Partner service identifier (e.g., nhsv) |
| `accountNumber` | query | `string` |  | Partner account number to look up |

**Responses:**

| Code | Description |
|---|---|
| `200` | List of partner-linked users |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/password`

> Change the authenticated user's password.

Requires the current password for verification. The new password must meet minimum complexity requirements.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_CHANGE_PASSWORD`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `oldPassword` | `string` | ✓ | Current account password. |
| `newPassword` | `string` | ✓ | New password to set. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Password changed successfully |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/users/me/password/availability`

> Check whether the authenticated user has a password set.

Check whether the authenticated user has a password set on their account. Returns true if a password is available (i.e., not a social-only account), false otherwise.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_CHECK_AVAILABLE_PASSWORD`

**Responses:**

| Code | Description |
|---|---|
| `200` | Password availability status |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/password/initial`

> Set an initial password for an account created without one.

Set an initial password for an account that was created without one (e.g., via social login). This endpoint is only available when no password is currently set.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_CREATE_PASSWORD`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `password` | `string` | ✓ | Initial password to set on the account. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Password created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/me/password/social`

> Create a password for an account registered via social login.

Create a password for an account originally registered via social login (Google, Facebook, Apple). Once set, the user can also log in with username/password.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_CREATE_PASSWORD_SOCIAL`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `password` | `string` | ✓ | Password to add to the social-login account. |

**Responses:**

| Code | Description |
|---|---|
| `201` | Password created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/users/me/status`

> Disable or suspend the authenticated user's account.

Requires an admin-level token or self-service reason. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_DISABLE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `reason` | `string` | ✓ | Reason for disabling or suspending the account. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Account status updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/users/me/username`

> Update the authenticated user's username.

An OTP may be required to confirm the change. Returns 200 on success.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_PATCH_USERNAME`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | `string` | ✓ | New username to assign to the authenticated account. |
| `otpKey` | `string` |  | OTP key when profile updates require verification. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Username updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/users/organizations`

> List all organizations available for the authenticated user.

Optionally filter by a list of organization IDs. Returns an array of organization records.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ORGANIZATION_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationIds` | query | `array` |  | Organization IDs to filter by. |

**Responses:**

| Code | Description |
|---|---|
| `200` | List of organizations |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/users/organizations/users`

> List users within an organization.

List users within an organization with optional date-range and pagination filters. Returns a paginated list of user records belonging to the specified organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ORGANIZATION_USER_LIST`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | `string` | ✓ | Organization identifier to list users for. |
| `pageNum` | `integer` |  | One-based page number. |
| `pageSize` | `integer` |  | Page size for pagination. |
| `createdFrom` | `string` |  | Inclusive start date filter in YYYY-MM-DD format. |
| `createdTo` | `string` |  | Inclusive end date filter in YYYY-MM-DD format. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Paginated list of organization users |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/users/partners`

> List all available partner integrations for account linking.

List all available partner integrations that the user can link accounts with. Returns a list of partner descriptors including partner ID and display name.

**Auth:** 🔒 **JWT**  
**Operation ID:** `USER_PARTNERS`

**Responses:**

| Code | Description |
|---|---|
| `200` | List of available partners |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
# App

> Pre-login client app configuration — locale resources, FAQ, trading holidays, registered services, and CDN/presigned URLs

**4 endpoints**

---

### `GET /api/v1/app/faq/{msName}`

> List FAQ groups for a service.

Returns FAQ groups and their items for the specified service name, filtered by the request locale (accept-language header). Each group contains a list of question/answer pairs.

**Auth:** 🔓 **Public**  
**Operation ID:** `APP_FAQ`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `msName` | path | `string` | ✓ | Service name (e.g. paave-fe-mobile) |

**Responses:**

| Code | Description |
|---|---|
| `200` | FAQ groups returned |
| `404` | Service not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/app/holidays`

> List all trading holidays.

Returns all calendar dates on which the Vietnamese stock exchanges are closed. Used by the trading services to skip order processing and settlement on holidays.

**Auth:** 🔓 **Public**  
**Operation ID:** `APP_HOLIDAYS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Trading holiday list returned |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/app/locale`

> Fetch locale resource file URLs for the public app.

Returns locale resource metadata (namespace-to-CDN-URL mappings) for the requested service names and languages. Called by the frontend at app startup to initialise i18n translations.

**Auth:** 🔓 **Public**  
**Operation ID:** `APP_LOCALE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `msNames` | query | `array` |  | Service names to fetch locale for |

**Responses:**

| Code | Description |
|---|---|
| `200` | Locale resource URLs returned |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/app/services`

> List all registered services.

Returns metadata for all services registered in the system, including display name, support contact details, and logo URL. Used by the frontend to render the service directory.

**Auth:** 🔓 **Public**  
**Operation ID:** `APP_SERVICES`

**Responses:**

| Code | Description |
|---|---|
| `200` | Service list returned |
| `429` | Too many requests |
| `500` | Internal server error |

---
# News

> Market news articles and system notices

**11 endpoints**

---

### `GET /api/v1/news`

> List news articles with optional filters.

Get a paginated list of news articles with optional filters for language, category, symbol, and keyword.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_GET`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `language` | query | `string` |  | Language filter (e.g., vi, en) |
| `pinned` | query | `boolean` |  | Filter for pinned articles only |
| `keyword` | query | `string` |  | Search keyword |
| `category` | query | `string` |  | Article category |
| `symbol` | query | `string` |  | Stock code filter (e.g., VNM) |
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Paginated news articles |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/news/announcement`

> Get paginated exchange and regulatory announcements.

Returns official exchange and regulatory announcements sourced from the NHSV notice feed. Backed by the same news.notice table as /api/v1/news/notices. Results are ordered by publish date descending with 60-second Redis cache.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_ANNOUNCEMENT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fromDate` | query | `string` |  | Start date filter (YYYY-MM-DD or ISO 8601) |
| `toDate` | query | `string` |  | End date filter (YYYY-MM-DD or ISO 8601) |
| `page` | query | `integer` |  | Zero-based page index (default 0) |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Paginated announcements |
| `400` | Bad request — invalid parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — upstream error |
| `504` | Gateway Timeout — upstream timeout |

---
### `GET /api/v1/news/favorites`

> Get saved favorite news articles.

Get the authenticated user's saved favorite news articles.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_FAVORITE_GET`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Favorite news articles |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/news/favorites`

> Add a news article to favorites.

Add a news article to the user's favorites.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_FAVORITE_ADD`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | Article added to favorites |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/news/favorites`

> Remove news articles from favorites.

Remove one or more news articles from the user's favorites.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_FAVORITE_REMOVE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `newsIds` | query | `string` | ✓ | Comma-separated news article IDs to remove |

**Responses:**

| Code | Description |
|---|---|
| `204` | No content |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/news/favorites/{newsId}`

> Check if a news article is in favorites.

Check whether a specific news article is in the user's favorites.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_FAVORITE_EXIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `newsId` | path | `integer` | ✓ | News article ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Favorite status for the article |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/news/filter`

> Filtered news query with date range support.

Get a paginated list of news articles filtered by symbol, category, date range, and language. All filters use AND semantics. Redis cache applies only when symbol is provided and no date range is specified (pages 0–10 only) — date-range requests always bypass cache.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_FILTER`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` |  | Stock code filter (e.g., VNM). Required for cache to apply. |
| `category` | query | `string` |  | Article category (e.g., market, company) |
| `fromDate` | query | `string` |  | Start of date range, ISO 8601 (e.g., 2026-01-01T00:00:00Z) |
| `toDate` | query | `string` |  | End of date range, ISO 8601 (e.g., 2026-03-31T23:59:59Z) |
| `language` | query | `string` |  | Language filter, allowlist: vi, en |
| `page` | query | `integer` |  | Zero-based page index (default 0) |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Paginated filtered news articles |
| `400` | Bad request — invalid parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — upstream error |
| `504` | Gateway Timeout — upstream timeout |

---
### `GET /api/v1/news/latest-by-symbols`

> Latest news for a caller-supplied list of stock symbols.

Get the latest news articles matching any of the provided symbols. The caller is responsible for resolving the symbol list (e.g., from a watchlist). Results are ordered by publish date descending. Maximum 20 symbols per request; maximum page size is 50.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_LATEST_BY_SYMBOLS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbols` | query | `string` | ✓ | Comma-separated stock codes, max 20 (e.g., VNM,HPG,FPT). Required. |
| `page` | query | `integer` |  | Zero-based page index (default 0) |
| `size` | query | `integer` |  | Page size (1–50, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Paginated news articles matching any of the supplied symbols |
| `400` | Bad request — symbols is required or exceeds 20 items |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — upstream error |
| `504` | Gateway Timeout — upstream timeout |

---
### `GET /api/v1/news/notices`

> Get paginated regulatory notices and announcements.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_NOTICES`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fromDate` | query | `string` |  | Start date filter (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date filter (YYYY-MM-DD) |
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Paginated notices |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/news/stock-news`

> News articles for a specific stock symbol.

Get a paginated list of news articles associated with a specific stock symbol. The symbol parameter is required. Results are ordered by publish date descending.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_STOCK_NEWS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code to filter by (e.g., HPG). Required. |
| `page` | query | `integer` |  | Zero-based page index (default 0) |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Paginated news articles for the given stock |
| `400` | Bad request — symbol is required |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — upstream error |
| `504` | Gateway Timeout — upstream timeout |

---
### `GET /api/v1/news/{newsId}`

> Get a news article by ID.

**Auth:** 🔒 **JWT**  
**Operation ID:** `NEWS_BY_ID`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `newsId` | path | `integer` | ✓ | News article ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | News article |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
# Fundamentals

> Company fundamentals — financial profile, statements, shareholders, and insider transactions

**8 endpoints**

---

### `GET /api/v1/fundamentals/business-info`

> Get annual business info records for a listed stock symbol.

Returns business info records sourced from NHSV /api/v1/businessInfo/year for the given symbol. Each record contains key financial metrics (P&L, balance sheet, cash flow, valuation ratios) normalized across all company types: BANK, COMPANY, INSURANCE, SECURITIES. When `year` is provided, returns only the record for that year; otherwise returns all available years ordered newest-first.

**Auth:** 🔒 **JWT**  
**Operation ID:** `FUNDAMENTALS_BUSINESS_INFO`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code (e.g., VNM) |
| `year` | query | `integer` |  | Fiscal year (e.g., 2025). Omit to retrieve all years. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Business info records for the symbol |
| `400` | Bad request — missing or invalid symbol parameter |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/fundamentals/financial-ratio/ranking`

> Get top stocks ranked by financial ratio

Returns a paginated list of Vietnamese-listed stocks ranked by a chosen financial ratio (e.g. P/E, ROE, EPS). Results are sorted descending by default (highest ratio first). Supports filtering by market exchange and changing sort direction. Use `pageNumber` and `pageSize` for pagination.

**Auth:** 🔒 **JWT**  
**Operation ID:** `FUNDAMENTALS_FINANCIAL_RATIO_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `market` | query | `string` |  | Market exchange filter: HOSE | HNX | UPCOM |
| `financialRatio` | query | `string` |  | Financial ratio type (e.g. PE, ROE, EPS) |
| `sortAsc` | query | `boolean` |  | Sort ascending (default false = descending) |
| `pageNumber` | query | `integer` |  | Page number (1-based) |
| `pageSize` | query | `integer` |  | Page size |

**Responses:**

| Code | Description |
|---|---|
| `200` | Top stocks by financial ratio returned successfully |
| `400` | Bad request — invalid parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/fundamentals/financials`

> Get consolidated financial data for a stock symbol.

Get consolidated financial data for a stock symbol including income statements, balance sheets, cash flows, and key ratios.

**Auth:** 🔒 **JWT**  
**Operation ID:** `FUNDAMENTALS_FINANCIALS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code |

**Responses:**

| Code | Description |
|---|---|
| `200` | Consolidated financial data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/fundamentals/insiders`

> Get insider transaction history for a stock symbol with pagination.

Returns paginated insider trading transactions for the given symbol, including details on the insider's role (e.g. board member, executive) and buy/sell quantities with pre- and post-transaction holding ratios.

**Auth:** 🔒 **JWT**  
**Operation ID:** `FUNDAMENTALS_INSIDERS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code |
| `page` | query | `integer` |  | One-based page index (default 1) |
| `size` | query | `integer` |  | Page size (max 100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Insider transactions |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/fundamentals/profile`

> Get company profile for a listed stock symbol.

Get the company profile for a stock symbol including name, exchange, sector, industry, website, and employee count.

**Auth:** 🔒 **JWT**  
**Operation ID:** `FUNDAMENTALS_PROFILE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code (e.g., HPG) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Company profile |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/fundamentals/shareholders`

> Get the latest major shareholder snapshot for a stock symbol.

Returns the most recent shareholder holdings snapshot for the given symbol, including both major and minor shareholder breakdowns with their ownership ratios.

**Auth:** 🔒 **JWT**  
**Operation ID:** `FUNDAMENTALS_SHAREHOLDERS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code |

**Responses:**

| Code | Description |
|---|---|
| `200` | Major shareholders snapshot |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/fundamentals/statements`

> Get financial statements for a stock symbol.

Get financial statements for a stock symbol, optionally filtered by statement type.

**Auth:** 🔒 **JWT**  
**Operation ID:** `FUNDAMENTALS_STATEMENTS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code |
| `type` | query | `string` |  | Statement type: INCOME_STATEMENT | BALANCE_SHEET | CASH_FLOW |
| `page` | query | `integer` |  | One-based page index (default 1) |
| `size` | query | `integer` |  | Page size (max 100, default 4) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Financial statements |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/fundamentals/stock-sector/company-overview`

> Get company overview information for a stock symbol.

Get company overview information (sector, industry, description) for a stock symbol.

**Auth:** 🔒 **JWT**  
**Operation ID:** `FUNDAMENTALS_STOCK_SECTOR_COMPANY_OVERVIEW`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code (e.g., VNM) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Company overview |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
# Market

> Real-time and historical market data for stocks, indices, ETF, put-through, rankings, and foreigner flows

**38 endpoints**

---

### `GET /api/v1/market/candles`

> Get OHLCV candle data for a symbol.

Currently supports 1-day ('1d') timeframe only.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_CANDLES`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code (required) |
| `timeframe` | query | `string` | ✓ | Candle timeframe: 1d (daily) (required) |
| `fromDate` | query | `string` |  | Start date (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date (YYYY-MM-DD) |
| `limit` | query | `integer` |  | Maximum number of candles to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | OHLCV candle bars |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/current-dividend-event`

> Get the current active dividend event schedule.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_CURRENT_DIVIDEND_EVENT`

**Responses:**

| Code | Description |
|---|---|
| `200` | Current dividend events |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/daily-returns`

> Get daily return data for symbols over a date range.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_DAILY_RETURNS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbolList` | query | `string` | ✓ | Comma-separated list of stock codes (required) |
| `numberOfDays` | query | `integer` |  | Number of trading days of history to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Daily return data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/etf/{symbolCode}/index/daily`

> Get daily tracking index data for an ETF.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_ETF_INDEX_DAILY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbolCode` | path | `string` | ✓ | ETF stock code |
| `baseDate` | query | `string` |  | Base date anchor (YYYY-MM-DD) |
| `fetchCount` | query | `integer` |  | Maximum number of records |

**Responses:**

| Code | Description |
|---|---|
| `200` | ETF daily index data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/etf/{symbolCode}/nav/daily`

> Get daily NAV (Net Asset Value) history for an ETF.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_ETF_NAV_DAILY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbolCode` | path | `string` | ✓ | ETF stock code |
| `baseDate` | query | `string` |  | Base date anchor (YYYY-MM-DD) |
| `fetchCount` | query | `integer` |  | Maximum number of records |

**Responses:**

| Code | Description |
|---|---|
| `200` | ETF daily NAV data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/index-stock-list/{indexCode}`

> Get the list of constituent stocks in a market index.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_INDEX_STOCK_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `indexCode` | path | `string` | ✓ | Index code (e.g., VNINDEX, HNX30, VN30) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Index constituent stocks |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/index/list`

> Get the list of all available market indices.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_INDEX_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `market` | query | `string` |  | Market filter: HOSE | HNX | UPCOM |

**Responses:**

| Code | Description |
|---|---|
| `200` | Market index list |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/last-trading-date`

> Get the last trading date for each exchange.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_LAST_TRADING_DATE`

**Responses:**

| Code | Description |
|---|---|
| `200` | Last trading date per exchange |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/liquidity`

> Get market liquidity chart data (total value traded over time).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_LIQUIDITY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `market` | query | `string` | ✓ | Market exchange: HOSE | HNX | UPCOM (required) |
| `dateList` | query | `string` |  | Comma-separated date list (YYYY-MM-DD) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Market liquidity data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/price-board`

> Get the full price board snapshot for a given market or symbol list.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_PRICE_BOARD`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `category` | query | `string` | ✓ | Price board category (e.g., HOSE, HNX, UPCOM, or index code) |
| `symbolList` | query | `string` | ✓ | Comma-separated list of stock codes |

**Responses:**

| Code | Description |
|---|---|
| `200` | Price board snapshot |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/putthrough/advertise`

> Get current put-through advertised order list.

Get current put-through (thỏa thuận) advertised order list for a given exchange. When `marketType` is ALL or omitted, advertisements from HOSE, HNX, and UPCOM are merged. Reads from pre-computed D2 Redis keys with fallback to legacy key.

Response item fields (abbreviated market data format): `s` stock code, `t` timestamp (yyyyMMddHHmmss), `sb` side (B=buy, S=sell), `p` advertised price, `v` advertised volume (shares).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_PUTTHROUGH_ADVERTISE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `marketType` | query | `string` |  | Exchange: ALL | HOSE | HNX | UPCOM (default ALL) |
| `market` | query | `string` |  | Alias for marketType, accepted for compatibility |
| `sellBuyType` | query | `string` |  | Side filter: B (buy) | S (sell) |
| `offset` | query | `integer` |  | Result offset for pagination |
| `fetchCount` | query | `integer` |  | Maximum results to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Put-through advertised orders |
| `400` | Bad request — invalid parameter value |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/putthrough/deal`

> Get completed put-through deal history.

Get completed put-through deal history for a given exchange. When `marketType` is ALL or omitted, deals from HOSE, HNX, and UPCOM are merged. Reads from pre-computed D2 Redis keys with fallback to legacy key.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_PUTTHROUGH_DEAL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `marketType` | query | `string` |  | Exchange: ALL | HOSE | HNX | UPCOM (default ALL) |
| `market` | query | `string` |  | Alias for marketType, accepted for compatibility |
| `offset` | query | `integer` |  | Result offset for pagination |
| `fetchCount` | query | `integer` |  | Maximum results to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Put-through deal history |
| `400` | Bad request — invalid parameter value |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/putthrough/deal-total`

> Get aggregated totals for put-through deals.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_PUTTHROUGH_DEAL_TOTAL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `marketType` | query | `string` |  | Market type: HOSE | HNX | UPCOM |

**Responses:**

| Code | Description |
|---|---|
| `200` | Put-through deal totals |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/ranking/foreigner`

> Get stocks ranked by foreign investor net buy/sell activity.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_RANKING_FOREIGNER`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `type` | query | `string` | ✓ | Foreigner ranking type (required) |
| `market` | query | `string` |  | Market filter: HOSE | HNX | UPCOM |

**Responses:**

| Code | Description |
|---|---|
| `200` | Foreign investor ranking |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/ranking/up-down`

> Get up/down stock ranking per exchange, pre-computed by market-ingest.

Returns stocks ranked by daily price change for each Vietnamese exchange. When `marketType` is ALL or omitted, data for HOSE, HNX, and UPCOM is merged into a single response. Reads from pre-computed D2 Redis keys; falls back to real-time SYMBOL_INFO computation when any key is absent.

Response item fields (abbreviated market data format): `mt` market exchange (HOSE/HNX/UPCOM), `cd` stock code, `cl` price direction class (UP/DOWN/EQUAL/CEILING/FLOOR), `d` date (yyyyMMdd), `o` open price, `h` hig…

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_RANKING_UP_DOWN`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `marketType` | query | `string` |  | Exchange filter: ALL | HOSE | HNX | UPCOM (default ALL) |
| `upDownType` | query | `string` |  | Direction: UP | DOWN (default DOWN) |
| `offset` | query | `integer` |  | Result offset for pagination |
| `fetchCount` | query | `integer` |  | Maximum results to return per market |

**Responses:**

| Code | Description |
|---|---|
| `200` | Up/down ranking grouped by exchange |
| `400` | Bad request — invalid parameter value |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/ranking/{symbolType}/trade`

> Get trading volume/value ranking for symbols of a given type.

Get trading volume/value ranking for symbols of a given type (top gainers, losers, most traded, etc.).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_RANKING_TRADE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbolType` | path | `string` | ✓ | Security type: STOCK | ETF | BOND | FUTURES |
| `marketType` | query | `string` |  | Market type: HOSE | HNX | UPCOM |
| `sortType` | query | `string` |  | Sort criterion (e.g., by volume or value) |
| `offset` | query | `integer` |  | Result offset for pagination |
| `fetchCount` | query | `integer` |  | Maximum results to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Trading ranking results |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/session-status`

> Get the current trading session status for all exchanges.

Get the current trading session status for all exchanges (pre-open, open, break, close, etc.).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SESSION_STATUS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `market` | query | `string` |  | Exchange filter: HOSE | HNX | UPCOM |
| `type` | query | `string` |  | Session type filter |

**Responses:**

| Code | Description |
|---|---|
| `200` | Market session status |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/stock/ranking/period`

> Get stock performance ranking over a time period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_STOCK_RANKING_PERIOD`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `ranking` | query | `string` | ✓ | Ranking criterion (required) |
| `period` | query | `integer` | ✓ | Ranking window in days (required) |
| `marketType` | query | `string` |  | Market type: HOSE | HNX | UPCOM |
| `pageNumber` | query | `integer` |  | Page number |
| `pageSize` | query | `integer` |  | Page size |

**Responses:**

| Code | Description |
|---|---|
| `200` | Period performance ranking |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/stock/ranking/top`

> Get top stocks ranked by trading volume or value.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_STOCK_RANKING_TOP`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `marketType` | query | `string` |  | Market type: HOSE | HNX | UPCOM |
| `sortType` | query | `string` |  | Sort order: TRADING_VOLUME | TRADING_VALUE | CHANGE | RATE | POWER (default TRADING_VOLUME) |
| `upDownType` | query | `string` |  | Direction: UP | DOWN (default DOWN) |
| `offset` | query | `integer` |  | Result offset for pagination |
| `fetchCount` | query | `integer` |  | Maximum results to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Top stocks ranking |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/stock/ranking/up-down`

> Get stocks ranked by up/down price movement by exchange.

Get stocks ranked by daily price movement, grouped by exchange (HOSE / HNX / UPCOM).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_STOCK_RANKING_UP_DOWN`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `marketType` | query | `string` | ✓ | Market type: HOSE | HNX | UPCOM (required) |
| `upDownType` | query | `string` |  | Direction: UP | DOWN (default DOWN) |
| `fromDate` | query | `string` |  | Start date (yyyyMMdd); accepted but currently has no effect on results |
| `toDate` | query | `string` |  | End date (yyyyMMdd); accepted but currently has no effect on results |
| `offset` | query | `integer` |  | Result offset for pagination |
| `fetchCount` | query | `integer` |  | Maximum results to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Stocks ranked by price movement grouped by exchange |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol`

> Get static information for one or more listed stock symbols.

Get static information for one or more stock symbols (name, exchange, sector, lot size, etc.).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbolList` | query | `string` |  | Comma-separated list of stock codes (e.g., VNM,HPG,VIC) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Symbol static information |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol-quote/{symbol}`

> Get current quote data for a symbol (alternate endpoint).

Get the current quote data for a specific symbol (alternate endpoint).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_QUOTE_DATA`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✓ | Stock code (e.g., HPG) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Quote data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/foreigner-summary`

> Get a summary of foreign investor positions across all symbols.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_FOREIGNER_SUMMARY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `marketType` | query | `string` |  | Market type: HOSE | HNX | UPCOM |
| `sortType` | query | `string` |  | Sort order: CODE | NET_VALUE | NET_VOLUME (default CODE) |
| `offset` | query | `integer` |  | Result offset for pagination |
| `fetchCount` | query | `integer` |  | Maximum results to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Foreign investor position summary |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/latest`

> Get the latest normal-lot quote data for all active symbols.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_LATEST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbolList` | query | `string` |  | Comma-separated list of stock codes to filter |

**Responses:**

| Code | Description |
|---|---|
| `200` | Latest normal-lot quotes for all symbols |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/oddlot-latest`

> Get the latest odd-lot quote data for all active symbols.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_ODDLOT_LATEST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbolList` | query | `string` |  | Comma-separated list of stock codes to filter |

**Responses:**

| Code | Description |
|---|---|
| `200` | Latest odd-lot quotes for all symbols |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/static-info`

> Get static information for one or more stock symbols.

Equivalent to GET /market/symbol.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_STATIC_INFO`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbolList` | query | `string` |  | Comma-separated list of stock codes |

**Responses:**

| Code | Description |
|---|---|
| `200` | Symbol static information |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/tick-size-match`

> Get tick size and price matching configuration for a symbol.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_TICK_SIZE_MATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code |

**Responses:**

| Code | Description |
|---|---|
| `200` | Tick size configuration |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/{symbolCode}/foreigner`

> Get daily foreign investor trading data for a symbol.

Get daily foreign investor trading data for a symbol (buy/sell volumes and net position).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_FOREIGNER`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbolCode` | path | `string` | ✓ | Stock code |
| `fromDate` | query | `string` |  | Start date (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date (YYYY-MM-DD) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Foreign investor daily trading data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/{symbol}/minute-chart`

> Get minute chart data for a symbol for charting displays.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_MINUTE_CHART`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✓ | Stock code |

**Responses:**

| Code | Description |
|---|---|
| `200` | Minute chart data points |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/{symbol}/minutes`

> Get minute-by-minute quote data for a symbol's current trading session.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_MINUTES`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✓ | Stock code |
| `minuteUnit` | query | `integer` | ✓ | Minute aggregation unit (required) |
| `fromTime` | query | `string` |  | Start time (yyyyMMddHHmmss format) |
| `toTime` | query | `string` |  | End time (yyyyMMddHHmmss format) |
| `fetchCount` | query | `integer` |  | Maximum number of records |

**Responses:**

| Code | Description |
|---|---|
| `200` | Per-minute quote data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/{symbol}/period/{periodType}`

> Get periodic aggregated OHLCV data for a symbol by period type.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_PERIOD`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✓ | Stock code |
| `periodType` | path | `string` | ✓ | Aggregation period: DAILY | WEEKLY | MONTHLY | SIX_MONTH |
| `baseDate` | query | `string` |  | Base date anchor (YYYY-MM-DD) |
| `fetchCount` | query | `integer` |  | Maximum number of records to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Periodic OHLCV data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/{symbol}/quote`

> Get the current quote for a symbol including bid/ask and last price.

Get the current quote for a specific symbol including bid/ask, last price, and order matching data.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_QUOTE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✓ | Stock code (e.g., VNM) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Current quote data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/{symbol}/right`

> Get stock rights and corporate action information for a symbol.

Get stock rights and corporate action information for a symbol (splits, dividends, rights issues).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_RIGHT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✓ | Stock code |

**Responses:**

| Code | Description |
|---|---|
| `200` | Stock rights and corporate actions |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/{symbol}/statistic`

> Get intraday buy/sell statistics for a symbol by price range.

Get intraday buy/sell statistics for a symbol (cumulative buy/sell volumes by price range).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_STATISTIC`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✓ | Stock code |
| `pageSize` | query | `integer` | ✓ | Number of records per page (required) |
| `pageNumber` | query | `integer` | ✓ | Page number, 0-based (required) |
| `sortBy` | query | `string` |  | Sort field |

**Responses:**

| Code | Description |
|---|---|
| `200` | Intraday statistics |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/symbol/{symbol}/ticks`

> Get tick-level quote history for a symbol (intraday trading ticks).

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_SYMBOL_TICKS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✓ | Stock code |
| `tickUnit` | query | `integer` | ✓ | Tick aggregation unit (required) |
| `fromSequence` | query | `integer` |  | Start tick sequence number |
| `toSequence` | query | `integer` |  | End tick sequence number |
| `fetchCount` | query | `integer` |  | Maximum number of ticks to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Tick-level quote data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/top-ai-rating`

> Get stocks with the highest AI-generated ratings.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_TOP_AI_RATING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fetchCount` | query | `integer` |  | Maximum results to return |
| `lastOverAll` | query | `number` |  | Pagination cursor (last overall rating value) |
| `lastCode` | query | `string` |  | Pagination cursor (last stock code) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Top AI-rated stocks |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/top-foreigner-trading`

> Get top stocks by foreign investor net trading activity.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_TOP_FOREIGNER_TRADING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `marketType` | query | `string` |  | Market type: HOSE | HNX | UPCOM |
| `upDownType` | query | `string` |  | Sort direction on net foreign value: UP | DOWN (default DOWN; DOWN = largest net buyers first, UP = largest net sellers first) |
| `offset` | query | `integer` |  | Result offset for pagination |
| `fetchCount` | query | `integer` |  | Maximum results to return |

**Responses:**

| Code | Description |
|---|---|
| `200` | Top foreign trading stocks |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/market/vnindex-return`

> Get VN-Index cumulative return data for chart comparison.

**Auth:** 🔒 **JWT**  
**Operation ID:** `MARKET_VNINDEX_RETURN`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fromDate` | query | `string` | ✓ | Start date (YYYY-MM-DD) (required) |
| `pageNumber` | query | `integer` |  | Page number |
| `pageSize` | query | `integer` |  | Page size |

**Responses:**

| Code | Description |
|---|---|
| `200` | VN-Index return data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
# Social

> Social feed — posts, likes, follows, blocks, timeline, and cashtag feeds

**15 endpoints**

---

### `GET /api/v1/social/cashtags/{symbol}`

> Get social posts mentioning a cashtag.

Get social posts mentioning a specific stock cashtag (e.g., $VNM).

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_CASHTAGS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✓ | Stock code without the $ prefix (e.g., VNM) |
| `cursor` | query | `string` |  | Pagination cursor |
| `pageSize` | query | `integer` |  | Results per page (default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Posts mentioning the cashtag |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/social/posts`

> Create a new social post.

Cashtags (e.g., $VNM) in the content are automatically parsed.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_POSTS_CREATE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | Post created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/social/posts/{id}`

> Get a social post by ID.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_POSTS_GET`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Post ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Post data |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/social/posts/{id}`

> Update a social post.

Update the content of a post (only by the post author).

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_POSTS_PATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Post ID |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | Post updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/social/posts/{id}`

> Delete a social post.

Delete a post (only by the post author).

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_POSTS_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Post ID to delete |

**Responses:**

| Code | Description |
|---|---|
| `204` | No content |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/social/posts/{id}/likes`

> Like a post.

Returns 204 on success. Returns 404 if the post does not exist.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_POSTS_LIKE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Post ID to like |

**Request Body** — `application/json` (Optional):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `204` | No content |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/social/posts/{id}/likes`

> Remove a like from a post.

Returns 204 on success. Returns 404 if the post does not exist.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_POSTS_UNLIKE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Post ID to unlike |

**Responses:**

| Code | Description |
|---|---|
| `204` | No content |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/social/timeline`

> Get the authenticated user's social timeline.

Get the authenticated user's social timeline (posts from followed users, filtered by type).

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_TIMELINE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `filter` | query | `string` |  | Timeline filter: ALL | USER | NEWS (default: ALL) |
| `cursor` | query | `string` |  | Pagination cursor (ISO date string) |
| `pageSize` | query | `integer` |  | Results per page (1–50, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Timeline posts with next cursor |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/social/users/{id}/blocks`

> Block a user.

Blocked users' posts will not appear in the timeline.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_USERS_BLOCK`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | ID of the user to block |

**Request Body** — `application/json` (Optional):

| Field | Type | Required | Description |
|---|---|---|---|
| `reason` | `string` |  | Optional reason for blocking (stored for moderation purposes). |

**Responses:**

| Code | Description |
|---|---|
| `204` | No content |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/social/users/{id}/blocks`

> Unblock a previously blocked user.

Returns 204 on success. Returns 404 if the block does not exist.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_USERS_UNBLOCK`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | ID of the user to unblock |

**Responses:**

| Code | Description |
|---|---|
| `204` | No content |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/social/users/{id}/followers`

> Get followers of a user.

Get the list of users following the specified user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_USERS_FOLLOWERS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Target user ID |
| `cursor` | query | `string` |  | Pagination cursor |
| `limit` | query | `integer` |  | Maximum results |

**Responses:**

| Code | Description |
|---|---|
| `200` | Followers list with next cursor |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/social/users/{id}/following`

> Get users that a user is following.

Get the list of users that the specified user is following.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_USERS_FOLLOWING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Target user ID |
| `cursor` | query | `string` |  | Pagination cursor |
| `limit` | query | `integer` |  | Maximum results |

**Responses:**

| Code | Description |
|---|---|
| `200` | Following list with next cursor |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/social/users/{id}/follows`

> Follow another user.

Returns 204 on success. Returns 400 if a block relationship exists between the two users.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_USERS_FOLLOW`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | ID of the user to follow |

**Request Body** — `application/json` (Optional):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `204` | No content |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/social/users/{id}/follows`

> Unfollow a user.

Returns 204 on success. Idempotent — no error if the follow relationship does not exist.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_USERS_UNFOLLOW`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | ID of the user to unfollow |

**Responses:**

| Code | Description |
|---|---|
| `204` | No content |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Target user not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/social/users/{id}/posts`

> Get all posts by a specific user.

Returns an empty list if the requesting user is blocked by or has blocked the target user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `SOCIAL_USERS_POSTS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Target user ID |
| `cursor` | query | `string` |  | Pagination cursor |
| `pageSize` | query | `integer` |  | Results per page (default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | User posts with next cursor |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
# Insights

> User personalization — watchlist creation, management, symbol tracking, search history, and future AI-driven recommendations

**21 endpoints**

---

### `GET /api/v1/insights/notifications`

> Get market alert notifications from Redis for the authenticated user.

Returns paginated market alert notifications filtered by type, keyword, and date range.
Data is sourced from Redis `market:notices:{type}` hash keys.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_MARKET_NOTIFICATIONS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `type` | query | `string` |  | Notification type filter (default: ALL) |
| `keyword` | query | `string` |  | Keyword filter on title and content |
| `fromDate` | query | `string` |  | Start date filter (YYYYMMDD, default: 19700101) |
| `toDate` | query | `string` |  | End date filter (YYYYMMDD, default: today) |
| `pageSize` | query | `integer` |  | Page size (default: 20) |
| `pageNumber` | query | `integer` |  | Page number 0-based (default: 0) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Market alert notifications returned |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/insights/notifications`

> Soft-delete notifications for the authenticated user.

Soft-deletes one, multiple, or all notifications for the authenticated user.
Global (broadcast) notifications are soft-deleted via notification_recipients.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_NOTIFICATIONS_DELETE`

**Responses:**

| Code | Description |
|---|---|
| `204` | Notifications deleted |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/insights/notifications/inbox`

> Get the app notification inbox for the authenticated user.

Returns paginated inbox notifications (personal + global broadcasts) from the database.
Sorted by date DESC, created_at DESC, id DESC.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_NOTIFICATIONS_INBOX`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `pageNumber` | query | `integer` |  | Page number 1-based (default: 1) |
| `pageSize` | query | `integer` |  | Page size (default: 20, max: 100) |
| `type` | query | `string` |  | Notification type filter |

**Responses:**

| Code | Description |
|---|---|
| `200` | Inbox notifications returned |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/insights/notifications/reads`

> Mark notifications as read for the authenticated user.

Marks one, multiple, or all notifications as read.
Global (broadcast) notifications are tracked via notification_recipients.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_NOTIFICATIONS_MARK_READ`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `notificationIds` | `array[string]` |  | List of notification IDs to mark as read. If omitted or empty, marks ALL unread notifications as read. |
| `markAll` | `boolean` |  | If true, marks all unread notifications as read regardless of notificationIds. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Notifications marked as read |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/insights/notifications/unread-count`

> Get unread notification count for the authenticated user.

Returns the total count of unread notifications (personal + global broadcasts).

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_NOTIFICATIONS_UNREAD_COUNT`

**Responses:**

| Code | Description |
|---|---|
| `200` | Unread count returned |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/insights/search-history`

> Get recent search history for the authenticated user.

Returns the authenticated user's recent symbol searches ordered by most recent first,
limited to 20 entries.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_SEARCH_HISTORY_GET`

**Responses:**

| Code | Description |
|---|---|
| `200` | Recent search history returned |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/insights/search-history`

> Record a symbol search for the authenticated user.

Upserts the search history entry for the given user/symbol pair (updating searchedAt to now)
and atomically increments the global search count for that symbol.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_SEARCH_HISTORY_RECORD`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | Search recorded |
| `400` | Bad request — missing symbol |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/insights/search-history`

> Delete search history for the authenticated user.

If symbol is provided, deletes only that history entry. If symbol is omitted, clears
the entire search history for the authenticated user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_SEARCH_HISTORY_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` |  | Stock symbol to remove (omit to clear all) |

**Responses:**

| Code | Description |
|---|---|
| `204` | Search history deleted |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/insights/search-stats/top`

> Get top searched symbols by global search count.

Returns the most-searched symbols globally, ordered by search count descending.
Results are cached in Redis for 60 seconds. Default limit is 10, maximum is 50.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_SEARCH_STATS_TOP`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `limit` | query | `integer` |  | Number of results to return (default: 10, max: 50) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Top searched symbols returned |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/insights/settings/notification-preferences`

> Upsert per-type notification preferences for the authenticated user.

Enables or disables specific notification types for the authenticated user.
All updates are applied atomically within a transaction.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_NOTIFICATION_PREFERENCES_SAVE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `preferences` | `array[object]` | ✓ | Array of per-type notification preferences. All updates applied atomically. _(see nested fields below)_ |
| `preferences[].notificationType` | `string` |  | Notification type identifier (e.g. PRICE_ALERT, ORDER_FILL, NEWS, SOCIAL_LIKE). |
| `preferences[].enabled` | `boolean` |  | Whether this notification type is enabled for the user. |
| `preferences[].channels` | `array[string]` |  | Delivery channels for this notification type. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Preferences saved |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/insights/settings/notifications`

> Get news notification settings for the authenticated user.

Returns the user's news notification preferences: subscribed categories, watched symbols, and enabled flag.
If no record exists, returns defaults (empty arrays, enabled=false).

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_GET_NOTIFICATION_SETTINGS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Notification settings returned |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/insights/settings/notifications`

> Update news notification settings for the authenticated user.

Upserts the user's news notification preferences. Only provided fields are changed; omitted fields keep their existing value.
On first create, missing fields default to empty arrays / false.
Categories are limited to at most 50 items. Symbols are limited to at most 200 items.

**Auth:** 🔒 **JWT**  
**Operation ID:** `INSIGHTS_UPDATE_NOTIFICATION_SETTINGS`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `newsEnabled` | `boolean` |  | Enable or disable news notifications. |
| `categories` | `array[string]` |  | News categories to subscribe to (e.g. MARKET, COMPANY, MACRO). |
| `symbols` | `array[string]` |  | Stock symbols to follow for news alerts. |
| `frequency` | `string` |  | How frequently to receive news digests. Enum: `realtime`, `hourly`, `daily` |

**Responses:**

| Code | Description |
|---|---|
| `200` | Notification settings updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation (e.g. category limit exceeded) |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/insights/watchlists`

> Get all watchlists for the authenticated user.

Get all watchlists for the authenticated user, ordered by sequence.

**Auth:** 🔒 **JWT**  
**Operation ID:** `WATCHLIST_GET`

**Responses:**

| Code | Description |
|---|---|
| `200` | List of user watchlists |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/insights/watchlists`

> Create a new watchlist for the authenticated user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `WATCHLIST_CREATE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | Watchlist created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/insights/watchlists`

> Update an existing watchlist's name.

Update the name of an existing watchlist owned by the authenticated user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `WATCHLIST_EDIT`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | Watchlist updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/insights/watchlists/sequence`

> Reorder watchlists for the authenticated user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `WATCHLIST_SEQUENCE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | Watchlist order updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/insights/watchlists/symbol`

> Get all symbols in a specific watchlist.

Get all stock symbols in a watchlist owned by the authenticated user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `WATCHLIST_SYMBOL_GET`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `watchlistId` | query | `integer` | ✓ | Watchlist ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Watchlist symbols |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/insights/watchlists/symbol`

> Add a stock symbol to a watchlist.

Add one or more stock symbols to one or more watchlists owned by the authenticated user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `WATCHLIST_SYMBOL_ADD`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | Symbol added to watchlist |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/insights/watchlists/symbol`

> Remove a stock symbol from a watchlist.

Remove a stock symbol from one or more watchlists owned by the authenticated user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `WATCHLIST_SYMBOL_REMOVE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `watchlistId` | query | `string` | ✓ |  |
| `symbol` | query | `string` | ✓ | Stock symbol to remove |

**Responses:**

| Code | Description |
|---|---|
| `204` | Symbol removed from watchlist |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/insights/watchlists/symbol/include`

> Check whether a symbol is in any of the user's watchlists.

**Auth:** 🔒 **JWT**  
**Operation ID:** `WATCHLIST_SYMBOL_INCLUDE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | ✓ | Stock code to check |

**Responses:**

| Code | Description |
|---|---|
| `200` | Symbol watchlist membership info |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/insights/watchlists/{watchlistId}`

> Delete a watchlist for the authenticated user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `WATCHLIST_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `watchlistId` | path | `string` | ✓ | Watchlist ID |

**Responses:**

| Code | Description |
|---|---|
| `204` | Watchlist deleted |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
# Virtual Trading

> Virtual portfolio — sub-accounts, order simulation, profit/loss, and investing contests

**87 endpoints**

---

### `POST /api/v1/virtual/accounts`

> Initialize a new virtual trading account.

Creates and initializes a virtual trading account with the given sub-account identifier and starting balance. Called when a user creates their first portfolio.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ACCOUNT_INITIALIZE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `subAccount` | `string` |  |  |
| `name` | `string` |  |  |
| `quota` | `number` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `201` | Virtual account initialized |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/accounts/followers`

> List all users following the authenticated user's virtual trading account.

Returns a paginated list of users who follow the authenticated user's virtual trading account.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ACCOUNT_FOLLOWERS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Followers list |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/accounts/following-accounts`

> List all virtual trading accounts that the authenticated user follows.

Returns a paginated list of virtual trading accounts followed by the authenticated user, optionally filtered by follow type.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ACCOUNT_FOLLOWING_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Following accounts list |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/accounts/follows`

> Follow another user's virtual trading account to track their performance.

Creates a follow relationship between the authenticated user and the target user. Once followed, the target account's performance becomes visible in the social feed.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ACCOUNT_FOLLOW_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `followedId` | `integer` |  |  |
| `type` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `201` | Account followed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/virtual/accounts/follows/{followId}`

> Update the status or settings of an existing follow relationship.

Updates the follow relationship identified by followId. Can be used to mute or restore notifications from a followed account.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ACCOUNT_FOLLOW_PATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `followId` | path | `integer` | ✓ | Follow relationship ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `followedId` | `integer` |  |  |
| `type` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Follow updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/accounts/follows/{followedId}`

> Unfollow a virtual trading account.

Removes the follow relationship between the authenticated user and the specified followed user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ACCOUNT_FOLLOW_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `followedId` | path | `integer` | ✓ | ID of the followed account to unfollow |

**Responses:**

| Code | Description |
|---|---|
| `204` | Account unfollowed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/accounts/one-month-normalized-nav`

> Get the one-month normalized NAV performance for the virtual trading account.

Returns daily normalized NAV data points over a one-month window for the specified virtual sub-account. Used for performance chart rendering.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ACCOUNT_ONE_MONTH_NORMALIZED_NAV`

**Responses:**

| Code | Description |
|---|---|
| `200` | Normalized NAV data |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/admin/event`

> List all virtual trading events (admin only).

Returns a paginated list of corporate action events used in virtual trading simulations, optionally filtered by effective date range.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Event list |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/admin/event`

> Create a new virtual trading event (admin only).

Creates a corporate action event record (dividend, stock split, etc.) that will be applied to virtual account positions on the effective date.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` |  |  |
| `type` | `string` |  |  |
| `note` | `string` |  |  |
| `ratio` | `number` |  |  |
| `effectiveDate` | `string` |  |  |
| `price` | `number` |  |  |
| `eventGroup` | `string` |  |  |
| `numberOfShares` | `integer` |  |  |
| `expiredDate` | `string` |  |  |
| `actualDate` | `string` |  |  |
| `locale` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `201` | Event created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/admin/event`

> Update a virtual trading event (admin only).

Updates the disclosure date of an existing corporate action event record.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_UPDATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` |  |  |
| `disclosureDate` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Event updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/admin/event-adjust`

> List all event adjustment ratios (admin only).

Returns a paginated list of event adjustment ratio records used to adjust virtual account positions for corporate actions on the specified effective date.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Event adjustment ratios |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/admin/event-adjust`

> Create a new event adjustment ratio entry (admin only).

Creates a ratio adjustment record for a corporate action event. The ratio is used to scale virtual account positions on the event effective date.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` |  |  |
| `basicPrice` | `number` |  |  |
| `totalAdjustRate` | `number` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `201` | Adjustment created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/admin/event-adjust`

> Update an event adjustment ratio (admin only).

Updates the basic price and total adjust rate for an existing event adjustment ratio record identified by its numeric ID.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_UPDATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `integer` |  |  |
| `code` | `string` |  |  |
| `basicPrice` | `number` |  |  |
| `totalAdjustRate` | `number` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Adjustment updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/admin/event-adjust-id`

> Get a specific event adjustment ratio by ID (admin only).

Returns the full details of a single event adjustment ratio record identified by its numeric ID.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_BY_ID`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `adjustId` | query | `integer` | ✓ | Adjustment ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Event adjustment details |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/admin/event-adjust/{adjustId}`

> Delete an event adjustment ratio (admin only).

Permanently deletes an event adjustment ratio record identified by its numeric ID.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `adjustId` | path | `integer` | ✓ | Numeric ID of the adjustment record to delete |

**Responses:**

| Code | Description |
|---|---|
| `204` | Adjustment deleted |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/admin/event-id`

> Get a specific virtual trading event by ID (admin only).

Returns the full details of a single corporate action event record identified by its event ID string.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_BY_ID`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `eventId` | query | `integer` | ✓ | Event ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Event details |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/admin/event/{eventId}`

> Delete a virtual trading event (admin only).

Permanently deletes a corporate action event record. Only events that have not yet been applied to virtual accounts can be deleted.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_EVENT_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `eventId` | path | `string` | ✓ | ID of the event to delete |

**Responses:**

| Code | Description |
|---|---|
| `204` | Event deleted |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/admin/limited-stock`

> List stocks with trading restrictions configured by admin.

Returns all stocks that have been flagged with trading restrictions in the virtual trading engine, including the reason for each restriction.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_LIMITED_STOCK_LIST`

**Responses:**

| Code | Description |
|---|---|
| `200` | Admin limited stocks list |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/admin/limited-stock`

> Update the trading restriction configuration for a stock (admin only).

Sets or clears the trading restriction flag for one or more stocks in the virtual trading engine.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_LIMITED_STOCK_UPDATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `limitedStockCodes` | `array[string]` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Limited stock configuration updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/admin/settlement/cash-settlement-status`

> Get the cash settlement status for a date range (admin only).

Returns whether cash settlement has been completed for each trading day in the specified date range. Used by admins to verify settlement pipeline status.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_SETTLEMENT_CASH_STATUS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fromDate` | query | `string` | ✓ | Start date (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date (YYYY-MM-DD) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Cash settlement status |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/admin/settlement/quantity-settlement-status`

> Get the quantity (stock) settlement status for a date range (admin only).

Returns whether stock quantity settlement has been completed for each trading day in the specified date range. Used by admins to verify settlement pipeline status.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_SETTLEMENT_QUANTITY_STATUS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fromDate` | query | `string` | ✓ | Start date (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date (YYYY-MM-DD) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Quantity settlement status |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/admin/settlements/cash`

> Trigger a cash re-settlement for a date (admin only).

Re-runs the cash settlement process for the specified settlement date. Used to correct settlement errors or reprocess failed settlement jobs.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_SETTLEMENT_CASH_RESETTLE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `settlementDate` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Cash re-settlement triggered |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/admin/settlements/quantity`

> Trigger a quantity re-settlement for a date (admin only).

Re-runs the stock quantity settlement process for the specified settlement date. Used to correct settlement errors or reprocess failed settlement jobs.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_ADMIN_SETTLEMENT_QUANTITY_RESETTLE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `settlementDate` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Quantity re-settlement triggered |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/contests`

> List virtual trading contests the authenticated user has joined.

Returns the list of virtual trading contests that the authenticated user is currently participating in.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Joined contests |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/contests`

> Create a new virtual trading contest (admin only).

Creates a new virtual trading contest with the specified configuration including name, initial balance, ranking conditions, and participation rules.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `createdBy` | `string` |  |  |
| `organizationId` | `string` |  |  |
| `contestName` | `string` |  |  |
| `startAt` | `string` |  |  |
| `endAt` | `string` |  |  |
| `lastJoinAbleAt` | `string` |  |  |
| `requireNewSub` | `boolean` |  |  |
| `initialBalance` | `number` |  |  |
| `conditions` | `string` |  |  |
| `rankingInPeriods` | `string` |  |  |
| `description` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `201` | Contest created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/contests/booked`

> List contests the authenticated user has pre-registered for.

Returns the list of upcoming contests for which the authenticated user has a pending booking reservation.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_BOOKED`

**Responses:**

| Code | Description |
|---|---|
| `200` | Pre-registered contests |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/contests/expired`

> List expired virtual trading contests.

Returns a paginated list of contests that have ended, optionally filtered by status and sort order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_EXPIRED`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Expired contests |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/contests/listed`

> List all available (open for registration) virtual trading contests.

Returns all contests that are currently open for new participant registrations, optionally filtered by name.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_LISTED`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Available contests |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/contests/organization`

> List contests organized by the authenticated user's organization.

Returns the list of virtual trading contests created and managed by the authenticated user's organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_ORGANIZATION`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Organization contests |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/contests/search`

> Search contests with filters.

Returns a paginated list of virtual trading contests matching the specified filters including organization, status, and keyword.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_LIST`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | `string` |  |  |
| `contestStatus` | `string` |  |  |
| `pageNum` | `integer` |  |  |
| `pageSize` | `integer` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest search results |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/contests/{contestId}`

> Update the configuration of an existing virtual trading contest (admin only).

Updates an existing virtual trading contest configuration including name, initial balance, ranking conditions, stock blacklist, and participation rules. The contest must not have started.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_EDIT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | ID of the contest to update |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `updatedBy` | `string` |  |  |
| `contestId` | `integer` |  |  |
| `contestName` | `string` |  |  |
| `startAt` | `string` |  |  |
| `endAt` | `string` |  |  |
| `lastJoinAbleAt` | `string` |  |  |
| `rankingConditions` | `string` |  |  |
| `requireNewSub` | `boolean` |  |  |
| `initialBalance` | `number` |  |  |
| `stockBlacklist` | `string` |  |  |
| `description` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/contests/{contestId}`

> Delete a contest (admin only).

Permanently deletes a virtual trading contest. Only contests that have not yet started can be deleted.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID to delete |

**Responses:**

| Code | Description |
|---|---|
| `204` | Contest deleted |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/contests/{contestId}/current-ranking`

> Get the current real-time ranking for an active contest.

Returns the live leaderboard for the specified active contest, optionally filtered by period and conditional ranking rules.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_CURRENT_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Current contest ranking |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/contests/{contestId}/join`

> Join a virtual trading contest.

Enrolls the authenticated user in the specified contest using the given sub-account. A new sub-account portfolio may be created if required by the contest.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_JOIN`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID to join |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `contestId` | `integer` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest joined |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/contests/{contestId}/ranking`

> Get the final ranking for a completed contest.

Returns the final leaderboard for the specified contest, including participant rankings, NAV values, and return percentages over the contest period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Final contest ranking |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/contests/{contestId}/ranking-history`

> Get the ranking history over time for a contest.

Returns the historical ranking progression for participants in the specified contest, paginated by period number.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_RANKING_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |
| `fromDate` | query | `string` |  | Start date |
| `toDate` | query | `string` |  | End date |
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest ranking history |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/contests/{contestId}/registrations`

> Pre-register (book) a spot in an upcoming contest.

Allows a user to reserve a spot in a contest before it opens for active participation. Booked registrations are automatically activated when the contest starts.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_CONTESTS_BOOK`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `contestId` | `integer` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest registration confirmed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/accumulative-profit-loss`

> Get accumulated (cumulative) profit/loss for the virtual trading account.

Returns the cumulative P&L for the specified sub-account over the given date range, representing the total net gain or loss since account inception or from date.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_ACCUMULATIVE_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `subAccount` | query | `string` |  | Sub-account identifier |

**Responses:**

| Code | Description |
|---|---|
| `200` | Accumulative profit/loss |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/buyable`

> Calculate the maximum buyable quantity for a stock given the current account balance.

Returns the maximum number of shares that can be purchased for the given stock at the specified price, based on the available cash in the virtual account.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_BUYABLE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `stockCode` | query | `string` | ✓ | Stock code |
| `subAccount` | query | `string` |  | Sub-account identifier |
| `orderPrice` | query | `number` |  | Intended order price |

**Responses:**

| Code | Description |
|---|---|
| `200` | Maximum buyable quantity |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/daily-profit-loss`

> Get daily profit/loss history for the virtual account.

Returns a paginated list of daily P&L records for the specified sub-account and date range. Each record contains the NAV and P&L value for that day.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_DAILY_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `subAccount` | query | `string` |  | Sub-account identifier |
| `fromDate` | query | `string` |  | Start date (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date (YYYY-MM-DD) |
| `page` | query | `integer` |  | One-based page index (default 1) |
| `size` | query | `integer` |  | Page size (max 100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Daily profit/loss history |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/following-accumulative-pl`

> Get accumulative profit/loss for a followed user's virtual account.

Returns the cumulative P&L for a followed user's sub-account over the given date range. Requires a follow relationship with the target user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_FOLLOWING_ACCUMULATIVE_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `followedUserId` | query | `integer` |  | ID of the followed user |

**Responses:**

| Code | Description |
|---|---|
| `200` | Followed user accumulative profit/loss |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/following-daily-profit-loss`

> Get daily profit/loss for a followed user's virtual trading account.

Returns daily P&L records for a followed user's sub-account over the specified date range. Requires a follow relationship with the target user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_FOLLOWING_DAILY_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `followedUserId` | query | `integer` |  | ID of the followed user |
| `page` | query | `integer` |  | One-based page index (default 1) |
| `size` | query | `integer` |  | Page size (max 100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Followed user daily profit/loss |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/following-profit-loss`

> Get the profit/loss summary for a followed user's virtual trading account.

Returns NAV and unrealized P&L for a followed user's sub-account. Requires the authenticated user to follow the target account.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_FOLLOWING_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `followedUserId` | query | `integer` |  | ID of the followed user |

**Responses:**

| Code | Description |
|---|---|
| `200` | Followed user's profit/loss |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/profit-loss`

> Get current profit/loss, net asset value, and portfolio breakdown for the virtual trading account.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `subAccount` | query | `string` |  | Sub-account identifier |

**Responses:**

| Code | Description |
|---|---|
| `200` | Portfolio profit/loss summary |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/realized-profit-loss`

> Get realized profit/loss from closed positions in the virtual account.

Returns the total realized P&L from positions closed within the specified date range for the given virtual sub-account.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_REALIZED_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `subAccount` | query | `string` |  | Sub-account identifier |

**Responses:**

| Code | Description |
|---|---|
| `200` | Realized profit/loss |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/realized-profit-loss/history`

> Get historical realized profit/loss records with pagination.

Returns a paginated list of historical realized P&L records for the virtual trading account, ordered by settlement date.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_REALIZED_PROFIT_LOSS_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `subAccount` | query | `string` |  | Sub-account identifier |
| `fromDate` | query | `string` |  | Start date |
| `toDate` | query | `string` |  | End date |
| `page` | query | `integer` |  | One-based page index (default 1) |
| `size` | query | `integer` |  | Page size (max 100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Realized profit/loss history |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/accounts/sellable`

> Get the maximum sellable quantity for a stock in the virtual account.

Returns the number of shares available for sale for the given stock in the specified virtual sub-account.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ACCOUNT_SELLABLE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `stockCode` | query | `string` | ✓ | Stock code |
| `subAccount` | query | `string` |  | Sub-account identifier |

**Responses:**

| Code | Description |
|---|---|
| `200` | Maximum sellable quantity |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/event/by-stock`

> Get corporate action events (splits, dividends) for a stock.

Returns pending and historical corporate action events (stock splits, dividends, rights issues) for the specified stock codes that affect virtual account positions.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_EVENT_BY_STOCK`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `stockCode` | query | `string` | ✓ | Stock code |

**Responses:**

| Code | Description |
|---|---|
| `200` | Stock corporate events |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/limited-stock`

> Get the list of stocks with trading restrictions in virtual trading.

Returns stock codes that have been flagged with trading restrictions in the virtual trading engine (e.g. due to pending corporate actions).

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_LIMITED_STOCK`

**Responses:**

| Code | Description |
|---|---|
| `200` | Limited stocks list |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/equity/orders`

> Place a limit buy or sell order on the virtual trading account.

Places a virtual equity order. Supports BUY and SELL sides. The order is matched against simulated market data using the virtual exchange engine.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ORDER_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `subAccount` | `string` |  |  |
| `code` | `string` |  |  |
| `quantity` | `number` |  |  |
| `price` | `number` |  |  |
| `orderCommand` | `string` |  |  |
| `orderId` | `integer` |  |  |
| `action` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `201` | Order placed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/equity/orders/cancellations`

> Cancel multiple pending limit orders in a single request.

Bulk-cancels a list of unmatched limit orders. Orders already matched or cancelled are silently skipped.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ORDER_CANCEL_MULTI`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `orderIds` | `array[integer]` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Orders cancelled |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/orders/history`

> Get the order history for the user's virtual trading account.

Returns a paginated list of equity orders for the specified sub-account, optionally filtered by date range, buy/sell side, and order status.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ORDER_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `subAccount` | query | `string` |  | Sub-account filter |
| `fromDate` | query | `string` |  | Start date (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date (YYYY-MM-DD) |
| `page` | query | `integer` |  | One-based page index (default 1) |
| `size` | query | `integer` |  | Page size (max 100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Order history |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/orders/most-bought-stock`

> Get stocks most frequently bought by virtual traders.

Returns a ranked list of stocks by buy order volume across all virtual trading accounts over the recent period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ORDER_MOST_BOUGHT_STOCK`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fromDate` | query | `string` |  | Start date |
| `toDate` | query | `string` |  | End date |
| `limit` | query | `integer` |  | Maximum results |

**Responses:**

| Code | Description |
|---|---|
| `200` | Most bought stocks |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/orders/most-sold-stock`

> Get stocks most frequently sold by virtual traders.

Returns a ranked list of stocks by sell order volume across all virtual trading accounts over the recent period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ORDER_MOST_SOLD_STOCK`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fromDate` | query | `string` |  | Start date |
| `toDate` | query | `string` |  | End date |
| `limit` | query | `integer` |  | Maximum results |

**Responses:**

| Code | Description |
|---|---|
| `200` | Most sold stocks |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/equity/orders/stop-limit`

> Place a stop-limit order (limit order triggered when price condition is met).

Places a virtual stop-limit order. When the stock price reaches stopPrice, a limit order at limitPrice is automatically submitted.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_STOP_LIMIT_ORDER_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `orderId` | `integer` |  |  |
| `subAccount` | `string` |  |  |
| `stockCode` | `string` |  |  |
| `sellBuyType` | `string` |  |  |
| `stopPrice` | `number` |  |  |
| `limitPrice` | `number` |  |  |
| `orderQuantity` | `number` |  |  |
| `fromDate` | `string` |  |  |
| `toDate` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Stop-limit order placed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/equity/orders/stop-limit`

> Modify a pending stop-limit order.

Updates the stop price, limit price, quantity, or validity period of an active stop-limit order. Only orders in PENDING status can be modified.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ORDER_STOP_LIMIT_UPDATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `orderId` | `integer` |  |  |
| `subAccount` | `string` |  |  |
| `stockCode` | `string` |  |  |
| `sellBuyType` | `string` |  |  |
| `stopPrice` | `number` |  |  |
| `limitPrice` | `number` |  |  |
| `orderQuantity` | `number` |  |  |
| `fromDate` | `string` |  |  |
| `toDate` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Stop-limit order modified |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/equity/orders/stop-limit/{orderId}`

> Cancel a pending stop-limit order.

Cancels an active stop-limit order before it is triggered. The order must be in PENDING status.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_STOP_LIMIT_ORDER_CANCEL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `orderId` | path | `integer` | ✓ | ID of the stop-limit order to cancel |
| `subAccount` | query | `string` |  | Sub-account identifier (optional, defaults to primary account) |

**Responses:**

| Code | Description |
|---|---|
| `204` | Stop-limit order cancelled |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/equity/orders/{orderId}`

> Modify a pending limit order.

Updates the price and/or quantity of an unmatched limit order. Only orders in PENDING status can be modified.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ORDER_UPDATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `orderId` | path | `integer` | ✓ | ID of the order to modify |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `orderId` | `integer` |  |  |
| `newPrice` | `number` |  |  |
| `newQuantity` | `number` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Order modified |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/equity/orders/{orderId}`

> Cancel a pending limit order.

Cancels an unmatched limit order. Only orders in PENDING status can be cancelled.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_ORDER_CANCEL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `orderId` | path | `integer` | ✓ | ID of the order to cancel |

**Responses:**

| Code | Description |
|---|---|
| `204` | Order cancelled |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/equity/stop-orders`

> Place a stop order (market order triggered when price condition is met).

Places a virtual stop order that activates when the stock price reaches the specified stop price. Supports UP and DOWN trigger directions.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_STOP_ORDER_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `toDate` | `string` |  |  |
| `fromDate` | `string` |  |  |
| `orderType` | `string` |  |  |
| `stockCode` | `string` |  |  |
| `subAccount` | `string` |  |  |
| `stopPrice` | `number` |  |  |
| `orderPrice` | `number` |  |  |
| `sellBuyType` | `string` |  |  |
| `orderQuantity` | `integer` |  |  |
| `securitiesType` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `201` | Stop order placed |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/equity/stop-orders/bulk`

> Cancel multiple pending stop orders.

Bulk-cancels a list of active stop orders. Orders already triggered or cancelled are silently skipped.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_STOP_ORDER_CANCEL_MULTI`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `stopOrderIds` | query | `array` | ✓ |  |

**Responses:**

| Code | Description |
|---|---|
| `204` | Stop orders cancelled |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/stop-orders/history`

> Get stop order history with optional filters for date range and side.

Returns a paginated list of stop orders for the specified sub-account, optionally filtered by date range, buy/sell side, and order status.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_STOP_ORDER_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `subAccount` | query | `string` |  | Sub-account filter |
| `fromDate` | query | `string` |  | Start date (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date (YYYY-MM-DD) |
| `status` | query | `string` |  | Order status filter |
| `page` | query | `integer` |  | One-based page index (default 1) |
| `size` | query | `integer` |  | Page size (max 100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Stop order history |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/equity/stop-orders/{orderId}`

> Modify a pending stop order.

Updates the stop price, order quantity, or validity period of an active stop order. Only orders in PENDING status can be modified.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_STOP_ORDER_UPDATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `orderId` | path | `integer` | ✓ | Stop order ID to modify |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `stopOrderId` | `integer` |  |  |
| `newStopPrice` | `number` |  |  |
| `newOrderQuantity` | `integer` |  |  |
| `newFromDate` | `string` |  |  |
| `newToDate` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Stop order modified |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/equity/stop-orders/{orderId}`

> Cancel a pending stop order.

Cancels an active stop order before it is triggered. The order must be in PENDING status.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_STOP_ORDER_CANCEL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `orderId` | path | `integer` | ✓ | Stop order ID to cancel |

**Responses:**

| Code | Description |
|---|---|
| `204` | Stop order cancelled |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/equity/vn-index-return`

> Get VN-Index return data for comparison with the user's portfolio performance.

Returns VN-Index return values over various periods (1W, 1M, 3M, YTD) for benchmarking virtual portfolio performance.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_EQUITY_VNINDEX_RETURN`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fromDate` | query | `string` |  | Start date (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date (YYYY-MM-DD) |

**Responses:**

| Code | Description |
|---|---|
| `200` | VN-Index return data |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/following/{followingUserId}/sub-accounts`

> List active sub-accounts of a followed user.

Returns the active virtual trading sub-accounts belonging to the specified followed user. The authenticated user must follow the target user.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_FOLLOWING_SUB_ACCOUNTS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `followingUserId` | path | `integer` | ✓ | ID of the followed user |

**Responses:**

| Code | Description |
|---|---|
| `200` | Followed user's sub-accounts |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/hit-the-ceiling-or-floor-price`

> Get notifications for stocks that have hit their ceiling or floor price in virtual trading.

Returns whether the specified stock has reached its daily ceiling or floor price limit in the virtual trading simulation.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_HIT_CEILING_OR_FLOOR_PRICE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `subAccount` | query | `string` |  | Sub-account identifier |

**Responses:**

| Code | Description |
|---|---|
| `200` | Ceiling/floor price notifications |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/index/rank`

> Get the virtual portfolio performance ranking compared to an index.

Returns a paginated leaderboard of virtual portfolios ranked by their performance relative to the specified market index over the given period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_INDEX_RANK`

**Responses:**

| Code | Description |
|---|---|
| `200` | Index vs portfolio rank |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/leaderboard/current-investing-info`

> Get the current period investing summary for the leaderboard.

Returns the current leaderboard period metadata and the authenticated user's investing performance summary for that period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_LEADERBOARD_CURRENT_INVESTING_INFO`

**Responses:**

| Code | Description |
|---|---|
| `200` | Current leaderboard period info |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/leaderboard/investing`

> Get the virtual trading leaderboard ranked by investment performance.

Returns a paginated ranked list of virtual traders ordered by their normalized NAV performance over the current leaderboard period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_LEADERBOARD_INVESTING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `period` | query | `string` |  | Period: 1W | 1M | 3M | 6M | 1Y |
| `page` | query | `integer` |  | Zero-based page index |
| `size` | query | `integer` |  | Page size (1–100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Investing leaderboard |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/leaderboard/investing/user-ranking`

> Get the authenticated user's ranking position on the virtual trading leaderboard.

Returns the rank, total participants, and NAV for the authenticated user in the current leaderboard period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_LEADERBOARD_INVESTING_USER_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `period` | query | `string` |  | Period: 1W | 1M | 3M | 6M | 1Y |

**Responses:**

| Code | Description |
|---|---|
| `200` | User leaderboard ranking |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/periodic-profit-loss`

> Get profit/loss grouped by time period (1W, 1M, 3M, YTD).

Returns the authenticated user's virtual portfolio profit/loss summarized over standard time periods: 1 week, 1 month, 3 months, and year-to-date.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_PERIODIC_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `period` | query | `string` |  | Time period: 1W | 1M | 3M | 6M | 1Y |
| `subAccount` | query | `string` |  | Sub-account identifier |

**Responses:**

| Code | Description |
|---|---|
| `200` | Periodic profit/loss breakdown |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/portfolios`

> Create a new virtual trading portfolio for the authenticated user.

Creates a named virtual trading portfolio associated with a sub-account. The portfolio is initialized with the specified quota balance.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_PORTFOLIO_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `subAccount` | `string` |  |  |
| `name` | `string` |  |  |
| `quota` | `number` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `201` | Portfolio created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `422` | Unprocessable entity — business rule violation |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/virtual/portfolios/{portfolioId}`

> Update an existing virtual trading portfolio.

Updates the name of an existing virtual trading portfolio identified by its portfolio ID.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_PORTFOLIO_PATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `portfolioId` | path | `string` | ✓ | Sub-account identifier of the portfolio to update |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `subAccount` | `string` |  |  |
| `name` | `string` |  |  |
| `quota` | `number` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Portfolio updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/profile/trading-history`

> Get the authenticated user's virtual trading transaction history.

Returns a paginated list of completed trades for the specified virtual sub-account within the given date range, ordered by trade date.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_PROFILE_TRADING_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fromDate` | query | `string` |  | Start date (YYYY-MM-DD) |
| `toDate` | query | `string` |  | End date (YYYY-MM-DD) |
| `page` | query | `integer` |  | One-based page index (default 1) |
| `size` | query | `integer` |  | Page size (max 100, default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Trading history |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/recommended-accounts`

> Get the list of recommended virtual trading accounts.

Returns a paginated list of recommended virtual trading accounts for display in the user discovery feed.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_RECOMMENDED_ACCOUNTS_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `limit` | query | `integer` |  | Maximum results |

**Responses:**

| Code | Description |
|---|---|
| `200` | Recommended accounts |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/virtual/recommended-accounts`

> Save a list of recommended virtual trading accounts.

Stores a curated list of recommended virtual trading accounts for display to users in the discovery feed. Admin-only operation.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_RECOMMENDED_ACCOUNTS_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `recommendedAccounts` | `array[integer]` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Recommended accounts saved |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/virtual/search/account/history/{id}`

> Update an account search history record.

Updates the viewed user ID associated with an account search history record identified by id.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SEARCH_ACCOUNT_HISTORY_PATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Account search history record ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `viewedUserId` | `integer` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Account search history updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/search/account/history/{id}`

> Delete an account search history record.

Deletes a single account search history record or clears all account search history depending on the deleteType value.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SEARCH_ACCOUNT_HISTORY_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Account search history record ID to delete |

**Responses:**

| Code | Description |
|---|---|
| `204` | Account search history deleted |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/search/account/recent-views`

> Get recently viewed virtual accounts.

Returns the list of virtual trading accounts most recently viewed by the authenticated user, ordered by view time descending.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SEARCH_RECENT_ACCOUNT_VIEWS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `limit` | query | `integer` |  | Maximum results |

**Responses:**

| Code | Description |
|---|---|
| `200` | Recently viewed accounts |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/search/account/view-count`

> Get the total view count for virtual accounts.

Returns the total number of profile views for the specified user IDs in the virtual trading context.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SEARCH_ACCOUNT_TOTAL_VIEWS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Account view counts |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/virtual/search/history/{id}`

> Update a stock search history record.

Updates the stock code associated with a search history record identified by id.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SEARCH_HISTORY_PATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Search history record ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Search history updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/virtual/search/history/{id}`

> Delete a stock search history record.

Deletes a single stock search history record or clears all history depending on the deleteType value.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SEARCH_HISTORY_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Search history record ID to delete |

**Responses:**

| Code | Description |
|---|---|
| `204` | Search history deleted |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/search/ranking`

> Get stocks ranked by search frequency in virtual trading.

Returns a ranked list of stock codes ordered by how frequently they have been searched by virtual traders over the specified period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SEARCH_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `limit` | query | `integer` |  | Maximum results (default 20) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Search ranking |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/search/recent-views`

> Get recently viewed stocks in virtual trading.

Returns the list of stock codes most recently viewed by the authenticated user in the virtual trading context, ordered by view time descending.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SEARCH_RECENT_VIEWS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `limit` | query | `integer` |  | Maximum results |

**Responses:**

| Code | Description |
|---|---|
| `200` | Recently viewed stocks |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/virtual/search/view-count`

> Increment the view count for a virtual account or stock search.

Records a search view event for the given stock code, incrementing its search frequency counter used by the search ranking endpoint.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SEARCH_VIEW_COUNT_INCREMENT`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | View count updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/virtual/sub-accounts`

> List all active virtual trading sub-accounts for the authenticated user.

Returns the list of active virtual trading sub-accounts owned by the authenticated user, including portfolio name and balance.

**Auth:** 🔒 **JWT**  
**Operation ID:** `VIRTUAL_SUB_ACCOUNTS`

**Responses:**

| Code | Description |
|---|---|
| `200` | List of active sub-accounts |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
# Live Trading

> Real-money trading leaderboard, contest management, profit/loss analytics, and NHSV trading actions

**41 endpoints**

---

### `GET /api/v1/live/contests`

> List contests the authenticated user has joined.

Returns all active and upcoming contests that the user is enrolled in.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Joined contests returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/live/contests`

> Create a new real-trading contest.

Creates a new contest with the supplied configuration. Returns 409 if a contest with the same name already exists in the organization. On success, returns 201 Created with a Location header pointing to the new contest.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_CREATE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `createdBy` | `string` |  |  |
| `organizationId` | `string` |  |  |
| `contestName` | `string` |  |  |
| `startAt` | `string` |  |  |
| `endAt` | `string` |  |  |
| `lastJoinAbleAt` | `string` |  |  |
| `conditions` | `string` |  |  |
| `rankingInPeriods` | `string` |  |  |
| `description` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `201` | Contest created — Location: /api/v1/live/contests/{id} |
| `400` | Bad request — invalid date range or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `409` | Conflict — a contest with this name already exists in the organization |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/contests/bookings`

> List booked (pending-start) contests for the authenticated user.

Returns contests the user has booked but not yet joined, filtered by partnerId.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_BOOKED`

**Responses:**

| Code | Description |
|---|---|
| `200` | Booked contests returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/live/contests/list`

> List real-trading contests with optional filters.

Returns a paginated list of contests filtered by partner, organization, or status.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_LIST`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `partnerId` | `string` |  |  |
| `organizationId` | `string` |  |  |
| `contestStatus` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest list returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/contests/listed`

> List contests the authenticated user has not yet joined.

Returns open or upcoming contests available for the user to join, filtered by status.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_LISTED`

**Responses:**

| Code | Description |
|---|---|
| `200` | Available contests returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/live/contests/{contestId}`

> Update metadata of an existing real-trading contest.

Modifies contest metadata (name, dates, conditions) for an existing contest. The contestId is taken from the path. Returns 404 if the contest does not exist.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_UPDATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ |  |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `updatedBy` | `string` |  |  |
| `contestId` | `integer` |  |  |
| `contestName` | `string` |  |  |
| `startAt` | `string` |  |  |
| `endAt` | `string` |  |  |
| `lastJoinAbleAt` | `string` |  |  |
| `rankingConditions` | `string` |  |  |
| `description` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found — contest not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/live/contests/{contestId}`

> Delete a real-trading contest.

Permanently removes the specified contest. Returns 404 if not found or 409 if the contest has already started.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |
| `organizationId` | query | `string` | ✓ | Organization ID that owns the contest |

**Responses:**

| Code | Description |
|---|---|
| `204` | Contest deleted — no body |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found — contest not found |
| `409` | Conflict — contest has already started |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/live/contests/{contestId}/bookings`

> Book a slot in a real-trading contest.

Reserves a participation slot for the authenticated user in the specified contest. Returns 409 if the user has already booked or if the contest is full.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_BOOK`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `contestId` | `integer` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Booking created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `409` | Conflict — user has already booked or contest is full |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/live/contests/{contestId}/bookings`

> Cancel a contest booking.

Removes the authenticated user's booking for the specified contest before it starts. Returns 404 if no booking exists.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_CANCEL_BOOKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |

**Responses:**

| Code | Description |
|---|---|
| `204` | Booking cancelled |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — no booking found for this contest |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/contests/{contestId}/current-ranking`

> Get the authenticated user's current position in a contest ranking.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_CURRENT_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Current ranking returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — contest not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/live/contests/{contestId}/join`

> Join a real-trading contest.

Enrolls the authenticated user into the specified contest. Requires a prior booking. Returns 409 if already joined or 404 if no booking found.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_JOIN`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `contestId` | `integer` |  |  |
| `partnerId` | `string` |  |  |
| `partnerUsername` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest joined |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — booking not found |
| `409` | Conflict — user has already joined |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/contests/{contestId}/ranking`

> Get ranking for a live-trading contest.

Returns the leaderboard for the specified contest, paginated. Supports period filtering.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_CONTESTS_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `contestId` | path | `integer` | ✓ | Contest ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest ranking returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — contest not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/leaderboard/investing`

> Get leaderboard rankings for live investing.

Returns a paginated leaderboard of top live investors ranked by P&L rate for the given period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_LEADERBOARD_INVESTING`

**Responses:**

| Code | Description |
|---|---|
| `200` | Investing leaderboard returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/leaderboard/investing/user-ranking`

> Get the authenticated user's rank on the live investing leaderboard.

Returns the user's current rank, P&L rate, and period on the live investing leaderboard.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_LEADERBOARD_INVESTING_USER_RANKING`

**Responses:**

| Code | Description |
|---|---|
| `200` | User's investing rank returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/leaderboard/settings`

> Get the authenticated user's leaderboard participation settings.

Returns the user's current opt-in status and selected sub-account for the live leaderboard.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_LEADERBOARD_SETTINGS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Settings returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/live/leaderboard/settings`

> Update the authenticated user's leaderboard participation settings.

Sets whether the user opts into the public leaderboard and which sub-account is used for ranking.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_LEADERBOARD_SETTINGS_PATCH`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `partnerId` | `string` |  |  |
| `optBoard` | `boolean` |  |  |
| `subAccount` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Settings updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/portfolio/accumulative-profit-loss`

> Get accumulative P&L for the user's NHSV live portfolio over a date range.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ACCUMULATIVE_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `subAccount` | query | `string` | ✓ |  |
| `fromDate` | query | `string` | ✓ |  |
| `toDate` | query | `string` | ✓ |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Accumulative P&L returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/portfolio/daily-profit-loss`

> Get daily P&L for the user's NHSV live portfolio.

Returns a paginated list of daily profit-and-loss entries for the specified account and date range.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_DAILY_PROFIT_LOSS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Daily P&L returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/portfolio/following-acc-profit-loss`

> Get accumulative P&L for a followed user's NHSV live portfolio over a date range.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_FOLLOWING_ACCUMULATIVE_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `followingUserId` | query | `integer` | ✓ |  |
| `fromDate` | query | `string` | ✓ |  |
| `toDate` | query | `string` | ✓ |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Following user's accumulative P&L returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/portfolio/following-daily-profit-loss`

> Get daily P&L for a followed user's NHSV live portfolio.

Returns paginated daily P&L entries for another user that the caller is following.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_FOLLOWING_DAILY_PROFIT_LOSS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Following user's daily P&L returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/portfolio/following-profit-loss`

> Get cumulative P&L for a followed user's NHSV live portfolio.

Returns the overall realized P&L for a user that the caller is following.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_FOLLOWING_PROFIT_LOSS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Following user's P&L returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/portfolio/profit-loss`

> Get cumulative P&L for the user's NHSV live portfolio.

Returns the overall realized and unrealized profit-and-loss for the specified NHSV account.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_PROFIT_LOSS`

**Responses:**

| Code | Description |
|---|---|
| `200` | P&L returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/statistics/most-bought-stocks`

> Get most-bought stocks on the live trading platform.

Returns a ranked list of stock symbols bought most frequently by live traders in the given period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_MOST_BOUGHT_STOCKS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Most-bought stocks returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/statistics/most-searched-stocks`

> Get most-searched stocks on the live trading platform.

Returns a ranked list of stock symbols searched most frequently by live traders in the given period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_MOST_SEARCHED_STOCKS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Most-searched stocks returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/statistics/most-sold-stocks`

> Get most-sold stocks on the live trading platform.

Returns a ranked list of stock symbols sold most frequently by live traders in the given period.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_MOST_SOLD_STOCKS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Most-sold stocks returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/live/statistics/search/increase`

> Increment search count for a stock symbol.

Records a search event for the specified stock code to drive most-searched stock rankings.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_SEARCH_INCREASE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `partnerId` | `string` |  |  |
| `code` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Search count incremented |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/contests`

> List contests joined by an organization member.

Returns all active and upcoming contests that users in the organization are enrolled in.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_CONTESTS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Joined contests returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/contests/bookings`

> List booked contests for an organization member.

Returns contests that the organization's users have booked but not yet joined.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_CONTESTS_BOOKED`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Booked contests returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/contests/expired`

> List expired contests for an organization member.

Returns past contests that have ended, paginated and sortable by date.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_CONTESTS_EXPIRED`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Expired contests returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/contests/listed`

> List contests not yet joined by an organization member.

Returns open or upcoming contests available for the organization's users to join.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_CONTESTS_LISTED`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Available contests returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/live/{organizationId}/contests/{contestId}/bookings`

> Book a contest slot on behalf of an organization member.

Reserves a participation slot in the specified contest for a user within the organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_CONTESTS_BOOK`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |
| `contestId` | path | `integer` | ✓ | Contest ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `contestId` | `integer` |  |  |
| `organizationId` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Booking created |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `409` | Conflict — already booked or contest is full |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/contests/{contestId}/current-ranking`

> Get the current ranking position in an organization contest.

Returns the authenticated user's current rank and P&L rate in the organization contest.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_CONTESTS_CURRENT_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |
| `contestId` | path | `integer` | ✓ | Contest ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Current ranking returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — contest not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/live/{organizationId}/contests/{contestId}/join`

> Join a contest on behalf of an organization member.

Enrolls a user from the specified organization into the contest. Requires a prior booking.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_CONTESTS_JOIN`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |
| `contestId` | path | `integer` | ✓ | Contest ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | `string` |  |  |
| `contestId` | `integer` |  |  |
| `username` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest joined |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — booking not found |
| `409` | Conflict — user has already joined |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/contests/{contestId}/ranking`

> Get ranking for an organization contest.

Returns the leaderboard for a contest within the organization, paginated and period-filtered.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_CONTESTS_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |
| `contestId` | path | `integer` | ✓ | Contest ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Contest ranking returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — contest not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/contests/{contestId}/ranking-history`

> Get ranking history for an organization contest.

Returns historical leaderboard snapshots for the contest, paginated by date.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_CONTESTS_RANKING_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |
| `contestId` | path | `integer` | ✓ | Contest ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Ranking history returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — contest not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/following-daily-profit-loss`

> Get daily P&L for a followed user within an organization context.

Returns paginated daily P&L entries for a followed user, scoped to the given organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_FOLLOWING_DAILY_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Following user's daily P&L returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/following-profit-loss`

> Get cumulative P&L for a followed user within an organization context.

Returns the overall realized P&L for a followed user, scoped to the given organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_FOLLOWING_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Following user's cumulative P&L returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/leaderboard/investing`

> Get investing leaderboard for an organization.

Returns a paginated leaderboard of the top live investors within the specified organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_LEADERBOARD_INVESTING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Organisation investing leaderboard returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — organisation not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/leaderboard/investing/user-ranking`

> Get the user's rank on the organization investing leaderboard.

Returns the authenticated user's rank and P&L rate within the organization's leaderboard.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_LEADERBOARD_INVESTING_USER_RANKING`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | User's organisation investing rank returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — organisation not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/live/{organizationId}/leaderboard/settings`

> Get leaderboard participation settings for an organization member.

Returns the leaderboard opt-in status and sub-account selection for the user within the organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_LEADERBOARD_SETTINGS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Organisation leaderboard settings returned |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — organisation not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/live/{organizationId}/leaderboard/settings`

> Update leaderboard participation settings for an organization member.

Sets opt-in status and sub-account for the user's leaderboard entry within the organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_ORG_LEADERBOARD_SETTINGS_PATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `organizationId` | path | `string` | ✓ | Organisation ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | `string` |  |  |
| `optBoard` | `boolean` |  |  |
| `subAccount` | `string` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Settings updated |
| `400` | Bad request — invalid or missing parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden |
| `404` | Not found — organisation not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
# NHSV Equity

> Live equity trading via NHSV — account inquiry, order management (normal/advanced/stop/odd-lot/basket), reports, rights, loans, withdrawals, and transfers

**72 endpoints**

---

### `GET /api/v1/live/nhsv/common/current-time`

> Get the NHSV server's current time.

Public endpoint — no authentication required. Used by clients to synchronise their local clock with the NHSV exchange time before placing orders.

**Auth:** 🔓 **Public**  
**Operation ID:** `LIVE_NHSV_COMMON_CURRENT_TIME`

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/common/services`

> Get the list of NHSV services and their availability status.

Public endpoint — no authentication required. Used by clients to check which trading services are currently active (e.g. equity trading, derivatives trading, cash transfer).

**Auth:** 🔓 **Public**  
**Operation ID:** `LIVE_NHSV_COMMON_SERVICES`

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/asset-info`

> Get total asset breakdown.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_ASSET_INFO`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/banks`

> Get linked bank accounts.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_BANKS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/buyable`

> Get buyable quantity and purchasing power for a prospective order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_BUYABLE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `stockCode` | query | `string` | ✓ | Stock code to query buyable quantity for |
| `orderPrice` | query | `number` | ✓ | Intended order price in VND |
| `subNumber` | query | `string` |  | Sub-account number |
| `securitiesType` | query | `string` |  | Securities type (e.g. "S" for stock, "CW" for covered warrant) |
| `marketType` | query | `string` |  | Market type (e.g. "S" for HOSE, "H" for HNX) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/cash-balance`

> Get cash balance, margin, and deposits.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_CASH_BALANCE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |
| `bankAccount` | query | `string` |  | Linked bank account number |
| `bankCode` | query | `string` |  | Bank code |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/account/change-htspassword`

> Change HTS password (alias).

Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=CHANGE_PASSWORD.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_CHANGE_HTSPASSWORD`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/account/change-password`

> Change the HTS trading password for the linked NHSV equity account.

Routes to NHSV /api/v1/equity/account/changePassword — this is the HTS trading password required for order submission on the NHSV equity platform. This is NOT the same as user/change-password, which routes to NHSV /api/v1/user/changePassword (the platform login password for authenticating with NHSV services). Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=CHANGE_PASSWORD.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_CHANGE_PASSWORD`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/account/change-pin`

> Change order PIN.

Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=CHANGE_PASSWORD.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_CHANGE_PIN`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/daily-profit`

> Get daily P&L.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_DAILY_PROFIT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/loan-history`

> Get loan history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_LOAN_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/margin`

> Get margin ratio for a symbol.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_MARGIN`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` |  | Stock symbol to query margin for |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/mobile`

> Get account phone number.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_MOBILE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/profile`

> Get account profile (email, address, phone).

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_PROFILE`

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/profit-loss/history`

> Get realized P&L history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_PROFIT_LOSS_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/sellable`

> Get sellable stock positions for an account.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_SELLABLE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |
| `stockCode` | query | `string` |  | Filter by stock code; returns all positions when omitted |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/stock-balance`

> Get stock holdings.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_STOCK_BALANCE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/trading-summary`

> Get trading summary.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_TRADING_SUMMARY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/account/transaction-history`

> Get transaction history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ACCOUNT_TRANSACTION_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/basket-order/cancel`

> Cancel a basket.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_CANCEL`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/basket-order/history`

> Get basket order history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/basket-order/order/cancel`

> Cancel a basket order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_ORDER_CANCEL`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/basket-order/order/history`

> Get individual basket order history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_ORDER_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `basketOrderId` | query | `string` |  | Filter by basket order ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/basket-order/order/modify`

> Modify a basket order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_ORDER_MODIFY`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/basket-order/symbols`

> List symbols in a basket.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_SYMBOLS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `basketOrderId` | query | `string` | ✓ | Basket order ID to list symbols for |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/basket-order/symbols/update`

> Update basket symbols.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_SYMBOLS_UPDATE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/basket-order/update`

> Update a basket.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_UPDATE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/basket-orders`

> List basket orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDERS_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/basket-orders`

> Create a basket order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDERS_CREATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `DELETE /api/v1/live/nhsv/equity/basket-orders`

> Delete a basket.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDERS_DELETE`

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/basket-orders/submission`

> Submit a basket order for execution.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_BASKET_ORDERS_SUBMISSION`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent mutation |
| `X-OTP` | header | `string` | ✓ | NHSV 2FA one-time password for order submission |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/loan/available`

> Get available loans.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_LOAN_AVAILABLE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/loan/banks`

> Get available loan banks.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_LOAN_BANKS`

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/loan/detail`

> Get loan detail.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_LOAN_DETAIL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `loanId` | query | `string` | ✓ | Loan ID to retrieve detail for |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/loan/history`

> Get loan history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_LOAN_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/loan/register`

> Register a loan.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_LOAN_REGISTER`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/order/advance`

> Place an advance order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_ADVANCE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |
| `X-OTP` | header | `string` | ✓ | NHSV 2FA one-time password for order submission |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `409` | Conflict — idempotent request already in progress for this key; retry later |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/order/advance/cancel`

> Cancel an advance order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_ADVANCE_CANCEL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/order/advance/history`

> Get advance order history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_ADVANCE_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/order/cancel`

> Cancel an equity order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_CANCEL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `409` | Conflict — idempotent request already in progress for this key; retry later |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/order/cancel/all`

> Cancel all equity orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_CANCEL_ALL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/order/confirm`

> Get order confirmations.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_CONFIRM_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/order/confirm`

> Confirm equity orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_CONFIRM_EXECUTE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `409` | Conflict — idempotent request already in progress for this key; retry later |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/order/modify`

> Modify an equity order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_MODIFY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `409` | Conflict — idempotent request already in progress for this key; retry later |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/order/modify/all`

> Modify all equity orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_MODIFY_ALL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/order/oddlot`

> Place an odd lot order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |
| `X-OTP` | header | `string` | ✓ | NHSV 2FA one-time password for order submission |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/order/oddlot/cancel`

> Cancel an odd lot order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT_CANCEL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/order/oddlot/history`

> Get odd lot order history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/order/oddlot/sellable`

> Get odd lot sellable quantity.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT_SELLABLE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/order/oddlot/today-unmatch`

> Get today's unmatched odd lot orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT_TODAY_UNMATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/order/stop/cancel/all`

> Cancel all stop orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_STOP_CANCEL_ALL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/order/today-unmatch`

> Get today's unmatched equity orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_ORDER_TODAY_UNMATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `subNumber` | query | `string` |  | Sub-account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/rights/available`

> Get available rights.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_RIGHTS_AVAILABLE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/rights/cancel`

> Cancel a right.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_RIGHTS_CANCEL`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/rights/detail`

> Get right details.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_RIGHTS_DETAIL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `rightsId` | query | `string` | ✓ | Rights subscription ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/rights/history`

> Get rights history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_RIGHTS_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/rights/register`

> Register a right.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_RIGHTS_REGISTER`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/transfer/cash`

> Transfer cash.

Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=TRANSFER_CASH.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_EQUITY_TRANSFER_CASH_EXECUTE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/transfer/cash/account`

> Get transfer accounts.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_TRANSFER_CASH_ACCOUNT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/transfer/cash/cancel`

> Cancel a cash transfer.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_TRANSFER_CASH_CANCEL`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/transfer/cash/history`

> Get cash transfer history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_TRANSFER_CASH_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/transfer/stock`

> Transfer stock.

Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=TRANSFER_STOCK.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_EQUITY_TRANSFER_STOCK`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/transfer/stock/balance`

> Get transferable stock balance.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_TRANSFER_STOCK_BALANCE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/transfer/stock/history`

> Get stock transfer history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_TRANSFER_STOCK_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/withdraw/banks`

> Get withdrawal bank accounts.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_WITHDRAW_BANKS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/equity/withdraw/cancel`

> Cancel a withdrawal.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_WITHDRAW_CANCEL`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/equity/withdraw/history`

> Get withdrawal history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_EQUITY_WITHDRAW_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/equity/withdraw/request`

> Request a withdrawal.

Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=WITHDRAW.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_EQUITY_WITHDRAW_REQUEST`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/user/change-password`

> Change the NHSV platform login password for the authenticated user.

Routes to NHSV /api/v1/user/changePassword — this is the platform authentication password used to log in to NHSV services. This is NOT the same as account/change-password, which routes to NHSV /api/v1/equity/account/changePassword (the HTS trading password for order submission). Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=CHANGE_PASSWORD.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_USER_CHANGE_PASSWORD`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/user/push-tokens`

> Register a push notification token for the authenticated user's device.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_USER_PUSH_TOKENS`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — missing token or unsupported platform |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PATCH /api/v1/live/nhsv/user/update-profile`

> Update the linked NHSV user profile (email, phone, address).

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_USER_PATCH_PROFILE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/user/username`

> Check whether a username is already registered at NHSV.

Pre-login endpoint — no Paave JWT required. Callers are anonymous (username lookups during account creation). Gateway must enforce per-IP rate limiting (max 10 req/min). Authentication required to prevent user enumeration attacks.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_USER_USERNAME`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `username` | query | `string` | ✓ | NHSV username to check |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — missing or invalid username |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
# NHSV Derivatives

> Live derivatives trading via NHSV — account inquiry, futures orders, stop orders, position history, and cash/IM transfers

**39 endpoints**

---

### `GET /api/v1/live/nhsv/derivatives/account/balance`

> Get derivatives account balance.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_BALANCE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/account/equity`

> Get derivatives account equity info.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_EQUITY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/account/open-position`

> Get open positions.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_OPEN_POSITION`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/account/profit-loss`

> Get derivatives P&L.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_PROFIT_LOSS`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `tradingDate` | query | `string` |  | Trading date (ISO 8601, e.g. 2026-03-27) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/account/profit-loss/cumulative`

> Get cumulative derivatives P&L.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_PROFIT_LOSS_CUMULATIVE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/account/risk-ratio`

> Get risk ratio.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_RISK_RATIO`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/account/summary`

> Get derivatives account summary.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_SUMMARY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/account/trading-limit`

> Get trading limits.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_TRADING_LIMIT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/history/closed-position`

> Get closed position history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_CLOSED_POSITION`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/history/margin-call`

> Get margin call history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_MARGIN_CALL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/history/position`

> Get position history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_POSITION`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/history/settlement`

> Get settlement history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_SETTLEMENT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/history/trade`

> Get trade history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_TRADE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/derivatives/order`

> Place a derivatives order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |
| `X-OTP` | header | `string` | ✓ | NHSV 2FA one-time password for order submission |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `409` | Conflict — idempotent request already in progress for this key; retry later |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/order/available`

> Get available derivatives quantity.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_AVAILABLE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `symbol` | query | `string` |  | Filter by futures contract symbol |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/derivatives/order/cancel`

> Cancel a derivatives order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_CANCEL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `409` | Conflict — idempotent request already in progress for this key; retry later |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/derivatives/order/cancel/all`

> Cancel all derivatives orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_CANCEL_ALL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/order/history`

> Get derivatives order history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/derivatives/order/modify`

> Modify a derivatives order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_MODIFY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `409` | Conflict — idempotent request already in progress for this key; retry later |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/derivatives/order/modify/all`

> Modify all derivatives orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_MODIFY_ALL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/derivatives/order/stop`

> Place a derivatives stop order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |
| `X-OTP` | header | `string` | ✓ | NHSV 2FA one-time password for order submission |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `409` | Conflict — idempotent request already in progress for this key; retry later |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/derivatives/order/stop/cancel`

> Cancel a derivatives stop order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_CANCEL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/derivatives/order/stop/cancel/all`

> Cancel all derivatives stop orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_CANCEL_ALL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/order/stop/history`

> Get derivatives stop order history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/derivatives/order/stop/modify`

> Modify a derivatives stop order.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_MODIFY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `PUT /api/v1/live/nhsv/derivatives/order/stop/modify/all`

> Modify all derivatives stop orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_MODIFY_ALL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `X-Idempotency-Key` | header | `string` | ✓ | Client-generated unique key for idempotent order mutation |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/order/today-unmatch`

> Get today's unmatched derivatives orders.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_TODAY_UNMATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/order/unmatch-position`

> Get unmatched positions.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_ORDER_UNMATCH_POSITION`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/transfer/cash`

> Get derivatives cash transfer history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_CASH_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/derivatives/transfer/cash`

> Transfer derivatives cash.

Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=TRANSFER_CASH.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_CASH_EXECUTE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/transfer/cash/withdraw`

> Get derivatives withdrawal history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_CASH_WITHDRAW_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/derivatives/transfer/cash/withdraw`

> Withdraw derivatives cash.

Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=WITHDRAW.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_CASH_WITHDRAW_EXECUTE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/transfer/im/bank`

> Get IM transfer bank info.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_BANK`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `bankCode` | query | `string` |  | Filter by bank code |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/transfer/im/deposit`

> Get IM deposit info.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_DEPOSIT_INFO`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/derivatives/transfer/im/deposit`

> Submit IM deposit request.

Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=TRANSFER_CASH.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_DEPOSIT_SUBMIT`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/transfer/im/fee`

> Get IM transfer fee.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_FEE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/transfer/im/history`

> Get IM transfer history.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_HISTORY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `GET /api/v1/live/nhsv/derivatives/transfer/im/withdraw`

> Get IM withdrawal info.

**Auth:** 🔒 **JWT**  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_WITHDRAW_INFO`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `accountNumber` | query | `string` | ✓ | Linked NHSV derivatives account number |
| `fromDate` | query | `string` |  | Start date (ISO 8601, e.g. 2026-01-01) |
| `toDate` | query | `string` |  | End date (ISO 8601, e.g. 2026-03-31) |

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
### `POST /api/v1/live/nhsv/derivatives/transfer/im/withdraw`

> Submit IM withdrawal request.

Requires step-up authentication. Obtain X-StepUp-Token via POST /api/v1/auth/stepup with actionType=WITHDRAW.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_WITHDRAW_SUBMIT`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OK — NHSV upstream response |
| `400` | Bad Request — invalid parameters or missing required fields |
| `401` | Unauthorized — invalid or expired credentials |
| `403` | Forbidden — insufficient scope or account not linked |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |
| `502` | Bad Gateway — NHSV upstream error |
| `504` | Gateway Timeout — NHSV upstream did not respond in time |

---
# Administration

> Admin and app configuration APIs — locale resources, FAQ, holidays, feature flags, AWS signing, event management, scope/scopeGroup CRUD, limited stock, dataview, menus, and virtual settlement operations

**58 endpoints**

---

### `GET /api/v1/admin/aws`

> Get a pre-signed upload URL for the file store.

Returns a pre-signed S3 or Minio URL that allows the authenticated user to upload a file directly to the object store. Optionally scoped to a named service bucket.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_AWS_SIGNED_URL`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `key` | query | `string` | ✓ | Object storage key path |
| `serviceName` | query | `string` |  | Service name for bucket scoping |

**Responses:**

| Code | Description |
|---|---|
| `200` | Presigned upload URL returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/clients`

> List OAuth clients (admin).

Returns all registered OAuth clients, supporting pagination and optional domain filtering. Used by the admin console to manage application registrations.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_CLIENTS_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `domain` | query | `string` |  | Service domain filter |
| `fetchCount` | query | `integer` |  | Number of records to fetch |
| `lastSequence` | query | `integer` |  | Pagination cursor |
| `isFullData` | query | `boolean` |  | Include full login method details |

**Responses:**

| Code | Description |
|---|---|
| `200` | OAuth client list returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/clients`

> Create a new OAuth client (admin).

Registers a new OAuth client application with the specified credentials and domain. Publishes a client-update Kafka event so the gateway syncs immediately.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_CLIENT_CREATE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | OAuth client created |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/clients/{id}`

> Get an OAuth client by ID (admin).

Returns the full details of a single OAuth client including its login methods. Used by the admin console to view and edit a specific client registration.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_CLIENT_GET`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | OAuth client record ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | OAuth client details returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Client not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/admin/clients/{id}`

> Update an OAuth client (admin).

Modifies the metadata or login method assignments of an existing OAuth client. Publishes a client-update Kafka event so the gateway syncs the changes.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_CLIENT_UPDATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | OAuth client record ID |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OAuth client updated |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Client not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/admin/clients/{id}`

> Delete (disable) an OAuth client (admin).

Soft-deletes the OAuth client by setting its status to DISABLED. Existing sessions are not invalidated immediately; the gateway stops accepting new tokens for this client on the next sync.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_CLIENT_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | OAuth client record ID |

**Responses:**

| Code | Description |
|---|---|
| `204` | OAuth client disabled |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Client not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/admin/clients/{id}/secret`

> Change the client secret for an OAuth client (admin).

Replaces the secret of the specified OAuth client. All existing sessions using the old secret remain valid until they expire. WARNING: This endpoint changes an OAuth client secret. Requires step-up authentication (X-StepUp-Token with actionType=CHANGE_PASSWORD). Should only be accessible from trusted admin networks. Consider IP whitelisting at infrastructure level.

**Auth:** 🔐 **JWT + Step-Up Token** (`X-StepUp-Token` required)  
**Operation ID:** `ADMIN_CLIENT_SECRET_UPDATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `string` | ✓ | OAuth client ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `clientId` | `string` | ✓ |  |
| `clientSecret` | `string` | ✓ |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Client secret updated |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Client not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/common/dataview`

> Query a named data view (admin).

Executes the configured data view identified by code and returns a paginated result set. Used by the admin console to display generic configurable tables.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_DATAVIEW_QUERY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `code` | query | `string` | ✓ | Data view code identifier |
| `fetchCount` | query | `integer` |  | Number of records to fetch |
| `lastSequence` | query | `integer` |  | Pagination cursor |

**Responses:**

| Code | Description |
|---|---|
| `200` | Data view results returned |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/export/db-json-file`

> Export all configuration data as a JSON file (admin).

Serialises the entire configuration database (clients, scopes, login methods, etc.) to a JSON snapshot. Used for backup and environment migration.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_EXPORT_DB_JSON`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `tables` | `array[string]` |  | List of table names to export. |
| `format` | `string` |  |  Enum: `json`, `csv` |

**Responses:**

| Code | Description |
|---|---|
| `200` | Configuration data exported as JSON |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/faq/{faqId}/review/{isUseful}`

> Submit a helpfulness review for a FAQ item.

Records whether the authenticated user found a specific FAQ answer useful. Each user may submit at most one review per FAQ item; a duplicate submission returns an error.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_FAQ_REVIEW_SUBMIT`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `faqId` | path | `integer` | ✓ | FAQ item ID |
| `isUseful` | path | `boolean` | ✓ | Whether the FAQ was found useful |

**Responses:**

| Code | Description |
|---|---|
| `200` | FAQ review recorded |
| `400` | Duplicate review submission |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | FAQ not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/feature-flags`

> Get the current value of a feature flag.

Returns the value, type, and enabled state of the specified feature flag key. Values are served from a 30-second in-memory cache; stale entries are refreshed on the next request. Keys must match the pattern feature.* or db.*.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_FEATURE_FLAG_GET`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `key` | query | `string` | ✓ | Feature flag key (e.g. feature.VIRTUAL_TRADING) |

**Responses:**

| Code | Description |
|---|---|
| `200` | Feature flag value returned |
| `400` | Invalid flag key format |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Flag not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/feature-flags`

> Set the value of a feature flag.

Updates the value of the specified feature flag. The value is validated against the flag's declared type (boolean, string, or number). Broadcasts a flag-update Kafka event so other services invalidate their local caches immediately.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_FEATURE_FLAG_SET`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | Feature flag updated |
| `400` | Invalid flag key format or value type |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Flag not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/admin/feature-flags`

> Update the value of a feature flag (PUT alias).

Routes to the same handler as post:/api/v1/admin/feature-flags. Registered to handle PUT requests from gateway clients that use PUT for update operations.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_FEATURE_FLAG_SET_PATCH`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | Feature flag updated |
| `400` | Invalid flag key format or value type |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Flag not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/feature-flags/all`

> List all feature flags and their current values.

Returns every registered feature flag with its key, current value, type, and enabled state. Used by the admin console to audit and manage the flag inventory.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_FEATURE_FLAGS_ALL`

**Responses:**

| Code | Description |
|---|---|
| `200` | All feature flags returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/import/db-json-file`

> Import configuration data from a JSON file (admin).

Loads a previously exported JSON snapshot into the configuration database. Existing records are upserted; records absent from the snapshot are left intact.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_IMPORT_DB_JSON`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `fileUrl` | `string` |  | URL of the JSON file to import. |
| `dryRun` | `boolean` |  | If true, validate without committing. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Configuration data imported from JSON |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/interest-info`

> Retrieve current interest rate information.

Returns the published interest rate data used by the trading services to calculate margin interest charges and loan costs for brokerage accounts.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_INTEREST_INFO_LIST`

**Responses:**

| Code | Description |
|---|---|
| `200` | Interest rate information returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/locale/internal`

> Fetch locale resources with full file content for internal consumers.

Returns locale resource files including their content fetched from the object store. Used by internal services that need to embed i18n strings at runtime without making additional CDN requests.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOCALE_INTERNAL_GET`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `msNames` | query | `array` |  | Service names to fetch locale for |

**Responses:**

| Code | Description |
|---|---|
| `200` | Locale resources with content returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/locale/resource`

> List all locale resources across all services (admin).

Returns all locale resource entries across all registered services and languages. Used by the admin console to browse and manage i18n content.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOCALE_RESOURCE_LIST`

**Responses:**

| Code | Description |
|---|---|
| `200` | All locale resources returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PATCH /api/v1/admin/locale/{keyId}/{lang}`

> Update a locale translation for a specific key and language (admin).

Sets or replaces the translation value for the specified key and language code. Used by the admin console to edit individual i18n strings inline.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOCALE_TRANSLATION_PATCH`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `keyId` | path | `integer` | ✓ | Translation key ID |
| `lang` | path | `string` | ✓ | Language code (e.g. vi, en) |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | Translation updated |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Key not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/locale/{namespaceId}/keys`

> List all locale translation keys for a namespace (admin).

Returns all keys registered under the specified namespace, with their IDs and metadata. Used by the admin console to browse and edit i18n strings per namespace.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOCALE_KEYS_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `namespaceId` | path | `integer` | ✓ | Namespace ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Locale keys returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Namespace not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/locale/{namespaceId}/keys`

> Add a new locale translation key to a namespace (admin).

Creates a new translation key under the specified namespace. The key must be unique within the namespace. Translations for each language are added separately.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOCALE_KEY_CREATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `namespaceId` | path | `integer` | ✓ | Namespace ID |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | Locale key created |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/admin/locale/{namespaceId}/keys/{keyId}`

> Delete a locale translation key from a namespace (admin).

Permanently removes the key and all its translations across all languages. This operation cannot be undone.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOCALE_KEY_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `namespaceId` | path | `integer` | ✓ | Namespace ID |
| `keyId` | path | `integer` | ✓ | Key ID to delete |

**Responses:**

| Code | Description |
|---|---|
| `204` | Locale key deleted |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Key not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/locale/{namespaceId}/uploads`

> Upload locale files for a namespace to the object store (admin).

Packages and uploads the locale files for the specified namespace to AWS S3 or Minio, then triggers a CDN refresh so clients pick up the updated translations.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOCALE_UPLOAD`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `namespaceId` | path | `integer` | ✓ | Namespace ID |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | Locale files uploaded to object store |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/login-methods`

> List all login methods (admin).

Returns all registered login methods, supporting pagination. Used by the admin console to manage the available authentication flows per client.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOGIN_METHODS_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fetchCount` | query | `integer` |  | Number of records to fetch |
| `lastSequence` | query | `integer` |  | Pagination cursor |

**Responses:**

| Code | Description |
|---|---|
| `200` | Login method list returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/login-methods`

> Create a new login method (admin).

Registers a new authentication flow definition, including the target identity service URI and token TTLs. After creation the gateway syncs the new method.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOGIN_METHOD_CREATE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | Login method created |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/login-methods/{id}`

> Get a login method by ID (admin).

Returns the full details of a single login method including its step definitions and scope group assignments.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOGIN_METHOD_GET`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Login method ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Login method details returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Login method not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/admin/login-methods/{id}`

> Update an existing login method (admin).

Modifies the parameters of a registered login method such as token TTLs, scope group assignments, or step definitions.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOGIN_METHOD_UPDATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Login method ID |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | Login method updated |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Login method not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/admin/login-methods/{id}`

> Delete a login method (admin).

Permanently removes the login method and detaches it from all clients. Clients currently assigned this login method will fall back to their remaining methods.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOGIN_METHOD_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `integer` | ✓ | Login method ID |

**Responses:**

| Code | Description |
|---|---|
| `204` | Login method deleted |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Login method not found |
| `422` | Business rule validation failed. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/menus`

> Query menus available to one or more role IDs (admin).

Returns the menu items accessible to any of the given role IDs. Used by the admin console to render role-appropriate navigation menus.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_MENUS_QUERY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `menuRoleIds` | query | `array` |  | Role IDs to query menus for |

**Responses:**

| Code | Description |
|---|---|
| `200` | Menu items returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/open-api`

> List OpenAPI spec entries (paginated, admin).

Returns a paginated list of OpenAPI operation records stored in the database. Used by the admin console and the scope-gen tool to inspect the current spec.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_OPEN_API_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fetchCount` | query | `integer` |  | Number of records to fetch |
| `lastSequence` | query | `integer` |  | Pagination cursor |

**Responses:**

| Code | Description |
|---|---|
| `200` | OpenAPI entry list returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/admin/open-api`

> Update OpenAPI spec entries from a URL list (admin).

Downloads OpenAPI spec files from the provided URLs, parses each operation, and upserts the entries into the database. Triggers a regeneration of the per-client OpenAPI file uploads on completion.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_OPEN_API_UPDATE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OpenAPI entries updated |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/admin/open-api`

> Delete OpenAPI spec entries by scope ID list (admin).

Removes the specified OpenAPI operation records from the database. Used to clean up stale or retired endpoint entries.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_OPEN_API_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `scopeIdList` | query | `array` | ✓ | Scope IDs to delete |

**Responses:**

| Code | Description |
|---|---|
| `204` | OpenAPI entries deleted |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/open-api/file`

> Get the generated OpenAPI file URL for a client.

Returns the CDN URL of the pre-built OpenAPI JSON file scoped to the specified client ID. The file contains only the operations the client has access to.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_OPEN_API_FILE_GET`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `clientId` | query | `string` | ✓ | OAuth client ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | OpenAPI file URL returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | No OpenAPI file for client |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/organizations`

> Create a new organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `POST_API_V1_ADMIN_ORGANIZATIONS`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` |  |  |
| `code` | `string` |  |  |
| `description` | `string` |  |  |
| `isActive` | `boolean` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Success |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/admin/organizations`

> Update an existing organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `PUT_API_V1_ADMIN_ORGANIZATIONS`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` |  |  |
| `name` | `string` |  |  |
| `code` | `string` |  |  |
| `isActive` | `boolean` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Success |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/admin/organizations`

> Delete an organization.

**Auth:** 🔒 **JWT**  
**Operation ID:** `DELETE_API_V1_ADMIN_ORGANIZATIONS`

**Responses:**

| Code | Description |
|---|---|
| `200` | Success |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/partners`

> Create a new partner.

**Auth:** 🔒 **JWT**  
**Operation ID:** `POST_API_V1_ADMIN_PARTNERS`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` |  |  |
| `code` | `string` |  |  |
| `callbackUrl` | `string` |  |  |
| `isActive` | `boolean` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Success |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/admin/partners/{id}`

> Update an existing partner.

**Auth:** 🔒 **JWT**  
**Operation ID:** `PUT_API_V1_ADMIN_PARTNERS_ID`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `string` | ✓ | Partner ID |

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` |  |  |
| `callbackUrl` | `string` |  |  |
| `isActive` | `boolean` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Success |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/admin/partners/{id}`

> Delete a partner.

**Auth:** 🔒 **JWT**  
**Operation ID:** `DELETE_API_V1_ADMIN_PARTNERS_ID`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | `string` | ✓ | Partner ID |

**Responses:**

| Code | Description |
|---|---|
| `200` | Success |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/scope-groups`

> List all OAuth scope groups (admin).

Returns all registered scope groups, which bundle sets of scopes for assignment to login methods. Used by the admin console to manage access groupings.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPE_GROUPS_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fetchCount` | query | `integer` |  | Number of records to fetch |
| `lastSequence` | query | `integer` |  | Pagination cursor |

**Responses:**

| Code | Description |
|---|---|
| `200` | Scope group list returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/scope-groups`

> Create a new OAuth scope group (admin).

Creates a named group that bundles one or more scopes. Scope groups are then assigned to login methods to grant access to the bundled URI patterns.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPE_GROUP_CREATE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | OAuth scope group created |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/admin/scope-groups/{scopeGroupId}`

> Update an existing OAuth scope group (admin).

Modifies the name or scope membership of an existing scope group. Changes are propagated to all login methods that reference this group on the next sync.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPE_GROUP_UPDATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `scopeGroupId` | path | `integer` | ✓ | Scope group ID |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OAuth scope group updated |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Scope group not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/admin/scope-groups/{scopeGroupId}`

> Delete an OAuth scope group (admin).

Permanently removes the scope group and detaches it from all login methods. Deleted scope groups are removed from the gateway on the next sync cycle.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPE_GROUP_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `scopeGroupId` | path | `integer` | ✓ | Scope group ID |

**Responses:**

| Code | Description |
|---|---|
| `204` | OAuth scope group deleted |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Scope group not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/scopes`

> List all OAuth scopes (admin).

Returns all registered scopes across all clients, supporting pagination via fetchCount and lastSequence. Used by the admin console to manage scope assignments.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPES_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `fetchCount` | query | `integer` |  | Number of records to fetch |
| `lastSequence` | query | `integer` |  | Pagination cursor |

**Responses:**

| Code | Description |
|---|---|
| `200` | Scope list returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/scopes`

> Create a new OAuth scope (admin).

Registers a new scope that can be assigned to scope groups and used to control access to specific URI patterns. After creation, the gateway syncs the new scope.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPE_CREATE`

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `201` | OAuth scope created |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `PUT /api/v1/admin/scopes/{scopeId}`

> Update an existing OAuth scope (admin).

Modifies the name, URI pattern, or domain of an existing scope. Changes are propagated to the gateway on the next sync cycle.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPE_UPDATE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `scopeId` | path | `integer` | ✓ | Scope ID |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | OAuth scope updated |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Scope not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `DELETE /api/v1/admin/scopes/{scopeId}`

> Delete an OAuth scope (admin).

Permanently removes the scope and detaches it from all scope groups. Deleted scopes are removed from the gateway on the next sync cycle.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPE_DELETE`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `scopeId` | path | `integer` | ✓ | Scope ID |

**Responses:**

| Code | Description |
|---|---|
| `204` | OAuth scope deleted |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Scope not found |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/sync/holiday`

> Trigger holiday data sync from the upstream source (internal).

Fetches the latest trading holiday calendar and persists it to the database. Called by the scheduler service on a daily basis before market open.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_HOLIDAY`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `year` | `integer` |  | Year to sync holidays for. |
| `exchange` | `string` |  |  Enum: `HOSE`, `HNX`, `UPCOM` |

**Responses:**

| Code | Description |
|---|---|
| `200` | Holiday data synced |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/sync/interest-info`

> Trigger interest rate info sync from the upstream source (internal).

Fetches the latest interest rate schedule and persists it to the database. Called by the scheduler service when rate changes are published.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_INTEREST_INFO`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `fromDate` | `string (date)` |  |  |
| `toDate` | `string (date)` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Interest rate data synced |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/sync/locale`

> Sync public locale resources for the specified services (internal).

Regenerates and re-uploads the public locale files for the given service names. Called after a locale key or translation is created, updated, or deleted.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOCALE`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `msNames` | `array[string]` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Public locale resources synced |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/sync/locale/internal`

> Sync locale resources to the internal store for the specified services (internal).

Fetches the latest locale files for the given service names from the object store and caches them for internal consumers. Called after a locale upload completes.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOCALE_INTERNAL`

**Request Body** — `application/json` (Required):

| Field | Type | Required | Description |
|---|---|---|---|
| `msNames` | `array[string]` |  |  |

**Responses:**

| Code | Description |
|---|---|
| `200` | Internal locale resources synced |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/sync/locale/resource`

> Sync admin locale resources for all registered services (internal).

Regenerates the admin locale resource index and uploads updated files to the object store. Called after bulk locale changes are applied via the admin console.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SYNC_LOCALE_RESOURCE`

**Request Body** — `application/json` (Optional):

| Field | Type | Required | Description |
|---|---|---|---|
| `services` | `array[string]` |  | Optional: limit sync to specific service names. If omitted, all registered services are synced. |

**Responses:**

| Code | Description |
|---|---|
| `200` | Admin locale resources synced |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `POST /api/v1/admin/sync/locale/{namespaceId}/key`

> Sync locale keys for a specific namespace (internal).

Re-exports the locale keys for the given namespace and uploads the result to the object store. Called after keys are added or deleted from a namespace.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SYNC_LOCALE_KEY`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `namespaceId` | path | `integer` | ✓ | Namespace ID |

**Request Body** — `application/json` (Required):

_No body fields required. Target resource identified by path parameter._

**Responses:**

| Code | Description |
|---|---|
| `200` | Namespace locale keys synced |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Resource not found. |
  | Field | Type | Description |
  |---|---|---|
  | `success` | `boolean` |  |
  | `error` | `object` |  |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/system/client`

> Retrieve client configuration for system-level consumers.

Returns the full client list (including login methods and steps) for the given domain, optionally filtered to records updated since lastQueriedTime. Used internally by the gateway and identity service to bootstrap client config.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_CLIENT_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `domain` | query | `string` |  | Service domain filter |
| `lastQueriedTime` | query | `string` |  | ISO timestamp for incremental sync |

**Responses:**

| Code | Description |
|---|---|
| `200` | Client list returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/system/login-method`

> Retrieve login method configuration for system-level consumers.

Returns login method records for the given domain, optionally filtered to entries updated since lastQueriedTime. Used internally by the gateway to sync the available authentication flows on startup.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_LOGIN_METHOD_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `domain` | query | `string` |  | Service domain filter |
| `lastQueriedTime` | query | `string` |  | ISO timestamp for incremental sync |

**Responses:**

| Code | Description |
|---|---|
| `200` | Login method list returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/system/scope`

> Retrieve OAuth scope configuration for system-level consumers.

Returns scope records for the given domain, used internally by the gateway to enforce scope-based access control on every inbound request.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPE_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `domain` | query | `string` |  | Service domain filter |

**Responses:**

| Code | Description |
|---|---|
| `200` | Scope list returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/system/scope-group`

> Retrieve scope group configuration for system-level consumers.

Returns scope group records for the given domain. Used internally by the gateway to determine which scopes are bundled in each login method's access grant.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_SCOPE_GROUP_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `domain` | query | `string` |  | Service domain filter |

**Responses:**

| Code | Description |
|---|---|
| `200` | Scope group list returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
### `GET /api/v1/admin/template`

> Fetch all template resources for a service.

Returns template resource metadata (name, language, CDN URL) for the requested service names. Used by notification and email services to locate message templates.

**Auth:** 🔒 **JWT**  
**Operation ID:** `ADMIN_TEMPLATE_LIST`

**Parameters:**

| Name | In | Type | Required | Description |
|---|---|---|---|---|
| `msNames` | query | `array` |  | Service names to fetch templates for |

**Responses:**

| Code | Description |
|---|---|
| `200` | Template resources returned |
| `401` | Unauthorized |
| `403` | Forbidden |
| `429` | Too many requests |
| `500` | Internal server error |

---
