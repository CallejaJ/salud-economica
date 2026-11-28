# 0011. Compact Spacing for OpenDyslexic and a Content-Width Save Button

- **Date**: 2026-11-26
- **Status**: Accepted

## Context

After 0010, OpenDyslexic showed in production with very loose text: its glyphs carry wide side bearings and its space is 0.85 em, so on a phone lines read as separate letters. The full-width Save button of the entry form also looked oversized next to it.

## Decision

Four spacing tokens in `:root` tighten the font for every element: `--tracking` (-0.06 em), `--tracking-tight` (-0.08 em, titles), `--tracking-caps` (0, uppercase badges) and `--word-gap` (-0.32 em). Figures in `tabular-nums` elements keep `--tracking-figures` (0) so digits stay apart. The Save button uses `button.submit`: content width with 40 px side padding, at least 180 × 48 px, aligned to the start of the form.

## Alternatives

| Option | Why not |
|---|---|
| **Keep the font's own spacing** | Too loose to read as words on a phone |
| **Set the spacing only on `body`** | `em` would be fixed at the body size and form controls reset it to `normal` |
| **Centered Save button** | The other primary buttons start at the left edge of their card |

## Consequences

- Spacing is tuned in one place; new components inherit it through the universal rule
- A rule that sets its own `letter-spacing` should use one of the tokens
