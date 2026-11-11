# 0006. After-school activities category

- **Date**: 2026-11-11
- **Status**: Accepted

## Context

After 0005, after-school charges such as athletics and scouts landed in "other" or, through the keyword `extraescolar`, in school costs. Jorge wants them grouped on their own, apart from school fees and the gym.

## Decision

Add an `activities` category ("Extraescolares" / "After-school") between `school` and `gifts`, with a star icon and the token `--cat-activities` (fuchsia, `#e879f9` dark / `#a21caf` light). The keywords `extraescolar`, `scout`, `atletismo`, `campamento`, music, language and dance schools now map to it, checked before sports and school.

## Alternatives

| Option | Why not |
|---|---|
| **Keep them in sports** | Scouts and music classes are not sport, and Jorge wants to see this cost on its own |
| **Cyan for the token** | Too close to the home sky blue and the income teal |

## Consequences

- Ten categories: the picker is four rows of three on desktop (Otros alone on the last row) and five rows of two on mobile.
- Entries already saved keep their category; the user can move them with the category change from #11 or by uploading the statement again.
