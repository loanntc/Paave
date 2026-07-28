# Team Workflow — Paave Multi-Role Agent System

## Core SDLC Roles

These seven own the phases in the lifecycle below. Full 16-agent roster (including specialists like `architect`, `security-reviewer`, `ux-designer`, `tdd-guide`, `planner`, `refactor-cleaner`, `build-error-resolver`, `researcher`, `e2e-runner` who are consulted within phases as needed) — see `CLAUDE.md` → `## Agents`.

| Agent | File | Primary Trigger |
|-------|------|----------------|
| `product-owner` | `product-owner.md` | Backlog priority, user stories, acceptance criteria, sprint review sign-off |
| `project-manager` | `project-manager.md` | Planning, risk, cross-team blockers, status |
| `business-analyst` | `business-analyst.md` | Requirements, BRD/FRD/SRD, gap analysis |
| `frontend-developer` | `frontend-developer.md` | UI implementation, design-dev alignment |
| `backend-developer` | `backend-developer.md` | API, DB, system design, server logic |
| `qa-engineer` | `qa-engineer.md` | Test cases, bug reports, release sign-off |
| `code-reviewer` | `code-reviewer.md` | PR review, quality audit, security check |

---

## SDLC Workflow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FEATURE LIFECYCLE                             │
│                                                                      │
│  0. BACKLOG           1. DISCOVERY       2. REQUIREMENTS             │
│  ┌──────────┐         ┌──────────┐       ┌──────────────┐           │
│  │    PO    │────────▶│  PO + PM │──────▶│      BA      │           │
│  │ priority │ story   │  scope   │ scope │              │           │
│  │ + story  │ approved│ + risk   │ apprvd│  FRD / SRD   │           │
│  └──────────┘         └──────────┘       └──────────────┘           │
│       ▲                    │                     │                   │
│       │ accepts /          │                     ▼                   │
│       │ rejects            │             ┌──────────────┐           │
│       │                    │             │      QA      │           │
│                            │             │ (test plan)  │           │
│  3. DESIGN                 │             └──────────────┘           │
│  ┌──────────────┐          │                     │                   │
│  │  FE + BE     │◀─────────┘       PO approves FRD before dev       │
│  │  (parallel)  │                                                    │
│  └──────────────┘                                                    │
│                                                                      │
│  4. DEVELOPMENT       5. TESTING         6. REVIEW + SHIP            │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐           │
│  │  FE + BE     │───▶│      QA      │──▶│Code Reviewer │           │
│  │  (parallel)  │    │              │   │              │           │
│  └──────────────┘    └──────────────┘   └──────────────┘           │
│         │                  │                   │                     │
│         │◀─ bug reports ───┘                   │                     │
│         │                              ┌───────▼──────┐             │
│         │                              │    MERGE     │             │
│         │                              │  (CI green   │             │
│         │                              │  + approved) │             │
│         │                              └──────┬───────┘             │
│         │                                     │                     │
│         │                              ┌──────▼───────┐             │
│         │                              │  PO ACCEPTS  │             │
│         │                              │ Sprint Review│             │
│         │                              └──────────────┘             │
│         │                                                            │
│         └──────────── PM tracks all ───────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Phase-by-Phase Breakdown

### Phase 0 — Backlog (PO leads)

**Participants:** PO, Stakeholders (input), PM (consulted on effort)
**PO actions:**
- Receives feature requests from stakeholders, users, and data signals
- Writes a user story with full acceptance criteria for every backlog item before it is sprint-eligible
- Prioritizes the backlog using: user impact → business value → compliance risk → dependency → effort
- Consults PM for effort estimates before finalizing priority
- Marks items `P0` (this sprint), `P1` (next sprint), `P2` (this quarter), `P3` (future)
- Reviews and updates backlog before every sprint planning session

**PO gates — nothing moves to Phase 1 without:**
- [ ] User story written in STORY-[ID] format
- [ ] All acceptance criteria testable and unambiguous
- [ ] Out-of-scope explicitly listed
- [ ] Priority assigned with documented rationale
- [ ] Compliance check passed (age gate, no real-trading paths, KYC if relevant)

**Output:** Sprint-eligible backlog with ordered, fully written user stories

**Transition to Phase 1:** PO confirms top items are ready → PM begins sprint planning with those items

---

### Phase 1 — Discovery (PO + PM lead jointly)

**Participants:** PO, PM, BA (consulted), Stakeholders
**PO actions:**
- Presents the prioritized user stories for the upcoming sprint
- Answers BA and PM questions about intent and edge cases
- Confirms scope boundaries — what is explicitly in and out

**PM actions:**
- Receives prioritized stories from PO
- Defines scope boundaries (in/out of scope) confirmed with PO
- Assesses risk: timeline, technical complexity, regulatory impact
- Gets scope approved before BA begins full spec work
- Creates sprint tickets with enough detail for BA to start

**Output:** Approved scope statement, initial risk register entries, sprint commitment

**Transition to Phase 2:** PO approves scope → PM signals BA to begin

---

### Phase 2 — Requirements (BA leads)

**Participants:** BA, PM (reviewer), FE/BE (consulted for feasibility)
**BA actions:**
- Produces BRD → FRD → SRD following the business-analyst agent protocol
- Consults FE on UI/UX feasibility for complex flows
- Consults BE on technical constraints (API availability, DB capabilities)
- Sends document to QA for testability review before finalizing

**BA ↔ QA interaction:**
- BA sends draft FRD/SRD to QA for gap review
- QA returns `GAP-QA-[N]` reports for missing/ambiguous items
- BA resolves all BLOCKER gaps before marking document Final
- BA and QA iterate until QA confirms document is testable

**BA ↔ FE interaction:**
- BA shares user flows and acceptance criteria
- FE flags flows that are technically infeasible or UX-problematic
- BA updates spec to resolve conflicts

**BA ↔ BE interaction:**
- BA shares API requirements and data needs
- BE flags data model constraints or missing system behavior
- BA updates SRD with agreed API contracts

**PO review gate (before Final):**
- BA sends draft FRD to PO for product alignment review
- PO verifies: acceptance criteria in the FRD match the original user story exactly
- PO flags any scope drift, missing user needs, or compliance risks
- PO sign-off is required before BA can mark document Final

**Output:** Final BRD + FRD + SRD package, QA-confirmed testable, PO-approved

**Transition to Phase 3:** BA marks document Final (with PO sign-off) → PM notifies FE, BE, QA to begin

---

### Phase 3 — Design (FE + BE in parallel, QA begins test planning)

**Participants:** FE, BE, QA (parallel workstreams)

**FE actions:**
- Reviews FRD for UI/UX implications
- Raises design concerns or improvement suggestions with BA
- Plans component architecture, identifies reusable patterns
- Flags any design gaps (missing states: loading, empty, error)

**BE actions:**
- Designs data model and API contracts from SRD
- Raises technical constraints or corrections needed in SRD
- Documents architecture decisions (DB schema, RPC design, auth flow)

**QA actions (parallel):**
- Reads FRD/SRD and creates test cases for all modules
- Files GAP-QA reports for anything that blocks test case writing
- Produces test plan: modules, test case count, priority breakdown

**FE ↔ BE interaction during design:**
- Agree on API contracts before coding starts — not during
- BE produces API spec → FE reviews and confirms the shape works for UI
- Conflicts resolved before either side starts building

**Output:** Test plan (QA), API contracts agreed (FE+BE), architecture doc (BE)

**Transition to Phase 4:** PM confirms design phase complete → development sprint begins

---

### Phase 4 — Development (FE + BE in parallel)

**Participants:** FE, BE (development), QA (environment prep), PM (tracking)

**FE development:**
- Builds UI from FRD acceptance criteria
- All code must pass CI locally before PR: `tsc --noEmit && npm run lint && npm run build`
- Opens PR only when CI passes
- Tags Code Reviewer for review

**BE development:**
- Builds API + DB from SRD specifications
- All tests must pass before PR: `npm test && tsc --noEmit && npm run lint && npm run build`
- Opens PR only when all checks pass
- Tags Code Reviewer for review

**PM actions (ongoing):**
- Daily check: are any developers blocked?
- Track velocity against sprint timeline
- Escalate any new risks that emerge during development
- Ensure FE/BE dependencies don't block each other (API contracts delivered on schedule)

**Transition to Phase 5:** Developer self-verifies CI passes → opens PR → Code Reviewer approves → QA tests the merged feature on staging

---

### Phase 5 — Testing (QA leads)

**Participants:** QA, FE/BE (bug fixing), PM (escalation)

**QA actions:**
- Executes test plan against staging environment
- Files bug reports in `BUG-[ID]` format for all failures
- Assigns P0/P1 bugs to responsible developer immediately
- Re-tests after developer fixes

**QA ↔ FE/BE interaction:**
- QA files bug → developer reproduces and fixes → developer notifies QA
- QA re-runs failing test case + regression suite for affected module
- If bug cannot be reproduced: QA provides exact repro steps, environment details
- If fix introduces a new bug: QA files a new bug report (never reuse the old ID)

**QA ↔ BA interaction:**
- If a bug surfaces a missing requirement: QA flags it as a BA gap, not just a bug
- BA updates FRD/SRD → QA updates test cases → developer implements update

**QA ↔ PM interaction:**
- QA reports daily: open bug count by severity
- If P0 bugs are blocking release: QA escalates to PM immediately
- PM decides: delay release, reduce scope, or accept risk with stakeholder approval

**Transition to Phase 6:** QA issues Release Sign-Off (no P0 open, P1 approved by PM if any)

---

### Phase 6 — Code Review + Ship

**Participants:** Code Reviewer, PM (merge approval), FE/BE (fixes)

**Code Reviewer actions:**
- Reviews PR against the checklist in the code-reviewer agent
- Labels issues as [BLOCKER], [MAJOR], [MINOR], [NIT]
- Returns verdict: APPROVED / CHANGES REQUESTED / BLOCKED

**When CHANGES REQUESTED:**
- Developer addresses all [BLOCKER] items
- Developer addresses [MAJOR] items or explains why not
- Developer re-requests review
- Code Reviewer re-reviews changed sections

**When APPROVED:**
- PR merges to develop (or main after QA sign-off)
- Deployment to staging happens automatically (CI/CD)
- **PO performs Sprint Review acceptance** — reviews the deployed feature against original acceptance criteria
- PO verdict: ACCEPTED / CONDITIONALLY ACCEPTED / REJECTED (see product-owner.md for format)
- PM marks sprint item complete only after PO accepts

---

## Cross-Team Communication Rules

### Who escalates to whom

```
Developer blocked by missing API contract  →  Escalate to BE (if FE) or FE (if BE), then PM if unresolved in 4h
QA blocked by unstable build               →  Escalate to responsible developer, then PM if > 24h
QA finds BA gap during testing             →  Escalate to BA, CC PO and PM
BA cannot resolve requirement conflict     →  Escalate to PO (product decision) or PM (scope/timeline decision)
BA FRD conflicts with user story           →  Escalate to PO immediately — PO resolves before Final
PO rejects completed work at Sprint Review →  PO documents rejection, PM creates fix ticket, prioritize next sprint
Stakeholder requests scope change mid-sprint→  Escalate to PO to triage; PO decides: this sprint or backlog
PR has no reviewer for > 24h              →  Escalate to PM to assign reviewer
Any P0 bug in production                  →  Escalate to PM + PO + all team immediately
Any compliance / age gate violation found  →  Escalate to PO immediately — release blocked until resolved
```

### Artifact ownership

| Artifact | Owner | Reviewers |
|----------|-------|-----------|
| Product Backlog | **PO** | PM (effort), Stakeholders (input) |
| User Stories + Acceptance Criteria | **PO** | BA (feasibility), QA (testability) |
| Sprint Review Sign-off | **PO** | — |
| BRD | BA | PM, **PO**, Stakeholders |
| FRD | BA | **PO** (product alignment), QA (testability), FE (UX), BE (technical) |
| SRD | BA + BE | QA (testability), FE (API shape) |
| Test Plan | QA | PM, BA |
| Bug Reports | QA | Developer (assigned), PM (P0/P1), **PO** (if user-facing regression) |
| PR | FE or BE | Code Reviewer |
| Architecture Doc | BE | PM, FE (if API-touching) |
| Risk Register | PM | All teams, **PO** (product risks) |

### Handoff checklist (between phases)

**PO → BA (before spec work begins):**
- [ ] User story written with full acceptance criteria
- [ ] Out-of-scope explicitly listed
- [ ] Compliance check passed (no age gate or real-trading violations)
- [ ] PO available to answer BA questions during spec phase

**BA → Development:**
- [ ] FRD marked Final
- [ ] FRD reviewed and signed off by PO
- [ ] SRD marked Final
- [ ] QA has confirmed document is testable (no open BLOCKER gaps)
- [ ] API contracts agreed between FE and BE
- [ ] PM has created sprint tickets for each FR

**Development → QA:**
- [ ] Feature deployed to staging
- [ ] CI pipeline is green
- [ ] PR is merged (code reviewed and approved)
- [ ] Developer has self-tested happy path on staging

**QA → Release:**
- [ ] Release Sign-Off document produced
- [ ] Zero P0 bugs open
- [ ] P1 bugs reviewed and accepted by PM if any remain
- [ ] Regression suite passed
- [ ] PO Sprint Review acceptance received (ACCEPTED or CONDITIONALLY ACCEPTED)

---

## Risk Triggers (PM monitors these across all phases)

| Trigger | Risk | PM Action |
|---------|------|-----------|
| BA document has BLOCKER gaps after 48h | Development cannot start | Escalate to stakeholders, extend timeline |
| FE/BE API contract not agreed by design phase end | Development blocked | Force alignment meeting same day |
| QA test plan not complete when development starts | Late testing, compressed QA time | Alert PM, compress scope if necessary |
| P0 bug found in Phase 5 with < 3 days to release | Release at risk | Stakeholder decision: delay or descope |
| CI failing on develop branch | All team blocked | Assign immediate fix, no new PRs merged |
| HOSE/HNX data feed SLA breach detected in testing | Core product risk | Escalate to infrastructure immediately |
| Age gate bypass found in any test | Regulatory/compliance risk | Stop release, P0 fix mandatory |
