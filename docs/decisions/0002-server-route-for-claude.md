# 0002. Server Route for the Claude API

- **Date**: 2026-11-05
- **Status**: Accepted

## Context

Bank statements differ between banks, and a regex reader misses or misreads many of them. Claude reads them well, but the API key must stay secret, so the call cannot happen in the browser. The standard prefers `output: "export"` when an app has no server code.

## Decision

Build Salud Económica as a regular Next.js server build with one route, `app/api/statement/route.ts`, that calls the Claude API through `@anthropic-ai/sdk` with a JSON schema for the output. The browser sends only the extracted text. The route is rate limited per IP and returns 501 when `ANTHROPIC_API_KEY` is missing, so the app keeps working with the regex fallback.

## Alternatives

| Option | Why not |
|---|---|
| **Static export, regex only** | Unreliable across banks; users would have to fix most categories by hand |
| **Send the PDF file to the server** | Moves the user's document off the device; text is enough |
| **Browser-side key** | Anyone could read and spend the key |

## Consequences

- The project is not a static export and needs a Node runtime on Vercel
- Each import costs one Claude API call; the rate limit caps abuse per instance
