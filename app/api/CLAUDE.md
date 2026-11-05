# app/api Module

- `statement/route.ts` is the only server code. It receives `{ lines: string[] }` (text extracted in the browser) and returns `{ transactions }`.
- `ANTHROPIC_API_KEY` is read only here and must never reach the client. Without it the route returns 501 and the client falls back to `parseLines`.
- Every request goes through `rateLimit` (10 per minute per IP, in memory) before calling Claude.
- The response is validated with `cleanTransactions`; never return model output unchecked.
- Never log or store the statement text.
- Error bodies are short codes (`rate_limited`, `not_configured`, `too_long`…); the UI maps them to messages.
