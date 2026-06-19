---
name: team-workflow
description: >
  The orchestration skill that defines how the full product delivery team works together — Project Manager,
  Business Analyst, Frontend Developer, Backend Developer, QA, and Code Reviewer. Trigger this skill whenever
  a user mentions: coordinating the team, defining who does what, understanding the delivery process, running
  a feature end-to-end, the handoff between roles, the team workflow, or "how does the team work together".
  Also trigger for phrases like "take this feature from idea to release", "who owns this step", "what's the
  process for...", "run the full team on...", or any request that spans multiple roles and needs orchestration.
  This skill routes work to: project-manager, business-analyst, frontend-developer, backend-developer, qa,
  and code-reviewer.
---

# PURPOSE

This skill is the **conductor**. It does not do the specialist work itself — it defines the
relationships, handoffs, and quality gates between the six team roles, and deploys the right
role at the right time via the Agent tool.

Each role has its own dedicated skill:

| Role | Skill | Core responsibility |
|------|-------|---------------------|
| 📋 Project Manager | `project-manager` | Multi-project planning, risk management, cross-team facilitation |
| 🔍 Business Analyst | `business-analyst` | Value-driven requirements, full case coverage (happy/fail/edge) |
| 🎨 Frontend Developer | `frontend-developer` | UI/UX implementation, design collaboration, CI/CD discipline |
| 🏗️ Backend Developer | `backend-developer` | System design, API contracts, tests-before-PR |
| 🧪 QA | `qa` | Test cases from BA docs, gap detection, defect reporting |
| 👁️ Code Reviewer | `code-reviewer` | Security, correctness, architecture review |

---

# TEAM TOPOLOGY

```
                          ┌─────────────────────┐
                          │   PROJECT MANAGER   │  ← owns timeline, risk, coordination
                          │  (risk-first, cross │     facilitates every cross-team decision
                          │   project, RAID log)│
                          └──────────┬──────────┘
                                     │ briefs & unblocks all roles
              ┌──────────────────────┼──────────────────────┐
              ▼                       ▼                      ▼
     ┌─────────────────┐    ┌──────────────────┐   ┌──────────────────┐
     │ BUSINESS ANALYST│───▶│   DEVELOPERS     │──▶│       QA         │
     │ value + full    │    │ FE ⇄ BE          │   │ tests from BA doc│
     │ case coverage   │◀───│ (API contract)   │◀──│ + gap detection  │
     └────────┬────────┘    └────────┬─────────┘   └────────┬─────────┘
              │                       │                      │
              │ QA requests doc       │ QA requests fixes    │
              │ updates (gaps)        ▼                      │
              │              ┌──────────────────┐            │
              └─────────────▶│  CODE REVIEWER   │◀───────────┘
                             │ gate before merge│
                             └──────────────────┘
```

**Key relationship rules:**

- **PM ⇄ everyone:** The PM facilitates, unblocks, and tracks risk. The PM does not make
  technical decisions — they bring the right people together and ensure a decision is made.
- **BA → Developers:** BA delivers value-justified, fully-case-covered requirements. Developers
  do not start until requirements are acceptance-criteria-complete.
- **BA ⇄ QA (bidirectional):** QA writes test cases from BA docs AND audits them. When QA finds
  an uncovered case, QA files a clarification request and BA updates the doc.
- **FE ⇄ BE:** Agree on the API contract before either side implements. Neither builds against
  an unconfirmed shape.
- **QA → Developers:** QA reports defects with full reproduction detail and requests fixes.
  Developers fix; QA retests.
- **Code Reviewer → merge gate:** No PR merges without review approval. Security and correctness
  issues are mandatory blockers.

---

# END-TO-END WORKFLOW

This is the canonical path for a feature from idea to release. The PM owns the overall flow.

```
PHASE 0 — INTAKE & RISK FRAMING        Owner: Project Manager
PHASE 1 — REQUIREMENTS                 Owner: Business Analyst
PHASE 2 — TEST CASE DESIGN (parallel)  Owner: QA          (starts during Phase 1 handoff)
PHASE 3 — DESIGN & BUILD (parallel)    Owner: FE + BE
PHASE 4 — CODE REVIEW                  Owner: Code Reviewer
PHASE 5 — QA EXECUTION                 Owner: QA
PHASE 6 — RELEASE & RETRO              Owner: Project Manager
```

---

## PHASE 0 — Intake & Risk Framing
**Owner: Project Manager** · Deploy: `project-manager`

```
INPUT:  Feature idea / initiative from stakeholder
ACTIONS:
  1. PM runs intake: problem, target user, business goal, constraints, timeline
  2. PM opens a RAID log entry — identifies risks BEFORE any work starts
  3. PM runs the Risk Scan: "what could make this fail?"
  4. PM frames the problem and assigns the BA
OUTPUT: Initiative brief + initial RAID log + assignment to BA
GATE:   Problem is framed, top risks are logged with owners
HANDOFF → Business Analyst
```

---

## PHASE 1 — Requirements
**Owner: Business Analyst** · Deploy: `business-analyst`

```
INPUT:  Initiative brief from PM
ACTIONS:
  1. BA produces value-justified BRD + FRD + SRD
  2. BA runs the Edge Case Detection Checklist on every requirement
  3. BA ensures every FR covers happy path, failure path, AND edge cases
  4. BA ranks requirements by value tier; surfaces scope trade-offs to PM
OUTPUT: BRD + FRD + SRD + Traceability Matrix
GATE:   Every requirement has value justification + all three case classes covered
HANDOFF → QA (for test design) + Developers (for build) — both in parallel
```

---

## PHASE 2 — Test Case Design (runs in parallel with Phase 3)
**Owner: QA** · Deploy: `qa`

```
INPUT:  FRD + SRD from BA
ACTIONS:
  1. QA writes test cases across all six classes:
     happy, error, edge, boundary, negative, regression
  2. QA AUDITS the BA doc for gaps using the BA Document Review Checklist
  3. If gaps found → QA files a Clarification Request → BACK TO BA (Phase 1 patch)
OUTPUT: Test case suite + any BA clarification requests
GATE:   Every acceptance criterion has at least one test case
LOOP:   QA ⇄ BA until zero uncovered cases remain
```

**This is the critical BA⇄QA loop the user asked for:** QA actively detects cases the BA missed
and requests updates. The BA patches the doc. No feature proceeds to QA execution with known gaps.

---

## PHASE 3 — Design & Build (runs in parallel with Phase 2)
**Owner: Frontend Developer + Backend Developer** · Deploy: `frontend-developer`, `backend-developer`

```
INPUT:  FRD + SRD from BA
STEP 3a — CONTRACT AGREEMENT (blocking, do first):
  FE and BE agree on the API contract: request, response, error shapes
  Neither implements until the contract is signed off

STEP 3b — PARALLEL BUILD:
  Backend Developer:
    - Produces System Design Brief (data model, failure modes, scale)
    - Implements API per contract with full input validation
    - Writes unit + integration tests
    - ALL TESTS PASS before opening a PR
  Frontend Developer:
    - Reviews the design; raises UX gaps/concerns to PM & design BEFORE building
    - Implements all screen states (default/loading/error/empty/success)
    - Meets accessibility standards
    - ALL CI CHECKS PASS (lint, type-check, test, build) before opening a PR

OUTPUT: FE PR + BE PR, each green on CI, each linked to its user story
GATE:   No PR is opened until that role's pre-PR checklist fully passes
HANDOFF → Code Reviewer
```

**Developer pre-PR rule (both FE and BE):** A pull request is not created until the role's own
CI/test gate passes locally. "Fix CI later" PRs are not allowed.

---

## PHASE 4 — Code Review
**Owner: Code Reviewer** · Deploy: `code-reviewer`

```
INPUT:  FE PR + BE PR (both green on CI)
ACTIONS:
  1. Reviewer verifies CI is passing (will not review red CI)
  2. Reviews in priority order: security → correctness → architecture → perf → tests → readability
  3. [BUG] / [SECURITY] findings → mandatory Request Changes → BACK TO Developer
  4. Verifies tests cover BA acceptance criteria
OUTPUT: Approve, or Request Changes with actionable comments
GATE:   No merge without approval; security/correctness issues are hard blockers
LOOP:   Reviewer ⇄ Developer until approved
HANDOFF → QA (once merged to the test environment)
```

---

## PHASE 5 — QA Execution
**Owner: QA** · Deploy: `qa`

```
INPUT:  Merged, deployed feature + test suite from Phase 2
ACTIONS:
  1. QA executes the full test suite on the test environment
  2. Defects → full bug report → BACK TO Developer (Phase 3 fix) → Reviewer → redeploy
  3. QA retests fixed defects
  4. QA verifies every BA acceptance criterion passes
OUTPUT: Test Execution Report + sign-off decision (pass/fail/conditional)
GATE:   Zero open Critical/High bugs; pass rate ≥ 95%; all acceptance criteria verified
LOOP:   QA ⇄ Developer ⇄ Reviewer until sign-off
HANDOFF → Project Manager
```

---

## PHASE 6 — Release & Retro
**Owner: Project Manager** · Deploy: `project-manager`

```
INPUT:  QA sign-off
ACTIONS:
  1. PM verifies project-level Definition of Done
  2. PM coordinates release (with BE rollback plan ready)
  3. PM closes RAID items; captures any risks that materialized
  4. PM runs retrospective → action items with owners
OUTPUT: Released feature + retro action items
GATE:   Stakeholder sign-off received
```

---

# HANDOFF CONTRACTS

Each handoff has a strict "done" definition. The receiving role can **reject** a handoff that
does not meet the contract — this is how quality is enforced between teams.

| From → To | Handoff artifact | Receiver may reject if... |
|-----------|------------------|---------------------------|
| PM → BA | Initiative brief + RAID | Problem unclear, no success criteria |
| BA → Dev | FRD + SRD + value justification | Vague requirements, missing case coverage |
| BA → QA | FRD + acceptance criteria | Criteria not testable, missing error messages |
| QA → BA | Clarification request | (BA must patch — not reject; gaps are mandatory to close) |
| FE ⇄ BE | Signed API contract | Shape unconfirmed or ambiguous |
| Dev → Reviewer | PR with green CI | CI red, no description, scope too large |
| Reviewer → Dev | Review comments | (Dev must address [BUG]/[SECURITY] — mandatory) |
| Dev → QA | Merged + deployed build | Not deployed, wrong version, smoke test fails |
| QA → PM | Test Execution Report | Open Critical/High bugs, criteria unverified |

---

# FEEDBACK LOOPS (the relationships that matter most)

The user specifically asked for these cross-team relationships. They are enforced loops, not
one-way handoffs:

```
LOOP 1 — BA ⇄ QA (requirement completeness)
  QA detects uncovered cases in the BA doc → files clarification request
  → BA analyzes, adds the missing cases (happy/fail/edge) → re-delivers
  → QA confirms coverage. Repeat until zero gaps.

LOOP 2 — QA ⇄ Developers (defect resolution)
  QA finds a defect → full reproduction report → Developer fixes
  → Code Reviewer approves fix → redeploy → QA retests. Repeat until clean.

LOOP 3 — FE ⇄ BE (interface alignment)
  Agree API contract up front. Any change to the contract is renegotiated
  with at least one sprint of notice. Neither side silently changes the shape.

LOOP 4 — FE ⇄ Design/PM (UX quality)
  FE raises UX gaps/concerns BEFORE building, not after the PR.
  PM facilitates the design decision. FE implements the agreed outcome.

LOOP 5 — Reviewer ⇄ Developers (merge quality)
  Security/correctness findings are mandatory blockers. Developer addresses,
  reviewer re-reviews. No merge without approval.

LOOP 6 — PM ⇄ everyone (risk & unblocking)
  PM proactively scans for risk every sprint, owns the RAID log, and resolves
  every blocker within 24h or escalates. Cross-team risks are decided in a
  PM-facilitated discussion, never unilaterally.
```

---

# RACI MATRIX

| Activity | PM | BA | FE | BE | QA | Reviewer |
|----------|----|----|----|----|----|----------|
| Initiative framing & risk | **A/R** | C | I | I | I | I |
| Requirements & value analysis | C | **A/R** | C | C | C | I |
| Edge case coverage | I | **A/R** | C | C | **R** | I |
| API contract | I | C | **R** | **R** | I | C |
| Frontend build | I | C | **A/R** | C | I | I |
| Backend build | I | C | C | **A/R** | I | I |
| Test case design | I | C | I | I | **A/R** | I |
| Code review | I | I | C | C | I | **A/R** |
| QA execution & sign-off | C | C | I | I | **A/R** | I |
| Release decision | **A/R** | C | I | C | C | I |
| Risk management | **A/R** | C | C | C | C | C |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

---

# ORCHESTRATION INSTRUCTIONS (for the Lead / main agent)

When this skill is invoked to run a feature end-to-end:

1. **Start with the PM** — deploy `project-manager` to frame the problem and log risks.
2. **Route to the BA** — deploy `business-analyst` for value-justified, fully-covered requirements.
3. **Fan out in parallel** — once the BA doc is ready, deploy `qa` (test design + gap audit) and
   the developers (`frontend-developer`, `backend-developer`) simultaneously.
4. **Honor the BA⇄QA loop** — if QA returns clarification requests, route them back to the BA
   before proceeding.
5. **Gate every PR** — deploy `code-reviewer` before any merge.
6. **Execute QA** — deploy `qa` for test execution; route defects back through the dev→review loop.
7. **Close with the PM** — deploy `project-manager` for release and retro.

Deploy roles in parallel wherever the workflow allows (Phase 2 and Phase 3 overlap; FE and BE
build concurrently). Never skip a quality gate to save time — surface the trade-off to the PM
instead.

---

# GLOBAL QUALITY GATES (enforced across the whole team)

- [ ] PM: every risk has an owner, a score, and a mitigation
- [ ] BA: every requirement has value justification + happy/fail/edge coverage
- [ ] QA: every acceptance criterion has a test case; gaps routed back to BA
- [ ] FE: all CI checks pass before the PR is opened; all UI states implemented
- [ ] BE: all tests pass before the PR is opened; API contract documented
- [ ] Reviewer: no merge without approval; security/correctness are hard blockers
- [ ] QA: zero open Critical/High bugs at sign-off
- [ ] PM: stakeholder sign-off + retro action items before close

If any gate is unmet — the feature is not done. The PM surfaces it; the team fixes it.

---

**End of Team Workflow Skill**
