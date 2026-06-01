# Review: Vibe-Trading Features — Frontend Analysis
Date: 2026-05-29 | Spec: `docs/business/vibe-trading-feature-analysis.md`

---

## Existing FE Assets

| File | What it does | Reuse for |
|------|-------------|-----------|
| `app/(app)/portfolio/portfolio-view.tsx` | Portfolio summary, holdings list | F1 — add "Journal" tab; F7 — add risk panel |
| `app/(app)/stock/[ticker]/stock-detail-view.tsx` | Stock detail with price chart | F4 Research, F7 Risk — add analysis sections |
| `lib/ai/use-ai-chat.ts` | Chat hook — streaming AI responses | F4 Research Workflow chat UI |
| `lib/ai/chat-context.tsx` | Chat context provider | F4, F5 |
| `app/(app)/grow/` | Learning module viewer (card-by-card) | Reuse card pattern for Research report sections |

---

## Feature 1 — Trade Journal Analyzer: FE Gaps

### Missing: Journal Upload Page ❌

No upload UI exists. Required:

```
app/(app)/journal/
  page.tsx              — Entry point; shows upload state vs. results
  journal-upload.tsx    — Dropzone component (CSV, max 5MB), broker format selector, upload progress
  journal-results.tsx   — Displays roundtrip table + behavioral scores
  behavioral-scores.tsx — Score cards: win_rate, avg_hold, overtrading, discipline, fee_awareness
  archetype-card.tsx    — Archetype badge (FOMO Trader, Disciplined Investor, etc.) with explanation
  roundtrip-table.tsx   — Paginated table: symbol, buy date, sell date, hold days, PnL %, net PnL
```

**Navigation:** Add "Journal" tab to bottom nav (currently: Home, Discover, Grow, Portfolio, Profile).

### Missing: Bias Detail Cards ❌

The spec requires each behavioral bias to show with evidence, not just a score. Current archetype is a single label. Need:
- `DispositionEffectCard` — shows winners held N days avg vs. losers held N days avg
- `OvertradingCard` — trades/week bar chart
- `FOMOCard` — % of buys within 5% of 30-day high

### Missing: Minimum Roundtrips Empty State ❌

When user uploads CSV with < 5 roundtrips, show a guided empty state explaining what's needed — not an API error banner.

---

## Feature 2 — Shadow Account: FE Gaps ❌ Full build needed

```
app/(app)/shadow/
  page.tsx              — Dashboard showing shadow profile vs. real performance
  shadow-setup.tsx      — Step 1: requires Journal upload first (guard + CTA if missing)
  shadow-profile.tsx    — Shows extracted rules in plain language ("Buy after 3 up days…")
  shadow-backtest.tsx   — Equity curve: shadow line vs. real line, side-by-side
  attribution-chart.tsx — Waterfall chart: missed signals / noise / early exit / late exit delta
  counterfactual-list.tsx — Table of specific trades that would have improved outcome
  shadow-report-btn.tsx — Download HTML/PDF report button
  signals-today.tsx     — Today's matching signals list (research-only disclaimer visible)
```

**Age gate:** Full_ACCESS (18+) only. LEARN_MODE sees a locked state with explanation.

---

## Feature 3 — Backtesting Engine: FE Gaps ❌ Full build needed

```
app/(app)/backtest/
  page.tsx              — Strategy builder entry
  strategy-builder.tsx  — Form: select symbols, date range, initial capital (VND), buy/sell rules
  backtest-results.tsx  — Metrics grid: Sharpe, return %, max drawdown %, win rate
  equity-curve.tsx      — Line chart (strategy vs. VN-Index benchmark)
  validation-panel.tsx  — Monte Carlo p-values + Bootstrap Sharpe CI + Walk-Forward table
  run-card.tsx          — Audit metadata: run timestamp, param hash, data source
```

**Key UI constraints:**
- Initial capital input must use VND format: `1.000.000 ₫`
- Board lot warning: show toast if quantity not multiple of 100 (HoSE)
- Disclaimer banner always visible on results page (per BR-BT-04)
- LEARN_MODE (16–17): results are read-only, no save button

---

## Feature 4 — AI Research Workflow: FE Gaps ⚠️ Partial

The AI chat (`use-ai-chat.ts` + `chat-context.tsx`) is the foundation. Missing:

### Report Mode View ❌

Current chat returns free-form text stream. Spec requires structured report with named sections. Need:

```
components/research/
  research-report.tsx    — Renders structured markdown sections (Technicals, Fundamentals, Macro, Risks, Summary)
  evidence-tag.tsx       — Small chip showing "Source: SSI | As of: 2026-05-29 | Confidence: medium"
  data-gap-badge.tsx     — Warning badge when a section has incomplete data
  artifact-history.tsx   — "Recent analyses" list for session recall (FR-RW-08)
```

### Disclaimer Component ❌ (not standalone)

The research disclaimer is currently only in the AI system prompt. Need a visible UI component:

```tsx
// components/research/research-disclaimer.tsx
// "Kết quả phân tích này do AI tạo ra, chỉ mang tính giáo dục. Không phải lời khuyên đầu tư."
// Shown on every research report render, sticky at bottom
```

---

## Feature 7 — Risk Analysis Suite: FE Gaps ❌

Risk analysis can be surfaced as a panel inside the existing stock detail page:

```
app/(app)/stock/[ticker]/
  risk-panel.tsx         — Tab or accordion section in stock-detail-view
  drawdown-chart.tsx     — Drawdown history chart (highlight top 5 events)
  var-display.tsx        — VaR 95%/99% cards with method label (Parametric / Historical)
  stress-scenario-list.tsx — VN stress scenarios: 2008, COVID 2020, TPDN 2022
  regime-badge.tsx       — Bull 🟢 / Bear 🔴 / Sideways 🟡 badge with confidence %
```

Portfolio-level risk:
```
app/(app)/portfolio/
  portfolio-risk-tab.tsx  — Aggregate VaR, drawdown, correlation matrix heatmap
```

---

## UI States Required (all features)

Per Paave design system (7 component states):

| State | Trade Journal | Shadow Account | Backtesting | Risk |
|-------|--------------|----------------|-------------|------|
| Empty (no data) | Upload CTA | Requires journal first | Build strategy CTA | No history CTA |
| Loading | Upload progress bar | "Extracting patterns…" | "Running simulation…" | Skeleton cards |
| Success | Scores + roundtrip table | Profile + equity curve | Metrics + chart | VaR cards + chart |
| Error (< min data) | Guided message: need 5+ trades | Guided: need profitable trades | Error card | Error card |
| Error (API) | Toast: "Upload failed, try again" | Toast | Toast | Toast |
| LEARN_MODE locked | ✅ Show, no export | 🔒 Locked (18+ only) | 🔒 Read-only | ✅ Show |
| Disclaimer | — | Signals have disclaimer | Results have disclaimer | All views |

---

## Navigation Impact

Adding 3 new top-level sections (Journal, Shadow, Backtest) requires a decision on navigation:
- Current bottom nav: Home / Discover / Grow / Portfolio / Profile (5 tabs — full)
- Options: (a) nest Journal + Shadow under Portfolio, (b) replace Discover with "Tools" mega-tab, (c) add deep-link entry from Portfolio page
- Recommendation: **Nest under Portfolio tab** as sub-tabs for v1 (lowest navigation disruption)

---

## Shared Component Needs

| Component | Used by | Notes |
|-----------|---------|-------|
| `VndInput` | Backtesting (capital), Trade Journal | Format: `1.000.000 ₫` — currently exists in trade forms, extract to shared |
| `EquityCurveChart` | Backtesting, Shadow Account | Recharts line chart with benchmark overlay |
| `MetricCard` | All features | Stat display: label + value + delta badge |
| `PaginatedTable` | Roundtrip table, Backtesting trades list | Currently no generic paginated table component |
| `ResearchDisclaimer` | F4, F5, F7 | Standardized disclaimer, supports VN + EN |
| `AgeGateLock` | Shadow (18+), Backtest (read-only for 16-17) | Already exists for age gate — verify reusability |
