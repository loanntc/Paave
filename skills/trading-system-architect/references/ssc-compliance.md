# SSC Compliance Reference

## 1. Settlement Rules

| Asset Class | Settlement Cycle | Notes |
|---|---|---|
| Equities (HOSE/HNX/UPCoM) | T+2 | Calendar days, not trading days |
| Government bonds | T+1 | |
| Corporate bonds | T+2 | |
| ETF | T+2 | |
| Covered Warrants | T+2 | |

**System implication**: Settlement date must be calculated excluding weekends and public holidays. Maintain a trading calendar table in DB.

---

## 2. Circuit Breakers

| Exchange | Daily Price Limit | Reference Price |
|---|---|---|
| HOSE | ±7% | Previous closing price |
| HNX | ±10% | Previous closing price |
| UPCoM | ±15% | Previous closing price |

**Ceiling price** = `ROUND(reference_price × (1 + limit), tick_size)`
**Floor price** = `ROUND(reference_price × (1 - limit), tick_size)`

**System implication**: Price validation must occur at order entry. Orders outside [floor, ceiling] must be rejected with error code `ORDER_PRICE_OUT_OF_RANGE`.

---

## 3. Tick Size (Price Step)

### HOSE Tick Size

| Price Range (VND) | Tick Size (VND) |
|---|---|
| < 10,000 | 10 |
| 10,000 – 49,950 | 50 |
| ≥ 50,000 | 100 |

### HNX Tick Size

| Price Range (VND) | Tick Size (VND) |
|---|---|
| All prices | 100 |

### UPCoM Tick Size

| Price Range (VND) | Tick Size (VND) |
|---|---|
| All prices | 100 |

**System implication**: All order prices must be validated as multiples of the applicable tick size. Reject with `ORDER_INVALID_TICK_SIZE`.

---

## 4. Trading Hours

### HOSE

| Session | Time | Order Types Allowed |
|---|---|---|
| Pre-open | 08:45–09:00 | ATO only |
| Continuous morning | 09:00–11:30 | LO, MP, MOK, MAK |
| Lunch break | 11:30–13:00 | No trading |
| Continuous afternoon | 13:00–14:30 | LO, MP, MOK, MAK |
| Pre-close | 14:30–14:45 | ATC only |
| Closed | 14:45+ | No orders accepted |

### HNX

| Session | Time | Order Types Allowed |
|---|---|---|
| Pre-open | 08:45–09:00 | ATO only |
| Continuous morning | 09:00–11:30 | LO, MOK, MAK |
| Lunch break | 11:30–13:00 | No trading |
| Continuous afternoon | 13:00–14:30 | LO, MOK, MAK |
| Pre-close | 14:30–14:45 | ATC only |
| Closed | 14:45+ | No orders accepted |

**Note**: MP (Market Price) orders are only available on HOSE, not HNX.

**System implication**: Order gateway must validate order type against current session and exchange. Maintain a session state machine per exchange.

---

## 5. Order Types

| Order Type | HOSE | HNX | Description |
|---|---|---|---|
| LO (Limit Order) | ✓ | ✓ | Fixed price, rests in book |
| MP (Market Price) | ✓ | ✗ | Executes at best available price |
| MOK (Match or Kill) | ✓ | ✓ | Full fill or cancel |
| MAK (Match and Kill) | ✓ | ✓ | Partial fill allowed, remainder cancelled |
| ATO (At The Open) | ✓ | ✓ | Pre-open session only |
| ATC (At The Close) | ✓ | ✓ | Pre-close session only |

---

## 6. Lot Size

| Market | Board Lot | Odd Lot |
|---|---|---|
| HOSE | 100 shares | < 100 shares (separate odd-lot market) |
| HNX | 100 shares | < 100 shares (separate odd-lot market) |
| UPCoM | 100 shares | Negotiated |

**System implication**: Validate order quantity is a multiple of 100 for regular board. Odd-lot orders must be routed to separate odd-lot session.

---

## 7. Foreign Ownership Limits

- Each stock has a **foreign room** (remaining foreign ownership capacity)
- **General limit**: 49% for most sectors; 30% for banking; 0% for restricted sectors
- Foreign buy orders must check available room **at time of order entry**
- Room is reserved (not deducted) at order placement; deducted at execution

**System implication**:
- Maintain `foreign_room` table with real-time updates
- Pre-order check: `available_room >= order_quantity`
- Room reservation must be atomic (use DB transaction or Redis atomic ops)
- Room release on order cancel/expiry

---

## 8. KYC / AML Requirements

### Account Creation — Required Fields
- Full legal name (as per ID)
- National ID number + issue date + issue place
- Date of birth
- Tax code (MST)
- Bank account number (linked)
- Address
- Phone + email
- Source of funds declaration (for accounts > threshold)

### Transaction Monitoring
- Single transaction ≥ 300,000,000 VND → flag for review
- Cumulative daily ≥ 500,000,000 VND → flag for review
- Structuring patterns → flag for AML review

**System implication**: AML flags must be stored in audit log. Do not block transaction automatically — route to compliance queue for human review unless configured otherwise.

---

## 9. Audit Trail Requirements

Every order lifecycle event must log:

```
- event_id (UUID)
- event_type (ORDER_PLACED, ORDER_MODIFIED, ORDER_CANCELLED, ORDER_EXECUTED, ORDER_REJECTED)
- order_id
- user_id
- account_id
- timestamp (millisecond precision, UTC)
- ip_address
- exchange
- symbol
- side (BUY/SELL)
- order_type
- quantity
- price
- status_before
- status_after
- rejection_reason (if applicable)
- session_id
```

**Data retention**: Minimum **10 years** per SSC Circular 121/2020/TT-BTC.
**Storage implication**: Partition audit log table by month. Archive to cold storage after 2 years, retain index.

---

## 10. Price Reference Rules

| Situation | Reference Price |
|---|---|
| Normal day | Previous day closing price |
| First listing day | Listing price (set by exchange) |
| Ex-dividend day | Adjusted price (post-dividend) |
| Stock split/merge | Adjusted price |
| Suspended then resumed | Last traded price or exchange-set reference |

---

## ⚠ Pending Compliance Areas

The following areas have NOT yet been captured in this skill. When the user mentions any of these, **remind them** and request compliance details before designing:

- Derivatives (futures, options on VN30 index)
- Covered Warrants (beyond basic settlement)
- Bond repo transactions
- Margin trading rules (tỷ lệ ký quỹ, margin call thresholds)
- Short selling rules
- New exchanges or trading platforms beyond HOSE/HNX/UPCoM
- Cross-border transactions / foreign investor repatriation
- Specific fund/ETF NAV calculation rules
- Any regulatory update post-2024
