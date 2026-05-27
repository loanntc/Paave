# FRD-07: Notifications

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

## Module Description

The Notifications module covers: push notification permission handling, five notification types (price alerts, market open, market close, watchlist movements, AI nudges/portfolio health), a 30-day notification history inbox, and deep link routing from push taps to in-app screens. This document is self-contained; a developer reading only this file has everything needed to implement the full notifications system.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Notifications |
| Primary Actor | Authenticated user (all tiers); System (delivery) |
| Goal | Keep users informed of price alerts, market events, and portfolio insights via push and in-app inbox |
| Trigger | Various: alert threshold crossed, market open/close, end-of-day watchlist analysis, AI engine output |

---

## 2. Functional Requirements

---

### FR-42: Push Notification Permission Request

- **Actor**: System + User (during onboarding post-email-verification)
- **Description**: After email verification is confirmed, before the OS permission dialog is triggered, Paave shows a custom in-app modal explaining the value of notifications. The modal has two actions: "Allow" and "Skip." If the user taps "Allow": the OS permission dialog is shown. If the OS grants permission: `notifications_enabled = true` stored on user profile. If the OS denies (user taps "Don't Allow" in OS dialog): `notifications_enabled = false` stored; no retry. If the user taps "Skip" on the custom modal: `notifications_enabled = false` stored; the OS dialog is NEVER triggered. After OS denial, Paave does NOT re-request permission at any point — this is enforced by OS policy and must not be circumvented. Users can navigate to device Settings → Paave → Notifications to re-enable, and the app provides a shortcut in Profile → Notification Settings to open device settings.
- **Input**:
  - User tap: "Allow" | "Skip" on Paave custom modal
  - OS dialog response: allowed | denied (only if "Allow" tapped)
- **Output**:
  - `notifications_enabled` flag stored on user profile: `true` (OS allowed) | `false` (OS denied or user skipped)
  - Push token registered with server if `notifications_enabled = true`
  - No OS dialog shown if user tapped "Skip"
  - No retry after OS denial
- **Precondition**: User has just completed email verification. Custom modal is shown.
- **Postcondition**: `notifications_enabled` is set. Push token registered or not.

#### Custom Modal Specification

| Element | Content |
|---|---|
| Title | "Stay informed on your stocks" |
| Body | "Get price alerts when your stocks hit targets, daily market updates, and personalized insights." |
| Primary CTA | "Allow Notifications" |
| Secondary CTA | "Skip for now" |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-42-01 | User taps "Allow Notifications" | On custom modal | OS permission dialog shown |
| AC-42-02 | User allows in OS dialog | After tapping "Allow" on custom modal | `notifications_enabled = true`; push token registered |
| AC-42-03 | User denies in OS dialog | After tapping "Allow" on custom modal | `notifications_enabled = false`; no retry attempt |
| AC-42-04 | User taps "Skip for now" | On custom modal | `notifications_enabled = false`; OS dialog NOT shown |
| AC-42-05 | `notifications_enabled = false` set | Post-denial/skip | No push notifications sent to this user until they re-enable via device settings |
| AC-42-06 | User re-enables via device settings | Later in app lifecycle | App detects permission on next foreground; registers push token; updates `notifications_enabled = true` |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Custom modal shown but app backgrounded before response | Modal dismissed; treat as "Skip" — `notifications_enabled = false`; no OS dialog |
| OS returns "restricted" (managed device) | `notifications_enabled = false`; no retry; "Skip" path followed |
| Push token registration fails after OS grant | Retry up to 3 times with exponential backoff; if all fail, log error; notifications won't work until next foreground |

- **Priority**: P0

---

### FR-43: Price Alert Notification

- **Actor**: System (alert evaluation engine) + User (recipient)
- **Description**: When a user's price alert threshold is crossed, a push notification is sent within 60 seconds of the threshold being crossed. Title format: "[TICKER] Alert Triggered." Body format: "[Company Name] is now at [current price] ([±%] today)." Price and percentage use BR-14 formatting and P&L color coding (BR-35). SINGLE_FIRE mode (default): alert status → TRIGGERED after push sent; no further pushes for this alert. RECURRING mode: alert status remains ACTIVE; fires again on each price evaluation that satisfies the condition. Notifications disabled: alert state tracked internally (status still → TRIGGERED for SINGLE_FIRE), but no push sent. Tapping the notification deep links to Stock Detail for that ticker via FR-NOTIF-01.
- **Input**:
  - Alert record: user_id, ticker, direction (above | below), target_price, mode (SINGLE_FIRE | RECURRING)
  - Current price evaluation result (from price feed, ≤15s for VN)
  - User's `notifications_enabled` flag
- **Output**:
  - Push notification: title + body formatted per spec
  - Alert status updated: TRIGGERED (SINGLE_FIRE) or remains ACTIVE (RECURRING)
  - Deep link payload: `{ deep_link: "/stocks/[TICKER]" }`
  - No push if `notifications_enabled = false`; status still updated
- **Precondition**: User has an ACTIVE alert. Price feed is operational.
- **Postcondition**: Push sent (if enabled); alert status updated.

#### Notification Payload Specification

```json
{
  "title": "VIC Alert Triggered",
  "body": "Vinhomes is now at 52,500 VND (+2.45% today)",
  "deep_link": "/stocks/VIC",
  "notification_id": "uuid-v4",
  "type": "PRICE_ALERT",
  "alert_id": "uuid-v4"
}
```

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-43-01 | SINGLE_FIRE alert "above 50,000" on VIC; VIC crosses 50,001 | Price evaluation runs | Push sent within 60s; alert status → TRIGGERED |
| AC-43-02 | RECURRING alert "above 50,000" on VIC; VIC = 51,000 | Each price evaluation | Push sent on each qualifying evaluation; status stays ACTIVE |
| AC-43-03 | `notifications_enabled = false` | Alert threshold crossed | No push sent; alert status still → TRIGGERED (SINGLE_FIRE) |
| AC-43-04 | EC-ALT-01: Alert set "above 55,000"; stock already at 56,500 | Alert saved | Push sent within ≤15s of next price evaluation |
| AC-43-05 | User taps alert push notification | App in any state | Deep link routing per FR-NOTIF-01; navigates to Stock Detail for that ticker |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Alert threshold crossed but push delivery fails (FCM/APNs timeout) | Retry up to 3 times; log failure; alert status still updated (push delivery failure ≠ alert failure) |
| Stock price gaps over threshold (jumps from 48,000 to 52,000, skipping 50,000) | Alert for "above 50,000" triggers at 52,000 on next evaluation — no special "gap" handling needed |
| RECURRING alert fires 50 times in one day | No per-day cap on RECURRING alert fires; all pushes sent |
| Alert for KR stock (reference price) | Alert triggers based on estimated reference price; push body includes "(estimated price)" note |
| User deletes alert while push is in-flight | Push may still arrive; tapping it navigates to Stock Detail normally; no alert detail in app since deleted |

- **Priority**: P1

---

### FR-44: Market Open Notification

- **Actor**: System (scheduled) + User (opt-in recipient)
- **Description**: An optional push notification sent at the market open time for the user's preferred market. VN market: 09:00 ICT. KR market: 09:00 KST. US (Global): 09:30 ET. Notification text (VN example): "Vietnam market is now open. See what's trending." Sent once per trading day — not resent if app missed the first delivery. Market holiday: no notification; next notification on the next valid trading day. This notification type is opt-in; default is OFF. User can toggle in Profile → Notification Settings (FR-52).
- **Input**:
  - User's preferred market setting
  - User's market open notification opt-in flag
  - Server-side holiday calendar per market
  - Current time (server time, authoritative)
- **Output**:
  - Push notification at market open (if opted-in and `notifications_enabled = true`)
  - No notification on holidays
  - Deep link: `{ deep_link: "/markets" }` — opens Markets screen to user's preferred market tab
- **Precondition**: User has opted in. `notifications_enabled = true`. Not a market holiday.
- **Postcondition**: Notification sent once at market open. Holiday = skipped.

#### Notification Text per Market

| Market | Notification Text |
|---|---|
| Vietnam | "Vietnam market is now open. See what's trending." |
| Korea | "Korea market is now open. (Reference data)" |
| Global (US) | "US market is now open. See what's happening globally." |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-44-01 | User opted in; VN preferred | 09:00 ICT on a trading day | Push notification sent |
| AC-44-02 | User opted in; VN holiday | 09:00 ICT on holiday | No notification; next notification on next trading day |
| AC-44-03 | User has not opted in | Market opens | No notification |
| AC-44-04 | `notifications_enabled = false` | Market opens | No notification |
| AC-44-05 | User taps market open notification | App in any state | Deep link to Markets screen, user's preferred market tab |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Market open notification fails delivery | No retry; user misses that day's notification; next day at open, new attempt |
| User changes preferred market after notification scheduled | Next day's notification uses updated preferred market |

- **Priority**: P2

---

### FR-45: Market Close Notification

- **Actor**: System (scheduled) + User (opt-in recipient)
- **Description**: An optional push notification sent at market close for the user's preferred market. VN: 15:00 ICT. Body: "VN-Index closed at [value] ([±%] today)." Final close value used. If the closing data feed is unavailable at close time: no notification sent for that day (do not send stale/estimated close value). Opt-in only; default OFF. Togglable in Notification Settings (FR-52).
- **Input**:
  - User's market close notification opt-in flag
  - Final close value of the preferred market's primary index (VN-Index for VN, KOSPI for KR, S&P 500 for Global)
  - Feed availability at close time
- **Output**:
  - Push notification with closing index value and daily % change
  - No notification if feed unavailable at close
  - Deep link: `{ deep_link: "/markets" }`
- **Precondition**: User has opted in. `notifications_enabled = true`. Feed data available at close.
- **Postcondition**: Notification sent with actual close data. Feed unavailable = no notification.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-45-01 | User opted in; VN preferred | 15:00 ICT; close data available | Push: "VN-Index closed at 1,248.35 (+0.82% today)" |
| AC-45-02 | User opted in | Close data feed unavailable at 15:00 | No notification sent for that day |
| AC-45-03 | User has not opted in | Market closes | No notification |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Close value available late (e.g., 15:05 ICT due to latency) | Send notification when data arrives if within 15 minutes of close; beyond 15 minutes = skip |

- **Priority**: P2

---

### FR-46: Watchlist Price Movement Notification

- **Actor**: System (end-of-day batch) + User (opt-in recipient)
- **Description**: An end-of-day push notification for watchlist stocks that moved ≥ ±5% during the trading day. Maximum 3 notifications per user per day (BR-11), selecting the 3 stocks with the highest absolute daily % change. Opt-in only; default OFF. Zero watchlist stocks → no notification. Notification is sent after market close using final day close prices. Tapping navigates to Stock Detail for that ticker.
- **Input**:
  - User's watchlist (up to 100 stocks)
  - Final daily % change per watchlist stock
  - Watchlist movement notification opt-in flag
- **Output**:
  - Up to 3 push notifications (one per qualifying stock, in descending absolute % change order)
  - Only for stocks with |daily_change| ≥ 5%
  - No notification if no watchlist stock qualifies or watchlist is empty
  - Deep link per notification: `{ deep_link: "/stocks/[TICKER]" }`
- **Precondition**: Market has closed. User has opted in. `notifications_enabled = true`. Watchlist is non-empty.
- **Postcondition**: Up to 3 notifications sent. No more than 3 per user per day.

#### Notification Text Format

"[TICKER] moved [±X.XX%] today. Tap to see details."

Example: "VIC moved +6.23% today. Tap to see details."

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-46-01 | User has 5 watchlist stocks; 4 moved ≥5%; opted in | End of day | Top 3 by absolute % change receive pushes |
| AC-46-02 | User has 2 watchlist stocks; both moved ≥5% | End of day | Both receive pushes (≤3 cap not exceeded) |
| AC-46-03 | No watchlist stock moved ≥5% | End of day | No notification |
| AC-46-04 | Watchlist is empty | End of day | No notification |
| AC-46-05 | User has not opted in | End of day | No notification |
| AC-46-06 | Two stocks have identical absolute % change | Tie-break | Sort by ticker alphabetically; first two alphabetically win |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Delisted stock in watchlist moved >5% (frozen value) | Excluded from watchlist movement notifications |
| End-of-day batch job fails | Notification not sent for that day; next day batch runs normally |
| User has opted in but watchlist changes within 1 hour of close | Snapshot taken at market close (15:00 ICT); late watchlist changes not included |

- **Priority**: P2

---

### FR-47: Notification History Inbox

- **Actor**: Authenticated user (all tiers)
- **Description**: All notification types are stored in the user's in-app notification inbox accessible from Profile → Notifications. Notifications are stored for 30 days in reverse chronological order (newest first). Unread notifications are displayed in bold. Tapping a notification marks it as read and navigates to the relevant screen (per deep link). Entries older than 30 days are auto-deleted by the system (not user-triggered). Empty state: "No notifications yet." Types stored: price alerts, market open, market close, watchlist movements, AI behavioral nudges (FR-AI-05), portfolio health check (FR-AI-04).
- **Input**:
  - Notification records from server (stored on push send)
  - User tap on notification entry
- **Output**:
  - Sorted list of notifications (newest first)
  - Unread: bold text
  - Read: normal weight text
  - Tap: marks read + navigates to target screen
  - Auto-delete entries >30 days old
  - Empty state: "No notifications yet."
- **Precondition**: User is authenticated. Notification History screen is open.
- **Postcondition**: Notifications displayed; tapped notifications marked read.

#### Notification List Item Specification

| Field | Content |
|---|---|
| Icon | Type-specific: bell (alert), chart (market), heart (watchlist), robot (AI) |
| Title | Same as push title |
| Body | Same as push body (truncated at 2 lines; full text on expand) |
| Timestamp | Relative ("2 hours ago"; "3 days ago") |
| Read indicator | Bold text = unread; normal = read |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-47-01 | User has 5 notifications | Inbox opened | All 5 shown, newest first |
| AC-47-02 | 3 notifications are unread | Inbox opened | 3 shown in bold |
| AC-47-03 | User taps an unread notification | Tap action | Notification marked read (no longer bold); navigate to target screen |
| AC-47-04 | Notification is 31 days old | System batch runs | Entry deleted from inbox |
| AC-47-05 | Inbox is empty | Screen opened | "No notifications yet." shown |
| AC-47-06 | User has 100 notifications | Inbox opened | All 100 shown (paginated if needed); newest first |
| AC-47-07 | Push notifications were disabled | Notification history | Price alert still stored in inbox (alerts tracked silently per FR-43); shown in inbox without having been pushed |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Target screen no longer exists (e.g., order cancelled) | Navigate to most relevant fallback (e.g., Orders screen); toast "This item is no longer available" |
| Notification target ticker is delisted | Navigate to Stock Detail for that ticker; delisted state shown |
| User taps two notifications rapidly | Only first tap processed; second tap after navigation completes |

- **Priority**: P1

---

### FR-NOTIF-01: Deep Link Routing for Push Notifications

- **Actor**: System (push delivery) + User (tap action)
- **Description**: Every push notification contains a `deep_link` field in its payload. The deep link specifies the target in-app screen. Routing behavior differs based on app state at time of tap. All routing scenarios are defined below.

#### FR-NOTIF-01.1: App Active (Foreground)

- **Behavior**: Navigate directly to the target screen. Notification marked as read in inbox.
- **No authentication required** (already active session).
- **Input**: Push notification tapped; `deep_link` = valid target
- **Output**: Target screen opened; notification marked read

#### FR-NOTIF-01.2: App Backgrounded (Session Valid)

- **Behavior**: Resume the app; navigate to the target screen. Session token is valid; no re-authentication needed.
- **Input**: Push tapped; app in background; session token valid
- **Output**: App comes to foreground; target screen navigated to

#### FR-NOTIF-01.3: App Killed or User Logged Out (Cold Start)

- **Behavior**: App cold-starts to the Login screen (NOT the target screen). The `deep_link` value is stored locally on the device as `pending_deep_link = { target, notification_id, stored_at }`. After the user successfully authenticates: the pending_deep_link is retrieved and the user is navigated to the target screen. **TTL**: `pending_deep_link` must be used within 5 minutes of `stored_at` (BR-NOTIF-01). If the user does not complete authentication within 5 minutes: discard `pending_deep_link`; after login, navigate to Home screen.

- **Input**: Push tapped; app cold start; `deep_link` in payload
- **Output**: Login screen shown; `pending_deep_link` stored locally; post-auth: target screen or Home (if TTL expired)

#### FR-NOTIF-01.4: Session Expired (Token Invalid)

- **Behavior**: Attempt silent token refresh using the refresh token. If refresh succeeds: navigate directly to target screen (no login screen shown). If refresh fails: show Login screen; apply `pending_deep_link` pattern from FR-NOTIF-01.3.
- **Input**: Push tapped; app open or backgrounded; session token expired
- **Output**: Silent refresh attempted; if success → target screen; if fail → Login screen + pending_deep_link

#### Deep Link Target Map

| `deep_link` value | Target Screen |
|---|---|
| `/stocks/[TICKER]` | Stock Detail for [TICKER] |
| `/orders/[order_id]` | Paper Trade Order Detail |
| `/alerts/[alert_id]` | Alert Detail (on Stock Detail with alert bottom sheet open) |
| `/markets` | Markets screen, user's preferred market tab |
| `/portfolio` | Paper Trading Dashboard |
| (field absent or empty) | Home screen |

#### Edge Cases (All Scenarios)

| Case | Expected Behavior |
|---|---|
| Target screen is an order that was cancelled | Navigate to Orders screen (list); toast "This order is no longer available." |
| Target ticker is delisted | Navigate to Stock Detail; delisted state shown; no toast needed |
| Two notifications tapped within 2 seconds of each other | Most recently tapped notification's `deep_link` wins; first pending_deep_link overwritten |
| `deep_link` field missing from payload | Open app to Home screen; no error shown |
| `pending_deep_link` TTL expired (>5 min) | Discard; navigate to Home after login; no toast |
| `deep_link` points to a screen the user's tier cannot access | Navigate to the screen; enforce tier restrictions there (not at routing layer) |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-NOTIF-01-01 | App foreground; push tapped | FR-NOTIF-01.1 | Navigates to target; marked read |
| AC-NOTIF-01-02 | App backgrounded; session valid; push tapped | FR-NOTIF-01.2 | App foregrounds; target screen opened |
| AC-NOTIF-01-03 | App killed; push tapped | FR-NOTIF-01.3 | Login screen; pending_deep_link stored |
| AC-NOTIF-01-04 | User logs in within 5 min | After cold start | Target screen opened post-auth |
| AC-NOTIF-01-05 | User logs in after 5 min | After cold start | Home screen shown; pending_deep_link discarded |
| AC-NOTIF-01-06 | Session expired; push tapped; refresh succeeds | FR-NOTIF-01.4 | Target screen opened; no login required |
| AC-NOTIF-01-07 | Session expired; push tapped; refresh fails | FR-NOTIF-01.4 | Login screen; pending_deep_link stored |

- **Priority**: P1

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-04 | Price alerts are one-time (SINGLE_FIRE) by default; status → TRIGGERED after first fire | After TRIGGERED, no further pushes unless user re-sets alert or selected RECURRING mode |
| BR-11 | Watchlist movement notification cap: max 3 per user per day; top 3 by absolute % change | 4th qualifying stock: no notification; no error shown to user |
| BR-NOTIF-01 | `pending_deep_link` TTL = 5 minutes from `stored_at` | If auth not completed within 5 min: discard pending_deep_link; land on Home |

---

## 4. UI/UX Notes

- **Notification Settings shortcut**: In Profile → Notification Settings (FR-52), if OS-level notifications are disabled, show a note: "Enable notifications in your device settings." with a button "Open device settings" that deep-links to the app's OS settings page.
- **Inbox badge**: Unread notification count shown as badge on Profile tab icon in bottom navigation. Max display: "99+".
- **Notification grouping**: Notifications are NOT grouped in the inbox — each notification is its own row, sorted newest first.
- **Notification type icons**: Price alert → bell icon; Market open/close → clock icon; Watchlist movement → chart icon; AI nudge → sparkle icon; Portfolio health → heart icon.
- **Swipe to delete**: Individual notifications can be swiped left in the inbox to delete. "Delete all" button available at top of inbox.
- **Auto-delete implementation**: Server-side batch job runs daily; deletes inbox entries with `created_at < now() - 30 days`.

---

## 5. Gamification Notifications (FR-NOTIF-02 through FR-NOTIF-09)

> **Context:** These notification types are introduced by the gamification system (FR-GAME-01 through FR-GAME-10) and the F0 Learning Path (FR-LEARN-*). They extend the notification inbox and push system defined in §2 above using the same delivery infrastructure (push token registration in FR-42, deep link routing in FR-NOTIF-01).

---

### FR-NOTIF-02: Badge Awarded Notification

- **Priority:** P1
- **Trigger:** FR-GAME-06 badge award event (`badge_awards` row inserted)
- **Actor:** System → Authenticated user
- **Description:** When any badge is awarded (FR-GAME-06), a push notification and inbox entry are created immediately.

**Notification Specification:**

| Field | Value |
|---|---|
| Push title | "Thành tích mở khóa!" (Achievement Unlocked!) |
| Push body | "Bạn đã nhận huy hiệu **[badge name]**! Xem ngay." (You earned the [badge name] badge! View now.) |
| Deep link | `paave://badges/{badge_id}` → Badge detail modal on Profile screen |
| Inbox icon | Badge artwork thumbnail (32×32px) |
| Additional CTA for Rare/Epic | Second line in push body: "Thẻ thành tích của bạn đã sẵn sàng để chia sẻ." (Your achievement card is ready to share.) |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|---|---|---|
| AC-NOTIF-02-1 | User earns `BADGE_FIRST_TRADE` | Badge awarded | Push sent with badge name; deep link opens badge detail modal |
| AC-NOTIF-02-2 | User earns `BADGE_ZEN_TRADER` (Epic) | Badge awarded | Push includes share CTA; moment card available at deep link destination |
| AC-NOTIF-02-3 | `notifications_enabled = false` | Badge awarded | No push sent; inbox entry created; badge visible on profile without push |

**Business Rules:**

| # | Rule |
|---|---|
| BR-NOTIF-02-1 | One push per badge award. Fired once; not repeatable. |
| BR-NOTIF-02-2 | Inbox entry retained for 30 days (standard inbox TTL). |
| BR-NOTIF-02-3 | Notification does not fire for the Branch Completion badges if the badge award push and the XP burst notification would arrive simultaneously — they are sent as a single combined push (XP + badge in one message, max 1 push per event batch per user per second). |

---

### FR-NOTIF-03: Tier Upgrade Notification

- **Priority:** P1
- **Trigger:** FR-GAME-02 tier re-evaluation (weekly Sunday batch) detects tier increase
- **Actor:** System → Authenticated user
- **Description:** When a user's Trader Tier increases (FR-GAME-02, evaluated weekly on Sunday), a push notification celebrates the upgrade.

**Notification Specification:**

| Field | Value |
|---|---|
| Push title | "Thăng hạng! 🎉" (Tier Up! 🎉) |
| Push body | "Chúc mừng! Bạn đã đạt **[new tier name in VN]** với [cumulative score] điểm." |
| Deep link | `paave://profile` → Profile screen (shows new tier badge) |

**Business Rules:**

| # | Rule |
|---|---|
| BR-NOTIF-03-1 | Notification fires once per tier-level crossing. Firing again for the same tier is a no-op. |
| BR-NOTIF-03-2 | Tier is re-evaluated Sunday midnight UTC; notification sent after successful evaluation (target: before 08:00 ICT Monday). |

---

### FR-NOTIF-04: Streak Reminder Notification

- **Priority:** P2
- **Trigger:** Scheduled daily at 20:00 ICT per user; fires only if learning streak > 0 AND no lesson completed today
- **Actor:** System → Authenticated user
- **Description:** If the user has an active learning streak (≥1) and has NOT completed any lesson today by 20:00 ICT, a reminder push is sent to encourage lesson completion before streak reset at midnight.

**Notification Specification:**

| Field | Value |
|---|---|
| Push title | "Đừng để mất chuỗi học!" (Don't break your streak!) |
| Push body | "Bạn đang có chuỗi **[X ngày]** liên tiếp. Hoàn thành 1 bài học trước nửa đêm để duy trì!" (You have a [X-day] streak. Complete 1 lesson before midnight to keep it going!) |
| Deep link | `paave://grow/learning` → Grow tab, Learning Path, next incomplete lesson |

**Business Rules:**

| # | Rule |
|---|---|
| BR-NOTIF-04-1 | Notification fires at 20:00 ICT only if: `learning_streak > 0` AND no `lesson_completions` record with `completed_at` in today's ICT calendar day. |
| BR-NOTIF-04-2 | Maximum 1 reminder per user per day. Not sent if user has already completed a lesson today. |
| BR-NOTIF-04-3 | Not sent if user's learning streak = 0 (no streak to protect). |
| BR-NOTIF-04-4 | Streak Freeze state is accounted for: if user has already activated a Freeze for today, this notification is suppressed. |

---

### FR-NOTIF-05: Skill Tree Node Unlocked Notification

- **Priority:** P2
- **Trigger:** FR-GAME-07 node state transition to `AVAILABLE` (newly unlocked)
- **Actor:** System → Authenticated user
- **Description:** When one or more Skill Tree nodes transition from `LOCKED` to `AVAILABLE`, a single batched push notification is sent. Multiple nodes unlocked in the same evaluation are reported as a single notification (not one per node).

**Notification Specification:**

| Field | Value |
|---|---|
| Push title | "Kỹ năng mới mở khóa!" (New skill unlocked!) |
| Push body (1 node) | "**[Node name]** đã sẵn sàng trong Cây Kỹ Năng." ([Node name] is now available in your Skill Tree.) |
| Push body (2+ nodes) | "**[N] kỹ năng mới** đã sẵn sàng trong Cây Kỹ Năng." ([N] new skills are now available in your Skill Tree.) |
| Deep link | `paave://grow/skill-tree` → Skill Tree screen |

**Business Rules:**

| # | Rule |
|---|---|
| BR-NOTIF-05-1 | Maximum 1 notification per evaluation run, regardless of how many nodes become `AVAILABLE`. |
| BR-NOTIF-05-2 | Notification fires only on first unlock of a node (transition from `LOCKED` → `AVAILABLE`). Subsequent state transitions (`AVAILABLE` → `IN_PROGRESS` → `COMPLETE`) do not generate notifications. |

---

### FR-NOTIF-06: Weekly Challenge Notifications

- **Priority:** P1
- **Trigger:** Three separate sub-events from FR-GAME-04 weekly challenge lifecycle
- **Actor:** System → Authenticated user
- **Description:** Three notification types cover the weekly challenge lifecycle: challenge start (Monday), challenge end reminder (Sunday), and winner announcement (Sunday night after scoring).

**Sub-type Specification:**

| Sub-type | Trigger | Push Title | Push Body | Deep Link |
|---|---|---|---|---|
| FR-NOTIF-06.1 (Start) | Monday 08:00 ICT | "Thử thách tuần mới bắt đầu!" | "Thử thách: **[challenge title]**. Thời gian: 7 ngày. Phần thưởng: +100 XP và huy hiệu!" | `paave://grow/challenges` |
| FR-NOTIF-06.2 (Reminder) | Sunday 12:00 ICT | "Còn 12 giờ để hoàn thành thử thách!" | "Vị trí hiện tại của bạn: #[rank]. Hãy nỗ lực thêm!" | `paave://grow/challenges` |
| FR-NOTIF-06.3 (Result) | Sunday 23:30 ICT (after scoring) | "Kết quả thử thách tuần này!" | If winner: "🏆 Bạn thắng! +100 XP và huy hiệu đã được trao." / If not: "Thử thách tuần này đã kết thúc. Kết quả của bạn: #[rank]." | `paave://grow/challenges` |

**Business Rules:**

| # | Rule |
|---|---|
| BR-NOTIF-06-1 | FR-NOTIF-06.1 fires every Monday regardless of whether the user participated last week. |
| BR-NOTIF-06-2 | FR-NOTIF-06.2 fires only if the user was enrolled in the challenge (logged in on Monday). |
| BR-NOTIF-06-3 | FR-NOTIF-06.3 fires after FR-GAME-04 winner evaluation completes; always sent to enrolled users. |
| BR-NOTIF-06-4 | User rank in push body is their standing at the time the notification is sent (best-effort, not final rank for FR-NOTIF-06.2). |

---

### FR-NOTIF-07: Daily Mission Refresh Notification

- **Priority:** P2
- **Trigger:** Midnight ICT daily mission assignment batch (FR-GAME-08-01), conditional on prior day engagement
- **Actor:** System → Authenticated user
- **Description:** When new daily missions are assigned at midnight ICT, a push notification is sent — but ONLY if the user completed at least 1 mission the previous day. This prevents notification fatigue for disengaged users.

**Notification Specification:**

| Field | Value |
|---|---|
| Push title | "Nhiệm vụ mới hôm nay!" (New missions today!) |
| Push body | "3 nhiệm vụ mới đang chờ bạn. Hoàn thành để nhận XP!" (3 new missions are waiting. Complete them to earn XP!) |
| Deep link | `paave://home` → Home tab (Today's Goals widget) |

**Business Rules:**

| # | Rule |
|---|---|
| BR-NOTIF-07-1 | Notification fires ONLY if user completed ≥1 daily mission in the previous calendar day (ICT). |
| BR-NOTIF-07-2 | Notification fires at 08:00 ICT (not at midnight when batch runs), to avoid disrupting sleep. |
| BR-NOTIF-07-3 | Users who have not completed Module 1 do not receive this notification (no missions assigned). |

---

### FR-NOTIF-08: Module Unlock Notification

- **Priority:** P1
- **Trigger:** FR-LEARN-08 module unlock evaluation → module transitions from `LOCKED` to `UNLOCKED`
- **Actor:** System → Authenticated user
- **Description:** When any learning module transitions to `UNLOCKED` state (per FR-LEARN-08), an immediate push notification is sent with deep link to the newly unlocked module.

**Notification Specification:**

| Module | Push Title | Push Body |
|---|---|---|
| M2 | "Module 2 đã mở khóa!" | "Bạn đã hoàn thành Module 1! **Giao dịch đầu tiên của bạn** đang chờ." |
| M3 | "Module 3 đã mở khóa!" | "Bạn đủ điều kiện học **Tư duy danh mục**. Bắt đầu ngay!" |
| M4 | "Module 4 đã mở khóa!" | "Giao dịch viên tâm lý học đang chờ bạn. Học **Tâm lý Trader** ngay!" |

| Field | Value |
|---|---|
| Deep link | `paave://grow/learning?module={module_id}` → Grow tab, scrolled to unlocked module card |

**Business Rules:**

| # | Rule |
|---|---|
| BR-NOTIF-08-1 | One notification per module unlock per user. Idempotency enforced: if module is already `UNLOCKED`, no re-notification. |
| BR-NOTIF-08-2 | Fires immediately when unlock evaluation completes (not on a schedule). |

---

### FR-NOTIF-09: Weekly Score & Leaderboard Position Notification

- **Priority:** P2
- **Trigger:** FR-GAME-03 Sunday midnight UTC Trader Score computation completes; FR-GAME-09 leaderboard snapshot created
- **Actor:** System → Authenticated user
- **Description:** After Sunday's Trader Score computation and leaderboard update, each active user receives a personal summary push notification with their weekly score and leaderboard rank.

**Notification Specification:**

| Field | Value |
|---|---|
| Push title | "Kết quả tuần của bạn!" (Your weekly results!) |
| Push body | "Điểm tuần này: **[score]**. Xếp hạng: **#[rank]** trong nhóm [segment name in VN]." (This week's score: [score]. Rank: #[rank] in [segment name].) |
| Deep link | `paave://grow/leaderboard?segment={user_segment}` → Leaderboard screen, user's segment |

**Business Rules:**

| # | Rule |
|---|---|
| BR-NOTIF-09-1 | Fires after leaderboard snapshot is created for the user's segment (target: before Monday 08:00 ICT). |
| BR-NOTIF-09-2 | Users with no activity that week receive the notification with score = their computed minimal score. They are not excluded. |
| BR-NOTIF-09-3 | Notification fires only once per week per user; keyed by `(user_id, iso_week)`. |

---

## 6. Gamification Notification Business Rules (Global)

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-NOTIF-GAME-01 | Gamification push notifications (FR-NOTIF-02 through FR-NOTIF-09) respect `notifications_enabled` flag. If `false`, notifications are not sent; inbox entries are still created (except FR-NOTIF-07 which requires push to be meaningful). | If push sent to user with `notifications_enabled = false`, treat as delivery failure; no retry |
| BR-NOTIF-GAME-02 | Maximum 3 gamification push notifications per user per day (aggregate across FR-NOTIF-02 through FR-NOTIF-09). If daily cap is reached, lower-priority notifications are queued for next day. Priority order: FR-NOTIF-02 > FR-NOTIF-03 > FR-NOTIF-08 > FR-NOTIF-06 > FR-NOTIF-04 > FR-NOTIF-05 > FR-NOTIF-07 > FR-NOTIF-09. | 4th notification in same day: held and sent at 08:00 ICT next day (unless it is time-sensitive, e.g., streak reminder — those are discarded if cap reached rather than delayed) |
| BR-NOTIF-GAME-03 | All gamification notifications use the same deep link routing infrastructure as FR-NOTIF-01 (cold start handling, JWT refresh, `pending_deep_link` with 5-minute TTL). | Same as BR-NOTIF-01 |
| BR-NOTIF-GAME-04 | Gamification inbox entries are labelled with a category icon: badge → ★; tier → ↑; streak → 🔥; skill tree → 🌿; challenge → ⚔; mission → ✓; module → 📚; leaderboard → 🏆 | Missing category icon = UI bug, P2 |
