"use client";

import { motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import { monthPace, roughAmount, type Summary } from "@/lib/finance";
import { euros } from "@/lib/format";

const SENTENCE = { calm: "paceCalm", even: "paceEven", fast: "paceFast" } as const;

/** Answers "am I on track?" for the current month: one sentence, then the month passed next to the money spent. */
export default function MonthPace({ summary, month }: { summary: Summary; month: string }) {
  const { t, lang } = useLang();
  const pace = monthPace(summary, month);
  if (!pace) return null;

  const { day, days, spent, income, level } = pace;
  const money = (n: number) => euros(roughAmount(n), lang);
  const monthShare = (day / days) * 100;
  const moneyShare = Math.min(spent / income, 1) * 100;
  const sentence = level === "over" ? t("paceOver") : t(SENTENCE[level], day);

  return (
    <motion.section
      id="pace"
      className={`panel pace pace-${level}`}
      data-pace={level}
      aria-labelledby="paceTitle"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.03 }}
    >
      <h2 id="paceTitle">{t("paceTitle")}</h2>
      <p className="pace-line">
        <span className="pace-light" aria-hidden="true" />
        <span>{sentence}</span>
      </p>

      <div className="pace-rows">
        <div className="pace-row">
          <div className="pace-label">
            <span>{t("paceMonth")}</span>
            <b>{t("paceMonthValue", day, days)}</b>
          </div>
          <span className="pace-track">
            <motion.i className="pace-fill-month" initial={{ width: 0 }} animate={{ width: `${monthShare}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
          </span>
        </div>
        <div className="pace-row">
          <div className="pace-label">
            <span>{t("paceMoney")}</span>
            <b>{t("paceMoneyValue", money(spent), money(income))}</b>
          </div>
          <span className="pace-track">
            <motion.i className="pace-fill-money" initial={{ width: 0 }} animate={{ width: `${moneyShare}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
            <span className="pace-mark" style={{ left: `${monthShare}%` }} aria-hidden="true" />
          </span>
        </div>
      </div>
      <p className="pace-note">{t("paceMark")}</p>
    </motion.section>
  );
}
