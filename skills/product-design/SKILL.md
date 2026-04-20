---
name: product-design
description: >
  Deliver end-to-end product design through a structured 4-agent pipeline:
  Lead Designer (clarification + review), UX Architect (flows + wireframes),
  Visual Designer (UI specs + states), and Dev/QA Spec Writer (handoff + test cases).
  Trigger this skill whenever the user mentions: designing a feature, screen, or product;
  building UX flows or wireframes; writing UI specifications; creating design handoff docs;
  doing a product design review; designing for a new or existing app; or any request
  involving user experience, screen layout, interaction states, or component design.
  Also trigger for phrases like "design this feature", "help me design", "create a UX flow",
  "what should this screen look like", "design the UI for", "create wireframe", or
  "spec this out for dev". Always use this skill even if only one design phase is mentioned.
---

# Product Design Skill — Multi-Agent Pipeline

This skill runs a structured 4-agent pipeline. **Claude acts as Lead Designer**, orchestrating
three specialist sub-agents in sequence, then reviewing and delivering the final unified report.

No UI is ever designed before business + logic + UX are aligned.

---

## Agent Roles

| Agent | Responsibility |
|---|---|
| **Lead Designer** (Claude) | Runs Phase 0 clarification, orchestrates agents, reviews all outputs, delivers final report |
| **UX Architect** | User flows, wireframe structure, information architecture, navigation model |
| **Visual Designer** | UI specs, typography, color, component states, responsive rules |
| **Dev/QA Spec Writer** | Pixel-perfect handoff specs, interaction rules, edge case handling, test cases |

---

## Execution Order (MANDATORY — do not skip or reorder)

```
Phase 0: Lead Designer    → Clarification Workshop (MUST complete before any design)
Phase 1: UX Architect     → User Flow + Wireframe
Phase 2: Visual Designer  → UI Spec + States
Phase 3: Dev/QA Spec Writer → Handoff + Test Cases
Phase 4: Lead Designer    → Cross-check review + Final Report
[Optional] Phase 5: Figma Push — only after user confirms the report
```

---

## Phase 0 — Lead Designer: Clarification Workshop

**Run this phase yourself (as Lead). Do not delegate.**

Ask the user structured questions across three perspectives. If answers are already in context, extract them — do not re-ask.

### Questions to resolve

**PO / Business:**
- What problem does this feature solve?
- Who is the primary user?
- What is the success metric (KPI)?
- What is in V1 vs deferred to V2+?

**BA / Logic:**
- What are the core user flows (happy path)?
- What are the key business rules and validations?
- What are the edge cases and failure states?

**Designer / UX:**
- Are there existing design patterns or a design system to follow?
- Any known pain points from the current flow?
- Any competitor or reference screens to consider?

### Phase 0 Output — Alignment Summary

Produce this block before proceeding:

```
## Alignment Summary
Project:            [name]
Feature:            [feature name]
Business Goal:      [1 sentence]
Primary User:       [who]
Success Metric:     [KPI]
Core Flow:          [numbered happy path steps]
Key Rules:          [list]
Edge Cases:         [list]
V1 Scope:           [what's in]
V2 Deferred:        [what's out]
Design System:      [Figma file, existing patterns, or "none"]
```

> If Alignment Summary is incomplete → STOP. Clarify before proceeding.

---

## Phase 1 — UX Architect

Produce the following in order.

### 1.1 — User Persona (brief)

```
User:           [role/type]
Goal:           [what they want to accomplish]
Pain Points:    [what frustrates them today]
Device Context: [mobile / desktop / both]
```

### 1.2 — User Flow

Numbered steps with decision branches:

```
1. [Entry point / trigger]
2. [Action]
   → [Condition A] → [outcome]
   → [Condition B] → [outcome]
3. [Next action]
N. [Terminal state: success / error / exit]
```

Mark every decision node, error branch, and exit point explicitly.

### 1.3 — Information Architecture

```
Screen Tree:
├── [Screen A] — [purpose]
│   ├── [Sub-screen A1]
│   └── [Sub-screen A2]
└── [Screen B] — [purpose]
```

### 1.4 — Wireframe Structure (per screen)

```
Screen: [Name]
User goal: [what they're trying to do]
──────────────────────────────────────
HEADER:       [title / nav]
MAIN CONTENT:
  Zone 1:     [what goes here and why]
  Zone 2:     [what goes here and why]
ACTIONS:      [primary CTA] | [secondary action]
──────────────────────────────────────
Notes: [layout decisions or constraints]
```

### 1.5 — Flow Validation

- [ ] Can the number of steps be reduced?
- [ ] Are there confusion points needing tooltip or helper text?
- [ ] Are all error paths accounted for?
- [ ] Does the flow match the business rules from Phase 0?

---

## Phase 2 — Visual Designer

### 2.1 — Design Token Reference

Pull from the project's design system if specified in Phase 0. Otherwise define:

```
Colors:
  Primary:      [hex or token]
  Secondary:    [hex or token]
  Surface:      [hex or token]
  Error:        [hex or token]
  Success:      [hex or token]
  Text Primary: [hex or token]

Typography:
  H1:     [size / weight / line-height]
  H2:     [size / weight / line-height]
  Body:   [size / weight / line-height]
  Caption:[size / weight / line-height]

Spacing scale:  [e.g. 4 / 8 / 12 / 16 / 24 / 32 / 48px]
Border radius:  [e.g. 4 / 8 / 12px / full]
```

> For Paave projects: reference library "Paave (Copy-Loan)".
> Available styles: Main Color, Blue New Color, Red Color Logo, Second Colors Logo.
> File key: TJyxulK0P8ne65hCdURmcE

### 2.2 — Component Inventory (per screen)

```
Screen: [Name]
Components:
  - [ComponentName]: [purpose, variant if applicable]
  - [ComponentName]: [purpose]
```

### 2.3 — State Matrix (per interactive component)

| Component | Default | Hover | Focus | Loading | Success | Error | Disabled | Empty |
|---|---|---|---|---|---|---|---|---|
| [name] | [spec] | [spec] | [spec] | [spec] | [spec] | [spec] | [spec] | [spec] |

Specify color, behavior, and copy for each applicable cell.

### 2.4 — Responsive / Platform Rules

```
Mobile:     [layout decisions]
Desktop:    [layout decisions]
Breakpoint: [px value]
```

### 2.5 — Micro-interaction Notes

```
Trigger → Animation → Duration → Purpose
```

---

## Phase 3 — Dev/QA Spec Writer

### 3.1 — Component Spec Sheet (per component)

```
Component: [Name]
──────────────────────────────────
Size:         [width × height or responsive rule]
Padding:      [top right bottom left — px]
Margin:       [px]
Font:         [size / weight / color token]
Background:   [color token]
Border:       [width / radius / color]
Shadow:       [if applicable]
──────────────────────────────────
Behavior:
  On click:   [action]
  On hover:   [visual change]
  Disabled:   [condition + visual]
──────────────────────────────────
Copy:
  Label:        "[exact text]"
  Placeholder:  "[exact text]"
  Error msg:    "[exact text]"
  Empty state:  "[exact text]"
```

### 3.2 — Interaction Rules

Format: `[Trigger] → [System Response]`

```
User taps [Button] with valid input   → [action]
User taps [Button] with empty field   → show error "[message]"
User taps [Button] while loading      → button disabled, spinner shown
Network timeout                       → toast "[message]", retry option
```

List all interactions including all edge cases from Phase 0.

### 3.3 — Edge Case UI Handling

```
Edge Case:      [description]
User sees:      [exact UI response]
System does:    [action]
Recovery path:  [how user continues]
```

### 3.4 — QA Test Cases

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| 1 | Happy path | [steps] | [expected] |
| 2 | Empty state | [steps] | [expected] |
| 3 | Error state | [steps] | [expected] |
| 4 | Loading state | [steps] | [expected] |
| 5 | [Edge case from Phase 0] | [steps] | [expected] |

Minimum 5 test cases per screen. At least one test per state in the state matrix.

---

## Phase 4 — Lead Designer: Review & Final Report

**Run this phase yourself (as Lead). Do not delegate.**

### Review Checklist

Alignment:
- [ ] UX flow matches business rules from Phase 0
- [ ] All screens in the IA appear in wireframes
- [ ] All Phase 0 edge cases handled in Phase 3

Completeness:
- [ ] Every screen has: wireframe + component list + state matrix + dev spec
- [ ] All interactive components have all relevant states defined
- [ ] All copy is specified (labels, errors, empty states, placeholders)

Quality:
- [ ] Can a developer build this without follow-up questions?
- [ ] Can a QA engineer test this without guessing?
- [ ] Does the design solve the business goal from Phase 0?

### Final Delivery Structure

```
# [Project] — [Feature] Design Spec
Version: 1.0 | Date: [date]

## Executive Summary
## 1. Alignment Summary
## 2. User Flow
## 3. Screen Wireframes
## 4. UI Specifications
## 5. Dev Handoff Specs
## 6. QA Test Cases
## 7. Open Questions / Risks
```

After delivering the report, ask:
> "Would you like me to push the UX flow and wireframes to your Figma file?"

---

## Phase 5 — Figma Push (Optional — on explicit user confirmation only)

### What gets created in Figma

**Page 1: `[Feature] — UX Flow`**
- One frame per screen
- Connectors showing decision branches (use `figma.createConnector()`)
- Labels with screen names and flow conditions

**Page 2: `[Feature] — UI Spec`**
- One annotated frame per screen
- Colored rectangles for layout zones
- Text annotations for components, spacing, and states

### Figma Push — Step by Step

1. Extract fileKey from user's Figma URL (default Paave: `TJyxulK0P8ne65hCdURmcE`)
2. Use `Figma:use_figma` to create new pages and frames
3. Load font before creating any text: `await figma.loadFontAsync({ family: "Inter", style: "Regular" })`
4. Set current page with: `await figma.setCurrentPageAsync(page)`
5. After all frames created, return the Figma file URL to the user

### Figma frame creation template

```javascript
// Create UX Flow page
const flowPage = figma.createPage();
flowPage.name = "FEATURE_NAME — UX Flow";
await figma.setCurrentPageAsync(flowPage);

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

const screenNames = ["Screen1", "Screen2", "Screen3"]; // from Phase 1 IA
let x = 0;
for (const name of screenNames) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(375, 812);
  frame.x = x;
  frame.y = 0;
  frame.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.99 } }];
  
  const label = figma.createText();
  label.characters = name;
  label.fontSize = 16;
  label.fontName = { family: "Inter", style: "Semi Bold" };
  label.x = 16;
  label.y = 16;
  frame.appendChild(label);
  
  x += 415; // 375 frame + 40 gap
}
```

---

## Anti-Pattern Rules

- Never skip Phase 0, even for "quick" or "simple" requests
- Never generate UI before Alignment Summary is complete
- Never omit error/empty states from the state matrix
- Never deliver a spec where a dev must ask "what happens when X?"
- Never push to Figma without explicit user confirmation
- Never assume V2 features are in scope without PO confirmation
- Never run Phase 5 inline with Phase 4 — always pause and confirm

---

## Phase Sequence (Quick Reference)

```
User request
    │
    ▼
[Phase 0] Lead — Clarification → Alignment Summary
    │
    ▼
[Phase 1] UX Architect — Flow + Wireframe
    │
    ▼
[Phase 2] Visual Designer — UI Spec + States
    │
    ▼
[Phase 3] Dev/QA Spec Writer — Handoff + Test Cases
    │
    ▼
[Phase 4] Lead — Review + Final Report
    │
    └── (user confirms?) ──▶ [Phase 5] Figma Push
```
