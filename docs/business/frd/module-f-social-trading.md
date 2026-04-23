## Module F: Social Trading P1

> **Purpose:** A track-record-visible social-trading layer, not a peer-learning forum. It exists to help users decide what to paper-trade by surfacing who is trading what with what conviction and what PnL% history. Pseudonymous — no real identity revealed, no absolute VND/KRW amounts shown. Deferred features (real-money copy trading, public portfolio sharing, full following feed, Morning Call) remain V2+.

---

#### FR-SOC-01 — Social Proof on Stock Cards

- **Actor:** Registered User
- **Description:** Stock cards (Discover feed and Stock Detail) display:
  - "X users watching" (users with stock in watchlist)
  - Sentiment ratio: % of posts tagged Bull vs. Bear in last 24h
  - "Trending in VN" / "Trending in KR" badge if stock is in top 10 by community activity for that market
- **Key Rules:**
  - All counts aggregated — no individual user names shown.
  - Updated server-side every 5 minutes; client polls every 5 minutes.
  - Sentiment ratio requires ≥5 posts in 24h to display; below threshold: "Not enough posts yet."
  - Trending badge determined by total post count in last 24h relative to other stocks in same market.
- **Acceptance Criteria:**
  - Given stock has 120 watchers → "120 users watching" shown; updates within 5 minutes when watcher count changes.
  - Given stock has 8 Bull posts and 2 Bear posts in 24h → "80% Bullish" shown.
  - Given stock is top 10 by VN activity → "Trending in VN" badge shown.
- **Edge Cases:** Sentiment data unavailable → hide sentiment section; do not show 0%.
- **Priority:** P1

---

#### FR-SOC-02 — Per-Ticker Community Feed

- **Actor:** Registered User
- **Description:** "Community" tab on Stock Detail page. Shows all posts tagged to that ticker (FR-SOC-03). Reverse chronological. Each post shows: author pseudonym, Trader Score badge, sentiment tag (Bull/Bear/Neutral), post text, timestamp. Tapping author navigates to their public profile (FR-SOC-05).
- **Key Rules:**
  - Feed loads newest 20 posts; infinite scroll loads 20 more per batch.
  - Empty state: "Be the first to post about [TICKER]."
  - Moderation: posts violating community guidelines hidden (server-side moderation flag).
  - Real name never shown; only pseudonym.
- **Acceptance Criteria:**
  - Given stock with 5 posts → all 5 shown in reverse chronological order with author badge and sentiment tag.
  - Given author pseudonym tapped → public profile shown.
- **Edge Cases:** Feed unavailable → "Community feed temporarily unavailable. Check back later."
- **Priority:** P1

---

#### FR-SOC-03 — Post Creation

- **Actor:** Registered User
- **Description:** User writes a post (max 280 characters). Must attach ≥1 $TICKER cashtag (auto-suggested from stock being viewed). Must select sentiment: Bull / Bear / Neutral. 60-second delay before publish (allows user to cancel). Posts cannot contain direct buy/sell directives without analysis context.
- **Key Rules:**
  - Minimum 1 $TICKER cashtag required; max 5 cashtags per post.
  - Cashtag auto-suggested from the stock detail screen the user is currently viewing.
  - Sentiment selection: required (no publish without selecting one).
  - 60-second pending window: countdown shown; "Cancel" button available during this period.
  - Content moderation: posts containing direct "buy this" / "sell this" language without analysis flagged for review and held pending.
  - Post published to: per-ticker community feed (FR-SOC-02) and following feed of users who follow this author (FR-SOC-04).
- **Acceptance Criteria:**
  - Given user writes post, selects Bull, and attaches $VIC → 60s countdown shown; post published after countdown if not cancelled.
  - Given user taps Cancel within 60s → post discarded.
  - Given user writes "BUY VIC NOW" without additional context → post flagged; held for moderation.
- **Edge Cases:** Character count reaches 281 → input field rejects additional characters; counter shows "280/280" in red.
- **Priority:** P1

---

#### FR-SOC-04 — Follow System

- **Actor:** Registered User
- **Description:** Users can follow other users (from public profile, FR-SOC-05). "Following" feed tab shows all public posts from followed users in reverse chronological order. Follower and following counts shown on public profile. Unfollow at any time.
- **Key Rules:**
  - Follow/unfollow is immediate; no approval required.
  - Following feed (V2 deferred to full V2 release): listed here as scoped requirement; the "Following" tab exists in V2 but may be behind a flag.
  - No notification sent to followed user when someone follows them (in V2; V3 may add).
  - Max follows: 1,000 per user.
- **Acceptance Criteria:**
  - Given user follows 3 accounts → Following tab shows those 3 users' posts in reverse chronological order.
  - Given unfollow → their posts no longer appear in Following tab.
- **Edge Cases:** User follows themselves → prevented; error "You can't follow yourself."
- **Priority:** P1

---

#### FR-SOC-05 — Social Profile

- **Actor:** Registered User (public-facing)
- **Description:** Public profile page shows: pseudonym, Trader Tier badge (FR-GAME-02), Trader Score (FR-GAME-03), post count, follower count, following count, joined date. Real name never shown unless user explicitly opts in via Settings.
- **Key Rules:**
  - Default: pseudonym only. Real name opt-in in Profile settings (FR-49).
  - Joined date shown as month + year (e.g., "Joined March 2026").
  - All post history visible on public profile (reverse chronological, paginated 20/load).
  - Block user option available from public profile (V2 scope); blocked users' posts hidden from feed.
- **Acceptance Criteria:**
  - Given user navigates to another user's public profile → pseudonym, tier badge, score, counts, joined date shown. Real name not shown.
  - Given opt-in to real name display → real name shown on own public profile.
- **Edge Cases:** User deactivated account → public profile shows "[Deleted User]"; posts remain but pseudonym replaced.
- **Priority:** P1

---

