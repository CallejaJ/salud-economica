# 0008. A Spanish URL at /es

- **Date**: 2026-11-12
- **Status**: Accepted

## Context

The page was served in English at `/` and switched to Spanish only in the browser, from `localStorage`. Search engines therefore indexed English text under a Spanish title and description, and there was no URL to point Spanish searches to, so `hreflang` could not be used. Most of the audience searches in Spanish.

## Decision

Each language has its own prerendered URL: English at `/` (also `x-default`) and Spanish at `/es`. Two route groups, `app/(en)` and `app/(es)`, each have a root layout that renders the shared `components/SiteDocument.tsx` with its own `lang`, metadata and JSON-LD from `pageMetadata(lang)` and `structuredData(lang)` in `lib/seo.ts`. The language toggle still switches in place and saves the choice; it also replaces the address with the matching URL and updates `document.title`.

## Alternatives

| Option | Why not |
|---|---|
| **Keep one URL, pick the language in the browser** | Crawlers only ever see one language; no `hreflang` |
| **`app/[lang]` with a rewrite from `/` to `/en`** | Needs rewrites and a redirect for `/en`; the route groups give the same URLs with static files only |
| **Move English to `/en` and Spanish to `/`** | Breaks the standard's default language and the links already shared |

## Consequences

- Spanish and English pages are indexed separately and point to each other with `hreflang`
- The sitemap lists both URLs with their alternates
- Moving between the two URLs with a link reloads the page, because they use different root layouts; the toggle avoids this by updating the address in place
