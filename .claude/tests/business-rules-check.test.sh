#!/usr/bin/env bash
# Regression tests for ../business-rules-check.sh. Run: bash .claude/tests/business-rules-check.test.sh
# Each case feeds the hook a Bash tool call from a throwaway repo on the given branch.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
hook="$here/../business-rules-check.sh"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
git -C "$work" init -q
mkdir -p "$work/.claude"
cp "$here/../business-rules.md" "$work/.claude/business-rules.md"
failures=0

run() { # $1 = block|allow, $2 = current branch, $3 = command
  local expect="$1" branch="$2" cmd="$3" rc
  git -C "$work" symbolic-ref HEAD "refs/heads/$branch"
  printf '{"tool_input":{"command":%s}}' "$(printf '%s' "$cmd" | jq -Rs .)" \
    | (cd "$work" && HOME="$work" bash "$hook" >/dev/null 2>&1)
  rc=$?
  if { [ "$expect" = block ] && [ "$rc" -eq 2 ]; } || { [ "$expect" = allow ] && [ "$rc" -eq 0 ]; }; then
    echo "ok    $expect [$branch] $cmd"
  else
    echo "FAIL  expected $expect, exit $rc [$branch] $cmd"
    failures=$((failures + 1))
  fi
}

run block feat/x 'git push -u origin main'
run block feat/x 'git push origin HEAD:main'
run block feat/x 'git push origin HEAD:refs/heads/main'
run block feat/x 'git push origin +develop'
run block main 'git commit -m "fix: typo"'
run block develop 'git push'
run allow feat/x 'git commit -m "fix(auth): handle domain errors"'
run allow feat/x 'git commit -m "feat: remain on page after save"'
run allow feat/x 'git push -u origin feat/main-page'
run allow feat/x 'git push origin maintenance'
run allow feat/x 'git push -u origin claude/agent-team-daily-upgrade'
run allow main 'git log --oneline main..HEAD'

[ "$failures" -eq 0 ] && echo "All business-rules-check cases passed." || echo "$failures case(s) failed."
exit "$failures"
