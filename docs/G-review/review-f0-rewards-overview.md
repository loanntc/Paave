# Spec Review: F0 Learning Path Virtual Capital Rewards
Date: 2026-06-01

---

## Executive Summary

This is one of the strongest spec sets in the Paave codebase. The FRD, SRD, and Design spec are tightly aligned, mutually cross-referenced, and cover the reward lifecycle end-to-end with concrete schemas, full SQL DDL, and pixel-level UI spec. A backend engineer and a designer could start work today on approximately 85% of the surface area. The remaining 15% covers three genuine blockers: the split-funding "partial order" product decision left explicitly open in the SRD, the absence of an `order_source` column definition for `virtual_orders`, and a TTL calculation conflict between FRD and SRD for QUEUED rewards.

---

## Coverage Score

| Audience | Score | Verdict |
|----------|-------|---------|
| Backend Engineer | 8.5/10 | Needs work (3 defined gaps, all fixable quickly) |
| Mobile Engineer | 8/10 | Needs work (polling endpoint mismatch, AsyncStorage reward cache key undefined, websocket assumption unverified) |
| Designer | 9/10 | Ready (minor copy gaps, one interaction ambiguity) |

---

## Gaps by Priority

### P0 — Blockers (cannot build without this)

---

**P0-01 | Split-funding "partial order" behavior is explicitly unresolved**
- File: `docs/business/srd/f0-learning-rewards.md` §7.4
- Quote: *"Open question for product: Should partial funding (reward balance + main balance for a single order) be supported? Default spec assumes no — reward balance must cover the full order, or the order uses main balance entirely."*
- The FRD (FR-REWARD-03) describes FIFO split-funding as the expected behavior: `"Main available_balance is consumed first; Bonus cash available_balance is consumed only after main balance reaches 0."` This directly contradicts the SRD default of "reward balance must cover the full order."
- Impact: The virtual order placement flow (FR-PORT-06 / SRD §7.4), the ledger DEBIT logic, the `balance_after` calculation, the QA test cases QA-R12 and QA-R13 in the design spec, and the `order_source` linkage all depend on which behaviour is implemented. Building to the wrong assumption requires a data-level rework.
- What's needed: A one-sentence product decision closing this open question before SRD §7.4 is implemented.

---

**P0-02 | `virtual_orders.order_source` column is referenced but never defined**
- File: `docs/business/srd/f0-learning-rewards.md` §5.2 (Step 3, Step 4), §7.2, §11.6 (migration step 3)
- The SRD repeatedly uses `order_source = $sub_account` as the linkage mechanism between orders and reward sub-accounts. The migration notes say *"Add `order_source` column to `virtual_orders` if not already present."* But the portfolio FRD (`docs/business/portfolio/01-requirements.md`) and the SRD's own §2.5 both explicitly state that the `virtual_orders` table schema is not changed. There is no DDL for the `order_source` column: no type, no nullable constraint, no index, no default, no FK reference.
- Impact: The entire force-liquidation query (§5.2 Step 4) and the PENDING order cancellation query (§5.2 Step 3) fail without this column. All position identification logic is blocked.
- What's needed: DDL for `virtual_orders.order_source VARCHAR(64) NULL REFERENCES learning_reward_sub_accounts(sub_account_id)` (or equivalent), plus an index definition.

---

**P0-03 | TTL clock start for QUEUED rewards contradicts between FRD and SRD**
- File A: `docs/business/f0-learning/05-virtual-capital-rewards.md` FR-REWARD-08: *"expires_at = awarded_at + 7 days (TTL clock starts at awarded_at, NOT at account initialisation time)"*
- File B: `docs/business/srd/f0-learning-rewards.md` §6.3: *"Update learning_rewards: set status = 'ACTIVE', expires_at = NOW() + INTERVAL '7 days'"*
- The SRD §6.3 sets `expires_at` to `NOW()` at activation time, which means the TTL clock starts when the virtual account is created — not when the MKC was passed. The FRD says the opposite. The FRD also explicitly notes that a user who initialises 6 days after earning the reward has only ~1 day remaining (EC-02), which is impossible if the SRD behaviour is implemented.
- Impact: This determines whether users lose reward time during account initialisation. The implementations of the activation query and the QUEUED reward notification flow both depend on the correct `expires_at` value.
- What's needed: Align SRD §6.3 to set `expires_at = granted_at + INTERVAL '7 days'` (not `NOW() + INTERVAL '7 days'`) on activation. Also: the SRD §3.1 shows `expires_at = null` for QUEUED rewards in the POST response, which is consistent with FRD only if `expires_at` is computed from `granted_at` at activation time — confirm this is the intent and fix §6.3.

---

### P1 — Must-Have (will cause rework or bugs if missing)

---

**P1-01 | Cron schedule conflict: FRD says 5 minutes, SRD says 15 minutes for force-liquidator**
- File A: `docs/business/f0-learning/05-virtual-capital-rewards.md` FR-REWARD-05: *"Cron job runs every 5 minutes"*
- File B: `docs/business/srd/f0-learning-rewards.md` §10.2: `*/15 * * * *` (every 15 minutes)
- The FRD NFR also says *"force-liquidation must complete within 10 minutes of expires_at"* — a 15-minute cron fails this NFR by definition.
- What's needed: Align on a single schedule. The SRD value (15 min) appears to be the more recent design decision; update the FRD to match, or update the SRD to 5 min and verify the 10-minute NFR holds.

---

**P1-02 | Status enum mismatch between FRD and SRD**
- The FRD (FR-REWARD-06 field definitions, FR-REWARD-07) lists these statuses: `QUEUED, ACTIVE, FROZEN, LIQUIDATING, EXPIRED, LIQUIDATION_FAILED`.
- The SRD ENUM (`learning_reward_status`) lists: `QUEUED, ACTIVE, PARTIALLY_USED, EXPIRED, LIQUIDATED`.
- The FRD statuses `FROZEN`, `LIQUIDATING`, and `LIQUIDATION_FAILED` have no equivalent in the SRD DDL. The SRD status `PARTIALLY_USED` and `LIQUIDATED` have no equivalent in the FRD.
- The `FROZEN` status is referenced in FRD BR-07 and FR-REWARD-03, which block trades when the reward is post-TTL but pre-liquidation. The SRD has no `FROZEN` state — it relies on `expires_at <= NOW()` checks at order time instead of a status field transition.
- Impact: The API response in SRD §3.2 returns `status: "PARTIALLY_USED"` and `status: "LIQUIDATED"` — if the mobile client is built to the FRD status enum, these unknown values will break the status badge display.
- What's needed: Reconcile into one authoritative enum. Decide whether `PARTIALLY_USED` replaces `ACTIVE` once any funds are spent (SRD), or whether `ACTIVE` covers all non-zero balance states (FRD). Decide whether `LIQUIDATED` (SRD) or `EXPIRED` (FRD) is the terminal post-liquidation state. Update both docs to match.

---

**P1-03 | The `bonus_cash_ledger` table (FRD) vs `learning_rewards` table (SRD) naming mismatch**
- The FRD uses `bonus_cash_ledger` as the table name throughout (90+ references). The SRD creates a table named `learning_rewards`. The design spec (Section 7, IR-R20) references `/bonus_cash_ledger` as the polling API path.
- No `bonus_cash_ledger` table is ever defined in the SRD DDL.
- Impact: Mobile engineers reading the design spec and FRD will build API calls to `/bonus_cash_ledger`. Backend engineers reading the SRD will build `/api/v1/virtual/learning-rewards`. These will diverge.
- What's needed: Standardize on one table/endpoint name across all three documents. The SRD naming (`learning_rewards`) is more aligned with the actual SQL schema; update all FRD and design spec references to match, or update the SRD.

---

**P1-04 | `available_balance` field on `learning_rewards` table is missing**
- The FRD (FR-REWARD-02, FR-REWARD-03, FR-REWARD-06) repeatedly refers to `bonus_cash_ledger.available_balance` as a live column that decrements when trades are placed.
- The SRD DDL for `learning_rewards` has no `available_balance` column. Instead, the SRD uses a double-entry ledger (`learning_reward_ledger.balance_after`) as the source of truth, requiring a `SELECT ... ORDER BY ledger_id DESC LIMIT 1` query to get the current balance.
- The SRD approach is architecturally cleaner. But the FRD spec — which the mobile client and acceptance tests are written against — assumes a direct `available_balance` field that can be read from the reward record.
- Impact: The GET /rewards response (`amount_remaining` in SRD vs `available_balance` in FRD) field name inconsistency will cause mobile engineers to build to the wrong field name.
- What's needed: Update the FRD to use `amount_remaining` (the SRD/API field name) consistently, or add an `available_balance` computed column note in the SRD. Confirm the API response field is `amount_remaining` as shown in SRD §3.2.

---

**P1-05 | No definition of how order placement integrates reward deduction with the existing order API**
- The existing portfolio FRD (`docs/business/portfolio/01-requirements.md` FR-PORT-06) describes order placement via `POST /api/v1/virtual/equity/orders`. There is no mention of reward-funded orders there.
- The SRD §7.4 adds a `funding_source: "learning_reward"` flag to the order request "or the backend infers it" — but the portfolio FRD's order endpoint schema has no such field, and the SRD doesn't modify the `POST /api/v1/virtual/equity/orders` request schema.
- The design spec (S6, QA-R12, QA-R13) assumes split-funding is transparent: the user places a normal order and the backend automatically deducts from reward + main. The SRD says the client may pass `funding_source`.
- Impact: Mobile engineers cannot build the order form correctly without knowing whether to pass `funding_source`, and backend engineers cannot build the deduction logic without knowing the source of the deduction signal.
- What's needed: Explicitly define whether `POST /api/v1/virtual/equity/orders` is modified (new optional field) or whether the backend infers funding source. If the field is added, provide the updated request schema.

---

**P1-06 | No deep link scheme defined for `LearningRewardDetailScreen`**
- The FRD (FR-REWARD-04) defines deep links as `paave://virtual-portfolio?tab=rewards` and `paave://virtual-portfolio?tab=history`.
- The design spec (Screen 4) defines notification tap targets as `/portfolio/reward-detail` (IR-R17, QA-R16) — a different scheme format.
- The SRD (§8, Step 9) uses `"screen": "VirtualPortfolio", "params": { "highlight": "learning_rewards" }` — yet another format.
- Impact: Push notification payloads sent by the backend use one deep link format; the mobile client registers handlers for another. Notifications will fail to deep-link.
- What's needed: One canonical deep link target per notification type, agreed across all three docs.

---

**P1-07 | `LearningRewardDetailScreen` is not in the portfolio FRD's mandatory `VirtualFundsLabel` screen list**
- File: `docs/business/portfolio/01-requirements.md` FR-PORT-10
- The `VirtualFundsLabelChip` is required on every virtual trading screen. `LearningRewardDetailScreen` is a new virtual trading screen but it does not appear in the mandatory list in FR-PORT-10.
- The design spec (QA-R22) does correctly specify it — but the portfolio FRD will drive the compliance regression test list.
- What's needed: Add `LearningRewardDetailScreen` to the FR-PORT-10 mandatory screen list.

---

**P1-08 | Force-liquidation partial failure handling is inconsistent**
- FRD FR-REWARD-05 (Failed Cases): *"Rollback entire liquidation for that ledger; log for manual review; set status = LIQUIDATION_FAILED; retry on next cron cycle."*
- SRD §5.3: *"Do NOT rollback the entire reward — only that position's sell fails... Mark the reward LIQUIDATED with liquidation_proceeds reflecting only the successfully sold positions."*
- These are opposite behaviors. The FRD rollback-and-retry approach means users see `LIQUIDATION_FAILED` status. The SRD partial-success approach means some positions may be silently lost at zero proceeds.
- What's needed: A product decision on which behavior is correct, followed by alignment in both docs.

---

### P2 — Should-Have (quality improvements)

---

**P2-01 | `notification_1h_sent` flag is missing from the SRD schema**
- The FRD (FR-REWARD-04) specifies both `notification_24h_sent` and `notification_1h_sent` flags. The SRD §6.2 only adds `notification_t24h_sent` and `notification_liq_sent` columns — there is no `notification_t24h_sent` at 1h. The SRD §6.1 notification schedule table also only has T+6 (24h warning) and T+7 (post-liquidation) — the 1h warning is entirely absent.
- Impact: The 1h warning notification (one of the two key user-facing urgency signals) will not be implemented if engineers follow the SRD.
- What's needed: Add `notification_t1h_sent BOOLEAN NOT NULL DEFAULT FALSE` and `notification_t1h_sent_at TIMESTAMPTZ NULL` to the SRD schema, and add the 1h query to the `reward-expiry-notifier` algorithm.

---

**P2-02 | `reward_id` is `BIGSERIAL` in SRD but API response shows integer `1001` — UUID inconsistency with FRD**
- The FRD (FR-REWARD-06) uses `ledger_id: "uuid"` throughout. The SRD uses `reward_id BIGSERIAL`. The API response examples in SRD §3.1 and §3.2 show `"reward_id": 1001` (integer).
- The design spec's `Reward` object shape (§4.2) uses `id: string` — consistent with UUID.
- Impact: Mobile engineers will build the `Reward` TypeScript interface expecting a string UUID; the API will return an integer. Component keys, deep link params, and ledger queries will break.
- What's needed: Decide on UUID or BIGSERIAL for the reward primary key and align all docs. If BIGSERIAL is used on the DB, cast to string in the API response.

---

**P2-03 | `module_name_vi` in FRD API response is not in SRD API response**
- The FRD §FR-REWARD-06 response includes `module_name_vi: "Phân tích cơ bản"`. The SRD GET `/learning-rewards` (§3.2) returns `module_id: 2` but no `module_name_vi` field.
- The design spec uses `moduleLabel` (e.g., "Module 2") rather than the full Vietnamese name.
- Impact: If the mobile client relies on `module_name_vi` from the API (FRD), it will fail when the API returns only `module_id` (SRD).
- What's needed: Add `module_name_vi` to SRD §3.2 response shape, or confirm the mobile client resolves the display name locally from `module_id`.

---

**P2-04 | Polling endpoint in design spec references non-existent path `/bonus_cash_ledger`**
- Design spec IR-R20: *"Client polls `/bonus_cash_ledger` every 60 seconds."*
- The SRD defines the endpoint as `GET /api/v1/virtual/learning-rewards`. There is no `/bonus_cash_ledger` API path anywhere in the SRD.
- What's needed: Update IR-R20 to reference `GET /api/v1/virtual/learning-rewards`.

---

**P2-05 | `market_price_snapshot` table referenced in FRD but absent from SRD schema**
- FRD FR-REWARD-05 and EC-12 reference a `market_price_snapshot` table used during force-liquidation to get the last known price.
- The SRD force-liquidation §5.2 Step 5 instead calls `GET /internal/market/price/{symbol_code}` (an internal HTTP call). There is no `market_price_snapshot` table in the SRD DDL.
- Impact: Whichever mechanism is used (DB table vs. HTTP call), failure handling and stale price behaviour differ. The FRD and SRD describe different architectures here.
- What's needed: Pick one approach and document it consistently. The SRD's HTTP call approach is more maintainable; update the FRD to reference internal price service instead of `market_price_snapshot`.

---

**P2-06 | Rate limiting not defined for rewards endpoints**
- The portfolio FRD (§5.3) defines a rate limit of 10 order requests per 60 seconds. The rewards FRD NFR section (§7) defines no rate limit for `POST /complete-module` or `GET /learning-rewards`.
- The `POST /complete-module` endpoint is the single entry point for both completing a module and granting a reward. A burst of retries could stress this endpoint.
- What's needed: Add rate limit specification to SRD §8.3 (or equivalent) for both the POST and GET rewards endpoints.

---

**P2-07 | Design spec's `BonusCashModal` does not handle the `QUEUED` reward state**
- The FRD (FR-REWARD-08) specifies that if the virtual account is not initialised, the reward is `QUEUED` — not `ACTIVE`. The SRD §3.1 shows that the POST response returns `status: "QUEUED"` with `expires_at: null`.
- The design spec's `BonusCashModal` (§8, Screen 1 state matrix) has three states: Default, Loading, and Error. There is no state for when the server confirms the module completion but the reward is `QUEUED` (because no virtual account exists yet).
- Impact: The modal would render as if the reward is active ("còn 7 ngày"), misleading a user who doesn't have a portfolio yet.
- What's needed: Add a `QUEUED` state to the `BonusCashModal` state matrix with copy like "Vốn thưởng sẽ được kích hoạt sau khi bạn khởi tạo tài khoản ảo."

---

**P2-08 | Accessibility: minimum touch target size not confirmed for `TTLCountdown` and `ExpiryBanner` CTA**
- The design spec Appendix C covers `aria-live` and `aria-modal` correctly. However, the `ExpiryBanner` CTA "Dùng ngay →" is specified as `80px wide minimum, full-height of banner` where banner height is 48px. 48×80px meets the 44dp minimum, but this is only confirmed for the CTA tap target — the ⚠ icon (16px) and the dismiss button (if `onDismiss` provided) have no touch target size specified.
- What's needed: Confirm the dismiss button tap target is ≥ 44×44px and add it to Appendix C.

---

**P2-09 | No definition of how `LearningRewardDetailScreen` is accessible without a push notification**
- The design spec defines Screen 3 (`LearningRewardDetailScreen`) as reachable by tapping the `RewardSection` card (IR-R05) or via push notification deep link (IR-R17). There is no entry point from the bottom tab bar or from the portfolio settings menu.
- If the `RewardSection` is hidden (no active rewards), the `LearningRewardDetailScreen` with its reward history becomes inaccessible to a user who has expired rewards but no active ones.
- What's needed: Confirm whether the screen is reachable when `RewardSection` is hidden (e.g., via portfolio settings or profile), or document it as intentionally inaccessible when all rewards are expired.

---

## Coverage Matrix

| Feature Area | FRD | SRD | Design | Status |
|---|---|---|---|---|
| Reward grant flow | Full | Full (step-by-step SQL) | Referenced (BonusCashModal) | Covered — with P0-03 TTL conflict |
| DB schema | Referenced (table names, fields) | Full DDL with constraints | N/A | Covered — with P1-03 naming conflict |
| API endpoints | Partial (one endpoint fully specced, event model elsewhere) | Full (4 endpoints) | Referenced | Covered — with P1-06 deep link mismatch |
| Force-liquidation | Full (logic + edge cases) | Full (SQL + algorithm) | Referenced (LIQUIDATING state) | Covered — with P1-08 partial-failure conflict |
| TTL / expiry | Full | Full (cron spec) | Full (timers, banner) | Covered — with P0-03 QUEUED TTL conflict |
| Portfolio integration | Full (sub-ledger isolation) | Full (profit-loss endpoint extension) | Referenced | Covered — with P0-02 order_source gap |
| BonusCashModal | Referenced | Notification payload only | Full spec | Covered — with P2-07 QUEUED state gap |
| Order Form integration | Full (FIFO logic) | Partial (open question on split-funding) | Full (S6, QA-R12/13) | Blocked — P0-01 split-funding decision |
| Push notifications | Full (3 types) | Full (algorithm) | Full (copy + payload) | Covered — with P1-06 deep link mismatch |
| Error states | Full per FR | Full error matrix | Full per screen | Well covered |

---

## Specific Questions That Would Block a Dev or Designer

1. **Split-funding decision (P0-01):** If a user's order costs 30M VND, they have 10M VND reward and 20M VND main cash — is the order accepted (split automatically) or rejected with `ERR_INSUFFICIENT_REWARD_BALANCE`?

2. **`order_source` column (P0-02):** What type, nullable constraint, FK, and index are needed on `virtual_orders.order_source`? Is it additive migration safe?

3. **QUEUED TTL start (P0-03):** Does `expires_at` get set to `granted_at + 7 days` when the QUEUED reward activates, or to `NOW() + 7 days` at activation time? The FRD and SRD say opposite things.

4. **Cron schedule (P1-01):** Is the force-liquidation cron every 5 minutes (FRD) or every 15 minutes (SRD)?

5. **Status enum (P1-02):** Is the terminal post-liquidation status `LIQUIDATED` (SRD) or `EXPIRED` (FRD)? Does `PARTIALLY_USED` exist as a status, or is `ACTIVE` used for all non-zero balance states?

6. **Table/endpoint name (P1-03):** Is it `bonus_cash_ledger` (FRD + design spec) or `learning_rewards` (SRD)? This affects every API call and every DB query.

7. **`available_balance` vs `amount_remaining` (P1-04):** What is the field name in the GET rewards API response? FRD uses `available_balance`; SRD uses `amount_remaining`.

8. **Order API change (P1-05):** Does `POST /api/v1/virtual/equity/orders` get a new optional `funding_source` field, or does the backend silently infer reward usage? If a field is added, what is the full updated request schema?

9. **Deep link format (P1-06):** What is the canonical deep link for reward notifications — `paave://virtual-portfolio?tab=rewards` (FRD), `/portfolio/reward-detail` (design spec), or `{ screen: "VirtualPortfolio", params: { highlight: "learning_rewards" } }` (SRD push payload)?

10. **`reward_id` type (P2-02):** Is the reward primary key an integer (SRD BIGSERIAL) or a UUID string (FRD + design spec `id: string`)? The mobile client TypeScript type and all API calls depend on this.

11. **1h warning notification (P2-01):** The SRD cron job only implements the 24h warning. Who implements the 1h warning, on what schedule, and what is the `notification_t1h_sent` column DDL?

12. **`LearningRewardDetailScreen` access when `RewardSection` is hidden (P2-09):** How does a user with expired-only rewards access their reward history?

13. **`BonusCashModal` QUEUED state (P2-07):** What does the `BonusCashModal` show when the reward is `QUEUED` (virtual account not yet created)?

---

## What's Done Well

**Exceptional DB schema quality (SRD §2):** The full DDL with CHECK constraints, partial indexes, FK cascades, and inline COMMENT ON TABLE/COLUMN is production-ready. The double-entry `learning_reward_ledger` design with `balance_after` for O(1) balance lookup is a strong architectural choice that is well documented.

**FRD idempotency coverage (FR-REWARD-07):** The idempotency story is unusually thorough — application-level pre-check, DB unique constraint on `(user_id, module_id)`, race condition handling via constraint violation, and explicit coverage of cross-device replay. EC-15 (two devices submitting simultaneously) is rare but present.

**Force-liquidation edge cases (FRD §5, EC-07 through EC-12):** The weekend/stale-price scenario (EC-12), the pending order at T+7 (EC-09), the mixed-funding position (FR-REWARD-05 edge cases), and the cron-miss recovery are all explicitly handled. Most systems leave these undefined.

**Design spec component specs (§6):** Every new component has pixel-exact dimensions, all token references, all visual states, and all interaction rules. The typography and color tokens are new additions to the design system with explicit hex values and usage notes. The animation timeline in Appendix B is a level of detail rarely seen in mobile specs.

**Error handling completeness:** All three documents provide error tables. The SRD error matrix (§9) maps every scenario to HTTP status, error code, and user-facing Vietnamese message. The FRD acceptance criteria use Given/When/Then format with specific field values, not vague assertions.

**QUEUED reward lifecycle (FR-REWARD-08 + SRD §6.3):** The pattern of storing TTL-ticking QUEUED rewards for users without a virtual account is a non-obvious edge case that is fully covered with transition logic, expired-at-activation handling, and the relevant EC-02/EC-03 scenarios.

**Cron job specification completeness (SRD §10):** Both cron jobs have schedule, timezone, concurrency lock mechanism (`pg_advisory_xact_lock`), execution time budget, batch size, full algorithm pseudocode, and failure mode tables. This is sufficient for an engineer to implement without further clarification.

---

*Review completed 2026-06-01 — 5 documents reviewed (FRD v1.0, SRD v1.0, Design DESIGN-F0-LEARN-07 v1.0, Parent FRD v2.0, Portfolio FRD v1.0)*
