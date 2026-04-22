### PORTFOLIO TRACKING

> **V2 Deprecation Note:** FR-30–FR-35 (manual portfolio entry) are superseded by Module B (Paper Trading Engine, FR-PT-01–FR-PT-06). These FRs are retained for reference only and will be removed in V3. The Portfolio tab now displays the paper trading dashboard (FR-PT-04).

#### FR-30 — Portfolio Holdings Overview

- **Actor:** Registered User
- **Description:** *(Deprecated in V2 — see FR-PT-04)* Portfolio screen shows manual holdings with ticker, shares, avg buy price, current price, current value, unrealized P&L.
- **Priority:** Deprecated (V2 → V3 removal)

---

#### FR-31 — Add Holding Manually

- **Actor:** Registered User
- **Description:** *(Deprecated in V2 — see FR-PT-02/FR-PT-03)* Manual holding entry via "+" button form.
- **Priority:** Deprecated

---

#### FR-32 — Edit Holding

- **Actor:** Registered User
- **Description:** *(Deprecated in V2)* Swipe-left edit on holding row.
- **Priority:** Deprecated

---

#### FR-33 — Delete Holding

- **Actor:** Registered User
- **Description:** *(Deprecated in V2)* Swipe-left delete on holding row with confirmation.
- **Priority:** Deprecated

---

#### FR-34 — Transaction History

- **Actor:** Registered User
- **Description:** *(Deprecated in V2 — see FR-PT-04 trade history)* Manual transaction history tab.
- **Priority:** Deprecated

---

#### FR-35 — P&L Color Coding

- **Actor:** Registered User
- **Description:** P&L values color-coded: positive → green (#00C853); negative → red (#D50000); zero → gray (#9E9E9E). "+" prefix for positive, "−" for negative.
- **V2 Note:** Retained and applied to paper trading P&L throughout app.
- **Key Rules:** Applied to all P&L values across paper portfolio, leaderboard, and profile.
- **Acceptance Criteria:**
  - Given unrealized P&L of +50,000 VND → displays "+50,000" in green.
- **Priority:** P0

---

