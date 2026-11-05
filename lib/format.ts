import type { Lang } from "./strings";

const LOCALE: Record<Lang, string> = { en: "en-GB", es: "es-ES" };

/** Whole euros, grouped by the language's convention: "1.450 €" or "€1,450". */
export function euros(n: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang], { style: "currency", currency: "EUR", maximumFractionDigits: 0, minimumFractionDigits: 0, useGrouping: true }).format(Math.round(n));
}

/** "November 2026" / "Noviembre 2026" */
export function monthLabel(key: string, lang: Lang): string {
  const [y, m] = key.split("-").map(Number);
  const name = new Date(y, m - 1, 1).toLocaleDateString(LOCALE[lang], { month: "long" });
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
}

/** "3 November" / "3 de noviembre" */
export function dayLabel(date: string, lang: Lang): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long" });
}
