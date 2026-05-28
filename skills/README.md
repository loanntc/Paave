# Paave Skills

Claude Code skill definitions for the Paave trading and learning platform.

57 analytical skills imported from [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading)
plus Paave-specific skills. Each skill lives in its own directory and is loaded
automatically by Claude Code when the project is open.

---

## Vietnam Market Context

All VN assessments below use these market constraints:

| Constraint | Detail |
|---|---|
| Settlement | T+2 — no same-day buy-and-sell |
| Short-selling | Not available for retail |
| Board lot | 100 shares (HoSE), 1 share (HNX/UPCoM) |
| Daily limits | ±7% HoSE · ±10% HNX · ±15% UPCoM |
| Derivatives | VN30 index futures (HNX) + covered warrants only |
| Options | No retail equity options |
| Crypto | No regulated exchange in VN |
| Data sources | SSI · TCBS · FiinPro · VietStock · VNDirect Research |
| Social media | Facebook groups · Zalo · TikTok Finance (not Twitter/Reddit) |

---

## Legend

| Status | Meaning |
|---|---|
| 🟢 Works now | No adaptation needed — works on VN data as-is |
| 🟡 Needs adaptation | Methodology sound; data sources or market references need updating for VN |
| 🔴 Limited | Tools or markets referenced don't exist for VN retail today |

---

## Technical Analysis

| Directory | Skill name | VN | Notes |
|---|---|---|---|
| `technical-basic` | `technical-indicators` | 🟢 | Pure OHLCV — works on any HoSE/HNX stock |
| `candlestick` | `candlestick-patterns` | 🟢 | Universal patterns, market agnostic |
| `elliott-wave` | `elliott-wave-analysis` | 🟢 | Price geometry, any OHLCV |
| `harmonic` | `harmonic-patterns` | 🟢 | Fibonacci geometry, any OHLCV |
| `ichimoku` | `ichimoku-cloud` | 🟢 | Daily charts work on VN stocks |
| `smc` | `smart-money-concepts` | 🟢 | BOS/ChoCH/FVG work on any OHLCV |
| `volatility` | `volatility-mean-reversion` | 🟢 | HV percentile on any OHLCV |
| `chanlun` | `chan-theory-analysis` | 🟡 | Math works on VN OHLCV; **docs entirely in Chinese (缠论)** — needs translation to be usable for non-Chinese readers |

---

## Quantitative Strategy

| Directory | Skill name | VN | Notes |
|---|---|---|---|
| `seasonal` | `seasonal-calendar-effects` | 🟢 | VN has strong patterns: Tết rally (Jan–Feb), dividend-chase season, year-end sell-off |
| `pair-trading` | `pairs-trading` | 🟢 | Many valid VN pairs: HPG/HSG (steel), MBB/VCB (banking), VHM/NVL (real estate) |
| `multi-factor` | `multi-factor-ranking` | 🟢 | Cross-sectional ranking works for VN universe |
| `ml-strategy` | `machine-learning-strategy` | 🟢 | sklearn + OHLCV, fully market agnostic |
| `event-driven` | `news-event-strategy` | 🟢 | Works with VN news: CafeF, VnExpress Finance, HoSE/HNX announcements |
| `strategy-generate` | `strategy-builder` | 🟢 | Framework tool, market agnostic |
| `backtest-diagnose` | `backtest-debugger` | 🟢 | Universal backtest debugging, any market |
| `minute-analysis` | `intraday-analysis` | 🟡 | **T+2: cannot buy-and-sell same day.** Minute data still useful for entry timing near ATO/ATC and positions already held. Replace data source (OKX/Tushare) with SSI/TCBS minute API |
| `cross-market-strategy` | `multi-market-strategy` | 🟡 | Hardcoded "A-shares + crypto" — adapt to "VN30 spot + VN30 futures" or "VN stocks + gold/USD" |

---

## Research & Quantitative Analysis

| Directory | Skill name | VN | Notes |
|---|---|---|---|
| `factor-research` | `factor-research` | 🟢 | IC/IR framework, any cross-sectional universe |
| `alpha-zoo` | `alpha-factor-library` | 🟢 | Factor math universal; populate with VN price/fundamental data |
| `correlation-analysis` | `correlation-analysis` | 🟢 | Cointegration/correlation, any market |
| `performance-attribution` | `performance-attribution` | 🟢 | Brinson attribution — use VN-Index or VN30 as benchmark |
| `quant-statistics` | `quantitative-statistics` | 🟢 | ADF/GARCH/regression — no market assumption |
| `behavioral-finance` | `behavioral-finance` | 🟢 | Especially relevant: VN market is ~90% retail-driven; emotion dominates price action |
| `macro-analysis` | `macro-analysis` | 🟢 | Use VN data: GSO GDP/CPI, SBV interest rates, PMI, VN trade balance |
| `global-macro` | `global-macro` | 🟢 | Critical for VN: Fed rates (USD/VND impact), China trade, commodity supercycle |
| `geopolitical-risk` | `geopolitical-risk` | 🟢 | Highly relevant: US–China decoupling (supply-chain shift to VN), Mekong water politics, ASEAN dynamics |
| `risk-analysis` | `risk-analysis` | 🟢 | VaR/CVaR/Monte Carlo — apply to any VN portfolio |
| `commodity-analysis` | `commodity-analysis` | 🟡 | Global commodity signals relevant as macro overlay for VN stocks: HPG (iron ore/steel), GAS/PVD (oil/gas), GVR (rubber). **VN has no domestic commodity futures exchange** — cannot trade commodities directly |
| `market-sentiment` | `market-sentiment` | 🟡 | Framework applicable. Replace Chinese signals (融资融券, 北向资金) with VN equivalents: HoSE daily foreign net buy/sell, VSD margin balance, retail account openings |
| `market-microstructure` | `market-microstructure` | 🟡 | Bid-ask/VPIN analysis applicable. References "China A-share call auction" — VN equivalent: ATO 9:00–9:15 and ATC 14:30–14:45 at HoSE. Block trade disclosure rules differ (>1% charter capital must file with HoSE) |
| `sector-rotation` | `sector-rotation` | 🟡 | Methodology valid. **Uses Shenwan (申万) sector classification** — replace with VN ICB sectors or custom groupings: Ngân hàng, Bất động sản, Thép/Vật liệu, Tiêu dùng, Năng lượng, Công nghệ. Description in Chinese |

---

## Fundamental Analysis

| Directory | Skill name | VN | Notes |
|---|---|---|---|
| `valuation-model` | `stock-valuation` | 🟢 | DCF/DDM/PE-Band are standard methods used by VN analysts; PE-Band is especially popular locally |
| `dividend-analysis` | `dividend-analysis` | 🟢 | Highly relevant: VN stocks pay dividends in **cash AND stock** (cổ tức bằng cổ phiếu); dividend yield is a key retail focus |
| `fundamental-filter` | `stock-screener` | 🟡 | **Logic perfect for VN** (PE/PB/ROE/revenue filters). Replace data source (tushare/yfinance) with FiinPro, VietStock API, or CSV export from SSI/VNDirect |
| `financial-statement` | `financial-statements` | 🟡 | Three-statement analysis universal; VN uses VAS (Vietnamese Accounting Standards). **Description text in Chinese.** Fraud detection flags applicable — VN had FLC, Louis Holdings, Vạn Thịnh Phát cases |
| `earnings-forecast` | `earnings-forecast` | 🟡 | Consensus methodology works. **VN analyst coverage is thin** (~100 stocks covered by SSI, VNDirect, BIDV Research). Data not via tushare; use FiinPro or broker research PDFs |
| `earnings-revision` | `earnings-revision` | 🟡 | Revision-tracking logic applies. **Described as "US/HK equities"** — works for any covered VN stock. Limited consensus data availability |
| `corporate-events` | `corporate-actions` | 🟡 | Event types universal (M&A, insider activity, rights issues). **Description in Chinese** (A股ST/退市). Replace ST/delisting flags with VN equivalents: HoSE margin-restricted list, Circular 96 delisting criteria, UBCKNN insider disclosure reports |
| `fund-analysis` | `mutual-fund-analysis` | 🟡 | VN mutual funds: VCBF, VinaCapital Growth, Dragon Capital VEIL, SSIAM, VFM. **References Morningstar ratings** — not available for VN funds. Sharpe/IR/Treynor ratios applicable. Update ETF list to VN ETFs |

---

## Asset Classes

| Directory | Skill name | VN | Notes |
|---|---|---|---|
| `asset-allocation` | `portfolio-optimizer` | 🟢 | MPT/Black-Litterman/risk budgeting universal. VN asset classes: equities, G-bonds (trái phiếu chính phủ), bank TDs (tiết kiệm), gold (SJC), USD |
| `etf-analysis` | `etf-analysis` | 🟡 | VN ETFs available and growing: E1VFVN30, FUEVFVND, FUESSVFL, SSIVFVN50, E1VFVN100. **Description references Chinese market ETF framework.** Tracking error methodology applies |
| `hedging-strategy` | `portfolio-hedging` | 🟡 | Beta hedge applicable using **VN30 index futures** (listed at HNX). Equity options hedge NOT available for retail. Cross-asset hedging very limited. VN30 futures is the only retail hedging instrument |
| `credit-analysis` | `credit-bond-analysis` | 🟡 | VN corporate bond market (TPDN) had major crisis 2022–23 (Vạn Thịnh Phát, Tân Hoàng Minh). Credit risk methodology applicable. **References Chinese bond market** (城投债, 信用债). VN G-bonds are more liquid and relevant |
| `convertible-bond` | `convertible-bonds` | 🔴 | Built for Chinese A-share convertible bonds with specific mechanics (下修/强赎/回售). **VN trái phiếu chuyển đổi market is tiny and uses completely different mechanics.** Low priority — revisit if VN market matures |

---

## Options

| Directory | Skill name | VN | Notes |
|---|---|---|---|
| `options-payoff` | `options-payoff-diagram` | 🟡 | No retail equity options in VN. Partially applicable to **covered warrants (chứng quyền)** listed on HoSE — these are option-like instruments |
| `options-strategy` | `options-strategy` | 🔴 | "Suitable for cryptocurrency and equity options" — VN has neither accessible retail crypto exchange nor equity options. Keep for education and future roadmap |
| `options-advanced` | `advanced-options-volatility` | 🔴 | Volatility surface/SABR/Greeks rebalancing requires liquid options market — not available in VN retail. Educational only |

---

## Tools & Workflow

| Directory | Skill name | VN | Notes |
|---|---|---|---|
| `doc-reader` | `document-reader` | 🟢 | Universal file tool — works with any VN research PDF/Excel |
| `web-reader` | `web-page-reader` | 🟢 | Works with VN sites: HoSE.vn, CafeF, VnExpress Finance, SSI Research, Vietstock |
| `report-generate` | `research-report-writer` | 🟢 | Standard research report structure; can output in Vietnamese |
| `research-goal` | `research-goal` | 🟢 | Workflow tool, market agnostic |
| `regulatory-knowledge` | `market-regulations` | 🔴 | **Wrong jurisdiction — covers A股/HK/US/crypto regulations.** Would give VN investors incorrect information about local law. **Needs a full rebuild** with VN framework: Law on Securities 54/2019/QH14, Decree 155/2020/ND-CP, Circular 37/2016/TT-BTC (tax), HoSE/HNX trading rules |
| `pine-script` | `tradingview-export` | 🟡 | **TradingView supports VN stocks** (HOSE:VCB, HOSE:VHM, etc.) — works perfectly. The 通达信/同花顺/东方财富 Chinese platform exports are irrelevant for VN |
| `trade-journal` | `trade-journal-analyzer` | 🟡 | Behavioral analysis (disposition effect, overtrading, chasing, anchoring) highly relevant for VN retail. **Parsers hardcoded for Chinese broker formats** (同花顺, 东方财富, 富途). Need to add VN broker formats: SSI eStatement, VPS contract note, TCBS history, VNDirect, Mirae Asset VN |
| `execution-model` | `trade-execution-cost` | 🟡 | VWAP/TWAP and slippage formulas applicable. **VN-specific calibration needed**: broker fee 0.15–0.35%, VSD sell tax 0.1% (Circular 111/2013/TT-BTC), market impact parameters need VN liquidity calibration |
| `social-media-intelligence` | `social-media-signals` | 🟡 | Concept highly relevant — VN retail is heavily social-media driven. **Platform list wrong for VN**: replace Twitter/Discord/Reddit with Facebook groups, Zalo groups, TikTok Finance (dominant in VN) |
| `shadow-account` | `trading-dna-analyzer` | 🟡 | Excellent concept: extract profitable patterns from your own trade history. **References A股/港股/美股/crypto settlement formats.** Need to add VN broker statement formats (SSI, VPS, TCBS, VNDirect) |

---

## Summary

| Status | Count | Description |
|---|---|---|
| 🟢 Works immediately | 27 | Pure technical, quant, behavioral, global macro, universal tools |
| 🟡 Works with VN adaptation | 22 | Sound methodology; data sources or market references need updating |
| 🔴 Limited for VN retail | 8 | Options market missing, wrong jurisdiction, or market structure incompatible |

### Priority actions

1. **Rebuild `market-regulations`** — current content covers Chinese/HK/US/crypto law and would actively mislead VN investors. Replace with Law 54/2019/QH14, Decree 155, Circular 37 (tax), and HoSE/HNX trading rules.

2. **Add VN data source adapters** to `stock-screener`, `financial-statements`, `trade-journal-analyzer`, and `trading-dna-analyzer` — these four have the highest retail value and only need VN-compatible data input.

3. **Translate `chan-theory-analysis` and `sector-rotation`** descriptions to English/Vietnamese — the analytical logic is sound but the documentation is entirely in Chinese.

4. **Adapt `social-media-signals`** for VN platforms — Facebook groups and Zalo are dominant, not Twitter/Reddit.

---

## Held back (pending VN compliance review)

20 skills from Vibe-Trading were **not imported** because they reference specific markets needing compliance review before use:

| Category | Skills |
|---|---|
| China data connectors | `akshare`, `tushare`, `mootdx`, `hk-connect-flow`, `adr-hshare`, `ashare-pre-st-filter` |
| Crypto / DeFi | `ccxt`, `crypto-derivatives`, `defi-yield`, `liquidation-heatmap`, `okx-market`, `onchain-analysis`, `perp-funding-basis`, `stablecoin-flow`, `token-unlock-treasury` |
| US-specific | `edgar-sec-filings`, `us-etf-flow` |
| Data connectors | `yfinance`, `vnpy-export`, `data-routing` |

---

*Last updated: 2026-05-29 | Source: HKUDS/Vibe-Trading v1 import*
