# SEO and GEO

Every public project is prepared for classic search engines and for generative answer engines (ChatGPT, Claude, Perplexity, Google AI). Reference: `CallejaJ/printallpdfs` (`app/layout.tsx`, `lib/seo.ts`, `app/robots.ts`, `app/sitemap.ts`, `public/llms.txt`).

## Required Files

| File | Content |
|---|---|
| `lib/site.ts` | `SITE_URL` (overridable with `NEXT_PUBLIC_SITE_URL`), `SITE_NAME`, `AUTHOR`, `GEO` |
| `lib/seo.ts` | `SEO_TITLE`, `SEO_DESCRIPTION`, `BREADCRUMBS`, `structuredData()` |
| `app/layout.tsx` (here `app/(en)` and `app/(es)` layouts with `components/SiteDocument.tsx`) | `metadata` and `viewport` exports, theme script, JSON-LD script |
| `app/robots.ts` | Allow `*` plus named AI crawlers, link to the sitemap |
| `app/sitemap.ts` | Every public route plus `/llms.txt` |
| `public/llms.txt` | Markdown summary for language models, EN with a Spanish paragraph |
| `public/og.png` | 1200×630 Open Graph image |
| `public/site.webmanifest` | Name, colors `#0f172a`, icons 192, 512 and SVG |
| Favicon set | `favicon.ico` (48), `favicon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` |

Static routes in `robots.ts` and `sitemap.ts` declare `export const dynamic = "force-static"` so they work with `output: "export"`.

## Metadata Checklist

| Field | Rule |
|---|---|
| **title** | `{ default: SEO_TITLE, template: "%s | SITE_NAME" }`; `SEO_TITLE` = `Brand: what it does` |
| **description** | 140 to 160 characters, factual, mentions the main use case |
| **keywords** | English and Spanish terms plus `Málaga` |
| **alternates.canonical** | `/` |
| **openGraph** | type `website`, `locale: "es_ES"`, `alternateLocale: ["en_US"]` (link previews are shown in Spanish), `og.png` with alt text |
| **twitter** | `summary_large_image` |
| **robots** | index and follow, `max-image-preview: large` |
| **authors / creator** | Jorge Calleja, `https://jorgecalleja.dev` |
| **other (geo)** | `geo.region: ES-AN`, `geo.placename: Málaga`, `geo.position: 36.7213;-4.4214`, `ICBM` |
| **viewport.themeColor** | `#0f172a` |

## Structured Data

One `<script type="application/ld+json">` with an `@graph`, escaped with `.replace(/</g, "\\u003c")`:

| Node | Purpose |
|---|---|
| **WebSite** | Name, URL, description, `inLanguage: ["en", "es"]`, publisher = author |
| **Person** | Jorge Calleja, `jobTitle: "Diseño Web Málaga"`, address Málaga, Andalucía, ES |
| **WebApplication** (or the right type) | Category, free offer in EUR, version, feature list, `areaServed`, screenshot |
| **BreadcrumbList** | Mirrors the visible breadcrumbs: Jorge Calleja › Project |
| **HowTo** | When the page explains steps; built from the same strings the UI shows |
| **FAQPage** | When the page has a help section; built from the same strings |

Structured data must only describe content that is visible on the page.

## AI Crawlers Allowed

`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `Bingbot`.

## llms.txt Shape

```markdown
# ProjectName

> One-paragraph summary: what it is, who it is for, the key constraint (privacy, free, beta).

ProjectName is made by Jorge Calleja (Diseño Web Málaga, Andalucía, Spain). ...

## What it does
## Limits
## Privacy
## En español
## Links
```
