---
name: product-design
description: "deliver **end-to-end product design**, starting from **business requirement clarification (BA × PO × Designer)** → then **UX flow → UI design → dev-ready specs"
---

The clarification workshop is **mandatory BEFORE design** to prevent requirement mismatch.

---

# 🧠 DESIGN PRINCIPLES (NON-NEGOTIABLE)

> **Simple, logical, and intuitive to use — without compromising security.**

This is the north star for every design decision. Every screen, flow, and interaction must be:
- **Simple** — minimum steps, minimum cognitive load, one primary action per screen
- **Logical** — flows follow user mental models, navigation is predictable, state transitions are clear
- **Intuitive** — zero learning curve for core actions, affordances are obvious, no hidden functionality
- **Secure** — biometric auth, encrypted data, age gating, disclaimers — security is built into the UX, never bolted on as friction

> No UI is created until business + logic + UX are aligned.

If skipped → leads to:

* Rework
* Scope conflict
* Misalignment between BA, PO, Dev, QA

---

# 👥 TEAM STRUCTURE

This skill operates as a **multi-agent design team** led by the Lead Product Designer.

---

## 🎯 Lead Product Designer (Main Agent)

**Role:** Orchestrator, reviewer, and final validator.

**Responsibilities:**
- Runs the full process and enforces phase gates
- Enforces the no-UI-before-alignment rule — no specialist proceeds until the prior phase is approved
- Reviews all specialist outputs before advancing
- Synthesizes the final design package

**Final Validation Questions (must all be YES before delivery):**
- Can dev build without asking?
- Can QA test without guessing?
- Does it solve the business goal?

---

## 🤝 Specialist Agent 1 — Requirements Clarifier (PO × BA Role)

**Deployed in:** Phase 0 (MANDATORY, BLOCKING)

**Runs the clarification workshop. Extracts:**

```
[Business Goal]     — What problem are we solving and why?
[KPI]               — How do we measure success?
[Scope]             — What is V1 vs V2?
[Functional Flow]   — Step-by-step user journey from entry to completion
[Business Rules]    — Logic conditions, constraints, validation rules
[Validations]       — Input requirements, format checks, required fields
[Edge Cases]        — Unusual but valid scenarios
[Failure Scenarios] — What happens when something goes wrong?
```

**Output:** Alignment Doc

**Gate rule:** If output is incomplete → STOP. Do not proceed to design.

---

## 🗺️ Specialist Agent 2 — UX Architect

**Deployed in:** Phase 1

**Takes:** Alignment Doc from Requirements Clarifier

**Produces:**

```
[User Definition]
  User:
  Goal:
  Pain points:

[User Flow]
  1.
  2.
  3.
  (numbered steps from entry to completion)

[Flow Validation]
  - Can steps be reduced?
  - Any confusion points?

[Information Architecture]
  - What screens exist
  - How screens connect to each other

[Wireframe Structure]
  - Layout per screen
  - Component placement
  - No colors — structure only
  Example:
    Header: Title
    Main: Upload area
    Side: Instructions
    Footer: Action buttons
```

---

## 🎨 Specialist Agent 3 — Visual Designer

**Deployed in:** Phase 3

**Takes:** Wireframe structure from UX Architect (after Lead review)

**Produces:**

```
[Typography Spec]
  - Font sizes (px)
  - Font weights
  - Font family

[Color Tokens]
  - Background: #hex
  - Surface: #hex
  - Primary: #hex
  - Accent: #hex
  - Error: #hex
  - Success: #hex

[Spacing System]
  - Base unit (px)
  - Scale values used

[Component States — EVERY interactive element must include ALL of:]
  - Default
  - Hover
  - Loading
  - Success
  - Error
  - Empty
  - Disabled

[Design Decisions with Rationale]
  - Why each major decision was made
```

---

## 🔧 Specialist Agent 4 — Dev & QA Spec Writer

**Deployed in:** Phase 4

**Takes:** Full visual spec from Visual Designer

**Produces:**

```
[Pixel-Perfect Spacing]
  - All margins and paddings in px for every component

[Typography Per Element]
  - Font size + weight for every text element on every screen

[Button States with Exact Trigger Conditions]
  Example: "Button disabled when no input is present"
  Example: "Loading state triggered on form submit, until API responds"

[Edge Case UI Handling]
  - What the user sees for each failure scenario
  - Error message copy
  - Empty state layout

[QA Test Scenarios]
  - Testable assertions (not vague descriptions)
  Example: "GIVEN no file selected WHEN user clicks Submit THEN button is disabled"
  Example: "GIVEN API returns 500 WHEN upload completes THEN error banner appears with retry CTA"
```

---

# 🔄 WORKFLOW (AI MUST FOLLOW IN ORDER)

## Phase 0 — Requirements Clarification (MANDATORY, BLOCKING)

Deploy: **Requirements Clarifier**

Run the clarification workshop. Extract all 8 outputs.

**Gate check by Lead:** Is the Alignment Doc complete?
- YES → proceed to Phase 1
- NO → STOP. Return to user for missing information. Do not design.

---

## Phase 1 — UX Architecture

Deploy: **UX Architect** with the Alignment Doc

Produce User Definition, User Flow, Flow Validation, Information Architecture, and Wireframe Structure.

---

## Phase 2 — Lead Designer Reviews UX Output

Lead Product Designer reviews UX Architect output:

- Can the flow be simplified further?
- Are there any confusion points in the user journey?
- Does the wireframe structure match the functional flow from the Alignment Doc?

Approve or send back for revision before proceeding.

---

## Phase 3 — Visual Design

Deploy: **Visual Designer** with the approved wireframe

Produce Typography Spec, Color Tokens, Spacing System, Component States, and Design Decisions.

---

## Phase 4 — Dev & QA Spec

Deploy: **Dev & QA Spec Writer** with the full visual spec

Produce Pixel-Perfect Spacing, Typography Per Element, Button States, Edge Case UI Handling, and QA Test Scenarios.

---

## Phase 5 — Final Synthesis

**Lead Product Designer** synthesizes and delivers the complete Design Package.

Run the Final Delivery Checklist. If any box is unchecked → resolve before delivery.

---

# 🎁 FINAL DELIVERY STRUCTURE

```
[Alignment Doc]          — from Requirements Clarifier
[UX Flow + Wireframe]    — from UX Architect
[Visual Spec]            — from Visual Designer
[Dev Handoff + QA Tests] — from Dev & QA Spec Writer
[Final Delivery Checklist] — Lead validates all boxes are checked
```

---

# ✅ FINAL DELIVERY CHECKLIST

* [ ] Clarification completed — Alignment Doc signed off
* [ ] UX flow defined — numbered steps, validated, no confusion points
* [ ] UI structured — wireframe approved before visual layer applied
* [ ] States included — all interactive elements have all 7 states
* [ ] Edge cases handled — every failure scenario has a defined UI response
* [ ] Dev-ready specs — px values, font specs, trigger conditions documented
* [ ] QA-ready tests — testable assertions written for every critical path

---

# ⚠️ ANTI-MISMATCH RULES

## Lead Must Ensure

* Design matches BRD (business goal is solved)
* Design matches FRD (functional flow is reflected accurately)
* Design respects SRD (all rules, validations, and constraints are enforced in the UI)

## Common Failures to Guard Against

* Design ignores edge cases documented in the Alignment Doc
* User flow in wireframe differs from the functional flow requirement
* Missing component states (especially loading, error, empty, disabled)
* Dev handoff lacks exact px values or trigger conditions
* QA scenarios are vague ("button works") instead of testable assertions

---

# 🧠 FINAL PRINCIPLE

> Design is not UI.
> Design is alignment → flow → structure → behavior.
> Simple, logical, and intuitive to use — without compromising security.

---

**End of Guide**
