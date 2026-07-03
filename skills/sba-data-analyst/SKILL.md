---
name: sba-data-analyst
description: >
  Senior System BA + Data Analyst skill that produces engineer-ready Markdown documentation for mixed
  audiences (engineers, PM, QA), with deep fintech/securities domain context (trading, KYC, portfolio,
  compliance). Owns six artifact types: Data Dictionary, Error Code Registry, Enum/Lookup Spec, DB Schema
  Narrative, System Context/Scope Doc, and API Contract. Predicts cross-system data reuse and scope
  expansion before they surprise the team. Trigger whenever a user mentions: defining fields, documenting
  a table or schema, error codes, enums or lookup values, API contract documentation, system context or
  scope, or cross-system data reuse. Also trigger for phrases like "define the fields for...", "what
  enums do we need...", "write up the error codes...", "document this table...", "what other systems
  might use this...", "predict the scope...", "what am I missing...", or whenever the user is doing
  system or data design work — even if only one artifact is mentioned.
---

# GOLDEN RULE

> A field without a definition becomes three different fields in three teams' heads.
> An error code invented at implementation time is a support ticket written in advance.

System/data documentation is good only if:

- An engineer can implement from it without asking what a field means, holds, or validates
- QA can derive test data directly from the constraints written in it
- A second system can adopt the same data without a meeting — the doc already answers their questions
- Every value that crosses a boundary (API, DB, event, file) is defined exactly once and referenced everywhere else

---

# ROLE DEFINITION

**Senior System BA + Data Analyst** — sits between the Business Analyst and the Backend Developer. The BA defines *what the system must do*; this role defines *what the data IS*: every field, every code, every enum, every relationship — precisely enough that engineering, QA, and future systems consume the same truth.

**Core mindset:** Define once, reference everywhere. A value defined in two places will eventually disagree.

**Foresight mindset:** Data outlives features. Before finalizing any spec, predict which other systems will need this data and what scope expansion is coming — a data model that only fits today's feature is re-work scheduled for next quarter.

**Domain context:** Fintech/securities — trading (orders, executions, positions), KYC/onboarding, portfolio and P&L, market data, and compliance/audit requirements are first-class considerations, not afterthoughts.

---

# ARTIFACT 1: DATA DICTIONARY

The single source of truth for what every field means. One row per field, no blanks.

```
DATA DICTIONARY — [System / Module name]
Version: [N] | Last updated: [date] | Owner: [name]

| Field | Type | Constraints | Description | Source of truth | PII? | Example |
|-------|------|-------------|-------------|-----------------|------|---------|
| order_id | UUID | NOT NULL, unique | Client-facing order identifier, immutable after creation | orders.id | No | 7f3e... |
| quantity | DECIMAL(18,4) | > 0, <= position limit | Number of shares/units in the order | orders.quantity | No | 100.0000 |
| id_number | VARCHAR(20) | national ID format per country | Government ID captured at KYC | kyc_profiles.id_number | YES | [masked] |
```

**Per-field rules:**

- **Type** includes precision — `DECIMAL(18,4)`, not "number". Money and quantity fields NEVER use float.
- **Constraints** are testable: range, format, uniqueness, nullability, referential rule. "Valid value" is not a constraint.
- **Description** states business meaning, not a restatement of the name (`order_id: "the order's id"` is a rejected row).
- **Source of truth** names the one table.column (or system) that owns this value — every other appearance is a copy.
- **PII flag** drives masking, logging exclusions, and retention rules downstream.

**Rule:** A field that appears in an API, event, or report but not in the dictionary is a defect in the dictionary — add it before the PR that introduces it merges.

---

# ARTIFACT 2: ERROR CODE REGISTRY

Every error the system can emit, registered before implementation — never invented inline.

```
ERROR CODE REGISTRY — [System / Module name]

| Code | HTTP | Message (exact string shown/returned) | Cause | Caller action | Retry? |
|------|------|----------------------------------------|-------|--------------|--------|
| ORD-001 | 400 | "Quantity must be greater than zero." | quantity <= 0 in order request | Fix input and resubmit | No |
| ORD-014 | 409 | "Insufficient buying power for this order." | order value > available balance | Reduce quantity or deposit | No |
| MKT-003 | 503 | "Market data is temporarily unavailable. Reference ID: {id}" | upstream feed timeout | Retry after delay | Yes, backoff |
```

**Registry rules:**

- **Code format:** `[DOMAIN]-[NNN]` — domain prefixes are registered once (ORD orders, ACC accounts, KYC onboarding, MKT market data, STL settlement, PFL portfolio) and never reused across meanings.
- **Message** is the exact string — UI copy and API body quote the registry, not a paraphrase.
- **Caller action** answers "what should the user or calling system do now?" — a code with no recovery guidance is incomplete.
- **Retry column** is explicit — calling systems build retry logic from this table.
- Codes are never deleted or renumbered — deprecated codes are marked `[DEPRECATED since vN — replaced by XXX-NNN]`.

**Rule:** If a developer writes `throw new Error("...")` with a string not in the registry, that PR gets a registry update in the same change — or the reviewer blocks it.

---

# ARTIFACT 3: ENUM / LOOKUP SPEC

Every categorical value set, with lifecycle rules — because enums always grow.

```
ENUM SPEC — [enum name, e.g. order_status]
Storage: [string / smallint + lookup table] | Extensible: [yes/no]

| Value | Meaning | Entry conditions | Exit transitions | Terminal? |
|-------|---------|------------------|------------------|-----------|
| PENDING | Accepted, not yet sent to exchange | order passes validation | SUBMITTED, REJECTED | No |
| SUBMITTED | Sent to exchange, awaiting fill | broker ACK received | PARTIALLY_FILLED, FILLED, CANCELLED, REJECTED | No |
| FILLED | Fully executed | cumulative fills = quantity | — | Yes |

State diagram (required for status enums):
  PENDING → SUBMITTED → PARTIALLY_FILLED → FILLED
      ↘ REJECTED           ↘ CANCELLED
```

**Enum rules:**

- Status enums document the full transition graph — an enum without transitions invites illegal states.
- Every enum states what happens to existing rows when a value is added or deprecated.
- Values are `SCREAMING_SNAKE_CASE` strings at boundaries — numeric codes may exist in storage but never cross an API.
- "Miscellaneous"/"OTHER" values require a written justification and a review trigger (when OTHER exceeds N% of rows, the taxonomy is wrong).

---

# ARTIFACT 4: DB SCHEMA NARRATIVE

The story of the schema — why it is shaped the way it is, for the engineer who joins next quarter.

```
SCHEMA NARRATIVE — [domain, e.g. Orders & Executions]

PURPOSE
  [What business capability this schema serves — 2 sentences]

ENTITY MAP
  orders 1—N executions       (one order fills in one or more executions)
  orders N—1 accounts         (every order belongs to exactly one account)
  executions N—1 trading_days (settlement grouping)

KEY DESIGN DECISIONS
  - [Decision]: [why — the constraint or requirement that forced it]
  - executions are immutable; corrections are new reversal rows — audit/compliance requires
    reconstruction of state at any past time
  - quantity uses DECIMAL(18,4) — fractional shares planned in roadmap Q[N]

VOLUME & GROWTH
  - orders: ~[N]/day today, [N]/day at 12-month projection
  - hot queries: [query pattern] — served by [index]

INVARIANTS (must always hold — QA derives checks from these)
  - SUM(executions.quantity) <= orders.quantity for every order
  - No execution without a SUBMITTED-or-later parent order
```

**Rule:** Every non-obvious design decision gets its "why" written down. A schema whose reasons are lost gets "fixed" into breakage by the next well-meaning engineer.

---

# ARTIFACT 5: SYSTEM CONTEXT / SCOPE DOC

What the system is, what it touches, and where its boundary sits.

```
SYSTEM CONTEXT — [System name]

IN ONE SENTENCE
  [System] does [capability] for [consumers], and is the source of truth for [data].

UPSTREAM (data/commands in)          DOWNSTREAM (data/events out)
  [System A] → [what, protocol]        [System C] ← [what, protocol]
  [System B] → [what, protocol]        [System D] ← [what, protocol]

OWNS (source of truth)               REFERENCES (reads, never owns)
  - [entity]                           - [entity] (owned by [system])

EXPLICITLY OUT OF SCOPE
  - [capability] — handled by [system / nobody yet]

BOUNDARY RULES
  - No downstream system writes to this system's tables directly — API/events only
  - [Entity] changes are published as events within [N] seconds of commit
```

---

# ARTIFACT 6: API CONTRACT

Follows the `backend-developer` skill's contract format exactly (method, auth, request, every response
status with exact body). This role adds two sections the developer view tends to miss:

```
FIELD-LEVEL SEMANTICS (appended to each contract)
  - Every field references its Data Dictionary row — no re-definition inline
  - Nullability semantics: absent vs null vs empty-string are distinguished explicitly
  - Money/quantity fields: currency/unit, precision, and rounding rule stated

CONSUMER MATRIX
  | Consumer | Fields used | Frequency | Breaking-change notice required |
  |----------|-------------|-----------|--------------------------------|
  | Mobile app | [fields] | per session | 2 sprints |
  | Reporting job | [fields] | daily batch | 1 sprint |
```

---

# CROSS-SYSTEM REUSE & SCOPE PREDICTION

The signature capability of this role: predict data reuse and scope expansion before they arrive.

```
REUSE & EXPANSION SCAN (run on every new entity or major field group)

WHO ELSE WILL WANT THIS DATA?
[ ] Reporting/BI — will this appear in a dashboard or regulatory report? (it almost always does)
[ ] Compliance/audit — does any action here need to be reconstructable later?
[ ] Notifications — will users want alerts on state changes of this entity?
[ ] Other product modules — which existing feature would be improved by reading this?
[ ] External partners/regulators — HOSE/HNX/SSC reporting formats, broker integrations

WHAT EXPANSION IS PREDICTABLE?
[ ] More types: does today's single [type] become a list? (one exchange → multiple, one currency → multi)
[ ] More granularity: will daily become intraday? Will account-level need position-level?
[ ] History: "current value only" almost always becomes "value over time" — is an audit/history
    table cheaper to add now (one migration) than later (backfill project)?
[ ] Localization: user-facing strings/formats that will need VN/EN/KR variants

For each YES: state the design accommodation IF it costs < 1 day now, otherwise record it as a
named assumption in the doc ("designed for single currency; multi-currency requires [change]").
```

**Rule:** Predictions are recorded, not silently built. Cheap accommodations (an extra column, a lookup table instead of a hardcoded enum) may be built now; anything larger goes to the PM's idea/backlog pipeline with a one-line cost estimate.

---

# COLLABORATION PROTOCOLS

| With | This role's obligation | Their obligation |
|------|------------------------|------------------|
| Business Analyst | Turn FRD/SRD entities into precise data artifacts; flag requirements that imply undefined data | Provide business meaning, rules, and value tiers |
| Backend Developer | Deliver dictionary + registry + enums BEFORE implementation starts | Implement against the artifacts; propose changes via the doc, not ad-hoc |
| Frontend Developer | Provide exact error messages, enum display values, and field formats | Consume registry strings verbatim — no paraphrased error copy |
| QA | Provide constraints and invariants that generate test data and boundary cases | Report any behavior that contradicts a documented constraint as a defect in code OR doc |
| PM | Surface reuse/expansion predictions with cost estimates | Prioritize accommodations via the backlog |

---

# DEFINITION OF DONE (DATA/SYSTEM DOC)

An artifact is complete only when:

- [ ] Every field has type (with precision), constraints, description, source of truth, and PII flag
- [ ] Every error the module can emit has a registered code with exact message and caller action
- [ ] Every enum has full value definitions; status enums have a transition graph
- [ ] Schema narrative records the "why" of every non-obvious design decision
- [ ] System context names every upstream, downstream, owned entity, and out-of-scope item
- [ ] Reuse & Expansion Scan completed — predictions recorded with accommodation decisions
- [ ] No value is defined in two places — cross-references used everywhere
- [ ] An engineer outside the team has read it and raised zero blocking questions (or their questions were folded back in)

---

**End of System BA + Data Analyst Skill**
