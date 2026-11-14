"use client";

import { motion } from "motion/react";
import { lift } from "./motion";
import { useLang } from "@/lib/i18n";
import { rankCategories, shareWord, type Summary } from "@/lib/finance";
import { euros } from "@/lib/format";
import CategoryBadge from "./CategoryBadge";
import { CATEGORY_NAME } from "./labels";

const SHARE = { half: "shareHalf", third: "shareThird", fifth: "shareFifth", tenth: "shareTenth" } as const;

/** Income as a full bar split by category, plus one row per category with a share in words. */
export default function MoneyBreakdown({ summary }: { summary: Summary }) {
  const { t, lang } = useLang();
  const { income, expenses, left, byCategory, otherNotes } = summary;
  if (!income && !expenses) return null;

  const total = Math.max(income, expenses) || 1;
  const order = rankCategories(byCategory);
  const max = Math.max(...order.map((c) => byCategory[c]!), 1);

  return (
    <motion.section
      className="panel money"
      data-tour="money"
      aria-labelledby="moneyTitle"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={lift}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.06 }}
    >
      <h2 id="moneyTitle">{t("moneyTitle")}</h2>
      <p className="panel-sub">{t("moneySub")}</p>

      <div className={`money-bar${left < 0 ? " over" : ""}`} role="img" aria-label={`${t("moneyIn")} ${euros(income, lang)}, ${t("moneyOut")} ${euros(expenses, lang)}`}>
        {order.map((c) => (
          <motion.i
            key={c}
            className={`cat-${c}`}
            title={t(CATEGORY_NAME[c])}
            initial={{ width: 0 }}
            animate={{ width: `${(byCategory[c]! / total) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ))}
        {left > 0 && (
          <motion.i
            className="money-left"
            initial={{ width: 0 }}
            animate={{ width: `${(left / total) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </div>
      <div className="money-legend">
        <span>
          {t("moneyIn")}: <b>{euros(income, lang)}</b>
        </span>
        <span>
          {t("moneyOut")}: <b>{euros(expenses, lang)}</b>
        </span>
      </div>

      <ul className="cat-rows">
        {order.map((c) => {
          const share = shareWord(byCategory[c]!, income);
          return (
            <li key={c} className="cat-row">
              <CategoryBadge category={c} />
              <div className="cat-row-main">
                <span className="cat-row-name">{t(CATEGORY_NAME[c])}</span>
                <span className="cat-track">
                  <i className={`cat-${c}`} style={{ width: `${(byCategory[c]! / max) * 100}%` }} />
                </span>
              </div>
              <div className="cat-row-amount">
                <b>{euros(byCategory[c]!, lang)}</b>
                {share && <small>{t(SHARE[share])}</small>}
              </div>
              {c === "other" && otherNotes.length > 0 && (
                <ul className="cat-notes">
                  {otherNotes.map((n) => (
                    <li key={n.note}>
                      <span>{n.note}</span>
                      <span>{euros(n.amount, lang)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}
