"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import { monthPace, roughAmount, type Summary } from "@/lib/finance";
import { euros } from "@/lib/format";

const SENTENCE = { calm: "paceCalm", even: "paceEven", fast: "paceFast" } as const;

type Bar = "month" | "money";

/**
 * Answers "am I on track?" for the current month: one sentence, then the month passed next to the money spent.
 * Pointing at a bar, focusing it or tapping it lifts the bar and shows what it means in words.
 */
export default function MonthPace({ summary, month }: { summary: Summary; month: string }) {
  const { t, lang } = useLang();
  const [active, setActive] = useState<Bar | null>(null);
  const uid = useId();
  const pace = monthPace(summary, month);
  if (!pace) return null;

  const { day, days, spent, income, level } = pace;
  const money = (n: number) => euros(roughAmount(n), lang);
  const monthShare = (day / days) * 100;
  const moneyShare = Math.min(spent / income, 1) * 100;
  const sentence = level === "over" ? t("paceOver") : t(SENTENCE[level], day);

  const tips: Record<Bar, string[]> = {
    month: [t("paceTipMonth", day, days - day)],
    money: [
      level === "over" ? t("paceTipOver", money(spent)) : t("paceTipMoney", money(spent), money(income - spent)),
      t("paceTipExpected", money((income * day) / days)),
    ],
  };

  const rows: { bar: Bar; label: string; value: string; share: number }[] = [
    { bar: "month", label: t("paceMonth"), value: t("paceMonthValue", day, days), share: monthShare },
    { bar: "money", label: t("paceMoney"), value: t("paceMoneyValue", money(spent), money(income)), share: moneyShare },
  ];

  // The row is 8px wider than its track on each side, so positions on the track are offset into row space.
  const onTrack = (share: number) => `calc(8px + (100% - 16px) * ${share / 100})`;

  const show = (bar: Bar) => setActive(bar);
  const hide = (bar: Bar) => setActive((a) => (a === bar ? null : a));

  return (
    <motion.section
      id="pace"
      className={`panel pace pace-${level}`}
      data-pace={level}
      aria-labelledby="paceTitle"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.03 }}
    >
      <h2 id="paceTitle">{t("paceTitle")}</h2>
      <p className="pace-line">
        <span className="pace-light" aria-hidden="true" />
        <span>{sentence}</span>
      </p>

      <div className="pace-rows">
        {rows.map(({ bar, label, value, share }) => {
          const on = active === bar;
          const tipId = `${uid}-${bar}`;
          return (
            <div
              key={bar}
              className={`pace-row${on ? " active" : ""}`}
              data-bar={bar}
              tabIndex={0}
              role="button"
              aria-expanded={on}
              aria-describedby={on ? tipId : undefined}
              onPointerEnter={(e) => e.pointerType === "mouse" && show(bar)}
              onPointerLeave={(e) => e.pointerType === "mouse" && hide(bar)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && show(bar)}
              onBlur={() => hide(bar)}
              onClick={(e) => {
                // A mouse already opened it on hover; a tap toggles it.
                if ((e.nativeEvent as PointerEvent).pointerType === "mouse") show(bar);
                else setActive((a) => (a === bar ? null : bar));
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setActive(null);
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive((a) => (a === bar ? null : bar));
                }
              }}
            >
              <div className="pace-label">
                <span>{label}</span>
                <b>{value}</b>
              </div>
              <motion.span className="pace-track" animate={{ scaleY: on ? 1.3 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                <motion.i
                  className={`pace-fill-${bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${share}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: bar === "money" ? 0.15 : 0 }}
                />
                {bar === "money" && <span className="pace-mark" style={{ left: `${monthShare}%` }} aria-hidden="true" />}
                {bar === "month" && <span className="pace-dot" style={{ left: `${monthShare}%` }} aria-hidden="true" />}
              </motion.span>
              {bar === "money" && (
                <AnimatePresence>
                  {on && (
                    <motion.span
                      className="pace-today"
                      style={{ left: onTrack(monthShare), x: "-50%" }}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      aria-hidden="true"
                    >
                      {t("paceToday")}
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
              <AnimatePresence>
                {on && (
                  <motion.div
                    id={tipId}
                    role="tooltip"
                    className="pace-tip"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <span className="pace-tip-arrow" style={{ left: onTrack(Math.min(Math.max(share, 3), 97)) }} aria-hidden="true" />
                    {tips[bar].map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <p className="pace-note">
        {t("paceMark")} {t("paceHint")}
      </p>
    </motion.section>
  );
}
