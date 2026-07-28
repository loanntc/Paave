# Paave — Claude Code Project Guide

Paave is a Vietnam Gen Z paper-trading and social investing app. Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase. Primary market: Vietnam (HOSE/HNX).

**Hard constraints (never negotiate):**
- No real securities trading, no custody of funds — ever
- Age gate: under 16 = blocked, 16–17 = LEARN_MODE (paper trading only), 18+ = FULL_ACCESS
- VND formatting: `1.250.000 ₫` (period separator, no decimals, dong symbol after space)

## Rules

Read and follow all rules before writing code, running commands, or making decisions:

- **Security** — `.claude/rules/security.md`
- **Coding style** — `.claude/rules/coding-style.md`
- **Testing** — `.claude/rules/testing.md`
- **Git workflow** — `.claude/rules/git-workflow.md`
- **Agent behavior** — `.claude/rules/agents.md`
- **Performance** — `.claude/rules/performance.md`

Master rule index with cross-file rule codes (S-1, C-1, T-1, G-1, A-1, P-1…) — `.claude/business-rules.md`

## Agents

Specialized agents live in `.claude/agents/`. Use them for the right task:

| Agent | When to use |
|-------|-------------|
| `product-owner` | Backlog priority, user stories, acceptance criteria, sprint review sign-off |
| `project-manager` | Planning, risk tracking, cross-team coordination, blockers |
| `business-analyst` | Writing BRD / FRD / SRD specs |
| `architect` | ADRs, data model design, API contracts |
| `security-reviewer` | Any change touching auth, payments, PII, or external APIs |
| `frontend-developer` | UI implementation, design-dev alignment |
| `backend-developer` | API, DB, server logic |
| `qa-engineer` | Test cases, bug reports, release sign-off |
| `code-reviewer` | PR review before merge |
| `ux-designer` | User flows, component specs, UI design |
| `tdd-guide` | Test-driven development, characterisation tests before refactoring |
| `planner` | Breaking work into independently deployable PR slices |
| `refactor-cleaner` | Post-ship cleanup, deduplication, abstraction |
| `build-error-resolver` | Build, lint, type-check, test failures |
| `researcher` | Market research, competitive analysis, fintech intelligence |
| `e2e-runner` | End-to-end Playwright tests |

See `.claude/agents/WORKFLOW.md` for the full team SDLC workflow.

## Hooks

Three hooks run automatically via `.claude/settings.json`:

- **PreToolUse (Bash):** Every command is audit-logged and checked against business rules before execution
- **Stop:** Session cannot end with uncommitted or unpushed changes

## Non-negotiables

- No direct commits or pushes to `main` or `develop` — PRs only (rule A-2)
- No DB migrations without human review (rule A-1)
- No hardcoded secrets (rule S-1)
- Tests required for all new business logic (rule T-1)
- All list endpoints paginated (rule P-3)
