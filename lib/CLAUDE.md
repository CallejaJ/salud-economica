# lib Module

- Framework-free logic: no React imports except `i18n.tsx`.
- `finance.ts` owns entries, months, the monthly summary and the verdict thresholds (`TIGHT_SHARE`).
- `statement.ts` owns statement parsing; `parseLines` is the offline fallback and `cleanTransactions` validates anything that comes from the API.
- `pdfText.ts` is browser-only (pdf.js); import it dynamically from client components.
- `storage.ts` is the only place that touches `localStorage` for entries.
- `strings.ts` holds every UI string in `en` and `es`; a missing key in one language is a type error and a test failure.
- `site.ts` is the only place for the URL, brand, version, author and geo data.
- Every exported function with logic has a test in `__tests__/`.
