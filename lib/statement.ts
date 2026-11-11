// Bank statement parsing: turns the text lines of a PDF statement into transactions.
// The server route asks Claude first; `parseLines` is the offline fallback.

import { CATEGORIES, type Category } from "./finance";

export interface Transaction {
  /** YYYY-MM-DD */
  date: string;
  description: string;
  /** Negative for charges, positive for credits. */
  amount: number;
  category: Category | "income";
}

const KEYWORDS: [Category, RegExp][] = [
  ["home", /alquiler|hipoteca|comunidad|\bibi\b|rent|mortgage/],
  ["food", /mercadona|carrefour|lidl|aldi|\bdia\b|eroski|alcampo|consum|supermercado|hipercor|ahorramas|grocer/],
  ["transport", /gasolin|repsol|cepsa|\bbp\b|galp|renfe|\bemt\b|metro|taxi|uber|cabify|parking|peaje|fuel/],
  ["bills", /endesa|iberdrola|naturgy|\bluz\b|agua|\bgas\b|movistar|vodafone|orange|yoigo|digi|seguro|mapfre|\baxa\b|insurance/],
  ["activities", /extraescolar|scout|atletismo|campamento|conservatorio|escuela de (m[uú]sica|idiomas|danza)|academia de (ingl[eé]s|idiomas|m[uú]sica|danza|baile)/],
  ["sports", /gimnasio|\bgym\b|basic.?fit|mcfit|holmes place|decathlon|p[aá]del|piscina|polideportivo|club deportivo/],
  ["school", /colegio|escuela|matr[ií]cula|guarder[ií]a|comedor|aula matinal|\bampa\b|uniforme|libros de texto/],
  ["gifts", /regalo|florister[ií]a|juguet|toys ?r ?us|interflora/],
  ["leisure", /netflix|spotify|hbo|disney|amazon|restaurante|\bbar\b|cine|zara|primark|glovo|just eat/],
];

export function guessCategory(text: string): Category {
  const t = text.toLowerCase();
  for (const [cat, re] of KEYWORDS) if (re.test(t)) return cat;
  return "other";
}

const DATE_RE = /(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?/;
const AMOUNT_RE = /-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+,\d{2}/g;

function toNumber(es: string): number {
  return Number(es.replace(/\./g, "").replace(",", "."));
}

/**
 * Regex fallback: a line with a date and at least one Spanish-format amount is a transaction.
 * When a line has two or more amounts, the second-to-last is the movement (the last is the balance).
 */
export function parseLines(lines: string[], year: number = new Date().getFullYear()): Transaction[] {
  const out: Transaction[] = [];
  for (const line of lines) {
    const d = line.match(DATE_RE);
    const amounts = line.match(AMOUNT_RE);
    if (!d || !amounts) continue;
    const raw = amounts.length >= 2 ? amounts[amounts.length - 2] : amounts[0];
    const amount = toNumber(raw);
    if (!Number.isFinite(amount) || amount === 0) continue;
    const day = Number(d[1]);
    const month = Number(d[2]);
    if (day < 1 || day > 31 || month < 1 || month > 12) continue;
    const y = d[3] ? Number(d[3].length === 2 ? `20${d[3]}` : d[3]) : year;
    const description =
      line.replace(DATE_RE, "").replace(AMOUNT_RE, "").replace(/€|EUR/g, "").replace(/\s+/g, " ").trim().slice(0, 60) ||
      "Movimiento";
    out.push({
      date: `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      description,
      amount,
      category: amount > 0 ? "income" : guessCategory(description),
    });
  }
  return out;
}

/** Keeps only well-formed transactions and fixes the category sign rule. */
export function cleanTransactions(list: unknown): Transaction[] {
  if (!Array.isArray(list)) return [];
  const cats = new Set<string>(CATEGORIES);
  return list.flatMap((x): Transaction[] => {
    const t = x as Partial<Transaction>;
    const amount = Number(t?.amount);
    if (!Number.isFinite(amount) || amount === 0) return [];
    if (typeof t.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) return [];
    const description = String(t.description ?? "").trim().slice(0, 80) || "Movimiento";
    const category =
      amount > 0 ? "income" : cats.has(String(t.category)) ? (t.category as Category) : guessCategory(description);
    return [{ date: t.date, description, amount, category }];
  });
}
