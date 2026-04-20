---
name: engineering-handbook
description: >
  Engineering standards, practices, and culture for this team. Consult this skill whenever
  an engineer asks about: how to write or structure code, PR best practices, code review
  (as author or reviewer), testing strategy, CI/CD pipeline, error handling, database
  operations, async patterns, security practices, logging/observability, working with AI
  coding tools, what is or isn't a non-negotiable, how to handle a production incident,
  or any question about engineering role expectations. Also trigger for questions like
  "is this PR ready?", "how should I review this?", "what's the right way to handle X?",
  "what does our team expect from engineers?", or "how do we do X here?". If it sounds
  like an engineer asking for guidance — use this skill.
---

## Table of Contents

1. [The Mindset Before the Code](#1-the-mindset-before-the-code)
2. [Providing a Technical Solution](#2-providing-a-technical-solution)
3. [Writing the Code](#3-writing-the-code)
4. [Handling Significant Technical Cases](#4-handling-significant-technical-cases)
5. [Unit Testing — How We Write and Run Them](#5-unit-testing--how-we-write-and-run-them)
6. [CI/CD — Automated Quality Gates](#6-cicd--automated-quality-gates)
7. [Self-Review Checklist Before Every PR](#7-self-review-checklist-before-every-pr)
8. [Non-Negotiables vs Flexible Zones](#8-non-negotiables-vs-flexible-zones)
9. [Code Review — As the Reviewer](#9-code-review--as-the-reviewer)
10. [Observability & Logging Standards](#10-observability--logging-standards)
11. [Security Baseline](#11-security-baseline)
12. [Working with AI Coding Tools](#12-working-with-ai-coding-tools)

---

## 1. The Mindset Before the Code

Before you write a single line, ask these questions. Not as a ritual — as a genuine filter.

```
❓ Do I actually understand the problem, or just the symptom?
❓ Is there an existing solution I can extend instead of build?
❓ What does "done" look like — and who agrees on that definition?
❓ What are the top 3 things that could go wrong in production?
```

**The goal of a technical solution is not to write code. It is to solve a problem in a way the team can maintain and evolve.**

If you can solve it with less code, do that. If you can solve it without code, do that.

---

## 2. Providing a Technical Solution

When you're asked to implement something — a feature, a fix, a refactor — follow this sequence every time.

### Step 1 — Understand Before Designing

- Read the ticket. Then read the linked tickets.
- Talk to the requester if the *why* is not clear.
- Identify: Is this a data problem? A logic problem? An infrastructure problem? An integration problem?

### Step 2 — Design Before Coding

For anything that takes more than half a day, write a **mini design doc** (even just in your PR description):

```markdown
## What problem are we solving?
One paragraph. No jargon.

## Approach chosen
What we're doing and why this over alternatives.

## Alternatives considered
What we ruled out and why (be honest — "it was simpler" is valid).

## Known risks / open questions
What could go wrong. What we're not sure about yet.

## How we'll know it's working
Observable success criteria — logs, metrics, test coverage, manual verification.
```

This takes 15 minutes. It saves hours of review back-and-forth.

### Step 3 — Slice the Work

Break implementation into the smallest independently deployable pieces.

**Bad:** One PR that adds auth, updates DB schema, modifies 3 services, and adds frontend.

**Good:**
- PR 1: DB migration only
- PR 2: Backend endpoint + unit tests
- PR 3: Frontend integration
- PR 4: Auth guard

Each PR should pass all tests, be deployable independently, and be reviewable in under 20 minutes.

### Step 4 — Code

Write the code. See Section 3.

### Step 5 — Self-Review

Before pushing, review your own code. See Section 7.

### Step 6 — PR + Handoff

Your PR description is part of the solution. Template:

```markdown
## Summary
What this PR does in 2–3 sentences.

## Changes
- File A: reason
- File B: reason

## How to test
Step-by-step instructions for the reviewer to verify this works.

## Screenshots / output (if applicable)

## Checklist
- [ ] Tests added/updated
- [ ] No console.log / debug statements
- [ ] Self-reviewed
- [ ] Docs updated if behaviour changed
```

---

## 3. Writing the Code

### Naming

```python
# ❌ Bad
def proc(d, f):
    ...

# ✅ Good
def calculate_order_discount(order: Order, flag: PromotionFlag) -> Decimal:
    ...
```

Names must communicate **intent**. If you need a comment to explain a variable name, rename the variable.

### Functions

- One function, one responsibility.
- If a function needs "and" to be described, split it.
- Aim for functions under 30 lines. If it's longer, ask why.
- Pure functions (no side effects) wherever possible.

```typescript
// ❌ Bad: does too much
function processUser(userId: string) {
  const user = db.find(userId);         // IO
  user.lastLogin = new Date();           // mutation
  sendWelcomeEmail(user.email);          // side effect
  db.save(user);                         // IO again
}

// ✅ Good: separated concerns
function getUser(userId: string): User { ... }
function updateLastLogin(user: User): User { return { ...user, lastLogin: new Date() }; }
function persistUser(user: User): Promise<void> { ... }
function notifyUserLogin(email: string): Promise<void> { ... }
```

### Error Handling

**Never swallow errors silently.**

```typescript
// ❌ Bad
try {
  await doSomething();
} catch (e) {
  // ignore
}

// ✅ Good
try {
  await doSomething();
} catch (error) {
  logger.error('doSomething failed', { error, context: { userId } });
  throw new AppError('Operation failed', { cause: error });
}
```

Validate at all system boundaries — API inputs, DB responses, external service calls. Never assume the happy path.

### Constants

```typescript
// ❌ Bad
if (status === 3) { ... }
setTimeout(fn, 86400000);

// ✅ Good
const ORDER_STATUS_SHIPPED = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
```

---

## 4. Handling Significant Technical Cases

These are the cases where engineers most often cut corners. We do not cut corners here.

---

### 4.1 — External API / Third-Party Integration

Every external call **will** fail. Design for that from line one.

```typescript
async function fetchPaymentStatus(orderId: string): Promise<PaymentStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // always set timeout

  try {
    const response = await fetch(`${PAYMENT_API}/orders/${orderId}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ExternalServiceError(`Payment API returned ${response.status}`);
    }

    return parsePaymentStatus(await response.json()); // always validate shape

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TimeoutError('Payment API timed out after 5s');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

**Checklist for any external integration:**
- [ ] Timeout set
- [ ] Error response handled explicitly
- [ ] Response shape validated (never trust external shape)
- [ ] Retry with backoff for transient failures
- [ ] Circuit breaker if high-frequency call
- [ ] Logged with enough context to debug in production

---

### 4.2 — Database Operations

```python
# ❌ Bad — no transaction, silent failure
def transfer_funds(from_id, to_id, amount):
    account_from = db.get(from_id)
    account_from.balance -= amount
    db.save(account_from)           # if this succeeds and next line fails...
    account_to = db.get(to_id)
    account_to.balance += amount
    db.save(account_to)             # money disappears

# ✅ Good — atomic transaction
def transfer_funds(from_id: int, to_id: int, amount: Decimal) -> None:
    with db.transaction():
        account_from = db.get_for_update(from_id)  # lock row
        account_to = db.get_for_update(to_id)

        if account_from.balance < amount:
            raise InsufficientFundsError(from_id, amount)

        account_from.balance -= amount
        account_to.balance += amount

        db.save(account_from)
        db.save(account_to)
    # transaction commits only if both succeed; rolls back on any exception
```

**Rules:**
- Multi-step writes → always use transactions
- Long-running reads → consider read replicas
- N+1 query → always solve it (use `SELECT IN`, eager loading, or batch)
- Migrations must be backwards compatible — deploy code first, then migrate
- Never DROP a column or table in the same release as the code change that removes its usage — do it in a follow-up release
- Every migration must have a rollback plan; destructive migrations require explicit team sign-off
- Test migrations on a production-size data clone before running on production

---

### 4.3 — Async / Concurrency

```typescript
// ❌ Bad — sequential when it could be parallel
const user = await getUser(userId);
const orders = await getOrders(userId);
const preferences = await getPreferences(userId);

// ✅ Good — parallel, with proper error surfacing
const [user, orders, preferences] = await Promise.all([
  getUser(userId),
  getOrders(userId),
  getPreferences(userId),
]);

// ✅ When partial failure is acceptable
const results = await Promise.allSettled([
  getUser(userId),
  getOrders(userId),
]);
const user = results[0].status === 'fulfilled' ? results[0].value : null;
```

**Rules:**
- Never fire-and-forget async calls in production unless intentional with logging
- Always `await` promises or explicitly handle them
- Shared mutable state across async calls = race condition waiting to happen

---

### 4.4 — Input Validation at Boundaries

```typescript
import { z } from 'zod'; // or your team's preferred schema validator

const CreateOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive().max(100),
  })).min(1).max(50),
  currency: z.enum(['USD', 'EUR', 'VND']),
});

// At API boundary — validate before business logic touches it
async function createOrder(rawInput: unknown): Promise<Order> {
  const input = CreateOrderSchema.parse(rawInput); // throws on invalid
  return orderService.create(input);
}
```

Validate **every external input**: HTTP requests, message queue payloads, file uploads, environment variables at startup.

---

### 4.5 — Configuration & Secrets

```typescript
// ❌ Bad
const db = new Database('postgres://admin:password123@prod-db:5432/app');

// ✅ Good
const db = new Database(requireEnv('DATABASE_URL'));

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}
```

- Secrets never in code or version control
- Validate all required env vars at startup, fail fast before accepting traffic
- Use a secrets manager (Vault, AWS Secrets Manager, etc.) for production

---

### 4.6 — Idempotency

Any operation that can be retried must be idempotent.

```typescript
// Payment processing — if network drops after charge but before response,
// client retries. Without idempotency, user gets charged twice.

async function processPayment(idempotencyKey: string, payload: PaymentPayload) {
  const existing = await db.payments.findByIdempotencyKey(idempotencyKey);
  if (existing) {
    return existing; // safe to return cached result
  }

  const result = await paymentGateway.charge(payload);
  await db.payments.create({ ...result, idempotencyKey });
  return result;
}
```

---

## 5. Unit Testing — How We Write and Run Them

### Philosophy

- Test **behaviour**, not implementation.
- If you can refactor internals without changing tests, your tests are good.
- If changing a variable name breaks a test, your test is fragile.

### Structure — AAA Pattern

Every test follows **Arrange → Act → Assert**:

```typescript
describe('OrderService.applyDiscount', () => {
  it('applies 10% discount when user has premium membership', () => {
    // Arrange
    const order = buildOrder({ subtotal: 100 });
    const user = buildUser({ membership: 'premium' });

    // Act
    const result = applyDiscount(order, user);

    // Assert
    expect(result.total).toBe(90);
    expect(result.discountApplied).toBe(true);
  });

  it('does not apply discount for free tier users', () => {
    const order = buildOrder({ subtotal: 100 });
    const user = buildUser({ membership: 'free' });

    const result = applyDiscount(order, user);

    expect(result.total).toBe(100);
    expect(result.discountApplied).toBe(false);
  });

  it('throws when order subtotal is negative', () => {
    const order = buildOrder({ subtotal: -1 });
    const user = buildUser({ membership: 'premium' });

    expect(() => applyDiscount(order, user)).toThrow(InvalidOrderError);
  });
});
```

### What to Test

| Scenario | Must Test |
|---|---|
| Happy path | ✅ Always |
| Edge cases (zero, empty, max) | ✅ Always |
| Invalid inputs | ✅ Always |
| Error conditions | ✅ Always |
| Side effects (emails sent, events emitted) | ✅ Always |
| Internal implementation detail | ❌ Never |
| Private methods directly | ❌ Never |

### Mocking

```typescript
// ❌ Bad — mocking implementation details
jest.spyOn(service, '_buildQueryObject');

// ✅ Good — mocking at system boundaries
const mockEmailService = {
  send: jest.fn().mockResolvedValue({ messageId: 'msg-123' }),
};

// Inject the mock
const orderService = new OrderService({ emailService: mockEmailService });
await orderService.confirmOrder(orderId);

// Assert the behaviour, not the internal call
expect(mockEmailService.send).toHaveBeenCalledWith(
  expect.objectContaining({ to: 'user@example.com', subject: expect.stringContaining('confirmed') })
);
```

### Test Builders / Factories

Never build raw objects inline in tests. Use factories:

```typescript
// test/factories/order.ts
export function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-default-id',
    userId: 'user-default-id',
    subtotal: 50,
    currency: 'USD',
    status: 'pending',
    items: [],
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
```

This makes tests readable and resilient to model changes.

### Running Tests

```bash
# Run all tests
npm test

# Watch mode during development
npm test -- --watch

# Run a single file
npm test -- src/services/order.service.test.ts

# Coverage report
npm test -- --coverage

# Run only tests matching a name pattern
npm test -- --testNamePattern="applies discount"
```

### Coverage Expectations

| Code category | Minimum | Target |
|---|---|---|
| General business logic | 80% | 85% |
| Payment, auth, data mutations | 95% | 100% |
| Utilities / helpers | 70% | 80% |
| Boilerplate / config / generated code | exempt | exempt |

- **Never** chase 100% by testing boilerplate — coverage on meaningless code is noise that masks real gaps
- Coverage gates are enforced in CI — a PR that drops coverage below threshold will not merge
- High coverage ≠ good tests. A test that asserts nothing can achieve 100% coverage. Write assertions that would actually catch regressions.

```bash
# Coverage report shows uncovered lines
npm test -- --coverage --coverageReporters=text-summary
```

---

## 6. CI/CD — Automated Quality Gates

### What Runs on Every Push

```yaml
# .github/workflows/ci.yml (GitHub Actions example)
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test -- --coverage --ci

      - name: Coverage gate
        run: npm run check-coverage   # fails if below threshold

      - name: Build
        run: npm run build
```

### What Runs Only on PR to Main

```yaml
  integration:
    needs: quality
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test
```

### Branch Protection Rules (enforce these in repo settings)

```
main branch:
  ✅ Require pull request before merging
  ✅ Require status checks to pass: [quality, lint, tests]
  ✅ Require at least 1 approval
  ✅ Dismiss stale reviews when new commits are pushed
  ✅ Require branches to be up to date
  ❌ Allow force push: NEVER
```

### Deployment Pipeline

```
feature branch
    → CI passes (lint + typecheck + unit tests)
        → PR opened
            → Code review
                → Merge to develop
                    → Integration tests run
                        → Deploy to staging (automatic)
                            → QA sign-off
                                → PR to main
                                    → Deploy to production (manual approval)
```


**Never deploy on Friday afternoon. Never skip staging.**

### Hotfix Process (production is on fire)

When production is broken and the normal pipeline is too slow:

```
hotfix/incident-description branch (from main)
    → Fix scoped to the minimum change that resolves the incident
        → CI must still pass (no exceptions)
            → Fast-track review: 1 approver minimum, synchronous if needed
                → Merge to main → Deploy to production
                    → Cherry-pick or merge back to develop immediately
```

**Even in a hotfix:**
- CI must pass — no merge if tests are red
- At least 1 reviewer (can be async or synchronous, use your judgment)
- Write a post-mortem within 48 hours: what broke, why, how we prevent it

> The fire is stressful. Skipping process makes the next fire worse.

### Environment Variables in CI

```yaml
# Store secrets in GitHub Secrets, never in yml files
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  API_KEY: ${{ secrets.PAYMENT_API_KEY }}

# Non-secret config can live in the yml
  NODE_ENV: test
  LOG_LEVEL: error
```

---

## 7. Self-Review Checklist Before Every PR

Run through this **before** you request review. Every item. Every time.

### Correctness
- [ ] Does the code actually solve the stated problem?
- [ ] Did I test the unhappy path myself (manually or via tests)?
- [ ] Are all edge cases I could think of handled?
- [ ] Have I introduced any regressions? (run full test suite locally)

### Code Quality
- [ ] Are names clear enough that a new team member understands without asking?
- [ ] Is there any dead code, commented-out code, or debug statements left?
- [ ] Is there any duplicated logic that should be extracted?
- [ ] Are there any magic numbers or strings that need to become constants?

### Error Handling & Safety
- [ ] Are all external calls (DB, APIs, queues) wrapped with error handling?
- [ ] Are all inputs validated at boundaries?
- [ ] Does any code have potential null/undefined access that isn't guarded?
- [ ] Are there race conditions if two instances run this simultaneously?

### Testing
- [ ] Are there unit tests for the new logic?
- [ ] Do tests cover the edge cases, not just the happy path?
- [ ] Does the test suite pass locally with no failures or skipped tests?
- [ ] Is test coverage not lower than before this PR?

### PR Hygiene
- [ ] Is the PR description filled out with what, why, and how to test?
- [ ] Is the PR small enough to be reviewed in under 20 minutes?
- [ ] Have I re-read every changed line as if I'm the reviewer?
- [ ] Have I checked the diff for accidental file changes?

### If it touches production paths:
- [ ] Is it observable? (logging added where needed)
- [ ] Is there a rollback plan if this goes wrong?
- [ ] Has this been tested in a staging environment?

> **Rule:** If you wouldn't feel comfortable with your most demanding colleague reviewing this right now — it's not ready.

---

## 8. Non-Negotiables vs Flexible Zones

### 🔴 NEVER compromise on these

| Rule | Why |
|---|---|
| Tests must pass in CI before merge | Protects team trust in the codebase |
| No secrets in code or version control | Security — one leaked key can compromise everything |
| No force push to main | Protects history and teammates' work |
| Error handling at all external boundaries | Silent failures are the hardest bugs to diagnose |
| No Friday afternoon production deploys | Protect everyone's weekend; reduce blast radius |
| PRs require at least one review | Knowledge sharing and catching blind spots |
| Self-review before requesting review | Respect for the reviewer's time |
| No PII or sensitive data in logs or error messages | Data privacy — logs are often accessible beyond production team |
| No merging your own PR without a second set of eyes | Blind spots are real; no one is exempt |

### 🟡 Prefer these, but I'll listen to a good counter-argument

| Preference | What I'd want to hear to change my mind |
|---|---|
| Typed over untyped code | "The typing overhead slows us down more than bugs cost us" + evidence |
| Boring, stable libraries over trendy ones | "This library is mature enough and solves a real gap" |
| Small PRs over large ones | "This truly cannot be split without breaking deployability" |
| Monolith first, extract when pain is real | "Here's the concrete bottleneck that microservices would solve" |

### 🟢 Genuinely don't care — pick one and be consistent

- Tab vs space (autoformat resolves this — just configure it)
- Which test framework (Jest, Vitest, pytest — all fine)
- OOP vs functional style (use what fits the problem)
- Folder structure (as long as it's consistent and documented)
- Quote style in any language (linter's job, not ours)

---


---

## 9. Code Review — As the Reviewer

Code review is not a gatekeeping ritual. It is the team's primary mechanism for knowledge sharing, catching blind spots, and maintaining collective ownership of the codebase.

### Your mindset as reviewer

- You are a collaborator, not a judge. Your job is to make the code better and help the author grow — not to catch them out.
- Assume good intent. If something looks wrong, ask first — "Did you consider X?" beats "This is wrong."
- Distinguish between blocking issues and preferences. Use labels if your team has them.

### What you are responsible for

| Your job | Not your job |
|---|---|
| Correctness of the logic | Reformatting (linter's job) |
| Security and edge cases | Rewriting in your style |
| Whether it's testable and tested | Finding every possible improvement |
| Whether you understand it | Approving if you genuinely don't |

### Reviewer checklist

**Understanding**
- [ ] Do I understand what this PR is trying to do?
- [ ] Is there a design doc or ticket that gives context I should read first?

**Correctness**
- [ ] Does the logic actually solve the stated problem?
- [ ] Are edge cases and error paths handled?
- [ ] Could this break existing behaviour?

**Security & Data**
- [ ] Are inputs validated at boundaries?
- [ ] Could any of this expose sensitive data (in logs, errors, responses)?
- [ ] Are there obvious injection or authorization issues?

**Maintainability**
- [ ] Will a future engineer understand this without the author present?
- [ ] Is complexity justified, or is there a simpler approach?
- [ ] Is test coverage adequate and meaningful?

### Giving feedback that lands

```
❌ "This is wrong."
✅ "This will fail when `items` is an empty array — we'd get a divide-by-zero. 
    Could we guard with an early return?"

❌ "I wouldn't do it this way."
✅ "This works! I've found [alternative] easier to extend when new cases come in 
    — worth considering, but not blocking."

❌ "Needs more tests."
✅ "Could we add a test for the case where the user has no active subscription? 
    That path leads to a DB write and I want to make sure it's covered."
```

### Turnaround expectations

- PRs awaiting review should be addressed within **1 business day**.
- If you cannot review in time, say so — don't let PRs sit silently.
- If a PR is too large to review properly, it is acceptable to ask the author to split it.

> **Rule:** An approval means you are co-responsible for what merges. Don't rubber-stamp.

---

## 10. Observability & Logging Standards

If you can't tell what your code is doing in production, you don't own your code — you just wrote it.

### Log levels — use them correctly

| Level | When to use | Example |
|---|---|---|
| `ERROR` | Something failed that requires attention or action | Payment charge failed, DB connection lost |
| `WARN` | Something unexpected happened but we recovered | Retry succeeded on attempt 2, config fallback used |
| `INFO` | Normal significant events in the lifecycle | Order created, user authenticated, service started |
| `DEBUG` | Detailed flow useful during development | Function entered, intermediate values, query params |

**Rules:**
- `ERROR` and `WARN` should be actionable — if no one needs to act on it, lower the level
- `DEBUG` must never run in production unless you have dynamic log levels
- Never log in a tight loop — it will destroy performance and flood your log aggregator

### Structured logging

Always log as structured data (JSON), never free-form strings:

```typescript
// ❌ Bad — unqueryable, hard to parse
logger.info(`User ${userId} placed order ${orderId} for $${amount}`);

// ✅ Good — structured, queryable, consistent
logger.info('order.created', {
  userId,
  orderId,
  amount,
  currency,
  durationMs: Date.now() - startTime,
});
```

### What to log — and what never to log

**Always log:**
- Service startup with config summary (no secrets)
- Incoming requests (method, path, response status, duration)
- All ERROR and WARN conditions with enough context to reproduce
- Key business events (order created, payment processed, user registered)

**Never log:**
- Passwords, tokens, API keys — in any form
- Full credit card numbers, CVVs
- PII: full names + identifiers together, email + sensitive context, national ID numbers
- Raw request bodies from untrusted input (log shape, not values)

```typescript
// ❌ Never
logger.info('User login', { email, password });

// ✅ Safe
logger.info('User login attempt', { userId, email: maskEmail(email), success: true });
```

### Correlation IDs

Every request entering your system should carry a correlation ID through all downstream calls. This is non-negotiable for debugging distributed systems.

```typescript
// Middleware: assign or propagate
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || generateId();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
});

// Every log call downstream includes it
logger.info('payment.initiated', { correlationId: req.correlationId, orderId });
```

### Alerting baseline

Every production service should have alerts on:
- Error rate spike (> baseline + N%)
- P95 response time threshold breach
- Service health check failure
- Key business metric anomaly (zero orders in 10 minutes is a signal)

---

## 11. Security Baseline

Security is not a feature sprint. It's the floor every feature is built on.

### Input validation (recap + extension)

Covered in §4.4. The rule: validate at every trust boundary — not just the API layer.

Additional rules:
- Never use raw string concatenation to build SQL queries — ever
- Treat data from your own DB as untrusted when it crosses a service boundary
- File uploads: validate MIME type server-side (not just extension), scan if feasible, store outside webroot

### Authentication & authorization

```typescript
// ❌ Bad — trusting user-supplied ID
async function getOrder(req) {
  return db.orders.find(req.body.orderId); // anyone can request any order
}

// ✅ Good — enforce ownership
async function getOrder(req) {
  const order = await db.orders.find(req.params.orderId);
  if (!order || order.userId !== req.user.id) {
    throw new ForbiddenError();
  }
  return order;
}
```

**Rules:**
- Always check authorization, not just authentication — "logged in" ≠ "allowed"
- Use short-lived tokens (JWTs: 15–60 min access token, longer refresh token)
- Never store tokens in `localStorage` if XSS is a concern — use `httpOnly` cookies
- Rotate secrets regularly; have a process to do so without downtime

### Dependency security

```bash
# Run regularly, and in CI
npm audit
pip-audit

# Do not ignore high/critical findings without a documented decision
```

- Pin dependency versions in production (`package-lock.json`, `poetry.lock`)
- Review what a new dependency does before adding it — supply chain attacks are real
- Remove unused dependencies

### OWASP Top 10 — quick reference

Every engineer should know these exist. For each one we touch:

| Risk | Our mitigation |
|---|---|
| Injection (SQL, command) | Parameterized queries, never string concat |
| Broken authentication | Short-lived tokens, secure storage, MFA where applicable |
| Sensitive data exposure | Encrypt at rest + in transit, never log PII |
| Broken access control | Ownership checks on every resource fetch |
| Security misconfiguration | Config review in PR, no default credentials, secrets manager |
| XSS | Sanitize output, CSP headers, `httpOnly` cookies |
| Using components with known vulnerabilities | `npm audit` / `pip-audit` in CI |

When in doubt: consult OWASP directly at owasp.org.

### Principle of least privilege

- Service accounts get only the permissions they need — no admin by default
- DB users per service: the order service should not have credentials to the auth DB
- API tokens scoped to the minimum required operations

---

## 12. Working with AI Coding Tools

AI coding tools (Copilot, Claude, Cursor, etc.) are now part of how we work. They are powerful, and they introduce new failure modes we need to be deliberate about.

### The core rule

**AI-generated code is your code the moment you accept it.** You are responsible for it. The tool is not.

This means:
- You must understand every line before committing it — "the AI wrote it" is not a valid explanation in a code review
- AI suggestions must pass through the same self-review checklist (§7) as anything else you write
- If you don't understand what the code does, don't commit it — ask, research, or rewrite it

### What AI tools are good at

- Boilerplate and scaffolding (test factories, CRUD endpoints, config files)
- Translating your intent into a first draft quickly
- Spotting syntax issues and common patterns
- Writing test cases when you describe the behaviour
- Explaining unfamiliar code

### Where AI tools commonly fail

- Business rule correctness — it doesn't know your domain
- Security nuance — it will write plausible-looking but subtly insecure code
- Edge cases specific to your data or system
- Knowing which of your internal patterns to follow
- Anything that requires context beyond the current file

### Rules for AI-assisted development

```
✅ Use AI to accelerate first drafts — then own and verify the result
✅ Use AI to write tests — then verify the tests actually test the right thing
✅ Use AI to explain unfamiliar code — then verify the explanation
✅ Commit AI-generated code the same way you commit your own: reviewed and understood

❌ Do not commit code you cannot explain line by line
❌ Do not use AI to bypass the design-before-coding step (§2) — thinking is still your job
❌ Do not paste sensitive data, credentials, or private business logic into external AI tools
❌ Do not let AI-assisted speed become a reason to skip self-review
```

### Prompting for better output

When using AI for code tasks, be specific about constraints:

```
✅ "Write a TypeScript function that validates a Vietnamese phone number (10 digits, 
    starts with 0). Use zod. Throw a ValidationError on failure. Include 3 test cases."

❌ "Write a phone validator"
```

The more context and constraints you give, the closer the output will be to production-ready.

### On AI and code reviews

If a reviewer suspects a block of code was AI-generated and not properly understood:
- They may ask the author to explain any section
- "I'm not sure, the AI generated it" means the PR is not ready
- This is not punitive — it's the same standard we hold for all code

> AI tools raise the ceiling of what you can build. They don't lower the bar for what you ship.


## Final Word

The difference between engineers who plateau and engineers who compound is simple:

**The ones who compound treat every code review, every bug, and every design decision as a learning opportunity — not just a task to close.**

When you're stuck, ask. When you're wrong, own it fast and fix it. When you find something confusing in the codebase, leave it clearer than you found it.

That's it. That's the whole game.

---

*Last updated: April 2026 (v2) | Owner: Tech Lead | Feedback: open a PR against this document*