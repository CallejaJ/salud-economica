# Architecture

## Overview

Salud Económica is a Next.js app served by Vercel. The page runs in the browser and keeps the user's entries in `localStorage`. The only server code is `/api/statement`, which sends the text of a bank statement to the Claude API and returns validated transactions. The PDF file itself is read in the browser with pdf.js and never uploaded.

## Components

| Component | Location | Role |
|---|---|---|
| **Language routes** | `app/(en)/`, `app/(es)/es/` | One root layout per language: English at `/` (x-default), Spanish at `/es`, each with `pageMetadata(lang)` |
| **App shell** | `components/SiteDocument.tsx` | `<html lang>`, theme bootstrap script, JSON-LD, language and motion providers, header and footer |
| **Page** | `components/HomePage.tsx` | Owns entries, selected month, active view and toasts; shows labeled example data when empty |
| **Month view** | `components/Verdict.tsx`, `MonthPace.tsx`, `MoneyBreakdown.tsx`, `EntryList.tsx` | Verdict sentence and color, pace of the current month (month passed next to money spent), money bar by category, entry list with delete and stop-from-month |
| **Entry form** | `components/EntryForm.tsx` | Expense or income, category picker, amount, note and recurring switch |
| **Guided tour** | `components/GuidedTour.tsx` | Spotlight and card over each `data-tour` element; opens on the first visit, remembered in `localStorage("salud-economica.tour")`, started again by the header "?" button |
| **Statement import** | `components/StatementImport.tsx`, `DropZone.tsx` | Reads the PDF, calls the API, falls back to the regex reader and shows the review list |
| **Money logic** | `lib/finance.ts` | `entriesFor`, `summarize`, `monthPace`, `roughAmount`, `shareWord`, `parseAmount`, month helpers |
| **Statement logic** | `lib/statement.ts` | `parseLines`, `guessCategory`, `cleanTransactions` |
| **PDF text** | `lib/pdfText.ts` | `pdfToLines` with `pdfjs-dist`, up to 20 pages |
| **Storage** | `lib/storage.ts` | `loadEntries`, `saveEntries` on `localStorage` |
| **Backup** | `lib/backup.ts`, `components/BackupPanel.tsx` | `toBackup`, `parseBackup`, `mergeEntries`; JSON download and load, all in the browser |
| **Statement API** | `app/api/statement/route.ts` | Rate limit, Claude call with a JSON schema, validation |
| **Rate limit** | `lib/rateLimit.ts` | In-memory fixed window per IP |
| **Strings and i18n** | `lib/strings.ts`, `lib/i18n.tsx` | English and Spanish dictionaries and the typed `t()` helper |
| **Site and SEO** | `lib/site.ts`, `lib/seo.ts`, `app/robots.ts`, `app/sitemap.ts` | URL, brand, version, author, geo data, per-language metadata and hreflang, JSON-LD, robots and sitemap |

## Data Flow

| Step | From | To | Data |
|---|---|---|---|
| 1 | User | `EntryForm` | Kind, category, amount, note, recurring flag |
| 2 | `components/HomePage.tsx` | `saveEntries` | Full entry list as JSON in `localStorage` |
| 3 | `components/HomePage.tsx` | `entriesFor`, `summarize` | Entries of the selected month, totals and verdict |
| 4 | User | `StatementImport` | PDF file |
| 5 | `pdfToLines` | `/api/statement` | Text lines only |
| 6 | `/api/statement` | Claude API | Statement text, JSON schema |
| 7 | `/api/statement` | `StatementImport` | Validated transactions, or an error code that triggers `parseLines` |
| 8 | User | `components/HomePage.tsx` | Confirmed transactions saved as entries in their own months |

## External Services

| Service | Used for | Key | Where it is restricted |
|---|---|---|---|
| **Vercel** | Hosting and the serverless API route | none | n/a |
| **Claude API** | Sorting statement text into transactions | `ANTHROPIC_API_KEY` | Server only; rate limited per IP |

## Constraints

- Entries are per browser and per device; clearing site data deletes them.
- Scanned PDFs without a text layer cannot be read.
- The in-memory rate limit is per serverless instance, not global.
- The verdict thresholds are fixed: under 10% of income left is "tight".
