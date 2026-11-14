# Jorge Calleja Project Standard

This file is the master standard for every project by **Jorge Calleja** (Diseño Web Málaga), filled in for Salud Económica. The master lives in `CallejaJ/project-standard`; the reference implementations are `CallejaJ/printallpdfs` and `CallejaJ/route-planner-andalucia`. When this file and those repos disagree, this file wins.

| Source | What it defines | Detailed rules |
|---|---|---|
| **Repository structure** | Folders, `CLAUDE.md` per module, `.claude/` skills and hooks | `docs/structure.md` |
| **README rules** | Section order and formatting of every `README.md` | `docs/readme-rules.md` |
| **Design system** | Colors, layout, header, footer, toggles, buttons, motion | `docs/design-system.md` |
| **SEO and GEO** | Metadata, favicon set, robots, sitemap, `llms.txt`, JSON-LD | `docs/seo-geo.md` |

---

## Project

- **Name**: Salud Económica (`Salud ` + accent `Económica`)
- **Purpose**: Tell people who find numbers hard, including people with dyscalculia, whether their money lasts until the end of the month, in words and colors. Entries are added by hand or imported from a bank statement PDF.
- **URL**: https://saludeco.vercel.app
- **Repository**: `CallejaJ/salud-economica`
- **Status**: Beta
- **Version**: 0.1.0 (`VERSION` in `lib/site.ts`, kept in sync with `package.json`; a test checks it)
- **Languages**: ES + EN
- **Output**: Next.js server build (not a static export) because `app/api/statement` keeps the Claude API key on the server
- **Environment**: `ANTHROPIC_API_KEY` (server only, optional), `NEXT_PUBLIC_SITE_URL` (optional); see `.env.example`
- **Module notes**: `lib/CLAUDE.md`, `app/api/CLAUDE.md`; architecture in `docs/architecture.md`

## Working Rules

- **Language**: talk to Jorge in Spanish. Code, comments, commit messages and `docs/` are written in **English**. **Exception for this project: `README.md` is written in Spanish** (Jorge asked for it); it still follows `docs/readme-rules.md`. UI strings exist in both languages.
- **Commits**: imperative sentence in English, capitalized, no prefix, no trailing period. One logical change per commit.
- **Branches**: work on a feature branch and open a pull request; never push straight to `main` unless Jorge asks.
- **Before pushing**: run `npm test` and `npm run build` (the build also type-checks). Run `npm run test:e2e` when the UI or the import flow changes.
- **Scope**: do what was asked. Do not add libraries, sections or features that the standard does not list without asking.
- **Decisions**: any choice that changes architecture, a dependency or the design system gets a record in `docs/decisions/`.
- **Secrets**: never commit `.env*` files except `.env.example`. `ANTHROPIC_API_KEY` is read only in `app/api/statement/route.ts`.

## Product Rules

- **Answer first**: the month view opens with the verdict sentence and color before any figure.
- **Friendly numbers**: amounts in the verdict are rounded with `roughAmount`; shares are described in words with `shareWord`, never as percentages.
- **Example data** is shown only while the user has no entries, is always labeled as an example and is read-only.
- **Privacy**: entries live only in `localStorage`; the PDF file never leaves the browser; only its text is sent to `/api/statement` and it is not stored.
- **Review before saving**: imported transactions are always shown for confirmation.

## Default Stack

| Layer | Choice | Notes |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server build for the API route |
| **UI** | React 19 + TypeScript 5 (strict) | Path alias `@/*` to the project root |
| **Animation** | Motion 12 (`motion/react`) | Wrapped in `MotionProvider` with `reducedMotion="user"` |
| **Styling** | One global stylesheet `app/globals.css` with CSS variables | Project tokens under `/* project */` |
| **i18n** | Own `LanguageProvider` + `lib/strings.ts` | `/` is `en`, `/es` is `es` (see `docs/decisions/0008-spanish-url.md`); choice stored in `localStorage("lang")` |
| **PDF text** | `pdfjs-dist` in the browser | See `docs/decisions/0003-pdfjs-in-browser.md` |
| **AI** | Claude API via `@anthropic-ai/sdk` | See `docs/decisions/0002-server-route-for-claude.md` |
| **Testing** | Jest 30 + ts-jest for logic, Playwright for E2E | Unit tests in `lib/__tests__/` |
| **CI** | GitHub Actions: `npm ci`, `npm test`, `npm run build` on Node 22 | `.github/workflows/test.yml` |
| **Hosting** | Vercel | `vercel.json` with `nosniff` and `no-referrer` headers |

## Design Rules (summary)

Follow `docs/design-system.md`. Project-specific choices:

- **Category tokens** `--cat-home`, `--cat-food`, `--cat-transport`, `--cat-bills`, `--cat-leisure`, `--cat-sports`, `--cat-school`, `--cat-activities`, `--cat-gifts`, `--cat-other`, `--cat-income`, defined in both themes.
- **Verdict card** uses larger type than the standard (26 px title, 18 px line) on purpose, for readers with dyscalculia; see `docs/decisions/0004-larger-verdict-type.md`.
- **Month view** is three columns from 1200 px, two from 900 px, one below.

## Definition of Done

- [ ] `npm test` and `npm run build` pass
- [ ] UI works in dark and light themes and in ES and EN
- [ ] Layout checked at 1600 px, 900 px, 640 px and 375 px wide, no horizontal scroll
- [ ] New strings added to both languages in `lib/strings.ts`
- [ ] README updated if a feature, stack item or setup step changed
- [ ] Footer version and `package.json` version match when releasing
- [ ] Decision record added if architecture, dependencies or design tokens changed
