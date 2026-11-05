# 0004. Larger Type for the Verdict Card

- **Date**: 2026-11-05
- **Status**: Accepted

## Context

The design system sets panel titles at 16 px and body text at 14 px. The audience of Salud Económica includes people with dyscalculia, for whom the month's answer has to be readable at a glance and must not depend on reading figures.

## Decision

The verdict card uses a 26 px title (23 px on mobile), an 18 px sentence and a colored status light, and its border and background follow the state: `--accent` (good), `--warn-*` (tight or no income) and `--error-*` / `--danger` (short). Spending categories get their own tokens (`--cat-*`) in both themes. Everything else keeps the standard sizes.

## Alternatives

| Option | Why not |
|---|---|
| **Standard 16 px panel title** | The answer would look like any other panel |
| **A big percentage or number** | Numbers are exactly what the audience finds hard |

## Consequences

- The verdict card is the only component above the standard type scale
- Color is never the only signal: the sentence states the result in words
