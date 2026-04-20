---
name: business-analyst
description: >
  Produce BRD, FRD, and SRD documents that are unambiguous, testable, and developer-ready.
  Use this skill whenever the user asks to: write or review requirements, create a BRD/FRD/SRD,
  document a feature or system, define business rules, write acceptance criteria, map user flows,
  perform gap analysis, convert a brief/idea/interview into structured documentation, or review
  existing docs for completeness. Also trigger for phrases like "document this feature", "write
  requirements for", "help me spec this out", "what are the requirements for", "review this FRD",
  "create a product spec", or any request involving product/system documentation regardless of
  domain. Domains include: Fintech/Securities, EdTech, SaaS, E-commerce, Environmental, Spa &
  Self-care, and any general software product.
---

# GOLDEN RULE

A document is **good** only when:
- A **developer can build WITHOUT asking questions**
- A **QA can test WITHOUT assumptions**
- Another **BA/AI can extend WITHOUT confusion**

---

# OPERATING MODE

## Step 1 — Identify what's needed

Before producing anything, determine:
1. **Which document(s)** does the user need? (BRD / FRD / SRD — or all three)
2. **What domain** is this? → Load the relevant domain pattern from `references/domain-patterns.md`
3. **What inputs exist?** (user brief, existing doc, interview notes, Figma link, FRD in another language, etc.)

> **Produce only what is requested.** If the user asks for just an FRD, produce only the FRD.
> After delivery, optionally note which companion documents are missing and offer to produce them.

## Step 2 — Clarify before writing

Ask the minimum necessary questions to fill critical gaps. Do not write until you have:
- The business goal or problem being solved
- The primary actors/users
- Any known constraints (regulatory, technical, timeline)

If the input is rich enough (e.g. a detailed brief or an uploaded document), skip to writing directly and flag assumptions inline.

## Step 3 — Produce the document(s)

Output as **Markdown** in chat. Follow the strict templates below.

## Step 4 — Self-validate before delivering

Run the checklist in Section 7 before presenting the output.

---

# BRD — BUSINESS REQUIREMENT DOCUMENT

## Objective
Define **WHY we build this** and **WHAT success looks like**. No technical details.

## Template

```
# BRD: [Feature / Project Name]
Version: x.x | Date: YYYY-MM-DD | Author: [name]

## 1. Problem Statement
Current situation:
- [Describe the pain point with concrete data if available]

Problem caused:
- [Impact: time lost, errors, revenue affected, compliance risk, etc.]

## 2. Business Objectives
- [Objective 1 — measurable]
- [Objective 2 — measurable]

## 3. KPIs (MANDATORY — must be measurable)
| KPI | Baseline | Target |
|-----|----------|--------|
| [metric] | [current] | [goal] |

## 4. Scope
### In Scope
- [item]

### Out of Scope
- [item]

## 5. Stakeholders
| Role | Name / Team | Responsibility |
|------|-------------|----------------|
| Product Owner | | Approves requirements |
| Business User | | Provides domain input |
| Tech Lead | | Feasibility review |

## 6. Assumptions & Dependencies
- [assumption or dependency]
```

## BRD Quality Rules
- No technical implementation details
- No vague words ("fast", "easy", "better") — replace with measurable terms
- Every objective must have a corresponding KPI

---

# FRD — FUNCTIONAL REQUIREMENT DOCUMENT

## Objective
Define **WHAT the system does from the user's perspective**.

## Template

```
# FRD: [Feature Name]
Version: x.x | Date: YYYY-MM-DD | Linked BRD: [ref]

## 1. Feature Overview
| Field | Value |
|-------|-------|
| Feature | [name] |
| Primary Actor | [role] |
| Goal | [what the actor wants to achieve] |
| Trigger | [what initiates this flow] |

## 2. Functional Requirements

### FR-[NN]: [Requirement Name]
- **Actor**: [who]
- **Description**: [what the system does]
- **Input**: [data, format, constraints]
- **Output**: [result, format, destination]
- **Precondition**: [what must be true before]
- **Postcondition**: [what is true after]

[Repeat for each requirement, numbered sequentially]

## 3. Business Rules (SEPARATE — never embed in FR)
| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-01 | [rule] | [what happens if violated] |

## 4. Acceptance Criteria
[Use Given/When/Then for each FR]

Given [precondition]
When [action]
Then [expected outcome]

## 5. Edge Cases (MANDATORY)
| Case | Expected Behavior |
|------|-------------------|
| [edge case] | [system response] |

## 6. UI/UX Notes (if applicable)
- [screen behavior, validation messages, empty states]
```

## FRD Quality Rules
- Each FR must be independently testable
- Business Rules go in Section 3 only — never embedded inside FR descriptions
- No combined logic: one FR = one behavior
- No hidden assumptions — if it's not written, it doesn't exist

---

# SRD — SYSTEM REQUIREMENT DOCUMENT

## Objective
Define **HOW the system behaves internally** — logic, data, integrations, error handling.

## Template

```
# SRD: [Feature Name]
Version: x.x | Date: YYYY-MM-DD | Linked FRD: [ref]

## 1. System Flow
[Numbered step-by-step, including decision points]
1. [step]
2. [IF condition] → [branch A] / [branch B]
3. [step]

## 2. Data Model / Handling Rules
| Field | Type | Constraint | Notes |
|-------|------|------------|-------|
| [field] | [type] | [rule] | |

Storage rules: [retention, encoding, partitioning]

## 3. Validation Logic
| Field | Rule | Error Code | Error Message |
|-------|------|------------|---------------|
| [field] | [rule] | [E-xxx] | [user-facing message] |

## 4. API Contract (if applicable)
### [METHOD] [/endpoint/path]
Request:  { "field": "type" }
Response (success): { "field": "value" }
Response (error): { "error_code": "E-xxx", "message": "..." }

## 5. Integration Points
| System | Direction | Protocol | Data Exchanged |
|--------|-----------|----------|----------------|
| [system] | IN/OUT | REST/MQ/etc | [payload] |

## 6. Error Handling Matrix
| Scenario | System Action | User Message | Retry? |
|----------|--------------|--------------|--------|
| Validation fail | Reject record | [message] | No |
| Partial failure | Return mixed result | [message] | Manual |
| System error | Rollback + alert | [message] | Auto |

## 7. Non-Functional Requirements
| Attribute | Requirement |
|-----------|-------------|
| Performance | [e.g., p95 < 2s for 10k records] |
| Availability | [e.g., 99.9% uptime] |
| Security | [e.g., JWT auth, field-level encryption] |
| Compliance | [e.g., Thong tu 27/2020, PDPA, PCI-DSS] |
```

## SRD Quality Rules
- Zero ambiguity: every branch must be defined
- Every error must have a code, message, and handling action
- Must align 1:1 with FRD — every FR should map to SRD logic

---

# TRACEABILITY MATRIX

Every item must trace end-to-end:

`BRD Goal → FRD Feature → SRD Logic → Test Case`

Include this table at the end of any full-suite delivery:

| BRD Objective | FRD Feature | SRD Section | Test Case |
|---------------|-------------|-------------|-----------|
| [goal] | FR-[NN] | §[x.x] | TC-[NN] |

---

# ANTI-AMBIGUITY RULES

| Bad | Good |
|-----|------|
| "System should be fast" | "p95 response time < 2s under 500 concurrent users" |
| "Validate the data" | "FR-02: Validate email format against RFC 5322 regex" |
| "Handle errors gracefully" | "On DB timeout: rollback transaction, return E-503, retry once after 3s" |
| "Easy to use" | "New user completes onboarding in < 3 minutes (measured by session analytics)" |

---

# SELF-VALIDATION CHECKLIST

Run this before delivering any document:

- [ ] Can a developer build this without asking a single question?
- [ ] Can QA write test cases directly from this document?
- [ ] Are all business rules isolated and numbered (BR-xx)?
- [ ] Are all edge cases listed with explicit system behavior?
- [ ] Are all limits defined (size, count, format, time)?
- [ ] Are all error states defined with codes and messages?
- [ ] Does every requirement trace back to a business objective?
- [ ] Are there any vague words remaining? ("fast", "easy", "etc.", "TBD")

If any box is unchecked → fix before delivering.

---

# DOMAIN PATTERNS

For domain-specific terminology, compliance requirements, common actors, and feature patterns,
read `references/domain-patterns.md` and apply the relevant section.

Domains covered: Fintech/Securities · EdTech · SaaS · E-commerce · Environmental · Spa & Self-care
