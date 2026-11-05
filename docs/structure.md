# Repository Structure

Every project follows a modular layout built for working with Claude Code: a short project memory (`CLAUDE.md`), reusable AI workflows (`.claude/skills/`), automated checks (`.claude/hooks/`), documented decisions (`docs/`) and module-level notes next to the code.

## Folders

| Path | Purpose | Required |
|---|---|---|
| `CLAUDE.md` | Project memory and instructions for Claude; starts from the master standard | Yes |
| `README.md` | Public reference, follows `docs/readme-rules.md` | Yes |
| `.env.example` | Every environment variable with placeholders and grouped comments | When env vars exist |
| `docs/architecture.md` | Components, data flow and external services, as tables | Yes |
| `docs/decisions/` | Architecture decision records, `NNNN-short-title.md` | Yes (may start empty) |
| `docs/runbooks/` | Operational guides: setup, deploy, release, incident | When there is something to run |
| `.claude/settings.json` | Permissions and hook wiring for Claude Code | Yes |
| `.claude/hooks/` | Scripts that hooks call (`check.sh` runs tests and build) | Yes |
| `.claude/skills/code-review/` | Review checklist aligned with this standard | Yes |
| `.claude/skills/refactor/` | Safe refactor procedure | Yes |
| `.claude/skills/release/` | Version bump, footer, README, tag and deploy | Yes |
| `tools/scripts/` | Maintenance scripts (icon generation, data import) | Optional |
| `tools/prompts/` | Reusable prompts and sources for LinkedIn posts and covers | Optional |
| `app/` | Next.js routes, `layout.tsx`, `globals.css`, `robots.ts`, `sitemap.ts`, `api/` | Yes |
| `components/` | React components, one per file, PascalCase file names | Yes |
| `lib/` | Framework-free logic, `strings.ts`, `i18n.tsx`, `site.ts`, `seo.ts` | Yes |
| `lib/__tests__/` | Jest unit tests for `lib/` | Yes |
| `public/` | Favicon set, `og.png`, `llms.txt`, `site.webmanifest`, `images/logo.svg` | Yes |
| `tests/` | E2E tests (`tests/e2e/`) and the static server they use | When there is a UI |
| `.github/workflows/test.yml` | CI: `npm ci`, `npm test`, `npm run build` on Node 22 | Yes |

## Mapping From the Generic Layout

| Generic folder | In a Next.js project |
|---|---|
| `documentation/` | `docs/` |
| `documentation/execution-guides/` | `docs/runbooks/` |
| `.claude/configuration.json` | `.claude/settings.json` |
| `.claude/hooks/` | `.claude/hooks/` |
| `.claude/skills/{code-review,refactor,release}/` | same |
| `tools/scripts/`, `tools/instructions/` | `tools/scripts/`, `tools/prompts/` |
| `src/api/` | `app/api/` |
| `src/persistence/` | `lib/` (or `lib/db/` when there is a database) |

## Module CLAUDE.md

A folder gets its own `CLAUDE.md` only when it has rules a newcomer would get wrong. Keep it under 40 lines and limited to:

- What the module owns and what it must not import
- Invariants (e.g. "`lib/` never imports React", "API keys never reach the client")
- How to test it
- Known pitfalls

Example: `app/api/CLAUDE.md` in Route Planner would document the rate limit, the server-only Routes API key and the request schema.

## Naming

| Item | Convention | Example |
|---|---|---|
| **Repository** | kebab-case | `route-planner-andalucia` |
| **Brand** | PascalCase words, accent on the second word | `PrintAll` + `PDFs` |
| **Components** | PascalCase file and default export | `SiteHeader.tsx` |
| **Logic modules** | camelCase file | `planCore.ts`, `format.ts` |
| **CSS classes** | kebab-case, semantic | `.header-actions`, `.beta-badge` |
| **Decision records** | `NNNN-kebab-title.md` | `0003-static-export.md` |

## Keeping Claude Context Small

- `CLAUDE.md` holds rules and pointers, not documentation; details live in `docs/`.
- Prefer a skill over repeating the same instructions in chat.
- Hooks enforce what must always happen (tests, build), so the instructions do not have to repeat it.
