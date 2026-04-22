### NOTIFICATIONS

#### FR-42 — Push Notification Permission Request

- **Actor:** New User
- **Description:** After email verification, custom in-app modal explains notification value before triggering OS permission dialog. "Allow" → triggers OS dialog. "Skip" → dismisses, preference `notifications_enabled = false`.
- **Key Rules:** No re-request of OS permission after denial (follows OS rules).
- **Acceptance Criteria:**
  - Given "Allow" tapped and OS grants → push token registered; `notifications_enabled = true`.
  - Given "Skip" → no OS dialog; user can enable later in settings.
- **Edge Cases:** OS dialog denied after "Allow" tap → preference set false; no retry.
- **Priority:** P0

---

#### FR-43 — Price Alert Notification

- **Actor:** Registered User (with alert set)
- **Description:** Push notification within 60 seconds of threshold crossed. Title: "[TICKER] Alert Triggered." Body: "[Company] is now at [price] ([±%] today)." Alert deactivated after trigger.
- **Key Rules:** BR-03 (one alert per stock), BR-04 (one-time trigger). Tapping notification → Stock Detail.
- **Acceptance Criteria:**
  - Given VIC alert "Price above 55000" and price crosses 55000 → notification within 60s; alert deactivated.
- **Edge Cases:** Notifications disabled → alert tracked silently; no push.
- **Priority:** P0

---

#### FR-44 — Market Open Notification

- **Actor:** Registered User
- **Description:** Optional push at market open for user's preferred market. "Vietnam market is now open. See what's trending." Togglable in settings. Once per trading day.
- **Key Rules:** Only sent if user opted in; deduped per day.
- **Acceptance Criteria:**
  - Given opt-in → notification at VN market open (09:00 ICT); tapping → Markets tab.
- **Edge Cases:** Market holiday → no notification; next trading day notification sent instead.
- **Priority:** P1

---

#### FR-45 — Market Close Notification

- **Actor:** Registered User
- **Description:** Optional push at market close: "VN-Index closed at [value] ([±%] today)." Togglable. Once per trading day.
- **Key Rules:** Only sent if opted in; uses final close value.
- **Acceptance Criteria:**
  - Given opt-in and market closes → notification with final index value.
- **Edge Cases:** Feed unavailable at close → no notification for that day.
- **Priority:** P1

---

#### FR-46 — Watchlist Price Movement Notification

- **Actor:** Registered User (with watchlist)
- **Description:** End-of-day push for watchlist stocks with ≥±5% daily change. Max 3 notifications per user per day (top 3 by absolute change).
- **Key Rules:** BR-11: cap at 3, selected by highest absolute % change. Opt-in via settings.
- **Acceptance Criteria:**
  - Given 5 watchlist stocks moved ≥5% → top 3 by absolute change notified.
- **Edge Cases:** User has 0 watchlist stocks → no notification sent.
- **Priority:** P1

---

#### FR-47 — Notification History

- **Actor:** Registered User
- **Description:** Notification inbox in Profile. All notification types stored 30 days in reverse chronological order. Unread: bold. Tapping: mark read + navigate to relevant screen. Entries >30 days auto-deleted.
- **Key Rules:** All notification types stored: price alerts, market open/close, watchlist movements, AI behavioral nudges (FR-AI-05), portfolio health (FR-AI-04).
- **Acceptance Criteria:**
  - Given 2 price alert notifications → both appear in inbox; unread shown in bold.
- **Edge Cases:** Inbox empty → "No notifications yet."
- **Priority:** P1

---

