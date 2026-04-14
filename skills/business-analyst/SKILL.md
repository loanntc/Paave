---
name: business-analyst
description: "produce BRD, FRD, SRD that are unambiguous, testable, and developer-ready"
---


# 🧠 1. GOLDEN RULE OF DOCUMENTATION

A document is **good** only if:

* A **developer can build WITHOUT asking questions**
* A **QA can test WITHOUT assumptions**
* Another **BA/AI can extend WITHOUT confusion**

---

# 🧾 2. BRD – BUSINESS REQUIREMENT DOCUMENT (HOW TO CREATE)

## 🎯 Objective of BRD

Define **WHY we build this** and **WHAT success looks like**.

---

## 📐 BRD STRUCTURE (STRICT TEMPLATE)

### 1. Problem Statement

```
Current situation:
- Ops team exports reports manually
- Takes ~2 hours/day

Problem:
- Time-consuming
- Error-prone
```

---

### 2. Business Objectives

```
- Reduce report generation time from 2 hours → <10 minutes
- Reduce manual errors by 90%
```

---

### 3. KPIs (MANDATORY)

```
- Processing time <10 minutes
- Error rate <2%
```

---

### 4. Scope

#### In Scope

* File upload
* Data validation
* Report generation

#### Out of Scope

* Data editing UI
* Historical analytics

---

### 5. Stakeholders

* Ops team
* Product owner
* Tech team

---

## ❗ BRD QUALITY RULES

* No technical details
* No vague words ("fast", "easy")
* Must include measurable outcomes

---

# 📘 3. FRD – FUNCTIONAL REQUIREMENT DOCUMENT (HOW TO CREATE)

## 🎯 Objective of FRD

Define **WHAT the system does from user perspective**.

---

## 📐 FRD STRUCTURE (STRICT TEMPLATE)

## 3.1 Feature Overview

```
Feature: Customer Data Import
Actor: Admin
Goal: Upload file to import customers
```

---

## 3.2 Functional Requirements (NUMBERED)

### FR-01 Upload File

* Actor: Admin
* Description: Upload CSV/XLSX file
* Input:

  * File type: CSV, XLSX
  * Max size: 10MB
* Output:

  * File accepted/rejected

---

### FR-02 Validate File

* Required columns: name, email
* Email format must be valid
* No duplicate emails

---

### FR-03 Process Data

* Insert valid records
* Skip invalid rows

---

### FR-04 Display Result

* Total records
* Success count
* Failed count

---

## 3.3 Business Rules (SEPARATE SECTION)

* BR-01: Email must be unique
* BR-02: File size ≤10MB
* BR-03: Required fields cannot be empty

---

## 3.4 Acceptance Criteria (MANDATORY)

```
Given valid file
When upload completes
Then system shows success summary
```

```
Given file >10MB
When upload attempted
Then system rejects file
```

---

## 3.5 Edge Cases (MANDATORY SECTION)

* Empty file
* Missing columns
* Duplicate rows
* System timeout

---

## ❗ FRD QUALITY RULES

* Each requirement must be **testable**
* No combined logic (split clearly)
* No hidden assumptions

---

# ⚙️ 4. SRD – SYSTEM REQUIREMENT DOCUMENT (HOW TO CREATE)

## 🎯 Objective of SRD

Define **HOW system behaves internally (logic + data + integration)**

---

## 📐 SRD STRUCTURE (STRICT TEMPLATE)

## 4.1 System Flow (STEP BY STEP)

```
1. User uploads file
2. System stores file temporarily
3. System validates structure
4. System processes rows
5. System stores valid data
6. System returns result
```

---

## 4.2 Data Handling Rules

* File stored in temp storage (24h)
* Max rows: 10,000
* Encoding: UTF-8

---

## 4.3 Validation Logic (DETAILED)

| Field | Rule             | Error Message |
| ----- | ---------------- | ------------- |
| email | must match regex | Invalid email |
| name  | not empty        | Name required |

---

## 4.4 API Contract

### Endpoint

```
POST /api/v1/customers/import
```

### Response

```
{
  "total": number,
  "success": number,
  "failed": number
}
```

---

## 4.5 Error Handling Logic

* If validation fails → stop processing
* If partial failure → return mixed result
* If system error → rollback all

---

## ❗ SRD QUALITY RULES

* Must remove ALL ambiguity
* Must define system behavior clearly
* Must align with FRD

---

# 🔄 5. HOW TO MAKE DOCUMENTS CLEAR (CRITICAL SKILL)

## 5.1 Anti-Ambiguity Rules

❌ Bad:
"System should be fast"

✅ Good:
"System processes 100 records within 5 seconds"

---

## 5.2 One Logic = One Requirement

❌ Bad:
"Validate file and show result"

✅ Good:

* FR-02 Validate file
* FR-04 Show result

---

## 5.3 Define EVERYTHING explicitly

* Limits (size, number)
* Formats (CSV, JSON)
* Conditions (valid/invalid)

---

# 🤖 6. HOW AI SHOULD INTERPRET & GENERATE DOCS

## Step-by-step behavior

1. Extract business goal → create BRD
2. Break into features → create FRD
3. Translate into logic → create SRD
4. Add test scenarios automatically

---

## AI Validation Questions (MANDATORY)

* Can dev implement without guessing?
* Can QA write test cases directly?
* Are edge cases listed?
* Are rules measurable?

---

# 🧪 7. FULL TRACEABILITY (VERY IMPORTANT)

Every item must link:

* BRD Goal → FRD Feature → SRD Logic → Test Case

### Example

* BRD: Reduce time
* FRD: Upload file
* SRD: Process 10k rows
* Test: Upload 10k rows under 5s

---

# 🎁 8. FINAL DELIVERY STANDARD

A Senior BA output MUST include:

* BRD (WHY)
* FRD (WHAT)
* SRD (HOW)
* Acceptance Criteria
* Edge Cases
* Test Scenarios

---

# 🧠 FINAL PRINCIPLE

> If a developer asks questions, your doc is unclear.
> If QA guesses behavior, your doc is incomplete.

---

**End of Execution-Level Training Guide**
