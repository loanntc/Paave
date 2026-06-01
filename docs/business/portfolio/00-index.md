# Portfolio / Virtual Trading Dashboard — Document Index

**Version:** 1.0
**Date:** 2026-06-01
**Feature:** Portfolio / Virtual Trading Dashboard
**Status:** Draft — Pending Product Owner Sign-off
**Owner:** BA Team

---

## Why This Folder Exists

This folder contains all business and functional specifications for the **Portfolio tab** of Paave — a Virtual Paper Trading Dashboard that allows F0 Vietnamese traders (ages 16–27) to practice equity trading with simulated funds. No real money changes hands and no real orders are routed to any exchange. The specifications here define every screen, every computation, every business rule, and every error state that the engineering team must implement and the QA team must validate. All documents in this folder must be read together; no single file is complete in isolation.

---

## Reading Order

| # | File | Purpose | Primary Audience |
|---|------|---------|-----------------|
| 1 | `00-index.md` *(this file)* | Orientation: why this folder exists, architecture overview, key decisions, screen map | All — read first |
| 2 | `01-requirements.md` | Full FRD: FR-PORT-01 through FR-PORT-10, business rules, acceptance criteria, NFRs | Engineers, QA, BA |
| 3 | `../frd/10-paper-trading.md` | Parent FRD covering the full Paper Trading module; Portfolio is one sub-feature within it | Product, Engineers |
| 4 | `../../api/virtual-trading-api-spec.md` | REST API contract for all `/api/v1/virtual/` endpoints | Engineers, QA |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER (F0 Trader)                       │
│                       iOS / Android Device                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ Tap Portfolio Tab
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REACT NATIVE APP (Paave)                    │
│                                                                 │
│  PortfolioDashboardScreen                                       │
│    ├── TotalPortfolioValueSection   (15s polling)               │
│    ├── AvailableCashSection                                     │
│    ├── HoldingsListSection                                      │
│    ├── PortfolioValueChartSection                               │
│    ├── RealizedPnLSection                                       │
│    ├── TradeHistorySection                                      │
│    └── OpenOrdersSection                                        │
│                                                                 │
│  VirtualFundsLabelChip  ← always mounted, non-dismissible      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST JSON
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                          REST API GATEWAY                       │
│                   /api/v1/virtual/* endpoints                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   VIRTUAL TRADING ENGINE                        │
│                                                                 │
│  AccountService     PortfolioService    OrderMatchingEngine     │
│  PnLCalculator      PositionManager     ResetOrchestrator       │
│                                                                 │
│  ← All order flow is SIMULATED. No routing to real exchanges. → │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Business Decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Virtual-only trading | All trades are paper trades; no real orders routed to VN/KR/Global exchanges | Regulatory compliance; Paave is an education app, not a licensed broker. F0 users (min age 16) cannot hold a brokerage account. |
| Virtual Funds label | "Tiền ảo / 가상 자금 / Virtual Funds" chip rendered on ALL virtual trading screens; non-dismissible | SSC/regulator requirement to prevent users from confusing paper trading with real trading. Locale-aware: Vietnamese for `vi`, Korean for `ko`, English fallback. |
| Starting balance | Exactly 500,000,000 VND (five hundred million) | Chosen to reflect a realistic mid-tier retail portfolio size in Vietnam while being large enough for diversification exercises. Must never be configurable by the user. |
| Portfolio reset behavior | Reset closes all positions, cancels all open orders, retains full trade history with `[Pre-Reset]` prefix, and restores balance to exactly 500,000,000 VND | Users need a clean-slate option for learning new strategies without losing historical context for reflection. |
| Order types supported | LO (Limit), MARKET, ATO (At The Open), ATC (At The Close), STOP_LIMIT, STOP | Matches order types available on Vietnamese exchanges (HOSE/HNX/UPCoM) plus stop orders for US/KR markets. |
| KR/Global order handling | Orders for Korean and Global equities display "Estimated fill" chip and TTL countdowns; 48h QUEUED_AFTER_HOURS expiry | KR and Global markets have different session hours relative to VN time; simulated fills cannot be instantaneous. |

---

## Module Structure / Screen Map

| Screen / Component | Route / Screen Name | Parent FR | Description |
|-------------------|-------------------|-----------|-------------|
| Portfolio Dashboard | `PortfolioDashboardScreen` | FR-PORT-01 | Main tab screen; 7 sections rendered as a single scrollable view |
| Holdings Detail | `HoldingDetailScreen` | FR-PORT-02 | Drill-down for a single holding's full history and P&L |
| Portfolio Value Chart | (embedded section) | FR-PORT-03 | Line + area chart with range selector; embedded in dashboard |
| Trade History | `TradeHistoryScreen` | FR-PORT-04 | Full-screen list with filter drawer; accessible from dashboard section |
| Open Orders | `OpenOrdersScreen` | FR-PORT-05 | Full-screen list; swipe-to-cancel; accessible from dashboard section |
| Place Order | `PlaceOrderBottomSheet` | FR-PORT-06 | Bottom sheet order form; launched from stock detail or holdings |
| Order Confirmation | `OrderConfirmationScreen` | FR-PORT-06 | Preview screen before order submission |
| Modify Order | `ModifyOrderScreen` | FR-PORT-07 | Edit price / quantity of a PENDING order |
| Portfolio Reset | `PortfolioResetModal` | FR-PORT-08 | Two-step confirmation modal |
| P&L Analytics | `PnLAnalyticsScreen` | FR-PORT-09 | Realized P&L breakdown, daily P&L, cumulative chart |
| Virtual Funds Label | `VirtualFundsLabelChip` | FR-PORT-10 | Persistent chip; mounted as overlay on all virtual screens |

---

## Related Documents

| Document | Location | Description |
|----------|----------|-------------|
| FRD-10: Paper Trading | `docs/business/frd/10-paper-trading.md` | Parent FRD for the full Paper Trading module. Portfolio tab is Sub-Feature 4 within this FRD. |
| Virtual Trading API Spec | `docs/api/virtual-trading-api-spec.md` | Complete REST API specification for all `/api/v1/virtual/` endpoints including request/response schemas, error codes, and rate limits. |
| Paave Design System (Kinetic Drop V2.0) | Figma: Paave DS / Kinetic Drop | Color tokens, typography (Space Grotesk / Manrope), component library. |
| F0 Learning Path Dev/QA Spec | `docs/DEV-QA-SPEC-F0-Learning-Path.md` | Dev/QA handoff spec for the broader F0 Learning Path feature (context for how Portfolio fits into onboarding). |
