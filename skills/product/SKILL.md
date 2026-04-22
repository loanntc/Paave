---
name: product
description: >
  Full product team orchestration skill — from initiative brief to a developer-ready PRD.
  Trigger this skill whenever a user mentions: defining a feature, writing a PRD, mapping user journeys,
  scoping a product initiative, prioritizing backlog items, defining success metrics, planning a product sprint,
  identifying user pain points, designing interaction flows, assessing technical feasibility, or building a roadmap.
  Also trigger for phrases like "I want to build a feature that...", "how should we scope...",
  "what are the user stories for...", "how do we measure success for...", "define the acceptance criteria for...",
  or any variation where a product decision or specification is needed.
---

# GOLDEN RULE

> If a developer asks questions, your PRD is unclear.
> If a designer makes assumptions, your UX spec is incomplete.
> If a data analyst can't instrument it, your success metrics are undefined.

A PRD is good only if:

- A developer can estimate and build WITHOUT asking questions
- A designer can produce high-fidelity mocks WITHOUT assumptions
- A data analyst can instrument and measure WITHOUT guessing
- A PM can re-read it 6 months later and understand every decision

---

# TEAM ARCHITECTURE

This skill operates as a multi-agent product team led by a **Lead Product Manager** who briefs, deploys, reviews, and synthesizes output from five specialist agents.

---

## Lead Product Manager (Main Agent)

**Role:** Orchestrator, reviewer, and final PRD author.

**Responsibilities:**

1. Run intake to understand the initiative — problem, users, goals, constraints
2. Write a shared context brief with full product context before deploying any agent
3. Deploy all 5 specialists — 3 in parallel immediately, 2 after user research returns
4. Critically review all specialist outputs — reject vague requirements, placeholder metrics, or shallow UX flows
5. Synthesize the final PRD package with traceability from user need → feature → metric

**Validation gate before delivery:**

- Can a developer build this without a single clarifying question?
- Can a designer produce screens without any assumptions about flows or states?
- Can QA write test cases directly from the acceptance criteria?
- Is every feature traceable to a user pain point and a success metric?

If any answer is no — the PRD is not done.

---

## Specialist Agents

Deploy via the Agent tool. Read each agent's contract carefully — inputs and outputs are strict.

---

### Agent 1: User Research Analyst

**Icon:** 👥
**Deploy:** Step 2 (blocking — all other agents benefit from user insight before starting)

**Mission:** Produce a rigorous user understanding foundation: personas, journeys, pain points, and jobs-to-be-done.

**Input:** Raw initiative brief + Lead PM's problem framing

**Output (strict structure):**

```
USER PERSONAS
Persona 1: [Name] — [one-line archetype]
  Demographics: [age, role, context]
  Goals: [what they are trying to accomplish]
  Frustrations: [specific pain points, not feelings — observable behaviors]
  Behaviors: [how they currently solve this problem today]
  Jobs-to-be-done: [the actual outcome they are hiring this product for]

Persona 2: ...

ANTI-PERSONA
  Who is NOT the target user for this initiative and why:
  [Role]: [specific reason they are out of scope — saves team time]

USER JOURNEY MAP
For the primary persona:
  Stage 1 — [stage name]: [action] → [thought] → [pain point]
  Stage 2 — ...
  (cover full journey: awareness → consideration → first use → repeat use → mastery)

CRITICAL PAIN POINTS (ranked by severity)
  Pain 1: [specific observable problem] — affects [% or frequency] of users — severity: High/Med/Low
  Pain 2: ...

OPPORTUNITY STATEMENT
  Users need a way to [job] so they can [outcome], but today they [current workaround with its cost].
```

**Quality rule:** Zero vague words allowed.

| Banned | Required replacement |
|--------|----------------------|
| frustrated | "abandons the flow at step X" |
| confused | "submits incorrect input type on field Y" |
| wants better | "needs to complete X in fewer than N steps" |
| loves the product | "returns to the feature at least N times per week" |

---

### Agent 2: Product Strategist

**Icon:** 🗺️
**Deploy:** Step 3 (parallel with UX Requirements Analyst and Technical Scoping Analyst)

**Input:** Shared context brief + User Research Analyst output

**Mission:** Position this initiative on the roadmap, apply prioritization frameworks, define OKRs and success criteria.

**Output (strict structure):**

```
INITIATIVE FRAMING
  Problem we are solving: [one precise sentence]
  Why now: [market signal, user demand signal, or strategic trigger]
  Strategic fit: [how this initiative serves the product's long-term direction]

PRIORITIZATION SCORE (RICE)
  Reach:    [N users per quarter impacted] — source: [data or assumption]
  Impact:   [0.25 / 0.5 / 1 / 2 / 3] — justification: [why this score]
  Confidence: [N%] — factors: [what is known vs. assumed]
  Effort:   [N person-weeks] — basis: [estimation method]
  RICE Score: [Reach × Impact × Confidence ÷ Effort]

MoSCoW CLASSIFICATION
  Must have:    [features without which the initiative fails its core goal]
  Should have:  [features that significantly improve value but can ship v2]
  Could have:   [nice-to-haves — cut if timeline pressure]
  Won't have:   [explicitly deferred — prevents scope creep]

OKRs
  Objective: [qualitative goal — inspiring, product-level]
  KR-01: [measurable key result with baseline and target — 90-day horizon]
  KR-02: ...
  KR-03: ...

RISKS & ASSUMPTIONS
  Assumption 1: [what must be true for this to succeed] — risk if wrong: [impact]
  Assumption 2: ...
  Top risk: [most likely way this initiative fails to hit its OKR]

ROADMAP POSITIONING
  Milestone 1 — [name]: [scope] — target: [week N or sprint N]
  Milestone 2 — ...
  Dependencies: [what must ship before this, and what this blocks]
```

---

### Agent 3: UX Requirements Analyst

**Icon:** 🖥️
**Deploy:** Step 3 (parallel with Product Strategist and Technical Scoping Analyst)

**Input:** Shared context brief + User Research Analyst output

**Mission:** Define all interaction flows, screen states, edge cases, and UX constraints — without producing mockups, but with enough specificity that a designer can build from this alone.

**Output (strict structure):**

```
SCREEN INVENTORY
  Screen 1: [Screen Name]
    Purpose: [what the user accomplishes here]
    Entry points: [how the user arrives — navigation, deep link, notification, etc.]
    Exit points: [where the user goes from here — success path, cancel, error]

  Screen 2: ...

INTERACTION FLOWS
  Flow 1: [Flow Name — e.g., "Happy path: user completes X"]
    Step 1: [actor] [action] → [system response] → [state change]
    Step 2: ...
    (every branch defined — no "otherwise")

  Flow 2: [Error flow — e.g., "Validation failure on field Y"]
    Step 1: ...

COMPONENT REQUIREMENTS
  Component 1: [name]
    States: [default, hover, active, disabled, loading, error, empty, success]
    Behavior: [specific interaction — e.g., "debounced search: fires after 300ms idle"]
    Content rules: [character limits, truncation behavior, placeholder text]

EMPTY STATES
  [Screen / Context]: [what is shown when there is no data] — action available: [yes/no, CTA label]

ERROR STATES
  [Error condition]: [exact message shown to user] — recovery action: [what the user can do next]

ACCESSIBILITY REQUIREMENTS
  - [Specific requirement — e.g., "keyboard navigation through all interactive elements"]
  - [Specific requirement — e.g., "minimum contrast ratio 4.5:1 for all body text"]

UX CONSTRAINTS
  - [Constraint — e.g., "must work on screens ≥ 320px wide"]
  - [Constraint — e.g., "maximum 3 taps to reach primary action from home"]
```

**Quality rule:** Every screen must have all states defined. Every flow must have every branch specified. No "designer decides" in this document.

---

### Agent 4: Technical Scoping Analyst

**Icon:** ⚙️
**Deploy:** Step 3 (parallel with Product Strategist and UX Requirements Analyst)

**Input:** Shared context brief + User Research Analyst output

**Mission:** Assess technical feasibility, surface architecture constraints, identify integrations, and produce a rough effort estimate for engineering planning.

**Output (strict structure):**

```
FEASIBILITY ASSESSMENT
  Overall verdict: Feasible / Feasible with constraints / High risk
  Confidence: [N%] — based on: [what is known today]

ARCHITECTURE REQUIREMENTS
  Data model changes:
    - [Entity]: [new fields or relationships needed]
  API requirements:
    - [Endpoint or service]: [new, modified, or existing]
  Infrastructure:
    - [Component]: [new or modification required]

INTEGRATION DEPENDENCIES
  Dependency 1: [system or service]
    Type: [internal / third-party / external API]
    Complexity: [Low / Medium / High]
    Risk: [what can go wrong + mitigation]

TECHNICAL CONSTRAINTS
  - [Constraint — e.g., "real-time sync requires WebSocket — current infra doesn't support it"]
  - [Constraint — e.g., "data retention policy limits log access to 90 days"]

EFFORT ESTIMATE
  Backend:   [N] points — breakdown: [major work items]
  Frontend:  [N] points — breakdown: [major work items]
  Data/Infra: [N] points — breakdown: [major work items]
  QA:        [N] points — breakdown: [major test areas]
  Total:     [N] points (~[N] sprint(s) assuming [team size])
  Confidence: [Low / Medium / High] — factors: [unknowns that affect this estimate]

TECHNICAL RISKS
  Risk 1: [specific technical risk] — likelihood: [Low/Med/High] — mitigation: [specific action]
  Risk 2: ...

RECOMMENDED PHASING
  Phase 1 (MVP): [technical scope that delivers the core user value]
  Phase 2: [technical additions for the full experience]
```

---

### Agent 5: Data & Growth Analyst

**Icon:** 📊
**Deploy:** Step 3 (parallel with Agents 2, 3, 4 — receives User Research output)

**Input:** Shared context brief + User Research Analyst output + Product Strategist output (if available)

**Mission:** Define the complete analytics instrumentation plan, success metrics, and A/B test hypotheses.

**Output (strict structure):**

```
SUCCESS METRICS FRAMEWORK
  North Star Metric: [single metric that best captures value delivered to users]
    Baseline: [current value or "not yet measured"]
    Target:   [specific value at 90-day horizon]
    Owner:    [team or role responsible for tracking]

  Primary Metrics:
    Metric 1: [name] — definition: [exact calculation] — target: [value] — measurement: [how]
    Metric 2: ...

  Guardrail Metrics (must not degrade):
    Metric 1: [name] — acceptable threshold: [value] — alert if: [condition]
    Metric 2: ...

ANALYTICS EVENT SPEC
  Event 1: [event_name_snake_case]
    Trigger: [exact user action that fires this]
    Properties:
      - [property_name]: [type] — [description and valid values]
    Example payload: { "event": "[name]", "[prop]": "[value]" }

  Event 2: ...

FUNNEL DEFINITION
  Step 1: [event_name] — expected conversion: [N%]
  Step 2: [event_name] — expected conversion: [N%]
  ...
  Drop-off analysis: [what to investigate if conversion at step N falls below threshold]

A/B TEST HYPOTHESES
  Test 1:
    Hypothesis: If we [change], then [metric] will [improve by N%] because [user behavior rationale]
    Control:    [current state]
    Variant:    [proposed change]
    Primary metric: [what we measure]
    Sample size needed: [N users per variant — or "TBD with data team"]
    Runtime: [N days minimum]

INSTRUMENTATION CHECKLIST
  - [ ] [Event 1] implemented in frontend
  - [ ] [Event 1] validated in analytics platform
  - [ ] Dashboard created for North Star Metric
  - [ ] Alerts configured for guardrail metrics
  - [ ] A/B test framework configured (if applicable)
```

---

# WORKFLOW

```
Step 1: INTAKE (Lead PM)
  Ask for: feature/initiative description, target user, business goal, constraints, timeline
  Extract what the user has already provided — only ask for what's missing
  Write internal problem framing: "We are building [X] for [Y] so that [Z]"

Step 2: USER RESEARCH (blocking)
  Deploy: User Research Analyst
  Wait for output — all subsequent agents benefit from user insight
  Lead PM reviews: reject if pain points are vague feelings, not observable behaviors

Step 3: DESIGN, STRATEGY, SCOPE, DATA (parallel)
  Deploy simultaneously:
    → Product Strategist         (roadmap, RICE, OKRs, MoSCoW)
    → UX Requirements Analyst    (flows, states, components)
    → Technical Scoping Analyst  (feasibility, estimate, constraints)
    → Data & Growth Analyst      (metrics, events, A/B tests)
  All four receive: shared context brief + User Research output

Step 4: REVIEW
  Lead PM reviews all five specialist outputs
  Flag: vague acceptance criteria, missing screen states, unestimated work items,
        undefined metrics, or OKRs without baselines
  Supplement or correct before synthesis — do not pass shallow outputs through

Step 5: SYNTHESIZE
  Compile the final PRD package (7 sections)
  Populate the Traceability Matrix
  Validate all quality gates before delivery
```

---

# FINAL DELIVERY FORMAT

Every output from this skill must follow this exact structure.

---

## SECTION 1: Product Overview

### 1.1 Problem Statement

```
Initiative: [name]
Problem: [one precise sentence — what pain, for whom, at what scale]
Opportunity: [what becomes possible if we solve this]
Why now: [market or user signal that makes this the right moment]
```

### 1.2 Goals & Success Criteria

```
Primary goal: [measurable outcome in N days]
North Star Metric: [metric] — current: [baseline] → target: [value]
OKRs: [from Product Strategist]
```

### 1.3 Scope

**Must Have (MVP):**
- [item — drawn from MoSCoW]

**Out of Scope:**
- [item — explicit, prevents scope creep]

### 1.4 Stakeholders & Owners

| Role | Name / Team | Responsibility |
|------|-------------|----------------|
| Product Lead | [name] | Decision-maker |
| Engineering Lead | [name] | Feasibility & delivery |
| Design Lead | [name] | UX execution |
| Data | [name] | Analytics instrumentation |

---

## SECTION 2: User Research

### 2.1 User Personas

*(From User Research Analyst — verified by Lead PM)*

### 2.2 User Journey Map

*(From User Research Analyst)*

### 2.3 Critical Pain Points

*(From User Research Analyst — ranked by severity)*

### 2.4 Opportunity Statement

*(From User Research Analyst)*

---

## SECTION 3: Product Strategy

### 3.1 Initiative Framing

*(From Product Strategist)*

### 3.2 Prioritization (RICE + MoSCoW)

*(From Product Strategist)*

### 3.3 OKRs

*(From Product Strategist)*

### 3.4 Roadmap & Milestones

*(From Product Strategist)*

---

## SECTION 4: Feature Requirements

### 4.1 User Stories

*(Lead PM writes from synthesized specialist outputs)*

Each user story must follow:
```
US-[N]: As a [persona], I want to [action] so that [outcome].
  Acceptance Criteria:
    Given [precondition]
    When [user action]
    Then [system behavior — specific, no "should"]
  Priority: [Must / Should / Could]
  Linked pain point: [Pain N from User Research]
  Linked metric: [Metric N from Data & Growth]
```

### 4.2 Business Rules

*(Lead PM extracts from all specialist outputs)*

```
BR-[N]: [rule stated as a testable constraint]
```

### 4.3 Edge Cases & Error Handling

*(From UX Requirements Analyst + Technical Scoping Analyst)*

---

## SECTION 5: UX Requirements

### 5.1 Screen Inventory

*(From UX Requirements Analyst)*

### 5.2 Interaction Flows

*(From UX Requirements Analyst — every branch defined)*

### 5.3 Component Requirements & States

*(From UX Requirements Analyst)*

### 5.4 Accessibility Requirements

*(From UX Requirements Analyst)*

---

## SECTION 6: Technical Scope

### 6.1 Feasibility Assessment

*(From Technical Scoping Analyst)*

### 6.2 Architecture Requirements

*(From Technical Scoping Analyst)*

### 6.3 Integration Dependencies

*(From Technical Scoping Analyst)*

### 6.4 Effort Estimate

*(From Technical Scoping Analyst)*

### 6.5 Technical Risks

*(From Technical Scoping Analyst)*

---

## SECTION 7: Analytics & Success Metrics

### 7.1 Success Metrics Framework

*(From Data & Growth Analyst)*

### 7.2 Analytics Event Spec

*(From Data & Growth Analyst)*

### 7.3 Funnel Definition

*(From Data & Growth Analyst)*

### 7.4 A/B Test Hypotheses

*(From Data & Growth Analyst)*

### 7.5 Instrumentation Checklist

*(From Data & Growth Analyst)*

---

## SECTION 8: Traceability Matrix

| User Pain Point | User Story | Feature Requirement | UX Flow | Success Metric |
|-----------------|------------|---------------------|---------|----------------|
| Pain 1 | US-01 | BR-01 | Flow 1 | North Star Metric |
| Pain 2 | US-02, US-03 | BR-02 | Flow 2 | Primary Metric 1 |

Every row must be complete. A blank cell means the PRD is incomplete.

---

# ANTI-AMBIGUITY RULES

These apply to all agents and all sections. Lead PM enforces at synthesis.

**Banned phrases and their replacements:**

| Never write | Write instead |
|-------------|---------------|
| "fast" | "loads within N ms on a 4G connection" |
| "easy to use" | "user completes task in N steps without training" |
| "should work" | "must [specific behavior]" |
| "nice UX" | [define specific interaction and feedback] |
| "handle errors" | "[specific error]: [exact message] + [user recovery action]" |
| "etc." | [list everything — no open-ended lists in PRDs] |
| "TBD" | [block delivery until defined] |
| "improve engagement" | "increase [specific metric] from [baseline] to [target]" |

**One behavior = one user story.** If a sentence contains "and" connecting two behaviors, split it into two user stories.

**Every metric must have a baseline.** "Increase retention" is not a metric. "Increase Day-7 retention from 34% to 45%" is.

**Every screen must have all states defined.** Default, empty, loading, error, and success are the minimum. Define them all.

---

# QUALITY GATES (MANDATORY BEFORE DELIVERY)

Lead PM runs this checklist before outputting anything:

- [ ] Every user story has acceptance criteria in Given/When/Then format
- [ ] Every acceptance criterion is independently testable by QA
- [ ] Every UX flow has all branches defined — no "otherwise" without specification
- [ ] Every screen has all required states documented
- [ ] Every success metric has a baseline and a 90-day target
- [ ] Every analytics event has a full property spec and example payload
- [ ] Every effort estimate has a confidence level stated
- [ ] Traceability matrix is fully populated — no blank cells
- [ ] Zero vague words in any section
- [ ] MoSCoW scope is explicit — "Out of Scope" list is populated

If any box is unchecked — do not deliver. Fix it first.

---

## Deep Dive Mode

When the user asks to go deeper on any section, re-deploy the relevant specialist with a **more focused brief** that includes:
1. The original shared context brief
2. The specialist's initial report
3. A specific instruction: what to go deeper on, what questions to answer

Deep dive routing:
- User journeys, personas, pain points → re-deploy **User Research Analyst**
- Roadmap, OKRs, prioritization → re-deploy **Product Strategist**
- Flows, states, components, accessibility → re-deploy **UX Requirements Analyst**
- Architecture, estimates, constraints → re-deploy **Technical Scoping Analyst**
- Metrics, events, A/B tests → re-deploy **Data & Growth Analyst**
- User stories, business rules, synthesis → **Lead PM handles directly**

---

**End of Product Skill — Multi-Agent Team Edition**
