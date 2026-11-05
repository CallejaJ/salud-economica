#!/usr/bin/env bash
# Runs at the end of each Claude turn. Only checks when source files changed,
# so conversations without edits stay fast. Exit code 2 sends the output back
# to Claude so it fixes the failure before finishing.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}"

if git diff --quiet HEAD -- app components lib tests 2>/dev/null; then
  exit 0
fi

if ! out=$(npm test --silent 2>&1); then
  echo "Unit tests failed:" >&2
  echo "$out" | tail -40 >&2
  exit 2
fi

if ! out=$(npx tsc --noEmit 2>&1); then
  echo "Type check failed:" >&2
  echo "$out" | tail -40 >&2
  exit 2
fi

exit 0
