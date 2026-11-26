# 0010. OpenDyslexic as the Interface Typeface

- **Date**: 2026-11-26
- **Status**: Accepted

## Context

The design system uses the system font stack and allows no web fonts. Salud Económica is built for people who find numbers hard, and many of them also find reading tiring. Jorge asked for the whole interface to use OpenDyslexic, a typeface with weighted letter bottoms and distinct shapes meant to reduce letter swapping.

## Decision

The interface uses OpenDyslexic for every text element, with the system stack as fallback. Weights 400 and 700 are self-hosted as WOFF2 files in `public/fonts` (taken from the Fontsource 5.3 build, SIL Open Font License, copied to `public/fonts/OFL.txt`), declared with `font-display: swap` and preloaded in `SiteDocument`.

## Alternatives

| Option | Why not |
|---|---|
| **Load it from a CDN** | Adds a third-party request on every visit and a privacy leak the app promises not to have |
| **`@fontsource/opendyslexic` as a dependency** | A package for two static files; copying them keeps the dependency list unchanged |
| **A switch to turn it on** | Jorge asked for it as the interface font; a toggle can come later if users ask |

## Consequences

- About 230 KB of fonts on first load, cached afterwards; text shows in the system font until they arrive
- OpenDyslexic is wider than the system font, so layouts must not rely on text fitting on one line: the header title wraps under 480 px, the expense and income choice stacks under 480 px, and the share word of a category sits on its own line under the bar
- Weight 600 renders as the 700 file, since only two weights are shipped
- Glyphs the font lacks (such as `✕`) fall back to the system font
