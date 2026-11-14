"use client";

import { motion } from "motion/react";
import { lift } from "./motion";
import { useLang } from "@/lib/i18n";
import { daysLeft, monthKey, roughAmount, type Summary } from "@/lib/finance";
import { euros } from "@/lib/format";

export type Tab = "month" | "add" | "import";

const TITLE = { good: "vGood", tight: "vTight", short: "vShort", noIncome: "vNoIncome", empty: "vEmpty" } as const;

/** The month's answer in one sentence and one color, before any table of figures. */
export default function Verdict({
  summary,
  month,
  example,
  onGo,
}: {
  summary: Summary;
  month: string;
  example: boolean;
  onGo: (tab: Tab) => void;
}) {
  const { t, lang } = useLang();
  const { verdict, left, expenses } = summary;
  const money = (n: number) => euros(roughAmount(n), lang);

  let line: string;
  if (verdict === "good") line = t("lineGood", money(left));
  else if (verdict === "tight") line = t("lineTight", money(left));
  else if (verdict === "short") line = t("lineShort", money(left));
  else if (verdict === "noIncome") line = t("lineNoIncome", money(expenses));
  else line = t("lineEmpty");

  const days = daysLeft(month);
  const current = month === monthKey(new Date());
  const perDay = left > 0 && verdict !== "noIncome" ? t("perDay", money(left / days), days, current) : null;
  const showActions = example || verdict === "empty";

  return (
    <motion.section
      id="verdict"
      data-tour="verdict"
      className={`verdict verdict-${verdict}`}
      data-verdict={verdict}
      aria-live="polite"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={lift}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {example && <span className="example-badge">{t("exampleBadge")}</span>}
      <div className="verdict-head">
        <span className="verdict-light" aria-hidden="true" />
        <h2>{t(TITLE[verdict])}</h2>
      </div>
      <p className="verdict-line">{line}</p>
      {perDay && <p className="verdict-perday">{perDay}</p>}
      {showActions && (
        <div className="verdict-actions">
          <button type="button" className="primary" onClick={() => onGo("add")}>
            {example ? t("addMine") : t("add")}
          </button>
          <button type="button" className="secondary" onClick={() => onGo("import")}>
            {t("upload")}
          </button>
        </div>
      )}
    </motion.section>
  );
}
