// Money logic: entries, months, monthly summary and the verdict shown to the user.
// Framework-free so it can be unit tested and reused on the server.

export type Kind = "expense" | "income";
export type Category = "home" | "food" | "transport" | "bills" | "leisure" | "other";
export const CATEGORIES: Category[] = ["home", "food", "transport", "bills", "leisure", "other"];

export interface Entry {
  id: string;
  kind: Kind;
  /** Expense category; incomes use "income". */
  category: Category | "income";
  /** Always positive; `kind` gives the sign. */
  amount: number;
  note: string;
  /** Month the entry belongs to, or the first month of a recurring entry (YYYY-MM). */
  month: string;
  /** Repeats every month from `month` until `until` (inclusive) or forever. */
  recurring: boolean;
  until?: string;
  /** Booking date from a bank statement (YYYY-MM-DD). */
  date?: string;
  source?: "manual" | "statement";
  createdAt: number;
}

export type VerdictLevel = "good" | "tight" | "short" | "noIncome" | "empty";

export interface Summary {
  income: number;
  expenses: number;
  left: number;
  byCategory: Partial<Record<Category, number>>;
  verdict: VerdictLevel;
}

/** Share of income left below which the month is "tight". */
export const TIGHT_SHARE = 0.1;

export const monthKey = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

export function daysInMonth(key: string): number {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** Days left including today when `key` is the current month, otherwise the whole month. */
export function daysLeft(key: string, today: Date = new Date()): number {
  const total = daysInMonth(key);
  return key === monthKey(today) ? total - today.getDate() + 1 : total;
}

/**
 * Parses an amount typed in Spanish or English format: "12,50", "1.234,56", "1,234.56", "25 €".
 * Returns NaN when the text is not a number.
 */
export function parseAmount(text: string): number {
  let s = String(text ?? "").trim().replace(/\s|€|EUR/gi, "");
  if (!s) return NaN;
  if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
  return Number(s);
}

/** Entries that apply to a month: the month's own entries plus active recurring ones. */
export function entriesFor(entries: Entry[], key: string): Entry[] {
  return entries.filter((e) => e.month === key || (e.recurring && e.month <= key && (!e.until || e.until >= key)));
}

export function summarize(entries: Entry[]): Summary {
  let income = 0;
  let expenses = 0;
  const byCategory: Partial<Record<Category, number>> = {};
  for (const e of entries) {
    if (e.kind === "income") income += e.amount;
    else {
      expenses += e.amount;
      const c = e.category as Category;
      byCategory[c] = (byCategory[c] ?? 0) + e.amount;
    }
  }
  const left = income - expenses;
  let verdict: VerdictLevel;
  if (entries.length === 0) verdict = "empty";
  else if (income === 0) verdict = "noIncome";
  else if (left < 0) verdict = "short";
  else if (left / income < TIGHT_SHARE) verdict = "tight";
  else verdict = "good";
  return { income, expenses, left, byCategory, verdict };
}

/** Friendly rounding for people who find exact figures hard: tens above 100, units below. */
export function roughAmount(n: number): number {
  const a = Math.abs(n);
  return a >= 100 ? Math.round(a / 10) * 10 : Math.round(a);
}

export type ShareWord = "half" | "third" | "fifth" | "tenth" | null;

/** Describes a part of the income in words instead of a percentage. */
export function shareWord(part: number, whole: number): ShareWord {
  if (whole <= 0) return null;
  const r = part / whole;
  if (r >= 0.45) return "half";
  if (r >= 0.3) return "third";
  if (r >= 0.2) return "fifth";
  if (r >= 0.1) return "tenth";
  return null;
}

/** Categories with spending, largest first. */
export function rankCategories(byCategory: Summary["byCategory"]): Category[] {
  return CATEGORIES.filter((c) => (byCategory[c] ?? 0) > 0).sort((a, b) => byCategory[b]! - byCategory[a]!);
}

export const newId = (): string => `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
