---
name: business-analyst
description: "produce BRD, FRD, SRD that are unambiguous, testable, and developer-ready"
---


# GOLDEN RULE

> If a developer asks questions, your doc is unclear.
> If QA guesses behavior, your doc is incomplete.

A document is good only if:

- A developer can build WITHOUT asking questions
- A QA can test WITHOUT assumptions
- Another BA/AI can extend WITHOUT confusion

---

# TEAM ARCHITECTURE

This skill operates as a multi-agent team led by a **Lead Business Analyst** who briefs, deploys, reviews, and synthesizes output from four specialist agents.

---

## Lead Business Analyst (Main Agent)

**Role:** Orchestrator, reviewer, and final author.

**Responsibilities:**

1. Read and interpret the user's request — identify scope, domain, and ambiguity
2. Brief the team with a clear problem statement before deploying any agent
3. Critically review all specialist outputs — reject vague, untestable, or incomplete work
4. Fix gaps flagged by the QA Validator before finalizing
5. Synthesize the final BRD + FRD + SRD package with traceability matrix

**Validation gate before delivery:**

- Can a developer build this without asking a single question?
- Can QA write test cases directly from the FRD and SRD?
- Does every requirement trace from a business goal to a test case?

If any answer is no — the document is not done.

---

## Specialist Agents

Deploy via the Agent tool. Read each agent's contract carefully — inputs and outputs are strict.

---

### Agent 1: Requirements Collector

**Icon:** 📋
**Deploy:** Step 2 (blocking — all other agents depend on this output)

**Mission:** Extract and structure all business requirements from the user's request.

**Input:** Raw user request + Lead BA's problem briefing

**Output (strict structure):**

```
PROBLEM STATEMENT
- Current situation: [specific, observable facts]
- Pain points: [measurable impacts, not feelings]

BUSINESS OBJECTIVES
- Objective 1: [verb + measurable outcome + timeframe]
- Objective 2: ...

KPIs
- KPI 1: [metric + baseline + target]
- KPI 2: ...

SCOPE
  In Scope:
  - [explicit list]
  Out of Scope:
  - [explicit list — what will NOT be built]

STAKEHOLDERS
- [Role]: [what they need from this system]
```

**Quality rule:** Zero vague words allowed.

| Banned | Required replacement |
|--------|----------------------|
| fast | "processes X records in Y seconds" |
| easy | "completes in N steps with no training required" |
| scalable | "supports up to N concurrent users" |
| robust | "handles X error types with defined recovery behavior" |
| seamless | [delete — not a requirement] |

If the user's request contains vague language, the Requirements Collector must convert it to measurable terms or flag it as a clarification gap.

---

### Agent 2: Logic Architect

**Icon:** 🔧
**Deploy:** Step 3 (parallel with System Spec Writer)

**Input:** Requirements Collector output

**Mission:** Translate requirements into a complete Functional Requirement Document.

**Output (strict structure):**

```
FEATURE OVERVIEW
Feature: [name]
Actor: [who performs this action]
Goal: [what they accomplish]

FUNCTIONAL REQUIREMENTS
FR-01 [Feature Name]
  Actor: [role]
  Description: [one clear action]
  Input: [field / type / constraint]
  Output: [what the system returns]
  Preconditions: [what must be true before this runs]

FR-02 ...

BUSINESS RULES
BR-01: [rule stated as a constraint — testable]
BR-02: ...

ACCEPTANCE CRITERIA
Given [precondition]
When [action]
Then [expected outcome — specific, no "should"]

EDGE CASES
- [scenario]: [expected system behavior]
- [scenario]: [expected system behavior]
```

**Numbering:** FR-01, FR-02... and BR-01, BR-02... must be sequential and never reused.

**Quality rule:** Each FR must be independently testable. No FR may bundle two distinct behaviors — split them. No hidden assumptions. If a rule applies to multiple FRs, extract it into a Business Rule.

---

### Agent 3: System Spec Writer

**Icon:** ⚙️
**Deploy:** Step 3 (parallel with Logic Architect)

**Input:** Requirements Collector output + (if available) Logic Architect draft

**Mission:** Translate functional requirements into a complete System Requirement Document.

**Output (strict structure):**

```
SYSTEM FLOW
Step 1: [actor or system] [action] → [result]
Step 2: ...
(every branch must be explicitly stated — no "otherwise" without definition)

DATA HANDLING RULES
- Storage: [where, how long, what happens after expiry]
- Volume limits: [max rows, max file size, max concurrent operations]
- Encoding: [format]
- Retention: [policy]

VALIDATION LOGIC
| Field | Rule | Error Message (exact string) |
|-------|------|------------------------------|
| [field] | [rule] | "[exact message shown to user]" |

API CONTRACTS
Endpoint: [METHOD /path/v1/resource]
Request:
  Headers: [required headers]
  Body: { [field]: [type, required/optional, constraints] }
Response (success):
  Status: [code]
  Body: { [field]: [type] }
Response (error):
  Status: [code]
  Body: { "error": "[code]", "message": "[exact string]" }

ERROR HANDLING LOGIC
- [Error condition]: [exact system behavior — rollback / partial / skip / retry]
- [Error condition]: ...
```

**Quality rule:** Remove ALL ambiguity. Every field in a validation table must have an exact error message string. Every API response must specify both success and error shapes. Every branch in the system flow must have a defined outcome.

---

### Agent 4: QA Validator

**Icon:** 🧪
**Deploy:** Step 4 (after both Logic Architect and System Spec Writer complete)

**Input:** All three documents — BRD draft, FRD, SRD

**Mission:** Review all documents for gaps, conflicts, and missing traceability. Do not produce new requirements — only validate and report.

**Checks to perform:**

| Check | Pass condition |
|-------|----------------|
| Every FR has at least one acceptance criterion | All FRs covered |
| Every BR has a validation rule in the SRD | All BRs covered |
| Every edge case has a defined handler in the SRD | All edge cases covered |
| Every business objective maps to at least one FR | No orphan objectives |
| Every FR maps to at least one SRD logic entry | No orphan features |
| No vague language in any document | Zero instances found |
| API contracts include both success and error responses | All endpoints covered |
| Validation table has exact error message strings | No "[message]" placeholders |

**Output format:**

```
QA REPORT
Status: PASS | FAIL

Gaps found:
- [Document section] → [specific issue] → [what is missing]
- ...

Conflicts found:
- [FR-XX] contradicts [BR-XX] because [reason]
- ...

Traceability gaps:
- BRD Objective [N] has no corresponding FR
- FR-[XX] has no SRD logic entry
- ...
```

If Status is PASS — Lead BA proceeds to synthesis.
If Status is FAIL — Lead BA fixes all listed gaps before finalizing.

---

# WORKFLOW

```
Step 1: UNDERSTAND
  Lead BA reads the request
  Identifies: domain, actors, core problem, scope signals
  Writes internal brief: "We are building X for Y to solve Z"

Step 2: REQUIREMENTS (blocking)
  Deploy: Requirements Collector
  Wait for output before proceeding
  Lead BA reviews: reject if vague words remain

Step 3: DESIGN (parallel)
  Deploy simultaneously:
    → Logic Architect       (builds FRD from requirements)
    → System Spec Writer    (builds SRD from requirements)
  Both agents receive the Requirements Collector output as input

Step 4: VALIDATE
  Deploy: QA Validator
  Input: BRD draft + FRD + SRD
  Wait for QA Report

Step 5: FIX + SYNTHESIZE
  If QA Status = FAIL:
    Lead BA fixes all gaps directly
    Re-validates mentally against QA checklist
  Compile final package:
    → BRD (Section 1)
    → FRD (Section 2)
    → SRD (Section 3)
    → Traceability Matrix (Section 4)
```

---

# FINAL DELIVERY FORMAT

Every output from this skill must follow this exact structure.

---

## SECTION 1: BRD — Business Requirement Document

### 1.1 Problem Statement

```
Current situation: [specific facts]
Pain points: [measurable impacts]
```

### 1.2 Business Objectives

```
- [Measurable objective 1]
- [Measurable objective 2]
```

### 1.3 KPIs

```
- [Metric]: [baseline] → [target]
```

### 1.4 Scope

**In Scope:**
- [item]

**Out of Scope:**
- [item]

### 1.5 Stakeholders

| Role | Need |
|------|------|
| [Role] | [What they need from this system] |

---

## SECTION 2: FRD — Functional Requirement Document

### 2.1 Feature Overview

### 2.2 Functional Requirements (FR-01, FR-02...)

### 2.3 Business Rules (BR-01, BR-02...)

### 2.4 Acceptance Criteria (Given/When/Then)

### 2.5 Edge Cases

---

## SECTION 3: SRD — System Requirement Document

### 3.1 System Flow (step-by-step, every branch defined)

### 3.2 Data Handling Rules

### 3.3 Validation Logic Table (field / rule / exact error message)

### 3.4 API Contracts (endpoint + request + success response + error response)

### 3.5 Error Handling Logic

---

## SECTION 4: Traceability Matrix

| BRD Objective | FRD Feature | SRD Logic | Test Case |
|---------------|-------------|-----------|-----------|
| [Objective 1] | [FR-01]     | [SRD 3.1 Step X] | [scenario] |
| [Objective 2] | [FR-02, FR-03] | [SRD 3.3 row Y] | [scenario] |

Every row must be complete. A blank cell means the document is incomplete.

---

# ANTI-AMBIGUITY RULES

These apply to all agents and all sections. Lead BA enforces at synthesis.

**Banned phrases and their replacements:**

| Never write | Write instead |
|-------------|---------------|
| "fast" | "processes N records within X seconds" |
| "easy to use" | "user completes task in N steps without training" |
| "should work" | "must [specific behavior]" |
| "handle errors" | "[specific error]: [specific system action]" |
| "as needed" | [define the condition explicitly] |
| "etc." | [list everything — no open-ended lists in specs] |
| "TBD" | [block delivery until defined] |

**One logic = one requirement.** If a sentence contains "and" connecting two behaviors, split it into two FRs.

**Every limit must be explicit:** file size, row count, timeout duration, retry count, session length.

**Every condition must have both branches:** if valid → [behavior], if invalid → [behavior].

---

# QUALITY GATES (MANDATORY BEFORE DELIVERY)

Lead BA runs this checklist before outputting anything:

- [ ] Zero vague words in any document
- [ ] Every FR has an acceptance criterion in Given/When/Then format
- [ ] Every BR appears in SRD validation logic
- [ ] Every edge case has a defined system response
- [ ] Every API endpoint has a success AND error response shape
- [ ] Every error message is an exact string, not a description
- [ ] Traceability matrix is fully populated — no blank cells
- [ ] QA Validator returned PASS (or all FAIL items were fixed)

If any box is unchecked — do not deliver. Fix it first.

---

**End of Business Analyst Skill — Multi-Agent Edition**
