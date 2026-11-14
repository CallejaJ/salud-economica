# 0009. Guided Tour Without a Library

- **Date**: 2026-11-14
- **Status**: Accepted

## Context

First-time visitors land on a month view with an example, three tabs and several panels. People who find numbers hard benefit from being shown, one part at a time, where the answer is and how to add their own data. Montaplan already has a guided tour that Jorge wants reused here.

## Decision

`components/GuidedTour.tsx` ports Montaplan's own tour component: a spotlight (a transparent box with a large shadow) over each element marked with `data-tour`, and a card with progress, Back, Next and Skip. It opens by itself on the first visit once the verdict is on screen, is remembered in `localStorage("salud-economica.tour")` when finished or skipped, and the "?" button in the header starts it again. Starting it again switches to the month view. When the browser blocks site data the tour does not open by itself, because it could never remember that it was seen. A new project token `--tour-scrim` sets the darkening in each theme.

## Alternatives

| Option | Why not |
|---|---|
| **A tour library (driver.js, react-joyride)** | Adds a dependency and its own styles for something one small component already does in Montaplan |
| **A static help section only** | "How it works" already exists; it does not point at the real controls |

## Consequences

- E2E tests mark the tour as seen before each page loads, except the test for the tour itself
- Any new main feature should get a `data-tour` attribute and a step with strings in both languages
