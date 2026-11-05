# Salud Económica

<div align="center">
    <img src="https://img.shields.io/badge/HTML5-Vanilla-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/Node.js-20+-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Claude-Opus_5.5-D97757?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude" />
    <img src="https://img.shields.io/badge/Anthropic_SDK-1.1.0-191919?style=for-the-badge&logo=anthropic&logoColor=white" alt="Anthropic SDK" />
    <img src="https://img.shields.io/badge/PDF.js-3.11.174-B40000?style=for-the-badge" alt="PDF.js" />
    <img src="https://img.shields.io/badge/Storage-localStorage-14507D?style=for-the-badge" alt="localStorage" />
    <img src="https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

<p align="center">
    <i>A personal finance tool that answers "will I make it to the end of the month?" in words and colors, designed for people with dyscalculia.</i>
</p>

## Monthly Verdict

The home screen leads with a single answer instead of a table of figures. The verdict is computed from the month's income minus its expenses, and every amount shown in it is rounded ("about 250 €") so it can be read at a glance.

| Verdict | Condition | Color | Extra guidance |
|---|---|---|---|
| **Sí, llegas a fin de mes** | Money left is 10% of income or more | Green | Amount left per remaining day |
| **Llegas, pero muy justo** | Money left is under 10% of income | Amber | Amount left for unexpected costs |
| **No llegas este mes** | Expenses exceed income | Red | Amount missing |
| **Falta apuntar lo que cobras** | Expenses recorded but no income | Amber | Total spent so far |

## Spending Categories

Every expense belongs to one of six categories, each with its own icon and color so entries can be recognized without reading numbers. Categories also drive the money bar and the per-category breakdown, which describes each share in words ("a third of what comes in").

| Category | Typical entries | Auto-detected keywords |
|---|---|---|
| **Casa** | Rent, mortgage, community fees | `alquiler`, `hipoteca`, `comunidad` |
| **Comida** | Groceries | `mercadona`, `carrefour`, `lidl` |
| **Transporte** | Fuel, public transport, car | `repsol`, `renfe`, `parking` |
| **Facturas** | Utilities, phone, insurance | `endesa`, `movistar`, `mapfre` |
| **Ocio** | Eating out, subscriptions, clothing | `netflix`, `spotify`, `zara` |
| **Otros** | Anything else | Fallback |

## Bank Statement Import

Users can upload the PDF statement downloaded from their bank. The PDF is parsed in the browser with **PDF.js**, so the file itself never leaves the device; only the extracted text lines are sent to `/api/extracto`. Every detected transaction is shown for review, with a checkbox and an editable category, before anything is saved.

| Stage | Where it runs | Detail |
|---|---|---|
| **Text extraction** | Browser (`pdfToLines`) | Groups PDF text items into lines by vertical position, up to 20 pages |
| **AI parsing** | Vercel function (`api/extracto.js`) | Claude returns transactions validated against a JSON schema |
| **Fallback parsing** | Browser (`heuristicParse`) | Regex match on date and Spanish-format amount when the API is unavailable |
| **Review** | Browser (`renderReview`) | User confirms or discards each transaction before saving |

## Recurring Entries

Entries marked "Se repite todos los meses" carry a start month (`mes`) and an optional end month (`hasta`). `movsFor(month)` includes every recurring entry whose range covers the selected month, so rent or a salary only has to be entered once. Deleting a recurring entry offers two options: remove it from the current month onward, or delete it from every month.

## System Architecture

| Component | Role |
|---|---|
| **`index.html`** | Single page holding markup, styles and logic, with no build step |
| **Monthly view** | Renders the verdict, the money bar, the category breakdown and the entry list |
| **Entry form** | Captures income or expenses with large category buttons and a single amount field |
| **PDF importer** | Extracts statement text in the browser and drives the review list |
| **`api/extracto.js`** | Serverless function that sends statement text to Claude and returns structured transactions |
| **Claude API** | Reads Spanish bank statements and classifies each transaction |
| **localStorage** | Stores entries under `saludeconomica.movs` on the user's device |

## Technology Stack

- **Frontend**: HTML5, CSS custom properties with light and dark themes, vanilla JavaScript
- **Fonts**: Archivo, IBM Plex Sans, IBM Plex Mono (Google Fonts)
- **PDF Parsing**: PDF.js 3.11.174 from cdnjs
- **Backend/API**: Node.js 20+ serverless function on Vercel
- **AI**: Claude Opus 5.5 via `@anthropic-ai/sdk` 1.1.0, structured JSON output, server-side refusal fallback
- **Storage**: Browser `localStorage`
- **Deployment**: Vercel, auto-deployed from `main`

## Key Features

1. **Answer first, numbers second** — the month is summarized as one sentence and one color before any figure appears.
2. **Rounded, worded amounts** — totals read as "about 250 €" and shares as "a third of what comes in".
3. **Daily allowance** — the remaining money is divided by the days left in the month.
4. **Visual money bar** — income is the full bar, each category is a colored block and the striped area is what is left.
5. **Bank PDF import with review** — transactions are extracted and categorized automatically, then confirmed one by one.
6. **Enter once, repeat monthly** — recurring income and expenses fill future months on their own.
7. **Private by default** — entries stay on the device and the PDF file is never uploaded.

## Testing Strategy

There is no automated test suite yet. Each change is checked by rendering the page in headless Chromium (Playwright) at desktop and phone widths in light and dark themes, confirming there are no console errors or horizontal overflow, and syntax-checking the inline script and `api/extracto.js` with `node --check`. The deployed function is verified by calling `/api/extracto` on the production URL, and PDF import is checked manually with real bank statements.

## Project Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```env
   # Claude API (optional: without it, PDF import uses the regex fallback)
   ANTHROPIC_API_KEY=sk-ant-your-key
   ```

3. Start the development server with the Vercel CLI, which serves `index.html` and the `api/` function together:

   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000`

5. To deploy, add `ANTHROPIC_API_KEY` under Settings, Environment Variables in the Vercel project and push to `main`.

---

Built for people who find numbers hard, by [Diseño Web Málaga](https://jorgecalleja.dev).
