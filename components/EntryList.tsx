"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import type { Entry } from "@/lib/finance";
import { euros, monthLabel } from "@/lib/format";
import CategoryBadge from "./CategoryBadge";
import { CATEGORY_NAME } from "./labels";
import { PlusIcon, TrashIcon } from "./icons";

// Value of `confirm` while the "delete all of this month" question is open; entry ids never take it.
const CLEAR = "__month__";

/** Entries of the selected month, income first, with an inline delete confirmation per entry and for the whole month. */
export default function EntryList({
  entries,
  month,
  readOnly,
  onAdd,
  onDelete,
  onStopFrom,
  clearable,
  onClear,
}: {
  entries: Entry[];
  month: string;
  readOnly: boolean;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onStopFrom: (id: string) => void;
  /** Entries written in this month that do not repeat; "delete all of this month" removes them. */
  clearable: number;
  onClear: () => void;
}) {
  const { t, lang } = useLang();
  const [confirm, setConfirm] = useState<string | null>(null);
  const sorted = [...entries].sort((a, b) => (a.kind === b.kind ? b.amount - a.amount : a.kind === "income" ? -1 : 1));

  return (
    <motion.section
      className="panel entries"
      aria-labelledby="entriesTitle"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 }}
    >
      <div className="panel-head">
        <h2 id="entriesTitle">{t("entriesTitle")}</h2>
        <button type="button" className="secondary small" onClick={onAdd}>
          <PlusIcon /> {t("add")}
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="empty">{t("entriesEmpty", monthLabel(month, lang))}</p>
      ) : (
        <ul id="entry-list" className="entry-list">
          <AnimatePresence initial={false}>
            {sorted.map((e) => {
              const name = e.note || t(CATEGORY_NAME[e.category]);
              return (
                <motion.li key={e.id} className={`entry-card${confirm === e.id ? " confirming" : ""}`} layout="position" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="entry">
                    <CategoryBadge category={e.category} size="sm" />
                    <div className="entry-main">
                      <b>{name}</b>
                      {(e.note || e.recurring) && (
                        <span>
                          {e.note && t(CATEGORY_NAME[e.category])}
                          {e.recurring && <span className="pill">{t(`every${e.every ?? 1}`)}</span>}
                        </span>
                      )}
                    </div>
                    <b className={`entry-amount${e.kind === "income" ? " in" : ""}`}>
                      {e.kind === "income" ? "+" : "−"}
                      {euros(e.amount, lang)}
                    </b>
                    {!readOnly && (
                      <button type="button" className="icon" aria-label={t("deleteEntry", name)} onClick={() => setConfirm(confirm === e.id ? null : e.id)}>
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {confirm === e.id && (
                      <motion.div
                        key="confirm"
                        className="confirm"
                        role="group"
                        aria-label={t("deleteConfirm")}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="confirm-inner">
                          <span>{e.recurring ? t("deleteRecurring") : t("deleteConfirm")}</span>
                          {e.recurring && (
                            <button type="button" className="secondary small" onClick={() => { setConfirm(null); onStopFrom(e.id); }}>
                              {t("deleteFromNow")}
                            </button>
                          )}
                          <button type="button" className="danger small" onClick={() => { setConfirm(null); onDelete(e.id); }}>
                            {e.recurring ? t("deleteAll") : t("deleteYes")}
                          </button>
                          <button type="button" className="link" onClick={() => setConfirm(null)}>
                            {t("cancel")}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {!readOnly && clearable > 1 && (
        <div className={`clear-month${confirm === CLEAR ? " confirming" : ""}`}>
          <button
            type="button"
            id="clear-month"
            className="link danger-link"
            aria-expanded={confirm === CLEAR}
            onClick={() => setConfirm(confirm === CLEAR ? null : CLEAR)}
          >
            <TrashIcon /> {t("clearMonth")}
          </button>
          <AnimatePresence initial={false}>
            {confirm === CLEAR && (
              <motion.div
                key="confirm"
                className="confirm"
                role="group"
                aria-label={t("clearMonth")}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="confirm-inner">
                  <span>
                    {t("clearMonthConfirm", clearable, monthLabel(month, lang))}
                    {entries.some((e) => e.recurring) && ` ${t("clearMonthKeeps")}`}
                  </span>
                  <button type="button" id="clear-month-yes" className="danger small" onClick={() => { setConfirm(null); onClear(); }}>
                    {t("clearMonthYes")}
                  </button>
                  <button type="button" className="link" onClick={() => setConfirm(null)}>
                    {t("cancel")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}
