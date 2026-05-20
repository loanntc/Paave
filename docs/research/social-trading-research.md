# Social Trading Features Research
## Paave — Phase 2 Social Layer — April 2026

> **Research scope:** This document defines the social trading feature set for Paave's Phase 2 roadmap. The target is a hybrid between Threads (Meta) and Binance's social/copy trading features, applied to stock market discussion and discovery for Gen Z users in Vietnam and Korea.
>
> **Web search status:** WebSearch was unavailable during this session. All analysis is based on training knowledge (current through August 2025), documented industry patterns, and Paave's existing context files. Platform mechanics described below reflect each platform's well-documented feature set.

---

## TL;DR

- **Threads-for-stocks model is right** — but StockTwits failed Gen Z because it became noise. Public.com succeeds because it pairs social with education and curated intent.
- **eToro's copy trading is the gold standard** — transparent trader profiles, verified performance stats, one-tap copy. Binance Square skews too crypto-native to directly transpose.
- **Social proof on stock cards drives engagement** — "X people watching" is the single highest-converting signal on Robinhood and Public.com's discover feeds.
- **Portfolio sharing needs a privacy-first default** — offer anonymized sharing, pseudonym support, and per-holding hide controls before asking users to go public.
- **Paper trading copy is the safest Phase 2 bet** — no regulatory exposure, clear "game" framing, and direct precedent in Investopedia's Stock Simulator.
- **Per-ticker chat rooms have a moderation cost problem** — the successful ones (moomoo, Public.com) use curated, rate-limited community tabs rather than raw open chat.
- **Leaderboards must use paper trading only at first** — real money leaderboards create pump-and-dump risk and regulatory scrutiny.
- **Zalo/KakaoTalk are not features — they are behaviors** — Paave needs to replicate the speed, intimacy, and authority of a trusted group chat, not a public forum.

---

## 1. Threads-Style Feed for Stocks

### How StockTwits Works

StockTwits (founded 2008) is the original stock social network. Its core mechanic:

- Posts ("streams") are short-form, capped at 1,000 characters
- Every post can be tagged with a `$TICKER` cashtag (e.g., `$VCB`, `$AAPL`) — clicking a cashtag filters all posts for that stock
- Users declare sentiment on each post: **Bullish** or **Bearish** (with a directional arrow icon)
- Aggregated sentiment per ticker creates a **Sentiment Gauge** — a percentage split between bulls and bears
- Users follow other users or specific tickers
- Trending stocks, trending topics, and top community members surface in discovery

**What StockTwits got right:**
- Cashtag discovery is genuinely useful — filtering all posts about `$NVDA` is the Twitter hashtag applied to stocks
- Sentiment signal is unique — no other platform shows real-time crowdsourced bull/bear ratio
- Simple posting model lowers barrier to contribute

**Why StockTwits fails Gen Z (2024–2026):**
- UI feels dated — web-first, Twitter-clone aesthetic that reads as a 2012 product
- Content quality collapsed post-2021 — during the meme stock boom, StockTwits became a pump-and-dump coordination layer for retail traders, and that reputation stuck
- No mobile-native redesign that meets Gen Z UX expectations
- No educational layer — pure "tips and calls" culture with no context
- Vietnamese and Korean stocks virtually absent — the platform is 95% US equities
- No moderation trust signals — no verified credentials, no performance track records attached to posts

**Key StockTwits mechanic to borrow for Paave:**
- `$TICKER` cashtag auto-linking within posts → every mention of VCB, FPT, HYBE routes to that stock's card
- Bull/Bear sentiment on posts → aggregate per-ticker sentiment gauge on the stock detail screen
- Stream per ticker → dedicated "Community" tab on every stock's detail page

---

### How Public.com's Social Feed Works

Public.com (US, founded 2019) is the closest real-world execution of the Paave social vision:

**Core mechanics:**
- Every user has a public portfolio (by default) displayed on their profile — holdings, allocation percentages, recent activity
- The home feed shows activity from people you follow: trades made, positions opened/closed, written commentary
- Users can post "notes" — short-form analysis tied to a specific stock or theme
- Stock cards include a "People holding this" counter and a social feed tab showing community posts about that stock
- "Trending in your network" section surfaces stocks that people you follow are interacting with
- Public.com added an audio social layer (Public Live) — live audio discussions on stocks — which positioned it above StockTwits for content depth

**What Public.com gets right for Gen Z:**
- Portfolio transparency as the default — social proof is structural, not optional
- Clean mobile-first design that feels like a consumer app, not a Bloomberg terminal
- Community feels curated — Public has creator programs for top contributors
- Educational positioning ("learn by watching what smart investors do") appeals to F0 investors

**What Public.com gets wrong:**
- US-only equities; VN/KR stocks don't exist on the platform
- The "follow people" model only works when there are enough interesting people to follow — cold start problem is severe
- Real money trading + public portfolios creates social pressure that can encourage imprudent behavior ("I need to make a trade so people see activity")

---

### Recommendation for Paave: The Paave Feed

**Model:** Threads-like scrollable feed with mandatory cashtag linking and optional sentiment tagging.

**Specific mechanics:**

1. **Cashtag auto-link:** Any `$TICKER` in a post auto-links to the stock card. For VN stocks, support both shorthand (VCB) and full name detection.

2. **Post format:** Short posts (280–500 chars). Support text, image attachment (chart screenshots), and an embedded stock card widget. No link previews — keep it in-app.

3. **Sentiment on posts:** Each post has an optional bull/bear/neutral tag. This feeds into the per-ticker sentiment gauge on the stock detail page.

4. **Follow graph:** Follow users (not just tickers). When you follow someone, their posts appear in your feed. This is more personal and trust-based than a public forum.

5. **For You feed:** An algorithmic feed (separate tab from Following) that surfaces posts about stocks in your watchlist and trending posts in your market (VN/KR/Global).

6. **Reply threads:** Replies are nested one level (like Threads, not Reddit). Long chains kill Gen Z engagement.

7. **Reactions, not just likes:** Support reactions beyond like — "fire" for conviction, "skeptical" for doubt, "learning" for posts that teach. This is richer signal than a like count and feels more expressive for Gen Z.

**What to avoid:**
- Do NOT default to a public firehose of all posts. The cold start problem makes a global feed useless initially. Start with "Following" feed + "Trending in VN" / "Trending in KR" curated sections.
- Do NOT allow anonymous callouts of specific users — this becomes harassment quickly.
- DO NOT import Twitter/StockTwits content — it dilutes the quality of the native community.

---

## 2. Binance Social Trading Features

### How Binance Copy Trading Works

Binance launched Copy Trading in 2023 for futures and spot crypto. The mechanics are well-documented:

**Lead Trader (signal provider) mechanics:**
- Any user can apply to become a Lead Trader by meeting minimum requirements (trade history, minimum AUM managed)
- Lead Traders have a public profile showing: total return %, max drawdown, win rate, Sharpe ratio, asset allocation, trade history (anonymized by default at position level)
- Lead Traders earn a profit share (up to 10%) of copiers' gains

**Copier mechanics:**
- Browse Lead Trader leaderboard filtered by: ROI, max drawdown, number of copiers, assets traded
- One-tap copy — allocate a fixed capital amount to copy a trader proportionally
- Set max loss limits (risk controls) before copying
- Copy can be stopped at any time
- Copiers see their own P&L from the copy, not the raw trader's P&L

**Binance Square:**
- Binance Square is Binance's social content layer — a feed of short posts, articles, and analysis by traders and influencers
- Posts can be tagged with crypto assets
- Content from Lead Traders gets amplified in Square as social proof ("This trader has 12,000 copiers and just posted about BTC")
- Square integrates with the copy trading mechanic — you can follow a trader in Square and one-tap copy from their profile

**What Binance Copy Trading gets right:**
- Transparency of risk metrics (drawdown, Sharpe) — not just raw returns — helps users understand what they're copying
- Proportional copying (not fixed-amount cloning) keeps position sizing sensible
- Risk controls built into the copy flow, not as an afterthought

**Why Binance's model doesn't directly translate to stocks:**
- Crypto operates 24/7 — stocks have market hours. Copy timing becomes awkward (do you copy the trade at open next day? At the same price? At market?)
- Crypto traders often use high leverage on futures — this creates extreme returns that look impressive but are not appropriate benchmarks for stock investors
- The 10% profit share model requires real trading execution infrastructure — not viable for Paave V2 without brokerage integration

---

### How eToro Copy Trading Works

eToro (founded 2007, Israel) is the most mature social trading platform globally and the clearest model for Paave's social layer:

**CopyTrader mechanics:**
- Every eToro user's portfolio is public by default (can be set to private)
- "Popular Investors" program: top traders with verified performance qualify for a program where they earn additional income based on assets under copy (AUC) — similar to Binance's lead trader model
- Minimum copy amount: $200 (real trading)
- Copying mirrors portfolio allocation proportionally in real time — if the trader adds to Apple, your allocated amount also increases in Apple
- CopyTrader shows: 12-month return, risk score (1–10), number of copiers, assets held, trade frequency, live trades

**Popular Investor Program (PIP) tiers:**
- Cadet → Rising Star → Champion → Elite → Elite Pro
- Higher tiers = more visibility, more income from AUC
- This creates a creator economy for skilled traders — strong retention mechanism

**eToro's social feed:**
- News Feed style — activity from traders you follow, commentary, market analysis posts
- Every trade a followed trader makes appears in your feed as a "trade card" — you can tap to instantly copy that single trade
- Posts can include charts, text, reactions

**What eToro gets right for Paave:**
- The Popular Investor program creates a two-sided market with real incentive alignment
- Risk score on trader profiles democratizes risk assessment for F0 investors — you don't need to know what Sharpe ratio means if there's a 1–10 risk score
- Portfolio-level copying (not just signal following) means users are exposed to diversification, not just single-trade tips

**eToro's known weaknesses:**
- Real-money copy trading has regulatory implications in each market — not viable for Paave V1/V2 without a brokerage license
- eToro's social feed is cluttered — the volume of updates from copied traders creates notification fatigue
- Platform has faced criticism for showcasing traders with one lucky year rather than sustained skill

---

### Recommendation for Paave: Binance/eToro Hybrid (Paper Trading First)

Since Paave does not have a brokerage license (real-money trading is out of scope through V2), the copy trading model must be scoped to paper trading portfolios:

**Phase 2 copy trading model:**
1. Users who opt-in to "Trader Mode" publish their paper trading portfolio publicly
2. Other users can browse the **Trader Leaderboard** and follow/copy a trader's paper portfolio
3. Copy is **simulated** — the copier's paper portfolio mirrors the trader's paper portfolio in real time
4. Trader profiles show verified paper trading stats: ROI, max drawdown, win rate, active streak
5. A "Trader Score" replaces the raw return figure — a composite of return, consistency, and risk discipline (prevents high-variance lottery picks from dominating)

---

## 3. Social Proof on Stock Cards

### How Current Apps Implement This

**Robinhood:**
- Shows "X people on Robinhood own this stock" on stock detail pages — this was a controversial feature because it was perceived as gamifying herding behavior (SEC scrutiny in 2021)
- Shows "Trending on Robinhood" section — stocks with high engagement relative to historical baseline
- Does NOT show portfolio allocation of other users (just headcount)
- Robinhood Snacks newsletter + in-app stories drove "X people are reading about this" social signals

**Public.com:**
- "X Paave members own this" on stock cards
- "Members' top moves today" — top bought/sold stocks in the community that day (% only, not $ amounts)
- "Trending in your network" — stocks actively discussed or traded by people you follow
- Portfolio feed shows allocation percentages but not dollar amounts (privacy-preserving)

**moomoo (Futu):**
- "X users have this in their watchlist" prominently on stock cards
- Community tab on each stock shows a live feed of user posts about that stock
- Shows "hot" indicator (flame icon) for stocks with above-average community activity
- Leaderboard of top-discussed stocks in the community

**Webull:**
- "X users watching" on stock pages
- Shows analyst ratings aggregate alongside user sentiment
- No real-time trading activity from other users shown

---

### Recommendation for Paave: Social Proof Signal System

Implement a tiered social proof system on every stock card:

**Tier 1 — Passive signals (always visible, no opt-in required):**
- "X Paave users are watching this" — based on watchlist adds within the last 7 days
- "Trending in Vietnam" / "Trending in Korea" indicator — stocks in the top 10% of watchlist adds for that market in the last 24 hours
- "Hot in your network" — if 3+ people you follow have this in their watchlist, show this badge

**Tier 2 — Active signals (requires social feed opt-in):**
- "X posts today" — count of community posts tagged to this stock in the last 24 hours
- "Sentiment: 72% bullish" — aggregated from posts with sentiment tags
- "Y traders in your network are holding this" — from paper portfolios that are public

**Tier 3 — Editorial signals (curated by Paave team):**
- "Trending theme: AI Infrastructure" — when Paave editorial team tags a stock to an active theme
- "Featured by Top Trader [username]" — when a high-ranked paper trader posts about the stock

**Privacy rule:** Social proof signals must never reveal the identity of specific users watching a stock without their explicit consent. Aggregate counts only, unless the user has set their watchlist to "public".

---

## 4. Portfolio Sharing

### How Current Apps Handle This

**eToro:**
- Portfolio is public by default. Users can set to private in settings.
- When public, shows: stock allocation (%), open/closed positions, overall return %
- Does NOT show: exact dollar amounts, account balance, date of birth
- Copyable link to profile — shareable outside the app as "eToro card"

**Public.com:**
- Portfolio is public by default (can go private)
- Shows: holdings with allocation %, total return %, portfolio activity (recent trades)
- Does NOT show: dollar amounts — only percentages and shares
- Shareable profile card (image format) for social sharing outside app (Instagram, Twitter)

**Sharesies (New Zealand/Australia):**
- Portfolio sharing via link — generates a snapshot card
- Can blur specific holdings for partial sharing ("My top 5 holdings, 3 hidden")
- "Investing story" format — gamified profile showing streak, milestones

**Commonstock (acquired by Public.com 2023):**
- Was the most sophisticated portfolio transparency layer before acquisition
- Allowed connecting real brokerage accounts (Fidelity, Schwab) via Plaid — verified real-money portfolio
- "Verified" badge on traders whose portfolios are linked to real accounts — major trust signal
- Created differentiation between paper/fake portfolios and real ones

---

### Recommendation for Paave: Privacy-First Portfolio Sharing

**Default state: Private.** Gen Z in Vietnam and Korea are MORE private about money than Western users. Financial privacy is culturally normative — particularly in Vietnam where displaying wealth is complicated by family/social dynamics.

**Privacy controls (tiered):**
1. **Fully private (default):** No one can see your portfolio except you
2. **Followers only:** People you've approved as followers can see your portfolio allocations (%)
3. **Public (anonymous):** Anyone can see allocations and returns. Username is shown but not real name.
4. **Public (named):** Full profile with real name, photo, verified stats

**What is always hidden regardless of setting:**
- Exact VND/KRW amounts invested
- Bank/brokerage account numbers
- Transaction dates (only month/year)

**What can be shared:**
- Allocation percentages per stock
- Paper trading ROI %
- Win/loss ratio on paper trades
- Portfolio theme tags (e.g., "I focus on VN Banking + KR Semiconductors")

**Shareable portfolio card:**
- Generate a shareable image card showing: username/avatar, top 5 holdings (% only), overall paper trading return, a QR code/link to their Paave profile
- Designed for Instagram Stories, Zalo Stories, and KakaoTalk sharing — 9:16 ratio
- This is the primary growth loop for organic acquisition

---

## 5. Copy Trading (Simulated / Paper Trading)

### Precedents

**Investopedia Stock Simulator:**
- Pure paper trading platform — every user starts with $100,000 virtual cash
- Users can join "games" (public or private) — competitive paper trading leagues with a set end date
- Rankings based on portfolio value at end of game period
- No copying mechanic — each user trades independently
- Very basic social layer (leaderboard only)

**MarketWatch Virtual Stock Exchange:**
- Similar to Investopedia — $100K virtual, league/game structure
- Public leagues with hundreds of participants — leaderboard drives competition
- Portfolio is visible during active game
- No copy trading — competitive, not collaborative

**Webull Paper Trading:**
- Standalone paper trading mode within the real Webull app
- No social layer — purely individual simulation
- Useful as comparison: the missing piece is the community/copy dimension

**TradeStation's Simulated Trading:**
- Identical to their live platform — no social features
- Professional tool, not Gen Z-facing

**The gap in the market:** No major app combines paper trading + copy trading + social feed in a Gen Z-native package. This is a genuine white space.

---

### Recommendation for Paave: Paper Copy Trading System

**Core mechanic: "Follow Portfolio"**

1. A user sets their paper portfolio to **Public** (with a clear consent flow explaining this enables copying)
2. Any other user can tap **"Follow Portfolio"** on that trader's profile
3. Following creates a **linked shadow portfolio** — a new paper portfolio in the copier's account that mirrors the lead trader's paper positions in real time
4. The shadow portfolio shows:
   - Current positions (same stocks, proportional allocation)
   - Real-time P&L based on current market prices
   - Label: "Copying [username]'s strategy"
5. The copier can **pause, edit, or stop** the copy at any time without affecting the lead trader
6. Lead trader gets a **"X users are copying your portfolio"** count on their profile — social status signal

**Anti-game rules:**
- A paper portfolio is only copyable if it has at least 30 days of history and at least 10 transactions — prevents instant pump-and-follow schemes
- Max 5 copy-following relationships per user (prevents passive behavior — users should be learning, not just copying)
- Weekly "copy review" prompt: "Are you still happy copying [username]? Their portfolio is up/down X% this week."
- Lead traders cannot see WHO is copying them (privacy for copiers), only the count

**Copy timing:**
- Trades are mirrored with a 1-trading-day lag for VN stocks (to replicate reality — in real markets, copy trading typically executes at next market open)
- Real-time mirroring for global/KR markets during their trading hours
- Lag is communicated clearly to copiers: "Paave simulates a realistic copy delay"

---

## 6. Stock-Specific Chat Rooms / Live Discussion

### Current Implementations

**Reddit (r/investing, r/stocks, r/wallstreetbets, r/VietnamInvesting):**
- Per-ticker discussion happens organically through post tagging and search, not dedicated rooms
- r/wallstreetbets proved that stock community discussion at scale becomes entertainment-first, investing-second
- Vietnamese sub r/VietnamInvesting is small (~50K members) — most VN stock discussion happens on Facebook, not Reddit
- Key insight: Reddit's upvote/downvote creates a "curated wisdom" signal — posts with bad information get downvoted. This quality control is missing in Zalo/Facebook groups.

**moomoo Community:**
- Per-ticker "Discussion" tab on every stock's detail page
- Posts are limited (no lengthy threads) — short messages, chart images, basic reactions
- Moderated with spam filtering
- Show poster's profile stats alongside their post (paper trading return, follower count) — creates credibility signal
- Real-time update — new posts appear without page refresh
- Flame/trending indicator when a stock's discussion activity spikes

**Public.com per-stock feed:**
- Community tab on stock detail page showing all user posts tagged to that ticker
- Integrated with the main feed — a post on the community tab also appears on the author's profile feed and their followers' main feed
- The stock page community tab acts as a filtered view, not a separate "room"

**Robinhood Gold Chat:**
- Robinhood launched per-stock discussion in 2023 for Gold (paid) subscribers
- Text chat format — real-time group chat per ticker
- Faced criticism for being a vector for coordinated pump-and-dump activity
- Moderation challenges were significant

**Key pattern:** Apps that use **feeds** (Public.com, moomoo) rather than **chat rooms** (Robinhood Gold Chat) have more manageable moderation profiles. Chat rooms create real-time coordination risk. Feeds with delayed visibility and feed-level moderation are safer.

---

### Recommendation for Paave: Per-Ticker Community Tab (Feed Model)

**Not a chat room — a community feed filtered to one ticker.**

Every stock's detail page gets a **Community tab** with:

1. **Posts feed:** All posts tagged to this ticker, sorted by recency (default) or engagement (toggle)
2. **Post composer:** Inline composer at top — tap to post directly to this stock's community. Pre-populates the `$TICKER` cashtag.
3. **Sentiment summary:** At the top of the community tab, a pill showing "72% bullish today based on 34 posts" — aggregated from sentiment tags on posts
4. **Poster credibility signals:** Each post shows the poster's paper trading return % and trader tier badge next to their username. This contextualizes advice — a post from a -15% paper trader reads differently than from a +40% trader.
5. **Pinned posts:** Paave editorial team can pin 1–2 high-quality posts per stock (e.g., a well-reasoned analysis) — visible at top of community tab for 24 hours

**Moderation system:**
- Posts are not real-time — 60-second delay after submission before going live (allows auto-flagging)
- AI content moderation: flag posts with price targets without disclosure, posts with external links, posts containing profanity or all-caps "BUY/SELL NOW" language
- Community flagging: 3 independent flags within 1 hour queues a post for human review
- Verified sources badge: Users who link a verified financial account (or are Paave-approved analysts) get a checkmark

**VN-specific moderation note:** Vietnamese stock community has a known pump-and-dump culture via Facebook groups. Paave's community tab must explicitly disallow "mua vào ngay" (buy now) / "chốt lời" (take profit now) directive posts without supporting analysis — treat these as spam.

---

## 7. Trader Rankings / Leaderboards

### Current Implementations

**Investopedia Stock Simulator leaderboard:**
- Within each "game" (competitive period), shows ranking by portfolio value
- Public leaderboard visible to all game participants
- No persistent career ranking — each game resets
- Simple but effective: competition drives daily logins

**MarketWatch Virtual Stock Exchange:**
- Game-based leaderboard system
- Teachers use it for school stock market competitions — heavy education use case
- Can create private leagues (class, friend group) or join public leagues
- Global leaderboard available

**eToro Popular Investor leaderboard:**
- Persistent career ranking for real-money traders
- Ranked by: copiers count, AUC (assets under copy), 12-month return
- NOT just return — composite ranking prevents one-hit-wonders from dominating
- Tiered system (Cadet → Elite Pro) creates visible progression

**Binance Top Traders leaderboard:**
- 7-day, 30-day, all-time tabs
- Rank by ROI, absolute profit, or number of copiers
- Crypto futures context — extreme returns (+500%) are common and misleading for stock context

**moomoo Contest:**
- moomoo runs periodic paper trading contests with leaderboard
- Prizes (cash, merchandise) for top performers
- Time-limited (30 days) — creates urgency

---

### Recommendation for Paave: Trader Tier System

**Not a pure leaderboard — a persistent Trader Tier system with leaderboard as one component.**

**Trader Tiers (paper trading only):**

| Tier | Name (VN) | Name (KR) | Criteria |
|------|-----------|-----------|----------|
| 0 | Mầm non (Seedling) | 새싹 (Sprout) | < 30 days, < 10 trades |
| 1 | Người học (Learner) | 입문자 (Beginner) | ≥ 30 days, ≥ 10 trades, any return |
| 2 | Nhà đầu tư (Investor) | 투자자 (Investor) | ≥ 90 days, positive return, ≥ 25 trades |
| 3 | Trader | 트레이더 (Trader) | ≥ 180 days, top 30% return in market, ≥ 50 trades |
| 4 | Chuyên gia (Expert) | 전문가 (Expert) | ≥ 1 year, top 10% return, Sharpe ratio > 1.0, ≥ 100 trades |
| 5 | Huyền thoại (Legend) | 레전드 (Legend) | Top 1% all-time in Paave VN or KR market |

**Leaderboard dimensions:**
1. **This week** — short-term energy, resets every Monday
2. **This month** — medium-term, resets first of month
3. **All time** — persistent career ranking, never resets
4. **My market** — separate leaderboards for VN market traders and KR market traders
5. **My network** — rank among people you follow (private league feel)
6. **My friends** — if you've connected contacts/social login, rank among friends only

**Trader Score formula (composite, not raw return):**
```
Trader Score = (Return % × 0.40) + (Consistency % × 0.30) + (Risk Score × 0.20) + (Activity Score × 0.10)
```
Where:
- **Consistency %** = % of months with positive return
- **Risk Score** = inverse of max drawdown (lower drawdown = higher score)
- **Activity Score** = normalized trade frequency (not too few, not HFT-level noise)

This prevents the scenario where a user goes all-in on one meme stock, gets lucky, and tops the leaderboard with no sustainable skill signal.

**Gamification hooks:**
- Weekly "Market Challenge" — e.g., "Best VN Banking stock pick this week" — generates community participation and editorial content
- Achievement badges: "First profitable month", "10-trade streak", "Held for 30+ days" — process-based achievements, not just outcome-based
- "Hot Streak" indicator: Trader profiles show a fire streak icon when the trader has beaten the market (VN-Index / KOSPI) for 3+ consecutive weeks

---

## 8. Vietnamese + Korean Social Investing Culture

### Vietnam: How Gen Z Investors Currently Communicate

**Platform stack:**
1. **Facebook Groups** (primary): Dedicated groups like "Chứng khoán F0 - Học đầu tư cổ phiếu", "Đầu tư chứng khoán Việt Nam" — some with 200,000–500,000 members. Posts are text + chart screenshots. Moderators (often paid analysts or "KOL" influencers) post "nhận định thị trường" (market commentary) each morning before market opens.
2. **Zalo Groups** (secondary, more trusted): Smaller, private groups (20–200 people) often organized by an analyst, a brokerage sales staff member, or an influential investor. These are more intimate, more real-time, and more "tips"-oriented. Vietnamese investors trust Zalo tips more than Facebook posts because the group is closed and the moderator has reputation on the line.
3. **YouTube** (education): Channels like Topi, FiinGroup, Viet Stock Education have hundreds of thousands of subscribers. Morning market outlook videos, stock analysis tutorials. Gen Z watches these as education but discusses the content in Zalo groups.
4. **CafeF comment sections**: CafeF (Vietnam's leading financial news site) has active per-article comment sections where investors discuss specific stocks. Not mobile-native, but significant.
5. **TikTok**: Emerging — finance influencers (KOLs) posting short stock analysis content. Not yet a discussion layer, primarily broadcast.

**Key behavioral patterns:**
- **Morning ritual:** Before VN market opens at 9:00 AM, members send "nhận định ngày" (daily call) — a short outlook on the market and 1–3 stock picks. This is the highest-engagement moment.
- **Tip culture:** Vietnamese investors give explicit buy/sell advice to each other openly. This is legally gray but culturally normal.
- **"Đánh giá" (rating) culture:** Posts that say "VCB tốt hay xấu?" (Is VCB good or bad?) drive hundreds of comments with quick opinions — similar to a poll mechanic.
- **Screenshot culture:** Users take screenshots of their portfolio gains and share in groups — "flex" behavior that drives both bragging and learning.
- **KOL authority:** Groups with a recognized KOL (Key Opinion Leader) have far higher engagement and member loyalty. The KOL's morning call is the centerpiece of the community.

**What these groups fail to provide:**
- No performance accountability — KOLs are never tracked on the accuracy of their calls
- No searchable history — finding a recommendation from 2 weeks ago in a Zalo group is nearly impossible
- No integration with actual market data — users must manually look up prices
- No paper trading to test ideas — everything is real money or hypothetical
- No anti-manipulation controls — pump-and-dump coordination is common

---

### Korea: How Gen Z Investors Currently Communicate

**Platform stack:**
1. **KakaoTalk Open Chats (오픈채팅):** The dominant real-time stock discussion layer. "주식 오픈채팅" (stock open chat) — anyone can join public open chat rooms organized by stock, sector, or investment style. Rooms often have 1,000+ members. Chat is real-time, messages are ephemeral (no history for new joiners). Popular rooms for HYBE, Samsung, Kakao Bank.
2. **Naver Café:** More structured — like Reddit with Korean characteristics. Stock cafés (e.g., "주식 갤러리") are persistent, searchable forums. Posts include analysis, charts, discussion threads. Naver Café has strong community history and archiving — a major advantage over KakaoTalk.
3. **Naver Finance comment sections:** Per-stock comment sections on Naver Finance are heavily used — each stock has a "종목토론실" (stock discussion room) that functions as an asynchronous ticker-specific chat.
4. **Toss Community:** Toss has an in-app community ("토스 피드") — personal finance posts, questions, peer answers. Not stock-specific but demonstrates in-app community can work for Korean fintech users.
5. **YouTube:** Major Korean finance YouTubers (슈카월드, 주식하는 형) have millions of subscribers — they set narratives that then circulate in KakaoTalk groups.
6. **X/Twitter (Korean finance):** A niche but vocal community of Korean retail traders on Twitter, often discussing KOSDAQ small-caps and derivatives.

**Key behavioral patterns:**
- **Real-time chat expectations:** KakaoTalk has conditioned Korean Gen Z to expect real-time, chat-speed communication. A feed with 5-minute-old posts feels "dead" to a Korean user who is used to a KakaoTalk room with 50 messages per minute during market hours.
- **Naver Café permanence:** Korean investors want posts to be searchable and permanent. The ephemeral nature of KakaoTalk open chat is a known frustration — users frequently ask "어디 저장해요?" (where can I save this?).
- **Nickname culture:** Korean investors use pseudonyms (e.g., "매수왕" — King of Buying) and have strong handle identity in communities. Real names are almost never used.
- **Consensus-seeking:** Korean investment communities have a stronger herd mentality signal — posts that ask "지금 들어갈 만한가요?" (Is it worth entering now?) generate rapid consensus-building responses.
- **Certified/licensed signal:** Korean Gen Z investors have high trust in users who post certified analyst credentials (CFA, CPA, securities license). A badge system would carry real weight in KR.

**What KakaoTalk and Naver Café fail to provide:**
- No performance tracking — no way to verify if the advice-giver has actual positive returns
- KakaoTalk has no market data integration — users must alt-tab to check prices
- Naver Café's UX is outdated — mobile experience is poor, not Gen Z-native
- No paper trading integration
- No content moderation at scale for manipulation

---

### How Paave Replaces These Behaviors

**The replacement test:** For Paave's social layer to displace Zalo groups and KakaoTalk open chats, it must offer everything those platforms do AND add what they cannot.

| Behavior | Zalo / KakaoTalk Provides | Paave Must Match or Exceed |
|----------|--------------------------|---------------------------|
| Morning market call | KOL morning post in group | Paave-featured "Morning Call" by verified top trader |
| Real-time discussion | Instant chat in group | Community feed with ≤ 5 min update cycle during market hours |
| Stock tips with charts | Screenshot in chat | Embedded stock card with live price when posting |
| Group identity / trust | Closed group, known members | Follower network + verified Trader Score |
| Tip accountability | None | Trader Score tracks post outcomes vs. market |
| Searchable history | None (Zalo/KaTalk) or barely (Naver) | Full post search, indexed by ticker + date |
| Performance bragging | Screenshots in group | Portfolio sharing cards + leaderboard visibility |
| KOL authority | Informal, unverifiable | Verified Expert/Legend tier badges with tracked performance |
| Education content | YouTube links shared in groups | In-app learning posts with embedded explainers |

**The morning market ritual is the highest-value moment:**
Build a specific "Morning Call" feature:
- Market opens at 9:00 AM (VN, Monday–Friday) and 9:00 AM (KR)
- At 8:45 AM, Expert/Legend tier traders can post a "Morning Call" — a structured post with: market sentiment today, 1–3 stock picks with brief rationale
- Morning Calls are prominently surfaced in the home feed at market open
- Morning Call accuracy is tracked retroactively — the app shows "Last week's Morning Calls: 3/5 outperformed the index" for each expert
- This is the direct replacement for the Zalo group's morning "nhận định ngày"

**For Korean users specifically:**
- Support KakaoTalk Login for social graph import (follow the people you already trust)
- Real-time feed updates during KOSPI trading hours (9:00–15:30 KST) — not polling, push-based
- Persistent thread search — every post is searchable with filters (ticker, date, author tier)
- Verified credential badge: users can link their Korean securities license number for a "Certified" badge

**For Vietnamese users specifically:**
- Support Zalo Login for social graph import
- The "nhận định" (market call) template: a structured post format with fields for market outlook (bullish/bearish/neutral), key stocks to watch today, and reasoning — structured, not freeform
- Morning Call summary card shareable to Zalo Stories (the primary VN sharing surface)
- Community moderation standard: explicitly state "Paave is not a stock advisory service" — protect against legal gray zone of tip culture

---

## 9. Paave Phase 2 Social Feature Prioritization

### Recommended Build Order

**Phase 2A (first 3 months after V1):**
1. **Social profile + follow system** — users can follow each other, profiles show paper trading stats and basic portfolio overview (opt-in)
2. **Cashtag posts + per-ticker community tab** — post feed with `$TICKER` auto-linking, community tab on stock detail pages
3. **Social proof counters on stock cards** — "X users watching", "Trending in VN/KR" signals

**Phase 2B (months 4–6 after V1):**
4. **Portfolio sharing** — privacy-controlled portfolio cards, shareable image format
5. **Trader tiers + leaderboard** — Trader Score, tier badges, weekly/monthly leaderboards
6. **Morning Call feature** — structured daily calls by verified Expert/Legend traders

**Phase 2C (months 7–9 after V1):**
7. **Paper copy trading** — "Follow Portfolio" mechanic with shadow paper portfolios
8. **Sentiment aggregation on stock detail** — bull/bear gauge driven by post sentiment tags
9. **Weekly market challenge** — competitive paper trading events with prizes

### Regulatory Notes

- All social features must include a disclaimer: "Posts on Paave are user opinions and do not constitute investment advice."
- Vietnamese law (Luật Chứng khoán 2019): prohibits market manipulation via false information. Paave must implement content moderation to avoid hosting manipulative content.
- Korean law (Financial Investment Services and Capital Markets Act): similar prohibitions. "Certified" badge should not be confused with official regulatory endorsement.
- Copy trading (paper only) avoids the regulatory classification as investment advisory in both VN and KR, since no real money changes hands.

---

## 10. Feature Comparison Matrix

| Feature | StockTwits | Public.com | eToro | Binance | moomoo | Paave Recommendation |
|---------|-----------|-----------|-------|---------|--------|---------------------|
| Ticker-tagged posts | Yes ($cashtag) | Yes | Yes | Yes (crypto) | Yes | Yes — core mechanic |
| Follow users | Yes | Yes | Yes | Yes | Yes | Yes |
| Per-ticker community tab | Yes (stream) | Yes | No | Yes | Yes | Yes — feed model |
| Portfolio sharing | No | Yes (default public) | Yes (default public) | Partial | No | Yes — default private |
| Copy trading | No | No | Yes (real $) | Yes (real $) | No | Yes — paper only |
| Trader leaderboard | No | No | Yes | Yes | Contest-based | Yes — Trader Tier system |
| Sentiment gauge | Yes | No | No | No | No | Yes — derived from post tags |
| Social proof on stock cards | No | Yes | No | No | Yes | Yes — multi-tier signals |
| Morning Call format | No | No | No | No | No | Yes — VN/KR-native feature |
| Shareable portfolio card | No | Yes | Yes | No | No | Yes — Zalo/KakaoTalk-optimized |
| Performance tracking on posts | No | No | Partial | No | No | Yes — Trader Score |
| Localized for VN/KR | No | No | No | Partial | Partial | Yes — core differentiator |

---

*Document prepared: April 2026*
*Next revision: After Phase 2A implementation (estimated Q3 2026)*
*Owner: Paave Product Team*
