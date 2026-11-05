---
name: refactor
description: Refactor code without changing behavior, keeping tests green at every step. Use when asked to clean up, split, rename or simplify code.
---

# Refactor

1. Run `npm test` and `npm run build` first and record the result. If they fail, stop and report.
2. If the code to refactor has no tests, add characterization tests in `__tests__/` that pin the current behavior.
3. Change in small steps (extract, rename, move). Run `npm test` after each step.
4. Keep public names, CSS class names and string keys unless the task is to rename them; if renamed, update every use.
5. Move React-free logic to `lib/`; keep components presentational.
6. Do not change visuals: tokens, spacing and motion stay identical.
7. Finish with `npm test` and `npm run build`, then summarize what moved where in a table: Before | After.
8. Commit as `Refactor <area>: <what>`.
