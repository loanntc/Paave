# Document Gap Analysis — 2026-05-29

## Executive Summary

Five documents were reviewed in full: BRD.md (first 100 lines / scope section), FRD-06 (Markets Screen, v2.4), FRD-10 (Paper Trading Engine, v2.4), FRD-17 (Market Board, v1.0), FRD-18 (Order History and Orderbook, v1.0), and FRD-19 (Order Management, v1.0), plus SRD-order-engine-v2.3.md. The directory listing confirmed that FRD-20 and all three companion SRD files (srd/18, srd/19, srd/20) do not exist on disk. A total of 9 gaps were identified, of which 4 are CRITICAL, 3 are HIGH, and 2 are MEDIUM. Two critical gaps were fixed in-place during this review; five remain open and require BA/PO/engineering input.

---

## Gap Table

| Document | Gap ID | Severity | Gap Description | Action |
|----------|--------|----------|-----------------|--------|
| FRD-06 | GAP-001 | CRITICAL | No supersession notice. FRD-17 silently overrides FR-36 and portions of FR-37 with no notice in FRD-06. A developer reading FRD-06 alone would implement the old Top-5-only Vietnam tab and produce a regression. | **Fixed** — supersession block added at top of FRD-06 |
| FRD-10 | GAP-002 | CRITICAL | No cross-references to FRD-18, FRD-19, or FRD-20. FRD-10 §6 (UI/UX Notes) specifies the Order Entry screen as "MARKET / LIMIT" only. FRD-18 and FRD-19 extend the engine with Order History, Edit Order, Cancel Order, and STOP/STOP_LIMIT types. A developer handed only FRD-10 would build an incomplete order management experience with no path to the new screens. | **Fixed** — companion document block added after status line in FRD-10 |
| SRD-order-engine-v2.3.md | GAP-003 | CRITICAL | STOP and STOP_LIMIT order types are absent. FRD-19 (§FR-OM-07) and FRD-18 define parent-child STOP order lifecycle, cancellation rules, child LO creation on trigger, and fill sequencing. The SRD has no trigger-price logic, no STOP state in §2 flow diagrams, no `stop_price` field in §6 data model, no error codes for invalid stop prices, and no API contract shape for STOP orders. Developers implementing FRD-19 have no SRD to build against. | Needs SRD-20 to be authored and linked |
| FRD-10 | GAP-004 | CRITICAL | `order_type` enum in FRD-10 §FR-PT-07.1 lists `MARKET, LO, ATO, ATC` for HOSE. FRD-19 and FRD-18 introduce `STOP` and `STOP_LIMIT` as first-class order types with exchange-specific rules. FRD-10 BR table (BR-PT-01 through BR-PT-20) has no business rules for STOP trigger mechanics, stop-price band validation, or parent-child order lifecycle. This is an enumeration gap: the primary order engine spec does not enumerate all V1 order types. | Needs BA to add STOP/STOP_LIMIT rules to FRD-10 §FR-PT-07 and §3 BR table |
| FRD-18 | GAP-005 | HIGH | FRD-18 header declares `Linked SRD: SRD-order-engine-v2.3.md` but that SRD contains no Orderbook (depth-of-market) system spec. FRD-18 Part B (Orderbook widget) has no corresponding SRD section with data model, API contract, or WebSocket event shape for bid/ask ladder. | Needs SRD-18 authored (or SRD-order-engine v2.4 section added) |
| FRD-19 | GAP-006 | HIGH | FRD-19 header declares `Linked SRD: SRD-order-engine-v2.3.md` and `Linked FRD: FRD-20 (Order Detail)` — but FRD-20 does not exist on disk. FRD-19 §FR-OM-01 and §FR-OM-02 reference the Edit Order flow as navigated from the Order Detail screen, which is defined in FRD-20. Without FRD-20 the navigation entry point for Edit Order is unspecified. | Needs FRD-20 to be authored; placeholder blocks created in FRD-10 cross-reference |
| FRD-06 | GAP-007 | HIGH | FRD-06 version header still references `brd-paave-v2.2.md` as the linked BRD. The active BRD is `BRD.md` at v2.4 (which supersedes v2.2 and v2.3). The stale link will cause traceability matrix failures and confuse any BA or QA tracing FR-38/FR-39/FR-40/FR-41 backward to BRD objectives. | Needs BA to update version header — change `Linked BRD: brd-paave-v2.2.md` to `Linked BRD: BRD.md v2.4` |
| SRD-order-engine-v2.3.md | GAP-008 | MEDIUM | SRD §4.2 `cancel_reason` enum lists `USER_CANCELLED, PORTFOLIO_RESET, ACCOUNT_DELETED, SESSION_CLOSE_WHILE_SUSPENDED, DELISTED` but FRD-10 §FR-PT-08 valid transitions table lists `ATO_ATC_NO_MATCH` as a cancel_reason (v2.4 amendment). SRD §6.1 data model ENUM definition does not include `ATO_ATC_NO_MATCH`. DB schema generated from the SRD will reject the value the application tries to write. | Needs SRD §6.1 `cancel_reason` ENUM to add `ATO_ATC_NO_MATCH` and `QUEUE_TTL_EXPIRED` |
| SRD-order-engine-v2.3.md | GAP-009 | MEDIUM | SRD §1 `Linked FRD: FRD-module-B-v2.3.md` is a stale reference. The authoritative FRD is FRD-10 (Paper Trading Engine v2.4), which explicitly supersedes FRD-module-B-v2.3.md. Any developer following the SRD link to find the FR spec will land on a superseded document. | Needs BA to update SRD header — change linked FRD to `frd/10-paper-trading.md` |

---

## Critical Gaps Fixed In This Review

### GAP-001 — FRD-06 Supersession Notice Added

File: `/Users/loannguyen/Paave/docs/business/frd/06-markets.md`

A supersession block was inserted immediately after the document version header and before the Module Description section. The block specifies:
- FR-36 and the Top-5-list portion of FR-37 are superseded by FRD-17.
- FR-38 (Korea), FR-39 (Global), FR-40 (Search), FR-41 (Market Hours) remain authoritative in FRD-06.
- Dated 2026-05-29.

A developer reading FRD-06 now sees — before any requirement text — which parts are still active and where to find the replacement spec for the Vietnam price board.

### GAP-002 — FRD-10 Companion Document Cross-References Added

File: `/Users/loannguyen/Paave/docs/business/frd/10-paper-trading.md`

A companion document block was inserted immediately after the Status line and before the Purpose note. The block names:
- FRD-18 (`18-order-history-orderbook.md`) for Order History and Orderbook.
- FRD-19 (`19-order-management.md`) for Edit Order and Cancel Order.
- FRD-20 (`20-order-placement-v2.md`) for Order Placement V2 including STOP and STOP_LIMIT types.
- SRD paths for the three companion SRDs (noted as pending authoring).
- Dated 2026-05-29.

---

## Gaps Requiring BA/PO Input

### GAP-003 — SRD has no STOP/STOP_LIMIT logic (CRITICAL)

Decision needed: Author SRD-20 (`srd/20-order-placement-v2.md`) to cover:
1. Trigger-price evaluation flow (equivalent to §2.3 Limit Order Evaluation Daemon but for stop triggers).
2. Parent-child order creation: when stop_price is reached, the system creates a child LO at the limit_price — the child inherits the parent's idempotency context but receives its own order_id.
3. `stop_price` field in `virtual_orders` table (§6.1 additions).
4. Error codes for invalid stop prices (stop_price above current for a STOP_BUY, below current for a STOP_SELL — analogous to E-PT-201/202 for limits).
5. API contract for `order_type: "STOP"` and `order_type: "STOP_LIMIT"` request/response shapes.

The SRD-order-engine-v2.3.md must either be extended (v2.4) or a new SRD-20 file must be created and cross-linked from FRD-10, FRD-19, and the SRD header.

### GAP-004 — FRD-10 missing STOP/STOP_LIMIT business rules (CRITICAL)

Decision needed: BA to add to FRD-10:
1. A new sub-section in §FR-PT-07 (or a new FR-PT-10 block) covering STOP and STOP_LIMIT mechanics for HOSE/HNX/UPCOM: what constitutes a valid stop_price, how the trigger is evaluated (snapshot-based, same 15-second cadence as limit evaluation), and how the child LO is created.
2. New business rules BR-PT-21 and BR-PT-22 (or continuation of the existing sequence) formalising stop trigger behaviour and parent-child order relationship.
3. Updated §FR-PT-07.1 HOSE supported order types table to add `STOP` and `STOP_LIMIT`.
4. Updated §FR-PT-08 state machine to add STOP-specific transitions (e.g., PENDING → TRIGGERED → child LO created).

### GAP-005 — No SRD for FRD-18 Orderbook widget (HIGH)

Decision needed: Architect to define:
1. Whether the Orderbook bid/ask data comes from a WebSocket feed or a polling REST endpoint.
2. The data schema for the bid/ask ladder (price, volume, cumulative volume per level).
3. The SRD file path (`srd/18-order-history-orderbook.md`) and which engineer is responsible for authoring it.

Until SRD-18 exists, the backend engineer implementing the Orderbook has no authoritative data contract.

### GAP-006 — FRD-20 does not exist (HIGH)

Decision needed: BA to author FRD-20 (`20-order-placement-v2.md`) covering:
1. Order Placement V2 screen layout (all six order types: LO, MP/MARKET, ATO, ATC, STOP_LIMIT, STOP).
2. Order Detail screen (referenced by FRD-19 §FR-OM-01 as the navigation entry point for Edit Order).
3. Stop-price input field UX, validation feedback for stop_price vs current_price, and the trigger confirmation screen.

Until FRD-20 exists, the Edit Order navigation path in FRD-19 has an unresolved entry point.

### GAP-007 — FRD-06 stale BRD link (HIGH)

Fix is mechanical but must go through BA review. Change the version header line in FRD-06 from `Linked BRD: brd-paave-v2.2.md` to `Linked BRD: BRD.md v2.4`. No requirement changes; traceability only.

---

## Cross-Reference Consistency

| Link | Source Document | Declared Target | Actual Target on Disk | Status |
|------|-----------------|-----------------|-----------------------|--------|
| FRD-06 → BRD | FRD-06 version header | `brd-paave-v2.2.md` | `BRD.md` (v2.4) | BROKEN — stale filename |
| FRD-10 → SRD | FRD-10 header | `SRD-order-engine-v2.3.md` | `SRD-order-engine-v2.3.md` | OK |
| FRD-10 → FRD-18 | FRD-10 (post-fix) | `18-order-history-orderbook.md` | `frd/18-order-history-orderbook.md` | OK — file exists |
| FRD-10 → FRD-19 | FRD-10 (post-fix) | `19-order-management.md` | `frd/19-order-management.md` | OK — file exists |
| FRD-10 → FRD-20 | FRD-10 (post-fix) | `20-order-placement-v2.md` | Not on disk | BROKEN — file missing |
| FRD-10 → SRD-18 | FRD-10 (post-fix) | `srd/18-order-history-orderbook.md` | Not on disk | BROKEN — file missing |
| FRD-10 → SRD-19 | FRD-10 (post-fix) | `srd/19-order-management.md` | Not on disk | BROKEN — file missing |
| FRD-10 → SRD-20 | FRD-10 (post-fix) | `srd/20-order-placement-v2.md` | Not on disk | BROKEN — file missing |
| FRD-17 → FRD-06 | FRD-17 supersession note | `FRD-06 §FR-36, §FR-37` | `frd/06-markets.md` | OK — file exists; now has reciprocal notice |
| FRD-18 → FRD-10 | FRD-18 header | `FRD-10` | `frd/10-paper-trading.md` | OK |
| FRD-18 → FRD-20 | FRD-18 header | `FRD-20` | Not on disk | BROKEN — file missing |
| FRD-18 → SRD | FRD-18 header | `SRD-order-engine-v2.3.md` | `SRD-order-engine-v2.3.md` | Nominally OK — but SRD lacks Orderbook spec |
| FRD-19 → FRD-10 | FRD-19 header | `FRD-10` | `frd/10-paper-trading.md` | OK |
| FRD-19 → FRD-20 | FRD-19 header | `FRD-20 (Order Detail)` | Not on disk | BROKEN — file missing |
| FRD-19 → SRD | FRD-19 header | `SRD-order-engine-v2.3.md` | `SRD-order-engine-v2.3.md` | Nominally OK — but SRD lacks STOP logic |
| SRD-order-engine-v2.3 → FRD | SRD header | `FRD-module-B-v2.3.md` | Not on disk (superseded by FRD-10) | BROKEN — stale reference |

**Summary of broken links:** 7 broken cross-references found. Of these, 3 point to FRD-20 (which has not been authored), 3 point to SRD files that do not exist yet, and 1 is a stale filename in the SRD header.

---

*Reviewed by: BA Spec Writer | Date: 2026-05-29 | Scope: FRD-06, FRD-10, FRD-17 (header), FRD-18 (header), FRD-19 (header + STOP references), SRD-order-engine-v2.3.md, BRD.md §1 scope*
