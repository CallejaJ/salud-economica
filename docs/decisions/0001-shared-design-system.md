# 0001. Shared Design System Across Projects

- **Date**: 2026-11-01
- **Status**: Accepted

## Context

PrintAllPDFs and Route Planner Andalucía were built separately but converged on the same slate and turquoise palette, glass header, dot grid, footer and 1600 px layout. Without a written standard each new project copies whichever repo was opened last and drifts.

## Decision

The tokens, layout and components in `docs/design-system.md` are the single source of truth, and `templates/app/globals.css` is the starting stylesheet for every new project.

## Alternatives

| Option | Why not |
|---|---|
| **Tailwind with a shared preset** | Adds a build dependency and rewrites every existing component |
| **Published npm package with the CSS** | Versioning overhead for a small set of personal projects |

## Consequences

- New projects start visually consistent from the first commit
- A change to a token must be applied to every project by hand and recorded here
