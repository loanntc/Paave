---
name: team-workflow
description: >
  The orchestration skill that runs the full product delivery team through a structured 8-stage
  workflow. Trigger this skill whenever a user mentions: coordinating the team, running a feature
  end-to-end, understanding who does what and when, the delivery process, "take this from idea to
  release", or any request that spans multiple roles. Routes work to: project-manager,
  business-analyst, product-designer, frontend-developer, backend-developer, qa, and code-reviewer —
  plus consulted specialists sba-data-analyst (data dictionaries, error registries, API contracts) and
  trading-system-architect (trading domain, VN-market compliance) when their domain is touched.
---

# THE WORKFLOW

```
  REQUIREMENT
       │
       ▼
  ANALYSE REQUIREMENT
       │
       ▼
  REVIEW ◀────────────────────────────────────┐
       │                                       │
       │ all reviewers approve?               UPDATE
       │ No ─────────────────────────────────▶│
       │ Yes                                   │
       ▼
  MAKE DOCUMENT
       │
       ▼
  DEVELOP
       │
       ▼
  REVIEW CODE ◀───────────────────────────────┐
       │                                       │
       │ approved?                       FIX CODE
       │ No ─────────────────────────────────▶│
       │ Yes                                   │
       ▼
  TEST ◀──────────────────────────────────────┐
       │                                       │
       │ all tests pass?                 FIX BUGS
       │ No ─────────────────────────────────▶│
       │ Yes                                   │
       ▼
  COMPLETE
```

---

# ROLES

| Role | Skill | Core responsibility |
|------|-------|---------------------|
| 📋 PM | `project-manager` | Multi-project planning, risk management (RAID log), cross-team facilitation |
| 🔍 BA | `business-analyst` | Value-driven requirements, full case coverage (happy / fail / edge) |
| ✏️ Designer | `product-designer` | End-to-end design: discovery, flows, hi-fi UI, usability, handoff, build QA |
| 🎨 FE | `frontend-developer` | Web UI/UX implementation (React), design collaboration, CI gate before PR |
| 📱 iOS | `ios-developer` | Native iOS (Swift/SwiftUI), HIG + Kinetic fidelity, TestFlight delivery — same stage roles as FE for mobile work |
| 🏗️ BE | `backend-developer` | System design, API contracts, all tests pass before PR |
| 🧪 QA | `qa` | Test cases from BA docs, gap detection, defect reporting |
| 👁️ Reviewer | `code-reviewer` | Security, correctness, architecture — merge gate |

PM is **always active** across every stage — monitoring risk, unblocking, and tracking progress.

**Consulted specialist roles** (deployed when their domain is touched, not on every feature):

| Role | Skill | When deployed |
|------|-------|---------------|
| 🗄️ SBA / Data Analyst | `sba-data-analyst` | Stage 4–5: any feature introducing new entities, fields, enums, error codes, or API contracts — produces the data dictionary, error registry, and enum specs the developers and QA build against |
| 📈 Trading System Architect | `trading-system-architect` | Stage 5–6: any change touching order flow, money movement, market data, settlement, or VN-market compliance (HOSE/HNX/SSC) — consulted on design, blocker authority on trading-domain review findings |

---

---

# STAGE 1 — REQUIREMENT

> *"We have a need. What are we building and why?"*

**Primary role: Project Manager**
**All other roles: Informed**

```
ACTIONS
  PM: Receives the feature request or initiative from stakeholders
  PM: Runs intake conversation to capture:
        - What problem are we solving?
        - Who is the target user?
        - What does success look like?
        - What are the constraints (time, budget, scope)?
  PM: Opens RAID log — identifies risks before any work starts
  PM: Runs risk scan with each team: "what could make this fail?"
  PM: Writes the Initiative Brief and assigns it to the BA

OUTPUT
  Initiative Brief containing:
    - Problem statement (one precise sentence)
    - Target user
    - Success criteria (measurable)
    - Constraints
    - Initial RAID log with top risks logged

EXIT GATE
  ✅ Problem is clearly framed
  ✅ Success criteria are measurable
  ✅ Top risks are logged with owners
  ✅ BA is assigned and briefed
```

---

# STAGE 2 — ANALYSE REQUIREMENT

> *"We understand the need. Now let's understand it deeply."*

**Primary role: Business Analyst**
**Supporting: PM (scope), FE (UI/UX feasibility), BE (technical feasibility), QA (testability)**

```
ACTIONS
  BA: Deeply analyses the initiative brief
  BA: Identifies the user value — what problem does this solve for the user?
  BA: Identifies the product value — how does this serve the business?
  BA: Applies the value justification framework to every potential requirement:
        Value tier: Critical / High / Medium / Low
  BA: Runs the Edge Case Detection Checklist against every requirement:
        - Empty / null / boundary inputs
        - Duplicate submissions, out-of-order actions
        - Session expiry mid-flow, concurrent users
        - External service unavailability
  BA: Drafts the initial requirements structure:
        - Business objectives + KPIs
        - Scope: in / out
        - Functional requirements (draft)
        - Business rules (draft)
        - Edge cases identified

  FE: Reviews draft for UI/UX feasibility — can this be implemented within the design system?
  BE: Reviews draft for technical feasibility — are there architecture or data constraints?
  QA: Reviews draft for testability — are requirements observable and verifiable?
  PM: Reviews for scope alignment — does this match the agreed success criteria?

OUTPUT
  Draft requirements with:
    - Value justification for every requirement
    - Happy path, failure path, AND edge cases drafted for each FR
    - Technical and testability concerns flagged by FE/BE/QA

EXIT GATE
  ✅ Every requirement has a value justification
  ✅ All three case classes are drafted per requirement
  ✅ Feasibility concerns from FE/BE are captured
  ✅ Testability concerns from QA are captured
```

---

# STAGE 3 — REVIEW ↔ UPDATE

> *"Is this complete and correct? If not, update it."*

**Reviewers: PM, QA, FE, BE**
**Owner of updates: Business Analyst**

This is a **loop** — reviewers inspect the draft requirements and raise issues. BA updates and
resubmits. The loop exits only when ALL reviewers approve.

```
REVIEW — what each role checks:

  PM reviews for:
    - Does every requirement map to the agreed success criteria?
    - Is the scope clearly bounded (in-scope and out-of-scope explicit)?
    - Are there requirements that belong in a future phase?
    - Is the value prioritisation correct?

  QA reviews for:
    - Does every requirement have a testable acceptance criterion?
    - Are error messages exact strings (not "[message]" placeholders)?
    - Are all case types covered (happy, failure, edge)?
    - Are boundary values explicitly defined?
    - Are negative cases (unauthorized access, invalid state) defined?
    - QA flags each gap as a Clarification Request with:
        - Which requirement is incomplete
        - What specific scenario is not covered
        - What the system behavior should be

  FE reviews for:
    - Are all screen states specified (empty, loading, error, success, disabled)?
    - Is interaction behavior defined for all flows?
    - Are there UX implications that need design clarification?

  BE reviews for:
    - Are data model implications clear?
    - Are performance or concurrency concerns addressed?
    - Are integration requirements complete?

UPDATE — what the BA does with review feedback:
    - BA treats every QA Clarification Request as mandatory — not optional feedback
    - BA adds missing case coverage, defines exact error messages, clarifies boundaries
    - BA updates scope if PM flagged misalignment
    - BA re-delivers updated draft to reviewers
    - Loop repeats until zero open issues remain

LOOP EXIT CONDITION
  ✅ PM: scope is aligned to success criteria — no unresolved scope questions
  ✅ QA: every acceptance criterion is testable — no gaps remaining
  ✅ FE: all UI states and flows are specified
  ✅ BE: all technical constraints and data implications are addressed
```

**Rule:** No requirement advances to Stage 4 with an open Clarification Request from QA. No scope
ambiguity advances without PM sign-off. These are hard gates, not suggestions.

---

# STAGE 4 — MAKE DOCUMENT

> *"The requirements are approved. Now produce the final deliverable."*

**Primary role: Business Analyst**
**Approver: Project Manager**
**Parallel: QA begins test case design from this document**

```
ACTIONS
  Designer (parallel with BA): produces the flow maps, screen designs, and handoff package —
    all states designed, usability-validated for significant flows, copy matched to the BA's
    exact error strings (see product-designer skill)
  BA: Produces the final document package:
        Section 1 — BRD (Business Requirement Document)
          - Problem statement
          - Business objectives (measurable)
          - KPIs with baselines and targets
          - Scope: in / out
          - Stakeholders

        Section 2 — FRD (Functional Requirement Document)
          - Functional requirements (FR-01, FR-02...) each with:
              Actor, description, input, output, preconditions
          - Business rules (BR-01, BR-02...)
          - Acceptance criteria (Given/When/Then — one per case class per FR)
          - Edge cases with defined system behavior

        Section 3 — SRD (System Requirement Document)
          - System flow (step-by-step, every branch defined)
          - Data handling rules
          - Validation logic table (field / rule / EXACT error message string)
          - API contracts (method, request, success response, error response)
          - Error handling logic

        Section 4 — Traceability Matrix
          - Business objective → FR → SRD logic → test case (no blank cells)

  PM: Reviews and signs off — confirms document is complete before development starts
  QA: Immediately begins writing test cases from the FRD acceptance criteria
      (test case design runs in parallel with Stage 5)

OUTPUT
  Final BRD + FRD + SRD + Traceability Matrix

EXIT GATE
  ✅ Every FR has acceptance criteria in Given/When/Then format
  ✅ Every FR covers happy path, failure path, AND edge cases
  ✅ Every error message is an exact string — no placeholders
  ✅ Every API endpoint has success AND error response shapes
  ✅ Traceability matrix is fully populated — no blank cells
  ✅ PM has approved the document
  ✅ QA has started test case design
```

---

# STAGE 5 — DEVELOP

> *"Build it — correctly, securely, and with tests."*

**Primary roles: Frontend Developer + Backend Developer (in parallel)**
**Supporting: BA (available for clarifications), QA (test cases being built in parallel)**

```
STEP 5a — API CONTRACT (blocking — must complete before any build starts)
  FE and BE meet to agree:
    - Every endpoint: method, path, auth requirement
    - Request shape: fields, types, constraints
    - Success response: status code, body shape
    - Error responses: status codes, exact error body shapes
  Neither side begins implementation until the contract is signed off.
  If the BA doc does not fully specify the API — BA is consulted to clarify.

STEP 5b — PARALLEL BUILD

  Backend Developer:
    - Produces System Design Brief (data model, failure modes, scale assumptions)
    - Implements API per the agreed contract
    - Validates all inputs at the boundary (Zod or equivalent — never manual checks)
    - Implements auth and authorization on every endpoint
    - Writes unit tests for all business logic
    - Writes integration tests for all API endpoints (happy path + every error response)
    - ALL TESTS PASS before opening a PR — no exceptions
    - No secrets, PII, or stack traces in code or logs

  Frontend Developer:
    - Reviews design/spec before writing code — flags missing states or UX gaps to PM
    - Discusses and resolves UX concerns BEFORE building, not after
    - Implements all screen states: default, loading, error, empty, success
    - Implements all interactive states: hover, focus, active, disabled
    - Meets accessibility standards (WCAG 2.1 AA)
    - Writes unit tests for core behavior and edge cases
    - ALL CI CHECKS PASS locally before opening a PR:
        lint, type-check (tsc --noEmit), tests, build
    - Verifies manually at 320px (mobile) and 1440px (desktop)

OUTPUT
  FE PR + BE PR, each:
    - Green on CI
    - Linked to its user story
    - Accompanied by PR description (what, why, testing evidence)

EXIT GATE
  ✅ API contract is signed off and both sides implemented against it
  ✅ BE: all unit + integration tests pass
  ✅ FE: all CI checks pass (lint, type-check, test, build)
  ✅ All BA acceptance criteria are implemented
  ✅ PR descriptions are complete
```

---

# STAGE 6 — REVIEW CODE ↔ FIX CODE

> *"Is the code correct, secure, and maintainable? If not, fix it."*

**Reviewer: Code Reviewer**
**Owner of fixes: Frontend Developer / Backend Developer**

This is a **loop** — the Code Reviewer inspects the PR and raises issues. The developer fixes and
re-submits. The loop exits only when the Reviewer approves.

```
REVIEW — what the Code Reviewer checks (in priority order):

  1. SECURITY
     - Injection risks (SQL, command, XSS)
     - Broken auth or missing authorization checks
     - PII / secrets / stack traces in code or logs
     - IDOR (user accessing another user's resource)
     → Any finding: mandatory Request Changes [SECURITY]

  2. CORRECTNESS
     - Does the code match the BA acceptance criteria?
     - Null / undefined handling at every access point
     - Async operations awaited correctly
     - Race conditions possible?
     - All error paths handled — no silent failures
     → Any finding: mandatory Request Changes [BUG]

  3. ARCHITECTURE
     - Single responsibility (one function, one job)
     - Business logic separated from infrastructure
     - No circular dependencies
     - Not over-engineered beyond current requirements

  4. PERFORMANCE
     - N+1 query issues
     - Unbounded queries (missing LIMIT)
     - Unnecessary re-renders (FE)
     - Memory leaks (uncleaned event listeners, timers)

  5. TESTS
     - Tests present for new behavior? (mandatory — no tests = Request Changes)
     - Tests cover happy path + at least one error path
     - Tests are meaningful — not just "function doesn't throw"

  6. READABILITY
     - Non-obvious naming, missing context
     - Complexity that will confuse future maintainers

FIX CODE — what the Developer does with review feedback:
    - [BUG] and [SECURITY] comments are MANDATORY — must be fixed before re-review
    - [SUGGEST] and [NITPICK] are optional — developer's discretion
    - Developer fixes the issue, pushes a new commit
    - Adds a reply comment explaining the fix for non-obvious changes
    - Re-requests review

LOOP EXIT CONDITION
  ✅ Zero [BUG] or [SECURITY] findings remaining
  ✅ Tests cover new behavior (happy + at least one error path)
  ✅ Reviewer posts "Approved"
  ✅ PR merges to the test/staging environment
```

---

# STAGE 7 — TEST ↔ FIX BUGS

> *"Does it work as specified — including every edge case?"*

**Tester: QA**
**Bug fixer: Frontend Developer / Backend Developer**
**Re-reviewer: Code Reviewer (reviews all bug fix PRs)**

This is a **loop** — QA tests, reports bugs, developers fix and resubmit to code review, then QA
retests. The loop exits only when QA issues sign-off.

```
TEST — what QA does:

  QA executes the test suite built in Stage 4 across all six case types:
    1. Happy path cases      — system works as expected with valid inputs
    2. Error path cases      — system handles expected failure conditions correctly
    3. Edge cases            — extreme/boundary inputs, concurrent actions
    4. Boundary value cases  — at, just below, just above every defined limit
    5. Negative cases        — unauthorized actions, invalid states, malformed input
    6. Regression cases      — existing features not broken by the new change

  For every test case:
    - Record: pass / fail / blocked
    - For every failure: file a Bug Report with:
        Title, severity, steps to reproduce (exact — no vague "it crashed"),
        expected result (quoting the BA acceptance criterion),
        actual result (quoting exact error message or behavior),
        evidence (screenshot / video / console logs)

FIX BUGS — what the Developer does:
    - Critical / High bugs: Developer fixes immediately, notifies QA
    - Developer opens a fix PR
    - Code Reviewer reviews the fix PR (same loop as Stage 6)
    - Fix PR merges to test environment
    - QA retests the specific bug

LOOP EXIT CONDITION
  ✅ Zero open Critical or High severity bugs
  ✅ Test pass rate ≥ 95%
  ✅ Every BA acceptance criterion has a corresponding passing test case
  ✅ Regression suite passes — no existing features broken
  ✅ QA delivers Test Execution Report to PM with sign-off decision

QA SIGN-OFF ESCALATION
  If a Low severity bug is found near release and fixing it risks destabilising other features:
    - QA flags to PM with impact assessment
    - PM decides: fix now / defer with accepted risk / block release
    - Decision is logged in RAID log
```

---

# STAGE 8 — COMPLETE

> *"QA has signed off. Ship it and learn from it."*

**Primary role: Project Manager**
**Supporting: All roles**

```
ACTIONS
  PM: Verifies the project-level Definition of Done:
        ✅ All user stories demo'd and accepted by BA
        ✅ All QA test cases passed
        ✅ Zero open Critical or High bugs
        ✅ All PRs reviewed and merged
        ✅ RAID log reviewed — all open risks have active mitigations
        ✅ QA Test Execution Report received with sign-off

  PM: Coordinates the release:
        - BE confirms rollback plan is ready
        - Deploy to production
        - Smoke test post-deploy (QA runs critical path cases on production)

  PM: Closes the RAID items:
        - Which risks materialized and how were they handled?
        - Which assumptions were wrong?

  PM: Runs Retrospective with the full team:
        - What went well?
        - What didn't go well? (specific, not generic)
        - Action items: each has an owner and a deadline

  PM: Notifies stakeholders — release notes sent

OUTPUT
  Released feature in production
  Retro action items (each with owner + deadline)
  Updated RAID log (closed items documented)

EXIT GATE
  ✅ Feature is live and smoke-tested
  ✅ Stakeholders notified
  ✅ Retro completed with at least one action item with an owner
```

---

# WORKFLOW SUMMARY TABLE

| Stage | Stage name | PM | BA | Designer | FE | BE | QA | Reviewer |
|-------|-----------|----|----|----------|----|----|----|----|
| 1 | Requirement | **A/R** | C | I | I | I | I | I |
| 2 | Analyse Requirement | C | **A/R** | C (user evidence) | C | C | C | I |
| 3 | Review ↔ Update | C | **A/R** (updates) | R (reviews UX completeness) | R (reviews) | R (reviews) | **R** (reviews) | I |
| 4 | Make Document | A (approves) | **A/R** | **R** (flows + screen designs, parallel) | I | I | R (starts test cases) | I |
| 5 | Develop | C | C | R (supports FE, build QA) | **A/R** | **A/R** | R (test cases) | I |
| 6 | Review Code ↔ Fix | I | I | I | R (fixes) | R (fixes) | I | **A/R** |
| 7 | Test ↔ Fix Bugs | C | I | R (validates visual fixes) | R (fixes) | R (fixes) | **A/R** | R (re-reviews fixes) |
| 8 | Complete | **A/R** | C | C (metric vs prediction) | I | C | C | I |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

---

# THE THREE BIDIRECTIONAL LOOPS

These are enforced loops — not one-way handoffs. Each loop has a clear exit condition.

```
LOOP A — REVIEW ↔ UPDATE (Stage 3)
  Trigger:  Reviewer (PM / QA / FE / BE) raises an issue with the requirements
  Action:   BA updates the requirements to address the issue
  Exit:     All reviewers confirm zero open issues
  Owner:    BA (must update); PM (must not let loop run > 2 business days without resolution)

LOOP B — REVIEW CODE ↔ FIX CODE (Stage 6)
  Trigger:  Code Reviewer posts [BUG] or [SECURITY] on a PR
  Action:   Developer fixes the issue and pushes a new commit
  Exit:     Code Reviewer posts "Approved"
  Owner:    Developer (must fix); Reviewer (must re-review within 1 business day of fix)

LOOP C — TEST ↔ FIX BUGS (Stage 7)
  Trigger:  QA files a Bug Report (Critical, High, or Medium severity)
  Action:   Developer fixes, opens fix PR → Code Reviewer approves → QA retests
  Exit:     Zero Critical/High bugs; pass rate ≥ 95%; QA posts sign-off
  Owner:    QA (owns the loop); PM (escalates if loop stalls > 1 sprint)
```

---

# HANDOFF CONTRACTS

Each handoff has a strict done-definition. The receiving role can reject a non-conforming handoff.

| From → To | What is handed off | Receiver may reject if... |
|-----------|-------------------|---------------------------|
| PM → BA | Initiative Brief + RAID | Problem unclear, no measurable success criteria |
| BA → Reviewers (Stage 3) | Draft requirements | No value justification, missing case coverage |
| Reviewers → BA | Clarification Requests | BA must address — cannot reject QA's gap findings |
| BA → PM | Final BRD+FRD+SRD | Any quality gate from Stage 4 is unmet |
| BA → Dev + QA | Approved documents | PM sign-off not received |
| FE ↔ BE | Signed API contract | Shape unconfirmed, error responses undefined |
| Dev → Reviewer | PR with green CI | CI red, no PR description, scope > 400 lines meaningful change |
| Reviewer → Dev | Approval or Request Changes | N/A — reviewer's job is to review |
| Dev → QA | Merged + deployed build | Not deployed, wrong build version, smoke test fails |
| QA → PM | Test Execution Report | Open Critical/High bugs, acceptance criteria not all verified |

---

# ORCHESTRATION INSTRUCTIONS

When this skill is invoked to run a feature end-to-end, deploy role skills in this order:

```
1. Deploy `project-manager`
   → Intake, RAID log, Initiative Brief

2. Deploy `business-analyst`
   → Requirement analysis (Stage 2)

3. Deploy `qa` + `frontend-developer` + `backend-developer` (consult only)
   → Stage 3 review loop — all three review the BA draft
   → BA updates until all approve
   → Loop back to BA until exit condition met

4. Deploy `business-analyst`
   → Stage 4: finalize and produce BRD+FRD+SRD

5. Deploy `qa` (test case design) in parallel with:
   Deploy `frontend-developer` + `backend-developer`
   → Stage 5: agree API contract, then parallel build

6. Deploy `code-reviewer`
   → Stage 6: review loop — reviewer reviews, dev fixes, repeat until approved

7. Deploy `qa`
   → Stage 7: test loop — QA tests, dev fixes (through code review), QA retests

8. Deploy `project-manager`
   → Stage 8: release, RAID close, retro
```

Never skip a stage or a loop exit condition to save time. Surface the trade-off to the PM instead.

---

**End of Team Workflow Skill**
