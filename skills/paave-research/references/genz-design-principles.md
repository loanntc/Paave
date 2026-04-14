# Gen Z Design Principles for Fintech

## Who is Gen Z in This Context?

Born 1997–2012. Now 14–29. For Paave's investing context, focus on the 20–27 age band — they have disposable income, are actively entering financial markets, and are digitally native but financially new.

## Core Gen Z UX Expectations

### 1. Speed over completeness
Gen Z has no patience for loading states or multi-step flows. Every interaction should feel instant. If something takes time, show micro-progress (skeleton screens, shimmer effects — never a spinner alone).

### 2. Mobile-first, always
Desktop is an afterthought. Every layout decision starts from a 390px iPhone viewport. Bottom navigation, thumb-zone awareness, swipe gestures are expected.

### 3. Personalization signals trust
Show them their name, their portfolio, their local market — immediately. Generic = untrustworthy. Paave should detect/ask location and market preference early and reflect it throughout.

### 4. Teach without condescending
Gen Z is curious but not patient for walls of text. Use tooltips, inline explainers, and contextual help — never a separate "learn" section they have to navigate to.

### 5. Social proof and community signals
What others are watching, buying, or talking about matters. Reddit-style momentum indicators, trending tickers, "X people are watching this" — these drive engagement.

### 6. Dark mode is not optional
A significant portion of Gen Z uses dark mode by default. Design for both, but dark mode should feel equally polished.

---

## Visual Design Trends (2024–2025)

### Color Direction
- **Glassmorphism is fading** — frosted glass effects overused, now signals outdated
- **Bento grid layouts** — card-based, modular information architecture
- **Muted / desaturated palettes** with one vivid accent
- **Dark-mode-native** apps launching with dark as default

**Trending palette directions:**
- Deep navy/charcoal base + electric blue or cyan accent (finance/trust)
- Pure black base + neon green or purple accent (crypto-adjacent, edgy)
- Warm off-white base + sage green + warm amber (wellness-influenced)

For Paave (VN + KR market, Gen Z): lean toward **dark navy base + electric blue/teal accent** — signals modernity, trust, and feels premium without being corporate.

### Typography
- **Large, bold numerals** for financial data — 36–48px bold
- Variable fonts for responsive contexts
- Korean-aware typography: Pretendard (supports Hangul + Latin + Vietnamese diacritics)
- For VN: ensure proper diacritic support

### Motion & Micro-interactions
- Number counter animations when portfolio value loads
- Swipe-to-dismiss, pull-to-refresh (standard expectations)
- Chart hover/touch reveals — precise, not laggy
- Celebration moments: confetti or pulse effect on profitable positions (used sparingly)

### Information Architecture
- Bottom tab bar with 4–5 items max (Home, Markets, Portfolio, Discover/News, Profile)
- Home screen = personalized snapshot (market today, your portfolio change, trending pick)
- Charts should be the primary visual — not tables. TradingView-style candlestick charts expected
- Condensed stock cards: ticker, name, price, % change, a mini sparkline — that's it

---

## Korean App Benchmarks for Paave

| Pattern | Toss | Kakao Pay | What Paave Should Do |
|---------|------|-----------|----------------------|
| Onboarding | 3 steps, KYC deferred | Social login first | VN/KR phone + quick KYC |
| Home | Net worth front and center | Chat-first | Portfolio value + today's market |
| Navigation | Bottom 5-tab bar | Bottom 4-tab bar | Bottom 5-tab: Home, Markets, Portfolio, News, Profile |
| Charts | Clean line chart default | Basic | Full candlestick + TradingView (future) |
| Color | White + blue #0064FF | Yellow #FEE500 + black | Dark navy + electric blue |
| Typography | Rounded sans (Apple/Google system) | Noto / KakaoFont | Pretendard (supports KR + Latin) |
| Micro-animations | Smooth, minimal | Playful, bouncy | Smooth with subtle delight moments |

---

## Design Sources to Search

When researching current trends, check these:
- **Mobbin** (mobbin.com) — real app UI screenshots by category
- **Layers.to** — curated app design screenshots
- **Dribbble** tagged: fintech, banking app, Gen Z, mobile finance
- **Behance** — Korean UI designers frequently publish app case studies
- **UX Collective** (uxdesign.cc) — trend articles
- **X/Twitter**: follow @tossdesign, @kakao_pay for official design posts
- **Figma Community**: search "fintech app" and filter by recent
