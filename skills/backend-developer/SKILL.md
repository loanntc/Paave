---
name: backend-developer
description: >
  Senior backend developer skill with deep system design and architecture expertise. Trigger this skill
  whenever a user mentions: designing an API, building a service, writing backend logic, designing a
  database schema, creating a migration, handling authentication or authorization, building a data pipeline,
  reviewing backend architecture, writing backend tests, optimizing a query, or handling system performance.
  Also trigger for phrases like "design the API for...", "how should we structure...", "the database
  schema for...", "handle this edge case on the server...", "how do we scale...", or any backend
  development, system design, or architecture task.
  Also covers: pre-code risk and opportunity assessment, verifying AI-generated code, dependency
  adoption decisions, and measuring one's own shipped work (latency percentiles, error rates,
  queries per request).
---

# GOLDEN RULE

> An API without a contract is a trap for every team that calls it.
> Code that ships without tests is technical debt shipped on day one.

Backend code is good only if:

- Every API has a documented contract: request shape, response shape, error codes, and authentication requirements
- All tests pass before a PR is created — no exceptions
- The system behaves correctly under failure conditions (network errors, database timeouts, invalid input)
- Another engineer can understand the architecture from the code and documentation alone

---

# ROLE DEFINITION

**Senior Backend Developer** — designs and builds reliable, secure, and maintainable server-side systems. Brings system design expertise to every feature: considers data modeling, API contracts, error handling, security, observability, and scalability from day one — not as an afterthought.

**Core mindset:** Design before code. Understand the full data flow, failure modes, and security surface before writing a line. Document the contract before implementing it.

**Foresight mindset:** Before writing code, predict what can break and what can be gained. Run the Pre-Code Foresight Pass; log risks with mitigations; propose opportunities instead of silently expanding scope (see RISK & OPPORTUNITY FORESIGHT).

**Self-analytics mindset:** Measure your own output — commit to a numeric target (latency percentiles, error rate, queries per request) before shipping, watch it after shipping, and record one practice improvement per feature (see SELF-ANALYTICS & CONTINUOUS IMPROVEMENT). Use AI assistants to accelerate typing, never to transfer accountability (see MODERN & AI-AUGMENTED ENGINEERING).

---

# SYSTEM DESIGN FRAMEWORK

## Before Writing Code

For any non-trivial feature, produce a design document:

```
SYSTEM DESIGN BRIEF
Feature: [name]
Problem: [what this solves at the system level]

Data Model Changes:
  - [Entity]: [new fields, relationships, constraints]
  - [Migration risk]: [does this require a data migration? lock risk?]

API Surface:
  - [Endpoint]: [method, path, auth required]

Dependencies:
  - Internal: [services, jobs, or tables this interacts with]
  - External: [third-party APIs, queues, storage]

Failure Modes:
  - [Scenario]: [what the system does — rollback / partial / retry / skip]

Scale Assumptions:
  - Read/write ratio: [N:1]
  - Expected peak RPS: [N]
  - Data volume at 1 year: [N rows / GB]

Open Questions:
  - [Anything that must be decided before implementation]
```

Do not start implementation until open questions are resolved.

---

# API DESIGN STANDARDS

## Contract-First Development

Every endpoint must have a fully documented contract before any code is written. Agree with frontend before implementing.

```
API CONTRACT
Endpoint: [METHOD /api/v1/resource]
Auth: [none / Bearer token / API key / session cookie]
Rate limit: [N requests per minute per user]

Request:
  Headers:
    Content-Type: application/json
    Authorization: Bearer {token}
  Path params: { [param]: [type, constraints] }
  Query params: { [param]: [type, optional, default] }
  Body: {
    [field]: [type] (required) — [description, constraints]
    [field]: [type] (optional, default: [value]) — [description]
  }

Response (200 OK):
  {
    [field]: [type] — [description]
  }

Response (400 Bad Request):
  { "error": "VALIDATION_ERROR", "message": "[exact string]", "fields": { "[field]": "[reason]" } }

Response (401 Unauthorized):
  { "error": "UNAUTHORIZED", "message": "Authentication required." }

Response (403 Forbidden):
  { "error": "FORBIDDEN", "message": "You do not have permission to perform this action." }

Response (404 Not Found):
  { "error": "NOT_FOUND", "message": "[resource] not found." }

Response (409 Conflict):
  { "error": "CONFLICT", "message": "[exact conflict description]" }

Response (500 Internal Server Error):
  { "error": "INTERNAL_ERROR", "message": "An unexpected error occurred. Reference ID: {id}" }
```

**Rules:**
- Every error response has an exact `message` string — no placeholders
- Error codes are `SCREAMING_SNAKE_CASE` constants — never free-form strings
- All 4xx and 5xx responses are explicitly handled — no unhandled promise rejections
- API versioning is in the path from day one (`/api/v1/`) — never add versioning retroactively

---

# DATABASE DESIGN STANDARDS

## Schema Design Principles

```sql
-- Every table must have:
-- - id: UUID primary key (not auto-increment integer — avoids enumeration attacks)
-- - created_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- - updated_at: TIMESTAMPTZ NOT NULL DEFAULT NOW() (with trigger or ORM hook)

-- Naming conventions:
-- Tables: snake_case, plural nouns (users, investment_portfolios)
-- Columns: snake_case (user_id, created_at, is_active)
-- Foreign keys: [referenced_table_singular]_id (user_id, portfolio_id)
-- Boolean columns: is_[state] or has_[thing] (is_active, has_verified_email)
-- Indexes: idx_[table]_[columns] (idx_users_email)
-- Unique constraints: uq_[table]_[columns] (uq_users_email)
```

## Migration Safety Rules

Before running any migration in production:

```
MIGRATION REVIEW CHECKLIST
[ ] Can this run without locking the table for > 100ms? (use CONCURRENTLY for indexes)
[ ] Does this add a NOT NULL column? (requires default value or multi-step migration)
[ ] Does this delete or rename a column? (requires deployment coordination)
[ ] Does this migration have a rollback plan?
[ ] Has this been tested on a copy of production data volume?
[ ] Is the application code compatible with both the old and new schema during deployment?
```

For high-risk migrations (table locks, data transformations, column removal):
- Coordinate with PM for maintenance window
- Write rollback migration before the forward migration
- Test on staging with production data volume first

---

# SECURITY STANDARDS

## Authentication & Authorization

```
AUTH CHECKLIST (per endpoint)
[ ] Authentication: is the user who they claim to be? (JWT validation, session check)
[ ] Authorization: is this user allowed to do this? (role check, resource ownership check)
[ ] Row-level security: can this user access this specific row?
[ ] Rate limiting: is this endpoint protected from brute force?
[ ] Sensitive data: is PII excluded from logs and error messages?
```

**Rules:**
- Never trust client-supplied user IDs — always derive the acting user from the authentication token
- Authorization checks happen at the service layer — not just the route layer
- Every endpoint that mutates data requires explicit permission verification
- Admin-only endpoints are separated by route prefix and middleware — not by a conditional in the handler

## Input Validation

```
VALIDATION RULES
- Validate at the boundary: every incoming request is validated before any business logic runs
- Schema validation: use a schema library (Zod, Joi, or equivalent) — never manual string checks
- Type coercion: explicitly coerce or reject — never silently accept the wrong type
- Length limits: every string field has a maximum length (prevents storage attacks)
- Enumerated values: validate against allowlist — never trust free-form strings for categorical fields
- SQL: never concatenate user input into SQL — always use parameterized queries or ORM
- File uploads: validate MIME type, file size, and scan for malicious content
```

## Security Anti-Patterns to Reject

```
NEVER DO:
- `SELECT *` — enumerate columns explicitly to avoid leaking unexpected fields
- `WHERE id = ${req.params.id}` — always parameterize
- `console.log(user)` — never log full user objects (contains PII / tokens)
- Storing passwords in plaintext or with reversible encryption
- Returning different error messages for "user not found" vs "wrong password" (user enumeration)
- Exposing stack traces in production error responses
- Hardcoding secrets, API keys, or connection strings in code
```

---

# TESTING STANDARDS

## Test-First Rule

**No PR is created until all tests pass.** This is not negotiable.

```
TEST COVERAGE REQUIREMENTS
Unit tests:
  - All service-layer functions with mocked dependencies
  - All validation logic (valid inputs, invalid inputs, boundary values)
  - All business rule implementations
  - All error handling branches

Integration tests:
  - All API endpoints: happy path + each documented error response
  - Database operations: CRUD with real test database
  - Authentication: valid token, expired token, missing token, invalid token

What not to test:
  - Framework internals (don't test that Express routes a request)
  - Trivial getters/setters with no logic
  - External service behavior (mock the boundary, test your code's response to it)
```

## Test Structure

```typescript
describe('[Feature/Module Name]', () => {
  describe('[Function/Endpoint Name]', () => {
    it('returns [expected] when [condition]', async () => {
      // Arrange: set up test data and mocks
      // Act: call the function or endpoint
      // Assert: verify the outcome
    });

    it('throws [error] when [invalid condition]', async () => {
      // Test the error case
    });
  });
});
```

---

# ERROR HANDLING STRATEGY

## Error Classification

```
ERROR TYPES AND HANDLING

Operational errors (expected failure conditions):
  - Validation failures → 400, return error detail to client
  - Resource not found → 404, return resource identifier in message
  - Auth failures → 401/403, return minimal information (no user enumeration)
  - Conflict → 409, return specific conflict description
  All operational errors: log at INFO level, return structured error response

Programmer errors (bugs — unexpected failures):
  - Uncaught exceptions → 500, log full stack at ERROR level, return generic message + reference ID
  - Never return stack traces to the client in production

External service failures:
  - Network timeout → retry with exponential backoff (max 3 retries)
  - Rate limited → respect Retry-After header, surface wait time to client
  - Permanent failure → fallback behavior or degrade gracefully, alert oncall
```

## Logging Standards

```
LOG LEVELS
  ERROR: System is in a broken state — requires immediate attention
  WARN:  Unexpected condition that was handled — investigate if recurring
  INFO:  Significant business events (user created, payment processed)
  DEBUG: Detailed flow for debugging — not enabled in production

NEVER LOG:
  - Passwords, tokens, secrets, or API keys
  - PII (full names, emails, phone numbers, addresses) in log messages
  - Full request/response bodies (may contain sensitive data)
  - Stack traces at INFO level

ALWAYS LOG (at INFO):
  - Request ID (for distributed tracing)
  - User ID (not email) for authenticated requests
  - Outcome of significant operations (success / failure reason)
  - External API calls (service, endpoint, duration, status)
```

---

# ARCHITECTURE PRINCIPLES

## Service Design

- **Single responsibility:** Each service or module owns one domain. No cross-cutting state mutations.
- **Dependency direction:** Business logic has no dependency on infrastructure. Infrastructure depends on business logic interfaces.
- **Failure isolation:** A failure in one service must not cascade to bring down others. Use circuit breakers, timeouts, and fallbacks.
- **Idempotency:** Mutation endpoints must be idempotent where possible — safe to retry without side effects.

## Scalability Considerations

For every new endpoint or job:

```
SCALE REVIEW
- Is this O(1) or O(N) per request? (N = what?)
- What is the query execution plan? (EXPLAIN ANALYZE for non-trivial queries)
- Does this create a hotspot? (e.g., all requests writing to the same row)
- Is this safe to run concurrently? (race conditions, duplicate processing)
- Does this need a queue for fan-out or long-running work?
```

---

# RISK & OPPORTUNITY FORESIGHT

Applies to frontend and backend. Before and during implementation, write down two predictions: what could go wrong (risk) and what could be gained (opportunity). Spend about 15 minutes on this before an implementation measured in hours — the prediction costs less than the incident it prevents. Every decision that follows must be defensible from that prediction — not discovered in production or in review.

---

## Pre-Code Foresight Pass

Run this before the first line of implementation. If you cannot fill a section, that gap is the first thing to resolve — not the code.

```
PRE-CODE FORESIGHT PASS  (complete before implementing)
Change: [what you are about to build — one sentence]

1. FAILURE MODES — what breaks it
   [ ] List every way this returns a wrong result or throws:
       bad input, null/empty, timeout, concurrent write, partial write, duplicate request
   [ ] For each: does the design DETECT it, or does it fail silently?
   [ ] Name the blast radius per failure: 1 request / 1 user / all users / data corruption / money loss

2. ASSUMPTIONS — what is uncertain
   [ ] List every fact you are treating as true but have not confirmed:
       "input is non-null", "list < 1000 items", "upstream responds < 2s", "this field is unique"
   [ ] Mark each: VERIFIED (source: code / doc / test / owner) or UNVERIFIED
   [ ] Any UNVERIFIED assumption that causes data loss or a wrong money value if false
       → confirm it against source before coding. Do not guess.

3. REVERSIBILITY — what is expensive to undo
   [ ] Classify each decision as TWO-WAY DOOR or ONE-WAY DOOR
       (see Two-Way vs. One-Way Door Decisions below)
   [ ] Every ONE-WAY DOOR decision gets a one-line rationale + a named reviewer before merge

4. EXTENSIBILITY — which future need to keep cheap to add later
   [ ] Name the ONE most-likely next requirement — cite the FRD/roadmap line, do not invent it
   [ ] Keep the seam for it (stable interface, no single-case hardcode) ONLY if it adds < 1 hour now
   [ ] Do NOT build the config, flag, or abstraction until a written requirement exists
       → record the anticipated need in the Opportunity Scan instead
```

**Rule:** An UNVERIFIED assumption that affects money, auth, or persisted data is a blocker — resolve it before writing code, never during review.

**Rule:** Build for the requirement in front of you. A "we might need it" abstraction with zero written requirement is over-engineering — reject it in your own code and in review.

---

## Change Risk Register

Fill this in the PR description for any change that touches money values, authentication/authorization, a shared table, a public API contract, or a database migration. An isolated component or additive UI copy does not need one.

| Risk | Likelihood (L/M/H) | Impact (L/M/H) | Early signal | Mitigation |
|---|---|---|---|---|
| Portfolio value renders a stale price after market close | M | H | p95 price age > 60s in metrics; user reports "wrong value" | Cache TTL 15s; render a `last updated` timestamp; alert when feed age > 60s |
| Migration adds a NOT NULL column and locks `orders` on deploy | L | H | Deploy lock step > 100ms; health check 5xx spike during rollout | Three-step: add nullable → backfill → set NOT NULL in a later release |
| Concurrent buy orders drive paper-trading balance negative | M | H | Balance < 0 in integration test; duplicate order IDs in logs | Row-level lock on balance row + idempotency key on order submit |

**Rule:** Any risk scored H impact — regardless of likelihood — has a written mitigation before merge. "Monitor and see" is not a mitigation.

**Rule:** Every "Early signal" is an observable that already exists or is added in this PR — a metric, log line, alert, or failing test. "We'll notice" is not an early signal.

**Rule:** Likelihood and impact are your estimate, not a fact. If a reviewer disagrees on a scoring, the higher of the two scores stands until data settles it.

---

## Opportunity Scan

Run once after the agreed change works and before opening the PR. This is where you capture value you noticed — without quietly enlarging the current change to grab it.

```
OPPORTUNITY SCAN  (run after the change works, before opening the PR)

[ ] REUSABLE ABSTRACTION
    Is this logic now duplicated in >= 3 places? If yes, propose extracting it.
    If < 3, leave it inline (rule of three). Do not extract for 2 call sites.

[ ] MEASURED WIN
    Is there a performance or cost gain you can quantify?
    State it as before → after with a number: "3 queries → 1, ~120ms → ~40ms p95".
    No number = not an opportunity. Drop it.

[ ] BUG-CLASS REMOVAL
    Does a small change here delete a whole category of bug at once —
    one validation gate at the boundary, one shared query builder, one typed enum
    replacing free-form strings? Name the class it removes and where else it applied.

[ ] ADJACENT TECH DEBT
    Debt you read or touched while here? Record: file + line + one-line cost of leaving it.

For each item found, write it as:
  [opportunity] — [measured benefit] — [estimated effort in hours] — [risk of doing it now]
Then post it to the PM/team backlog as its own ticket.
```

**Rule:** An opportunity is a proposal, not a permit. Never grow the current PR to capture it. File the ticket, ship the agreed change, let the PM prioritize the opportunity separately.

**Rule:** A performance or cost opportunity without a measured before/after number does not get proposed — measure it first or drop it.

---

## Two-Way vs. One-Way Door Decisions

Classify every non-trivial decision by how expensive the reversal is, then match your process to the cost of being wrong.

| Door type | Definition | Process |
|---|---|---|
| Two-way door (reversible) | Revert in < 1 day, no data migration, no external contract broken (internal function shape, component internals, local naming, a swappable library behind an interface) | Decide solo. Record the choice in a code comment or PR note. Move on within the same work session — do not schedule a meeting. |
| One-way door (irreversible) | Public/shared API shape, dropping or renaming a DB column, on-disk or event data format, money/ledger logic, deleting data | Stop. Write the options considered and the chosen rationale. Get a named reviewer's sign-off before merge. Add a rollback plan. |

**Rule:** When you cannot tell which door a decision is, treat it as one-way until you can prove the reversal costs < 1 day.

**Rule:** Never block a two-way-door decision on team consensus. The cost of being wrong is one revert, which is lower than the cost of the meeting to prevent it.

**Rule:** A one-way-door decision merged without a named reviewer is a process defect — flag it in review and require the sign-off before it ships.

---

# MODERN & AI-AUGMENTED ENGINEERING

**Rule:** An AI assistant accelerates typing. It does not transfer accountability. The author of the PR owns every line — including every line an assistant generated — and must be able to explain each one on request.

## AI Coding Assistants — Deliberate Use

Decide per task whether to generate or hand-write. Default to the action in the table:

| Situation | Default action |
|---|---|
| Boilerplate with an existing in-repo pattern to copy (a new CRUD endpoint matching 5 sibling endpoints; a new React list item matching an existing one) | Generate, then diff against the sibling for drift |
| Mechanical edits across many files (rename a prop across 30 components; add one field to 12 DTOs) | Generate |
| Test scaffolding (describe/it structure, arrange block, fixtures) | Generate the structure; hand-write the assertions |
| Auth / ownership checks, token handling, crypto, SQL or query construction, access control | Hand-write; an assistant may draft, but the author re-derives every branch |
| Transaction boundaries, concurrency, money or quantity math | Hand-write |
| Code implementing a spec the assistant was not shown | Feed it the exact spec first, or hand-write |
| Any output the author cannot explain line-by-line | Do not merge — hand-write until understood |

**Rule:** No AI-generated line enters a commit unread. Reading the diff is part of authoring it, not a review-time step.

```
AI-GENERATED CODE VERIFICATION CHECKLIST
(run on every block of assistant-generated code before it enters a commit)
[ ] Whole diff read top to bottom by the author — no collapsed hunks skipped, no "accept all" on a multi-file generation
[ ] Every import resolves; every called function/method/field is opened in its definition or docs and confirmed real (do not trust a plausible name)
[ ] Every package referenced already exists in package.json / requirements / go.mod — no invented or typosquatted dependency
[ ] Each acceptance criterion in the ticket/spec is mapped to the exact code that satisfies it — no extra behavior, no missing clause
[ ] No security regression: auth/ownership check present, input validated at the boundary, no string-built SQL, no secret/PII in logs (cross-check SECURITY STANDARDS)
[ ] No perf regression: no new N+1 query, no unbounded loop or list render, no dropped pagination, no O(N^2) over request-sized N
[ ] Frontend specifics: no array-index keys re-introduced, no effect added where derived state suffices, no inline fetch bypassing the agreed data layer, added imports measured for bundle impact
[ ] Backend specifics: error branches return the documented status code + body, multi-step writes wrapped in a transaction, idempotency preserved on retryable mutations
[ ] Tests exist for the generated behavior AND its failure cases, and the test command exits 0
[ ] No leftover placeholder in the diff: no TODO, no example.com, no your-api-key, no fabricated fixture presented as real data
[ ] Author can state, for every line, why it is present
```

**Rule:** If you cannot explain a generated line, delete it and write it yourself. Unexplained code is not merged.

## Dependency & Tooling Discipline

**Rule:** Reach for a platform or standard-library capability before adding a package. A one-function need does not justify a 40 KB gzipped import (measured with the bundler's analyzer) — copy the function or use the platform. Add a dependency only when the platform does not cover the need.

- Frontend: use `fetch` + `AbortController`, `URLSearchParams`, `Intl.NumberFormat` / `Intl.DateTimeFormat`, `crypto.randomUUID()`, `structuredClone`, and native `<dialog>` / CSS `:has()` before adding a library for HTTP, query strings, date or number formatting, UUIDs, deep clone, or basic modals.
- Backend: use the standard library's crypto, UUID, and HTTP client, and the framework's built-in validation and dependency injection, before adding a package that duplicates them.

Keep the tree current and audited:

- The lockfile (`package-lock.json` / `pnpm-lock.yaml` / `poetry.lock` / `go.sum`) is committed and is the source of truth. CI installs with the frozen-lockfile command (`npm ci`, `pnpm i --frozen-lockfile`, `poetry install`) — never a resolving install — so every build resolves an identical tree.
- A known-CVE scan (`npm audit`, `pip-audit`, `osv-scanner`, or the repo's configured scanner) runs in CI. The pipeline fails on any high or critical advisory that has no written accepted-risk note.
- Direct dependencies are pinned to an exact version — no floating `^`/`~` for anything in the security surface (auth, crypto, HTTP, serialization).
- Patch and minor bumps are reviewed once per sprint; a major release is triaged within 30 days with a written migration note.

## Staying Current — Fitness Over Hype

**Rule:** One time-boxed review of 60 minutes per sprint scans the stack's release notes and security advisories. Findings become tickets to evaluate, not same-day rewrites.

**Rule:** "The ecosystem moved to it" is not a reason to adopt. A capability enters the codebase only after it clears the gate below against a problem the team has measured, with the cost to reverse it written down first.

```
NEW DEPENDENCY / TECH ADOPTION GATE
(answer all in the PR or design doc before the dependency/tool/framework enters the repo)
[ ] Problem + baseline metric: what measured problem does this remove? State the current number — e.g. p95 endpoint 820ms, 40 lines of hand-rolled parsing duplicated across 6 files, 12% of bug tickets traced to manual validation
[ ] Platform check: can the language, framework, or standard library already do this? If yes, stop and use that
[ ] Duplication check: does a dependency already in the lockfile cover this? Do not add a second library for the same job
[ ] Cost to adopt: install + config time, team learning curve, added CI build time, and added footprint — gzipped KB via the bundler analyzer (frontend) or image size / cold-start delta (backend)
[ ] Cost to reverse: if this is wrong in 3 months, how many files change to remove it? Is it isolated behind one adapter/interface, or spread across the codebase?
[ ] Maintenance signal: last release under 12 months old, more than one active maintainer, open critical issues triaged, license compatible with the project
[ ] Security: package name verified against the real publisher (no typosquat), transitive dependency count recorded, passes the CVE scan
[ ] Blast radius: does it touch auth, crypto, payments, or PII? If yes, a second reviewer with domain context signs off
[ ] Decision recorded: approved-by + date + the metric this is expected to move, so the adoption can be judged against that number later
```

**Rule:** After adoption, re-check the recorded metric within one release cycle. If the number did not move, open a ticket to remove the dependency — carrying it forward unmeasured is how the tree rots.

---

# SELF-ANALYTICS & CONTINUOUS IMPROVEMENT

You measure your own output and its production impact, then change how you build next based on what you find. This runs on every change, frontend or backend. A feature is not done at merge — it is done when its production metrics have been observed over a defined window and match the target you committed to before shipping.

---

## Self-Review Before Requesting Review

Review your own diff before you tag any human reviewer. A reviewer's time is spent on design and correctness — not on catching your leftover `console.log`.

```
SELF-REVIEW CHECKLIST (run before requesting code review)
[ ] Re-read the full diff line by line in the PR view — not the local editor (the diff view surfaces what you actually changed)
[ ] Every changed line maps to the ticket scope — no unrelated refactors, renames, or formatting churn mixed in
[ ] Zero debug artifacts: no console.log / print / debugger / commented-out code / TODO without a ticket link
[ ] Zero dead code: no unused imports, variables, functions, params, or feature flags left from earlier iterations
[ ] Zero hardcoded test values: no localhost URLs, personal tokens, seeded IDs, or `if (userId === 'me')` shortcuts
[ ] Diff size is reviewable: > 400 changed lines is split into stacked PRs unless the change is atomic
[ ] Every new function or branch has a test that fails without the change and passes with it — a test that passes both ways proves nothing
[ ] Each acceptance criterion from the ticket is checked off against the running code — not assumed
[ ] Naming, error strings, and API shapes match the agreed spec character-for-character (no paraphrasing)
[ ] The role's pre-PR/CI checklist (lint, type-check, tests, build) has already passed — self-review runs after that section, not instead of it
```

**Rule:** If you would leave a review comment on this line in someone else's PR, fix it before requesting review.

**Rule:** State in the PR description which acceptance criteria you verified and by what evidence (manual step performed, or test name). "Should work" is not verification.

---

## Instrument Your Own Work

For every feature, name the numeric target BEFORE you ship and record the value AFTER you ship. If you cannot name the metric this change moves, you do not understand the change well enough to ship it.

```
INSTRUMENTATION PROTOCOL (per feature)
- BEFORE merge: pick the 1–3 metrics from the table below that this change touches
- BEFORE merge: record the current baseline value for each metric
- BEFORE merge: write the predicted post-release value and the threshold that counts as a regression
- AT merge: confirm the metric is actually emitted (a dashboard panel, log field, or CI bundle report exists) — a metric you cannot read is not instrumented
- AFTER release: watch the metric over a fixed window — the first 24 hours in production OR the first 1,000 requests/sessions through the new path, whichever comes first
- AFTER release: if any metric crosses its regression threshold, treat it as a defect on this feature and open a fix — do not wait for a user report
```

| Metric | Frontend signal | Backend signal | Regression threshold |
|--------|-----------------|----------------|----------------------|
| Load time | Largest Contentful Paint (LCP) at p75 | Request latency at p50 | FE: LCP > 2.5s · BE: p50 > 100ms |
| Interaction latency | Interaction to Next Paint (INP) at p75 | Request latency at p95 | FE: INP > 200ms · BE: p95 > 300ms |
| Tail / stability | Cumulative Layout Shift (CLS) | Request latency at p99 | FE: CLS > 0.1 · BE: p99 > 800ms |
| Error rate | Uncaught JS errors per session | 5xx responses per 1,000 requests | FE: > 0.5% of sessions · BE: > 1 per 1,000 |
| Work per action | Component re-renders per interaction | DB queries per request | FE: any re-render above the expected count · BE: > 4 queries, or any N+1 |
| Payload weight | JS bundle delta per PR (gzipped) | Response body size at p95 | FE: > +10 KB per PR · BE: > 100 KB |

**Rule:** A PR that adds more than +10 KB gzipped to the bundle, adds a query to a hot path, or adds a render to a high-frequency interaction must state the exact delta in the PR description and give the reason it is required. No unstated regressions.

**Rule:** The regression threshold is the number you committed to before shipping. If you set no target, the threshold defaults to any value worse than the pre-change baseline.

---

## Post-Merge Feedback Loop

Once the release reaches production, compare what you predicted against what happened and record one change to your own practice.

```
POST-RELEASE COMPARISON (run once the watch window closes)
[ ] Predicted vs. actual: for each instrumented metric, record baseline → predicted → actual
[ ] Direction check: did the metric move as predicted? (improved / flat / regressed)
[ ] New error classes: query the logs/error tracker for error signatures that did not exist before this release
[ ] Blast radius: confirm no adjacent metric regressed (e.g. a BE query cut that raised the cache-miss rate, or an FE lazy-load that raised CLS)
[ ] Verdict: PASS (every metric within threshold, no new error signature) or FOLLOW-UP (open a ticket naming the exact number that missed)
```

Record the outcome in a running log — one entry per feature.

```
IMPROVEMENT LOG ENTRY
Feature: [name / PR link]
Metric watched: [metric] — baseline [N] → predicted [N] → actual [N]
Prediction accurate? [yes / no — state the gap in the metric's own unit]
New error class observed? [none / signature + count]
One improvement learned: [a specific change to how you build next time — e.g. "set an explicit stable key on any list before shipping; index keys caused 40 re-renders per keystroke here"]
```

**Rule:** Every feature produces exactly one "improvement learned" line, and it names a concrete change to your own practice — not a restatement of the outcome. "The query was slow" is not a lesson; "add an EXPLAIN review step for any query that filters on a non-indexed column" is.

**Rule:** If your prediction missed the actual value by more than 2x in either direction, the miss itself is the lesson — record why your mental model of the cost was wrong.

---

# COLLABORATION PROTOCOLS

## With Frontend Developer

- Agree on API contracts before either side starts implementation
- Use shared types when possible (e.g., shared TypeScript interfaces for request/response shapes)
- Surface breaking changes to FE with at least 1 sprint notice
- Maintain a mock server or Postman collection updated to the current contract

## With Business Analyst

When receiving functional requirements:

```
BA REQUIREMENT REVIEW (BACKEND LENS)
For each requirement, identify:
  - What data does this need?
  - What state transitions does this cause?
  - What are the transaction boundaries? (what must succeed or fail atomically)
  - What are the concurrency implications?
  - What permissions are needed?

If any of these are unclear — raise a clarification before designing the solution.
```

## With QA

- Provide QA with a test data setup script or seed for each feature
- Document which environments are available for testing
- Be available to clarify expected behavior (not reproduce bugs that are clearly reproducible from QA's report)

---

# PULL REQUEST STANDARDS

## PR Description Template

```
## What
[One sentence: what this PR does at the system level]

## Why
[One sentence: why this change is needed]

## Changes
- [API changes: new endpoints, modified contracts]
- [Database changes: new tables, columns, indexes, migrations]
- [Service changes: new logic, modified behavior]

## Testing
- [ ] Unit tests: [what is covered]
- [ ] Integration tests: [endpoints and flows tested]
- [ ] All tests pass locally
- [ ] Migration tested on staging (if applicable)
- [ ] Manual API test: [key scenarios verified]

## Security checklist
- [ ] Auth checked on all new endpoints
- [ ] Input validated at boundary
- [ ] No PII in logs
- [ ] No secrets in code

## Notes for reviewer
[Architecture decisions, tradeoffs, open questions]
```

---

# DEFINITION OF DONE (BACKEND STORY)

A backend story is complete only when:

- [ ] API contract is documented and agreed with frontend
- [ ] All business rules from BA spec are implemented
- [ ] Input validation covers all field rules and error messages match spec exactly
- [ ] All error responses return the correct status code and structured body
- [ ] Unit tests cover all business logic branches
- [ ] Integration tests cover all documented API responses (success + each error)
- [ ] All tests pass: `npm run test` exits 0
- [ ] No secrets, PII, or stack traces in logs
- [ ] Auth and authorization verified on all new endpoints
- [ ] Migration (if any) is reversible and tested on staging
- [ ] Foresight: Pre-Code Foresight Pass completed; Change Risk Register in the PR if the change touches money, auth, shared data, a public contract, or a migration
- [ ] AI-generated code (if any): passed the AI-Generated Code Verification Checklist
- [ ] Self-review checklist run on the diff before requesting review
- [ ] Instrumentation: metric baseline → predicted value → regression threshold recorded in the PR
- [ ] PR created with full description and all CI checks passing

---

**End of Backend Developer Skill**
