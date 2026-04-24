# FRD-13: Social Trading

**Version:** 2.4
**Date:** 2026-04-21
**Status:** Authoritative — v2.4 supersedes all prior versions
**Product:** Paave — Vietnam Gen Z Paper Trading & Social Investing App

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | Social Trading — Social Proof on Stock Cards, Per-Ticker Community Feed, Post Creation, Follow System, Social Profile |
| Primary Actors | Authenticated User (author, viewer, follower), System (moderation engine, social proof aggregator) |
| Goal | Enable users to share market sentiment and analysis on paper trading in a pseudonymous, peer-learning community. Social features support — not replace — the core paper trading experience. |
| Trigger | Varies: stock card view (FR-SOC-01), stock detail view (FR-SOC-02), post composition (FR-SOC-03), profile view (FR-SOC-04, FR-SOC-05) |
| Identity Default | All users are pseudonymous by default. Real name never shown unless user explicitly opts in via Settings (BR-24). |
| Post Char Limit | 500 characters maximum (v2.4 authoritative; supersedes 280-char limit from FRD v2.2) |
| Market Context | VN (HOSE/HNX/UPCOM) primary. KR/Global reference-only. Social proof shown separately for VN and KR markets. |

---

## 2. Functional Requirements

---

### FR-SOC-01: Social Proof on Stock Cards

- **Priority:** P1
- **Actor:** System (aggregator, runs every 5 minutes), Authenticated User (viewer)

**Description:**
Stock cards displayed throughout the app (search results, Discover feed, watchlist) show real-time social proof signals. These signals help users understand community interest and sentiment without revealing individual identities.

**Social Proof Elements on Stock Card:**

| Element | Description | Threshold / Logic |
|---------|-------------|-------------------|
| Watchers count | "X users watching" — count of authenticated users who have this stock on their watchlist | Always shown; no minimum threshold |
| Sentiment ratio | "X% Bullish" or "X% Bearish" — based on Bull vs Bear sentiment tags on community posts in the last 24 hours | Requires ≥5 posts in last 24h; below threshold: "Not enough posts yet" |
| Trending badge | "Trending in VN" or "Trending in KR" — top 10 stocks by total community activity (posts + watchlist adds) in that market in the last 24h | Exactly top 10 per market; shown as a badge overlay on card |

**Sentiment Ratio Calculation:**
- Neutral posts are excluded from the ratio calculation
- Formula: `bull_count / (bull_count + bear_count) * 100%` = Bullish percentage
- Bear percentage = `100% - Bullish percentage`
- Example: 8 Bull posts + 2 Bear posts (+ 3 Neutral, excluded) = "80% Bullish"
- Displayed as: "80% Bullish" or "20% Bearish" (whichever is dominant) with a simple bar/icon indicator

**Update Frequency:**
- Server-side aggregation: every 5 minutes
- Client polling: every 5 minutes
- Client does not use WebSocket (polling is sufficient for this update frequency)
- Displayed value may be up to 5 minutes stale — this is acceptable

**Privacy:**
- All counts are aggregated; no individual user names, avatars, or profiles exposed in social proof
- "X users watching" is a count only

**Trending Badge Logic:**
- Top 10 by community activity score = (post count in last 24h) + (new watchlist adds in last 24h)
- Separate top-10 lists for VN and KR markets
- Stock can be "Trending in VN" and "Trending in KR" simultaneously (if it trades on both markets — edge case)
- A stock not in top 10 shows no trending badge

**Precondition:** User is authenticated; stock card is rendered.

**Postcondition:** Social proof signals displayed; updated within last 5 minutes.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-SOC-01-01 | VIC has 142 users with it on watchlist | Stock card renders | "142 users watching" shown |
| AC-SOC-01-02 | VIC has 8 Bull posts + 2 Bear posts in last 24h (total ≥5) | Stock card renders | "80% Bullish" sentiment shown |
| AC-SOC-01-03 | VIC has 4 posts in last 24h (below 5 threshold) | Stock card renders | "Not enough posts yet" shown for sentiment |
| AC-SOC-01-04 | VIC is in top 10 by community activity in VN | Stock card renders | "Trending in VN" badge shown |
| AC-SOC-01-05 | Stock not in top 10 | Stock card renders | No trending badge shown |
| AC-SOC-01-06 | All Bull posts (0 Bear posts) in last 24h (≥5 total) | Stock card renders | "100% Bullish" |
| AC-SOC-01-07 | Aggregator ran 3 minutes ago | Client renders stock card | Shows data from most recent aggregation (up to 5 min stale is acceptable) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Aggregation job fails | Last successful aggregation data shown; stale label not added (5-min window is acceptable staleness) |
| Watcher count = 0 | "0 users watching" shown; do not hide element |
| 5 Neutral posts only (no Bull or Bear) | "Not enough posts yet" (Neutral posts do not count toward sentiment threshold) |
| Stock newly listed (no data yet) | "0 users watching"; "Not enough posts yet"; no trending badge |
| Client fails to poll (no network) | Last cached value shown; no loading error displayed for social proof |

---

### FR-SOC-02: Per-Ticker Community Feed

- **Priority:** P1
- **Actor:** Authenticated User (reader), System (moderation engine)

**Description:**
The Stock Detail screen includes a "Community" tab showing all posts tagged to that specific ticker. Posts are displayed in reverse chronological order. Each post shows enough context to understand the author's tier and sentiment without revealing real identity.

**Feed Access:** "Community" tab on Stock Detail screen (tab appears alongside Price, Chart, Financials tabs).

**Post Display — Each Post Contains:**

| Field | Display | Notes |
|-------|---------|-------|
| Author pseudonym | Text | As set by user; never real name unless opted in |
| Trader Tier badge | Small badge icon + tier name | e.g., "Analyst" badge |
| Sentiment tag | Colored chip: Bull (green) / Bear (red) / Neutral (grey) | Set by post author at creation |
| Post text | Full text of post | Max 500 chars; truncation at 300 chars with "Read more" expand |
| Cashtags | Highlighted $TICKER links | Each cashtag is tappable → navigates to that stock's detail screen |
| Timestamp | Relative time for <24h ("2 hours ago"); absolute date for older ("Apr 15, 2026") | |

**Loading / Pagination:**
- Initial load: 20 most recent posts
- Infinite scroll: load next 20 posts when user scrolls within 200px of list bottom
- Loading state: skeleton loader rows shown while fetching

**Empty State:**
- Message: "Be the first to post about [TICKER]."
- "Post about [TICKER]" CTA button that opens FR-SOC-03 with this ticker pre-loaded

**Moderation:**
- Posts flagged by server-side moderation engine: hidden from feed
- Hidden posts do not show any placeholder (post simply absent from feed)
- Users are not notified when their post is hidden (content review process handled separately)
- Moderation does not affect post count on profile (hidden posts still counted)

**Author Tap Navigation:**
- Tapping author pseudonym → navigates to that user's public profile (FR-SOC-05)

**Precondition:** User is on Stock Detail screen; "Community" tab selected.

**Postcondition:** Feed rendered with posts; user can scroll for more.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-SOC-02-01 | VIC has 45 community posts | User opens Community tab | First 20 posts shown, reverse chronological |
| AC-SOC-02-02 | User scrolls near bottom | 20 posts visible | Next 20 posts fetched; appended below |
| AC-SOC-02-03 | VIC has 0 posts | Community tab opened | "Be the first to post about VIC." shown with Post CTA |
| AC-SOC-02-04 | Post has 3 cashtags | Post rendered | Each $TICKER highlighted and tappable |
| AC-SOC-02-05 | Post older than 24h | Timestamp shown | Absolute date shown (e.g., "Apr 15, 2026") |
| AC-SOC-02-06 | Post is moderation-flagged | Feed renders | Post absent; no gap or placeholder |
| AC-SOC-02-07 | User taps author name | Profile navigation | Navigates to FR-SOC-05 profile of that user |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Network error on initial load | Error state: "Could not load community posts. Pull to refresh." |
| Network error on infinite scroll | Toast: "Could not load more posts. Please try again." |
| Post text = 500 characters | Full text shown; no "Read more" needed |
| Post text > 300 characters | Truncated at 300 chars; "Read more" link expands inline |
| Feed load results in 0 posts (all moderated) | Empty state shown as if no posts exist |

---

### FR-SOC-03: Post Creation

- **Priority:** P0 — v2.4 amendment
- **Actor:** Authenticated User (author)

**Description:**
Authenticated users can create posts about stocks. A post must include text, at least one $TICKER cashtag, and a sentiment selection. The maximum post length is 500 characters (v2.4 authoritative — this supersedes the 280-character limit from FRD v2.2). A 60-second cancel window is available after submission.

**Access Points:**
- "Post" button on Stock Detail Community tab (ticker pre-loaded)
- Global compose button in the app (no ticker pre-loaded; user must add cashtag manually)

**Post Composition UI:**

| Element | Behavior |
|---------|---------|
| Text input area | Free-form text; max 500 characters |
| Character counter | Shows remaining characters as "432 / 500"; counter text turns red when ≤20 characters remain |
| Cashtag field / inline detection | Detects $TICKER format in text; auto-suggests tickers from current context (current Stock Detail screen); max 5 cashtags per post |
| Sentiment selector | Required radio/chip selection: Bull / Bear / Neutral |
| Submit button | Disabled if: text is empty, text >500 chars, no sentiment selected, no cashtag present |

**Validation Rules:**

| Rule | Frontend | Backend (API) |
|------|----------|---------------|
| Min 1 character | Submit button disabled | E-SOC-301 if bypassed |
| Max 500 characters | Submit button disabled at >500; counter turns red at ≤20 remaining | E-SOC-301 if bypassed: "Post must be 1–500 characters." |
| Min 1 $TICKER cashtag | Submit button disabled | E-SOC-302: "Post must include at least one $TICKER" |
| Max 5 $TICKER cashtags | 6th cashtag addition blocked in UI | E-SOC-303 if bypassed: "Post may include up to 5 cashtags" |
| Sentiment required | Submit button disabled | E-SOC-304: "Please select a sentiment" |

**Cashtag Format:**
- Format: `$TICKERSYMBOL` (dollar sign prefix; uppercase ticker)
- Example: `$VIC`, `$VNM`, `$SAMSUNG`
- Tickers must be from supported markets (VN or KR); invalid tickers show warning but do not block submission (validation is best-effort at compose time; backend validates on submit)
- Cashtags auto-detected in text input as user types (no separate cashtag field — inline detection)

**60-Second Cancel Window:**
- After user taps "Submit" and passes all validations: post is submitted to backend
- A cancel timer UI is shown: countdown "Cancel (58s)" button visible for 60 seconds
- If user taps "Cancel" within 60 seconds: post is soft-deleted (hidden from all feeds immediately); permanent delete after 60 seconds
- After 60 seconds: post is permanently published; cancel option expires
- The cancel timer is visible over the feed; user can still scroll while timer runs

**Content Moderation:**
- Server-side moderation runs after submission
- Pattern: direct "buy this"/"sell this" language without accompanying analysis → post flagged and held for review
- Flagged posts are not shown in feeds while under review
- User sees their post as "Under review" in their profile post history; others do not see it
- Moderation decision (approve/reject) handled by separate moderation process (out of scope for this document)

**Publication:**
On successful submission (past cancel window):
1. Post appears in per-ticker community feed (FR-SOC-02) for all tagged tickers
2. Post appears in "Following" feed of users who follow the author (FR-SOC-04)
3. Post appears in author's own profile post history (FR-SOC-05)

**Precondition:** User is authenticated and on the post composition screen.

**Postcondition:** Post created; appearing in relevant feeds (after cancel window expires); flags logged if moderation triggered.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-SOC-03-01 | Text = "VIC looks strong this week $VIC", sentiment = Bull, 1 cashtag | User taps Submit | Post submitted; cancel timer shown for 60s |
| AC-SOC-03-02 | Text is empty | User views form | Submit button disabled |
| AC-SOC-03-03 | Character count reaches 481 | User types | Counter shows "19 / 500" in red |
| AC-SOC-03-04 | Text >500 characters entered via paste | Paste occurs | Input truncated to 500 characters; counter shows "0 / 500" in red; submit disabled |
| AC-SOC-03-05 | No sentiment selected | User views form | Submit button disabled |
| AC-SOC-03-06 | No cashtag in post | User views form | Submit button disabled |
| AC-SOC-03-07 | User taps "Cancel" at second 45 | Cancel tapped | Post soft-deleted immediately; no longer appears in any feed |
| AC-SOC-03-08 | 60 seconds pass after submit | Timer expires | Post permanently published; appears in feeds |
| AC-SOC-03-09 | API called with 501 characters (bypassed frontend) | API receives | Returns E-SOC-301: "Post must be 1–500 characters." |
| AC-SOC-03-10 | Post contains "buy $VIC right now" with no analysis | Submitted | Post held for moderation review; shown as "Under review" in author's history |
| AC-SOC-03-11 | Post created on Stock Detail for VIC | Published | Post appears in VIC community feed (FR-SOC-02) + followers' feed (FR-SOC-04) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Submit API call fails (network error) | Post not created; error toast: "Could not post. Please try again." Cancel timer not started. |
| User force-quits during cancel window | Post remains in soft-delete state; permanently deleted after 60s window by background job |
| User has multiple cashtags, one is invalid ticker | Warning shown ("$INVALID may not be a valid ticker") but submission is not blocked |
| User types cashtag without $ prefix (e.g., "VIC") | Not auto-detected as cashtag; user must include $ prefix |
| 5 cashtags already added, user tries to add 6th | 6th cashtag blocked in UI; existing 5 retained |
| Post content is entirely whitespace | Treated as empty; submit disabled |

---

### FR-SOC-04: Follow System

- **Priority:** P1
- **Actor:** Authenticated User (follower), System

**Description:**
Users can follow other users to see their posts in a dedicated "Following" feed. Following is immediate with no approval step. Counts are publicly displayed on profiles.

**Follow Action:**
- Follow button available on public profile screen (FR-SOC-05)
- Following is immediate on tap; no confirmation screen; no approval required from followed user
- The followed user receives no notification when followed (notification feature is V2 scope)

**Unfollow Action:**
- Unfollow button shown in place of Follow on profiles the user is already following
- Unfollow is immediate on tap
- On unfollow: posts from the unfollowed user are removed from the "Following" feed on next feed refresh

**Following Feed:**
- Tab label: "Following"
- Shows posts from all users the authenticated user follows
- Reverse chronological order
- Empty state (no follows): "Follow other traders to see their posts here."
- V2 note: the Following feed tab is deferred behind a feature flag in V1; tab visible but may be gated

**Follower / Following Counts:**
- Displayed on public profile: "X Followers" and "X Following"
- Counts update in real-time on profile page (or within 5 minutes; eventual consistency acceptable)

**Follow Constraints:**

| Constraint | Rule | Error |
|-----------|------|-------|
| Self-follow | User cannot follow themselves | Inline message: "You can't follow yourself." Follow button not shown on own profile |
| Max follows | A user can follow at most 1,000 other users | When at 1,000, follow button disabled with tooltip: "You've reached the maximum follow limit (1,000)." |

**Precondition:** User is authenticated; viewing another user's public profile.

**Postcondition:** Follow relationship recorded (or removed); Following feed updated accordingly.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-SOC-04-01 | User A views User B's profile (not following) | Taps "Follow" | Follow relationship created; button changes to "Following"; B's follower count +1 |
| AC-SOC-04-02 | User A is following User B | A views B's profile | "Following" button shown |
| AC-SOC-04-03 | User A taps "Unfollow" on B | Unfollow tapped | Follow relationship removed; B's posts removed from A's Following feed on next refresh |
| AC-SOC-04-04 | User views own profile | Profile renders | No Follow/Unfollow button shown (cannot follow self) |
| AC-SOC-04-05 | User already following 1,000 accounts | Views another profile | Follow button disabled with "maximum follow limit" tooltip |
| AC-SOC-04-06 | User A follows User B | No notification | B receives no notification (V1; notification in V2) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Follow API call fails | Toast: "Could not follow user. Please try again."; button reverts to "Follow" state |
| User B deactivates account while A is following B | B's posts hidden in feed; B's profile shows "[Deleted User]"; follow relationship retained in DB but B's posts not delivered |
| Follower count display lag | Eventual consistency acceptable; count updates within 5 minutes |
| Simultaneous follow/unfollow (race condition) | Server-side idempotency; last write wins |

---

### FR-SOC-05: Social Profile

- **Priority:** P1
- **Actor:** Authenticated User (viewer), Profile Owner

**Description:**
Every user has a public-facing social profile. By default, the profile shows only the pseudonym (display name), never the real name. Users can opt into displaying their real name via Settings. The profile shows the user's social standing, activity history, and gamification tier.

**Profile Header — Always Shown:**

| Field | Display | Notes |
|-------|---------|-------|
| Pseudonym / Display Name | Text | Real name only if user opted in (BR-24) |
| Trader Tier Badge | Large badge with tier name | Localized to viewer's language |
| Trader Score | "Trader Score: X" | Most recent weekly score (0–100) |
| Post count | "X Posts" | Total posts by this user |
| Follower count | "X Followers" | Count of users following this user |
| Following count | "X Following" | Count of users this user follows |
| Joined date | "Joined [Month] [Year]" e.g., "Joined March 2026" | Exact day NOT shown; month + year only |
| Avatar | User-set avatar image or default placeholder | |

**Real Name Display:**
- Default: NOT shown
- If user has opted in (Settings > Privacy > Show real name): real name shown below or beside pseudonym
- The opt-in is per-user (profile owner controls their own visibility setting)
- Viewer cannot see real name unless profile owner has enabled it

**Post History Section:**
- Reverse chronological list of all posts by this user
- Each post: same format as community feed (FR-SOC-02)
- Pagination: 20 posts per load; "Load more" button or infinite scroll (same pattern as FR-SOC-02)
- Moderated/flagged posts: shown as "Under review" (only to the profile owner); hidden entirely from other viewers

**Deactivated Account Display:**
- Pseudonym replaced with "[Deleted User]"
- Avatar replaced with default placeholder
- Trader Tier, Score, follower/following counts: hidden
- Joined date: hidden
- Post history: posts remain visible with "[Deleted User]" as author (posts are not deleted on account deactivation)
- Follow/Unfollow button: hidden (cannot follow a deactivated account)

**Block Feature:**
- V2 scope — not available in V1
- Block button not shown in V1 UI

**Own Profile vs. Others' Profile:**
- Own profile: viewed from Profile tab in bottom navigation
- Others' profiles: accessed by tapping author name in community feed, following list, or search
- On own profile: "Edit Profile" button shown; no Follow/Unfollow button
- On others' profile: Follow/Unfollow button shown (FR-SOC-04); no "Edit Profile" button

**Precondition:** User is authenticated; taps on a user's name in community feed or navigates to profile.

**Postcondition:** Profile displayed with accurate, real-time (or near-real-time) data.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-SOC-05-01 | User A views User B's profile | Profile renders | Pseudonym, Tier badge, Trader Score, post count, follower/following counts, joined date shown |
| AC-SOC-05-02 | User B has real name display OFF (default) | A views B's profile | Real name NOT shown; only pseudonym |
| AC-SOC-05-03 | User B has real name display ON | A views B's profile | Real name shown below or beside pseudonym |
| AC-SOC-05-04 | User views own profile | Own profile opens | "Edit Profile" shown; no Follow button |
| AC-SOC-05-05 | User B's account deactivated | A views B's profile | "[Deleted User]" shown; posts remain; tier/score/counts hidden |
| AC-SOC-05-06 | B's post is "Under review" (moderation) | A views B's profile | Post hidden from A's view |
| AC-SOC-05-07 | B's post is "Under review" | B views own profile | Post shown as "Under review" |
| AC-SOC-05-08 | User B joined in March 2026 | Profile renders | "Joined March 2026" shown (not exact day) |
| AC-SOC-05-09 | User B has 45 posts | Profile renders, user scrolls | First 20 shown; "Load more" or scroll loads next 20 |
| AC-SOC-05-10 | User B's Trader Tier is Tier 3 | Viewer's language = Korean | Badge shows "분석가" (Korean label for Analyst) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Profile load fails (network error) | Error state: "Could not load profile. Pull to refresh." |
| User has 0 posts | Post history section shows: "No posts yet." |
| Profile owner changes pseudonym | New pseudonym reflected on profile; all prior posts in community feed updated to show new pseudonym |
| Follower/following count API fails | Counts show last cached value; no error shown to user |
| Post with cashtag on profile; tapping cashtag | Navigates to that stock's detail screen |

---

## 3. Business Rules

| ID | Rule | Scope | Violation Behavior |
|----|------|-------|--------------------|
| BR-23 | Every post must have: (a) min 1 character of text, (b) min 1 $TICKER cashtag, (c) exactly 1 sentiment selection (Bull/Bear/Neutral). A 60-second cancel window is available post-submission. | FR-SOC-03 | Missing any requirement: submit blocked (frontend); E-SOC-302/304 if bypassed (backend) |
| BR-24 | User real names are hidden by default. Real name shown on public profile only if the user explicitly opts in via Settings > Privacy > Show real name. | FR-SOC-05 | System must not expose real name unless opt-in flag is explicitly true |
| BR-SOC-01 | Maximum 5 $TICKER cashtags per post. | FR-SOC-03 | 6th cashtag blocked in UI; E-SOC-303 if bypassed via API |
| BR-SOC-02 | Maximum 1,000 accounts a user may follow. | FR-SOC-04 | Follow button disabled at limit; E-SOC-401 if bypassed via API |
| BR-SOC-03 | Post text must be between 1 and 500 characters (inclusive). 500-char limit is authoritative from v2.4 and supersedes any previous 280-char limit. | FR-SOC-03 | Frontend: submit disabled. API: E-SOC-301 if >500 chars received. |
| BR-06 | Social proof counts (watchers, sentiment, trending) updated server-side every 5 minutes; clients poll every 5 minutes. | FR-SOC-01 | Stale data (up to 5 min) is acceptable; no real-time WebSocket required |
| BR-SOC-04 | A user cannot follow themselves. | FR-SOC-04 | Follow button hidden on own profile; E-SOC-402 if attempted via API |
| BR-SOC-05 | Sentiment ratio on stock cards requires ≥5 Bull or Bear posts in the last 24 hours. Below threshold: "Not enough posts yet." Neutral posts do not count toward the threshold. | FR-SOC-01 | Threshold not met → fallback copy shown |
| BR-SOC-06 | Content moderation (direct "buy this"/"sell this" without analysis) holds the post for review. The post is hidden from all feeds while under review. The author sees "Under review" on their own profile. | FR-SOC-03 | Moderation flag → post removed from public feeds; pending review queue |
| BR-SOC-07 | On account deactivation, the user's posts remain visible in community feeds and ticker feeds. The author name is replaced with "[Deleted User]." | FR-SOC-05 | Posts not deleted; pseudonym replaced |
| BR-SOC-08 | The "Following" tab/feed is behind a feature flag in V1 and may be disabled in production. Feature flag must be configurable per environment. | FR-SOC-04 | Feature flag = false → tab hidden; follow/unfollow mechanics still function |
| BR-SOC-09 | Trending stocks are the top 10 by community activity score per market (VN and KR independently). Community activity score = post count + new watchlist adds in last 24h. | FR-SOC-01 | Ties in score: use alphabetical ticker order as tiebreaker |

---

## 4. Social Data Model Reference

| Field | Table | Type | Notes |
|-------|-------|------|-------|
| `post_id` | `posts` | UUID | Primary key |
| `author_id` | `posts` | UUID FK → users | Author reference |
| `text` | `posts` | VARCHAR(500) | Post body; max 500 chars |
| `sentiment` | `posts` | ENUM('bull','bear','neutral') | Required; set at creation |
| `cashtags` | `post_cashtags` | Array / join table | 1–5 ticker symbols per post |
| `moderation_status` | `posts` | ENUM('approved','under_review','rejected') | Default 'approved'; moderation engine updates |
| `cancel_expires_at` | `posts` | TIMESTAMP | Set to `created_at + 60s`; after expiry post is permanently public |
| `is_soft_deleted` | `posts` | BOOLEAN | True during 60s cancel window if user cancels |
| `follower_id` | `follows` | UUID FK → users | Who is following |
| `following_id` | `follows` | UUID FK → users | Who is being followed |
| `created_at` | `follows` | TIMESTAMP | When follow was created |
| `watcher_count` | `social_proof_cache` | INTEGER | Aggregated every 5 min |
| `bull_count_24h` | `social_proof_cache` | INTEGER | Bull posts in last 24h |
| `bear_count_24h` | `social_proof_cache` | INTEGER | Bear posts in last 24h |
| `is_trending_vn` | `social_proof_cache` | BOOLEAN | True if in top 10 VN activity |
| `is_trending_kr` | `social_proof_cache` | BOOLEAN | True if in top 10 KR activity |

---

## 5. Error Code Reference

| Code | Trigger | HTTP Status | User-Facing Message |
|------|---------|-------------|---------------------|
| E-SOC-301 | Post text <1 or >500 characters (API-level) | 422 | "Post must be 1–500 characters." |
| E-SOC-302 | Post missing at least one cashtag (API-level) | 422 | "Post must include at least one $TICKER." |
| E-SOC-303 | Post has >5 cashtags (API-level) | 422 | "Post may include up to 5 cashtags." |
| E-SOC-304 | Post missing sentiment selection (API-level) | 422 | "Please select a sentiment (Bull, Bear, or Neutral)." |
| E-SOC-401 | Follow exceeds 1,000 limit (API-level) | 422 | "You've reached the maximum follow limit of 1,000 accounts." |
| E-SOC-402 | User attempts to follow self (API-level) | 422 | "You can't follow yourself." |
