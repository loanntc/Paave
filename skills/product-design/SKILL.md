---
name: product-design
description: "deliver **end-to-end product design**, starting from **business requirement clarification (BA × PO × Designer)** → then **UX flow → UI design → dev-ready specs"
---

The clarification workshop is **mandatory BEFORE design** to prevent requirement mismatch.

---

# 🧠 1. DESIGN PRINCIPLE (NON-NEGOTIABLE)

> No UI is created until business + logic + UX are aligned.

If skipped → leads to:

* Rework
* Scope conflict
* Misalignment between BA, PO, Dev, QA

---

# 🔄 2. END-TO-END DESIGN PROCESS (AI MUST FOLLOW)

## Phase 0 — Clarification Workshop (MANDATORY)

### Objective

Align:

* Business goal (PO)
* Functional logic (BA)
* UX direction (Designer)

### Output (REQUIRED)

```
[Business Goal]
[Functional Flow]
[Rules]
[Edge Cases]
[UX Direction]
[Scope: V1 vs V2]
```

👉 If this is incomplete → STOP. Do not design.

---

## Phase 1 — UX Definition

### 1.1 Define User

```
User: 
Goal: 
Pain points:
```

### 1.2 Define User Flow

```
1.
2.
3.
```

### 1.3 Validate Flow

* Can steps be reduced?
* Any confusion points?

---

## Phase 2 — Wireframe (Structure Only)

### Output

* Layout structure
* Component placement
* No colors

### Example

```
Header: Title
Main: Upload area
Side: Instructions
Footer: Action buttons
```

---

## Phase 3 — UI Design (Visual Layer)

### Define

* Typography
* Spacing
* Colors
* Component states

---

## Phase 4 — Interaction & States

### MUST INCLUDE

* Default
* Hover
* Loading
* Success
* Error
* Empty

---

## Phase 5 — Dev & QA Handoff

### MUST PROVIDE

* Spacing (px)
* Typography (size, weight)
* Component behavior
* Edge case handling

---

# 🤝 3. CLARIFICATION WORKSHOP (DETAILED)

## Step 1 — PO (Business)

* Problem
* KPI
* Scope

## Step 2 — BA (Logic)

* Flow
* Rules
* Validations

## Step 3 — Designer (UX)

* Simplify flow
* Identify risks

## Step 4 — ALL

* Edge cases
* Failure scenarios

## Step 5 — PO Decision

* V1 vs V2

---

# 🧩 4. DESIGN OUTPUT STRUCTURE (STRICT)

## 4.1 Screen Overview

```
Screen:
User:
Goal:
```

---

## 4.2 Layout

```
- Header
- Main
- Actions
```

---

## 4.3 Components

* List all UI elements

---

## 4.4 Interaction Rules

```
Action → System response
```

---

## 4.5 States

* Default
* Loading
* Error
* Success

---

## 4.6 Edge Case UI Handling

* What user sees when errors happen

---

# 🔧 5. DESIGN FOR DEV (HANDOFF RULES)

## MUST DEFINE

* Spacing (px)
* Font size
* Button states
* Disabled logic

### Example

```
Button disabled when no file selected
```

---

# 🧪 6. DESIGN FOR QA (TESTABLE UI)

## MUST DEFINE TESTS

* Button disabled state
* Error message display
* Loading indicator appears

---

# ⚠️ 7. ANTI-MISMATCH RULES

## AI MUST ENSURE

* Design matches BRD (business goal)
* Design matches FRD (flow)
* Design respects SRD (rules)

---

## ❌ Common Failure

* Design ignores edge cases
* Flow differs from requirement
* Missing states

---

# 🤖 8. AI BEHAVIOR MODEL

## Step-by-step

1. Run clarification workshop
2. Validate alignment
3. Generate UX flow
4. Generate wireframe
5. Generate UI spec
6. Add dev + QA details

---

## Validation Questions

* Can dev build without asking?
* Can QA test without guessing?
* Does it solve business goal?

---

# 🎁 9. FINAL DELIVERY CHECKLIST

* [ ] Clarification completed
* [ ] UX flow defined
* [ ] UI structured
* [ ] States included
* [ ] Edge cases handled
* [ ] Dev-ready specs
* [ ] QA-ready tests

---

# 🧠 FINAL PRINCIPLE

> Design is not UI.
> Design is alignment → flow → structure → behavior.

---

**End of Guide**
