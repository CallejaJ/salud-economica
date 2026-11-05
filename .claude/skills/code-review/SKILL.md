---
name: code-review
description: Review the current diff against Jorge's project standard (design tokens, layout, i18n, SEO, README, tests). Use before opening or merging a pull request.
---

# Code Review

Review the uncommitted changes (`git diff HEAD`), or the commit range given, and report findings as a table: File | Line | Problem | Fix. Most severe first. Do not rewrite code unless asked.

## Checklist

| Area | Check |
|---|---|
| **Correctness** | Logic errors, unhandled empty or error states, race conditions |
| **Design tokens** | No hex colors outside the token blocks; new tokens defined in dark and light themes |
| **Layout** | 1600 px max width, 40 px / 16 px padding; no horizontal scroll at 375 px |
| **i18n** | Every visible string comes from `lib/strings.ts` and exists in `en` and `es` |
| **Accessibility** | Buttons have `type` and labels; focus is visible; motion respects reduced motion |
| **Secrets** | No keys in client code except restricted `NEXT_PUBLIC_` ones; `.env` not committed |
| **SEO** | Metadata, sitemap and JSON-LD still match visible content |
| **Tests** | New logic in `lib/` has Jest tests; `npm test` and `npm run build` pass |
| **Docs** | README and `docs/` updated when features, stack or setup changed; ADR for architecture changes |
| **Commits** | Imperative English sentences, one logical change each |
