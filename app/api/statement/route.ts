// Sorts the text of a bank statement into transactions with Claude.
// The browser extracts the text from the PDF; the file itself never reaches the server.
// Requires ANTHROPIC_API_KEY. Without it the route answers 501 and the client uses its regex fallback.
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit } from "@/lib/rateLimit";
import { cleanTransactions } from "@/lib/statement";

export const runtime = "nodejs";

const MAX_CHARS = 200_000;
const CATEGORIES = ["home", "food", "transport", "bills", "leisure", "other", "income"];

const SCHEMA = {
  type: "object",
  properties: {
    transactions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string", description: "YYYY-MM-DD" },
          description: { type: "string" },
          amount: { type: "number" },
          category: { type: "string", enum: CATEGORIES },
        },
        required: ["date", "description", "amount", "category"],
        additionalProperties: false,
      },
    },
  },
  required: ["transactions"],
  additionalProperties: false,
};

const SYSTEM = (year: number) =>
  [
    "You read Spanish bank statements and extract only the account transactions: ignore balances, totals, headers and ads.",
    "amount is negative for charges and expenses and positive for credits and income.",
    "description is short and clear, at most 40 characters, in the statement's language (for example \"Mercadona\" instead of the full card code).",
    "category: home (rent, mortgage, community fees), food (supermarkets), transport, bills (electricity, water, gas, phone, insurance), leisure (restaurants, subscriptions, clothes), other; use income for any positive amount.",
    `If a date has no year, use ${year}.`,
  ].join(" ");

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  let lines: unknown;
  try {
    ({ lines } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const text = Array.isArray(lines) ? lines.map(String).join("\n") : "";
  if (!text.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (text.length > MAX_CHARS) return NextResponse.json({ error: "too_long" }, { status: 413 });

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system: SYSTEM(new Date().getFullYear()),
      messages: [{ role: "user", content: `Statement text:\n\n${text}` }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "refused" }, { status: 422 });
    }
    const block = response.content.find((b) => b.type === "text");
    const data = JSON.parse(block && "text" in block ? block.text : "{}");
    return NextResponse.json({ transactions: cleanTransactions(data.transactions) });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "upstream_busy" }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return NextResponse.json({ error: "upstream_error" }, { status: 502 });
    }
    console.error(err);
    return NextResponse.json({ error: "unexpected" }, { status: 500 });
  }
}
