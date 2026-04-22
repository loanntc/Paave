# BRD — Addendum v2.3
## Paave — Paper Trading Order Rules & Missing Business Rules

**Date:** 2026-04-20
**Author:** Business Analysis Team
**Status:** Pending Product Owner Review
**Addendum to:** BRD.md v2.2
**Change type:** Additive — no existing rules removed

---

## Section 5.1.5 — Paper Trading (Additions to v2.2)

The following replaces the "Order types" and "Order fill mechanics" rows in §5.1.5 with the expanded version:

| Feature | Description |
|---------|-------------|
| **Order types — VN (HOSE/HNX, primary)** | **MARKET** (fills at next price snapshot), **LIMIT (LO)** (fills when market price crosses limit), **ATO** (At-the-Opening: accepted only 09:00–09:15 ICT; fills at computed opening price; no user price), **ATC** (At-the-Closing: accepted only 14:30–14:45 ICT; fills at closing price; no user price). |
| **Order types — VN (UPCOM)** | LIMIT (LO) only. MARKET not supported on UPCoM in V1. |
| **Order types — KR / Global (reference-only)** | MARKET and LIMIT only. ATO/ATC not supported. No session enforcement. All fills labeled "Estimated fill." |
| **Order fill mechanics** | VN: fills at next price snapshot ≤15s. KR/Global: best-available estimated price; "Estimated fill" label shown. |
| **VN session windows** | Pre-opening 09:00–09:15 (ATO only), Continuous 09:15–11:30 and 13:00–14:30 (MARKET + LO), ATC 14:30–14:45 (ATC + existing LO), After hours: all new orders rejected. |
| **Board lot size (VN)** | HOSE/HNX/UPCOM standard lot = 100 shares. Quantities must be multiples of 100. Odd lots (1–99) not supported in V1 paper trading. |
| **Daily price bands (VN)** | HOSE: ±7% from reference (previous close). HNX: ±10%. UPCOM: ±15%. Newly listed stocks (HOSE, first 3 sessions): ±20%. Simulated in paper trading — limit prices outside band are rejected. |
| **Tick sizes (VN)** | ≥50,000 VND → 100 VND increments. 10,000–49,999 VND → 50 VND. <10,000 VND → 10 VND. |
| **Max open orders** | 10 PENDING orders per user at any time (VN + KR + Global combined). |
| **Simulated transaction fee** | 0.1% of trade value applied to both BUY and SELL. Shown on order confirmation as "Simulated fee: X VND" for educational purpose. |
| **Order expiry** | LIMIT orders auto-expire after 30 calendar days. ATO/ATC expire at end of the session they were placed for if unfilled. |

---

## Section 6 — Business Rules (Additions to v2.2)

The following rules are NEW in v2.3 and do not exist in BRD v2.2:

| Rule ID | Rule | Rationale |
|---------|------|-----------|
| BR-PT-01 | VN (HOSE/HNX/UPCOM) paper orders must be placed in multiples of 100 shares (board lot). Orders with quantities that are not multiples of 100 are rejected. | Mirrors real VN exchange rules; reinforces realistic simulation for F0 investors learning market mechanics. |
| BR-PT-02 | Paper orders on HOSE are subject to the daily price band: ceiling = reference_price × 1.07 (floor: × 0.93). Limit prices outside this band are rejected at submission. Exception: newly listed stocks (first 3 trading sessions) use ±20% band. | Realistic simulation of SSC / HoSE regulations. F0 investors must understand price limits. |
| BR-PT-03 | Paper orders on HNX use ±10% daily band; UPCoM uses ±15% band. | Same rationale as BR-PT-02. |
| BR-PT-04 | MARKET orders on HOSE/HNX are rejected during: (a) Pre-opening session 09:00–09:15 (use ATO instead) and (b) ATC session 14:30–14:45 (use ATC instead). | Mirrors exchange rules. Teaches users about session-specific order types. |
| BR-PT-05 | ATO (At-the-Opening) orders may only be submitted between 09:00–09:15 ICT and must not include a limit price. They fill at the computed opening price at 09:15. | HOSE/HNX real rule. |
| BR-PT-06 | ATC (At-the-Closing) orders may only be submitted between 14:30–14:45 ICT and must not include a limit price. They fill at the closing price at 14:45. | HOSE/HNX real rule. |
| BR-PT-07 | VN MARKET orders are rejected when market status = CLOSED (outside 09:00–14:45 ICT on trading days, or on public holidays per the VN market calendar). KR/Global market orders received outside simulated session hours are accepted and queued as QUEUED_AFTER_HOURS. | Primary market (VN) enforces session rules strictly; reference markets (KR/Global) queue flexibly. |
| BR-PT-08 | BUY limit orders reserve the estimated cost (quantity × limit_price × 1.001) from the virtual balance immediately on order creation. Available balance = total_balance − sum_of_all_open_buy_limit_reserves. | Prevents over-commitment of virtual funds across multiple pending orders. |
| BR-PT-09 | Holdings soft-locked by an open SELL limit order cannot be used for another SELL order until the first is filled, cancelled, or expired. | Prevents double-selling the same virtual shares. |
| BR-PT-10 | BUY limit price must be ≤ current market price at submission. SELL limit price must be ≥ current market price at submission. Orders that would fill immediately must use the MARKET order type. | Limits that cross the current price are effectively market orders — educate the user to use the correct type. |
| BR-PT-11 | All KR and Global paper trade records must display an "Estimated fill" label. No price-band, tick-size, or session validation is applied to KR/Global reference-market orders. | Reference data is not real-time; enforcing VN-style rules on it would produce false validation errors. |
| BR-PT-12 | Limit orders auto-expire after 30 calendar days. On expiry: status = EXPIRED; reserved funds (BUY) and soft locks (SELL) released; push notification sent. This resolves the inconsistency in SRD v2.0 §2.11 which stated GTC semantics — the correct behavior is 30-day expiry as defined in FRD. | Aligns SRD with FRD. |
| BR-PT-13 | Portfolio reset automatically cancels all PENDING limit orders (and QUEUED_AFTER_HOURS orders). The reset confirmation dialog must display the count of orders to be cancelled. User must explicitly confirm. | Prevents orphaned reserves and soft locks after a reset. |
| BR-PT-14 | Maximum 10 PENDING orders per user across all markets at any time. | Prevents abuse and complexity; realistic for an F0 learning environment. |
| BR-PT-15 | Order submissions include a client-generated idempotency_key (UUID v4). Duplicate submissions with the same key within 5 minutes return the original order response without creating a new record. | Prevents double orders from double-taps or network retries. |

---

## Section 10 — Risk Register (Additions)

| Risk ID | Risk | Likelihood | Impact | Mitigation |
|---------|------|-----------|--------|------------|
| RISK-PT-01 | VN market calendar not updated before a holiday; orders submitted on a holiday are incorrectly routed as QUEUED_AFTER_HOURS instead of rejected | Medium | Medium | Operations SLA: calendar populated 1 quarter ahead. Fallback: dates missing from calendar default to CLOSED. Monthly calendar audit by ops. |
| RISK-PT-02 | Daily reference price (prev close) not populated at market open → price band calculation defaults to 0 → all limit prices fail validation | Low | High | Daily end-of-day job writes reference prices to DB. If job fails, circuit breaker uses last_known_reference_price (stale up to 1 day) and logs alert. |
| RISK-PT-03 | Race condition in limit order evaluation: two concurrent price ticks both trigger a fill on the same order | Low | High | Row-level SELECT FOR UPDATE on virtual_orders at fill time. One tick acquires lock and fills; the other reads FILLED and aborts. Covered in SRD-order-engine-v2.3.md §2.3. |
| RISK-PT-04 | User exploits "estimated fill" on KR/Global reference orders to simulate P&L that doesn't reflect actual market conditions | Low | Low | KR/Global orders are labeled "Estimated fill" in all records and on the Trader Score. Estimated fills are excluded from the Return component of the Trader Score (TBD: PO decision required — see §PO Review below). |

---

*End of BRD Addendum v2.3.*
