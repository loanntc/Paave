# Paave API Specification - Complete Endpoint Reference

**Version:** 1.5.0  
**Updated:** 2026-05-20 (aligned with api.json — authoritative OpenAPI 3.0.3 source)
**Total Endpoints:** ~449 operations across 388 path entries  
**Base URL:** `https://api.paave.io/api/v1`  
**Description:** Vietnamese stock trading social platform with virtual and live trading

> **v1.5.0 Breaking Changes Summary:**
> - Auth header changed to `Authorization: jwt <token>` (NOT `Bearer`)
> - News endpoints restructured: use `/news/articles` + `/news/articles/{articleId}` (cursor-paginated); old `/news`, `/news/{id}`, `/news/filter`, `/news/latest-by-symbols`, `/news/stock-news`, `/news/favorites` removed
> - Price alert cap: 50 active rules per user (previously 1 per stock)
> - Social endpoints expanded: 20 total (block/unblock, timeline, cashtag feed added)

## Table of Contents

- [Administration](#administration)
- [App](#app)
- [Authentication](#authentication)
- [Fundamentals](#fundamentals)
- [Insights](#insights)
- [Live Trading](#live-trading)
- [Market](#market)
- [NHSV Derivatives](#nhsv-derivatives)
- [NHSV Equity](#nhsv-equity)
- [News](#news)
- [Social](#social)
- [Users](#users)
- [Virtual Trading](#virtual-trading)

---

## API Overview

The Paave API is a comprehensive RESTful service providing:
- **Authentication & Authorization**: 23 endpoints for login, 2FA, biometric, CA certificates
- **User Management**: 35 endpoints for profiles, account linking, email/password management
- **Market Data**: 38 endpoints for real-time quotes, candles, indices, rankings, foreigner flows
- **Virtual Trading**: 87 endpoints for paper trading, contests, leaderboards
- **Live Trading**: 41 endpoints for real-money contests and analytics
- **NHSV Equity**: 72 endpoints for live equity trading orders, transfers, loans
- **NHSV Derivatives**: 39 endpoints for futures orders, positions, margins
- **Social Features**: 20 endpoints for posts, follows, blocks, cashtags, timeline, relationships
- **News & Fundamentals**: 12 endpoints for news, company data, financials
- **Insights & Personalization**: 21 endpoints for watchlists, notifications, search history
- **Admin & Configuration**: 58 endpoints for feature flags, locale, scopes

## Common Response Format

All successful API responses follow this structure:
```json
{
  "data": { /* response payload */ },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-03-30T12:00:00Z"
  }
}
```

## Authentication

### JWT Token
All authenticated endpoints require an Authorization header using the `jwt` scheme (NOT `Bearer`):
```
Authorization: jwt <accessToken>
```
> **Critical:** Using `Bearer` prefix instead of `jwt` returns HTTP 401. Despite the token response returning `tokenType: "Bearer"`, the request header must use the `jwt` prefix.

### Token Lifecycle
- **Access Token**: 3600 seconds (1 hour lifetime)
- **Refresh Token**: Long-lived, non-rotating
- **Refresh Endpoint**: POST /api/v1/auth/token/refresh

---

## Authentication

**Summary:** Login, OTP verification, token refresh/revoke, biometric auth, 2FA, and CA certificate login

### `GET /api/v1/auth/biometric/status`

**ID:** `AUTH_BIOMETRIC_STATUS`  
**Summary:** Check whether biometric authentication is registered for the user.  

Check whether biometric authentication is registered for the authenticated user on the current device. Returns registration status and the stored public key if registered.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `deviceId` (string) (optional): Device identifier

**Responses:**

- `200`: Biometric registration status
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/biometric/register`

**ID:** `AUTH_BIOMETRIC_REGISTER`  
**Summary:** Register a biometric credential for the authenticated user.  

Register a biometric credential for the authenticated user. Initiates OTP verification. Provide the device's RSA public key; it is stored and used to verify future biometric login signatures.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `password` (string, required): Current account password used to authorize registration.
- `publicKey` (string, required): Base64-encoded RSA public key to register.
- `deviceId` (string, required): Device identifier that owns the biometric key pair.

**Responses:**

- `200`: Biometric registration initiated — OTP sent
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/biometric/unregister`

**ID:** `AUTH_BIOMETRIC_UNREGISTER`  
**Summary:** Remove a registered biometric credential from the user's account.  

Remove a registered biometric credential from the authenticated user's account for the specified device. After unregistering, biometric login is disabled for that device.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `deviceId` (string, required): Device identifier whose biometric credential should be removed.

**Responses:**

- `200`: Biometric credential removed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/biometric/verify-otp`

**ID:** `AUTH_BIOMETRIC_VERIFY_OTP`  
**Summary:** Complete biometric registration by verifying the OTP.  

Complete biometric registration by verifying the OTP sent during the registration step. Returns 200 on success; biometric login is enabled for the device after this call.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `otpValue` (string, required): OTP code entered by the user.
- `otpId` (string, required): OTP identifier returned by biometric registration.
- `deviceId` (string, required): Device identifier that is being enabled for biometric login.

**Responses:**

- `200`: Biometric registered successfully
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests — rate limit exceeded
- `500`: Internal server error

### `POST /api/v1/auth/biometric/verify-password`

**ID:** `AUTH_BIOMETRIC_VERIFY_PASSWORD`  
**Summary:** Verify the user's password before allowing biometric login setup.  

Verify the user's password before allowing biometric login setup. This is a security gate step in the biometric registration flow. Returns 200 when password is valid.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `password` (string, required): Current account password used to authorize biometric setup.

**Responses:**

- `200`: Password verified
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/ca/register`

**ID:** `AUTH_CA_REGISTER`  
**Summary:** Register a CA certificate for the authenticated user.  

[NHSV] Register CA certificate data with the identity service. The certificate data must be Base64-encoded. Requires a valid Bearer token. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `data` (string, required): Base64-encoded CA certificate payload.

**Responses:**

- `200`: CA certificate registered
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/ca/unregister`

**ID:** `AUTH_CA_UNREGISTER`  
**Summary:** Unregister a previously registered CA certificate.  

[NHSV] Unregister the CA certificate for the authenticated user. After unregistering, CA-based authentication is disabled for the account. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: CA certificate unregistered
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/login`

**ID:** `AUTH_LOGIN`  
**Summary:** Unified login endpoint routing by grant_type.  

Unified login endpoint. Routes to the appropriate login flow based on the grant_type field (password, social_login, client_credentials, demo). Returns JWT access and refresh tokens.  

**Auth:** ✗ Not required  

**Request Body:**

- `grant_type` (string, required): Login grant type: password, social_login, client_credentials, or demo.
- `username` (string, optional): Required when grant_type=password.
- `password` (string, optional): Required when grant_type=password.
- `socialToken` (string, optional): Required when grant_type=social_login.
- `socialType` (string, optional): Required when grant_type=social_login.
- `client_id` (string, optional): Required when grant_type=client_credentials or demo.
- `client_secret` (string, optional): Required when grant_type=client_credentials or demo.
- `device_id` (string, optional): Client device identifier for password or social login.
- `platform` (string, optional): Client platform for demo login.
- `appVersion` (string, optional): App version for demo login.

**Responses:**

- `200`: Login successful — returns access and refresh tokens
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/login/2fa`

**ID:** `AUTH_LOGIN_2FA`  
**Summary:** Initiate two-factor authentication login.  

Initiate two-factor authentication. Submit username and password; if 2FA is enabled an OTP is sent and a partial token is returned to complete login at the verify-otp step.  

**Auth:** ✗ Not required  

**Request Body:**

- `username` (string, required): Username or email used to authenticate.
- `password` (string, required): Account password.
- `device_id` (string, optional): Client device identifier.

**Responses:**

- `200`: OTP sent — returns intermediate 2FA token
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/login/2fa/verify-otp`

**ID:** `AUTH_2FA_VERIFY_OTP`  
**Summary:** Complete two-factor authentication by verifying the OTP.  

Complete two-factor authentication by verifying the OTP sent during the 2FA initiation step. Requires the partial token from the initiation response. Returns full JWT tokens.  

**Auth:** ✗ Not required  

**Request Body:**

- `otp_id` (string, required): OTP identifier returned by the 2FA login step.
- `otp_value` (string, required): OTP value entered by the user.
- `partial_token` (string, required): Partial token returned by the 2FA login step.
- `mobile_otp` (string, optional): Mobile OTP override when supported by the client flow.
- `macAddress` (string, optional): Client MAC address for device fingerprinting.
- `platform` (string, optional): Client platform such as ios or android.
- `osVersion` (string, optional): Client OS version.
- `appVersion` (string, optional): Client app version.
- `sourceIp` (string, optional): Source IP captured by the client.

**Responses:**

- `200`: Authentication completed — returns full JWT tokens
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `429`: Too many requests — rate limit exceeded
- `500`: Internal server error

### `POST /api/v1/auth/login/biometric`

**ID:** `AUTH_LOGIN_BIOMETRIC`  
**Summary:** Authenticate using a registered biometric credential.  

Authenticate using a registered biometric credential (fingerprint or face ID). Requires prior biometric registration and a valid RSA signature over the current timestamp.  

**Auth:** ✗ Not required  

**Request Body:**

- `username` (string, required): Username or email bound to the biometric credential.
- `signature` (string, required): Base64 RSA signature over the login payload.
- `deviceId` (string, required): Device identifier bound to the credential.
- `timestamp` (integer, required): Epoch-millisecond timestamp used to prevent replay.
- `platform` (string, optional): Client platform such as ios or android.
- `osVersion` (string, optional): Client OS version.
- `appVersion` (string, optional): Client app version.
- `sourceIp` (string, optional): Source IP captured by the client.

**Responses:**

- `200`: Authentication successful — returns access and refresh tokens
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/login/ca`

**ID:** `AUTH_LOGIN_CA`  
**Summary:** Authenticate using a CA certificate credential.  

[NHSV] Login using a CA (certificate authority) credential. The certificate must be pre-registered via NHSV. Returns JWT tokens on success.  

**Auth:** ✗ Not required  

**Request Body:**

- `grant_type` (string, required): Must be ca.
- `client_id` (string, required): OAuth client identifier.
- `client_secret` (string, required): OAuth client secret.
- `data` (string, required): Base64-encoded CA credential payload.

**Responses:**

- `200`: Authentication successful — returns access and refresh tokens
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — invalid credentials or expired token
- `403`: Forbidden — account disabled or insufficient scope
- `429`: Too many requests — rate limit exceeded
- `500`: Internal server error

### `POST /api/v1/auth/login/link-accounts`

**ID:** `AUTH_LINK_ACCOUNT_LOGIN`  
**Summary:** Authenticate using a partner-linked account.  

Authenticate using a partner-linked account. Used to switch between linked user accounts (e.g., from a Paave account to a linked NHSV broker account). Returns JWT tokens.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `partnerId` (string, required): Partner identifier to switch into.

**Responses:**

- `200`: Authentication successful — returns tokens scoped to the linked account
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/login/organization`

**ID:** `AUTH_LOGIN_ORGANIZATION`  
**Summary:** Authenticate on behalf of an organization.  

Authenticate on behalf of an organization. Returns organization-scoped JWT tokens. Requires a valid organization ID and either a user password or org login token.  

**Auth:** ✗ Not required  

**Request Body:**

- `organizationId` (string, required): Target organization identifier.
- `registeredUsername` (string, optional): Required when authenticating with username and password.
- `password` (string, optional): Required when authenticating with username and password.
- `orgLoginToken` (string, optional): Alternative one-time organization login token.

**Responses:**

- `200`: Authentication successful — returns organization-scoped tokens
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/login/password`

**ID:** `AUTH_LOGIN_PASSWORD`  
**Summary:** Authenticate with username/email and password.  

Authenticate with username/email and password. Returns JWT access and refresh tokens. Requires a valid registered account with a password set.  

**Auth:** ✗ Not required  

**Request Body:**

- `username` (string, required): Username or email used to authenticate.
- `password` (string, required): Account password.
- `device_id` (string, optional): Client device identifier.

**Responses:**

- `200`: Authentication successful — returns access and refresh tokens
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/login/social`

**ID:** `AUTH_LOGIN_SOCIAL`  
**Summary:** Authenticate using a social provider token.  

Authenticate using a social provider (GOOGLE, FACEBOOK, APPLE). Creates a new account if one does not already exist for the social identity. Returns JWT tokens.  

**Auth:** ✗ Not required  

**Request Body:**

- `socialToken` (string, required): Provider-issued social access token or ID token.
- `socialType` (string, required): Social provider identifier such as GOOGLE, FACEBOOK, or APPLE.
- `device_id` (string, optional): Client device identifier.

**Responses:**

- `200`: Authentication successful — returns access and refresh tokens
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/login/social/organization`

**ID:** `AUTH_LOGIN_SOCIAL_ORGANIZATION`  
**Summary:** Authenticate with a social provider in an organization context.  

Authenticate with a social provider in an organization context. Creates or retrieves an org-scoped account linked to the social identity. Returns organization-scoped JWT tokens.  

**Auth:** ✗ Not required  

**Request Body:**

- `socialToken` (string, required): Provider-issued social access token or ID token.
- `socialType` (string, required): Social provider identifier such as GOOGLE, FACEBOOK, or APPLE.
- `organization` (string, required): Organization identifier to authenticate within.
- `device_id` (string, optional): Client device identifier.

**Responses:**

- `200`: Authentication successful — returns organization-scoped tokens
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/otp`

**ID:** `OTP_SEND`  
**Summary:** Send OTP to user's registered phone or email for verification.  

Send a one-time password (OTP) to the user's registered email or phone number for verification. Returns 200 on success. Returns 429 if the user exceeds the rate limit.  

**Auth:** ✗ Not required  

**Request Body:**

- `id` (string, required): Phone number or email address to receive the OTP.
- `idType` (string, required): Identifier type such as PHONE or EMAIL.
- `txType` (string, required): OTP transaction type such as REGISTER, RESET_PASSWORD, or UPDATE_PROFILE.

**Responses:**

- `200`: OTP sent successfully
- `400`: Bad request — invalid or missing parameters
- `429`: Too many requests — rate limit exceeded
- `500`: Internal server error

### `POST /api/v1/auth/otp/verify`

**ID:** `OTP_VERIFY`  
**Summary:** Verify a previously sent OTP code.  

Verify a previously sent OTP. Returns a temporary token or confirmation on success. The OTP expires after a short time-limited window.  

**Auth:** ✗ Not required  

**Request Body:**

- `otpId` (string, required): OTP identifier returned by the send-OTP step.
- `otpValue` (string, required): OTP code entered by the user.

**Responses:**

- `200`: OTP verified
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `429`: Too many requests — rate limit exceeded
- `500`: Internal server error

### `POST /api/v1/auth/password/reset`

**ID:** `AUTH_RESET_PASSWORD`  
**Summary:** Initiate a password reset via email.  

Initiate a password reset. Sends a reset link to the user's registered email. Requires a valid OTP to complete the reset. Returns 200 on success.  

**Auth:** ✗ Not required  

**Request Body:**

- `username` (string, required): Username or email of the account being reset.
- `newPassword` (string, required): New password to set after OTP verification.
- `otpKey` (string, required): Verified OTP key for the reset-password flow.

**Responses:**

- `200`: Password reset email sent
- `400`: Bad request — invalid or missing parameters
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/token/refresh`

**ID:** `AUTH_TOKEN_REFRESH`  
**Summary:** Exchange a refresh token for a new access token.  

Exchange a valid refresh token for a new access token. The refresh token is not rotated. Returns new JWT access token on success.  

**Auth:** ✗ Not required  

**Request Body:**

- `grant_type` (string, required): Must be refresh_token.
- `client_id` (string, required): OAuth client identifier.
- `client_secret` (string, required): OAuth client secret.
- `refresh_token` (string, required): Refresh token to exchange for a new access token.

**Responses:**

- `200`: New access token issued
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/auth/token/revoke`

**ID:** `AUTH_TOKEN_REVOKE`  
**Summary:** Revoke a refresh token to invalidate the session.  

Revoke a refresh token, invalidating the current session. After revocation, the token cannot be used to obtain new access tokens.  

**Auth:** ✗ Not required  

**Request Body:**

- `refresh_token` (string, required): Refresh token to revoke.
- `refresh_token_id` (string, optional): Numeric token ID when revoking by ID with ownership proof.

**Responses:**

- `200`: Token revoked
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/auth/ca/update`

**ID:** `AUTH_CA_UPDATE`  
**Summary:** Update a registered CA certificate.  

[NHSV] Update registered CA certificate data. Replaces the existing certificate with new Base64-encoded data. Requires a valid Bearer token. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `data` (string, required): Base64-encoded CA certificate payload.

**Responses:**

- `200`: CA certificate updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

---

## Users

**Summary:** User registration, profile management, account linking, and organization endpoints

### `DELETE /api/v1/users/me/link-accounts/partner/{partnerId}`

**ID:** `USER_LINK_ACCOUNT_DELETE_BY_PARTNER`  
**Summary:** Unlink a partner account by partner ID.  

Remove a linked partner account identified by its partner ID. Delegates to the same unlink logic as the canonical {accountId} route.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `partnerId` (string) (required): Partner identifier of the linked account to remove

**Responses:**

- `204`: Partner account unlinked
- `400`: Bad request — missing partner ID
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/users/me/link-accounts/social/{socialType}`

**ID:** `USER_SOCIAL_UNLINK_ACCOUNT`  
**Summary:** Unlink a previously linked social provider account.  

Unlink a previously linked social provider account (GOOGLE, FACEBOOK, APPLE) from the authenticated user. Returns 204 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `socialType` (string) (required): Social provider type to unlink (GOOGLE, FACEBOOK, APPLE)

**Responses:**

- `204`: Social account unlinked
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/users/me/link-accounts/{accountId}`

**ID:** `USER_LINK_ACCOUNT_DELETE`  
**Summary:** Delete a linked partner account by account ID.  

Delete a linked partner account. Removes the link between the authenticated user and the specified partner account. Returns 204 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountId` (integer) (required): ID of the linked account to remove

**Responses:**

- `204`: Linked account removed
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/users`

**ID:** `USER_SEARCH`  
**Summary:** Search for users by username or criteria.  

Search for users by username or other criteria with pagination. When a username query parameter is provided, performs an exact lookup; otherwise performs a paginated search filtered by name and other criteria.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `username` (string) (optional): Exact username lookup (use alone for exact match)
- `name` (string) (optional): Name search term for paginated search
- `pageNumber` (integer) (optional): Zero-based page number (paginated search)
- `pageSize` (integer) (optional): Page size 1–100 (paginated search, default 20)

**Responses:**

- `200`: Paginated user search results
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/users/me`

**ID:** `USER_ACCOUNT_INFO`  
**Summary:** Retrieve the authenticated user's full account profile.  

Retrieve the authenticated user's full account profile including personal info, linked accounts, and account status. Requires a valid Bearer token.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: User account information
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/users/me/deletion/{key}`

**ID:** `USER_DELETION`  
**Summary:** Complete account deletion using the confirmation key.  

Complete account deletion using the confirmation key from the deletion email. The account and all associated data are permanently removed.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `key` (string) (required): Deletion confirmation key from email

**Responses:**

- `200`: Account deleted
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/users/me/link-accounts`

**ID:** `USER_LINK_ACCOUNT_LIST`  
**Summary:** List all partner accounts linked to the authenticated user.  

List all partner accounts linked to the authenticated user. Returns an array of linked account records, each containing partner ID, linked username, and link status.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: List of linked accounts
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/users/me/partner-users`

**ID:** `USER_LINK_ACCOUNT_FIND_BY_PARTNER`  
**Summary:** Find users associated with linked partner accounts.  

Find users associated with linked partner accounts for the authenticated user. Looks up Paave user records by partner name and account number.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `partnerName` (string) (optional): Partner service identifier (e.g., nhsv)
- `accountNumber` (string) (optional): Partner account number to look up

**Responses:**

- `200`: List of partner-linked users
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/users/me/password/availability`

**ID:** `USER_CHECK_AVAILABLE_PASSWORD`  
**Summary:** Check whether the authenticated user has a password set.  

Check whether the authenticated user has a password set on their account. Returns true if a password is available (i.e., not a social-only account), false otherwise.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Password availability status
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/users/organizations`

**ID:** `ORGANIZATION_LIST`  
**Summary:** List all organizations available for the authenticated user.  

List all organizations available for the authenticated user. Optionally filter by a list of organization IDs. Returns an array of organization records.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationIds` (array) (optional): Organization IDs to filter by.

**Responses:**

- `200`: List of organizations
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/users/partners`

**ID:** `USER_PARTNERS`  
**Summary:** List all available partner integrations for account linking.  

List all available partner integrations that the user can link accounts with. Returns a list of partner descriptors including partner ID and display name.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: List of available partners
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users`

**ID:** `USER_CREATE`  
**Summary:** Register a new Paave user account.  

Register a new Paave user account. Accepts either a full registration payload or an auto-signup grant (grant_type=auto_signup) for device-based account creation. Returns JWT tokens on success.  

**Auth:** ✗ Not required  

**Request Body:**

- `registeredUsername` (string, required): Username or email to register for login.
- `email` (string, required): Email address used for verification and notifications.
- `password` (string, required): Initial account password.
- `fullname` (string, required): Display name for the new account.
- `otpKey` (string, required): Verified OTP key for the registration flow.
- `deviceId` (string, optional): Client device identifier when available.

**Responses:**

- `201`: User account created
- `400`: Bad request — invalid or missing parameters
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/availability-checks`

**ID:** `USER_CHECK_EXIST`  
**Summary:** Check whether a username or email is available for registration.  

Check whether a username or email is available for registration. Returns 200 with available=true if the value is not taken.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `type` (string, required): Availability check type: EMAIL or USERNAME.
- `value` (string, required): Candidate email address or username to validate.

**Responses:**

- `200`: Availability result
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/confirmation`

**ID:** `USER_CONFIRM`  
**Summary:** Confirm the authenticated user's account after email verification.  

Confirm the authenticated user's account (e.g., after email verification). Requires the account password for identity confirmation. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `password` (string, required): Current account password used for confirmation.

**Responses:**

- `200`: Account confirmed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/deletion`

**ID:** `USER_DELETION_INIT`  
**Summary:** Initiate account deletion with email confirmation.  

Initiate account deletion. Sends a confirmation link to the user's registered email. The deletion is not completed until the confirmation link is visited.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `email` (string, required): Registered email address that receives the deletion confirmation.

**Responses:**

- `200`: Deletion initiated — confirmation email sent
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/deletion/{key}/notifications`

**ID:** `USER_DELETION_RESEND`  
**Summary:** Resend the account deletion confirmation email.  

Resend the account deletion confirmation email when the original was not received. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `key` (string) (required): Deletion key to resend confirmation for

**Responses:**

- `200`: Confirmation email resent
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/feedbacks`

**ID:** `USER_FEEDBACK_SUBMIT`  
**Summary:** Submit user feedback or a support request.  

Submit user feedback or a support request. Accepts a free-text message, an optional star rating, and device/app metadata for triage. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `deviceId` (string, required): Client device identifier for support triage.
- `appVersion` (string, required): App version that produced the feedback.
- `message` (string, optional): Free-text feedback or support message.
- `rating` (integer, optional): Optional star rating from the user.

**Responses:**

- `200`: Feedback submitted
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/link-accounts`

**ID:** `USER_LINK_ACCOUNT_CREATE`  
**Summary:** Create a new account link with a partner using a linking token.  

Create a new account link with a partner using the session ID and OTP from the linking initiation flow. Returns 201 on success. Returns 409 if the account is already linked.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `sessionId` (string, required): Link-account session identifier from the init step.
- `otp` (string, required): OTP value used to confirm the link.

**Responses:**

- `201`: Account link created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `409`: Conflict — account already linked
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/link-accounts/approval`

**ID:** `USER_LINK_ACCOUNT_APPROVE`  
**Summary:** Approve an incoming account link request from a partner.  

Partner-side counterpart to post:/api/v1/users/me/link-accounts/confirmation. The partner approves the link request initiated by the Paave user. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `sessionId` (string, required): Link-account session identifier to approve.
- `partnerPassword` (string, required): Partner account password used for approval.

**Responses:**

- `200`: Link request approved
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/link-accounts/confirmation`

**ID:** `USER_LINK_ACCOUNT_CONFIRM`  
**Summary:** Confirm an account link request.  

Confirm an account link request. Finalises the linking flow initiated by the partner. Provide the session ID and partner password to confirm. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `sessionId` (string, required): Link-account session identifier to confirm.
- `partnerPassword` (string, required): Partner account password used for confirmation.

**Responses:**

- `200`: Link confirmed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/link-accounts/init`

**ID:** `USER_LINK_ACCOUNT_INIT`  
**Summary:** Initiate the account linking workflow with a partner.  

Initiate the account linking workflow with a partner. Returns a session ID and sends an OTP to the partner account's registered phone or email.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `partnerId` (string, required): Partner identifier such as nhsv.
- `username` (string, required): Partner account username or account code.
- `password` (string, required): Partner account password for link verification.

**Responses:**

- `200`: Linking initiated — returns linking token
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/link-accounts/social`

**ID:** `USER_SOCIAL_LINK_ACCOUNT`  
**Summary:** Link a social provider account to the authenticated user.  

Link a social provider account (GOOGLE, FACEBOOK, APPLE) to the authenticated user. An OTP security code may be required. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `socialType` (string, required): Social provider identifier such as GOOGLE, FACEBOOK, or APPLE.
- `socialToken` (string, required): Provider-issued social access token or ID token.
- `secCode` (string, optional): OTP or secondary security code when required by policy.

**Responses:**

- `200`: Social account linked
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/link-accounts/username`

**ID:** `USER_LINK_ACCOUNT_CHANGE_USERNAME`  
**Summary:** Update the username for a linked partner account.  

Update the username used for a linked partner account. Useful when the partner-side username changes and needs to be re-synced in Paave. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `partnerId` (string, required): Partner identifier whose linked username should change.
- `newUsername` (string, required): New partner-side username or account code.

**Responses:**

- `200`: Username updated for linked account
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/partner-otp-notifications`

**ID:** `USER_LINK_ACCOUNT_NOTIFY_OTP_PARTNER`  
**Summary:** Send an OTP notification to a linked partner for cross-account authentication.  

Send an OTP notification to a linked partner for cross-account authentication. Used when a partner service needs an OTP forwarded from the Paave user context.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `sessionId` (string, required): Link-account session identifier awaiting OTP verification.
- `otp` (string, required): OTP value to forward to the partner.

**Responses:**

- `200`: OTP notification sent
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/partner-otp-notifications/inbound`

**ID:** `USER_LINK_ACCOUNT_NOTIFY_OTP_FROM_PARTNER`  
**Summary:** Receive an OTP notification from a partner for inbound cross-account authentication.  

Inbound counterpart to post:/api/v1/users/me/partner-otp-notifications. Receives an OTP forwarded from a partner for cross-account authentication. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `sessionId` (string, required): Link-account session identifier awaiting OTP verification.
- `otp` (string, required): OTP value received from the partner.

**Responses:**

- `200`: Inbound OTP processed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/password`

**ID:** `USER_CHANGE_PASSWORD`  
**Summary:** Change the authenticated user's password.  

Change the authenticated user's password. Requires the current password for verification. The new password must meet minimum complexity requirements.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `oldPassword` (string, required): Current account password.
- `newPassword` (string, required): New password to set.

**Responses:**

- `200`: Password changed successfully
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/password/initial`

**ID:** `USER_CREATE_PASSWORD`  
**Summary:** Set an initial password for an account created without one.  

Set an initial password for an account that was created without one (e.g., via social login). This endpoint is only available when no password is currently set.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `password` (string, required): Initial password to set on the account.

**Responses:**

- `200`: Password created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/me/password/social`

**ID:** `USER_CREATE_PASSWORD_SOCIAL`  
**Summary:** Create a password for an account registered via social login.  

Create a password for an account originally registered via social login (Google, Facebook, Apple). Once set, the user can also log in with username/password.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `password` (string, required): Password to add to the social-login account.

**Responses:**

- `201`: Password created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/users/organizations/users`

**ID:** `ORGANIZATION_USER_LIST`  
**Summary:** List users within an organization.  

List users within an organization with optional date-range and pagination filters. Returns a paginated list of user records belonging to the specified organization.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `organizationId` (string, required): Organization identifier to list users for.
- `pageNum` (integer, optional): One-based page number.
- `pageSize` (integer, optional): Page size for pagination.
- `createdFrom` (string, optional): Inclusive start date filter in YYYY-MM-DD format.
- `createdTo` (string, optional): Inclusive end date filter in YYYY-MM-DD format.

**Responses:**

- `200`: Paginated list of organization users
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/users/me/bio`

**ID:** `USER_UPDATE_BIO`  
**Summary:** Update the authenticated user's biography.  

Update the authenticated user's biography/description displayed on their public profile. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `bio` (string, required): Biography text shown on the user's profile.

**Responses:**

- `200`: Bio updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/users/me/email`

**ID:** `USER_UPDATE_EMAIL`  
**Summary:** Update the authenticated user's email address.  

Update the authenticated user's email address. Sends a verification email to the new address. An OTP is required to confirm the change.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `email` (string, required): New email address to verify and use on the account.
- `otpKey` (string, required): Verified OTP key for the email-change flow.

**Responses:**

- `200`: Email update initiated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/users/me/full-name`

**ID:** `USER_UPDATE_FULLNAME`  
**Summary:** Update the authenticated user's full name.  

Update the authenticated user's full name. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `fullname` (string, required): New full name to display on the profile.

**Responses:**

- `200`: Full name updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/users/me/link-accounts/leaderboard/settings`

**ID:** `USER_LINK_ACCOUNT_LEADERBOARD_SETTINGS_UPDATE`  
**Summary:** Update leaderboard visibility settings for a linked account.  

Update leaderboard visibility settings for a linked account. Controls whether the linked partner account participates in the public leaderboard. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `partnerId` (string, required): Partner identifier whose leaderboard settings are updated.
- `optBoard` (boolean, required): Whether the linked account appears on the leaderboard.
- `subAccount` (string, optional): Sub-account identifier when the partner has multiple trading accounts.

**Responses:**

- `200`: Leaderboard settings updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/users/me/status`

**ID:** `USER_DISABLE`  
**Summary:** Disable or suspend the authenticated user's account.  

Disable or suspend the authenticated user's account. Requires an admin-level token or self-service reason. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `reason` (string, required): Reason for disabling or suspending the account.

**Responses:**

- `200`: Account status updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/users/me/username`

**ID:** `USER_UPDATE_USERNAME`  
**Summary:** Update the authenticated user's username.  

Update the authenticated user's username. An OTP may be required to confirm the change. Returns 200 on success.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `username` (string, required): New username to assign to the authenticated account.
- `otpKey` (string, optional): OTP key when profile updates require verification.

**Responses:**

- `200`: Username updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

---

## News

**Summary:** Market news articles and system notices (v1.5.0 — 4 endpoints)

> **v1.5.0 breaking changes:** `/api/v1/news` (page-based) and `/api/v1/news/{newsId}` are replaced by `/api/v1/news/articles` (keyset/cursor pagination) and `/api/v1/news/articles/{articleId}`. News favorites endpoints (`GET/POST/DELETE /api/v1/news/favorites`) and helper endpoints (`/news/filter`, `/news/latest-by-symbols`, `/news/stock-news`) have been removed. Use `symbol` and `category` query params on `/api/v1/news/articles` for filtering.

### `GET /api/v1/news/articles`

**ID:** `NEWS_ARTICLES`  
**Summary:** List news articles with cursor-based pagination.  

Get a paginated list of news articles using keyset/cursor pagination. Supports language, symbol, and category filters. Response includes `nextCursor` at root for fetching the next page; pass `cursor` from previous response to paginate forward. When `isFallback` is true, the article was served in the fallback language (not the requested one) and `translatedFields` lists which fields were auto-translated.

**Auth:** ✓ Required (jwt JWT)  

**Parameters:**

- `language` (string) (optional): Language filter (e.g., `vi`, `en`)
- `cursor` (string) (optional): Pagination cursor from previous response (`nextCursor`)
- `size` (integer) (optional): Page size (default 20)
- `symbol` (string) (optional): Stock code filter (e.g., `VNM`)
- `category` (string) (optional): Article category filter

**Response (200):**
```json
{
  "data": [
    {
      "articleId": "string",
      "source": "string",
      "title": "string",
      "servedLanguage": "vi",
      "isFallback": false,
      "translatedFields": [],
      "publishedAt": "2026-05-20T08:00:00Z",
      "symbols": ["VNM"],
      "categories": ["market"],
      "fetchedAt": "2026-05-20T08:01:00Z"
    }
  ],
  "nextCursor": "string | null",
  "meta": { "requestId": "req_abc123" }
}
```

**Responses:**

- `200`: News articles with cursor
- `400`: Bad request — invalid parameters
- `401`: Unauthorized — missing or invalid jwt token
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/news/articles/{articleId}`

**ID:** `NEWS_ARTICLE_BY_ID`  
**Summary:** Get a single news article by ID.

**Auth:** ✓ Required (jwt JWT)  

**Parameters:**

- `articleId` (string, path, required): Article ID
- `language` (string) (optional): Preferred language for served content

**Responses:**

- `200`: News article
- `401`: Unauthorized
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/news/announcement`

**ID:** `NEWS_ANNOUNCEMENT`  
**Summary:** Get paginated exchange and regulatory announcements.  

Returns official exchange and regulatory announcements sourced from the NHSV notice feed. Backed by the same news.notice table as /api/v1/news/notices. Results are ordered by publish date descending with 60-second Redis cache.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fromDate` (string) (optional): Start date filter (YYYY-MM-DD or ISO 8601)
- `toDate` (string) (optional): End date filter (YYYY-MM-DD or ISO 8601)
- `page` (integer) (optional): Zero-based page index (default 0)
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Paginated announcements
- `400`: Bad request — invalid parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — upstream error
- `504`: Gateway Timeout — upstream timeout

### `GET /api/v1/news/notices`

**ID:** `NEWS_NOTICES`  
**Summary:** Get paginated regulatory notices and announcements.  

Get paginated regulatory notices and announcements.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fromDate` (string) (optional): Start date filter (YYYY-MM-DD)
- `toDate` (string) (optional): End date filter (YYYY-MM-DD)
- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Paginated notices
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

---

## Fundamentals

**Summary:** Company fundamentals — financial profile, statements, shareholders, and insider transactions

### `GET /api/v1/fundamentals/business-info`

**ID:** `FUNDAMENTALS_BUSINESS_INFO`  
**Summary:** Get annual business info records for a listed stock symbol.  

Returns business info records sourced from NHSV /api/v1/businessInfo/year for the given symbol. Each record contains key financial metrics (P&L, balance sheet, cash flow, valuation ratios) normalized across all company types: BANK, COMPANY, INSURANCE, SECURITIES. When `year` is provided, returns only the record for that year; otherwise returns all available years ordered newest-first.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code (e.g., VNM)
- `year` (integer) (optional): Fiscal year (e.g., 2025). Omit to retrieve all years.

**Responses:**

- `200`: Business info records for the symbol
- `400`: Bad request — missing or invalid symbol parameter
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/fundamentals/financial-ratio/ranking`

**ID:** `FUNDAMENTALS_FINANCIAL_RATIO_RANKING`  
**Summary:** Get top stocks ranked by financial ratio  

Returns a paginated list of Vietnamese-listed stocks ranked by a chosen financial ratio (e.g. P/E, ROE, EPS). Results are sorted descending by default (highest ratio first). Supports filtering by market exchange and changing sort direction. Use `pageNumber` and `pageSize` for pagination.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `market` (string) (optional): Market exchange filter: HOSE | HNX | UPCOM
- `financialRatio` (string) (optional): Financial ratio type (e.g. PE, ROE, EPS)
- `sortAsc` (boolean) (optional): Sort ascending (default false = descending)
- `pageNumber` (integer) (optional): Page number (1-based)
- `pageSize` (integer) (optional): Page size

**Responses:**

- `200`: Top stocks by financial ratio returned successfully
- `400`: Bad request — invalid parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/fundamentals/financials`

**ID:** `FUNDAMENTALS_FINANCIALS`  
**Summary:** Get consolidated financial data for a stock symbol.  

Get consolidated financial data for a stock symbol including income statements, balance sheets, cash flows, and key ratios.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code

**Responses:**

- `200`: Consolidated financial data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/fundamentals/insiders`

**ID:** `FUNDAMENTALS_INSIDERS`  
**Summary:** Get insider transaction history for a stock symbol with pagination.  

Returns paginated insider trading transactions for the given symbol, including details on the insider's role (e.g. board member, executive) and buy/sell quantities with pre- and post-transaction holding ratios.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code
- `page` (integer) (optional): One-based page index (default 1)
- `size` (integer) (optional): Page size (max 100, default 20)

**Responses:**

- `200`: Insider transactions
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/fundamentals/profile`

**ID:** `FUNDAMENTALS_PROFILE`  
**Summary:** Get company profile for a listed stock symbol.  

Get the company profile for a stock symbol including name, exchange, sector, industry, website, and employee count.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code (e.g., HPG)

**Responses:**

- `200`: Company profile
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/fundamentals/shareholders`

**ID:** `FUNDAMENTALS_SHAREHOLDERS`  
**Summary:** Get the latest major shareholder snapshot for a stock symbol.  

Returns the most recent shareholder holdings snapshot for the given symbol, including both major and minor shareholder breakdowns with their ownership ratios.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code

**Responses:**

- `200`: Major shareholders snapshot
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/fundamentals/statements`

**ID:** `FUNDAMENTALS_STATEMENTS`  
**Summary:** Get financial statements for a stock symbol.  

Get financial statements for a stock symbol, optionally filtered by statement type.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code
- `type` (string) (optional): Statement type: INCOME_STATEMENT | BALANCE_SHEET | CASH_FLOW
- `page` (integer) (optional): One-based page index (default 1)
- `size` (integer) (optional): Page size (max 100, default 4)

**Responses:**

- `200`: Financial statements
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/fundamentals/stock-sector/company-overview`

**ID:** `FUNDAMENTALS_STOCK_SECTOR_COMPANY_OVERVIEW`  
**Summary:** Get company overview information for a stock symbol.  

Get company overview information (sector, industry, description) for a stock symbol.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code (e.g., VNM)

**Responses:**

- `200`: Company overview
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

---

## Market

**Summary:** Real-time and historical market data for stocks, indices, ETF, put-through, rankings, and foreigner flows

### `GET /api/v1/market/candles`

**ID:** `MARKET_CANDLES`  
**Summary:** Get OHLCV candle data for a symbol.  

Get OHLCV candle data for a symbol. Currently supports 1-day ('1d') timeframe only.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code (required)
- `timeframe` (string) (required): Candle timeframe: 1d (daily) (required)
- `fromDate` (string) (optional): Start date (YYYY-MM-DD)
- `toDate` (string) (optional): End date (YYYY-MM-DD)
- `limit` (integer) (optional): Maximum number of candles to return

**Responses:**

- `200`: OHLCV candle bars
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/current-dividend-event`

**ID:** `MARKET_CURRENT_DIVIDEND_EVENT`  
**Summary:** Get the current active dividend event schedule.  

Get the current active dividend event schedule.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Current dividend events
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/daily-returns`

**ID:** `MARKET_DAILY_RETURNS`  
**Summary:** Get daily return data for symbols over a date range.  

Get daily return data for symbols over a date range.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbolList` (string) (required): Comma-separated list of stock codes (required)
- `numberOfDays` (integer) (optional): Number of trading days of history to return

**Responses:**

- `200`: Daily return data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/etf/{symbolCode}/index/daily`

**ID:** `MARKET_ETF_INDEX_DAILY`  
**Summary:** Get daily tracking index data for an ETF.  

Get daily tracking index data for an ETF.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbolCode` (string) (required): ETF stock code
- `baseDate` (string) (optional): Base date anchor (YYYY-MM-DD)
- `fetchCount` (integer) (optional): Maximum number of records

**Responses:**

- `200`: ETF daily index data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/etf/{symbolCode}/nav/daily`

**ID:** `MARKET_ETF_NAV_DAILY`  
**Summary:** Get daily NAV (Net Asset Value) history for an ETF.  

Get daily NAV (Net Asset Value) history for an ETF.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbolCode` (string) (required): ETF stock code
- `baseDate` (string) (optional): Base date anchor (YYYY-MM-DD)
- `fetchCount` (integer) (optional): Maximum number of records

**Responses:**

- `200`: ETF daily NAV data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/index-stock-list/{indexCode}`

**ID:** `MARKET_INDEX_STOCK_LIST`  
**Summary:** Get the list of constituent stocks in a market index.  

Get the list of constituent stocks in a market index.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `indexCode` (string) (required): Index code (e.g., VNINDEX, HNX30, VN30)

**Responses:**

- `200`: Index constituent stocks
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/index/list`

**ID:** `MARKET_INDEX_LIST`  
**Summary:** Get the list of all available market indices.  

Get the list of all available market indices.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `market` (string) (optional): Market filter: HOSE | HNX | UPCOM

**Responses:**

- `200`: Market index list
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/last-trading-date`

**ID:** `MARKET_LAST_TRADING_DATE`  
**Summary:** Get the last trading date for each exchange.  

Get the last trading date for each exchange.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Last trading date per exchange
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/liquidity`

**ID:** `MARKET_LIQUIDITY`  
**Summary:** Get market liquidity chart data (total value traded over time).  

Get market liquidity chart data (total value traded over time).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `market` (string) (required): Market exchange: HOSE | HNX | UPCOM (required)
- `dateList` (string) (optional): Comma-separated date list (YYYY-MM-DD)

**Responses:**

- `200`: Market liquidity data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/price-board`

**ID:** `MARKET_PRICE_BOARD`  
**Summary:** Get the full price board snapshot for a given market or symbol list.  

Get the full price board snapshot for a given market or symbol list.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `category` (string) (required): Price board category (e.g., HOSE, HNX, UPCOM, or index code)
- `symbolList` (string) (required): Comma-separated list of stock codes

**Responses:**

- `200`: Price board snapshot
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/putthrough/advertise`

**ID:** `MARKET_PUTTHROUGH_ADVERTISE`  
**Summary:** Get current put-through advertised order list.  

Get current put-through (thỏa thuận) advertised order list for a given exchange. When `marketType` is ALL or omitted, advertisements from HOSE, HNX, and UPCOM are merged. Reads from pre-computed D2 Redis keys with fallback to legacy key.

Response item fields (abbreviated market data format): `s` stock code, `t` timestamp (yyyyMMddHHmmss), `sb` side (B=buy, S=sell), `p` advertised price, `v` advertised volume (shares).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `marketType` (string) (optional): Exchange: ALL | HOSE | HNX | UPCOM (default ALL)
- `market` (string) (optional): Alias for marketType, accepted for compatibility
- `sellBuyType` (string) (optional): Side filter: B (buy) | S (sell)
- `offset` (integer) (optional): Result offset for pagination
- `fetchCount` (integer) (optional): Maximum results to return

**Responses:**

- `200`: Put-through advertised orders
- `400`: Bad request — invalid parameter value
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/putthrough/deal`

**ID:** `MARKET_PUTTHROUGH_DEAL`  
**Summary:** Get completed put-through deal history.  

Get completed put-through deal history for a given exchange. When `marketType` is ALL or omitted, deals from HOSE, HNX, and UPCOM are merged. Reads from pre-computed D2 Redis keys with fallback to legacy key.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `marketType` (string) (optional): Exchange: ALL | HOSE | HNX | UPCOM (default ALL)
- `market` (string) (optional): Alias for marketType, accepted for compatibility
- `offset` (integer) (optional): Result offset for pagination
- `fetchCount` (integer) (optional): Maximum results to return

**Responses:**

- `200`: Put-through deal history
- `400`: Bad request — invalid parameter value
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/putthrough/deal-total`

**ID:** `MARKET_PUTTHROUGH_DEAL_TOTAL`  
**Summary:** Get aggregated totals for put-through deals.  

Get aggregated totals for put-through deals.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `marketType` (string) (optional): Market type: HOSE | HNX | UPCOM

**Responses:**

- `200`: Put-through deal totals
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/ranking/foreigner`

**ID:** `MARKET_RANKING_FOREIGNER`  
**Summary:** Get stocks ranked by foreign investor net buy/sell activity.  

Get stocks ranked by foreign investor net buy/sell activity.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `type` (string) (required): Foreigner ranking type (required)
- `market` (string) (optional): Market filter: HOSE | HNX | UPCOM

**Responses:**

- `200`: Foreign investor ranking
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/ranking/up-down`

**ID:** `MARKET_RANKING_UP_DOWN`  
**Summary:** Get up/down stock ranking per exchange, pre-computed by market-ingest.  

Returns stocks ranked by daily price change for each Vietnamese exchange. When `marketType` is ALL or omitted, data for HOSE, HNX, and UPCOM is merged into a single response. Reads from pre-computed D2 Redis keys; falls back to real-time SYMBOL_INFO computation when any key is absent.

Response item fields (abbreviated market data format): `mt` market exchange (HOSE/HNX/UPCOM), `cd` stock code, `cl` price direction class (UP/DOWN/EQUAL/CEILING/FLOOR), `d` date (yyyyMMdd), `o` open price, `h` high price, `l` low price, `c` last/current price, `ch` absolute price change, `r` rate of change (%), `tv` total trading volume (shares), `tr` total trading value (VND).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `marketType` (string) (optional): Exchange filter: ALL | HOSE | HNX | UPCOM (default ALL)
- `upDownType` (string) (optional): Direction: UP | DOWN (default DOWN)
- `offset` (integer) (optional): Result offset for pagination
- `fetchCount` (integer) (optional): Maximum results to return per market

**Responses:**

- `200`: Up/down ranking grouped by exchange
- `400`: Bad request — invalid parameter value
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/ranking/{symbolType}/trade`

**ID:** `MARKET_RANKING_TRADE`  
**Summary:** Get trading volume/value ranking for symbols of a given type.  

Get trading volume/value ranking for symbols of a given type (top gainers, losers, most traded, etc.).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbolType` (string) (required): Security type: STOCK | ETF | BOND | FUTURES
- `marketType` (string) (optional): Market type: HOSE | HNX | UPCOM
- `sortType` (string) (optional): Sort criterion (e.g., by volume or value)
- `offset` (integer) (optional): Result offset for pagination
- `fetchCount` (integer) (optional): Maximum results to return

**Responses:**

- `200`: Trading ranking results
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/session-status`

**ID:** `MARKET_SESSION_STATUS`  
**Summary:** Get the current trading session status for all exchanges.  

Get the current trading session status for all exchanges (pre-open, open, break, close, etc.).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `market` (string) (optional): Exchange filter: HOSE | HNX | UPCOM
- `type` (string) (optional): Session type filter

**Responses:**

- `200`: Market session status
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/stock/ranking/period`

**ID:** `MARKET_STOCK_RANKING_PERIOD`  
**Summary:** Get stock performance ranking over a time period.  

Get stock performance ranking over a time period.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `ranking` (string) (required): Ranking criterion (required)
- `period` (integer) (required): Ranking window in days (required)
- `marketType` (string) (optional): Market type: HOSE | HNX | UPCOM
- `pageNumber` (integer) (optional): Page number
- `pageSize` (integer) (optional): Page size

**Responses:**

- `200`: Period performance ranking
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/stock/ranking/top`

**ID:** `MARKET_STOCK_RANKING_TOP`  
**Summary:** Get top stocks ranked by trading volume or value.  

Get top stocks ranked by trading volume or value.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `marketType` (string) (optional): Market type: HOSE | HNX | UPCOM
- `sortType` (string) (optional): Sort order: TRADING_VOLUME | TRADING_VALUE | CHANGE | RATE | POWER (default TRADING_VOLUME)
- `upDownType` (string) (optional): Direction: UP | DOWN (default DOWN)
- `offset` (integer) (optional): Result offset for pagination
- `fetchCount` (integer) (optional): Maximum results to return

**Responses:**

- `200`: Top stocks ranking
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/stock/ranking/up-down`

**ID:** `MARKET_STOCK_RANKING_UP_DOWN`  
**Summary:** Get stocks ranked by up/down price movement by exchange.  

Get stocks ranked by daily price movement, grouped by exchange (HOSE / HNX / UPCOM).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `marketType` (string) (required): Market type: HOSE | HNX | UPCOM (required)
- `upDownType` (string) (optional): Direction: UP | DOWN (default DOWN)
- `fromDate` (string) (optional): Start date (yyyyMMdd); accepted but currently has no effect on results
- `toDate` (string) (optional): End date (yyyyMMdd); accepted but currently has no effect on results
- `offset` (integer) (optional): Result offset for pagination
- `fetchCount` (integer) (optional): Maximum results to return

**Responses:**

- `200`: Stocks ranked by price movement grouped by exchange
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol`

**ID:** `MARKET_SYMBOL`  
**Summary:** Get static information for one or more listed stock symbols.  

Get static information for one or more stock symbols (name, exchange, sector, lot size, etc.).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbolList` (string) (optional): Comma-separated list of stock codes (e.g., VNM,HPG,VIC)

**Responses:**

- `200`: Symbol static information
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol-quote/{symbol}`

**ID:** `MARKET_SYMBOL_QUOTE_DATA`  
**Summary:** Get current quote data for a symbol (alternate endpoint).  

Get the current quote data for a specific symbol (alternate endpoint).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code (e.g., HPG)

**Responses:**

- `200`: Quote data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/foreigner-summary`

**ID:** `MARKET_SYMBOL_FOREIGNER_SUMMARY`  
**Summary:** Get a summary of foreign investor positions across all symbols.  

Get a summary of foreign investor positions across all symbols.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `marketType` (string) (optional): Market type: HOSE | HNX | UPCOM
- `sortType` (string) (optional): Sort order: CODE | NET_VALUE | NET_VOLUME (default CODE)
- `offset` (integer) (optional): Result offset for pagination
- `fetchCount` (integer) (optional): Maximum results to return

**Responses:**

- `200`: Foreign investor position summary
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/latest`

**ID:** `MARKET_SYMBOL_LATEST`  
**Summary:** Get the latest normal-lot quote data for all active symbols.  

Get the latest normal-lot quote data for all active symbols.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbolList` (string) (optional): Comma-separated list of stock codes to filter

**Responses:**

- `200`: Latest normal-lot quotes for all symbols
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/oddlot-latest`

**ID:** `MARKET_SYMBOL_ODDLOT_LATEST`  
**Summary:** Get the latest odd-lot quote data for all active symbols.  

Get the latest odd-lot quote data for all active symbols.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbolList` (string) (optional): Comma-separated list of stock codes to filter

**Responses:**

- `200`: Latest odd-lot quotes for all symbols
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/static-info`

**ID:** `MARKET_SYMBOL_STATIC_INFO`  
**Summary:** Get static information for one or more stock symbols.  

Get static information for one or more stock symbols. Equivalent to GET /market/symbol.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbolList` (string) (optional): Comma-separated list of stock codes

**Responses:**

- `200`: Symbol static information
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/tick-size-match`

**ID:** `MARKET_SYMBOL_TICK_SIZE_MATCH`  
**Summary:** Get tick size and price matching configuration for a symbol.  

Get tick size and price matching configuration for a symbol.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code

**Responses:**

- `200`: Tick size configuration
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/{symbolCode}/foreigner`

**ID:** `MARKET_SYMBOL_FOREIGNER`  
**Summary:** Get daily foreign investor trading data for a symbol.  

Get daily foreign investor trading data for a symbol (buy/sell volumes and net position).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbolCode` (string) (required): Stock code
- `fromDate` (string) (optional): Start date (YYYY-MM-DD)
- `toDate` (string) (optional): End date (YYYY-MM-DD)

**Responses:**

- `200`: Foreign investor daily trading data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/{symbol}/minute-chart`

**ID:** `MARKET_SYMBOL_MINUTE_CHART`  
**Summary:** Get minute chart data for a symbol for charting displays.  

Get minute chart data for a symbol for use in charting displays.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code

**Responses:**

- `200`: Minute chart data points
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/{symbol}/minutes`

**ID:** `MARKET_SYMBOL_MINUTES`  
**Summary:** Get minute-by-minute quote data for a symbol's current trading session.  

Get minute-by-minute quote data for a symbol for the current trading session.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code
- `minuteUnit` (integer) (required): Minute aggregation unit (required)
- `fromTime` (string) (optional): Start time (yyyyMMddHHmmss format)
- `toTime` (string) (optional): End time (yyyyMMddHHmmss format)
- `fetchCount` (integer) (optional): Maximum number of records

**Responses:**

- `200`: Per-minute quote data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/{symbol}/period/{periodType}`

**ID:** `MARKET_SYMBOL_PERIOD`  
**Summary:** Get periodic aggregated OHLCV data for a symbol by period type.  

Get periodic (weekly or monthly) aggregated OHLCV data for a symbol.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code
- `periodType` (string) (required): Aggregation period: DAILY | WEEKLY | MONTHLY | SIX_MONTH
- `baseDate` (string) (optional): Base date anchor (YYYY-MM-DD)
- `fetchCount` (integer) (optional): Maximum number of records to return

**Responses:**

- `200`: Periodic OHLCV data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/{symbol}/quote`

**ID:** `MARKET_SYMBOL_QUOTE`  
**Summary:** Get the current quote for a symbol including bid/ask and last price.  

Get the current quote for a specific symbol including bid/ask, last price, and order matching data.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code (e.g., VNM)

**Responses:**

- `200`: Current quote data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/{symbol}/right`

**ID:** `MARKET_SYMBOL_RIGHT`  
**Summary:** Get stock rights and corporate action information for a symbol.  

Get stock rights and corporate action information for a symbol (splits, dividends, rights issues).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code

**Responses:**

- `200`: Stock rights and corporate actions
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/{symbol}/statistic`

**ID:** `MARKET_SYMBOL_STATISTIC`  
**Summary:** Get intraday buy/sell statistics for a symbol by price range.  

Get intraday buy/sell statistics for a symbol (cumulative buy/sell volumes by price range).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code
- `pageSize` (integer) (required): Number of records per page (required)
- `pageNumber` (integer) (required): Page number, 0-based (required)
- `sortBy` (string) (optional): Sort field

**Responses:**

- `200`: Intraday statistics
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/symbol/{symbol}/ticks`

**ID:** `MARKET_SYMBOL_TICKS`  
**Summary:** Get tick-level quote history for a symbol (intraday trading ticks).  

Get tick-level quote history for a symbol (intraday trading ticks).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code
- `tickUnit` (integer) (required): Tick aggregation unit (required)
- `fromSequence` (integer) (optional): Start tick sequence number
- `toSequence` (integer) (optional): End tick sequence number
- `fetchCount` (integer) (optional): Maximum number of ticks to return

**Responses:**

- `200`: Tick-level quote data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/top-ai-rating`

**ID:** `MARKET_TOP_AI_RATING`  
**Summary:** Get stocks with the highest AI-generated ratings.  

Get stocks with the highest AI-generated ratings.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fetchCount` (integer) (optional): Maximum results to return
- `lastOverAll` (number) (optional): Pagination cursor (last overall rating value)
- `lastCode` (string) (optional): Pagination cursor (last stock code)

**Responses:**

- `200`: Top AI-rated stocks
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/top-foreigner-trading`

**ID:** `MARKET_TOP_FOREIGNER_TRADING`  
**Summary:** Get top stocks by foreign investor net trading activity.  

Get top stocks by foreign investor net trading activity.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `marketType` (string) (optional): Market type: HOSE | HNX | UPCOM
- `upDownType` (string) (optional): Sort direction on net foreign value: UP | DOWN (default DOWN; DOWN = largest net buyers first, UP = largest net sellers first)
- `offset` (integer) (optional): Result offset for pagination
- `fetchCount` (integer) (optional): Maximum results to return

**Responses:**

- `200`: Top foreign trading stocks
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/market/vnindex-return`

**ID:** `MARKET_VNINDEX_RETURN`  
**Summary:** Get VN-Index cumulative return data for chart comparison.  

Get VN-Index cumulative return data for chart comparison.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fromDate` (string) (required): Start date (YYYY-MM-DD) (required)
- `pageNumber` (integer) (optional): Page number
- `pageSize` (integer) (optional): Page size

**Responses:**

- `200`: VN-Index return data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

---

## Social

**Summary:** Social feed — posts, likes, follows, blocks, timeline, and cashtag feeds

### `DELETE /api/v1/social/posts/{id}`

**ID:** `SOCIAL_POSTS_DELETE`  
**Summary:** Delete a social post.  

Delete a post (only by the post author).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Post ID to delete

**Responses:**

- `204`: No content
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/social/posts/{id}/likes`

**ID:** `SOCIAL_POSTS_UNLIKE`  
**Summary:** Remove a like from a post.  

Remove a like from a post. Returns 204 on success. Returns 404 if the post does not exist.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Post ID to unlike

**Responses:**

- `204`: No content
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/social/users/{id}/blocks`

**ID:** `SOCIAL_USERS_UNBLOCK`  
**Summary:** Unblock a previously blocked user.  

Unblock a previously blocked user. Returns 204 on success. Returns 404 if the block does not exist.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): ID of the user to unblock

**Responses:**

- `204`: No content
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/social/users/{id}/follows`

**ID:** `SOCIAL_USERS_UNFOLLOW`  
**Summary:** Unfollow a user.  

Unfollow a user. Returns 204 on success. Idempotent — no error if the follow relationship does not exist.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): ID of the user to unfollow

**Responses:**

- `204`: No content
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Target user not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/social/cashtags/{symbol}`

**ID:** `SOCIAL_CASHTAGS`  
**Summary:** Get social posts mentioning a cashtag.  

Get social posts mentioning a specific stock cashtag (e.g., $VNM).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code without the $ prefix (e.g., VNM)
- `cursor` (string) (optional): Pagination cursor
- `pageSize` (integer) (optional): Results per page (default 20)

**Responses:**

- `200`: Posts mentioning the cashtag
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/social/posts/{id}`

**ID:** `SOCIAL_POSTS_GET`  
**Summary:** Get a social post by ID.  

Get a single social post by ID.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Post ID

**Responses:**

- `200`: Post data
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/social/timeline`

**ID:** `SOCIAL_TIMELINE`  
**Summary:** Get the authenticated user's social timeline.  

Get the authenticated user's social timeline (posts from followed users, filtered by type).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `filter` (string) (optional): Timeline filter: ALL | USER | NEWS (default: ALL)
- `cursor` (string) (optional): Pagination cursor (ISO date string)
- `pageSize` (integer) (optional): Results per page (1–50, default 20)

**Responses:**

- `200`: Timeline posts with next cursor
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/social/users/{id}/followers`

**ID:** `SOCIAL_USERS_FOLLOWERS`  
**Summary:** Get followers of a user.  

Get the list of users following the specified user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Target user ID
- `cursor` (string) (optional): Pagination cursor
- `limit` (integer) (optional): Maximum results

**Responses:**

- `200`: Followers list with next cursor
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/social/users/{id}/following`

**ID:** `SOCIAL_USERS_FOLLOWING`  
**Summary:** Get users that a user is following.  

Get the list of users that the specified user is following.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Target user ID
- `cursor` (string) (optional): Pagination cursor
- `limit` (integer) (optional): Maximum results

**Responses:**

- `200`: Following list with next cursor
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/social/users/{id}/posts`

**ID:** `SOCIAL_USERS_POSTS`  
**Summary:** Get all posts by a specific user.  

Get all posts by a specific user. Returns an empty list if the requesting user is blocked by or has blocked the target user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Target user ID
- `cursor` (string) (optional): Pagination cursor
- `pageSize` (integer) (optional): Results per page (default 20)

**Responses:**

- `200`: User posts with next cursor
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/social/posts`

**ID:** `SOCIAL_POSTS_CREATE`  
**Summary:** Create a new social post.  

Create a new social post. Cashtags (e.g., $VNM) in the content are automatically parsed.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `201`: Post created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/social/posts/{id}/likes`

**ID:** `SOCIAL_POSTS_LIKE`  
**Summary:** Like a post.  

Like a post. Returns 204 on success. Returns 404 if the post does not exist.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Post ID to like

**Responses:**

- `204`: No content
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/social/users/{id}/blocks`

**ID:** `SOCIAL_USERS_BLOCK`  
**Summary:** Block a user.  

Block a user. Blocked users' posts will not appear in the timeline.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): ID of the user to block

**Responses:**

- `204`: No content
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/social/users/{id}/follows`

**ID:** `SOCIAL_USERS_FOLLOW`  
**Summary:** Follow another user.  

Follow another user. Returns 204 on success. Returns 400 if a block relationship exists between the two users.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): ID of the user to follow

**Responses:**

- `204`: No content
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/social/posts/{id}`

**ID:** `SOCIAL_POSTS_UPDATE`  
**Summary:** Update a social post.  

Update the content of a post (only by the post author).  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Post ID

**Responses:**

- `200`: Post updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

---

## Insights

**Summary:** User personalization — watchlist creation, management, symbol tracking, search history, and future AI-driven recommendations

### `DELETE /api/v1/insights/notifications`

**ID:** `INSIGHTS_NOTIFICATIONS_DELETE`  
**Summary:** Soft-delete notifications for the authenticated user.  

Soft-deletes one, multiple, or all notifications for the authenticated user.
Global (broadcast) notifications are soft-deleted via notification_recipients.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `204`: Notifications deleted
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/insights/search-history`

**ID:** `INSIGHTS_SEARCH_HISTORY_DELETE`  
**Summary:** Delete search history for the authenticated user.  

If symbol is provided, deletes only that history entry. If symbol is omitted, clears
the entire search history for the authenticated user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (optional): Stock symbol to remove (omit to clear all)

**Responses:**

- `204`: Search history deleted
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/insights/watchlists/symbol`

**ID:** `WATCHLIST_SYMBOL_REMOVE`  
**Summary:** Remove a stock symbol from a watchlist.  

Remove a stock symbol from one or more watchlists owned by the authenticated user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `watchlistId` (string) (required): 
- `symbol` (string) (required): Stock symbol to remove

**Responses:**

- `204`: Symbol removed from watchlist
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/insights/watchlists/{watchlistId}`

**ID:** `WATCHLIST_DELETE`  
**Summary:** Delete a watchlist for the authenticated user.  

Soft-delete a watchlist owned by the authenticated user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `watchlistId` (string) (required): Watchlist ID

**Responses:**

- `204`: Watchlist deleted
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/insights/notifications`

**ID:** `INSIGHTS_MARKET_NOTIFICATIONS`  
**Summary:** Get market alert notifications from Redis for the authenticated user.  

Returns paginated market alert notifications filtered by type, keyword, and date range.
Data is sourced from Redis `market:notices:{type}` hash keys.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `type` (string) (optional): Notification type filter (default: ALL)
- `keyword` (string) (optional): Keyword filter on title and content
- `fromDate` (string) (optional): Start date filter (YYYYMMDD, default: 19700101)
- `toDate` (string) (optional): End date filter (YYYYMMDD, default: today)
- `pageSize` (integer) (optional): Page size (default: 20)
- `pageNumber` (integer) (optional): Page number 0-based (default: 0)

**Responses:**

- `200`: Market alert notifications returned
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/insights/notifications/inbox`

**ID:** `INSIGHTS_NOTIFICATIONS_INBOX`  
**Summary:** Get the app notification inbox for the authenticated user.  

Returns paginated inbox notifications (personal + global broadcasts) from the database.
Sorted by date DESC, created_at DESC, id DESC.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `pageNumber` (integer) (optional): Page number 1-based (default: 1)
- `pageSize` (integer) (optional): Page size (default: 20, max: 100)
- `type` (string) (optional): Notification type filter

**Responses:**

- `200`: Inbox notifications returned
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/insights/notifications/unread-count`

**ID:** `INSIGHTS_NOTIFICATIONS_UNREAD_COUNT`  
**Summary:** Get unread notification count for the authenticated user.  

Returns the total count of unread notifications (personal + global broadcasts).  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Unread count returned
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/insights/search-history`

**ID:** `INSIGHTS_SEARCH_HISTORY_GET`  
**Summary:** Get recent search history for the authenticated user.  

Returns the authenticated user's recent symbol searches ordered by most recent first,
limited to 20 entries.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Recent search history returned
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/insights/search-stats/top`

**ID:** `INSIGHTS_SEARCH_STATS_TOP`  
**Summary:** Get top searched symbols by global search count.  

Returns the most-searched symbols globally, ordered by search count descending.
Results are cached in Redis for 60 seconds. Default limit is 10, maximum is 50.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `limit` (integer) (optional): Number of results to return (default: 10, max: 50)

**Responses:**

- `200`: Top searched symbols returned
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/insights/settings/notifications`

**ID:** `INSIGHTS_GET_NOTIFICATION_SETTINGS`  
**Summary:** Get news notification settings for the authenticated user.  

Returns the user's news notification preferences: subscribed categories, watched symbols, and enabled flag.
If no record exists, returns defaults (empty arrays, enabled=false).  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Notification settings returned
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/insights/watchlists`

**ID:** `WATCHLIST_GET`  
**Summary:** Get all watchlists for the authenticated user.  

Get all watchlists for the authenticated user, ordered by sequence.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: List of user watchlists
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/insights/watchlists/symbol`

**ID:** `WATCHLIST_SYMBOL_GET`  
**Summary:** Get all symbols in a specific watchlist.  

Get all stock symbols in a watchlist owned by the authenticated user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `watchlistId` (integer) (required): Watchlist ID

**Responses:**

- `200`: Watchlist symbols
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/insights/watchlists/symbol/include`

**ID:** `WATCHLIST_SYMBOL_INCLUDE`  
**Summary:** Check whether a symbol is in any of the user's watchlists.  

Returns the IDs of all watchlists that contain the given symbol.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (required): Stock code to check

**Responses:**

- `200`: Symbol watchlist membership info
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PATCH /api/v1/insights/settings/notifications`

**ID:** `INSIGHTS_UPDATE_NOTIFICATION_SETTINGS`  
**Summary:** Update news notification settings for the authenticated user.  

Upserts the user's news notification preferences. Only provided fields are changed; omitted fields keep their existing value.
On first create, missing fields default to empty arrays / false.
Categories are limited to at most 50 items. Symbols are limited to at most 200 items.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Notification settings updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation (e.g. category limit exceeded)
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/insights/notifications/reads`

**ID:** `INSIGHTS_NOTIFICATIONS_MARK_READ`  
**Summary:** Mark notifications as read for the authenticated user.  

Marks one, multiple, or all notifications as read.
Global (broadcast) notifications are tracked via notification_recipients.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Notifications marked as read
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/insights/search-history`

**ID:** `INSIGHTS_SEARCH_HISTORY_RECORD`  
**Summary:** Record a symbol search for the authenticated user.  

Upserts the search history entry for the given user/symbol pair (updating searchedAt to now)
and atomically increments the global search count for that symbol.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `201`: Search recorded
- `400`: Bad request — missing symbol
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/insights/watchlists`

**ID:** `WATCHLIST_CREATE`  
**Summary:** Create a new watchlist for the authenticated user.  

Create a new watchlist for the authenticated user.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `201`: Watchlist created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/insights/watchlists/symbol`

**ID:** `WATCHLIST_SYMBOL_ADD`  
**Summary:** Add a stock symbol to a watchlist.  

Add one or more stock symbols to one or more watchlists owned by the authenticated user.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `201`: Symbol added to watchlist
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/insights/settings/notification-preferences`

**ID:** `INSIGHTS_NOTIFICATION_PREFERENCES_SAVE`  
**Summary:** Upsert per-type notification preferences for the authenticated user.  

Enables or disables specific notification types for the authenticated user.
All updates are applied atomically within a transaction.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Preferences saved
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/insights/watchlists`

**ID:** `WATCHLIST_EDIT`  
**Summary:** Update an existing watchlist's name.  

Update the name of an existing watchlist owned by the authenticated user.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Watchlist updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/insights/watchlists/sequence`

**ID:** `WATCHLIST_SEQUENCE`  
**Summary:** Reorder watchlists for the authenticated user.  

Change the sequence (display order) of a watchlist.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Watchlist order updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

---

## Virtual Trading

**Summary:** Virtual portfolio — sub-accounts, order simulation, profit/loss, and investing contests

### `DELETE /api/v1/virtual/accounts/follows/{followedId}`

**ID:** `VIRTUAL_ACCOUNT_FOLLOW_DELETE`  
**Summary:** Unfollow a virtual trading account.  

Removes the follow relationship between the authenticated user and the specified followed user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `followedId` (integer) (required): ID of the followed account to unfollow

**Responses:**

- `204`: Account unfollowed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/virtual/admin/event-adjust/{adjustId}`

**ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_DELETE`  
**Summary:** Delete an event adjustment ratio (admin only).  

Permanently deletes an event adjustment ratio record identified by its numeric ID.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `adjustId` (integer) (required): Numeric ID of the adjustment record to delete

**Responses:**

- `204`: Adjustment deleted
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/virtual/admin/event/{eventId}`

**ID:** `VIRTUAL_ADMIN_EVENT_DELETE`  
**Summary:** Delete a virtual trading event (admin only).  

Permanently deletes a corporate action event record. Only events that have not yet been applied to virtual accounts can be deleted.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `eventId` (string) (required): ID of the event to delete

**Responses:**

- `204`: Event deleted
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/virtual/contests/{contestId}`

**ID:** `VIRTUAL_CONTESTS_DELETE`  
**Summary:** Delete a contest (admin only).  

Permanently deletes a virtual trading contest. Only contests that have not yet started can be deleted.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID to delete

**Responses:**

- `204`: Contest deleted
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/virtual/equity/orders/stop-limit/{orderId}`

**ID:** `VIRTUAL_EQUITY_STOP_LIMIT_ORDER_CANCEL`  
**Summary:** Cancel a pending stop-limit order.  

Cancels an active stop-limit order before it is triggered. The order must be in PENDING status.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `orderId` (integer) (required): ID of the stop-limit order to cancel
- `subAccount` (string) (optional): Sub-account identifier (optional, defaults to primary account)

**Responses:**

- `204`: Stop-limit order cancelled
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/virtual/equity/orders/{orderId}`

**ID:** `VIRTUAL_EQUITY_ORDER_CANCEL`  
**Summary:** Cancel a pending limit order.  

Cancels an unmatched limit order. Only orders in PENDING status can be cancelled.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `orderId` (integer) (required): ID of the order to cancel

**Responses:**

- `204`: Order cancelled
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/virtual/equity/stop-orders/bulk`

**ID:** `VIRTUAL_EQUITY_STOP_ORDER_CANCEL_MULTI`  
**Summary:** Cancel multiple pending stop orders.  

Bulk-cancels a list of active stop orders. Orders already triggered or cancelled are silently skipped.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `stopOrderIds` (array) (required): 

**Responses:**

- `204`: Stop orders cancelled
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/virtual/equity/stop-orders/{orderId}`

**ID:** `VIRTUAL_EQUITY_STOP_ORDER_CANCEL`  
**Summary:** Cancel a pending stop order.  

Cancels an active stop order before it is triggered. The order must be in PENDING status.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `orderId` (integer) (required): Stop order ID to cancel

**Responses:**

- `204`: Stop order cancelled
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/virtual/search/account/history/{id}`

**ID:** `VIRTUAL_SEARCH_ACCOUNT_HISTORY_DELETE`  
**Summary:** Delete an account search history record.  

Deletes a single account search history record or clears all account search history depending on the deleteType value.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Account search history record ID to delete

**Responses:**

- `204`: Account search history deleted
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/virtual/search/history/{id}`

**ID:** `VIRTUAL_SEARCH_HISTORY_DELETE`  
**Summary:** Delete a stock search history record.  

Deletes a single stock search history record or clears all history depending on the deleteType value.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Search history record ID to delete

**Responses:**

- `204`: Search history deleted
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/accounts/followers`

**ID:** `VIRTUAL_ACCOUNT_FOLLOWERS`  
**Summary:** List all users following the authenticated user's virtual trading account.  

Returns a paginated list of users who follow the authenticated user's virtual trading account.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Followers list
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/accounts/following-accounts`

**ID:** `VIRTUAL_ACCOUNT_FOLLOWING_LIST`  
**Summary:** List all virtual trading accounts that the authenticated user follows.  

Returns a paginated list of virtual trading accounts followed by the authenticated user, optionally filtered by follow type.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Following accounts list
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/accounts/one-month-normalized-nav`

**ID:** `VIRTUAL_ACCOUNT_ONE_MONTH_NORMALIZED_NAV`  
**Summary:** Get the one-month normalized NAV performance for the virtual trading account.  

Returns daily normalized NAV data points over a one-month window for the specified virtual sub-account. Used for performance chart rendering.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Normalized NAV data
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/admin/event`

**ID:** `VIRTUAL_ADMIN_EVENT_LIST`  
**Summary:** List all virtual trading events (admin only).  

Returns a paginated list of corporate action events used in virtual trading simulations, optionally filtered by effective date range.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Event list
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/admin/event-adjust`

**ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_LIST`  
**Summary:** List all event adjustment ratios (admin only).  

Returns a paginated list of event adjustment ratio records used to adjust virtual account positions for corporate actions on the specified effective date.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Event adjustment ratios
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/admin/event-adjust-id`

**ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_BY_ID`  
**Summary:** Get a specific event adjustment ratio by ID (admin only).  

Returns the full details of a single event adjustment ratio record identified by its numeric ID.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `adjustId` (integer) (required): Adjustment ID

**Responses:**

- `200`: Event adjustment details
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/admin/event-id`

**ID:** `VIRTUAL_ADMIN_EVENT_BY_ID`  
**Summary:** Get a specific virtual trading event by ID (admin only).  

Returns the full details of a single corporate action event record identified by its event ID string.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `eventId` (integer) (required): Event ID

**Responses:**

- `200`: Event details
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/admin/limited-stock`

**ID:** `VIRTUAL_ADMIN_LIMITED_STOCK_LIST`  
**Summary:** List stocks with trading restrictions configured by admin.  

Returns all stocks that have been flagged with trading restrictions in the virtual trading engine, including the reason for each restriction.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Admin limited stocks list
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/admin/settlement/cash-settlement-status`

**ID:** `VIRTUAL_ADMIN_SETTLEMENT_CASH_STATUS`  
**Summary:** Get the cash settlement status for a date range (admin only).  

Returns whether cash settlement has been completed for each trading day in the specified date range. Used by admins to verify settlement pipeline status.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fromDate` (string) (required): Start date (YYYY-MM-DD)
- `toDate` (string) (optional): End date (YYYY-MM-DD)

**Responses:**

- `200`: Cash settlement status
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/admin/settlement/quantity-settlement-status`

**ID:** `VIRTUAL_ADMIN_SETTLEMENT_QUANTITY_STATUS`  
**Summary:** Get the quantity (stock) settlement status for a date range (admin only).  

Returns whether stock quantity settlement has been completed for each trading day in the specified date range. Used by admins to verify settlement pipeline status.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fromDate` (string) (required): Start date (YYYY-MM-DD)
- `toDate` (string) (optional): End date (YYYY-MM-DD)

**Responses:**

- `200`: Quantity settlement status
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/contests`

**ID:** `VIRTUAL_CONTESTS`  
**Summary:** List virtual trading contests the authenticated user has joined.  

Returns the list of virtual trading contests that the authenticated user is currently participating in.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Joined contests
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/contests/booked`

**ID:** `VIRTUAL_CONTESTS_BOOKED`  
**Summary:** List contests the authenticated user has pre-registered for.  

Returns the list of upcoming contests for which the authenticated user has a pending booking reservation.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Pre-registered contests
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/contests/expired`

**ID:** `VIRTUAL_CONTESTS_EXPIRED`  
**Summary:** List expired virtual trading contests.  

Returns a paginated list of contests that have ended, optionally filtered by status and sort order.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Expired contests
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/contests/listed`

**ID:** `VIRTUAL_CONTESTS_LISTED`  
**Summary:** List all available (open for registration) virtual trading contests.  

Returns all contests that are currently open for new participant registrations, optionally filtered by name.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Available contests
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/contests/organization`

**ID:** `VIRTUAL_CONTESTS_ORGANIZATION`  
**Summary:** List contests organized by the authenticated user's organization.  

Returns the list of virtual trading contests created and managed by the authenticated user's organization.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Organization contests
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/contests/{contestId}/current-ranking`

**ID:** `VIRTUAL_CONTESTS_CURRENT_RANKING`  
**Summary:** Get the current real-time ranking for an active contest.  

Returns the live leaderboard for the specified active contest, optionally filtered by period and conditional ranking rules.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID
- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Current contest ranking
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/contests/{contestId}/ranking`

**ID:** `VIRTUAL_CONTESTS_RANKING`  
**Summary:** Get the final ranking for a completed contest.  

Returns the final leaderboard for the specified contest, including participant rankings, NAV values, and return percentages over the contest period.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID
- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Final contest ranking
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/contests/{contestId}/ranking-history`

**ID:** `VIRTUAL_CONTESTS_RANKING_HISTORY`  
**Summary:** Get the ranking history over time for a contest.  

Returns the historical ranking progression for participants in the specified contest, paginated by period number.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID
- `fromDate` (string) (optional): Start date
- `toDate` (string) (optional): End date
- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Contest ranking history
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/accumulative-profit-loss`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_ACCUMULATIVE_PROFIT_LOSS`  
**Summary:** Get accumulated (cumulative) profit/loss for the virtual trading account.  

Returns the cumulative P&L for the specified sub-account over the given date range, representing the total net gain or loss since account inception or from date.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `subAccount` (string) (optional): Sub-account identifier

**Responses:**

- `200`: Accumulative profit/loss
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/buyable`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_BUYABLE`  
**Summary:** Calculate the maximum buyable quantity for a stock given the current account balance.  

Returns the maximum number of shares that can be purchased for the given stock at the specified price, based on the available cash in the virtual account.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `stockCode` (string) (required): Stock code
- `subAccount` (string) (optional): Sub-account identifier
- `orderPrice` (number) (optional): Intended order price

**Responses:**

- `200`: Maximum buyable quantity
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/daily-profit-loss`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_DAILY_PROFIT_LOSS`  
**Summary:** Get daily profit/loss history for the virtual account.  

Returns a paginated list of daily P&L records for the specified sub-account and date range. Each record contains the NAV and P&L value for that day.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `subAccount` (string) (optional): Sub-account identifier
- `fromDate` (string) (optional): Start date (YYYY-MM-DD)
- `toDate` (string) (optional): End date (YYYY-MM-DD)
- `page` (integer) (optional): One-based page index (default 1)
- `size` (integer) (optional): Page size (max 100, default 20)

**Responses:**

- `200`: Daily profit/loss history
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/following-accumulative-pl`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_FOLLOWING_ACCUMULATIVE_PROFIT_LOSS`  
**Summary:** Get accumulative profit/loss for a followed user's virtual account.  

Returns the cumulative P&L for a followed user's sub-account over the given date range. Requires a follow relationship with the target user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `followedUserId` (integer) (optional): ID of the followed user

**Responses:**

- `200`: Followed user accumulative profit/loss
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/following-daily-profit-loss`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_FOLLOWING_DAILY_PROFIT_LOSS`  
**Summary:** Get daily profit/loss for a followed user's virtual trading account.  

Returns daily P&L records for a followed user's sub-account over the specified date range. Requires a follow relationship with the target user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `followedUserId` (integer) (optional): ID of the followed user
- `page` (integer) (optional): One-based page index (default 1)
- `size` (integer) (optional): Page size (max 100, default 20)

**Responses:**

- `200`: Followed user daily profit/loss
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/following-profit-loss`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_FOLLOWING_PROFIT_LOSS`  
**Summary:** Get the profit/loss summary for a followed user's virtual trading account.  

Returns NAV and unrealized P&L for a followed user's sub-account. Requires the authenticated user to follow the target account.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `followedUserId` (integer) (optional): ID of the followed user

**Responses:**

- `200`: Followed user's profit/loss
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/profit-loss`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_PROFIT_LOSS`  
**Summary:** Get current profit/loss, net asset value, and portfolio breakdown for the virtual trading account.  

Returns unrealized P&L, NAV, cash balance, and a breakdown of open positions for the specified sub-account.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `subAccount` (string) (optional): Sub-account identifier

**Responses:**

- `200`: Portfolio profit/loss summary
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/realized-profit-loss`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_REALIZED_PROFIT_LOSS`  
**Summary:** Get realized profit/loss from closed positions in the virtual account.  

Returns the total realized P&L from positions closed within the specified date range for the given virtual sub-account.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `subAccount` (string) (optional): Sub-account identifier

**Responses:**

- `200`: Realized profit/loss
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/realized-profit-loss/history`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_REALIZED_PROFIT_LOSS_HISTORY`  
**Summary:** Get historical realized profit/loss records with pagination.  

Returns a paginated list of historical realized P&L records for the virtual trading account, ordered by settlement date.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `subAccount` (string) (optional): Sub-account identifier
- `fromDate` (string) (optional): Start date
- `toDate` (string) (optional): End date
- `page` (integer) (optional): One-based page index (default 1)
- `size` (integer) (optional): Page size (max 100, default 20)

**Responses:**

- `200`: Realized profit/loss history
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/accounts/sellable`

**ID:** `VIRTUAL_EQUITY_ACCOUNT_SELLABLE`  
**Summary:** Get the maximum sellable quantity for a stock in the virtual account.  

Returns the number of shares available for sale for the given stock in the specified virtual sub-account.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `stockCode` (string) (required): Stock code
- `subAccount` (string) (optional): Sub-account identifier

**Responses:**

- `200`: Maximum sellable quantity
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/event/by-stock`

**ID:** `VIRTUAL_EQUITY_EVENT_BY_STOCK`  
**Summary:** Get corporate action events (splits, dividends) for a stock.  

Returns pending and historical corporate action events (stock splits, dividends, rights issues) for the specified stock codes that affect virtual account positions.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `stockCode` (string) (required): Stock code

**Responses:**

- `200`: Stock corporate events
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/limited-stock`

**ID:** `VIRTUAL_EQUITY_LIMITED_STOCK`  
**Summary:** Get the list of stocks with trading restrictions in virtual trading.  

Returns stock codes that have been flagged with trading restrictions in the virtual trading engine (e.g. due to pending corporate actions).  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Limited stocks list
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/orders/history`

**ID:** `VIRTUAL_EQUITY_ORDER_HISTORY`  
**Summary:** Get the order history for the user's virtual trading account.  

Returns a paginated list of equity orders for the specified sub-account, optionally filtered by date range, buy/sell side, and order status.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `subAccount` (string) (optional): Sub-account filter
- `fromDate` (string) (optional): Start date (YYYY-MM-DD)
- `toDate` (string) (optional): End date (YYYY-MM-DD)
- `page` (integer) (optional): One-based page index (default 1)
- `size` (integer) (optional): Page size (max 100, default 20)

**Responses:**

- `200`: Order history
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/orders/most-bought-stock`

**ID:** `VIRTUAL_EQUITY_ORDER_MOST_BOUGHT_STOCK`  
**Summary:** Get stocks most frequently bought by virtual traders.  

Returns a ranked list of stocks by buy order volume across all virtual trading accounts over the recent period.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fromDate` (string) (optional): Start date
- `toDate` (string) (optional): End date
- `limit` (integer) (optional): Maximum results

**Responses:**

- `200`: Most bought stocks
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/orders/most-sold-stock`

**ID:** `VIRTUAL_EQUITY_ORDER_MOST_SOLD_STOCK`  
**Summary:** Get stocks most frequently sold by virtual traders.  

Returns a ranked list of stocks by sell order volume across all virtual trading accounts over the recent period.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fromDate` (string) (optional): Start date
- `toDate` (string) (optional): End date
- `limit` (integer) (optional): Maximum results

**Responses:**

- `200`: Most sold stocks
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/stop-orders/history`

**ID:** `VIRTUAL_EQUITY_STOP_ORDER_HISTORY`  
**Summary:** Get stop order history with optional filters for date range and side.  

Returns a paginated list of stop orders for the specified sub-account, optionally filtered by date range, buy/sell side, and order status.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `subAccount` (string) (optional): Sub-account filter
- `fromDate` (string) (optional): Start date (YYYY-MM-DD)
- `toDate` (string) (optional): End date (YYYY-MM-DD)
- `status` (string) (optional): Order status filter
- `page` (integer) (optional): One-based page index (default 1)
- `size` (integer) (optional): Page size (max 100, default 20)

**Responses:**

- `200`: Stop order history
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/equity/vn-index-return`

**ID:** `VIRTUAL_EQUITY_VNINDEX_RETURN`  
**Summary:** Get VN-Index return data for comparison with the user's portfolio performance.  

Returns VN-Index return values over various periods (1W, 1M, 3M, YTD) for benchmarking virtual portfolio performance.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fromDate` (string) (optional): Start date (YYYY-MM-DD)
- `toDate` (string) (optional): End date (YYYY-MM-DD)

**Responses:**

- `200`: VN-Index return data
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/following/{followingUserId}/sub-accounts`

**ID:** `VIRTUAL_FOLLOWING_SUB_ACCOUNTS`  
**Summary:** List active sub-accounts of a followed user.  

Returns the active virtual trading sub-accounts belonging to the specified followed user. The authenticated user must follow the target user.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `followingUserId` (integer) (required): ID of the followed user

**Responses:**

- `200`: Followed user's sub-accounts
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/hit-the-ceiling-or-floor-price`

**ID:** `VIRTUAL_HIT_CEILING_OR_FLOOR_PRICE`  
**Summary:** Get notifications for stocks that have hit their ceiling or floor price in virtual trading.  

Returns whether the specified stock has reached its daily ceiling or floor price limit in the virtual trading simulation.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `subAccount` (string) (optional): Sub-account identifier

**Responses:**

- `200`: Ceiling/floor price notifications
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/index/rank`

**ID:** `VIRTUAL_INDEX_RANK`  
**Summary:** Get the virtual portfolio performance ranking compared to an index.  

Returns a paginated leaderboard of virtual portfolios ranked by their performance relative to the specified market index over the given period.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Index vs portfolio rank
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/leaderboard/current-investing-info`

**ID:** `VIRTUAL_LEADERBOARD_CURRENT_INVESTING_INFO`  
**Summary:** Get the current period investing summary for the leaderboard.  

Returns the current leaderboard period metadata and the authenticated user's investing performance summary for that period.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Current leaderboard period info
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/leaderboard/investing`

**ID:** `VIRTUAL_LEADERBOARD_INVESTING`  
**Summary:** Get the virtual trading leaderboard ranked by investment performance.  

Returns a paginated ranked list of virtual traders ordered by their normalized NAV performance over the current leaderboard period.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `period` (string) (optional): Period: 1W | 1M | 3M | 6M | 1Y
- `page` (integer) (optional): Zero-based page index
- `size` (integer) (optional): Page size (1–100, default 20)

**Responses:**

- `200`: Investing leaderboard
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/leaderboard/investing/user-ranking`

**ID:** `VIRTUAL_LEADERBOARD_INVESTING_USER_RANKING`  
**Summary:** Get the authenticated user's ranking position on the virtual trading leaderboard.  

Returns the rank, total participants, and NAV for the authenticated user in the current leaderboard period.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `period` (string) (optional): Period: 1W | 1M | 3M | 6M | 1Y

**Responses:**

- `200`: User leaderboard ranking
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/periodic-profit-loss`

**ID:** `VIRTUAL_PERIODIC_PROFIT_LOSS`  
**Summary:** Get profit/loss grouped by time period (1W, 1M, 3M, YTD).  

Returns the authenticated user's virtual portfolio profit/loss summarized over standard time periods: 1 week, 1 month, 3 months, and year-to-date.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `period` (string) (optional): Time period: 1W | 1M | 3M | 6M | 1Y
- `subAccount` (string) (optional): Sub-account identifier

**Responses:**

- `200`: Periodic profit/loss breakdown
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/profile/trading-history`

**ID:** `VIRTUAL_PROFILE_TRADING_HISTORY`  
**Summary:** Get the authenticated user's virtual trading transaction history.  

Returns a paginated list of completed trades for the specified virtual sub-account within the given date range, ordered by trade date.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fromDate` (string) (optional): Start date (YYYY-MM-DD)
- `toDate` (string) (optional): End date (YYYY-MM-DD)
- `page` (integer) (optional): One-based page index (default 1)
- `size` (integer) (optional): Page size (max 100, default 20)

**Responses:**

- `200`: Trading history
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/recommended-accounts`

**ID:** `VIRTUAL_RECOMMENDED_ACCOUNTS_LIST`  
**Summary:** Get the list of recommended virtual trading accounts.  

Returns a paginated list of recommended virtual trading accounts for display in the user discovery feed.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `limit` (integer) (optional): Maximum results

**Responses:**

- `200`: Recommended accounts
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/search/account/recent-views`

**ID:** `VIRTUAL_SEARCH_RECENT_ACCOUNT_VIEWS`  
**Summary:** Get recently viewed virtual accounts.  

Returns the list of virtual trading accounts most recently viewed by the authenticated user, ordered by view time descending.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `limit` (integer) (optional): Maximum results

**Responses:**

- `200`: Recently viewed accounts
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/search/account/view-count`

**ID:** `VIRTUAL_SEARCH_ACCOUNT_TOTAL_VIEWS`  
**Summary:** Get the total view count for virtual accounts.  

Returns the total number of profile views for the specified user IDs in the virtual trading context.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Account view counts
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/search/ranking`

**ID:** `VIRTUAL_SEARCH_RANKING`  
**Summary:** Get stocks ranked by search frequency in virtual trading.  

Returns a ranked list of stock codes ordered by how frequently they have been searched by virtual traders over the specified period.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `limit` (integer) (optional): Maximum results (default 20)

**Responses:**

- `200`: Search ranking
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/search/recent-views`

**ID:** `VIRTUAL_SEARCH_RECENT_VIEWS`  
**Summary:** Get recently viewed stocks in virtual trading.  

Returns the list of stock codes most recently viewed by the authenticated user in the virtual trading context, ordered by view time descending.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `limit` (integer) (optional): Maximum results

**Responses:**

- `200`: Recently viewed stocks
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/virtual/sub-accounts`

**ID:** `VIRTUAL_SUB_ACCOUNTS`  
**Summary:** List all active virtual trading sub-accounts for the authenticated user.  

Returns the list of active virtual trading sub-accounts owned by the authenticated user, including portfolio name and balance.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: List of active sub-accounts
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/accounts`

**ID:** `VIRTUAL_ACCOUNT_INITIALIZE`  
**Summary:** Initialize a new virtual trading account.  

Creates and initializes a virtual trading account with the given sub-account identifier and starting balance. Called when a user creates their first portfolio.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `subAccount` (string, optional): 
- `name` (string, optional): 
- `quota` (number, optional): 

**Responses:**

- `201`: Virtual account initialized
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/accounts/follows`

**ID:** `VIRTUAL_ACCOUNT_FOLLOW_CREATE`  
**Summary:** Follow another user's virtual trading account to track their performance.  

Creates a follow relationship between the authenticated user and the target user. Once followed, the target account's performance becomes visible in the social feed.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `followedId` (integer, optional): 
- `type` (string, optional): 

**Responses:**

- `201`: Account followed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/admin/event`

**ID:** `VIRTUAL_ADMIN_EVENT_CREATE`  
**Summary:** Create a new virtual trading event (admin only).  

Creates a corporate action event record (dividend, stock split, etc.) that will be applied to virtual account positions on the effective date.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `code` (string, optional): 
- `type` (string, optional): 
- `note` (string, optional): 
- `ratio` (number, optional): 
- `effectiveDate` (string, optional): 
- `price` (number, optional): 
- `eventGroup` (string, optional): 
- `numberOfShares` (integer, optional): 
- `expiredDate` (string, optional): 
- `actualDate` (string, optional): 
- `locale` (string, optional): 

**Responses:**

- `201`: Event created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/admin/event-adjust`

**ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_CREATE`  
**Summary:** Create a new event adjustment ratio entry (admin only).  

Creates a ratio adjustment record for a corporate action event. The ratio is used to scale virtual account positions on the event effective date.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `code` (string, optional): 
- `basicPrice` (number, optional): 
- `totalAdjustRate` (number, optional): 

**Responses:**

- `201`: Adjustment created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/contests`

**ID:** `VIRTUAL_CONTESTS_CREATE`  
**Summary:** Create a new virtual trading contest (admin only).  

Creates a new virtual trading contest with the specified configuration including name, initial balance, ranking conditions, and participation rules.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `createdBy` (string, optional): 
- `organizationId` (string, optional): 
- `contestName` (string, optional): 
- `startAt` (string, optional): 
- `endAt` (string, optional): 
- `lastJoinAbleAt` (string, optional): 
- `requireNewSub` (boolean, optional): 
- `initialBalance` (number, optional): 
- `conditions` (string, optional): 
- `rankingInPeriods` (string, optional): 
- `description` (string, optional): 

**Responses:**

- `201`: Contest created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/contests/search`

**ID:** `VIRTUAL_CONTESTS_LIST`  
**Summary:** Search contests with filters.  

Returns a paginated list of virtual trading contests matching the specified filters including organization, status, and keyword.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `organizationId` (string, optional): 
- `contestStatus` (string, optional): 
- `pageNum` (integer, optional): 
- `pageSize` (integer, optional): 

**Responses:**

- `200`: Contest search results
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/contests/{contestId}/join`

**ID:** `VIRTUAL_CONTESTS_JOIN`  
**Summary:** Join a virtual trading contest.  

Enrolls the authenticated user in the specified contest using the given sub-account. A new sub-account portfolio may be created if required by the contest.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID to join

**Request Body:**

- `contestId` (integer, optional): 

**Responses:**

- `200`: Contest joined
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/contests/{contestId}/registrations`

**ID:** `VIRTUAL_CONTESTS_BOOK`  
**Summary:** Pre-register (book) a spot in an upcoming contest.  

Allows a user to reserve a spot in a contest before it opens for active participation. Booked registrations are automatically activated when the contest starts.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID

**Request Body:**

- `contestId` (integer, optional): 

**Responses:**

- `200`: Contest registration confirmed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/equity/orders`

**ID:** `VIRTUAL_EQUITY_ORDER_CREATE`  
**Summary:** Place a limit buy or sell order on the virtual trading account.  

Places a virtual equity order. Supports BUY and SELL sides. The order is matched against simulated market data using the virtual exchange engine.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `subAccount` (string, optional): 
- `code` (string, optional): 
- `quantity` (number, optional): 
- `price` (number, optional): 
- `orderCommand` (string, optional): 
- `orderId` (integer, optional): 
- `action` (string, optional): 

**Responses:**

- `201`: Order placed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/equity/orders/cancellations`

**ID:** `VIRTUAL_EQUITY_ORDER_CANCEL_MULTI`  
**Summary:** Cancel multiple pending limit orders in a single request.  

Bulk-cancels a list of unmatched limit orders. Orders already matched or cancelled are silently skipped.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `orderIds` (array, optional): 

**Responses:**

- `200`: Orders cancelled
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/equity/orders/stop-limit`

**ID:** `VIRTUAL_EQUITY_STOP_LIMIT_ORDER_CREATE`  
**Summary:** Place a stop-limit order (limit order triggered when price condition is met).  

Places a virtual stop-limit order. When the stock price reaches stopPrice, a limit order at limitPrice is automatically submitted.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `orderId` (integer, optional): 
- `subAccount` (string, optional): 
- `stockCode` (string, optional): 
- `sellBuyType` (string, optional): 
- `stopPrice` (number, optional): 
- `limitPrice` (number, optional): 
- `orderQuantity` (number, optional): 
- `fromDate` (string, optional): 
- `toDate` (string, optional): 

**Responses:**

- `200`: Stop-limit order placed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/equity/stop-orders`

**ID:** `VIRTUAL_EQUITY_STOP_ORDER_CREATE`  
**Summary:** Place a stop order (market order triggered when price condition is met).  

Places a virtual stop order that activates when the stock price reaches the specified stop price. Supports UP and DOWN trigger directions.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `toDate` (string, optional): 
- `fromDate` (string, optional): 
- `orderType` (string, optional): 
- `stockCode` (string, optional): 
- `subAccount` (string, optional): 
- `stopPrice` (number, optional): 
- `orderPrice` (number, optional): 
- `sellBuyType` (string, optional): 
- `orderQuantity` (integer, optional): 
- `securitiesType` (string, optional): 

**Responses:**

- `201`: Stop order placed
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/portfolios`

**ID:** `VIRTUAL_PORTFOLIO_CREATE`  
**Summary:** Create a new virtual trading portfolio for the authenticated user.  

Creates a named virtual trading portfolio associated with a sub-account. The portfolio is initialized with the specified quota balance.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `subAccount` (string, optional): 
- `name` (string, optional): 
- `quota` (number, optional): 

**Responses:**

- `201`: Portfolio created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/virtual/recommended-accounts`

**ID:** `VIRTUAL_RECOMMENDED_ACCOUNTS_CREATE`  
**Summary:** Save a list of recommended virtual trading accounts.  

Stores a curated list of recommended virtual trading accounts for display to users in the discovery feed. Admin-only operation.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `recommendedAccounts` (array, optional): 

**Responses:**

- `200`: Recommended accounts saved
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/accounts/follows/{followId}`

**ID:** `VIRTUAL_ACCOUNT_FOLLOW_UPDATE`  
**Summary:** Update the status or settings of an existing follow relationship.  

Updates the follow relationship identified by followId. Can be used to mute or restore notifications from a followed account.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `followId` (integer) (required): Follow relationship ID

**Request Body:**

- `followedId` (integer, optional): 
- `type` (string, optional): 

**Responses:**

- `200`: Follow updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/admin/event`

**ID:** `VIRTUAL_ADMIN_EVENT_UPDATE`  
**Summary:** Update a virtual trading event (admin only).  

Updates the disclosure date of an existing corporate action event record.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `id` (string, optional): 
- `disclosureDate` (string, optional): 

**Responses:**

- `200`: Event updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/admin/event-adjust`

**ID:** `VIRTUAL_ADMIN_EVENT_ADJUST_UPDATE`  
**Summary:** Update an event adjustment ratio (admin only).  

Updates the basic price and total adjust rate for an existing event adjustment ratio record identified by its numeric ID.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `id` (integer, optional): 
- `code` (string, optional): 
- `basicPrice` (number, optional): 
- `totalAdjustRate` (number, optional): 

**Responses:**

- `200`: Adjustment updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/admin/limited-stock`

**ID:** `VIRTUAL_ADMIN_LIMITED_STOCK_UPDATE`  
**Summary:** Update the trading restriction configuration for a stock (admin only).  

Sets or clears the trading restriction flag for one or more stocks in the virtual trading engine.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `limitedStockCodes` (array, optional): 

**Responses:**

- `200`: Limited stock configuration updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/admin/settlements/cash`

**ID:** `VIRTUAL_ADMIN_SETTLEMENT_CASH_RESETTLE`  
**Summary:** Trigger a cash re-settlement for a date (admin only).  

Re-runs the cash settlement process for the specified settlement date. Used to correct settlement errors or reprocess failed settlement jobs.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `settlementDate` (string, optional): 

**Responses:**

- `200`: Cash re-settlement triggered
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/admin/settlements/quantity`

**ID:** `VIRTUAL_ADMIN_SETTLEMENT_QUANTITY_RESETTLE`  
**Summary:** Trigger a quantity re-settlement for a date (admin only).  

Re-runs the stock quantity settlement process for the specified settlement date. Used to correct settlement errors or reprocess failed settlement jobs.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `settlementDate` (string, optional): 

**Responses:**

- `200`: Quantity re-settlement triggered
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/contests/{contestId}`

**ID:** `VIRTUAL_CONTESTS_EDIT`  
**Summary:** Update the configuration of an existing virtual trading contest (admin only).  

Updates an existing virtual trading contest configuration including name, initial balance, ranking conditions, stock blacklist, and participation rules. The contest must not have started.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): ID of the contest to update

**Request Body:**

- `updatedBy` (string, optional): 
- `contestId` (integer, optional): 
- `contestName` (string, optional): 
- `startAt` (string, optional): 
- `endAt` (string, optional): 
- `lastJoinAbleAt` (string, optional): 
- `rankingConditions` (string, optional): 
- `requireNewSub` (boolean, optional): 
- `initialBalance` (number, optional): 
- `stockBlacklist` (string, optional): 
- `description` (string, optional): 

**Responses:**

- `200`: Contest updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/equity/orders/stop-limit`

**ID:** `VIRTUAL_EQUITY_ORDER_STOP_LIMIT_UPDATE`  
**Summary:** Modify a pending stop-limit order.  

Updates the stop price, limit price, quantity, or validity period of an active stop-limit order. Only orders in PENDING status can be modified.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `orderId` (integer, optional): 
- `subAccount` (string, optional): 
- `stockCode` (string, optional): 
- `sellBuyType` (string, optional): 
- `stopPrice` (number, optional): 
- `limitPrice` (number, optional): 
- `orderQuantity` (number, optional): 
- `fromDate` (string, optional): 
- `toDate` (string, optional): 

**Responses:**

- `200`: Stop-limit order modified
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/equity/orders/{orderId}`

**ID:** `VIRTUAL_EQUITY_ORDER_UPDATE`  
**Summary:** Modify a pending limit order.  

Updates the price and/or quantity of an unmatched limit order. Only orders in PENDING status can be modified.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `orderId` (integer) (required): ID of the order to modify

**Request Body:**

- `orderId` (integer, optional): 
- `newPrice` (number, optional): 
- `newQuantity` (number, optional): 

**Responses:**

- `200`: Order modified
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/equity/stop-orders/{orderId}`

**ID:** `VIRTUAL_EQUITY_STOP_ORDER_UPDATE`  
**Summary:** Modify a pending stop order.  

Updates the stop price, order quantity, or validity period of an active stop order. Only orders in PENDING status can be modified.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `orderId` (integer) (required): Stop order ID to modify

**Request Body:**

- `stopOrderId` (integer, optional): 
- `newStopPrice` (number, optional): 
- `newOrderQuantity` (integer, optional): 
- `newFromDate` (string, optional): 
- `newToDate` (string, optional): 

**Responses:**

- `200`: Stop order modified
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `422`: Unprocessable entity — business rule violation
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/portfolios/{portfolioId}`

**ID:** `VIRTUAL_PORTFOLIO_UPDATE`  
**Summary:** Update an existing virtual trading portfolio.  

Updates the name of an existing virtual trading portfolio identified by its portfolio ID.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `portfolioId` (string) (required): Sub-account identifier of the portfolio to update

**Request Body:**

- `subAccount` (string, optional): 
- `name` (string, optional): 
- `quota` (number, optional): 

**Responses:**

- `200`: Portfolio updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/search/account/history/{id}`

**ID:** `VIRTUAL_SEARCH_ACCOUNT_HISTORY_UPDATE`  
**Summary:** Update an account search history record.  

Updates the viewed user ID associated with an account search history record identified by id.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Account search history record ID

**Request Body:**

- `viewedUserId` (integer, optional): 

**Responses:**

- `200`: Account search history updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/search/history/{id}`

**ID:** `VIRTUAL_SEARCH_HISTORY_UPDATE`  
**Summary:** Update a stock search history record.  

Updates the stock code associated with a search history record identified by id.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Search history record ID

**Request Body:**

- `code` (string, optional): 

**Responses:**

- `200`: Search history updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/virtual/search/view-count`

**ID:** `VIRTUAL_SEARCH_VIEW_COUNT_INCREMENT`  
**Summary:** Increment the view count for a virtual account or stock search.  

Records a search view event for the given stock code, incrementing its search frequency counter used by the search ranking endpoint.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `code` (string, optional): 

**Responses:**

- `200`: View count updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

---

## Live Trading

**Summary:** Real-money trading leaderboard, contest management, profit/loss analytics, and NHSV trading actions

### `DELETE /api/v1/live/contests/{contestId}`

**ID:** `LIVE_CONTESTS_DELETE`  
**Summary:** Delete a real-trading contest.  

Permanently removes the specified contest. Returns 404 if not found or 409 if the contest has already started.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID
- `organizationId` (string) (required): Organization ID that owns the contest

**Responses:**

- `204`: Contest deleted — no body
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found — contest not found
- `409`: Conflict — contest has already started
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/live/contests/{contestId}/bookings`

**ID:** `LIVE_CONTESTS_CANCEL_BOOKING`  
**Summary:** Cancel a contest booking.  

Removes the authenticated user's booking for the specified contest before it starts. Returns 404 if no booking exists.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID

**Responses:**

- `204`: Booking cancelled
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — no booking found for this contest
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/contests`

**ID:** `LIVE_CONTESTS`  
**Summary:** List contests the authenticated user has joined.  

Returns all active and upcoming contests that the user is enrolled in.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Joined contests returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/contests/bookings`

**ID:** `LIVE_CONTESTS_BOOKED`  
**Summary:** List booked (pending-start) contests for the authenticated user.  

Returns contests the user has booked but not yet joined, filtered by partnerId.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Booked contests returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/contests/listed`

**ID:** `LIVE_CONTESTS_LISTED`  
**Summary:** List contests the authenticated user has not yet joined.  

Returns open or upcoming contests available for the user to join, filtered by status.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Available contests returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/contests/{contestId}/current-ranking`

**ID:** `LIVE_CONTESTS_CURRENT_RANKING`  
**Summary:** Get the authenticated user's current position in a contest ranking.  

Returns the user's rank, P&L rate, and period for the specified contest.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID

**Responses:**

- `200`: Current ranking returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — contest not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/contests/{contestId}/ranking`

**ID:** `LIVE_CONTESTS_RANKING`  
**Summary:** Get ranking for a live-trading contest.  

Returns the leaderboard for the specified contest, paginated. Supports period filtering.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID

**Responses:**

- `200`: Contest ranking returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — contest not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/leaderboard/investing`

**ID:** `LIVE_LEADERBOARD_INVESTING`  
**Summary:** Get leaderboard rankings for live investing.  

Returns a paginated leaderboard of top live investors ranked by P&L rate for the given period.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Investing leaderboard returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/leaderboard/investing/user-ranking`

**ID:** `LIVE_LEADERBOARD_INVESTING_USER_RANKING`  
**Summary:** Get the authenticated user's rank on the live investing leaderboard.  

Returns the user's current rank, P&L rate, and period on the live investing leaderboard.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: User's investing rank returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/leaderboard/settings`

**ID:** `LIVE_LEADERBOARD_SETTINGS`  
**Summary:** Get the authenticated user's leaderboard participation settings.  

Returns the user's current opt-in status and selected sub-account for the live leaderboard.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Settings returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/portfolio/accumulative-profit-loss`

**ID:** `LIVE_ACCUMULATIVE_PROFIT_LOSS`  
**Summary:** Get accumulative P&L for the user's NHSV live portfolio over a date range.  

Returns the sum of realized P&L across all sub-accounts for the requested period.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `subAccount` (string) (required): 
- `fromDate` (string) (required): 
- `toDate` (string) (required): 

**Responses:**

- `200`: Accumulative P&L returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/portfolio/daily-profit-loss`

**ID:** `LIVE_DAILY_PROFIT_LOSS`  
**Summary:** Get daily P&L for the user's NHSV live portfolio.  

Returns a paginated list of daily profit-and-loss entries for the specified account and date range.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Daily P&L returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/portfolio/following-acc-profit-loss`

**ID:** `LIVE_FOLLOWING_ACCUMULATIVE_PROFIT_LOSS`  
**Summary:** Get accumulative P&L for a followed user's NHSV live portfolio over a date range.  

Returns the summed realized P&L for a followed user across the specified period.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `followingUserId` (integer) (required): 
- `fromDate` (string) (required): 
- `toDate` (string) (required): 

**Responses:**

- `200`: Following user's accumulative P&L returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/portfolio/following-daily-profit-loss`

**ID:** `LIVE_FOLLOWING_DAILY_PROFIT_LOSS`  
**Summary:** Get daily P&L for a followed user's NHSV live portfolio.  

Returns paginated daily P&L entries for another user that the caller is following.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Following user's daily P&L returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/portfolio/following-profit-loss`

**ID:** `LIVE_FOLLOWING_PROFIT_LOSS`  
**Summary:** Get cumulative P&L for a followed user's NHSV live portfolio.  

Returns the overall realized P&L for a user that the caller is following.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Following user's P&L returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/portfolio/profit-loss`

**ID:** `LIVE_PROFIT_LOSS`  
**Summary:** Get cumulative P&L for the user's NHSV live portfolio.  

Returns the overall realized and unrealized profit-and-loss for the specified NHSV account.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: P&L returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/statistics/most-bought-stocks`

**ID:** `LIVE_MOST_BOUGHT_STOCKS`  
**Summary:** Get most-bought stocks on the live trading platform.  

Returns a ranked list of stock symbols bought most frequently by live traders in the given period.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Most-bought stocks returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/statistics/most-searched-stocks`

**ID:** `LIVE_MOST_SEARCHED_STOCKS`  
**Summary:** Get most-searched stocks on the live trading platform.  

Returns a ranked list of stock symbols searched most frequently by live traders in the given period.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Most-searched stocks returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/statistics/most-sold-stocks`

**ID:** `LIVE_MOST_SOLD_STOCKS`  
**Summary:** Get most-sold stocks on the live trading platform.  

Returns a ranked list of stock symbols sold most frequently by live traders in the given period.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Most-sold stocks returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/contests`

**ID:** `LIVE_ORG_CONTESTS`  
**Summary:** List contests joined by an organization member.  

Returns all active and upcoming contests that users in the organization are enrolled in.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Responses:**

- `200`: Joined contests returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/contests/bookings`

**ID:** `LIVE_ORG_CONTESTS_BOOKED`  
**Summary:** List booked contests for an organization member.  

Returns contests that the organization's users have booked but not yet joined.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Responses:**

- `200`: Booked contests returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/contests/expired`

**ID:** `LIVE_ORG_CONTESTS_EXPIRED`  
**Summary:** List expired contests for an organization member.  

Returns past contests that have ended, paginated and sortable by date.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Responses:**

- `200`: Expired contests returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/contests/listed`

**ID:** `LIVE_ORG_CONTESTS_LISTED`  
**Summary:** List contests not yet joined by an organization member.  

Returns open or upcoming contests available for the organization's users to join.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Responses:**

- `200`: Available contests returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/contests/{contestId}/current-ranking`

**ID:** `LIVE_ORG_CONTESTS_CURRENT_RANKING`  
**Summary:** Get the current ranking position in an organization contest.  

Returns the authenticated user's current rank and P&L rate in the organization contest.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID
- `contestId` (integer) (required): Contest ID

**Responses:**

- `200`: Current ranking returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — contest not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/contests/{contestId}/ranking`

**ID:** `LIVE_ORG_CONTESTS_RANKING`  
**Summary:** Get ranking for an organization contest.  

Returns the leaderboard for a contest within the organization, paginated and period-filtered.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID
- `contestId` (integer) (required): Contest ID

**Responses:**

- `200`: Contest ranking returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — contest not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/contests/{contestId}/ranking-history`

**ID:** `LIVE_ORG_CONTESTS_RANKING_HISTORY`  
**Summary:** Get ranking history for an organization contest.  

Returns historical leaderboard snapshots for the contest, paginated by date.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID
- `contestId` (integer) (required): Contest ID

**Responses:**

- `200`: Ranking history returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — contest not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/following-daily-profit-loss`

**ID:** `LIVE_ORG_FOLLOWING_DAILY_PROFIT_LOSS`  
**Summary:** Get daily P&L for a followed user within an organization context.  

Returns paginated daily P&L entries for a followed user, scoped to the given organization.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Responses:**

- `200`: Following user's daily P&L returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/following-profit-loss`

**ID:** `LIVE_ORG_FOLLOWING_PROFIT_LOSS`  
**Summary:** Get cumulative P&L for a followed user within an organization context.  

Returns the overall realized P&L for a followed user, scoped to the given organization.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Responses:**

- `200`: Following user's cumulative P&L returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/leaderboard/investing`

**ID:** `LIVE_ORG_LEADERBOARD_INVESTING`  
**Summary:** Get investing leaderboard for an organization.  

Returns a paginated leaderboard of the top live investors within the specified organization.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Responses:**

- `200`: Organisation investing leaderboard returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — organisation not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/leaderboard/investing/user-ranking`

**ID:** `LIVE_ORG_LEADERBOARD_INVESTING_USER_RANKING`  
**Summary:** Get the user's rank on the organization investing leaderboard.  

Returns the authenticated user's rank and P&L rate within the organization's leaderboard.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Responses:**

- `200`: User's organisation investing rank returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — organisation not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/live/{organizationId}/leaderboard/settings`

**ID:** `LIVE_ORG_LEADERBOARD_SETTINGS`  
**Summary:** Get leaderboard participation settings for an organization member.  

Returns the leaderboard opt-in status and sub-account selection for the user within the organization.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Responses:**

- `200`: Organisation leaderboard settings returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — organisation not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/live/contests`

**ID:** `LIVE_CONTESTS_CREATE`  
**Summary:** Create a new real-trading contest.  

Creates a new contest with the supplied configuration. Returns 409 if a contest with the same name already exists in the organization. On success, returns 201 Created with a Location header pointing to the new contest.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `createdBy` (string, optional): 
- `organizationId` (string, optional): 
- `contestName` (string, optional): 
- `startAt` (string, optional): 
- `endAt` (string, optional): 
- `lastJoinAbleAt` (string, optional): 
- `conditions` (string, optional): 
- `rankingInPeriods` (string, optional): 
- `description` (string, optional): 

**Responses:**

- `201`: Contest created — Location: /api/v1/live/contests/{id}
- `400`: Bad request — invalid date range or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `409`: Conflict — a contest with this name already exists in the organization
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/live/contests/list`

**ID:** `LIVE_CONTESTS_LIST`  
**Summary:** List real-trading contests with optional filters.  

Returns a paginated list of contests filtered by partner, organization, or status.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `partnerId` (string, optional): 
- `organizationId` (string, optional): 
- `contestStatus` (string, optional): 

**Responses:**

- `200`: Contest list returned
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/live/contests/{contestId}/bookings`

**ID:** `LIVE_CONTESTS_BOOK`  
**Summary:** Book a slot in a real-trading contest.  

Reserves a participation slot for the authenticated user in the specified contest. Returns 409 if the user has already booked or if the contest is full.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID

**Request Body:**

- `contestId` (integer, optional): 

**Responses:**

- `200`: Booking created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `409`: Conflict — user has already booked or contest is full
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/live/contests/{contestId}/join`

**ID:** `LIVE_CONTESTS_JOIN`  
**Summary:** Join a real-trading contest.  

Enrolls the authenticated user into the specified contest. Requires a prior booking. Returns 409 if already joined or 404 if no booking found.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): Contest ID

**Request Body:**

- `contestId` (integer, optional): 
- `partnerId` (string, optional): 
- `partnerUsername` (string, optional): 

**Responses:**

- `200`: Contest joined
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — booking not found
- `409`: Conflict — user has already joined
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/live/{organizationId}/contests/{contestId}/bookings`

**ID:** `LIVE_ORG_CONTESTS_BOOK`  
**Summary:** Book a contest slot on behalf of an organization member.  

Reserves a participation slot in the specified contest for a user within the organization.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID
- `contestId` (integer) (required): Contest ID

**Request Body:**

- `contestId` (integer, optional): 
- `organizationId` (string, optional): 

**Responses:**

- `200`: Booking created
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `409`: Conflict — already booked or contest is full
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/live/{organizationId}/contests/{contestId}/join`

**ID:** `LIVE_ORG_CONTESTS_JOIN`  
**Summary:** Join a contest on behalf of an organization member.  

Enrolls a user from the specified organization into the contest. Requires a prior booking.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID
- `contestId` (integer) (required): Contest ID

**Request Body:**

- `organizationId` (string, optional): 
- `contestId` (integer, optional): 
- `username` (string, optional): 

**Responses:**

- `200`: Contest joined
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — booking not found
- `409`: Conflict — user has already joined
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/live/contests/{contestId}`

**ID:** `LIVE_CONTESTS_UPDATE`  
**Summary:** Update metadata of an existing real-trading contest.  

Modifies contest metadata (name, dates, conditions) for an existing contest. The contestId is taken from the path. Returns 404 if the contest does not exist.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `contestId` (integer) (required): 

**Request Body:**

- `updatedBy` (string, optional): 
- `contestId` (integer, optional): 
- `contestName` (string, optional): 
- `startAt` (string, optional): 
- `endAt` (string, optional): 
- `lastJoinAbleAt` (string, optional): 
- `rankingConditions` (string, optional): 
- `description` (string, optional): 

**Responses:**

- `200`: Contest updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden — insufficient permissions
- `404`: Not found — contest not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/live/leaderboard/settings`

**ID:** `LIVE_LEADERBOARD_SETTINGS_UPDATE`  
**Summary:** Update the authenticated user's leaderboard participation settings.  

Sets whether the user opts into the public leaderboard and which sub-account is used for ranking.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `partnerId` (string, optional): 
- `optBoard` (boolean, optional): 
- `subAccount` (string, optional): 

**Responses:**

- `200`: Settings updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/live/statistics/search/increase`

**ID:** `LIVE_SEARCH_INCREASE`  
**Summary:** Increment search count for a stock symbol.  

Records a search event for the specified stock code to drive most-searched stock rankings.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `partnerId` (string, optional): 
- `code` (string, optional): 

**Responses:**

- `200`: Search count incremented
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/live/{organizationId}/leaderboard/settings`

**ID:** `LIVE_ORG_LEADERBOARD_SETTINGS_UPDATE`  
**Summary:** Update leaderboard participation settings for an organization member.  

Sets opt-in status and sub-account for the user's leaderboard entry within the organization.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `organizationId` (string) (required): Organisation ID

**Request Body:**

- `organizationId` (string, optional): 
- `optBoard` (boolean, optional): 
- `subAccount` (string, optional): 

**Responses:**

- `200`: Settings updated
- `400`: Bad request — invalid or missing parameters
- `401`: Unauthorized — missing or invalid JWT
- `403`: Forbidden
- `404`: Not found — organisation not found
- `429`: Too many requests
- `500`: Internal server error

---

## NHSV Equity

**Summary:** Live equity trading via NHSV — account inquiry, order management (normal/advanced/stop/odd-lot/basket), reports, rights, loans, withdrawals, and transfers

### `DELETE /api/v1/live/nhsv/equity/basket-orders`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDERS_DELETE`  
**Summary:** Delete a basket.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/common/current-time`

**ID:** `LIVE_NHSV_COMMON_CURRENT_TIME`  
**Summary:** Get the NHSV server's current time.  

Public endpoint — no authentication required. Used by clients to synchronise their local clock with the NHSV exchange time before placing orders.  

**Auth:** ✗ Not required  

**Responses:**

- `200`: OK — NHSV upstream response
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/common/services`

**ID:** `LIVE_NHSV_COMMON_SERVICES`  
**Summary:** Get the list of NHSV services and their availability status.  

Public endpoint — no authentication required. Used by clients to check which trading services are currently active (e.g. equity trading, derivatives trading, cash transfer).  

**Auth:** ✗ Not required  

**Responses:**

- `200`: OK — NHSV upstream response
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/asset-info`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_ASSET_INFO`  
**Summary:** Get total asset breakdown.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/banks`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_BANKS`  
**Summary:** Get linked bank accounts.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/buyable`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_BUYABLE`  
**Summary:** Get buyable quantity and purchasing power for a prospective order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `stockCode` (string) (required): Stock code to query buyable quantity for
- `orderPrice` (number) (required): Intended order price in VND
- `subNumber` (string) (optional): Sub-account number
- `securitiesType` (string) (optional): Securities type (e.g. "S" for stock, "CW" for covered warrant)
- `marketType` (string) (optional): Market type (e.g. "S" for HOSE, "H" for HNX)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/cash-balance`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_CASH_BALANCE`  
**Summary:** Get cash balance, margin, and deposits.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number
- `bankAccount` (string) (optional): Linked bank account number
- `bankCode` (string) (optional): Bank code

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/daily-profit`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_DAILY_PROFIT`  
**Summary:** Get daily P&L.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/loan-history`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_LOAN_HISTORY`  
**Summary:** Get loan history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/margin`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_MARGIN`  
**Summary:** Get margin ratio for a symbol.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `symbol` (string) (optional): Stock symbol to query margin for

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/mobile`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_MOBILE`  
**Summary:** Get account phone number.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/profile`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_PROFILE`  
**Summary:** Get account profile (email, address, phone).  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/profit-loss/history`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_PROFIT_LOSS_HISTORY`  
**Summary:** Get realized P&L history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/sellable`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_SELLABLE`  
**Summary:** Get sellable stock positions for an account.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number
- `stockCode` (string) (optional): Filter by stock code; returns all positions when omitted

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/stock-balance`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_STOCK_BALANCE`  
**Summary:** Get stock holdings.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/trading-summary`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_TRADING_SUMMARY`  
**Summary:** Get trading summary.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/account/transaction-history`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_TRANSACTION_HISTORY`  
**Summary:** Get transaction history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/basket-order/history`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_HISTORY`  
**Summary:** Get basket order history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/basket-order/order/history`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_ORDER_HISTORY`  
**Summary:** Get individual basket order history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `basketOrderId` (string) (optional): Filter by basket order ID

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/basket-order/symbols`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_SYMBOLS`  
**Summary:** List symbols in a basket.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `basketOrderId` (string) (required): Basket order ID to list symbols for

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/basket-orders`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDERS_LIST`  
**Summary:** List basket orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/loan/available`

**ID:** `LIVE_NHSV_EQUITY_LOAN_AVAILABLE`  
**Summary:** Get available loans.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/loan/banks`

**ID:** `LIVE_NHSV_EQUITY_LOAN_BANKS`  
**Summary:** Get available loan banks.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/loan/detail`

**ID:** `LIVE_NHSV_EQUITY_LOAN_DETAIL`  
**Summary:** Get loan detail.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `loanId` (string) (required): Loan ID to retrieve detail for

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/loan/history`

**ID:** `LIVE_NHSV_EQUITY_LOAN_HISTORY`  
**Summary:** Get loan history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/order/advance/history`

**ID:** `LIVE_NHSV_EQUITY_ORDER_ADVANCE_HISTORY`  
**Summary:** Get advance order history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/order/confirm`

**ID:** `LIVE_NHSV_EQUITY_ORDER_CONFIRM_LIST`  
**Summary:** Get order confirmations.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/order/oddlot/history`

**ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT_HISTORY`  
**Summary:** Get odd lot order history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/order/oddlot/sellable`

**ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT_SELLABLE`  
**Summary:** Get odd lot sellable quantity.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/order/oddlot/today-unmatch`

**ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT_TODAY_UNMATCH`  
**Summary:** Get today's unmatched odd lot orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/order/today-unmatch`

**ID:** `LIVE_NHSV_EQUITY_ORDER_TODAY_UNMATCH`  
**Summary:** Get today's unmatched equity orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `subNumber` (string) (optional): Sub-account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/rights/available`

**ID:** `LIVE_NHSV_EQUITY_RIGHTS_AVAILABLE`  
**Summary:** Get available rights.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/rights/detail`

**ID:** `LIVE_NHSV_EQUITY_RIGHTS_DETAIL`  
**Summary:** Get right details.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `rightsId` (string) (required): Rights subscription ID

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/rights/history`

**ID:** `LIVE_NHSV_EQUITY_RIGHTS_HISTORY`  
**Summary:** Get rights history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/transfer/cash/account`

**ID:** `LIVE_NHSV_EQUITY_TRANSFER_CASH_ACCOUNT`  
**Summary:** Get transfer accounts.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/transfer/cash/history`

**ID:** `LIVE_NHSV_EQUITY_TRANSFER_CASH_HISTORY`  
**Summary:** Get cash transfer history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/transfer/stock/balance`

**ID:** `LIVE_NHSV_EQUITY_TRANSFER_STOCK_BALANCE`  
**Summary:** Get transferable stock balance.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/transfer/stock/history`

**ID:** `LIVE_NHSV_EQUITY_TRANSFER_STOCK_HISTORY`  
**Summary:** Get stock transfer history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/withdraw/banks`

**ID:** `LIVE_NHSV_EQUITY_WITHDRAW_BANKS`  
**Summary:** Get withdrawal bank accounts.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/equity/withdraw/history`

**ID:** `LIVE_NHSV_EQUITY_WITHDRAW_HISTORY`  
**Summary:** Get withdrawal history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/user/username`

**ID:** `LIVE_NHSV_USER_USERNAME`  
**Summary:** Check whether a username is already registered at NHSV.  

Pre-login endpoint — no Paave JWT required. Callers are anonymous (username lookups during account creation). Gateway must enforce per-IP rate limiting (max 10 req/min).  

**Auth:** ✗ Not required  

**Parameters:**

- `username` (string) (required): NHSV username to check

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — missing or invalid username
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/basket-orders`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDERS_CREATE`  
**Summary:** Create a basket order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/basket-orders/submission`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDERS_SUBMISSION`  
**Summary:** Submit a basket order for execution.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent mutation
- `X-OTP` (string) (required): NHSV 2FA one-time password for order submission

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/loan/register`

**ID:** `LIVE_NHSV_EQUITY_LOAN_REGISTER`  
**Summary:** Register a loan.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/order/advance`

**ID:** `LIVE_NHSV_EQUITY_ORDER_ADVANCE`  
**Summary:** Place an advance order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation
- `X-OTP` (string) (required): NHSV 2FA one-time password for order submission

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `409`: Conflict — idempotent request already in progress for this key; retry later
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/order/confirm`

**ID:** `LIVE_NHSV_EQUITY_ORDER_CONFIRM_EXECUTE`  
**Summary:** Confirm equity orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `409`: Conflict — idempotent request already in progress for this key; retry later
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/order/oddlot`

**ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT`  
**Summary:** Place an odd lot order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation
- `X-OTP` (string) (required): NHSV 2FA one-time password for order submission

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/rights/register`

**ID:** `LIVE_NHSV_EQUITY_RIGHTS_REGISTER`  
**Summary:** Register a right.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/transfer/cash`

**ID:** `LIVE_NHSV_EQUITY_TRANSFER_CASH_EXECUTE`  
**Summary:** Transfer cash.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/transfer/stock`

**ID:** `LIVE_NHSV_EQUITY_TRANSFER_STOCK`  
**Summary:** Transfer stock.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/equity/withdraw/request`

**ID:** `LIVE_NHSV_EQUITY_WITHDRAW_REQUEST`  
**Summary:** Request a withdrawal.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/user/push-tokens`

**ID:** `LIVE_NHSV_USER_PUSH_TOKENS`  
**Summary:** Register a push notification token for the authenticated user's device.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — missing token or unsupported platform
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/account/change-htspassword`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_CHANGE_HTSPASSWORD`  
**Summary:** Change HTS password (alias).  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/account/change-password`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_CHANGE_PASSWORD`  
**Summary:** Change the HTS trading password for the linked NHSV equity account.  

Routes to NHSV /api/v1/equity/account/changePassword — this is the HTS trading password required for order submission on the NHSV equity platform. This is NOT the same as user/change-password, which routes to NHSV /api/v1/user/changePassword (the platform login password for authenticating with NHSV services).  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/account/change-pin`

**ID:** `LIVE_NHSV_EQUITY_ACCOUNT_CHANGE_PIN`  
**Summary:** Change order PIN.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/basket-order/cancel`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_CANCEL`  
**Summary:** Cancel a basket.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/basket-order/order/cancel`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_ORDER_CANCEL`  
**Summary:** Cancel a basket order.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/basket-order/order/modify`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_ORDER_MODIFY`  
**Summary:** Modify a basket order.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/basket-order/symbols/update`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_SYMBOLS_UPDATE`  
**Summary:** Update basket symbols.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/basket-order/update`

**ID:** `LIVE_NHSV_EQUITY_BASKET_ORDER_UPDATE`  
**Summary:** Update a basket.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/order/advance/cancel`

**ID:** `LIVE_NHSV_EQUITY_ORDER_ADVANCE_CANCEL`  
**Summary:** Cancel an advance order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/order/cancel`

**ID:** `LIVE_NHSV_EQUITY_ORDER_CANCEL`  
**Summary:** Cancel an equity order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `409`: Conflict — idempotent request already in progress for this key; retry later
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/order/cancel/all`

**ID:** `LIVE_NHSV_EQUITY_ORDER_CANCEL_ALL`  
**Summary:** Cancel all equity orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/order/modify`

**ID:** `LIVE_NHSV_EQUITY_ORDER_MODIFY`  
**Summary:** Modify an equity order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `409`: Conflict — idempotent request already in progress for this key; retry later
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/order/modify/all`

**ID:** `LIVE_NHSV_EQUITY_ORDER_MODIFY_ALL`  
**Summary:** Modify all equity orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/order/oddlot/cancel`

**ID:** `LIVE_NHSV_EQUITY_ORDER_ODDLOT_CANCEL`  
**Summary:** Cancel an odd lot order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/order/stop/cancel/all`

**ID:** `LIVE_NHSV_EQUITY_ORDER_STOP_CANCEL_ALL`  
**Summary:** Cancel all stop orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/rights/cancel`

**ID:** `LIVE_NHSV_EQUITY_RIGHTS_CANCEL`  
**Summary:** Cancel a right.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/transfer/cash/cancel`

**ID:** `LIVE_NHSV_EQUITY_TRANSFER_CASH_CANCEL`  
**Summary:** Cancel a cash transfer.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/equity/withdraw/cancel`

**ID:** `LIVE_NHSV_EQUITY_WITHDRAW_CANCEL`  
**Summary:** Cancel a withdrawal.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/user/change-password`

**ID:** `LIVE_NHSV_USER_CHANGE_PASSWORD`  
**Summary:** Change the NHSV platform login password for the authenticated user.  

Routes to NHSV /api/v1/user/changePassword — this is the platform authentication password used to log in to NHSV services. This is NOT the same as account/change-password, which routes to NHSV /api/v1/equity/account/changePassword (the HTS trading password for order submission).  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/user/update-profile`

**ID:** `LIVE_NHSV_USER_UPDATE_PROFILE`  
**Summary:** Update the linked NHSV user profile (email, phone, address).  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

---

## NHSV Derivatives

**Summary:** Live derivatives trading via NHSV — account inquiry, futures orders, stop orders, position history, and cash/IM transfers

### `GET /api/v1/live/nhsv/derivatives/account/balance`

**ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_BALANCE`  
**Summary:** Get derivatives account balance.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/account/equity`

**ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_EQUITY`  
**Summary:** Get derivatives account equity info.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/account/open-position`

**ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_OPEN_POSITION`  
**Summary:** Get open positions.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/account/profit-loss`

**ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_PROFIT_LOSS`  
**Summary:** Get derivatives P&L.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `tradingDate` (string) (optional): Trading date (ISO 8601, e.g. 2026-03-27)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/account/profit-loss/cumulative`

**ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_PROFIT_LOSS_CUMULATIVE`  
**Summary:** Get cumulative derivatives P&L.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/account/risk-ratio`

**ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_RISK_RATIO`  
**Summary:** Get risk ratio.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/account/summary`

**ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_SUMMARY`  
**Summary:** Get derivatives account summary.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/account/trading-limit`

**ID:** `LIVE_NHSV_DERIVATIVES_ACCOUNT_TRADING_LIMIT`  
**Summary:** Get trading limits.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/history/closed-position`

**ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_CLOSED_POSITION`  
**Summary:** Get closed position history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/history/margin-call`

**ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_MARGIN_CALL`  
**Summary:** Get margin call history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/history/position`

**ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_POSITION`  
**Summary:** Get position history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/history/settlement`

**ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_SETTLEMENT`  
**Summary:** Get settlement history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/history/trade`

**ID:** `LIVE_NHSV_DERIVATIVES_HISTORY_TRADE`  
**Summary:** Get trade history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/order/available`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_AVAILABLE`  
**Summary:** Get available derivatives quantity.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `symbol` (string) (optional): Filter by futures contract symbol

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/order/history`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_HISTORY`  
**Summary:** Get derivatives order history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/order/stop/history`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_HISTORY`  
**Summary:** Get derivatives stop order history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/order/today-unmatch`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_TODAY_UNMATCH`  
**Summary:** Get today's unmatched derivatives orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/order/unmatch-position`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_UNMATCH_POSITION`  
**Summary:** Get unmatched positions.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/transfer/cash`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_CASH_HISTORY`  
**Summary:** Get derivatives cash transfer history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/transfer/cash/withdraw`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_CASH_WITHDRAW_HISTORY`  
**Summary:** Get derivatives withdrawal history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/transfer/im/bank`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_BANK`  
**Summary:** Get IM transfer bank info.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `bankCode` (string) (optional): Filter by bank code

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/transfer/im/deposit`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_DEPOSIT_INFO`  
**Summary:** Get IM deposit info.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/transfer/im/fee`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_FEE`  
**Summary:** Get IM transfer fee.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/transfer/im/history`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_HISTORY`  
**Summary:** Get IM transfer history.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `GET /api/v1/live/nhsv/derivatives/transfer/im/withdraw`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_WITHDRAW_INFO`  
**Summary:** Get IM withdrawal info.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `accountNumber` (string) (required): Linked NHSV derivatives account number
- `fromDate` (string) (optional): Start date (ISO 8601, e.g. 2026-01-01)
- `toDate` (string) (optional): End date (ISO 8601, e.g. 2026-03-31)

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/derivatives/order`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER`  
**Summary:** Place a derivatives order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation
- `X-OTP` (string) (required): NHSV 2FA one-time password for order submission

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `409`: Conflict — idempotent request already in progress for this key; retry later
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/derivatives/order/stop`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP`  
**Summary:** Place a derivatives stop order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation
- `X-OTP` (string) (required): NHSV 2FA one-time password for order submission

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `409`: Conflict — idempotent request already in progress for this key; retry later
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/derivatives/transfer/cash`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_CASH_EXECUTE`  
**Summary:** Transfer derivatives cash.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/derivatives/transfer/cash/withdraw`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_CASH_WITHDRAW_EXECUTE`  
**Summary:** Withdraw derivatives cash.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/derivatives/transfer/im/deposit`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_DEPOSIT_SUBMIT`  
**Summary:** Submit IM deposit request.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `POST /api/v1/live/nhsv/derivatives/transfer/im/withdraw`

**ID:** `LIVE_NHSV_DERIVATIVES_TRANSFER_IM_WITHDRAW_SUBMIT`  
**Summary:** Submit IM withdrawal request.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/derivatives/order/cancel`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_CANCEL`  
**Summary:** Cancel a derivatives order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `409`: Conflict — idempotent request already in progress for this key; retry later
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/derivatives/order/cancel/all`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_CANCEL_ALL`  
**Summary:** Cancel all derivatives orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/derivatives/order/modify`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_MODIFY`  
**Summary:** Modify a derivatives order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `409`: Conflict — idempotent request already in progress for this key; retry later
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/derivatives/order/modify/all`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_MODIFY_ALL`  
**Summary:** Modify all derivatives orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/derivatives/order/stop/cancel`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_CANCEL`  
**Summary:** Cancel a derivatives stop order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/derivatives/order/stop/cancel/all`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_CANCEL_ALL`  
**Summary:** Cancel all derivatives stop orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/derivatives/order/stop/modify`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_MODIFY`  
**Summary:** Modify a derivatives stop order.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

### `PUT /api/v1/live/nhsv/derivatives/order/stop/modify/all`

**ID:** `LIVE_NHSV_DERIVATIVES_ORDER_STOP_MODIFY_ALL`  
**Summary:** Modify all derivatives stop orders.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `X-Idempotency-Key` (string) (required): Client-generated unique key for idempotent order mutation

**Responses:**

- `200`: OK — NHSV upstream response
- `400`: Bad Request — invalid parameters or missing required fields
- `401`: Unauthorized — invalid or expired credentials
- `403`: Forbidden — insufficient scope or account not linked
- `429`: Too many requests
- `500`: Internal server error
- `502`: Bad Gateway — NHSV upstream error
- `504`: Gateway Timeout — NHSV upstream did not respond in time

---

## App

**Summary:** Pre-login client app configuration — locale resources, FAQ, trading holidays, registered services, and CDN/presigned URLs

### `GET /api/v1/app/faq/{msName}`

**ID:** `APP_FAQ`  
**Summary:** List FAQ groups for a service.  

Returns FAQ groups and their items for the specified service name, filtered by the request locale (accept-language header). Each group contains a list of question/answer pairs.  

**Auth:** ✗ Not required  

**Parameters:**

- `msName` (string) (required): Service name (e.g. paave-fe-mobile)

**Responses:**

- `200`: FAQ groups returned
- `404`: Service not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/app/holidays`

**ID:** `APP_HOLIDAYS`  
**Summary:** List all trading holidays.  

Returns all calendar dates on which the Vietnamese stock exchanges are closed. Used by the trading services to skip order processing and settlement on holidays.  

**Auth:** ✗ Not required  

**Responses:**

- `200`: Trading holiday list returned
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/app/locale`

**ID:** `APP_LOCALE`  
**Summary:** Fetch locale resource file URLs for the public app.  

Returns locale resource metadata (namespace-to-CDN-URL mappings) for the requested service names and languages. Called by the frontend at app startup to initialise i18n translations.  

**Auth:** ✗ Not required  

**Parameters:**

- `msNames` (array) (optional): Service names to fetch locale for

**Responses:**

- `200`: Locale resource URLs returned
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/app/services`

**ID:** `APP_SERVICES`  
**Summary:** List all registered services.  

Returns metadata for all services registered in the system, including display name, support contact details, and logo URL. Used by the frontend to render the service directory.  

**Auth:** ✗ Not required  

**Responses:**

- `200`: Service list returned
- `429`: Too many requests
- `500`: Internal server error

---

## Administration

**Summary:** Admin and app configuration APIs — locale resources, FAQ, holidays, feature flags, AWS signing, event management, scope/scopeGroup CRUD, limited stock, dataview, menus, and virtual settlement operations

### `DELETE /api/v1/admin/clients/{id}`

**ID:** `ADMIN_CLIENT_DELETE`  
**Summary:** Delete (disable) an OAuth client (admin).  

Soft-deletes the OAuth client by setting its status to DISABLED. Existing sessions are not invalidated immediately; the gateway stops accepting new tokens for this client on the next sync.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): OAuth client record ID

**Responses:**

- `204`: OAuth client disabled
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Client not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/admin/locale/{namespaceId}/keys/{keyId}`

**ID:** `ADMIN_LOCALE_KEY_DELETE`  
**Summary:** Delete a locale translation key from a namespace (admin).  

Permanently removes the key and all its translations across all languages. This operation cannot be undone.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `namespaceId` (integer) (required): Namespace ID
- `keyId` (integer) (required): Key ID to delete

**Responses:**

- `204`: Locale key deleted
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Key not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/admin/login-methods/{id}`

**ID:** `ADMIN_LOGIN_METHOD_DELETE`  
**Summary:** Delete a login method (admin).  

Permanently removes the login method and detaches it from all clients. Clients currently assigned this login method will fall back to their remaining methods.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Login method ID

**Responses:**

- `204`: Login method deleted
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Login method not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/admin/open-api`

**ID:** `ADMIN_OPEN_API_DELETE`  
**Summary:** Delete OpenAPI spec entries by scope ID list (admin).  

Removes the specified OpenAPI operation records from the database. Used to clean up stale or retired endpoint entries.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `scopeIdList` (array) (required): Scope IDs to delete

**Responses:**

- `204`: OpenAPI entries deleted
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/admin/organizations`

**ID:** `DELETE_API_V1_ADMIN_ORGANIZATIONS`  
**Summary:** Delete an organization.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/admin/partners/{id}`

**ID:** `DELETE_API_V1_ADMIN_PARTNERS_ID`  
**Summary:** Delete a partner.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (string) (required): Partner ID

**Responses:**

- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/admin/scope-groups/{scopeGroupId}`

**ID:** `ADMIN_SCOPE_GROUP_DELETE`  
**Summary:** Delete an OAuth scope group (admin).  

Permanently removes the scope group and detaches it from all login methods. Deleted scope groups are removed from the gateway on the next sync cycle.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `scopeGroupId` (integer) (required): Scope group ID

**Responses:**

- `204`: OAuth scope group deleted
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Scope group not found
- `429`: Too many requests
- `500`: Internal server error

### `DELETE /api/v1/admin/scopes/{scopeId}`

**ID:** `ADMIN_SCOPE_DELETE`  
**Summary:** Delete an OAuth scope (admin).  

Permanently removes the scope and detaches it from all scope groups. Deleted scopes are removed from the gateway on the next sync cycle.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `scopeId` (integer) (required): Scope ID

**Responses:**

- `204`: OAuth scope deleted
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Scope not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/aws`

**ID:** `ADMIN_AWS_SIGNED_URL`  
**Summary:** Get a pre-signed upload URL for the file store.  

Returns a pre-signed S3 or Minio URL that allows the authenticated user to upload a file directly to the object store. Optionally scoped to a named service bucket.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `key` (string) (required): Object storage key path
- `serviceName` (string) (optional): Service name for bucket scoping

**Responses:**

- `200`: Presigned upload URL returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/clients`

**ID:** `ADMIN_CLIENTS_LIST`  
**Summary:** List OAuth clients (admin).  

Returns all registered OAuth clients, supporting pagination and optional domain filtering. Used by the admin console to manage application registrations.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `domain` (string) (optional): Service domain filter
- `fetchCount` (integer) (optional): Number of records to fetch
- `lastSequence` (integer) (optional): Pagination cursor
- `isFullData` (boolean) (optional): Include full login method details

**Responses:**

- `200`: OAuth client list returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/clients/{id}`

**ID:** `ADMIN_CLIENT_GET`  
**Summary:** Get an OAuth client by ID (admin).  

Returns the full details of a single OAuth client including its login methods. Used by the admin console to view and edit a specific client registration.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): OAuth client record ID

**Responses:**

- `200`: OAuth client details returned
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Client not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/common/dataview`

**ID:** `ADMIN_DATAVIEW_QUERY`  
**Summary:** Query a named data view (admin).  

Executes the configured data view identified by code and returns a paginated result set. Used by the admin console to display generic configurable tables.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `code` (string) (required): Data view code identifier
- `fetchCount` (integer) (optional): Number of records to fetch
- `lastSequence` (integer) (optional): Pagination cursor

**Responses:**

- `200`: Data view results returned
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/faq/{faqId}/review/{isUseful}`

**ID:** `ADMIN_FAQ_REVIEW_SUBMIT`  
**Summary:** Submit a helpfulness review for a FAQ item.  

Records whether the authenticated user found a specific FAQ answer useful. Each user may submit at most one review per FAQ item; a duplicate submission returns an error.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `faqId` (integer) (required): FAQ item ID
- `isUseful` (boolean) (required): Whether the FAQ was found useful

**Responses:**

- `200`: FAQ review recorded
- `400`: Duplicate review submission
- `401`: Unauthorized
- `403`: Forbidden
- `404`: FAQ not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/feature-flags`

**ID:** `ADMIN_FEATURE_FLAG_GET`  
**Summary:** Get the current value of a feature flag.  

Returns the value, type, and enabled state of the specified feature flag key. Values are served from a 30-second in-memory cache; stale entries are refreshed on the next request. Keys must match the pattern feature.* or db.*.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `key` (string) (required): Feature flag key (e.g. feature.VIRTUAL_TRADING)

**Responses:**

- `200`: Feature flag value returned
- `400`: Invalid flag key format
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Flag not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/feature-flags/all`

**ID:** `ADMIN_FEATURE_FLAGS_ALL`  
**Summary:** List all feature flags and their current values.  

Returns every registered feature flag with its key, current value, type, and enabled state. Used by the admin console to audit and manage the flag inventory.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: All feature flags returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/interest-info`

**ID:** `ADMIN_INTEREST_INFO_LIST`  
**Summary:** Retrieve current interest rate information.  

Returns the published interest rate data used by the trading services to calculate margin interest charges and loan costs for brokerage accounts.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Interest rate information returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/locale/internal`

**ID:** `ADMIN_LOCALE_INTERNAL_GET`  
**Summary:** Fetch locale resources with full file content for internal consumers.  

Returns locale resource files including their content fetched from the object store. Used by internal services that need to embed i18n strings at runtime without making additional CDN requests.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `msNames` (array) (optional): Service names to fetch locale for

**Responses:**

- `200`: Locale resources with content returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/locale/resource`

**ID:** `ADMIN_LOCALE_RESOURCE_LIST`  
**Summary:** List all locale resources across all services (admin).  

Returns all locale resource entries across all registered services and languages. Used by the admin console to browse and manage i18n content.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: All locale resources returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/locale/{namespaceId}/keys`

**ID:** `ADMIN_LOCALE_KEYS_LIST`  
**Summary:** List all locale translation keys for a namespace (admin).  

Returns all keys registered under the specified namespace, with their IDs and metadata. Used by the admin console to browse and edit i18n strings per namespace.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `namespaceId` (integer) (required): Namespace ID

**Responses:**

- `200`: Locale keys returned
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Namespace not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/login-methods`

**ID:** `ADMIN_LOGIN_METHODS_LIST`  
**Summary:** List all login methods (admin).  

Returns all registered login methods, supporting pagination. Used by the admin console to manage the available authentication flows per client.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fetchCount` (integer) (optional): Number of records to fetch
- `lastSequence` (integer) (optional): Pagination cursor

**Responses:**

- `200`: Login method list returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/login-methods/{id}`

**ID:** `ADMIN_LOGIN_METHOD_GET`  
**Summary:** Get a login method by ID (admin).  

Returns the full details of a single login method including its step definitions and scope group assignments.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Login method ID

**Responses:**

- `200`: Login method details returned
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Login method not found
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/menus`

**ID:** `ADMIN_MENUS_QUERY`  
**Summary:** Query menus available to one or more role IDs (admin).  

Returns the menu items accessible to any of the given role IDs. Used by the admin console to render role-appropriate navigation menus.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `menuRoleIds` (array) (optional): Role IDs to query menus for

**Responses:**

- `200`: Menu items returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/open-api`

**ID:** `ADMIN_OPEN_API_LIST`  
**Summary:** List OpenAPI spec entries (paginated, admin).  

Returns a paginated list of OpenAPI operation records stored in the database. Used by the admin console and the scope-gen tool to inspect the current spec.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fetchCount` (integer) (optional): Number of records to fetch
- `lastSequence` (integer) (optional): Pagination cursor

**Responses:**

- `200`: OpenAPI entry list returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/open-api/file`

**ID:** `ADMIN_OPEN_API_FILE_GET`  
**Summary:** Get the generated OpenAPI file URL for a client.  

Returns the CDN URL of the pre-built OpenAPI JSON file scoped to the specified client ID. The file contains only the operations the client has access to.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `clientId` (string) (required): OAuth client ID

**Responses:**

- `200`: OpenAPI file URL returned
- `401`: Unauthorized
- `403`: Forbidden
- `404`: No OpenAPI file for client
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/scope-groups`

**ID:** `ADMIN_SCOPE_GROUPS_LIST`  
**Summary:** List all OAuth scope groups (admin).  

Returns all registered scope groups, which bundle sets of scopes for assignment to login methods. Used by the admin console to manage access groupings.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fetchCount` (integer) (optional): Number of records to fetch
- `lastSequence` (integer) (optional): Pagination cursor

**Responses:**

- `200`: Scope group list returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/scopes`

**ID:** `ADMIN_SCOPES_LIST`  
**Summary:** List all OAuth scopes (admin).  

Returns all registered scopes across all clients, supporting pagination via fetchCount and lastSequence. Used by the admin console to manage scope assignments.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `fetchCount` (integer) (optional): Number of records to fetch
- `lastSequence` (integer) (optional): Pagination cursor

**Responses:**

- `200`: Scope list returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/system/client`

**ID:** `ADMIN_CLIENT_LIST`  
**Summary:** Retrieve client configuration for system-level consumers.  

Returns the full client list (including login methods and steps) for the given domain, optionally filtered to records updated since lastQueriedTime. Used internally by the gateway and identity service to bootstrap client config.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `domain` (string) (optional): Service domain filter
- `lastQueriedTime` (string) (optional): ISO timestamp for incremental sync

**Responses:**

- `200`: Client list returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/system/login-method`

**ID:** `ADMIN_LOGIN_METHOD_LIST`  
**Summary:** Retrieve login method configuration for system-level consumers.  

Returns login method records for the given domain, optionally filtered to entries updated since lastQueriedTime. Used internally by the gateway to sync the available authentication flows on startup.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `domain` (string) (optional): Service domain filter
- `lastQueriedTime` (string) (optional): ISO timestamp for incremental sync

**Responses:**

- `200`: Login method list returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/system/scope`

**ID:** `ADMIN_SCOPE_LIST`  
**Summary:** Retrieve OAuth scope configuration for system-level consumers.  

Returns scope records for the given domain, used internally by the gateway to enforce scope-based access control on every inbound request.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `domain` (string) (optional): Service domain filter

**Responses:**

- `200`: Scope list returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/system/scope-group`

**ID:** `ADMIN_SCOPE_GROUP_LIST`  
**Summary:** Retrieve scope group configuration for system-level consumers.  

Returns scope group records for the given domain. Used internally by the gateway to determine which scopes are bundled in each login method's access grant.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `domain` (string) (optional): Service domain filter

**Responses:**

- `200`: Scope group list returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `GET /api/v1/admin/template`

**ID:** `ADMIN_TEMPLATE_LIST`  
**Summary:** Fetch all template resources for a service.  

Returns template resource metadata (name, language, CDN URL) for the requested service names. Used by notification and email services to locate message templates.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `msNames` (array) (optional): Service names to fetch templates for

**Responses:**

- `200`: Template resources returned
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/clients`

**ID:** `ADMIN_CLIENT_CREATE`  
**Summary:** Create a new OAuth client (admin).  

Registers a new OAuth client application with the specified credentials and domain. Publishes a client-update Kafka event so the gateway syncs immediately.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `201`: OAuth client created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/export/db-json-file`

**ID:** `ADMIN_EXPORT_DB_JSON`  
**Summary:** Export all configuration data as a JSON file (admin).  

Serialises the entire configuration database (clients, scopes, login methods, etc.) to a JSON snapshot. Used for backup and environment migration.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Configuration data exported as JSON
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/feature-flags`

**ID:** `ADMIN_FEATURE_FLAG_SET`  
**Summary:** Set the value of a feature flag.  

Updates the value of the specified feature flag. The value is validated against the flag's declared type (boolean, string, or number). Broadcasts a flag-update Kafka event so other services invalidate their local caches immediately.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Feature flag updated
- `400`: Invalid flag key format or value type
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Flag not found
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/import/db-json-file`

**ID:** `ADMIN_IMPORT_DB_JSON`  
**Summary:** Import configuration data from a JSON file (admin).  

Loads a previously exported JSON snapshot into the configuration database. Existing records are upserted; records absent from the snapshot are left intact.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Configuration data imported from JSON
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/locale/{namespaceId}/keys`

**ID:** `ADMIN_LOCALE_KEY_CREATE`  
**Summary:** Add a new locale translation key to a namespace (admin).  

Creates a new translation key under the specified namespace. The key must be unique within the namespace. Translations for each language are added separately.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `namespaceId` (integer) (required): Namespace ID

**Responses:**

- `201`: Locale key created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/locale/{namespaceId}/uploads`

**ID:** `ADMIN_LOCALE_UPLOAD`  
**Summary:** Upload locale files for a namespace to the object store (admin).  

Packages and uploads the locale files for the specified namespace to AWS S3 or Minio, then triggers a CDN refresh so clients pick up the updated translations.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `namespaceId` (integer) (required): Namespace ID

**Responses:**

- `200`: Locale files uploaded to object store
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/login-methods`

**ID:** `ADMIN_LOGIN_METHOD_CREATE`  
**Summary:** Create a new login method (admin).  

Registers a new authentication flow definition, including the target identity service URI and token TTLs. After creation the gateway syncs the new method.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `201`: Login method created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/organizations`

**ID:** `POST_API_V1_ADMIN_ORGANIZATIONS`  
**Summary:** Create a new organization.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/partners`

**ID:** `POST_API_V1_ADMIN_PARTNERS`  
**Summary:** Create a new partner.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/scope-groups`

**ID:** `ADMIN_SCOPE_GROUP_CREATE`  
**Summary:** Create a new OAuth scope group (admin).  

Creates a named group that bundles one or more scopes. Scope groups are then assigned to login methods to grant access to the bundled URI patterns.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `201`: OAuth scope group created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/scopes`

**ID:** `ADMIN_SCOPE_CREATE`  
**Summary:** Create a new OAuth scope (admin).  

Registers a new scope that can be assigned to scope groups and used to control access to specific URI patterns. After creation, the gateway syncs the new scope.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `201`: OAuth scope created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/sync/holiday`

**ID:** `ADMIN_HOLIDAY`  
**Summary:** Trigger holiday data sync from the upstream source (internal).  

Fetches the latest trading holiday calendar and persists it to the database. Called by the scheduler service on a daily basis before market open.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Holiday data synced
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/sync/interest-info`

**ID:** `ADMIN_INTEREST_INFO`  
**Summary:** Trigger interest rate info sync from the upstream source (internal).  

Fetches the latest interest rate schedule and persists it to the database. Called by the scheduler service when rate changes are published.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Interest rate data synced
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/sync/locale`

**ID:** `ADMIN_LOCALE`  
**Summary:** Sync public locale resources for the specified services (internal).  

Regenerates and re-uploads the public locale files for the given service names. Called after a locale key or translation is created, updated, or deleted.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `msNames` (array, optional): 

**Responses:**

- `200`: Public locale resources synced
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/sync/locale/internal`

**ID:** `ADMIN_LOCALE_INTERNAL`  
**Summary:** Sync locale resources to the internal store for the specified services (internal).  

Fetches the latest locale files for the given service names from the object store and caches them for internal consumers. Called after a locale upload completes.  

**Auth:** ✓ Required (Bearer JWT)  

**Request Body:**

- `msNames` (array, optional): 

**Responses:**

- `200`: Internal locale resources synced
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/sync/locale/resource`

**ID:** `ADMIN_SYNC_LOCALE_RESOURCE`  
**Summary:** Sync admin locale resources for all registered services (internal).  

Regenerates the admin locale resource index and uploads updated files to the object store. Called after bulk locale changes are applied via the admin console.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Admin locale resources synced
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `POST /api/v1/admin/sync/locale/{namespaceId}/key`

**ID:** `ADMIN_SYNC_LOCALE_KEY`  
**Summary:** Sync locale keys for a specific namespace (internal).  

Re-exports the locale keys for the given namespace and uploads the result to the object store. Called after keys are added or deleted from a namespace.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `namespaceId` (integer) (required): Namespace ID

**Responses:**

- `200`: Namespace locale keys synced
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/clients/{id}`

**ID:** `ADMIN_CLIENT_UPDATE`  
**Summary:** Update an OAuth client (admin).  

Modifies the metadata or login method assignments of an existing OAuth client. Publishes a client-update Kafka event so the gateway syncs the changes.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): OAuth client record ID

**Responses:**

- `200`: OAuth client updated
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Client not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/clients/{id}/secret`

**ID:** `ADMIN_CLIENT_SECRET_UPDATE`  
**Summary:** Change the client secret for an OAuth client (admin).  

Replaces the secret of the specified OAuth client. All existing sessions using the old secret remain valid until they expire.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (string) (required): OAuth client ID

**Request Body:**

- `clientId` (string, required): 
- `clientSecret` (string, required): 

**Responses:**

- `200`: Client secret updated
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Client not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/feature-flags`

**ID:** `ADMIN_FEATURE_FLAG_SET_PUT`  
**Summary:** Update the value of a feature flag (PUT alias).  

Routes to the same handler as post:/api/v1/admin/feature-flags. Registered to handle PUT requests from gateway clients that use PUT for update operations.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Feature flag updated
- `400`: Invalid flag key format or value type
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Flag not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/locale/{keyId}/{lang}`

**ID:** `ADMIN_LOCALE_TRANSLATION_UPDATE`  
**Summary:** Update a locale translation for a specific key and language (admin).  

Sets or replaces the translation value for the specified key and language code. Used by the admin console to edit individual i18n strings inline.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `keyId` (integer) (required): Translation key ID
- `lang` (string) (required): Language code (e.g. vi, en)

**Responses:**

- `200`: Translation updated
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Key not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/login-methods/{id}`

**ID:** `ADMIN_LOGIN_METHOD_UPDATE`  
**Summary:** Update an existing login method (admin).  

Modifies the parameters of a registered login method such as token TTLs, scope group assignments, or step definitions.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (integer) (required): Login method ID

**Responses:**

- `200`: Login method updated
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Login method not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/open-api`

**ID:** `ADMIN_OPEN_API_UPDATE`  
**Summary:** Update OpenAPI spec entries from a URL list (admin).  

Downloads OpenAPI spec files from the provided URLs, parses each operation, and upserts the entries into the database. Triggers a regeneration of the per-client OpenAPI file uploads on completion.  

**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: OpenAPI entries updated
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/organizations`

**ID:** `PUT_API_V1_ADMIN_ORGANIZATIONS`  
**Summary:** Update an existing organization.  
**Auth:** ✓ Required (Bearer JWT)  

**Responses:**

- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/partners/{id}`

**ID:** `PUT_API_V1_ADMIN_PARTNERS_ID`  
**Summary:** Update an existing partner.  
**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `id` (string) (required): Partner ID

**Responses:**

- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/scope-groups/{scopeGroupId}`

**ID:** `ADMIN_SCOPE_GROUP_UPDATE`  
**Summary:** Update an existing OAuth scope group (admin).  

Modifies the name or scope membership of an existing scope group. Changes are propagated to all login methods that reference this group on the next sync.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `scopeGroupId` (integer) (required): Scope group ID

**Responses:**

- `200`: OAuth scope group updated
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Scope group not found
- `429`: Too many requests
- `500`: Internal server error

### `PUT /api/v1/admin/scopes/{scopeId}`

**ID:** `ADMIN_SCOPE_UPDATE`  
**Summary:** Update an existing OAuth scope (admin).  

Modifies the name, URI pattern, or domain of an existing scope. Changes are propagated to the gateway on the next sync cycle.  

**Auth:** ✓ Required (Bearer JWT)  

**Parameters:**

- `scopeId` (integer) (required): Scope ID

**Responses:**

- `200`: OAuth scope updated
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Scope not found
- `429`: Too many requests
- `500`: Internal server error

---


