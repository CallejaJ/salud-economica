# 0005. Sports, school and gifts categories

- **Date**: 2026-11-11
- **Status**: Accepted

## Context

Gym fees, school costs and presents were landing in "other", which hid big recurring family costs inside one grey bar. Jorge asked for three new spending categories: sports, school costs and gifts.

## Decision

Add `sports`, `school` and `gifts` to `CATEGORIES` (before `other`, which stays last), with their own icons and the design tokens `--cat-sports` (lime), `--cat-school` (indigo) and `--cat-gifts` (orange) in both themes.

## Alternatives

| Option | Why not |
|---|---|
| **Keep using "other" with notes** | The money bar would still show one grey block; colors are how readers with dyscalculia tell costs apart |
| **Rose or red for gifts** | Too close to the leisure pink and to the danger color of the verdict |

## Consequences

- Nine categories fill the picker as a 3 × 3 grid on desktop and five rows of two on mobile.
- The statement import (Claude prompt, JSON schema enum and keyword fallback) knows the new categories.
- Existing entries and backups keep working; no data migration is needed.
