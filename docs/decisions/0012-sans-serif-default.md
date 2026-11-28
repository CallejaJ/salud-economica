# 0012. Sans-Serif Default With OpenDyslexic as an Option

- **Date**: 2026-11-28
- **Status**: Accepted (amends 0010 and 0011)

## Context

Jorge shared the conclusions of nine experiments on screen text for people with dyslexia: large type (18 to 24 pt), sans-serif typefaces such as Arial, Helvetica or Verdana, no italics, columns of about 44 characters and letter spacing 7 % to 14 % above normal. The study found no advantage in typefaces made for dyslexia, while 0010 had made OpenDyslexic the only interface font and 0011 tightened its spacing.

## Decision

The interface opens in Verdana (falling back to DejaVu Sans, Tahoma, Arial, Helvetica and the system sans-serif) with `--tracking: 0.07em`, `--word-gap: 0.08em` and `line-height: 1.5`. An "Aa" button in the header switches to OpenDyslexic by setting `html[data-font="dyslexic"]`, which swaps `--font-body` and the spacing tokens back to the compact values of 0011. The choice is stored in `localStorage("font")` and applied before the first paint. Reading text moves up two pixels (13 px to 15 px, 14 px to 16 px, hints to 13.5 to 14 px), and running text is capped at `--reading-width: 46ch`. The interface has no italics.

## Alternatives

| Option | Why not |
|---|---|
| **Keep OpenDyslexic as the default** | The study recommends common sans-serif typefaces |
| **Remove OpenDyslexic** | Some readers prefer it; it costs nothing until chosen |
| **Body text at 18 pt (24 px)** | Would need a new layout for cards, lists and the header; the verdict card already uses 18 to 26 px (0004) |

## Consequences

- OpenDyslexic is no longer preloaded; its files download only when it is chosen
- Android has no Verdana, so it shows Roboto or another system sans-serif
- On phones the header title drops to 14 px (13 px with OpenDyslexic) to make room for the fourth header button
