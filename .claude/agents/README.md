# Team Agents

Sub-agents the orchestrator (main Claude) can delegate to. Each runs with a limited scope, freeing context for the main agent.

## The Team

Full roster (all 16 agents) and when to use each — see `CLAUDE.md` → `## Agents`. Notes below cover detail that table doesn't:

| Agent | Backed by / notable behavior |
|-------|-------------------------------|
| `planner` | Mini design doc + PR slice strategy per `engineering-handbook` skill §2 |
| `business-analyst` | BRD/FRD/SRD package; Korean/Vietnamese doc support; backed by `business-analyst` skill |
| `researcher` | 4 research modes with fintech lens; backed by `paave-research` skill |
| `tdd-guide` | Enforces T-1/T-2/T-3 non-negotiables; characterisation tests before any refactor |
| `security-reviewer` | OWASP Top 10 + S-1–S-4; always defers auth/payment final approval to human (A-3) |
| `ux-designer` | All 7 component states; fintech UX principles; backed by `product-design` skill |
| `build-error-resolver` | Diagnoses by error type; never suggests `--force` without explaining risk |
| `refactor-cleaner` | Characterisation tests required before touching untested code |

## How the orchestrator delegates

```
Main Claude → Agent("planner", "plan the stock watchlist feature")
           → Agent("architect", "design the data model for watchlists")
           → Agent("security-reviewer", "review the auth changes in PR #42")
```

Agents run in the background by default — set `run_in_background: true` for parallelism.

## Hooks

| Hook | Event | What it does |
|------|-------|-------------|
| `bash-audit-log.sh` | PreToolUse (Bash) | Logs every command to `~/.claude/audit.log` with timestamp + session + cwd |
| `business-rules-check.sh` | PreToolUse (Bash) | Reads project `.claude/business-rules.md` (falls back to `~/.claude/business-rules.md`); blocks high-risk commands with the relevant rule code |
| `stop-hook-git-check.sh` | Stop | Blocks session end if there are uncommitted or unpushed changes |

Audit log: `~/.claude/audit.log` — readable by both humans and agents to review command history.
