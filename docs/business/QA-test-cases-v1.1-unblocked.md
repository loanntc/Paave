# QA Test Cases — v1.1 Supplement (Unblocked)
## Previously BLOCKED test cases — now resolved via FRD-gaps-v2.4.md

**Version:** 1.1
**Date:** 2026-04-20
**Author:** QA Team
**Status:** WRITTEN — Ready for execution
**Resolves:** 14 BLOCKED test cases from QA-test-cases-v1.0.md
**Source of truth:** FRD-gaps-v2.4.md

> This document is a supplement to QA-test-cases-v1.0.md. It contains the written versions of all test cases that were previously BLOCKED due to missing specifications. Each test case references the gap that was resolved.

---

## MODULE 1: AUTHENTICATION (Unblocked)

### TC-AUTH-020 — Forgot Password: Happy Path
**Resolves:** GAP-QA-01 | **Ref:** FR-AUTH-07 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On login screen, tap "Forgot Password?" | Forgot Password screen displayed; email input field shown |
| 2 | Enter registered email: test@gmail.com | No client-side error |
| 3 | Tap "Send Code" | HTTP 200; "If this email is registered, a reset code has been sent."; OTP sent to email within 30s |
| 4 | Enter correct 6-digit OTP within 10 minutes | HTTP 200; `reset_session_token` returned; TTL 5 minutes |
| 5 | Enter new password: "NewSecure@456" (≥8 chars, uppercase, lowercase, number) | HTTP 200; "Password updated. Please log in." |
| 6 | Navigate to login screen; enter new password | Login succeeds; all other active sessions revoked |

**Pass Criteria:** Password updated; old password no longer works; all existing sessions terminated.

---

### TC-AUTH-021a — Forgot Password: OTP Expired
**Resolves:** GAP-QA-01 | **Ref:** FR-AUTH-07.2, E-1002 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Request forgot-password OTP | OTP sent; TTL = 10 minutes |
| 2 | Wait 10 minutes + 1 second | OTP expired |
| 3 | Submit the OTP | HTTP 400; E-1002; "Code expired. Please request a new code." |

---

### TC-AUTH-021b — Forgot Password: Max OTP Attempts
**Resolves:** GAP-QA-01 | **Ref:** FR-AUTH-07.2, E-1014 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Request forgot-password OTP | OTP sent |
| 2 | Enter wrong OTP (attempt 1 of 5) | HTTP 400; E-1010; "Incorrect code. 4 attempts remaining." |
| 3 | Enter wrong OTP (attempts 2–4) | Decreasing attempts remaining shown |
| 4 | Enter wrong OTP (attempt 5 of 5) | HTTP 400; E-1014; "Too many incorrect attempts. Please request a new code."; token invalidated |
| 5 | Enter correct OTP (attempt 6) | HTTP 400; E-1014 (token is invalidated, not E-1002) |

---

### TC-AUTH-021c — Forgot Password: Same Password Rejected
**Resolves:** GAP-QA-01 | **Ref:** FR-AUTH-07.3, E-1013 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete OTP verification; obtain reset_session_token | Token valid |
| 2 | Submit new_password = current password | HTTP 400; E-1013; "New password must be different from your current password." |

---

### TC-AUTH-021d — Forgot Password: Email Not Found (No Enumeration)
**Resolves:** GAP-QA-01 | **Ref:** FR-AUTH-07.1 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter email not registered in system | HTTP 200; same message: "If this email is registered, a reset code has been sent." |
| 2 | Verify no OTP was sent | No email received; DB: no reset token created |

**Pass Criteria:** Response identical to successful case — email enumeration not possible.

---

### TC-AUTH-021e — Forgot Password: OAuth-Only Account
**Resolves:** GAP-QA-01 | **Ref:** FR-AUTH-07.1 edge case | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Request password reset for email registered via Google OAuth only | HTTP 200; same success message; no email sent (no password exists); event logged server-side |
| 2 | Verify no reset email received | Confirmed: no email sent |

---

### TC-AUTH-022 — Multi-Device Session: 5 Device Limit
**Resolves:** GAP-QA-02 | **Ref:** FR-AUTH-09.1, BR-AUTH-08 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in on Device 1–5 (different device_ids) | All 5 sessions created; all active simultaneously |
| 2 | Log in on Device 6 | HTTP 200; login succeeds; oldest inactive session (Device 1) is auto-revoked |
| 3 | Check Device 1 | Push notification received: "You were signed out because your account reached the maximum device limit." |
| 4 | Device 1 makes API call | HTTP 401; refresh token invalid |

---

### TC-AUTH-023 — Remote Session Revocation
**Resolves:** GAP-QA-02 | **Ref:** FR-AUTH-09.3 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in on Device A (current) and Device B | Both sessions active |
| 2 | From Device A: Settings > Security > Active Sessions | List shows Device A ("This device") and Device B with last-active time and approximate location |
| 3 | Tap "Sign out" on Device B entry | HTTP 200; Device B session revoked |
| 4 | Device B receives push notification | "You were signed out of Paave on [Device B name]. If this wasn't you, change your password immediately." |
| 5 | Device B attempts API call | HTTP 401 |

---

### TC-AUTH-024 — Biometric Enrollment During Onboarding (Happy Path)
**Resolves:** GAP-QA-11 | **Ref:** FR-AUTH-08.1 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete onboarding on biometric-capable device (iPhone with Face ID enabled) | Biometric enrollment screen displayed after investment goal step |
| 2 | Tap "Enable Face ID" | OS Face ID permission prompt shown |
| 3 | Approve Face ID permission | Face ID scan requested |
| 4 | Successful face scan | `biometric_enabled = true` in local storage; encrypted refresh token in Keychain; enrollment confirmation shown |
| 5 | Force-quit app; reopen | Face ID prompt shown instead of password screen |

**Pass Criteria:** User can log in with Face ID on next app launch.

---

### TC-AUTH-025 — Biometric: Skip Enrollment
**Resolves:** GAP-QA-11 | **Ref:** FR-AUTH-08.1 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On biometric enrollment screen, tap "Skip" | Screen dismissed; `biometric_enabled = false` |
| 2 | Force-quit app; reopen | Password login screen shown (no biometric prompt) |
| 3 | Settings > Security | "Enable Face ID / Fingerprint" toggle shown (OFF state) |
| 4 | Toggle to ON | Biometric enrollment flow re-triggered |

---

### TC-AUTH-026 — Biometric: 3 Failures Fallback
**Resolves:** GAP-QA-11 | **Ref:** FR-AUTH-08.2, BR-AUTH-09 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Biometric enrolled; app locked; attempt biometric login | Face ID prompt shown |
| 2 | Fail Face ID (attempt 1) | OS shows "Try again" (hardware-level, not app-level) |
| 3 | Fail Face ID (attempt 2) | Second failure |
| 4 | Fail Face ID (attempt 3) | App-level: biometric prompt dismissed; password login screen shown with message "Biometric authentication failed. Please enter your password." |
| 5 | Enter correct password | Login succeeds; biometric still enrolled (not deleted) |

---

### TC-AUTH-027 — Biometric: Not Supported (Device Without Hardware)
**Resolves:** GAP-QA-11 | **Ref:** FR-AUTH-08.1 edge case | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete onboarding on Android device with no fingerprint sensor | Biometric enrollment screen is SKIPPED (not shown) |
| 2 | Navigate to Settings > Security | Biometric toggle NOT shown |

**Pass Criteria:** No crash; no mention of biometric on unsupported device.

---

### TC-AUTH-028 — Biometric: Re-enrollment After Enrollment Change
**Resolves:** GAP-QA-11 | **Ref:** FR-AUTH-08.3 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has biometric enrolled | `biometric_enabled = true` |
| 2 | User adds new fingerprint in Android Settings (outside app) | App's Keystore key is invalidated by OS |
| 3 | Open app; attempt biometric login | App detects `KeyPermanentlyInvalidatedException`; clears biometric config; shows: "Your biometric settings changed. Please sign in with your password to re-enable biometric login." |
| 4 | Enter password | Login succeeds |
| 5 | System prompts biometric re-enrollment | FR-AUTH-08.1 flow triggered |

---

## MODULE 2: ONBOARDING (Unblocked)

### TC-ONBOARD-005 — Step Count: Email Path Shows 5 Steps
**Resolves:** GAP-QA-03 | **Ref:** FR-08 AMENDMENT | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Begin email registration path | Data Consent screen shown; progress bar shows "Step 1 of 5" |
| 2 | Complete Consent → Account Details + DOB | OTP screen shown; progress bar shows "Step 3 of 5" |
| 3 | Complete OTP → Industrial Preferences | Progress bar shows "Step 4 of 5" |
| 4 | Complete Industrial Preferences → Investment Goal | Progress bar shows "Step 5 of 5" |
| 5 | Complete Investment Goal | Progress never reaches "Step 6 of 5" or "Step 6 of 6" |

**Pass Criteria:** Email path step counter never exceeds 5; reaches 5 on last step.

---

### TC-ONBOARD-006 — Step Count: Social OAuth Path Shows 6 Steps
**Resolves:** GAP-QA-03 | **Ref:** FR-08 AMENDMENT | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Select "Sign up with Google" | Method Selection counts as Step 1 of 6 |
| 2 | OAuth handshake (Google web view) | No progress bar during OAuth handshake |
| 3 | Return from OAuth → Display Name + DOB screen | Progress bar shows "Step 3 of 6" |
| 4 | Industrial Preferences | "Step 4 of 6" |
| 5 | Investment Goal | "Step 5 of 6" |
| 6 | Data Consent | "Step 6 of 6" |

**Pass Criteria:** Social path step counter shows 6 at final step; email path shows 5.

---

## MODULE 3: AGE GATE (Unblocked)

### TC-AGE-003 — DOB Age Boundary: Timezone Edge Case (UTC+7)
**Resolves:** GAP-QA-04 | **Ref:** FR-AGE-04 AMENDMENT, BR-AGE-05 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Register user with DOB = 2008-01-15 | Account created |
| 2 | Simulate server time = 2026-01-14T20:00:00Z (= 2026-01-15T03:00:00 UTC+7) | today_UTC7 = 2026-01-15; user is exactly 18 years old |
| 3 | User logs in at this time | `feature_tier` recalculated: `today_UTC7 (2026-01-15) >= dob + 18 years (2026-01-15)` → TRUE → FULL_ACCESS granted |
| 4 | Simulate server time = 2026-01-14T16:00:00Z (= 2026-01-14T23:00:00 UTC+7) | today_UTC7 = 2026-01-14; user is still 17 |
| 5 | User logs in at this time | feature_tier = LEARN_MODE (birthday not reached in UTC+7) |

**Pass Criteria:** Age boundary uses today_date_in_UTC7; user gets FULL_ACCESS on their birthday in UTC+7 timezone.

---

## MODULE 5: PAPER TRADING (Unblocked)

### TC-PT-025 — ATO Order: No Matching Price at Opening Auction
**Resolves:** GAP-QA-05 | **Ref:** FR-PT-07.1 AMENDMENT, E-PT-400 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit ATO BUY for 100 VIC at 09:10 ICT (during pre-opening window) | HTTP 201; status = PENDING; session_at_submission = PRE_OPENING; reserved funds deducted |
| 2 | System runs opening auction at 09:15 ICT | No counterparty exists; no opening price computed |
| 3 | System evaluates ATO orders | Order status → CANCELLED; cancel_reason = ATO_ATC_NO_MATCH |
| 4 | Check virtual balance | Reserved funds released; available_balance restored |
| 5 | Check push notification | "Your ATO order for 100 VIC could not be filled — no matching price was available at the opening auction. Your funds have been released." |
| 6 | Check order history | Order shows status = CANCELLED; reason = "No matching price at auction" |

---

### TC-PT-026a — ATC Order: No Matching Price at Closing Auction
**Resolves:** GAP-QA-05 | **Ref:** FR-PT-07.1 AMENDMENT, E-PT-400 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit ATC SELL for 200 HPG at 14:35 ICT (during ATC window) | HTTP 201; status = PENDING; holdings soft-locked |
| 2 | System runs closing auction at 14:45 ICT | No closing price computed |
| 3 | System evaluates ATC orders | Order status → CANCELLED; cancel_reason = ATO_ATC_NO_MATCH |
| 4 | Check holdings | Soft lock released; 200 HPG available again |
| 5 | Check push notification | "Your ATC order for 200 HPG could not be filled — no matching price was available at the closing auction. Your funds have been released." |

---

### TC-PT-029 — QUEUED_AFTER_HOURS: Auto-Cancel After 48 Hours
**Resolves:** GAP-QA-06 | **Ref:** BR-PT-16, SRD-order-engine §2.4 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit MARKET BUY for 10 Samsung (KOSPI) at 15:00 ICT (outside KR trading hours) | HTTP 201; status = QUEUED_AFTER_HOURS; created_at = T |
| 2 | KR market session opens and closes (simulated) but order evaluation does not fill (test: mark order as not evaluated) | Order remains QUEUED_AFTER_HOURS |
| 3 | Simulate time: T + 48 hours + 1 minute | Expiry Cron runs |
| 4 | Expiry Cron processes | Order status → CANCELLED; cancel_reason = QUEUE_TTL_EXPIRED |
| 5 | Check reserved funds | Released back to available_balance |
| 6 | Check push notification | "Your order for 10 Samsung (KOSPI) has been cancelled because it was not evaluated within 48 hours." |

---

### TC-PT-035 — AI Post-Trade Card: LEARN_MODE User (Educational Content)
**Resolves:** GAP-QA-07 | **Ref:** FR-AI-01 AMENDMENT | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as LEARN_MODE user (age 16) | feature_tier = LEARN_MODE confirmed |
| 2 | Place LIMIT BUY order for 100 VIC at 48,500 VND | Order submitted |
| 3 | Order fills (price crosses 48,500) | Execution successful |
| 4 | Post-trade AI card displayed | Card IS shown (not hidden for LEARN_MODE) |
| 5 | Inspect AI card content | Educational framing: explains what a LIMIT order is and why it filled. Example: "Your limit order was filled at your target price of 48,500 VND — this means the market price dropped to your specified level..." |
| 6 | Verify no P&L language | No "You gained X VND" or percentage gain/loss language present in card |

---

### TC-PT-036 — AI Post-Trade Card: FULL_ACCESS User (P&L + Educational)
**Resolves:** GAP-QA-07 | **Ref:** FR-AI-01 AMENDMENT | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as FULL_ACCESS user (age 22) | feature_tier = FULL_ACCESS confirmed |
| 2 | Place and fill same LIMIT BUY for 100 VIC at 48,500 VND | Execution successful |
| 3 | Post-trade AI card displayed | Card shown with P&L framing AND educational context |
| 4 | Verify card includes gain/loss language | "This position is currently valued at X VND" or similar P&L framing present |

---

## MODULE 6: MARKETS (Unblocked)

### TC-MKT-004 — Price Alert: Set When Price Already Above Threshold
**Resolves:** GAP-QA-08 | **Ref:** FR-28 AMENDMENT, EC-ALT-01 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | VIC current market price = 56,500 VND | Price feed active |
| 2 | User sets alert: "Notify me when VIC is above 55,000 VND" (SINGLE_FIRE mode) | HTTP 201; alert created; alert status = ACTIVE |
| 3 | Next price evaluation runs (within 15 seconds) | Alert condition satisfied (56,500 > 55,000) |
| 4 | Alert triggers immediately | Push notification: "VIC is above your alert price of 55,000 VND — current price: 56,500 VND" |
| 5 | Alert status after trigger | TRIGGERED (SINGLE_FIRE: consumed; no further notifications) |

---

### TC-MKT-005 — Price Alert: RECURRING Mode Triggers Multiple Times
**Resolves:** GAP-QA-08 | **Ref:** FR-28 AMENDMENT | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | HPG current price = 28,000 VND | |
| 2 | User sets alert: "Notify me when HPG is above 27,000 VND" with RECURRING mode | Alert created; status = ACTIVE |
| 3 | Alert triggers (price = 28,000 > 27,000) | Notification sent |
| 4 | Alert status after trigger | ACTIVE (not consumed; RECURRING) |
| 5 | Price drops to 26,000; then rises to 27,500 | Alert triggers again; second notification sent |

---

## MODULE 7: NOTIFICATIONS (Unblocked)

### TC-NOTIF-003 — Deep Link: App Killed, User Logged Out → Login Then Navigate
**Resolves:** GAP-QA-09 | **Ref:** FR-NOTIF-01.3 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User is logged out; app is killed | No active session |
| 2 | Push notification received: "VIC price alert triggered" (deep_link = "/stocks/VIC") | Notification visible in OS notification center |
| 3 | User taps notification | App cold-starts; `pending_deep_link = "/stocks/VIC"` stored in local device storage |
| 4 | Login screen shown (not Stock Detail) | User sees login screen |
| 5 | User completes login successfully | `pending_deep_link` retrieved from local storage |
| 6 | App navigates to VIC Stock Detail screen | VIC Stock Detail shown |
| 7 | Verify `pending_deep_link` cleared | Local storage key no longer exists |

---

### TC-NOTIF-004 — Deep Link: pending_deep_link Expires After 5 Minutes
**Resolves:** GAP-QA-09 | **Ref:** FR-NOTIF-01.3, BR-NOTIF-01 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User taps notification while logged out | App cold-starts; `pending_deep_link` stored with `stored_at = T` |
| 2 | User does not log in for 5 minutes + 1 second | `pending_deep_link` TTL exceeded |
| 3 | User logs in at T + 5m + 1s | `pending_deep_link` is checked: TTL expired → discarded |
| 4 | Post-login navigation | User lands on Home screen (not the notification target) |

---

### TC-NOTIF-005 — Deep Link: App Backgrounded (Session Valid)
**Resolves:** GAP-QA-09 | **Ref:** FR-NOTIF-01.2 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | App is backgrounded; user is authenticated | Active session |
| 2 | Push notification received: order fill for VIC | |
| 3 | User taps notification | App resumes; navigates directly to Order Detail for that order |
| 4 | No login screen shown | Confirmed: no re-auth required |

---

### TC-NOTIF-006 — Deep Link: Target No Longer Available
**Resolves:** GAP-QA-09 | **Ref:** FR-NOTIF-01 edge case | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User taps notification for an order (deep_link = "/orders/uuid-123") | App opens; pending_deep_link stored |
| 2 | During login, the order is cancelled/deleted | Order no longer exists |
| 3 | Post-login: app attempts navigation to "/orders/uuid-123" | Order not found; app navigates to Orders screen instead |
| 4 | Toast displayed | "This order is no longer available." |

---

## MODULE 8: SOCIAL TRADING (Unblocked)

### TC-SOC-003 — Post Character Limit: 500 Characters Accepted
**Resolves:** GAP-QA-10 | **Ref:** FR-SOC-03 AMENDMENT | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open post compose screen | Character counter shows "0 / 500" |
| 2 | Type exactly 500 characters | Counter shows "0 / 500" (0 remaining); submit button remains enabled |
| 3 | Submit | HTTP 201; post created |

---

### TC-SOC-003a — Post 501 Characters: Rejected
**Resolves:** GAP-QA-10 | **Ref:** FR-SOC-03 AMENDMENT, E-SOC-301 | **Priority:** P0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Type 500 characters | Submit enabled |
| 2 | Type 1 more character (501 total) | Counter turns red; submit button DISABLED by frontend |
| 3 | If bypassed via API: POST with 501-char body | HTTP 400; E-SOC-301; "Post must be 1–500 characters." |

---

### TC-SOC-003b — Post Previously Allowed 500 Chars Not Broken
**Resolves:** GAP-QA-10 | **Ref:** FR-SOC-03 AMENDMENT (regression test) | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Post 280 characters | HTTP 201; accepted (regression: 280 was the old limit, must still work) |
| 2 | Verify DB | body VARCHAR(500); 280-char post stored without truncation |

---

## MODULE 12: ACCOUNT (Unblocked)

### TC-ACCT-004 — DOB Correction: Read-Only Field
**Resolves:** GAP-QA-12 | **Ref:** FR-ACCT-DOB-01.1 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to Profile > Personal Information | DOB field visible |
| 2 | Verify DOB field is read-only | Cannot type in field; no edit icon/button |
| 3 | Verify helper text | "To update your date of birth, contact support." shown below DOB field |
| 4 | Tap helper text | Modal appears explaining the support process |

---

### TC-ACCT-005 — DOB Correction: Submit Support Request
**Resolves:** GAP-QA-12 | **Ref:** FR-ACCT-DOB-01.2 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to DOB correction support form | Form shows fields: "Correct Date of Birth" (date picker) + "Reason" (textarea) |
| 2 | Enter: new DOB = 2005-03-10; reason = "I entered the wrong year during registration." | No validation errors |
| 3 | Tap Submit | HTTP 201; ticket ID shown: "CORR-XXXXXX"; message: "Your request has been submitted. We'll review and respond within 3 business days." |
| 4 | Check email | Confirmation email received within 60 seconds |
| 5 | Profile shows pending badge | "DOB correction: pending review" displayed in Profile |

---

### TC-ACCT-006 — DOB Correction: Duplicate Ticket Blocked
**Resolves:** GAP-QA-12 | **Ref:** FR-ACCT-DOB-01.2, E-ACCT-401 | **Priority:** P1

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has an open DOB correction ticket (PENDING status) | Ticket exists |
| 2 | User navigates to DOB correction form again | |
| 3 | Attempts to submit a second correction request | HTTP 409; E-ACCT-401; "You already have an open DOB correction request. Please wait for it to be resolved." |

---

### TC-ACCT-007 — DOB Correction: Same DOB Rejected
**Resolves:** GAP-QA-12 | **Ref:** FR-ACCT-DOB-01.2, E-ACCT-402 | **Priority:** P2

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User's current DOB = 2000-05-15 | |
| 2 | Submit DOB correction request with new_dob = 2000-05-15 | HTTP 400; E-ACCT-402; "The submitted date matches your current date of birth." |

---

## TEST CASE COUNT SUMMARY (v1.1 Supplement)

| Module | New TCs | Priority Distribution |
|--------|---------|-----------------------|
| Authentication (unblocked) | 12 | 8 P0 / 4 P1 |
| Onboarding (unblocked) | 2 | 2 P1 |
| Age Gate (unblocked) | 1 | 1 P1 |
| Paper Trading (unblocked) | 4 | 2 P0 / 2 P1 |
| Markets (unblocked) | 2 | 2 P1 |
| Notifications (unblocked) | 4 | 2 P0 / 2 P1 |
| Social Trading (unblocked) | 3 | 2 P0 / 1 P1 |
| Account (unblocked) | 4 | 4 P1 / 1 P2 |
| **TOTAL** | **32** | **14 P0 / 17 P1 / 1 P2** |

**Combined with v1.0 (101 test cases):**
- Total test cases: **133**
- P0: 53 + 14 = **67**
- P1: 40 + 17 = **57**
- P2: 1 + 1 = **2 (adjusted)**
- BLOCKED: 0 (all resolved)

---

*Document produced 2026-04-20. All 14 previously BLOCKED test cases are now WRITTEN and ready for execution.*
*Prerequisites: FRD-gaps-v2.4.md must be implemented by engineering before these TCs can pass.*
